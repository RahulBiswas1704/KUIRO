import { db, conversations, inboxMessages, workspaces, socialConnections } from '@/db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { publishInboxEvent } from '@/lib/inbox/eventHub';
import { decryptToken } from '@/lib/crypto/vault';
import { sendAutonomousEmailNewsletter } from '@/lib/email/publisher';
import { logger } from '@/lib/observability/logger';
import { metrics } from '@/lib/observability/metrics';

export interface MessagingWindowStatus {
  isOpen: boolean;
  hoursRemaining: number;
  windowExpiresAt: Date | null;
  requiresTemplate: boolean;
  reason?: string;
}

export interface InboundMessageParams {
  workspaceId: string;
  channel: 'whatsapp' | 'instagram' | 'messenger' | 'email';
  customerHandle: string; // phone number, IG username/ID, page-scoped user ID, or email
  customerName?: string;
  customerAvatar?: string;
  content: string;
  messageType?: 'text' | 'image' | 'audio' | 'document' | 'template';
  providerMessageId: string;
  attachments?: Array<{ type: 'image' | 'document' | 'audio'; url: string; title?: string }>;
  metadata?: any;
}

export interface OutboundDispatchParams {
  conversationId: string;
  workspaceId: string;
  content: string;
  senderName: string;
  isInternalNote?: boolean;
  templateName?: string;
  templateParams?: any;
  attachments?: Array<{ type: 'image' | 'document' | 'audio'; url: string; title?: string }>;
}

export interface OutboundDispatchResult {
  success: boolean;
  messageId?: string;
  providerMessageId?: string;
  deliveryStatus: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  channel: string;
  error?: string;
  windowStatus?: MessagingWindowStatus;
  message?: any;
}

/**
 * Checks the 24-hour customer service window for messaging channels (WhatsApp / Instagram).
 * Under Meta policy, freeform messages are permitted only within 24 hours of customer's last message.
 * Outside 24 hours, a pre-approved template message is required.
 */
export function checkMessagingWindow(
  lastCustomerMessageAt?: Date | string | null,
  channel: string = 'whatsapp'
): MessagingWindowStatus {
  const isWindowEnforced = channel === 'whatsapp' || channel === 'instagram' || channel === 'messenger';
  if (!isWindowEnforced) {
    return {
      isOpen: true,
      hoursRemaining: 9999,
      windowExpiresAt: null,
      requiresTemplate: false,
    };
  }

  if (!lastCustomerMessageAt) {
    return {
      isOpen: false,
      hoursRemaining: 0,
      windowExpiresAt: null,
      requiresTemplate: true,
      reason: 'No previous customer message recorded in this conversation. Template message required.',
    };
  }

  const lastDate = typeof lastCustomerMessageAt === 'string' ? new Date(lastCustomerMessageAt) : lastCustomerMessageAt;
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000; // 24 hours
  const expiresAt = new Date(lastDate.getTime() + windowMs);
  const remainingMs = expiresAt.getTime() - now;

  if (remainingMs <= 0) {
    return {
      isOpen: false,
      hoursRemaining: 0,
      windowExpiresAt: expiresAt,
      requiresTemplate: true,
      reason: 'The 24-hour customer service window has expired. Under Meta policy, an approved template message is required to re-engage.',
    };
  }

  const hoursRemaining = Math.round((remainingMs / (60 * 60 * 1000)) * 10) / 10;
  return {
    isOpen: true,
    hoursRemaining,
    windowExpiresAt: expiresAt,
    requiresTemplate: false,
  };
}

/**
 * Normalizes phone numbers to standard format
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

/**
 * LAYER A: Inbound Message Ingestion & Persistence
 * - Deduplicates incoming messages via providerMessageId
 * - Matches or creates a customer conversation in Neon PostgreSQL
 * - Stores message with deliveryStatus = 'delivered', readState = false
 * - Updates 24h messaging window and unread counter
 * - Broadcasts real-time SSE event to connected inbox agents
 */
