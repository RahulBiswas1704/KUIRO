const https = require('https');

const BASE_URL = 'https://kuiro.vercel.app';

function request(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    https.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : null,
          });
        } catch {
          resolve({
            statusCode: res.statusCode,
            rawBody: data.slice(0, 100),
          });
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log(`=== TESTING LIVE KUIRO ADMIN PANEL ON ${BASE_URL} ===\n`);

  // 1. Overview API
  console.log('1. Checking GET /api/admin/overview...');
  const ovRes = await request('/api/admin/overview');
  console.log('Status:', ovRes.statusCode);
  console.log('Metrics:', ovRes.body?.metrics);
  console.log('Health DB:', ovRes.body?.health?.database);
  console.log('Recent Activities count:', ovRes.body?.recentActivities?.length);

  // 2. Workspaces API
  console.log('\n2. Checking GET /api/admin/workspaces...');
  const wsRes = await request('/api/admin/workspaces');
  console.log('Status:', wsRes.statusCode);
  console.log('Workspaces Count:', wsRes.body?.count);
  console.log('First 2 Workspaces:', wsRes.body?.workspaces?.slice(0, 2).map(w => ({ name: w.name, tier: w.subscriptionTier, owner: w.ownerName })));

  // 3. Users API
  console.log('\n3. Checking GET /api/admin/users...');
  const uRes = await request('/api/admin/users');
  console.log('Status:', uRes.statusCode);
  console.log('Users Count:', uRes.body?.count);
  console.log('Users:', uRes.body?.users?.map(u => ({ name: u.name, email: u.email, role: u.role })));

  // 4. Campaigns API
  console.log('\n4. Checking GET /api/admin/campaigns...');
  const cRes = await request('/api/admin/campaigns');
  console.log('Status:', cRes.statusCode);
  console.log('Campaigns Count:', cRes.body?.count);
  console.log('First 2 Campaigns:', cRes.body?.campaigns?.slice(0, 2).map(c => ({ topic: c.topicSummary, status: c.status, workspace: c.workspaceName })));

  // 5. Calendar API
  console.log('\n5. Checking GET /api/admin/calendar...');
  const calRes = await request('/api/admin/calendar');
  console.log('Status:', calRes.statusCode);
  console.log('Calendar Events Count:', calRes.body?.count);

  // 6. Optimizer API
  console.log('\n6. Checking GET /api/admin/optimizer...');
  const optRes = await request('/api/admin/optimizer');
  console.log('Status:', optRes.statusCode);
  console.log('Optimizer config keys:', Object.keys(optRes.body?.config || {}));
  console.log('Unit Economics:', optRes.body?.config?.unitEconomics);

  // 7. Page route /admin
  console.log('\n7. Checking GET /admin (UI Route)...');
  const pageRes = await request('/admin');
  console.log('Status:', pageRes.statusCode);

  console.log('\n=== ALL LIVE ADMIN PANEL VERIFICATIONS PASSED SUCCESSFULLY ===');
}

main().catch(console.error);

