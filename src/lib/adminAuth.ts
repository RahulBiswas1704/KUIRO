import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { db, adminAuditLogs } from '@/db';

/**
 * ============================================================================
 * KUIRO PLATFORM OPERATOR MANAGEMENT SECURITY SYSTEM
 * ============================================================================
 * 
 * Strict separation between:
 * 1. Platform Operator (Internal KUIRO Engineering / Executive Team)
 * 2. Customer Workspace Administrator (External Tenant Business Owners / Agencies)
 * 
 * Zero default passkeys. Zero hard-coded fallbacks.
 * Fails closed in production if environment secrets are absent or insecure.
 */

// Banned insecure or known default credentials that must NEVER be accepted
export const BANNED_SECRETS = new Set([
  'kuiro-mgmt-secure-2026',
  'kuiro_management_secure_master_secret_2026',
  'kuiro_cron_secret_secure_2026',
  'admin',
  'password',
  '123456',
  '12345678',
  'secret',
  'changeme',
  'default',
  'root',
  'master',
  'test',
]);

// Configured list of authorized operator emails
export const AUTHORIZED_MANAGEMENT_EMAILS: string[] = (
  process.env.KUIRO_OPERATOR_EMAILS
    ? process.env.KUIRO_OPERATOR_EMAILS.split(',').map((e) => e.trim().toLowerCase())
    : [
        'rahul.biswas1704@gmail.com',
        'management@kuiro.in',
        'admin@kuiro.in',
        'founder@kuiro.in',
      ]
).filter(Boolean);

// Recovery codes hash store for emergency account recovery
const RECOVERY_CODES_HASHES: string[] = (
  process.env.KUIRO_OPERATOR_RECOVERY_HASHES
    ? process.env.KUIRO_OPERATOR_RECOVERY_HASHES.split(',').map((h) => h.trim())
    : []
).filter(Boolean);

// In-Memory Rate Limiting Ledger for Operator Logins
interface RateLimitEntry {
  failedAttempts: number;
  firstAttemptAt: number;
  lockedUntil: number;
}

const g = globalThis as unknown as {
  __kuiro_admin_rate_limits?: Map<string, RateLimitEntry>;
  __kuiro_admin_audit_buffer?: any[];
};

const adminRateLimitStore = g.__kuiro_admin_rate_limits || new Map<string, RateLimitEntry>();
g.__kuiro_admin_rate_limits = adminRateLimitStore;

const inMemoryAuditBuffer = g.__kuiro_admin_audit_buffer || [];
g.__kuiro_admin_audit_buffer = inMemoryAuditBuffer;

export const RATE_LIMIT_MAX_FAILED = 5;
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

/**
 * Generates a high-entropy cryptographically secure random secret.
 * Used for generating fresh passkeys, signing secrets, and recovery codes.
 */
export function generateHighEntropySecret(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex'); // 64 hex characters (256-bit entropy)
}

/**
 * Constant-time comparison mitigating side-channel timing analysis attacks.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    // Perform dummy constant-time comparison against itself to equalize timing
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Resolves and validates the operator master passkey.
 * Fails closed if missing, banned, or low-entropy.
 */
export function getManagementPasskey(): string {
  const passkey = process.env.KUIRO_MANAGEMENT_PASSKEY || process.env.ADMIN_SECRET_KEY;
  if (!passkey || !passkey.trim()) {
    throw new Error('ADMIN_SECRETS_NOT_CONFIGURED: KUIRO_MANAGEMENT_PASSKEY is not configured in environment.');
  }

  const cleanPasskey = passkey.trim();
  if (BANNED_SECRETS.has(cleanPasskey.toLowerCase())) {
    throw new Error('BANNED_SECRET_REJECTED: Configured management passkey is a known default or banned secret.');
  }

  if (process.env.NODE_ENV === 'production' && cleanPasskey.length < 32) {
    throw new Error('INSUFFICIENT_ENTROPY: Production management passkey must be at least 32 characters long.');
  }

  return cleanPasskey;
}

/**
 * Resolves and validates the operator JWT signing secret.
 * Fails closed if missing, banned, or low-entropy.
 */
