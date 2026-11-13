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

    return NextResponse.json({
      authenticated: true,
      user: session.user,
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