export async function ingestInboundMessage(params: InboundMessageParams): Promise<{
  success: boolean;
  duplicate?: boolean;
  message?: any;
  conversation?: any;
  isNewConversation?: boolean;
  error?: string;
}> {
  const {
    workspaceId,
    channel,
    customerHandle,
    customerName = 'Customer',
    customerAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    content,
    messageType = 'text',
    providerMessageId,
    attachments = [],
    metadata = {},
  } = params;

  if (!db) {
    return {
      success: true,
      message: {
        id: `msg_mock_${Date.now()}`,
        content,
        providerMessageId,
      },
    };
  }

  try {
    // 1. Idempotency Check: Protect against duplicate webhook deliveries
    if (providerMessageId) {
      const [existingMsg] = await db
        .select()
        .from(inboxMessages)
        .where(eq(inboxMessages.providerMessageId, providerMessageId))
        .limit(1);

      if (existingMsg) {
        logger.info('inbox_duplicate_ignored', {
          service: 'inbox-dispatcher',
          event: 'duplicate_message_ignored',
          workspaceId,
          metadata: { providerMessageId, channel },
        });
        return {
          success: true,
          duplicate: true,
          message: existingMsg,
        };
      }
    }

    // 2. Find or Create Matching Conversation
    let isNewConversation = false;
    const now = new Date();
    const windowExpiresAt = new Date(now.getTime() + 24 * 3600 * 1000);

    let [conv] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.workspaceId, workspaceId),
          eq(conversations.customerHandle, customerHandle),
          eq(conversations.channel, channel)
        )
      )
      .limit(1);

    if (!conv) {
      isNewConversation = true;
      const [newConv] = await db
        .insert(conversations)
        .values({
          workspaceId,
          channel,
          customerName,
          customerHandle,
          customerAvatar,
          status: 'OPEN',
          priority: 'NORMAL',
          lastMessageText: content,
          unreadCount: 1,
          lastCustomerMessageAt: now,
          windowExpiresAt,
          tags: ['Inbound Lead', channel.toUpperCase()],
          crmData: {
            phone: channel === 'whatsapp' ? customerHandle : undefined,
            email: channel === 'email' ? customerHandle : undefined,
            notes: `Inbound customer inquiry via ${channel.toUpperCase()}`,
          },
        })
        .returning();
      conv = newConv;
    } else {
      // Update existing conversation
      const [updatedConv] = await db
        .update(conversations)
        .set({
          lastMessageText: content,
          unreadCount: (conv.unreadCount || 0) + 1,
          status: conv.status === 'RESOLVED' ? 'OPEN' : conv.status,
          lastCustomerMessageAt: now,
          windowExpiresAt,
          updatedAt: now,
        })
        .where(eq(conversations.id, conv.id))
        .returning();
      conv = updatedConv;
    }

    // 3. Store Incoming Message into Neon PostgreSQL
    const [storedMessage] = await db
      .insert(inboxMessages)
      .values({
        conversationId: conv.id,
        channel,
        senderType: 'CUSTOMER',
        senderName: customerName,
        content,
        providerMessageId,
        deliveryStatus: 'delivered',
        messageType,
        readState: false,
        isInternalNote: false,
        aiGenerated: false,
        attachments: attachments.length > 0 ? attachments : undefined,
        metadata,
      })
      .returning();

    // 4. Real-time Inbox SSE Event Dispatch
    const liveEventMsg = {
      id: storedMessage.id,
      conversationId: conv.id,
      channel,
      sender: 'customer' as const,
      senderName: customerName,
      content,
      providerMessageId,
      deliveryStatus: 'delivered' as const,
      status: 'delivered' as const,
      readState: false,
      timestamp: storedMessage.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isInternalNote: false,
      aiGenerated: false,
      attachments,
    };

    publishInboxEvent({
      type: 'new_message',
      workspaceId,
      conversationId: conv.id,
      data: {
        message: liveEventMsg,
        conversation: {
          id: conv.id,
          customerName: conv.customerName,
          customerHandle: conv.customerHandle,
          channel,
          lastMessage: content,
          lastMessageTime: 'Just now',
          unreadCount: conv.unreadCount,
          status: conv.status.toLowerCase(),
          isWindowOpen: true,
          windowExpiresAt: windowExpiresAt.toISOString(),
        },
      },
    });

    return {
      success: true,
      duplicate: false,
      message: storedMessage,
      conversation: conv,
      isNewConversation,
    };
  } catch (err: any) {
    console.error('[ingestInboundMessage Error]:', err);
    return {
      success: false,
      error: err.message || 'Failed to ingest inbound message',
    };
  }
}

