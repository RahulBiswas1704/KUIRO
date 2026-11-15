import '../setup';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { TestSuiteContext } from '../setup';
import { db, users, workspaces, subscriptions, payments } from '@/db';
import { eq, and } from 'drizzle-orm';
import { hashPassword, createDatabaseSession } from '@/lib/auth';
import { createPendingOrder, getPendingOrder } from '@/lib/billing';
import { POST as verifyPaymentHandler } from '@/app/api/billing/verify-payment/route';

export async function runPaymentActivationIntegrationTests(): Promise<TestSuiteContext> {
  const ctx = new TestSuiteContext('Level B: Payment Signature & Subscription Activation Integration Tests');
  console.log(`\n================================================================`);
  console.log(`  RUNNING: ${ctx.name}`);
  console.log(`================================================================`);

  if (!db) {
    throw new Error('Neon PostgreSQL database connection is unavailable.');
  }

  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!razorpaySecret) {
    throw new Error('RAZORPAY_KEY_SECRET is required for payment verification tests.');
  }

  const runId = Date.now().toString(36);
  let testUserId: string | null = null;
  let testWorkspaceId: string | null = null;
  let sessionToken: string | null = null;

  try {
    // 1. Provision Test Workspace with STARTER Tier
    const [user] = await db
      .insert(users)
      .values({
        name: 'Sharma Heritage Retailer',
        email: `retailer.billing.${runId}@kuiro-test.io`,
        passwordHash: hashPassword('BillingPass123!'),
        role: 'Founder',
        emailVerified: true,
      })
      .returning();
    testUserId = user.id;

    const [ws] = await db
      .insert(workspaces)
      .values({
        name: `Heritage Sarees (${runId})`,
        ownerId: user.id,
        subscriptionTier: 'STARTER',
      })
      .returning();
    testWorkspaceId = ws.id;

    const sessionRes = await createDatabaseSession(user.id);
    sessionToken = sessionRes.token;

    ctx.assert(ws.subscriptionTier === 'STARTER', 'Billing Setup: Initial workspace created on STARTER tier');

    // 2. Initiate Checkout (Create Pending Order)
    const pendingOrder = createPendingOrder({
      workspaceId: ws.id,
      tier: 'GROWTH',
      billingCycle: 'monthly',
      paymentMethod: 'upi',
      gateway: 'razorpay',
      businessName: 'Sharma Heritage Retail & Studio',
      gstin: '19AAACS1429B1Z8',
    });

    ctx.assert(!!pendingOrder.orderId, 'Checkout Initiation: Generated server-side pending order ID');
    ctx.assert(pendingOrder.totalAmount === 3303, 'Checkout Initiation: Computes exact pricing with 18% GST (2799 + 504 = 3303 INR)');

    const fetchedOrder = getPendingOrder(pendingOrder.orderId);
    ctx.assert(fetchedOrder?.status === 'PENDING', 'Pending Order Store: Stores order with status PENDING');

    // 3. Forged Signature Rejection
    const fakePaymentId = `pay_fake_${runId}`;
    const forgedReq = new NextRequest('http://localhost:3000/api/billing/verify-payment', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        workspaceId: ws.id,
        orderId: pendingOrder.orderId,
        paymentId: fakePaymentId,
        signature: 'forged_fake_signature_hex_00000000000000000000000000000000',
        gateway: 'razorpay',
      }),
    });

    const forgedRes = await verifyPaymentHandler(forgedReq);
    const forgedBody = await forgedRes.json();
    ctx.assert(
      (forgedRes.status === 400 || forgedRes.status === 401) &&
        forgedBody.code === 'INVALID_PAYMENT_SIGNATURE',
      'Tamper Resistance: Rejects forged payment signature with HTTP 400/401 and INVALID_PAYMENT_SIGNATURE'
    );

    // Verify workspace tier has NOT changed
    const [unchangedWs] = await db.select().from(workspaces).where(eq(workspaces.id, ws.id));
    ctx.assert(unchangedWs.subscriptionTier === 'STARTER', 'Tamper Resistance: Workspace remains on STARTER tier after forged attempt');

    // 4. Genuine Cryptographic Signature Verification & Plan Activation
    const genuinePaymentId = `pay_genuine_${runId}`;
    const validSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(`${pendingOrder.orderId}|${genuinePaymentId}`)
      .digest('hex');

    const genuineReq = new NextRequest('http://localhost:3000/api/billing/verify-payment', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        workspaceId: ws.id,
        orderId: pendingOrder.orderId,
        paymentId: genuinePaymentId,
        signature: validSignature,
        gateway: 'razorpay',
      }),
    });

    const genuineRes = await verifyPaymentHandler(genuineReq);
    const genuineBody = await genuineRes.json();

    ctx.assert(genuineRes.status === 200, 'Payment Verification: Genuine signature accepted with HTTP 200');
    ctx.assert(genuineBody.success === true && genuineBody.planActivated === 'GROWTH', 'Payment Verification: Confirms activation of GROWTH tier');

    // 5. Database State Verification (Atomicity)
    const [updatedWs] = await db.select().from(workspaces).where(eq(workspaces.id, ws.id));
    ctx.assert(updatedWs.subscriptionTier === 'GROWTH', 'Database Mutation: Workspace atomically upgraded to GROWTH in Neon PostgreSQL');

    const [dbSubscription] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.workspaceId, ws.id), eq(subscriptions.status, 'ACTIVE')));
    ctx.assert(dbSubscription !== undefined && dbSubscription.planTier === 'GROWTH', 'Database Mutation: Active subscription record created for GROWTH plan');

    const [dbPayment] = await db
      .select()
      .from(payments)
      .where(eq(payments.paymentId, genuinePaymentId));
    ctx.assert(dbPayment !== undefined && dbPayment.status === 'captured', 'Database Mutation: Captured payment ledger entry recorded');

    // 6. Idempotent Duplicate Activation Handling
    const duplicateReq = new NextRequest('http://localhost:3000/api/billing/verify-payment', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        workspaceId: ws.id,
        orderId: pendingOrder.orderId,
        paymentId: genuinePaymentId,
        signature: validSignature,
        gateway: 'razorpay',
      }),
    });

    const duplicateRes = await verifyPaymentHandler(duplicateReq);
    const duplicateBody = await duplicateRes.json();

    ctx.assert(duplicateRes.status === 200, 'Idempotency: Re-submitted payment returns HTTP 200');
    ctx.assert(duplicateBody.duplicate === true, 'Idempotency: Acknowledges duplicate verification without re-processing');

    const totalPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.workspaceId, ws.id));
    ctx.assert(totalPayments.length === 1, 'Idempotency: Ledger maintains exactly 1 payment record');
  } finally {
    // Cleanup Test Fixtures
    if (testWorkspaceId) {
      await db.delete(payments).where(eq(payments.workspaceId, testWorkspaceId)).catch(() => {});
      await db.delete(subscriptions).where(eq(subscriptions.workspaceId, testWorkspaceId)).catch(() => {});
      await db.delete(workspaces).where(eq(workspaces.id, testWorkspaceId)).catch(() => {});
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId)).catch(() => {});
    }
  }

  return ctx;
}

if (process.argv[1]?.includes('payment-activation.test.ts')) {
  runPaymentActivationIntegrationTests()
    .then((c) => {
      console.log(`\nPayment Activation Integration Tests Complete: ${c.passed} passed, ${c.failed} failed.`);
      process.exit(c.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Fatal in Payment Activation Integration Tests:', err);
      process.exit(1);
    });
}
