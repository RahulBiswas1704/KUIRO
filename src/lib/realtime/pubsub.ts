import { EventEmitter } from 'events';
import crypto from 'crypto';
import { db, realtimePubSubEvents } from '@/db';
import { eq, and, gt } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { authorizeWorkspace } from '@/lib/auth';

/**
 * ============================================================================
 * KUIRO DISTRIBUTED SHARED REAL-TIME PUB/SUB ENGINE
 * ============================================================================
 * 
 * Solves the multi-instance / serverless partitioning problem:
 * - Instance A receives a webhook/event and persists to PostgreSQL.
 * - Instance B serves the client's SSE / WebSocket stream.
 * - Shared pub/sub guarantees Instance B receives notifications and pushes
 *   them to the client's browser without requiring a page refresh.
 * 
 * Security:
 * - Channel subscriptions are strictly authorized on the server.
 * - Clients cannot listen to another tenant's channel.
 * - PostgreSQL is the permanent source of truth; pub/sub events are notifications.
 */

export type RealtimeEventType =
  | 'new_message'
  | 'conversation_updated'
  | 'agent_presence'
  | 'typing'
  | 'heartbeat'
  | 'system_notification';

export interface PubSubNotification {
  id: string;
  channel: string;
  workspaceId?: string;
  conversationId?: string;
  eventType: RealtimeEventType;
  data: any;
  timestamp: string;
  originInstanceId: string;
}

export interface PublishOptions {
  channel?: string;
  workspaceId?: string;
  conversationId?: string;
  eventType: RealtimeEventType;
  data: any;
}

// Global in-memory EventEmitter for instant same-instance delivery
declare global {
  // eslint-disable-next-line no-var
  var __kuiro_shared_pubsub_emitter__: EventEmitter | undefined;
}

const defaultEmitter: EventEmitter = globalThis.__kuiro_shared_pubsub_emitter__ || new EventEmitter();
defaultEmitter.setMaxListeners(500);

if (process.env.NODE_ENV !== 'production') {
  globalThis.__kuiro_shared_pubsub_emitter__ = defaultEmitter;
}

/**
 * Builds the canonical tenant-isolated inbox channel name
 */
export function buildWorkspaceInboxChannel(workspaceId: string): string {
  return `workspace:${workspaceId}:inbox`;
}

/**
 * Authorizes a client's request to subscribe to a workspace channel.
 * Fails closed if the client does not have verified membership in the workspace.
 */
export async function authorizeChannelSubscription(
  req: NextRequest,
  channel: string
): Promise<{ authorized: boolean; workspaceId?: string; error?: string; status?: number }> {
  // Extract workspace ID from channel name (e.g. "workspace:{workspaceId}:inbox" or "private-workspace-{workspaceId}")
  let workspaceId: string | undefined;

  const colonMatch = channel.match(/^workspace:([0-9a-fA-F-]+):/);
  const dashMatch = channel.match(/^private-workspace-([0-9a-fA-F-]+)/);

  if (colonMatch) {
    workspaceId = colonMatch[1];
  } else if (dashMatch) {
    workspaceId = dashMatch[1];
  }

  if (!workspaceId) {
    return {
      authorized: false,
      error: 'Invalid channel format. Channel must be scoped to a valid workspace.',
      status: 400,
    };
  }

  // Server-side verification: verifies session cookie and workspace membership
  const auth = await authorizeWorkspace(req, workspaceId);
  if (!auth.authorized) {
    return {
      authorized: false,
      error: auth.error || 'Access Denied: You do not have permission to subscribe to this workspace channel.',
      status: auth.status || 403,
    };
  }

  return {
    authorized: true,
    workspaceId: auth.workspaceId,
  };
}

/**
 * ============================================================================
 * SHARED PUBSUB ENGINE CLASS
 * ============================================================================
 */
