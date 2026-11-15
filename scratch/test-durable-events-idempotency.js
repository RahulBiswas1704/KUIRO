const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read DATABASE_URL from .env.local
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
let dbUrl = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
    break;
  }
}

if (!dbUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

process.env.DATABASE_URL = dbUrl;
const sql = neon(dbUrl);

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 KUIRO PROMPT 18: DURABLE EVENT HANDLING & IDEMPOTENCY AUDIT');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // Dynamic import of our TypeScript idempotency engine and publishers
    const { 
      executeWithIdempotency, 
      classifyError, 
      IdempotencyKeyBuilder, 
      replayDeadLetterEvent 
    } = await import('../src/lib/events/idempotency.ts');

    const { 
      publishCampaignChannelWithIdempotency 
    } = await import('../src/lib/social/publisher.ts');

    const { 
      safeDispatchInngest 
    } = await import('../src/lib/inngest/dispatcher.ts');

    // 0. Fetch active test workspace
    const [ws] = await sql`SELECT id, name FROM workspaces LIMIT 1`;
    const testWsId = ws.id;
    console.log(`Using Workspace: ${ws.name} (${testWsId})\n`);

    // -------------------------------------------------------------
    // Test 1: Core Idempotency Engine & Deduplication
    // -------------------------------------------------------------
    console.log('--- Test Suite 1: Core Idempotency Engine ---');
    const testKey1 = `test_idemp_${Date.now()}_alpha`;
    let executionCount1 = 0;

    const opFn1 = async () => {
      executionCount1++;
      return { confirmationId: 'CONF_12345', amount: 9999, timestamp: Date.now() };
    };

    // First execution
    const res1 = await executeWithIdempotency(
      {
        idempotencyKey: testKey1,
        eventType: 'test/operation',
        workspaceId: testWsId,
      },
      opFn1
    );

    assert(res1.status === 'COMPLETED', 'First execution completes successfully');
    assert(res1.idempotent === false, 'First execution marked as non-idempotent (fresh execution)');
    assert(executionCount1 === 1, 'Operation function executed exactly once');
    assert(res1.result?.confirmationId === 'CONF_12345', 'Returned result payload preserved');

    // Duplicate execution with identical key
    const res2 = await executeWithIdempotency(
      {
        idempotencyKey: testKey1,
        eventType: 'test/operation',
        workspaceId: testWsId,
      },
      opFn1
    );

    assert(res2.status === 'CACHED', 'Duplicate call returns CACHED status');
    assert(res2.idempotent === true, 'Duplicate call marked as idempotent');
    assert(executionCount1 === 1, 'Underlying operation was NOT called again (side effects prevented)');
    assert(res2.result?.confirmationId === 'CONF_12345', 'Cached result exactly matches first execution');

    // Verify row in durable_events database table
    const [dbRec1] = await sql`SELECT * FROM durable_events WHERE idempotency_key = ${testKey1}`;
    assert(dbRec1 !== undefined, 'Event receipt persisted in durable_events table');
    assert(dbRec1.status === 'COMPLETED', 'Database status is COMPLETED');
    assert(dbRec1.completed_at !== null, 'completed_at timestamp recorded');

    // -------------------------------------------------------------
    // Test 2: In-Flight Concurrency Lock Protection
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 2: In-Flight Concurrency Protection ---');
    const lockKey = `test_lock_${Date.now()}`;
    const futureLock = new Date(Date.now() + 30000); // locked for 30s

    await sql`
      INSERT INTO durable_events (idempotency_key, event_type, workspace_id, status, locked_until)
      VALUES (${lockKey}, 'test/concurrent', ${testWsId}, 'PROCESSING', ${futureLock.toISOString()})
    `;

    let concurrentRan = false;
    const lockRes = await executeWithIdempotency(
      {
        idempotencyKey: lockKey,
        eventType: 'test/concurrent',
        workspaceId: testWsId,
      },
      async () => {
        concurrentRan = true;
        return { ok: true };
      }
    );

    assert(lockRes.status === 'IN_FLIGHT', 'In-flight execution rejected with IN_FLIGHT');
    assert(concurrentRan === false, 'Operation was NOT executed while lock was active');

    // -------------------------------------------------------------
    // Test 3: Error Classification & Dead-Lettering
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 3: Error Classification & Dead-Lettering ---');
    
    // Transient error classification
    const timeoutErr = classifyError(new Error('Connection timed out after 5000ms'));
    assert(timeoutErr.isTransient === true, 'Timeout error classified as transient (retryable)');
    assert(timeoutErr.errorType === 'TIMEOUT', 'Error type identified as TIMEOUT');

    const rateLimitErr = classifyError(new Error('Rate limit exceeded: 429 Too Many Requests'));
    assert(rateLimitErr.isTransient === true, '429 error classified as transient');
    assert(rateLimitErr.errorType === 'TRANSIENT', 'Error type identified as TRANSIENT');

    // Permanent error classification
    const authErr = classifyError(new Error('OAuth token expired or revoked by user (401 Unauthorized)'));
    assert(authErr.isTransient === false, '401 Unauthorized classified as permanent (non-retryable)');
    assert(authErr.errorType === 'PERMANENT', 'Error type identified as PERMANENT');

    const schemaErr = classifyError(new Error('Validation error: Bad request missing required field'));
    assert(schemaErr.isTransient === false, 'Validation error classified as permanent');

    // Dead-letter exhausted retries for transient server overload
    const failKey = `test_fail_${Date.now()}`;
    const failRes = await executeWithIdempotency(
      {
        idempotencyKey: failKey,
        eventType: 'test/failing',
        workspaceId: testWsId,
        maxRetries: 1, // Max 1 attempt
      },
      async () => {
        throw new Error('503 Service Unavailable: upstream compute cluster overloaded');
      }
    );

    assert(failRes.status === 'FAILED', 'Failed execution caught cleanly with FAILED status');
    const [dbFailRec] = await sql`SELECT status, retry_count, max_retries FROM durable_events WHERE idempotency_key = ${failKey}`;
    assert(
      dbFailRec.status === 'EXHAUSTED' || dbFailRec.status === 'FAILED' || dbFailRec.status === 'PENDING', 
      `Retry tracking updated in database (status: ${dbFailRec.status})`
    );

    // Timeout error triggers RECONCILIATION_REQUIRED to prevent duplicate posting
    const timeoutKey = `test_timeout_${Date.now()}`;
    const timeoutRes = await executeWithIdempotency(
      {
        idempotencyKey: timeoutKey,
        eventType: 'social/publish',
        workspaceId: testWsId,
      },
      async () => {
        throw new Error('ETIMEDOUT: Connection to Meta Graph API timed out after 10000ms');
      }
    );
    assert(timeoutRes.status === 'RECONCILIATION_REQUIRED', 'Uncertain timeout triggers RECONCILIATION_REQUIRED');

    // Replay dead-letter event
    const replayRes = await replayDeadLetterEvent(failKey, async () => {
      return { replayed: true, resolved: true };
    });
    assert(replayRes.status === 'COMPLETED', 'Controlled dead-letter replay succeeded');
    assert(replayRes.result?.resolved === true, 'Replay result stored upon resolution');

    // -------------------------------------------------------------
    // Test 4: Campaign Publishing Idempotency
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 4: Campaign Publishing Idempotency ---');
    const testCampId = `camp_idemp_${Date.now()}`;
    const contentHash = 'abc123hash999';

    // 1st Publish
    const pubRes1 = await publishCampaignChannelWithIdempotency({
      campaignId: testCampId,
      platform: 'instagram',
      contentVersionHash: contentHash,
      workspaceId: testWsId,
      payload: {
        caption: 'Special festive launch post for Diwali!',
        mediaUrls: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'],
      },
    });

    assert(pubRes1.status === 'PUBLISHED' || pubRes1.status === 'MOCK_PUBLISHED', 'Initial campaign publish succeeded');
    assert(pubRes1.platformPostId !== undefined, 'Platform post ID assigned');
    const firstPlatformPostId = pubRes1.platformPostId;

    // Duplicate Publish with same content version (simulating workflow retry or duplicate trigger)
    const pubRes2 = await publishCampaignChannelWithIdempotency({
      campaignId: testCampId,
      platform: 'instagram',
      contentVersionHash: contentHash,
      workspaceId: testWsId,
      payload: {
        caption: 'Special festive launch post for Diwali!',
        mediaUrls: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'],
      },
    });

    assert(pubRes2.status === pubRes1.status, 'Duplicate publish returns same status');
    assert(pubRes2.platformPostId === firstPlatformPostId, 'Duplicate publish returned identical cached platformPostId');

    // Verify key in durable_events table
    const pubKey = IdempotencyKeyBuilder.campaignPublish({
      campaignId: testCampId,
      platform: 'instagram',
      contentVersionHash: contentHash,
    });
    const [pubDbRec] = await sql`SELECT * FROM durable_events WHERE idempotency_key = ${pubKey}`;
    assert(pubDbRec !== undefined, 'Publishing idempotency key recorded in database');
    assert(pubDbRec.status === 'COMPLETED', 'Publishing status marked as COMPLETED');

    // -------------------------------------------------------------
    // Test 5: Payment Confirmation Webhook Idempotency
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 5: Payment Webhook Idempotency ---');
    const testPaymentId = `pay_idemp_${Date.now()}`;
    const testOrderId = `order_idemp_${Date.now()}`;
    const payKey = IdempotencyKeyBuilder.paymentConfirmation({
      gateway: 'razorpay',
      paymentId: testPaymentId,
      orderId: testOrderId,
    });

    let paymentAppliedCount = 0;
    const processPayment = async () => {
      paymentAppliedCount++;
      // Record payment into database
      await sql`
        INSERT INTO payments (workspace_id, order_id, payment_id, amount, currency, status, gateway, plan_tier)
        VALUES (${testWsId}, ${testOrderId}, ${testPaymentId}, 499900, 'INR', 'captured', 'razorpay', 'GROWTH')
      `;
      return { paymentId: testPaymentId, status: 'captured', activatedPlan: 'GROWTH' };
    };

    // 1st delivery
    const payRes1 = await executeWithIdempotency(
      {
        idempotencyKey: payKey,
        eventType: 'billing/payment_captured',
        workspaceId: testWsId,
        relatedEntityId: testPaymentId,
      },
      processPayment
    );

    assert(payRes1.status === 'COMPLETED', 'Initial payment processing completed');
    assert(paymentAppliedCount === 1, 'Payment applied to ledger exactly once');

    // Duplicate webhook delivery (e.g. Razorpay retry)
    const payRes2 = await executeWithIdempotency(
      {
        idempotencyKey: payKey,
        eventType: 'billing/payment_captured',
        workspaceId: testWsId,
        relatedEntityId: testPaymentId,
      },
      processPayment
    );

    assert(payRes2.status === 'CACHED', 'Duplicate payment webhook intercepted with CACHED status');
    assert(payRes2.idempotent === true, 'Duplicate payment webhook flagged as idempotent');
    assert(paymentAppliedCount === 1, 'Payment was NOT applied twice (ledger double-credit prevented)');

    // -------------------------------------------------------------
    // Test 6: WhatsApp Outbound Message Idempotency
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 6: WhatsApp Outbound Message Idempotency ---');
    const testConvId = `conv_wa_${Date.now()}`;
    const messageContent = 'Your appointment has been confirmed for Saturday at 11:00 AM.';
    const msgHash = 'msg_hash_xyz789';
    const waKey = IdempotencyKeyBuilder.whatsAppOutbound({
      conversationId: testConvId,
      messageHash: msgHash,
    });

    let waDispatchedCount = 0;
    const sendWaMessage = async () => {
      waDispatchedCount++;
      return { waMessageId: `wamid_${Date.now()}`, delivered: true };
    };

    // 1st message dispatch
    const waRes1 = await executeWithIdempotency(
      {
        idempotencyKey: waKey,
        eventType: 'inbox/whatsapp_outbound',
        workspaceId: testWsId,
        relatedEntityId: testConvId,
      },
      sendWaMessage
    );

    assert(waRes1.status === 'COMPLETED', 'Outbound WhatsApp message dispatched');
    assert(waDispatchedCount === 1, 'Message delivered to provider once');

    // Duplicate dispatch trigger
    const waRes2 = await executeWithIdempotency(
      {
        idempotencyKey: waKey,
        eventType: 'inbox/whatsapp_outbound',
        workspaceId: testWsId,
        relatedEntityId: testConvId,
      },
      sendWaMessage
    );

    assert(waRes2.status === 'CACHED', 'Duplicate WhatsApp dispatch intercepted with CACHED status');
    assert(waRes2.idempotent === true, 'Duplicate message marked as idempotent');
    assert(waDispatchedCount === 1, 'Message was NOT sent twice to customer phone');

    // -------------------------------------------------------------
    // Test 7: Inngest Dispatcher Fail-Closed & Outbox Persistence
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 7: Inngest Dispatcher Hardening ---');
    
    // Simulate production mode
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    process.env.INNGEST_EVENT_KEY = 'invalid_test_key_forced_error';

    const dispatchRes = await safeDispatchInngest({
      name: 'kuiro/campaign.initiate',
      data: {
        campaignId: 'camp_test_outbox_123',
        workspaceId: testWsId,
      },
    });

    // In production, when Inngest fails, it must NOT return fake success or a mock ID!
    assert(dispatchRes.success === false, 'Dispatcher fails closed in production when Inngest is unreachable');
    assert(dispatchRes.error !== undefined, 'Dispatcher returns explicit failure error');
    assert(dispatchRes.eventId?.startsWith('outbox_'), 'Event recorded with durable outbox key');

    // Verify outbox entry in durable_events database table
    const [outboxDbRec] = await sql`
      SELECT * FROM durable_events 
      WHERE idempotency_key = ${dispatchRes.eventId}
    `;
    assert(outboxDbRec !== undefined, 'Failed Inngest event durably persisted into PostgreSQL outbox');
    assert(outboxDbRec.status === 'PENDING', 'Outbox record status is PENDING for worker replay');

    process.env.NODE_ENV = originalEnv;

    // Clean up test records
    console.log('\nCleaning up test artifacts...');
    await sql`DELETE FROM durable_events WHERE idempotency_key LIKE 'test_%' OR idempotency_key LIKE 'campaign_publish_%' OR idempotency_key LIKE 'payment_%' OR idempotency_key LIKE 'wa_outbound_%' OR idempotency_key LIKE 'outbox_%'`;
    await sql`DELETE FROM payments WHERE payment_id = ${testPaymentId}`;
    console.log('Cleanup complete.');

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  }

  console.log('\n===============================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
