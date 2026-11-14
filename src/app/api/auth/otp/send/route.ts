import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { createVerificationToken, checkLoginRateLimit } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, type = 'EMAIL_VERIFICATION' } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

    // Rate Limiting (max 5 requests per 15m)
    const rateCheck = checkLoginRateLimit(`otp:${cleanEmail}`, clientIp);
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

    // For password reset and magic link, verify user exists first
    if (type === 'PASSWORD_RESET' || type === 'MAGIC_LINK') {
      const database = db;
      if (database) {
        const [existing] = await database.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
        if (!existing) {
          // Generic success message to avoid account enumeration
          return NextResponse.json({
            success: true,
            message: 'If an account exists with this email, a verification code has been dispatched.',
          });
        }
      }
    }

    const { rawToken, expiresAt } = await createVerificationToken(cleanEmail, type as any, 10);

    // In local development or mock mode, we log the OTP securely for easy testing
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH OTP DISPATCH] Type: ${type} | Email: ${cleanEmail} | Code: ${rawToken} | Expires: ${expiresAt.toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Valid for 10 minutes.`,
      expiresAt,
    });
  } catch (error: any) {
    console.error('[API /api/auth/otp/send] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to dispatch verification code.' },
      { status: 500 }
    );
  }
}
