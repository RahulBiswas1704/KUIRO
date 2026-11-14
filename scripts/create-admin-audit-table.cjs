const { neon } = require('@neondatabase/serverless');

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_lWjrvKf1M2QD@ep-flat-cloud-bdhilcgu-pooler.c-8.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

async function main() {
  const sql = neon(connectionString);
  console.log('Creating admin_audit_logs table on Neon PostgreSQL...');

  await sql`
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      operator_email TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT,
      status TEXT NOT NULL,
      details JSONB,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // Create indexes for efficient filtering and timeline rendering
  await sql`
    CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at 
    ON admin_audit_logs (created_at DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_operator 
    ON admin_audit_logs (operator_email);
  `;

  console.log('✅ admin_audit_logs table and indexes verified on Neon DB.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
