const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read DATABASE_URL from .env.local
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
let dbUrl = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
    break;
  }
}

if (!dbUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

process.env.DATABASE_URL = dbUrl;

const sql = neon(dbUrl);

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 KUIRO PROMPT 16: OMNI-CHANNEL INBOX DISPATCH & PERSISTENCE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 0. Ensure we have an active workspace
    const wsRows = await sql`SELECT id, name FROM workspaces LIMIT 1`;
    if (!wsRows.length) {
      console.error('No workspace found for test');
      process.exit(1);
    }
    const testWsId = wsRows[0].id;
    console.log(`Using Workspace: ${wsRows[0].name} (${testWsId})\n`);

    // Dynamic import of our TypeScript dispatchService
    const { 
      ingestInboundMessage, 
      dispatchOutboundReply, 
      checkMessagingWindow 
    } = await import('../src/lib/inbox/dispatchService.ts');

    // -------------------------------------------------------------
    // Test 1: Inbound Message Ingestion (WhatsApp)
    // -------------------------------------------------------------
    console.log('--- Test Suite 1: Inbound Message Ingestion ---');
    const testWaPhone = `+9198765${Math.floor(10000 + Math.random() * 90000)}`;
    const waMsgId = `wa_msg_${Date.now()}_1`;
    const inboundText = 'Hello! I saw your Diwali campaign and want to book a VIP dental scan.';

    const ingestRes1 = await ingestInboundMessage({
      workspaceId: testWsId,
      channel: 'whatsapp',
      customerHandle: testWaPhone,
      customerName: 'Rohit Sharma',
      content: inboundText,
      providerMessageId: waMsgId,
      messageType: 'text',
      metadata: { source: 'diwali_campaign_post_1' },
    });

    assert(ingestRes1.success === true, 'Inbound message ingested successfully');
    assert(ingestRes1.conversation?.id !== undefined, 'Conversation created or matched in Neon PostgreSQL');
    assert(ingestRes1.message?.providerMessageId === waMsgId, 'Provider message ID stored correctly');
    assert(ingestRes1.message?.deliveryStatus === 'delivered', 'Inbound deliveryStatus initialized to "delivered"');
    assert(ingestRes1.message?.readState === false, 'Inbound readState initialized to false (unread)');

    const convId = ingestRes1.conversation.id;

    // Verify conversation row in database
    const [convDb] = await sql`SELECT * FROM conversations WHERE id = ${convId}`;
    assert(convDb.customer_handle === testWaPhone, 'Customer handle persisted in DB');
    assert(convDb.unread_count === 1, 'Unread count incremented to 1');
    assert(convDb.last_message_text === inboundText, 'last_message_text accurately updated');
    assert(convDb.last_customer_message_at !== null, 'last_customer_message_at recorded in DB');
    assert(convDb.window_expires_at !== null, 'window_expires_at computed and recorded in DB');

    const windowDiffHours = (new Date(convDb.window_expires_at).getTime() - new Date(convDb.last_customer_message_at).getTime()) / (3600 * 1000);
    assert(Math.round(windowDiffHours) === 24, '24-hour customer service window initialized correctly (24.0h)');

    // -------------------------------------------------------------
    // Test 2: Inbound Idempotency & Deduplication
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 2: Idempotency & Deduplication ---');
    const duplicateIngest = await ingestInboundMessage({
      workspaceId: testWsId,
      channel: 'whatsapp',
      customerHandle: testWaPhone,
      customerName: 'Rohit Sharma',
      content: inboundText,
      providerMessageId: waMsgId, // Same ID
      messageType: 'text',
    });

    assert(duplicateIngest.success === true, 'Duplicate ingestion handled gracefully');
    assert(duplicateIngest.duplicate === true, 'Flagged as duplicate event without error');

    // Confirm message count for this conversation is still 1
    const [msgCount] = await sql`SELECT count(*)::int as count FROM inbox_messages WHERE conversation_id = ${convId}`;
    assert(msgCount.count === 1, 'Database deduplication prevented duplicate message insertion');

    // -------------------------------------------------------------
    // Test 3: Outbound Staff Reply Dispatch
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 3: Outbound Staff Reply Dispatch ---');
    const replyContent = 'Namaste Rohit! We have a VIP slot available this Saturday at 11:00 AM. Should we reserve it?';
    
    const replyRes = await dispatchOutboundReply({
      conversationId: convId,
      workspaceId: testWsId,
      content: replyContent,
      senderType: 'AGENT',
      senderName: 'Dr. Alok Verma',
    });

    assert(replyRes.success === true, 'Outbound staff reply dispatched successfully');
    assert(replyRes.message?.deliveryStatus === 'sent', 'Outbound deliveryStatus marked as "sent"');
    assert(replyRes.message?.providerMessageId !== undefined, 'Provider message ID assigned and stored');
    assert(replyRes.message?.isInternalNote === false, 'External reply has isInternalNote = false');

    // Check conversation status update
    const [convAfterReply] = await sql`SELECT * FROM conversations WHERE id = ${convId}`;
    assert(convAfterReply.status === 'WAITING', 'Conversation status updated to WAITING (waiting for customer reply)');
    assert(convAfterReply.unread_count === 0, 'Unread count reset to 0 after staff response');
    assert(convAfterReply.last_message_text === replyContent, 'Conversation last_message_text updated to outbound reply');

    // -------------------------------------------------------------
    // Test 4: 24-Hour Messaging Window Enforcement
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 4: 24-Hour Messaging Window Rules ---');
    
    // Simulate expired customer message (30 hours ago)
    const thirtyHoursAgo = new Date(Date.now() - 30 * 3600 * 1000);
    const expiredWindow = new Date(Date.now() - 6 * 3600 * 1000);
    
    await sql`
      UPDATE conversations 
      SET last_customer_message_at = ${thirtyHoursAgo.toISOString()},
          window_expires_at = ${expiredWindow.toISOString()}
      WHERE id = ${convId}
    `;

    // Attempting freeform message outside 24h window
    let windowBlocked = false;
    try {
      const blockRes = await dispatchOutboundReply({
        conversationId: convId,
        workspaceId: testWsId,
        content: 'Following up on our offer from yesterday.',
        senderType: 'AGENT',
      });
      if (!blockRes.success && blockRes.error) {
        windowBlocked = true;
        assert(
          blockRes.error.includes('expired') || blockRes.error.includes('Template'), 
          `Blocked outside 24h window: ${blockRes.error}`
        );
      }
    } catch (err) {
      windowBlocked = true;
      assert(err.message.includes('expired') || err.message.includes('Template'), `Blocked outside 24h window: ${err.message}`);
    }
    assert(windowBlocked === true, 'Freeform message strictly blocked when customer service window is expired');

    // Attempting message with approved template outside 24h window
    const templateReplyRes = await dispatchOutboundReply({
      conversationId: convId,
      workspaceId: testWsId,
      content: 'Template text',
      senderType: 'AGENT',
      templateName: 'appointment_reminder_v1',
      templateLanguage: 'en_US',
    });
    assert(templateReplyRes.success === true, 'Approved template message successfully dispatched outside 24h window');

    // -------------------------------------------------------------
    // Test 5: Internal Team Notes Isolation
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 5: Internal Team Notes Isolation ---');
    const noteText = 'INTERNAL NOTE: Patient requested VIP suite scan, check machine availability with clinic team.';
    
    const noteRes = await dispatchOutboundReply({
      conversationId: convId,
      workspaceId: testWsId,
      content: noteText,
      senderType: 'AGENT',
      senderName: 'Dr. Alok Verma',
      isInternalNote: true,
    });

    assert(noteRes.success === true, 'Internal note saved successfully');
    assert(noteRes.message?.isInternalNote === true, 'Message marked as isInternalNote = true');

    // Confirm that the internal note DID NOT overwrite the customer-facing lastMessageText
    const [convAfterNote] = await sql`SELECT last_message_text FROM conversations WHERE id = ${convId}`;
    assert(convAfterNote.last_message_text !== noteText, 'Internal note did not overwrite customer-facing last_message_text');

    // -------------------------------------------------------------
    // Test 6: AI Suggestion Isolation
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 6: AI Suggestion Isolation ---');
    // AI suggestions are recommendations generated on-demand and returned to UI.
    // They must NEVER be written directly to `inbox_messages` as sent customer communications.
    const allMsgsInDb = await sql`
      SELECT id, sender_type, is_internal_note, ai_generated, content 
      FROM inbox_messages 
      WHERE conversation_id = ${convId}
    `;

    // Verify all messages in the DB are explicit customer messages, staff replies, or internal notes
    const unauthorizedAiSent = allMsgsInDb.filter(m => m.ai_generated === true && m.sender_type === 'AGENT' && !m.provider_message_id);
    assert(unauthorizedAiSent.length === 0, 'No unauthorized unapproved AI suggestions exist as sent messages in DB');

    // -------------------------------------------------------------
    // Test 7: Persistence Across Re-fetch (Page Refresh Simulation)
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 7: Persistence Across Refresh ---');
    const freshMessages = await sql`
      SELECT id, conversation_id, channel, sender_type, content, provider_message_id, 
             delivery_status, message_type, read_state, is_internal_note, created_at
      FROM inbox_messages 
      WHERE conversation_id = ${convId}
      ORDER BY created_at ASC
    `;

    assert(freshMessages.length >= 3, `All messages survived and persisted in Neon PostgreSQL (${freshMessages.length} messages)`);

    const inbound = freshMessages.find(m => m.sender_type === 'CUSTOMER');
    assert(inbound !== undefined, 'Inbound customer message persisted');
    assert(inbound.provider_message_id === waMsgId, 'Inbound providerMessageId persisted across query');
    assert(inbound.delivery_status === 'delivered', 'Inbound deliveryStatus persisted across query');

    const outbound = freshMessages.find(m => m.sender_type === 'AGENT' && !m.is_internal_note);
    assert(outbound !== undefined, 'Outbound staff message persisted');
    assert(outbound.delivery_status === 'sent', 'Outbound deliveryStatus persisted across query');
    assert(outbound.provider_message_id !== null, 'Outbound providerMessageId persisted across query');

    const note = freshMessages.find(m => m.is_internal_note === true);
    assert(note !== undefined, 'Internal staff note persisted');
    assert(note.content === noteText, 'Internal note text matches exact content');

    // Clean up test conversation and messages
    console.log('\nCleaning up test artifacts...');
    await sql`DELETE FROM inbox_messages WHERE conversation_id = ${convId}`;
    await sql`DELETE FROM conversations WHERE id = ${convId}`;
    console.log('Cleanup complete.');

  } catch (error) {
    console.error('Fatal test error:', error);
    failed++;
  }

  console.log('\n===============================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
