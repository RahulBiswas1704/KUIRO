/**
 * ============================================================================
 * KUIRO MONITORING & METRICS TELEMETRY ENGINE
 * ============================================================================
 * 
 * Tracks operational health across the 10 vital SaaS dimensions:
 * 1. Authentication (failed logins, suspicious activity)
 * 2. API (error rates, latency)
 * 3. Database (query failures, pool connection status)
 * 4. Inngest / Schedulers (failed, delayed, retried jobs)
 * 5. Social APIs (token errors, publishing failures per platform)
 * 6. WhatsApp (webhook signature rejections, delivery errors)
 * 7. Payments (webhook signature mismatches, subscription mismatches)
 * 8. AI (token consumption, cost, timeouts, critic rejects)
 * 9. Storage (upload failures, missing objects)
 * 10. Inbox (message processing and delivery delays)
 */

export interface MetricDataPoint {
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string>;
}

class MetricsTelemetryManager {
  private dataPoints: MetricDataPoint[] = [];
  private readonly MAX_POINTS = 5000;

  constructor() {
    // Periodically prune data older than 2 hours to maintain constant memory
    setInterval(() => {
      const cutoff = Date.now() - 2 * 60 * 60 * 1000;
      this.dataPoints = this.dataPoints.filter((pt) => pt.timestamp >= cutoff);
    }, 5 * 60 * 1000).unref?.();
  }

  /**
   * Record a metric event (counter, gauge, or duration)
   */
  record(name: string, value = 1, tags: Record<string, string> = {}): void {
    const point: MetricDataPoint = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    };

    this.dataPoints.push(point);
    if (this.dataPoints.length > this.MAX_POINTS) {
      this.dataPoints.shift();
    }
  }

  /**
   * Increment a named metric counter by 1
   */
  increment(name: string, tags: Record<string, string> = {}): void {
    this.record(name, 1, tags);
  }

  /**
   * Record operation latency in milliseconds
   */
  recordDuration(name: string, durationMs: number, tags: Record<string, string> = {}): void {
    this.record(name, durationMs, tags);
  }

  /**
   * Get the sum of a metric in a rolling time window (e.g. past 5 mins = 300,000ms)
   */
  getSum(name: string, windowMs = 5 * 60 * 1000, filterTags?: Record<string, string>): number {
    const cutoff = Date.now() - windowMs;
    return this.dataPoints
      .filter((pt) => {
        if (pt.name !== name || pt.timestamp < cutoff) return false;
        if (!filterTags) return true;
        return Object.entries(filterTags).every(([k, v]) => pt.tags[k] === v);
      })
      .reduce((acc, curr) => acc + curr.value, 0);
  }

  /**
   * Get count of metric occurrences in a rolling time window
   */
  getCount(name: string, windowMs = 5 * 60 * 1000, filterTags?: Record<string, string>): number {
    const cutoff = Date.now() - windowMs;
    return this.dataPoints.filter((pt) => {
      if (pt.name !== name || pt.timestamp < cutoff) return false;
      if (!filterTags) return true;
      return Object.entries(filterTags).every(([k, v]) => pt.tags[k] === v);
    }).length;
  }

  /**
   * Get average duration or value in a rolling time window
   */
  getAverage(name: string, windowMs = 5 * 60 * 1000, filterTags?: Record<string, string>): number {
    const cutoff = Date.now() - windowMs;
    const matches = this.dataPoints.filter((pt) => {
      if (pt.name !== name || pt.timestamp < cutoff) return false;
      if (!filterTags) return true;
      return Object.entries(filterTags).every(([k, v]) => pt.tags[k] === v);
    });

    if (matches.length === 0) return 0;
    const total = matches.reduce((acc, curr) => acc + curr.value, 0);
    return Math.round(total / matches.length);
  }

  /**
   * Get telemetry summary for status dashboards and health checks
   */
  getSnapshot(windowMs = 15 * 60 * 1000) {
    return {
      auth: {
        failedLogins: this.getCount('auth.login_failed', windowMs),
        rateLimited: this.getCount('auth.rate_limited', windowMs),
      },
      api: {
        totalRequests: this.getCount('api.request_count', windowMs),
        errors4xx: this.getCount('api.error_4xx', windowMs),
        errors5xx: this.getCount('api.error_5xx', windowMs),
        avgLatencyMs: this.getAverage('api.request_duration', windowMs),
      },
      database: {
        queryFailures: this.getCount('db.query_failed', windowMs),
      },
      social: {
        publishingFailures: this.getCount('social.publish_failed', windowMs),
        publishingSuccesses: this.getCount('social.publish_success', windowMs),
        tokenErrors: this.getCount('social.token_error', windowMs),
      },
      whatsapp: {
        signatureFailures: this.getCount('whatsapp.signature_failed', windowMs),
        deliveryErrors: this.getCount('whatsapp.delivery_error', windowMs),
      },
      payments: {
        signatureFailures: this.getCount('payments.signature_failed', windowMs),
        mismatches: this.getCount('payments.mismatch', windowMs),
      },
      ai: {
        tokensConsumed: this.getSum('ai.tokens_consumed', windowMs),
        timeouts: this.getCount('ai.timeout', windowMs),
        criticRejections: this.getCount('ai.critic_rejected', windowMs),
      },
      inbox: {
        deliveryDelays: this.getCount('inbox.delivery_delayed', windowMs),
        dispatchFailures: this.getCount('inbox.dispatch_failed', windowMs),
      },
    };
  }

  /**
   * Clear all recorded data points (useful in test teardown)
   */
  clear(): void {
    this.dataPoints.length = 0;
  }
}

export const metrics = new MetricsTelemetryManager();
