const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const match = envFile.match(/DATABASE_URL=([^\r\n]+)/);
let connStr = match[1].trim();
if (connStr.startsWith('"') && connStr.endsWith('"')) connStr = connStr.slice(1, -1);
if (connStr.startsWith("'") && connStr.endsWith("'")) connStr = connStr.slice(1, -1);
const sql = neon(connStr);

async function migrate() {
  console.log('Migrating inbox_messages table...');
  await sql`
    ALTER TABLE inbox_messages
    ADD COLUMN IF NOT EXISTS provider_message_id text,
    ADD COLUMN IF NOT EXISTS delivery_status text DEFAULT 'delivered' NOT NULL,
    ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text' NOT NULL,
    ADD COLUMN IF NOT EXISTS delivery_error text,
    ADD COLUMN IF NOT EXISTS read_state boolean DEFAULT false NOT NULL,
    ADD COLUMN IF NOT EXISTS metadata jsonb;
  `;

  console.log('Migrating conversations table...');
  await sql`
    ALTER TABLE conversations
    ADD COLUMN IF NOT EXISTS last_customer_message_at timestamp with time zone,
    ADD COLUMN IF NOT EXISTS window_expires_at timestamp with time zone;
  `;

  const msgCols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'inbox_messages'`;
  console.log('Updated inbox_messages columns:', msgCols.map(c => c.column_name));

  const convCols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'conversations'`;
  console.log('Updated conversations columns:', convCols.map(c => c.column_name));

  console.log('Inbox migration completed successfully.');
}

migrate().catch(console.error);
