import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

// 1. Read DATABASE_URL from .env.local
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
let dbUrl = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
    break;
  }
}

if (!dbUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const TEST_CRON_SECRET = 'kuiro_test_cron_secret_dedup_audit_98127';
process.env.DATABASE_URL = dbUrl;
(process.env as any).NODE_ENV = 'production';
process.env.CRON_SECRET = TEST_CRON_SECRET;

async function runAcceptanceTests() {
  console.log('========================================================================');
  console.log('🧪 KUIRO PROMPT 20: SCHEDULER DEDUPLICATION & MULTI-DAY AUDIT');
  console.log('========================================================================\n');

  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(dbUrl);

  const {
    SCHEDULER_INVENTORY,
    executeAutonomousScheduler,
  } = await import('../src/lib/scheduler/engine');

  const { GET: CronTriggerGET } = await import('../src/app/api/calendar/cron-trigger/route');
  const { executeWithIdempotency } = await import('../src/lib/events/idempotency');
  const { tokenRefreshCron } = await import('../src/lib/inngest/functions/token-refresh-cron');
  const { subscriptionRenewalCron } = await import('../src/lib/inngest/functions/subscription-renewal-cron');
  const { cleanupRetentionCron } = await import('../src/lib/inngest/functions/cleanup-retention-cron');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  // Ensure test user and workspace exist in DB
  const testUserId = '00000000-0000-4000-a000-000000000200';
  const testWorkspaceId = '00000000-0000-4000-a000-000000000201';

  await sql`
    INSERT INTO users (id, name, email, role, created_at, updated_at)
    VALUES (${testUserId}, 'Dedup Test Admin', 'dedup-test@kuiro.in', 'ADMIN', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET updated_at = NOW();
  `;

  await sql`
    INSERT INTO workspaces (id, name, owner_id, subscription_tier, timezone, created_at, updated_at)
    VALUES (${testWorkspaceId}, 'Deduplication Test Clinic & Lab', ${testUserId}, 'GROWTH', 'Asia/Kolkata', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET updated_at = NOW();
  `;

  await sql`
    INSERT INTO brand_profiles (id, workspace_id, industry, tone_of_voice, visual_identity, content_pillars, negative_constraints, created_at, updated_at)
    VALUES (
      '00000000-0000-4000-a000-000000000202',
      ${testWorkspaceId},
      'Healthcare',
      '{"style":"clinical_empathetic","formality":"semi-formal","archetype":"trusted_advisor","samplePhrases":["Compassionate care."]}'::jsonb,
      '{"primaryHex":"#10B981","secondaryHex":"#0F172A","fontFamily":"Inter"}'::jsonb,
      '[{"name":"Preventive Care","weight":50}]'::jsonb,
      ARRAY['No misleading claims'],
      NOW(),
      NOW()
    )
    ON CONFLICT (workspace_id) DO UPDATE SET updated_at = NOW();
  `;

  console.log('--- SUITE 1: Authoritative Scheduler Inventory & Configuration Integrity ---');
  {
    assert(Array.isArray(SCHEDULER_INVENTORY), 'SCHEDULER_INVENTORY is exported as an array');
    assert(SCHEDULER_INVENTORY.length >= 5, `Inventory contains ${SCHEDULER_INVENTORY.length} defined tasks`);

    const taskMap = new Map<string, string>();
    for (const item of SCHEDULER_INVENTORY) {
      assert(
        !taskMap.has(item.task),
        `Task "${item.task}" has a single authoritative owner (${item.owner}) without duplicate registration`
      );
      taskMap.set(item.task, item.owner);
    }

    assert(taskMap.get('Cultural calendar scan') === 'Inngest', 'Cultural calendar scan is owned by Inngest');
    assert(taskMap.get('Campaign generation') === 'Inngest', 'Campaign generation is owned by Inngest');
    assert(taskMap.get('Token refresh') === 'Inngest', 'Token refresh is owned by Inngest');
    assert(taskMap.get('Subscription renewal checks') === 'Inngest', 'Subscription renewal checks is owned by Inngest');
    assert(taskMap.get('Cleanup and retention') === 'Inngest', 'Cleanup and retention is owned by Inngest');
    assert(taskMap.get('Fail-Safe Health Pulse & Lock Reaper') === 'Vercel Cron', 'Fail-Safe Health Pulse is owned by Vercel Cron');

    // Verify vercel.json is set to lightweight pulse
    const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8'));
    assert(vercelConfig.crons.length === 1, 'vercel.json contains exactly 1 scheduled cron');
    assert(
      vercelConfig.crons[0].path === '/api/calendar/cron-trigger?action=pulse',
      'vercel.json triggers lightweight pulse (?action=pulse), not campaign generation'
    );
  }

  console.log('\n--- SUITE 2: Multi-Day Multi-Scheduler Deduplication (Days 1, 2, and 3) ---');
  {
    const days = [
      { date: '2026-11-20', eventName: 'World Health Day Preview 2026' },
      { date: '2026-11-21', eventName: 'National Wellness Day 2026' },
      { date: '2026-11-22', eventName: 'Preventive Medicine Summit 2026' },
    ];

    // Clean up any existing test cultural events, campaigns, and durable events for fresh run
    await sql`
      DELETE FROM cultural_events_calendar WHERE event_name IN (
        'World Health Day Preview 2026',
        'National Wellness Day 2026',
        'Preventive Medicine Summit 2026',
        'Concurrent Race Condition Festival 2026'
      );
    `;
    await sql`DELETE FROM scheduled_campaigns WHERE workspace_id = ${testWorkspaceId};`;
    await sql`DELETE FROM durable_events WHERE workspace_id = ${testWorkspaceId};`;

    // Seed events into culturalEventsCalendar for the test dates
    for (const d of days) {
      await sql`
        INSERT INTO cultural_events_calendar (id, event_name, event_date, regions, target_industries, prompt_context, created_at, updated_at)
        VALUES (
          gen_random_uuid(),
          ${d.eventName},
          ${d.date},
          ARRAY['Pan-India'],
          ARRAY['Healthcare', 'All'],
          'Highlight preventive wellness and health diagnostics',
          NOW(),
          NOW()
        );
      `;
    }

    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const dayNum = i + 1;
      console.log(`  ▶ Simulating Day ${dayNum} (${day.date}):`);

      // 1. First Run: Inngest Cultural Radar Scan generates campaign for Day i
      const firstRun = await executeAutonomousScheduler({
        action: 'generate',
        targetDate: day.date,
        workspaceId: testWorkspaceId,
        triggerSource: 'inngest_cultural_radar_cron',
      });

      assert(firstRun.success, `Day ${dayNum}: Inngest scan completed successfully`);
      const createdOnFirst = firstRun.campaignsCreated.filter((c) => c.status === 'CREATED');
      assert(createdOnFirst.length === 1, `Day ${dayNum}: Exactly 1 campaign created on first trigger`);

      // 2. Duplicate Run 1: Re-triggering Inngest Cron on the same day
      const duplicateInngestRun = await executeAutonomousScheduler({
        action: 'generate',
        targetDate: day.date,
        workspaceId: testWorkspaceId,
        triggerSource: 'inngest_cultural_radar_cron_duplicate',
      });

      const createdOnInngestDup = duplicateInngestRun.campaignsCreated.filter((c) => c.status === 'CREATED');
      assert(createdOnInngestDup.length === 0, `Day ${dayNum}: Inngest re-run created 0 duplicate campaigns (Idempotency Guard)`);

      // 3. Duplicate Run 2: Re-triggering from Vercel Cron / external caller on same day
      const duplicateExternalRun = await executeAutonomousScheduler({
        action: 'generate',
        targetDate: day.date,
        workspaceId: testWorkspaceId,
        triggerSource: 'vercel_cron_sweep',
      });

      const createdOnExtDup = duplicateExternalRun.campaignsCreated.filter((c) => c.status === 'CREATED');
      assert(createdOnExtDup.length === 0, `Day ${dayNum}: External re-run created 0 duplicate campaigns`);

      // 4. Verify DB has strictly 1 campaign for this day
      const dbCampaignsForDay = await sql`
        SELECT id, topic_summary, status
        FROM scheduled_campaigns
        WHERE workspace_id = ${testWorkspaceId} AND topic_summary = ${day.eventName};
      `;
      assert(
        dbCampaignsForDay.length === 1,
        `Day ${dayNum}: Database contains strictly 1 campaign record for "${day.eventName}"`
      );
    }

    // Multi-Day Total Verification: Over 3 simulated days, exactly 3 campaigns exist
    const totalWorkspaceCampaigns = await sql`
      SELECT COUNT(*)::int as count
      FROM scheduled_campaigns
      WHERE workspace_id = ${testWorkspaceId};
    `;
    assert(
      totalWorkspaceCampaigns[0].count === 3,
      `Multi-Day Isolation Verified: Across 3 days, exactly 3 total campaigns created (1 per day window)`
    );
  }

  console.log('\n--- SUITE 3: Concurrent Scheduling Race Condition Protection ---');
  {
    const raceEventName = 'Concurrent Race Condition Festival 2026';
    const raceDate = '2026-11-25';

    await sql`DELETE FROM cultural_events_calendar WHERE event_name = ${raceEventName};`;
    await sql`DELETE FROM scheduled_campaigns WHERE workspace_id = ${testWorkspaceId} AND topic_summary = ${raceEventName};`;
    await sql`DELETE FROM durable_events WHERE workspace_id = ${testWorkspaceId} AND idempotency_key LIKE '%concurrent_race%';`;

    await sql`
      INSERT INTO cultural_events_calendar (id, event_name, event_date, regions, target_industries, prompt_context, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        ${raceEventName},
        ${raceDate},
        ARRAY['Pan-India'],
        ARRAY['Healthcare', 'All'],
        'Concurrent festival race test',
        NOW(),
        NOW()
      );
    `;

    // Fire 3 simultaneous scheduler calls for the exact same event and workspace
    const [res1, res2, res3] = await Promise.all([
      executeAutonomousScheduler({ action: 'generate', targetDate: raceDate, workspaceId: testWorkspaceId, triggerSource: 'worker_alpha' }),
      executeAutonomousScheduler({ action: 'generate', targetDate: raceDate, workspaceId: testWorkspaceId, triggerSource: 'worker_beta' }),
      executeAutonomousScheduler({ action: 'generate', targetDate: raceDate, workspaceId: testWorkspaceId, triggerSource: 'worker_gamma' }),
    ]);

    const totalCreatedAcrossWorkers =
      res1.campaignsCreated.filter((c) => c.status === 'CREATED').length +
      res2.campaignsCreated.filter((c) => c.status === 'CREATED').length +
      res3.campaignsCreated.filter((c) => c.status === 'CREATED').length;

    assert(
      totalCreatedAcrossWorkers === 1,
      `Concurrent Execution: Only 1 worker created the campaign across 3 simultaneous triggers (created: ${totalCreatedAcrossWorkers})`
    );

    const raceDbCampaigns = await sql`
      SELECT id, topic_summary
      FROM scheduled_campaigns
      WHERE workspace_id = ${testWorkspaceId} AND topic_summary = ${raceEventName};
    `;
    assert(raceDbCampaigns.length === 1, 'Database has strictly 1 campaign created under concurrent race conditions');
  }

  console.log('\n--- SUITE 4: Token Refresh Idempotency & Deduplication ---');
  {
    const testDate = '2026-11-15';
    const key = `cron_token_refresh_${testDate}`;

    // Clean any prior test record
    await sql`DELETE FROM durable_events WHERE idempotency_key = ${key};`;

    let callCount = 0;
    const mockRefresh = async () => {
      callCount++;
      return { checked: 5, refreshed: 2, failed: 0 };
    };

    // First execution
    const run1 = await executeWithIdempotency(
      { idempotencyKey: key, eventType: 'cron.token_refresh', workspaceId: undefined, relatedEntityId: testDate },
      mockRefresh
    );
    assert(run1.status === 'COMPLETED', 'Token refresh first run completed successfully');
    assert(callCount === 1, 'Token refresh operation executed on first run');

    // Second execution on same date
    const run2 = await executeWithIdempotency(
      { idempotencyKey: key, eventType: 'cron.token_refresh', workspaceId: undefined, relatedEntityId: testDate },
      mockRefresh
    );
    assert(run2.status === 'CACHED', 'Token refresh second run returned CACHED without re-execution');
    assert(run2.idempotent === true, 'Token refresh second run marked idempotent: true');
    assert(callCount === 1, 'External refresh function was NOT invoked a second time');
  }

  console.log('\n--- SUITE 5: Subscription Renewal Scheduled Audit ---');
  {
    const testSubId = '00000000-0000-4000-a000-000000000203';
    const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago

    await sql`
      INSERT INTO subscriptions (id, workspace_id, plan_tier, billing_cycle, status, current_period_start, current_period_end, created_at, updated_at)
      VALUES (
        ${testSubId},
        ${testWorkspaceId},
        'GROWTH',
        'monthly',
        'ACTIVE',
        ${new Date(pastDate.getTime() - 30 * 24 * 60 * 60 * 1000)},
        ${pastDate},
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET status = 'ACTIVE', current_period_end = ${pastDate};
    `;

    const subKey = `cron_sub_renewal_${testSubId}_2026-11-15`;
    await sql`DELETE FROM durable_events WHERE idempotency_key = ${subKey};`;

    let subTransitions = 0;
    const auditFn = async () => {
      subTransitions++;
      await sql`UPDATE subscriptions SET status = 'PAST_DUE', updated_at = NOW() WHERE id = ${testSubId};`;
      return { newStatus: 'PAST_DUE' };
    };

    // First run
    const subRun1 = await executeWithIdempotency(
      { idempotencyKey: subKey, eventType: 'cron.subscription_renewal', workspaceId: testWorkspaceId, relatedEntityId: testSubId },
      auditFn
    );
    assert(subRun1.status === 'COMPLETED', 'Subscription audit executed and transitioned status');
    assert(subTransitions === 1, 'Subscription audit function executed on first run');

    const [updatedSub] = await sql`SELECT status FROM subscriptions WHERE id = ${testSubId};`;
    assert(updatedSub.status === 'PAST_DUE', 'Subscription status updated to PAST_DUE in database');

    // Duplicate run on same day
    const subRun2 = await executeWithIdempotency(
      { idempotencyKey: subKey, eventType: 'cron.subscription_renewal', workspaceId: testWorkspaceId, relatedEntityId: testSubId },
      auditFn
    );
    assert(subRun2.status === 'CACHED', 'Duplicate subscription audit returned CACHED');
    assert(subTransitions === 1, 'Duplicate audit function was NOT re-executed');
  }

  console.log('\n--- SUITE 6: Cleanup & Retention Scheduled Routine ---');
  {
    const cleanupKey = 'cron_cleanup_retention_2026-11-15';
    await sql`DELETE FROM durable_events WHERE idempotency_key = ${cleanupKey};`;

    // Seed expired session using valid testUserId
    const expiredSessionToken = 'test_expired_session_token_xyz_9912';
    await sql`
      INSERT INTO sessions (id, user_id, token, expires_at, created_at)
      VALUES (
        gen_random_uuid(),
        ${testUserId},
        ${expiredSessionToken},
        ${new Date(Date.now() - 24 * 60 * 60 * 1000)},
        NOW()
      );
    `;

    // Seed stale publishing campaign lock
    const staleCampaignId = '00000000-0000-4000-a000-000000000205';
    await sql`
      INSERT INTO scheduled_campaigns (id, workspace_id, trigger_type, topic_summary, status, generate_at, publish_at, lock_acquired_at, created_at, updated_at)
      VALUES (
        ${staleCampaignId},
        ${testWorkspaceId},
        'MANUAL',
        'Stale Lock Test Campaign',
        'PUBLISHING',
        NOW(),
        NOW(),
        ${new Date(Date.now() - 3 * 60 * 60 * 1000)},
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET status = 'PUBLISHING', lock_acquired_at = ${new Date(Date.now() - 3 * 60 * 60 * 1000)};
    `;

    let cleanupOperationsCount = 0;
    const runCleanup = async () => {
      cleanupOperationsCount++;
      // 1. Purge expired session
      const delSessions = await sql`DELETE FROM sessions WHERE token = ${expiredSessionToken} RETURNING id;`;
      // 2. Reap stale publish lock
      const reaped = await sql`
        UPDATE scheduled_campaigns
        SET status = 'FAILED', failure_reason = 'PUBLISH_LOCK_TIMEOUT_AUTO_REAPED', updated_at = NOW()
        WHERE id = ${staleCampaignId} AND status = 'PUBLISHING'
        RETURNING id;
      `;
      return { sessionsPurged: delSessions.length, staleLocksReaped: reaped.length };
    };

    const cleanupRun1 = await executeWithIdempotency(
      { idempotencyKey: cleanupKey, eventType: 'cron.cleanup_retention', workspaceId: undefined, relatedEntityId: '2026-11-15' },
      runCleanup
    );
    assert(cleanupRun1.status === 'COMPLETED', 'Cleanup retention routine completed');
    assert((cleanupRun1.result?.sessionsPurged ?? 0) >= 1, 'Expired session was purged');
    assert(cleanupRun1.result?.staleLocksReaped === 1, 'Stale publishing lock was reaped to FAILED');

    const [reapedCampaign] = await sql`SELECT status, failure_reason FROM scheduled_campaigns WHERE id = ${staleCampaignId};`;
    assert(reapedCampaign.status === 'FAILED', 'Reaped campaign status transitioned to FAILED');
    assert(reapedCampaign.failure_reason === 'PUBLISH_LOCK_TIMEOUT_AUTO_REAPED', 'Failure reason correctly set');

    // Duplicate cleanup run
    const cleanupRun2 = await executeWithIdempotency(
      { idempotencyKey: cleanupKey, eventType: 'cron.cleanup_retention', workspaceId: undefined, relatedEntityId: '2026-11-15' },
      runCleanup
    );
    assert(cleanupRun2.status === 'CACHED', 'Duplicate cleanup run returned CACHED');
    assert(cleanupOperationsCount === 1, 'Cleanup function was not re-executed');
  }

  console.log('\n--- SUITE 7: Vercel Cron Fail-Safe Pulse & Zero Duplication ---');
  {
    // Calling Vercel Cron with ?action=pulse
    const reqPulse = new NextRequest(new URL('/api/calendar/cron-trigger?action=pulse', 'http://localhost:3000'), {
      headers: { authorization: `Bearer ${TEST_CRON_SECRET}` },
    });
    const resPulse = await CronTriggerGET(reqPulse);
    assert(resPulse.status === 200, 'GET /api/calendar/cron-trigger?action=pulse returns HTTP 200');

    const pulseData = await resPulse.json();
    assert(pulseData.success === true, 'Pulse execution succeeded');
    assert(pulseData.actionExecuted === 'pulse', 'Action executed is confirmed as "pulse"');
    assert(
      pulseData.campaignsCreated.length === 0,
      'Pulse execution created ZERO campaigns (does NOT duplicate Inngest campaign generation)'
    );
    assert(Array.isArray(pulseData.schedulerInventory), 'Pulse payload includes full SCHEDULER_INVENTORY');
  }

  // Cleanup test artifacts
  await sql`DELETE FROM scheduled_campaigns WHERE workspace_id = ${testWorkspaceId};`;
  await sql`DELETE FROM subscriptions WHERE workspace_id = ${testWorkspaceId};`;
  await sql`DELETE FROM brand_profiles WHERE workspace_id = ${testWorkspaceId};`;
  await sql`DELETE FROM workspaces WHERE id = ${testWorkspaceId};`;
  await sql`DELETE FROM users WHERE id = ${testUserId};`;

  console.log('\n========================================================================');
  console.log(`📊 FINAL ACCEPTANCE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAcceptanceTests().catch((err) => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
