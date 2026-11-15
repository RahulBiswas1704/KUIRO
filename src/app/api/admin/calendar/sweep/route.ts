import { NextRequest, NextResponse } from 'next/server';
import { verifyManagementAuth } from '@/lib/adminAuth';
import { executeAutonomousScheduler } from '@/lib/scheduler';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Platform Operator Admin Radar Sweep Endpoint
 * Triggered from the KUIRO Platform Management Console
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyManagementAuth(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.reason || 'Access Denied: Platform operator clearance required.' },
        { status: 403 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is acceptable
    }

    const { searchParams } = new URL(req.url);
    const action = body.action || (searchParams.get('action') as any) || 'all';
    const targetDate = body.targetDate || searchParams.get('targetDate') || undefined;
    const forceNext = body.forceNext ?? (searchParams.get('force') === 'true');
    const workspaceId = body.workspaceId || searchParams.get('workspaceId') || undefined;

    const result = await executeAutonomousScheduler({
      action,
      targetDate,
      forceNext,
      workspaceId,
      triggerSource: `admin_operator_${auth.email || 'console'}`,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[POST /api/admin/calendar/sweep Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error executing admin sweep' },
      { status: 500 }
    );
  }
}
