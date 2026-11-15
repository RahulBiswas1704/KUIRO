import { NextRequest, NextResponse } from 'next/server';
import { db, systemAlerts } from '@/db';
import { eq, desc, and } from 'drizzle-orm';
import { getSessionFromRequest } from '@/lib/auth';
import { verifyManagementAuth } from '@/lib/adminAuth';
import { logger } from '@/lib/observability/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * System Alerts Management & Audit API
 * Route: GET /api/admin/alerts - List active/resolved alerts with multi-tenant filtering
 * Route: PATCH /api/admin/alerts - Acknowledge or Resolve an alert
 */
export async function GET(req: NextRequest) {
  // Authorization: Operator management auth or active session
  const mgmtAuth = await verifyManagementAuth(req);
  const session = await getSessionFromRequest(req);

  if (!mgmtAuth.authorized && !session) {
    return NextResponse.json({ error: 'Unauthorized: Operator credentials or valid session required' }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get('status'); // e.g. "OPEN", "ACKNOWLEDGED", "RESOLVED"
  const categoryParam = searchParams.get('category');
  const severityParam = searchParams.get('severity');
  const workspaceIdParam = searchParams.get('workspaceId');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

  try {
    const conditions = [];

    if (statusParam) {
      conditions.push(eq(systemAlerts.status, statusParam as any));
    }
    if (categoryParam) {
      conditions.push(eq(systemAlerts.category, categoryParam));
    }
    if (severityParam) {
      conditions.push(eq(systemAlerts.severity, severityParam as any));
    }
    if (workspaceIdParam) {
      conditions.push(eq(systemAlerts.workspaceId, workspaceIdParam));
    }

    const query = db
      .select()
      .from(systemAlerts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(systemAlerts.createdAt))
      .limit(limit);

    const alerts = await query;

    return NextResponse.json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (err: unknown) {
    logger.error('failed_to_fetch_alerts', {
      service: 'alert-manager',
      event: 'alerts_query_error',
      err,
    });
    return NextResponse.json({ error: 'Failed to retrieve system alerts' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const mgmtAuth = await verifyManagementAuth(req);
  const session = await getSessionFromRequest(req);

  if (!mgmtAuth.authorized && !session) {
    return NextResponse.json({ error: 'Unauthorized: Operator credentials or valid session required' }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status || !['ACKNOWLEDGED', 'RESOLVED', 'OPEN'].includes(status)) {
      return NextResponse.json(
        { error: 'Missing or invalid id/status (must be OPEN, ACKNOWLEDGED, or RESOLVED)' },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(systemAlerts)
      .set({
        status,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
      })
      .where(eq(systemAlerts.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    logger.info('alert_status_updated', {
      service: 'alert-manager',
      event: 'alert_status_changed',
      metadata: {
        alertId: id,
        newStatus: status,
        updatedBy: session?.user?.email || mgmtAuth.email || 'system',
      },
    });

    return NextResponse.json({
      success: true,
      alert: updated,
    });
  } catch (err: unknown) {
    logger.error('failed_to_update_alert', {
      service: 'alert-manager',
      event: 'alert_update_error',
      err,
    });
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}
