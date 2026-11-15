import { NextRequest } from 'next/server';
import { subscribeToInboxEvents, InboxStreamEvent } from '@/lib/inbox/eventHub';
import { authorizeWorkspace } from '@/lib/auth';
import { buildWorkspaceInboxChannel } from '@/lib/realtime/pubsub';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Realtime Server-Sent Events (SSE) Stream for Unified Omni-Channel Inbox
 * Route: GET /api/inbox/stream?workspaceId={workspaceId}
 * 
 * Multi-Instance & Serverless Safe:
 * - Subscriptions are authorized strictly against authenticated session & workspace.
 * - Backed by shared distributed pub/sub to guarantee cross-instance message delivery.
 */
export async function GET(req: NextRequest) {
  const workspaceIdParam = req.nextUrl.searchParams.get('workspaceId');
  const auth = await authorizeWorkspace(req, workspaceIdParam);

  if (!auth.authorized) {
    return new Response(JSON.stringify({ error: auth.error || 'Unauthorized' }), {
      status: auth.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const targetWorkspaceId = auth.workspaceId!;
  const authorizedChannel = buildWorkspaceInboxChannel(targetWorkspaceId);
  const encoder = new TextEncoder();

  let unsubscribe: (() => void) | null = null;
  let heartbeatInterval: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial Handshake Event
      const initialPayload = JSON.stringify({
        status: 'connected',
        channel: authorizedChannel,
        workspaceId: targetWorkspaceId,
        connectedAt: new Date().toISOString(),
        clientIp: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });
      controller.enqueue(encoder.encode(`event: connected\ndata: ${initialPayload}\n\n`));

      // 2. Subscribe to EventHub (backed by shared distributed pub/sub)
      unsubscribe = subscribeToInboxEvents((event: InboxStreamEvent) => {
        try {
          const sseChunk = `id: ${event.id}\nevent: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
          controller.enqueue(encoder.encode(sseChunk));
        } catch (err) {
          console.warn('[SSE Stream Enqueue Error]:', err);
        }
      }, targetWorkspaceId);

      // 3. Heartbeat / Keep-Alive Ping every 15s to prevent proxy & edge timeouts
      heartbeatInterval = setInterval(() => {
        try {
          const ping = JSON.stringify({ time: new Date().toISOString() });
          controller.enqueue(encoder.encode(`event: heartbeat\ndata: ${ping}\n\n`));
        } catch {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
        }
      }, 15000);
      heartbeatInterval.unref?.();
    },
    cancel() {
      if (unsubscribe) unsubscribe();
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    },
  });

  // Handle client abort / disconnect cleanly
  req.signal.addEventListener('abort', () => {
    if (unsubscribe) unsubscribe();
    if (heartbeatInterval) clearInterval(heartbeatInterval);
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
