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
  const indexes = await sql`
    SELECT
      schemaname,
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
  `;
  console.log(`Found ${indexes.length} indexes in public schema:`);
  for (const idx of indexes) {
    console.log(`  [${idx.tablename}] ${idx.indexname}: ${idx.indexdef}`);
  }
}

main().catch(console.error);
