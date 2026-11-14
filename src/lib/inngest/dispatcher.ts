import { inngest } from './client';
import { db, scheduledCampaigns } from '@/db';
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

// Resilient in-memory durable outbox store with auto-pruning
const durableOutboxStore = new Map<string, OutboxRecord>();

let totalDispatchedCount = 0;
let totalFallbackCount = 0;
let lastDispatchTimestamp: string | null = null;
let lastErrorDetails: string | null = null;

/**
 * Resilient Inngest Event Dispatcher
 * Dispatches events to Inngest Cloud with timeout and exponential backoff.
 * If Inngest Cloud is unreachable, network-partitioned, or missing credentials:
 * 1. Enqueues the event into the Durable Outbox.
 * 2. Directly executes mission-critical state updates (e.g. campaign auto-queue or admin actions)
 *    so founder workflows are never blocked by external service outages.
 */
export async function safeDispatchInngest(
  event: DurableEvent
): Promise<{ success: boolean; eventId: string; mode: 'inngest_cloud' | 'durable_outbox_fallback'; error?: string }> {
  const eventKey = process.env.INNGEST_EVENT_KEY;
  const isCloudConfigured = eventKey && !eventKey.includes('local_kuiro') && !eventKey.includes('YourInngestKey');

  // Try Inngest Cloud first
  try {
    const sendPromise = inngest.send(event);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Inngest Cloud dispatch timed out after 3500ms')), 3500)
    );

    const result: any = await Promise.race([sendPromise, timeoutPromise]);
    const eventId = result?.ids?.[0] || `ing_${Date.now()}`;

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

    console.warn(`[Inngest Dispatcher Cloud Warning]: ${errorMsg}. Activating Durable Outbox Fallback.`);

    // Enqueue into Durable Outbox
    const fallbackId = `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const outboxRecord: OutboxRecord = {
      id: fallbackId,
      name: event.name,
      data: event.data,
      status: 'PENDING',
      attempts: 1,
      createdAt: new Date().toISOString(),
      lastAttemptAt: new Date().toISOString(),
      error: errorMsg,
    };

    durableOutboxStore.set(fallbackId, outboxRecord);

    // Prune outbox if over 200 items
    if (durableOutboxStore.size > 200) {
      const oldest = durableOutboxStore.keys().next().value;
      if (oldest) durableOutboxStore.delete(oldest);
    }

    // Direct autonomous fallback execution for mission-critical events
    await executeAutonomousFallback(event);

    return {
      success: true,
      eventId: fallbackId,
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
