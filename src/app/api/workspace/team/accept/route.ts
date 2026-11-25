import { NextRequest, NextResponse } from 'next/server';
import { db, users, workspaces, workspaceMembers, accounts } from '@/db';
import { eq, and } from 'drizzle-orm';
import {
  hashPassword,
  validatePasswordStrength,
  createDatabaseSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_DAYS,
} from '@/lib/auth';
import { verifyTeamInviteToken } from '@/lib/email/invitation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workspace/team/accept?token=...
 * Validates a signed team invitation link and returns workspace/user metadata before acceptance.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ valid: false, error: 'Missing invitation token.' }, { status: 400 });
    }

    const verification = verifyTeamInviteToken(token);
    if (!verification.valid || !verification.payload) {
      return NextResponse.json(
        { valid: false, error: verification.error || 'Invalid or expired invitation token.' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json({ valid: false, error: 'Database service unavailable.' }, { status: 503 });
    }

    const { workspaceId, userId, email, role } = verification.payload;

    const [[ws], [user], [membership]] = await Promise.all([
      db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1),
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, userId)
          )
        )
        .limit(1),
    ]);

    if (!ws || !user || !membership) {
      return NextResponse.json(
        { valid: false, error: 'This invitation has been revoked or the workspace no longer exists.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: user.email || email,
      name: user.name,
      workspaceName: ws.name,
      workspaceId: ws.id,
      role,
      hasPassword: Boolean(user.passwordHash),
    });
  } catch (err: any) {
    console.error('[Team Invite Accept GET Error]:', err);
    return NextResponse.json(
      { valid: false, error: err?.message || 'Failed to validate invitation.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspace/team/accept
 * Verifies signed invitation token, sets user password (if newly provisioned), verifies email,
 * creates an authenticated DB session, and logs the user into their invited workspace.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, name, password } = body;

    const verification = verifyTeamInviteToken(token);
    if (!verification.valid || !verification.payload) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Invalid or expired invitation token.' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable.' }, { status: 503 });
    }

    const { workspaceId, userId, role } = verification.payload;

    const [[ws], [user], [membership]] = await Promise.all([
      db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1),
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, userId)
          )
        )
        .limit(1),
    ]);

    if (!ws || !user || !membership) {
      return NextResponse.json(
        { success: false, error: 'This invitation has been revoked or no longer exists.' },
        { status: 404 }
      );
    }

    let nextPasswordHash = user.passwordHash;
    if (!nextPasswordHash || (typeof password === 'string' && password.length > 0)) {
      const strength = validatePasswordStrength(password || '');
      if (!strength.valid) {
        return NextResponse.json(
          { success: false, error: strength.error || 'Please choose a password of at least 8 characters.' },
          { status: 400 }
        );
      }
      nextPasswordHash = hashPassword(password);
    }

    const nextName = typeof name === 'string' && name.trim() ? name.trim() : user.name;

    // 1. Activate user record
    const [updatedUser] = await db
      .update(users)
      .set({
        name: nextName,
        passwordHash: nextPasswordHash,
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    // 2. Ensure credentials account link exists
    const [existingAccount] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.providerId, 'credentials'), eq(accounts.accountId, user.email)))
      .limit(1);

    if (!existingAccount) {
      await db.insert(accounts).values({
        userId: user.id,
        accountId: user.email,
        providerId: 'credentials',
      });
    }

    // 3. Create database session & issue HTTP-only session cookie
    const ipAddress = req.headers.get('x-forwarded-for') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;
    const { token: sessionToken, expiresAt } = await createDatabaseSession(user.id, {
      ipAddress,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      message: `Welcome to ${ws.name}! Your team access (${role}) is now active.`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role || role,
        emailVerified: true,
      },
      workspace: {
        id: ws.id,
        name: ws.name,
        subscriptionTier: ws.subscriptionTier,
      },
      expiresAt,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('[Team Invite Accept POST Error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to accept workspace invitation.' },
      { status: 500 }
    );
  }
}
