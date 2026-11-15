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
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `;
  console.log('Tables in Neon DB:', tables.map(t => t.table_name));

  for (const t of tables) {
    const cols = await sql`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = ${t.table_name}
      ORDER BY ordinal_position
    `;
    console.log(`\nTable ${t.table_name} (${cols.length} cols):`);
    console.log(cols.map(c => `  ${c.column_name}: ${c.data_type} (null: ${c.is_nullable})`).join('\n'));
  }
}

main().catch(console.error);
