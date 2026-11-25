/**
 * KUIRO Inbox Keyword Auto-Responder Engine
 * 
 * Evaluates inbound customer messages against:
 * 1. Custom tenant rules defined in the `inbox_automations` table.
 * 2. Intelligent built-in default keyword categories (Greetings, Pricing/Catalog, Booking, Location/Hours).
 * 
 * Automatically sends the WhatsApp response, records the message in the Omni-Channel Inbox,
 * updates conversation state, and emits real-time SSE events.
 */

import { db, inboxAutomations, inboxMessages, conversations, workspaces } from '@/db';
import { eq, and, sql } from 'drizzle-orm';
import { publishInboxEvent } from '@/lib/inbox/eventHub';

export interface AutoResponderMatch {
  matched: boolean;
  ruleName?: string;
  triggerKeyword?: string;
  responseContent?: string;
  source: 'database_rule' | 'default_rule';
  ruleId?: string;
}

export interface EvaluateAutoResponderParams {
  workspaceId: string;
  channel: 'whatsapp' | 'instagram' | 'messenger' | 'email';
  senderPhone: string;
  customerName?: string;
  messageContent: string;
  conversationId?: string;
}

/**
 * Built-in fallback keyword rules for Indian SMBs & Brands
 */
function getBuiltInRules(businessName: string) {
  return [
    {
      name: 'Greeting & Menu',
      keywords: ['hi', 'hello', 'hey', 'namaste', 'kem cho', 'vanakkam', 'pranam', 'good morning', 'good afternoon', 'good evening', 'start'],
      matchType: 'word_boundary',
      reply: `👋 *Namaste & Welcome to ${businessName}!* 🙏\n\nThank you for reaching out to us on WhatsApp. How can we assist you today?\n\n• Reply *PRICING* for catalog & rates\n• Reply *BOOK* to schedule an appointment\n• Reply *HOURS* for our location & timings\n\nOur customer care team has been notified and is also on standby to assist you!`,
    },
    {
      name: 'Pricing & Catalog',
      keywords: ['price', 'pricing', 'rate', 'rates', 'cost', 'charges', 'fees', 'daam', 'paisa', 'menu', 'catalog', 'catalogue'],
      matchType: 'contains',
      reply: `✨ *${businessName} Pricing & Collections*\n\nThank you for your interest! Our bespoke collections and services are crafted to deliver exceptional value.\n\n📲 Our team specialist has been alerted and will send you our detailed catalog & pricing directly here.\n\nPlease let us know if you are looking for a specific item or service!`,
    },
    {
      name: 'Booking & Reservations',
      keywords: ['book', 'booking', 'appointment', 'reserve', 'reservation', 'slot', 'schedule', 'table'],
      matchType: 'contains',
      reply: `📅 *Book Your Visit / Appointment with ${businessName}*\n\nWe are thrilled to assist you! Please reply with your preferred *Date* and *Time*.\n\n✅ Your booking inquiry has been given priority queue status and our coordinator will confirm your slot shortly.`,
    },
    {
      name: 'Location & Operating Hours',
      keywords: ['location', 'address', 'timing', 'timings', 'hours', 'kahan', 'open', 'close', 'where', 'pata'],
      matchType: 'contains',
      reply: `📍 *Visit ${businessName}*\n\n🕒 *Hours:* Open daily from 10:00 AM to 8:30 PM (IST).\n\nIf you need directions, landmark assistance, or doorstep pickup, please reply here and our store team will guide you!`,
    },
  ];
}

/**
 * Evaluates whether an inbound message matches any keyword auto-responder rules.
 */
