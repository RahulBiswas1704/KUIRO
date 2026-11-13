import { NextRequest, NextResponse } from 'next/server';
import { db, conversations, inboxMessages } from '@/db';
import { eq } from 'drizzle-orm';
import { sendAutonomousEmailNewsletter } from '@/lib/email/publisher';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, content, isInternalNote = false, senderName = 'KUIRO Agent' } = body;

    if (!conversationId || !content?.trim()) {
      return NextResponse.json({ error: 'conversationId and content are required' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({
        success: true,
        source: 'mock',
        message: {
          id: `msg_mock_${Date.now()}`,
          conversationId,
          content,
          isInternalNote,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // 1. Fetch target conversation
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));

    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // 2. Insert message into Neon PostgreSQL
    const [newMsg] = await db
      .insert(inboxMessages)
      .values({
        conversationId: conv.id,
        channel: conv.channel,
        senderType: isInternalNote ? 'AGENT' : 'AGENT',
        senderName,
        content: content.trim(),
        isInternalNote,
        aiGenerated: false,
      })
      .returning();

    // 3. Update conversation last message & reset unread count
    await db
      .update(conversations)
      .set({
        lastMessageText: isInternalNote ? conv.lastMessageText : content.trim(),
        unreadCount: 0,
        status: isInternalNote ? conv.status : 'WAITING',
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conv.id));

    // 4. Outbound Real Delivery (if not internal note)
    let outboundDispatch: any = null;

    if (!isInternalNote) {
      const channel = conv.channel.toLowerCase();

      // A. Outbound WhatsApp via Meta Cloud API
      if (channel === 'whatsapp') {
        const token = process.env.META_WA_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneId = process.env.META_WA_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
        const toPhone = conv.customerHandle.replace(/[^\d+]/g, '');

        if (token && phoneId && !token.startsWith('EAAxxxx')) {
          try {
            const waRes = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: toPhone,
                type: 'text',
                text: { body: content.trim() },
              }),
            });
            const waData = await waRes.json();
            outboundDispatch = { channel: 'whatsapp', success: waRes.ok, data: waData };
          } catch (waErr: any) {
            console.error('[Outbound WhatsApp Error]:', waErr);
            outboundDispatch = { channel: 'whatsapp', success: false, error: waErr.message };
          }
        }
      }

      // B. Outbound Email via Resend API
      if (channel === 'email') {
        const toEmail = conv.crmData?.email || conv.customerHandle;
        if (toEmail && toEmail.includes('@') && process.env.RESEND_API_KEY) {
          try {
            const emailRes = await sendAutonomousEmailNewsletter({
              to: toEmail,
              subject: `Re: Conversation with ${conv.customerName}`,
              brandName: 'KUIRO Support',
              headline: 'Message from your support team',
              bodyContentHtml: `<p>${content.trim().replace(/\n/g, '<br/>')}</p>`,
            });
            outboundDispatch = { channel: 'email', success: emailRes.status === 'PUBLISHED', data: emailRes };
          } catch (emailErr: any) {
            console.error('[Outbound Email Error]:', emailErr);
            outboundDispatch = { channel: 'email', success: false, error: emailErr.message };
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: {
        id: newMsg.id,
        conversationId: newMsg.conversationId,
        content: newMsg.content,
        isInternalNote: newMsg.isInternalNote,
        timestamp: newMsg.createdAt.toISOString(),
        sender: {
          type: 'agent',
          name: senderName,
        },
      },
      outboundDispatch,
    });
  } catch (error: any) {
    console.error('[Inbox Reply API Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to send reply' }, { status: 500 });
  }
}