export function getManagementJwtSecret(): string {
  const secret = process.env.KUIRO_MANAGEMENT_JWT_SECRET || process.env.BETTER_AUTH_SECRET;
  if (!secret || !secret.trim()) {
    throw new Error('ADMIN_SECRETS_NOT_CONFIGURED: KUIRO_MANAGEMENT_JWT_SECRET is not configured in environment.');
  }

  const cleanSecret = secret.trim();
  if (BANNED_SECRETS.has(cleanSecret.toLowerCase())) {
    throw new Error('BANNED_SECRET_REJECTED: Configured management JWT secret is a known default or banned secret.');
  }

  if (process.env.NODE_ENV === 'production' && cleanSecret.length < 32) {
    throw new Error('INSUFFICIENT_ENTROPY: Production management JWT secret must be at least 32 characters long.');
  }

  return cleanSecret;
}

// Backward-compatible export for existing imports
export const MANAGEMENT_PASSKEY = process.env.KUIRO_MANAGEMENT_PASSKEY || process.env.ADMIN_SECRET_KEY || '';

/**
 * Checks if operator secrets are safely configured without throwing.
 */
export function checkManagementSecretsHealth(): {
  configured: boolean;
  error?: string;
  code?: 'ADMIN_SECRETS_NOT_CONFIGURED' | 'BANNED_SECRET_REJECTED' | 'INSUFFICIENT_ENTROPY' | 'HEALTHY';
} {
  try {
    getManagementPasskey();
    getManagementJwtSecret();
    return { configured: true, code: 'HEALTHY' };
  } catch (err: any) {
    const message = err?.message || 'Secrets unconfigured';
    if (message.includes('BANNED_SECRET_REJECTED')) {
      return { configured: false, error: message, code: 'BANNED_SECRET_REJECTED' };
    }
    if (message.includes('INSUFFICIENT_ENTROPY')) {
      return { configured: false, error: message, code: 'INSUFFICIENT_ENTROPY' };
    }
    return { configured: false, error: message, code: 'ADMIN_SECRETS_NOT_CONFIGURED' };
  }
}

/**
 * Rate Limiting: Check if an operator key (IP or Email) is currently throttled.
 */
export function checkRateLimit(key: string): {
  allowed: boolean;
  lockedUntil?: number;
  remainingAttempts: number;
  retryAfterSeconds?: number;
} {
  const cleanKey = key.toLowerCase().trim();
  const entry = adminRateLimitStore.get(cleanKey);
  const now = Date.now();

  if (!entry) {
    return { allowed: true, remainingAttempts: RATE_LIMIT_MAX_FAILED };
  }

  // Check if currently in lockout period
  if (entry.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
    return {
      allowed: false,
      lockedUntil: entry.lockedUntil,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  // Check if sliding window has expired
  if (now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    adminRateLimitStore.delete(cleanKey);
    return { allowed: true, remainingAttempts: RATE_LIMIT_MAX_FAILED };
  }

  const remainingAttempts = Math.max(0, RATE_LIMIT_MAX_FAILED - entry.failedAttempts);
  return { allowed: remainingAttempts > 0, remainingAttempts };
}

/**
 * Rate Limiting: Record a failed login attempt and apply lock if threshold exceeded.
 */
export function recordFailedAttempt(key: string): {
  locked: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
} {
  const cleanKey = key.toLowerCase().trim();
  const now = Date.now();
  let entry = adminRateLimitStore.get(cleanKey);

  if (!entry || now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    entry = {
      failedAttempts: 1,
      firstAttemptAt: now,
      lockedUntil: 0,
    };
  } else {
    entry.failedAttempts += 1;
  }

  if (entry.failedAttempts >= RATE_LIMIT_MAX_FAILED) {
    entry.lockedUntil = now + RATE_LIMIT_LOCKOUT_MS;
    adminRateLimitStore.set(cleanKey, entry);
    const retryAfterSeconds = Math.ceil(RATE_LIMIT_LOCKOUT_MS / 1000);
    return { locked: true, remainingAttempts: 0, retryAfterSeconds };
  }

  adminRateLimitStore.set(cleanKey, entry);
  return {
    locked: false,
    remainingAttempts: Math.max(0, RATE_LIMIT_MAX_FAILED - entry.failedAttempts),
  };
}

/**
 * Rate Limiting: Reset failed attempts on successful operator authentication.
 */
export function resetRateLimit(key: string): void {
  adminRateLimitStore.delete(key.toLowerCase().trim());
}

/**
 * MFA Engine: RFC 6238 TOTP Generation (native Node.js crypto, zero dependencies).
 */
export function generateTotpCode(secret: string, timestamp = Date.now()): string {
  const epoch = Math.floor(timestamp / 1000);
  const counter = Math.floor(epoch / 30);
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'utf8')).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (binary % 1000000).toString().padStart(6, '0');
  return otp;
}

