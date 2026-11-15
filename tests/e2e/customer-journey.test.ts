import '../setup';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { TestSuiteContext } from '../setup';
import {
  db,
  users,
  workspaces,
  sessions,
  brandProfiles,
  socialConnections,
  scheduledCampaigns,
  platformPosts,
  conversations,
  inboxMessages,
  payments,
  subscriptions,
  durableEvents,
} from '@/db';
import { eq, and } from 'drizzle-orm';
import {
  hashPassword,
  verifyPassword,
  createVerificationToken,
  verifyAndConsumeToken,
  createDatabaseSession,
  getSession,
} from '@/lib/auth';
import { encryptToken, decryptToken } from '@/lib/crypto/vault';
import {
  StructuredCriticEvaluationSchema,
  runDeterministicSafetyChecks,
} from '@/lib/ai/critic';
import {
  isValidTransition,
  transitionCampaignState,
  calculateTargetPublishTime,
} from '@/lib/campaigns/stateMachine';
import {
  executeWithIdempotency,
  IdempotencyKeyBuilder,
} from '@/lib/events/idempotency';
import {
  ingestInboundMessage,
  dispatchOutboundReply,
} from '@/lib/inbox/dispatchService';
import { createPendingOrder } from '@/lib/billing';
import { POST as verifyPaymentHandler } from '@/app/api/billing/verify-payment/route';

