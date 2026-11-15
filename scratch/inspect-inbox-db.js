const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const match = envFile.match(/DATABASE_URL=([^\r\n]+)/);
let connStr = match[1].trim();
if (connStr.startsWith('"') && connStr.endsWith('"')) connStr = connStr.slice(1, -1);
if (connStr.startsWith("'") && connStr.endsWith("'")) connStr = connStr.slice(1, -1);
const sql = neon(connStr);

async function check() {
  const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'inbox_messages'`;
  console.log('inbox_messages columns:', cols.map(c => c.column_name));
  const convCols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'conversations'`;
  console.log('conversations columns:', convCols.map(c => c.column_name));
}

check().catch(console.error);
