import '../setup';
import { TestSuiteContext } from '../setup';
import {
  isValidTransition,
  normalizeCampaignState,
  calculateTargetPublishTime,
} from '@/lib/campaigns/stateMachine';
import {
  IdempotencyKeyBuilder,
  classifyError,
  computePayloadHash,
} from '@/lib/events/idempotency';

export async function runStateMachineUnitTests(): Promise<TestSuiteContext> {
  const ctx = new TestSuiteContext('Level A: State Machine & Idempotency Key Unit Tests');
  console.log(`\n================================================================`);
  console.log(`  RUNNING: ${ctx.name}`);
  console.log(`================================================================`);

  // 1. Campaign State Machine Transitions & Alias Normalization
  {
    ctx.assert(
      normalizeCampaignState('AUTO_QUEUED') === 'REVIEW_PENDING',
      'FSM Normalization: Maps legacy AUTO_QUEUED to REVIEW_PENDING'
    );
    ctx.assert(
      normalizeCampaignState('SKIPPED') === 'PAUSED',
      'FSM Normalization: Maps legacy SKIPPED to PAUSED'
    );
    ctx.assert(
      normalizeCampaignState('REVISING') === 'REVISION_REQUESTED',
      'FSM Normalization: Maps legacy REVISING to REVISION_REQUESTED'
    );

    // Standard 48-hour flow
    ctx.assert(
      isValidTransition('GENERATING', 'REVIEW_PENDING'),
      'FSM Transition: GENERATING -> REVIEW_PENDING allowed'
    );
    ctx.assert(
      isValidTransition('REVIEW_PENDING', 'APPROVED'),
      'FSM Transition: REVIEW_PENDING -> APPROVED allowed'
    );
    ctx.assert(
      isValidTransition('APPROVED', 'READY_TO_PUBLISH'),
      'FSM Transition: APPROVED -> READY_TO_PUBLISH allowed'
    );
    ctx.assert(
      isValidTransition('READY_TO_PUBLISH', 'PUBLISHING'),
      'FSM Transition: READY_TO_PUBLISH -> PUBLISHING allowed'
    );
    ctx.assert(
      isValidTransition('PUBLISHING', 'PUBLISHED'),
      'FSM Transition: PUBLISHING -> PUBLISHED allowed'
    );

    // Customer Interventions
    ctx.assert(
      isValidTransition('REVIEW_PENDING', 'PAUSED'),
      'FSM Transition: REVIEW_PENDING -> PAUSED allowed'
    );
    ctx.assert(
      isValidTransition('PAUSED', 'APPROVED'),
      'FSM Transition: PAUSED -> APPROVED allowed'
    );
    ctx.assert(
      isValidTransition('REVIEW_PENDING', 'REVISION_REQUESTED'),
      'FSM Transition: REVIEW_PENDING -> REVISION_REQUESTED allowed'
    );
    ctx.assert(
      isValidTransition('REVISION_REQUESTED', 'REVIEW_PENDING'),
      'FSM Transition: REVISION_REQUESTED -> REVIEW_PENDING allowed'
    );

    // Recovery & Retries
    ctx.assert(
      isValidTransition('PUBLISHING', 'FAILED'),
      'FSM Transition: PUBLISHING -> FAILED allowed'
    );
    ctx.assert(
      isValidTransition('FAILED', 'READY_TO_PUBLISH'),
      'FSM Transition: FAILED -> READY_TO_PUBLISH allowed (retry)'
    );

    // Disallowed & Illegal Transitions
    ctx.assert(
      !isValidTransition('PUBLISHED', 'GENERATING'),
      'FSM Transition: PUBLISHED -> GENERATING strictly rejected'
    );
    ctx.assert(
      !isValidTransition('CANCELLED', 'PUBLISHED'),
      'FSM Transition: CANCELLED -> PUBLISHED strictly rejected'
    );
    ctx.assert(
      !isValidTransition('PAUSED', 'PUBLISHING'),
      'FSM Transition: PAUSED -> PUBLISHING strictly rejected (must be approved first)'
    );

    // Idempotent Self-Transitions
    ctx.assert(
      isValidTransition('APPROVED', 'APPROVED'),
      'FSM Idempotency: Duplicate approval (APPROVED -> APPROVED) permitted'
    );
    ctx.assert(
      isValidTransition('PAUSED', 'PAUSED'),
      'FSM Idempotency: Duplicate pause (PAUSED -> PAUSED) permitted'
    );
    ctx.assert(
      isValidTransition('PUBLISHED', 'PUBLISHED'),
      'FSM Idempotency: Terminal state (PUBLISHED -> PUBLISHED) permitted'
    );
  }

  // 2. Publication Target Time Computation
  {
    const baseDate = new Date('2026-11-15T04:00:00Z'); // 09:30 AM IST
    const targetPublish = calculateTargetPublishTime({
      timezone: 'Asia/Kolkata',
      publishHourOfDay: 10,
      reviewWindowHours: 48,
      baseDate,
    });

    ctx.assert(
      targetPublish instanceof Date && targetPublish.getTime() > baseDate.getTime(),
      'Publish Scheduler: Computes valid future Date object'
    );

    // In Asia/Kolkata, target hour is 10:00 AM (04:30 UTC)
    // 48 hours later is Nov 17, 10:00 AM IST (04:30 UTC)
    const utcHours = targetPublish.getUTCHours();
    const utcMinutes = targetPublish.getUTCMinutes();
    ctx.assert(
      utcHours === 4 && utcMinutes === 30,
      'Publish Scheduler: Aligns 10:00 AM IST to 04:30 UTC precisely'
    );
  }

  // 3. Structured Idempotency Key Formatting
  {
    const pubKey = IdempotencyKeyBuilder.campaignPublish({
      campaignId: 'camp_101',
      platform: 'INSTAGRAM',
      contentVersionHash: 'hash_abc123',
    });
    ctx.assert(
      pubKey === 'campaign_publish_camp_101_instagram_hash_abc123',
      'Idempotency Key: Formats campaignPublish key with platform lowercase'
    );

    const payKey = IdempotencyKeyBuilder.paymentConfirmation({
      gateway: 'Razorpay',
      paymentId: 'pay_998877',
    });
    ctx.assert(
      payKey === 'payment_razorpay_pay_998877',
      'Idempotency Key: Formats paymentConfirmation key'
    );

    const waKey = IdempotencyKeyBuilder.whatsAppOutbound({
      conversationId: 'conv_5544',
      messageHash: 'sha_9900',
    });
    ctx.assert(
      waKey === 'wa_outbound_conv_5544_sha_9900',
      'Idempotency Key: Formats whatsAppOutbound key'
    );

    const whKey = IdempotencyKeyBuilder.webhookEvent({
      provider: 'Meta',
      eventId: 'evt_mid_99182',
    });
    ctx.assert(
      whKey === 'webhook_meta_evt_mid_99182',
      'Idempotency Key: Formats webhookEvent key'
    );

    const payloadHash = computePayloadHash('Customer message inquiry text');
    ctx.assert(
      typeof payloadHash === 'string' && payloadHash.length === 16,
      'Payload Hash: Produces 16-hex SHA-256 fingerprint'
    );
  }

  // 4. Error Classification (Transient vs. Permanent)
  {
    const timeoutErr = classifyError(new Error('ETIMEDOUT: Connection to Instagram Graph API timed out'));
    ctx.assert(
      timeoutErr.isTransient && timeoutErr.errorType === 'TIMEOUT',
      'Error Classification: Identifies ETIMEDOUT as transient network timeout'
    );

    const rateLimitErr = classifyError(new Error('Status code 429: Too Many Requests from Meta API'));
    ctx.assert(
      rateLimitErr.isTransient && rateLimitErr.errorType === 'TRANSIENT',
      'Error Classification: Identifies 429 rate limit as transient retryable error'
    );

    const gatewayErr = classifyError(new Error('503 Service Unavailable: Cloudflare origin error'));
    ctx.assert(
      gatewayErr.isTransient && gatewayErr.errorType === 'TRANSIENT',
      'Error Classification: Identifies 503 gateway error as transient'
    );

    const unauthErr = classifyError(new Error('Status code 401: Unauthorized OAuth token expired or revoked'));
    ctx.assert(
      !unauthErr.isTransient && unauthErr.errorType === 'PERMANENT',
      'Error Classification: Identifies 401 unauthorized as permanent fail-closed error'
    );

    const sigErr = classifyError(new Error('Invalid signature on incoming webhook payload'));
    ctx.assert(
      !sigErr.isTransient && sigErr.errorType === 'PERMANENT',
      'Error Classification: Identifies invalid webhook signature as permanent non-retryable error'
    );

    const validationErr = classifyError(new Error('Validation error: caption text exceeds 2200 characters'));
    ctx.assert(
      !validationErr.isTransient && validationErr.errorType === 'PERMANENT',
      'Error Classification: Identifies semantic validation error as permanent error'
    );
  }

  return ctx;
}

if (process.argv[1]?.includes('state-machine.test.ts')) {
  runStateMachineUnitTests()
    .then((c) => {
      console.log(`\nState Machine Unit Tests Complete: ${c.passed} passed, ${c.failed} failed.`);
      process.exit(c.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Fatal in State Machine Unit Tests:', err);
      process.exit(1);
    });
}
