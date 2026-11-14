// Automated SSRF & Brand Brain Security Verification Suite
// Tests all 12 SSRF requirements, subnet restrictions, port checks, credential filtering,
// and multi-tenant authorization for /api/brand-brain/extract

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('=== KUIRO SSRF & Brand Brain Security Verification ===\n');
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

  // 1. Authenticate a test user & create workspace
  const testEmail = `ssrf_tester_${Date.now()}@example.com`;
  const testPassword = 'Password123!Safe';

  console.log('1. Setting up authenticated user & tenant workspace...');
  const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      name: 'SSRF Security Tester',
    }),
  });

  const cookieHeader = signupRes.headers.get('set-cookie');
  const signupBody = await signupRes.json();
  assert(signupRes.status === 201 || signupRes.status === 200, 'User registered successfully');

  // Fetch /api/auth/me to get workspace
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: cookieHeader },
  });
  const meData = await meRes.json();
  const workspaceId = signupBody.workspace?.id || meData.workspace?.id;
  assert(Boolean(workspaceId), `Workspace initialized: ${workspaceId}`);

  // Helper for sending extract requests
  async function testExtract(url, expectedStatus, expectedCode = null, customCookie = cookieHeader, customWs = workspaceId) {
    const res = await fetch(`${BASE_URL}/api/brand-brain/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customCookie ? { Cookie: customCookie } : {}),
      },
      body: JSON.stringify({
        url,
        workspaceId: customWs,
      }),
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
  }

  console.log('\n2. Testing SSRF Rejections (Loopback & Localhost)...');
  // Test 1: 127.0.0.1
  const t1 = await testExtract('http://127.0.0.1', 400, 'SSRF_BLOCKED');
  assert(t1.status === 400 && t1.body.code === 'SSRF_BLOCKED', 'Rejects http://127.0.0.1 with 400 SSRF_BLOCKED');

  // Test 2: localhost
  const t2 = await testExtract('http://localhost', 400, 'SSRF_BLOCKED');
  assert(t2.status === 400 && t2.body.code === 'SSRF_BLOCKED', 'Rejects http://localhost with 400 SSRF_BLOCKED');

  // Test 3: sub.localhost
  const t3 = await testExtract('http://admin.localhost', 400, 'SSRF_BLOCKED');
  assert(t3.status === 400 && t3.body.code === 'SSRF_BLOCKED', 'Rejects http://admin.localhost with 400 SSRF_BLOCKED');

  console.log('\n3. Testing SSRF Rejections (RFC 1918 Private Subnets)...');
  // Test 4: 10.0.0.1 (Class A)
  const t4 = await testExtract('http://10.0.0.1', 400, 'SSRF_BLOCKED');
  assert(t4.status === 400 && t4.body.code === 'SSRF_BLOCKED', 'Rejects private 10.0.0.1 with 400 SSRF_BLOCKED');

  // Test 5: 172.16.0.1 (Class B)
  const t5 = await testExtract('http://172.16.0.1', 400, 'SSRF_BLOCKED');
  assert(t5.status === 400 && t5.body.code === 'SSRF_BLOCKED', 'Rejects private 172.16.0.1 with 400 SSRF_BLOCKED');

  // Test 6: 192.168.1.1 (Class C)
  const t6 = await testExtract('http://192.168.1.1', 400, 'SSRF_BLOCKED');
  assert(t6.status === 400 && t6.body.code === 'SSRF_BLOCKED', 'Rejects private 192.168.1.1 with 400 SSRF_BLOCKED');

  // Test 7: 100.64.0.1 (Carrier-Grade NAT)
  const t7 = await testExtract('http://100.64.0.1', 400, 'SSRF_BLOCKED');
  assert(t7.status === 400 && t7.body.code === 'SSRF_BLOCKED', 'Rejects Carrier-Grade NAT 100.64.0.1 with 400 SSRF_BLOCKED');

  console.log('\n4. Testing SSRF Rejections (IPv6 Loopback & Cloud Metadata)...');
  // Test 8: IPv6 Loopback [::1]
  const t8 = await testExtract('http://[::1]', 400, 'SSRF_BLOCKED');
  assert(t8.status === 400 && t8.body.code === 'SSRF_BLOCKED', 'Rejects IPv6 loopback http://[::1] with 400 SSRF_BLOCKED');

  // Test 9: Cloud Metadata IP (169.254.169.254)
  const t9 = await testExtract('http://169.254.169.254', 400, 'SSRF_BLOCKED');
  assert(t9.status === 400 && t9.body.code === 'SSRF_BLOCKED', 'Rejects AWS/GCP metadata http://169.254.169.254 with 400 SSRF_BLOCKED');

  // Test 10: Cloud Metadata Hostname (metadata.google.internal)
  const t10 = await testExtract('http://metadata.google.internal', 400, 'SSRF_BLOCKED');
  assert(t10.status === 400 && t10.body.code === 'SSRF_BLOCKED', 'Rejects metadata.google.internal with 400 SSRF_BLOCKED');

  console.log('\n5. Testing Scheme, Credential, and Port Restrictions...');
  // Test 11: Non-HTTP schemes
  const t11a = await testExtract('file:///etc/passwd', 400);
  assert(t11a.status === 400, 'Rejects file:///etc/passwd with 400');
  const t11b = await testExtract('gopher://127.0.0.1:70', 400);
  assert(t11b.status === 400, 'Rejects gopher scheme with 400');

  // Test 12: Embedded credentials
  const t12 = await testExtract('http://admin:secret@example.com', 400);
  assert(t12.status === 400 && t12.body.error.includes('credentials'), 'Rejects URLs containing embedded credentials with 400');

  // Test 13: Non-standard ports
  const t13 = await testExtract('http://example.com:8080', 400);
  assert(t13.status === 400 && t13.body.error.includes('Prohibited port'), 'Rejects non-standard port 8080 with 400');

  // Test 14: Obfuscated integer/hex IP notation
  const t14 = await testExtract('http://2130706433', 400); // 127.0.0.1 in decimal
  assert(t14.status === 400 && t14.body.code === 'SSRF_BLOCKED', 'Rejects integer-encoded IP http://2130706433 with 400 SSRF_BLOCKED');

  console.log('\n6. Testing Multi-Tenant Authorization on Extract Endpoint...');
  // Test 15: Unauthenticated access
  const t15 = await testExtract('http://127.0.0.1', 401, null, null, workspaceId);
  assert(t15.status === 401, 'Rejects unauthenticated request with 401 Unauthorized');

  // Test 16: Wrong workspace access
  const t16 = await testExtract('https://example.com', 403, null, cookieHeader, 'ws_foreign_99999');
  assert(t16.status === 403, 'Rejects unauthorized workspace access with 403 Forbidden');

  console.log('\n7. Testing Legitimate Public Domain Ingestion...');
  // Test 17: Public website extraction
  const t17 = await testExtract('https://kuiro.in', 200);
  assert(t17.status === 200 && t17.body.success === true, 'Successfully processes legitimate public domain https://kuiro.in');
  assert(Boolean(t17.body.detected), 'Returns detected brand intelligence structure');

  console.log(`\n=============================================`);
  console.log(`SSRF Protection Verification: ${passed}/${total} checks PASSED! 🛡️`);
  console.log(`=============================================\n`);
}

runTests().catch((err) => {
  console.error('\n❌ Suite execution failed:', err);
  process.exit(1);
});
