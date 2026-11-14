import { NextRequest, NextResponse } from 'next/server';
import {
  AUTHORIZED_MANAGEMENT_EMAILS,
  MANAGEMENT_PASSKEY,
  createManagementToken,
  verifyManagementAuth
} from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyManagementAuth(req);
  return NextResponse.json({
    authenticated: auth.authorized,
    email: auth.email || null,
    role: auth.authorized ? 'KUIRO Executive Management' : null,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, passkey } = body;

    const cleanEmail = String(email || '').toLowerCase().trim();
    const cleanPasskey = String(passkey || '').trim();

    if (!cleanEmail || !cleanPasskey) {
      return NextResponse.json(
        { success: false, error: 'Management email and master passkey are required.' },
        { status: 400 }
      );
    }

    // 1. Verify Master Passkey
    const isPasskeyValid = cleanPasskey === MANAGEMENT_PASSKEY;

    // 2. Verify Authorized Management Email or Domain
    const isEmailAuthorized =
      AUTHORIZED_MANAGEMENT_EMAILS.includes(cleanEmail) ||
      cleanEmail.endsWith('@kuiro.in') ||
      cleanEmail.endsWith('@sharmaheritage.in');

    if (!isPasskeyValid || !isEmailAuthorized) {
      // Simulate slight timing delay against brute-force timing attacks
      await new Promise((r) => setTimeout(r, 400));
      return NextResponse.json(
        {
          success: false,
          error: 'Access Denied: Invalid management clearance credentials.',
        },
        { status: 401 }
      );
    }

    // Generate signed 8-hour management token
    const token = createManagementToken(cleanEmail);

    const res = NextResponse.json({
      success: true,
      message: 'Management clearance granted.',
      token,
      user: {
        email: cleanEmail,
        role: 'KUIRO Executive Management',
        clearanceLevel: 'LEVEL 5 (MASTER)',
      },
    });

    // Set secure HTTP-only cookie
    res.cookies.set('kuiro_mgmt_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return res;
  } catch (error: any) {
    console.error('[Admin Auth POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({
    success: true,
    message: 'KUIRO Management terminal locked. Session terminated.',
  });

  // Clear cookie
  res.cookies.set('kuiro_mgmt_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return res;
}
