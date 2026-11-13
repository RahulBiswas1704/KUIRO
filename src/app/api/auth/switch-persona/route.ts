import { NextRequest, NextResponse } from 'next/server';
import { db, users, workspaces, brandProfiles, scheduledCampaigns, platformPosts } from '@/db';
import { eq } from 'drizzle-orm';
import {
  createDatabaseSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_DAYS,
} from '@/lib/auth';
import { PERSONAS, PersonaKey } from '@/constants/personas';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const personaKey = (body.personaKey as PersonaKey) || 'sharma';
    const config = PERSONAS[personaKey] || PERSONAS.sharma;

    if (!db) {
      // Offline fallback mock
      const mockUser = {
        id: `usr_${personaKey}`,
        name: config.userName,
        email: config.userEmail,
        role: config.userRole,
        businessName: config.workspaceName,
        workspaceId: `ws_${personaKey}`,
        hasCompletedOnboarding: true,
      };
      return NextResponse.json({
        success: true,
        source: 'local_fallback',
        personaKey,
        user: mockUser,
        workspace: { id: `ws_${personaKey}`, name: config.workspaceName },
      });
    }

    // 1. Find or create persona User
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, config.userEmail))
      .limit(1);

    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          name: config.userName,
          email: config.userEmail,
          role: config.userRole,
          emailVerified: true,
        })
        .returning();
    }

    // 2. Find or create persona Workspace
    let [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.ownerId, user.id))
      .limit(1);

    if (!workspace) {
      [workspace] = await db
        .insert(workspaces)
        .values({
          name: config.workspaceName,
          ownerId: user.id,
          subscriptionTier: config.tier,
          whatsappAdminPhone: config.phone,
        })
        .returning();
    } else if (workspace.name !== config.workspaceName || workspace.whatsappAdminPhone !== config.phone) {
      [workspace] = await db
        .update(workspaces)
        .set({
          name: config.workspaceName,
          whatsappAdminPhone: config.phone,
          subscriptionTier: config.tier,
        })
        .where(eq(workspaces.id, workspace.id))
        .returning();
    }

    // 3. Upsert Brand Profile for this Workspace
    const [existingBp] = await db
      .select()
      .from(brandProfiles)
      .where(eq(brandProfiles.workspaceId, workspace.id))
      .limit(1);

    const bpPayload = {
      workspaceId: workspace.id,
      industry: config.industry,
      websiteUrl: `https://${config.workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '')}.in`,
      doctorCredentials: {
        doctorName: config.doctorName,
        degrees: config.degrees,
        councilRegistration: config.registration,
        clinicAddress: config.address,
      },
      toneOfVoice: {
        style: 'clinical_empathetic' as const,
        formality: 'semi-formal' as const,
        archetype: 'compassionate_caregiver',
        samplePhrases: config.tones,
      },
      visualIdentity: {
        primaryHex: config.colors.primary,
        secondaryHex: config.colors.secondary,
        fontFamily: 'Sora',
        logoUrl: '/brand/kuiro-primary.svg',
      },
      contentPillars: config.pillars,
      negativeConstraints: ['No false medical promises', 'No disparaging competitors'],
    };

    if (existingBp) {
      await db
        .update(brandProfiles)
        .set(bpPayload)
        .where(eq(brandProfiles.id, existingBp.id));
    } else {
      await db.insert(brandProfiles).values(bpPayload);
    }

    // 4. Ensure at least one scheduled campaign exists for this Workspace
    const [existingCamp] = await db
      .select()
      .from(scheduledCampaigns)
      .where(eq(scheduledCampaigns.workspaceId, workspace.id))
      .limit(1);

    if (!existingCamp) {
      const now = new Date();
      const publishAt = new Date(now.getTime() + 48 * 3600 * 1000);

      const [newCamp] = await db
        .insert(scheduledCampaigns)
        .values({
          workspaceId: workspace.id,
          triggerType: 'FESTIVAL',
          topicSummary: config.campaignTopic,
          status: 'AUTO_QUEUED',
          revisionCount: 0,
          generateAt: now,
          publishAt: publishAt,
        })
        .returning();

      // Platform posts tailored to this persona
      const postsToInsert = [
        {
          campaignId: newCamp.id,
          platform: 'instagram' as const,
          captionText: `${config.campaignTopic} ✨\n\nAt ${config.workspaceName}, our verified protocols deliver clinical precision and personalized care.\n\n📍 Tap the link in bio or WhatsApp our clinic desk to reserve your priority consultation slot.`,
          firstCommentText: `#${config.category.replace(/[^a-zA-Z]/g, '')} #${config.workspaceName.replace(/[^a-zA-Z]/g, '')} #KolkataWellness #DoctorLed`,
          mediaUrls: ['/brand/kuiro-primary.svg'],
          aspectRatio: '4:5',
          aiCriticScore: 97,
        },
        {
          campaignId: newCamp.id,
          platform: 'linkedin' as const,
          captionText: `Clinical leadership in modern ${config.industry}.\n\nProactive care is not an expense—it is the single highest ROI intervention for long-term health resilience.\n\nHow is your organization approaching proactive employee well-being?`,
          firstCommentText: `#HealthcareLeadership #PreventiveMedicine #${config.category.replace(/[^a-zA-Z]/g, '')}`,
          mediaUrls: ['/brand/kuiro-primary.svg'],
          aspectRatio: '1:1',
          aiCriticScore: 95,
        },
        {
          campaignId: newCamp.id,
          platform: 'x' as const,
          captionText: `Proactive care beats emergency panic every single time. ✨ Morning consultation slots open at ${config.workspaceName}.`,
          firstCommentText: `Book your consultation directly: https://${config.workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '')}.in/book`,
          mediaUrls: [],
          aspectRatio: '1:1',
          aiCriticScore: 94,
        },
        {
          campaignId: newCamp.id,
          platform: 'whatsapp' as const,
          captionText: `🌟 *Priority Update from ${config.workspaceName}*\n\nRoutine prevention is always better than cure. We have reserved priority slots for our comprehensive Vital Checkup package this week.\n\nReply *BOOK* to reserve your slot or call ${config.phone}.`,
          mediaUrls: ['/brand/kuiro-primary.svg'],
          aspectRatio: '1:1',
          aiCriticScore: 98,
        },
        {
          campaignId: newCamp.id,
          platform: 'email' as const,
          captionText: `<p>Dear Valued Client,</p><p>Seasonal transitions require proactive care. We are pleased to announce priority weekend slots at ${config.workspaceName}.</p>`,
          emailSubject: `Exclusive Wellness Guide & Priority Slots from ${config.workspaceName}`,
          emailHtml: `<p>Dear Valued Client,</p><p>Seasonal transitions require proactive care. We are pleased to announce priority weekend slots at ${config.workspaceName}.</p>`,
          mediaUrls: ['/brand/kuiro-primary.svg'],
          aspectRatio: '1:1',
          aiCriticScore: 96,
        },
      ];

      for (const p of postsToInsert) {
        await db.insert(platformPosts).values(p);
      }
    }

    // 5. Create Database Session for this Persona User
    const { token, expiresAt } = await createDatabaseSession(user.id);

    const clientUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessName: workspace.name,
      workspaceId: workspace.id,
      hasCompletedOnboarding: true,
      emailVerified: true,
    };

    const response = NextResponse.json({
      success: true,
      personaKey,
      user: clientUser,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        subscriptionTier: workspace.subscriptionTier,
        whatsappAdminPhone: workspace.whatsappAdminPhone,
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
      maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('[API /api/auth/switch-persona] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to switch persona' },
      { status: 500 }
    );
  }
}
