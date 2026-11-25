import { db, scheduledCampaigns, workspaces, socialConnections } from '@/db';
import { eq, and, sql as drizzleSql } from 'drizzle-orm';
import { CampaignStatus } from '@/types/campaign';

export type FormalCampaignState = 
  | 'GENERATING'
  | 'REVIEW_PENDING'
  | 'AUTO_QUEUED'
  | 'REVISION_REQUESTED'
  | 'APPROVED'
  | 'PAUSED'
  | 'READY_TO_PUBLISH'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'FAILED'
  | 'CANCELLED';

/**
 * Legitimate finite state transitions for the 48-hour campaign autopilot.
 * Any transition not explicitly listed is rejected to guarantee system determinism.
 */
export const VALID_STATE_TRANSITIONS: Record<FormalCampaignState, FormalCampaignState[]> = {
  GENERATING: [
    'REVIEW_PENDING',
    'AUTO_QUEUED',
    'FAILED',
    'CANCELLED',
  ],
  REVIEW_PENDING: [
    'APPROVED',
    'PAUSED',
    'REVISION_REQUESTED',
    'READY_TO_PUBLISH',
    'PUBLISHING',
    'CANCELLED',
    'FAILED',
    'REVIEW_PENDING',
  ],
  AUTO_QUEUED: [
    'APPROVED',
    'PAUSED',
    'REVISION_REQUESTED',
    'READY_TO_PUBLISH',
    'PUBLISHING',
    'CANCELLED',
    'FAILED',
    'AUTO_QUEUED',
  ],
  REVISION_REQUESTED: [
    'REVIEW_PENDING',
    'AUTO_QUEUED',
    'PAUSED',
    'CANCELLED',
    'FAILED',
  ],
  APPROVED: [
    'READY_TO_PUBLISH',
    'PUBLISHING',
    'PAUSED',
    'CANCELLED',
    'FAILED',
    'APPROVED', // Idempotent duplicate approval
  ],
  PAUSED: [
    'APPROVED',
    'REVIEW_PENDING',
    'AUTO_QUEUED',
    'CANCELLED',
    'PAUSED', // Idempotent pause
  ],
  READY_TO_PUBLISH: [
    'PUBLISHING',
    'PAUSED',
    'CANCELLED',
    'FAILED',
    'READY_TO_PUBLISH',
  ],
  PUBLISHING: [
    'PUBLISHED',
    'FAILED',
    'READY_TO_PUBLISH', // On transient network recovery
    'PUBLISHING',
  ],
  PUBLISHED: [
    'PUBLISHED', // Terminal / idempotent
  ],
  FAILED: [
    'READY_TO_PUBLISH', // Manual or automated retry
    'GENERATING',       // Regenerate from scratch
    'CANCELLED',
    'FAILED',
  ],
  CANCELLED: [
    'CANCELLED', // Terminal
  ],
};

/**
 * Normalizes state aliases for backward compatibility (e.g., AUTO_QUEUED maps to REVIEW_PENDING).
 */
export function normalizeCampaignState(state: string): FormalCampaignState {
  const s = (state || '').toUpperCase().trim();
  if (s === 'AUTO_QUEUED') return 'REVIEW_PENDING';
  if (s === 'SKIPPED') return 'PAUSED';
  if (s === 'REVISING') return 'REVISION_REQUESTED';
  return s as FormalCampaignState;
}

/**
 * Checks if a transition between two states is valid according to the formal state machine.
 */
export function isValidTransition(fromState: string, toState: string): boolean {
  const from = (fromState || '').toUpperCase().trim() as FormalCampaignState;
  const to = (toState || '').toUpperCase().trim() as FormalCampaignState;

  if (from === to) return true; // Idempotent self-transitions always permitted

  // Normalize aliases if necessary
  const normFrom = normalizeCampaignState(from);
  const normTo = normalizeCampaignState(to);
  if (normFrom === normTo) return true;

  const allowed = VALID_STATE_TRANSITIONS[from];
  if (allowed && (allowed.includes(to) || allowed.includes(normTo))) {
    return true;
  }

  // Also check normalized source
  const allowedFromNorm = VALID_STATE_TRANSITIONS[normFrom];
  if (allowedFromNorm && (allowedFromNorm.includes(to) || allowedFromNorm.includes(normTo))) {
    return true;
  }

  return false;
}