export class SharedPubSubManager {
  readonly instanceId: string;
  private localEmitter: EventEmitter;
  private recentEventIds: Set<string>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options?: { instanceId?: string; emitter?: EventEmitter }) {
    this.instanceId = options?.instanceId || `inst_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    this.localEmitter = options?.emitter || (options?.instanceId ? new EventEmitter() : defaultEmitter);
    this.localEmitter.setMaxListeners(500);
    this.recentEventIds = new Set<string>();

    // Keep set bounded to prevent memory growth
    this.cleanupInterval = setInterval(() => {
      if (this.recentEventIds.size > 2000) {
        this.recentEventIds.clear();
      }
    }, 60 * 1000);
    this.cleanupInterval.unref?.();
  }

  /**
   * Publishes an event to the shared real-time pub/sub bus.
   * 1. Broadcasts locally to immediate connected streams on the current instance.
   * 2. Persists notification record to Neon PostgreSQL `realtime_pubsub_events`
   *    so other independent serverless instances receive it.
   * 3. Broadcasts via Pusher HTTP API if Pusher environment variables are set.
   */
  async publish(options: PublishOptions): Promise<PubSubNotification> {
    const channel = options.channel || (options.workspaceId ? buildWorkspaceInboxChannel(options.workspaceId) : 'global:system');
    const notification: PubSubNotification = {
      id: `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      channel,
      workspaceId: options.workspaceId,
      conversationId: options.conversationId,
      eventType: options.eventType,
      data: options.data,
      timestamp: new Date().toISOString(),
      originInstanceId: this.instanceId,
    };

    // Track event to avoid double-processing if read back by local poller
    this.recentEventIds.add(notification.id);

    // 1. Emit locally on current instance
    try {
      this.localEmitter.emit(channel, notification);
      this.localEmitter.emit('all_channels', notification);
    } catch (err) {
      console.warn('[SharedPubSub Local Emit Warning]:', err);
    }

    // 2. Persist to Neon PostgreSQL shared pub/sub table
    if (db) {
      try {
        await db.insert(realtimePubSubEvents).values({
          channel,
          workspaceId: options.workspaceId || null,
          eventType: options.eventType,
          payload: {
            ...notification,
            originInstanceId: this.instanceId,
          },
        });
      } catch (dbErr) {
        console.warn('[SharedPubSub DB Persistence Warning]:', dbErr);
      }
    }

    // 3. Optional Pusher / Ably managed broadcaster if configured
    await this.dispatchToManagedProvider(channel, notification);

    return notification;
  }

  /**
   * Subscribes a stream or listener to a channel across all application instances.
   * - Listens to local in-memory emitter for instant same-instance events.
   * - Polls Neon PostgreSQL `realtime_pubsub_events` for cross-instance events.
   * - Automatically deduplicates events.
   */
  subscribe(
    channel: string,
    listener: (event: PubSubNotification) => void,
    options?: { pollIntervalMs?: number }
  ): () => void {
    const pollIntervalMs = options?.pollIntervalMs || 500;
    let isActive = true;
    // Initialize lastPolledAt with a 15-second buffer to handle cloud database clock skew
    let lastPolledAt = new Date(Date.now() - 15000);

    // 1. Local listener
    const localHandler = (event: PubSubNotification) => {
      if (!isActive) return;
      this.recentEventIds.add(event.id);
      listener(event);
    };

    this.localEmitter.on(channel, localHandler);

    // 2. Cross-instance database subscriber loop
    let timer: NodeJS.Timeout | null = null;

    const pollCrossInstanceEvents = async () => {
      if (!isActive || !db) return;
      try {
        const records = await db
          .select()
          .from(realtimePubSubEvents)
          .where(
            and(
              eq(realtimePubSubEvents.channel, channel),
              gt(realtimePubSubEvents.createdAt, lastPolledAt)
            )
          )
          .orderBy(realtimePubSubEvents.createdAt);

        if (records.length > 0) {
          // Advance lastPolledAt using PostgreSQL's server timestamps to stay immune to client clock skew
          let maxCreatedAt = lastPolledAt;
          for (const row of records) {
            if (row.createdAt > maxCreatedAt) {
              maxCreatedAt = row.createdAt;
            }
            const payload = row.payload as PubSubNotification;
            if (payload && payload.id) {
              // Deduplicate: skip if this instance already emitted or processed this event
              if (!this.recentEventIds.has(payload.id)) {
                this.recentEventIds.add(payload.id);
                if (isActive) {
                  listener(payload);
                }
              }
            }
          }
          lastPolledAt = maxCreatedAt;
        }
      } catch (err) {
        console.warn('[SharedPubSub Poller Error]:', err);
      } finally {
        if (isActive) {
          timer = setTimeout(pollCrossInstanceEvents, pollIntervalMs);
        }
      }
    };

    // Start cross-instance poller immediately
    timer = setTimeout(pollCrossInstanceEvents, 10);

    // Return cleanup function
    return () => {
      isActive = false;
      this.localEmitter.off(channel, localHandler);
      if (timer) clearTimeout(timer);
    };
  }

  /**
   * Optional managed provider dispatcher (Pusher HTTP API)
   */
  private async dispatchToManagedProvider(channel: string, notification: PubSubNotification): Promise<void> {
    const appId = process.env.PUSHER_APP_ID;
    const key = process.env.PUSHER_KEY;
    const secret = process.env.PUSHER_SECRET;
    const cluster = process.env.PUSHER_CLUSTER || 'ap2';

    if (!appId || !key || !secret) return;

    try {
      const body = JSON.stringify({
        name: notification.eventType,
        channel,
        data: JSON.stringify(notification.data),
      });

      const md5Body = crypto.createHash('md5').update(body).digest('hex');
      const timestamp = Math.floor(Date.now() / 1000);
      const authVersion = '1.0';

      const path = `/apps/${appId}/events`;
      const query = `auth_key=${key}&auth_timestamp=${timestamp}&auth_version=${authVersion}&body_md5=${md5Body}`;
      const signString = `POST\n${path}\n${query}`;
      const authSignature = crypto.createHmac('sha256', secret).update(signString).digest('hex');

      const url = `https://api-${cluster}.pusher.com${path}?${query}&auth_signature=${authSignature}`;

      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    } catch (pusherErr) {
      console.warn('[Pusher Managed PubSub Dispatch Warning]:', pusherErr);
    }
  }

  /**
   * Test / simulation helper to create isolated instances with separate memory
   */
  createInstance(simulatedInstanceId: string): SharedPubSubManager {
    return new SharedPubSubManager({ instanceId: simulatedInstanceId });
  }
}

export const sharedPubSub = new SharedPubSubManager();
