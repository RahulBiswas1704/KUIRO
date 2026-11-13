import { NextRequest, NextResponse } from 'next/server';
import { db, culturalEventsCalendar } from '@/db';
import { sql as drizzleSql, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionFilter = searchParams.get('region');
    const industryFilter = searchParams.get('industry');
    const searchQuery = searchParams.get('search');

    if (!db) {
      return NextResponse.json({
        success: true,
        source: 'mock',
        events: [],
      });
    }

    const rows = await db
      .select()
      .from(culturalEventsCalendar)
      .orderBy(asc(culturalEventsCalendar.eventDate));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatted = rows
      .map((row) => {
        const evDate = new Date(row.eventDate);
        evDate.setHours(0, 0, 0, 0);

        const diffTime = evDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let status: 'TRIGGERED' | 'QUEUED' | 'UPCOMING' = 'UPCOMING';
        if (daysRemaining >= 0 && daysRemaining <= 2) {
          status = 'TRIGGERED';
        } else if (daysRemaining > 2 && daysRemaining <= 14) {
          status = 'QUEUED';
        }

        const dateFormatted = evDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });

        return {
          id: row.id,
          eventName: row.eventName,
          eventDate: row.eventDate,
          date: dateFormatted,
          daysRemaining,
          regions: row.regions,
          targetIndustries: row.targetIndustries,
          promptContext: row.promptContext,
          status,
        };
      })
      .filter((ev) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchesName = ev.eventName.toLowerCase().includes(q);
          const matchesContext = ev.promptContext.toLowerCase().includes(q);
          if (!matchesName && !matchesContext) return false;
        }

        if (regionFilter && regionFilter !== 'all') {
          const hasRegion = ev.regions.some((r) =>
            r.toLowerCase().includes(regionFilter.toLowerCase())
          );
          if (!hasRegion) return false;
        }

        if (industryFilter && industryFilter !== 'all') {
          const hasInd = ev.targetIndustries.some(
            (ind) =>
              ind.toLowerCase() === 'all' ||
              ind.toLowerCase().includes(industryFilter.toLowerCase())
          );
          if (!hasInd) return false;
        }

        return true;
      });

    return NextResponse.json({
      success: true,
      source: 'neon_postgres',
      totalMilestonesInNeon: rows.length,
      filteredCount: formatted.length,
      events: formatted,
    });
  } catch (error: any) {
    console.error('[Calendar Events GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventName, eventDate, regions = ['Pan-India'], targetIndustries = ['All'], promptContext } = body;

    if (!eventName || !eventDate || !promptContext) {
      return NextResponse.json(
        { success: false, error: 'eventName, eventDate, and promptContext are required.' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Neon database not connected' },
        { status: 500 }
      );
    }

    const [created] = await db
      .insert(culturalEventsCalendar)
      .values({
        eventName,
        eventDate,
        regions,
        targetIndustries,
        promptContext,
      })
      .returning();

    return NextResponse.json({
      success: true,
      source: 'neon_postgres',
      message: `Event "${eventName}" saved permanently to Neon PostgreSQL!`,
      event: created,
    });
  } catch (error: any) {
    console.error('[Calendar Events POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}