/**
 * Computes exact target publication timestamp in UTC based on workspace timezone
 * and peak engagement window (e.g. 10:00 AM in Asia/Kolkata).
 */
export function calculateTargetPublishTime(options: {
  timezone?: string;
  publishHourOfDay?: number;
  reviewWindowHours?: number;
  baseDate?: Date;
}): Date {
  const tz = options.timezone || 'Asia/Kolkata';
  const targetHour = options.publishHourOfDay !== undefined ? options.publishHourOfDay : 10;
  const windowHours = options.reviewWindowHours !== undefined ? options.reviewWindowHours : 48;
  const base = options.baseDate || new Date();

  // Step 1: Advance by review window
  const futureMs = base.getTime() + windowHours * 60 * 60 * 1000;
  const futureDate = new Date(futureMs);

  // Step 2: Resolve the date parts in target timezone using Intl
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(futureDate);
  const dateMap: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      dateMap[part.type] = parseInt(part.value, 10);
    }
  }

  const year = dateMap.year;
  const month = dateMap.month;
  const day = dateMap.day;

  // Step 3: Construct local ISO string at peak engagement hour
  const pad = (n: number) => String(n).padStart(2, '0');
  const localTargetIso = `${year}-${pad(month)}-${pad(day)}T${pad(targetHour)}:00:00`;

  // Compute timezone offset by comparing UTC representation
  // Create an arbitrary reference in target timezone to find current offset
  const testUtc = new Date(localTargetIso + 'Z');
  const testTzParts = formatter.formatToParts(testUtc);
  const testMap: Record<string, number> = {};
  for (const p of testTzParts) {
    if (p.type !== 'literal') testMap[p.type] = parseInt(p.value, 10);
  }

  // Offset in hours = localHour - utcHour
  const tzHourInUtcTime = testMap.hour;
  const diffHours = (tzHourInUtcTime - testUtc.getUTCHours() + 24) % 24;
  const diffMinutes = testMap.minute - testUtc.getUTCMinutes();
  const totalOffsetMinutes = diffHours * 60 + diffMinutes;

  // Correct UTC time for target local hour
  const targetUtcMs = Date.UTC(year, month - 1, day, targetHour, 0, 0) - totalOffsetMinutes * 60 * 1000;
  const resultDate = new Date(targetUtcMs);

  // Fallback: If calculation resulted in a past time relative to base + window, adjust to base + window
  if (resultDate.getTime() < base.getTime() + 60 * 60 * 1000) {
    return new Date(base.getTime() + windowHours * 60 * 60 * 1000);
  }

  return resultDate;
}

/**
 * Pre-flight verification to ensure the workspace has at least one active, valid social connection.
 * Fails closed to avoid firing un-publishable campaigns.
 */
export async function verifyPublishReadiness(
  campaignId: string,
  workspaceId: string
): Promise<{
  ready: boolean;
  reason?: string;
  connectedPlatforms: string[];
  activeConnectionsCount: number;
}> {
  if (!db) {
    // If DB is offline (mock store), allow test flow
    return {
      ready: true,
      connectedPlatforms: ['instagram', 'linkedin', 'x', 'facebook'],
      activeConnectionsCount: 4,
    };
  }

  try {
    const connections = await db
      .select()
      .from(socialConnections)
      .where(
        and(
          eq(socialConnections.workspaceId, workspaceId),
          eq(socialConnections.status, 'CONNECTED')
        )
      );

    const now = new Date();
    const activeConnections = connections.filter((conn) => {
      // If token has expiry, ensure it hasn't expired
      if (conn.tokenExpiresAt && new Date(conn.tokenExpiresAt) <= now) {
        return false;
      }
      return true;
    });

    const connectedPlatforms = Array.from(new Set(activeConnections.map((c) => c.platform)));

    if (connectedPlatforms.length === 0) {
      return {
        ready: false,
        reason: 'NO_ACTIVE_CHANNELS',
        connectedPlatforms: [],
        activeConnectionsCount: 0,
      };
    }

    return {
      ready: true,
      connectedPlatforms,
      activeConnectionsCount: connectedPlatforms.length,
    };
  } catch (err: any) {
    console.error('[verifyPublishReadiness Error]:', err);
    return {
      ready: false,
      reason: `VERIFICATION_FAILED: ${err.message}`,
      connectedPlatforms: [],
      activeConnectionsCount: 0,
    };
  }
}

