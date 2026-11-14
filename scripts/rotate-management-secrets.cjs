#!/usr/bin/env node

/**
 * KUIRO Management Secrets Generator & Rotation Tool
 * Generates cryptographically secure, high-entropy random credentials for platform operators.
 */

const crypto = require('crypto');

function generateSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

function generateRecoveryCode() {
  const segment1 = crypto.randomBytes(3).toString('hex').toUpperCase();
  const segment2 = crypto.randomBytes(3).toString('hex').toUpperCase();
  const segment3 = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `KUIRO-REC-${segment1}-${segment2}-${segment3}`;
}

console.log('================================================================');
console.log('🛡️  KUIRO PLATFORM OPERATOR MANAGEMENT SECRETS GENERATOR');
console.log('================================================================\n');

const newPasskey = generateSecret(32); // 64 hex characters (256-bit entropy)
const newJwtSecret = generateSecret(32); // 64 hex characters (256-bit entropy)
const newCronSecret = generateSecret(24); // 48 hex characters

const recoveryCodes = [
  generateRecoveryCode(),
  generateRecoveryCode(),
  generateRecoveryCode(),
];

const recoveryHashes = recoveryCodes.map((code) =>
  crypto.createHash('sha256').update(code).digest('hex')
);

console.log('Generated New Cryptographically Secure Secrets:');
console.log('----------------------------------------------------------------');
console.log(`KUIRO_MANAGEMENT_PASSKEY=${newPasskey}`);
console.log(`KUIRO_MANAGEMENT_JWT_SECRET=${newJwtSecret}`);
console.log(`CRON_SECRET=${newCronSecret}`);
console.log(`KUIRO_OPERATOR_EMAILS=rahul.biswas1704@gmail.com,management@kuiro.in`);
console.log(`KUIRO_OPERATOR_RECOVERY_HASHES=${recoveryHashes.join(',')}`);
console.log('----------------------------------------------------------------\n');

console.log('One-Time Emergency Recovery Codes (Save these securely offline):');
recoveryCodes.forEach((code, i) => console.log(`  [Code ${i + 1}]: ${code}`));
console.log('\n================================================================');
console.log('⚠️  IMPORTANT SECURITY INSTRUCTIONS:');
console.log('1. Never commit these secrets to version control or public repositories.');
console.log('2. Add these variables to your production host environment (e.g., Vercel Project Settings > Environment Variables).');
console.log('3. Legacy default passkeys (e.g., "KUIRO-MGMT-SECURE-2026") are permanently banned and will be rejected.');
console.log('================================================================\n');
