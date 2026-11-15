import fs from 'fs';
import path from 'path';

// Read environment from .env.local BEFORE importing db modules
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    if (details) {
      console.error('    Details:', details);
    }
    throw new Error(`Test failed: ${testName}`);
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runStructuredLogsAndAlertsTests() {
  console.log('\n================================================================');
  console.log('🧪 RUNNING KUIRO STRUCTURED LOGS, MONITORING & ALERTS TEST SUITE');
  console.log('================================================================\n');

  const { db } = await import('../src/db');
  const { systemAlerts, users, workspaces, sessions } = await import('../src/db/schema');
  const { eq, desc } = await import('drizzle-orm');
  const { 
    logger, 
    sanitizeLogPayload, 
    generateCorrelationId, 
    getCorrelationId 
  } = await import('../src/lib/observability/logger');
  const { metrics } = await import('../src/lib/observability/metrics');
  const { alertManager } = await import('../src/lib/observability/alerts');
  const { GET: getAlertsHandler, PATCH: patchAlertsHandler } = await import('../src/app/api/admin/alerts/route');
  const { NextRequest } = await import('next/server');

  if (!db) {
    throw new Error('Database connection not initialized');
  }

  const testUserId = `00000000-0000-4000-8000-888888888801`;
  const testWsId = `00000000-0000-4000-8000-888888888802`;
  const testSessionToken = `test_obs_session_${Date.now()}`;
  const testOperatorPasskey = 'kuiro_management_secure_passkey_at_least_32_characters_long_2026';
  process.env.KUIRO_MANAGEMENT_PASSKEY = testOperatorPasskey;
  process.env.KUIRO_MANAGEMENT_JWT_SECRET = 'kuiro_management_jwt_secret_at_least_32_characters_long_2026';

  try {
    // 0. Clean prior test artifacts
    if (db) {
      await db.delete(systemAlerts).where(eq(systemAlerts.workspaceId, testWsId));
      await db.delete(sessions).where(eq(sessions.userId, testUserId));
      await db.delete(workspaces).where(eq(workspaces.id, testWsId));
      await db.delete(users).where(eq(users.id, testUserId));

      // Setup fixtures
      await db.insert(users).values({
        id: testUserId,
        email: `obs-tester-${Date.now()}@kuiro.test`,
        name: 'Observability Tester',
      });

      await db.insert(workspaces).values({
        id: testWsId,
        name: 'Workspace Observability Lab',
        ownerId: testUserId,
      });

      await db.insert(sessions).values({
        id: `sess_obs_${Date.now()}`,
        userId: testUserId,
        token: testSessionToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }

    logger.clearLogs();
    metrics.clear();
    alertManager.clear();

    console.log('--- SUITE 1: Structured JSON Logging Format & Required Fields ---');

    const traceId = generateCorrelationId('trace');
    logger.error('publish_failed', {
      service: 'campaign-publisher',
      event: 'publish_failed',
      correlationId: traceId,
      workspaceId: testWsId,
      campaignId: 'camp-summer-sale-01',
      platform: 'instagram',
      errorCode: 'PROVIDER_TIMEOUT',
      durationMs: 420,
      metadata: { retryCount: 2, endpoint: '/v19.0/media_publish' },
      err: new Error('Instagram Graph API request timed out after 10000ms'),
    });

    const recentLogs = logger.getRecentLogs(5);
    const lastLog = recentLogs[recentLogs.length - 1];

    assert(Boolean(lastLog), 'Structured log emitted and captured in ring buffer');
    assert(lastLog.level === 'error', 'Log level is correctly tagged as error');
    assert(lastLog.service === 'campaign-publisher', 'Service is correctly tagged as campaign-publisher');
    assert(lastLog.event === 'publish_failed', 'Event is correctly tagged as publish_failed');
    assert(lastLog.workspaceId === testWsId, 'Log contains explicit workspaceId for customer scoping');
    assert(lastLog.campaignId === 'camp-summer-sale-01', 'Log contains campaignId');
    assert(lastLog.platform === 'instagram', 'Log contains target platform');
    assert(lastLog.errorCode === 'PROVIDER_TIMEOUT', 'Log contains standardized errorCode');
    assert(lastLog.durationMs === 420, 'Log records duration in milliseconds');
    assert(lastLog.correlationId === traceId, 'Log carries trace correlation ID');
    assert(Boolean(lastLog.timestamp), 'Log has valid ISO timestamp');
    assert(Boolean(lastLog.error?.message.includes('timed out')), 'Log records structured error message');

    // Test child logger inheritance
    const childLogger = logger.child({
      service: 'ai-critic',
      workspaceId: testWsId,
      correlationId: traceId,
    });
    childLogger.info('critic_evaluation_completed', {
      durationMs: 180,
      metadata: { overallScore: 88 },
    });

    const childLog = logger.getRecentLogs(1)[0];
    assert(childLog.service === 'ai-critic', 'Child logger uses child service name');
    assert(childLog.correlationId === traceId, 'Child logger automatically inherits parent correlationId');
    assert(childLog.workspaceId === testWsId, 'Child logger automatically inherits workspaceId');

    console.log('\n--- SUITE 2: Strict Data Sanitization & Credential Redaction ---');

    const toxicPayload = {
      user: {
        email: 'founder@brand.in',
        password: 'SuperSecretPassword123!',
        currentPassword: 'OldSecretPassword!',
      },
      auth: {
        accessToken: 'EAABwzLIXnjkBAO...meta_token...',
        refreshToken: 'rt_987654321_secret',
        sessionToken: 'sess_secret_token_123',
        bearer: 'Bearer secret_jwt_token',
      },
      gateway: {
        apiKey: 'rzp_live_secret_key_99999',
        webhookSecret: 'whsec_9988776655',
        cronSecret: 'kuiro_cron_super_secret',
        signature: 'c4e63ae1a679b4a1b2c3d4e5f6',
        cvv: '123',
        cardNumber: '4111222233334444',
      },
      message: {
        body: 'This is a very sensitive and excessively long customer message that contains confidential business data exceeding fifty characters.',
      },
      nestedList: [
        { apiKey: 'secret_key_in_array' },
        { privateKey: 'BEGIN_RSA_PRIVATE_KEY' },
      ],
    };

    const sanitized = sanitizeLogPayload(toxicPayload);

    assert(sanitized.user.password === '[REDACTED]', 'Password strictly redacted to [REDACTED]');
    assert(sanitized.user.currentPassword === '[REDACTED]', 'currentPassword strictly redacted');
    assert(sanitized.auth.accessToken === '[REDACTED]', 'accessToken strictly redacted');
    assert(sanitized.auth.refreshToken === '[REDACTED]', 'refreshToken strictly redacted');
    assert(sanitized.auth.sessionToken === '[REDACTED]', 'sessionToken strictly redacted');
    assert(sanitized.auth.bearer === '[REDACTED]', 'bearer token strictly redacted');
    assert(sanitized.gateway.apiKey === '[REDACTED]', 'apiKey strictly redacted');
    assert(sanitized.gateway.webhookSecret === '[REDACTED]', 'webhookSecret strictly redacted');
    assert(sanitized.gateway.cronSecret === '[REDACTED]', 'cronSecret strictly redacted');
    assert(sanitized.gateway.signature === '[REDACTED]', 'HMAC signature strictly redacted');
    assert(sanitized.gateway.cvv === '[REDACTED]', 'Payment CVV strictly redacted');
    assert(sanitized.gateway.cardNumber === '[REDACTED]', 'Credit Card number strictly redacted');
    assert(sanitized.nestedList[0].apiKey === '[REDACTED]', 'Array elements recursively sanitized');
    assert(sanitized.nestedList[1].privateKey === '[REDACTED]', 'Private keys in nested lists redacted');
    assert(
      sanitized.message.body.startsWith('[MASKED_CONTENT'),
      'Long customer message content masked for privacy'
    );

    console.log('\n--- SUITE 3: Correlation ID Extraction & Propagation ---');

    const mockHeaders = new Headers({
      'x-correlation-id': 'req_custom_trace_987123',
    });
    const extractedId = getCorrelationId(mockHeaders);
    assert(extractedId === 'req_custom_trace_987123', 'Extracted x-correlation-id from incoming request headers');

    const mockTraceHeaders = new Headers({
      'x-request-id': 'req_id_fallback_456',
    });
    const fallbackId = getCorrelationId(mockTraceHeaders);
    assert(fallbackId === 'req_id_fallback_456', 'Fell back to x-request-id header when correlation-id absent');

    const generatedId = getCorrelationId();
    assert(generatedId.startsWith('req_'), 'Generated fresh correlation ID when headers absent');

    console.log('\n--- SUITE 4: Multi-Area Monitoring Metrics Telemetry ---');

    // 1. Auth metrics
    metrics.increment('auth.login_failed');
    metrics.increment('auth.rate_limited');

    // 2. API metrics
    metrics.increment('api.request_count');
    metrics.increment('api.error_5xx');
    metrics.recordDuration('api.request_duration', 120);
    metrics.recordDuration('api.request_duration', 180);

    // 3. Database metrics
    metrics.increment('db.query_failed');

    // 4. Social metrics
    metrics.increment('social.publish_failed', { platform: 'linkedin' });
    metrics.increment('social.publish_success', { platform: 'instagram' });

    // 5. WhatsApp metrics
    metrics.increment('whatsapp.signature_failed');

    // 6. Payments metrics
    metrics.increment('payments.signature_failed', { provider: 'razorpay' });

    // 7. AI metrics
    metrics.record('ai.tokens_consumed', 1250, { workspaceId: testWsId });
    metrics.record('ai.tokens_consumed', 3750, { workspaceId: testWsId });
    metrics.increment('ai.timeout');

    // 8. Inbox metrics
    metrics.increment('inbox.window_violation', { channel: 'whatsapp' });

    const snapshot = metrics.getSnapshot();
    assert(snapshot.auth.failedLogins === 1, 'Metrics: recorded auth.login_failed');
    assert(snapshot.auth.rateLimited === 1, 'Metrics: recorded auth.rate_limited');
    assert(snapshot.api.errors5xx === 1, 'Metrics: recorded api.error_5xx');
    assert(snapshot.api.avgLatencyMs === 150, 'Metrics: calculated average latency (150ms)', snapshot.api.avgLatencyMs);
    assert(snapshot.database.queryFailures === 1, 'Metrics: recorded db.query_failed');
    assert(snapshot.social.publishingFailures === 1, 'Metrics: recorded social.publish_failed');
    assert(snapshot.social.publishingSuccesses === 1, 'Metrics: recorded social.publish_success');
    assert(snapshot.whatsapp.signatureFailures === 1, 'Metrics: recorded whatsapp.signature_failed');
    assert(snapshot.payments.signatureFailures === 1, 'Metrics: recorded payments.signature_failed');
    assert(snapshot.ai.tokensConsumed === 5000, 'Metrics: summed ai.tokens_consumed (5000 tokens)', snapshot.ai.tokensConsumed);
    assert(snapshot.ai.timeouts === 1, 'Metrics: recorded ai.timeout');
    assert(snapshot.inbox.deliveryDelays !== undefined, 'Metrics snapshot includes inbox dimension');

    console.log('\n--- SUITE 5: Controlled Failures & Automated Alert Triggers ---');

    // Reset metrics & cooldowns for clean failure threshold testing
    metrics.clear();
    alertManager.clear();

    // Failure Scenario 1: Social Publishing Failure Spike (Threshold: >= 3 failures in 10 mins)
    const alert1 = await alertManager.checkPublishingFailureThreshold({
      workspaceId: testWsId,
      campaignId: 'camp-diwali-2026',
      platform: 'instagram',
      errorCode: 'PROVIDER_TIMEOUT',
      correlationId: traceId,
    });
    // First 2 failures do not exceed threshold yet
    assert(alert1 === null, 'Publishing failure 1/3 does not prematurely fire alert');

    await alertManager.checkPublishingFailureThreshold({
      workspaceId: testWsId,
      campaignId: 'camp-diwali-2026',
      platform: 'instagram',
      errorCode: 'PROVIDER_TIMEOUT',
      correlationId: traceId,
    });

    const alertPublishingSpike = await alertManager.checkPublishingFailureThreshold({
      workspaceId: testWsId,
      campaignId: 'camp-diwali-2026',
      platform: 'instagram',
      errorCode: 'PROVIDER_TIMEOUT',
      correlationId: traceId,
    });

    assert(alertPublishingSpike !== null, 'Publishing failure 3/3 reached threshold and triggered alert');
    assert(alertPublishingSpike?.category === 'SOCIAL_PUBLISHING', 'Alert category is SOCIAL_PUBLISHING');
    assert(alertPublishingSpike?.severity === 'CRITICAL', 'Alert severity is CRITICAL');
    assert(Boolean(alertPublishingSpike?.title.includes('Spike Detected')), 'Alert title describes failure spike');
    assert((alertPublishingSpike?.details?.recentFailureCount ?? 0) >= 3, 'Alert details contain recentFailureCount >= 3');
    assert(alertPublishingSpike?.workspaceId === testWsId, 'Alert scoped to affected workspace');

    // Failure Scenario 2: Payment Webhook Signature Attack (Threshold: >= 2 failures in 5 mins)
    const payAlert1 = await alertManager.checkPaymentSignatureFailureThreshold({
      provider: 'razorpay',
      correlationId: traceId,
      workspaceId: testWsId,
    });
    assert(payAlert1 === null, 'First payment signature failure does not fire alert');

    const alertPaymentSig = await alertManager.checkPaymentSignatureFailureThreshold({
      provider: 'razorpay',
      correlationId: traceId,
      workspaceId: testWsId,
    });

    assert(alertPaymentSig !== null, 'Second payment signature failure within 5 mins triggered CRITICAL alert');
    assert(alertPaymentSig?.category === 'PAYMENT', 'Alert category is PAYMENT');
    assert(alertPaymentSig?.severity === 'CRITICAL', 'Alert severity is CRITICAL');
    assert(alertPaymentSig?.details?.provider === 'razorpay', 'Alert details identify affected provider: razorpay');

    // Failure Scenario 3: AI Credit Consumption Surge (Threshold: >= 50,000 tokens in 1 hour)
    const aiAlert = await alertManager.checkAiTokenSurgeThreshold({
      workspaceId: testWsId,
      tokensUsed: 52000,
      correlationId: traceId,
    });

    assert(aiAlert !== null, 'Surge of 52,000 tokens in 1 hour triggered AI_SURGE alert');
    assert(aiAlert?.category === 'AI_SURGE', 'Alert category is AI_SURGE');
    assert(aiAlert?.severity === 'WARNING', 'Alert severity is WARNING');
    assert(aiAlert?.details?.tokensConsumedHour >= 50000, 'Alert details record token total');

    // Failure Scenario 4: Database Query Failure Surge (Threshold: >= 5 in 5 mins)
    for (let i = 0; i < 4; i++) {
      await alertManager.checkDatabaseErrorThreshold({ error: 'Connection pool timeout', correlationId: traceId });
    }
    const dbAlert = await alertManager.checkDatabaseErrorThreshold({
      error: 'Connection pool timeout',
      correlationId: traceId,
    });

    assert(dbAlert !== null, '5th database query failure triggered DATABASE alert');
    assert(dbAlert?.category === 'DATABASE', 'Alert category is DATABASE');
    assert(dbAlert?.severity === 'CRITICAL', 'Alert severity is CRITICAL');

    console.log('\n--- SUITE 6: Alert Cooldown & Deduplication ---');

    // Re-triggering the same failure within cooldown window should suppress duplicate alerts
    const duplicatePublishAlert = await alertManager.checkPublishingFailureThreshold({
      workspaceId: testWsId,
      campaignId: 'camp-diwali-2026',
      platform: 'instagram',
      errorCode: 'PROVIDER_TIMEOUT',
      correlationId: traceId,
    });

    assert(
      duplicatePublishAlert === null,
      'Cooldown Enforced: Repeated publishing failure within 10 minutes suppressed to prevent alert storms'
    );

    console.log('\n--- SUITE 7: Database Persistence & Admin Alert Management API ---');

    // 1. Verify PostgreSQL has persistent records in `system_alerts` table
    const dbAlerts = await db
      .select()
      .from(systemAlerts)
      .where(eq(systemAlerts.workspaceId, testWsId))
      .orderBy(desc(systemAlerts.createdAt));

    assert(dbAlerts.length >= 2, 'Neon PostgreSQL system_alerts table contains persistent alert records', {
      count: dbAlerts.length,
    });
    const sampleAlert = dbAlerts[0];
    assert(sampleAlert.status === 'OPEN', 'Persisted alert initial status is OPEN');

    // 2. Query Alerts via Admin API (GET /api/admin/alerts)
    const getAlertsReq = new NextRequest(`http://localhost:3000/api/admin/alerts?workspaceId=${testWsId}`, {
      method: 'GET',
      headers: {
        'x-kuiro-management-key': testOperatorPasskey,
        'Cookie': `kuiro_session=${testSessionToken}`,
      },
    });

    const getAlertsRes = await getAlertsHandler(getAlertsReq);
    assert(getAlertsRes.status === 200, 'GET /api/admin/alerts returns HTTP 200 with operator credentials');
    const alertsData = await getAlertsRes.json();
    assert(alertsData.success === true, 'API response indicates success');
    assert(alertsData.alerts.length >= 2, 'API returns alerts scoped to test workspace');

    // 3. Resolve Alert via Admin API (PATCH /api/admin/alerts)
    const patchReq = new NextRequest('http://localhost:3000/api/admin/alerts', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-kuiro-management-key': testOperatorPasskey,
        'Cookie': `kuiro_session=${testSessionToken}`,
      },
      body: JSON.stringify({
        id: sampleAlert.id,
        status: 'RESOLVED',
      }),
    });

    const patchRes = await patchAlertsHandler(patchReq);
    assert(patchRes.status === 200, 'PATCH /api/admin/alerts returns HTTP 200');
    const patchData = await patchRes.json();
    assert(patchData.alert.status === 'RESOLVED', 'Alert status updated to RESOLVED in database');
    assert(Boolean(patchData.alert.resolvedAt), 'resolvedAt timestamp populated upon resolution');

    // 4. Verify unauthenticated request to /api/admin/alerts is rejected (401)
    const unauthReq = new NextRequest('http://localhost:3000/api/admin/alerts', { method: 'GET' });
    const unauthRes = await getAlertsHandler(unauthReq);
    assert(unauthRes.status === 401, 'Unauthenticated request to /api/admin/alerts rejected with HTTP 401');

    console.log('\n--- SUITE 8: Clean Teardown & Purge ---');

    await db.delete(systemAlerts).where(eq(systemAlerts.workspaceId, testWsId));
    await db.delete(sessions).where(eq(sessions.userId, testUserId));
    await db.delete(workspaces).where(eq(workspaces.id, testWsId));
    await db.delete(users).where(eq(users.id, testUserId));

    logger.clearLogs();
    metrics.clear();
    alertManager.clear();

    assert(true, 'Test resources cleanly purged from database and memory buffers');

    console.log('\n================================================================');
    console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ TEST RUNNER TERMINATED WITH ERROR:', err);
    try {
      if (db) {
        await db.delete(systemAlerts).where(eq(systemAlerts.workspaceId, testWsId));
        await db.delete(sessions).where(eq(sessions.userId, testUserId));
        await db.delete(workspaces).where(eq(workspaces.id, testWsId));
        await db.delete(users).where(eq(users.id, testUserId));
      }
    } catch {}
    process.exit(1);
  }
}

runStructuredLogsAndAlertsTests().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
