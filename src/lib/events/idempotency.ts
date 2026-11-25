import { db, durableEvents } from '@/db';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';

export type EventStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'RECONCILIATION_REQUIRED' 
  | 'EXHAUSTED';

export type ErrorClassification = 'TRANSIENT' | 'PERMANENT' | 'TIMEOUT' | 'UNKNOWN';

export interface IdempotencyExecutionOptions<TResult> {
  idempotencyKey: string;
  eventType: string;
  workspaceId?: string;
  relatedEntityId?: string;
  payload?: any;
  maxRetries?: number;
  lockTimeoutMs?: number;
  reconcileFn?: () => Promise<{
    reconciled: boolean;
    result?: TResult;
    stillUncertain?: boolean;
    reason?: string;
  } | null>;
}

export interface IdempotencyExecutionResult<TResult> {
  status: 'COMPLETED' | 'CACHED' | 'RECONCILED' | 'IN_FLIGHT' | 'FAILED' | 'RECONCILIATION_REQUIRED';
  idempotent: boolean;
  result?: TResult;
  error?: string;
  retryCount?: number;
  idempotencyKey: string;
}

/**
 * Classifies errors into Transient (retryable with backoff) vs. Permanent (fail-closed, non-retryable)
 */
export function classifyError(error: any): {
  isTransient: boolean;
  errorType: ErrorClassification;
  message: string;
} {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMsg = message.toLowerCase();

  // 1. Timeout & Network Uncertainties
  if (
    lowerMsg.includes('timeout') ||
    lowerMsg.includes('etimedout') ||
    lowerMsg.includes('timed out') ||
    lowerMsg.includes('econnreset') ||
    lowerMsg.includes('econnrefused') ||
    lowerMsg.includes('socket hang up') ||
    lowerMsg.includes('network error')
  ) {
    return { isTransient: true, errorType: 'TIMEOUT', message };
  }

  // 2. Transient Server / Rate-Limit Errors (503, 502, 504, 429)
  if (
    lowerMsg.includes('rate limit') ||
    lowerMsg.includes('too many requests') ||
    lowerMsg.includes('status code 429') ||
    lowerMsg.includes('status code 502') ||
    lowerMsg.includes('status code 503') ||
    lowerMsg.includes('status code 504') ||
    lowerMsg.includes('service unavailable') ||
    lowerMsg.includes('gateway timeout') ||
    lowerMsg.includes('temporarily unavailable')
  ) {
    return { isTransient: true, errorType: 'TRANSIENT', message };
  }

  // 3. Permanent Client / Authorization / Semantic Errors (400, 401, 403, 422)
  if (
    lowerMsg.includes('unauthorized') ||
    lowerMsg.includes('invalid signature') ||
    lowerMsg.includes('permission denied') ||
    lowerMsg.includes('forbidden') ||
    lowerMsg.includes('status code 401') ||
    lowerMsg.includes('status code 403') ||
    lowerMsg.includes('token expired') ||
    lowerMsg.includes('token revoked') ||
    lowerMsg.includes('validation error') ||
    lowerMsg.includes('invalid argument') ||
    lowerMsg.includes('bad request') ||
    lowerMsg.includes('status code 400') ||
    lowerMsg.includes('status code 422') ||
    lowerMsg.includes('not found') ||
    lowerMsg.includes('status code 404')
  ) {
    return { isTransient: false, errorType: 'PERMANENT', message };
  }

  // Default to Unknown
  return { isTransient: false, errorType: 'UNKNOWN', message };
}

/**
 * Generates structured, deterministic idempotency keys across all core KUIRO operations
 */
export const IdempotencyKeyBuilder = {
  campaignPublish: ({
    campaignId,
    platform,
    contentVersionHash,
  }: {
    campaignId: string;
    platform: string;
    contentVersionHash: string;
  }) => `campaign_publish_${campaignId}_${platform.toLowerCase()}_${contentVersionHash}`,

  paymentConfirmation: ({
    gateway,
    paymentId,
    orderId,
  }: {
    gateway: string;
    paymentId?: string;
    orderId?: string;
  }) => `payment_${gateway.toLowerCase()}_${paymentId || orderId}`,

  whatsAppOutbound: ({
    conversationId,
    messageHash,
  }: {
    conversationId: string;
    messageHash: string;
  }) => `wa_outbound_${conversationId}_${messageHash}`,

  campaignApproval: ({
    campaignId,
    revisionNumber,
  }: {
    campaignId: string;
    revisionNumber: number;
  }) => `campaign_approve_${campaignId}_rev${revisionNumber}`,

  webhookEvent: ({
    provider,
    eventId,
  }: {
    provider: string;
    eventId: string;
  }) => `webhook_${provider.toLowerCase()}_${eventId}`,

  subscriptionRenewal: ({
    workspaceId,
    periodStart,
  }: {
    workspaceId: string;
    periodStart: string;
  }) => `sub_renewal_${workspaceId}_${periodStart}`,
};

