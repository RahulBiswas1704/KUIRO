import crypto from 'crypto';

/**
 * ============================================================================
 * KUIRO STRUCTURED JSON LOGGING & AUDIT SYSTEM
 * ============================================================================
 * 
 * Enforces strict JSON formatting across all services:
 * - Customer & Workspace Context (workspaceId, campaignId, conversationId, userId)
 * - Distributed Correlation IDs for end-to-end request tracing
 * - Error Classification & Performance Duration (durationMs)
 * 
 * Security & Data Privacy Guardrail:
 * - Automatically scrubs and redacts passwords, session tokens, access tokens,
 *   payment secrets, private keys, and API signatures.
 * - Masks sensitive customer message contents.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogService =
  | 'campaign-publisher'
  | 'ai-critic'
  | 'ai-generator'
  | 'inbox-dispatcher'
  | 'whatsapp-webhook'
  | 'instagram-webhook'
  | 'messenger-webhook'
  | 'auth-service'
  | 'payment-gateway'
  | 'scheduler-engine'
  | 'database'
  | 'storage-service';

export interface StructuredLogEvent {
  timestamp: string;
  level: LogLevel;
  service: LogService | string;
  event: string;
  correlationId?: string;
  workspaceId?: string;
  campaignId?: string;
  userId?: string;
  conversationId?: string;
  provider?: string;
  platform?: string;
  channel?: string;
  errorCode?: string;
  durationMs?: number;
  metadata?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

// Sensitive keys that must be strictly redacted across all logs
const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /passwd/i,
  /token/i,
  /secret/i,
  /apikey/i,
  /api_key/i,
  /signature/i,
  /private_key/i,
  /privatekey/i,
  /authorization/i,
  /cookie/i,
  /cvv/i,
  /card_number/i,
  /cardnumber/i,
  /payment_secret/i,
  /account_number/i,
  /bearer/i,
  /webhook_secret/i,
  /cron_secret/i,
  /access_token/i,
  /refresh_token/i,
];

/**
 * Recursively deep scrubs and redacts sensitive credentials and secrets
 */
