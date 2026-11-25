import { NextRequest, NextResponse } from 'next/server';
import { db, inboxAutomations } from '@/db';
import { eq, and, desc } from 'drizzle-orm';
import { authorizeWorkspace } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type TriggerType = 'KEYWORD' | 'OFF_HOURS' | 'NEW_CONVERSATION' | 'CAMPAIGN_REPLY';
type ChannelFilter = 'whatsapp' | 'instagram' | 'messenger' | 'email' | 'all';

function formatDbRule(row: typeof inboxAutomations.$inferSelect) {
  const kwText = row.keywords?.length ? ` (${row.keywords.join(', ')})` : '';
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    name: row.name,
    description:
      row.triggerType === 'KEYWORD'
        ? `Automatically triggers on ${row.channel.toUpperCase()} when inbound message matches keywords${kwText}`
        : `Automated ${row.triggerType.toLowerCase().replace(/_/g, ' ')} routing rule on ${row.channel.toUpperCase()}`,
    triggerType: row.triggerType,
    channel: row.channel,
    keywords: row.keywords || [],
    conditions: row.conditions || 'contains',
    actions: row.actions || [],
    enabled: row.enabled,
    triggerCount: row.triggerCount,
    persistedInDb: true,
  };
}

/**
 * GET /api/inbox/automations
 * Returns all persisted keyword & routing automation rules for the authorized workspace.
 */
export async function GET(req: NextRequest) {
  try {
    const workspaceIdParam = req.nextUrl.searchParams.get('workspaceId');
    const auth = await authorizeWorkspace(req, workspaceIdParam);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database connection unavailable.' }, { status: 503 });
    }

    const rows = await db
      .select()
      .from(inboxAutomations)
      .where(eq(inboxAutomations.workspaceId, auth.workspaceId!))
      .orderBy(desc(inboxAutomations.createdAt));

    return NextResponse.json({
      success: true,
      workspaceId: auth.workspaceId,
      rules: rows.map(formatDbRule),
    });
  } catch (err: any) {
    console.error('[Inbox Automations GET Error]:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to load automation rules.' }, { status: 500 });
  }
}

/**
 * POST /api/inbox/automations
 * Creates a new keyword auto-responder or smart routing rule in Neon PostgreSQL.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      triggerType = 'KEYWORD',
      channel = 'all',
      keywords = [],
      conditions = 'contains',
      actions = [],
      enabled = true,
      workspaceId: customWsId,
    } = body;

    const auth = await authorizeWorkspace(req, customWsId);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database connection unavailable.' }, { status: 503 });
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Automation rule name is required.' }, { status: 400 });
    }

    const validTriggers: TriggerType[] = ['KEYWORD', 'OFF_HOURS', 'NEW_CONVERSATION', 'CAMPAIGN_REPLY'];
    const validChannels: ChannelFilter[] = ['whatsapp', 'instagram', 'messenger', 'email', 'all'];

    const normalizedTrigger: TriggerType = validTriggers.includes(triggerType) ? triggerType : 'KEYWORD';
    const normalizedChannel: ChannelFilter = validChannels.includes(channel) ? channel : 'all';

    const cleanKeywords: string[] = Array.isArray(keywords)
      ? keywords.map((k) => String(k).trim().toLowerCase()).filter(Boolean)
      : String(keywords || '')
          .split(',')
          .map((k) => k.trim().toLowerCase())
          .filter(Boolean);

    if (normalizedTrigger === 'KEYWORD' && cleanKeywords.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one trigger keyword is required for KEYWORD rules.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one automated action is required.' },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(inboxAutomations)
      .values({
        workspaceId: auth.workspaceId!,
        name: name.trim(),
        triggerType: normalizedTrigger,
        channel: normalizedChannel,
        keywords: cleanKeywords,
        conditions: conditions === 'exact' ? 'exact' : 'contains',
        actions,
        enabled: Boolean(enabled),
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        rule: formatDbRule(created),
        message: `Automation rule "${created.name}" saved and activated.`,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[Inbox Automations POST Error]:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to create automation rule.' }, { status: 500 });
  }
}

/**
 * PATCH /api/inbox/automations
 * Toggles enabled state or updates an automation rule strictly within the authorized workspace.
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, enabled, name, keywords, conditions, actions, workspaceId: customWsId } = body;

    const auth = await authorizeWorkspace(req, customWsId);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database connection unavailable.' }, { status: 503 });
    }

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ success: false, error: 'Rule ID is required.' }, { status: 400 });
    }

    const updates: Partial<typeof inboxAutomations.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (typeof enabled === 'boolean') updates.enabled = enabled;
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (Array.isArray(keywords)) {
      updates.keywords = keywords.map((k) => String(k).trim().toLowerCase()).filter(Boolean);
    }
    if (typeof conditions === 'string' && conditions.trim()) {
      updates.conditions = conditions === 'exact' ? 'exact' : 'contains';
    }
    if (Array.isArray(actions) && actions.length > 0) {
      updates.actions = actions;
    }

    const [updated] = await db
      .update(inboxAutomations)
      .set(updates)
      .where(
        and(
          eq(inboxAutomations.id, id),
          eq(inboxAutomations.workspaceId, auth.workspaceId!)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Automation rule not found in this workspace.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      rule: formatDbRule(updated),
      message: `Rule "${updated.name}" ${updated.enabled ? 'enabled' : 'paused'}.`,
    });
  } catch (err: any) {
    console.error('[Inbox Automations PATCH Error]:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update automation rule.' }, { status: 500 });
  }
}

/**
 * DELETE /api/inbox/automations?id={ruleId}
 * Permanently removes a custom automation rule from the authorized workspace.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const workspaceIdParam = searchParams.get('workspaceId');

    const auth = await authorizeWorkspace(req, workspaceIdParam);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database connection unavailable.' }, { status: 503 });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Rule ID is required.' }, { status: 400 });
    }

    const deleted = await db
      .delete(inboxAutomations)
      .where(
        and(
          eq(inboxAutomations.id, id),
          eq(inboxAutomations.workspaceId, auth.workspaceId!)
        )
      )
      .returning({ id: inboxAutomations.id });

    if (deleted.length === 0) {
      return NextResponse.json({ success: false, error: 'Automation rule not found in this workspace.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Automation rule permanently deleted.',
    });
  } catch (err: any) {
    console.error('[Inbox Automations DELETE Error]:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to delete automation rule.' }, { status: 500 });
  }
}
