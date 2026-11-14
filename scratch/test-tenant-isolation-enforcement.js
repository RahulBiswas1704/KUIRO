const BASE_URL = 'http://localhost:3000';

async function runTenantIsolationSuite() {
  console.log('====================================================');
  console.log('🛡️  TEST SUITE: STRICT MULTI-TENANT WORKSPACE ISOLATION');
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

  const timestamp = Date.now();
  const emailA = `tenant_a_${timestamp}@kuiro.in`;
  const emailB = `tenant_b_${timestamp}@kuiro.in`;
  const password = 'TenantPassword123!';

  // -----------------------------------------------------------------
  // 1. CREATE TWO INDEPENDENT TENANT USERS & WORKSPACES
  // -----------------------------------------------------------------
  console.log('--- STEP 1: Provisioning Two Separate Tenants (A & B) ---');

  // Sign up Tenant A
  const signupARes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Tenant A Enterprises', email: emailA, password }),
  });
  const signupAJson = await signupARes.json();
  const cookieA = signupARes.headers.get('set-cookie')?.split(';')[0] || '';
  const wsA = signupAJson.workspace?.id;

  assert((signupARes.status === 201 || signupARes.status === 200) && wsA, `Tenant A created: wsA=${wsA}`, `Status was ${signupARes.status}`);

  // Sign up Tenant B
  const signupBRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Tenant B Diagnostics', email: emailB, password }),
  });
  const signupBJson = await signupBRes.json();
  const cookieB = signupBRes.headers.get('set-cookie')?.split(';')[0] || '';
  const wsB = signupBJson.workspace?.id;

  assert((signupBRes.status === 201 || signupBRes.status === 200) && wsB, `Tenant B created: wsB=${wsB}`, `Status was ${signupBRes.status}`);
  assert(wsA !== wsB, 'Tenant A and Tenant B have strictly distinct workspace IDs');

  // -----------------------------------------------------------------
  // 2. SEED WORKSPACE B WITH CONFIDENTIAL RESOURCES
  // -----------------------------------------------------------------
  console.log('\n--- STEP 2: Seeding Confidential Resources in Workspace B ---');

  // Create Campaign in B
  const campBRes = await fetch(`${BASE_URL}/api/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieB },
    body: JSON.stringify({ topic: 'Confidential Launch Strategy B' }),
  });
  const campBJson = await campBRes.json();
  const campBId = campBJson.campaign?.id;
  assert(campBRes.status === 200 && campBId, `Created confidential campaign in Workspace B: id=${campBId}`);

  // Create Inbound Lead / Conversation in B
  const convBRes = await fetch(`${BASE_URL}/api/inbox/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieB },
    body: JSON.stringify({ channel: 'whatsapp', content: 'VIP inquiry for Workspace B' }),
  });
  const convBJson = await convBRes.json();
  const convBId = convBJson.conversation?.id;
  assert(convBRes.status === 200 && convBId, `Created confidential conversation in Workspace B: id=${convBId}`);

  // -----------------------------------------------------------------
  // 3. READ ENFORCEMENT: USER A CANNOT READ WORKSPACE B's DATA
  // -----------------------------------------------------------------
  console.log('\n--- STEP 3: Tenant Isolation on READ Operations ---');

  const readChecks = [
    { name: 'Brand Brain Profile', path: `/api/brand-brain/profile?workspaceId=${wsB}` },
    { name: 'Workspace Settings', path: `/api/workspace/settings?workspaceId=${wsB}` },
    { name: 'Workspace Team', path: `/api/workspace/team?workspaceId=${wsB}` },
    { name: 'Campaigns List', path: `/api/campaigns?workspaceId=${wsB}` },
    { name: 'Campaign ROI Analytics', path: `/api/campaigns/roi?workspaceId=${wsB}` },
    { name: 'Social Connections', path: `/api/social-connections?workspaceId=${wsB}` },
    { name: 'Inbox Conversations', path: `/api/inbox/conversations?workspaceId=${wsB}` },
  ];

  for (const check of readChecks) {
    const res = await fetch(`${BASE_URL}${check.path}`, {
      headers: { Cookie: cookieA },
    });
    assert(
      res.status === 403,
      `User A read access to Workspace B [${check.name}] denied with 403`,
      `Status was ${res.status}`
    );
  }

  // -----------------------------------------------------------------
  // 4. WRITE ENFORCEMENT: USER A CANNOT WRITE TO WORKSPACE B
  // -----------------------------------------------------------------
  console.log('\n--- STEP 4: Tenant Isolation on WRITE Operations ---');

  const writeChecks = [
    {
      name: 'Create Campaign in B',
      path: '/api/campaigns',
      body: { workspaceId: wsB, topic: 'Malicious Campaign Injected by A' },
    },
    {
      name: 'Update Brand Brain in B',
      path: '/api/brand-brain/profile',
      body: { workspaceId: wsB, businessName: 'Attacker Hijacked Brand' },
    },
    {
      name: 'Extract Brand Brain into B',
      path: '/api/brand-brain/extract',
      body: { workspaceId: wsB, url: 'https://attacker.com' },
    },
    {
      name: 'Simulate Lead in B',
      path: '/api/inbox/simulate',
      body: { workspaceId: wsB, content: 'Spam Lead injected into B' },
    },
    {
      name: 'Reply to Conversation in B',
      path: '/api/inbox/reply',
      body: { conversationId: convBId, content: 'Malicious Unauthorized Reply' },
      expectedStatuses: [403, 404],
    },
    {
      name: 'Modify Social Connections in B',
      path: '/api/social-connections',
      body: { workspaceId: wsB, platform: 'instagram', action: 'connect' },
    },
    {
      name: 'Modify Workspace Settings in B',
      path: '/api/workspace/settings',
      body: { workspaceId: wsB, name: 'Renamed by Attacker' },
    },
    {
      name: 'Invite Member to Workspace B',
      path: '/api/workspace/team',
      body: { workspaceId: wsB, name: 'Attacker Member', email: 'intruder@evil.com' },
    },
    {
      name: 'Create Checkout Session for B',
      path: '/api/billing/create-checkout-session',
      body: { workspaceId: wsB, tier: 'AGENCY' },
    },
  ];

  for (const check of writeChecks) {
    const res = await fetch(`${BASE_URL}${check.path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieA },
      body: JSON.stringify(check.body),
    });
    const expected = check.expectedStatuses || [403];
    assert(
      expected.includes(res.status),
      `User A write operation [${check.name}] denied with ${expected.join('/')}`,
      `Status was ${res.status}`
    );
  }

  // -----------------------------------------------------------------
  // 5. UPDATE ENFORCEMENT: USER A CANNOT UPDATE WORKSPACE B's CAMPAIGN
  // -----------------------------------------------------------------
  console.log('\n--- STEP 5: Tenant Isolation on UPDATE Operations ---');

  const patchCampRes = await fetch(`${BASE_URL}/api/campaigns`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({ campaignId: campBId, status: 'PAUSED' }),
  });
  assert(
    patchCampRes.status === 403 || patchCampRes.status === 404,
    'User A updating Workspace B campaign status rejected with 403/404',
    `Status was ${patchCampRes.status}`
  );

  const patchRevisionRes = await fetch(`${BASE_URL}/api/campaigns`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({ campaignId: campBId, revisionPrompt: 'Make this sound sarcastic' }),
  });
  assert(
    patchRevisionRes.status === 403 || patchRevisionRes.status === 404,
    'User A triggering revision on Workspace B campaign rejected with 403/404',
    `Status was ${patchRevisionRes.status}`
  );

  // -----------------------------------------------------------------
  // 6. DELETE ENFORCEMENT: USER A CANNOT DELETE WORKSPACE B's DATA
  // -----------------------------------------------------------------
  console.log('\n--- STEP 6: Tenant Isolation on DELETE Operations ---');

  // Attempt delete Workspace B campaign
  const delCampRes = await fetch(`${BASE_URL}/api/campaigns?campaignId=${campBId}&workspaceId=${wsB}`, {
    method: 'DELETE',
    headers: { Cookie: cookieA },
  });
  assert(
    delCampRes.status === 403 || delCampRes.status === 404,
    'User A deleting Workspace B campaign rejected with 403/404',
    `Status was ${delCampRes.status}`
  );

  // Attempt delete Workspace B conversation
  const delConvRes = await fetch(`${BASE_URL}/api/inbox/conversations?conversationId=${convBId}&workspaceId=${wsB}`, {
    method: 'DELETE',
    headers: { Cookie: cookieA },
  });
  assert(
    delConvRes.status === 403 || delConvRes.status === 404,
    'User A deleting Workspace B conversation rejected with 403/404',
    `Status was ${delConvRes.status}`
  );

  // Attempt delete Workspace B social connection
  const delConnRes = await fetch(`${BASE_URL}/api/social-connections?platform=instagram&workspaceId=${wsB}`, {
    method: 'DELETE',
    headers: { Cookie: cookieA },
  });
  assert(
    delConnRes.status === 403,
    'User A deleting Workspace B social connection rejected with 403',
    `Status was ${delConnRes.status}`
  );

  // Attempt delete Workspace B team member
  const delTeamRes = await fetch(`${BASE_URL}/api/workspace/team?id=mem_mkt_${wsB.slice(0, 8)}&workspaceId=${wsB}`, {
    method: 'DELETE',
    headers: { Cookie: cookieA },
  });
  assert(
    delTeamRes.status === 403,
    'User A deleting Workspace B team member rejected with 403',
    `Status was ${delTeamRes.status}`
  );

  // -----------------------------------------------------------------
  // 7. EXPORT ENFORCEMENT: USER A CANNOT EXPORT WORKSPACE B's CAMPAIGN
  // -----------------------------------------------------------------
  console.log('\n--- STEP 7: Tenant Isolation on EXPORT Operations ---');

  const exportWithWsRes = await fetch(`${BASE_URL}/api/campaigns/export?campaignId=${campBId}&workspaceId=${wsB}`, {
    headers: { Cookie: cookieA },
  });
  assert(
    exportWithWsRes.status === 403,
    'User A exporting Workspace B campaign with workspaceId parameter rejected with 403',
    `Status was ${exportWithWsRes.status}`
  );

  const exportWithoutWsRes = await fetch(`${BASE_URL}/api/campaigns/export?campaignId=${campBId}`, {
    headers: { Cookie: cookieA },
  });
  assert(
    exportWithoutWsRes.status === 404,
    'User A exporting Workspace B campaign omitting workspaceId parameter rejected with 404',
    `Status was ${exportWithoutWsRes.status}`
  );

  // -----------------------------------------------------------------
  // 8. LIVE SUBSCRIPTION (SSE): USER A CANNOT SUBSCRIBE TO WORKSPACE B
  // -----------------------------------------------------------------
  console.log('\n--- STEP 8: Tenant Isolation on LIVE STREAM (SSE) ---');

  const sseRes = await fetch(`${BASE_URL}/api/inbox/stream?workspaceId=${wsB}`, {
    headers: { Cookie: cookieA },
  });
  assert(
    sseRes.status === 403,
    'User A opening SSE event stream to Workspace B rejected with 403',
    `Status was ${sseRes.status}`
  );

  // -----------------------------------------------------------------
  // 9. AUTHORIZED TENANT OPERATIONS SUCCEED
  // -----------------------------------------------------------------
  console.log('\n--- STEP 9: Verifying Authorized Operations for Tenant A on Workspace A ---');

  const validSettingsRes = await fetch(`${BASE_URL}/api/workspace/settings?workspaceId=${wsA}`, {
    headers: { Cookie: cookieA },
  });
  assert(
    validSettingsRes.status === 200,
    'User A accessing own Workspace A settings succeeds with 200',
    `Status was ${validSettingsRes.status}`
  );

  const validBrandRes = await fetch(`${BASE_URL}/api/brand-brain/profile?workspaceId=${wsA}`, {
    headers: { Cookie: cookieA },
  });
  assert(
    validBrandRes.status === 200,
    'User A accessing own Workspace A brand brain succeeds with 200',
    `Status was ${validBrandRes.status}`
  );

  const validCampaignsRes = await fetch(`${BASE_URL}/api/campaigns?workspaceId=${wsA}`, {
    headers: { Cookie: cookieA },
  });
  assert(
    validCampaignsRes.status === 200,
    'User A accessing own Workspace A campaigns succeeds with 200',
    `Status was ${validCampaignsRes.status}`
  );

  console.log('\n====================================================');
  console.log(`TENANT ISOLATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTenantIsolationSuite().catch((err) => {
  console.error('Tenant isolation suite error:', err);
  process.exit(1);
});
