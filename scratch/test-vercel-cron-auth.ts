import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// 1. Set environment variables BEFORE importing database modules
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

const TEST_VALID_SECRET = 'kuiro_prod_cron_secret_high_entropy_99218a';
const TEST_OPERATOR_SECRET = 'kuiro_operator_secret_secure_clearance_7718';

process.env.DATABASE_URL = dbUrl;
(process.env as any).NODE_ENV = 'production';
process.env.CRON_SECRET = TEST_VALID_SECRET;
process.env.KUIRO_MANAGEMENT_SECRET = TEST_OPERATOR_SECRET;
delete process.env.ALLOW_DEV_CRON_UNAUTHENTICATED;
delete process.env.ENFORCE_CRON_SCHEDULE_WINDOW;

async function runTests() {
  console.log('================================================================');
  console.log('🧪 KUIRO PROMPT 19: VERCEL CRON AUTHENTICATION & SECURITY AUDIT');
  console.log('================================================================\n');

  // Dynamic imports ensure process.env.DATABASE_URL is set before db is initialized
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(dbUrl);

  const {
    verifyCronAuthorization,
    timingSafeCompare,
    resetCronRateLimits,
    BANNED_CRON_SECRETS,
  } = await import('../src/lib/cron/auth');

  const { GET, POST } = await import('../src/app/api/calendar/cron-trigger/route');
  const { POST: AdminSweepPOST } = await import('../src/app/api/admin/calendar/sweep/route');
  const { POST: TenantRadarPOST } = await import('../src/app/api/calendar/radar-scan/route');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  // Helper to create NextRequest
  function makeRequest(url: string, init?: { headers?: Record<string, string>; method?: string; body?: string }) {
    return new NextRequest(new URL(url, 'http://localhost:3000'), {
      method: init?.method || 'GET',
      headers: init?.headers,
      body: init?.body,
    });
  }

  console.log('--- SUITE 1: Timing-Safe Comparison Unit Tests ---');
  {
    assert(timingSafeCompare('secure-token-123', 'secure-token-123'), 'Equal strings return true');
    assert(!timingSafeCompare('secure-token-123', 'secure-token-999'), 'Different strings of same length return false');
    assert(!timingSafeCompare('short', 'much-longer-string'), 'Different lengths return false safely');
    assert(!timingSafeCompare('', 'token'), 'Empty string compared to token returns false');
    assert(timingSafeCompare('', ''), 'Empty strings return true');
  }

  console.log('\n--- SUITE 2: Core verifyCronAuthorization Guard Tests ---');
  {
    resetCronRateLimits();

    // 2.1: Missing secret / no Authorization header
    const reqNoAuth = makeRequest('/api/calendar/cron-trigger');
    const resNoAuth = await verifyCronAuthorization(reqNoAuth);
    assert(!resNoAuth.authorized, 'Missing Authorization header is unauthorized');
    assert(resNoAuth.status === 401, 'Missing Authorization header returns HTTP 401', `Status: ${resNoAuth.status}`);

    // 2.2: Wrong secret
    const reqWrongSecret = makeRequest('/api/calendar/cron-trigger', {
      headers: { authorization: 'Bearer invalid_wrong_secret_123' },
    });
    const resWrongSecret = await verifyCronAuthorization(reqWrongSecret);
    assert(!resWrongSecret.authorized, 'Wrong Bearer secret is unauthorized');
    assert(resWrongSecret.status === 401, 'Wrong Bearer secret returns HTTP 401', `Status: ${resWrongSecret.status}`);

    // 2.3: Correct secret
    const reqValidSecret = makeRequest('/api/calendar/cron-trigger', {
      headers: { authorization: `Bearer ${TEST_VALID_SECRET}` },
    });
    const resValidSecret = await verifyCronAuthorization(reqValidSecret);
    assert(resValidSecret.authorized, 'Correct CRON_SECRET is authorized');
    assert(resValidSecret.status === 200, 'Correct CRON_SECRET returns HTTP 200', `Status: ${resValidSecret.status}`);
    assert(resValidSecret.source === 'vercel_cron', 'Source is correctly classified as vercel_cron');

    // 2.4: Session Cookie attempt without Bearer token (Must NEVER substitute for cron secret)
    const reqCookieOnly = makeRequest('/api/calendar/cron-trigger', {
      headers: {
        cookie: 'kuiro_session=valid_tenant_session_token_123; kuiro_mgmt_token=some_token',
      },
    });
    const resCookieOnly = await verifyCronAuthorization(reqCookieOnly);
    assert(!resCookieOnly.authorized, 'Session cookies alone are rejected for cron');
    assert(resCookieOnly.status === 401, 'Session cookie without Bearer returns HTTP 401');

    // 2.5: Production with unconfigured CRON_SECRET (Fails Closed with 500)
    delete process.env.CRON_SECRET;
    const reqUnconfigured = makeRequest('/api/calendar/cron-trigger', {
      headers: { authorization: 'Bearer some_secret' },
    });
    const resUnconfigured = await verifyCronAuthorization(reqUnconfigured);
    assert(!resUnconfigured.authorized, 'Unconfigured CRON_SECRET in production is rejected');
    assert(resUnconfigured.status === 500, 'Unconfigured CRON_SECRET in production returns HTTP 500 (Fail Closed)');

    // 2.6: Banned / Insecure default secret (Fails Closed with 500)
    for (const banned of ['admin', 'test', 'kuiro_cron_secret_secure_2026', 'changeme']) {
      process.env.CRON_SECRET = banned;
      const reqBanned = makeRequest('/api/calendar/cron-trigger', {
        headers: { authorization: `Bearer ${banned}` },
      });
      const resBanned = await verifyCronAuthorization(reqBanned);
      assert(!resBanned.authorized, `Banned secret "${banned}" is rejected`);
      assert(resBanned.status === 500, `Banned secret "${banned}" returns HTTP 500`);
    }

    // Restore valid secret
    process.env.CRON_SECRET = TEST_VALID_SECRET;

    // 2.7: Development environment bypass explicitly controlled
    (process.env as any).NODE_ENV = 'development';
    process.env.ALLOW_DEV_CRON_UNAUTHENTICATED = 'true';
    const reqDevAllowed = makeRequest('/api/calendar/cron-trigger');
    const resDevAllowed = await verifyCronAuthorization(reqDevAllowed);
    assert(resDevAllowed.authorized, 'Development unauthenticated is allowed when ALLOW_DEV_CRON_UNAUTHENTICATED=true');
    assert(resDevAllowed.source === 'dev_authorized', 'Source is classified as dev_authorized');

    // 2.8: Development environment with ALLOW_DEV_CRON_UNAUTHENTICATED=false
    process.env.ALLOW_DEV_CRON_UNAUTHENTICATED = 'false';
    const reqDevBlocked = makeRequest('/api/calendar/cron-trigger');
    const resDevBlocked = await verifyCronAuthorization(reqDevBlocked);
    assert(!resDevBlocked.authorized, 'Development unauthenticated is blocked when ALLOW_DEV_CRON_UNAUTHENTICATED=false');
    assert(resDevBlocked.status === 401, 'Returns 401 in development when missing secret');

    // Reset back to production
    (process.env as any).NODE_ENV = 'production';
    delete process.env.ALLOW_DEV_CRON_UNAUTHENTICATED;
  }

  console.log('\n--- SUITE 3: Operator Clearance & Execution Window Guards ---');
  {
    resetCronRateLimits();

    // 3.1: Operator authorization via x-management-key header
    const reqOperator = makeRequest('/api/calendar/cron-trigger', {
      headers: { 'x-management-key': TEST_OPERATOR_SECRET },
    });
    const resOperator = await verifyCronAuthorization(reqOperator);
    assert(resOperator.authorized, 'Valid operator management key is authorized');
    assert(resOperator.source === 'operator_admin', 'Source is classified as operator_admin');

    // 3.2: Schedule Window Validation: Block when current UTC hour is outside allowed hours
    const currentHour = new Date().getUTCHours();
    const disallowedHour = (currentHour + 6) % 24; // Guaranteed outside current hour

    const reqWindowBlocked = makeRequest('/api/calendar/cron-trigger', {
      headers: { authorization: `Bearer ${TEST_VALID_SECRET}` },
    });
    const resWindowBlocked = await verifyCronAuthorization(reqWindowBlocked, {
      enforceScheduleWindow: true,
      allowedHoursUtc: [disallowedHour],
    });
    assert(!resWindowBlocked.authorized, 'Execution outside designated UTC window is blocked');
    assert(resWindowBlocked.status === 403, 'Execution outside designated window returns HTTP 403 Forbidden');

    // 3.3: Schedule Window Override with ?force=true
    const reqWindowForce = makeRequest('/api/calendar/cron-trigger?force=true', {
      headers: { authorization: `Bearer ${TEST_VALID_SECRET}` },
    });
    const resWindowForce = await verifyCronAuthorization(reqWindowForce, {
      enforceScheduleWindow: true,
      allowedHoursUtc: [disallowedHour],
    });
    assert(resWindowForce.authorized, 'Execution outside window is permitted when ?force=true is passed');
    assert(resWindowForce.status === 200, 'Force run returns HTTP 200');
  }

  console.log('\n--- SUITE 4: Sliding-Window Rate Limiting Protection ---');
  {
    resetCronRateLimits();
    const testIp = '198.51.100.42'; // Dedicated test IP

    let wasRateLimited = false;
    let rateLimitStatus = 0;

    // Send 16 requests from the test IP
    for (let i = 1; i <= 16; i++) {
      const req = makeRequest('/api/calendar/cron-trigger', {
        headers: {
          authorization: `Bearer ${TEST_VALID_SECRET}`,
          'x-forwarded-for': testIp,
        },
      });
      const res = await verifyCronAuthorization(req);
      if (!res.authorized && res.status === 429) {
        wasRateLimited = true;
        rateLimitStatus = res.status;
        break;
      }
    }

    assert(wasRateLimited, 'Exceeding 15 requests/minute triggers sliding-window rate limit');
    assert(rateLimitStatus === 429, 'Rate limit response code is HTTP 429 Too Many Requests');

    // Reset rate limits and verify access is restored
    resetCronRateLimits();
    const reqAfterReset = makeRequest('/api/calendar/cron-trigger', {
      headers: {
        authorization: `Bearer ${TEST_VALID_SECRET}`,
        'x-forwarded-for': testIp,
      },
    });
    const resAfterReset = await verifyCronAuthorization(reqAfterReset);
    assert(resAfterReset.authorized, 'Resetting rate limits restores authorization immediately');
  }

  console.log('\n--- SUITE 5: HTTP Route Integration (GET & POST) ---');
  {
    resetCronRateLimits();

    // 5.1: GET with missing auth
    const reqGetNoAuth = makeRequest('/api/calendar/cron-trigger');
    const resGetNoAuth = await GET(reqGetNoAuth);
    assert(resGetNoAuth.status === 401, 'GET /api/calendar/cron-trigger without auth returns 401');
    const bodyGetNoAuth = await resGetNoAuth.json();
    assert(bodyGetNoAuth.success === false, 'GET response body contains success: false');

    // 5.2: GET with wrong auth
    const reqGetWrong = makeRequest('/api/calendar/cron-trigger', {
      headers: { authorization: 'Bearer wrong_token' },
    });
    const resGetWrong = await GET(reqGetWrong);
    assert(resGetWrong.status === 401, 'GET with wrong token returns 401');

    // 5.3: GET with valid Bearer token
    const reqGetValid = makeRequest('/api/calendar/cron-trigger?action=housekeeping', {
      headers: { authorization: `Bearer ${TEST_VALID_SECRET}` },
    });
    const resGetValid = await GET(reqGetValid);
    assert(resGetValid.status === 200, 'GET with valid CRON_SECRET returns 200');
    const bodyGetValid = await resGetValid.json();
    assert(bodyGetValid.success === true, 'GET executes scheduler successfully');
    assert(bodyGetValid.actionExecuted === 'housekeeping', 'Action parameter "housekeeping" was executed');

    // 5.4: POST with missing auth
    const reqPostNoAuth = makeRequest('/api/calendar/cron-trigger', {
      method: 'POST',
      body: JSON.stringify({ action: 'housekeeping' }),
    });
    const resPostNoAuth = await POST(reqPostNoAuth);
    assert(resPostNoAuth.status === 401, 'POST /api/calendar/cron-trigger without auth returns 401');

    // 5.5: POST with valid Bearer token
    const reqPostValid = makeRequest('/api/calendar/cron-trigger', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${TEST_VALID_SECRET}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ action: 'housekeeping' }),
    });
    const resPostValid = await POST(reqPostValid);
    assert(resPostValid.status === 200, 'POST with valid CRON_SECRET returns 200');
    const bodyPostValid = await resPostValid.json();
    assert(bodyPostValid.success === true, 'POST executes scheduler successfully');
  }

  console.log('\n--- SUITE 6: Multi-Tenant Privilege Isolation Endpoints ---');
  {
    // 6.1: Tenant route /api/calendar/radar-scan rejects unauthenticated users
    const reqTenantUnauth = makeRequest('/api/calendar/radar-scan', { method: 'POST' });
    const resTenantUnauth = await TenantRadarPOST(reqTenantUnauth);
    assert(resTenantUnauth.status === 401, 'POST /api/calendar/radar-scan requires user session (returns 401)');

    // 6.2: Admin route /api/admin/calendar/sweep rejects unauthenticated users
    const reqAdminUnauth = makeRequest('/api/admin/calendar/sweep', { method: 'POST' });
    const resAdminUnauth = await AdminSweepPOST(reqAdminUnauth);
    assert(resAdminUnauth.status === 403, 'POST /api/admin/calendar/sweep requires operator clearance (returns 403)');
  }

  console.log('\n--- SUITE 7: PostgreSQL admin_audit_logs Persistence Audit ---');
  {
    // Verify audit logs were written to Neon PostgreSQL table `admin_audit_logs`
    const recentAuditLogs = await sql`
      SELECT id, operator_email, action, status, ip_address, created_at
      FROM admin_audit_logs
      WHERE action IN (
        'CRON_MISSING_CREDENTIALS',
        'CRON_INVALID_SECRET',
        'CRON_EXECUTION_AUTHORIZED',
        'CRON_RATE_LIMITED',
        'CRON_OUTSIDE_WINDOW'
      )
      ORDER BY created_at DESC
      LIMIT 25;
    `;

    assert(recentAuditLogs.length > 0, `Neon PostgreSQL recorded ${recentAuditLogs.length} cron security audit logs`);

    const actionsRecorded = new Set(recentAuditLogs.map((r: any) => r.action));
    console.log('    Recorded Actions in Neon DB:', Array.from(actionsRecorded).join(', '));

    assert(actionsRecorded.has('CRON_MISSING_CREDENTIALS'), 'Audit log contains CRON_MISSING_CREDENTIALS event');
    assert(actionsRecorded.has('CRON_INVALID_SECRET'), 'Audit log contains CRON_INVALID_SECRET event');
    assert(actionsRecorded.has('CRON_EXECUTION_AUTHORIZED'), 'Audit log contains CRON_EXECUTION_AUTHORIZED event');
    assert(actionsRecorded.has('CRON_RATE_LIMITED'), 'Audit log contains CRON_RATE_LIMITED event');
    assert(actionsRecorded.has('CRON_OUTSIDE_WINDOW'), 'Audit log contains CRON_OUTSIDE_WINDOW event');
  }

  console.log('\n================================================================');
  console.log(`📊 FINAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
