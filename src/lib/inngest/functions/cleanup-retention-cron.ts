import { inngest } from '../client';
import { db, sessions, scheduledCampaigns, durableEvents } from '@/db';
import { lte, and, eq, inArray } from 'drizzle-orm';
import { executeWithIdempotency } from '@/lib/events/idempotency';

/**
 * ============================================================================
 * INNGEST CLEANUP & RETENTION SCHEDULED CRON
 * ============================================================================
 * 
 * Schedule: Weekly on Sunday at 01:00 AM UTC (06:30 AM IST) - `0 1 * * 0`
 * 
 * Single Scheduler Ownership:
 * Inngest is the authoritative owner for database cleanup and retention routines.
 * 1. Purges expired sessions (`expires_at < NOW()`).
 * 2. Reaps stale in-flight publish locks (`status = 'PUBLISHING'` and `lock_acquired_at < NOW() - 2 hours`).
 * 3. Purges completed / exhausted durable events older than 30 days retention.
 * Protected by idempotency key: `cron_cleanup_retention_{weekDateString}`.
 */
export const cleanupRetentionCron = inngest.createFunction(
  {
    id: 'kuiro-cleanup-retention-cron',
    retries: 2,
  },
  { cron: '0 1 * * 0' },
  async ({ step }) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const idempotencyKey = `cron_cleanup_retention_${today}`;

    const cleanupSummary = await step.run('purge-expired-and-stale-records', async () => {
      const exec = await executeWithIdempotency(
        {
          idempotencyKey,
          eventType: 'cron.cleanup_retention',
          workspaceId: undefined,
          relatedEntityId: today,
        },
        async () => {
          const database = db;
          if (!database) {
            return { sessionsPurged: 0, staleLocksReaped: 0, eventsPurged: 0 };
          }

          // 1. Purge expired user sessions
          let sessionsPurged = 0;
          try {
            const deletedSessions = await database
              .delete(sessions)
              .where(lte(sessions.expiresAt, now))
              .returning({ id: sessions.id });
            sessionsPurged = deletedSessions.length;
          } catch (err) {
            console.warn('[Cleanup Cron] Sessions purge error:', err);
          }

          // 2. Reap stale publish locks in scheduledCampaigns older than 2 hours
          let staleLocksReaped = 0;
          try {
            const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
            const reaped = await database
              .update(scheduledCampaigns)
              .set({
                status: 'FAILED',
                failureReason: 'PUBLISH_LOCK_TIMEOUT_AUTO_REAPED',
                updatedAt: now,
              })
              .where(
                and(
                  eq(scheduledCampaigns.status, 'PUBLISHING'),
                  lte(scheduledCampaigns.lockAcquiredAt, twoHoursAgo)
                )
              )
              .returning({ id: scheduledCampaigns.id });
            staleLocksReaped = reaped.length;
          } catch (err) {
            console.warn('[Cleanup Cron] Stale lock reap error:', err);
          }

          // 3. Purge completed / exhausted durable events older than 30 days
          let eventsPurged = 0;
          try {
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const deletedEvents = await database
              .delete(durableEvents)
              .where(
                and(
                  inArray(durableEvents.status, ['COMPLETED', 'EXHAUSTED']),
                  lte(durableEvents.updatedAt, thirtyDaysAgo)
                )
              )
              .returning({ id: durableEvents.id });
            eventsPurged = deletedEvents.length;
          } catch (err) {
            console.warn('[Cleanup Cron] Durable events purge error:', err);
          }

          return { sessionsPurged, staleLocksReaped, eventsPurged };
        }
      );

      return exec;
    });

    return {
      success: true,
      scheduler: 'inngest',
      task: 'Cleanup and retention',
      executionDate: today,
      idempotencyKey,
      idempotent: cleanupSummary.idempotent,
      summary: cleanupSummary.result,
    };
  }
);
