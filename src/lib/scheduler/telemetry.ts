export interface SchedulerTelemetry {
  lastRunAt: string | null;
  lastAction: string | null;
  lastDurationMs: number;
  overdueAutoCommitted: number;
  campaignsGenerated: number;
  outboxRetried: number;
  tokenHealthWarnings: number;
}

let schedulerTelemetry: SchedulerTelemetry = {
  lastRunAt: null,
  lastAction: null,
  lastDurationMs: 0,
  overdueAutoCommitted: 0,
  campaignsGenerated: 0,
  outboxRetried: 0,
  tokenHealthWarnings: 0,
};

export function updateSchedulerTelemetry(update: Partial<SchedulerTelemetry>): SchedulerTelemetry {
  schedulerTelemetry = { ...schedulerTelemetry, ...update };
  return schedulerTelemetry;
}

export function getSchedulerTelemetry(): SchedulerTelemetry {
  return { ...schedulerTelemetry };
}
