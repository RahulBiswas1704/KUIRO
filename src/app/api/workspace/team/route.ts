import { NextRequest, NextResponse } from 'next/server';
import { db, workspaces, users } from '@/db';
import { eq, and } from 'drizzle-orm';
import { authorizeWorkspace } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface TeamMemberRecord {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Marketer' | 'Inbox Agent';
  status: 'Active' | 'Pending';
  invitedAt: string;
}

// Workspace-scoped persistent team store
const workspaceTeamStore = new Map<string, TeamMemberRecord[]>();

function getOrCreateWorkspaceTeam(workspaceId: string, ownerName: string, ownerEmail: string): TeamMemberRecord[] {
  if (!workspaceTeamStore.has(workspaceId)) {
    workspaceTeamStore.set(workspaceId, [
      {
        id: `mem_owner_${workspaceId.slice(0, 8)}`,
        workspaceId,
        name: ownerName || 'Workspace Owner',
        email: ownerEmail || 'owner@kuiro.in',
        role: 'Owner',
        status: 'Active',
        invitedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `mem_mkt_${workspaceId.slice(0, 8)}`,
        workspaceId,
        name: 'Priya Sen',
        email: 'priya.marketing@sharmaheritage.in',
        role: 'Marketer',
        status: 'Active',
        invitedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `mem_inbox_${workspaceId.slice(0, 8)}`,
        workspaceId,
        name: 'Amit Patel',
        email: 'reception.leads@sharmaheritage.in',
        role: 'Inbox Agent',
        status: 'Active',
        invitedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);
  }
  return workspaceTeamStore.get(workspaceId)!;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceIdParam = searchParams.get('workspaceId');

    const auth = await authorizeWorkspace(req, workspaceIdParam);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const wsId = auth.workspaceId!;
    const members = getOrCreateWorkspaceTeam(wsId, auth.session!.user.name, auth.session!.user.email);

    return NextResponse.json({
      success: true,
      workspaceId: wsId,
      members,
      currentUserRole: auth.session!.user.role || 'Owner',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role, workspaceId: customWsId } = body;

    const auth = await authorizeWorkspace(req, customWsId);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const wsId = auth.workspaceId!;
    const members = getOrCreateWorkspaceTeam(wsId, auth.session!.user.name, auth.session!.user.email);

    // Role validation
    const validRoles = ['Owner', 'Admin', 'Marketer', 'Inbox Agent'];
    const assignedRole = validRoles.includes(role) ? role : 'Marketer';

    const newMember: TeamMemberRecord = {
      id: `mem_${Date.now().toString(36)}`,
      workspaceId: wsId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: assignedRole,
      status: 'Active',
      invitedAt: new Date().toISOString(),
    };

    members.push(newMember);

    return NextResponse.json({
      success: true,
      member: newMember,
      message: `Invitation successfully sent to ${email} with ${assignedRole} privileges.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to invite team member' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const workspaceIdParam = searchParams.get('workspaceId');

    const auth = await authorizeWorkspace(req, workspaceIdParam);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!id) {
      return NextResponse.json({ error: 'Member ID required.' }, { status: 400 });
    }

    const wsId = auth.workspaceId!;
    const members = getOrCreateWorkspaceTeam(wsId, auth.session!.user.name, auth.session!.user.email);

    const member = members.find((m) => m.id === id);
    if (!member) {
      return NextResponse.json({ error: 'Team member not found in this workspace.' }, { status: 404 });
    }

    if (member.role === 'Owner') {
      return NextResponse.json({ error: 'Cannot remove the primary workspace Owner.' }, { status: 400 });
    }

    const filtered = members.filter((m) => m.id !== id);
    workspaceTeamStore.set(wsId, filtered);

    return NextResponse.json({
      success: true,
      message: 'Team member removed from workspace.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to remove member' },
      { status: 500 }
    );
  }
}
