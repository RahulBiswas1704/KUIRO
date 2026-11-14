import { NextRequest, NextResponse } from 'next/server';
import { verifyManagementAuth, getAdminAuditLogs, recordAdminAuditLog } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyManagementAuth(req);
    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access Denied: KUIRO Platform Operator Clearance Required.',
          code: auth.errorCode,
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    const logs = await getAdminAuditLogs(limit);

    // Record that audit logs were viewed
    await recordAdminAuditLog({
      operatorEmail: auth.email || 'operator@kuiro.in',
      action: 'VIEW_AUDIT_LOGS',
      resource: '/api/admin/audit-logs',
      status: 'SUCCESS',
      details: { limit, retrievedCount: logs.length },
      req,
    });

    return NextResponse.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error: any) {
    console.error('[API /api/admin/audit-logs Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
