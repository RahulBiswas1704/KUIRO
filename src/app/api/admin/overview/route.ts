import { NextRequest, NextResponse } from 'next/server';
import { db, users, workspaces, brandProfiles, scheduledCampaigns, platformPosts, conversations, inboxMessages, culturalEventsCalendar, sessions } from '@/db';
import { desc, sql as drizzleSql } from 'drizzle-orm';
import { verifyManagementAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyManagementAuth(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Access Denied: KUIRO Executive Management Clearance Required.' },
        { status: 403 }
      );
    }
    const database = db;
    if (!database) {
      return NextResponse.json({
        success: true,
        source: 'mock',
        metrics: {
          users: 4,
          workspaces: 11,
          brandProfiles: 8,
          campaigns: 11,
          platformPosts: 55,
          conversations: 3,
          messages: 7,
          calendarEvents: 35,
          activeSessions: 2,
        },
        health: {
          database: { status: 'DEGRADED', latencyMs: 0 },
          geminiAi: { status: 'OPERATIONAL' },
          whatsappCloud: { status: 'CONFIGURED' },
          inngestEngine: { status: 'OPERATIONAL' },
          cloudflareR2: { status: 'CONFIGURED' },
          resendEmail: { status: 'CONFIGURED' },
        },
        recentActivities: [],
      });
    }

    // 1. Measure live DB latency
    const startDb = Date.now();
    await database.execute(drizzleSql`SELECT 1`);
    const latencyMs = Date.now() - startDb;

    // 2. Query counts in parallel
    const [
      usersCount,
      workspacesCount,
      brandProfilesCount,
      campaignsCount,
      postsCount,
      conversationsCount,
      messagesCount,
      calendarCount,
      sessionsCount,
    ] = await Promise.all([
      database.select({ count: drizzleSql<number>`count(*)::int` }).from(users),
      database.select({ count: drizzleSql<number>`count(*)::int` }).from(workspaces),
      database.select({ count: drizzleSql<number>`count(*)::int` }).from(brandProfiles),
      database.select({ count: drizzleSql<number>`count(*)::int` }).from(scheduledCampaigns),
      database.select({ count: drizzleSql<number>`count(*)::int` }).from(platformPosts),
      database.select({ count: drizzleSql<number>`count(*)::int` }).from(conversations),
      database.select({ count: drizzleSql<number>`count(*)::int` }).from(inboxMessages),
      database.select({ count: drizzleSql<number>`count(*)::int` }).from(culturalEventsCalendar),
      database.select({ count: drizzleSql<number>`count(*)::int` }).from(sessions),
    ]);

    // 3. Query recent campaigns and conversations for the activity feed
    const [recentCampaigns, recentConvs, recentUsers] = await Promise.all([
      database
        .select({
          id: scheduledCampaigns.id,
          topic: scheduledCampaigns.topicSummary,
          status: scheduledCampaigns.status,
          createdAt: scheduledCampaigns.createdAt,
          workspaceId: scheduledCampaigns.workspaceId,
        })
        .from(scheduledCampaigns)
        .orderBy(desc(scheduledCampaigns.createdAt))
        .limit(6),

      database
        .select({
          id: conversations.id,
          channel: conversations.channel,
          customerName: conversations.customerName,
          lastMessage: conversations.lastMessageText,
          updatedAt: conversations.updatedAt,
        })
        .from(conversations)
        .orderBy(desc(conversations.updatedAt))
        .limit(6),

      database
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(6),
    ]);

    // Aggregate into unified chronologic activity feed
    const activities = [
      ...recentCampaigns.map((c) => ({
        id: `act_camp_${c.id}`,
        type: 'CAMPAIGN',
        title: `Campaign Created: ${c.topic}`,
        subtitle: `Status: ${c.status}`,
        timestamp: c.createdAt,
        badgeColor: c.status === 'PUBLISHED' ? 'emerald' : c.status === 'AUTO_QUEUED' ? 'amber' : 'blue',
      })),
      ...recentConvs.map((cv) => ({
        id: `act_conv_${cv.id}`,
        type: 'INBOX',
        title: `Inbound ${cv.channel.toUpperCase()} Lead: ${cv.customerName}`,
        subtitle: cv.lastMessage || 'New message waiting in queue',
        timestamp: cv.updatedAt,
        badgeColor: 'emerald',
      })),
      ...recentUsers.map((u) => ({
        id: `act_usr_${u.id}`,
        type: 'USER',
        title: `User Provisioned: ${u.name}`,
        subtitle: `${u.email} (${u.role || 'Founder'})`,
        timestamp: u.createdAt,
        badgeColor: 'purple',
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    return NextResponse.json({
      success: true,
      metrics: {
        users: usersCount[0]?.count || 0,
        workspaces: workspacesCount[0]?.count || 0,
        brandProfiles: brandProfilesCount[0]?.count || 0,
        campaigns: campaignsCount[0]?.count || 0,
        platformPosts: postsCount[0]?.count || 0,
        conversations: conversationsCount[0]?.count || 0,
        messages: messagesCount[0]?.count || 0,
        calendarEvents: calendarCount[0]?.count || 0,
        activeSessions: sessionsCount[0]?.count || 0,
      },
      health: {
        database: {
          status: 'HEALTHY',
          branch: 'production',
          engine: 'PostgreSQL 18.7 (Neon Serverless)',
          latencyMs,
        },
        geminiAi: {
          status: process.env.GEMINI_API_KEY ? 'OPERATIONAL' : 'KEY_MISSING',
          model: 'Gemini 3.5 Flash Lite + Flash 2.5',
        },
        whatsappCloud: {
          status: process.env.WHATSAPP_PHONE_NUMBER_ID ? 'OPERATIONAL' : 'UNCONFIGURED',
          graphApiVersion: 'v21.0',
          phoneId: process.env.WHATSAPP_PHONE_NUMBER_ID || '1528322460354543',
        },
        inngestEngine: {
          status: process.env.INNGEST_EVENT_KEY ? 'OPERATIONAL' : 'KEY_MISSING',
          scheduler: '48h Durable Loop Active',
        },
        cloudflareR2: {
          status: process.env.R2_BUCKET_NAME ? 'OPERATIONAL' : 'FALLBACK_LOCAL',
          bucket: process.env.R2_BUCKET_NAME || 'kuiro-media',
        },
        resendEmail: {
          status: process.env.RESEND_API_KEY ? 'OPERATIONAL' : 'KEY_MISSING',
          from: process.env.RESEND_FROM_EMAIL || 'KUIRO Updates <onboarding@resend.dev>',
        },
      },
      recentActivities: activities,
    });
  } catch (error: any) {
    console.error('[API /api/admin/overview] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load admin telemetry' },
      { status: 500 }
    );
  }
}

