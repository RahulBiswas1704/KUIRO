const fs = require('fs');
const path = require('path');

const file = path.resolve('src/db/migrations/0000_youthful_raza.sql');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/CREATE TABLE "/g, 'CREATE TABLE IF NOT EXISTS "');
content = content.replace(/CREATE INDEX "/g, 'CREATE INDEX IF NOT EXISTS "');
content = content.replace(/ALTER TABLE "([^"]+)" ADD CONSTRAINT "([^"]+)" ([^;]+);/g, (match, table, conname, rest) => {
  return `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${conname}') THEN ALTER TABLE "${table}" ADD CONSTRAINT "${conname}" ${rest}; END IF; END $$;`;
});

fs.writeFileSync(file, content);
console.log('0000_youthful_raza.sql transformed to idempotent DDL successfully!');
