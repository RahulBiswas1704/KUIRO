import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        workspace: null,
      });
    }

    const isDemo =
      session.user.email?.toLowerCase().includes('sharmaheritage.in') ||
      session.user.role === 'Demo Founder' ||
      session.workspace.name?.includes('Sharma Heritage');

    return NextResponse.json({
      authenticated: true,
      user: { ...session.user, isDemo },
      workspace: session.workspace,
      sessionToken: session.token,
      expiresAt: session.expiresAt,
    });
  } catch (error: any) {
    console.error('[API /api/auth/me] Error:', error);
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        workspace: null,
        error: error?.message || 'Failed to verify session',
      },
      { status: 500 }
    );
  }
}

