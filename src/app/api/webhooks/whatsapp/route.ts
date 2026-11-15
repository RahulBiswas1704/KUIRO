import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { inngest } from '@/lib/inngest/client';
import { safeDispatchInngest } from '@/lib/inngest/dispatcher';
import { db, scheduledCampaigns, platformPosts, brandProfiles, conversations, inboxMessages, workspaces, socialConnections } from '@/db';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { generateWithGemini, transcribeAudioWithGemini } from '@/lib/ai/gemini';
import { reviseCampaignSurgically } from '@/lib/campaigns/reviser';
import { whatsappClient } from '@/lib/whatsapp/client';
import { publishInboxEvent } from '@/lib/inbox/eventHub';
import { ingestInboundMessage } from '@/lib/inbox/dispatchService';
import {
  verifyMetaWebhookChallenge,
  verifyMetaSignature,
  isDuplicateEvent,
  validateMetaIdentifiers,
} from '@/lib/whatsapp/webhookSecurity';
import {
  downloadWhatsAppAudio,
  transcribeWhatsAppAudio,
  processWhatsAppVoiceRevision,
} from '@/lib/whatsapp/voiceProcessor';
import {
  transitionCampaignState,
  handleUnpauseAndApproval,
  handleLateRevision,
} from '@/lib/campaigns/stateMachine';

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

