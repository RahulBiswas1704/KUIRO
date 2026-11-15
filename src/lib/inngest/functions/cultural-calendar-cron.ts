import { inngest } from '../client';
import { db, culturalEventsCalendar, workspaces, scheduledCampaigns } from '@/db';
import { eq, and } from 'drizzle-orm';
import { INDIAN_CULTURAL_RADAR_SEED } from '@/db/seed';
import { createAutonomousCampaign } from '@/lib/campaigns/generator';
import { executeWithIdempotency } from '@/lib/events/idempotency';

/**
 * ============================================================================
 * INNGEST CULTURAL CALENDAR DAILY CRON
 * ============================================================================
 * 
 * Schedule: Daily at 04:00 AM UTC (09:30 AM IST) - `0 4 * * *`
 * 
 * Single Scheduler Ownership:
 * Inngest is the AUTHORITATIVE OWNER of Cultural Calendar Scanning and Campaign Generation.
 * 1. Checks if TODAY + 2 DAYS (T-48h) matches any Indian regional festivals or industry milestones.
 * 2. Iterates all active workspaces in Neon PostgreSQL.
 * 3. Protected by unique constraints and distributed idempotency (`executeWithIdempotency`).
 * 4. Triggers multi-channel campaign synthesis and enqueues into the 48-hour autopilot state machine.
 */
export const culturalCalendarDailyCron = inngest.createFunction(
  {
    id: 'kuiro-cultural-radar-daily-cron',
    retries: 2,
    concurrency: { limit: 5 },
  },
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

    // 5. Autonomously generate and queue 48h campaigns with Idempotency Protection
    const queuedCampaigns = await step.run('synthesize-and-queue-campaigns', async () => {
      const created = [];
      const database = db;
      if (!database || activeWorkspaces.length === 0) return [];

      for (const ws of activeWorkspaces) {
        // A. Trigger Festival Milestones
        for (const event of upcomingEvents) {
          const eventSlug = event.eventName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
          const idempotencyKey = `cron_cultural_${ws.id}_${dateString}_${eventSlug}`;

          try {
            const exec = await executeWithIdempotency(
              {
                idempotencyKey,
                eventType: 'cron.cultural_campaign_generate',
                workspaceId: ws.id,
                relatedEntityId: (event as any).id || eventSlug,
              },
              async () => {
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

                if (existing.length > 0) {
                  return {
                    campaignId: existing[0].id,
                    workspaceId: ws.id,
                    topic: event.eventName,
                    type: 'FESTIVAL',
                    status: 'ALREADY_EXISTS',
                  };
                }

                const res = await createAutonomousCampaign({
                  workspaceId: ws.id,
                  topic: event.eventName,
                  triggerType: 'FESTIVAL',
                  targetPublishAt: new Date(Date.now() + 48 * 3600 * 1000),
                });

                return {
                  campaignId: res.campaign.id,
                  workspaceId: ws.id,
                  topic: event.eventName,
                  type: 'FESTIVAL',
                  status: 'CREATED',
                };
              }
            );

            created.push(exec.result);
          } catch (genErr) {
            console.error(`[Cron Generation Error for ${ws.name}]:`, genErr);
          }
        }

        // B. Trigger Weekly Evergreen Pillar if no festival exists
        if (upcomingEvents.length === 0 && evergreenPillar) {
          const pillarSlug = evergreenPillar.toLowerCase().replace(/[^a-z0-9]+/g, '_');
          const idempotencyKey = `cron_evergreen_${ws.id}_${dateString}_${pillarSlug}`;

          try {
            const exec = await executeWithIdempotency(
              {
                idempotencyKey,
                eventType: 'cron.evergreen_campaign_generate',
                workspaceId: ws.id,
                relatedEntityId: pillarSlug,
              },
              async () => {
                const existing = await database
                  .select()
                  .from(scheduledCampaigns)
                  .where(
                    and(
                      eq(scheduledCampaigns.workspaceId, ws.id),
                      eq(scheduledCampaigns.topicSummary, evergreenPillar)
                    )
                  );

                if (existing.length > 0) {
                  return {
                    campaignId: existing[0].id,
                    workspaceId: ws.id,
                    topic: evergreenPillar,
                    type: 'EVERGREEN',
                    status: 'ALREADY_EXISTS',
                  };
                }

                const res = await createAutonomousCampaign({
                  workspaceId: ws.id,
                  topic: evergreenPillar,
                  triggerType: 'EVERGREEN',
                  targetPublishAt: new Date(Date.now() + 48 * 3600 * 1000),
                });

                return {
                  campaignId: res.campaign.id,
                  workspaceId: ws.id,
                  topic: evergreenPillar,
                  type: 'EVERGREEN',
                  status: 'CREATED',
                };
              }
            );

            created.push(exec.result);
          } catch (genErr) {
            console.error(`[Cron Evergreen Generation Error for ${ws.name}]:`, genErr);
          }
        }
      }

      return created;
    });

    return {
      success: true,
      scheduler: 'inngest',
      task: 'Cultural calendar scan',
      dateChecked: dateString,
      eventsFound: upcomingEvents.length,
      workspacesProcessed: activeWorkspaces.length,
      campaignsCreated: queuedCampaigns.length,
      queuedCampaigns,
    };
  }
);