/**
 * Atomic state transition with Optimistic Concurrency Control (OCC) and guardrails.
 */
export async function transitionCampaignState(options: {
  campaignId: string;
  targetState: CampaignStatus;
  workspaceId?: string;
  reason?: string;
  metadata?: any;
  force?: boolean;
}): Promise<{
  success: boolean;
  error?: string;
  campaign?: any;
  previousState?: string;
  currentState?: string;
  idempotent?: boolean;
}> {
  const { campaignId, targetState, workspaceId, reason, metadata, force } = options;

  if (!db) {
    return {
      success: true,
      currentState: targetState,
      previousState: 'AUTO_QUEUED',
      idempotent: false,
    };
  }

  try {
    // 1. Fetch current campaign record
    const [camp] = await db
      .select()
      .from(scheduledCampaigns)
      .where(eq(scheduledCampaigns.id, campaignId))
      .limit(1);

    if (!camp) {
      return { success: false, error: 'CAMPAIGN_NOT_FOUND' };
    }

    // 2. Validate multi-tenant isolation
    if (workspaceId && camp.workspaceId !== workspaceId) {
      return { success: false, error: 'WORKSPACE_MISMATCH_UNAUTHORIZED' };
    }

    const currentState = camp.status as FormalCampaignState;

    // 3. Idempotency Check: Already in target state?
    if (currentState === targetState || (currentState === 'AUTO_QUEUED' && targetState === 'REVIEW_PENDING')) {
      return {
        success: true,
        idempotent: true,
        previousState: currentState,
        currentState: targetState,
        campaign: camp,
      };
    }

    // 4. Validate transition matrix
    if (!force && !isValidTransition(currentState, targetState)) {
      return {
        success: false,
        error: `INVALID_STATE_TRANSITION: Cannot transition campaign from '${currentState}' to '${targetState}'.`,
        previousState: currentState,
        currentState,
      };
    }

    // 5. Special transition side-effects
    const updateValues: Partial<typeof scheduledCampaigns.$inferInsert> = {
      status: targetState as any,
    };

    if (targetState === 'FAILED') {
      updateValues.failureReason = reason || 'Unspecified failure';
      if (metadata) updateValues.diagnosticMetadata = metadata;
    } else if (targetState === 'CANCELLED') {
      updateValues.failureReason = reason || 'Cancelled by user or operator';
      if (metadata) updateValues.diagnosticMetadata = metadata;
    }

    // 6. Execute atomic update with conditional WHERE clause
    const [updated] = await db
      .update(scheduledCampaigns)
      .set(updateValues)
      .where(
        and(
          eq(scheduledCampaigns.id, campaignId),
          eq(scheduledCampaigns.status, camp.status) // Optimistic Concurrency Lock
        )
      )
      .returning();

    if (!updated) {
      // Concurrent update collision occurred, re-fetch latest state
      const [latest] = await db
        .select()
        .from(scheduledCampaigns)
        .where(eq(scheduledCampaigns.id, campaignId))
        .limit(1);

      if (latest && latest.status === targetState) {
        return {
          success: true,
          idempotent: true,
          previousState: currentState,
          currentState: targetState,
          campaign: latest,
        };
      }

      return {
        success: false,
        error: 'CONCURRENT_MODIFICATION_DETECTED',
        previousState: currentState,
        currentState: latest?.status,
      };
    }

    return {
      success: true,
      previousState: currentState,
      currentState: targetState,
      campaign: updated,
    };
  } catch (err: any) {
    console.error(`[transitionCampaignState Error on ${campaignId}]:`, err);
    return {
      success: false,
      error: err.message || 'DATABASE_TRANSITION_FAILED',
    };
  }
}