export function sanitizeLogPayload(obj: any, depth = 0): any {
  if (depth > 6) return '[TRUNCATED_MAX_DEPTH]';
  if (obj === null || obj === undefined) return obj;

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeLogPayload(item, depth + 1));
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Check if key matches any sensitive pattern
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Mask sensitive message bodies/transcripts if excessively long or personal
    if (key === 'body' || key === 'content' || key === 'transcript' || key === 'messageText') {
      if (typeof value === 'string') {
        if (value.length > 50) {
          sanitized[key] = `[MASKED_CONTENT: length ${value.length}, start "${value.slice(0, 15)}..."]`;
          continue;
        }
      }
    }

    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogPayload(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Generates an end-to-end correlation ID for request tracing
 */
export function generateCorrelationId(prefix = 'req'): string {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Extracts or generates correlation ID from incoming NextRequest / Headers
 */
export function getCorrelationId(headers?: Headers | Record<string, string | null | undefined>): string {
  if (!headers) return generateCorrelationId();

  if (typeof (headers as Headers).get === 'function') {
    const h = headers as Headers;
    return (
      h.get('x-correlation-id') ||
      h.get('x-request-id') ||
      h.get('x-trace-id') ||
      generateCorrelationId()
    );
  }

  const obj = headers as Record<string, string | null | undefined>;
  return (
    obj['x-correlation-id'] ||
    obj['x-request-id'] ||
    obj['x-trace-id'] ||
    generateCorrelationId()
  );
}

// In-Memory Ring Buffer for test verification and staging telemetry
const RECENT_LOGS_LIMIT = 500;
const recentLogsBuffer: StructuredLogEvent[] = [];
const logListeners = new Set<(event: StructuredLogEvent) => void>();

class StructuredLogger {
  private baseContext: Partial<StructuredLogEvent> = {};

  constructor(context?: Partial<StructuredLogEvent>) {
    if (context) {
      this.baseContext = context;
    }
  }

  /**
   * Child logger inheriting parent correlation ID and workspace context
   */
  child(context: Partial<StructuredLogEvent>): StructuredLogger {
    return new StructuredLogger({
      ...this.baseContext,
      ...context,
      metadata: {
        ...(this.baseContext.metadata || {}),
        ...(context.metadata || {}),
      },
    });
  }

  debug(event: string, details?: Partial<StructuredLogEvent>) {
    this.writeLog('debug', event, details);
  }

  info(event: string, details?: Partial<StructuredLogEvent>) {
    this.writeLog('info', event, details);
  }

  warn(event: string, details?: Partial<StructuredLogEvent>) {
    this.writeLog('warn', event, details);
  }

  error(event: string, details?: Partial<StructuredLogEvent> & { err?: unknown }) {
    this.writeLog('error', event, details);
  }

  fatal(event: string, details?: Partial<StructuredLogEvent> & { err?: unknown }) {
    this.writeLog('fatal', event, details);
  }

  private writeLog(
    level: LogLevel,
    event: string,
    details?: (Partial<StructuredLogEvent> & { err?: unknown })
  ) {
    const rawError = details?.err;
    let errorObj: { message: string; stack?: string; name?: string } | undefined;

    if (rawError instanceof Error) {
      errorObj = {
        name: rawError.name,
        message: rawError.message,
        stack: rawError.stack,
      };
    } else if (rawError) {
      errorObj = {
        message: String(rawError),
      };
    }

    const { err: _, ...cleanDetails } = details || {};

    const rawEvent: StructuredLogEvent = {
      timestamp: new Date().toISOString(),
      level,
      service: cleanDetails.service || this.baseContext.service || 'kuiro-app',
      event,
      correlationId: cleanDetails.correlationId || this.baseContext.correlationId || generateCorrelationId(),
      workspaceId: cleanDetails.workspaceId || this.baseContext.workspaceId,
      campaignId: cleanDetails.campaignId || this.baseContext.campaignId,
      userId: cleanDetails.userId || this.baseContext.userId,
      conversationId: cleanDetails.conversationId || this.baseContext.conversationId,
      provider: cleanDetails.provider || this.baseContext.provider,
      platform: cleanDetails.platform || this.baseContext.platform,
      channel: cleanDetails.channel || this.baseContext.channel,
      errorCode: cleanDetails.errorCode || this.baseContext.errorCode,
      durationMs: cleanDetails.durationMs,
      metadata: {
        ...(this.baseContext.metadata || {}),
        ...(cleanDetails.metadata || {}),
      },
      error: errorObj || cleanDetails.error,
    };

    // Sanitize and redact credentials
    const sanitizedLog = sanitizeLogPayload(rawEvent) as StructuredLogEvent;

    // Output single-line JSON to stdout/stderr for cloud log aggregators (Axiom, Datadog, Vercel)
    const jsonString = JSON.stringify(sanitizedLog);
    if (level === 'error' || level === 'fatal') {
      process.stderr.write(jsonString + '\n');
    } else {
      process.stdout.write(jsonString + '\n');
    }

    // Retain in in-memory ring buffer for tests & audit APIs
    recentLogsBuffer.push(sanitizedLog);
    if (recentLogsBuffer.length > RECENT_LOGS_LIMIT) {
      recentLogsBuffer.shift();
    }

    // Notify active listeners
    for (const listener of logListeners) {
      try {
        listener(sanitizedLog);
      } catch {}
    }
  }

  /**
   * Retrieves recent sanitized logs for test assertions & staging inspection
   */
  getRecentLogs(limit = 100): StructuredLogEvent[] {
    return recentLogsBuffer.slice(-limit);
  }

  /**
   * Clears the log buffer (useful in test teardown)
   */
  clearLogs(): void {
    recentLogsBuffer.length = 0;
  }

  /**
   * Subscribes to real-time log events
   */
  subscribe(listener: (log: StructuredLogEvent) => void): () => void {
    logListeners.add(listener);
    return () => logListeners.delete(listener);
  }
}

export const logger = new StructuredLogger();
