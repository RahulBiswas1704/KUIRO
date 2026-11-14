import crypto from 'crypto';

/**
 * KUIRO Production OAuth Token Vault (AES-256-GCM Authenticated Encryption)
 * 
 * Provides authenticated symmetric encryption with key-versioning for OAuth 2.0 access & refresh tokens
 * stored in Neon PostgreSQL (social_connections.access_token_encrypted).
 * 
 * Cryptographic Specs:
 * - Cipher: AES-256-GCM (Galois/Counter Mode, RFC 5116 authenticated encryption)
 * - Key Length: 256 bits (32 bytes derived via scrypt)
 * - Initialization Vector (IV/Nonce): 96 bits (12 bytes) cryptographically random per encryption
 * - Auth Tag: 128 bits (16 bytes) providing authenticated ciphertext integrity & authenticity
 * - Key Versioning: Encodes key version prefix to support seamless zero-downtime key rotation
 * - Wire Format: <keyVersion>:aes256gcm:<iv_hex>:<tag_hex>:<ciphertext_hex>
 */

// Secret seed resolution: strictly prioritizes dedicated vault key
const PRIMARY_SECRET =
  process.env.OAUTH_ENCRYPTION_KEY ||
  process.env.ENCRYPTION_KEY ||
  process.env.AUTH_SECRET ||
  process.env.SESSION_SECRET ||
  process.env.BETTER_AUTH_SECRET ||
  'kuiro_production_oauth_vault_master_key_2026';

// Multi-version key registry for seamless key rotation
const KEY_REGISTRY: Record<string, Buffer> = {
  v1: crypto.scryptSync(PRIMARY_SECRET, 'kuiro_oauth_vault_salt_v1', 32),
};

// If a rotated v2 key is configured, register it
if (process.env.OAUTH_ENCRYPTION_KEY_V2) {
  KEY_REGISTRY.v2 = crypto.scryptSync(process.env.OAUTH_ENCRYPTION_KEY_V2, 'kuiro_oauth_vault_salt_v2', 32);
}

export const ACTIVE_KEY_VERSION = 'v1';

/**
 * Registers a new key version dynamically (for key rotation workflows)
 */
export function registerKeyVersion(version: string, secretSeed: string) {
  KEY_REGISTRY[version] = crypto.scryptSync(secretSeed, `kuiro_oauth_vault_salt_${version}`, 32);
}

/**
 * Encrypts a plaintext OAuth token using AES-256-GCM authenticated encryption.
 * Generates a unique 96-bit random nonce for every operation.
 * 
 * Format: <keyVersion>:aes256gcm:<iv_hex>:<tag_hex>:<ciphertext_hex>
 */
export function encryptToken(plainText: string, keyVersion: string = ACTIVE_KEY_VERSION): string {
  if (!plainText) return '';

  const key = KEY_REGISTRY[keyVersion] || KEY_REGISTRY[ACTIVE_KEY_VERSION];
  if (!key) {
    throw new Error(`Encryption key for version "${keyVersion}" is not available in vault registry.`);
  }

  // 96-bit (12-byte) unique cryptographic nonce
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);

  // 128-bit (16-byte) authentication tag
  const authTag = cipher.getAuthTag();

  return `${keyVersion}:aes256gcm:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts and authenticates an AES-256-GCM ciphertext.
 * Rejects tampered ciphertexts, mismatched auth tags, or corrupted nonces.
 */
export function decryptToken(encryptedString: string): string {
  if (!encryptedString) return '';

  // 1. Versioned format: <version>:aes256gcm:<iv>:<tag>:<ciphertext>
  if (encryptedString.includes(':aes256gcm:')) {
    const [versionPart, rest] = encryptedString.split(':aes256gcm:');
    const version = versionPart || ACTIVE_KEY_VERSION;
    const parts = rest.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid AES-256-GCM versioned ciphertext format');
    }

    const key = KEY_REGISTRY[version] || KEY_REGISTRY[ACTIVE_KEY_VERSION];
    if (!key) {
      throw new Error(`Decryption failed: Key version "${version}" not found in vault registry.`);
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const ciphertext = Buffer.from(parts[2], 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    try {
      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);
      return decrypted.toString('utf8');
    } catch {
      throw new Error('Ciphertext authentication failed (tampering detected or invalid key).');
    }
  }

  // 2. Unversioned legacy AES-256-GCM format: aes256gcm:<iv>:<tag>:<ciphertext>
  if (encryptedString.startsWith('aes256gcm:')) {
    const parts = encryptedString.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid legacy AES-256-GCM ciphertext format');
    }

    const key = KEY_REGISTRY[ACTIVE_KEY_VERSION];
    const iv = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    const ciphertext = Buffer.from(parts[3], 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    try {
      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);
      return decrypted.toString('utf8');
    } catch {
      throw new Error('Ciphertext authentication failed (tampering detected or invalid key).');
    }
  }

  // 3. Reject unencrypted plaintext tokens
  throw new Error('Token is not stored in an authenticated encrypted format (unencrypted plaintext or unrecognized encoding).');
}

/**
 * Checks whether a token string is properly encrypted in the vault format
 */
export function isEncrypted(value?: string | null): boolean {
  if (!value) return false;
  return value.includes(':aes256gcm:') || value.startsWith('aes256gcm:');
}

/**
 * Rotates an existing ciphertext to a newer key version without exposing plaintext
 */
export function rotateTokenEncryption(encryptedString: string, targetVersion: string): string {
  const plainText = decryptToken(encryptedString);
  return encryptToken(plainText, targetVersion);
}

/**
 * Returns a secure masked representation of a token for UI presentation (e.g. ••••••••••••4892).
 * Strictly prevents plaintext leakage to clients.
 */
export function maskToken(rawOrEncrypted?: string | null): string {
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

/**
 * Deep-sanitizes an object or string before logging, redacting any sensitive token fields.
 */
export function sanitizeTokenLogs(data: any): any {
  if (!data) return data;
  if (typeof data === 'string') {
    if (isEncrypted(data)) return '[ENCRYPTED_VAULT_CIPHERTEXT]';
    if (data.length > 20 && (data.startsWith('EAA') || data.startsWith('Bearer ') || data.startsWith('ghp_'))) {
      return '[REDACTED_TOKEN]';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeTokenLogs);
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      const lower = k.toLowerCase();
      if (
        lower.includes('token') ||
        lower.includes('secret') ||
        lower.includes('password') ||
        lower.includes('authorization') ||
        lower.includes('key')
      ) {
        if (typeof v === 'string') {
          sanitized[k] = maskToken(v);
        } else {
          sanitized[k] = '[REDACTED]';
        }
      } else {
        sanitized[k] = sanitizeTokenLogs(v);
      }
    }
    return sanitized;
  }

  return data;
}
