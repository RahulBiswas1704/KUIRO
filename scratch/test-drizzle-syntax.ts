import { pgTable, uuid, text, index, unique } from 'drizzle-orm/pg-core';

export const testTable = pgTable('test_table', {
  id: uuid('id').primaryKey(),
  wsId: uuid('ws_id'),
  platform: text('platform'),
}, (t) => [
  index('test_ws_idx').on(t.wsId),
  unique('test_uniq').on(t.wsId, t.platform),
]);

console.log('✅ Valid Drizzle index & unique constraint syntax!');
