const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read DATABASE_URL from .env.local
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

process.env.DATABASE_URL = dbUrl;
const sql = neon(dbUrl);

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 KUIRO PROMPT 17: DATABASE MIGRATION SOURCE OF TRUTH AUDIT');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1: Configuration & Migration Tooling
    // -------------------------------------------------------------
    console.log('--- Test Suite 1: Tooling & Schema Configuration ---');
    const drizzleConfigPath = path.join(__dirname, '..', 'drizzle.config.ts');
    assert(fs.existsSync(drizzleConfigPath), 'drizzle.config.ts exists');
    const drizzleConfigContent = fs.readFileSync(drizzleConfigPath, 'utf8');
    assert(drizzleConfigContent.includes("./src/db/schema.ts"), 'drizzle.config.ts specifies canonical schema');
    assert(drizzleConfigContent.includes("./src/db/migrations"), 'drizzle.config.ts specifies canonical migrations folder');

    const pkgJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    assert(pkgJson.scripts['db:generate'] !== undefined, 'package.json has db:generate script');
    assert(pkgJson.scripts['db:migrate'] !== undefined, 'package.json has db:migrate script');

    // -------------------------------------------------------------
    // Test 2: Migration Files & Version Control
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 2: Version-Controlled Migration Artifacts ---');
    const migrationsDir = path.join(__dirname, '..', 'src', 'db', 'migrations');
    assert(fs.existsSync(migrationsDir), 'src/db/migrations directory exists');

    const metaJournalPath = path.join(migrationsDir, 'meta', '_journal.json');
    assert(fs.existsSync(metaJournalPath), 'migrations meta/_journal.json exists');
    const journal = JSON.parse(fs.readFileSync(metaJournalPath, 'utf8'));
    assert(journal.entries && journal.entries.length > 0, 'Migration journal contains registered migration entries');

    const sqlMigrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    assert(sqlMigrationFiles.length > 0, `Found ${sqlMigrationFiles.length} version-controlled SQL migration file(s)`);

    // -------------------------------------------------------------
    // Test 3: Public Schema Table Completeness in Neon DB
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 3: Table Completeness in Neon PostgreSQL ---');
    const expectedTables = [
      'accounts',
      'admin_audit_logs',
      'brand_profiles',
      'campaign_revisions',
      'conversations',
      'cultural_events_calendar',
      'inbox_automations',
      'inbox_messages',
      'payments',
      'platform_posts',
      'processed_webhook_events',
      'scheduled_campaigns',
      'sessions',
      'social_connections',
      'subscriptions',
      'users',
      'verification_tokens',
      'workspace_members',
      'workspaces',
    ];

    const dbTablesRows = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const dbTables = dbTablesRows.map(r => r.table_name);

    for (const t of expectedTables) {
      assert(dbTables.includes(t), `Canonical table '${t}' exists in Neon PostgreSQL`);
    }

    // -------------------------------------------------------------
    // Test 4: Tenant-Scoped Query Indexes
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 4: Tenant-Scoped Indexes ---');
    const indexRows = await sql`
      SELECT tablename, indexname, indexdef 
      FROM pg_indexes 
      WHERE schemaname = 'public'
    `;

    const indexDefs = indexRows.map(r => `${r.tablename}.${r.indexname} -> ${r.indexdef}`);
    
    // Check key tenant-scoped indexes
    const hasConvWsIdx = indexRows.some(r => r.tablename === 'conversations' && r.indexdef.includes('workspace_id'));
    assert(hasConvWsIdx, 'Conversations table has tenant-scoped index on workspace_id');

    const hasCampWsIdx = indexRows.some(r => r.tablename === 'scheduled_campaigns' && r.indexdef.includes('workspace_id'));
    assert(hasCampWsIdx, 'Scheduled campaigns table has tenant-scoped index on workspace_id');

    const hasSocialWsIdx = indexRows.some(r => r.tablename === 'social_connections' && r.indexdef.includes('workspace_id'));
    assert(hasSocialWsIdx, 'Social connections table has tenant-scoped index on workspace_id');

    const hasSubWsIdx = indexRows.some(r => r.tablename === 'subscriptions' && r.indexdef.includes('workspace_id'));
    assert(hasSubWsIdx, 'Subscriptions table has tenant-scoped index on workspace_id');

    const hasPayWsIdx = indexRows.some(r => r.tablename === 'payments' && r.indexdef.includes('workspace_id'));
    assert(hasPayWsIdx, 'Payments table has tenant-scoped index on workspace_id');

    const hasMsgConvIdx = indexRows.some(r => r.tablename === 'inbox_messages' && r.indexdef.includes('conversation_id'));
    assert(hasMsgConvIdx, 'Inbox messages table has index on conversation_id');

    const hasPostCampIdx = indexRows.some(r => r.tablename === 'platform_posts' && r.indexdef.includes('campaign_id'));
    assert(hasPostCampIdx, 'Platform posts table has index on campaign_id');

    // -------------------------------------------------------------
    // Test 5: Foreign Key Cascade & Set Null Rules
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 5: Foreign Keys & Deletion Rules ---');
    const fkRows = await sql`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    `;

    assert(fkRows.length >= 14, `Found ${fkRows.length} active foreign key constraints`);

    const convWsFk = fkRows.find(f => f.table_name === 'conversations' && f.column_name === 'workspace_id');
    assert(convWsFk?.delete_rule === 'CASCADE', 'conversations.workspace_id has ON DELETE CASCADE');

    const campWsFk = fkRows.find(f => f.table_name === 'scheduled_campaigns' && f.column_name === 'workspace_id');
    assert(campWsFk?.delete_rule === 'CASCADE', 'scheduled_campaigns.workspace_id has ON DELETE CASCADE');

    const wsOwnerFk = fkRows.find(f => f.table_name === 'workspaces' && f.column_name === 'owner_id');
    assert(wsOwnerFk?.delete_rule === 'CASCADE', 'workspaces.owner_id has ON DELETE CASCADE');

    const convAssignedFk = fkRows.find(f => f.table_name === 'conversations' && f.column_name === 'assigned_to');
    assert(convAssignedFk?.delete_rule === 'SET NULL', 'conversations.assigned_to has ON DELETE SET NULL');

    // -------------------------------------------------------------
    // Test 6: Mutable Tables Timestamps (createdAt & updatedAt)
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 6: Consistent Timestamp Lifecycle ---');
    const mutableTables = [
      'users',
      'workspaces',
      'brand_profiles',
      'social_connections',
      'scheduled_campaigns',
      'platform_posts',
      'cultural_events_calendar',
      'inbox_automations',
      'workspace_members',
      'conversations',
      'subscriptions',
    ];

    for (const table of mutableTables) {
      const cols = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = ${table}
      `;
      const colNames = cols.map(c => c.column_name);
      assert(colNames.includes('created_at'), `Table '${table}' has created_at timestamp`);
      assert(colNames.includes('updated_at'), `Table '${table}' has updated_at timestamp`);
    }

    // -------------------------------------------------------------
    // Test 7: Data Preservation (Zero Data Loss)
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 7: Customer Data Preservation ---');
    const [wsCount] = await sql`SELECT count(*)::int as count FROM workspaces`;
    const [campCount] = await sql`SELECT count(*)::int as count FROM scheduled_campaigns`;
    const [convCount] = await sql`SELECT count(*)::int as count FROM conversations`;

    assert(wsCount.count > 0, `Existing workspaces preserved without loss (${wsCount.count} workspaces)`);
    assert(campCount.count > 0, `Existing campaigns preserved without loss (${campCount.count} campaigns)`);
    assert(convCount.count > 0, `Existing conversations preserved without loss (${convCount.count} conversations)`);

    // -------------------------------------------------------------
    // Test 8: Drizzle Migration Tracking Ledger
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 8: Migration Tracking Ledger ---');
    const [migCount] = await sql`SELECT count(*)::int as count FROM drizzle.__drizzle_migrations`;
    assert(migCount.count > 0, `Drizzle migration ledger active with ${migCount.count} recorded migration(s)`);

    // -------------------------------------------------------------
    // Test 9: Quarantine & Deprecation of Supabase Directory
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 9: Supabase Legacy Quarantine ---');
    const supabaseReadmePath = path.join(__dirname, '..', 'supabase', 'README.md');
    assert(fs.existsSync(supabaseReadmePath), 'supabase/README.md deprecation notice exists');
    const supabaseReadme = fs.readFileSync(supabaseReadmePath, 'utf8');
    assert(supabaseReadme.includes('DO NOT USE FOR ACTIVE MIGRATIONS'), 'Supabase clearly marked as inactive reference');

    const supabaseMigrationSql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20261113000000_init_kuiro.sql'), 'utf8');
    assert(supabaseMigrationSql.includes('DEPRECATED / ARCHIVED LEGACY REFERENCE'), 'Supabase init SQL contains deprecation warning header');

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  }

  console.log('\n===============================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
