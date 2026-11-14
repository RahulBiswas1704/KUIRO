import { NextRequest, NextResponse } from 'next/server';
import { db, conversations, inboxMessages, workspaces, scheduledCampaigns } from '@/db';
import { desc, eq } from 'drizzle-orm';
import { publishInboxEvent } from '@/lib/inbox/eventHub';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const SIMULATION_PRESETS = [
  {
    channel: 'whatsapp' as const,
    customerName: 'Pooja Singhania',
    customerHandle: '+91 98301 88412',
    content: 'Namaste! We are placing an order for 15 Banarasi silk stoles for wedding gifting. Do you have artisan gift boxes available?',
    city: 'Kolkata, Alipore',
    clientType: 'Wedding Gifting Client',
    campaign: 'Diwali Festive Prosperity & Heritage Weaves Broadcast',
  },
  {
    channel: 'instagram' as const,
    customerName: 'Aravind Swamy',
    customerHandle: '@aravind_design',
    content: 'Hello! Saw your handloom craftsmanship Reel. Can you dispatch 2 custom tussar silk dupattas to Bangalore by Thursday?',
    city: 'Bangalore, Indiranagar',
    clientType: 'Direct Instagram Buyer',
    campaign: 'Instagram Reel: Scalable Artisan Weaves',
  },
  {
    channel: 'whatsapp' as const,
    customerName: 'Vikram Mehra',
    customerHandle: '+91 98200 44102',
    content: 'Hi team! We need an urgent volume quote for 50 corporate executive textile hampers. Who can we discuss wholesale pricing with?',
    city: 'Mumbai, BKC',
    clientType: 'Corporate Procurement Lead',
    campaign: 'Corporate Festive Gifting Newsletter',
  },
  {
    channel: 'email' as const,
    customerName: 'Sunita Kapoor',
    customerHandle: 'sunita.k@luxuryliving.in',
    content: 'Dear Sharma Heritage Team, We would love to feature your handloom collection in our boutique studio this season. Please share your wholesale catalogue and MOQs.',
    city: 'New Delhi, Vasant Vihar',
    clientType: 'Boutique Curator & Partner',
    campaign: 'Organic Brand Reach',
  },
];

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Pick random preset or use user-provided payload
    const preset = SIMULATION_PRESETS[Math.floor(Math.random() * SIMULATION_PRESETS.length)];
    const channel = body.channel || preset.channel;
    const customerName = body.customerName || preset.customerName;
    const customerHandle = body.customerHandle || preset.customerHandle;
    const content = body.content || preset.content;
    const clientType = body.clientType || preset.clientType;
    const city = body.city || preset.city;

    const database = db;
    let targetWorkspaceId = session?.workspace.id || 'ws-sharma-101';
    let conversationId = `conv_sim_${Date.now()}`;
    let messageId = `msg_sim_${Date.now()}`;

    if (database) {
      try {
        let [ws] = await database.select().from(workspaces).limit(1);
        if (ws) {
          targetWorkspaceId = ws.id;

          // Check if conversation already exists for this handle
          let [existingConv] = await database
            .select()
            .from(conversations)
            .where(eq(conversations.customerHandle, customerHandle))
            .limit(1);

          if (existingConv) {
            conversationId = existingConv.id;
            await database
              .update(conversations)
              .set({
                lastMessageText: content,
                unreadCount: (existingConv.unreadCount || 0) + 1,
                status: 'OPEN',
                updatedAt: new Date(),
              })
              .where(eq(conversations.id, existingConv.id));
          } else {
            // Attribute lead to latest campaign
            const [latestCamp] = await database
              .select()
              .from(scheduledCampaigns)
              .where(eq(scheduledCampaigns.workspaceId, ws.id))
              .orderBy(desc(scheduledCampaigns.createdAt))
              .limit(1);

            const campaignSource = latestCamp ? latestCamp.topicSummary : preset.campaign;

            const [newConv] = await database
              .insert(conversations)
              .values({
                workspaceId: ws.id,
                channel,
                customerName,
                customerHandle,
                status: 'OPEN',
                priority: 'HIGH',
                lastMessageText: content,
                unreadCount: 1,
                tags: ['Live Inbound Lead', 'SSE Real-Time', 'High Intent'],
                sentiment: 'POSITIVE',
                campaignSource,
                crmData: {
                  phone: customerHandle.startsWith('+') ? customerHandle : undefined,
                  email: customerHandle.includes('@') ? customerHandle : `${customerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
                  city,
                  totalSpend: '₹0 (New Lead)',
                  patientOrClientType: clientType,
                  lastVisitDate: 'Today (Live Stream)',
                  notes: `Live inbound inquiry received via ${channel.toUpperCase()}. Lead attributed to: ${campaignSource}`,
                },
              })
              .returning();

            conversationId = newConv.id;
          }

          // Insert incoming message
          const [insertedMsg] = await database
            .insert(inboxMessages)
            .values({
              conversationId,
              channel,
              senderType: 'CUSTOMER',
              senderName: customerName,
              content,
              aiGenerated: false,
              isInternalNote: false,
            })
            .returning();

          if (insertedMsg) {
            messageId = insertedMsg.id;
          }
        }
      } catch (dbErr) {
        console.warn('[Simulate DB Fallback]:', dbErr);
      }
    }

    const newMsgPayload = {
      id: messageId,
      conversationId,
      channel,
      sender: 'customer' as const,
      senderName: customerName,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered' as const,
      isInternalNote: false,
    };

    const conversationSnippet = {
      id: conversationId,
      customerName,
      customerHandle,
      channel,
      lastMessage: content,
      lastMessageTime: 'Just now',
      unreadCount: 1,
      status: 'open' as const,
      priority: 'high' as const,
      tags: ['Live Inbound Lead', 'SSE Real-Time', 'High Intent'],
      crmData: {
        city,
        patientOrClientType: clientType,
        totalSpend: '₹0 (New Lead)',
        notes: `Live inbound inquiry received via ${channel.toUpperCase()}`,
      },
    };

    // Broadcast Realtime SSE Event across all connected clients
    const publishedEvent = publishInboxEvent({
      type: 'new_message',
      workspaceId: targetWorkspaceId,
      conversationId,
      data: {
        message: newMsgPayload,
        conversation: conversationSnippet,
        isSimulated: true,
      },
    });

    return NextResponse.json({
      success: true,
      eventId: publishedEvent.id,
      conversationId,
      message: newMsgPayload,
      conversation: conversationSnippet,
    });
  } catch (err: any) {
    console.error('[Simulate Inbound Error]:', err);
    return NextResponse.json({ error: err.message || 'Simulation failed' }, { status: 500 });
  }
}
