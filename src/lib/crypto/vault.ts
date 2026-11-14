import crypto from 'crypto';

/**
 * KUIRO OAuth Token Vault (AES-256-GCM Authenticated Encryption)
 * 
 * Provides authenticated symmetric encryption for platform OAuth 2.0 access & refresh tokens
 * stored in Neon PostgreSQL (social_connections.access_token_encrypted).
 * 
 * Cryptographic Specs:
 * - Cipher: AES-256-GCM (Galois/Counter Mode)
 * - Key Length: 256 bits (32 bytes)
 * - Initialization Vector (IV): 96 bits (12 bytes) cryptographically random per encryption
 * - Auth Tag: 128 bits (16 bytes) providing ciphertext integrity & authenticity
 */

const SECRET_SEED =
  process.env.OAUTH_ENCRYPTION_KEY ||
  process.env.AUTH_SECRET ||
  process.env.SESSION_SECRET ||
  'kuiro_production_oauth_vault_master_key_2026';

// Derive deterministic 32-byte master key via scrypt
const MASTER_KEY = crypto.scryptSync(SECRET_SEED, 'kuiro_oauth_vault_salt_v1', 32);

/**
 * Encrypts an OAuth plaintext token with AES-256-GCM.
 * Output format: aes256gcm:<iv_hex>:<tag_hex>:<ciphertext_hex>
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return '';

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', MASTER_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return `aes256gcm:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts and verifies an authenticated AES-256-GCM encrypted token.
 * Throws error if ciphertext has been tampered with or corrupted.
 */
export function decryptToken(encryptedString: string): string {
  if (!encryptedString) return '';

  // Handle AES-256-GCM formatted ciphertext
  if (encryptedString.startsWith('aes256gcm:')) {
    const parts = encryptedString.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid AES-256-GCM ciphertext format');
    }

    const iv = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    const ciphertext = Buffer.from(parts[3], 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', MASTER_KEY, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  // Gracefully decrypt legacy base64 mock tokens if present in database
  if (encryptedString.startsWith('enc_')) {
    const base64Data = encryptedString.replace('enc_', '');
    try {
      const decoded = Buffer.from(base64Data, 'base64').toString('utf8');
      if (decoded && !decoded.includes('\ufffd')) {
        return decoded;
      }
    } catch {
      // Fall through to returning raw string
    }
    return encryptedString;
  }

  return encryptedString;
}

/**
 * Returns a secure masked representation of a token for UI presentation
 * E.g. ••••••••••••4892
 */
export function maskToken(rawOrEncrypted: string): string {
  if (!rawOrEncrypted) return '••••••••••••0000';

  let raw = rawOrEncrypted;
  try {
    raw = decryptToken(rawOrEncrypted);
  } catch {
    raw = rawOrEncrypted;
  }

  const clean = raw.trim();
  const last4 = clean.length >= 4 ? clean.slice(-4) : '4892';
  return `••••••••••••${last4}`;
}
