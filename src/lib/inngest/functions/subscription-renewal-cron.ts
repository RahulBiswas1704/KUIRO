import { inngest } from '../client';
import { db, subscriptions, workspaces } from '@/db';
import { and, inArray, lte, eq } from 'drizzle-orm';
import { executeWithIdempotency } from '@/lib/events/idempotency';

/**
 * ============================================================================
 * INNGEST SUBSCRIPTION RENEWAL DAILY CRON
 * ============================================================================
 * 
 * Schedule: Daily at 03:00 AM UTC (08:30 AM IST) - `0 3 * * *`
 * 
 * Single Scheduler Ownership:
 * Inngest is the authoritative owner for subscription audits and renewals.
 * Queries active and past-due subscriptions where currentPeriodEnd has lapsed.
 * Manages grace period (up to 7 days past due) and automatic status transitions.
 * Protected by idempotency key: `cron_sub_renewal_{sub.id}_{dateString}`.
 */
export const subscriptionRenewalCron = inngest.createFunction(
  {
    id: 'kuiro-subscription-renewal-daily-cron',
    retries: 2,
  },
  { cron: '0 3 * * *' },
  async ({ step }) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const auditResult = await step.run('audit-subscriptions-status', async () => {
      const database = db;
      if (!database) {
        return { audited: 0, updated: 0, actions: [] };
      }

      // Query active or past_due subscriptions where currentPeriodEnd has passed
      const expiringSubs = await database
        .select()
        .from(subscriptions)
        .where(
          and(
            inArray(subscriptions.status, ['ACTIVE', 'PAST_DUE']),
            lte(subscriptions.currentPeriodEnd, now)
          )
        );

      const actions: Array<{
        subscriptionId: string;
        workspaceId: string;
        oldStatus: string;
        newStatus: string;
        reason: string;
      }> = [];

      for (const sub of expiringSubs) {
        const subKey = `cron_sub_renewal_${sub.id}_${today}`;
        await executeWithIdempotency(
          {
            idempotencyKey: subKey,
            eventType: 'cron.subscription_renewal',
            workspaceId: sub.workspaceId,
            relatedEntityId: sub.id,
          },
          async () => {
            const daysOverdue = Math.floor(
              (now.getTime() - new Date(sub.currentPeriodEnd).getTime()) / (1000 * 60 * 60 * 24)
            );

            let newStatus: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' = sub.status as any;
            let reason = '';

            if (daysOverdue > 7) {
              newStatus = 'CANCELLED';
              reason = `Subscription cancelled after ${daysOverdue} days overdue (exceeded 7-day cutoff)`;
            } else if (daysOverdue > 0 && sub.status === 'ACTIVE') {
              newStatus = 'PAST_DUE';
              reason = `Subscription marked PAST_DUE (${daysOverdue} days overdue, in 7-day grace period)`;
            }

            if (newStatus !== sub.status) {
              await database
                .update(subscriptions)
                .set({ status: newStatus, updatedAt: now })
                .where(eq(subscriptions.id, sub.id));

              // If cancelled, reset workspace tier
              if (newStatus === 'CANCELLED') {
                await database
                  .update(workspaces)
                  .set({ subscriptionTier: 'STARTER', updatedAt: now })
                  .where(eq(workspaces.id, sub.workspaceId));
              }

              actions.push({
                subscriptionId: sub.id,
                workspaceId: sub.workspaceId,
                oldStatus: sub.status,
                newStatus,
                reason,
              });
            }

            return { newStatus, reason };
          }
        );
      }

      return {
        audited: expiringSubs.length,
        updated: actions.length,
        actions,
      };
    });

    return {
      success: true,
      scheduler: 'inngest',
      task: 'Subscription Renewal Checks',
      executionDate: today,
      auditResult,
    };
  }
);
