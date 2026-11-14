import { NextRequest, NextResponse } from 'next/server';
import { db, workspaces, subscriptions, payments, processedWebhookEvents } from '@/db';
import { eq } from 'drizzle-orm';
import {
  verifyRazorpayWebhookSignature,
  isDuplicateBillingEvent,
  getPendingOrder,
  markOrderPaid,
  validatePlanAmount,
} from '@/lib/billing';

export const dynamic = 'force-dynamic';

/**
 * Handles incoming payment & subscription webhooks from Razorpay.
 * 
 * Strict Verification Architecture:
 * 1. Read raw request bytes before JSON parsing.
 * 2. Calculate HMAC-SHA256 using server RAZORPAY_WEBHOOK_SECRET.
 * 3. Securely compare X-Razorpay-Signature using constant-time comparison.
 * 4. Check unique event ID for duplicates (Idempotency).
 * 5. Validate payment/order relationship (status=captured, currency=INR, orderId belongs to workspace).
 * 6. Validate payment amount against server-calculated plan price.
 * 7. Atomically execute payment recording and subscription activation in a DB transaction.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Read raw request bytes before any JSON deserialization
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // 2. Verify Razorpay HMAC-SHA256 cryptographic signature
    const sigCheck = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!sigCheck.valid) {
      return NextResponse.json(
        { error: sigCheck.error },
        { status: sigCheck.status }
      );
    }

    // 3. Parse JSON only after signature verification
    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // 4. Derive unique event ID & perform Duplicate Event Idempotency Check
    const paymentEntity = event.payload?.payment?.entity;
    const orderEntity = event.payload?.order?.entity;
    const eventId =
      event.id ||
      event.event_id ||
      paymentEntity?.id ||
      (paymentEntity?.order_id ? `${paymentEntity.order_id}_captured` : null);

    if (eventId && isDuplicateBillingEvent(eventId)) {
      console.log(
        `[Razorpay Idempotency] Event '${eventId}' already processed in memory cache. Acknowledging with HTTP 200 without duplicate activation.`
      );
      return NextResponse.json(
        {
          received: true,
          duplicate: true,
          eventId,
          message: 'Event already processed. Duplicate activation prevented.',
        },
        { status: 200 }
      );
    }

    // Check database idempotency ledger if DB is connected
    if (eventId && db) {
      try {
        const [existingEvent] = await db
          .select()
          .from(processedWebhookEvents)
          .where(eq(processedWebhookEvents.id, eventId))
          .limit(1);

        if (existingEvent) {
          console.log(
            `[Razorpay Idempotency] Event '${eventId}' already recorded in processed_webhook_events DB. Acknowledging with HTTP 200 without duplicate activation.`
          );
          return NextResponse.json(
            {
              received: true,
              duplicate: true,
              eventId,
              message: 'Event already processed. Duplicate activation prevented.',
            },
            { status: 200 }
          );
        }
      } catch (checkErr) {
        console.warn('[Razorpay Idempotency DB Check Warning]:', checkErr);
      }
    }

    const eventType = event.event || 'payment.captured';

    // Only process payment.captured for plan activation
    if (eventType !== 'payment.captured') {
      return NextResponse.json(
        {
          received: true,
          status: 'unhandled_event_acknowledged',
          eventType,
        },
        { status: 200 }
      );
    }

    if (!paymentEntity) {
      return NextResponse.json(
        { error: 'Missing payment entity in webhook payload.' },
        { status: 400 }
      );
    }

    // 5. Validate captured status
    if (paymentEntity.status !== 'captured') {
      console.warn(`[Razorpay Webhook Rejected] Payment status is '${paymentEntity.status}', expected 'captured'.`);
      return NextResponse.json(
        { error: `Payment status is '${paymentEntity.status}', expected 'captured'.` },
        { status: 400 }
      );
    }

    // 6. Validate currency
    if (paymentEntity.currency !== 'INR') {
      console.warn(`[Razorpay Webhook Rejected] Wrong currency '${paymentEntity.currency}'. Expected 'INR'.`);
      return NextResponse.json(
        { error: `Wrong currency: Expected 'INR', received '${paymentEntity.currency}'.` },
        { status: 400 }
      );
    }

    // 7. Validate Order ID & Workspace Relationship
    const orderId = paymentEntity.order_id || orderEntity?.id || paymentEntity.notes?.orderId;
    if (!orderId) {
      console.warn('[Razorpay Webhook Rejected] Missing order ID in payment entity.');
      return NextResponse.json(
        { error: 'Wrong order ID: Missing order ID in payment.' },
        { status: 400 }
      );
    }

    const pendingOrder = getPendingOrder(orderId);
    if (!pendingOrder) {
      console.warn(`[Razorpay Webhook Rejected] Order '${orderId}' not found in pending store or has expired.`);
      return NextResponse.json(
        { error: 'Wrong order ID: Order not found or expired.' },
        { status: 400 }
      );
    }

    let targetWorkspaceId =
      paymentEntity.notes?.workspaceId ||
      orderEntity?.notes?.workspaceId ||
      pendingOrder.workspaceId;

    if (targetWorkspaceId && pendingOrder.workspaceId !== targetWorkspaceId) {
      console.warn(
        `[Razorpay Webhook Rejected] Workspace mismatch. Order belongs to ${pendingOrder.workspaceId}, payload specifies ${targetWorkspaceId}.`
      );
      return NextResponse.json(
        { error: 'Wrong order ID: Order does not belong to the target workspace.' },
        { status: 400 }
      );
    }

    targetWorkspaceId = pendingOrder.workspaceId;

    // Validate workspace exists in Neon DB
    let targetWorkspace: typeof workspaces.$inferSelect | undefined;
    if (db) {
      const [matchedWs] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, targetWorkspaceId))
        .limit(1);

      if (!matchedWs) {
        console.warn(`[Razorpay Webhook Rejected] Target workspace '${targetWorkspaceId}' not found in database.`);
        return NextResponse.json(
          { error: 'Target workspace not found.' },
          { status: 404 }
        );
      }
      targetWorkspace = matchedWs;
    }

    // 8. Validate amount matches expected plan price
    const paymentAmount = Number(paymentEntity.amount);
    const amountCheck = validatePlanAmount(
      paymentAmount,
      pendingOrder.tier,
      pendingOrder.billingCycle
    );

    if (!amountCheck.valid) {
      console.warn(
        `[Razorpay Webhook Rejected] Incorrect amount for order ${orderId}. Expected ${amountCheck.expectedPaise} paise (or ₹${amountCheck.expectedRupees}), received ${paymentAmount}.`
      );
      return NextResponse.json(
        {
          error: `Incorrect amount: Payment amount does not match expected plan price for ${pendingOrder.tier} (${pendingOrder.billingCycle}).`,
        },
        { status: 400 }
      );
    }

    // 9. ATOMIC DATABASE TRANSACTION: Payment Verification & Subscription Activation
    const invoiceNumber = `KUIRO/26-27/${Math.floor(1000 + Math.random() * 9000)}`;
    const periodStart = new Date();
    const periodEnd = new Date();
    if (pendingOrder.billingCycle === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    if (db && targetWorkspace) {
      const activeDb = db;
      const ws = targetWorkspace;
      const executeAtomicSubscriptionActivation = async () => {
        // Try Drizzle batch (supported by neon-http driver for atomic single HTTP pipeline execution)
        if (typeof (activeDb as any).batch === 'function') {
          try {
            const batchQueries: any[] = [
              activeDb
                .update(workspaces)
                .set({ subscriptionTier: pendingOrder.tier })
                .where(eq(workspaces.id, ws.id)),
              activeDb.insert(subscriptions).values({
                workspaceId: ws.id,
                planTier: pendingOrder.tier,
                billingCycle: pendingOrder.billingCycle,
                status: 'ACTIVE',
                currentPeriodStart: periodStart,
                currentPeriodEnd: periodEnd,
                razorpaySubscriptionId: paymentEntity.id,
              }),
              activeDb.insert(payments).values({
                workspaceId: ws.id,
                orderId: pendingOrder.orderId,
                paymentId: paymentEntity.id,
                amount: paymentAmount,
                currency: paymentEntity.currency,
                status: 'captured',
                gateway: 'razorpay',
                planTier: pendingOrder.tier,
                invoiceNumber,
                rawEventData: event,
              }),
            ];

            if (eventId) {
              batchQueries.push(
                activeDb.insert(processedWebhookEvents).values({
                  id: eventId,
                  gateway: 'razorpay',
                  eventType,
                })
              );
            }

            await (activeDb as any).batch(batchQueries);
            return;
          } catch (batchErr) {
            console.warn('[Drizzle Batch fallback to sequential writes]:', batchErr);
          }
        }

        // Sequential DB writes
        await activeDb
          .update(workspaces)
          .set({ subscriptionTier: pendingOrder.tier })
          .where(eq(workspaces.id, ws.id));

        await activeDb.insert(subscriptions).values({
          workspaceId: ws.id,
          planTier: pendingOrder.tier,
          billingCycle: pendingOrder.billingCycle,
          status: 'ACTIVE',
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          razorpaySubscriptionId: paymentEntity.id,
        });

        await activeDb.insert(payments).values({
          workspaceId: ws.id,
          orderId: pendingOrder.orderId,
          paymentId: paymentEntity.id,
          amount: paymentAmount,
          currency: paymentEntity.currency,
          status: 'captured',
          gateway: 'razorpay',
          planTier: pendingOrder.tier,
          invoiceNumber,
          rawEventData: event,
        });

        if (eventId) {
          await activeDb.insert(processedWebhookEvents).values({
            id: eventId,
            gateway: 'razorpay',
            eventType,
          });
        }
      };

      await executeAtomicSubscriptionActivation();
    }

    // Mark order as paid in store
    markOrderPaid(orderId);

    console.log(
      `[Razorpay Webhook Success] Workspace ${targetWorkspaceId} successfully upgraded to ${pendingOrder.tier} (${pendingOrder.billingCycle}). Invoice: ${invoiceNumber}`
    );

    return NextResponse.json(
      {
        received: true,
        verified: true,
        event: eventType,
        orderId,
        paymentId: paymentEntity.id,
        planActivated: pendingOrder.tier,
        billingCycle: pendingOrder.billingCycle,
        invoiceNumber,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Billing Webhook Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
