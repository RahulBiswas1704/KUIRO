const { neon } = require('@neondatabase/serverless');

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_lWjrvKf1M2QD@ep-flat-cloud-bdhilcgu-pooler.c-8.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

async function main() {
  const sql = neon(connectionString);
  console.log('Querying Neon DB counts across all 11 tables...');
  
  const [usersCount] = await sql`SELECT count(*)::int as count FROM users;`;
  const [wsCount] = await sql`SELECT count(*)::int as count FROM workspaces;`;
  const [bpCount] = await sql`SELECT count(*)::int as count FROM brand_profiles;`;
  const [campsCount] = await sql`SELECT count(*)::int as count FROM scheduled_campaigns;`;
  const [postsCount] = await sql`SELECT count(*)::int as count FROM platform_posts;`;
  const [convCount] = await sql`SELECT count(*)::int as count FROM conversations;`;
  const [msgCount] = await sql`SELECT count(*)::int as count FROM inbox_messages;`;
  const [calCount] = await sql`SELECT count(*)::int as count FROM cultural_events_calendar;`;
  const [sessCount] = await sql`SELECT count(*)::int as count FROM sessions;`;

  console.log({
    users: usersCount.count,
    workspaces: wsCount.count,
    brandProfiles: bpCount.count,
    campaigns: campsCount.count,
    platformPosts: postsCount.count,
    conversations: convCount.count,
    messages: msgCount.count,
    calendarEvents: calCount.count,
    activeSessions: sessCount.count
  });
}

main().catch(console.error);
