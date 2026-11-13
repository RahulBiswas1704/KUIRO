import { inngest } from '../client';
import { db, culturalEventsCalendar, workspaces, scheduledCampaigns } from '@/db';
import { eq, and } from 'drizzle-orm';
import { INDIAN_CULTURAL_RADAR_SEED } from '@/db/seed';
import { createAutonomousCampaign } from '@/lib/campaigns/generator';

/**
 * 365-Day Cultural & Regional Calendar Trigger Cron
 * Runs daily at 04:00 AM UTC (09:30 AM IST).
 * 
 * Logic:
 * 1. Checks if TODAY + 2 DAYS matches any Indian regional festivals or industry milestones.
 * 2. Iterates all active workspaces in Neon PostgreSQL.
 * 3. Dynamically generates 5-platform payloads via Gemini 3.5 Flash Lite and stores into Neon DB.
 * 4. Dispatches the 48-Hour Auto-Commit state machine for each campaign.
 */
export const culturalCalendarDailyCron = inngest.createFunction(
  { id: 'kuiro-cultural-radar-daily-cron' },
  { cron: '0 4 * * *' },
  async ({ step }) => {
    // 1. Calculate Target Date = TODAY + 2 DAYS (T-48 Hours)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
    const dateString = targetDate.toISOString().split('T')[0];

    // 2. Query Calendar Events for Target Date from Neon DB
    const upcomingEvents = await step.run('query-upcoming-cultural-events', async () => {
      const database = db;
      if (database) {
        try {
          const events = await database
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

    // 3. Determine Weekly Evergreen Theme if no festival matches
    const dayOfWeek = targetDate.getDay(); // 0 = Sun, 1 = Mon, 3 = Wed, 5 = Fri
    let evergreenPillar: string | null = null;
    if (dayOfWeek === 1) evergreenPillar = 'Preventative Care & Weekly Health Audit Checklist';
    if (dayOfWeek === 3) evergreenPillar = 'Special Clinical Treatment Spotlight & Priority Care Packages';
    if (dayOfWeek === 5) evergreenPillar = 'Patient Success Story & Community Wellness Tips';

    // 4. Query all active workspaces in Neon DB
    const activeWorkspaces = await step.run('fetch-active-workspaces', async () => {
      const database = db;
      if (!database) return [];
      return await database.select().from(workspaces);
    });

    // 5. Autonomously generate and queue 48h campaigns
    const queuedCampaigns = await step.run('synthesize-and-queue-campaigns', async () => {
      const created = [];
      const database = db;
      if (!database || activeWorkspaces.length === 0) return [];

      for (const ws of activeWorkspaces) {
        // A. Trigger Festival Milestones
        for (const event of upcomingEvents) {
          // Check if campaign already exists for this event and workspace
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
            try {
              const res = await createAutonomousCampaign({
                workspaceId: ws.id,
                topic: event.eventName,
                triggerType: 'FESTIVAL',
                targetPublishAt: new Date(Date.now() + 48 * 3600 * 1000),
              });
              created.push({
                campaignId: res.campaign.id,
                workspaceId: ws.id,
                topic: event.eventName,
                type: 'FESTIVAL',
              });
            } catch (genErr) {
              console.error(`[Cron Generation Error for ${ws.name}]:`, genErr);
            }
          }
        }

        // B. Trigger Weekly Evergreen Pillar if no festival exists
        if (upcomingEvents.length === 0 && evergreenPillar) {
          const existing = await database
            .select()
            .from(scheduledCampaigns)
            .where(
              and(
                eq(scheduledCampaigns.workspaceId, ws.id),
                eq(scheduledCampaigns.topicSummary, evergreenPillar)
              )
            );

          if (existing.length === 0) {
            try {
              const res = await createAutonomousCampaign({
                workspaceId: ws.id,
                topic: evergreenPillar,
                triggerType: 'EVERGREEN',
                targetPublishAt: new Date(Date.now() + 48 * 3600 * 1000),
              });
              created.push({
                campaignId: res.campaign.id,
                workspaceId: ws.id,
                topic: evergreenPillar,
                type: 'EVERGREEN',
              });
            } catch (genErr) {
              console.error(`[Cron Evergreen Generation Error for ${ws.name}]:`, genErr);
            }
          }
        }
      }

      return created;
    });

    return {
      success: true,
      dateChecked: dateString,
      eventsFound: upcomingEvents.length,
      workspacesProcessed: activeWorkspaces.length,
      campaignsCreated: queuedCampaigns.length,
      queuedCampaigns,
    };
  }
);
