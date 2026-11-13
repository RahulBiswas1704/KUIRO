import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { autopilot48hStateMachine } from '@/lib/inngest/functions/autopilot';
import { culturalCalendarDailyCron } from '@/lib/inngest/functions/cultural-calendar-cron';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [autopilot48hStateMachine, culturalCalendarDailyCron],
});
