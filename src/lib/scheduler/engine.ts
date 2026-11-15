import { db, culturalEventsCalendar, workspaces, scheduledCampaigns, platformPosts, socialConnections } from '@/db';
import { eq, and, lte, inArray } from 'drizzle-orm';
import { createAutonomousCampaign } from '@/lib/campaigns/generator';
import { publishToAllChannels } from '@/lib/social/publisher';
import { retryOutboxEvents } from '@/lib/inngest/dispatcher';
import { updateSchedulerTelemetry } from '@/lib/scheduler/telemetry';
import { refreshExpiringTokens } from '@/lib/social/tokenRefresh';
import { executeWithIdempotency } from '@/lib/events/idempotency';
import {
  acquirePublishLock,
  releasePublishLock,
  verifyPublishReadiness,
  calculateTargetPublishTime,
} from '@/lib/campaigns/stateMachine';

/**
 * ============================================================================
 * KUIRO AUTHORITATIVE SCHEDULER INVENTORY & DEDUPLICATION LEDGER
 * ============================================================================
 * 
 * Strict Single Ownership Architecture:
 * Every periodic or scheduled task in KUIRO has exactly ONE authoritative owner.
 * Schedulers never duplicate the same logical business task.
 */
export interface SchedulerTaskDefinition {
  task: string;
  owner: 'Inngest' | 'Vercel Cron';
  schedule: string;
  description: string;
  functionId?: string;
  endpoint?: string;
  idempotencyScope: string;
}

export const SCHEDULER_INVENTORY: readonly SchedulerTaskDefinition[] = [
  {
    task: 'Cultural calendar scan',
    owner: 'Inngest',
    schedule: '0 4 * * * (Daily 09:30 AM IST)',
    description: 'Evaluates upcoming T-48h cultural events across active workspaces and enqueues campaigns',
    functionId: 'kuiro-cultural-radar-daily-cron',
    idempotencyScope: 'cron_cultural_{workspaceId}_{eventDate}_{eventName}',
  },
  {
    task: 'Campaign generation',
    owner: 'Inngest',
    schedule: 'Event-triggered (kuiro/campaign.initiate)',
    description: 'Synthesizes multi-channel copy, AI Critic evaluation, 48h review window, and publishing',
    functionId: 'kuiro-48h-autopilot-workflow',
    idempotencyScope: 'campaign_publish_{campaignId}_{platform}_{versionHash}',
  },
  {
    task: 'Token refresh',
    owner: 'Inngest',
    schedule: '0 2 * * * (Daily 07:30 AM IST)',
    description: 'Proactively checks and refreshes social tokens expiring in <= 7 days in encrypted vault',
    functionId: 'kuiro-token-refresh-daily-cron',
    idempotencyScope: 'cron_token_refresh_{dateString}',
  },
  {
    task: 'Subscription renewal checks',
    owner: 'Inngest',
    schedule: '0 3 * * * (Daily 08:30 AM IST)',
    description: 'Audits subscription periods and transitions overdue accounts',
    functionId: 'kuiro-subscription-renewal-daily-cron',
    idempotencyScope: 'cron_sub_renewal_{subscriptionId}_{dateString}',
  },
  {
    task: 'Cleanup and retention',
    owner: 'Inngest',
    schedule: '0 1 * * 0 (Weekly Sunday 06:30 AM IST)',
    description: 'Purges expired sessions, reaps stale publish locks, and archives logs',
    functionId: 'kuiro-cleanup-retention-cron',
    idempotencyScope: 'cron_cleanup_retention_{weekString}',
  },
  {
    task: 'Fail-Safe Health Pulse & Lock Reaper',
    owner: 'Vercel Cron',
    schedule: '0 0 * * * (Daily 05:30 AM IST)',
    description: 'Lightweight fail-safe reaper: checks for overdue uncommitted campaigns and reports health',
    endpoint: '/api/calendar/cron-trigger?action=pulse',
    idempotencyScope: 'cron_sweep_{campaignId}',
  },
] as const;

