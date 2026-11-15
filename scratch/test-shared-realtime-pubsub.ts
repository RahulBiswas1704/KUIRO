import fs from 'fs';
import path from 'path';

// 1. Read environment from .env.local BEFORE importing db modules
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    if (details) {
      console.error('    Details:', details);
    }
    throw new Error(`Test failed: ${testName}`);
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSharedRealtimePubSubTests() {
  console.log('\n================================================================');
  console.log('🧪 RUNNING KUIRO SHARED REAL-TIME PUB/SUB ACCEPTANCE TEST SUITE');
  console.log('================================================================\n');

  // Dynamic import after env variables are guaranteed present
  const { db } = await import('../src/db');
  const { 
    users, 
    workspaces, 
    workspaceMembers, 
    sessions, 
    conversations, 
    inboxMessages, 
    realtimePubSubEvents 
  } = await import('../src/db/schema');
  const { eq } = await import('drizzle-orm');
  const { 
    sharedPubSub, 
    buildWorkspaceInboxChannel, 
    authorizeChannelSubscription, 
  } = await import('../src/lib/realtime/pubsub');
  const { publishInboxEvent, subscribeToInboxEvents } = await import('../src/lib/inbox/eventHub');
  const { POST: handleRealtimeAuth } = await import('../src/app/api/realtime/auth/route');
  const { NextRequest } = await import('next/server');

  if (!db) {
    throw new Error('Database connection not initialized');
  }

  // Generate unique test IDs
  const testUserId = `00000000-0000-4000-8000-777777777701`;
  const otherUserId = `00000000-0000-4000-8000-777777777709`;
  const testWs1Id = `00000000-0000-4000-8000-777777777702`;
  const testWs2Id = `00000000-0000-4000-8000-777777777703`;
  const testSessionToken = `test_pubsub_token_${Date.now()}`;
  const testConvId = `00000000-0000-4000-8000-777777777704`;
  const testMsgId = `00000000-0000-4000-8000-777777777705`;

  try {
    // 0. Clean any prior test artifacts
    await db.delete(realtimePubSubEvents).where(eq(realtimePubSubEvents.workspaceId, testWs1Id));
    await db.delete(realtimePubSubEvents).where(eq(realtimePubSubEvents.workspaceId, testWs2Id));
    await db.delete(inboxMessages).where(eq(inboxMessages.id, testMsgId));
    await db.delete(conversations).where(eq(conversations.id, testConvId));
    await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, testWs1Id));
    await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, testWs2Id));
    await db.delete(sessions).where(eq(sessions.userId, testUserId));
    await db.delete(sessions).where(eq(sessions.userId, otherUserId));
    await db.delete(workspaces).where(eq(workspaces.id, testWs1Id));
    await db.delete(workspaces).where(eq(workspaces.id, testWs2Id));
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(users).where(eq(users.id, otherUserId));
    await db.delete(users).where(eq(users.id, otherUserId));

    console.log('--- SUITE 1: Test Fixtures & Persistent Data Setup ---');

    // Create users
    await db.insert(users).values([
      {
        id: testUserId,
        email: `pubsub-tester-${Date.now()}@kuiro.test`,
        name: 'PubSub Tester',
      },
      {
        id: otherUserId,
        email: `other-user-${Date.now()}@kuiro.test`,
        name: 'Other Tenant Owner',
      },
    ]);

    // Create Workspaces (Tenant 1 owned by testUser, Tenant 2 owned by otherUser)
    await db.insert(workspaces).values([
      { id: testWs1Id, name: 'Workspace Alpha (Tenant 1)', ownerId: testUserId },
      { id: testWs2Id, name: 'Workspace Beta (Tenant 2)', ownerId: otherUserId },
    ]);

    // Add user as member only to Workspace 1 (Tenant 1), NOT Workspace 2
    await db.insert(workspaceMembers).values({
      workspaceId: testWs1Id,
      userId: testUserId,
      role: 'OWNER',
    });

    // Create active session
    await db.insert(sessions).values({
      id: `sess_pubsub_${Date.now()}`,
      userId: testUserId,
      token: testSessionToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Create conversation and message in PostgreSQL (Database as Source of Truth)
    await db.insert(conversations).values({
      id: testConvId,
      workspaceId: testWs1Id,
      customerName: 'Aarav Patel',
      customerHandle: '+919876543210',
      channel: 'whatsapp',
      status: 'OPEN',
      lastMessageText: 'Hello KUIRO from simulated WhatsApp webhook',
      unreadCount: 1,
    });

    await db.insert(inboxMessages).values({
      id: testMsgId,
      conversationId: testConvId,
      channel: 'whatsapp',
      senderType: 'CUSTOMER',
      senderName: 'Aarav Patel',
      content: 'Hello KUIRO from simulated WhatsApp webhook',
    });

    assert(true, 'Test fixtures, multi-tenant workspaces, session & database records created');

    console.log('\n--- SUITE 2: Multi-Instance Cross-Instance Real-Time Pub/Sub ---');

    // Simulate two independent application instances with isolated memory
    const instanceA = sharedPubSub.createInstance('inst_alpha');
    const instanceB = sharedPubSub.createInstance('inst_beta');

    assert(instanceA.instanceId === 'inst_alpha', 'Instance A initialized with distinct instance ID');
    assert(instanceB.instanceId === 'inst_beta', 'Instance B initialized with distinct instance ID');

    // Set up subscribers on Instance B
    const channelWs1 = buildWorkspaceInboxChannel(testWs1Id);
    const channelWs2 = buildWorkspaceInboxChannel(testWs2Id);

    const receivedByInstanceB_Ws1: any[] = [];
    const receivedByInstanceB_Ws2: any[] = [];

    const unsubWs1 = instanceB.subscribe(
      channelWs1,
      (evt) => receivedByInstanceB_Ws1.push(evt),
      { pollIntervalMs: 150 }
    );

    const unsubWs2 = instanceB.subscribe(
      channelWs2,
      (evt) => receivedByInstanceB_Ws2.push(evt),
      { pollIntervalMs: 150 }
    );

    // Instance A publishes a new message notification for Workspace 1
    const publishPayload = {
      channel: channelWs1,
      workspaceId: testWs1Id,
      conversationId: testConvId,
      eventType: 'new_message' as const,
      data: {
        messageId: testMsgId,
        body: 'Hello KUIRO from simulated WhatsApp webhook',
        customerName: 'Aarav Patel',
      },
    };

    const publishedNotice = await instanceA.publish(publishPayload);

    assert(Boolean(publishedNotice.id), 'Instance A publish returned notification with unique ID', publishedNotice.id);
    assert(publishedNotice.originInstanceId === 'inst_alpha', 'Notification tags origin instance as inst_alpha');

    // Wait for cross-instance polling loop on Instance B to fetch from PostgreSQL
    console.log('    ⏳ Waiting for cross-instance delivery from Instance A to Instance B...');
    const waitStart = Date.now();
    while (receivedByInstanceB_Ws1.length === 0 && Date.now() - waitStart < 3000) {
      await sleep(100);
    }
    console.log(`    ⏱️ Received in ${Date.now() - waitStart}ms`);

    // Verify Instance B received Workspace 1 event
    assert(
      receivedByInstanceB_Ws1.length === 1,
      'Instance B received event published by Instance A via shared PostgreSQL bus',
      { count: receivedByInstanceB_Ws1.length }
    );

    const receivedEvent = receivedByInstanceB_Ws1[0];
    assert(receivedEvent?.id === publishedNotice.id, 'Received event ID matches published event ID');
    assert(receivedEvent?.originInstanceId === 'inst_alpha', 'Received event preserves originInstanceId');
    assert(receivedEvent?.data.messageId === testMsgId, 'Received payload data matches permanent database message ID');
    assert(receivedEvent?.workspaceId === testWs1Id, 'Received event is strictly tagged with Workspace 1 ID');

    // Verify Workspace 2 subscriber on Instance B received NOTHING (Tenant Isolation)
    assert(
      receivedByInstanceB_Ws2.length === 0,
      'Tenant Isolation: Workspace 2 subscriber on Instance B received ZERO events from Workspace 1',
      { count: receivedByInstanceB_Ws2.length }
    );

    // Verify event row exists in PostgreSQL `realtime_pubsub_events`
    const dbEvents = await db
      .select()
      .from(realtimePubSubEvents)
      .where(eq(realtimePubSubEvents.channel, channelWs1));

    assert(dbEvents.length >= 1, 'PostgreSQL contains persistent audit row in realtime_pubsub_events');
    const dbEventRow = dbEvents.find((e) => e.payload && (e.payload as any).id === publishedNotice.id);
    assert(Boolean(dbEventRow), 'realtime_pubsub_events contains exact matching payload for published notification');

    console.log('\n--- SUITE 3: Local Same-Instance Instant Emission & Deduplication ---');

    // Subscribers on the SAME instance should receive events immediately with 0ms latency
    const receivedByInstanceA_Local: any[] = [];
    const unsubLocalA = instanceA.subscribe(
      channelWs1,
      (evt) => receivedByInstanceA_Local.push(evt),
      { pollIntervalMs: 150 }
    );

    const localPayload = {
      channel: channelWs1,
      workspaceId: testWs1Id,
      conversationId: testConvId,
      eventType: 'agent_presence' as const,
      data: { agentId: testUserId, status: 'online' },
    };

    await instanceA.publish(localPayload);

    // Local subscriber should have received it immediately without waiting for polling
    assert(
      receivedByInstanceA_Local.length === 1,
      'Instance A local subscriber received notification immediately via in-memory emitter'
    );
    assert(
      receivedByInstanceA_Local[0].eventType === 'agent_presence',
      'Local notification has correct eventType: agent_presence'
    );

    // Wait 400ms to test deduplication: Instance A should NOT re-deliver the event to itself when reading DB
    await sleep(400);
    assert(
      receivedByInstanceA_Local.length === 1,
      'Deduplication: Instance A did not re-deliver duplicate event to local subscriber after DB polling tick'
    );

    // Cleanup subscribers
    unsubWs1();
    unsubWs2();
    unsubLocalA();

    console.log('\n--- SUITE 4: Server-Side Channel Authorization & Multi-Tenant Security ---');

    // Test 1: Invalid channel format (no workspace UUID)
    const invalidReq = new NextRequest('http://localhost:3000/api/realtime/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: 'public-global-chat' }),
    });
    const invalidAuth = await authorizeChannelSubscription(invalidReq, 'public-global-chat');
    assert(!invalidAuth.authorized, 'Invalid channel format rejected (status: 400)');
    assert(invalidAuth.status === 400, 'Invalid channel status is 400 Bad Request');

    // Test 2: Unauthenticated request (no cookie/session)
    const unauthReq = new NextRequest('http://localhost:3000/api/realtime/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: channelWs1 }),
    });
    const unauthResult = await authorizeChannelSubscription(unauthReq, channelWs1);
    assert(!unauthResult.authorized, 'Unauthenticated channel subscription request rejected (status: 401)');
    assert(unauthResult.status === 401, 'Unauthenticated status is 401 Unauthorized');

    // Test 3: Unauthorized tenant access (User authenticated, but tries to subscribe to Workspace 2)
    const crossTenantReq = new NextRequest('http://localhost:3000/api/realtime/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `kuiro_session=${testSessionToken}`,
      },
      body: JSON.stringify({ channel: channelWs2 }),
    });
    const crossTenantResult = await authorizeChannelSubscription(crossTenantReq, channelWs2);
    assert(
      !crossTenantResult.authorized,
      'Cross-tenant subscription attempt rejected (User not in Workspace 2)'
    );
    assert(crossTenantResult.status === 403, 'Cross-tenant status is 403 Forbidden');

    // Test 4: Authorized tenant subscription (User authenticated and is member of Workspace 1)
    const authorizedReq = new NextRequest('http://localhost:3000/api/realtime/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `kuiro_session=${testSessionToken}`,
      },
      body: JSON.stringify({ channel: channelWs1 }),
    });
    const authorizedResult = await authorizeChannelSubscription(authorizedReq, channelWs1);
    assert(authorizedResult.authorized, 'Authorized subscription granted for verified workspace member');
    assert(authorizedResult.workspaceId === testWs1Id, 'Authorized result returns verified workspaceId');

    // Test 5: Standard Pusher channel name format ("private-workspace-{workspaceId}")
    const pusherChannelName = `private-workspace-${testWs1Id}`;
    const pusherReq = new NextRequest('http://localhost:3000/api/realtime/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `kuiro_session=${testSessionToken}`,
      },
      body: JSON.stringify({ channel: pusherChannelName }),
    });
    const pusherResult = await authorizeChannelSubscription(pusherReq, pusherChannelName);
    assert(pusherResult.authorized, 'Pusher-style channel private-workspace-{workspaceId} successfully parsed and authorized');

    // Test 6: API Route Handler /api/realtime/auth HTTP execution
    const apiAuthReq = new NextRequest('http://localhost:3000/api/realtime/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `kuiro_session=${testSessionToken}`,
      },
      body: JSON.stringify({
        channel_name: channelWs1,
        socket_id: '12345.67890',
      }),
    });
    const apiAuthResponse = await handleRealtimeAuth(apiAuthReq);
    assert(apiAuthResponse.status === 200, 'POST /api/realtime/auth returns HTTP 200 OK');
    const apiAuthBody = await apiAuthResponse.json();
    assert(apiAuthBody.workspaceId === testWs1Id, 'API returns verified workspaceId');
    assert(apiAuthBody.channel === channelWs1, 'API returns confirmed channel name');

    console.log('\n--- SUITE 5: EventHub Bridge & Real-Time Broadcast ---');

    // Verify inbox/eventHub.ts bridges seamlessly to sharedPubSub
    const eventHubReceived: any[] = [];
    const unsubEventHub = subscribeToInboxEvents((evt) => {
      eventHubReceived.push(evt);
    }, testWs1Id);

    publishInboxEvent({
      workspaceId: testWs1Id,
      conversationId: testConvId,
      type: 'typing',
      data: { isTyping: true, user: 'Support Agent' },
    });

    // Wait 200ms
    await sleep(200);

    assert(
      eventHubReceived.length >= 1,
      'publishInboxEvent dispatched through shared pub/sub and delivered to subscribeToInboxEvents listener'
    );
    const lastEvent = eventHubReceived[eventHubReceived.length - 1];
    assert(lastEvent.type === 'typing', 'EventHub bridge delivered matching event type: typing');
    assert(lastEvent.data.isTyping === true, 'EventHub bridge delivered matching payload data');

    unsubEventHub();

    console.log('\n--- SUITE 6: Clean Teardown & Database Verification ---');

    // Clean up test records
    await db.delete(realtimePubSubEvents).where(eq(realtimePubSubEvents.workspaceId, testWs1Id));
    await db.delete(realtimePubSubEvents).where(eq(realtimePubSubEvents.workspaceId, testWs2Id));
    await db.delete(inboxMessages).where(eq(inboxMessages.id, testMsgId));
    await db.delete(conversations).where(eq(conversations.id, testConvId));
    await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, testWs1Id));
    await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, testWs2Id));
    await db.delete(sessions).where(eq(sessions.userId, testUserId));
    await db.delete(workspaces).where(eq(workspaces.id, testWs1Id));
    await db.delete(workspaces).where(eq(workspaces.id, testWs2Id));
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(users).where(eq(users.id, otherUserId));

    assert(true, 'Test resources, database pub/sub events and sessions cleanly purged');

    console.log('\n================================================================');
    console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ TEST RUNNER TERMINATED WITH ERROR:', err);
    // Cleanup on error
    try {
      await db.delete(realtimePubSubEvents).where(eq(realtimePubSubEvents.workspaceId, testWs1Id));
      await db.delete(realtimePubSubEvents).where(eq(realtimePubSubEvents.workspaceId, testWs2Id));
      await db.delete(inboxMessages).where(eq(inboxMessages.id, testMsgId));
      await db.delete(conversations).where(eq(conversations.id, testConvId));
      await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, testWs1Id));
      await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, testWs2Id));
      await db.delete(sessions).where(eq(sessions.userId, testUserId));
      await db.delete(workspaces).where(eq(workspaces.id, testWs1Id));
      await db.delete(workspaces).where(eq(workspaces.id, testWs2Id));
      await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(users).where(eq(users.id, otherUserId));
    } catch {}
    process.exit(1);
  }
}

runSharedRealtimePubSubTests().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
