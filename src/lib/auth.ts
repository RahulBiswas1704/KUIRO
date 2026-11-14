import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { db, users, workspaces, sessions, accounts, brandProfiles } from '@/db';
import { eq, and, gt } from 'drizzle-orm';

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

/**
 * Hash a plain text password with a unique salt using scrypt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Validates minimum password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters in length.' };
  }
  return { valid: true };
}

/**
 * Verify a plain text password against stored salt:hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (!storedHash || !storedHash.includes(':')) return false;
    const [salt, key] = storedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
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
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
  const sessionId = `sess_${crypto.randomUUID()}`;

  const database = db;
  if (database) {
    await database.insert(sessions).values({
      id: sessionId,
      userId,
      token,
      expiresAt,
      ipAddress: options?.ipAddress || null,
      userAgent: options?.userAgent || null,
    });
  }

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

/**
 * Enforces API-level authentication and multi-tenant workspace authorization.
 * Verifies that the requester has an active, valid session AND that they have permission
 * to read/write to the requested workspace (preventing BOLA / IDOR attacks).
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

  const primaryWorkspaceId = session.workspace.id;

  // If a specific workspace was requested and differs from the user's current session workspace
  if (requestedWorkspaceId && requestedWorkspaceId !== primaryWorkspaceId) {
    const database = db;
    if (!database) {
      return {
        authorized: false,
        error: 'Database connection unavailable for workspace authorization check.',
        status: 503,
      };
    }

    const [matchingWorkspace] = await database
      .select()
      .from(workspaces)
      .where(and(eq(workspaces.id, requestedWorkspaceId), eq(workspaces.ownerId, session.user.id)))
      .limit(1);

    if (!matchingWorkspace) {
      return {
        authorized: false,
        error: 'Forbidden: You do not have permission to access or modify this workspace.',
        status: 403,
      };
    }

    return {
      authorized: true,
      session,
      workspaceId: matchingWorkspace.id,
      status: 200,
    };
  }

  return {
    authorized: true,
    session,
    workspaceId: primaryWorkspaceId,
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
 * Ensures the pre-configured Demo Account (Dr. Rajesh Sharma) exists in Neon DB
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
    return {
      user: {
        id: 'usr_demo_101',
        name: 'Rajesh Sharma',
        email: demoEmail,
        role: 'Founder & Retail Director',
        emailVerified: true,
      },
      workspace: {
        id: 'ws-sharma-101',
        name: 'Sharma Heritage Retail & Studio',
        subscriptionTier: 'GROWTH',
        whatsappAdminPhone: '+919876543210',
      },
    };
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

