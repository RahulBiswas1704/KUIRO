import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const database = db;
    if (database) {
      await database
        .update(users)
        .set({ emailVerified: true })
        .where(eq(users.email, email.trim().toLowerCase()));
    }

    return NextResponse.json({
      success: true,
      email: email.trim().toLowerCase(),
      emailVerified: true,
      message: 'Email successfully verified.',
    });
  } catch (error: any) {
    console.error('[API /api/auth/verify-email] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Verification failed' },
      { status: 500 }
    );
  }
}

