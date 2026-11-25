import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { db, adminAuditLogs } from '@/db';
import { timingSafeCompare, getClientIp } from '@/lib/security/timing';

export { timingSafeCompare };

/**
 * ============================================================================
 * KUIRO VERCEL CRON SECURITY & AUTHENTICATION ENGINE
 * ============================================================================
 * 
 * Strict Enforcement:
 * 1. Dedicated Cron Secret: Requires CRON_SECRET in environment. Fails closed in production if missing.
 * 2. Header Verification: Reads and validates `Authorization: Bearer <CRON_SECRET>`.
 * 3. Timing-Safe Comparison: Constant-time buffer comparison mitigating side-channel timing attacks.
 * 4. Zero Session Cookie Substitutes: Session cookies and user credentials are NEVER accepted for cron routes.
 * 5. Rate Limiting: Enforces an in-memory sliding window rate-limiter to protect against brute-force or DoS attacks.
 * 6. Audit Logging: Automatically records execution and unauthorized attempts in PostgreSQL `admin_audit_logs`.
 * 7. Execution Window Validation: Verifies that scheduled jobs run within their expected UTC time window.
 */

// Banned default, weak, or exposed cron secrets
export const BANNED_CRON_SECRETS = new Set([
  'kuiro_cron_secret_secure_2026',
  'kuiro-mgmt-secure-2026',
  'admin',
  'password',
  'secret',
  '123456',
  '12345678',
  'default',
  'test',
  'changeme',
]);

