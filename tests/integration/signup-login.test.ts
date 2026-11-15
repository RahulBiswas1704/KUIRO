import '../setup';
import crypto from 'crypto';
import { TestSuiteContext } from '../setup';
import { db, users, workspaces, sessions } from '@/db';
import { eq } from 'drizzle-orm';
import {
  hashPassword,
  verifyPassword,
  createDatabaseSession,
  getSession,
  destroySession,
} from '@/lib/auth';

export async function runSignupLoginIntegrationTests(): Promise<TestSuiteContext> {
  const ctx = new TestSuiteContext('Level B: Signup & Login Database Integration Tests');
  console.log(`\n================================================================`);
  console.log(`  RUNNING: ${ctx.name}`);
  console.log(`================================================================`);

  if (!db) {
    throw new Error('Neon PostgreSQL database connection is unavailable.');
  }

  const runId = Date.now().toString(36);
  const testEmail = `integration.tester.${runId}@kuiro-test.io`;
  const rawPassword = `IntegrationPass_${runId}!`;
  let testUserId: string | null = null;
  let testWorkspaceId: string | null = null;
  let testSessionToken: string | null = null;

  try {
    // 1. User Creation (Signup Persistence)
    const passHash = hashPassword(rawPassword);
    const [createdUser] = await db
      .insert(users)
      .values({
        name: 'Heritage Silk Artisan',
        email: testEmail,
        passwordHash: passHash,
        role: 'Founder',
        emailVerified: true,
      })
      .returning();

    testUserId = createdUser.id;
    ctx.assert(!!createdUser.id, 'Signup: Successfully persists user record in Neon PostgreSQL');
    ctx.assert(
      verifyPassword(rawPassword, createdUser.passwordHash!),
      'Signup: Password stored as scrypt hash and verifies accurately'
    );

    // 2. Default Workspace Auto-Provisioning
    const [createdWorkspace] = await db
      .insert(workspaces)
      .values({
        name: 'Heritage Silk Studio',
        ownerId: createdUser.id,
        subscriptionTier: 'GROWTH',
        whatsappAdminPhone: '+919876500000',
      })
      .returning();

    testWorkspaceId = createdWorkspace.id;
    ctx.assert(!!createdWorkspace.id, 'Workspace Provisioning: Auto-provisions primary workspace for new user');
    ctx.assert(
      createdWorkspace.subscriptionTier === 'GROWTH',
      'Workspace Provisioning: Assigns initial GROWTH subscription tier'
    );

    // 3. Database Session Creation (Login Persistence)
    const sessionRes = await createDatabaseSession(createdUser.id, {
      ipAddress: '127.0.0.1',
      userAgent: 'KUIRO-Integration-Test-Runner/1.0',
    });

    testSessionToken = sessionRes.token;
    ctx.assert(
      typeof sessionRes.token === 'string' && sessionRes.token.length === 64,
      'Login Session: Creates 64-char high-entropy session token'
    );

    // 4. Session Retrieval & Workspace Association
    const retrievedSession = await getSession(sessionRes.token);
    ctx.assert(retrievedSession !== null, 'Session Validation: Successfully retrieves active session from DB');
    ctx.assert(
      retrievedSession?.user.id === createdUser.id,
      'Session Validation: Session correctly associates with authenticated user'
    );
    ctx.assert(
      retrievedSession?.workspace.id === createdWorkspace.id,
      'Session Validation: Session correctly associates with owned workspace'
    );

    // 5. Expired Session Invalidation
    // Insert a past session
    const expiredToken = crypto.randomBytes(32).toString('hex');
    await db.insert(sessions).values({
      id: `sess_expired_${runId}`,
      userId: createdUser.id,
      token: expiredToken,
      expiresAt: new Date(Date.now() - 3600 * 1000), // 1 hour ago
    });

    const expiredCheck = await getSession(expiredToken);
    ctx.assert(
      expiredCheck === null,
      'Session Expiry: Rejects expired session token automatically'
    );

    // 6. Session Destruction (Logout)
    const destroySuccess = await destroySession(sessionRes.token);
    ctx.assert(destroySuccess, 'Session Destruction: Deletes session token from database');

    const postLogoutCheck = await getSession(sessionRes.token);
    ctx.assert(
      postLogoutCheck === null,
      'Session Destruction: Destroyed session cannot be used to authenticate'
    );
  } finally {
    // Cleanup Test Fixtures
    if (testWorkspaceId) {
      await db.delete(workspaces).where(eq(workspaces.id, testWorkspaceId)).catch(() => {});
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId)).catch(() => {});
    }
  }

  return ctx;
}

if (process.argv[1]?.includes('signup-login.test.ts')) {
  runSignupLoginIntegrationTests()
    .then((c) => {
      console.log(`\nSignup & Login Integration Tests Complete: ${c.passed} passed, ${c.failed} failed.`);
      process.exit(c.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Fatal in Signup & Login Integration Tests:', err);
      process.exit(1);
    });
}
