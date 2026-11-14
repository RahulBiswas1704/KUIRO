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

    // 3. Test lightweight read connectivity via Drizzle ORM
    let drizzleTestResult: any = null;
    if (db) {
      const pingResult = await db.execute(drizzleSql`SELECT 1 as ok`);
      drizzleTestResult = {
        drizzleConnected: !!pingResult,
        tablesCount: tablesFound.length,
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