// Sliding-window rate-limiter state (IP-based)
const cronRateLimitStore = new Map<string, { count: number; firstRequestAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 15;

/**
 * Resets the in-memory sliding-window rate limit store. Useful for testing and manual resets.
 */
export function resetCronRateLimits(): void {
  cronRateLimitStore.clear();
}

export interface CronAuthResult {
  authorized: boolean;
  status: number; // 200, 401, 403, 429, 500
  reason?: string;
  source: 'vercel_cron' | 'operator_admin' | 'dev_authorized';
  clientIp: string;
}

export interface CronSecurityOptions {
  allowedHoursUtc?: number[]; // e.g. [23, 0, 1] for 00:00 UTC schedule with jitter
  enforceScheduleWindow?: boolean;
}

/**
 * Validates that an incoming request is legitimately authorized to execute system crons.
 */
export async function verifyCronAuthorization(
  req: NextRequest,
  options?: CronSecurityOptions
): Promise<CronAuthResult> {
  const isProduction = process.env.NODE_ENV === 'production';
  const cronSecret = process.env.CRON_SECRET?.trim();
  const clientIp = getClientIp(req);
  const userAgent = req.headers.get('user-agent') || 'Unknown';
  const now = Date.now();

  // -------------------------------------------------------------
  // 1. Sliding Window Rate-Limiting Protection
  // -------------------------------------------------------------
  const rateLimitEntry = cronRateLimitStore.get(clientIp);
  if (rateLimitEntry) {
    if (now - rateLimitEntry.firstRequestAt < RATE_LIMIT_WINDOW_MS) {
      if (rateLimitEntry.count >= MAX_REQUESTS_PER_WINDOW) {
        console.warn(`[Cron Security Rate-Limit] IP '${clientIp}' exceeded rate limit (${rateLimitEntry.count} reqs/min).`);
        await recordAuditLog({
          operatorEmail: 'system:cron-rate-limiter',
          action: 'CRON_RATE_LIMITED',
          status: 'RATE_LIMITED',
          ipAddress: clientIp,
          userAgent,
          details: { requestCount: rateLimitEntry.count },
        });
        return {
          authorized: false,
          status: 429,
          reason: 'Too Many Requests: Cron execution rate limit exceeded. Please wait before retrying.',
          source: 'vercel_cron',
          clientIp,
        };
      }
      rateLimitEntry.count++;
    } else {
      cronRateLimitStore.set(clientIp, { count: 1, firstRequestAt: now });
    }
  } else {
    cronRateLimitStore.set(clientIp, { count: 1, firstRequestAt: now });
  }

  // -------------------------------------------------------------
  // 2. Production Secret Enforcement: Fail Closed if Missing
  // -------------------------------------------------------------
  if (!cronSecret) {
    if (isProduction) {
      const errorMsg = 'CRON_SECRET environment variable is not configured in production. Scheduled cron execution is securely disabled.';
      console.error(`[Cron Security Fatal] ${errorMsg}`);
      await recordAuditLog({
        operatorEmail: 'system:cron-security',
        action: 'CRON_UNCONFIGURED_IN_PROD',
        status: 'BLOCKED',
        ipAddress: clientIp,
        userAgent,
        details: { error: errorMsg },
      });
      return {
        authorized: false,
        status: 500,
        reason: errorMsg,
        source: 'vercel_cron',
        clientIp,
      };
    }
  }

  // Reject banned weak secrets
  if (cronSecret && BANNED_CRON_SECRETS.has(cronSecret.toLowerCase())) {
    const errorMsg = 'Configured CRON_SECRET is an insecure default and has been rejected by security policy.';
    console.error(`[Cron Security Fatal] ${errorMsg}`);
    await recordAuditLog({
      operatorEmail: 'system:cron-security',
      action: 'BANNED_CRON_SECRET_REJECTED',
      status: 'BLOCKED',
      ipAddress: clientIp,
      userAgent,
      details: { error: errorMsg },
    });
    return {
      authorized: false,
      status: 500,
      reason: errorMsg,
      source: 'vercel_cron',
      clientIp,
    };
  }

  // -------------------------------------------------------------
  // 3. Authorization Header Extraction: Bearer <CRON_SECRET>
  // -------------------------------------------------------------
  const authHeader = req.headers.get('authorization');
  const managementKeyHeader = req.headers.get('x-management-key');

  let suppliedSecret: string | null = null;
  let authType: 'bearer' | 'operator_key' | null = null;

  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    suppliedSecret = authHeader.substring(7).trim();
    authType = 'bearer';
  } else if (managementKeyHeader) {
    suppliedSecret = managementKeyHeader.trim();
    authType = 'operator_key';
  }

  // Reject immediately if no authorization credential is provided
  if (!suppliedSecret) {
    // In local non-production development ONLY if explicitly configured:
    if (!isProduction && process.env.ALLOW_DEV_CRON_UNAUTHENTICATED === 'true') {
      console.warn('[Cron Security Dev Notice] Allowing unauthenticated cron execution due to ALLOW_DEV_CRON_UNAUTHENTICATED=true.');
      return {
        authorized: true,
        status: 200,
        source: 'dev_authorized',
        clientIp,
      };
    }

    await recordAuditLog({
      operatorEmail: 'unauthenticated:cron',
      action: 'CRON_MISSING_CREDENTIALS',
      status: 'FAILURE',
      ipAddress: clientIp,
      userAgent,
      details: { headerPresent: !!authHeader },
    });

    return {
      authorized: false,
      status: 401,
      reason: 'Unauthorized: Missing Authorization header. Expected "Bearer <CRON_SECRET>".',
      source: 'vercel_cron',
      clientIp,
    };
  }

  // -------------------------------------------------------------
  // 4. Secure Timing-Safe Verification Against Configured Secrets
  // -------------------------------------------------------------
  let matched = false;
  let authSource: 'vercel_cron' | 'operator_admin' = 'vercel_cron';

  // A. Check against Vercel CRON_SECRET
  if (cronSecret && timingSafeCompare(suppliedSecret, cronSecret)) {
    matched = true;
    authSource = 'vercel_cron';
  }

  // B. Check against Operator Management Secret (for administrative console manual triggers)
  const operatorSecret = process.env.KUIRO_MANAGEMENT_SECRET?.trim() || process.env.MANAGEMENT_SECRET?.trim();
  if (!matched && operatorSecret && !BANNED_CRON_SECRETS.has(operatorSecret.toLowerCase())) {
    if (timingSafeCompare(suppliedSecret, operatorSecret)) {
      matched = true;
      authSource = 'operator_admin';
    }
  }

  // Reject invalid credentials
  if (!matched) {
    await recordAuditLog({
      operatorEmail: 'unauthorized:cron',
      action: 'CRON_INVALID_SECRET',
      status: 'FAILURE',
      ipAddress: clientIp,
      userAgent,
      details: { authType },
    });

    return {
      authorized: false,
      status: 401,
      reason: 'Unauthorized: Invalid cron authorization credentials.',
      source: 'vercel_cron',
      clientIp,
    };
  }

  // -------------------------------------------------------------
  // 5. Execution Window Validation (If Configured)
  // -------------------------------------------------------------
  const shouldEnforceWindow = options?.enforceScheduleWindow ?? (process.env.ENFORCE_CRON_SCHEDULE_WINDOW === 'true');
  const allowedHours = options?.allowedHoursUtc ?? [23, 0, 1];

  if (shouldEnforceWindow && allowedHours.length) {
    const currentUtcHour = new Date().getUTCHours();
    const isWithinWindow = allowedHours.includes(currentUtcHour);
    const isForceRun = new URL(req.url).searchParams.get('force') === 'true';

    if (!isWithinWindow && !isForceRun && authSource !== 'operator_admin') {
      const errorMsg = `Forbidden: Scheduled cron execution outside designated time window (current UTC hour: ${currentUtcHour}, allowed: [${allowedHours.join(', ')}]). Use ?force=true for manual overrides.`;
      console.warn(`[Cron Security Window Check]: ${errorMsg}`);
      await recordAuditLog({
        operatorEmail: 'system:cron-window-guard',
        action: 'CRON_OUTSIDE_WINDOW',
        status: 'BLOCKED',
        ipAddress: clientIp,
        userAgent,
        details: { currentUtcHour, allowedHours },
      });
      return {
        authorized: false,
        status: 403,
        reason: errorMsg,
        source: authSource,
        clientIp,
      };
    }
  }

  // -------------------------------------------------------------
  // 6. Record Authorized Execution in Audit Ledger
  // -------------------------------------------------------------
  await recordAuditLog({
    operatorEmail: authSource === 'operator_admin' ? 'operator:admin-key' : 'system:vercel-cron',
    action: 'CRON_EXECUTION_AUTHORIZED',
    status: 'SUCCESS',
    ipAddress: clientIp,
    userAgent,
    details: {
      authSource,
      path: req.nextUrl?.pathname || req.url,
      actionParam: new URL(req.url).searchParams.get('action') || 'all',
    },
  });

  return {
    authorized: true,
    status: 200,
    source: authSource,
    clientIp,
  };
}

/**
 * Internal helper to safely record security audit logs in Neon PostgreSQL
 */
async function recordAuditLog(params: {
  operatorEmail: string;
  action: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'RATE_LIMITED';
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}) {
  if (!db) return;
  try {
    await db.insert(adminAuditLogs).values({
      operatorEmail: params.operatorEmail,
      action: params.action,
      status: params.status,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      details: params.details,
    });
  } catch (err) {
    console.warn('[Cron Audit Log Save Error]:', err);
  }
}
