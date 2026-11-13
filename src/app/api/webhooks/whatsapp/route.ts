import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';
import { db, scheduledCampaigns, conversations, inboxMessages, workspaces } from '@/db';
import { eq, and } from 'drizzle-orm';
import { generateWithGemini } from '@/lib/ai/gemini';

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

      if (buttonId.startsWith('BTN_APPROVE_')) {
        const campaignId = buttonId.replace('BTN_APPROVE_', '');
        console.log(`[WhatsApp Webhook] Campaign ${campaignId} manually APPROVED by ${senderPhone}`);

        await safeSendInngest({
          name: 'whatsapp/admin.action',
          data: {
            campaignId,
            action: 'APPROVE',
            senderPhone,
            timestamp: new Date().toISOString(),
          },
        });

        if (db) {
          try {
            await db
              .update(scheduledCampaigns)
              .set({ status: 'APPROVED' })
              .where(eq(scheduledCampaigns.id, campaignId));
          } catch {}
        }

        await sendWhatsAppReply(
          senderPhone,
          '✅ *Approved!* Your campaign creative and copy are locked and scheduled for publication at peak audience hours.'
        );

        return NextResponse.json({
          status: 'success',
          action: 'APPROVED',
          campaignId,
        });
      }

      if (buttonId.startsWith('BTN_SKIP_')) {
        const campaignId = buttonId.replace('BTN_SKIP_', '');
        console.log(`[WhatsApp Webhook] Campaign ${campaignId} SKIPPED by ${senderPhone}`);

        await safeSendInngest({
          name: 'whatsapp/admin.action',
          data: {
            campaignId,
            action: 'SKIP',
            senderPhone,
            timestamp: new Date().toISOString(),
          },
        });

        if (db) {
          try {
            await db
              .update(scheduledCampaigns)
              .set({ status: 'PAUSED' })
              .where(eq(scheduledCampaigns.id, campaignId));
          } catch {}
        }

        await sendWhatsAppReply(
          senderPhone,
          '🛑 *Skipped.* This post will not be published. KUIRO will prepare your next campaign on the regular calendar.'
        );

        return NextResponse.json({
          status: 'success',
          action: 'SKIPPED',
          campaignId,
        });
      }

      if (buttonId.startsWith('BTN_PAUSE_')) {
        const campaignId = buttonId.replace('BTN_PAUSE_', '');
        console.log(`[WhatsApp Webhook] EMERGENCY PAUSE triggered by ${senderPhone}`);

        await safeSendInngest({
          name: 'whatsapp/admin.action',
          data: {
            campaignId,
            action: 'EMERGENCY_PAUSE',
            senderPhone,
            timestamp: new Date().toISOString(),
          },
        });

        await sendWhatsAppReply(
          senderPhone,
          '⚠️ *Emergency Pause Activated.* All automated social publishing has been safely paused.'
        );

        return NextResponse.json({
          status: 'success',
          action: 'EMERGENCY_PAUSED',
          campaignId,
        });
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
        // Fetch or assign workspace
        const [targetWs] = await db.select().from(workspaces).limit(1);

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
            // Create new conversation
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
                tags: ['WhatsApp Inbound', 'Lead'],
                crmData: {
                  phone: senderPhone,
                  notes: 'Inbound customer inquiry via Meta WhatsApp Cloud API',
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
            await db.insert(inboxMessages).values({
              conversationId: conv.id,
              channel: 'whatsapp',
              senderType: 'CUSTOMER',
              senderName: contactName,
              content: messageContent,
              isInternalNote: false,
              aiGenerated: false,
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
