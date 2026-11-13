import { NextRequest, NextResponse } from 'next/server';
import { db, culturalEventsCalendar, workspaces, scheduledCampaigns } from '@/db';
import { eq, and } from 'drizzle-orm';
import { createAutonomousCampaign } from '@/lib/campaigns/generator';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const database = db;
    if (!database) {
      return NextResponse.json({ success: false, error: 'Neon database not connected' }, { status: 500 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is okay
    }

    // 1. Calculate Target Date: user supplied or TODAY + 2 DAYS (T-48h radar)
    let targetDateStr = body.targetDate;
    if (!targetDateStr) {
      const target = new Date();
      target.setDate(target.getDate() + 2);
      targetDateStr = target.toISOString().split('T')[0];
    }

    // 2. Query Neon DB cultural calendar for target date
    let matchingEvents = await database
      .select()
      .from(culturalEventsCalendar)
      .where(eq(culturalEventsCalendar.eventDate, targetDateStr));

    // If 0 events match this exact date, pick the next earliest upcoming event
    if (matchingEvents.length === 0) {
      const allEvents = await database.select().from(culturalEventsCalendar);
      const today = new Date().toISOString().split('T')[0];
      const upcoming = allEvents
        .filter((e) => e.eventDate >= today)
        .sort((a, b) => a.eventDate.localeCompare(b.eventDate));

      if (upcoming.length > 0) {
        matchingEvents = [upcoming[0]];
      }
    }

    // 3. Query all active workspaces
    const activeWorkspaces = await database.select().from(workspaces);
    if (activeWorkspaces.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active workspaces found in Neon DB to generate campaigns for.',
      }, { status: 400 });
    }

    const createdCampaigns = [];

    // 4. Iterate workspaces and synthesize campaigns
    for (const ws of activeWorkspaces) {
      for (const event of matchingEvents) {
        // Prevent duplicate campaign for the same workspace & event on the same day
        const existing = await database
          .select()
          .from(scheduledCampaigns)
          .where(
            and(
              eq(scheduledCampaigns.workspaceId, ws.id),
              eq(scheduledCampaigns.topicSummary, event.eventName)
            )
          );

        if (existing.length === 0) {
          const res = await createAutonomousCampaign({
            workspaceId: ws.id,
            topic: event.eventName,
            triggerType: 'FESTIVAL',
            targetPublishAt: new Date(Date.now() + 48 * 3600 * 1000),
          });

          createdCampaigns.push({
            campaignId: res.campaign.id,
            workspaceId: ws.id,
            workspaceName: ws.name,
            eventName: event.eventName,
            eventDate: event.eventDate,
            postsCount: res.posts.length,
          });
        } else {
          createdCampaigns.push({
            campaignId: existing[0].id,
            workspaceId: ws.id,
            workspaceName: ws.name,
            eventName: event.eventName,
            eventDate: event.eventDate,
            status: 'ALREADY_EXISTS',
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      source: 'neon_postgres',
      scanDate: targetDateStr,
      eventsMatched: matchingEvents.map((e) => ({
        id: e.id,
        eventName: e.eventName,
        eventDate: e.eventDate,
        regions: e.regions,
      })),
      campaignsCreated: createdCampaigns,
      message: `Cultural radar scan complete. Evaluated ${matchingEvents.length} events across ${activeWorkspaces.length} workspaces.`,
    });
  } catch (error: any) {
    console.error('[Cron Trigger Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to trigger cron radar' },
      { status: 500 }
    );
  }
}

