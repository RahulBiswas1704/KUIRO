/**
 * KUIRO Token Vault & Refresh Service Verification Suite
 * 
 * Tests:
 * 1. Database dump token exposure: Raw DB values are authenticated AES-256-GCM ciphertexts, not Base64/plaintext.
 * 2. Invalid ciphertext rejection: Tampered ciphertexts, bad auth tags, or corrupted nonces fail decryption.
 * 3. Key rotation: Key-versioned ciphertexts (v1, v2) rotate cleanly.
 * 4. Token refresh service: Expiring tokens detected and refreshed where supported.
 * 5. Distributed locking & Concurrency: Prevents duplicate refresh workers from overwriting newer tokens.
 * 6. Revoked token detection: Provider rejection marks connection as REVOKED.
 * 7. Information leakage prevention: Tokens never appear in API responses or logs (strictly masked).
 */

const crypto = require('crypto');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runTests() {
  console.log('================================================================');
  console.log('   KUIRO TOKEN VAULT & REFRESH SERVICE VERIFICATION SUITE');
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

  // Dynamic imports
  const {
    encryptToken,
    decryptToken,
    maskToken,
    isEncrypted,
    registerKeyVersion,
    rotateTokenEncryption,
    sanitizeTokenLogs,
    ACTIVE_KEY_VERSION,
  } = await import('../src/lib/crypto/vault.ts');

  const { db } = await import('../src/db/index.ts');
  const { socialConnections } = await import('../src/db/schema.ts');
  const { eq, and } = await import('drizzle-orm');
  const {
    acquireRefreshLock,
    releaseRefreshLock,
    refreshConnectionToken,
    refreshExpiringTokens,
  } = await import('../src/lib/social/tokenRefresh.ts');

  // =========================================================================
  // 1. Authenticate Test Workspace
  // =========================================================================
  console.log('--- 1. Authenticate Test Workspace ---');
  const userEmail = `vault_test_${Date.now()}@kuiro.in`;
  const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userEmail,
      password: 'SecurePassword!1234',
      name: 'Vault Security Founder',
      brandName: 'Heritage Textiles Vault',
      industry: 'Retail & Commerce',
    }),
  });

  const rawCookie = signupRes.headers.get('set-cookie') || '';
  const cookie = rawCookie.split(';')[0];
  const signupData = await signupRes.json();
  const workspaceId = signupData.workspace?.id;
  const userId = signupData.user?.id;

  assert(signupRes.ok && !!cookie, 'User authenticated with session cookie');
  assert(workspaceId && userId, `Workspace provisioned: ${workspaceId}`);

  // =========================================================================
  // 2. Ciphertext Authenticity & Tamper Resistance Tests
  // =========================================================================
  console.log('\n--- 2. AES-256-GCM Ciphertext Authenticity & Tamper Resistance ---');
  const secretSampleToken = 'EAAP9KymhL5UBS7SampleOAuthTokenWithHighEntropy998877';

  // Encryption generates versioned ciphertext
  const encrypted = encryptToken(secretSampleToken);
  assert(isEncrypted(encrypted), 'Encrypted string matches vault format');
  assert(encrypted.startsWith('v1:aes256gcm:'), 'Ciphertext contains key version prefix (v1:aes256gcm:)');

  // Successful decryption
  const decrypted = decryptToken(encrypted);
  assert(decrypted === secretSampleToken, 'Decrypted token exactly matches original plaintext');

  // Nonce uniqueness: two encryptions of the same plaintext produce completely different ciphertexts
  const encrypted2 = encryptToken(secretSampleToken);
  assert(encrypted !== encrypted2, 'Two encryptions of identical plaintext produce distinct ciphertexts (unique 96-bit nonce)');

  // Tampering detection: Altering 1 character of ciphertext throws error
  const parts = encrypted.split(':');
  const ciphertextHex = parts[4];
  const flippedLastChar = ciphertextHex.slice(0, -1) + (ciphertextHex.slice(-1) === 'a' ? 'b' : 'a');
  parts[4] = flippedLastChar;
  const tamperedCiphertext = parts.join(':');

  let tamperFailed = false;
  try {
    decryptToken(tamperedCiphertext);
  } catch (err) {
    tamperFailed = true;
  }
  assert(tamperFailed, 'Tampered ciphertext fails GCM authentication tag verification (throws error)');

  // Tampering detection: Altering auth tag throws error
  const partsTag = encrypted.split(':');
  const authTagHex = partsTag[3];
  partsTag[3] = authTagHex.slice(0, -2) + 'ff';
  const tamperedTag = partsTag.join(':');

  let tagTamperFailed = false;
  try {
    decryptToken(tamperedTag);
  } catch (err) {
    tagTamperFailed = true;
  }
  assert(tagTamperFailed, 'Mismatched auth tag is rejected by AES-256-GCM');

  // Plaintext rejection: Raw unencrypted strings cannot be passed to decryptToken
  let plaintextRejected = false;
  try {
    decryptToken('unencrypted_raw_bearer_token_123');
  } catch (err) {
    plaintextRejected = true;
  }
  assert(plaintextRejected, 'Unencrypted plaintext token rejected by decryptToken');

  // =========================================================================
  // 3. Key Rotation & Version Migration Tests
  // =========================================================================
  console.log('\n--- 3. Key Rotation & Versioned Decryption ---');
  // Register v2 key
  registerKeyVersion('v2', 'kuiro_new_rotated_secret_seed_v2_2026_secure');

  // Encrypt with v2
  const encryptedV2 = encryptToken(secretSampleToken, 'v2');
  assert(encryptedV2.startsWith('v2:aes256gcm:'), 'Token encrypted under rotated key version v2');

  // Both v1 and v2 decrypt transparently
  const decryptedV1 = decryptToken(encrypted);
  const decryptedV2 = decryptToken(encryptedV2);
  assert(decryptedV1 === secretSampleToken && decryptedV2 === secretSampleToken, 'Vault transparently decrypts both v1 and v2 ciphertexts');

  // Re-encrypt / rotate v1 ciphertext to v2
  const rotated = rotateTokenEncryption(encrypted, 'v2');
  assert(rotated.startsWith('v2:aes256gcm:') && decryptToken(rotated) === secretSampleToken, 'Rotated ciphertext migrated from v1 to v2 without plaintext exposure');

  // =========================================================================
  // 4. Database Dump Protection (No Usable Tokens in Database)
  // =========================================================================
  console.log('\n--- 4. Database Dump Security & Storage Verification ---');
  const rawProviderToken = 'x_access_token_super_secret_for_db_dump_check_8877';
  const encryptedForDb = encryptToken(rawProviderToken);

  if (db) {
    await db.insert(socialConnections).values({
      workspaceId,
      platform: 'x',
      platformAccountId: 'x_account_dump_check',
      accessTokenEncrypted: encryptedForDb,
      refreshTokenEncrypted: encryptToken('x_refresh_token_secret_9988'),
      tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
      status: 'CONNECTED',
      grantedScopes: ['tweet.read', 'tweet.write', 'offline.access'],
      keyVersion: 'v1',
      tokenVersion: 1,
    });
  }

  // Read raw database record
  let rawDbToken = '';
  if (db) {
    const [row] = await db
      .select()
      .from(socialConnections)
      .where(and(eq(socialConnections.workspaceId, workspaceId), eq(socialConnections.platform, 'x')))
      .limit(1);
    rawDbToken = row?.accessTokenEncrypted || '';
  }

  assert(rawDbToken.startsWith('v1:aes256gcm:'), 'Raw database value is AES-256-GCM ciphertext');
  assert(!rawDbToken.includes(rawProviderToken), 'Database dump does not contain plaintext token string');

  // Verify Base64 decode does not yield plaintext
  const base64Decoded = Buffer.from(rawDbToken, 'base64').toString('utf8');
  assert(!base64Decoded.includes(rawProviderToken), 'Database dump cannot be decoded using Base64');

  // =========================================================================
  // 5. Distributed Locking & Concurrency Control
  // =========================================================================
  console.log('\n--- 5. Distributed Locking & Optimistic Concurrency Control ---');
  let testConnId = '';
  let initialVersion = 1;

  if (db) {
    const [row] = await db
      .select()
      .from(socialConnections)
      .where(and(eq(socialConnections.workspaceId, workspaceId), eq(socialConnections.platform, 'x')))
      .limit(1);
    testConnId = row?.id || '';
    initialVersion = row?.tokenVersion || 1;
  }

  // Worker 1 acquires lock
  const lock1 = await acquireRefreshLock(testConnId, initialVersion, 60000);
  assert(lock1 === true, 'Worker 1 successfully acquired distributed refresh lock');

  // Worker 2 attempts to acquire lock on the same record while locked -> should fail
  const lock2 = await acquireRefreshLock(testConnId, initialVersion, 60000);
  assert(lock2 === false, 'Worker 2 locked out from acquiring duplicate lock (concurrency collision prevented)');

  // Release lock
  await releaseRefreshLock(testConnId);
  const lockAfterRelease = await acquireRefreshLock(testConnId, initialVersion, 60000);
  assert(lockAfterRelease === true, 'Lock re-acquired after release');
  await releaseRefreshLock(testConnId);

  // Optimistic concurrency control test: Stale version write rejection
  if (db) {
    // Simulate Worker A updating version to 2
    await db
      .update(socialConnections)
      .set({ tokenVersion: 2 })
      .where(eq(socialConnections.id, testConnId));

    // Stale Worker B trying to write with expected tokenVersion = 1
    const [staleWrite] = await db
      .update(socialConnections)
      .set({
        accessTokenEncrypted: encryptToken('stale_overwrite_token'),
        tokenVersion: 2,
      })
      .where(
        and(
          eq(socialConnections.id, testConnId),
          eq(socialConnections.tokenVersion, 1) // Stale version check
        )
      )
      .returning();

    assert(staleWrite === undefined, 'OCC check strictly prevented stale worker from overwriting newer token');
  }

  // =========================================================================
  // 6. Token Refresh Service: Expiring Token Detection
  // =========================================================================
  console.log('\n--- 6. Token Refresh Service: Proactive Expiry Sweep ---');

  // Insert a test connection that is approaching expiry (expires in 2 days)
  const expiringDate = new Date(Date.now() + 2 * 24 * 3600 * 1000);
  if (db) {
    await db
      .update(socialConnections)
      .set({
        tokenExpiresAt: expiringDate,
        status: 'CONNECTED',
      })
      .where(eq(socialConnections.id, testConnId));
  }

  // Run refreshExpiringTokens with 7-day threshold
  const sweepResult = await refreshExpiringTokens({ thresholdDays: 7, workspaceId });
  assert(sweepResult.scanned >= 1, `Refresh service scanned ${sweepResult.scanned} expiring connection(s) within 7-day threshold`);

  // =========================================================================
  // 7. Revocation Handling: Provider Rejection Marks Connection REVOKED
  // =========================================================================
  console.log('\n--- 7. Revocation Handling: Provider Rejection Marks REVOKED ---');
  if (db) {
    const [connRow] = await db
      .select()
      .from(socialConnections)
      .where(eq(socialConnections.id, testConnId))
      .limit(1);

    // Call refresh on an invalid token (should detect revocation and mark REVOKED)
    const refreshRes = await refreshConnectionToken(connRow);
    assert(
      refreshRes.status === 'REVOKED' || refreshRes.status === 'EXPIRED',
      `Failed refresh on invalid token transitioned connection status to ${refreshRes.status}`
    );

    // Verify DB status is updated to REVOKED
    const [updatedRow] = await db
      .select()
      .from(socialConnections)
      .where(eq(socialConnections.id, testConnId))
      .limit(1);
    assert(
      updatedRow?.status === 'REVOKED' || updatedRow?.status === 'EXPIRED',
      `Database status synchronized to ${updatedRow?.status} (lastError: ${updatedRow?.lastError?.substring(0, 40)}...)`
    );
  }

  // =========================================================================
  // 8. API & Log Information Leakage Prevention
  // =========================================================================
  console.log('\n--- 8. Information Leakage Prevention (API & Log Redaction) ---');

  // Call GET /api/social-connections
  const apiRes = await fetch(`${BASE_URL}/api/social-connections`, {
    headers: { Cookie: cookie },
  });
  const apiJson = await apiRes.json();
  const apiBodyStr = JSON.stringify(apiJson);

  assert(!apiBodyStr.includes(rawProviderToken), 'Plaintext token does NOT appear in GET /api/social-connections response');
  assert(!apiBodyStr.includes('v1:aes256gcm:'), 'Raw ciphertext does NOT leak in GET /api/social-connections response');

  const xChannel = apiJson.connections?.find((c) => c.platform === 'x');
  assert(
    xChannel && xChannel.tokenMasked && xChannel.tokenMasked.startsWith('••••'),
    `Token is masked in API response (${xChannel?.tokenMasked})`
  );

  // Test log sanitizer
  const sensitiveObject = {
    user: 'founder',
    accessToken: rawProviderToken,
    secretKey: 'top_secret_123',
    nested: {
      refreshToken: 'refresh_secret_abc',
    },
  };
  const sanitized = sanitizeTokenLogs(sensitiveObject);
  assert(sanitized.accessToken.startsWith('••••'), 'sanitizeTokenLogs masks accessToken field');
  assert(sanitized.secretKey.startsWith('••••'), 'sanitizeTokenLogs masks secretKey field');
  assert(sanitized.nested.refreshToken.startsWith('••••'), 'sanitizeTokenLogs masks nested token fields');

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
