import { db, culturalEventsCalendar, workspaces, scheduledCampaigns, platformPosts, socialConnections } from '@/db';
import { eq, and, lte, inArray } from 'drizzle-orm';
import { createAutonomousCampaign } from '@/lib/campaigns/generator';
import { publishToAllChannels } from '@/lib/social/publisher';
import { retryOutboxEvents } from '@/lib/inngest/dispatcher';
import { updateSchedulerTelemetry } from '@/lib/scheduler/telemetry';
import { refreshExpiringTokens } from '@/lib/social/tokenRefresh';
import {
  acquirePublishLock,
  releasePublishLock,
  verifyPublishReadiness,
  calculateTargetPublishTime,
} from '@/lib/campaigns/stateMachine';

export interface SchedulerExecutionParams {
  action?: 'sweep' | 'generate' | 'housekeeping' | 'all';
  targetDate?: string;
  forceNext?: boolean;
  workspaceId?: string;
  triggerSource?: string;
}

export interface SchedulerExecutionResult {
  success: boolean;
  source: string;
  triggerSource: string;
  actionExecuted: string;
  timestamp: string;
  durationMs: number;
  scanDate?: string;
  workspacesEvaluated: number;
  eventsMatched: Array<{
    id: string;
    eventName: string;
    eventDate: string;
    regions: string[];
  }>;
  campaignsCreated: Array<{
    campaignId: string;
    workspaceId: string;
    workspaceName: string;
    eventName: string;
    eventDate: string;
    status: 'CREATED' | 'ALREADY_EXISTS';
    postsCount?: number;
  }>;
  autoCommitted: Array<{
    campaignId: string;
    topic: string;
    workspaceId: string;
    publishedChannelsCount: number;
  }>;
  housekeeping: {
    outbox: { attempted: number; succeeded: number; remaining: number };
    tokenHealthWarnings: number;
  };
  message: string;
}

/**
 * Shared Core Autonomous Scheduler Engine:
 * 1. Fail-Safe Auto-Commit Sweep: Dispatches overdue T-0h campaigns where 48h review passed.
 * 2. Cultural Radar Scan: Evaluates T-48h upcoming milestones and auto-generates multi-channel campaigns.
 * 3. Housekeeping: Flushes durable outbox queue and monitors token health.
 */
