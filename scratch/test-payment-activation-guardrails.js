/**
 * KUIRO Payment Activation Guardrails & Anti-Simulation Test Suite
 * 
 * Verifies Acceptance Criteria:
 * 1. Visiting checkout / creating checkout session does NOT activate a subscription.
 * 2. Closing payment window leaves subscription pending (status: PENDING).
 * 3. Failed or unverified payment does NOT activate a plan.
 * 4. Forged success response does NOT activate a plan (fake signatures rejected).
 * 5. Frontend tampering (e.g. sending tier: "AGENCY" for a STARTER/GROWTH order) is ignored.
 * 6. Verified genuine payment activates the correct plan exactly once.
 * 7. Duplicate payment verification is idempotent (no duplicate activation).
 */

const crypto = require('crypto');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'kuiro_razorpay_key_secret_secure_123';

async function runTests() {
  console.log('=== KUIRO Payment Activation & Anti-Simulation Verification ===\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Setup authenticated session and workspace with STARTER tier
  console.log('1. Setting up authenticated user & workspace with STARTER tier...');
  const userEmail = `founder.billing.test.${Date.now()}@kuiro.in`;
  const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userEmail,
      password: 'SecurePassword2026!@#',
      name: 'Billing Test Founder',
      brandName: 'Guardrails Handlooms',
      industry: 'Retail & Commerce',
    }),
  });

  const signupData = await signupRes.json();
  const rawCookie = signupRes.headers.get('set-cookie');
  const sessionCookie = rawCookie ? rawCookie.split(';')[0] : '';
  const workspaceId = signupData.workspace?.id;

  assert(
    signupRes.ok && !!workspaceId,
    `Workspace provisioned: ${workspaceId} (Initial tier: ${signupData.workspace?.subscriptionTier || 'STARTER'})`
  );

  const authHeaders = {
    'Content-Type': 'application/json',
    Cookie: sessionCookie,
  };

  // --------------------------------------------------------------------------
  // TEST 1: Visiting checkout / initiating checkout does NOT activate a subscription
  // --------------------------------------------------------------------------
  console.log('\n2. Testing Checkout Session Initiation (Should NOT mutate tier)...');
  const checkoutRes = await fetch(`${BASE_URL}/api/billing/create-checkout-session`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      workspaceId,
      tier: 'AGENCY', // User chooses AGENCY
      billingCycle: 'monthly',
      paymentMethod: 'upi',
      gateway: 'razorpay',
    }),
  });

  const checkoutData = await checkoutRes.json();
  assert(
    checkoutRes.ok && checkoutData.success === true && checkoutData.order.status === 'PENDING',
    `Checkout order created in status PENDING (Order ID: ${checkoutData.order?.orderId})`
  );

  const pendingOrderId = checkoutData.order.orderId;

  // Verify workspace tier has NOT changed to AGENCY!
  const wsSettingsRes = await fetch(`${BASE_URL}/api/workspace/settings`, {
    headers: authHeaders,
  });
  const wsSettingsData = await wsSettingsRes.json();
  const currentTier1 = wsSettingsData.settings?.subscriptionTier;

  assert(
    currentTier1 !== 'AGENCY',
    `Visiting checkout did NOT activate subscription: Workspace tier remains ${currentTier1}`
  );

  // --------------------------------------------------------------------------
  // TEST 2: Closing payment window / abandonment leaves subscription pending
  // --------------------------------------------------------------------------
  console.log('\n3. Testing Window Abandonment (Order remains PENDING)...');
  const pollRes = await fetch(`${BASE_URL}/api/billing/verify-payment?orderId=${encodeURIComponent(pendingOrderId)}`, {
    headers: authHeaders,
  });
  const pollData = await pollRes.json();

  assert(
    pollRes.ok && pollData.status === 'PENDING' && pollData.isPaid === false,
    `Polling abandoned order verifies status is strictly PENDING (isPaid: false)`
  );

  // --------------------------------------------------------------------------
  // TEST 3: Forged success response with fake signature is REJECTED
  // --------------------------------------------------------------------------
  console.log('\n4. Testing Forged Success Response with Fake Signature...');
  const fakePaymentId = `pay_fake_${Date.now()}`;
  const fakeSignature = 'sig_forged_random_hex_string_1234567890';

  const forgedRes = await fetch(`${BASE_URL}/api/billing/verify-payment`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      workspaceId,
      orderId: pendingOrderId,
      paymentId: fakePaymentId,
      signature: fakeSignature,
      gateway: 'razorpay',
    }),
  });

  const forgedData = await forgedRes.json();
  assert(
    forgedRes.status === 400 && forgedData.code === 'INVALID_PAYMENT_SIGNATURE',
    `Forged success response rejected with HTTP 400 INVALID_PAYMENT_SIGNATURE`
  );

  // Re-verify workspace tier is STILL un-upgraded
  const wsSettingsCheck1 = await fetch(`${BASE_URL}/api/workspace/settings`, {
    headers: authHeaders,
  });
  const wsSettingsCheckData1 = await wsSettingsCheck1.json();
  const currentTier2 = wsSettingsCheckData1.settings?.subscriptionTier;
  assert(
    currentTier2 !== 'AGENCY',
    `Workspace tier remains un-upgraded after forged attempt (${currentTier2})`
  );

  // --------------------------------------------------------------------------
  // TEST 4: Missing signature field is REJECTED
  // --------------------------------------------------------------------------
  console.log('\n5. Testing Missing Signature Rejection...');
  const missingSigRes = await fetch(`${BASE_URL}/api/billing/verify-payment`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      workspaceId,
      orderId: pendingOrderId,
      paymentId: fakePaymentId,
      // signature missing
    }),
  });

  assert(
    missingSigRes.status === 400,
    `Missing signature rejected with HTTP 400`
  );

  // --------------------------------------------------------------------------
  // TEST 5: Frontend Tampering (Sending tier: "AGENCY" for a GROWTH order)
  // --------------------------------------------------------------------------
  console.log('\n6. Testing Frontend Tier Tampering Immunity...');
  // Create order for GROWTH
  const growthOrderRes = await fetch(`${BASE_URL}/api/billing/create-checkout-session`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      workspaceId,
      tier: 'GROWTH',
      billingCycle: 'monthly',
      paymentMethod: 'card',
      gateway: 'razorpay',
    }),
  });
  const growthOrderData = await growthOrderRes.json();
  const growthOrderId = growthOrderData.order.orderId;

  // Genuine payment for GROWTH order
  const genuineGrowthPayId = `pay_genuine_growth_${Date.now()}`;
  const genuineGrowthSig = crypto
    .createHmac('sha256', RAZORPAY_SECRET)
    .update(`${growthOrderId}|${genuineGrowthPayId}`)
    .digest('hex');

  // Attacker sends tier: "AGENCY" in verify-payment body
  const tamperRes = await fetch(`${BASE_URL}/api/billing/verify-payment`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      workspaceId,
      orderId: growthOrderId,
      paymentId: genuineGrowthPayId,
      signature: genuineGrowthSig,
      tier: 'AGENCY', // TAMPERED BY CLIENT
      subscriptionTier: 'AGENCY',
    }),
  });

  const tamperData = await tamperRes.json();
  assert(
    tamperRes.ok && tamperData.planActivated === 'GROWTH',
    `Backend ignored client-supplied 'AGENCY' tier: Activated strictly server-recorded 'GROWTH' tier`
  );

  // --------------------------------------------------------------------------
  // TEST 6: Verified Genuine Payment activates the correct plan
  // --------------------------------------------------------------------------
  console.log('\n7. Testing Verified Genuine Payment Activation...');
  // Now create an AGENCY order legitimately
  const agencyOrderRes = await fetch(`${BASE_URL}/api/billing/create-checkout-session`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      workspaceId,
      tier: 'AGENCY',
      billingCycle: 'monthly',
      paymentMethod: 'upi',
      gateway: 'razorpay',
    }),
  });
  const agencyOrderData = await agencyOrderRes.json();
  const agencyOrderId = agencyOrderData.order.orderId;

  const genuineAgencyPayId = `pay_genuine_agency_${Date.now()}`;
  const genuineAgencySig = crypto
    .createHmac('sha256', RAZORPAY_SECRET)
    .update(`${agencyOrderId}|${genuineAgencyPayId}`)
    .digest('hex');

  const genuineRes = await fetch(`${BASE_URL}/api/billing/verify-payment`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      workspaceId,
      orderId: agencyOrderId,
      paymentId: genuineAgencyPayId,
      signature: genuineAgencySig,
      gateway: 'razorpay',
    }),
  });

  const genuineData = await genuineRes.json();
  assert(
    genuineRes.ok && genuineData.verified === true && genuineData.planActivated === 'AGENCY',
    `Genuine payment verified with HMAC-SHA256 signature: Plan activated as AGENCY`
  );

  // Verify in database / settings
  const wsSettingsCheck2 = await fetch(`${BASE_URL}/api/workspace/settings`, {
    headers: authHeaders,
  });
  const wsSettingsCheckData2 = await wsSettingsCheck2.json();
  const currentTier3 = wsSettingsCheckData2.settings?.subscriptionTier;
  assert(
    currentTier3 === 'AGENCY',
    `Workspace database tier verified as AGENCY in Neon PostgreSQL (${currentTier3})`
  );

  // --------------------------------------------------------------------------
  // TEST 7: Duplicate Payment Verification (Idempotent: Exactly Once)
  // --------------------------------------------------------------------------
  console.log('\n8. Testing Duplicate Verification Idempotency...');
  const duplicateRes = await fetch(`${BASE_URL}/api/billing/verify-payment`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      workspaceId,
      orderId: agencyOrderId,
      paymentId: genuineAgencyPayId,
      signature: genuineAgencySig,
      gateway: 'razorpay',
    }),
  });

  const duplicateData = await duplicateRes.json();
  assert(
    duplicateRes.ok && duplicateData.duplicate === true,
    `Duplicate payment verification acknowledged with duplicate: true without duplicate activation`
  );

  console.log('\n============================================================');
  console.log(`Payment Activation Guardrails: ${passed}/${total} checks PASSED! 🛡️`);
  console.log('============================================================\n');
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
