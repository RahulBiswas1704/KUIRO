const BASE_URL = 'http://localhost:3000';

async function runSessionEnforcementTests() {
  console.log('====================================================');
  console.log('🔒 TEST SUITE: STRICT API SESSION & WORKSPACE ACCESS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  // -----------------------------------------------------------------
  // 1. UNAUTHENTICATED REQUESTS TO PROTECTED APIS RECEIVE 401
  // -----------------------------------------------------------------
  console.log('--- TEST 1: Unauthenticated Requests Receive 401 ---');

  const protectedEndpoints = [
    { method: 'GET', path: '/api/calendar/events' },
    { method: 'POST', path: '/api/calendar/events', body: { eventName: 'Test', eventDate: '2026-11-20', promptContext: 'Context' } },
    { method: 'GET', path: '/api/brand-brain/profile' },
    { method: 'POST', path: '/api/brand-brain/profile', body: { businessName: 'Test' } },
    { method: 'POST', path: '/api/brand-brain/extract', body: { url: 'https://example.com' } },
    { method: 'GET', path: '/api/campaigns' },
    { method: 'POST', path: '/api/campaigns', body: { topic: 'Festival sale' } },
    { method: 'PATCH', path: '/api/campaigns', body: { campaignId: '00000000-0000-0000-0000-000000000000', status: 'APPROVED' } },
    { method: 'GET', path: '/api/campaigns/export' },
    { method: 'GET', path: '/api/campaigns/roi' },
    { method: 'POST', path: '/api/compositor/render', body: { headline: 'Test' } },
    { method: 'GET', path: '/api/inbox/conversations' },
    { method: 'POST', path: '/api/inbox/ai-suggest', body: { customerName: 'Test' } },
    { method: 'POST', path: '/api/inbox/reply', body: { conversationId: 'conv_1', content: 'Hello' } },
    { method: 'POST', path: '/api/inbox/simulate', body: {} },
    { method: 'GET', path: '/api/social-connections' },
    { method: 'POST', path: '/api/social-connections', body: { platform: 'instagram' } },
    { method: 'POST', path: '/api/billing/create-checkout-session', body: { tier: 'GROWTH' } },
    { method: 'POST', path: '/api/billing/verify-payment', body: { orderId: 'ord_1', paymentId: 'pay_1' } },
    { method: 'GET', path: '/api/workspace/settings' },
    { method: 'POST', path: '/api/workspace/settings', body: { name: 'Test' } },
    { method: 'GET', path: '/api/workspace/team' },
    { method: 'POST', path: '/api/email/send', body: { to: 'test@example.com' } },
    { method: 'GET', path: '/api/storage-test' },
    { method: 'GET', path: '/api/calendar/cron-trigger' },
    { method: 'POST', path: '/api/calendar/cron-trigger', body: {} },
    { method: 'GET', path: '/api/auth/oauth/instagram/authorize' },
  ];

  for (const ep of protectedEndpoints) {
    const res = await fetch(`${BASE_URL}${ep.path}`, {
      method: ep.method,
      headers: { 'Content-Type': 'application/json' },
      body: ep.body ? JSON.stringify(ep.body) : undefined,
    });
    assert(
      res.status === 401,
      `${ep.method} ${ep.path} rejected without session`,
      `Received status ${res.status}`
    );
  }

  // -----------------------------------------------------------------
  // 2. PUBLIC APIS REMAIN ACCESSIBLE WITHOUT SESSION
  // -----------------------------------------------------------------
  console.log('\n--- TEST 2: Public APIs Accessible Without Session ---');

  const healthRes = await fetch(`${BASE_URL}/api/health`);
  assert(healthRes.status === 200, 'GET /api/health accessible without session');

  const dbHealthRes = await fetch(`${BASE_URL}/api/db-health`);
  assert(dbHealthRes.status === 200, 'GET /api/db-health accessible without session');

  const mediaRes = await fetch(`${BASE_URL}/api/media/test-sample.png`);
  assert(
    mediaRes.status === 404 || mediaRes.status === 200,
    'GET /api/media/test-sample.png serves asset or 404 transparent fallback without 401',
    `Status was ${mediaRes.status}`
  );

  const meRes = await fetch(`${BASE_URL}/api/auth/me`);
  const meJson = await meRes.json();
  assert(
    meRes.status === 200 && meJson.authenticated === false,
    'GET /api/auth/me returns authenticated: false cleanly without session'
  );

  // -----------------------------------------------------------------
  // 3. AUTHENTICATE TEST USER
  // -----------------------------------------------------------------
  console.log('\n--- Authenticating Test User for Isolation Checks ---');

  const switchRes = await fetch(`${BASE_URL}/api/auth/switch-persona`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personaKey: 'sharma' }),
  });
  const switchJson = await switchRes.json();
  const sessionCookie = switchRes.headers.get('set-cookie');

  assert(
    switchRes.status === 200 && switchJson.success,
    'Demo persona authenticated with verified server-side session'
  );

  const cookieHeader = sessionCookie ? sessionCookie.split(';')[0] : '';
  const myWorkspaceId = switchJson.workspace?.id;

  // -----------------------------------------------------------------
  // 4. TENANT ISOLATION: UNAUTHORIZED WORKSPACE ACCESS RECEIVES 403
  // -----------------------------------------------------------------
  console.log('\n--- TEST 3: Cross-Tenant Access Rejected with 403 ---');

  const foreignWorkspaceId = '00000000-0000-0000-0000-000000000000';

  const isolationEndpoints = [
    { method: 'GET', path: `/api/brand-brain/profile?workspaceId=${foreignWorkspaceId}` },
    { method: 'GET', path: `/api/workspace/settings?workspaceId=${foreignWorkspaceId}` },
    { method: 'GET', path: `/api/workspace/team?workspaceId=${foreignWorkspaceId}` },
    { method: 'GET', path: `/api/campaigns?workspaceId=${foreignWorkspaceId}` },
    { method: 'GET', path: `/api/social-connections?workspaceId=${foreignWorkspaceId}` },
  ];

  for (const ep of isolationEndpoints) {
    const res = await fetch(`${BASE_URL}${ep.path}`, {
      method: ep.method,
      headers: {
        Cookie: cookieHeader,
      },
    });
    assert(
      res.status === 403,
      `${ep.method} ${ep.path} rejected foreign workspace access with 403`,
      `Received status ${res.status}`
    );
  }

  // -----------------------------------------------------------------
  // 5. VALID WORKSPACE ACCESS SUCCEEDS (200)
  // -----------------------------------------------------------------
  console.log('\n--- TEST 4: Authorized Workspace Access Succeeds with 200 ---');

  const authorizedRes = await fetch(`${BASE_URL}/api/workspace/settings?workspaceId=${myWorkspaceId}`, {
    headers: { Cookie: cookieHeader },
  });
  assert(
    authorizedRes.status === 200,
    `GET /api/workspace/settings for owned workspace succeeds with 200`,
    `Status was ${authorizedRes.status}`
  );

  const brandRes = await fetch(`${BASE_URL}/api/brand-brain/profile?workspaceId=${myWorkspaceId}`, {
    headers: { Cookie: cookieHeader },
  });
  assert(
    brandRes.status === 200,
    `GET /api/brand-brain/profile for owned workspace succeeds with 200`,
    `Status was ${brandRes.status}`
  );

  // -----------------------------------------------------------------
  // 6. ADMIN ROUTES REJECT ORDINARY USER SESSIONS
  // -----------------------------------------------------------------
  console.log('\n--- TEST 5: Admin Routes Reject Ordinary Users ---');

  const adminOverviewUserRes = await fetch(`${BASE_URL}/api/admin/overview`, {
    headers: { Cookie: cookieHeader },
  });
  assert(
    adminOverviewUserRes.status === 403 || adminOverviewUserRes.status === 401,
    'GET /api/admin/overview rejects ordinary customer session with 403/401',
    `Status was ${adminOverviewUserRes.status}`
  );

  const adminUsersRes = await fetch(`${BASE_URL}/api/admin/users`, {
    headers: { Cookie: cookieHeader },
  });
  assert(
    adminUsersRes.status === 403 || adminUsersRes.status === 401,
    'GET /api/admin/users rejects ordinary customer session with 403/401',
    `Status was ${adminUsersRes.status}`
  );

  // Admin route with valid management passkey header succeeds
  const adminKeyRes = await fetch(`${BASE_URL}/api/admin/overview`, {
    headers: { 'x-kuiro-management-key': 'KUIRO-MGMT-SECURE-2026' },
  });
  assert(
    adminKeyRes.status === 200,
    'GET /api/admin/overview succeeds with valid management clearance key',
    `Status was ${adminKeyRes.status}`
  );

  // -----------------------------------------------------------------
  // 7. WEBHOOKS WORK WITHOUT A BROWSER SESSION
  // -----------------------------------------------------------------
  console.log('\n--- TEST 6: Webhooks Work Without Browser Session ---');

  // WhatsApp verification challenge GET
  const waChallengeRes = await fetch(
    `${BASE_URL}/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=kuiro_wa_verify_token_secure_123&hub.challenge=test_hub_challenge_456`
  );
  const waChallengeText = await waChallengeRes.text();
  assert(
    waChallengeRes.status === 200 && waChallengeText === 'test_hub_challenge_456',
    'GET /api/webhooks/whatsapp passes verification challenge without session'
  );

  // WhatsApp incoming message POST (receipt or empty message)
  const waPostRes = await fetch(`${BASE_URL}/api/webhooks/whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entry: [] }),
  });
  assert(
    waPostRes.status === 200,
    'POST /api/webhooks/whatsapp works without session',
    `Status was ${waPostRes.status}`
  );

  // Billing webhook POST
  const billingWebhookRes = await fetch(`${BASE_URL}/api/billing/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'payment.captured', payload: {} }),
  });
  assert(
    billingWebhookRes.status === 200 || billingWebhookRes.status === 401,
    'POST /api/billing/webhook processes or enforces signature without session cookie',
    `Status was ${billingWebhookRes.status}`
  );

  // -----------------------------------------------------------------
  // 8. CRON JOB WITH CRON_SECRET SUCCEEDS WITHOUT BROWSER SESSION
  // -----------------------------------------------------------------
  console.log('\n--- TEST 7: Dedicated Cron Authorization ---');

  const cronRes = await fetch(`${BASE_URL}/api/calendar/cron-trigger`, {
    headers: {
      'x-kuiro-management-key': 'KUIRO-MGMT-SECURE-2026',
    },
  });
  assert(
    cronRes.status === 200,
    'GET /api/calendar/cron-trigger succeeds with system clearance',
    `Status was ${cronRes.status}`
  );

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSessionEnforcementTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
