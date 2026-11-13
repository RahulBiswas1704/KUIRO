import { NextRequest, NextResponse } from 'next/server';
import { db, users, workspaces } from '@/db';
import { eq } from 'drizzle-orm';
import {
  verifyPassword,
  createDatabaseSession,
  ensureDemoUser,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_DAYS,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, isDemo } = body;
    const ipAddress = req.headers.get('x-forwarded-for') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    // 1. Fast 1-Click Demo Login (Dr. Rajesh Sharma)
    if (isDemo || email?.toLowerCase().includes('dr.sharma@apexclinic.in')) {
      const demoData = await ensureDemoUser();
      const { token, expiresAt } = await createDatabaseSession(demoData.user.id, {
        ipAddress,
        userAgent,
      });

      const response = NextResponse.json({
        success: true,
        user: demoData.user,
        workspace: demoData.workspace,
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

    // 2. Regular Credential or Passwordless Login
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const database = db;

    if (!database) {
      // Offline fallback
      const mockUser = {
        id: `usr_${Date.now()}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'Founder',
        emailVerified: true,
      };
      const mockWorkspace = {
        id: `ws_${Date.now()}`,
        name: `${mockUser.name}'s Workspace`,
        subscriptionTier: 'GROWTH',
        whatsappAdminPhone: null,
      };

      const response = NextResponse.json({
        success: true,
        user: mockUser,
        workspace: mockWorkspace,
        sessionToken: `mock_sess_${Date.now()}`,
      });

      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: `mock_sess_${Date.now()}`,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
      });

      return response;
    }

    // Find User in Neon DB
    const [userRecord] = await database
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);

    if (!userRecord) {
      return NextResponse.json(
        { error: 'No account found with this email. Please create an account.' },
        { status: 401 }
      );
    }

    // Verify Password if user has a password set and password is provided
    if (userRecord.passwordHash && password) {
      const isValid = verifyPassword(password, userRecord.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid email or password.' },
          { status: 401 }
        );
      }
    }

    // Find or Auto-provision Workspace for user
    let [workspaceRecord] = await database
      .select()
      .from(workspaces)
      .where(eq(workspaces.ownerId, userRecord.id))
      .limit(1);

    if (!workspaceRecord) {
      [workspaceRecord] = await database
        .insert(workspaces)
        .values({
          name: `${userRecord.name}'s Workspace`,
          ownerId: userRecord.id,
          subscriptionTier: 'GROWTH',
        })
        .returning();
    }

    // Create Persistent Database Session in Neon DB
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
        whatsappAdminPhone: workspaceRecord.whatsappAdminPhone,
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
  } catch (error: any) {
    console.error('[API /api/auth/login] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Login failed.' },
      { status: 500 }
    );
  }
}