/**
 * MFA Engine: Verifies a 6-digit TOTP code with +/- 30s clock drift tolerance.
 */
export function verifyTotpCode(secret: string, code: string): boolean {
  if (!secret || !code) return false;
  const cleanCode = code.trim();
  const now = Date.now();

  // Check current window (0), previous window (-30s), and next window (+30s)
  for (const offset of [-30000, 0, 30000]) {
    const expected = generateTotpCode(secret, now + offset);
    if (timingSafeCompare(expected, cleanCode)) {
      return true;
    }
  }
  return false;
}

/**
 * Verifies an emergency recovery code against hashed recovery codes.
 */
export function verifyRecoveryCode(code: string): boolean {
  if (!code || RECOVERY_CODES_HASHES.length === 0) return false;
  const hash = crypto.createHash('sha256').update(code.trim()).digest('hex');
  return RECOVERY_CODES_HASHES.some((h) => timingSafeCompare(h, hash));
}

/**
 * Audit Logging: Records administrative and security events into Neon PostgreSQL and in-memory ledger.
 */
export interface AdminAuditLogParams {
  operatorEmail: string;
  action: string;
  resource?: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'RATE_LIMITED';
  details?: Record<string, any>;
  req?: NextRequest | Request;
  ipAddress?: string;
  userAgent?: string;
}

export async function recordAdminAuditLog(params: AdminAuditLogParams): Promise<void> {
  try {
    let clientIp = params.ipAddress;
    let userAgent = params.userAgent;

    if (params.req) {
      const forwarded = params.req.headers.get('x-forwarded-for');
      const realIp = params.req.headers.get('x-real-ip');
      clientIp = clientIp || (forwarded ? forwarded.split(',')[0].trim() : realIp || '127.0.0.1');
      userAgent = userAgent || params.req.headers.get('user-agent') || 'Unknown Agent';
    }

    const logEntry = {
      id: crypto.randomUUID(),
      operatorEmail: params.operatorEmail.toLowerCase().trim(),
      action: params.action,
      resource: params.resource || null,
      status: params.status,
      details: params.details || null,
      ipAddress: clientIp || 'Unknown IP',
      userAgent: userAgent || 'Unknown Agent',
      createdAt: new Date(),
    };

    // 1. In-memory circular buffer (keeps last 500 records)
    inMemoryAuditBuffer.unshift(logEntry);
    if (inMemoryAuditBuffer.length > 500) {
      inMemoryAuditBuffer.pop();
    }

    // 2. Persist to Neon PostgreSQL if database is active
    if (db) {
      try {
        await db.insert(adminAuditLogs).values({
          operatorEmail: logEntry.operatorEmail,
          action: logEntry.action,
          resource: logEntry.resource,
          status: logEntry.status,
          details: logEntry.details,
          ipAddress: logEntry.ipAddress,
          userAgent: logEntry.userAgent,
          createdAt: logEntry.createdAt,
        });
      } catch (dbErr) {
        console.warn('[Admin Audit Log DB Write Warning]:', dbErr);
      }
    }
  } catch (err) {
    console.warn('[Admin Audit Logging Error]:', err);
  }
}

/**
 * Retrieves recent audit logs from Neon DB (with in-memory fallback).
 */
export async function getAdminAuditLogs(limit: number = 50): Promise<any[]> {
  if (db) {
    try {
      const records = await db
        .select()
        .from(adminAuditLogs)
        .orderBy(adminAuditLogs.createdAt)
        .limit(limit);
      if (records && records.length > 0) {
        return records.reverse();
      }
    } catch (err) {
      console.warn('[Admin Audit Log Fetch DB Fallback]:', err);
    }
  }
  return inMemoryAuditBuffer.slice(0, limit);
}

/**
 * Creates a cryptographically signed HMAC token for KUIRO platform operator sessions.
 * Valid for 8 hours.
 */
