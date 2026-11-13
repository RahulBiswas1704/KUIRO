import { NextResponse } from 'next/server';
import { db, conversations, inboxMessages, workspaces, users } from '@/db';
import { desc, asc, eq } from 'drizzle-orm';
import { ConversationChannel, ConversationStatus, ConversationPriority } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({
        success: true,
        source: 'mock',
        conversations: [],
      });
    }

    // 1. Fetch conversations from Neon PostgreSQL
    let convList = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.updatedAt));

    // If database has no conversations yet, create an initial welcome conversation
    if (convList.length === 0) {
      let [ws] = await db.select().from(workspaces).limit(1);
      if (!ws) {
        let [u] = await db.select().from(users).limit(1);
        if (!u) {
          [u] = await db.insert(users).values({
            name: 'KUIRO Administrator',
            email: 'admin@kuiro.ai',
            emailVerified: true,
          }).returning();
        }
        [ws] = await db.insert(workspaces).values({
          name: 'Apex Diagnostic & Wellness Clinic',
          ownerId: u.id,
          subscriptionTier: 'GROWTH',
          whatsappAdminPhone: '+919876543210',
        }).returning();
      }

      // Create welcome seed conversation
      const [seedConv] = await db
        .insert(conversations)
        .values({
          workspaceId: ws.id,
          channel: 'whatsapp',
          customerName: 'Ananya Deshmukh',
          customerHandle: '+91 98201 44512',
          customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          status: 'OPEN',
          priority: 'HIGH',
          tags: ['Diwali Promo', 'Full Body Checkup'],
          sentiment: 'POSITIVE',
          campaignSource: 'Diwali Preventive Health Camp 2026',
          crmData: {
            phone: '+91 98201 44512',
            city: 'Mumbai',
            totalSpend: '₹14,500',
            patientOrClientType: 'Family Health Plan',
            lastVisitDate: 'Oct 14, 2026',
            notes: 'High intent patient. Fast-track appointment booking.',
          },
          lastMessageText: 'Can I get the 20% discount on the comprehensive cardiac panel this Saturday?',
          unreadCount: 1,
        })
        .returning();

      // Add messages
      await db.insert(inboxMessages).values([
        {
          conversationId: seedConv.id,
          channel: 'whatsapp',
          senderType: 'CUSTOMER',
          senderName: 'Ananya Deshmukh',
          content: 'Hello! I saw your Diwali health campaign post on WhatsApp.',
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          conversationId: seedConv.id,
          channel: 'whatsapp',
          senderType: 'CUSTOMER',
          senderName: 'Ananya Deshmukh',
          content: 'Can I get the 20% discount on the comprehensive cardiac panel this Saturday?',
          createdAt: new Date(Date.now() - 1800000),
        },
      ]);

      convList = [seedConv];
    }

    // 2. Fetch messages for each conversation and map to Conversation format
    const result = await Promise.all(
      convList.map(async (c) => {
        const msgs = await db!
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
            sender: (m.senderType === 'CUSTOMER' ? 'customer' : 'agent') as any,
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
