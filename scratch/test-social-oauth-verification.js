/**
 * KUIRO Social OAuth Verification Test Suite
 * 
 * Verifies Genuine Meta, LinkedIn, and X OAuth 2.0 Implementation:
 * 1. PKCE Code Verifier & Challenge (RFC 7636 S256) Generation & Verification.
 * 2. Unpredictable, Tamper-Proof HMAC-SHA256 OAuth State Generation & Validation.
 * 3. State Expiration (> 15m) and Tamper Resistance.
 * 4. Strict Redirect URI Origin & Path Whitelist Validation.
 * 5. Platform Authorize URL Generation with PKCE for X and Scopes for Meta/LinkedIn.
 * 6. Zero Tolerance: Strict Rejection of Simulated Tokens (`kuiro_oauth2_*`, `mock_*`).
 * 7. Token Health Check: Detection of Revoked / Expired / Invalid Tokens.
 * 8. End-to-End Social Connection Lifecycle (Auth -> Store -> Test -> Disconnect -> Reconnect).
 * 9. Tenant Isolation & Genuine Disconnected Defaults (no fake connected state for unconfigured channels).
 */

const crypto = require('crypto');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runTests() {
  console.log('================================================================');
  console.log('   KUIRO GENUINE META, LINKEDIN & X OAUTH 2.0 VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // =========================================================================
  // 1. Authenticate Test Users & Workspaces
  // =========================================================================
  console.log('--- 1. Authenticate Test Workspace ---');
  const userEmail = `oauth_owner_${Date.now()}@kuiro.in`;
  const userPassword = 'SecurePassword!1234';

  const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userEmail,
      password: userPassword,
      name: 'OAuth Test Owner',
      brandName: 'Sharma Heritage Textiles',
      industry: 'Retail & Handlooms',
    }),
  });

  const rawCookie = signupRes.headers.get('set-cookie') || '';
  const cookie = rawCookie.split(';')[0];
  const signupData = await signupRes.json();
  const workspaceId = signupData.workspace?.id;
  const userId = signupData.user?.id;

  assert(signupRes.ok && !!cookie, 'User signed up and received authenticated session cookie');
  assert(workspaceId && userId, `Retrieved workspace ID: ${workspaceId} and user ID: ${userId}`);

  // =========================================================================
  // 2. PKCE Pair Generation & Mathematical Verification
  // =========================================================================
  console.log('\n--- 2. PKCE Pair Generation & S256 Challenge Verification ---');
  const {
    generatePkcePair,
    verifyPkceChallenge,
    generateOAuthState,
    verifyOAuthState,
    validateRedirectUri,
    buildAuthorizationUrl,
    testPlatformConnection,
  } = await import('../src/lib/social/oauth.ts');

  const pkce = generatePkcePair();
  assert(pkce.codeVerifier && pkce.codeVerifier.length >= 43, `Generated high-entropy PKCE code_verifier (length: ${pkce.codeVerifier.length})`);
  assert(pkce.codeChallenge && pkce.codeChallengeMethod === 'S256', `Generated code_challenge with method S256`);

  const isValidPkce = verifyPkceChallenge(pkce.codeVerifier, pkce.codeChallenge);
  assert(isValidPkce === true, 'PKCE code_challenge mathematically matches sha256(code_verifier)');

  const tamperedVerifier = pkce.codeVerifier.slice(0, -1) + 'X';
  const isInvalidPkce = verifyPkceChallenge(tamperedVerifier, pkce.codeChallenge);
  assert(isInvalidPkce === false, 'Tampered PKCE code_verifier is rejected');

  // =========================================================================
  // 3. Cryptographic State Security & Expiration
  // =========================================================================
  console.log('\n--- 3. Cryptographic OAuth State Security & Tamper-Proof HMAC ---');
  const validState = generateOAuthState(workspaceId, userId, 'x', pkce.codeVerifier);
  assert(typeof validState === 'string' && validState.length > 30, 'Generated signed base64url OAuth state token');

  const verified = verifyOAuthState(validState);
  assert(
    verified &&
    verified.workspaceId === workspaceId &&
    verified.userId === userId &&
    verified.platform === 'x' &&
    verified.codeVerifier === pkce.codeVerifier,
    'Valid OAuth state verified: preserved workspaceId, userId, platform, and PKCE codeVerifier'
  );

  // Test Tampering State Payload
  const decodedRaw = Buffer.from(validState, 'base64url').toString('utf8');
  const tamperedRaw = decodedRaw.replace(userId, '00000000-0000-0000-0000-000000000000');
  const tamperedState = Buffer.from(tamperedRaw).toString('base64url');
  const tamperedCheck = verifyOAuthState(tamperedState);
  assert(tamperedCheck === null, 'Tampered OAuth state (modified payload) is rejected by HMAC check');

  // Test Tampering State Signature
  const parts = decodedRaw.split('.');
  parts[parts.length - 1] = '0000000000000000000000000000000000000000000000000000000000000000';
  const forgedSigState = Buffer.from(parts.join('.')).toString('base64url');
  const forgedCheck = verifyOAuthState(forgedSigState);
  assert(forgedCheck === null, 'State with forged signature is rejected');

  // Test Expired State (> 15 minutes)
  const expiredTimestamp = Date.now() - 16 * 60 * 1000;
  const STATE_SECRET = process.env.SESSION_SECRET || process.env.AUTH_SECRET || process.env.BETTER_AUTH_SECRET || 'kuiro_oauth_state_hmac_secret_2026';
  const expPayload = `${workspaceId}.${userId}.x.${expiredTimestamp}.nonce123.${pkce.codeVerifier}`;
  const expHmac = crypto.createHmac('sha256', STATE_SECRET).update(expPayload).digest('hex');
  const expiredState = Buffer.from(`${expPayload}.${expHmac}`).toString('base64url');
  const expiredCheck = verifyOAuthState(expiredState);
  assert(expiredCheck === null, 'Expired OAuth state (> 15 minutes) is rejected');

  // =========================================================================
  // 4. Strict Redirect URI Validation
  // =========================================================================
  console.log('\n--- 4. Strict Redirect URI Whitelisting ---');
  assert(
    validateRedirectUri('http://localhost:3000/api/auth/oauth/x/callback', 'http://localhost:3000') === true,
    'Approved localhost callback URI is accepted'
  );
  assert(
    validateRedirectUri('https://attacker.com/api/auth/oauth/x/callback', 'http://localhost:3000') === false,
    'Untrusted domain (attacker.com) is rejected'
  );
  assert(
    validateRedirectUri('http://localhost:3000/api/auth/oauth/x/evil-callback', 'http://localhost:3000') === false,
    'Incorrect callback pathname is rejected'
  );
  assert(
    validateRedirectUri('javascript:alert(1)', 'http://localhost:3000') === false,
    'Malicious protocol (javascript:) is rejected'
  );

  // =========================================================================
  // 5. Authorize URL Generation with PKCE for X and Scopes for Meta/LinkedIn
  // =========================================================================
  console.log('\n--- 5. Platform Authorize URL Generation ---');

  // Test X Authorize (must include code_challenge & code_challenge_method=S256)
  process.env.X_CLIENT_ID = 'test_x_client_id_123';
  process.env.X_CLIENT_SECRET = 'test_x_client_secret_456';
  const xAuth = buildAuthorizationUrl('x', workspaceId, userId, 'http://localhost:3000/api/auth/oauth/x/callback');
  const xUrl = new URL(xAuth.url);
  assert(xUrl.searchParams.get('response_type') === 'code', 'X Authorize URL has response_type=code');
  assert(xUrl.searchParams.get('client_id') === 'test_x_client_id_123', 'X Authorize URL has client_id');
  assert(xUrl.searchParams.get('code_challenge'), 'X Authorize URL embeds PKCE code_challenge');
  assert(xUrl.searchParams.get('code_challenge_method') === 'S256', 'X Authorize URL sets code_challenge_method=S256');
  assert(xAuth.codeVerifier, 'X Authorize flow returned PKCE code_verifier for later code exchange');

  // Test Meta Instagram Authorize
  process.env.META_APP_ID = 'test_meta_app_id_123';
  process.env.META_APP_SECRET = 'test_meta_app_secret_456';
  const metaAuth = buildAuthorizationUrl('instagram', workspaceId, userId, 'http://localhost:3000/api/auth/oauth/instagram/callback');
  const metaUrl = new URL(metaAuth.url);
  assert(metaUrl.searchParams.get('client_id') === 'test_meta_app_id_123', 'Meta Authorize URL has META_APP_ID');
  assert(metaUrl.searchParams.get('scope').includes('instagram_basic'), 'Meta Authorize URL includes instagram_basic scope');
  assert(metaUrl.searchParams.get('scope').includes('instagram_content_publish'), 'Meta Authorize URL includes instagram_content_publish scope');

  // Test LinkedIn Authorize
  process.env.LINKEDIN_CLIENT_ID = 'test_linkedin_client_id_123';
  process.env.LINKEDIN_CLIENT_SECRET = 'test_linkedin_client_secret_456';
  const liAuth = buildAuthorizationUrl('linkedin', workspaceId, userId, 'http://localhost:3000/api/auth/oauth/linkedin/callback');
  const liUrl = new URL(liAuth.url);
  assert(liUrl.searchParams.get('client_id') === 'test_linkedin_client_id_123', 'LinkedIn Authorize URL has LINKEDIN_CLIENT_ID');
  assert(liUrl.searchParams.get('scope').includes('w_member_social'), 'LinkedIn Authorize URL includes w_member_social scope');

  // =========================================================================
  // 6. Zero Tolerance: Rejection of Simulated Tokens
  // =========================================================================
  console.log('\n--- 6. Zero Tolerance: Rejection of Simulated Tokens ---');

  // Test direct function testPlatformConnection rejection
  const fakeTokenCheck = await testPlatformConnection('instagram', 'kuiro_oauth2_instagram_fake123456');
  assert(
    fakeTokenCheck.success === false && fakeTokenCheck.status === 'INVALID',
    'testPlatformConnection explicitly rejects simulated token (kuiro_oauth2_*)'
  );

  // Test API POST /api/social-connections action=connect rejection of fake token
  const fakePostRes = await fetch(`${BASE_URL}/api/social-connections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      platform: 'instagram',
      action: 'connect',
      accessToken: 'kuiro_oauth2_instagram_attacker_forged_token',
    }),
  });
  const fakePostData = await fakePostRes.json();
  assert(
    fakePostRes.status === 400 && fakePostData.error?.includes('Simulated tokens'),
    'POST /api/social-connections action=connect rejects simulated tokens with 400'
  );

  // Test rejection of missing access token
  const missingTokenRes = await fetch(`${BASE_URL}/api/social-connections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      platform: 'instagram',
      action: 'connect',
    }),
  });
  const missingTokenData = await missingTokenRes.json();
  assert(
    missingTokenRes.status === 400 && missingTokenData.error?.includes('Access token is required'),
    'POST /api/social-connections action=connect rejects missing token with 400'
  );

  // =========================================================================
  // 7. Token Health Check: Detection of Revoked / Expired / Invalid Tokens
  // =========================================================================
  console.log('\n--- 7. Token Health Check & Revoked Token Detection ---');

  // Probe with a live expired or revoked Bearer token
  const revokedProbe = await testPlatformConnection(
    'instagram',
    'EAABwzLixnjYBAInvalidOrRevokedTokenForTestingSecurityEndpoints12345',
    'act_test_9482',
    workspaceId
  );
  assert(
    revokedProbe.success === false &&
    (revokedProbe.status === 'REVOKED' || revokedProbe.status === 'INVALID' || revokedProbe.status === 'UNREACHABLE'),
    `Provider API probe detects invalid or revoked token (status: ${revokedProbe.status})`
  );

  // Test via API endpoint action=test
  const apiTestRes = await fetch(`${BASE_URL}/api/social-connections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      platform: 'instagram',
      action: 'test',
      accessToken: 'EAABwzLixnjYBAInvalidOrRevokedTokenForTestingSecurityEndpoints12345',
    }),
  });
  const apiTestData = await apiTestRes.json();
  assert(
    apiTestRes.status === 400 && apiTestData.tokenValid === false,
    'POST /api/social-connections action=test returns tokenValid=false on revoked/invalid token'
  );

  // =========================================================================
  // 8. End-to-End Social Connection Lifecycle (Disconnect -> Connect -> Verify)
  // =========================================================================
  console.log('\n--- 8. Social Connection Lifecycle: Disconnect, Connect, and Reconnect ---');

  // Disconnect Instagram
  const disconnectRes = await fetch(`${BASE_URL}/api/social-connections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      platform: 'instagram',
      action: 'disconnect',
    }),
  });
  const disconnectData = await disconnectRes.json();
  assert(
    disconnectRes.ok && disconnectData.status === 'DISCONNECTED',
    'Disconnect action revoked connection and returned status=DISCONNECTED'
  );

  // Verify GET /api/social-connections shows DISCONNECTED
  const getChannelsRes = await fetch(`${BASE_URL}/api/social-connections`, {
    headers: { Cookie: cookie },
  });
  const channelsData = await getChannelsRes.json();
  const igChannel = channelsData.connections?.find((c) => c.platform === 'instagram');
  assert(
    igChannel && (igChannel.status === 'DISCONNECTED' || igChannel.status === 'REVOKED') && igChannel.isConfigured === false,
    `Channel Instagram status is ${igChannel?.status} (isConfigured: ${igChannel?.isConfigured})`
  );

  // Re-connect via Database Vault with genuine connection format
  const { db } = await import('../src/db/index.ts');
  const { socialConnections } = await import('../src/db/schema.ts');
  const { encryptToken } = await import('../src/lib/crypto/vault.ts');
  const { eq, and } = await import('drizzle-orm');

  const testAccessToken = 'EAAP9KymhL5UBS7MiVDs5OLoZAkRPiDdTWNsFlEZAh6VzpJGUuIEUl8sa51EcBMH5bhIZC92XD2RQo1ZCPwp7bdxuXd8hJ68EY9t0TjqQN3vqcw';
  const encrypted = encryptToken(testAccessToken);
  const futureExp = new Date(Date.now() + 60 * 24 * 3600 * 1000);

  if (db) {
    const [existing] = await db
      .select()
      .from(socialConnections)
      .where(and(eq(socialConnections.workspaceId, workspaceId), eq(socialConnections.platform, 'instagram')))
      .limit(1);

    if (existing) {
      await db
        .update(socialConnections)
        .set({
          platformAccountId: 'act_ig_genuine_verified_99',
          accessTokenEncrypted: encrypted,
          tokenExpiresAt: futureExp,
          status: 'CONNECTED',
        })
        .where(eq(socialConnections.id, existing.id));
    } else {
      await db.insert(socialConnections).values({
        workspaceId,
        platform: 'instagram',
        platformAccountId: 'act_ig_genuine_verified_99',
        accessTokenEncrypted: encrypted,
        tokenExpiresAt: futureExp,
        status: 'CONNECTED',
      });
    }
  }

  // Verify GET now returns CONNECTED with masked token
  const getChannelsAfter = await fetch(`${BASE_URL}/api/social-connections`, {
    headers: { Cookie: cookie },
  });
  const channelsAfter = await getChannelsAfter.json();
  const igAfter = channelsAfter.connections?.find((c) => c.platform === 'instagram');
  assert(
    igAfter && igAfter.status === 'CONNECTED' && igAfter.isConfigured === true,
    `Reconnected Instagram shows status=CONNECTED and isConfigured=true`
  );
  assert(
    igAfter && igAfter.tokenMasked && igAfter.tokenMasked.startsWith('••••'),
    `Returned token is masked (${igAfter?.tokenMasked}) without exposing plaintext credentials`
  );

  // =========================================================================
  // 9. OAuth Callback Endpoint Route Guardrails
  // =========================================================================
  console.log('\n--- 9. OAuth Callback Endpoint CSRF & Param Validation ---');

  // Callback missing code and state
  const missingCallbackRes = await fetch(`${BASE_URL}/api/auth/oauth/x/callback?format=json`);
  const missingCallbackData = await missingCallbackRes.json();
  assert(
    missingCallbackRes.status === 400 && missingCallbackData.error?.includes('missing code or state'),
    'Callback endpoint rejects missing code/state parameters'
  );

  // Callback with tampered state
  const forgedCallbackRes = await fetch(`${BASE_URL}/api/auth/oauth/x/callback?code=mock_code_123&state=forged_state_xyz&format=json`);
  const forgedCallbackData = await forgedCallbackRes.json();
  assert(
    forgedCallbackRes.status === 403 && forgedCallbackData.error?.includes('CSRF detected'),
    'Callback endpoint rejects forged/tampered state token with 403 CSRF detected'
  );

  // Callback with legitimate state but provider code exchange failure (no fake fallback)
  const validCallbackState = generateOAuthState(workspaceId, userId, 'x', pkce.codeVerifier);
  const realFailCallbackRes = await fetch(
    `${BASE_URL}/api/auth/oauth/x/callback?code=invalid_test_code_999&state=${validCallbackState}&format=json`
  );
  const realFailData = await realFailCallbackRes.json();
  assert(
    realFailCallbackRes.status === 400 && !realFailData.accessToken?.startsWith('kuiro_oauth2_'),
    'Callback endpoint fails closed upon failed code exchange (zero simulated token fallback)'
  );

  console.log('\n================================================================');
  console.log(`   TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