// Helper to safely dispatch to Inngest via Resilient Outbox Dispatcher
async function safeSendInngest(event: any) {
  const res = await safeDispatchInngest(event);
  return { ids: [res.eventId] };
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

  // Verify challenge parameters with constant-time equality check
  const verification = verifyMetaWebhookChallenge(mode, token, challenge);
  if (!verification.valid) {
    return NextResponse.json(
      { error: verification.error },
      { status: verification.status }
    );
  }

  // Meta strictly requires returning hub.challenge as plain text HTTP 200
  return new Response(verification.challenge, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Read raw request body BEFORE any JSON deserialization
    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature-256');

    // 2. Cryptographic HMAC-SHA256 signature verification over exact raw bytes
    const sigVerification = verifyMetaSignature(rawBody, signature);
    if (!sigVerification.valid) {
      return NextResponse.json(
        { error: sigVerification.error },
        { status: sigVerification.status }
      );
    }

    // 3. Parse JSON only after successful signature validation
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // 4. Validate top-level Meta identifiers (whatsapp_business_account, entry array, WABA ID)
    const idValidation = validateMetaIdentifiers(body);
    if (!idValidation.valid) {
      return NextResponse.json({ error: idValidation.error }, { status: 400 });
    }

    // 5. Idempotency & Replay Attack Defense (Deduplicate based on message/event ID)
    const eventId = idValidation.eventId;
    if (eventId && isDuplicateEvent(eventId)) {
      console.log(
        `[Meta Webhook Idempotency] Duplicate event '${eventId}' detected. Acknowledging with HTTP 200 without duplicate processing.`
      );
      return NextResponse.json(
        {
          status: 'acknowledged',
          duplicate: true,
          eventId,
        },
        { status: 200 }
      );
    }

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
            await handleUnpauseAndApproval({ campaignId, workspaceId: camp.workspaceId });
            await sendWhatsAppReply(
              senderPhone,
              '✅ *Approved!* Your campaign creative and copy are locked and scheduled for publication at peak audience hours.'
            );
          } else if (action === 'SKIP') {
            await transitionCampaignState({ campaignId, targetState: 'PAUSED', workspaceId: camp.workspaceId, reason: 'Skipped by admin' });
            await sendWhatsAppReply(
              senderPhone,
              '🛑 *Skipped.* This post will not be published. KUIRO will prepare your next campaign on the regular calendar.'
            );
          } else if (action === 'EMERGENCY_PAUSE') {
            await transitionCampaignState({ campaignId, targetState: 'PAUSED', workspaceId: camp.workspaceId, reason: 'Emergency Pause by admin' });
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
    let voiceMediaId: string | undefined;
    let voiceTranscript: string | undefined;
    let voiceLanguage: string | undefined;
    let voiceAudioBuffer: Buffer | undefined;
    let voiceMimeType: string = message.audio?.mime_type || message.voice?.mime_type || 'audio/ogg';

    if (messageType === 'text') {
      messageContent = message.text?.body || '';
    } else if (messageType === 'audio' || messageType === 'voice') {
      isVoice = true;
      voiceMediaId = message.audio?.id || message.voice?.id;
      const inlineData = message.audio?.data || message.voice?.data;
      const transcriptGiven = message.audio?.transcript || message.voice?.transcript;

      if (inlineData) {
        voiceAudioBuffer = typeof inlineData === 'string' ? Buffer.from(inlineData, 'base64') : Buffer.from(inlineData);
      } else if (voiceMediaId) {
        try {
          const download = await downloadWhatsAppAudio(voiceMediaId);
          voiceAudioBuffer = download.buffer;
          voiceMimeType = download.mimeType;
        } catch (dlErr: any) {
          console.warn('[WhatsApp Audio Download Warning]:', dlErr.message);
        }
      }

      if (transcriptGiven) {
        voiceTranscript = transcriptGiven;
        voiceLanguage = 'auto';
        messageContent = `[Voice Note: ${transcriptGiven}]`;
      } else if (voiceAudioBuffer) {
        const transResult = await transcribeWhatsAppAudio(voiceAudioBuffer, voiceMimeType);
        if (transResult.success && transResult.transcript) {
          voiceTranscript = transResult.transcript;
          voiceLanguage = transResult.languageDetected;
          messageContent = `[Voice Note (${voiceLanguage}): "${voiceTranscript}"]`;
        } else {
          messageContent = `[Voice Note received: ID ${voiceMediaId || 'audio'}]`;
        }
      } else {
        messageContent = `[Voice Note received: ID ${voiceMediaId || 'audio'}]`;
      }
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
          // Check if sender is the workspace admin
          const isAdminSender =
            targetWs.whatsappAdminPhone &&
            normalizePhone(targetWs.whatsappAdminPhone) === normalizePhone(senderPhone);

          // If Admin is messaging, check if there is an active AUTO_QUEUED campaign to approve, pause, or surgically revise
          if (isAdminSender) {
            const [pendingCamp] = await db
              .select()
              .from(scheduledCampaigns)
              .where(
                and(
                  eq(scheduledCampaigns.workspaceId, targetWs.id),
                  inArray(scheduledCampaigns.status, ['AUTO_QUEUED', 'REVIEW_PENDING', 'PAUSED'])
                )
              )
              .orderBy(desc(scheduledCampaigns.createdAt))
              .limit(1);

            if (pendingCamp) {
              const cleanContent = messageContent.replace(/^\[Voice Note:\s*|\]$/g, '').trim();

              // Check for quick Approval
              const isApprove = /\b(approve|approved|haan|ha|publish|sahi hai|chalega|looks good|perfect|ok)\b/i.test(cleanContent);
              if (isApprove) {
                await handleUnpauseAndApproval({ campaignId: pendingCamp.id, workspaceId: targetWs.id });

                await safeSendInngest({
                  name: 'whatsapp/admin.action',
                  data: {
                    action: 'APPROVE',
                    campaignId: pendingCamp.id,
                  },
                });

                await sendWhatsAppReply(
                  senderPhone,
                  `✅ *Campaign Approved!*\n\nYour campaign *"${pendingCamp.topicSummary}"* has been approved and entered the immediate publish queue.`
                );

                return NextResponse.json({
                  status: 'admin_campaign_approved',
                  campaignId: pendingCamp.id,
                }, { status: 200 });
              }

              // Check for Emergency Pause
              const isPause = /\b(pause|stop|ruk jao|hold|cancel|mat daalo|skip)\b/i.test(cleanContent);
              if (isPause) {
                await transitionCampaignState({
                  campaignId: pendingCamp.id,
                  targetState: 'PAUSED',
                  workspaceId: targetWs.id,
                  reason: 'Emergency Pause triggered via WhatsApp chat',
                });

                await safeSendInngest({
                  name: 'whatsapp/admin.action',
                  data: {
                    action: 'EMERGENCY_PAUSE',
                    campaignId: pendingCamp.id,
                  },
                });

                await sendWhatsAppReply(
                  senderPhone,
                  `🛑 *Emergency Pause Activated!*\n\nCampaign *"${pendingCamp.topicSummary}"* has been paused.`
                );

                return NextResponse.json({
                  status: 'admin_campaign_paused',
                  campaignId: pendingCamp.id,
                }, { status: 200 });
              }

              // Otherwise treat as Surgical Voice / Text Revision
              const revisionResult = await processWhatsAppVoiceRevision({
                workspaceId: targetWs.id,
                senderPhone,
                requesterName: contactName,
                mediaId: voiceMediaId,
                audioBuffer: voiceAudioBuffer,
                mimeType: voiceMimeType,
                transcriptOverride: voiceTranscript || cleanContent,
              });

              if (revisionResult.status === 'SECURITY_REJECTED') {
                await sendWhatsAppReply(senderPhone, revisionResult.replyMessage);
                return NextResponse.json({
                  status: 'security_violation_rejected',
                  error: revisionResult.error,
                  replyMessage: revisionResult.replyMessage,
                }, { status: 403 });
              }

              if (revisionResult.status === 'AUDIO_INVALID' || revisionResult.status === 'TRANSCRIPTION_FAILED') {
                await sendWhatsAppReply(senderPhone, revisionResult.replyMessage);
                return NextResponse.json({
                  status: revisionResult.status.toLowerCase(),
                  error: revisionResult.error,
                  replyMessage: revisionResult.replyMessage,
                }, { status: 400 });
              }

              if (revisionResult.status === 'MAX_REVISIONS_EXCEEDED') {
                await sendWhatsAppReply(senderPhone, revisionResult.replyMessage);
                return NextResponse.json({
                  status: 'admin_max_revisions_reached',
                  campaignId: pendingCamp.id,
                  replyMessage: revisionResult.replyMessage,
                }, { status: 200 });
              }

              if (revisionResult.status === 'REVISION_APPLIED') {
                await safeSendInngest({
                  name: 'whatsapp/admin.action',
                  data: {
                    action: 'EDIT',
                    instruction: revisionResult.transcript,
                    campaignId: pendingCamp.id,
                  },
                });

                await sendWhatsAppReply(senderPhone, revisionResult.replyMessage);

                return NextResponse.json({
                  status: 'admin_campaign_revised',
                  campaignId: pendingCamp.id,
                  revisionSummary: revisionResult.revisionSummary,
                  criticScore: revisionResult.compositeCriticScore,
                  transcript: revisionResult.transcript,
                  languageDetected: revisionResult.languageDetected,
                }, { status: 200 });
              }
            }
          }

          // Ingest inbound customer message into Unified Omni-Channel Inbox via dispatchService
          await ingestInboundMessage({
            workspaceId: targetWs.id,
            channel: 'whatsapp',
            customerHandle: senderPhone,
            customerName: contactName,
            content: messageContent,
            providerMessageId: message.id || `wa_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            messageType: isVoice ? 'audio' : 'text',
            metadata: {
              rawMessageId: message.id,
              timestamp: message.timestamp,
              type: message.type,
              isVoiceNote: isVoice,
            },
          });
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
