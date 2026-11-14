import { NextRequest, NextResponse } from 'next/server';
import { db, users, workspaces } from '@/db';
import { eq } from 'drizzle-orm';
import {
  verifyAndConsumeToken,
  createDatabaseSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_DAYS,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, type = 'MAGIC_LINK' } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    if (!otp || typeof otp !== 'string' || !otp.trim()) {
      return NextResponse.json({ error: '6-digit verification code is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const ipAddress = req.headers.get('x-forwarded-for') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    // Verify OTP Token
    const verification = await verifyAndConsumeToken(cleanEmail, otp.trim(), type as any);
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    // If MAGIC_LINK type, establish authenticated session
    if (type === 'MAGIC_LINK') {
      const database = db;
      if (!database) {
        return NextResponse.json({ error: 'Database service is unavailable.' }, { status: 503 });
      }

      const [userRecord] = await database.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
      if (!userRecord) {
        return NextResponse.json({ error: 'No account found for this email address.' }, { status: 404 });
      }

      let [workspaceRecord] = await database.select().from(workspaces).where(eq(workspaces.ownerId, userRecord.id)).limit(1);
      if (!workspaceRecord) {
        [workspaceRecord] = await database.insert(workspaces).values({
          name: `${userRecord.name}'s Workspace`,
          ownerId: userRecord.id,
          subscriptionTier: 'GROWTH',
        }).returning();
      }

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
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code confirmed successfully.',
    });
  } catch (error: any) {
    console.error('[API /api/auth/otp/verify] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Verification failed.' },
      { status: 500 }
    );
  }
}
