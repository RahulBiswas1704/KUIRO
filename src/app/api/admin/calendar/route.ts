import { NextRequest, NextResponse } from 'next/server';
import { db, culturalEventsCalendar } from '@/db';
import { asc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const database = db;
    if (!database) {
      return NextResponse.json({ success: true, count: 0, events: [] });
    }

    const { searchParams } = new URL(req.url);
    const regionFilter = searchParams.get('region');
    const industryFilter = searchParams.get('industry');

    const rows = await database
      .select()
      .from(culturalEventsCalendar)
      .orderBy(asc(culturalEventsCalendar.eventDate));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let formatted = rows.map((row) => {
      const evDate = new Date(row.eventDate);
      evDate.setHours(0, 0, 0, 0);
      const diffTime = evDate.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...row,
        daysRemaining,
        isTriggerWindow: daysRemaining >= 0 && daysRemaining <= 2,
      };
    });

    if (regionFilter && regionFilter !== 'All') {
      formatted = formatted.filter((ev) =>
        ev.regions.includes('Pan-India') || ev.regions.includes(regionFilter)
      );
    }
    if (industryFilter && industryFilter !== 'All') {
      formatted = formatted.filter((ev) =>
        ev.targetIndustries.includes('All') || ev.targetIndustries.includes(industryFilter)
      );
    }

    return NextResponse.json({
      success: true,
      count: formatted.length,
      events: formatted,
    });
  } catch (error: any) {
    console.error('[API /api/admin/calendar GET] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const database = db;
    if (!database) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const body = await req.json();
    const { eventName, eventDate, regions, targetIndustries, promptContext } = body;

    if (!eventName || !eventDate || !promptContext) {
      return NextResponse.json(
        { error: 'Event name, event date (YYYY-MM-DD), and prompt context are required.' },
        { status: 400 }
      );
    }

    const cleanRegions = Array.isArray(regions) && regions.length > 0 ? regions : ['Pan-India'];
    const cleanIndustries = Array.isArray(targetIndustries) && targetIndustries.length > 0 ? targetIndustries : ['All'];

    const [newEvent] = await database
      .insert(culturalEventsCalendar)
      .values({
        eventName: eventName.trim(),
        eventDate: eventDate.trim(),
        regions: cleanRegions,
        targetIndustries: cleanIndustries,
        promptContext: promptContext.trim(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: `Cultural event "${newEvent.eventName}" added to calendar.`,
      event: newEvent,
    });
  } catch (error: any) {
    console.error('[API /api/admin/calendar POST] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to add calendar event' },
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
      return NextResponse.json({ error: 'Event id is required' }, { status: 400 });
    }

    await database.delete(culturalEventsCalendar).where(eq(culturalEventsCalendar.id, id));

    return NextResponse.json({
      success: true,
      message: 'Cultural event removed from calendar.',
    });
  } catch (error: any) {
    console.error('[API /api/admin/calendar DELETE] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
}
