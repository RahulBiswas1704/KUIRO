import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, authorizeWorkspace } from '@/lib/auth';
import { executeAutonomousScheduler } from '@/lib/scheduler';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Tenant Radar Scan Endpoint
 * Triggered by customer dashboard users to evaluate upcoming events for their workspace.
 * Strict Tenant Isolation: scoped strictly to the authenticated user's workspace.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in to scan radar.' },
        { status: 401 }
      );
    }

    const wsAuth = await authorizeWorkspace(req, session.workspace?.id);
    if (!wsAuth.authorized || !wsAuth.workspaceId) {
      return NextResponse.json(
        { success: false, error: wsAuth.error || 'Access Denied: You do not have access to this workspace.' },
        { status: wsAuth.status || 403 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is acceptable
    }

    const { searchParams } = new URL(req.url);
    const targetDate = body.targetDate || searchParams.get('targetDate') || undefined;
    const forceNext = body.forceNext ?? (searchParams.get('force') === 'true');

    // Scoped strictly to the authenticated user's workspace!
    const result = await executeAutonomousScheduler({
      action: 'generate',
      targetDate,
      forceNext,
      workspaceId: wsAuth.workspaceId,
      triggerSource: `tenant_dashboard_${session.user.id}`,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[POST /api/calendar/radar-scan Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to execute radar scan for workspace' },
      { status: 500 }
    );
  }
}