/**
 * LAYER B: Outbound Message Dispatch & Delivery
 * 1. Verifies conversation access and workspace boundary
 * 2. Checks channel-specific 24-hour customer service window
 * 3. Handles internal team notes (never sent externally)
 * 4. Dispatches via provider API (WhatsApp, Instagram, Messenger, Email)
 * 5. Saves provider message ID and delivery status
 * 6. Updates conversation state
 * 7. Broadcasts SSE event to connected agents
 */
export async function dispatchOutboundReply(params: OutboundDispatchParams): Promise<OutboundDispatchResult> {
  const {
    conversationId,
    workspaceId,
    content,
    senderName,
    isInternalNote = false,
    templateName,
    templateParams,
    attachments = [],
  } = params;

  if (!db) {
    return {
      success: true,
      deliveryStatus: 'sent',
      channel: 'whatsapp',
      providerMessageId: `mock_${Date.now()}`,
    };
  }

  try {
    // 1. Fetch target conversation with strict multi-tenant scoping
    const [conv] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.workspaceId, workspaceId)
        )
      )
      .limit(1);

    if (!conv) {
      return {
        success: false,
        deliveryStatus: 'failed',
        channel: 'unknown',
        error: 'Conversation not found or does not belong to authorized workspace.',
      };
    }

    const channel = conv.channel.toLowerCase();

    // 2. Internal Team Notes (Strictly isolated from external dispatch)
    if (isInternalNote) {
      const [noteMsg] = await db
        .insert(inboxMessages)
        .values({
          conversationId: conv.id,
          channel: conv.channel,
          senderType: 'AGENT',
          senderName,
          content,
          deliveryStatus: 'delivered',
          messageType: 'text',
          readState: true,
          isInternalNote: true,
          aiGenerated: false,
        })
        .returning();

      // Broadcast note only to internal staff
      publishInboxEvent({
        type: 'new_message',
        workspaceId,
        conversationId: conv.id,
        data: {
          message: {
            id: noteMsg.id,
            conversationId: conv.id,
            channel: conv.channel,
            sender: 'agent',
            senderName,
            content,
            isInternalNote: true,
            deliveryStatus: 'delivered',
            status: 'sent',
            timestamp: noteMsg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        },
      });

      return {
        success: true,
        messageId: noteMsg.id,
        deliveryStatus: 'delivered',
        channel: conv.channel,
        message: noteMsg,
      };
    }

    // 3. Check 24-Hour Messaging Window Rules (WhatsApp & Instagram)
    const windowStatus = checkMessagingWindow(conv.lastCustomerMessageAt, channel);
    if (!windowStatus.isOpen && !templateName) {
      logger.warn('inbox_24h_window_expired', {
        service: 'inbox-dispatcher',
        event: 'window_violated',
        workspaceId,
        conversationId,
        errorCode: 'WINDOW_EXPIRED',
        metadata: { channel },
      });
      metrics.increment('inbox.window_violation', { channel });

      return {
        success: false,
        deliveryStatus: 'failed',
        channel,
        windowStatus,
        error: windowStatus.reason || '24-hour customer service window expired. Template message required.',
      };
    }

    // 4. Outbound Provider Dispatch
    const isMockMode = process.env.NODE_ENV === 'test' || process.env.KUIRO_TEST_MOCK_PROVIDERS === 'true';
    let dispatchSuccess = false;
    let providerMessageId: string | undefined;
    let dispatchError: string | undefined;
    let providerPayload: any = null;

    // A. WhatsApp Cloud API
    if (channel === 'whatsapp') {
      const token = process.env.META_WA_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneId = process.env.META_WA_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
      const toPhone = conv.customerHandle.replace(/[^\d+]/g, '');

      if (token && phoneId && !token.startsWith('EAAxxxx') && !isMockMode) {
        try {
          const bodyPayload: any = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: toPhone,
          };

          if (templateName) {
            bodyPayload.type = 'template';
            bodyPayload.template = {
              name: templateName,
              language: { code: 'en' },
              components: templateParams || [],
            };
          } else {
            bodyPayload.type = 'text';
            bodyPayload.text = { body: content.trim() };
          }

          const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyPayload),
          });

          const data = await res.json();
          providerPayload = data;

          if (res.ok && data.messages?.[0]?.id) {
            dispatchSuccess = true;
            providerMessageId = data.messages[0].id;
          } else {
            dispatchSuccess = false;
            dispatchError = data.error?.message || 'WhatsApp Cloud API dispatch error';
          }
        } catch (waErr: any) {
          dispatchSuccess = false;
          dispatchError = waErr.message;
        }
      } else {
        // Mock fallback for test environment
        dispatchSuccess = true;
        providerMessageId = `wamid_sim_${Date.now()}`;
        providerPayload = { simulated: true };
      }
    }

    // B. Instagram Direct Messages via Meta Graph API
    else if (channel === 'instagram') {
      const igToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.META_PAGE_ACCESS_TOKEN;
      if (igToken && !igToken.startsWith('EAAxxxx') && !isMockMode) {
        try {
          const res = await fetch(`https://graph.facebook.com/v21.0/me/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${igToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recipient: { id: conv.customerHandle },
              message: { text: content.trim() },
            }),
          });
          const data = await res.json();
          providerPayload = data;
          if (res.ok && (data.message_id || data.id)) {
            dispatchSuccess = true;
            providerMessageId = data.message_id || data.id;
          } else {
            dispatchSuccess = false;
            dispatchError = data.error?.message || 'Instagram dispatch error';
          }
        } catch (igErr: any) {
          dispatchSuccess = false;
          dispatchError = igErr.message;
        }
      } else {
        dispatchSuccess = true;
        providerMessageId = `ig_mid_sim_${Date.now()}`;
        providerPayload = { simulated: true };
      }
    }

    // C. Facebook Messenger via Meta Graph API
    else if (channel === 'messenger') {
      const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.META_PAGE_ACCESS_TOKEN;
      if (pageToken && !pageToken.startsWith('EAAxxxx') && !isMockMode) {
        try {
          const res = await fetch(`https://graph.facebook.com/v21.0/me/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${pageToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recipient: { id: conv.customerHandle },
              message: { text: content.trim() },
              messaging_type: 'RESPONSE',
            }),
          });
          const data = await res.json();
          providerPayload = data;
          if (res.ok && (data.message_id || data.id)) {
            dispatchSuccess = true;
            providerMessageId = data.message_id || data.id;
          } else {
            dispatchSuccess = false;
            dispatchError = data.error?.message || 'Messenger dispatch error';
          }
        } catch (msgErr: any) {
          dispatchSuccess = false;
          dispatchError = msgErr.message;
        }
      } else {
        dispatchSuccess = true;
        providerMessageId = `fb_mid_sim_${Date.now()}`;
        providerPayload = { simulated: true };
      }
    }

    // D. Outbound Email
    else if (channel === 'email') {
      const toEmail = conv.crmData?.email || conv.customerHandle;
      if (toEmail && toEmail.includes('@') && process.env.RESEND_API_KEY) {
        try {
          const emailRes = await sendAutonomousEmailNewsletter({
            to: toEmail,
            subject: `Re: Support inquiry from ${conv.customerName}`,
            brandName: 'KUIRO Support',
            headline: 'Message from your support team',
            bodyContentHtml: `<p>${content.trim().replace(/\n/g, '<br/>')}</p>`,
          });
          dispatchSuccess = emailRes.status === 'PUBLISHED';
          providerMessageId = emailRes.campaignId || `email_${Date.now()}`;
          providerPayload = emailRes;
        } catch (emailErr: any) {
          dispatchSuccess = false;
          dispatchError = emailErr.message;
        }
      } else {
        dispatchSuccess = true;
        providerMessageId = `email_sim_${Date.now()}`;
        providerPayload = { simulated: true };
      }
    }

    const deliveryStatus = dispatchSuccess ? 'sent' : 'failed';

    // 5. Store Outbound Message into Neon PostgreSQL
    const [storedMessage] = await db
      .insert(inboxMessages)
      .values({
        conversationId: conv.id,
        channel: conv.channel,
        senderType: 'AGENT',
        senderName,
        content: content.trim(),
        providerMessageId: providerMessageId || null,
        deliveryStatus,
        deliveryError: dispatchError || null,
        messageType: templateName ? 'template' : 'text',
        readState: true,
        isInternalNote: false,
        aiGenerated: false,
        attachments: attachments.length > 0 ? attachments : undefined,
        metadata: providerPayload,
      })
      .returning();

    // 6. Update Conversation State (reset unread count, set WAITING)
    await db
      .update(conversations)
      .set({
        lastMessageText: content.trim(),
        unreadCount: 0,
        status: 'WAITING',
        updatedAt: new Date(),
      })
      .where(and(eq(conversations.id, conv.id), eq(conversations.workspaceId, workspaceId)));

    // 7. Realtime SSE Broadcast
    publishInboxEvent({
      type: 'new_message',
      workspaceId,
      conversationId: conv.id,
      data: {
        message: {
          id: storedMessage.id,
          conversationId: conv.id,
          channel: conv.channel,
          sender: 'agent',
          senderName,
          content: content.trim(),
          providerMessageId,
          deliveryStatus,
          status: deliveryStatus,
          readState: true,
          timestamp: storedMessage.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isInternalNote: false,
          aiGenerated: false,
        },
        conversation: {
          id: conv.id,
          lastMessage: content.trim(),
          lastMessageTime: 'Just now',
          unreadCount: 0,
          status: 'waiting',
        },
      },
    });

    if (!dispatchSuccess) {
      logger.error('inbox_outbound_dispatch_failed', {
        service: 'inbox-dispatcher',
        event: 'dispatch_failed',
        workspaceId,
        conversationId,
        channel,
        errorCode: 'PROVIDER_ERROR',
        metadata: { error: dispatchError },
      });
      metrics.increment('inbox.dispatch_failed', { channel });
    } else {
      logger.info('inbox_outbound_dispatched', {
        service: 'inbox-dispatcher',
        event: 'outbound_sent',
        workspaceId,
        conversationId,
        channel,
        metadata: { messageId: storedMessage.id, providerMessageId },
      });
    }

    return {
      success: dispatchSuccess,
      messageId: storedMessage.id,
      providerMessageId,
      deliveryStatus,
      channel,
      error: dispatchError,
      windowStatus,
      message: storedMessage,
    };
  } catch (err: any) {
    logger.error('dispatch_outbound_reply_exception', {
      service: 'inbox-dispatcher',
      event: 'dispatch_exception',
      workspaceId,
      conversationId,
      err,
    });
    return {
      success: false,
      deliveryStatus: 'failed',
      channel: 'unknown',
      error: err.message || 'Outbound dispatch failed',
    };
  }
}
