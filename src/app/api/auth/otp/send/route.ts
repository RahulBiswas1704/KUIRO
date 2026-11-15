import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { createVerificationToken, checkLoginRateLimit } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone, identifier, type = 'MAGIC_LINK', isSignup = false } = body;

    const rawIdentifier = (email || phone || identifier || '').trim();
    if (!rawIdentifier) {
      return NextResponse.json({ error: 'Email address or phone number is required.' }, { status: 400 });
    }

    // Normalize identifier
    let cleanIdentifier = rawIdentifier.toLowerCase();
    const isPhone = /^\+?[0-9\s\-()]{10,15}$/.test(rawIdentifier);
    if (isPhone) {
      const digits = rawIdentifier.replace(/[^0-9]/g, '');
      cleanIdentifier = digits.length === 10 ? `+91${digits}` : `+${digits}`;
    }

    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

    // Rate Limiting (max 5 requests per 15m)
    const rateCheck = checkLoginRateLimit(`otp:${cleanIdentifier}`, clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many OTP requests. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const validTypes = ['EMAIL_VERIFICATION', 'PASSWORD_RESET', 'MAGIC_LINK'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid verification token type requested.' }, { status: 400 });
    }

    // For password reset only, verify user exists first
    if (type === 'PASSWORD_RESET') {
      const database = db;
      if (database) {
        const [existing] = await database.select().from(users).where(eq(users.email, cleanIdentifier)).limit(1);
        if (!existing) {
          return NextResponse.json({
            success: true,
            message: 'If an account exists, a verification code has been dispatched.',
          });
        }
      }
    }

    const { rawToken, expiresAt } = await createVerificationToken(cleanIdentifier, type as any, 10);

    // In local development or testing, log OTP and return in response for instant developer testing
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH OTP DISPATCH] Type: ${type} | Identifier: ${cleanIdentifier} | Code: ${rawToken} | Expires: ${expiresAt.toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanIdentifier}. Valid for 10 minutes.`,
      expiresAt,
      // For testing & fast dev convenience:
      devCode: process.env.NODE_ENV !== 'production' ? rawToken : undefined,
    });
  } catch (error: any) {
    console.error('[API /api/auth/otp/send] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to dispatch verification code.' },
      { status: 500 }
    );
  }
}