/**
 * Computes a SHA-256 fingerprint for arbitrary payload strings
 */
export function computePayloadHash(content: string): string {
  return crypto.createHash('sha256').update(content.trim()).digest('hex').substring(0, 16);
}

/**
 * Executes an operation with guaranteed idempotency and resilient retry semantics.
 * 
 * 1. Deduplication: Returns cached result if operation already COMPLETED.
 * 2. In-Flight Protection: Blocks concurrent executions while lock is active.
 * 3. Anti-Ghosting Reconciler: Resolves timeouts on social platforms before re-attempting.
 * 4. Failure Classification: Differentiates transient errors from permanent errors.
 * 5. Dead-Lettering: Moves exhausted jobs to 'EXHAUSTED' for manual operator review.
 */
export async function executeWithIdempotency<TResult>(
  options: IdempotencyExecutionOptions<TResult>,
  operationFn: () => Promise<TResult>
): Promise<IdempotencyExecutionResult<TResult>> {
  const {
    idempotencyKey,
    eventType,
    workspaceId,
    relatedEntityId,
    payload,
    maxRetries = 3,
    lockTimeoutMs = 60000,
    reconcileFn,
  } = options;

  if (!db) {
    // If DB is offline in non-production test, execute directly with local warning
    console.warn('[Idempotency] Database offline, executing operation directly without persistence.');
    const result = await operationFn();
    return {
      status: 'COMPLETED',
      idempotent: false,
      result,
      idempotencyKey,
    };
  }

  const now = new Date();
  const lockExpiresAt = new Date(now.getTime() + lockTimeoutMs);

  // 1. Fetch Existing Event Receipt
  const [existingRecord] = await db
    .select()
    .from(durableEvents)
    .where(eq(durableEvents.idempotencyKey, idempotencyKey))
    .limit(1);

  if (existingRecord) {
    // A. Already COMPLETED: Pure Idempotency -> Return cached result immediately with ZERO duplicate side-effects
    if (existingRecord.status === 'COMPLETED') {
      return {
        status: 'CACHED',
        idempotent: true,
        result: existingRecord.resultPayload as TResult,
        idempotencyKey,
      };
    }

    // B. Currently PROCESSING & Lock is still active: Protect against concurrent racing executions
    if (
      existingRecord.status === 'PROCESSING' &&
      existingRecord.lockedUntil &&
      new Date(existingRecord.lockedUntil).getTime() > now.getTime()
    ) {
      return {
        status: 'IN_FLIGHT',
        idempotent: true,
        error: `Operation with idempotency key '${idempotencyKey}' is currently in-flight. Concurrency locked until ${existingRecord.lockedUntil.toISOString()}`,
        idempotencyKey,
      };
    }

    // C. RECONCILIATION_REQUIRED: External API timed out on previous attempt
    if (existingRecord.status === 'RECONCILIATION_REQUIRED') {
      if (reconcileFn) {
        console.log(`[Idempotency Reconciler] Attempting external reconciliation for key '${idempotencyKey}'...`);
        try {
          const reconResult = await reconcileFn();
          if (reconResult?.reconciled && reconResult.result) {
            // Discovered external post / transaction did indeed succeed!
            await db
              .update(durableEvents)
              .set({
                status: 'COMPLETED',
                completedAt: new Date(),
                resultPayload: reconResult.result,
                updatedAt: new Date(),
              })
              .where(eq(durableEvents.id, existingRecord.id));

            return {
              status: 'RECONCILED',
              idempotent: true,
              result: reconResult.result,
              idempotencyKey,
            };
          }

          if (reconResult?.stillUncertain) {
            return {
              status: 'RECONCILIATION_REQUIRED',
              idempotent: true,
              error: reconResult.reason || 'Outcome remains uncertain at external provider. Manual operator reconciliation required.',
              idempotencyKey,
            };
          }
        } catch (reconErr: any) {
          console.warn(`[Idempotency Reconciler] Reconciliation query failed:`, reconErr);
        }
      }
    }

    // D. EXHAUSTED: Max retries exceeded (Dead-Letter state)
    if (existingRecord.status === 'EXHAUSTED') {
      return {
        status: 'FAILED',
        idempotent: true,
        error: `Operation has exhausted its maximum retries (${existingRecord.retryCount}/${existingRecord.maxRetries}). Dead-lettered for manual operator replay.`,
        retryCount: existingRecord.retryCount,
        idempotencyKey,
      };
    }

    // E. PERMANENT FAILURE: Never retry permanent permission or validation errors indefinitely
    if (existingRecord.status === 'FAILED' && existingRecord.errorType === 'PERMANENT') {
      return {
        status: 'FAILED',
        idempotent: true,
        error: `Operation previously failed with non-retryable permanent error: ${existingRecord.lastError}`,
        idempotencyKey,
      };
    }

    // F. Re-acquire lock for retry
    await db
      .update(durableEvents)
      .set({
        status: 'PROCESSING',
        lockedUntil: lockExpiresAt,
        retryCount: sql`${durableEvents.retryCount} + 1`,
        updatedAt: now,
      })
      .where(eq(durableEvents.id, existingRecord.id));
  } else {
    // 2. Insert new In-Flight Receipt with Unique Idempotency Key
    try {
      await db.insert(durableEvents).values({
        idempotencyKey,
        eventType,
        workspaceId,
        relatedEntityId,
        status: 'PROCESSING',
        payload,
        maxRetries,
        lockedUntil: lockExpiresAt,
      });
    } catch (insertErr: any) {
      // Race-condition fallback if another node inserted concurrently
      const [raceWinner] = await db
        .select()
        .from(durableEvents)
        .where(eq(durableEvents.idempotencyKey, idempotencyKey))
        .limit(1);

      if (raceWinner?.status === 'COMPLETED') {
        return {
          status: 'CACHED',
          idempotent: true,
          result: raceWinner.resultPayload as TResult,
          idempotencyKey,
        };
      }

      return {
        status: 'IN_FLIGHT',
        idempotent: true,
        error: `Concurrent duplicate operation locked key: ${idempotencyKey}`,
        idempotencyKey,
      };
    }
  }

  // 3. Execute the Target Operation
  try {
    const result = await operationFn();

    // 4. Mark COMPLETED upon success
    await db
      .update(durableEvents)
      .set({
        status: 'COMPLETED',
        completedAt: new Date(),
        resultPayload: result,
        updatedAt: new Date(),
      })
      .where(eq(durableEvents.idempotencyKey, idempotencyKey));

    return {
      status: 'COMPLETED',
      idempotent: false,
      result,
      idempotencyKey,
    };
  } catch (opErr: any) {
    const { isTransient, errorType, message } = classifyError(opErr);

    console.error(`[Idempotency Execution Error on ${idempotencyKey}]:`, message);

    // Fetch current attempts count
    const [currentRec] = await db
      .select()
      .from(durableEvents)
      .where(eq(durableEvents.idempotencyKey, idempotencyKey))
      .limit(1);

    const attempts = currentRec?.retryCount || 1;

    let targetStatus: EventStatus = 'FAILED';
    if (errorType === 'TIMEOUT') {
      // Social/External publishing timeout: mark for reconciliation rather than blind retry
      targetStatus = 'RECONCILIATION_REQUIRED';
    } else if (isTransient) {
      if (attempts >= maxRetries) {
        targetStatus = 'EXHAUSTED'; // Move to dead-letter state
      } else {
        targetStatus = 'PENDING'; // Ready for exponential backoff retry
      }
    } else {
      targetStatus = 'FAILED'; // Non-retryable permanent error
    }

    await db
      .update(durableEvents)
      .set({
        status: targetStatus,
        errorType,
        lastError: message,
        updatedAt: new Date(),
      })
      .where(eq(durableEvents.idempotencyKey, idempotencyKey));

    return {
      status: targetStatus === 'RECONCILIATION_REQUIRED' ? 'RECONCILIATION_REQUIRED' : 'FAILED',
      idempotent: false,
      error: message,
      retryCount: attempts,
      idempotencyKey,
    };
  }
}

/**
 * Manually replays an exhausted or failed dead-letter event after administrator review
 */
export async function replayDeadLetterEvent<TResult>(
  idempotencyKey: string,
  operationFn: () => Promise<TResult>
): Promise<IdempotencyExecutionResult<TResult>> {
  if (!db) {
    throw new Error('Database unavailable for dead-letter replay');
  }

  // Reset status to PENDING and clear errors
  await db
    .update(durableEvents)
    .set({
      status: 'PENDING',
      lastError: null,
      errorType: null,
      retryCount: 0,
      updatedAt: new Date(),
    })
    .where(eq(durableEvents.idempotencyKey, idempotencyKey));

  return executeWithIdempotency(
    {
      idempotencyKey,
      eventType: 'DEAD_LETTER_REPLAY',
    },
    operationFn
  );
}
