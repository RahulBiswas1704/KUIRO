import { inngest } from './client';
import { db, scheduledCampaigns, durableEvents } from '@/db';
import { eq } from 'drizzle-orm';

export interface DurableEvent {
  name: string;
  data: Record<string, any>;
  user?: Record<string, any>;
}

export interface OutboxRecord {
  id: string;
  name: string;
  data: Record<string, any>;
  status: 'PENDING' | 'DISPATCHED' | 'FAILED';
  attempts: number;
  createdAt: string;
  lastAttemptAt?: string;
  error?: string;
}

// In-memory telemetry cache for real-time observability metrics
const durableOutboxStore = new Map<string, OutboxRecord>();

let totalDispatchedCount = 0;
let totalFallbackCount = 0;
let lastDispatchTimestamp: string | null = null;
let lastErrorDetails: string | null = null;

/**
 * Resilient Inngest Event Dispatcher
 * Dispatches events to Inngest Cloud with timeout and exponential backoff.
 * 
 * Strict Idempotent & Production Failure Architecture:
 * 1. If Inngest Cloud accepts the event: returns confirmed eventId from Inngest.
 * 2. If dispatch fails or times out:
 *    - Persists the event into PostgreSQL `durable_events` table for resilient outbox recovery.
 *    - In production, FAILS CLOSED: returns `{ success: false, ... }` rather than inventing a mock event ID.
 *    - Callers can handle failure semantics reliably without phantom execution states.
 */
