import '../setup';
import crypto from 'crypto';
import { TestSuiteContext } from '../setup';
import {
  verifyMetaWebhookChallenge,
  verifyMetaSignature,
  isDuplicateEvent,
} from '@/lib/whatsapp/webhookSecurity';
import {
  verifyRazorpayWebhookSignature,
  generateOrderToken,
  verifyOrderToken,
} from '@/lib/billing';
import {
  validateUrlForSSRF,
  isPrivateOrRestrictedIPv4,
  isPrivateOrRestrictedIPv6,
  isProhibitedHostname,
} from '@/lib/security/safeFetch';

export async function runSecurityUnitTests(): Promise<TestSuiteContext> {
  const ctx = new TestSuiteContext('Level A: Webhook & SSRF Security Unit Tests');
  console.log(`\n================================================================`);
  console.log(`  RUNNING: ${ctx.name}`);
  console.log(`================================================================`);

  const WA_VERIFY_TOKEN = process.env.META_WA_VERIFY_TOKEN || 'kuiro_wa_verify_token_secure_123';
  const META_APP_SECRET = 'kuiro_meta_app_secret_test_32chars';
  const RAZORPAY_SECRET = 'kuiro_razorpay_webhook_secret_secure_32chars';

  // 1. Meta Webhook Subscription Challenge Verification
  {
    const missingParams = verifyMetaWebhookChallenge(null, null, null);
    ctx.assert(!missingParams.valid && missingParams.status === 400, 'Meta Webhook Challenge: Rejects missing params with 400');

    const wrongMode = verifyMetaWebhookChallenge('poll', WA_VERIFY_TOKEN, 'test_challenge_123');
    ctx.assert(!wrongMode.valid && wrongMode.status === 403, 'Meta Webhook Challenge: Rejects unexpected hub.mode with 403');

    const wrongToken = verifyMetaWebhookChallenge('subscribe', 'invalid_token_999', 'test_challenge_123');
    ctx.assert(!wrongToken.valid && wrongToken.status === 403, 'Meta Webhook Challenge: Rejects mismatched verify token with 403');

    const missingChallenge = verifyMetaWebhookChallenge('subscribe', WA_VERIFY_TOKEN, null);
    ctx.assert(!missingChallenge.valid && missingChallenge.status === 400, 'Meta Webhook Challenge: Rejects missing hub.challenge with 400');

    const validChallenge = verifyMetaWebhookChallenge('subscribe', WA_VERIFY_TOKEN, 'challenge_echo_9988');
    ctx.assert(
      validChallenge.valid && validChallenge.challenge === 'challenge_echo_9988' && validChallenge.status === 200,
      'Meta Webhook Challenge: Accepts valid subscription and echoes challenge'
    );
  }

  // 2. Meta Webhook HMAC-SHA256 Signature Verification
  {
    const rawPayload = JSON.stringify({
      object: 'whatsapp_business_account',
      entry: [{ id: 'waba_12345', changes: [] }],
    });

    const expectedHash = crypto
      .createHmac('sha256', META_APP_SECRET)
      .update(rawPayload, 'utf8')
      .digest('hex');
    const validHeader = `sha256=${expectedHash}`;

    const missingHeader = verifyMetaSignature(rawPayload, null, META_APP_SECRET);
    ctx.assert(!missingHeader.valid && missingHeader.status === 401, 'Meta Signature: Rejects missing signature header with 401');

    const malformedHeader = verifyMetaSignature(rawPayload, expectedHash, META_APP_SECRET);
    ctx.assert(!malformedHeader.valid && malformedHeader.status === 401, 'Meta Signature: Rejects header without sha256= prefix with 401');

    const forgedSignature = verifyMetaSignature(rawPayload, 'sha256=deadbeefcafebabe000000000000000000000000000000000000000000000000', META_APP_SECRET);
    ctx.assert(!forgedSignature.valid && forgedSignature.status === 401, 'Meta Signature: Rejects forged/mismatched signature with 401');

    const validSigResult = verifyMetaSignature(rawPayload, validHeader, META_APP_SECRET);
    ctx.assert(validSigResult.valid && validSigResult.status === 200, 'Meta Signature: Authenticates legitimate HMAC-SHA256 signature');

    // Tampered body test
    const tamperedPayload = rawPayload + ' ';
    const tamperedSigResult = verifyMetaSignature(tamperedPayload, validHeader, META_APP_SECRET);
    ctx.assert(!tamperedSigResult.valid, 'Meta Signature: Detects tampering even on single-byte alteration');
  }

  // 3. Webhook Replay Detection (Idempotency Cache)
  {
    const eventId = `meta_evt_${Date.now()}_unique`;
    const firstArrival = isDuplicateEvent(eventId);
    ctx.assert(!firstArrival, 'Meta Replay Guard: First event arrival recognized as non-duplicate');

    const secondArrival = isDuplicateEvent(eventId);
    ctx.assert(secondArrival, 'Meta Replay Guard: Immediate second arrival recognized as duplicate replay');
  }

  // 4. Razorpay Webhook HMAC-SHA256 Signature Verification
  {
    const paymentBody = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_998877', amount: 279900 } } },
    });

    const validSig = crypto
      .createHmac('sha256', RAZORPAY_SECRET)
      .update(paymentBody, 'utf8')
      .digest('hex');

    const missingSig = verifyRazorpayWebhookSignature(paymentBody, null, RAZORPAY_SECRET);
    ctx.assert(!missingSig.valid && missingSig.status === 401, 'Razorpay Webhook: Rejects missing signature header with 401');

    const forgedSig = verifyRazorpayWebhookSignature(paymentBody, 'forged_hex_signature_123', RAZORPAY_SECRET);
    ctx.assert(!forgedSig.valid && forgedSig.status === 401, 'Razorpay Webhook: Rejects forged signature with 401');

    const verifiedSig = verifyRazorpayWebhookSignature(paymentBody, validSig, RAZORPAY_SECRET);
    ctx.assert(verifiedSig.valid && verifiedSig.status === 200, 'Razorpay Webhook: Authenticates genuine webhook signature');
  }

  // 5. Order HMAC Integrity Verification
  {
    const orderId = 'order_20261115_001';
    const workspaceId = 'ws_f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const tier = 'GROWTH';
    const amount = 3303;
    const cycle = 'monthly';

    const orderToken = generateOrderToken(orderId, workspaceId, tier, amount, cycle);
    const validVerification = verifyOrderToken(orderToken, orderId, workspaceId, tier, amount, cycle);
    ctx.assert(validVerification, 'Order HMAC: Validates authentic billing order token');

    const tamperedAmount = verifyOrderToken(orderToken, orderId, workspaceId, tier, 100, cycle);
    ctx.assert(!tamperedAmount, 'Order HMAC: Detects amount tampering in billing order token');
  }

  // 6. SSRF Protection & URL Validation
  {
    // Scheme restriction
    const ftpCheck = validateUrlForSSRF('ftp://example.com/asset.jpg');
    ctx.assert(!ftpCheck.valid, 'SSRF Guard: Prohibits non-HTTP/HTTPS schemes (ftp://)');

    const fileCheck = validateUrlForSSRF('file:///etc/passwd');
    ctx.assert(!fileCheck.valid, 'SSRF Guard: Prohibits file:// scheme');

    // Embedded credentials
    const authCheck = validateUrlForSSRF('https://admin:secret@malicious.com/api');
    ctx.assert(!authCheck.valid, 'SSRF Guard: Prohibits embedded credentials (user:pass)');

    // Non-standard ports
    const portCheck = validateUrlForSSRF('https://sharmaheritage.in:8080/path');
    ctx.assert(!portCheck.valid, 'SSRF Guard: Prohibits non-standard ports (:8080)');

    // Hostname checks
    const localhostCheck = validateUrlForSSRF('http://localhost/admin');
    ctx.assert(!localhostCheck.valid, 'SSRF Guard: Prohibits localhost hostname');

    const metadataCheck = validateUrlForSSRF('http://169.254.169.254/latest/meta-data/');
    ctx.assert(!metadataCheck.valid, 'SSRF Guard: Prohibits AWS/GCP cloud metadata IP (169.254.169.254)');

    const internalCheck = validateUrlForSSRF('http://metadata.google.internal/computeMetadata/v1/');
    ctx.assert(!internalCheck.valid, 'SSRF Guard: Prohibits internal metadata hostnames');

    // Valid public URL
    const validUrlCheck = validateUrlForSSRF('https://sharmaheritage.in/festive-collection');
    ctx.assert(validUrlCheck.valid, 'SSRF Guard: Accepts legitimate public HTTPS URL');
  }

  // 7. IP Literals & Private Subnet Evaluation
  {
    ctx.assert(isPrivateOrRestrictedIPv4('127.0.0.1'), 'IP Guard: Identifies 127.0.0.1 as loopback');
    ctx.assert(isPrivateOrRestrictedIPv4('10.0.0.1'), 'IP Guard: Identifies 10.0.0.0/8 as private');
    ctx.assert(isPrivateOrRestrictedIPv4('192.168.1.100'), 'IP Guard: Identifies 192.168.0.0/16 as private');
    ctx.assert(isPrivateOrRestrictedIPv4('172.16.0.5'), 'IP Guard: Identifies 172.16.0.0/12 as private');
    ctx.assert(isPrivateOrRestrictedIPv4('169.254.169.254'), 'IP Guard: Identifies 169.254.0.0/16 as link-local metadata');
    ctx.assert(!isPrivateOrRestrictedIPv4('8.8.8.8'), 'IP Guard: Identifies 8.8.8.8 as public');
    ctx.assert(!isPrivateOrRestrictedIPv4('1.1.1.1'), 'IP Guard: Identifies 1.1.1.1 as public');

    // IPv6
    ctx.assert(isPrivateOrRestrictedIPv6('::1'), 'IP Guard: Identifies ::1 as IPv6 loopback');
    ctx.assert(isPrivateOrRestrictedIPv6('fc00::1'), 'IP Guard: Identifies fc00::/7 as unique local IPv6');
    ctx.assert(isPrivateOrRestrictedIPv6('fe80::1'), 'IP Guard: Identifies fe80::/10 as link-local IPv6');
    ctx.assert(isPrivateOrRestrictedIPv6('::ffff:127.0.0.1'), 'IP Guard: Identifies IPv4-mapped loopback in IPv6');
    ctx.assert(!isPrivateOrRestrictedIPv6('2606:4700:4700::1111'), 'IP Guard: Identifies public Cloudflare IPv6 as allowed');
  }

  return ctx;
}

if (process.argv[1]?.includes('security.test.ts')) {
  runSecurityUnitTests()
    .then((c) => {
      console.log(`\nSecurity Unit Tests Complete: ${c.passed} passed, ${c.failed} failed.`);
      process.exit(c.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Fatal in Security Unit Tests:', err);
      process.exit(1);
    });
}
