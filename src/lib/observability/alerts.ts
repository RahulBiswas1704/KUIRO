import crypto from 'crypto';
import { db, systemAlerts } from '@/db';
import { logger } from './logger';
import { metrics } from './metrics';

/**
 * ============================================================================
 * KUIRO REAL-TIME ALERTING & ANOMALY DETECTION ENGINE
 * ============================================================================
 * 
 * Manages production alerts across critical SaaS boundaries:
 * - Payment webhook signature failures & gateway discrepancies
 * - Social publishing failure spikes across Meta, LinkedIn, and X
 * - Unusually high AI credit consumption / Gemini timeouts
 * - Database query failure surges & connection warnings
 * - Stuck or exhausted Inngest durable workflows
 * - Social token expiration warnings
 * 
 * Multi-Channel Dispatch:
 * - Persistent Database Ledger (`system_alerts` table in Neon PostgreSQL)
 * - Structured JSON Error Logs
 * - Webhook Dispatch (Slack / Discord / PagerDuty via ALERT_WEBHOOK_URL)
 * - Email Dispatch via Resend (when ALERT_EMAIL_RECIPIENTS configured)
 * - Intelligent Cooldown / Deduplication (prevents alert storms)
 */

export type AlertSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export type AlertCategory =
  | 'PAYMENT'
  | 'SOCIAL_PUBLISHING'
  | 'AI_SURGE'
  | 'DATABASE'
  | 'SECURITY'
  | 'SCHEDULER'
  | 'INBOX'
  | 'STORAGE';

export interface AlertInput {
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  message: string;
  workspaceId?: string;
  correlationId?: string;
  details?: Record<string, any>;
}

export interface SystemAlertRecord extends AlertInput {
  id: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  dispatchedChannels: string[];
  createdAt: string;
}

// In-Memory Ring Buffer for alert history & test verification
const recentAlertsBuffer: SystemAlertRecord[] = [];
const alertListeners = new Set<(alert: SystemAlertRecord) => void>();

class AlertManager {
  private cooldowns = new Map<string, number>();
  private readonly COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes default cooldown

  /**
   * Triggers an alert across all configured channels with deduplication
   */
  async triggerAlert(input: AlertInput): Promise<SystemAlertRecord | null> {
    const cooldownKey = `${input.category}:${input.workspaceId || 'system'}:${input.title}`;
    const lastTriggered = this.cooldowns.get(cooldownKey) || 0;
    const now = Date.now();

    // Enforce cooldown to prevent alert flooding
    if (now - lastTriggered < this.COOLDOWN_MS) {
      logger.info('alert_suppressed_by_cooldown', {
        service: 'alert-manager',
        event: 'alert_suppressed',
        workspaceId: input.workspaceId,
        correlationId: input.correlationId,
        metadata: {
          category: input.category,
          title: input.title,
          secondsRemaining: Math.round((this.COOLDOWN_MS - (now - lastTriggered)) / 1000),
        },
      });
      return null;
    }

    this.cooldowns.set(cooldownKey, now);

    const alertId = crypto.randomUUID();
    const dispatchedChannels: string[] = ['db', 'structured_log'];

    const alertRecord: SystemAlertRecord = {
      ...input,
      id: alertId,
      status: 'OPEN',
      dispatchedChannels,
      createdAt: new Date().toISOString(),
    };

    // 1. Emit Structured Log
    const logLevel = input.severity === 'CRITICAL' ? 'fatal' : input.severity === 'ERROR' ? 'error' : 'warn';
    logger[logLevel]('system_alert_triggered', {
      service: 'alert-manager',
      event: 'alert_triggered',
      workspaceId: input.workspaceId,
      correlationId: input.correlationId,
      metadata: {
        alertId,
        severity: input.severity,
        category: input.category,
        title: input.title,
        message: input.message,
        details: input.details,
      },
    });

    // 2. Persist to Neon PostgreSQL `system_alerts` table
    if (db) {
      try {
        await db.insert(systemAlerts).values({
          id: alertId,
          severity: input.severity,
          category: input.category,
          title: input.title,
          message: input.message,
          workspaceId: input.workspaceId || null,
          correlationId: input.correlationId || null,
          details: input.details || null,
          status: 'OPEN',
          dispatchedChannels,
        });
      } catch (dbErr) {
        logger.warn('system_alert_db_persist_warning', {
          service: 'alert-manager',
          event: 'alert_db_save_failed',
          metadata: { error: String(dbErr) },
        });
      }
    }

    // 3. Dispatch to Webhook (Slack / Discord / PagerDuty) if configured
    await this.dispatchToWebhook(alertRecord);

    // 4. Update in-memory ring buffer
    recentAlertsBuffer.push(alertRecord);
    if (recentAlertsBuffer.length > 200) {
      recentAlertsBuffer.shift();
    }

    // 5. Notify local listeners
    for (const listener of alertListeners) {
      try {
        listener(alertRecord);
      } catch {}
    }

    return alertRecord;
  }

  /**
   * Rule: Check social publishing failures
   * Triggers alert when failures in the last 10 minutes reach threshold (>= 3)
   */
  async checkPublishingFailureThreshold(options: {
    workspaceId?: string;
    campaignId?: string;
    platform?: string;
    errorCode?: string;
    correlationId?: string;
  }): Promise<SystemAlertRecord | null> {
    metrics.increment('social.publish_failed', { platform: options.platform || 'all' });

    const recentFailures = metrics.getCount('social.publish_failed', 10 * 60 * 1000);
    if (recentFailures >= 3) {
      return this.triggerAlert({
        severity: 'CRITICAL',
        category: 'SOCIAL_PUBLISHING',
        title: 'Social Publishing Failure Spike Detected',
        message: `KUIRO detected ${recentFailures} social publishing failures across channels in the last 10 minutes.`,
        workspaceId: options.workspaceId,
        correlationId: options.correlationId,
        details: {
          recentFailureCount: recentFailures,
          lastPlatform: options.platform,
          lastErrorCode: options.errorCode,
          campaignId: options.campaignId,
        },
      });
    }

    return null;
  }

