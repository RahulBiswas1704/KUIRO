import { NextRequest, NextResponse } from 'next/server';
import { db, workspaces, users, workspaceMembers } from '@/db';
import { eq, and } from 'drizzle-orm';
import { authorizeWorkspace } from '@/lib/auth';
import { sendTeamInvitationEmail, createTeamInviteToken } from '@/lib/email/invitation';

export const dynamic = 'force-dynamic';

export type UIRole = 'Owner' | 'Admin' | 'Marketer' | 'Inbox Agent';
export type DBRole = 'OWNER' | 'ADMIN' | 'MARKETER' | 'INBOX_AGENT';

function toDbRole(uiRole: string): DBRole {
  const normalized = uiRole.trim().toLowerCase();
  if (normalized === 'owner') return 'OWNER';
  if (normalized === 'admin') return 'ADMIN';
  if (normalized === 'inbox agent' || normalized === 'inbox_agent') return 'INBOX_AGENT';
  return 'MARKETER';
}

function toUiRole(dbRole: string): UIRole {
  switch (dbRole) {
    case 'OWNER':
      return 'Owner';
    case 'ADMIN':
      return 'Admin';
    case 'INBOX_AGENT':
      return 'Inbox Agent';
    default:
      return 'Marketer';
  }
}

/**
 * Ensures the primary workspace owner is present in the workspace_members table.
 */
async function ensureWorkspaceOwnerSeeded(workspaceId: string, ownerId: string) {
  if (!db || !workspaceId || !ownerId) return;

  try {
    const [existingOwnerMember] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, ownerId)
        )
      )
      .limit(1);

    if (!existingOwnerMember) {
      await db.insert(workspaceMembers).values({
        workspaceId,
        userId: ownerId,
        role: 'OWNER',
      });
    }
  } catch (err) {
    console.warn('[WorkspaceTeam] Owner seed check notice:', err);
  }
}

