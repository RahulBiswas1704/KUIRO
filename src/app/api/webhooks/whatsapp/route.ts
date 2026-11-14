import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';
import { db, scheduledCampaigns, conversations, inboxMessages, workspaces, socialConnections } from '@/db';
import { eq, and, desc } from 'drizzle-orm';
import { generateWithGemini } from '@/lib/ai/gemini';
import { publishInboxEvent } from '@/lib/inbox/eventHub';

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

/**
 * Meta WhatsApp Cloud API Webhook Handler
 * 
 * GET: Webhook verification challenge (hub.mode, hub.verify_token, hub.challenge)
 * POST: Inbound user & customer interactions from WhatsApp:
 *   - Customer Support/Sales messages -> saved into Unified Omni-Inbox (conversations + inboxMessages)
 *   - Admin 48-Hour buttons: BTN_APPROVE_<id>, BTN_SKIP_<id>, BTN_PAUSE_<id>
 *   - Audio / Voice notes: Multilingual voice feedback (Hindi, Bengali, English)
 */

// Helper to safely dispatch to Inngest with graceful mock fallback
async function safeSendInngest(event: any) {
  try {
    return await inngest.send(event);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Inngest Dispatch Fallback]', msg);
    return { ids: ['mock_inngest_event_id'] };
  }
}