export interface SchedulerExecutionParams {
  action?: 'pulse' | 'sweep' | 'generate' | 'housekeeping' | 'all';
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
  schedulerInventory: readonly SchedulerTaskDefinition[];
  message: string;
}

/**
 * Shared Core Autonomous Scheduler Engine:
 * 1. Fail-Safe Auto-Commit Sweep: Dispatches overdue T-0h campaigns where 48h review passed.
 * 2. Cultural Radar Scan: Evaluates T-48h upcoming milestones (Owned by Inngest; tenant-scoped when manual).
 * 3. Housekeeping: Flushes durable outbox queue and monitors token health.
 */
export async function executeAutonomousScheduler(
  params: SchedulerExecutionParams = {}
): Promise<SchedulerExecutionResult> {
  const startTime = Date.now();
  const database = db;
  // Default action is 'pulse' (lightweight fail-safe sweep) rather than duplicate campaign generation
  const action = params.action || 'pulse';

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
  // Runs if action is 'pulse', 'sweep', or 'all'
  // =========================================================================
  if (action === 'pulse' || action === 'sweep' || action === 'all') {
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
  // STEP 2: CULTURAL RADAR SCAN (Campaign Generation)
  // Authoritative Owner: Inngest (kuiro-cultural-radar-daily-cron)
  //
  // Deduplication Guard:
  // - Global generation is skipped if triggered via Vercel Cron pulse/sweep.
  // - Only runs when action === 'generate' or when explicit workspaceId is passed (e.g. tenant radar scan).
  // - Strictly protected by unique constraints and distributed idempotency.
  // =========================================================================
  let targetDateStr = params.targetDate;
  if (!targetDateStr) {
    const target = new Date();
    target.setDate(target.getDate() + 2); // Exactly 48 Hours Ahead
    targetDateStr = target.toISOString().split('T')[0];
  }

  let matchingEvents: any[] = [];
  let activeWorkspaces: any[] = [];

  const shouldRunGeneration = action === 'generate' || (action === 'all' && (params.workspaceId || params.forceNext));

  if (shouldRunGeneration) {
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
        const eventSlug = event.eventName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const idempotencyKey = `cron_cultural_${ws.id}_${targetDateStr}_${eventSlug}`;

        try {
          const exec = await executeWithIdempotency(
            {
              idempotencyKey,
              eventType: 'cron.cultural_campaign_generate',
              workspaceId: ws.id,
              relatedEntityId: event.id || eventSlug,
            },
            async () => {
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

              if (existing.length > 0) {
                return {
                  campaignId: existing[0].id,
                  workspaceId: ws.id,
                  workspaceName: ws.name,
                  eventName: event.eventName,
                  eventDate: event.eventDate,
                  status: 'ALREADY_EXISTS' as const,
                };
              }

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

              return {
                campaignId: res.campaign.id,
                workspaceId: ws.id,
                workspaceName: ws.name,
                eventName: event.eventName,
                eventDate: event.eventDate,
                status: 'CREATED' as const,
                postsCount: res.posts.length,
              };
            }
          );

          if (exec.result) {
            const item = exec.idempotent
              ? { ...exec.result, status: 'ALREADY_EXISTS' as const }
              : exec.result;
            createdCampaigns.push(item as any);
          }
        } catch (genErr) {
          console.error(`[Autonomous Campaign Generator Error for ${ws.name}]:`, genErr);
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

      // 2. Token Health Scan & Automated Proactive Refresh (if triggered directly)
      const refreshSummary = await refreshExpiringTokens({ thresholdDays: 7 });
      tokenHealthWarnings = refreshSummary.failed;
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
    schedulerInventory: SCHEDULER_INVENTORY,
    message: `Autonomous scheduler (${action}) completed in ${durationMs}ms. ${autoCommittedResults.length} overdue campaigns auto-committed. ${createdCampaigns.filter((c) => c.status === 'CREATED').length} campaigns generated.`,
  };
}