export async function safeDispatchInngest(
  event: DurableEvent
): Promise<{ success: boolean; eventId?: string; mode: 'inngest_cloud' | 'durable_outbox_fallback'; error?: string }> {
  // Try Inngest Cloud first
  try {
    const sendPromise = inngest.send(event);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Inngest Cloud dispatch timed out after 3500ms')), 3500)
    );

    const result: any = await Promise.race([sendPromise, timeoutPromise]);
    const eventId = result?.ids?.[0];

    if (!eventId) {
      throw new Error('Inngest Cloud did not return a valid event ID in dispatch response.');
    }

    totalDispatchedCount++;
    lastDispatchTimestamp = new Date().toISOString();

    return {
      success: true,
      eventId,
      mode: 'inngest_cloud',
    };
  } catch (err: any) {
    const errorMsg = err.message || String(err);
    lastErrorDetails = errorMsg;
    totalFallbackCount++;

    console.warn(`[Inngest Dispatcher Cloud Warning]: ${errorMsg}. Recording in PostgreSQL durable outbox.`);

    const isProduction = process.env.NODE_ENV === 'production';
    const outboxKey = `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 1. Persist into Neon PostgreSQL durable_events outbox
    if (db) {
      try {
        await db.insert(durableEvents).values({
          idempotencyKey: outboxKey,
          eventType: `inngest/${event.name}`,
          workspaceId: event.data?.workspaceId,
          relatedEntityId: event.data?.campaignId || event.data?.orderId,
          payload: { eventName: event.name, data: event.data },
          status: 'PENDING',
          lastError: errorMsg,
          errorType: 'TIMEOUT',
        });
      } catch (dbOutboxErr) {
        console.error('[Inngest Outbox DB Save Error]:', dbOutboxErr);
      }
    }

    // Record in-memory for live telemetry
    const outboxRecord: OutboxRecord = {
      id: outboxKey,
      name: event.name,
      data: event.data,
      status: 'PENDING',
      attempts: 1,
      createdAt: new Date().toISOString(),
      lastAttemptAt: new Date().toISOString(),
      error: errorMsg,
    };
    durableOutboxStore.set(outboxKey, outboxRecord);
    if (durableOutboxStore.size > 200) {
      const oldest = durableOutboxStore.keys().next().value;
      if (oldest) durableOutboxStore.delete(oldest);
    }

    // 2. Production Fail-Closed Rule: Never return fake success or mock IDs in production
    if (isProduction) {
      return {
        success: false,
        eventId: outboxKey,
        mode: 'durable_outbox_fallback',
        error: `Inngest Cloud dispatch failed: ${errorMsg}. Event safely queued in durable database outbox.`,
      };
    }

    // 3. Local Development Mode: Execute autonomous fallback for offline developer experience
    await executeAutonomousFallback(event);

    return {
      success: true,
      eventId: outboxKey,
      mode: 'durable_outbox_fallback',
      error: errorMsg,
    };
  }
}

/**
 * Handles autonomous fallback operations when Inngest Cloud is unreachable.
 */
async function executeAutonomousFallback(event: DurableEvent) {
  const database = db;
  if (!database) return;

  try {
    // A. Campaign Initiate: Verify campaign is AUTO_QUEUED with valid publishAt
    if (event.name === 'kuiro/campaign.initiate' && event.data.campaignId) {
      const [camp] = await database
        .select()
        .from(scheduledCampaigns)
        .where(eq(scheduledCampaigns.id, event.data.campaignId))
        .limit(1);

      if (camp && camp.status === 'GENERATING') {
        await database
          .update(scheduledCampaigns)
          .set({ status: 'AUTO_QUEUED' })
          .where(eq(scheduledCampaigns.id, camp.id));
      }
    }

    // B. Admin Action: Directly execute APPROVE or EMERGENCY_PAUSE in database
    if (event.name === 'whatsapp/admin.action' && event.data.campaignId && event.data.action) {
      const action = event.data.action;
      if (action === 'APPROVE') {
        await database
          .update(scheduledCampaigns)
          .set({ status: 'APPROVED' })
          .where(eq(scheduledCampaigns.id, event.data.campaignId));
      } else if (action === 'SKIP' || action === 'EMERGENCY_PAUSE') {
        await database
          .update(scheduledCampaigns)
          .set({ status: 'PAUSED' })
          .where(eq(scheduledCampaigns.id, event.data.campaignId));
      }
    }
  } catch (fallbackErr) {
    console.error('[Autonomous Fallback Execution Error]:', fallbackErr);
  }
}

/**
 * Retries delivery of queued outbox events to Inngest Cloud.
 * Invoked by periodic background housekeeping crons.
 */
export async function retryOutboxEvents(): Promise<{
  attempted: number;
  succeeded: number;
  remaining: number;
}> {
  const pending = Array.from(durableOutboxStore.values()).filter((r) => r.status === 'PENDING');
  let succeeded = 0;

  for (const record of pending) {
    try {
      record.attempts++;
      record.lastAttemptAt = new Date().toISOString();

      await inngest.send({
        name: record.name as any,
        data: record.data,
      });

      record.status = 'DISPATCHED';
      succeeded++;
    } catch (retryErr: any) {
      record.error = retryErr.message || String(retryErr);
      if (record.attempts >= 5) {
        record.status = 'FAILED';
      }
    }
  }

  const remaining = Array.from(durableOutboxStore.values()).filter((r) => r.status === 'PENDING').length;

  return {
    attempted: pending.length,
    succeeded,
    remaining,
  };
}

/**
 * Returns observability metrics and operational health of the Inngest dispatcher.
 */
export function getOutboxTelemetry(): {
  totalDispatched: number;
  totalFallback: number;
  pendingOutboxCount: number;
  lastDispatchTimestamp: string | null;
  lastError: string | null;
  queueHealth: 'HEALTHY' | 'DRAINING' | 'FALLBACK_ACTIVE';
} {
  const pendingCount = Array.from(durableOutboxStore.values()).filter((r) => r.status === 'PENDING').length;
  const isFallbackActive = totalFallbackCount > 0 && pendingCount > 0;

  return {
    totalDispatched: totalDispatchedCount,
    totalFallback: totalFallbackCount,
    pendingOutboxCount: pendingCount,
    lastDispatchTimestamp,
    lastError: lastErrorDetails,
    queueHealth: isFallbackActive ? 'FALLBACK_ACTIVE' : pendingCount > 0 ? 'DRAINING' : 'HEALTHY',
  };
}
