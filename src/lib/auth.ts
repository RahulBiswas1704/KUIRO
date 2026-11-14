import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { db, users, workspaces, sessions, accounts, brandProfiles, verificationTokens } from '@/db';
import { eq, and, gt, desc } from 'drizzle-orm';

export const SESSION_COOKIE_NAME = 'kuiro_session';
export const SESSION_MAX_AGE_DAYS = 30;

export interface SessionData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string | null;
    emailVerified: boolean | null;
    image: string | null;
  };
  workspace: {
    id: string;
    name: string;
    subscriptionTier: string;
    whatsappAdminPhone: string | null;
  };
  token: string;
  expiresAt: Date;
}

// ============================================================================
// RATE LIMITING & THROTTLING (Brute-Force Attack Prevention)
// ============================================================================
interface RateLimitEntry {
  attempts: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

const loginAttempts = new Map<string, RateLimitEntry>();
const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function checkLoginRateLimit(identifier: string, ip?: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const keys = [identifier.trim().toLowerCase()];
  if (ip && ip !== 'unknown') keys.push(`ip:${ip}`);

  for (const key of keys) {
    const entry = loginAttempts.get(key);
    if (!entry) continue;

    // Check if currently blocked
    if (entry.blockedUntil && entry.blockedUntil > now) {
      const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
      return { allowed: false, retryAfterSeconds };
    }

    // Reset window if expired
    if (now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
      loginAttempts.delete(key);
    }
  }

  return { allowed: true };
}

export function recordFailedLoginAttempt(identifier: string, ip?: string): void {
  const now = Date.now();
  const keys = [identifier.trim().toLowerCase()];
  if (ip && ip !== 'unknown') keys.push(`ip:${ip}`);

  for (const key of keys) {
    const entry = loginAttempts.get(key);
    if (!entry || now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
      loginAttempts.set(key, { attempts: 1, firstAttemptAt: now });
    } else {
      entry.attempts += 1;
      if (entry.attempts >= MAX_LOGIN_ATTEMPTS) {
        entry.blockedUntil = now + BLOCK_DURATION_MS;
      }
    }
  }
}

export function clearFailedLoginAttempts(identifier: string, ip?: string): void {
  loginAttempts.delete(identifier.trim().toLowerCase());
  if (ip && ip !== 'unknown') loginAttempts.delete(`ip:${ip}`);
}

// ============================================================================
// PASSWORD SECURITY & CRYPTOGRAPHY
// ============================================================================

/**
 * Validates password strength policy:
 * - Must be non-empty string.
 * - Minimum 8 characters, maximum 128 characters.
 */
export function validatePasswordStrength(password: unknown): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required to authenticate.' };
  }
  const trimmed = password.trim();
  if (trimmed.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters in length.' };
  }
  if (trimmed.length > 128) {
    return { valid: false, error: 'Password cannot exceed 128 characters in length.' };
  }
  return { valid: true };
}

/**
 * Hash a plain text password with a unique salt using scrypt (N: 16384, r: 8, p: 1)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

/**
 * Verify a plain text password against stored hash using constant-time comparison
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (!storedHash || typeof storedHash !== 'string') return false;

    let salt: string;
    let key: string;

    const parts = storedHash.split(':');
    if (parts.length === 3 && parts[0] === 'scrypt') {
      salt = parts[1];
      key = parts[2];
    } else if (parts.length === 2) {
      salt = parts[0];
      key = parts[1];
    } else {
      return false;
    }

    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
    if (keyBuffer.length !== derivedKey.length) return false;
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// ============================================================================
// VERIFICATION TOKENS & TIME-LIMITED OTP ENGINE
// ============================================================================
interface MemoryToken {
  id: string;
  identifier: string;
  tokenHash: string;
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'MAGIC_LINK';
  expiresAt: Date;
  usedAt: Date | null;
}

const memoryVerificationTokens = new Map<string, MemoryToken>();

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

export function generateNumericOtp(length = 6): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

/**
 * Issues a cryptographically random, time-limited OTP (10 minutes)
 */
export async function createVerificationToken(
  identifier: string,
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'MAGIC_LINK',
  expiryMinutes = 10
): Promise<{ rawToken: string; expiresAt: Date }> {
  const cleanIdentifier = identifier.trim().toLowerCase();
  const rawToken = generateNumericOtp(6);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  const tokenId = `vt_${crypto.randomUUID()}`;

  const database = db;
  if (database) {
    try {
      await database.insert(verificationTokens).values({
        id: tokenId,
        identifier: cleanIdentifier,
        token: tokenHash,
        type,
        expiresAt,
        usedAt: null,
      });
    } catch (dbErr) {
      console.warn('[VerificationTokens] DB insert fallback to memory cache:', dbErr);
    }
  }

  // Resilient memory cache
  memoryVerificationTokens.set(`${cleanIdentifier}:${type}`, {
    id: tokenId,
    identifier: cleanIdentifier,
    tokenHash,
    type,
    expiresAt,
    usedAt: null,
  });

  return { rawToken, expiresAt };
}

