import { NextRequest, NextResponse } from 'next/server';
import { db, users, workspaces } from '@/db';
import { eq } from 'drizzle-orm';
import {
  verifyPassword,
  createDatabaseSession,
  ensureDemoUser,
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  clearFailedLoginAttempts,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_DAYS,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, isDemo } = body;
    const ipAddress = req.headers.get('x-forwarded-for') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    const database = db;
    if (!database) {
      return NextResponse.json(
        { error: 'Database service is temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

    // 1. Explicit 1-Click Demo Login (Dr. Rajesh Sharma)
    if (isDemo === true) {
      const demoData = await ensureDemoUser();
      const { token, expiresAt } = await createDatabaseSession(demoData.user.id, {
        ipAddress,
        userAgent,
      });

      const response = NextResponse.json({
        success: true,
        user: { ...demoData.user, isDemo: true },
        workspace: demoData.workspace,
        sessionToken: token,
        expiresAt,
      });

      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: token,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
      });

      return response;
    }

    const clientIp = ipAddress || 'unknown';

    // 2. Strict Credential Validation (Preventing Passwordless Access)
    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      return NextResponse.json(
        { error: 'Password is required to sign in.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 3. Brute Force Rate Limiting
    const rateCheck = checkLoginRateLimit(cleanEmail, clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Account temporarily locked for security. Please retry in ${rateCheck.retryAfterSeconds} seconds.`,
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // Find User in Neon DB
    const [userRecord] = await database
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);

    // Generic error for non-existent account or account without password hash
    if (!userRecord || !userRecord.passwordHash) {
      recordFailedLoginAttempt(cleanEmail, clientIp);
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Verify Password Cryptographically in Constant Time
    const isValid = verifyPassword(password, userRecord.passwordHash);
    if (!isValid) {
      recordFailedLoginAttempt(cleanEmail, clientIp);
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Reset failed login attempts on successful credentials
    clearFailedLoginAttempts(cleanEmail, clientIp);

    // Find or Provision Primary Workspace for user
    let [workspaceRecord] = await database
      .select()
      .from(workspaces)
      .where(eq(workspaces.ownerId, userRecord.id))
      .limit(1);

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

    // Create Persistent Database Session in Neon DB
    const { token, expiresAt } = await createDatabaseSession(userRecord.id, {
      ipAddress,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        role: userRecord.role || 'Founder',
        emailVerified: userRecord.emailVerified,
      },
      workspace: {
        id: workspaceRecord.id,
        name: workspaceRecord.name,
        subscriptionTier: workspaceRecord.subscriptionTier,
        whatsappAdminPhone: workspaceRecord.whatsappAdminPhone,
      },
      sessionToken: token,
      expiresAt,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('[API /api/auth/login] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Login failed.' },
      { status: 500 }
    );
  }
}
