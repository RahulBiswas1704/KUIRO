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

    const isRetail = personaKey === 'sharma';
    const isCreator = personaKey === 'sengupta';

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
        style: isRetail ? ('professional_warm' as const) : isCreator ? ('authoritative_thought_leader' as const) : ('clinical_empathetic' as const),
        formality: 'semi-formal' as const,
        archetype: isRetail ? 'trusted_merchant' : isCreator ? 'innovator_advisor' : 'compassionate_caregiver',
        samplePhrases: config.tones,
      },
      visualIdentity: {
        primaryHex: config.colors.primary,
        secondaryHex: config.colors.secondary,
        fontFamily: 'Sora',
        logoUrl: '/brand/kuiro-primary.svg',
      },
      contentPillars: config.pillars,
      negativeConstraints: isRetail 
        ? ['No competitor disparagement', 'Promotional links on X in first comment']
        : isCreator 
        ? ['No unverified claims', 'Prioritize frameworks and zero-link surcharges on X']
        : ['No false medical promises', 'No disparaging competitors'],
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

      // Platform posts tailored dynamically to this persona
      const postsToInsert = isRetail
        ? [
            {
              campaignId: newCamp.id,
              platform: 'instagram' as const,
              captionText: `${config.campaignTopic} ✨🛍️\n\nCelebrate authentic Indian craftsmanship at ${config.workspaceName}. Each piece in our festive collection is woven with pride, heritage, and timeless elegance.\n\n📍 Visit our showroom or WhatsApp us for instant video call assistance and doorstep delivery.`,
              firstCommentText: `#FestiveCollection #HandloomSilk #KolkataRetail #${config.workspaceName.replace(/[^a-zA-Z]/g, '')}`,
              mediaUrls: ['/brand/kuiro-primary.svg'],
              aspectRatio: '4:5',
              aiCriticScore: 98,
            },
            {
              campaignId: newCamp.id,
              platform: 'linkedin' as const,
              captionText: `Retail excellence is won in the details: authenticity, artisan partnerships, and customer trust.\n\nAt ${config.workspaceName}, we believe sustainable retail starts with preserving local artisan heritage while delivering world-class shopping experiences.\n\nHow is your retail operation innovating customer loyalty this festive season?`,
              firstCommentText: `#RetailLeadership #HeritageCommerce #MadeInIndia`,
              mediaUrls: ['/brand/kuiro-primary.svg'],
              aspectRatio: '1:1',
              aiCriticScore: 95,
            },
            {
              campaignId: newCamp.id,
              platform: 'x' as const,
              captionText: `Fresh festive weaves have arrived at ${config.workspaceName}. Authentic craftsmanship, timeless colors. ✨🛍️`,
              firstCommentText: `View our festive catalog lookbook: https://${config.workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '')}.in/catalog`,
              mediaUrls: [],
              aspectRatio: '1:1',
              aiCriticScore: 94,
            },
            {
              campaignId: newCamp.id,
              platform: 'whatsapp' as const,
              captionText: `🌟 *Exclusive Festive Preview from ${config.workspaceName}*\n\nCelebrate the season with pure handcrafted weaves! We have reserved priority customer previews and festive discounts this week.\n\nReply *VIEW* to receive the collection lookbook or call ${config.phone}.`,
              mediaUrls: ['/brand/kuiro-primary.svg'],
              aspectRatio: '1:1',
              aiCriticScore: 98,
            },
            {
              campaignId: newCamp.id,
              platform: 'email' as const,
              captionText: `<p>Dear Valued Customer,</p><p>We are delighted to invite you to an exclusive festive showcase at ${config.workspaceName}.</p>`,
              emailSubject: `✨ Festive Showcase & Exclusive Previews from ${config.workspaceName}`,
              emailHtml: `<p>Dear Valued Customer,</p><p>We are delighted to invite you to an exclusive festive showcase of handloom weaves at ${config.workspaceName}.</p>`,
              mediaUrls: ['/brand/kuiro-primary.svg'],
              aspectRatio: '1:1',
              aiCriticScore: 96,
            },
          ]
        : isCreator
        ? [
            {
              campaignId: newCamp.id,
              platform: 'instagram' as const,
              captionText: `${config.campaignTopic} 🚀📈\n\nHigh-velocity execution beats over-complicated plans every time. When you eliminate routine friction, sustainable business momentum follows.\n\n📍 Tap the link in bio or WhatsApp our studio desk to book an executive advisory session.`,
              firstCommentText: `#FounderMindset #B2BGrowth #HighAgency #ProductStrategy`,
              mediaUrls: ['/brand/kuiro-primary.svg'],
              aspectRatio: '4:5',
              aiCriticScore: 97,
            },
            {
              campaignId: newCamp.id,
              platform: 'linkedin' as const,
              captionText: `Most growth bottlenecks aren't marketing problems—they are clarity and distribution problems.\n\nWhen your value proposition is crystal clear and distribution is autonomous, customer trust compounds exponentially.\n\nAt ${config.workspaceName}, our frameworks empower operators to scale without headcount bloat.\n\nWhat is your biggest operational focus this quarter?`,
              firstCommentText: `#ExecutiveLeadership #ScalableGrowth #B2BPlaybook`,
              mediaUrls: ['/brand/kuiro-primary.svg'],
              aspectRatio: '1:1',
              aiCriticScore: 96,
            },
            {
              campaignId: newCamp.id,
              platform: 'x' as const,
              captionText: `Clarity > Complexity. Sustainable growth happens when you eliminate routine friction and double down on core distribution. 🚀`,
              firstCommentText: `Read our full strategy breakdown: https://${config.workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '')}.in/insights`,
              mediaUrls: [],
              aspectRatio: '1:1',
              aiCriticScore: 95,
            },
            {
              campaignId: newCamp.id,
              platform: 'whatsapp' as const,
              captionText: `🚀 *Strategic Brief from ${config.workspaceName}*\n\nWe just released our latest advisory brief on building high-leverage distribution engines.\n\nReply *ADVISORY* to reserve a strategy session or call ${config.phone}.`,
              mediaUrls: ['/brand/kuiro-primary.svg'],
              aspectRatio: '1:1',
              aiCriticScore: 98,
            },
            {
              campaignId: newCamp.id,
              platform: 'email' as const,
              captionText: `<p>Dear Colleague,</p><p>We are pleased to share our newest strategic executive brief from ${config.workspaceName}.</p>`,
              emailSubject: `📈 Executive Strategy Brief from ${config.workspaceName}`,
              emailHtml: `<p>Dear Colleague,</p><p>We are pleased to share our newest strategic executive brief on high-velocity distribution from ${config.workspaceName}.</p>`,
              mediaUrls: ['/brand/kuiro-primary.svg'],
              aspectRatio: '1:1',
              aiCriticScore: 96,
            },
          ]
        : [
            {
              campaignId: newCamp.id,
              platform: 'instagram' as const,
              captionText: `${config.campaignTopic} ✨🩺\n\nAt ${config.workspaceName}, our verified protocols deliver diagnostic precision and personalized patient care.\n\n📍 Tap the link in bio or WhatsApp our clinic desk to reserve your priority consultation slot.`,
              firstCommentText: `#${config.category.replace(/[^a-zA-Z]/g, '')} #${config.workspaceName.replace(/[^a-zA-Z]/g, '')} #FamilyWellness #DoctorLed`,
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
              captionText: `<p>Dear Valued Patient,</p><p>Seasonal transitions require proactive care. We are pleased to announce priority weekend slots at ${config.workspaceName}.</p>`,
              emailSubject: `Exclusive Wellness Guide & Priority Slots from ${config.workspaceName}`,
              emailHtml: `<p>Dear Valued Patient,</p><p>Seasonal transitions require proactive care. We are pleased to announce priority weekend slots at ${config.workspaceName}.</p>`,
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
