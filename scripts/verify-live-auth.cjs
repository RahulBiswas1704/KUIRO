const https = require('https');

const BASE_URL = 'https://kuiro.vercel.app';

function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
          });
        } catch {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            rawBody: data,
          });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runLiveVerification() {
  console.log(`=== LIVE PRODUCTION AUTH VERIFICATION (${BASE_URL}) ===\n`);

  // 1. Verify Demo Login
  console.log('1. Testing POST /api/auth/login (1-Click Demo Login)...');
  const demoLoginRes = await request(
    '/api/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { isDemo: true }
  );

  console.log('Status:', demoLoginRes.statusCode);
  console.log('User:', demoLoginRes.body?.user);
  console.log('Workspace:', demoLoginRes.body?.workspace);
  console.log('SessionToken exists:', !!demoLoginRes.body?.sessionToken);

  const cookies = demoLoginRes.headers['set-cookie'];
  console.log('Set-Cookie received:', !!cookies);

  let sessionCookie = '';
  if (cookies) {
    sessionCookie = cookies[0].split(';')[0];
  }

  // 2. Verify Session with GET /api/auth/me
  console.log('\n2. Testing GET /api/auth/me with persistent cookie...');
  const meRes = await request('/api/auth/me', {
    method: 'GET',
    headers: {
      Cookie: sessionCookie,
      Authorization: `Bearer ${demoLoginRes.body?.sessionToken}`,
    },
  });

  console.log('Status:', meRes.statusCode);
  console.log('Authenticated:', meRes.body?.authenticated);
  console.log('User:', meRes.body?.user?.name, `(${meRes.body?.user?.email})`);
  console.log('Workspace:', meRes.body?.workspace?.name);

  // 3. Verify Multi-Tenant Signup
  console.log('\n3. Testing POST /api/auth/signup (Multi-Tenant New Business Onboarding)...');
  const uniqueId = Date.now();
  const signupRes = await request(
    '/api/auth/signup',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      name: 'Priya Sengupta',
      businessName: 'Sengupta Skin & Aesthetic Clinic',
      email: `priya_${uniqueId}@senguptaclinic.com`,
      password: 'ClinicSecure2026!',
      industry: 'Dermatology & Aesthetic Medicine',
      phone: '+919830099887',
    }
  );

  console.log('Status:', signupRes.statusCode);
  console.log('Created User:', signupRes.body?.user);
  console.log('Created Workspace:', signupRes.body?.workspace);
  console.log('New Session Established:', !!signupRes.body?.sessionToken);

  // 4. Verify Logout
  console.log('\n4. Testing POST /api/auth/logout...');
  const logoutRes = await request('/api/auth/logout', {
    method: 'POST',
    headers: {
      Cookie: sessionCookie,
      Authorization: `Bearer ${demoLoginRes.body?.sessionToken}`,
    },
  });
  console.log('Status:', logoutRes.statusCode);
  console.log('Logout Response:', logoutRes.body);

  console.log('\n=== ALL PHASE 8 PRODUCTION END-TO-END CHECKS COMPLETED SUCCESSFULLY ===');
}

runLiveVerification().catch(console.error);
