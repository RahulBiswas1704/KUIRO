const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
let dbUrl = '';
for (const line of env.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
    break;
  }
}

const sql = neon(dbUrl);

async function main() {
  const [ws] = await sql`SELECT count(*)::int as count FROM workspaces`;
  const [sc] = await sql`SELECT count(*)::int as count FROM scheduled_campaigns`;
  const [conv] = await sql`SELECT count(*)::int as count FROM conversations`;
  const [migs] = await sql`SELECT id, hash, created_at FROM drizzle.__drizzle_migrations`;

  console.log('Workspaces Count:', ws.count);
  console.log('Scheduled Campaigns Count:', sc.count);
  console.log('Conversations Count:', conv.count);
  console.log('Applied Drizzle Migrations:', migs);
}

main().catch(console.error);
