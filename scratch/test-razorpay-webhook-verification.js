// Automated Razorpay Webhook Verification & Subscription Activation Test Suite
// Tests all 6 acceptance criteria:
// 1. Forged signature: rejected
// 2. Wrong order ID: rejected
// 3. Incorrect amount: rejected
// 4. Wrong currency: rejected
// 5. Duplicate event: no duplicate activation
// 6. Genuine captured payment: correct plan activated in database

const crypto = require('crypto');

const BASE_URL = 'http://localhost:3000';
const WEBHOOK_SECRET = 'kuiro_razorpay_webhook_secret_secure_32chars';

function computeRazorpaySignature(rawBody, secret = WEBHOOK_SECRET) {
  return crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
}

async function runTests() {
  console.log('=== KUIRO Razorpay Webhook Security & Idempotency Verification ===\n');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      throw new Error(message);
    }
    passed++;
    console.log(`✅ PASS: ${message}`);
  }

  // 1. Setup authenticated user and workspace
  console.log('1. Setting up authenticated user & workspace...');
  const testEmail = `razorpay_tester_${Date.now()}@example.com`;
  const testPassword = 'Password123!Secure';

  const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      name: 'Razorpay Security Tester',
      businessName: 'Sharma Heritage Studios',
    }),
  });

  const cookieHeader = signupRes.headers.get('set-cookie');
  const signupData = await signupRes.json();
  const workspaceId = signupData.workspace?.id;
  assert(Boolean(workspaceId), `Workspace initialized: ${workspaceId} (initial tier: ${signupData.workspace?.subscriptionTier || 'GROWTH'})`);

  // 2. Initialize a checkout order for AGENCY tier (₹11,999 + 18% GST = ₹14,159 = 1415900 paise)
  console.log('\n2. Initializing pending checkout order for AGENCY tier...');
  const checkoutRes = await fetch(`${BASE_URL}/api/billing/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      workspaceId,
      tier: 'AGENCY',
      billingCycle: 'monthly',
      paymentMethod: 'upi',
    }),
  });

  const checkoutData = await checkoutRes.json();
  assert(checkoutRes.status === 200 && checkoutData.success, 'Checkout session generated pending order');
  const orderId = checkoutData.order.orderId;
  const expectedAmountPaise = checkoutData.order.totalAmount * 100; // e.g. 1415900
  console.log(`   Order ID: ${orderId} | Total: ₹${checkoutData.order.totalAmount} (${expectedAmountPaise} paise)`);

  // Helper to send webhook requests
  async function postWebhook(payloadObject, signatureHeader) {
    const rawBody = typeof payloadObject === 'string' ? payloadObject : JSON.stringify(payloadObject);
    const headers = { 'Content-Type': 'application/json' };
    if (signatureHeader !== undefined) {
      headers['x-razorpay-signature'] = signatureHeader;
    }

    const res = await fetch(`${BASE_URL}/api/billing/webhook`, {
      method: 'POST',
      headers,
      body: rawBody,
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
  }

  // Base payload factory
  function buildPaymentPayload(overrides = {}) {
    const paymentId = overrides.paymentId || `pay_test_${Date.now()}`;
    return {
      entity: 'event',
      account_id: 'acc_kuiro_live_test',
      event: overrides.event || 'payment.captured',
      id: overrides.eventId || `event_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: paymentId,
            entity: 'payment',
            amount: overrides.amount !== undefined ? overrides.amount : expectedAmountPaise,
            currency: overrides.currency || 'INR',
            status: overrides.status || 'captured',
            order_id: overrides.orderId !== undefined ? overrides.orderId : orderId,
            notes: {
              workspaceId: overrides.workspaceId || workspaceId,
              tier: 'AGENCY',
              billingCycle: 'monthly',
            },
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    };
  }

  console.log('\n3. Testing Acceptance Criteria...');

  // Test 1: Forged signature rejected (HTTP 401)
  const p1 = buildPaymentPayload();
  const raw1 = JSON.stringify(p1);
  const t1 = await postWebhook(raw1, 'forged_fake_signature_hex_00000000000000000000000000000000');
  assert(t1.status === 401, 'Forged signature: rejected with HTTP 401 Unauthorized');

  // Test 2: Missing signature rejected (HTTP 401)
  const t2 = await postWebhook(raw1, undefined);
  assert(t2.status === 401, 'Missing signature header: rejected with HTTP 401 Unauthorized');

  // Test 3: Wrong order ID rejected (HTTP 400)
  const p3 = buildPaymentPayload({ orderId: 'order_non_existent_99999' });
  const raw3 = JSON.stringify(p3);
  const sig3 = computeRazorpaySignature(raw3);
  const t3 = await postWebhook(raw3, sig3);
  assert(t3.status === 400 && t3.body.error.includes('Wrong order ID'), 'Wrong order ID (unknown): rejected with HTTP 400');

  // Test 4: Order ID belonging to wrong workspace rejected (HTTP 400)
  const p4 = buildPaymentPayload({ workspaceId: 'ws_foreign_tenant_99999999' });
  const raw4 = JSON.stringify(p4);
  const sig4 = computeRazorpaySignature(raw4);
  const t4 = await postWebhook(raw4, sig4);
  assert(t4.status === 400 && t4.body.error.includes('Wrong order ID'), 'Order with wrong workspace: rejected with HTTP 400');

  // Test 5: Wrong currency rejected (HTTP 400)
  const p5 = buildPaymentPayload({ currency: 'USD' });
  const raw5 = JSON.stringify(p5);
  const sig5 = computeRazorpaySignature(raw5);
  const t5 = await postWebhook(raw5, sig5);
  assert(t5.status === 400 && t5.body.error.includes('Wrong currency'), 'Wrong currency (USD instead of INR): rejected with HTTP 400');

  // Test 6: Incorrect amount rejected (HTTP 400)
  const p6 = buildPaymentPayload({ amount: 50000 }); // ₹500 instead of ₹14,159
  const raw6 = JSON.stringify(p6);
  const sig6 = computeRazorpaySignature(raw6);
  const t6 = await postWebhook(raw6, sig6);
  assert(t6.status === 400 && t6.body.error.includes('Incorrect amount'), 'Incorrect amount (underpayment): rejected with HTTP 400');

  // Test 7: Non-captured status rejected (HTTP 400)
  const p7 = buildPaymentPayload({ status: 'failed' });
  const raw7 = JSON.stringify(p7);
  const sig7 = computeRazorpaySignature(raw7);
  const t7 = await postWebhook(raw7, sig7);
  assert(t7.status === 400 && t7.body.error.includes('captured'), 'Non-captured payment status: rejected with HTTP 400');

  // Test 8: Genuine captured payment: correct plan activated in DB (HTTP 200)
  const genuineEventId = `event_genuine_${Date.now()}`;
  const genuinePaymentId = `pay_genuine_${Date.now()}`;
  const p8 = buildPaymentPayload({
    eventId: genuineEventId,
    paymentId: genuinePaymentId,
  });
  const raw8 = JSON.stringify(p8);
  const sig8 = computeRazorpaySignature(raw8);
  const t8 = await postWebhook(raw8, sig8);
  assert(t8.status === 200 && t8.body.verified === true && t8.body.planActivated === 'AGENCY', 'Genuine captured payment: accepted with HTTP 200, planActivated=AGENCY');

  // Verify DB state updated via /api/auth/me
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: cookieHeader },
  });
  const meData = await meRes.json();
  assert(meData.workspace?.subscriptionTier === 'AGENCY', 'Workspace subscription tier atomically upgraded to AGENCY in database');

  // Test 9: Duplicate event retry: no duplicate activation (HTTP 200 acknowledged)
  const t9 = await postWebhook(raw8, sig8);
  assert(
    t9.status === 200 && t9.body.duplicate === true && t9.body.received === true,
    'Duplicate event: acknowledged with HTTP 200 duplicate=true without duplicate activation'
  );

  console.log(`\n=============================================`);
  console.log(`Razorpay Webhook Verification: ${passed}/${total} checks PASSED! 🛡️`);
  console.log(`=============================================\n`);
}

runTests().catch((err) => {
  console.error('\n❌ Suite execution failed:', err);
  process.exit(1);
});
