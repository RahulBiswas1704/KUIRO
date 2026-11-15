import '../setup';
import { TestSuiteContext } from '../setup';
import { db, users, workspaces, durableEvents } from '@/db';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';
import {
  executeWithIdempotency,
  IdempotencyKeyBuilder,
} from '@/lib/events/idempotency';

export async function runResilientPublishingIntegrationTests(): Promise<TestSuiteContext> {
  const ctx = new TestSuiteContext('Level B: Durable Publishing Idempotency & Retry Integration Tests');
  console.log(`\n================================================================`);
  console.log(`  RUNNING: ${ctx.name}`);
  console.log(`================================================================`);

  if (!db) {
    throw new Error('Neon PostgreSQL database connection is unavailable.');
  }

  const runId = Date.now().toString(36);
  let testUserId: string | null = null;
  let testWorkspaceId: string | null = null;
  const createdEventKeys: string[] = [];

  try {
    // 1. Provision Test Workspace
    const [user] = await db
      .insert(users)
      .values({
        name: 'Sharma Campaign Publisher',
        email: `publisher.${runId}@kuiro-test.io`,
        passwordHash: hashPassword('PublishPass123!'),
        role: 'Founder',
        emailVerified: true,
      })
      .returning();
    testUserId = user.id;

    const [ws] = await db
      .insert(workspaces)
      .values({
        name: `Sharma Heritage Studio (${runId})`,
        ownerId: user.id,
        subscriptionTier: 'GROWTH',
      })
      .returning();
    testWorkspaceId = ws.id;

    // 2. Case 1: First-Time Publishing Execution (Success)
    const campaignId = `camp_${runId}`;
    const key1 = IdempotencyKeyBuilder.campaignPublish({
      campaignId,
      platform: 'instagram',
      contentVersionHash: 'hash_silk_festive',
    });
    createdEventKeys.push(key1);

    let executionCount = 0;
    const initialExecution = await executeWithIdempotency(
      {
        idempotencyKey: key1,
        eventType: 'CAMPAIGN_PUBLISH',
        workspaceId: ws.id,
        relatedEntityId: campaignId,
        payload: { caption: 'Festive Banarasi Sarees' },
      },
      async () => {
        executionCount++;
        return {
          postId: 'ig_post_1001',
          platform: 'instagram',
          publishedAt: new Date().toISOString(),
        };
      }
    );

    ctx.assert(executionCount === 1, 'Initial Publish: Invokes publication handler exactly once');
    ctx.assert(initialExecution.status === 'COMPLETED', 'Initial Publish: Returns status COMPLETED');
    ctx.assert(initialExecution.idempotent === false, 'Initial Publish: Returns idempotent: false for first execution');
    ctx.assert(initialExecution.result?.postId === 'ig_post_1001', 'Initial Publish: Returns publication result');

    // Verify row in durable_events table
    const [dbEvent1] = await db
      .select()
      .from(durableEvents)
      .where(eq(durableEvents.idempotencyKey, key1))
      .limit(1);
    ctx.assert(dbEvent1 !== undefined && dbEvent1.status === 'COMPLETED', 'Durable Ledger: Event receipt saved as COMPLETED in Neon DB');

    // 3. Case 2: Duplicate / Replay Execution (Anti-Double-Posting)
    const duplicateExecution = await executeWithIdempotency(
      {
        idempotencyKey: key1,
        eventType: 'CAMPAIGN_PUBLISH',
        workspaceId: ws.id,
        relatedEntityId: campaignId,
      },
      async () => {
        executionCount++; // Must NOT be called
        return { postId: 'ig_post_DUPLICATE_ERROR' };
      }
    );

    ctx.assert(executionCount === 1, 'Anti-Double-Posting: Replay does NOT execute publication handler again');
    ctx.assert(duplicateExecution.status === 'CACHED', 'Anti-Double-Posting: Returns status CACHED');
    ctx.assert(duplicateExecution.idempotent === true, 'Anti-Double-Posting: Returns idempotent: true');
    ctx.assert(
      duplicateExecution.result?.postId === 'ig_post_1001',
      'Anti-Double-Posting: Returns cached original result payload without re-publishing'
    );

    // 4. Case 3: In-Flight Distributed Locking
    const key2 = IdempotencyKeyBuilder.campaignPublish({
      campaignId,
      platform: 'facebook',
      contentVersionHash: 'hash_silk_festive',
    });
    createdEventKeys.push(key2);

    // Seed an in-flight locked event in DB
    const lockFuture = new Date(Date.now() + 60000);
    await db.insert(durableEvents).values({
      idempotencyKey: key2,
      eventType: 'CAMPAIGN_PUBLISH',
      workspaceId: ws.id,
      status: 'PROCESSING',
      lockedUntil: lockFuture,
    });

    const concurrentExecution = await executeWithIdempotency(
      {
        idempotencyKey: key2,
        eventType: 'CAMPAIGN_PUBLISH',
        workspaceId: ws.id,
      },
      async () => {
        return { postId: 'fb_post_RACING_DISASTER' };
      }
    );

    ctx.assert(
      concurrentExecution.status === 'IN_FLIGHT',
      'Concurrency Protection: Concurrent request recognized as IN_FLIGHT'
    );
    ctx.assert(
      concurrentExecution.error?.includes('in-flight') === true,
      'Concurrency Protection: Prevents concurrent race condition with distributed lock'
    );

    // 5. Case 4: Network Timeout & Anti-Ghosting Reconciler Flag
    const key3 = IdempotencyKeyBuilder.campaignPublish({
      campaignId,
      platform: 'linkedin',
      contentVersionHash: 'hash_silk_festive',
    });
    createdEventKeys.push(key3);

    let timeoutCallCount = 0;
    const timeoutResult = await executeWithIdempotency(
      {
        idempotencyKey: key3,
        eventType: 'CAMPAIGN_PUBLISH',
        workspaceId: ws.id,
        maxRetries: 3,
      },
      async () => {
        timeoutCallCount++;
        throw new Error('ETIMEDOUT: Connection to social provider timed out');
      }
    );

    ctx.assert(timeoutCallCount === 1, 'Network Timeout: Handler was invoked');
    ctx.assert(
      timeoutResult.status === 'RECONCILIATION_REQUIRED',
      'Anti-Ghosting Guard: Timeout returns RECONCILIATION_REQUIRED rather than blind duplicate retry'
    );

    const [dbEvent3] = await db
      .select()
      .from(durableEvents)
      .where(eq(durableEvents.idempotencyKey, key3))
      .limit(1);

    ctx.assert(dbEvent3 !== undefined, 'Durable Ledger: Timeout event tracked in database');
    ctx.assert(dbEvent3.errorType === 'TIMEOUT', 'Durable Ledger: Classifies error as TIMEOUT');
    ctx.assert(
      dbEvent3.status === 'RECONCILIATION_REQUIRED',
      'Durable Ledger: Saves status RECONCILIATION_REQUIRED to prevent duplicate ghost posts'
    );

    // 5b. Case 4b: Transient Server Error (503 Service Unavailable) -> PENDING for Retry
    const key3b = IdempotencyKeyBuilder.campaignPublish({
      campaignId,
      platform: 'threads',
      contentVersionHash: 'hash_silk_festive',
    });
    createdEventKeys.push(key3b);

    const transientResult = await executeWithIdempotency(
      {
        idempotencyKey: key3b,
        eventType: 'CAMPAIGN_PUBLISH',
        workspaceId: ws.id,
        maxRetries: 3,
      },
      async () => {
        throw new Error('503 Service Unavailable: Social gateway rate-limited');
      }
    );

    ctx.assert(transientResult.status === 'FAILED', 'Transient 503: Returns FAILED to current worker');
    const [dbEvent3b] = await db
      .select()
      .from(durableEvents)
      .where(eq(durableEvents.idempotencyKey, key3b))
      .limit(1);
    ctx.assert(dbEvent3b.status === 'PENDING', 'Transient 503: Sets status PENDING for exponential backoff retry');
    ctx.assert(dbEvent3b.errorType === 'TRANSIENT', 'Transient 503: Classifies error as TRANSIENT');

    // 6. Case 5: Permanent Failure (Token Revocation / 401 Unauthorized)
    const key4 = IdempotencyKeyBuilder.campaignPublish({
      campaignId,
      platform: 'x',
      contentVersionHash: 'hash_silk_festive',
    });
    createdEventKeys.push(key4);

    const permanentResult = await executeWithIdempotency(
      {
        idempotencyKey: key4,
        eventType: 'CAMPAIGN_PUBLISH',
        workspaceId: ws.id,
        maxRetries: 3,
      },
      async () => {
        throw new Error('Status code 401: Unauthorized OAuth token expired or revoked');
      }
    );

    ctx.assert(permanentResult.status === 'FAILED', 'Permanent Failure: Reports failure to caller');

    const [dbEvent4] = await db
      .select()
      .from(durableEvents)
      .where(eq(durableEvents.idempotencyKey, key4))
      .limit(1);

    ctx.assert(dbEvent4.status === 'FAILED', 'Permanent Failure: Immediately transitions to FAILED (no futile retries)');
    ctx.assert(dbEvent4.errorType === 'PERMANENT', 'Permanent Failure: Classifies error as PERMANENT');
  } finally {
    // Cleanup Test Fixtures
    for (const k of createdEventKeys) {
      await db.delete(durableEvents).where(eq(durableEvents.idempotencyKey, k)).catch(() => {});
    }
    if (testWorkspaceId) {
      await db.delete(workspaces).where(eq(workspaces.id, testWorkspaceId)).catch(() => {});
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId)).catch(() => {});
    }
  }

  return ctx;
}

if (process.argv[1]?.includes('resilient-publishing.test.ts')) {
  runResilientPublishingIntegrationTests()
    .then((c) => {
      console.log(`\nResilient Publishing Integration Tests Complete: ${c.passed} passed, ${c.failed} failed.`);
      process.exit(c.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Fatal in Resilient Publishing Integration Tests:', err);
      process.exit(1);
    });
}
