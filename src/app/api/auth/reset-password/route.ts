import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import {
  verifyAndConsumeToken,
  validatePasswordStrength,
  hashPassword,
  revokeAllUserSessions,
  clearFailedLoginAttempts,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, newPassword } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    if (!otp || typeof otp !== 'string' || !otp.trim()) {
      return NextResponse.json({ error: 'Verification code is required.' }, { status: 400 });
    }

    // Validate New Password Policy
    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.error || 'Password must be at least 8 characters in length.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

    // 1. Verify and Consume Reset OTP (Single-Use, Expiration & Hash Check)
    const verification = await verifyAndConsumeToken(cleanEmail, otp.trim(), 'PASSWORD_RESET');
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || 'Invalid or expired password reset code.' },
        { status: 400 }
      );
    }

    const database = db;
    if (!database) {
      return NextResponse.json({ error: 'Database service is unavailable.' }, { status: 503 });
    }

    // 2. Locate User Account
    const [userRecord] = await database.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
    if (!userRecord) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    // 3. Hash New Password with Unique Salt
    const newPasswordHash = hashPassword(newPassword);

    // 4. Update Password Hash in Neon DB
    await database
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, userRecord.id));

    // 5. Revoke ALL Active Sessions across Devices for Security
    await revokeAllUserSessions(userRecord.id);

    // 6. Clear any brute-force throttles for this account
    clearFailedLoginAttempts(cleanEmail, clientIp);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. All active sessions have been revoked. Please sign in with your new password.',
    });
  } catch (error: any) {
    console.error('[API /api/auth/reset-password] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Password reset failed.' },
      { status: 500 }
    );
  }
}
