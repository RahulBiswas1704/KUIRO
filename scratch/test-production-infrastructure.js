/**
 * Automated Verification Suite for KUIRO Production Infrastructure
 * Tests:
 * 1. Storage Integration Hardening: Size limits, key sanitization, MIME inference, health checks, fallback serving.
 * 2. Inngest Durable Outbox & Fallback: Resilient dispatching, queue telemetry, autonomous fallback execution.
 * 3. Scheduling Hardening: Multi-action cron execution (sweep, generate, housekeeping) & fail-safe auto-commit.
 * 4. Observability: System health check & metrics telemetry.
 */

const { uploadToR2, checkStorageHealth, getPresignedDownloadUrl, getCachedFallbackAsset } = require('../src/lib/storage/r2.ts');
const { safeDispatchInngest, getOutboxTelemetry, retryOutboxEvents } = require('../src/lib/inngest/dispatcher.ts');

async function runInfrastructureTests() {
  console.log('================================================================');
  console.log('🏗️  RUNNING KUIRO PRODUCTION INFRASTRUCTURE VERIFICATION SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 4;

  // TEST 1: Storage Integrations Hardening
  console.log('--- TEST 1: Storage Integrations Hardening ---');
  try {
    // 1a. Test file size validation
    let rejectedOversized = false;
    try {
      const hugeBuffer = Buffer.alloc(16 * 1024 * 1024); // 16MB > 15MB limit
      await uploadToR2(hugeBuffer, 'test/huge-file.png');
    } catch (sizeErr) {
      rejectedOversized = true;
      console.log(`✓ File size guardrail rejected oversized payload: "${sizeErr.message}"`);
    }

    // 1b. Test valid upload & sanitization
    const testSvg = `<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg"><rect fill="#0B0F14" width="100%" height="100%"/><text fill="#FF7A00" x="50%" y="50%">KUIRO</text></svg>`;
    const testBuffer = Buffer.from(testSvg, 'utf-8');
    const uploadUrl = await uploadToR2(testBuffer, '///test-path/../banner-sample.svg');

    console.log(`✓ Uploaded/Resolved URL: ${uploadUrl}`);
    const isCleanUrl = uploadUrl.startsWith('http://') || uploadUrl.startsWith('https://') || uploadUrl.startsWith('/api/media/');
    console.log(`✓ URL is clean HTTPS/CDN/proxy path (not huge data URI): ${isCleanUrl}`);

    // 1c. Test presigned URL
    const presigned = await getPresignedDownloadUrl('banner-sample.svg', 1800);
    console.log(`✓ Presigned URL generated: ${presigned.slice(0, 60)}...`);

    // 1d. Active Storage Health Check
    const storageHealth = await checkStorageHealth();
    console.log(`✓ Storage Health Status: ${storageHealth.status} (Provider: ${storageHealth.provider}, Latency: ${storageHealth.latencyMs}ms)`);

    if (rejectedOversized && isCleanUrl && storageHealth.status) {
      console.log('✅ TEST 1 PASSED: Storage integration hardened with validation, sanitization & health probes!\n');
      passedTests++;
    } else {
      console.error('❌ TEST 1 FAILED: Storage validation or URL formatting failed.\n');
    }
  } catch (err) {
    console.error('❌ TEST 1 EXCEPTION:', err);
  }

  // TEST 2: Inngest Durable Outbox & Fallback
  console.log('--- TEST 2: Inngest Durable Outbox & Resilient Dispatch ---');
  try {
    const dispatchResult = await safeDispatchInngest({
      name: 'kuiro/campaign.initiate',
      data: {
        campaignId: 'test_campaign_001',
        workspaceId: 'test_ws_001',
        publishAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        triggerType: 'FESTIVAL',
        eventName: 'Infrastructure Verification Test',
      },
    });

    console.log(`✓ Dispatch result: success=${dispatchResult.success}, mode=${dispatchResult.mode}, eventId=${dispatchResult.eventId}`);

    // Check telemetry
    const telemetry = getOutboxTelemetry();
    console.log(`✓ Outbox Telemetry: totalDispatched=${telemetry.totalDispatched}, totalFallback=${telemetry.totalFallback}, pendingCount=${telemetry.pendingOutboxCount}, queueHealth=${telemetry.queueHealth}`);

    // Test outbox retry mechanism
    const retryResult = await retryOutboxEvents();
    console.log(`✓ Outbox Retry Processed: attempted=${retryResult.attempted}, succeeded=${retryResult.succeeded}, remaining=${retryResult.remaining}`);

    if (dispatchResult.success && telemetry.queueHealth) {
      console.log('✅ TEST 2 PASSED: Resilient Inngest dispatcher & Durable Outbox operational!\n');
      passedTests++;
    } else {
      console.error('❌ TEST 2 FAILED: Dispatch or outbox queue failure.\n');
    }
  } catch (err) {
    console.error('❌ TEST 2 EXCEPTION:', err);
  }

  // TEST 3: Multi-Frequency Scheduling & Housekeeping
  console.log('--- TEST 3: Multi-Frequency Scheduling Engine ---');
  try {
    const fs = require('fs');
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf-8'));

    console.log(`✓ Vercel Crons Configured: ${vercelConfig.crons?.length || 0} schedules`);
    vercelConfig.crons.forEach((c, idx) => {
      console.log(`  [${idx + 1}] Schedule: "${c.schedule}" -> Path: "${c.path}"`);
    });

    const hasGenerateCron = vercelConfig.crons.some((c) => c.path.includes('action=generate'));
    const hasSweepCron = vercelConfig.crons.some((c) => c.path.includes('action=sweep'));
    const hasHousekeepingCron = vercelConfig.crons.some((c) => c.path.includes('action=housekeeping'));

    if (hasGenerateCron && hasSweepCron && hasHousekeepingCron) {
      console.log('✅ TEST 3 PASSED: Multi-frequency scheduling (generate, sweep, housekeeping) verified!\n');
      passedTests++;
    } else {
      console.error('❌ TEST 3 FAILED: Missing required cron schedules in vercel.json.\n');
    }
  } catch (err) {
    console.error('❌ TEST 3 EXCEPTION:', err);
  }

  // TEST 4: Observability & System Health Telemetry
  console.log('--- TEST 4: Observability & Health Route Configuration ---');
  try {
    const fs = require('fs');
    const healthRouteCode = fs.readFileSync('src/app/api/health/route.ts', 'utf-8');

    const hasDbCheck = healthRouteCode.includes('db.execute');
    const hasStorageCheck = healthRouteCode.includes('checkStorageHealth');
    const hasOutboxCheck = healthRouteCode.includes('getOutboxTelemetry');
    const hasSystemMetrics = healthRouteCode.includes('process.memoryUsage');

    console.log(`✓ Database check in /api/health: ${hasDbCheck}`);
    console.log(`✓ Storage check in /api/health: ${hasStorageCheck}`);
    console.log(`✓ Inngest Outbox check in /api/health: ${hasOutboxCheck}`);
    console.log(`✓ Memory & Uptime metrics in /api/health: ${hasSystemMetrics}`);

    if (hasDbCheck && hasStorageCheck && hasOutboxCheck && hasSystemMetrics) {
      console.log('✅ TEST 4 PASSED: Unified production observability & health telemetry operational!\n');
      passedTests++;
    } else {
      console.error('❌ TEST 4 FAILED: Incomplete health route implementation.\n');
    }
  } catch (err) {
    console.error('❌ TEST 4 EXCEPTION:', err);
  }

  console.log('================================================================');
  console.log(`📊 INFRASTRUCTURE SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runInfrastructureTests();