/**
 * Validates and consumes an OTP:
 * - Rejects expired OTP
 * - Rejects reused OTP (single-use constraint)
 * - Compares hash in constant time
 */
export async function verifyAndConsumeToken(
  identifier: string,
  rawToken: string,
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'MAGIC_LINK'
): Promise<{ valid: boolean; error?: string }> {
  if (!rawToken || !identifier) {
    return { valid: false, error: 'Verification code and email are required.' };
  }

  const cleanIdentifier = identifier.trim().toLowerCase();
  const submittedHash = hashToken(rawToken);
  const database = db;
  const now = new Date();

  // 1. Try Database First
  if (database) {
    try {
      const [tokenRecord] = await database
        .select()
        .from(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, cleanIdentifier),
            eq(verificationTokens.type, type)
          )
        )
        .orderBy(desc(verificationTokens.createdAt))
        .limit(1);

      if (tokenRecord) {
        // Reused OTP -> Rejected
        if (tokenRecord.usedAt !== null) {
          return { valid: false, error: 'This verification code has already been used. Please request a new code.' };
        }

        // Expired OTP -> Rejected
        if (tokenRecord.expiresAt < now) {
          return { valid: false, error: 'Verification code has expired. Please request a new code.' };
        }

        // Constant time comparison of hashes
        const storedHashBuf = Buffer.from(tokenRecord.token, 'hex');
        const submittedHashBuf = Buffer.from(submittedHash, 'hex');
        const isMatch = storedHashBuf.length === submittedHashBuf.length && crypto.timingSafeEqual(storedHashBuf, submittedHashBuf);

        if (!isMatch) {
          return { valid: false, error: 'Invalid verification code.' };
        }

        // Mark consumed immediately
        await database
          .update(verificationTokens)
          .set({ usedAt: now })
          .where(eq(verificationTokens.id, tokenRecord.id));

        return { valid: true };
      }
    } catch (dbErr) {
      console.warn('[VerificationTokens] DB query fallback to memory cache:', dbErr);
    }
  }

  // 2. Fallback to resilient in-memory token registry
  const memToken = memoryVerificationTokens.get(`${cleanIdentifier}:${type}`);
  if (!memToken) {
    return { valid: false, error: 'Invalid verification code or no active code found.' };
  }

  if (memToken.usedAt !== null) {
    return { valid: false, error: 'This verification code has already been used. Please request a new code.' };
  }

  if (memToken.expiresAt < now) {
    return { valid: false, error: 'Verification code has expired. Please request a new code.' };
  }

  const storedBuf = Buffer.from(memToken.tokenHash, 'hex');
  const submittedBuf = Buffer.from(submittedHash, 'hex');
  const isMatch = storedBuf.length === submittedBuf.length && crypto.timingSafeEqual(storedBuf, submittedBuf);

  if (!isMatch) {
    return { valid: false, error: 'Invalid verification code.' };
  }

  memToken.usedAt = now;
  return { valid: true };
}

/**
 * Revokes all active database sessions for a given user (called upon password reset)
 */
export async function revokeAllUserSessions(userId: string): Promise<number> {
  const database = db;
  if (!database || !userId) return 0;
  try {
    await database.delete(sessions).where(eq(sessions.userId, userId));
    return 1;
  } catch (err) {
    console.error('[Auth] Failed to revoke user sessions:', err);
    return 0;
  }
}

/**
 * Generates an unguessable 64-character session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Creates a persistent database session in Neon PostgreSQL
 */
export async function createDatabaseSession(
  userId: string,
  options?: { ipAddress?: string; userAgent?: string }
): Promise<{ token: string; expiresAt: Date }> {
  const database = db;
  if (!database) {
    throw new Error('Database service unavailable. Cannot persist authentication session.');
  }

  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
  const sessionId = `sess_${crypto.randomUUID()}`;

  await database.insert(sessions).values({
    id: sessionId,
    userId,
    token,
    expiresAt,
    ipAddress: options?.ipAddress || null,
    userAgent: options?.userAgent || null,
  });

  return { token, expiresAt };
}

/**
 * Validates a session token against Neon DB and returns the authenticated user + workspace
 */
