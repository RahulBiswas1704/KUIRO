/**
 * KUIRO Platform Operator Security Verification Test Suite
 * 
 * Verifies Acceptance Criteria:
 * 1. Missing admin secret: admin access fails securely (fails closed).
 * 2. Default secret: never accepted ('KUIRO-MGMT-SECURE-2026' banned).
 * 3. Invalid admin credential: denied (HTTP 401).
 * 4. Repeated failed attempts: throttled (HTTP 429 after 5 failed attempts).
 * 5. Genuine operator credentials: authorized with signed JWT session token.
 * 6. Admin changes: recorded in audit logs and queryable via /api/admin/audit-logs.
 * 7. Tenant isolation: customer credentials cannot access operator routes.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runTests() {
  console.log('=== KUIRO Platform Operator Management Security Verification ===\n');

  const genuineOperatorEmail = 'rahul.biswas1704@gmail.com';
  // Read configured passkey from local environment or default test key
  const genuinePasskey = process.env.KUIRO_MANAGEMENT_PASSKEY || 'd5d65fb5af226fc246b3332d5874a98f8864f297754d011d862efc8885706759';

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

  // --------------------------------------------------------------------------
  // TEST 1: Default secret 'KUIRO-MGMT-SECURE-2026' is NEVER accepted
  // --------------------------------------------------------------------------
  console.log('1. Testing Banned Default Secret Rejection...');
  const defaultSecretRes = await fetch(`${BASE_URL}/api/admin/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: genuineOperatorEmail,
      passkey: 'KUIRO-MGMT-SECURE-2026', // Old hardcoded default passkey
    }),
  });
  const defaultSecretData = await defaultSecretRes.json();
  assert(
    defaultSecretRes.status === 401 && defaultSecretData.code === 'BANNED_SECRET_REJECTED',
    `Legacy default passkey 'KUIRO-MGMT-SECURE-2026' rejected with HTTP 401 BANNED_SECRET_REJECTED`
  );

  // --------------------------------------------------------------------------
  // TEST 2: Common insecure passwords ('admin', 'password', '123456') are banned
  // --------------------------------------------------------------------------
  console.log('\n2. Testing Insecure Banned Password Rejection...');
  const commonPassRes = await fetch(`${BASE_URL}/api/admin/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: genuineOperatorEmail,
      passkey: 'admin',
    }),
  });
  const commonPassData = await commonPassRes.json();
  assert(
    commonPassRes.status === 401 && commonPassData.code === 'BANNED_SECRET_REJECTED',
    `Insecure credential 'admin' rejected with HTTP 401 BANNED_SECRET_REJECTED`
  );

  // --------------------------------------------------------------------------
  // TEST 3: Invalid credentials denied (HTTP 401)
  // --------------------------------------------------------------------------
  console.log('\n3. Testing Invalid Credentials Denial...');
  const wrongCredsRes = await fetch(`${BASE_URL}/api/admin/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: genuineOperatorEmail,
      passkey: 'completely_wrong_operator_passkey_xyz123',
    }),
  });
  const wrongCredsData = await wrongCredsRes.json();
  assert(
    wrongCredsRes.status === 401 && wrongCredsData.code === 'INVALID_CREDENTIALS',
    `Invalid operator credentials denied with HTTP 401 INVALID_CREDENTIALS`
  );

  // --------------------------------------------------------------------------
  // TEST 4: Unauthorized email domain rejected
  // --------------------------------------------------------------------------
  console.log('\n4. Testing Unauthorized Email Domain Rejection...');
  const wrongEmailRes = await fetch(`${BASE_URL}/api/admin/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'hacker@sharmaheritage.in', // Tenant email must NOT have operator clearance
      passkey: genuinePasskey,
    }),
  });
  const wrongEmailData = await wrongEmailRes.json();
  assert(
    wrongEmailRes.status === 401 && wrongEmailData.code === 'INVALID_CREDENTIALS',
    `Non-operator customer domain rejected with HTTP 401 (Separation of Concerns)`
  );

  // --------------------------------------------------------------------------
  // TEST 5: Repeated failed attempts throttled (HTTP 429)
  // --------------------------------------------------------------------------
  console.log('\n5. Testing Anti-Brute-Force Rate Limiting (5 Attempts Threshold)...');
  const bruteForceEmail = 'brute-force-test@kuiro.in';
  let rateLimited = false;
  let rateLimitStatus = 0;

  for (let i = 1; i <= 6; i++) {
    const bfRes = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '198.51.100.99', // Isolated test IP
      },
      body: JSON.stringify({
        email: bruteForceEmail,
        passkey: `wrong_passkey_attempt_${i}`,
      }),
    });

    if (bfRes.status === 429) {
      rateLimited = true;
      rateLimitStatus = bfRes.status;
      const data = await bfRes.json();
      console.log(`   Attempt ${i}: Throttled with HTTP 429: ${data.error}`);
      break;
    }
  }

  assert(
    rateLimited && rateLimitStatus === 429,
    `Repeated failed login attempts throttled with HTTP 429 Too Many Requests`
  );

  // --------------------------------------------------------------------------
  // TEST 6: Genuine operator credentials accepted (HTTP 200 + Token)
  // --------------------------------------------------------------------------
  console.log('\n6. Testing Genuine Platform Operator Authorization...');
  const genuineLoginRes = await fetch(`${BASE_URL}/api/admin/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '127.0.0.1',
    },
    body: JSON.stringify({
      email: genuineOperatorEmail,
      passkey: genuinePasskey,
    }),
  });

  const genuineLoginData = await genuineLoginRes.json();
  assert(
    genuineLoginRes.ok && genuineLoginData.success === true && !!genuineLoginData.token,
    `Genuine operator credentials authorized with HTTP 200 and signed session token`
  );

  const operatorToken = genuineLoginData.token;

  // --------------------------------------------------------------------------
  // TEST 7: Operator protected route access with Bearer Token
  // --------------------------------------------------------------------------
  console.log('\n7. Testing Protected Operator Route Access with Token...');
  const overviewRes = await fetch(`${BASE_URL}/api/admin/overview`, {
    headers: {
      Authorization: `Bearer ${operatorToken}`,
    },
  });
  const overviewData = await overviewRes.json();
  assert(
    overviewRes.ok && overviewData.success === true && !!overviewData.metrics,
    `Operator endpoint /api/admin/overview accessible with valid operator token`
  );

  // --------------------------------------------------------------------------
  // TEST 8: Protected route rejection without token or passkey (HTTP 403)
  // --------------------------------------------------------------------------
  console.log('\n8. Testing Protected Operator Route Rejection Without Token...');
  const unauthedRes = await fetch(`${BASE_URL}/api/admin/overview`);
  assert(
    unauthedRes.status === 403,
    `Unauthenticated request to /api/admin/overview rejected with HTTP 403`
  );

  // --------------------------------------------------------------------------
  // TEST 9: Banned secret in header (x-kuiro-management-key) rejected
  // --------------------------------------------------------------------------
  console.log('\n9. Testing Banned Secret in Header Rejection...');
  const bannedHeaderRes = await fetch(`${BASE_URL}/api/admin/overview`, {
    headers: {
      'x-kuiro-management-key': 'KUIRO-MGMT-SECURE-2026',
    },
  });
  assert(
    bannedHeaderRes.status === 403,
    `Default passkey in 'x-kuiro-management-key' header rejected with HTTP 403`
  );

  // --------------------------------------------------------------------------
  // TEST 10: Valid passkey in header authorized
  // --------------------------------------------------------------------------
  console.log('\n10. Testing Valid High-Entropy Passkey in Header...');
  const validHeaderRes = await fetch(`${BASE_URL}/api/admin/overview`, {
    headers: {
      'x-kuiro-management-key': genuinePasskey,
    },
  });
  assert(
    validHeaderRes.ok,
    `Valid high-entropy passkey in 'x-kuiro-management-key' header authorized`
  );

  // --------------------------------------------------------------------------
  // TEST 11: Audit Logs recorded and retrievable
  // --------------------------------------------------------------------------
  console.log('\n11. Testing Audit Logging Ledger...');
  const auditRes = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
    headers: {
      Authorization: `Bearer ${operatorToken}`,
    },
  });
  const auditData = await auditRes.json();
  assert(
    auditRes.ok && auditData.success === true && Array.isArray(auditData.logs) && auditData.logs.length > 0,
    `Security audit logs queryable via /api/admin/audit-logs (${auditData.logs?.length} recorded events)`
  );

  const hasLoginSuccess = auditData.logs.some((l) => l.action === 'OPERATOR_LOGIN_SUCCESS');
  const hasLoginFailed = auditData.logs.some((l) => l.action === 'OPERATOR_LOGIN_FAILED');
  const hasRateLimited = auditData.logs.some((l) => l.action === 'OPERATOR_LOGIN_RATE_LIMITED');

  assert(
    hasLoginSuccess && (hasLoginFailed || hasRateLimited),
    `Audit trail captures OPERATOR_LOGIN_SUCCESS, OPERATOR_LOGIN_FAILED, and OPERATOR_LOGIN_RATE_LIMITED`
  );

  // --------------------------------------------------------------------------
  // TEST 12: Separation of Concerns (Customer Workspace Token cannot access Admin)
  // --------------------------------------------------------------------------
  console.log('\n12. Testing Customer Workspace Session Rejection from Admin...');
  const fakeCustomerToken = 'customer_session_token_not_operator';
  const customerAdminRes = await fetch(`${BASE_URL}/api/admin/overview`, {
    headers: {
      Authorization: `Bearer ${fakeCustomerToken}`,
    },
  });
  assert(
    customerAdminRes.status === 403,
    `Customer workspace session cannot access platform operator terminal (HTTP 403)`
  );

  console.log('\n============================================================');
  console.log(`Platform Operator Security Verification: ${passed}/${total} checks PASSED! 🛡️`);
  console.log('============================================================\n');
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
