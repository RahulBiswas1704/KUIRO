import { NextRequest, NextResponse } from 'next/server';
import { executeAutonomousScheduler } from '@/lib/scheduler';
import { verifyCronAuthorization } from '@/lib/cron/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * ============================================================================
 * VERCEL CRON AUTONOMOUS SCHEDULER ENDPOINT
 * ============================================================================
 * 
 * Scheduled in vercel.json:
 * path: "/api/calendar/cron-trigger?action=all"
 * schedule: "0 0 * * *" (Daily 00:00 UTC / 05:30 AM IST)
 * 
 * Authentication:
 * - Vercel Cron automatically sends: `Authorization: Bearer <CRON_SECRET>`
 * - Verified using timing-safe buffer comparison.
 * - In production, fails closed (HTTP 500) if CRON_SECRET is missing or banned.
 * - Rejects unauthorized requests with HTTP 401.
 * - Rate-limits requests with HTTP 429.
 * - All executions and unauthorized probes are audited in Neon PostgreSQL.
 * - Zero session cookies accepted. No tenant privilege escalation.
 */

/**
 * GET Handler: Invoked automatically by Vercel Cron
 * Accepts optional query param: ?action=all | ?action=sweep | ?action=generate | ?action=housekeeping
 */
export async function GET(req: NextRequest) {
  const auth = await verifyCronAuthorization(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.reason },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const action = (searchParams.get('action') as any) || 'pulse';
    const targetDate = searchParams.get('targetDate') || undefined;
    const forceNext = searchParams.get('force') === 'true';
    const workspaceId = searchParams.get('workspaceId') || undefined;

    const result = await executeAutonomousScheduler({
      action,
      targetDate,
      forceNext,
      workspaceId,
      triggerSource: `vercel_cron_${auth.source}`,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[GET /api/calendar/cron-trigger Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error executing cron' },
      { status: 500 }
    );
  }
}

/**
 * POST Handler: Invoked by automated external systems or operators with valid CRON_SECRET Bearer token
 */
export async function POST(req: NextRequest) {
  const auth = await verifyCronAuthorization(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.reason },
      { status: auth.status }
    );
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is acceptable
    }

    const { searchParams } = new URL(req.url);
    const action = body.action || (searchParams.get('action') as any) || 'pulse';
    const targetDate = body.targetDate || searchParams.get('targetDate') || undefined;
    const forceNext = body.forceNext ?? (searchParams.get('force') === 'true');
    const workspaceId = body.workspaceId || searchParams.get('workspaceId') || undefined;

    const result = await executeAutonomousScheduler({
      action,
      targetDate,
      forceNext,
      workspaceId,
      triggerSource: `cron_post_${auth.source}`,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[POST /api/calendar/cron-trigger Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error executing cron' },
      { status: 500 }
    );
  }
}