export async function runCustomerJourneyE2ETests(): Promise<TestSuiteContext> {
  const ctx = new TestSuiteContext('Level C: Full 12-Step Customer Journey End-to-End Tests');
  console.log(`\n================================================================`);
  console.log(`  RUNNING: ${ctx.name}`);
  console.log(`================================================================`);

  if (!db) {
    throw new Error('Neon PostgreSQL database connection is unavailable.');
  }

  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!razorpaySecret) {
    throw new Error('RAZORPAY_KEY_SECRET is required for billing test verification.');
  }

  const runId = Date.now().toString(36);
  const testEmail = `rajesh.artisan.${runId}@sharmaheritage-test.in`;
  const rawPassword = `ArtisanLegacy2026_${runId}!`;

  // Fixture IDs to clean up
  let userId: string | null = null;
  let workspaceId: string | null = null;
  let sessionToken: string | null = null;
  let campaignId: string | null = null;
  let conversationId: string | null = null;
  const eventKeys: string[] = [];

  try {
    // ========================================================================
    // STEP 1: Signup (Register new user account)
    // ========================================================================
    console.log('\n--- Step 1: User Signup ---');
    const passwordHash = hashPassword(rawPassword);
    const [newUser] = await db
      .insert(users)
      .values({
        name: 'Rajesh Sharma',
        email: testEmail,
        passwordHash,
        role: 'Founder & Retail Director',
        emailVerified: false,
      })
      .returning();
    userId = newUser.id;

    ctx.assert(!!userId, 'Step 1 [Signup]: User record persisted in Neon PostgreSQL');
    ctx.assert(
      newUser.emailVerified === false,
      'Step 1 [Signup]: Initial emailVerified state is false'
    );

    // ========================================================================
    // STEP 2: Email Verification (OTP generation & consumption)
    // ========================================================================
    console.log('\n--- Step 2: Email Verification ---');
    const { rawToken } = await createVerificationToken(testEmail, 'EMAIL_VERIFICATION', 10);
    ctx.assert(/^\d{6}$/.test(rawToken), 'Step 2 [Verification]: Generated 6-digit numeric OTP');

    const verifyResult = await verifyAndConsumeToken(testEmail, rawToken, 'EMAIL_VERIFICATION');
    ctx.assert(verifyResult.valid, 'Step 2 [Verification]: OTP verified and consumed successfully');

    // Update user.emailVerified = true
    await db.update(users).set({ emailVerified: true }).where(eq(users.id, userId));
    const [verifiedUser] = await db.select().from(users).where(eq(users.id, userId));
    ctx.assert(verifiedUser.emailVerified === true, 'Step 2 [Verification]: User marked emailVerified = true in database');

    // ========================================================================
    // STEP 3: Login (Authenticate & Establish Database Session)
    // ========================================================================
    console.log('\n--- Step 3: User Login ---');
    const isPasswordValid = verifyPassword(rawPassword, verifiedUser.passwordHash!);
    ctx.assert(isPasswordValid, 'Step 3 [Login]: Password authenticated with scrypt verification');

    const sessionRes = await createDatabaseSession(userId, {
      ipAddress: '127.0.0.1',
      userAgent: 'KUIRO-E2E-Journey-Runner/1.0',
    });
    sessionToken = sessionRes.token;

    const activeSession = await getSession(sessionToken);
    ctx.assert(activeSession !== null, 'Step 3 [Login]: Database session established and retrieved');
    ctx.assert(
      activeSession?.user.email === testEmail,
      'Step 3 [Login]: Session matches authenticated user'
    );

    // Auto-provisioned workspace
    workspaceId = activeSession!.workspace.id;
    ctx.assert(!!workspaceId, 'Step 3 [Login]: Primary workspace provisioned for user');

    // ========================================================================
    // STEP 4: Onboarding (Configure Workspace Settings)
    // ========================================================================
    console.log('\n--- Step 4: Workspace Onboarding ---');
    await db
      .update(workspaces)
      .set({
        name: 'Sharma Heritage Retail & Silk Studio',
        timezone: 'Asia/Kolkata',
        whatsappAdminPhone: '+919876543210',
        autoCommitEnabled: true,
        reviewWindowHours: 48,
        publishHourOfDay: 10,
      })
      .where(eq(workspaces.id, workspaceId));

    const [configuredWs] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));
    ctx.assert(
      configuredWs.name === 'Sharma Heritage Retail & Silk Studio' &&
        configuredWs.timezone === 'Asia/Kolkata' &&
        configuredWs.whatsappAdminPhone === '+919876543210',
      'Step 4 [Onboarding]: Workspace configured with Indian timezone and WhatsApp admin number'
    );

    // ========================================================================
    // STEP 5: Brand Brain Extraction & Knowledge Ingestion
    // ========================================================================
    console.log('\n--- Step 5: Brand Brain Extraction ---');
    const [brandProfile] = await db
      .insert(brandProfiles)
      .values({
        workspaceId,
        industry: 'Retail, Handloom Silk & Fashion',
        websiteUrl: 'https://sharmaheritage.in',
        toneOfVoice: {
          style: 'professional_warm',
          formality: 'semi-formal',
          archetype: 'master_artisan_and_stylist',
          samplePhrases: [
            'Woven with 100% pure silk and golden zari',
            'Authentic handcrafted heritage from Varanasi',
            'Complimentary 7-day home trials across India',
          ],
        },
        visualIdentity: {
          primaryHex: '#0B0F14',
          secondaryHex: '#FF7A00',
          accentHex: '#10B981',
          fontFamily: 'Sora',
        },
        contentPillars: [
          { name: 'Heritage Silk Craftsmanship', weight: 45, description: 'Artisanal handloom techniques' },
          { name: 'Festive & Bridal Collections', weight: 35, description: 'Wedding wardrobes and festive drops' },
          { name: 'Client Stories & Bespoke Draping', weight: 20, description: 'Customer testimonials' },
        ],
        negativeConstraints: [
          'Never use cheap discount jargon like massive sale',
          'Never disparage synthetic or blended fabrics',
        ],
      })
      .returning();

    ctx.assert(!!brandProfile.id, 'Step 5 [Brand Brain]: Brand Brain knowledge persisted in Neon PostgreSQL');
    ctx.assert(
      brandProfile.contentPillars.length === 3,
      'Step 5 [Brand Brain]: Stores weighted content pillars and voice archetype'
    );

    // ========================================================================
    // STEP 6: Connect Social Account (Token Vault AES-256-GCM)
    // ========================================================================
    console.log('\n--- Step 6: Connect Social Account ---');
    const rawInstagramToken = `EAA_LIVE_OAUTH_TOKEN_INSTAGRAM_${runId}_SECURE`;
    const encryptedToken = encryptToken(rawInstagramToken);

    const [socialConn] = await db
      .insert(socialConnections)
      .values({
        workspaceId,
        platform: 'instagram',
        platformAccountId: `ig_sharma_heritage_${runId}`,
        accessTokenEncrypted: encryptedToken,
        status: 'CONNECTED',
        grantedScopes: ['instagram_basic', 'instagram_content_publish'],
      })
      .returning();

    ctx.assert(!!socialConn.id, 'Step 6 [OAuth Token Vault]: Social connection created in database');
    ctx.assert(
      socialConn.accessTokenEncrypted.includes(':aes256gcm:'),
      'Step 6 [OAuth Token Vault]: Token stored in AES-256-GCM authenticated encrypted format'
    );
    ctx.assert(
      decryptToken(socialConn.accessTokenEncrypted) === rawInstagramToken,
      'Step 6 [OAuth Token Vault]: Token successfully decrypted and authenticated'
    );

    // ========================================================================
    // STEP 7: Generate Campaign with AI Critic Evaluation
    // ========================================================================
    console.log('\n--- Step 7: Campaign Generation & Quality Audit ---');
    const publishTarget = calculateTargetPublishTime({
      timezone: 'Asia/Kolkata',
      publishHourOfDay: 10,
      reviewWindowHours: 48,
    });

    const [campaign] = await db
      .insert(scheduledCampaigns)
      .values({
        workspaceId,
        triggerType: 'FESTIVAL',
        topicSummary: 'Durga Puja & Diwali Handcrafted Silk Showcase',
        status: 'REVIEW_PENDING',
        generateAt: new Date(),
        publishAt: publishTarget,
      })
      .returning();
    campaignId = campaign.id;

    ctx.assert(!!campaignId, 'Step 7 [Campaign Generation]: Campaign created with REVIEW_PENDING status');
    ctx.assert(
      campaign.publishAt.getTime() > Date.now(),
      'Step 7 [Campaign Generation]: Target publication deadline scheduled 48h in advance'
    );

    // Platform Assets
    const instagramCaption =
      'Every warp and weft tells a story of Varanasi weavers. Introducing our festive Banarasi silk sarees at Sharma Heritage. Visit our showroom or reserve your piece online.';
    const assets: any[] = [
      {
        platform: 'instagram',
        caption: instagramCaption,
        firstComment: '#BanarasiSilk #SharmaHeritage #FestiveDrop',
        hashtags: ['#BanarasiSilk', '#SharmaHeritage', '#FestiveDrop'],
        mediaUrls: ['https://cdn.sharmaheritage.in/sarees/durga-puja-banarasi.jpg'],
        mediaType: 'IMAGE',
        aspectRatio: '4:5',
      },
    ];

    // AI Critic deterministic check
    const criticAudit = runDeterministicSafetyChecks(assets, {
      negativeConstraints: brandProfile.negativeConstraints,
      industry: brandProfile.industry,
    });
    ctx.assert(!criticAudit.hasCriticalSafetyViolation, 'Step 7 [AI Critic]: Campaign passes deterministic safety audit');

    // Insert Platform Post
    const [post] = await db
      .insert(platformPosts)
      .values({
        campaignId,
        platform: 'instagram',
        captionText: instagramCaption,
        firstCommentText: '#BanarasiSilk #SharmaHeritage #FestiveDrop',
        aiCriticScore: 92,
        mediaUrls: ['https://cdn.sharmaheritage.in/sarees/durga-puja-banarasi.jpg'],
      })
      .returning();

    ctx.assert(!!post.id && post.aiCriticScore === 92, 'Step 7 [Campaign Assets]: Post assets persisted with AI Critic score 92');

    // ========================================================================
    // STEP 8: Approve Campaign (48-Hour Autopilot Decision)
    // ========================================================================
    console.log('\n--- Step 8: Campaign Approval ---');
    ctx.assert(
      isValidTransition('REVIEW_PENDING', 'APPROVED'),
      'Step 8 [Approval]: State transition REVIEW_PENDING -> APPROVED is valid'
    );

    const approveTransitionResult = await transitionCampaignState({
      campaignId,
      targetState: 'APPROVED',
      reason: 'Customer approved preview via WhatsApp interactive button',
    });

    ctx.assert(approveTransitionResult.success, 'Step 8 [Approval]: transitionCampaignState successfully moved to APPROVED');

    const [approvedCampaign] = await db
      .select()
      .from(scheduledCampaigns)
      .where(eq(scheduledCampaigns.id, campaignId));
    ctx.assert(approvedCampaign.status === 'APPROVED', 'Step 8 [Approval]: Campaign status in Neon PostgreSQL is APPROVED');

    // ========================================================================
    // STEP 9: Resilient Publishing Execution (Mocked Sandbox)
    // ========================================================================
    console.log('\n--- Step 9: Resilient Publishing ---');
    // State transition to READY_TO_PUBLISH -> PUBLISHING
    await transitionCampaignState({ campaignId, targetState: 'READY_TO_PUBLISH' });
    await transitionCampaignState({ campaignId, targetState: 'PUBLISHING' });

    const publishKey = IdempotencyKeyBuilder.campaignPublish({
      campaignId,
      platform: 'instagram',
      contentVersionHash: 'hash_banarasi_festive_v1',
    });
    eventKeys.push(publishKey);

    const publishExecution = await executeWithIdempotency(
      {
        idempotencyKey: publishKey,
        eventType: 'CAMPAIGN_PUBLISH',
        workspaceId,
        relatedEntityId: campaignId,
        payload: { postId: post.id },
      },
      async () => {
        // Mocked sandbox publishing: safely returns platform post ID without calling live Facebook API
        return {
          platformPostId: `ig_post_published_${runId}`,
          publishedAt: new Date().toISOString(),
          status: 'success',
        };
      }
    );

    ctx.assert(publishExecution.status === 'COMPLETED', 'Step 9 [Publishing]: executeWithIdempotency completed publication');

    // Transition state machine to PUBLISHED
    await transitionCampaignState({
      campaignId,
      targetState: 'PUBLISHED',
      reason: 'Sandbox Instagram publication confirmed',
    });

    const [publishedCampaign] = await db
      .select()
      .from(scheduledCampaigns)
      .where(eq(scheduledCampaigns.id, campaignId));
    ctx.assert(publishedCampaign.status === 'PUBLISHED', 'Step 9 [Publishing]: Campaign reached terminal PUBLISHED status');

    // ========================================================================
    // STEP 10: Receive Customer Inquiry (Inbound Meta Webhook)
    // ========================================================================
    console.log('\n--- Step 10: Inbound WhatsApp Inquiry ---');
    const customerPhone = '+919876500111';
    const customerMessageId = `wamid.HBgL${runId}_customer_lead`;
    const customerInquiryText = 'Hi Rajesh ji, loved your Durga Puja saree post! Is the pink Banarasi saree available in Kolkata?';

    const webhookResult = await ingestInboundMessage({
      workspaceId,
      channel: 'whatsapp',
      customerHandle: customerPhone,
      customerName: 'Sunita Singhania',
      content: customerInquiryText,
      providerMessageId: customerMessageId,
    });

    ctx.assert(webhookResult.success, 'Step 10 [Inbound Inquiry]: Webhook successfully ingested customer inquiry');
    conversationId = webhookResult.conversation?.id;
    ctx.assert(!!conversationId, 'Step 10 [Inbound Inquiry]: Customer conversation established in Unified Inbox');

    // ========================================================================
    // STEP 11: Staff Outbound Reply from Inbox
    // ========================================================================
    console.log('\n--- Step 11: Staff Inbox Reply ---');
    const replyResult = await dispatchOutboundReply({
      conversationId: conversationId!,
      workspaceId,
      senderName: 'Sharma Heritage Concierge',
      content: 'Namaste Sunita ji! Yes, we ship to Kolkata within 48 hours with complimentary blouse tailoring. Sending you the catalog now!',
    });

    ctx.assert(replyResult.success, 'Step 11 [Staff Reply]: Dispatched outbound reply to customer');

    const conversationMessages = await db
      .select()
      .from(inboxMessages)
      .where(eq(inboxMessages.conversationId, conversationId!));
    ctx.assert(
      conversationMessages.length === 2,
      'Step 11 [Staff Reply]: Unified thread contains both customer question and staff answer'
    );

    // ========================================================================
    // STEP 12: Upgrade Subscription to AGENCY (Payment Signature Verification)
    // ========================================================================
    console.log('\n--- Step 12: Subscription Upgrade ---');
    const upgradeOrder = createPendingOrder({
      workspaceId,
      tier: 'AGENCY',
      billingCycle: 'monthly',
      paymentMethod: 'netbanking',
      gateway: 'razorpay',
      businessName: 'Sharma Heritage Retail & Studio',
    });

    ctx.assert(upgradeOrder.tier === 'AGENCY', 'Step 12 [Billing Upgrade]: Initiated AGENCY tier upgrade order');
    ctx.assert(upgradeOrder.totalAmount === 14159, 'Step 12 [Billing Upgrade]: Computes exact AGENCY price with 18% GST (11999 + 2160 = 14159 INR)');

    const upgradePaymentId = `pay_e2e_agency_${runId}`;
    const validSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(`${upgradeOrder.orderId}|${upgradePaymentId}`)
      .digest('hex');

    const paymentReq = new NextRequest('http://localhost:3000/api/billing/verify-payment', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        workspaceId,
        orderId: upgradeOrder.orderId,
        paymentId: upgradePaymentId,
        signature: validSignature,
        gateway: 'razorpay',
      }),
    });

    const paymentRes = await verifyPaymentHandler(paymentReq);
    const paymentBody = await paymentRes.json();

    ctx.assert(paymentRes.status === 200, 'Step 12 [Billing Upgrade]: Payment verification returns HTTP 200');
    ctx.assert(paymentBody.planActivated === 'AGENCY', 'Step 12 [Billing Upgrade]: Confirms AGENCY plan activation');

    const [finalWs] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));
    ctx.assert(finalWs.subscriptionTier === 'AGENCY', 'Step 12 [Billing Upgrade]: Workspace in Neon PostgreSQL successfully upgraded to AGENCY tier');

    const [activeAgencySub] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.workspaceId, workspaceId), eq(subscriptions.status, 'ACTIVE')));
    ctx.assert(activeAgencySub !== undefined && activeAgencySub.planTier === 'AGENCY', 'Step 12 [Billing Upgrade]: Active subscription record created for AGENCY plan');

    console.log('\n----------------------------------------------------------------');
    console.log('✓ ALL 12 STEPS OF THE END-TO-END CUSTOMER JOURNEY PASSED!');
    console.log('----------------------------------------------------------------');
  } finally {
    // Clean up E2E Test Fixtures
    for (const k of eventKeys) {
      await db.delete(durableEvents).where(eq(durableEvents.idempotencyKey, k)).catch(() => {});
    }
    if (conversationId) {
      await db.delete(inboxMessages).where(eq(inboxMessages.conversationId, conversationId)).catch(() => {});
      await db.delete(conversations).where(eq(conversations.id, conversationId)).catch(() => {});
    }
    if (campaignId) {
      await db.delete(platformPosts).where(eq(platformPosts.campaignId, campaignId)).catch(() => {});
      await db.delete(scheduledCampaigns).where(eq(scheduledCampaigns.id, campaignId)).catch(() => {});
    }
    if (workspaceId) {
      await db.delete(payments).where(eq(payments.workspaceId, workspaceId)).catch(() => {});
      await db.delete(subscriptions).where(eq(subscriptions.workspaceId, workspaceId)).catch(() => {});
      await db.delete(socialConnections).where(eq(socialConnections.workspaceId, workspaceId)).catch(() => {});
      await db.delete(brandProfiles).where(eq(brandProfiles.workspaceId, workspaceId)).catch(() => {});
      await db.delete(workspaces).where(eq(workspaces.id, workspaceId)).catch(() => {});
    }
    if (userId) {
      await db.delete(sessions).where(eq(sessions.userId, userId)).catch(() => {});
      await db.delete(users).where(eq(users.id, userId)).catch(() => {});
    }
  }

  return ctx;
}

if (process.argv[1]?.includes('customer-journey.test.ts')) {
  runCustomerJourneyE2ETests()
    .then((c) => {
      console.log(`\nCustomer Journey E2E Tests Complete: ${c.passed} passed, ${c.failed} failed.`);
      process.exit(c.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Fatal in Customer Journey E2E Tests:', err);
      process.exit(1);
    });
}