/**
 * GET /api/workspace/team
 * Retrieves all registered team members for the authorized workspace from Neon PostgreSQL.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceIdParam = searchParams.get('workspaceId');

    const auth = await authorizeWorkspace(req, workspaceIdParam);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const wsId = auth.workspaceId!;
    const database = db;

    if (!database) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 500 });
    }

    // 1. Fetch workspace and owner
    const [ws] = await database
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, wsId))
      .limit(1);

    if (!ws) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Ensure owner record exists in workspace_members
    await ensureWorkspaceOwnerSeeded(wsId, ws.ownerId);

    // 2. Fetch all members with user profiles from Neon PostgreSQL
    const memberRows = await database
      .select({
        memberId: workspaceMembers.id,
        workspaceId: workspaceMembers.workspaceId,
        role: workspaceMembers.role,
        createdAt: workspaceMembers.createdAt,
        userId: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, wsId));

    const formattedMembers = memberRows.map((m) => ({
      id: m.memberId,
      workspaceId: m.workspaceId,
      name: m.name,
      email: m.email,
      role: toUiRole(m.role),
      status: m.emailVerified ? 'Active' : 'Pending',
      invitedAt: m.createdAt ? m.createdAt.toISOString() : new Date().toISOString(),
    }));

    // Find current user's role in this workspace
    const currentUserMembership = memberRows.find((m) => m.userId === auth.session!.user.id);
    const currentUserRole = currentUserMembership ? toUiRole(currentUserMembership.role) : (auth.session!.user.id === ws.ownerId ? 'Owner' : 'Marketer');

    return NextResponse.json({
      success: true,
      workspaceId: wsId,
      members: formattedMembers,
      currentUserRole,
    });
  } catch (error: any) {
    console.error('[WorkspaceTeam GET Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspace/team
 * Invites a new team member, saves to Neon DB, and dispatches a Resend invitation email.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role = 'Marketer', workspaceId: customWsId } = body;

    const auth = await authorizeWorkspace(req, customWsId);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Valid team member name is required.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    const wsId = auth.workspaceId!;
    const database = db;

    if (!database) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 500 });
    }

    // Verify workspace exists
    const [ws] = await database
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, wsId))
      .limit(1);

    if (!ws) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Role check: Only Owner or Admin can invite members
    const [requesterMembership] = await database
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, wsId),
          eq(workspaceMembers.userId, auth.session!.user.id)
        )
      )
      .limit(1);

    const isOwner = auth.session!.user.id === ws.ownerId || requesterMembership?.role === 'OWNER';
    const isAdmin = requesterMembership?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Only workspace Owners and Admins can invite team members.' },
        { status: 403 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const dbRole = toDbRole(role);
    const uiRole = toUiRole(dbRole);

    // 1. Look up or provision user in Neon users table
    let [targetUser] = await database
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);

    if (!targetUser) {
      const [createdUser] = await database
        .insert(users)
        .values({
          name: cleanName,
          email: cleanEmail,
          role: uiRole,
          emailVerified: false,
        })
        .returning();
      targetUser = createdUser;
    }

    // 2. Check if already a member of this workspace
    const [existingMember] = await database
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, wsId),
          eq(workspaceMembers.userId, targetUser.id)
        )
      )
      .limit(1);

    if (existingMember) {
      return NextResponse.json(
        { error: `User (${cleanEmail}) is already a member of this workspace with role: ${toUiRole(existingMember.role)}.` },
        { status: 409 }
      );
    }

    // 3. Insert into workspace_members table
    const [newMembership] = await database
      .insert(workspaceMembers)
      .values({
        workspaceId: wsId,
        userId: targetUser.id,
        role: dbRole,
      })
      .returning();

    // 4. Generate Cryptographically Signed Invite Token & Trigger Resend Invitation Email
    const inviteToken = createTeamInviteToken({
      workspaceId: wsId,
      userId: targetUser.id,
      email: cleanEmail,
      role: uiRole,
    });

    const emailResult = await sendTeamInvitationEmail({
      toEmail: cleanEmail,
      inviteeName: cleanName,
      inviterName: auth.session!.user.name || 'Workspace Administrator',
      inviterEmail: auth.session!.user.email || 'noreply@kuiro.in',
      workspaceName: ws.name,
      role: uiRole,
      inviteToken,
    });

    const newMemberRecord = {
      id: newMembership.id,
      workspaceId: wsId,
      name: cleanName,
      email: cleanEmail,
      role: uiRole,
      status: targetUser.emailVerified ? 'Active' : 'Pending',
      invitedAt: newMembership.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      member: newMemberRecord,
      emailSent: emailResult.success,
      message: emailResult.success
        ? `Invitation successfully sent to ${cleanEmail} with ${uiRole} privileges.`
        : `Team member added to workspace. (Email notification queued)`,
    });
  } catch (error: any) {
    console.error('[WorkspaceTeam POST Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to invite team member' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workspace/team?id={memberId}
 * Removes a member from the workspace in Neon PostgreSQL.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('id');
    const workspaceIdParam = searchParams.get('workspaceId');

    const auth = await authorizeWorkspace(req, workspaceIdParam);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required.' }, { status: 400 });
    }

    const wsId = auth.workspaceId!;
    const database = db;

    if (!database) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 500 });
    }

    // 1. Fetch member to remove
    const [targetMember] = await database
      .select({
        id: workspaceMembers.id,
        role: workspaceMembers.role,
        userId: workspaceMembers.userId,
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.id, memberId),
          eq(workspaceMembers.workspaceId, wsId)
        )
      )
      .limit(1);

    if (!targetMember) {
      return NextResponse.json({ error: 'Team member not found in this workspace.' }, { status: 404 });
    }

    // 2. Fetch workspace to verify owner protection
    const [ws] = await database
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, wsId))
      .limit(1);

    if (targetMember.userId === ws?.ownerId || targetMember.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot remove the primary workspace Owner from the team.' },
        { status: 400 }
      );
    }

    // 3. Permission check: requester must be Owner or Admin
    const [requesterMembership] = await database
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, wsId),
          eq(workspaceMembers.userId, auth.session!.user.id)
        )
      )
      .limit(1);

    const isOwner = auth.session!.user.id === ws?.ownerId || requesterMembership?.role === 'OWNER';
    const isAdmin = requesterMembership?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Only workspace Owners and Admins can remove team members.' },
        { status: 403 }
      );
    }

    // 4. Delete member from workspace_members
    await database
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.id, memberId),
          eq(workspaceMembers.workspaceId, wsId)
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Team member successfully removed from workspace.',
    });
  } catch (error: any) {
    console.error('[WorkspaceTeam DELETE Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove member' },
      { status: 500 }
    );
  }
}
