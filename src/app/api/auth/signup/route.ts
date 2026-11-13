import { NextRequest, NextResponse } from 'next/server';
import { db, users, workspaces, brandProfiles, accounts } from '@/db';
import { eq } from 'drizzle-orm';
import {
  hashPassword,
  createDatabaseSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_DAYS,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, businessName, email, password, industry, phone } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Name and email are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanBusinessName = (businessName || `${cleanName}'s Brand`).trim();

    const database = db;
    if (!database) {
      // Local fallback if DB is not configured
      const mockUser = {
        id: `usr_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        role: 'Founder',
        emailVerified: false,
      };
      const mockWorkspace = {
        id: `ws_${Date.now()}`,
        name: cleanBusinessName,
        subscriptionTier: 'GROWTH',
        whatsappAdminPhone: phone || null,
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

    // 1. Check if user already exists
    const [existingUser] = await database
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // 2. Hash password (if provided; supports passwordless/instant onboarding)
    const passwordHash = password ? hashPassword(password) : null;

    // 3. Create User in Neon DB
    const [newUser] = await database
      .insert(users)
      .values({
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        role: 'Founder',
        emailVerified: false,
      })
      .returning();

    // 4. Provision Multi-Tenant Workspace
    const [newWorkspace] = await database
      .insert(workspaces)
      .values({
        name: cleanBusinessName,
        ownerId: newUser.id,
        subscriptionTier: 'GROWTH',
        whatsappAdminPhone: phone || null,
      })
      .returning();

    // 5. Seed Initial Brand Brain Foundation
    await database.insert(brandProfiles).values({
      workspaceId: newWorkspace.id,
      industry: industry || 'Professional Services & Local Commerce',
      websiteUrl: '',
      toneOfVoice: {
        style: 'professional_warm',
        formality: 'semi-formal',
        archetype: 'trusted_expert',
        samplePhrases: [
          'Delivering tangible results with personal care.',
          'Quality, consistency, and transparent client communication.',
        ],
      },
      visualIdentity: {
        primaryHex: '#FF7A00',
        secondaryHex: '#0B0F14',
        accentHex: '#FF9E40',
        fontFamily: 'Sora',
      },
      contentPillars: [
        { name: 'Core Services & Excellence', weight: 40, description: 'Highlights of main offerings' },
        { name: 'Customer Spotlight & Testimonials', weight: 30, description: 'Social proof and results' },
        { name: 'Practical Industry Insights', weight: 30, description: 'Educational tips that build authority' },
      ],
      negativeConstraints: [
        'Never disparage competitors or use misleading clickbait',
      ],
    });

    // 6. Record credentials in accounts table
    if (password) {
      await database.insert(accounts).values({
        userId: newUser.id,
        accountId: cleanEmail,
        providerId: 'credentials',
      });
    }

    // 7. Create Persistent Database Session
    const ipAddress = req.headers.get('x-forwarded-for') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;
    const { token, expiresAt } = await createDatabaseSession(newUser.id, {
      ipAddress,
      userAgent,
    });

    // 8. Return response with Session Cookie
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          emailVerified: newUser.emailVerified,
        },
        workspace: {
          id: newWorkspace.id,
          name: newWorkspace.name,
          subscriptionTier: newWorkspace.subscriptionTier,
          whatsappAdminPhone: newWorkspace.whatsappAdminPhone,
        },
        sessionToken: token,
        expiresAt,
      },
      { status: 201 }
    );

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
    console.error('[API /api/auth/signup] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create account.' },
      { status: 500 }
    );
  }
}

