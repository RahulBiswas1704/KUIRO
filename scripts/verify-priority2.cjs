// scripts/verify-priority2.cjs
const http = require('http');

const PORT = 3000;

console.log(`\n============================================================`);
console.log(`🚀 VERIFYING PRIORITY 2: TECHNICAL & ENGINE OPTIMIZATIONS`);
console.log(`============================================================\n`);

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let resData = '';
        res.on('data', (c) => (resData += c));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(resData);
          } catch (e) {
            json = resData;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function verifyAll() {
  try {
    // 1. Indic Script Typography
    console.log(`[1/3] Testing Indic Script Typography in Creative Compositor...`);
    const indicRes = await request('POST', '/api/compositor/render', {
      headline: 'শুভ নববর্ষ ১৪৩১ • নতুন বছরের শুভেচ্ছা',
      subheadline: 'সুস্থ থাকুন, সুন্দর থাকুন। রয় এস্থেটিক অ্যান্ড লেজার ক্লিনিক।',
      brandName: 'রয় ক্লিনিক',
      phone: '+91 98765 43210',
      website: 'royclinic.in',
    });

    if (indicRes.status !== 200 || !indicRes.data.success) {
      throw new Error(`Indic render failed (${indicRes.status}): ${JSON.stringify(indicRes.data)}`);
    }
    console.log(`  ✅ Indic Typography rendered successfully!`);
    console.log(`     Has Indic: ${indicRes.data.hasIndicScript}`);
    console.log(`     Render Engine: ${indicRes.data.renderEngine}`);
    console.log(`     Composed URL: ${indicRes.data.publicUrl}`);

    // 2. OAuth Token Vault & Connected Channels
    console.log(`\n[2/3] Testing OAuth Token Vault & Connected Channels Modal API...`);
    const getChannelsRes = await request('GET', '/api/social-connections');
    if (getChannelsRes.status !== 200 || !getChannelsRes.data.connections) {
      throw new Error(`Get channels failed: ${JSON.stringify(getChannelsRes.data)}`);
    }
    console.log(`  ✅ Retrieved ${getChannelsRes.data.connections.length} configured channels!`);

    // Test handshake for Meta, LinkedIn, and X
    for (const p of ['instagram', 'linkedin', 'x']) {
      const testRes = await request('POST', '/api/social-connections', {
        platform: p,
        action: 'test',
        platformAccountId: `@test_${p}`,
      });
      if (testRes.status !== 200 || !testRes.data.success) {
        throw new Error(`Handshake test for ${p} failed: ${JSON.stringify(testRes.data)}`);
      }
      console.log(`  ✅ ${p.toUpperCase()} Handshake: ${testRes.data.latencyMs}ms (${testRes.data.verifiedAccount})`);
    }

    // Connect Meta Business Manager in DB
    const connectRes = await request('POST', '/api/social-connections', {
      platform: 'instagram',
      action: 'connect',
      platformAccountId: '@drsharma.aesthetic',
      accessToken: 'EAAGm0PX4ZC0IBO_mock_access_token',
    });
    if (connectRes.status !== 200 || !connectRes.data.success) {
      throw new Error(`Connect channel failed: ${JSON.stringify(connectRes.data)}`);
    }
    console.log(`  ✅ Meta Instagram connection stored in Neon DB: ${connectRes.data.connection.platformAccountId}`);

    // 3. Tenant Switcher / Persona Simulator
    console.log(`\n[3/3] Testing 1-Click Tenant Switcher / Persona Simulator...`);
    const personas = ['sharma', 'sengupta', 'mehta'];
    for (const key of personas) {
      const switchRes = await request('POST', '/api/auth/switch-persona', { personaKey: key });
      if (switchRes.status !== 200 || !switchRes.data.success) {
        throw new Error(`Switch to ${key} failed: ${JSON.stringify(switchRes.data)}`);
      }
      const u = switchRes.data.user;
      const ws = switchRes.data.workspace;
      console.log(`  ✅ Switched to persona [${key}]:`);
      console.log(`     User: ${u.name} (${u.role})`);
      console.log(`     Workspace: ${ws.name} [Tier: ${ws.subscriptionTier}]`);
      console.log(`     WhatsApp: ${ws.whatsappAdminPhone}`);
    }

    console.log(`\n============================================================`);
    console.log(`🎉 ALL PRIORITY 2 TECHNICAL OPTIMIZATIONS VERIFIED CLEANLY!`);
    console.log(`============================================================\n`);
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ VERIFICATION FAILED:`, err.message);
    process.exit(1);
  }
}

verifyAll();
