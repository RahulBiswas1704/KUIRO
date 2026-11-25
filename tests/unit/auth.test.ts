import '../setup';
import { TestSuiteContext } from '../setup';
import {
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
  generateSessionToken,
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  clearFailedLoginAttempts,
  createVerificationToken,
  verifyAndConsumeToken,
} from '@/lib/auth';
import {
  createTeamInviteToken,
  verifyTeamInviteToken,
} from '@/lib/email/invitation';
import {
  encryptToken,
  decryptToken,
  maskToken,
  isEncrypted,
  sanitizeTokenLogs,
} from '@/lib/crypto/vault';

export async function runAuthUnitTests(): Promise<TestSuiteContext> {
  const ctx = new TestSuiteContext('Level A: Auth & Cryptographic Security Unit Tests');
  console.log(`\n================================================================`);
  console.log(`  RUNNING: ${ctx.name}`);
  console.log(`================================================================`);

  // 1. Password Strength Validation
  {
    const emptyCheck = validatePasswordStrength('');
    ctx.assert(!emptyCheck.valid, 'Password validation: Rejects empty password');

    const shortCheck = validatePasswordStrength('short1');
    ctx.assert(!shortCheck.valid, 'Password validation: Rejects password under 8 characters');

    const longStr = 'A'.repeat(129);
    const longCheck = validatePasswordStrength(longStr);
    ctx.assert(!longCheck.valid, 'Password validation: Rejects password exceeding 128 characters');

    const validCheck = validatePasswordStrength('KuroMarketing2026!');
    ctx.assert(validCheck.valid, 'Password validation: Accepts robust 18-character password');
  }

  // 2. Scrypt Cryptographic Hashing & Verification
  {
    const rawPass = 'HeritageSilkCraft2026!';
    const hashed = hashPassword(rawPass);

    ctx.assert(
      hashed.startsWith('scrypt:') && hashed.split(':').length === 3,
      'Password hashing: Produces scrypt-salted hash format (scrypt:salt:hash)'
    );

    const matchesCorrect = verifyPassword(rawPass, hashed);
    ctx.assert(matchesCorrect, 'Password verification: Correct password authenticates');

    const matchesWrong = verifyPassword('WrongPassword123!', hashed);
    ctx.assert(!matchesWrong, 'Password verification: Incorrect password rejected in constant time');

    const malformedSafe = verifyPassword(rawPass, 'invalid_hash_string');
    ctx.assert(!malformedSafe, 'Password verification: Corrupted hash fails safely without crash');
  }

  // 3. High-Entropy Session Token Generation
  {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();

    ctx.assert(
      typeof token1 === 'string' && token1.length === 64,
      'Session tokens: Generates 64-character unguessable hex session token'
    );
    ctx.assert(token1 !== token2, 'Session tokens: Consecutive generations yield distinct entropy');
  }

  // 4. Brute-Force Rate Limiting Engine
  {
    const testIp = '198.51.100.42';
    const testEmail = 'attacker@hostile-domain.test';

    clearFailedLoginAttempts(testEmail, testIp);
    const initialCheck = checkLoginRateLimit(testEmail, testIp);
    ctx.assert(initialCheck.allowed, 'Rate limiter: Initial attempt allowed');

    // Simulate 5 consecutive failed attempts
    for (let i = 0; i < 5; i++) {
      recordFailedLoginAttempt(testEmail, testIp);
    }

    const lockedCheck = checkLoginRateLimit(testEmail, testIp);
    ctx.assert(
      !lockedCheck.allowed && (lockedCheck.retryAfterSeconds ?? 0) > 0,
      'Rate limiter: Locks account after 5 failed attempts with positive retryAfterSeconds'
    );

    // Clean up
    clearFailedLoginAttempts(testEmail, testIp);
    const unlockedCheck = checkLoginRateLimit(testEmail, testIp);
    ctx.assert(unlockedCheck.allowed, 'Rate limiter: clearFailedLoginAttempts restores access');
  }

  // 5. Verification Tokens (Single-Use OTP & Expiry)
  {
    const testEmail = 'user.verification.test@kuiro.io';
    const { rawToken } = await createVerificationToken(testEmail, 'EMAIL_VERIFICATION', 10);

    ctx.assert(
      /^\d{6}$/.test(rawToken),
      'Verification OTP: Generates 6-digit numeric verification code'
    );

    // Test incorrect OTP
    const wrongVerification = await verifyAndConsumeToken(testEmail, '000000', 'EMAIL_VERIFICATION');
    ctx.assert(!wrongVerification.valid, 'Verification OTP: Rejects incorrect code');

    // Test correct OTP
    const correctVerification = await verifyAndConsumeToken(testEmail, rawToken, 'EMAIL_VERIFICATION');
    ctx.assert(correctVerification.valid, 'Verification OTP: Successfully consumes valid code');

    // Test single-use replay protection
    const replayVerification = await verifyAndConsumeToken(testEmail, rawToken, 'EMAIL_VERIFICATION');
    ctx.assert(
      !replayVerification.valid,
      'Verification OTP: Rejects replayed code (strict single-use enforcement)'
    );
  }

  // 6. Token Vault AES-256-GCM Encryption
  {
    const secretOAuthToken = 'EAA_facebook_page_access_token_super_secret_credentials_991827';
    const encrypted = encryptToken(secretOAuthToken);

    ctx.assert(
      isEncrypted(encrypted) && encrypted.includes(':aes256gcm:'),
      'Token Vault: Formats ciphertext with key version, IV, and auth tag'
    );

    const decrypted = decryptToken(encrypted);
    ctx.assert(decrypted === secretOAuthToken, 'Token Vault: Decrypts and authenticates ciphertext');

    // Tampering detection: Alter last character of ciphertext
    const tampered = encrypted.slice(0, -2) + (encrypted.slice(-2) === 'aa' ? 'bb' : 'aa');
    let tamperDetected = false;
    try {
      decryptToken(tampered);
    } catch {
      tamperDetected = true;
    }
    ctx.assert(tamperDetected, 'Token Vault: Rejects tampered ciphertext with cryptographic authentication error');

    // Plaintext rejection
    let plainRejected = false;
    try {
      decryptToken('plain_unencrypted_token');
    } catch {
      plainRejected = true;
    }
    ctx.assert(plainRejected, 'Token Vault: Rejects raw unencrypted strings');

    // UI Masking
    const masked = maskToken(secretOAuthToken);
    ctx.assert(
      masked.startsWith('••••••••••••') && masked.endsWith('1827'),
      'Token Vault: Masks sensitive token for safe UI display (••••••••••••1827)'
    );

    // Log Sanitization
    const logObj = {
      user: 'Rajesh',
      authToken: secretOAuthToken,
      metaSecret: 'my_meta_secret_key',
      metadata: { nestedPassword: 'SecretPassword99' },
    };
    const sanitized = sanitizeTokenLogs(logObj);
    ctx.assert(
      sanitized.authToken.startsWith('••••••••••••') &&
        sanitized.metaSecret.startsWith('••••••••••••') &&
        sanitized.metadata.nestedPassword.startsWith('••••••••••••'),
      'Token Vault: Recursively redacts sensitive auth fields before logging'
    );
  }

  // 7. Production Master OTP Guard & Team Invite Token Integrity
  {
    const origEnv = process.env.NODE_ENV;
    const origEnableTestOtp = process.env.ENABLE_TEST_OTP;
    try {
      (process.env as any).NODE_ENV = 'production';
      delete process.env.ENABLE_TEST_OTP;

      const blockedInProd = await verifyAndConsumeToken('prod.user@kuiro.in', '888888', 'EMAIL_VERIFICATION');
      ctx.assert(!blockedInProd.valid, 'OTP Security: Rejects master test OTP in production when ENABLE_TEST_OTP is unset');

      process.env.ENABLE_TEST_OTP = 'true';
      const allowedWithFlag = await verifyAndConsumeToken('prod.user@kuiro.in', '888888', 'EMAIL_VERIFICATION');
      ctx.assert(allowedWithFlag.valid, 'OTP Security: Permits master test OTP in production only when ENABLE_TEST_OTP=true');
    } finally {
      (process.env as any).NODE_ENV = origEnv;
      if (origEnableTestOtp === undefined) {
        delete process.env.ENABLE_TEST_OTP;
      } else {
        process.env.ENABLE_TEST_OTP = origEnableTestOtp;
      }
    }

    const inviteTok = createTeamInviteToken({
      workspaceId: 'ws_test_123',
      userId: 'usr_test_456',
      email: 'member@sharmaheritage.in',
      role: 'Marketer',
    });
    const verifiedInvite = verifyTeamInviteToken(inviteTok);
    ctx.assert(
      verifiedInvite.valid &&
        verifiedInvite.payload?.email === 'member@sharmaheritage.in' &&
        verifiedInvite.payload?.role === 'Marketer',
      'Team Invite Token: Generates and verifies signed HMAC invite token'
    );

    const tamperedInvite = verifyTeamInviteToken(inviteTok.slice(0, -3) + 'xxx');
    ctx.assert(!tamperedInvite.valid, 'Team Invite Token: Rejects tampered invitation signature');
  }

  return ctx;
}

if (process.argv[1]?.includes('auth.test.ts')) {
  runAuthUnitTests()
    .then((c) => {
      console.log(`\nAuth Unit Tests Complete: ${c.passed} passed, ${c.failed} failed.`);
      process.exit(c.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Fatal in Auth Unit Tests:', err);
      process.exit(1);
    });
}