export async function getSession(token: string): Promise<SessionData | null> {
  if (!token) return null;
  const database = db;
  if (!database) return null;

  try {
    const [sessionRecord] = await database
      .select()
      .from(sessions)
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
      .limit(1);

    if (!sessionRecord) return null;

    // Load User
    const [userRecord] = await database
      .select()
      .from(users)
      .where(eq(users.id, sessionRecord.userId))
      .limit(1);

    if (!userRecord) return null;

    // Load User's Primary Workspace
    let [workspaceRecord] = await database
      .select()
      .from(workspaces)
      .where(eq(workspaces.ownerId, userRecord.id))
      .limit(1);

    // If workspace missing, auto-provision default workspace
    if (!workspaceRecord) {
      [workspaceRecord] = await database
        .insert(workspaces)
        .values({
          name: `${userRecord.name}'s Workspace`,
          ownerId: userRecord.id,
          subscriptionTier: 'GROWTH',
        })
        .returning();
    }

    return {
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        role: userRecord.role || 'Founder',
        emailVerified: userRecord.emailVerified,
        image: userRecord.image,
      },
      workspace: {
        id: workspaceRecord.id,
        name: workspaceRecord.name,
        subscriptionTier: workspaceRecord.subscriptionTier,
        whatsappAdminPhone: workspaceRecord.whatsappAdminPhone,
      },
      token: sessionRecord.token,
      expiresAt: sessionRecord.expiresAt,
    };
  } catch (err) {
    console.error('[Auth] Failed to get session:', err);
    return null;
  }
}

/**
 * Extracts and validates session from Next.js Request cookies or Bearer Authorization header
 */
export async function getSessionFromRequest(req: NextRequest | Request): Promise<SessionData | null> {
  let token: string | undefined;

  // 1. Try Cookie
  if ('cookies' in req && typeof req.cookies?.get === 'function') {
    token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    // Standard Request headers
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
      if (match) {
        token = match.split('=')[1];
      }
    }
  }

  // 2. Fallback to Bearer token in Authorization header
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) return null;
  return getSession(token);
}

export interface AuthorizationResult {
  authorized: boolean;
  session?: SessionData;
  workspaceId?: string;
  error?: string;
  status: number;
}

export interface WorkspaceMembership {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  workspace: {
    id: string;
    name: string;
    ownerId: string;
    subscriptionTier: string;
    whatsappAdminPhone?: string | null;
  };
}

/**
 * Finds workspace membership for a user.
 * Proves that the user owns or is a verified member of the target workspace in Neon PostgreSQL.
 */
export async function findWorkspaceMembership(
  userId: string,
  workspaceId: string
): Promise<WorkspaceMembership | null> {
  const database = db;
  if (!database || !userId || !workspaceId) return null;

  try {
    const [matchingWorkspace] = await database
      .select()
      .from(workspaces)
      .where(and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, userId)))
      .limit(1);

    if (!matchingWorkspace) return null;

    return {
      id: `mem_${matchingWorkspace.id}_${userId}`,
      workspaceId: matchingWorkspace.id,
      userId,
      role: 'OWNER',
      workspace: matchingWorkspace,
    };
  } catch (err) {
    console.error('[Auth] Failed to find workspace membership:', err);
    return null;
  }
}

/**
 * Shared API session requirement helper.
 * Throws an Error with 'UNAUTHENTICATED' if no valid session is present.
 */
export async function requireSession(req: NextRequest | Request): Promise<SessionData> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    throw new Error('UNAUTHENTICATED');
  }
  return session;
}

/**
 * Shared API workspace access requirement helper.
 * Throws an Error with 'UNAUTHENTICATED' or 'FORBIDDEN'.
 */
export async function requireWorkspaceAccess(
  req: NextRequest | Request,
  workspaceId?: string | null
): Promise<{ session: SessionData; membership: WorkspaceMembership; workspaceId: string }> {
  const session = await requireSession(req);
  const targetId = workspaceId || session.workspace?.id;

  if (!targetId) {
    throw new Error('WORKSPACE_REQUIRED');
  }

  const membership = await findWorkspaceMembership(session.user.id, targetId);
  if (!membership) {
    throw new Error('FORBIDDEN');
  }

  return { session, membership, workspaceId: targetId };
}

/**
 * Enforces API-level authentication and strict multi-tenant workspace isolation.
 * Proves that the authenticated user strictly OWNS the target workspace in Neon PostgreSQL
 * before granting any read or modification capabilities.
 */
