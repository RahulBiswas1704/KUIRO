import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { verifyAndConsumeToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    if (!otp || typeof otp !== 'string' || !otp.trim()) {
      return NextResponse.json({ error: '6-digit verification code is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify OTP (Single-Use, Expiration & Constant-Time Hash Validation)
    const verification = await verifyAndConsumeToken(cleanEmail, otp.trim(), 'EMAIL_VERIFICATION');
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    const database = db;
    if (database) {
      await database
        .update(users)
        .set({ emailVerified: true })
        .where(eq(users.email, cleanEmail));
    }

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      emailVerified: true,
      message: 'Email successfully verified. Full autopilot capabilities unlocked.',
    });
  } catch (error: any) {
    console.error('[API /api/auth/verify-email] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Verification failed.' },
      { status: 500 }
    );
  }
}
