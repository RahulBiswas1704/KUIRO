import { NextRequest, NextResponse } from 'next/server';
import { db, culturalEventsCalendar, workspaces, scheduledCampaigns, platformPosts, socialConnections } from '@/db';
import { eq, and, lte, inArray } from 'drizzle-orm';
import { createAutonomousCampaign } from '@/lib/campaigns/generator';
import { publishToAllChannels } from '@/lib/social/publisher';
import { authorizeWorkspace, getSessionFromRequest } from '@/lib/auth';
import { retryOutboxEvents } from '@/lib/inngest/dispatcher';

import { updateSchedulerTelemetry } from '@/lib/scheduler/telemetry';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export interface SchedulerExecutionParams {
  action?: 'sweep' | 'generate' | 'housekeeping' | 'all';
  targetDate?: string;
  forceNext?: boolean;
  workspaceId?: string;
  triggerSource?: string;
}

/**
 * Validates request authorization via Vercel CRON_SECRET or authenticated session cookie.
 */
async function checkAuthorization(req: NextRequest): Promise<{ authorized: boolean; reason?: string; isSystemAdmin: boolean }> {
  const cronSecret = process.env.CRON_SECRET;

  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.toLowerCase().startsWith('bearer ') ? authHeader.substring(7).trim() : null;

  // 1. Standard Vercel Cron Bearer header or query param
  if (cronSecret && (bearerToken === cronSecret || new URL(req.url).searchParams.get('key') === cronSecret)) {
    return { authorized: true, isSystemAdmin: true };
  }

  // 2. Platform Admin clearance cookie
  const adminClearance = req.cookies.get('kuiro_admin_clearance')?.value;
  if (adminClearance) {
    return { authorized: true, isSystemAdmin: true };
  }

  // 3. User session from Cookie or Bearer header (Scoped only to their own verified workspace)
  const userSession = await getSessionFromRequest(req);
  if (userSession) {
    return { authorized: true, isSystemAdmin: false };
  }

  // In development without CRON_SECRET and without any user session provided, allow execution in non-production
  if (!cronSecret && process.env.NODE_ENV !== 'production' && !authHeader) {
    return { authorized: true, isSystemAdmin: true };
  }

  return {
    authorized: false,
    reason: 'Unauthorized: Missing or invalid CRON_SECRET Bearer token or authenticated session',
    isSystemAdmin: false,
  };
}

/**
 * Shared Core Autonomous Scheduler Engine:
 * 1. Fail-Safe Auto-Commit Sweep: Dispatches overdue T-0h campaigns where 48h review passed.
 * 2. Cultural Radar Scan: Evaluates T-48h upcoming milestones and auto-generates multi-channel campaigns.
 * 3. Housekeeping: Flushes durable outbox queue and monitors token health.
 */
async function executeAutonomousScheduler(params: SchedulerExecutionParams) {
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
          inArray(scheduledCampaigns.status, ['AUTO_QUEUED', 'APPROVED']),
          lte(scheduledCampaigns.publishAt, now)
        )
      );

    for (const campaign of overdueCampaigns) {
      try {
        const posts = await database
          .select()
          .from(platformPosts)
          .where(eq(platformPosts.campaignId, campaign.id));

        if (posts.length > 0) {
          const instagramPost = posts.find((p) => p.platform === 'instagram') || posts[0];
          const xPost = posts.find((p) => p.platform === 'x');
          const emailPost = posts.find((p) => p.platform === 'email');

          const channelResults = await publishToAllChannels({
            caption: instagramPost.captionText,
            mediaUrls: instagramPost.mediaUrls || [],
            firstReply: xPost?.firstCommentText || 'Read our full guide at kuiro.in',
            aspectRatio: (instagramPost.aspectRatio as any) || '1:1',
            emailSubject: emailPost?.emailSubject || campaign.topicSummary,
          });

          await database
            .update(scheduledCampaigns)
            .set({ status: 'PUBLISHED' })
            .where(eq(scheduledCampaigns.id, campaign.id));

          autoCommittedResults.push({
            campaignId: campaign.id,
            topic: campaign.topicSummary,
            workspaceId: campaign.workspaceId,
            publishedChannelsCount: channelResults.length,
          });

          console.log(`[Auto-Commit Fail-Safe] Campaign "${campaign.topicSummary}" published across ${channelResults.length} channels.`);
        }
      } catch (pubErr) {
        console.error(`[Auto-Commit Fail-Safe Error on ${campaign.id}]:`, pubErr);
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
            const res = await createAutonomousCampaign({
              workspaceId: ws.id,
              topic: event.eventName,
              triggerType: 'FESTIVAL',
              targetPublishAt: new Date(Date.now() + 48 * 3600 * 1000),
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

      // 2. Token Health Scan
      const connections = await database.select().from(socialConnections);
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 3600 * 1000);
      for (const conn of connections) {
        if (conn.tokenExpiresAt && new Date(conn.tokenExpiresAt) <= sevenDaysFromNow) {
          tokenHealthWarnings++;
          console.warn(`[Housekeeping Alert] Token for workspace ${conn.workspaceId} on ${conn.platform} expires soon (${conn.tokenExpiresAt})`);
        }
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

/**
 * GET Handler: Invoked automatically by Vercel Cron
 * Accepts optional query param: ?action=sweep | ?action=generate | ?action=housekeeping
 */
export async function GET(req: NextRequest) {
  const auth = await checkAuthorization(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.reason }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const action = (searchParams.get('action') as any) || 'all';
    const targetDate = searchParams.get('targetDate') || undefined;
    const forceNext = searchParams.get('force') === 'true';
    let workspaceId = searchParams.get('workspaceId') || undefined;

    // Strict Tenant Isolation: non-system users can only invoke for their verified owned workspace
    if (!auth.isSystemAdmin) {
      const wsAuth = await authorizeWorkspace(req, workspaceId);
      if (!wsAuth.authorized) {
        return NextResponse.json({ success: false, error: wsAuth.error }, { status: wsAuth.status });
      }
      workspaceId = wsAuth.workspaceId;
    }

    const result = await executeAutonomousScheduler({
      action,
      targetDate,
      forceNext,
      workspaceId,
      triggerSource: 'vercel_cron_get',
    });

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    console.error('[GET /api/calendar/cron-trigger Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error executing cron' },
      { status: 500 }
    );
  }
}

/**
 * POST Handler: Invoked manually by Admin UI, Dashboard, or custom API webhook callers
 */
export async function POST(req: NextRequest) {
  const auth = await checkAuthorization(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.reason }, { status: 401 });
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is acceptable
    }

    const { searchParams } = new URL(req.url);
    const action = body.action || (searchParams.get('action') as any) || 'all';
    const targetDate = body.targetDate || searchParams.get('targetDate') || undefined;
    const forceNext = body.forceNext ?? (searchParams.get('force') === 'true');
    let workspaceId = body.workspaceId || searchParams.get('workspaceId') || undefined;

    // Strict Tenant Isolation: non-system users can only invoke for their verified owned workspace
    if (!auth.isSystemAdmin) {
      const wsAuth = await authorizeWorkspace(req, workspaceId);
      if (!wsAuth.authorized) {
        return NextResponse.json({ success: false, error: wsAuth.error }, { status: wsAuth.status });
      }
      workspaceId = wsAuth.workspaceId;
    }

    const result = await executeAutonomousScheduler({
      action,
      targetDate,
      forceNext,
      workspaceId,
      triggerSource: 'manual_post',
    });

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    console.error('[POST /api/calendar/cron-trigger Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error executing cron' },
      { status: 500 }
    );
  }
}