export async function authorizeWorkspace(
  req: NextRequest | Request,
  requestedWorkspaceId?: string | null
): Promise<AuthorizationResult> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return {
      authorized: false,
      error: 'Authentication required. Active session token missing or expired.',
      status: 401,
    };
  }

  const targetId = requestedWorkspaceId || session.workspace?.id;
  if (!targetId) {
    return {
      authorized: false,
      error: 'Workspace ID required.',
      status: 400,
    };
  }

  const membership = await findWorkspaceMembership(session.user.id, targetId);
  if (!membership) {
    return {
      authorized: false,
      error: 'Forbidden: Tenant isolation violation. You do not own or have permission to access or modify this workspace.',
      status: 403,
    };
  }

  return {
    authorized: true,
    session,
    workspaceId: membership.workspaceId,
    status: 200,
  };
}

/**
 * Deletes a session from Neon DB (Logout)
 */
export async function destroySession(token: string): Promise<boolean> {
  const database = db;
  if (!database || !token) return true;

  try {
    await database.delete(sessions).where(eq(sessions.token, token));
    return true;
  } catch (err) {
    console.error('[Auth] Failed to destroy session:', err);
    return false;
  }
}

/**
 * Ensures the pre-configured Demo Account (Rajesh Sharma) exists in Neon DB.
 * Strictly requires database connection; throws error if database is unavailable.
 */
export async function ensureDemoUser(): Promise<{
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
  workspace: {
    id: string;
    name: string;
    subscriptionTier: string;
    whatsappAdminPhone: string | null;
  };
}> {
  const database = db;
  const demoEmail = 'rajesh@sharmaheritage.in';

  if (!database) {
    throw new Error('Database service unavailable. Cannot initialize demo environment.');
  }

  // 1. Check if user already exists
  let [demoUser] = await database
    .select()
    .from(users)
    .where(eq(users.email, demoEmail))
    .limit(1);

  // Backwards compat: if previously seeded under legacy email, find that too
  if (!demoUser) {
    [demoUser] = await database
      .select()
      .from(users)
      .where(eq(users.email, 'dr.sharma@apexclinic.in'))
      .limit(1);
  }

  if (!demoUser) {
    const demoPasswordHash = hashPassword('DemoSharma2026!');
    [demoUser] = await database
      .insert(users)
      .values({
        name: 'Rajesh Sharma',
        email: demoEmail,
        passwordHash: demoPasswordHash,
        role: 'Founder & Retail Director',
        emailVerified: true,
      })
      .returning();
  }

  // 2. Check workspace
  let [demoWorkspace] = await database
    .select()
    .from(workspaces)
    .where(eq(workspaces.ownerId, demoUser.id))
    .limit(1);

  if (!demoWorkspace) {
    [demoWorkspace] = await database
      .insert(workspaces)
      .values({
        name: 'Sharma Heritage Retail & Studio',
        ownerId: demoUser.id,
        subscriptionTier: 'GROWTH',
        whatsappAdminPhone: '+919876543210',
      })
      .returning();
  }

  // 3. Check Brand Profile
  const [existingProfile] = await database
    .select()
    .from(brandProfiles)
    .where(eq(brandProfiles.workspaceId, demoWorkspace.id))
    .limit(1);

  if (!existingProfile) {
    await database.insert(brandProfiles).values({
      workspaceId: demoWorkspace.id,
      industry: 'Retail, Commerce & Professional Services',
      websiteUrl: 'https://sharmaheritage.in',
      toneOfVoice: {
        style: 'professional_warm',
        formality: 'semi-formal',
        archetype: 'trusted_craftsman_and_advisor',
        samplePhrases: [
          'Artisanal & Authentic',
          'Customer-First & Transparent',
          'Jargon-Free Clarity',
          'Culturally Warm & Celebratory (Festivals & Milestones)',
        ],
      },
      visualIdentity: {
        primaryHex: '#0B0F14',
        secondaryHex: '#FF7A00',
        accentHex: '#10B981',
        fontFamily: 'Sora',
      },
      contentPillars: [
        { name: 'Artisan Craft & Silk Heritage', weight: 40, description: 'Behind the scenes weaving and quality craft' },
        { name: 'Customer Stories & Bespoke Styling', weight: 30, description: 'Real testimonials and festive wardrobes' },
        { name: 'Festive Collections & Drops', weight: 30, description: 'Seasonal launches and volume gifting' },
      ],
      negativeConstraints: [
        'Never denigrate competitors or publish unverified claims',
        'Ensure all pricing and offers carry explicit validity terms',
      ],
    });
  }

  return {
    user: {
      id: demoUser.id,
      name: demoUser.name,
      email: demoUser.email,
      role: demoUser.role || 'Founder & Retail Director',
      emailVerified: demoUser.emailVerified ?? true,
    },
    workspace: {
      id: demoWorkspace.id,
      name: demoWorkspace.name,
      subscriptionTier: demoWorkspace.subscriptionTier,
      whatsappAdminPhone: demoWorkspace.whatsappAdminPhone,
    },
  };
}

