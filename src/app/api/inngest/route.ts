import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import {
  autopilot48hStateMachine,
  culturalCalendarDailyCron,
  tokenRefreshCron,
  subscriptionRenewalCron,
  cleanupRetentionCron,
} from '@/lib/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    autopilot48hStateMachine,
    culturalCalendarDailyCron,
    tokenRefreshCron,
    subscriptionRenewalCron,
    cleanupRetentionCron,
  ],
});
