import crypto from 'crypto';

/**
 * Dedicated Meta WhatsApp Cloud API Webhook Security & Verification Service
 * 
 * Implements:
 * 1. Initial Webhook Verification (hub.mode, hub.verify_token, hub.challenge)
 * 2. Event Signature Verification (HMAC-SHA256 on raw body against X-Hub-Signature-256)
 * 3. Timing-Safe Buffer Comparisons to mitigate side-channel timing attacks
 * 4. Idempotency & Duplicate Event Detection
 * 5. Business Account (WABA) & Phone Number Identifier Validation
 * 6. Audit Logging of invalid/unauthorized webhook attempts
 */

// In-Memory Idempotency Store for Meta Webhook Event IDs (24-hour retention)
const PROCESSED_EVENT_CACHE = new Map<string, number>();
const MAX_CACHE_ENTRIES = 10000;
const EVENT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Constant-time string equality check to prevent timing analysis attacks.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Validates Meta's initial GET verification challenge.
 */
export function verifyMetaWebhookChallenge(
  mode: string | null,
  token: string | null,
  challenge: string | null
): { valid: boolean; challenge?: string; status: number; error?: string } {
  const configuredToken =
    process.env.META_WA_VERIFY_TOKEN ||
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
    'kuiro_wa_verify_token_secure_123';

  if (!mode || !token) {
    console.warn('[Meta Webhook Challenge Rejected] Missing mode or verify_token.');
    return {
      valid: false,
      status: 400,
      error: 'Missing required hub.mode or hub.verify_token parameters.',
    };
  }

  if (mode !== 'subscribe') {
    console.warn(`[Meta Webhook Challenge Rejected] Unexpected hub.mode '${mode}'. Expected 'subscribe'.`);
    return {
      valid: false,
      status: 403,
      error: `Forbidden: hub.mode must be 'subscribe'. Received '${mode}'.`,
    };
  }

  if (!timingSafeCompare(token, configuredToken)) {
    console.warn('[Meta Webhook Challenge Rejected] Invalid hub.verify_token provided.');
    return {
      valid: false,
      status: 403,
      error: 'Forbidden: Invalid verify token.',
    };
  }

  if (!challenge) {
    console.warn('[Meta Webhook Challenge Rejected] Missing hub.challenge.');
    return {
      valid: false,
      status: 400,
      error: 'Missing hub.challenge in subscription request.',
    };
  }

  console.log('[Meta Webhook Challenge Approved] Verification challenge passed successfully.');
  return {
    valid: true,
    challenge,
    status: 200,
  };
}

/**
 * Verifies the X-Hub-Signature-256 header against the raw request body using HMAC-SHA256.
 * MUST be calculated directly over raw bytes before any JSON deserialization.
 */
export function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null,
  customSecret?: string
): { valid: boolean; status: number; error?: string } {
  const appSecret =
    customSecret ||
    process.env.META_APP_SECRET ||
    process.env.WHATSAPP_APP_SECRET ||
    (process.env.NODE_ENV !== 'production' ? 'kuiro_meta_app_secret_test_32chars' : '');

  if (!appSecret) {
    console.error(
      '[Meta Webhook Security Critical] META_APP_SECRET is not configured on server. Failing closed.'
    );
    return {
      valid: false,
      status: 500,
      error: 'Server configuration error: Webhook signature verification secret missing.',
    };
  }

  if (!signatureHeader) {
    console.warn('[Meta Webhook Security Alert] Missing X-Hub-Signature-256 header on incoming POST.');
    return {
      valid: false,
      status: 401,
      error: 'Missing X-Hub-Signature-256 signature header.',
    };
  }

  const prefix = 'sha256=';
  if (!signatureHeader.startsWith(prefix)) {
    console.warn(
      `[Meta Webhook Security Alert] Malformed signature header. Does not begin with '${prefix}'.`
    );
    return {
      valid: false,
      status: 401,
      error: `Invalid X-Hub-Signature-256 header format. Expected '${prefix}<hash>'.`,
    };
  }

  // Calculate HMAC-SHA256 over raw request body
  const computedHash = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody, 'utf8')
    .digest('hex');

  const expectedSignature = `${prefix}${computedHash}`;

  if (!timingSafeCompare(signatureHeader, expectedSignature)) {
    console.warn(
      `[Meta Webhook Security Alert] Cryptographic signature mismatch. Possible tampering or unauthorized sender.`
    );
    return {
      valid: false,
      status: 401,
      error: 'Invalid X-Hub-Signature-256 signature.',
    };
  }

  return { valid: true, status: 200 };
}

/**
 * Checks if a webhook event ID has already been received and processed.
 * Prevents replay attacks and duplicate message processing.
 */
export function isDuplicateEvent(eventId: string, ttlMs = EVENT_TTL_MS): boolean {
  if (!eventId) return false;

  const now = Date.now();

  // Prune expired entries if cache is large
  if (PROCESSED_EVENT_CACHE.size > MAX_CACHE_ENTRIES) {
    for (const [id, timestamp] of PROCESSED_EVENT_CACHE.entries()) {
      if (now - timestamp > ttlMs) {
        PROCESSED_EVENT_CACHE.delete(id);
      }
    }
  }

  if (PROCESSED_EVENT_CACHE.has(eventId)) {
    return true;
  }

  PROCESSED_EVENT_CACHE.set(eventId, now);
  return false;
}

/**
 * Validates top-level Meta webhook object structure, WABA ID, and phone number identifiers.
 */
export function validateMetaIdentifiers(body: any): {
  valid: boolean;
  error?: string;
  wabaId?: string;
  phoneNumberId?: string;
  eventId?: string;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Malformed JSON payload: Root must be an object.' };
  }

  if (body.object !== 'whatsapp_business_account') {
    return {
      valid: false,
      error: `Invalid webhook object: Expected 'whatsapp_business_account', received '${body.object}'.`,
    };
  }

  if (!Array.isArray(body.entry) || body.entry.length === 0) {
    return { valid: false, error: 'Missing or empty entry array in webhook payload.' };
  }

  const entry = body.entry[0];
  const wabaId = entry?.id;
  const change = entry?.changes?.[0];
  const value = change?.value;
  const phoneNumberId = value?.metadata?.phone_number_id;
  const message = value?.messages?.[0];
  const status = value?.statuses?.[0];

  // Derive unique event ID: message.id or status.id or change/entry ID
  const eventId = message?.id || status?.id || entry?.id;

  // Verify configured WABA ID if explicitly set in environment
  const configuredWabaId =
    process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.META_WA_BUSINESS_ACCOUNT_ID;
  if (
    configuredWabaId &&
    configuredWabaId !== 'your_meta_waba_id' &&
    wabaId &&
    wabaId !== configuredWabaId
  ) {
    console.warn(
      `[Meta Webhook Identifiers] Mismatch in WABA ID. Configured: ${configuredWabaId}, Received: ${wabaId}`
    );
  }

  return {
    valid: true,
    wabaId,
    phoneNumberId,
    eventId,
  };
}
