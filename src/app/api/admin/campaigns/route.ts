import { NextRequest, NextResponse } from 'next/server';
import { db, scheduledCampaigns, platformPosts, workspaces, brandProfiles } from '@/db';
import { desc, eq } from 'drizzle-orm';
import { inngest } from '@/lib/inngest/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const database = db;
    if (!database) {
      return NextResponse.json({ success: true, count: 0, campaigns: [] });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const workspaceFilter = searchParams.get('workspaceId');

    const rawCampaigns = await database
      .select()
      .from(scheduledCampaigns)
      .orderBy(desc(scheduledCampaigns.createdAt));

    const [allPosts, allWs] = await Promise.all([
      database.select().from(platformPosts),
      database.select().from(workspaces),
    ]);

    const wsMap = new Map(allWs.map((w) => [w.id, w.name]));
    const postsByCamp = new Map<string, typeof allPosts>();

    for (const p of allPosts) {
      if (!postsByCamp.has(p.campaignId)) {
        postsByCamp.set(p.campaignId, []);
      }
      postsByCamp.get(p.campaignId)!.push(p);
    }

    const now = Date.now();
    let enriched = rawCampaigns.map((camp) => {
      const posts = postsByCamp.get(camp.id) || [];
      const publishTime = new Date(camp.publishAt).getTime();
      const remainingMs = Math.max(0, publishTime - now);
      const hoursRemaining = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

      const avgCriticScore = posts.length > 0
        ? Math.round(posts.reduce((acc, p) => acc + (p.aiCriticScore || 90), 0) / posts.length)
        : 90;

      return {
        ...camp,
        workspaceName: wsMap.get(camp.workspaceId) || 'Unknown Workspace',
        postsCount: posts.length,
        avgCriticScore,
        countdownFormatted: `${hoursRemaining}h ${minutesRemaining}m`,
        isExpired: remainingMs <= 0,
        posts: posts.map((p) => ({
          id: p.id,
          platform: p.platform,
          caption: p.captionText,
          firstComment: p.firstCommentText,
          emailSubject: p.emailSubject,
          aiCriticScore: p.aiCriticScore,
          mediaUrls: p.mediaUrls,
          aspectRatio: p.aspectRatio,
        })),
      };
    });

    if (statusFilter && statusFilter !== 'ALL') {
      enriched = enriched.filter((c) => c.status === statusFilter);
    }
    if (workspaceFilter) {
      enriched = enriched.filter((c) => c.workspaceId === workspaceFilter);
    }

    return NextResponse.json({
      success: true,
      count: enriched.length,
      campaigns: enriched,
    });
  } catch (error: any) {
    console.error('[API /api/admin/campaigns GET] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const database = db;
    if (!database) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const body = await req.json();
    const { id, status, revisionCount } = body;

    if (!id) {
      return NextResponse.json({ error: 'Campaign id is required' }, { status: 400 });
    }

    const [updated] = await database
      .update(scheduledCampaigns)
      .set({
        ...(status ? { status } : {}),
        ...(revisionCount !== undefined ? { revisionCount } : {}),
      })
      .where(eq(scheduledCampaigns.id, id))
      .returning();

    // If approved or paused, trigger notification event to Inngest
    if (status === 'APPROVED' || status === 'PAUSED') {
      try {
        await inngest.send({
          name: status === 'APPROVED' ? 'kuiro/campaign.approved' : 'kuiro/campaign.paused',
          data: {
            campaignId: id,
            action: status === 'APPROVED' ? 'FORCE_APPROVED' : 'EMERGENCY_PAUSE',
            by: 'Admin Panel Operator',
          },
        });
      } catch (ingErr) {
        console.warn('[Admin Inngest Dispatch Fallback]:', ingErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Campaign updated to ${status || 'new values'}.`,
      campaign: updated,
    });
  } catch (error: any) {
    console.error('[API /api/admin/campaigns PATCH] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const database = db;
    if (!database) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Campaign id is required' }, { status: 400 });
    }

    await database.delete(scheduledCampaigns).where(eq(scheduledCampaigns.id, id));

    return NextResponse.json({
      success: true,
      message: 'Campaign and platform posts removed.',
    });
  } catch (error: any) {
    console.error('[API /api/admin/campaigns DELETE] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}