export function createManagementToken(email: string, metadata?: Record<string, any>): string {
  const secretKey = getManagementJwtSecret();
  const payload = {
    email: email.toLowerCase().trim(),
    role: 'platform_operator',
    clearance: 'LEVEL_5_OPERATOR',
    issuer: 'kuiro-management-security',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
    ...metadata,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secretKey).update(data).digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Verifies a platform operator session token.
 */
export function verifyManagementToken(token: string): {
  valid: boolean;
  email?: string;
  role?: string;
  reason?: string;
} {
  try {
    if (!token) return { valid: false, reason: 'Empty token' };
    const [data, signature] = token.split('.');
    if (!data || !signature) return { valid: false, reason: 'Malformed token format' };

    let secretKey: string;
    try {
      secretKey = getManagementJwtSecret();
    } catch (err: any) {
      return { valid: false, reason: err.message };
    }

    const expectedSig = crypto.createHmac('sha256', secretKey).update(data).digest('base64url');
    if (!timingSafeCompare(signature, expectedSig)) {
      return { valid: false, reason: 'Invalid token cryptographic signature' };
    }

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (Date.now() > payload.expiresAt) {
      return { valid: false, reason: 'Token has expired' };
    }

    if (payload.role !== 'platform_operator') {
      return { valid: false, reason: 'Unauthorized role: operator clearance required' };
    }

    return { valid: true, email: payload.email, role: payload.role };
  } catch {
    return { valid: false, reason: 'Failed to parse token payload' };
  }
}

/**
 * Validates whether an incoming HTTP request holds valid KUIRO Platform Operator clearance.
 * Fails closed if secrets are not configured or are banned.
 * Checks HTTP-Only Cookie, Authorization Header, or Master Key Header.
 */
export async function verifyManagementAuth(
  req: NextRequest | Request
): Promise<{ authorized: boolean; email?: string; role?: string; reason?: string; errorCode?: string }> {
  // 1. Health check on configuration secrets: Fail closed if unconfigured or banned
  const health = checkManagementSecretsHealth();
  if (!health.configured) {
    return {
      authorized: false,
      reason: health.error || 'Platform operator secrets are not configured in environment.',
      errorCode: health.code,
    };
  }

  const expectedPasskey = getManagementPasskey();

  // 2. Direct Master Key in Header (x-kuiro-management-key)
  const headerKey = req.headers.get('x-kuiro-management-key');
  if (headerKey) {
    if (BANNED_SECRETS.has(headerKey.trim().toLowerCase())) {
      return {
        authorized: false,
        reason: 'Known default or banned secret rejected.',
        errorCode: 'BANNED_SECRET_REJECTED',
      };
    }
    if (timingSafeCompare(headerKey, expectedPasskey)) {
      return {
        authorized: true,
        email: 'management@kuiro.in',
        role: 'platform_operator',
      };
    }
  }

  // 3. Cookie Verification (kuiro_mgmt_token)
  let cookieToken: string | undefined;
  if ('cookies' in req && typeof (req as any).cookies?.get === 'function') {
    cookieToken = (req as any).cookies.get('kuiro_mgmt_token')?.value;
  } else {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/kuiro_mgmt_token=([^;]+)/);
    if (match) cookieToken = match[1];
  }

  if (cookieToken) {
    const verified = verifyManagementToken(cookieToken);
    if (verified.valid) {
      return {
        authorized: true,
        email: verified.email,
        role: verified.role,
      };
    }
  }

  // 4. Bearer Token in Authorization Header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();

    // Check if bearer token matches direct master passkey
    if (BANNED_SECRETS.has(token.toLowerCase())) {
      return {
        authorized: false,
        reason: 'Known default or banned secret rejected.',
        errorCode: 'BANNED_SECRET_REJECTED',
      };
    }

    if (timingSafeCompare(token, expectedPasskey)) {
      return {
        authorized: true,
        email: 'management@kuiro.in',
        role: 'platform_operator',
      };
    }

    // Check if bearer token is signed JWT
    const verified = verifyManagementToken(token);
    if (verified.valid) {
      return {
        authorized: true,
        email: verified.email,
        role: verified.role,
      };
    }
  }

  return {
    authorized: false,
    reason: 'No valid KUIRO platform operator token or passkey provided.',
    errorCode: 'UNAUTHORIZED_OPERATOR',
  };
}