export async function executeAutonomousScheduler(
  params: SchedulerExecutionParams = {}
): Promise<SchedulerExecutionResult> {
  const startTime = Date.now();
  const database = db;
  const action = params.action || 'all';

  if (!database) {
    throw new Error('Neon PostgreSQL database is not connected');
  }

  const autoCommittedResults: Array<{
    campaignId: string;
    topic: string;
    workspaceId: string;
    publishedChannelsCount: number;
  }> = [];

  const createdCampaigns: Array<{
    campaignId: string;
    workspaceId: string;
    workspaceName: string;
    eventName: string;
    eventDate: string;
    status: 'CREATED' | 'ALREADY_EXISTS';
    postsCount?: number;
  }> = [];

  let outboxRetryResult = { attempted: 0, succeeded: 0, remaining: 0 };
  let tokenHealthWarnings = 0;

  // =========================================================================
  // STEP 1: FAIL-SAFE AUTO-COMMIT PUBLISHING SWEEP (T-0h Overdue Campaigns)
  // Runs if action is 'sweep' or 'all'
  // =========================================================================
  if (action === 'sweep' || action === 'all') {
    const now = new Date();
    const overdueCampaigns = await database
      .select()
      .from(scheduledCampaigns)
      .where(
        and(
          inArray(scheduledCampaigns.status, ['AUTO_QUEUED', 'REVIEW_PENDING', 'APPROVED', 'READY_TO_PUBLISH']),
          lte(scheduledCampaigns.publishAt, now)
        )
      );

    // If tenant workspace scoped, filter to that workspace
    const targetOverdue = params.workspaceId
      ? overdueCampaigns.filter((c) => c.workspaceId === params.workspaceId)
      : overdueCampaigns;

    for (const campaign of targetOverdue) {
      try {
        // Pre-Flight Check: Verify workspace has active channels
        const readiness = await verifyPublishReadiness(campaign.id, campaign.workspaceId);
        if (!readiness.ready) {
          console.warn(`[Auto-Commit Pre-Flight Blocked on ${campaign.id}]: ${readiness.reason}`);
          await releasePublishLock({
            campaignId: campaign.id,
            finalStatus: 'FAILED',
            failureReason: readiness.reason,
            metadata: { preflight: readiness },
          });
          continue;
        }

        // Distributed In-Flight Lock: Ensure single worker execution
        const lock = await acquirePublishLock({
          campaignId: campaign.id,
          lockOwnerId: `cron-sweep-${Date.now()}`,
        });

        if (!lock.acquired) {
          console.log(`[Auto-Commit Fail-Safe] Lock skipped on ${campaign.id}: ${lock.reason}`);
          continue;
        }

        const posts = await database
          .select()
          .from(platformPosts)
          .where(eq(platformPosts.campaignId, campaign.id));

        if (posts.length > 0) {
          const instagramPost = posts.find((p) => p.platform === 'instagram') || posts[0];
          const xPost = posts.find((p) => p.platform === 'x');
          const emailPost = posts.find((p) => p.platform === 'email');

          const channelResults = await publishToAllChannels(
            {
              caption: instagramPost.captionText,
              mediaUrls: instagramPost.mediaUrls || [],
              firstReply: xPost?.firstCommentText || 'Read our full guide at kuiro.in',
              aspectRatio: (instagramPost.aspectRatio as any) || '1:1',
              emailSubject: emailPost?.emailSubject || campaign.topicSummary,
            },
            { workspaceId: campaign.workspaceId }
          );

          // Synchronize returned platform post IDs to platformPosts table
          for (const res of channelResults) {
            if (res.platformPostId) {
              const matchedPost = posts.find((p) => p.platform === res.platform);
              if (matchedPost) {
                await database
                  .update(platformPosts)
                  .set({ platformPostId: res.platformPostId })
                  .where(eq(platformPosts.id, matchedPost.id));
              }
            }
          }

          await releasePublishLock({
            campaignId: campaign.id,
            finalStatus: 'PUBLISHED',
            metadata: { channelResults },
          });

          autoCommittedResults.push({
            campaignId: campaign.id,
            topic: campaign.topicSummary,
            workspaceId: campaign.workspaceId,
            publishedChannelsCount: channelResults.length,
          });

          console.log(`[Auto-Commit Fail-Safe] Campaign "${campaign.topicSummary}" published across ${channelResults.length} channels.`);
        } else {
          await releasePublishLock({
            campaignId: campaign.id,
            finalStatus: 'FAILED',
            failureReason: 'NO_PLATFORM_POSTS_FOUND',
          });
        }
      } catch (pubErr: any) {
        console.error(`[Auto-Commit Fail-Safe Error on ${campaign.id}]:`, pubErr);
        await releasePublishLock({
          campaignId: campaign.id,
          finalStatus: 'FAILED',
          failureReason: pubErr.message || 'Auto-commit sweep publication failed',
        });
      }
    }
  }

  // =========================================================================
  // STEP 2: CULTURAL RADAR SCAN (T-48h Campaigns Generation)
  // Runs if action is 'generate' or 'all'
  // =========================================================================
  let targetDateStr = params.targetDate;
  if (!targetDateStr) {
    const target = new Date();
    target.setDate(target.getDate() + 2); // Exactly 48 Hours Ahead
    targetDateStr = target.toISOString().split('T')[0];
  }

  let matchingEvents: any[] = [];
  let activeWorkspaces: any[] = [];

  if (action === 'generate' || action === 'all') {
    matchingEvents = await database
      .select()
      .from(culturalEventsCalendar)
      .where(eq(culturalEventsCalendar.eventDate, targetDateStr));

    // If 0 events match exact date, retrieve next earliest upcoming event
    if (matchingEvents.length === 0) {
      const allEvents = await database.select().from(culturalEventsCalendar);
      const today = new Date().toISOString().split('T')[0];
      const upcoming = allEvents
        .filter((e) => e.eventDate >= today)
        .sort((a, b) => a.eventDate.localeCompare(b.eventDate));

      if (upcoming.length > 0) {
        matchingEvents = [upcoming[0]];
      }
    }

    // Query active workspaces (or specific workspace if provided)
    activeWorkspaces = await database.select().from(workspaces);
    if (params.workspaceId) {
      activeWorkspaces = activeWorkspaces.filter((w) => w.id === params.workspaceId);
    }

    for (const ws of activeWorkspaces) {
      for (const event of matchingEvents) {
        // Check if campaign already exists for this event & workspace
        const existing = await database
          .select()
          .from(scheduledCampaigns)
          .where(
            and(
              eq(scheduledCampaigns.workspaceId, ws.id),
              eq(scheduledCampaigns.topicSummary, event.eventName)
            )
          );

        if (existing.length === 0) {
          try {
            const targetPublishAt = calculateTargetPublishTime({
              timezone: ws.timezone || 'Asia/Kolkata',
              publishHourOfDay: ws.publishHourOfDay ?? 10,
              reviewWindowHours: ws.reviewWindowHours ?? 48,
            });

            const res = await createAutonomousCampaign({
              workspaceId: ws.id,
              topic: event.eventName,
              triggerType: 'FESTIVAL',
              targetPublishAt,
            });

            createdCampaigns.push({
              campaignId: res.campaign.id,
              workspaceId: ws.id,
              workspaceName: ws.name,
              eventName: event.eventName,
              eventDate: event.eventDate,
              status: 'CREATED',
              postsCount: res.posts.length,
            });
          } catch (genErr) {
            console.error(`[Autonomous Campaign Generator Error for ${ws.name}]:`, genErr);
          }
        } else {
          createdCampaigns.push({
            campaignId: existing[0].id,
            workspaceId: ws.id,
            workspaceName: ws.name,
            eventName: event.eventName,
            eventDate: event.eventDate,
            status: 'ALREADY_EXISTS',
          });
        }
      }
    }
  }

  // =========================================================================
  // STEP 3: HOUSEKEEPING & OUTBOX RETRY
  // Runs if action is 'housekeeping' or 'all'
  // =========================================================================
  if (action === 'housekeeping' || action === 'all') {
    try {
      // 1. Retry queued Inngest Outbox events
      outboxRetryResult = await retryOutboxEvents();

      // 2. Token Health Scan & Automated Proactive Refresh
      const refreshSummary = await refreshExpiringTokens({ thresholdDays: 7 });
      tokenHealthWarnings = refreshSummary.failed;
      if (refreshSummary.refreshed > 0) {
        console.log(`[Token Vault Housekeeping] Proactively refreshed ${refreshSummary.refreshed} social tokens.`);
      }
    } catch (housekeepingErr) {
      console.warn('[Housekeeping Non-Fatal Error]:', housekeepingErr);
    }
  }

  const durationMs = Date.now() - startTime;

  // Update telemetry
  updateSchedulerTelemetry({
    lastRunAt: new Date().toISOString(),
    lastAction: action,
    lastDurationMs: durationMs,
    overdueAutoCommitted: autoCommittedResults.length,
    campaignsGenerated: createdCampaigns.filter((c) => c.status === 'CREATED').length,
    outboxRetried: outboxRetryResult.succeeded,
    tokenHealthWarnings,
  });

  return {
    success: true,
    source: 'neon_postgres',
    triggerSource: params.triggerSource || 'cron',
    actionExecuted: action,
    timestamp: new Date().toISOString(),
    durationMs,
    scanDate: targetDateStr,
    workspacesEvaluated: activeWorkspaces.length,
    eventsMatched: matchingEvents.map((e) => ({
      id: e.id,
      eventName: e.eventName,
      eventDate: e.eventDate,
      regions: e.regions,
    })),
    campaignsCreated: createdCampaigns,
    autoCommitted: autoCommittedResults,
    housekeeping: {
      outbox: outboxRetryResult,
      tokenHealthWarnings,
    },
    message: `Autonomous scheduler (${action}) completed in ${durationMs}ms. ${autoCommittedResults.length} overdue campaigns auto-committed. ${createdCampaigns.filter((c) => c.status === 'CREATED').length} campaigns generated.`,
  };
}
