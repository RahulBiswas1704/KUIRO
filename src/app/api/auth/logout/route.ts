import { NextRequest, NextResponse } from 'next/server';
import { destroySession, SESSION_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
        token = authHeader.substring(7).trim();
      }
    }

    if (token) {
      await destroySession(token);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    console.error('[API /api/auth/logout] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Logout failed' },
      { status: 500 }
    );
  }
}

