import { NextRequest, NextResponse } from 'next/server';
import { db, socialConnections, workspaces } from '@/db';
import { eq, and } from 'drizzle-orm';
import {
  verifyMetaWebhookChallenge,
  verifyMetaSignature,
} from '@/lib/whatsapp/webhookSecurity';
import { ingestInboundMessage } from '@/lib/inbox/dispatchService';

/**
 * Meta Instagram Messaging Webhook Handler
 * 
 * GET: Webhook verification challenge (hub.mode, hub.verify_token, hub.challenge)
 * POST: Inbound customer direct messages (DMs) from Instagram
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verification = verifyMetaWebhookChallenge(mode, token, challenge);
  if (!verification.valid) {
    return new NextResponse(verification.error || 'Verification failed', {
      status: verification.status,
    });
  }

  return new NextResponse(verification.challenge, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature-256');

    // 1. Cryptographic HMAC-SHA256 signature verification
    const sigCheck = verifyMetaSignature(rawBody, signature);
    if (!sigCheck.valid) {
      console.warn('[Instagram Webhook Rejected] Invalid signature:', sigCheck.error);
      return NextResponse.json({ error: sigCheck.error || 'Invalid signature' }, { status: sigCheck.status });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.object !== 'instagram' && payload.object !== 'page') {
      return NextResponse.json({ status: 'IGNORED_OBJECT_TYPE' }, { status: 200 });
    }

    // 2. Iterate through entries and messaging events
    const entries = payload.entry || [];
    for (const entry of entries) {
      const recipientAccountId = entry.id; // Instagram Business Account ID or Page ID
      const messagingEvents = entry.messaging || [];

      for (const event of messagingEvents) {
        // Skip echo events (outbound messages sent by the page/agent itself)
        if (event.message?.is_echo) {
          continue;
        }

        const senderId = event.sender?.id;
        const message = event.message;

        if (!senderId || !message) {
          continue;
        }

        const providerMessageId = message.mid || `ig_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const messageText = message.text || (message.attachments ? '[Media Attachment]' : 'Direct Message');
        const messageType = message.attachments?.[0]?.type || 'text';

        // 3. Resolve destination workspace
        let targetWorkspaceId: string | null = null;
        if (recipientAccountId) {
          const [conn] = await db
            .select()
            .from(socialConnections)
            .where(
              and(
                eq(socialConnections.platform, 'instagram'),
                eq(socialConnections.platformAccountId, recipientAccountId),
                eq(socialConnections.status, 'CONNECTED')
              )
            )
            .limit(1);

          if (conn) {
            targetWorkspaceId = conn.workspaceId;
          }
        }

        // Fallback to first available workspace if test/demo payload
        if (!targetWorkspaceId) {
          const [ws] = await db.select().from(workspaces).limit(1);
          if (ws) {
            targetWorkspaceId = ws.id;
          }
        }

        if (!targetWorkspaceId) {
          console.warn('[Instagram Webhook] No target workspace found for entry ID:', recipientAccountId);
          continue;
        }

        // 4. Ingest inbound message via dispatchService (deduplication + attribution + window + SSE)
        await ingestInboundMessage({
          workspaceId: targetWorkspaceId,
          channel: 'instagram',
          customerHandle: `@ig_${senderId}`,
          customerName: `Instagram User (${senderId.slice(-4)})`,
          content: messageText,
          providerMessageId,
          messageType,
          metadata: {
            senderId,
            recipientAccountId,
            rawMid: message.mid,
            timestamp: event.timestamp,
          },
        });
      }
    }

    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (error: any) {
    console.error('[Instagram Webhook Handler Error]:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
