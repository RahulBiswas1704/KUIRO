import { inngest } from '../client';
import { refreshExpiringTokens } from '@/lib/social/tokenRefresh';
import { executeWithIdempotency } from '@/lib/events/idempotency';

/**
 * ============================================================================
 * INNGEST TOKEN REFRESH DAILY CRON
 * ============================================================================
 * 
 * Schedule: Daily at 02:00 AM UTC (07:30 AM IST) - `0 2 * * *`
 * 
 * Single Scheduler Ownership:
 * Inngest is the authoritative owner for token health scans and proactive refresh.
 * Scans OAuth tokens across Meta, LinkedIn, and X expiring in <= 7 days.
 * Decrypts with AES-256-GCM, calls platform refresh endpoints, and writes new ciphertext.
 * Protected by idempotency key: `cron_token_refresh_{dateString}`.
 */
export const tokenRefreshCron = inngest.createFunction(
  {
    id: 'kuiro-token-refresh-daily-cron',
    retries: 2,
  },
  { cron: '0 2 * * *' },
  async ({ step }) => {
    const today = new Date().toISOString().split('T')[0];
    const idempotencyKey = `cron_token_refresh_${today}`;

    const summary = await step.run('refresh-expiring-tokens', async () => {
      const exec = await executeWithIdempotency(
        {
          idempotencyKey,
          eventType: 'cron.token_refresh',
          workspaceId: undefined,
          relatedEntityId: today,
        },
        async () => {
          return await refreshExpiringTokens({ thresholdDays: 7 });
        }
      );
      return exec;
    });

    return {
      success: true,
      scheduler: 'inngest',
      task: 'Token Refresh',
      executionDate: today,
      idempotencyKey,
      idempotent: summary.idempotent,
      summary: summary.result,
    };
  }
);
