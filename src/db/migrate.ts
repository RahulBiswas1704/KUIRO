import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * KUIRO Database Migration Runner (Neon PostgreSQL & Drizzle Kit)
 * 
 * Canonical Database Migration Strategy:
 * 1. Single Source of Truth: Drizzle schema (`src/db/schema.ts`).
 * 2. Version-Controlled Migrations: SQL migration artifacts in `src/db/migrations/`.
 * 3. Atomic Application: Applies pending migrations tracked in `drizzle.__drizzle_migrations`.
 * 4. Zero Data Loss: Safe additive migrations with foreign key indexes and tenant scoping.
 */

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

export async function runMigrations() {
  const startTime = Date.now();
  console.log('===============================================================');
  console.log('🚀 KUIRO CANONICAL DATABASE MIGRATION RUNNER (NEON POSTGRESQL)');
  console.log('===============================================================\n');

  const connectionString =
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DIRECT_URL ||
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured in environment or .env.local');
  }

  const cleanUrl = connectionString.replace(/^["']|["']$/g, '');
  console.log('[1/4] Connecting to Neon PostgreSQL...');
  const sql = neon(cleanUrl);
  const db = drizzle(sql);

  // 1. Ensure required extensions exist
  console.log('[2/4] Verifying required PostgreSQL extensions (pgcrypto, uuid-ossp)...');
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  // 2. Safe additive migration for existing live tables (ensuring updatedAt exists on all mutable tables)
  console.log('[3/4] Ensuring column and constraint compatibility for live tables...');
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL`;
    await sql`ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL`;
    await sql`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL`;
    await sql`ALTER TABLE social_connections ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL`;
    await sql`ALTER TABLE scheduled_campaigns ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL`;
    await sql`ALTER TABLE platform_posts ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL`;
    await sql`ALTER TABLE cultural_events_calendar ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL`;
    await sql`ALTER TABLE inbox_automations ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL`;
  } catch (colErr) {
    console.warn('[Migrator Warning] Column upgrade note:', colErr);
  }

  // 3. Execute Drizzle migration runner
  const migrationsFolder = path.resolve(process.cwd(), 'src/db/migrations');
  console.log(`[4/4] Applying migrations from ${migrationsFolder}...`);

  await migrate(db, {
    migrationsFolder,
    migrationsTable: '__drizzle_migrations',
    migrationsSchema: 'drizzle',
  });

  const durationMs = Date.now() - startTime;
  console.log(`\n✅ Database migration completed successfully in ${durationMs}ms!`);

  // Verify tables in public schema
  const appliedTables = await sql`
    SELECT count(*)::int as count 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `;
  console.log(`📊 Active public tables verified: ${appliedTables[0].count}`);

  const appliedIndexes = await sql`
    SELECT count(*)::int as count 
    FROM pg_indexes 
    WHERE schemaname = 'public'
  `;
  console.log(`⚡ Active indexes verified: ${appliedIndexes[0].count}`);
  console.log('===============================================================\n');

  return {
    success: true,
    tablesCount: appliedTables[0].count,
    indexesCount: appliedIndexes[0].count,
    durationMs,
  };
}

if (require.main === module) {
  runMigrations().catch((err) => {
    console.error('\n❌ Fatal Migration Error:', err);
    process.exit(1);
  });
}
