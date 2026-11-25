import { NextRequest, NextResponse } from 'next/server';
import { db, workspaces, brandProfiles, scheduledCampaigns, platformPosts } from '@/db';
import { eq, desc, and } from 'drizzle-orm';
import { safeDispatchInngest } from '@/lib/inngest/dispatcher';
import { reviseCampaignSurgically } from '@/lib/campaigns/reviser';
import { getSessionFromRequest, authorizeWorkspace } from '@/lib/auth';
import { generateCampaignCopy, evaluateAndBuildCampaignPosts } from '@/lib/campaigns/generator';
import {
  transitionCampaignState,
  handleLateRevision,
  handleUnpauseAndApproval,
  calculateTargetPublishTime,
} from '@/lib/campaigns/stateMachine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Authorize workspace access (Strict Multi-Tenant Isolation)
    const workspaceIdParam = req.nextUrl.searchParams.get('workspaceId');
    const auth = await authorizeWorkspace(req, workspaceIdParam);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const database = db;
    if (!database) {
      return NextResponse.json({ success: true, count: 0, campaigns: [] });
    }

    const wsId = auth.workspaceId!;
    const [ws] = await database.select().from(workspaces).where(eq(workspaces.id, wsId)).limit(1);
    if (!ws) {
      return NextResponse.json({ success: false, error: 'Workspace not found' }, { status: 404 });
    }

    // 2. Query campaigns for this workspace
    const rawCampaigns = await database
      .select()
      .from(scheduledCampaigns)
      .where(eq(scheduledCampaigns.workspaceId, ws.id))
      .orderBy(desc(scheduledCampaigns.createdAt));

    // 3. If zero campaigns exist, seed an initial 48-Hour Campaign so the dashboard is live
    if (rawCampaigns.length === 0) {
      const [bp] = await database
        .select()
        .from(brandProfiles)
        .where(eq(brandProfiles.workspaceId, ws.id));

      const businessName = ws.name;
      const industry = bp?.industry || 'Retail, Commerce & Creative Studio';
      const tones = (bp?.toneOfVoice?.samplePhrases as string[]) || ['Culturally Warm', 'Authoritative', 'Modern Indian'];
      const pillars = (bp?.contentPillars as any[])?.map((p) => p.name || p) || ['Artisan Heritage', 'Customer Stories', 'Festive Drops'];
      const negativeConstraints = (bp?.negativeConstraints as string[]) || ['No competitor mentions'];

      const initialTopic = 'Festive Season Kickoff & Exclusive Member Appreciation';
      const generated = await generateCampaignCopy({
        topic: initialTopic,
        businessName,
        industry,
        tones,
        pillars,
        negativeConstraints,
      });

      const now = new Date();
      const publishAt = new Date(now.getTime() + 32 * 3600 * 1000 + 45 * 60 * 1000); // 32h 45m from now

      const [newCamp] = await database
        .insert(scheduledCampaigns)
        .values({
          workspaceId: ws.id,
          triggerType: 'FESTIVAL',
          topicSummary: initialTopic,
          status: 'AUTO_QUEUED',
          revisionCount: 0,
          generateAt: now,
          publishAt: publishAt,
        })
        .returning();

      // Pre-Publish AI Critic Evaluation & Auto-Refinement
      const { postsToInsert } = await evaluateAndBuildCampaignPosts({
        campaignId: newCamp.id,
        generated,
        businessName,
        industry,
        tones,
        pillars,
        negativeConstraints,
      });

      for (const p of postsToInsert) {
        await database.insert(platformPosts).values(p);
      }

      // Re-fetch created campaign with posts
      const seededPosts = await database
        .select()
        .from(platformPosts)
        .where(eq(platformPosts.campaignId, newCamp.id));

      return NextResponse.json({
        success: true,
        source: 'neon_postgres_seeded',
        count: 1,
        campaigns: [
          {
            ...newCamp,
            posts: seededPosts,
          },
        ],
      });
    }

    // 4. Fetch posts for each campaign
    const campaignsWithPosts = await Promise.all(
      rawCampaigns.map(async (camp) => {
        const posts = await database
          .select()
          .from(platformPosts)
          .where(eq(platformPosts.campaignId, camp.id));
        return {
          ...camp,
          posts,
        };
      })
    );

    return NextResponse.json({
      success: true,
      source: 'neon_postgres',
      count: campaignsWithPosts.length,
      campaigns: campaignsWithPosts,
    });
  } catch (error: any) {
    console.error('[Campaigns GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, triggerType = 'MANUAL' } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Topic string is required.' }, { status: 400 });
    }

    // 1. Authorize workspace access (Strict Multi-Tenant Isolation)
    const auth = await authorizeWorkspace(req, body.workspaceId);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const database = db;
    if (!database) {
      return NextResponse.json({ success: false, error: 'Database not connected' }, { status: 500 });
    }

    const wsId = auth.workspaceId!;
    const [ws] = await database.select().from(workspaces).where(eq(workspaces.id, wsId)).limit(1);
    if (!ws) {
      return NextResponse.json({ success: false, error: 'Workspace not found' }, { status: 404 });
    }

    const [bp] = await database
      .select()
      .from(brandProfiles)
      .where(eq(brandProfiles.workspaceId, ws.id));

    const businessName = ws.name;
    const industry = bp?.industry || 'Retail, Commerce & Creative Studio';
    const tones = (bp?.toneOfVoice?.samplePhrases as string[]) || ['Culturally Warm', 'Authoritative', 'Modern Indian'];
    const pillars = (bp?.contentPillars as any[])?.map((p) => p.name || p) || ['Brand Quality', 'Client Stories', 'Exclusive Drops'];
    const negativeConstraints = (bp?.negativeConstraints as string[]) || ['No competitor mentions'];

    // 2. Generate multi-platform copy using Gemini
    const generated = await generateCampaignCopy({
      topic: topic.trim(),
      businessName,
      industry,
      tones,
      pillars,
      negativeConstraints,
    });

    const now = new Date();
    const publishAt = calculateTargetPublishTime({
      timezone: ws.timezone || 'Asia/Kolkata',
      publishHourOfDay: ws.publishHourOfDay ?? 10,
      reviewWindowHours: ws.reviewWindowHours ?? 48,
    });

    // 3. Insert Campaign into scheduledCampaigns
    const [newCamp] = await database
      .insert(scheduledCampaigns)
      .values({
        workspaceId: ws.id,
        triggerType,
        topicSummary: topic.trim(),
        status: 'REVIEW_PENDING',
        revisionCount: 0,
        generateAt: now,
        publishAt: publishAt,
      })
      .returning();

    // 4. Pre-Publish AI Critic Evaluation, Auto-Refinement & DB Post Assembly
    const { evaluation, postsToInsert } = await evaluateAndBuildCampaignPosts({
      campaignId: newCamp.id,
      generated,
      businessName,
      industry,
      tones,
      pillars,
      negativeConstraints,
      logoUrl: bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg',
    });

    const insertedPosts = [];
    for (const p of postsToInsert) {
      const [created] = await database.insert(platformPosts).values(p).returning();
      insertedPosts.push(created);
    }

    // Persist structured critic evaluation & content version hash into diagnostic metadata
    await database
      .update(scheduledCampaigns)
      .set({
        diagnosticMetadata: {
          structuredCriticEvaluation: evaluation.structuredEvaluation,
          contentVersionHash: evaluation.structuredEvaluation?.contentVersionHash,
          evaluatedAt: evaluation.structuredEvaluation?.evaluatedAt,
        },
      })
      .where(eq(scheduledCampaigns.id, newCamp.id));

    // 5. Trigger Inngest Durable Workflow via Resilient Dispatcher
    await safeDispatchInngest({
      name: 'kuiro/campaign.initiate',
      data: {
        campaignId: newCamp.id,
        workspaceId: ws.id,
        publishAt: publishAt.toISOString(),
        triggerType,
        eventName: topic.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      source: 'neon_postgres',
      message: `Autonomous campaign "${topic}" created and entered 48-hour Auto-Commit queue!`,
      campaign: {
        ...newCamp,
        posts: insertedPosts,
      },
    });
  } catch (error: any) {
    console.error('[Campaigns POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required. Active session required.' }, { status: 401 });
    }

    const body = await req.json();
    const { campaignId, status, revisionPrompt } = body;

    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
    }

    const database = db;
    if (!database) {
      return NextResponse.json({ success: false, error: 'Database not connected' }, { status: 500 });
    }

    // POLICY ENFORCEMENT: Email verification required before approving/publishing campaigns
    if (status === 'APPROVED' && !session.user.emailVerified) {
      return NextResponse.json(
        {
          error: 'Email verification required. Please verify your business email before approving and publishing campaigns.',
          code: 'EMAIL_VERIFICATION_REQUIRED',
        },
        { status: 403 }
      );
    }

    const auth = await authorizeWorkspace(req, body.workspaceId);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const wsId = auth.workspaceId!;

    const [campRecord] = await database
      .select()
      .from(scheduledCampaigns)
      .where(and(
        eq(scheduledCampaigns.id, campaignId),
        eq(scheduledCampaigns.workspaceId, wsId)
      ))
      .limit(1);

    if (!campRecord) {
      return NextResponse.json({ error: 'Campaign not found or does not belong to authorized workspace.' }, { status: 404 });
    }

    // 1. Handle Voice / Text Revision Request with Gemini AI
    if (revisionPrompt && typeof revisionPrompt === 'string') {
      const [camp] = await database
        .select()
        .from(scheduledCampaigns)
        .where(and(
          eq(scheduledCampaigns.id, campaignId),
          eq(scheduledCampaigns.workspaceId, wsId)
        ));

      if (!camp) {
        return NextResponse.json({ error: 'Campaign not found or does not belong to authorized workspace.' }, { status: 404 });
      }

      if (camp.revisionCount >= 2) {
        return NextResponse.json(
          { error: 'Maximum 2 free revisions reached for this campaign.' },
          { status: 400 }
        );
      }

      const [bp] = await database
        .select()
        .from(brandProfiles)
        .where(eq(brandProfiles.workspaceId, wsId));

      const [ws] = await database
        .select()
        .from(workspaces)
        .where(and(eq(workspaces.id, wsId), eq(workspaces.ownerId, auth.session!.user.id)));

      const businessName = ws?.name || 'Sharma Heritage Handlooms & Retail';
      const industry = bp?.industry || 'Retail, Commerce & Professional Services';
      const tones = (bp?.toneOfVoice?.samplePhrases as string[]) || ['Culturally Warm', 'Authoritative', 'Modern Indian'];
      const pillars = (bp?.contentPillars as any[])?.map((p) => p.name || p) || ['Artisan Heritage', 'Quality Craftsmanship', 'Festive Offerings'];
      const negativeConstraints = (bp?.negativeConstraints as string[]) || ['No competitor mentions'];

      // Fetch existing posts for surgical revision
      const existingPosts = await database
        .select()
        .from(platformPosts)
        .where(eq(platformPosts.campaignId, campaignId));

      const nextRevisionCount = (camp.revisionCount || 0) + 1;

      // Surgically revise the existing posts using Gemini and founder feedback (Hindi/Bengali/Hinglish/English)
      const revisionResult = await reviseCampaignSurgically({
        posts: existingPosts.map((p) => ({
          id: p.id,
          platform: p.platform as any,
          caption: p.captionText,
          firstComment: p.firstCommentText || undefined,
          subject: p.emailSubject || undefined,
          mediaUrls: p.mediaUrls,
          aspectRatio: p.aspectRatio,
        })),
        revisionPrompt: revisionPrompt.trim(),
        businessName,
        industry,
        tones,
        pillars,
        negativeConstraints,
        campaignId,
        revisionNumber: nextRevisionCount,
        requestedBy: session.user.id || auth.session!.user.id,
        requesterName: session.user.name || auth.session!.user.name || 'Dashboard User',
      });

      // Check for late revision and automatically extend publishing window if needed
      const lateRevisionResult = await handleLateRevision({
        campaignId,
        workspaceId: wsId,
        revisionPrompt: revisionPrompt.trim(),
      });

      const [updatedCamp] = await database
        .update(scheduledCampaigns)
        .set({
          revisionCount: nextRevisionCount,
          status: 'REVIEW_PENDING', // reset to review pending with fresh revision
          publishAt: lateRevisionResult.newPublishAt || camp.publishAt,
          diagnosticMetadata: {
            structuredCriticEvaluation: revisionResult.structuredEvaluation,
            contentVersionHash: revisionResult.structuredEvaluation?.contentVersionHash,
            evaluatedAt: revisionResult.structuredEvaluation?.evaluatedAt,
          },
        })
        .where(eq(scheduledCampaigns.id, campaignId))
        .returning();

      // Update platform posts in Neon DB with surgically revised copy & real evaluated AI Critic scores
      for (const rev of revisionResult.revisedPosts) {
        const matchingOriginal = existingPosts.find((p) => p.platform === rev.platform);
        if (matchingOriginal) {
          await database
            .update(platformPosts)
            .set({
              captionText: rev.caption,
              firstCommentText: rev.firstComment !== undefined ? rev.firstComment : matchingOriginal.firstCommentText,
              emailSubject: rev.subject !== undefined ? rev.subject : matchingOriginal.emailSubject,
              emailHtml: rev.platform === 'email' ? rev.caption : matchingOriginal.emailHtml,
              aiCriticScore: rev.aiCriticScore,
            })
            .where(eq(platformPosts.id, matchingOriginal.id));
        }
      }

      // Trigger Inngest event via Resilient Dispatcher
      await safeDispatchInngest({
        name: 'kuiro/campaign.revise',
        data: {
          campaignId,
          instruction: revisionPrompt,
          revisionCount: nextRevisionCount,
        },
      });

      const revisedPosts = await database
        .select()
        .from(platformPosts)
        .where(eq(platformPosts.campaignId, campaignId));

      return NextResponse.json({
        success: true,
        source: 'neon_postgres',
        action: 'revised',
        message: revisionResult.revisionSummary || `Campaign revised successfully based on: "${revisionPrompt}"`,
        revisionSummary: revisionResult.revisionSummary,
        criticScore: revisionResult.compositeCriticScore,
        structuredEvaluation: revisionResult.structuredEvaluation,
        revisionCount: nextRevisionCount,
        campaign: {
          ...updatedCamp,
          posts: revisedPosts,
        },
      });
    }

    // 2. Handle Status Change (APPROVE, PAUSE, RESUME, CANCEL)
    if (!status) {
      return NextResponse.json({ error: 'status or revisionPrompt is required' }, { status: 400 });
    }

    let updatedCampRecord: any;

    if (status === 'APPROVED') {
      const approvalResult = await handleUnpauseAndApproval({
        campaignId,
        workspaceId: wsId,
      });

      if (!approvalResult.success) {
        return NextResponse.json(
          { success: false, error: approvalResult.error || 'Failed to approve campaign.' },
          { status: 400 }
        );
      }
      updatedCampRecord = approvalResult.campaign;
    } else {
      const transitionResult = await transitionCampaignState({
        campaignId,
        workspaceId: wsId,
        targetState: status,
      });

      if (!transitionResult.success) {
        return NextResponse.json(
          { success: false, error: transitionResult.error || 'Invalid campaign state transition.' },
          { status: 400 }
        );
      }
      updatedCampRecord = transitionResult.campaign;
    }

    // Trigger Inngest event so state machine unblocks via Resilient Dispatcher
    await safeDispatchInngest({
      name: 'whatsapp/admin.action',
      data: {
        campaignId,
        action: status === 'APPROVED' ? 'APPROVE' : status === 'PAUSED' ? 'EMERGENCY_PAUSE' : 'SKIP',
      },
    });

    return NextResponse.json({
      success: true,
      source: 'neon_postgres',
      action: 'status_updated',
      campaign: updatedCampRecord,
    });
  } catch (error: any) {
    console.error('[Campaigns PATCH Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId') || searchParams.get('id');
    const workspaceIdParam = searchParams.get('workspaceId');

    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
    }

    const auth = await authorizeWorkspace(req, workspaceIdParam);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const database = db;
    if (!database) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
    }

    const wsId = auth.workspaceId!;

    // Verify campaign belongs to authorized workspace
    const [camp] = await database
      .select()
      .from(scheduledCampaigns)
      .where(and(
        eq(scheduledCampaigns.id, campaignId),
        eq(scheduledCampaigns.workspaceId, wsId)
      ))
      .limit(1);

    if (!camp) {
      return NextResponse.json({ error: 'Campaign not found or does not belong to authorized workspace.' }, { status: 404 });
    }

    // Cascade delete platform posts and the campaign
    await database.delete(platformPosts).where(eq(platformPosts.campaignId, campaignId));
    await database.delete(scheduledCampaigns).where(and(
      eq(scheduledCampaigns.id, campaignId),
      eq(scheduledCampaigns.workspaceId, wsId)
    ));

    return NextResponse.json({
      success: true,
      message: 'Campaign and associated platform posts permanently deleted.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete campaign' }, { status: 500 });
  }
}
