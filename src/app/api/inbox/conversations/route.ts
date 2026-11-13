import { NextRequest, NextResponse } from 'next/server';
import { db, conversations, inboxMessages, workspaces, users } from '@/db';
import { desc, asc, eq } from 'drizzle-orm';
import { ConversationChannel, ConversationStatus, ConversationPriority } from '@/types';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const database = db;
    if (!database) {
      return NextResponse.json({
        success: true,
        source: 'mock',
        conversations: [],
      });
    }

    // Resolve scoped workspace from session or param
    const session = await getSessionFromRequest(req);
    const workspaceIdParam = req.nextUrl.searchParams.get('workspaceId');
    const targetWorkspaceId = workspaceIdParam || session?.workspace.id;

    let ws;
    if (targetWorkspaceId) {
      [ws] = await database.select().from(workspaces).where(eq(workspaces.id, targetWorkspaceId)).limit(1);
    }
    if (!ws) {
      [ws] = await database.select().from(workspaces).limit(1);
    }
    if (!ws) {
      let [u] = await database.select().from(users).limit(1);
      if (!u) {
        [u] = await database.insert(users).values({
          name: 'KUIRO Administrator',
          email: 'admin@kuiro.ai',
          emailVerified: true,
        }).returning();
      }
      [ws] = await database.insert(workspaces).values({
        name: 'Apex Diagnostic & Wellness Clinic',
        ownerId: u.id,
        subscriptionTier: 'GROWTH',
        whatsappAdminPhone: '+919876543210',
      }).returning();
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

    // A. Seed Instagram DM Lead (Emergency Lead)
    if (!hasInstagram) {
      const [igConv] = await database
        .insert(conversations)
        .values({
          workspaceId: ws.id,
          channel: 'instagram',
          customerName: 'Rohit Verma',
          customerHandle: '@rohit_fitlife',
          customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          status: 'OPEN',
          priority: 'URGENT',
          tags: ['Emergency Walk-In', 'Tooth Trauma', 'Urgent'],
          sentiment: 'URGENT',
          campaignSource: 'Instagram Reel: Sports Mouthguard Protection',
          crmData: {
            phone: '+91 97110 32890',
            email: 'rohit@fitlife.co',
            city: 'Delhi NCR / South Ext',
            totalSpend: '₹0 (New Lead)',
            patientOrClientType: 'Emergency New Patient',
            lastVisitDate: 'First Visit',
            notes: 'Acute anterior tooth fracture. Needs emergency aesthetic composite or crown.',
          },
          lastMessageText: 'Hey! I chipped my front tooth playing football an hour ago. Do you take emergency walk-ins today?',
          unreadCount: 1,
        })
        .returning();

      await database.insert(inboxMessages).values([
        {
          conversationId: igConv.id,
          channel: 'instagram',
          senderType: 'CUSTOMER',
          senderName: 'Rohit Verma',
          content: 'Hey! I chipped my front tooth playing football an hour ago. Do you take emergency walk-ins today?',
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          conversationId: igConv.id,
          channel: 'instagram',
          senderType: 'AI_BOT',
          senderName: 'KUIRO AI Co-Pilot',
          content: 'Hi Rohit! We are so sorry to hear that. Yes, we reserve immediate slots for dental emergencies. Please call our emergency triage desk immediately at +91 98301 24589 or come directly to our clinic before 1:00 PM. We have flagged Dr. Sharma!',
          createdAt: new Date(Date.now() - 3500000),
          aiGenerated: true,
        },
        {
          conversationId: igConv.id,
          channel: 'instagram',
          senderType: 'AGENT',
          senderName: 'Dr. Rajesh Sharma',
          content: 'Operatory 2 is prepped with aesthetic bonding composite.',
          isInternalNote: true,
          createdAt: new Date(Date.now() - 3400000),
        },
      ]);
    }

    // B. Seed Email Lead (B2B Corporate Wellness)
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
          tags: ['Corporate Plan', 'B2B Wellness', 'TCS Camp'],
          sentiment: 'POSITIVE',
          campaignSource: 'Corporate Dental Wellness Newsletter #42',
          crmData: {
            phone: '+91 98212 90812',
            email: 'meera.deshmukh@tcs.com',
            city: 'Mumbai / BKC',
            totalSpend: '₹85,000 (Corporate Account)',
            patientOrClientType: 'Corporate HR Director',
            lastVisitDate: 'Oct 28, 2026',
            notes: 'High value corporate account. Reviewed proposal for 450 employees.',
          },
          lastMessageText: 'Reviewed your corporate dental wellness proposal. Will discuss in committee this Thursday.',
          unreadCount: 0,
        })
        .returning();

      await database.insert(inboxMessages).values([
        {
          conversationId: emailConv.id,
          channel: 'email',
          senderType: 'CUSTOMER',
          senderName: 'Meera Deshmukh',
          content: 'Dear Dr. Sharma, We received your corporate wellness proposal for our 450 employees. We will discuss in committee this Thursday.',
          createdAt: new Date(Date.now() - 7200000),
        },
        {
          conversationId: emailConv.id,
          channel: 'email',
          senderType: 'AGENT',
          senderName: 'Dr. Rajesh Sharma',
          content: 'Thank you Meera! We look forward to partnering with TCS. Please let us know if you need customized package tiers for senior leaders.',
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
          tags: ['Diwali Promo', 'Invisalign', 'ClearAligners'],
          sentiment: 'POSITIVE',
          campaignSource: 'Holi Festive Smiles & Cosmetic Consultation Drive',
          crmData: {
            phone: '+91 98201 44512',
            city: 'Mumbai / Bandra',
            totalSpend: '₹14,500',
            patientOrClientType: 'Orthodontics Patient',
            lastVisitDate: 'Oct 14, 2026',
            notes: 'Interested in Invisalign invisible aligners for wedding in December. Very prompt on WhatsApp.',
          },
          lastMessageText: 'Can I schedule a consultation for Invisalign clear aligners this Saturday around 11:30 AM?',
          unreadCount: 1,
        })
        .returning();

      await database.insert(inboxMessages).values([
        {
          conversationId: seedConv.id,
          channel: 'whatsapp',
          senderType: 'CUSTOMER',
          senderName: 'Ananya Mukherjee',
          content: 'Hello! I saw your festive health campaign on WhatsApp about the cosmetic consultation offer. Is that still active?',
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          conversationId: seedConv.id,
          channel: 'whatsapp',
          senderType: 'AI_BOT',
          senderName: 'KUIRO AI Co-Pilot',
          content: 'Namaste Ananya! 🙏 Yes, our Festive Smile Consultation offer is valid till November 15! It includes a full 3D digital scan and consultation with Dr. Sharma. Would you like a weekday or weekend appointment?',
          createdAt: new Date(Date.now() - 3500000),
          aiGenerated: true,
        },
        {
          conversationId: seedConv.id,
          channel: 'whatsapp',
          senderType: 'CUSTOMER',
          senderName: 'Ananya Mukherjee',
          content: 'Can I schedule a consultation for Invisalign clear aligners this Saturday around 11:30 AM?',
          createdAt: new Date(Date.now() - 1800000),
        },
      ]);
    }

    // 3. Re-fetch all conversations from Neon PostgreSQL
    convList = await database
      .select()
      .from(conversations)
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
