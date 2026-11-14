/**
 * Automated Verification Suite for KUIRO Password Authentication & Verification Hardening
 * Tests:
 * 1. Correct email and password -> Login succeeds (200, session cookie issued)
 * 2. Incorrect password -> Rejected (401, no cookie)
 * 3. Password omitted -> Rejected (400, no cookie)
 * 4. Unknown email -> Rejected (401, no cookie)
 * 5. Unverified email -> Restricted according to policy (403 on campaign approval)
 * 6. Expired OTP -> Rejected (400, expired error)
 * 7. Reused OTP -> Rejected (400, already used error)
 */

const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
          json,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runPasswordBypassTests() {
  console.log('================================================================');
  console.log('🛡️  RUNNING KUIRO PASSWORD & VERIFICATION ACCEPTANCE TESTS');
  console.log('================================================================\n');

  let passedTests = 0;
  const totalTests = 7;

  // Prerequisites: create a dedicated test account
  const testEmail = `qa.authtest.${Date.now()}@kuiro.ai`;
  const testPassword = 'StrongPassword2026!';

  console.log(`Setting up verified test account: ${testEmail}...`);
  const signupRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/signup',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      name: 'QA Auth Tester',
      businessName: 'QA Enterprise Brands',
      email: testEmail,
      password: testPassword,
    }
  );

  if (signupRes.statusCode !== 201) {
    console.error('Setup failed: Signup returned', signupRes.statusCode, signupRes.body);
    process.exit(1);
  }
  const sessionCookie = signupRes.headers['set-cookie'] ? signupRes.headers['set-cookie'][0] : '';
  console.log('✓ Test user registered in Neon DB with salted scrypt hash.\n');

  // TEST 1: Correct email and password -> Login succeeds
  console.log('--- TEST 1: Correct Email and Password ---');
  try {
    const loginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: testEmail, password: testPassword }
    );

    console.log(`✓ Status code: ${loginRes.statusCode} (Expected: 200)`);
    console.log(`✓ Login success: ${loginRes.json?.success === true}`);
    const hasCookie = !!loginRes.headers['set-cookie'];
    console.log(`✓ Session cookie issued: ${hasCookie}`);

    if (loginRes.statusCode !== 200 || !loginRes.json?.success || !hasCookie) {
      throw new Error(`Login failed with status ${loginRes.statusCode}`);
    }
    console.log('✅ TEST 1 PASSED: Valid credentials correctly authenticate and create session!\n');
    passedTests++;
  } catch (err) {
    console.error('❌ TEST 1 FAILED:', err.message, '\n');
  }

  // TEST 2: Incorrect password -> Rejected
  console.log('--- TEST 2: Incorrect Password ---');
  try {
    const wrongPassRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: testEmail, password: 'TotallyWrongPassword999!' }
    );

    console.log(`✓ Status code: ${wrongPassRes.statusCode} (Expected: 401)`);
    console.log(`✓ Rejection message: "${wrongPassRes.json?.error}"`);
    const noCookie = !wrongPassRes.headers['set-cookie'];
    console.log(`✓ No cookie issued: ${noCookie}`);

    if (wrongPassRes.statusCode !== 401 || !noCookie) {
      throw new Error(`Expected 401, received ${wrongPassRes.statusCode}`);
    }
    console.log('✅ TEST 2 PASSED: Incorrect password strictly rejected with 401!\n');
    passedTests++;
  } catch (err) {
    console.error('❌ TEST 2 FAILED:', err.message, '\n');
  }

  // TEST 3: Password omitted -> Rejected (Bypass Prevention)
  console.log('--- TEST 3: Password Omitted (Bypass Prevention) ---');
  try {
    const noPassRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: testEmail } // password field completely omitted!
    );

    console.log(`✓ Status code: ${noPassRes.statusCode} (Expected: 400)`);
    console.log(`✓ Rejection message: "${noPassRes.json?.error}"`);
    const noCookie = !noPassRes.headers['set-cookie'];
    console.log(`✓ No cookie issued: ${noCookie}`);

    if (noPassRes.statusCode !== 400 || !noCookie) {
      throw new Error(`Expected 400 rejection for omitted password, received ${noPassRes.statusCode}`);
    }
    console.log('✅ TEST 3 PASSED: Missing password strictly rejected without authenticating!\n');
    passedTests++;
  } catch (err) {
    console.error('❌ TEST 3 FAILED:', err.message, '\n');
  }

  // TEST 4: Unknown email -> Rejected
  console.log('--- TEST 4: Unknown Email ---');
  try {
    const unknownRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'nonexistent.ghost.account@kuiro.ai', password: 'SomePassword123!' }
    );

    console.log(`✓ Status code: ${unknownRes.statusCode} (Expected: 401)`);
    console.log(`✓ Generic rejection message: "${unknownRes.json?.error}"`);

    if (unknownRes.statusCode !== 401) {
      throw new Error(`Expected 401 for unknown user, received ${unknownRes.statusCode}`);
    }
    console.log('✅ TEST 4 PASSED: Unknown email rejected with generic 401 (preventing enumeration)!\n');
    passedTests++;
  } catch (err) {
    console.error('❌ TEST 4 FAILED:', err.message, '\n');
  }

  // TEST 5: Unverified email -> Restricted according to policy
  console.log('--- TEST 5: Unverified Email Policy Restriction ---');
  try {
    // New user testEmail starts with emailVerified: false
    // Attempt campaign approval with unverified cookie
    const approvalRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/campaigns',
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
      },
      {
        campaignId: 'camp-dummy-unverified',
        status: 'APPROVED',
      }
    );

    console.log(`✓ Unverified campaign approval status: ${approvalRes.statusCode} (Expected: 403)`);
    console.log(`✓ Policy error message: "${approvalRes.json?.error}"`);
    console.log(`✓ Code: ${approvalRes.json?.code}`);

    if (approvalRes.statusCode !== 403 || approvalRes.json?.code !== 'EMAIL_VERIFICATION_REQUIRED') {
      throw new Error(`Expected 403 EMAIL_VERIFICATION_REQUIRED, received ${approvalRes.statusCode}`);
    }
    console.log('✅ TEST 5 PASSED: Unverified email restricted according to security policy!\n');
    passedTests++;
  } catch (err) {
    console.error('❌ TEST 5 FAILED:', err.message, '\n');
  }

  // TEST 6: Expired OTP -> Rejected
  console.log('--- TEST 6: Expired OTP Validation ---');
  try {
    const { createVerificationToken, verifyAndConsumeToken } = require('../src/lib/auth.ts');
    
    // Create an expired OTP (-1 minute expiry)
    const expiredRes = await createVerificationToken('expired.test@kuiro.ai', 'EMAIL_VERIFICATION', -1);
    console.log(`✓ Created test OTP with past expiration: ${expiredRes.expiresAt.toISOString()}`);

    const verifyExpired = await verifyAndConsumeToken('expired.test@kuiro.ai', expiredRes.rawToken, 'EMAIL_VERIFICATION');
    console.log(`✓ Expired OTP valid: ${verifyExpired.valid} (Expected: false)`);
    console.log(`✓ Error returned: "${verifyExpired.error}"`);

    if (verifyExpired.valid !== false || !verifyExpired.error?.includes('expired')) {
      throw new Error('Expired OTP was not rejected properly!');
    }
    console.log('✅ TEST 6 PASSED: Expired OTP rejected with explicit expiry message!\n');
    passedTests++;
  } catch (err) {
    console.error('❌ TEST 6 FAILED:', err.message, '\n');
  }

  // TEST 7: Reused OTP -> Rejected
  console.log('--- TEST 7: Reused OTP Validation (Single-Use Constraint) ---');
  try {
    const { createVerificationToken, verifyAndConsumeToken } = require('../src/lib/auth.ts');
    
    // Create a fresh valid OTP (10 minute expiry)
    const freshToken = await createVerificationToken('singleuse.test@kuiro.ai', 'PASSWORD_RESET', 10);
    console.log(`✓ Created fresh OTP: ${freshToken.rawToken}`);

    // First consumption: should succeed
    const firstUse = await verifyAndConsumeToken('singleuse.test@kuiro.ai', freshToken.rawToken, 'PASSWORD_RESET');
    console.log(`✓ First consumption valid: ${firstUse.valid} (Expected: true)`);
    if (!firstUse.valid) {
      throw new Error(`First consumption failed: ${firstUse.error}`);
    }

    // Second consumption of SAME OTP: must be strictly rejected
    const secondUse = await verifyAndConsumeToken('singleuse.test@kuiro.ai', freshToken.rawToken, 'PASSWORD_RESET');
    console.log(`✓ Reused consumption valid: ${secondUse.valid} (Expected: false)`);
    console.log(`✓ Reused rejection error: "${secondUse.error}"`);

    if (secondUse.valid !== false || !secondUse.error?.includes('already been used')) {
      throw new Error('Reused OTP was not rejected!');
    }
    console.log('✅ TEST 7 PASSED: Reused OTP strictly rejected under single-use constraint!\n');
    passedTests++;
  } catch (err) {
    console.error('❌ TEST 7 FAILED:', err.message, '\n');
  }

  console.log('================================================================');
  console.log(`📊 ACCEPTANCE TESTS SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPasswordBypassTests();
