import { NextRequest, NextResponse } from 'next/server';
import { db, workspaces, users, brandProfiles } from '@/db';
import { desc, eq } from 'drizzle-orm';
import { verifyManagementAuth, recordAdminAuditLog } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyManagementAuth(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Access Denied: KUIRO Executive Management Clearance Required.' },
        { status: 403 }
      );
    }
    const database = db;
    if (!database) {
      return NextResponse.json({ success: true, count: 0, workspaces: [] });
    }

    const { searchParams } = new URL(req.url);
    const tier = searchParams.get('tier');
    const search = searchParams.get('search');

    const allWorkspaces = await database
      .select({
        id: workspaces.id,
        name: workspaces.name,
        subscriptionTier: workspaces.subscriptionTier,
        whatsappAdminPhone: workspaces.whatsappAdminPhone,
        ownerId: workspaces.ownerId,
        createdAt: workspaces.createdAt,
      })
      .from(workspaces)
      .orderBy(desc(workspaces.createdAt));

    // Fetch owners and brand profiles to enrich the listing
    const userList = await database.select().from(users);
    const bpList = await database.select().from(brandProfiles);

    const userMap = new Map(userList.map((u) => [u.id, u]));
    const bpMap = new Map(bpList.map((b) => [b.workspaceId, b]));

    let enriched = allWorkspaces.map((ws) => {
      const owner = userMap.get(ws.ownerId);
      const bp = bpMap.get(ws.id);
      return {
        ...ws,
        ownerName: owner?.name || 'Unassigned',
        ownerEmail: owner?.email || 'N/A',
        brandProfile: bp
          ? {
              industry: bp.industry,
              websiteUrl: bp.websiteUrl,
              primaryHex: (bp.visualIdentity as any)?.primaryHex || '#FF7A00',
              fontFamily: (bp.visualIdentity as any)?.fontFamily || 'Sora',
              style: (bp.toneOfVoice as any)?.style || 'professional_warm',
              pillarsCount: Array.isArray(bp.contentPillars) ? bp.contentPillars.length : 0,
            }
          : null,
      };
    });

    if (tier && tier !== 'ALL') {
      enriched = enriched.filter((w) => w.subscriptionTier === tier);
    }
    if (search) {
      const q = search.toLowerCase();
      enriched = enriched.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.ownerName.toLowerCase().includes(q) ||
          w.ownerEmail.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      count: enriched.length,
      workspaces: enriched,
    });
  } catch (error: any) {
    console.error('[API /api/admin/workspaces GET] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyManagementAuth(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Access Denied: KUIRO Executive Management Clearance Required.' },
        { status: 403 }
      );
    }
    const database = db;
    if (!database) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const body = await req.json();
    const { name, ownerEmail, ownerName, subscriptionTier = 'GROWTH', whatsappAdminPhone, industry } = body;

    if (!name || !ownerEmail) {
      return NextResponse.json(
        { error: 'Workspace Name and Owner Email are required.' },
        { status: 400 }
      );
    }

    // 1. Find or create user
    let [owner] = await database.select().from(users).where(eq(users.email, ownerEmail.trim().toLowerCase())).limit(1);
    if (!owner) {
      [owner] = await database
        .insert(users)
        .values({
          name: ownerName?.trim() || ownerEmail.split('@')[0],
          email: ownerEmail.trim().toLowerCase(),
          role: 'Founder',
          emailVerified: true,
        })
        .returning();
    }

    // 2. Create Workspace
    const [newWs] = await database
      .insert(workspaces)
      .values({
        name: name.trim(),
        ownerId: owner.id,
        subscriptionTier,
        whatsappAdminPhone: whatsappAdminPhone || null,
      })
      .returning();

    // 3. Create initial Brand Brain profile
    await database.insert(brandProfiles).values({
      workspaceId: newWs.id,
      industry: industry || 'Professional Healthcare & Diagnostics',
      websiteUrl: '',
      toneOfVoice: {
        style: 'professional_warm',
        formality: 'semi-formal',
        archetype: 'trusted_expert',
        samplePhrases: ['Empathetic', 'Customer-First', 'Accurate'],
      },
      visualIdentity: {
        primaryHex: '#FF7A00',
        secondaryHex: '#0B0F14',
        accentHex: '#10B981',
        fontFamily: 'Sora',
      },
      contentPillars: [
        { name: 'Core Services', weight: 40 },
        { name: 'Patient Success', weight: 30 },
        { name: 'Proactive Health Tips', weight: 30 },
      ],
      negativeConstraints: ['No false medical claims'],
    });

    // Record audit log for workspace creation
    await recordAdminAuditLog({
      operatorEmail: auth.email || 'operator@kuiro.in',
      action: 'ADMIN_CREATE_WORKSPACE',
      resource: `workspace:${newWs.id}`,
      status: 'SUCCESS',
      details: { workspaceId: newWs.id, name: newWs.name, subscriptionTier, ownerEmail },
      req,
    });

    return NextResponse.json({
      success: true,
      message: `Workspace "${newWs.name}" provisioned successfully.`,
      workspace: newWs,
    });
  } catch (error: any) {
    console.error('[API /api/admin/workspaces POST] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create workspace' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyManagementAuth(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Access Denied: KUIRO Executive Management Clearance Required.' },
        { status: 403 }
      );
    }
    const database = db;
    if (!database) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const body = await req.json();
    const { id, name, subscriptionTier, whatsappAdminPhone } = body;

    if (!id) {
      return NextResponse.json({ error: 'Workspace id is required' }, { status: 400 });
    }

    const [updated] = await database
      .update(workspaces)
      .set({
        ...(name ? { name: name.trim() } : {}),
        ...(subscriptionTier ? { subscriptionTier } : {}),
        ...(whatsappAdminPhone !== undefined ? { whatsappAdminPhone } : {}),
      })
      .where(eq(workspaces.id, id))
      .returning();

    // Record audit log for workspace update
    await recordAdminAuditLog({
      operatorEmail: auth.email || 'operator@kuiro.in',
      action: 'ADMIN_UPDATE_WORKSPACE',
      resource: `workspace:${id}`,
      status: 'SUCCESS',
      details: { workspaceId: id, name, subscriptionTier, whatsappAdminPhone },
      req,
    });

    return NextResponse.json({
      success: true,
      message: `Workspace updated successfully.`,
      workspace: updated,
    });
  } catch (error: any) {
    console.error('[API /api/admin/workspaces PATCH] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update workspace' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyManagementAuth(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Access Denied: KUIRO Executive Management Clearance Required.' },
        { status: 403 }
      );
    }
    const database = db;
    if (!database) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Workspace id is required' }, { status: 400 });
    }

    await database.delete(workspaces).where(eq(workspaces.id, id));

    // Record audit log for workspace deletion
    await recordAdminAuditLog({
      operatorEmail: auth.email || 'operator@kuiro.in',
      action: 'ADMIN_DELETE_WORKSPACE',
      resource: `workspace:${id}`,
      status: 'SUCCESS',
      details: { workspaceId: id },
      req,
    });

    return NextResponse.json({
      success: true,
      message: 'Workspace deleted successfully.',
    });
  } catch (error: any) {
    console.error('[API /api/admin/workspaces DELETE] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete workspace' },
      { status: 500 }
    );
  }
}