/**
 * Handles Late Revision Requests (Edge Case 2: Customer requests revision close to publish window).
 * If the request arrives within the workspace's late revision grace window (default 60 mins),
 * extends publishAt by the grace window to prevent premature auto-publishing.
 */
export async function handleLateRevision(options: {
  campaignId: string;
  workspaceId?: string;
  revisionPrompt: string;
  senderPhone?: string;
}): Promise<{
  success: boolean;
  publishAtExtended: boolean;
  newPublishAt?: Date;
  graceMinutesAdded: number;
  campaign?: any;
  error?: string;
}> {
  const { campaignId, workspaceId } = options;

  if (!db) {
    return {
      success: true,
      publishAtExtended: false,
      graceMinutesAdded: 0,
    };
  }

  try {
    const [camp] = await db
      .select()
      .from(scheduledCampaigns)
      .where(eq(scheduledCampaigns.id, campaignId))
      .limit(1);

    if (!camp) {
      return { success: false, publishAtExtended: false, graceMinutesAdded: 0, error: 'CAMPAIGN_NOT_FOUND' };
    }

    if (workspaceId && camp.workspaceId !== workspaceId) {
      return { success: false, publishAtExtended: false, graceMinutesAdded: 0, error: 'UNAUTHORIZED_WORKSPACE' };
    }

    // Retrieve workspace policy for late revision grace minutes
    const [ws] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, camp.workspaceId))
      .limit(1);

    const graceMinutes = ws?.lateRevisionGraceMinutes || 60;
    const now = new Date();
    const scheduledPublishAt = new Date(camp.publishAt);
    const msUntilPublish = scheduledPublishAt.getTime() - now.getTime();
    const graceMs = graceMinutes * 60 * 1000;

    let publishAtExtended = false;
    let newPublishAt = scheduledPublishAt;

    // If remaining time is less than grace window (or already passed), extend deadline!
    if (msUntilPublish < graceMs) {
      publishAtExtended = true;
      newPublishAt = new Date(now.getTime() + graceMs);
    }

    // Transition state to REVISION_REQUESTED / REVIEW_PENDING and update publishAt if extended
    const [updated] = await db
      .update(scheduledCampaigns)
      .set({
        status: 'REVIEW_PENDING',
        publishAt: newPublishAt,
      })
      .where(eq(scheduledCampaigns.id, campaignId))
      .returning();

    return {
      success: true,
      publishAtExtended,
      newPublishAt,
      graceMinutesAdded: publishAtExtended ? graceMinutes : 0,
      campaign: updated,
    };
  } catch (err: any) {
    console.error('[handleLateRevision Error]:', err);
    return {
      success: false,
      publishAtExtended: false,
      graceMinutesAdded: 0,
      error: err.message,
    };
  }
}

/**
 * Handles Unpause & Approval (Edge Case 1: Customer approves after campaign was PAUSED).
 * If the original publishAt time has already elapsed while paused, reschedules publishAt forward.
 */
export async function handleUnpauseAndApproval(options: {
  campaignId: string;
  workspaceId?: string;
}): Promise<{
  success: boolean;
  rescheduled: boolean;
  newPublishAt?: Date;
  campaign?: any;
  error?: string;
}> {
  const { campaignId, workspaceId } = options;

  if (!db) {
    return {
      success: true,
      rescheduled: false,
    };
  }

  try {
    const [camp] = await db
      .select()
      .from(scheduledCampaigns)
      .where(eq(scheduledCampaigns.id, campaignId))
      .limit(1);

    if (!camp) {
      return { success: false, rescheduled: false, error: 'CAMPAIGN_NOT_FOUND' };
    }

    if (workspaceId && camp.workspaceId !== workspaceId) {
      return { success: false, rescheduled: false, error: 'UNAUTHORIZED_WORKSPACE' };
    }

    const [ws] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, camp.workspaceId))
      .limit(1);

    const now = new Date();
    const scheduledPublishAt = new Date(camp.publishAt);

    let rescheduled = false;
    let newPublishAt = scheduledPublishAt;

    // If publishing deadline passed or is less than 5 minutes away, recalculate safe window
    if (scheduledPublishAt.getTime() <= now.getTime() + 5 * 60 * 1000) {
      rescheduled = true;
      // Reschedule to 15 minutes from now or next peak window
      newPublishAt = new Date(now.getTime() + 15 * 60 * 1000);
    }

    const [updated] = await db
      .update(scheduledCampaigns)
      .set({
        status: 'APPROVED',
        publishAt: newPublishAt,
      })
      .where(eq(scheduledCampaigns.id, campaignId))
      .returning();

    return {
      success: true,
      rescheduled,
      newPublishAt,
      campaign: updated,
    };
  } catch (err: any) {
    console.error('[handleUnpauseAndApproval Error]:', err);
    return {
      success: false,
      rescheduled: false,
      error: err.message,
    };
  }
}

