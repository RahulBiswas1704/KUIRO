import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { authorizeChannelSubscription } from '@/lib/realtime/pubsub';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Realtime Channel Authorization Endpoint for WebSockets / Pusher / Ably
 * Route: POST /api/realtime/auth
 * 
 * Strict Multi-Tenant Enforcement:
 * - Server validates user session and workspace membership before granting subscription.
 * - Prevents client from subscribing to arbitrary tenant channels by tampering with channel names.
 */
export async function POST(req: NextRequest) {
  let channelName: string | undefined;
  let socketId: string | undefined;

  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      const body = await req.json();
      channelName = body.channel_name || body.channel;
      socketId = body.socket_id || body.socketId;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    try {
      const formData = await req.formData();
      channelName = formData.get('channel_name')?.toString() || formData.get('channel')?.toString();
      socketId = formData.get('socket_id')?.toString();
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }
  } else {
    // Fallback: check query params
    channelName = req.nextUrl.searchParams.get('channel_name') || req.nextUrl.searchParams.get('channel') || undefined;
    socketId = req.nextUrl.searchParams.get('socket_id') || undefined;
  }

  if (!channelName) {
    return NextResponse.json(
      { error: 'Missing required channel parameter (channel_name or channel)' },
      { status: 400 }
    );
  }

  // Authorize channel subscription against authenticated user session
  const auth = await authorizeChannelSubscription(req, channelName);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || 'Access Denied to requested real-time channel' },
      { status: auth.status || 403 }
    );
  }

  const pusherKey = process.env.PUSHER_KEY;
  const pusherSecret = process.env.PUSHER_SECRET;

  // If Pusher credentials are configured and socketId is provided, generate cryptographic Pusher signature
  if (pusherKey && pusherSecret && socketId) {
    const stringToSign = `${socketId}:${channelName}`;
    const signature = crypto.createHmac('sha256', pusherSecret).update(stringToSign).digest('hex');

    return NextResponse.json({
      auth: `${pusherKey}:${signature}`,
      channel: channelName,
      workspaceId: auth.workspaceId,
      status: 'authorized',
    });
  }

  // Generic / SSE / Custom WebSocket authorization response
  return NextResponse.json({
    authorized: true,
    channel: channelName,
    workspaceId: auth.workspaceId,
    timestamp: new Date().toISOString(),
  });
}
