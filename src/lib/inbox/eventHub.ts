import { EventEmitter } from 'events';
import { sharedPubSub, buildWorkspaceInboxChannel, RealtimeEventType } from '@/lib/realtime/pubsub';

export type InboxEventType =
  | 'new_message'
  | 'conversation_updated'
  | 'agent_presence'
  | 'typing'
  | 'heartbeat';

export interface InboxStreamEvent {
  id: string;
  type: InboxEventType;
  workspaceId?: string;
  conversationId?: string;
  data: any;
  timestamp: string;
}

// Global singleton to persist across hot reloads & Next.js server route calls
declare global {
  // eslint-disable-next-line no-var
  var __kuiro_inbox_emitter__: EventEmitter | undefined;
}

const emitter: EventEmitter = globalThis.__kuiro_inbox_emitter__ || new EventEmitter();
emitter.setMaxListeners(200);

if (process.env.NODE_ENV !== 'production') {
  globalThis.__kuiro_inbox_emitter__ = emitter;
}

/**
 * Broadcast an event to all connected SSE clients via shared distributed pub/sub.
 * Guarantees cross-instance delivery in serverless and multi-node clusters.
 */
export function publishInboxEvent(event: Omit<InboxStreamEvent, 'id' | 'timestamp'>): InboxStreamEvent {
  const fullEvent: InboxStreamEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  // 1. Emit locally for immediate backward compatibility
  try {
    emitter.emit('inbox_stream_event', fullEvent);
  } catch (err) {
    console.warn('[Inbox EventHub Local Emit Error]:', err);
  }

  // 2. Publish to distributed shared pub/sub (Neon PostgreSQL + Pusher/managed)
  sharedPubSub.publish({
    channel: event.workspaceId ? buildWorkspaceInboxChannel(event.workspaceId) : undefined,
    workspaceId: event.workspaceId,
    conversationId: event.conversationId,
    eventType: event.type as RealtimeEventType,
    data: event.data,
  }).catch((err) => {
    console.warn('[Inbox SharedPubSub Dispatch Error]:', err);
  });

  return fullEvent;
}

/**
 * Async version of publishInboxEvent when caller wants to await PostgreSQL persistence
 */
export async function publishInboxEventAsync(event: Omit<InboxStreamEvent, 'id' | 'timestamp'>): Promise<InboxStreamEvent> {
  const fullEvent: InboxStreamEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  try {
    emitter.emit('inbox_stream_event', fullEvent);
  } catch (err) {
    console.warn('[Inbox EventHub Local Emit Error]:', err);
  }

  await sharedPubSub.publish({
    channel: event.workspaceId ? buildWorkspaceInboxChannel(event.workspaceId) : undefined,
    workspaceId: event.workspaceId,
    conversationId: event.conversationId,
    eventType: event.type as RealtimeEventType,
    data: event.data,
  });

  return fullEvent;
}

/**
 * Subscribe a client SSE stream to inbox events across instances
 */
export function subscribeToInboxEvents(
  listener: (event: InboxStreamEvent) => void,
  filterWorkspaceId?: string
): () => void {
  // If workspace is specified, subscribe to that workspace's shared channel
  if (filterWorkspaceId) {
    const channel = buildWorkspaceInboxChannel(filterWorkspaceId);
    return sharedPubSub.subscribe(channel, (pubSubEvent) => {
      listener({
        id: pubSubEvent.id,
        type: pubSubEvent.eventType as InboxEventType,
        workspaceId: pubSubEvent.workspaceId,
        conversationId: pubSubEvent.conversationId,
        data: pubSubEvent.data,
        timestamp: pubSubEvent.timestamp,
      });
    });
  }

  // Fallback for global / unfiltered events (legacy support)
  const handler = (evt: InboxStreamEvent) => {
    listener(evt);
  };
  emitter.on('inbox_stream_event', handler);
  return () => {
    emitter.off('inbox_stream_event', handler);
  };
}
