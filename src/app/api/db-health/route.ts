import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { db, workspaces, users } from '@/db';
import { sql as drizzleSql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const connStr = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;

  if (!connStr) {
    return NextResponse.json(
      {
        success: false,
        error: 'DATABASE_URL is not defined in environment variables.',
      },
      { status: 500 }
    );
  }

  try {
    // 1. Direct raw query via @neondatabase/serverless
    const sql = neon(connStr);
    const dbInfo = await sql`
      SELECT 
        version() AS pg_version, 
        current_database() AS database_name, 
        current_user AS user_name,
        now() AS server_time
    `;

    // 2. Query tables in public schema
    let tablesFound: string[] = [];
    const tablesQuery = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    tablesFound = tablesQuery.map((row: any) => row.table_name);

    // 3. Test insert and select via Drizzle ORM if db is initialized
    let drizzleTestResult: any = null;
    if (db) {
      // Create or ensure a verification test user
      const testEmail = 'verify-neon@kuiro.ai';
      let [testUser] = await db.select().from(users).where(drizzleSql`email = ${testEmail}`);
      if (!testUser) {
        [testUser] = await db.insert(users).values({
          name: 'Neon E2E Verification Agent',
          email: testEmail,
          emailVerified: true,
        }).returning();
      }

      // Create a test workspace for the user
      const testWsName = `KUIRO Live Neon Test ${new Date().toISOString().slice(11, 19)}`;
      const [testWs] = await db.insert(workspaces).values({
        name: testWsName,
        ownerId: testUser.id,
        subscriptionTier: 'GROWTH',
        whatsappAdminPhone: '+919999988888',
      }).returning();

      // Read back all workspaces for verification
      const allWorkspaces = await db.select().from(workspaces);

      drizzleTestResult = {
        drizzleConnected: true,
        testUserId: testUser.id,
        testWorkspaceCreated: testWs.name,
        totalWorkspacesInNeon: allWorkspaces.length,
      };
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      service: 'Neon Lakebase PostgreSQL',
      branch: process.env.NEON_BRANCH || 'production',
      branchId: process.env.NEON_BRANCH_ID || 'br-steep-butterfly-bdorw4i2',
      durationMs,
      serverTime: dbInfo[0]?.server_time,
      database: dbInfo[0]?.database_name,
      user: dbInfo[0]?.user_name,
      pgVersion: dbInfo[0]?.pg_version,
      publicTables: tablesFound,
      drizzleStatus: drizzleTestResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || String(error),
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

