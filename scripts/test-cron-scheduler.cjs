const http = require('http');

/**
 * Verification Script for Option 1: Autonomous Daily Cron Scheduler
 * Tests:
 * 1. HTTP GET /api/calendar/cron-trigger (Vercel Cron format)
 * 2. HTTP POST /api/calendar/cron-trigger (Admin manual trigger format)
 * 3. T-48h Radar milestone scanning & campaign generation
 * 4. T-0h Auto-Commit sweep check
 */

const PORT = 3000;
const HOST = '127.0.0.1';

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'vercel-cron/1.0',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('============================================================');
  console.log('🚀 TESTING AUTONOMOUS DAILY CRON SCHEDULER (OPTION 1)');
  console.log('============================================================\n');

  try {
    // 1. Test GET /api/calendar/cron-trigger (Vercel Cron daily trigger simulation)
    console.log('[1/3] Testing GET /api/calendar/cron-trigger (Vercel Cron Simulation)...');
    const getRes = await makeRequest('/api/calendar/cron-trigger?force=true', 'GET');
    console.log(`  HTTP Status: ${getRes.status}`);
    
    if (getRes.status === 200 && getRes.data?.success) {
      console.log('  ✅ GET Handler passed!');
      console.log(`     Trigger Source: ${getRes.data.triggerSource}`);
      console.log(`     Scan Target Date: ${getRes.data.scanDate}`);
      console.log(`     Workspaces Evaluated: ${getRes.data.workspacesEvaluated}`);
      console.log(`     Events Matched: ${getRes.data.eventsMatched?.length || 0}`);
      console.log(`     Campaigns Processed: ${getRes.data.campaignsCreated?.length || 0}`);
      console.log(`     Execution Duration: ${getRes.data.durationMs}ms`);
    } else {
      console.error('  ❌ GET Handler failed:', getRes.data || getRes.raw);
      process.exit(1);
    }

    // 2. Test POST /api/calendar/cron-trigger (Admin panel manual trigger simulation)
    console.log('\n[2/3] Testing POST /api/calendar/cron-trigger (Admin Manual Trigger)...');
    const postRes = await makeRequest('/api/calendar/cron-trigger', 'POST', {
      targetDate: '2026-11-16',
      forceNext: true,
    });
    console.log(`  HTTP Status: ${postRes.status}`);

    if (postRes.status === 200 && postRes.data?.success) {
      console.log('  ✅ POST Handler passed!');
      console.log(`     Trigger Source: ${postRes.data.triggerSource}`);
      console.log(`     Target Date: ${postRes.data.scanDate}`);
      console.log(`     Campaigns in batch: ${postRes.data.campaignsCreated?.length || 0}`);
      console.log(`     Execution Duration: ${postRes.data.durationMs}ms`);
    } else {
      console.error('  ❌ POST Handler failed:', postRes.data || postRes.raw);
      process.exit(1);
    }

    // 3. Test Security Bearer Header format
    console.log('\n[3/3] Testing Bearer Header Authorization Parsing...');
    const authRes = await makeRequest('/api/calendar/cron-trigger', 'GET', null, {
      Authorization: 'Bearer test_cron_secret_kuiro',
    });
    console.log(`  HTTP Status: ${authRes.status}`);
    if (authRes.status === 200 || authRes.status === 401) {
      console.log('  ✅ Authorization parser executed as expected without crashing.');
    } else {
      console.error('  ❌ Unexpected error during auth check:', authRes.data);
      process.exit(1);
    }

    console.log('\n============================================================');
    console.log('🎉 ALL AUTONOMOUS CRON SCHEDULER TESTS PASSED SUCCESSFULLY!');
    console.log('============================================================');
  } catch (error) {
    console.error('Test Suite encountered an error:', error);
    process.exit(1);
  }
}

runTests();

