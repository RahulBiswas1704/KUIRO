// scripts/test-live-onboarding.cjs
// Automated End-to-End Verification of Multi-Tenant Onboarding Continuity on Live Production
const https = require('https');

const BASE_URL = process.env.TEST_URL || 'https://kuiro.vercel.app';
const timestamp = Date.now();
const testEmail = `doctor_${timestamp}@kuiro-test.in`;
const testName = `Dr. Ananya Roy`;
const testClinic = `Roy Aesthetic & Laser Clinic`;
const testPhone = `+919876543210`;

console.log(`\n============================================================`);
console.log(`🚀 KUIRO E2E ONBOARDING CONTINUITY VERIFICATION`);
console.log(`Target Host: ${BASE_URL}`);
console.log(`Generated Test Tenant: ${testName} (${testClinic})`);
console.log(`Email: ${testEmail}`);
console.log(`============================================================\n`);

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const options = {
      method,
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      headers: reqHeaders,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTest() {
  let sessionCookie = '';
  let workspaceId = '';

  try {
    // Step 1: Sign up new tenant
    console.log(`[1/5] Testing POST /api/auth/signup...`);
    const signupRes = await request('POST', '/api/auth/signup', {
      name: testName,
      businessName: testClinic,
      email: testEmail,
      password: 'SecurePassword123!',
      phone: testPhone,
    });

    if ((signupRes.status !== 200 && signupRes.status !== 201) || !signupRes.data.success) {
      throw new Error(`Signup failed (${signupRes.status}): ${JSON.stringify(signupRes.data)}`);
    }

    workspaceId = signupRes.data.workspace.id;
    const setCookie = signupRes.headers['set-cookie'];
    if (setCookie) {
      sessionCookie = Array.isArray(setCookie) ? setCookie[0].split(';')[0] : setCookie.split(';')[0];
    }
    console.log(`  ✅ Tenant created successfully!`);
    console.log(`     User ID: ${signupRes.data.user.id}`);
    console.log(`     Workspace ID: ${workspaceId}`);
    console.log(`     Session Cookie: ${sessionCookie ? 'Captured' : 'None'}`);

    // Step 2: Extract Brand Brain via AI
    console.log(`\n[2/5] Testing POST /api/brand-brain/extract (AI URL Extraction)...`);
    const extractRes = await request(
      'POST',
      '/api/brand-brain/extract',
      {
        url: 'https://kuiro.in',
        workspaceId,
      },
      sessionCookie ? { Cookie: sessionCookie } : {}
    );

    if (extractRes.status !== 200 || !extractRes.data.detected) {
      throw new Error(`Brand extraction failed (${extractRes.status}): ${JSON.stringify(extractRes.data)}`);
    }

    const detected = extractRes.data.detected;
    console.log(`  ✅ AI Extraction completed in ${extractRes.data.benchmarkSeconds || 0}s!`);
    console.log(`     Detected Name: ${detected.businessName}`);
    console.log(`     Primary Color: ${detected.colors?.primary}`);
    console.log(`     Secondary Color: ${detected.colors?.secondary}`);
    console.log(`     Doctor Credentials: ${detected.credentials?.degree} (${detected.credentials?.councilRegistration})`);

    // Step 3: Save final Onboarding Profile to Neon DB
    console.log(`\n[3/5] Testing POST /api/brand-brain/profile (Persist Step 3 Final Profile)...`);
    const profileRes = await request(
      'POST',
      '/api/brand-brain/profile',
      {
        workspaceId,
        colors: detected.colors,
        doctorCredentials: {
          doctorName: testName,
          degrees: detected.credentials?.degree || 'MBBS, MD (Dermatology)',
          councilRegistration: detected.credentials?.councilRegistration || 'WBMC-84729',
          clinicAddress: 'Park Street, Kolkata, WB',
        },
        toneOfVoice: {
          style: 'clinical_empathetic',
          formality: 'semi-formal',
          archetype: 'compassionate_caregiver',
          samplePhrases: detected.tones || ['Evidence-backed skin science'],
        },
        contentPillars: [
          { name: 'Acne & Scar Treatments', percentage: 40 },
          { name: 'Patient Transformations', percentage: 35 },
          { name: 'Myth vs Clinical Fact', percentage: 25 },
        ],
        whatsappAdminPhone: testPhone,
      },
      sessionCookie ? { Cookie: sessionCookie } : {}
    );

    if (profileRes.status !== 200 || !profileRes.data.success) {
      throw new Error(`Saving profile failed (${profileRes.status}): ${JSON.stringify(profileRes.data)}`);
    }
    console.log(`  ✅ Brand Profile persisted in Neon DB!`);

    // Step 4: Seed initial 48h Autonomous Campaign
    console.log(`\n[4/5] Testing POST /api/campaigns (Seed 48h Launch Campaign)...`);
    const seedRes = await request(
      'POST',
      '/api/campaigns',
      {
        workspaceId,
        topic: 'Inaugural Clinical Launch & Laser Consultation',
        triggerType: 'MANUAL',
      },
      sessionCookie ? { Cookie: sessionCookie } : {}
    );

    if ((seedRes.status !== 200 && seedRes.status !== 201) || !seedRes.data.success) {
      throw new Error(`Campaign seeding failed (${seedRes.status}): ${JSON.stringify(seedRes.data)}`);
    }
    console.log(`  ✅ 48h Launch Campaign seeded! Campaign ID: ${seedRes.data.campaign?.id}`);

    // Step 5: Verify Admin Panel sees this tenant and Brand Brain
    console.log(`\n[5/5] Testing GET /api/admin/workspaces (Operator Observability)...`);
    const adminRes = await request('GET', '/api/admin/workspaces');
    if (adminRes.status !== 200 || !adminRes.data.workspaces) {
      throw new Error(`Admin check failed (${adminRes.status}): ${JSON.stringify(adminRes.data)}`);
    }

    const matchedWs = adminRes.data.workspaces.find((w) => w.id === workspaceId);
    if (!matchedWs) {
      throw new Error(`Workspace ${workspaceId} not visible in admin overview!`);
    }

    console.log(`  ✅ Admin panel successfully retrieved tenant!`);
    console.log(`     Tenant Name: ${matchedWs.name}`);
    console.log(`     Subscription: ${matchedWs.subscriptionTier}`);
    console.log(`     Has Brand Brain: ${matchedWs.hasBrandProfile ? 'YES (Active)' : 'NO'}`);
    console.log(`     Campaigns: ${matchedWs.campaignCount}`);

    console.log(`\n============================================================`);
    console.log(`🎉 ALL 5 E2E ONBOARDING CONTINUITY CHECKS PASSED ON PRODUCTION!`);
    console.log(`============================================================\n`);
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ TEST FAILED:`, err.message);
    process.exit(1);
  }
}

runTest();
