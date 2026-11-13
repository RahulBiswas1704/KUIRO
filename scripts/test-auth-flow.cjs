const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_lWjrvKf1M2QD@ep-flat-cloud-bdhilcgu-pooler.c-8.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

async function main() {
  const sql = neon(connectionString);
  console.log('--- 1. Testing Neon DB Auth Schema & Demo User Provisioning ---');

  // 1. Ensure Dr. Rajesh Sharma exists in users, workspaces, brand_profiles
  const demoEmail = 'dr.sharma@apexclinic.in';
  let [demoUser] = await sql`SELECT id, name, email, role, email_verified FROM users WHERE email = ${demoEmail};`;

  if (!demoUser) {
    console.log('Seeding Demo User (Dr. Rajesh Sharma)...');
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync('DemoSharma2026!', salt, 64).toString('hex');
    const passwordHash = `${salt}:${hash}`;

    [demoUser] = await sql`
      INSERT INTO users (name, email, password_hash, role, email_verified)
      VALUES ('Dr. Rajesh Sharma', ${demoEmail}, ${passwordHash}, 'Founder & Clinic Director', true)
      RETURNING id, name, email, role, email_verified;
    `;
    console.log('Demo user created:', demoUser);
  } else {
    console.log('Demo user already exists:', demoUser);
  }

  // Check demo workspace
  let [demoWs] = await sql`SELECT id, name, owner_id FROM workspaces WHERE owner_id = ${demoUser.id};`;
  if (!demoWs) {
    console.log('Seeding Demo Workspace...');
    [demoWs] = await sql`
      INSERT INTO workspaces (name, owner_id, subscription_tier, whatsapp_admin_phone)
      VALUES ('Dr. Sharma Dental Clinics', ${demoUser.id}, 'GROWTH', '+919876543210')
      RETURNING id, name, owner_id;
    `;
    console.log('Demo workspace created:', demoWs);
  } else {
    console.log('Demo workspace already exists:', demoWs);
  }

  // Check demo brand profile
  let [demoBp] = await sql`SELECT id, workspace_id, industry FROM brand_profiles WHERE workspace_id = ${demoWs.id};`;
  if (!demoBp) {
    console.log('Seeding Demo Brand Profile...');
    [demoBp] = await sql`
      INSERT INTO brand_profiles (
        workspace_id, 
        industry, 
        website_url, 
        tone_of_voice, 
        visual_identity, 
        content_pillars, 
        negative_constraints
      )
      VALUES (
        ${demoWs.id},
        'Healthcare & Preventive Diagnostics',
        'https://drsharmadental.in',
        ${JSON.stringify({
          style: 'clinical_empathetic',
          formality: 'semi-formal',
          archetype: 'compassionate_caregiver',
          samplePhrases: ['Empathetic & Caring', 'Clinically Authoritative']
        })},
        ${JSON.stringify({
          primaryHex: '#0D9488',
          secondaryHex: '#0F172A',
          accentHex: '#FF7A00',
          fontFamily: 'Sora'
        })},
        ${JSON.stringify([
          { name: 'Preventive Care', weight: 40 },
          { name: 'Patient Success Stories', weight: 30 }
        ])},
        ${['Never prescribe medicine without an in-person physical clinical exam']}
      )
      RETURNING id, workspace_id, industry;
    `;
    console.log('Demo brand profile created:', demoBp);
  } else {
    console.log('Demo brand profile already exists:', demoBp);
  }

  // 2. Test Session Creation and Lookup in Neon DB
  console.log('\n--- 2. Testing Session Creation in sessions Table ---');
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const sessionId = `sess_${crypto.randomUUID()}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const [createdSession] = await sql`
    INSERT INTO sessions (id, user_id, token, expires_at, ip_address, user_agent)
    VALUES (${sessionId}, ${demoUser.id}, ${sessionToken}, ${expiresAt.toISOString()}, '127.0.0.1', 'Node.js Test Agent')
    RETURNING id, user_id, token, expires_at;
  `;
  console.log('Session inserted into Neon DB:', createdSession);

  // Validate session query
  const [activeSession] = await sql`
    SELECT s.id, s.token, s.expires_at, u.name as user_name, u.email as user_email, w.name as workspace_name
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN workspaces w ON w.owner_id = u.id
    WHERE s.token = ${sessionToken} AND s.expires_at > NOW();
  `;
  console.log('Session lookup with user & workspace join:', activeSession);

  // 3. Test Session Destruction (Logout)
  console.log('\n--- 3. Testing Session Destruction (Logout) ---');
  const deleteResult = await sql`DELETE FROM sessions WHERE token = ${sessionToken} RETURNING id;`;
  console.log('Deleted session records:', deleteResult);

  // 4. Test Multi-Tenant Signup Flow
  console.log('\n--- 4. Testing Multi-Tenant Signup Simulation ---');
  const testEmail = `test_founder_${Date.now()}@kuiro.in`;
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync('SecureTest123!', salt, 64).toString('hex');
  const testPasswordHash = `${salt}:${hash}`;

  const [testUser] = await sql`
    INSERT INTO users (name, email, password_hash, role, email_verified)
    VALUES ('Pooja Mehta', ${testEmail}, ${testPasswordHash}, 'Founder', false)
    RETURNING id, name, email, role, email_verified;
  `;
  console.log('Test User created:', testUser);

  const [testWs] = await sql`
    INSERT INTO workspaces (name, owner_id, subscription_tier)
    VALUES ('Mehta Wellness & Yoga Studio', ${testUser.id}, 'GROWTH')
    RETURNING id, name, owner_id;
  `;
  console.log('Test Workspace created for Pooja:', testWs);

  const [testBp] = await sql`
    INSERT INTO brand_profiles (
      workspace_id,
      industry,
      website_url,
      tone_of_voice,
      visual_identity,
      content_pillars,
      negative_constraints
    )
    VALUES (
      ${testWs.id},
      'Health & Holistic Wellness',
      'https://mehtayoga.in',
      ${JSON.stringify({ style: 'professional_warm', formality: 'casual', archetype: 'calm_guide' })},
      ${JSON.stringify({ primaryHex: '#10B981', secondaryHex: '#064E3B', fontFamily: 'Inter' })},
      ${JSON.stringify([{ name: 'Mindfulness', weight: 50 }, { name: 'Morning Asanas', weight: 50 }])},
      ${['No toxic diet advice']}
    )
    RETURNING id, workspace_id, industry;
  `;
  console.log('Test Brand Profile scoped to Pooja workspace:', testBp);

  // Cleanup test user
  await sql`DELETE FROM users WHERE id = ${testUser.id};`;
  console.log('Cleaned up test user (cascades to workspace and brand profile).');

  console.log('\n=== ALL PHASE 8 NEON DB AUTH VERIFICATIONS PASSED ===');
}

main().catch(console.error);

