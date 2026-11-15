import '../setup';
import { TestSuiteContext } from '../setup';
import { db, users, workspaces, workspaceMembers, scheduledCampaigns, conversations, sessions } from '@/db';
import { eq, and } from 'drizzle-orm';
import {
  hashPassword,
  createDatabaseSession,
  findWorkspaceMembership,
  authorizeWorkspace,
} from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function runTenantIsolationIntegrationTests(): Promise<TestSuiteContext> {
  const ctx = new TestSuiteContext('Level B: Multi-Tenant Isolation & Zero Data Leakage Integration Tests');
  console.log(`\n================================================================`);
  console.log(`  RUNNING: ${ctx.name}`);
  console.log(`================================================================`);

  if (!db) {
    throw new Error('Neon PostgreSQL database connection is unavailable.');
  }

  const runId = Date.now().toString(36);
  let userAId: string | null = null;
  let userBId: string | null = null;
  let memberCId: string | null = null;
  let wsAId: string | null = null;
  let wsBId: string | null = null;
  let campaignAId: string | null = null;
  let conversationAId: string | null = null;
  let sessionBToken: string | null = null;

  try {
    // 1. Provision Tenant A & Tenant B in Neon PostgreSQL
    const [userA] = await db
      .insert(users)
      .values({
        name: 'Tenant A Founder',
        email: `tenant.a.${runId}@kuiro-test.io`,
        passwordHash: hashPassword('TenantPassA123!'),
        role: 'Founder',
        emailVerified: true,
      })
      .returning();
    userAId = userA.id;

    const [wsA] = await db
      .insert(workspaces)
      .values({
        name: `Tenant A Workspace (${runId})`,
        ownerId: userA.id,
        subscriptionTier: 'GROWTH',
      })
      .returning();
    wsAId = wsA.id;

    const [userB] = await db
      .insert(users)
      .values({
        name: 'Tenant B Founder',
        email: `tenant.b.${runId}@kuiro-test.io`,
        passwordHash: hashPassword('TenantPassB123!'),
        role: 'Founder',
        emailVerified: true,
      })
      .returning();
    userBId = userB.id;

    const [wsB] = await db
      .insert(workspaces)
      .values({
        name: `Tenant B Workspace (${runId})`,
        ownerId: userB.id,
        subscriptionTier: 'STARTER',
      })
      .returning();
    wsBId = wsB.id;

    // Create session for User B
    const sessB = await createDatabaseSession(userB.id);
    sessionBToken = sessB.token;

    ctx.assert(!!userAId && !!userBId && !!wsAId && !!wsBId, 'Tenant Setup: Successfully created isolated Tenant A and Tenant B entities');

    // 2. Populate Tenant A Private Resources
    const [campA] = await db
      .insert(scheduledCampaigns)
      .values({
        workspaceId: wsA.id,
        triggerType: 'FESTIVAL',
        topicSummary: 'Tenant A Diwali Silk Sarees Promotion',
        status: 'REVIEW_PENDING',
        generateAt: new Date(),
        publishAt: new Date(Date.now() + 48 * 3600 * 1000),
      })
      .returning();
    campaignAId = campA.id;

    const [convA] = await db
      .insert(conversations)
      .values({
        workspaceId: wsA.id,
        channel: 'whatsapp',
        customerName: 'Ananya Roy',
        customerHandle: '+919830012345',
        status: 'OPEN',
        priority: 'NORMAL',
        lastMessageText: 'Can I see the Banarasi silk bridal collection in pink?',
        updatedAt: new Date(),
      })
      .returning();
    conversationAId = convA.id;

    ctx.assert(!!campA.id && !!convA.id, 'Tenant A Data: Seeded campaign and conversation strictly belonging to Tenant A');

    // 3. Workspace Membership Verification
    const membershipA = await findWorkspaceMembership(userA.id, wsA.id);
    ctx.assert(membershipA !== null && membershipA.role === 'OWNER', 'Membership: User A verified as OWNER of Workspace A');

    const membershipB = await findWorkspaceMembership(userB.id, wsB.id);
    ctx.assert(membershipB !== null && membershipB.role === 'OWNER', 'Membership: User B verified as OWNER of Workspace B');

    const crossMembership = await findWorkspaceMembership(userB.id, wsA.id);
    ctx.assert(crossMembership === null, 'Tenant Isolation: User B has null membership for Workspace A');

    // 4. API Request Authorization & Cross-Tenant Access Rejection
    const crossTenantReq = new NextRequest('http://localhost:3000/api/campaigns', {
      headers: {
        authorization: `Bearer ${sessionBToken}`,
      },
    });

    const crossTenantAuth = await authorizeWorkspace(crossTenantReq, wsA.id);
    ctx.assert(!crossTenantAuth.authorized, 'Tenant Isolation: authorizeWorkspace rejects User B accessing Workspace A');
    ctx.assert(crossTenantAuth.status === 403, 'Tenant Isolation: Returns HTTP 403 Forbidden on cross-tenant access attempt');
    ctx.assert(
      crossTenantAuth.error?.includes('Tenant isolation violation') === true,
      'Tenant Isolation: Surfaces explicit tenant isolation violation reason'
    );

    // 5. Query Partitioning (Zero Data Leakage)
    const tenantBCampaigns = await db
      .select()
      .from(scheduledCampaigns)
      .where(eq(scheduledCampaigns.workspaceId, wsB.id));
    ctx.assert(tenantBCampaigns.length === 0, 'Zero Data Leakage: Tenant B queries return 0 campaigns (Tenant A campaigns invisible)');

    const tenantBConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.workspaceId, wsB.id));
    ctx.assert(tenantBConversations.length === 0, 'Zero Data Leakage: Tenant B queries return 0 conversations (Tenant A conversations invisible)');

    // 6. Role-Based Access Control within Workspace A
    const [memberC] = await db
      .insert(users)
      .values({
        name: 'Agency Staff Marketer',
        email: `marketer.c.${runId}@kuiro-test.io`,
        passwordHash: hashPassword('MarketerPassC123!'),
        role: 'Marketer',
        emailVerified: true,
      })
      .returning();
    memberCId = memberC.id;

    await db.insert(workspaceMembers).values({
      workspaceId: wsA.id,
      userId: memberC.id,
      role: 'MARKETER',
    });

    const staffMembership = await findWorkspaceMembership(memberC.id, wsA.id);
    ctx.assert(staffMembership !== null && (staffMembership.role as any) === 'MARKETER', 'RBAC: Staff member correctly resolves role MARKETER in Workspace A');
  } finally {
    // Cleanup Test Fixtures
    if (campaignAId) {
      await db.delete(scheduledCampaigns).where(eq(scheduledCampaigns.id, campaignAId)).catch(() => {});
    }
    if (conversationAId) {
      await db.delete(conversations).where(eq(conversations.id, conversationAId)).catch(() => {});
    }
    if (wsAId) {
      await db.delete(workspaces).where(eq(workspaces.id, wsAId)).catch(() => {});
    }
    if (wsBId) {
      await db.delete(workspaces).where(eq(workspaces.id, wsBId)).catch(() => {});
    }
    if (userAId) {
      await db.delete(users).where(eq(users.id, userAId)).catch(() => {});
    }
    if (userBId) {
      await db.delete(users).where(eq(users.id, userBId)).catch(() => {});
    }
    if (memberCId) {
      await db.delete(users).where(eq(users.id, memberCId)).catch(() => {});
    }
  }

  return ctx;
}

if (process.argv[1]?.includes('tenant-isolation.test.ts')) {
  runTenantIsolationIntegrationTests()
    .then((c) => {
      console.log(`\nTenant Isolation Integration Tests Complete: ${c.passed} passed, ${c.failed} failed.`);
      process.exit(c.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Fatal in Tenant Isolation Integration Tests:', err);
      process.exit(1);
    });
}
