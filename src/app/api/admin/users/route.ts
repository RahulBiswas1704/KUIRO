import { NextRequest, NextResponse } from 'next/server';
import { db, users, workspaces, sessions } from '@/db';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const database = db;
    if (!database) {
      return NextResponse.json({ success: true, count: 0, users: [] });
    }

    const allUsers = await database
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        image: users.image,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    // Get active sessions and workspaces for users
    const [allWorkspaces, allSessions] = await Promise.all([
      database.select().from(workspaces),
      database.select().from(sessions),
    ]);

    const enriched = allUsers.map((u) => {
      const userWs = allWorkspaces.filter((w) => w.ownerId === u.id);
      const userSessions = allSessions.filter((s) => s.userId === u.id);
      return {
        ...u,
        workspacesCount: userWs.length,
        workspaces: userWs.map((w) => ({ id: w.id, name: w.name, tier: w.subscriptionTier })),
        activeSessionsCount: userSessions.length,
        lastSessionAgent: userSessions[0]?.userAgent || 'None',
      };
    });

    return NextResponse.json({
      success: true,
      count: enriched.length,
      users: enriched,
    });
  } catch (error: any) {
    console.error('[API /api/admin/users GET] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const database = db;
    if (!database) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const body = await req.json();
    const { id, role, emailVerified, name } = body;

    if (!id) {
      return NextResponse.json({ error: 'User id is required' }, { status: 400 });
    }

    const [updated] = await database
      .update(users)
      .set({
        ...(role !== undefined ? { role } : {}),
        ...(emailVerified !== undefined ? { emailVerified } : {}),
        ...(name ? { name: name.trim() } : {}),
      })
      .where(eq(users.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: `User ${updated.name} updated.`,
      user: updated,
    });
  } catch (error: any) {
    console.error('[API /api/admin/users PATCH] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const database = db;
    if (!database) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User id is required' }, { status: 400 });
    }

    await database.delete(users).where(eq(users.id, id));

    return NextResponse.json({
      success: true,
      message: 'User and associated sessions removed.',
    });
  } catch (error: any) {
    console.error('[API /api/admin/users DELETE] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
