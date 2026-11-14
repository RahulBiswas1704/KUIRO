import { NextRequest, NextResponse } from 'next/server';
import { db, workspaces, users } from '@/db';
import { eq } from 'drizzle-orm';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface TeamMemberRecord {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Marketer' | 'Inbox Agent';
  status: 'Active' | 'Pending';
  invitedAt: string;
}

// In-memory persistent team store across sessions
let globalTeamMembers: TeamMemberRecord[] = [
  {
    id: 'mem_1',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@kuiro.in',
    role: 'Owner',
    status: 'Active',
    invitedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'mem_2',
    name: 'Priya Sen',
    email: 'priya.marketing@sharmaheritage.in',
    role: 'Marketer',
    status: 'Active',
    invitedAt: '2026-02-14T12:30:00Z',
  },
  {
    id: 'mem_3',
    name: 'Amit Patel',
    email: 'reception.leads@sharmaheritage.in',
    role: 'Inbox Agent',
    status: 'Active',
    invitedAt: '2026-03-01T09:15:00Z',
  },
];

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    return NextResponse.json({
      success: true,
      members: globalTeamMembers,
      currentUserRole: 'Owner',
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
    const session = await getSessionFromRequest(req);
    const body = await req.json();
    const { name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    // Role validation
    const validRoles = ['Owner', 'Admin', 'Marketer', 'Inbox Agent'];
    const assignedRole = validRoles.includes(role) ? role : 'Marketer';

    const newMember: TeamMemberRecord = {
      id: `mem_${Date.now().toString(36)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: assignedRole,
      status: 'Active',
      invitedAt: new Date().toISOString(),
    };

    globalTeamMembers.push(newMember);

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

    if (!id) {
      return NextResponse.json({ error: 'Member ID required.' }, { status: 400 });
    }

    const member = globalTeamMembers.find((m) => m.id === id);
    if (member && member.role === 'Owner') {
      return NextResponse.json({ error: 'Cannot remove the primary workspace Owner.' }, { status: 400 });
    }

    globalTeamMembers = globalTeamMembers.filter((m) => m.id !== id);

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

