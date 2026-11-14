import { NextRequest, NextResponse } from 'next/server';
import { db, conversations, inboxMessages, workspaces, users } from '@/db';
import { desc, asc, eq, and } from 'drizzle-orm';
import { ConversationChannel, ConversationStatus, ConversationPriority } from '@/types';
import { getSessionFromRequest, authorizeWorkspace } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Authorize workspace access (Strict Multi-Tenant Isolation)
    const workspaceIdParam = req.nextUrl.searchParams.get('workspaceId');
    const auth = await authorizeWorkspace(req, workspaceIdParam);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const database = db;
    if (!database) {
      return NextResponse.json({
        success: true,
        source: 'mock',
        conversations: [],
      });
    }

    const wsId = auth.workspaceId!;
    const [ws] = await database.select().from(workspaces).where(eq(workspaces.id, wsId)).limit(1);
    if (!ws) {
      return NextResponse.json({ success: false, error: 'Workspace not found' }, { status: 404 });
    }

    // 1. Fetch conversations scoped to this workspace from Neon PostgreSQL
    let convList = await database
      .select()
      .from(conversations)
      .where(eq(conversations.workspaceId, ws.id))
      .orderBy(desc(conversations.updatedAt));

    // 2. Multi-Channel Lead Auto-Seeder: Ensure at least 1 lead per major channel (WhatsApp, Instagram, Email)
    const hasInstagram = convList.some((c) => c.channel.toLowerCase() === 'instagram');
    const hasEmail = convList.some((c) => c.channel.toLowerCase() === 'email');
    const hasWhatsApp = convList.some((c) => c.channel.toLowerCase() === 'whatsapp');

    // A. Seed Instagram DM Lead (Retail & Product Inquiry)
    if (!hasInstagram) {
      const [igConv] = await database
        .insert(conversations)
        .values({
          workspaceId: ws.id,
          channel: 'instagram',
          customerName: 'Priya Sen',
          customerHandle: '@priya_lifestyle',
          customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          status: 'OPEN',
          priority: 'HIGH',
          tags: ['Festive Collection', 'Direct Order', 'Priority Customer'],
          sentiment: 'POSITIVE',
          campaignSource: 'Instagram Reel: Handcrafted Festive Lookbook',
          crmData: {
            phone: '+91 97110 32890',
            email: 'priya@lifestyle.in',
            city: 'Kolkata / Salt Lake',
            totalSpend: '₹18,500 (Repeat Customer)',
            patientOrClientType: 'VIP Retail Customer',
            lastVisitDate: 'Oct 24, 2026',
            notes: 'Loves pure silk & handlooms. Inquired about festive collection sizes.',
          },
          lastMessageText: 'Hey! Loved the royal blue festive set in your recent Reel. Do you have Medium in stock for pickup today?',
          unreadCount: 1,
        })
        .returning();

      await database.insert(inboxMessages).values([
        {
          conversationId: igConv.id,
          channel: 'instagram',
          senderType: 'CUSTOMER',
          senderName: 'Priya Sen',
          content: 'Hey! Loved the royal blue festive set in your recent Reel. Do you have Medium in stock for pickup today?',
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          conversationId: igConv.id,
          channel: 'instagram',
          senderType: 'AI_BOT',
          senderName: 'KUIRO AI Co-Pilot',
          content: 'Hi Priya! Yes, we have the royal blue festive set in Medium right now at our showroom. Would you like us to hold it for pickup this afternoon, or arrange doorstep delivery?',
          createdAt: new Date(Date.now() - 3500000),
          aiGenerated: true,
        },
        {
          conversationId: igConv.id,
          channel: 'instagram',
          senderType: 'AGENT',
          senderName: 'Showroom Team',
          content: 'Inventory verified in rack B4. Ready for pickup.',
          isInternalNote: true,
          createdAt: new Date(Date.now() - 3400000),
        },
      ]);
    }

    // B. Seed Email Lead (B2B Corporate & Brand Partnership)
    if (!hasEmail) {
      const [emailConv] = await database
        .insert(conversations)
        .values({
          workspaceId: ws.id,
          channel: 'email',
          customerName: 'Meera Deshmukh',
          customerHandle: 'meera.deshmukh@tcs.com',
          customerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          status: 'WAITING',
          priority: 'NORMAL',
          tags: ['Corporate Account', 'B2B Partnership', 'High Value'],
          sentiment: 'POSITIVE',
          campaignSource: 'Executive Partnership & Festive Gifting Newsletter #42',
          crmData: {
            phone: '+91 98212 90812',
            email: 'meera.deshmukh@tcs.com',
            city: 'Mumbai / BKC',
            totalSpend: '₹85,000 (Corporate Account)',
            patientOrClientType: 'Corporate Partner Director',
            lastVisitDate: 'Oct 28, 2026',
            notes: 'High value corporate account. Reviewed proposal for 450 corporate gifting sets.',
          },
          lastMessageText: 'Reviewed your corporate partnership proposal. We would like to schedule an alignment call this Thursday at 3 PM.',
          unreadCount: 0,
        })
        .returning();

      await database.insert(inboxMessages).values([
        {
          conversationId: emailConv.id,
          channel: 'email',
          senderType: 'CUSTOMER',
          senderName: 'Meera Deshmukh',
          content: 'Dear Team, We reviewed your corporate partnership proposal for our regional team. We would like to schedule an introductory alignment call this Thursday at 3 PM.',
          createdAt: new Date(Date.now() - 7200000),
        },
        {
          conversationId: emailConv.id,
          channel: 'email',
          senderType: 'AGENT',
          senderName: 'Executive Team',
          content: 'Thank you Meera! Thursday at 3 PM works perfectly for our team. We look forward to connecting.',
          createdAt: new Date(Date.now() - 5400000),
        },
      ]);
    }

    // C. Seed WhatsApp Lead if none exists
    if (!hasWhatsApp) {
      const [seedConv] = await database
        .insert(conversations)
        .values({
          workspaceId: ws.id,
          channel: 'whatsapp',
          customerName: 'Ananya Mukherjee',
          customerHandle: '+91 98201 44512',
          customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          status: 'OPEN',
          priority: 'HIGH',
          tags: ['Festive Offer', 'Direct Booking', 'Priority Client'],
          sentiment: 'POSITIVE',
          campaignSource: 'Festive Showcase & Priority Consultation Drive',
          crmData: {
            phone: '+91 98201 44512',
            city: 'Mumbai / Bandra',
            totalSpend: '₹14,500',
            patientOrClientType: 'Priority Client',
            lastVisitDate: 'Oct 14, 2026',
            notes: 'Interested in priority package for festive season. Very responsive on WhatsApp.',
          },
          lastMessageText: 'Can I schedule a consultation session this Saturday around 11:30 AM?',
          unreadCount: 1,
        })
        .returning();

      await database.insert(inboxMessages).values([
        {
          conversationId: seedConv.id,
          channel: 'whatsapp',
          senderType: 'CUSTOMER',
          senderName: 'Ananya Mukherjee',
          content: 'Hello! I saw your festive campaign broadcast on WhatsApp. Is the priority consultation offer still active?',
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          conversationId: seedConv.id,
          channel: 'whatsapp',
          senderType: 'AI_BOT',
          senderName: 'KUIRO AI Co-Pilot',
          content: 'Namaste Ananya! 🙏 Yes, our festive priority offer is active through this month! We have reserved exclusive weekend slots. Would you prefer morning or afternoon?',
          createdAt: new Date(Date.now() - 3500000),
          aiGenerated: true,
        },
        {
          conversationId: seedConv.id,
          channel: 'whatsapp',
          senderType: 'CUSTOMER',
          senderName: 'Ananya Mukherjee',
          content: 'Can I schedule a consultation session this Saturday around 11:30 AM?',
          createdAt: new Date(Date.now() - 1800000),
        },
      ]);
    }

    // 3. Re-fetch all conversations for this workspace from Neon PostgreSQL
    convList = await database
      .select()
      .from(conversations)
      .where(eq(conversations.workspaceId, ws.id))
      .orderBy(desc(conversations.updatedAt));

    // 4. Fetch messages for each conversation and map to Conversation format
    const result = await Promise.all(
      convList.map(async (c) => {
        const msgs = await database
          .select()
          .from(inboxMessages)
          .where(eq(inboxMessages.conversationId, c.id))
          .orderBy(asc(inboxMessages.createdAt));

        return {
          id: c.id,
          workspaceId: c.workspaceId,
          customerName: c.customerName,
          customerHandle: c.customerHandle,
          customerAvatar: c.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          channel: c.channel.toLowerCase() as ConversationChannel,
          status: c.status as ConversationStatus,
          priority: c.priority as ConversationPriority,
          unreadCount: c.unreadCount,
          lastMessage: c.lastMessageText,
          lastMessageTime: 'Just now',
          assignedTo: c.assignedTo || 'agent-1',
          tags: c.tags,
          sentiment: (c.sentiment.toLowerCase() as 'positive' | 'neutral' | 'urgent') || 'neutral',
          campaignAttribution: {
            campaignName: c.campaignSource || 'Direct Inbound',
            triggerDate: c.createdAt.toISOString().slice(0, 10),
            channel: (c.channel.toLowerCase() as any),
          },
          crmData: {
            phone: c.crmData?.phone || c.customerHandle,
            email: c.crmData?.email,
            city: c.crmData?.city || 'Mumbai',
            totalSpend: c.crmData?.totalSpend || '₹14,500',
            patientOrClientType: c.crmData?.patientOrClientType || 'Family Health Plan',
            lastVisitDate: c.crmData?.lastVisitDate || 'Recent',
            notes: c.crmData?.notes || 'Customer inquiry via KUIRO Omni-Channel Inbox',
          },
          messages: msgs.map((m) => ({
            id: m.id,
            conversationId: m.conversationId,
            channel: m.channel as any,
            sender: (m.senderType === 'CUSTOMER' ? 'customer' : m.senderType === 'AI_BOT' ? 'ai_bot' : 'agent') as any,
            senderName: m.senderName || (m.senderType === 'CUSTOMER' ? c.customerName : 'KUIRO Agent'),
            content: m.content,
            timestamp: m.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isInternalNote: m.isInternalNote,
            status: 'sent' as const,
            aiGenerated: m.aiGenerated,
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      source: 'neon_postgres',
      count: result.length,
      conversations: result,
    });
  } catch (error: any) {
    console.error('[Inbox Conversations API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId') || searchParams.get('id');
    const workspaceIdParam = searchParams.get('workspaceId');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    const auth = await authorizeWorkspace(req, workspaceIdParam);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const database = db;
    if (!database) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
    }

    const wsId = auth.workspaceId!;

    // Verify conversation belongs to authorized workspace
    const [conv] = await database
      .select()
      .from(conversations)
      .where(and(
        eq(conversations.id, conversationId),
        eq(conversations.workspaceId, wsId)
      ))
      .limit(1);

    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found or does not belong to authorized workspace.' }, { status: 404 });
    }

    // Cascade delete messages and the conversation
    await database.delete(inboxMessages).where(eq(inboxMessages.conversationId, conversationId));
    await database.delete(conversations).where(and(
      eq(conversations.id, conversationId),
      eq(conversations.workspaceId, wsId)
    ));

    return NextResponse.json({
      success: true,
      message: 'Conversation and messages permanently deleted.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete conversation' }, { status: 500 });
  }
}
