const { neon } = require('@neondatabase/serverless');

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_lWjrvKf1M2QD@ep-flat-cloud-bdhilcgu-pooler.c-8.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

async function main() {
  const sql = neon(connectionString);
  console.log('Connecting to Neon DB...');
  
  // List all tables
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  console.log('Tables:', tables.map(t => t.table_name));

  // Check users columns
  const userCols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position;
  `;
  console.log('Users columns:', userCols);

  // Check sessions columns
  const sessionCols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'sessions'
    ORDER BY ordinal_position;
  `;
  console.log('Sessions columns:', sessionCols);

  // Check workspaces columns
  const wsCols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'workspaces'
    ORDER BY ordinal_position;
  `;
  console.log('Workspaces columns:', wsCols);

  // Check existing users count
  const users = await sql`SELECT id, name, email FROM users LIMIT 10;`;
  console.log('Existing users:', users);

  // Check existing workspaces count
  const workspaces = await sql`SELECT id, name, owner_id FROM workspaces LIMIT 10;`;
  console.log('Existing workspaces:', workspaces);
}

main().catch(console.error);

