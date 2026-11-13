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
  const demoEmail = 'dr.sharma@apexclinic.in';

  if (!database) {
    return {
      user: {
        id: 'usr_demo_101',
        name: 'Dr. Rajesh Sharma',
        email: demoEmail,
        role: 'Founder & Clinic Director',
        emailVerified: true,
      },
      workspace: {
        id: 'ws-apex-101',
        name: 'Dr. Sharma Dental Clinics',
        subscriptionTier: 'GROWTH',
        whatsappAdminPhone: '+919876543210',
      },
    };
  }

  // 1. Check if user already exists
  let [demoUser] = await database.select().from(users).where(eq(users.email, demoEmail)).limit(1);

  if (!demoUser) {
    const demoPasswordHash = hashPassword('DemoSharma2026!');
    [demoUser] = await database
      .insert(users)
      .values({
        name: 'Dr. Rajesh Sharma',
        email: demoEmail,
        passwordHash: demoPasswordHash,
        role: 'Founder & Clinic Director',
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
        name: 'Dr. Sharma Dental Clinics',
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
      industry: 'Healthcare & Preventive Diagnostics',
      websiteUrl: 'https://drsharmadental.in',
      toneOfVoice: {
        style: 'clinical_empathetic',
        formality: 'semi-formal',
        archetype: 'compassionate_caregiver',
        samplePhrases: [
          'Empathetic & Caring',
          'Clinically Authoritative',
          'Jargon-Free',
          'Culturally Warm (Indian Family Values)',
        ],
      },
      visualIdentity: {
        primaryHex: '#0D9488',
        secondaryHex: '#0F172A',
        accentHex: '#FF7A00',
        fontFamily: 'Sora',
      },
      contentPillars: [
        { name: 'Preventive Care', weight: 40, description: 'Early diagnosis and hygiene' },
        { name: 'Patient Success Stories', weight: 30, description: 'Real testimonials and smiles' },
        { name: 'Seasonal Health Advice', weight: 30, description: 'Festival & weather wellness' },
      ],
      negativeConstraints: [
        'Never prescribe medicine without an in-person physical clinical exam',
        'Avoid scare tactics or exaggerated claims',
      ],
    });
  }

  return {
    user: {
      id: demoUser.id,
      name: demoUser.name,
      email: demoUser.email,
      role: demoUser.role || 'Founder & Clinic Director',
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