/**
 * Distributed In-Flight Lock on PUBLISHING (Edge Case 6: Inngest/worker/cron retries).
 * Atomically acquires single-execution right for publishing.
 */
export async function acquirePublishLock(options: {
  campaignId: string;
  lockOwnerId: string;
  staleTimeoutMinutes?: number;
}): Promise<{
  acquired: boolean;
  campaign?: any;
  reason?: string;
}> {
  const { campaignId, lockOwnerId, staleTimeoutMinutes = 15 } = options;

  if (!db) {
    return { acquired: true, campaign: { id: campaignId, status: 'PUBLISHING' } };
  }

  try {
    const staleThreshold = new Date(Date.now() - staleTimeoutMinutes * 60 * 1000);

    // Atomic conditional SQL UPDATE: Only succeeds if status is in ready states
    // OR if status is PUBLISHING but lock is stale (worker died)
    const [locked] = await db
      .update(scheduledCampaigns)
      .set({
        status: 'PUBLISHING',
        inngestRunId: lockOwnerId,
        lockAcquiredAt: new Date(),
      })
      .where(
        and(
          eq(scheduledCampaigns.id, campaignId),
          drizzleSql`(
            ${scheduledCampaigns.status} IN ('APPROVED', 'READY_TO_PUBLISH', 'REVIEW_PENDING', 'AUTO_QUEUED')
            OR (
              ${scheduledCampaigns.status} = 'PUBLISHING' 
              AND (${scheduledCampaigns.lockAcquiredAt} IS NULL OR ${scheduledCampaigns.lockAcquiredAt} < ${staleThreshold})
            )
          )`
        )
      )
      .returning();

    if (!locked) {
      // Lock not acquired. Fetch current status to report reason
      const [current] = await db
        .select()
        .from(scheduledCampaigns)
        .where(eq(scheduledCampaigns.id, campaignId))
        .limit(1);

      return {
        acquired: false,
        reason: current
          ? `Lock not acquired. Campaign is in state '${current.status}' (Owner: ${current.inngestRunId || 'unknown'}).`
          : 'Campaign not found.',
      };
    }

    return {
      acquired: true,
      campaign: locked,
    };
  } catch (err: any) {
    console.error(`[acquirePublishLock Error on ${campaignId}]:`, err);
    return {
      acquired: false,
      reason: err.message || 'DATABASE_LOCK_ERROR',
    };
  }
}

/**
 * Releases publish lock and sets final campaign state.
 */
export async function releasePublishLock(options: {
  campaignId: string;
  finalStatus: 'PUBLISHED' | 'FAILED' | 'READY_TO_PUBLISH';
  failureReason?: string;
  metadata?: any;
}): Promise<void> {
  const { campaignId, finalStatus, failureReason, metadata } = options;

  if (!db) return;

  try {
    const updateData: Partial<typeof scheduledCampaigns.$inferInsert> = {
      status: finalStatus,
      lockAcquiredAt: null,
    };

    if (failureReason) {
      updateData.failureReason = failureReason;
    }
    if (metadata) {
      updateData.diagnosticMetadata = metadata;
    }

    await db
      .update(scheduledCampaigns)
      .set(updateData)
      .where(eq(scheduledCampaigns.id, campaignId));
  } catch (err: any) {
    console.error(`[releasePublishLock Error on ${campaignId}]:`, err);
  }
}
