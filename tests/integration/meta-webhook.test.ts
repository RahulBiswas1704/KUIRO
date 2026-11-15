import '../setup';
import crypto from 'crypto';
import { TestSuiteContext } from '../setup';
import { db, users, workspaces, conversations, inboxMessages } from '@/db';
import { eq, and } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';
import {
  ingestInboundMessage,
  dispatchOutboundReply,
  checkMessagingWindow,
} from '@/lib/inbox/dispatchService';

export async function runMetaWebhookIntegrationTests(): Promise<TestSuiteContext> {
  const ctx = new TestSuiteContext('Level B: Meta Webhook Ingestion & Anti-Replay Integration Tests');
  console.log(`\n================================================================`);
  console.log(`  RUNNING: ${ctx.name}`);
  console.log(`================================================================`);

  if (!db) {
    throw new Error('Neon PostgreSQL database connection is unavailable.');
  }

  const runId = Date.now().toString(36);
  let testUserId: string | null = null;
  let testWorkspaceId: string | null = null;
  let createdConversationId: string | null = null;

  try {
    // 1. Provision Test Workspace
    const [user] = await db
      .insert(users)
      .values({
        name: 'Sharma Boutique Owner',
        email: `boutique.owner.${runId}@kuiro-test.io`,
        passwordHash: hashPassword('BoutiquePass123!'),
        role: 'Founder',
        emailVerified: true,
      })
      .returning();
    testUserId = user.id;

    const [ws] = await db
      .insert(workspaces)
      .values({
        name: `Sharma Silk Boutique (${runId})`,
        ownerId: user.id,
        subscriptionTier: 'GROWTH',
        whatsappAdminPhone: '+919876543210',
      })
      .returning();
    testWorkspaceId = ws.id;

    ctx.assert(!!testWorkspaceId, 'Webhook Fixture: Created test workspace and owner user');

    // 2. Inbound WhatsApp Message Ingestion
    const providerMessageId = `wamid.HBgL${runId}_${crypto.randomBytes(4).toString('hex')}`;
    const customerPhone = '+919811223344';
    const customerText = 'Hello! Do you have handloom Katan silk sarees available in royal blue?';

    const ingestResult = await ingestInboundMessage({
      workspaceId: ws.id,
      channel: 'whatsapp',
      customerHandle: customerPhone,
      customerName: 'Priya Mukherjee',
      content: customerText,
      providerMessageId,
    });

    ctx.assert(ingestResult.success, 'Inbound Ingestion: Successfully processed verified incoming message');
    ctx.assert(ingestResult.isNewConversation === true, 'Inbound Ingestion: Created new conversation for new customer');
    ctx.assert(!ingestResult.duplicate, 'Inbound Ingestion: First delivery recognized as non-duplicate');

    createdConversationId = ingestResult.conversation?.id;
    ctx.assert(!!createdConversationId, 'Inbound Ingestion: Conversation ID generated and returned');

    // Verify row in database
    const [dbConversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, createdConversationId!))
      .limit(1);

    ctx.assert(dbConversation !== undefined, 'Database Verification: Conversation persists in Neon PostgreSQL');
    ctx.assert(
      dbConversation.customerName === 'Priya Mukherjee' && dbConversation.channel === 'whatsapp',
      'Database Verification: Conversation records accurate customer identity and channel'
    );
    ctx.assert(
      dbConversation.lastMessageText === customerText,
      'Database Verification: Updates conversation lastMessageText accurately'
    );

    // 3. Message Deduplication & Replay Defense
    // Simulate Meta webhook re-delivery / network retry of the exact same event
    const duplicateIngestResult = await ingestInboundMessage({
      workspaceId: ws.id,
      channel: 'whatsapp',
      customerHandle: customerPhone,
      customerName: 'Priya Mukherjee',
      content: customerText,
      providerMessageId, // Same provider message ID
    });

    ctx.assert(
      duplicateIngestResult.success && duplicateIngestResult.duplicate === true,
      'Replay Guard: Duplicate webhook delivery acknowledged with duplicate: true'
    );

    // Verify that messages count in DB is still EXACTLY 1
    const storedMessages = await db
      .select()
      .from(inboxMessages)
      .where(eq(inboxMessages.conversationId, createdConversationId!));

    ctx.assert(
      storedMessages.length === 1,
      'Idempotency Enforcement: Exactly 1 message record in database (no duplicate rows created)'
    );

    // 4. Customer Service 24-Hour Messaging Window
    const windowCheck = checkMessagingWindow(dbConversation.lastCustomerMessageAt, 'whatsapp');
    ctx.assert(windowCheck.isOpen, 'Messaging Window: 24-hour service window is open for recent customer inquiry');
    ctx.assert(windowCheck.hoursRemaining > 23, 'Messaging Window: Reports ~24 hours remaining');

    // 5. Staff Outbound Reply Dispatch
    const outboundReplyResult = await dispatchOutboundReply({
      conversationId: createdConversationId!,
      workspaceId: ws.id,
      senderName: 'Sharma Boutique Concierge',
      content: 'Namaste Priya! Yes, our royal blue Katan silk saree with gold zari border is in stock. Sending you a video preview shortly!',
    });

    ctx.assert(outboundReplyResult.success, 'Outbound Dispatch: Staff reply dispatched successfully');
    ctx.assert(
      outboundReplyResult.deliveryStatus === 'sent' || outboundReplyResult.deliveryStatus === 'delivered',
      'Outbound Dispatch: Delivery status marked as sent/delivered'
    );

    // Verify outbound message stored in DB
    const updatedMessages = await db
      .select()
      .from(inboxMessages)
      .where(eq(inboxMessages.conversationId, createdConversationId!));

    ctx.assert(
      updatedMessages.length === 2,
      'Unified Thread: Conversation thread contains exactly 2 messages (1 customer, 1 staff reply)'
    );
  } finally {
    // Cleanup Test Fixtures
    if (createdConversationId) {
      await db.delete(inboxMessages).where(eq(inboxMessages.conversationId, createdConversationId)).catch(() => {});
      await db.delete(conversations).where(eq(conversations.id, createdConversationId)).catch(() => {});
    }
    if (testWorkspaceId) {
      await db.delete(workspaces).where(eq(workspaces.id, testWorkspaceId)).catch(() => {});
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId)).catch(() => {});
    }
  }

  return ctx;
}

if (process.argv[1]?.includes('meta-webhook.test.ts')) {
  runMetaWebhookIntegrationTests()
    .then((c) => {
      console.log(`\nMeta Webhook Integration Tests Complete: ${c.passed} passed, ${c.failed} failed.`);
      process.exit(c.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Fatal in Meta Webhook Integration Tests:', err);
      process.exit(1);
    });
}