export async function matchAutoResponderRule(
  params: EvaluateAutoResponderParams
): Promise<AutoResponderMatch> {
  const { workspaceId, messageContent, channel } = params;
  const cleanText = messageContent.trim().toLowerCase();

  if (!cleanText) {
    return { matched: false, source: 'default_rule' };
  }

  // 1. Check custom database rules in inbox_automations
  if (db) {
    try {
      const activeRules = await db
        .select()
        .from(inboxAutomations)
        .where(
          and(
            eq(inboxAutomations.workspaceId, workspaceId),
            eq(inboxAutomations.enabled, true)
          )
        );

      for (const rule of activeRules) {
        // Channel filter
        if (rule.channel !== 'all' && rule.channel !== channel) {
          continue;
        }

        // Check keywords
        const keywords = rule.keywords || [];
        const matchedKw = keywords.find((kw) => {
          const kLower = kw.toLowerCase().trim();
          if (!kLower) return false;
          if (rule.conditions === 'exact') {
            return cleanText === kLower;
          }
          // Default: contains keyword
          return cleanText.includes(kLower);
        });

        if (matchedKw) {
          const autoReplyAction = rule.actions?.find((a) => a.type === 'AUTO_REPLY');
          if (autoReplyAction?.payload) {
            // Increment trigger count
            await db
              .update(inboxAutomations)
              .set({
                triggerCount: sql`${inboxAutomations.triggerCount} + 1`,
                updatedAt: new Date(),
              })
              .where(eq(inboxAutomations.id, rule.id));

            return {
              matched: true,
              ruleName: rule.name,
              triggerKeyword: matchedKw,
              responseContent: autoReplyAction.payload,
              source: 'database_rule',
              ruleId: rule.id,
            };
          }
        }
      }
    } catch (err) {
      console.warn('[AutoResponder] DB rule evaluation error:', err);
    }
  }

  // 2. Fallback to smart built-in keyword rules
  let businessName = 'KUIRO';
  if (db) {
    try {
      const [ws] = await db
        .select({ name: workspaces.name })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .limit(1);
      if (ws?.name) businessName = ws.name;
    } catch {
      // Use fallback
    }
  }

  const defaultRules = getBuiltInRules(businessName);
  for (const rule of defaultRules) {
    const matchedKw = rule.keywords.find((kw) => {
      if (rule.matchType === 'word_boundary') {
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        return regex.test(cleanText);
      }
      return cleanText.includes(kw);
    });

    if (matchedKw) {
      return {
        matched: true,
        ruleName: rule.name,
        triggerKeyword: matchedKw,
        responseContent: rule.reply,
        source: 'default_rule',
      };
    }
  }

  return { matched: false, source: 'default_rule' };
}

/**
 * Executes the auto-reply:
 * 1. Dispatches WhatsApp text outbound to user.
 * 2. Writes message to Neon inbox_messages.
 * 3. Updates conversation.
 * 4. Publishes real-time SSE event to dashboard.
 */
export async function executeAutoResponderReply(params: {
  workspaceId: string;
  senderPhone: string;
  responseContent: string;
  ruleName?: string;
  conversationId?: string;
  sendWhatsAppFn: (to: string, text: string) => Promise<void>;
}): Promise<{ success: boolean; messageId?: string }> {
  const { workspaceId, senderPhone, responseContent, ruleName, sendWhatsAppFn } = params;

  try {
    // 1. Send outbound WhatsApp message
    await sendWhatsAppFn(senderPhone, responseContent);

    // 2. Persist in Neon DB if conversationId is available or find matching conversation
    if (db) {
      let targetConvId = params.conversationId;

      if (!targetConvId) {
        const [existingConv] = await db
          .select({ id: conversations.id })
          .from(conversations)
          .where(
            and(
              eq(conversations.workspaceId, workspaceId),
              eq(conversations.customerHandle, senderPhone)
            )
          )
          .limit(1);
        targetConvId = existingConv?.id;
      }

      if (targetConvId) {
        const now = new Date();
        const [storedReply] = await db
          .insert(inboxMessages)
          .values({
            conversationId: targetConvId,
            channel: 'whatsapp',
            senderType: 'AGENT',
            senderName: 'KUIRO Auto-Responder',
            content: responseContent,
            providerMessageId: `auto_wa_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            deliveryStatus: 'delivered',
            messageType: 'text',
            readState: true,
            isInternalNote: false,
            aiGenerated: true,
            metadata: {
              automated: true,
              ruleName: ruleName || 'Keyword Auto-Responder',
            },
          })
          .returning();

        // Update conversation last message
        await db
          .update(conversations)
          .set({
            lastMessageText: responseContent,
            updatedAt: now,
          })
          .where(eq(conversations.id, targetConvId));

        // 3. Emit real-time SSE event to Dashboard Omni-Inbox
        publishInboxEvent({
          type: 'new_message',
          workspaceId,
          conversationId: targetConvId,
          data: {
            message: {
              id: storedReply.id,
              conversationId: targetConvId,
              channel: 'whatsapp',
              sender: 'agent',
              senderName: 'KUIRO Auto-Responder',
              content: responseContent,
              deliveryStatus: 'delivered',
              status: 'delivered',
              readState: true,
              timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isInternalNote: false,
              aiGenerated: true,
            },
          },
        });

        return { success: true, messageId: storedReply.id };
      }
    }

    return { success: true };
  } catch (err) {
    console.error('[AutoResponder Execution Error]', err);
    return { success: false };
  }
}
