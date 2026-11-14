import { EventEmitter } from 'events';

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
 * Broadcast an event to all connected SSE clients
 */
export function publishInboxEvent(event: Omit<InboxStreamEvent, 'id' | 'timestamp'>): InboxStreamEvent {
  const fullEvent: InboxStreamEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  try {
    emitter.emit('inbox_stream_event', fullEvent);
  } catch (err) {
    console.warn('[Inbox EventHub Publish Error]:', err);
  }

  return fullEvent;
}

/**
 * Subscribe a client SSE stream to inbox events
 */
export function subscribeToInboxEvents(
  listener: (event: InboxStreamEvent) => void,
  filterWorkspaceId?: string
): () => void {
  const handler = (evt: InboxStreamEvent) => {
    // If workspace filtering is applied, only dispatch matching events (or global events without workspaceId)
    if (!filterWorkspaceId || !evt.workspaceId || evt.workspaceId === filterWorkspaceId) {
      listener(evt);
    }
  };

  emitter.on('inbox_stream_event', handler);

  return () => {
    emitter.off('inbox_stream_event', handler);
  };
}
