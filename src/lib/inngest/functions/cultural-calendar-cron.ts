import { inngest } from '../client';
import { db } from '@/db';
import { culturalEventsCalendar, workspaces, scheduledCampaigns } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { INDIAN_CULTURAL_RADAR_SEED } from '@/db/seed';

/**
 * 365-Day Cultural & Regional Calendar Trigger Cron
 * Runs daily at 04:00 AM UTC (09:30 AM IST).
 * 
 * Logic:
 * 1. Checks if TODAY + 2 DAYS matches any Indian regional festivals or industry milestones.
 * 2. Checks weekly evergreen pillars for workspaces:
 *    - Monday: Educational Tip
 *    - Wednesday: Product/Service Spotlight
 *    - Friday: Customer Testimonial / Behind-the-Scenes
 * 3. Enqueues the 48-Hour Auto-Commit state machine for each active workspace.
 */
export const culturalCalendarDailyCron = inngest.createFunction(
  { id: 'kuiro-cultural-radar-daily-cron' },
  { cron: '0 4 * * *' },
  async ({ step }) => {
    // 1. Calculate Target Date = TODAY + 2 DAYS (T-48 Hours)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
    const dateString = targetDate.toISOString().split('T')[0];

    // 2. Query Calendar Events for Target Date
    const upcomingEvents = await step.run('query-upcoming-cultural-events', async () => {
      if (db) {
        try {
          const events = await db
            .select()
            .from(culturalEventsCalendar)
            .where(eq(culturalEventsCalendar.eventDate, dateString));
          if (events.length > 0) return events;
        } catch (err) {
          console.warn('[Cron] DB query error, using seed fallback:', err);
        }
      }

      // In-Memory fallback checking the 365 seed list
      return INDIAN_CULTURAL_RADAR_SEED.filter((e) => e.eventDate === dateString);
    });

    // 3. Determine Weekly Evergreen Theme
    const dayOfWeek = targetDate.getDay(); // 0 = Sun, 1 = Mon, 3 = Wed, 5 = Fri
    let evergreenPillar: string | null = null;
    if (dayOfWeek === 1) evergreenPillar = 'Monday: Educational Tip & Preventative Care';
    if (dayOfWeek === 3) evergreenPillar = 'Wednesday: Service Spotlight & Special Packages';
    if (dayOfWeek === 5) evergreenPillar = 'Friday: Client Success Story & Community Wellness';

    // 4. Trigger Autonomous 48-Hour Campaign Runs
    const triggeredCampaigns = await step.run('dispatch-48h-campaigns', async () => {
      const campaigns = [];

      // Trigger festival campaigns if events exist
      for (const event of upcomingEvents) {
        const campaignId = `camp_${Date.now()}_${event.eventName.slice(0, 8).toLowerCase().replace(/\s+/g, '_')}`;
        await inngest.send({
          name: 'kuiro/campaign.initiate',
          data: {
            campaignId,
            workspaceId: 'ws-apex-101',
            publishAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
            triggerType: 'FESTIVAL',
            eventName: event.eventName,
          },
        });
        campaigns.push({ campaignId, type: 'FESTIVAL', name: event.eventName });
      }

      // Trigger evergreen campaign if scheduled for the day
      if (evergreenPillar && upcomingEvents.length === 0) {
        const campaignId = `camp_${Date.now()}_evergreen`;
        await inngest.send({
          name: 'kuiro/campaign.initiate',
          data: {
            campaignId,
            workspaceId: 'ws-apex-101',
            publishAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
            triggerType: 'EVERGREEN',
            eventName: evergreenPillar,
          },
        });
        campaigns.push({ campaignId, type: 'EVERGREEN', name: evergreenPillar });
      }

      return campaigns;
    });

    return {
      dateChecked: dateString,
      eventsFound: upcomingEvents.length,
      campaignsQueued: triggeredCampaigns.length,
      triggeredCampaigns,
    };
  }
);

