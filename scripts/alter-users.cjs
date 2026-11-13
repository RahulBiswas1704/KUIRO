const { neon } = require('@neondatabase/serverless');

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_lWjrvKf1M2QD@ep-flat-cloud-bdhilcgu-pooler.c-8.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

async function main() {
  const sql = neon(connectionString);
  console.log('Adding password_hash and role columns to users if not exists...');
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'Founder';`;
  console.log('Columns added successfully.');

  const userCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users'
    ORDER BY ordinal_position;
  `;
  console.log('Updated users columns:', userCols);
}

main().catch(console.error);

