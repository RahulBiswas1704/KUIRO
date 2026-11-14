// Automated Meta WhatsApp Webhook Security Verification Suite
// Tests Initial GET verification challenge, X-Hub-Signature-256 HMAC validation,
// tampering detection, duplicate event idempotency, and payload validation.

const crypto = require('crypto');

const BASE_URL = 'http://localhost:3000';
const VERIFY_TOKEN = 'kuiro_wa_verify_token_secure_123';
const APP_SECRET = 'kuiro_meta_app_secret_test_32chars';

function computeSignature(payloadString, secret = APP_SECRET) {
  const hash = crypto.createHmac('sha256', secret).update(payloadString, 'utf8').digest('hex');
  return `sha256=${hash}`;
}

async function runTests() {
  console.log('=== KUIRO Meta Webhook Security Verification ===\n');
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

  // -------------------------------------------------------------
  // Part A: Initial GET Verification Challenge
  // -------------------------------------------------------------
  console.log('--- Part A: Initial GET Verification Challenge ---');

  // Test 1: Valid GET verification challenge
  const challengeCode = 'test_challenge_code_987654321';
  const getUrl1 = `${BASE_URL}/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=${challengeCode}`;
  const getRes1 = await fetch(getUrl1);
  const getText1 = await getRes1.text();
  assert(getRes1.status === 200, 'Valid verification returns HTTP 200');
  assert(getText1 === challengeCode, `Returns exact plain text challenge: "${challengeCode}"`);

  // Test 2: Invalid verify_token
  const getUrl2 = `${BASE_URL}/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong_token_123&hub.challenge=${challengeCode}`;
  const getRes2 = await fetch(getUrl2);
  assert(getRes2.status === 403, 'Invalid verify_token rejected with HTTP 403 Forbidden');

  // Test 3: Invalid hub.mode
  const getUrl3 = `${BASE_URL}/api/webhooks/whatsapp?hub.mode=publish&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=${challengeCode}`;
  const getRes3 = await fetch(getUrl3);
  assert(getRes3.status === 403, 'Invalid hub.mode rejected with HTTP 403 Forbidden');

  // Test 4: Missing required parameters
  const getUrl4 = `${BASE_URL}/api/webhooks/whatsapp`;
  const getRes4 = await fetch(getUrl4);
  assert(getRes4.status === 400, 'Missing hub parameters rejected with HTTP 400 Bad Request');

  // -------------------------------------------------------------
  // Part B: Event Signature Verification (POST)
  // -------------------------------------------------------------
  console.log('\n--- Part B: Event Signature Verification (POST) ---');

  const baseSamplePayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '1528322460354543',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '16505551111',
                phone_number_id: '1528322460354543',
              },
              contacts: [
                {
                  profile: { name: 'Dr. Rahul Sharma' },
                  wa_id: '919876543210',
                },
              ],
              messages: [
                {
                  from: '919876543210',
                  id: `wamid.TEST_${Date.now()}_A`,
                  timestamp: String(Math.floor(Date.now() / 1000)),
                  text: { body: 'Hello, need information on pricing' },
                  type: 'text',
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };

  // Helper to POST to webhook
  async function postWebhook(rawString, customHeaders = {}) {
    const res = await fetch(`${BASE_URL}/api/webhooks/whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders,
      },
      body: rawString,
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
  }

  // Test 5: Valid Meta Signature
  const rawPayload5 = JSON.stringify(baseSamplePayload);
  const validSig5 = computeSignature(rawPayload5);
  const postRes5 = await postWebhook(rawPayload5, { 'X-Hub-Signature-256': validSig5 });
  assert(postRes5.status === 200, 'Valid Meta HMAC-SHA256 signature accepted with HTTP 200');

  // Test 6: Missing signature header
  const postRes6 = await postWebhook(rawPayload5, {});
  assert(postRes6.status === 401, 'Missing X-Hub-Signature-256 rejected with HTTP 401');

  // Test 7: Invalid signature (wrong HMAC)
  const postRes7 = await postWebhook(rawPayload5, {
    'X-Hub-Signature-256': 'sha256=0000000000000000000000000000000000000000000000000000000000000000',
  });
  assert(postRes7.status === 401, 'Invalid signature rejected with HTTP 401');

  // Test 8: Malformed signature header (missing sha256= prefix)
  const postRes8 = await postWebhook(rawPayload5, {
    'X-Hub-Signature-256': 'md5=invalidprefixhere',
  });
  assert(postRes8.status === 401, 'Malformed signature header rejected with HTTP 401');

  // Test 9: Tampered / Modified Request Body
  // Attacker calculates signature for payload A, but transmits modified payload B
  const payloadA = JSON.stringify(baseSamplePayload);
  const signatureForA = computeSignature(payloadA);
  const modifiedPayloadB = JSON.stringify({
    ...baseSamplePayload,
    entry: [
      {
        ...baseSamplePayload.entry[0],
        changes: [
          {
            value: {
              ...baseSamplePayload.entry[0].changes[0].value,
              messages: [{ from: '919876543210', text: { body: 'Hacked payload modification' }, type: 'text' }],
            },
          },
        ],
      },
    ],
  });
  const postRes9 = await postWebhook(modifiedPayloadB, { 'X-Hub-Signature-256': signatureForA });
  assert(postRes9.status === 401, 'Modified request body detected and rejected with HTTP 401');

  // Test 10: Invalid JSON payload with valid signature
  const rawInvalidJson = '{"broken_json: true,';
  const sigInvalidJson = computeSignature(rawInvalidJson);
  const postRes10 = await postWebhook(rawInvalidJson, { 'X-Hub-Signature-256': sigInvalidJson });
  assert(postRes10.status === 400 && postRes10.body.error === 'Invalid JSON payload', 'Invalid JSON rejected with HTTP 400');

  // Test 11: Invalid webhook object (non-whatsapp)
  const invalidObjectPayload = JSON.stringify({
    object: 'page',
    entry: [],
  });
  const sigInvalidObject = computeSignature(invalidObjectPayload);
  const postRes11 = await postWebhook(invalidObjectPayload, { 'X-Hub-Signature-256': sigInvalidObject });
  assert(postRes11.status === 400 && postRes11.body.error.includes('whatsapp_business_account'), 'Non-whatsapp object rejected with HTTP 400');

  // -------------------------------------------------------------
  // Part C: Duplicate Event Idempotency
  // -------------------------------------------------------------
  console.log('\n--- Part C: Duplicate Event Idempotency ---');

  const fixedEventId = `wamid.IDEMPOTENCY_${Date.now()}`;
  const idempotencyPayload = {
    ...baseSamplePayload,
    entry: [
      {
        ...baseSamplePayload.entry[0],
        changes: [
          {
            value: {
              ...baseSamplePayload.entry[0].changes[0].value,
              messages: [
                {
                  from: '919876543210',
                  id: fixedEventId,
                  timestamp: String(Math.floor(Date.now() / 1000)),
                  text: { body: 'First delivery of message' },
                  type: 'text',
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };

  const rawIdempotent = JSON.stringify(idempotencyPayload);
  const sigIdempotent = computeSignature(rawIdempotent);

  // First delivery: should process normally
  const postRes12a = await postWebhook(rawIdempotent, { 'X-Hub-Signature-256': sigIdempotent });
  assert(postRes12a.status === 200, 'Initial delivery of event processed with HTTP 200');

  // Second delivery (duplicate event retry): should be acknowledged without duplicate execution
  const postRes12b = await postWebhook(rawIdempotent, { 'X-Hub-Signature-256': sigIdempotent });
  assert(
    postRes12b.status === 200 && postRes12b.body.status === 'acknowledged' && postRes12b.body.duplicate === true,
    'Duplicate event acknowledged with HTTP 200 duplicate=true without re-processing'
  );

  // Test 13: Status update receipts (ignored_receipt)
  const statusReceiptPayload = JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '1528322460354543',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: { phone_number_id: '1528322460354543' },
              statuses: [{ id: 'wamid.STATUS_123', status: 'delivered', recipient_id: '919876543210' }],
            },
            field: 'messages',
          },
        ],
      },
    ],
  });
  const sigStatusReceipt = computeSignature(statusReceiptPayload);
  const postRes13 = await postWebhook(statusReceiptPayload, { 'X-Hub-Signature-256': sigStatusReceipt });
  assert(postRes13.status === 200 && postRes13.body.status === 'ignored_receipt', 'Status receipt handled safely with HTTP 200 ignored_receipt');

  console.log(`\n=============================================`);
  console.log(`Meta Webhook Verification: ${passed}/${total} checks PASSED! 🛡️`);
  console.log(`=============================================\n`);
}

runTests().catch((err) => {
  console.error('\n❌ Suite execution failed:', err);
  process.exit(1);
});
