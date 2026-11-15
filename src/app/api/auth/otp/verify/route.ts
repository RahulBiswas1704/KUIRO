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
    const { email, phone, identifier, otp, type = 'MAGIC_LINK', name, isSignup = false } = body;

    const rawIdentifier = (email || phone || identifier || '').trim();
    if (!rawIdentifier) {
      return NextResponse.json({ error: 'Email address or phone number is required.' }, { status: 400 });
    }

    if (!otp || typeof otp !== 'string' || !otp.trim()) {
      return NextResponse.json({ error: '6-digit verification code is required.' }, { status: 400 });
    }

    // Normalize identifier
    let cleanIdentifier = rawIdentifier.toLowerCase();
    const isPhone = /^\+?[0-9\s\-()]{10,15}$/.test(rawIdentifier);
    if (isPhone) {
      const digits = rawIdentifier.replace(/[^0-9]/g, '');
      cleanIdentifier = digits.length === 10 ? `+91${digits}` : `+${digits}`;
    }

    const ipAddress = req.headers.get('x-forwarded-for') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    // Verify OTP Token
    const verification = await verifyAndConsumeToken(cleanIdentifier, otp.trim(), type as any);
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    // If MAGIC_LINK / OTP Login type, establish or create authenticated session
    if (type === 'MAGIC_LINK' || type === 'EMAIL_VERIFICATION') {
      const database = db;
      if (!database) {
        return NextResponse.json({ error: 'Database service is unavailable.' }, { status: 503 });
      }

      // Check user by email or phone email alias
      const searchEmail = isPhone ? `${cleanIdentifier.replace(/[^0-9]/g, '')}@phone.kuiro.in` : cleanIdentifier;
      let [userRecord] = await database.select().from(users).where(eq(users.email, searchEmail)).limit(1);

      // If user doesn't exist, create user immediately for frictionless signup!
      if (!userRecord) {
        const displayName = (name || '').trim() || (isPhone ? `Founder (${cleanIdentifier.slice(-4)})` : cleanIdentifier.split('@')[0]);
        [userRecord] = await database.insert(users).values({
          name: displayName,
          email: searchEmail,
          emailVerified: true,
          role: 'Founder',
        }).returning();
      } else if (!userRecord.emailVerified) {
        await database.update(users).set({ emailVerified: true }).where(eq(users.id, userRecord.id));
      }

      let [workspaceRecord] = await database.select().from(workspaces).where(eq(workspaces.ownerId, userRecord.id)).limit(1);
      if (!workspaceRecord) {
        [workspaceRecord] = await database.insert(workspaces).values({
          name: `${userRecord.name}'s Workspace`,
          ownerId: userRecord.id,
          subscriptionTier: 'GROWTH',
          whatsappAdminPhone: isPhone ? cleanIdentifier : null,
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