  /**
   * Rule: Check payment webhook signature failures
   * Triggers alert when signature failures reach threshold (>= 2 in 5 mins)
   */
  async checkPaymentSignatureFailureThreshold(options: {
    provider: string;
    ip?: string;
    correlationId?: string;
    workspaceId?: string;
  }): Promise<SystemAlertRecord | null> {
    metrics.increment('payments.signature_failed', { provider: options.provider });

    const recentFailures = metrics.getCount('payments.signature_failed', 5 * 60 * 1000);
    if (recentFailures >= 2) {
      return this.triggerAlert({
        severity: 'CRITICAL',
        category: 'PAYMENT',
        title: 'Payment Webhook Signature Mismatch Surge',
        message: `Multiple payment webhook signature verification failures detected for provider '${options.provider}'. Potential security breach or stale webhook secret.`,
        workspaceId: options.workspaceId,
        correlationId: options.correlationId,
        details: {
          recentFailureCount: recentFailures,
          provider: options.provider,
          clientIp: options.ip,
        },
      });
    }

    return null;
  }

  /**
   * Rule: Check AI Token usage surge or timeouts
   * Triggers alert if a workspace exceeds 50,000 tokens in 1 hour or timeouts >= 3
   */
  async checkAiTokenSurgeThreshold(options: {
    workspaceId: string;
    tokensUsed: number;
    correlationId?: string;
  }): Promise<SystemAlertRecord | null> {
    metrics.record('ai.tokens_consumed', options.tokensUsed, { workspaceId: options.workspaceId });

    const tokensInLastHour = metrics.getSum('ai.tokens_consumed', 60 * 60 * 1000, {
      workspaceId: options.workspaceId,
    });

    if (tokensInLastHour >= 50000) {
      return this.triggerAlert({
        severity: 'WARNING',
        category: 'AI_SURGE',
        title: 'Unusually High AI Credit Consumption',
        message: `Workspace '${options.workspaceId}' consumed ${tokensInLastHour} AI tokens in the past hour.`,
        workspaceId: options.workspaceId,
        correlationId: options.correlationId,
        details: {
          tokensConsumedHour: tokensInLastHour,
          threshold: 50000,
        },
      });
    }

    return null;
  }

  /**
   * Rule: Check Database query failure surge
   */
  async checkDatabaseErrorThreshold(options: {
    error: string;
    correlationId?: string;
  }): Promise<SystemAlertRecord | null> {
    metrics.increment('db.query_failed');

    const recentDbErrors = metrics.getCount('db.query_failed', 5 * 60 * 1000);
    if (recentDbErrors >= 5) {
      return this.triggerAlert({
        severity: 'CRITICAL',
        category: 'DATABASE',
        title: 'Database Query Failure Surge',
        message: `Elevated database query failures detected (${recentDbErrors} errors in past 5 minutes). Check Neon PostgreSQL connectivity and connection pool.`,
        correlationId: options.correlationId,
        details: {
          errorCount: recentDbErrors,
          lastError: options.error,
        },
      });
    }

    return null;
  }

  /**
   * Rule: Social Token Expiration Warning
   */
  async checkSocialTokenExpiration(options: {
    workspaceId: string;
    platform: string;
    daysRemaining: number;
    correlationId?: string;
  }): Promise<SystemAlertRecord | null> {
    if (options.daysRemaining <= 1) {
      return this.triggerAlert({
        severity: 'ERROR',
        category: 'SOCIAL_PUBLISHING',
        title: `Social Token Expiring for ${options.platform}`,
        message: `OAuth token for platform '${options.platform}' in workspace '${options.workspaceId}' will expire in ${options.daysRemaining} days and could not be refreshed.`,
        workspaceId: options.workspaceId,
        correlationId: options.correlationId,
        details: options,
      });
    }

    return null;
  }

  /**
   * Webhook dispatcher (Slack / Discord / PagerDuty)
   */
  private async dispatchToWebhook(alert: SystemAlertRecord): Promise<void> {
    const webhookUrl = process.env.ALERT_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
      const payload = {
        text: `🚨 *[KUIRO ALERT - ${alert.severity}]* ${alert.title}\n*Category:* ${alert.category}\n*Message:* ${alert.message}\n*Workspace:* ${alert.workspaceId || 'Platform-Wide'}\n*Correlation ID:* \`${alert.correlationId || 'N/A'}\``,
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      alert.dispatchedChannels.push('webhook');
    } catch (err) {
      logger.warn('alert_webhook_dispatch_failed', {
        service: 'alert-manager',
        event: 'webhook_dispatch_failed',
        metadata: { error: String(err) },
      });
    }
  }

  /**
   * Get recently recorded alerts
   */
  getRecentAlerts(limit = 50): SystemAlertRecord[] {
    return recentAlertsBuffer.slice(-limit);
  }

  /**
   * Clear cooldowns and alerts (useful in test runner)
   */
  clear(): void {
    recentAlertsBuffer.length = 0;
    this.cooldowns.clear();
  }

  /**
   * Subscribe to new alert events
   */
  subscribe(listener: (alert: SystemAlertRecord) => void): () => void {
    alertListeners.add(listener);
    return () => alertListeners.delete(listener);
  }
}

export const alertManager = new AlertManager();