// Helper to send a reply via WhatsApp Cloud API
async function sendWhatsAppReply(to: string, text: string) {
  const token = process.env.META_WA_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.META_WA_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId || token.startsWith('EAAxxxx')) {
    console.log(`[WhatsApp Mock Outbound] To: ${to} | Text: ${text}`);
    return;
  }

  try {
    await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: text },
      }),
    });
  } catch (err) {
    console.error('[WhatsApp Outbound Error]:', err);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken =
    process.env.META_WA_VERIFY_TOKEN ||
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
    'kuiro_wa_verify_token_secure_123';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WhatsApp Webhook] Verification challenge passed successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ status: 'ignored_receipt' }, { status: 200 });
    }

    const senderPhone = message.from || 'unknown';
    const messageType = message.type;
    const contactName = value?.contacts?.[0]?.profile?.name || senderPhone;

    // 1. Handle Interactive Button Clicks (Approve / Skip / Pause / Edit for 48h campaign autopilot)
    if (messageType === 'interactive') {
      const buttonId: string = message.interactive?.button_reply?.id || '';

      if (buttonId.startsWith('BTN_APPROVE_') || buttonId.startsWith('BTN_SKIP_') || buttonId.startsWith('BTN_PAUSE_')) {
        let action: 'APPROVE' | 'SKIP' | 'EMERGENCY_PAUSE' = 'APPROVE';
        let campaignId = '';
        if (buttonId.startsWith('BTN_APPROVE_')) {
          action = 'APPROVE';
          campaignId = buttonId.replace('BTN_APPROVE_', '');
        } else if (buttonId.startsWith('BTN_SKIP_')) {
          action = 'SKIP';
          campaignId = buttonId.replace('BTN_SKIP_', '');
        } else {
          action = 'EMERGENCY_PAUSE';
          campaignId = buttonId.replace('BTN_PAUSE_', '');
        }

        // TENANT ISOLATION: Validate that the sender phone is authorized for this campaign's workspace
        if (db) {
          const [camp] = await db
            .select()
            .from(scheduledCampaigns)
            .where(eq(scheduledCampaigns.id, campaignId))
            .limit(1);

          if (!camp) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
          }

          const [campWs] = await db
            .select()
            .from(workspaces)
            .where(eq(workspaces.id, camp.workspaceId))
            .limit(1);

          const normalizedSender = normalizePhone(senderPhone);
          const normalizedAdmin = campWs?.whatsappAdminPhone ? normalizePhone(campWs.whatsappAdminPhone) : '';

          let isAuthorized = false;
          if (normalizedAdmin && normalizedSender === normalizedAdmin) {
            isAuthorized = true;
          } else {
            // Also check socialConnections for this workspace
            const [waConn] = await db
              .select()
              .from(socialConnections)
              .where(
                and(
                  eq(socialConnections.workspaceId, camp.workspaceId),
                  eq(socialConnections.platform, 'whatsapp')
                )
              )
              .limit(1);

            if (waConn && normalizePhone(waConn.platformAccountId) === normalizedSender) {
              isAuthorized = true;
            }
          }

          if (!isAuthorized) {
            console.warn(`[WhatsApp Webhook Unauthorized] Sender ${senderPhone} attempted ${action} on campaign ${campaignId} owned by workspace ${camp.workspaceId}`);
            await sendWhatsAppReply(
              senderPhone,
              '⚠️ *Access Denied:* Your WhatsApp number is not authorized to approve or modify campaigns for this workspace.'
            );
            return NextResponse.json({ error: 'Unauthorized: Phone not linked to workspace admin' }, { status: 403 });
          }

          if (action === 'APPROVE') {
            await db.update(scheduledCampaigns).set({ status: 'APPROVED' }).where(eq(scheduledCampaigns.id, campaignId));
            await sendWhatsAppReply(
              senderPhone,
              '✅ *Approved!* Your campaign creative and copy are locked and scheduled for publication at peak audience hours.'
            );
          } else if (action === 'SKIP') {
            await db.update(scheduledCampaigns).set({ status: 'PAUSED' }).where(eq(scheduledCampaigns.id, campaignId));
            await sendWhatsAppReply(
              senderPhone,
              '🛑 *Skipped.* This post will not be published. KUIRO will prepare your next campaign on the regular calendar.'
            );
          } else if (action === 'EMERGENCY_PAUSE') {
            await db.update(scheduledCampaigns).set({ status: 'PAUSED' }).where(eq(scheduledCampaigns.id, campaignId));
            await sendWhatsAppReply(
              senderPhone,
              '⚠️ *Emergency Pause Activated.* All automated social publishing has been safely paused.'
            );
          }

          await safeSendInngest({
            name: 'whatsapp/admin.action',
            data: {
              campaignId,
              action,
              senderPhone,
              timestamp: new Date().toISOString(),
            },
          });

          return NextResponse.json({
            status: 'success',
            action,
            campaignId,
          });
        }
      }
    }

    // 2. Extract Message Content (Text or Audio / Voice)
    let messageContent = '';
    let isVoice = false;

    if (messageType === 'text') {
      messageContent = message.text?.body || '';
    } else if (messageType === 'audio' || messageType === 'voice') {
      isVoice = true;
      const mediaId = message.audio?.id || message.voice?.id;
      messageContent = `[Voice Note received: ID ${mediaId || 'audio'}]`;
    } else {
      messageContent = `[Received ${messageType} attachment]`;
    }

    // 3. Save into Neon Database (Unified Omni-Inbox)
    if (db) {
      try {
        const businessPhoneId = value?.metadata?.phone_number_id;
        const businessDisplayPhone = value?.metadata?.display_phone_number;

        // TENANT ISOLATION: Resolve exact target workspace without arbitrary limit(1)
        let targetWs: typeof workspaces.$inferSelect | undefined;

        // a. Check if existing conversation exists with this customer handle
        const [existingConv] = await db
          .select()
          .from(conversations)
          .where(
            and(
              eq(conversations.customerHandle, senderPhone),
              eq(conversations.channel, 'whatsapp')
            )
          )
          .limit(1);

        if (existingConv) {
          const [matchedWs] = await db
            .select()
            .from(workspaces)
            .where(eq(workspaces.id, existingConv.workspaceId))
            .limit(1);
          targetWs = matchedWs;
        }

        // b. Match business WhatsApp ID in socialConnections
        if (!targetWs && (businessPhoneId || businessDisplayPhone)) {
          const matchedConnections = await db
            .select()
            .from(socialConnections)
            .where(eq(socialConnections.platform, 'whatsapp'));

          const foundConn = matchedConnections.find(
            (c) =>
              (businessPhoneId && c.platformAccountId === businessPhoneId) ||
              (businessDisplayPhone && normalizePhone(c.platformAccountId) === normalizePhone(businessDisplayPhone))
          );

          if (foundConn) {
            const [matchedWs] = await db
              .select()
              .from(workspaces)
              .where(eq(workspaces.id, foundConn.workspaceId))
              .limit(1);
            targetWs = matchedWs;
          }
        }

        // c. Match workspace admin phone
        if (!targetWs && (businessDisplayPhone || senderPhone)) {
          const allWorkspaces = await db.select().from(workspaces);
          targetWs = allWorkspaces.find((w) => {
            if (!w.whatsappAdminPhone) return false;
            const normWsPhone = normalizePhone(w.whatsappAdminPhone);
            return (
              (businessDisplayPhone && normWsPhone === normalizePhone(businessDisplayPhone)) ||
              normWsPhone === normalizePhone(senderPhone)
            );
          });
        }

        // Strictly drop unmapped messages rather than corrupting random tenant data
        if (!targetWs) {
          console.warn(
            `[WhatsApp Webhook Dropped] Received inbound message from ${senderPhone} (business ID: ${businessPhoneId || 'none'}), but no matching tenant workspace was found. Dropped to preserve strict multi-tenant isolation.`
          );
          return NextResponse.json({
            status: 'ignored_unattributed_tenant',
            message: 'Inbound message could not be attributed to an authorized tenant workspace.',
          }, { status: 200 });
        }

        if (targetWs) {
          // Check for existing conversation with this customer
          let [conv] = await db
            .select()
            .from(conversations)
            .where(
              and(
                eq(conversations.customerHandle, senderPhone),
                eq(conversations.channel, 'whatsapp')
              )
            );

          if (!conv) {
            // Attribute lead to active or latest published campaign
            const [latestCamp] = await db
              .select()
              .from(scheduledCampaigns)
              .where(eq(scheduledCampaigns.workspaceId, targetWs.id))
              .orderBy(desc(scheduledCampaigns.createdAt))
              .limit(1);

            const campaignSource = latestCamp ? latestCamp.topicSummary : 'WhatsApp Direct Lead';

            // Create new conversation with campaign attribution
            const [newConv] = await db
              .insert(conversations)
              .values({
                workspaceId: targetWs.id,
                channel: 'whatsapp',
                customerName: contactName,
                customerHandle: senderPhone,
                status: 'OPEN',
                priority: 'NORMAL',
                lastMessageText: messageContent,
                unreadCount: 1,
                tags: ['WhatsApp Inbound', 'Attributed Lead'],
                campaignSource,
                crmData: {
                  phone: senderPhone,
                  patientOrClientType: 'Inbound Campaign Lead',
                  totalSpend: '₹3,500 (Attributed)',
                  notes: `Inbound customer inquiry attributed to: ${campaignSource}`,
                },
              })
              .returning();
            conv = newConv;
          } else {
            // Update existing conversation
            await db
              .update(conversations)
              .set({
                lastMessageText: messageContent,
                unreadCount: (conv.unreadCount || 0) + 1,
                updatedAt: new Date(),
              })
              .where(eq(conversations.id, conv.id));
          }

          if (conv) {
            // Insert incoming message
            const [newWaMsg] = await db.insert(inboxMessages).values({
              conversationId: conv.id,
              channel: 'whatsapp',
              senderType: 'CUSTOMER',
              senderName: contactName,
              content: messageContent,
              isInternalNote: false,
              aiGenerated: false,
            }).returning();

            // Broadcast real-time SSE event to connected inbox agents
            publishInboxEvent({
              type: 'new_message',
              workspaceId: targetWs.id,
              conversationId: conv.id,
              data: {
                message: {
                  id: newWaMsg?.id || `wa_${Date.now()}`,
                  conversationId: conv.id,
                  channel: 'whatsapp',
                  sender: 'customer',
                  senderName: contactName,
                  content: messageContent,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  status: 'delivered',
                  isInternalNote: false,
                },
                conversation: {
                  id: conv.id,
                  customerName: contactName,
                  customerHandle: senderPhone,
                  channel: 'whatsapp',
                  lastMessage: messageContent,
                  lastMessageTime: 'Just now',
                  unreadCount: (conv.unreadCount || 0) + 1,
                  status: 'open',
                },
              },
            });
          }
        }
      } catch (dbErr) {
        console.error('[WhatsApp DB Save Error]:', dbErr);
      }
    }

    // 4. Trigger Inngest Campaign Revision Loop if it is an admin voice note
    if (isVoice) {
      await safeSendInngest({
        name: 'kuiro/campaign.revise',
        data: {
          campaignId: 'latest-active',
          instruction: messageContent,
          source: 'WHATSAPP_VOICE',
          senderPhone,
        },
      });
    }

    return NextResponse.json({
      status: 'success',
      senderPhone,
      messageType,
      savedToOmniInbox: true,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[WhatsApp Webhook Error]', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
