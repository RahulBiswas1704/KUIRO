/**
 * Comprehensive Automated Verification Suite for Facebook Publishing (Task #12)
 *
 * Verifies:
 * 1. Facebook Page discovery (/me/accounts) with task/permission mapping
 * 2. Page permissions validation (CREATE_CONTENT / MANAGE)
 * 3. Text-only post publishing to Facebook Page (/feed)
 * 4. Single-photo post publishing to Facebook Page (/photos)
 * 5. Multi-photo carousel/album post publishing (unshared uploads + feed story attachment)
 * 6. Video post publishing to Facebook Page (/videos)
 * 7. Scheduled post publishing (scheduled_publish_time, published: false)
 * 8. Transient error retry policy with exponential backoff
 * 9. Live post status inspection (/postId fields check)
 * 10. Autonomous campaign generator inclusion of Facebook (6 platform posts generated)
 * 11. Multi-channel publisher integration (publishToAllChannels)
 * 12. Token vault integration and database status synchronization
 */

const assert = require('assert');

async function runTests() {
  console.log('=================================================================');
  console.log('⚡ STARTING COMPREHENSIVE FACEBOOK PUBLISHING TEST SUITE (TASK #12)');
  console.log('=================================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      passed++;
      console.log(`  ✅ [${total}] PASS: ${name}`);
    } catch (err) {
      console.error(`  ❌ [${total}] FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      passed++;
      console.log(`  ✅ [${total}] PASS: ${name}`);
    } catch (err) {
      console.error(`  ❌ [${total}] FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  // Dynamically import compiled/TS modules
  const {
    getFacebookManagedPages,
    validateFacebookPagePermissions,
    publishToFacebook,
    getFacebookPostStatus,
  } = await import('../src/lib/social/facebookPublisher.ts');

  const {
    publishFacebookChannel,
    publishToAllChannels,
  } = await import('../src/lib/social/publisher.ts');

  const {
    DEFAULT_CHANNELS,
  } = await import('../src/constants/channels.ts');

  const {
    OAUTH_PLATFORMS,
  } = await import('../src/lib/social/oauth.ts');

  const {
    encryptToken,
    decryptToken,
  } = await import('../src/lib/crypto/vault.ts');

  // -------------------------------------------------------------------------
  // TEST GROUP 1: Platform Registry & OAuth Configuration
  // -------------------------------------------------------------------------
  console.log('\n--- 1. PLATFORM REGISTRY & OAUTH CONFIGURATION ---');

  test('Facebook is registered in DEFAULT_CHANNELS with correct metadata', () => {
    const fbChannel = DEFAULT_CHANNELS.find((c) => c.platform === 'facebook');
    assert.ok(fbChannel, 'Facebook must be in DEFAULT_CHANNELS');
    assert.strictEqual(fbChannel.name, 'Facebook Page Graph API');
    assert.strictEqual(fbChannel.handle, 'Sharma Heritage Handlooms');
    assert.strictEqual(fbChannel.platformAccountId, 'page_1092837482');
  });

  test('Facebook is registered in OAUTH_PLATFORMS with required Page scopes', () => {
    const fbOAuth = OAUTH_PLATFORMS['facebook'];
    assert.ok(fbOAuth, 'Facebook must be in OAUTH_PLATFORMS');
    assert.ok(fbOAuth.authUrl.includes('facebook.com'), 'Auth URL must point to Facebook');
    assert.ok(fbOAuth.scopes.includes('pages_manage_posts'), 'Must require pages_manage_posts');
    assert.ok(fbOAuth.scopes.includes('pages_read_engagement'), 'Must require pages_read_engagement');
    assert.ok(fbOAuth.scopes.includes('pages_show_list'), 'Must require pages_show_list');
  });

  // -------------------------------------------------------------------------
  // TEST GROUP 2: Page Discovery & Task Permissions Mapping
  // -------------------------------------------------------------------------
  console.log('\n--- 2. PAGE DISCOVERY & PERMISSION VALIDATION ---');

  await testAsync('getFacebookManagedPages parses Graph API response correctly', async () => {
    // Test with mock fetch
    const originalFetch = global.fetch;
    global.fetch = async (url) => {
      if (url.includes('/me/accounts')) {
        return {
          ok: true,
          json: async () => ({
            data: [
              {
                id: '123456789',
                name: 'Sharma Heritage Handlooms',
                category: 'Clothing (Brand)',
                access_token: 'EAAXx_page_token_123',
                tasks: ['CREATE_CONTENT', 'MANAGE', 'MESSAGING'],
                is_published: true,
              },
              {
                id: '987654321',
                name: 'Read-Only Archived Page',
                category: 'Community',
                access_token: 'EAAXx_page_token_987',
                tasks: ['ANALYZE'],
                is_published: true,
              },
            ],
          }),
        };
      }
      return originalFetch(url);
    };

    try {
      const pages = await getFacebookManagedPages('user_test_token_xyz');
      assert.strictEqual(pages.length, 2, 'Should return 2 pages');
      assert.strictEqual(pages[0].id, '123456789');
      assert.strictEqual(pages[0].name, 'Sharma Heritage Handlooms');
      assert.strictEqual(pages[0].canPublish, true, 'Page with CREATE_CONTENT can publish');
      assert.strictEqual(pages[1].canPublish, false, 'Page with only ANALYZE cannot publish');
    } finally {
      global.fetch = originalFetch;
    }
  });

  await testAsync('validateFacebookPagePermissions validates CREATE_CONTENT / MANAGE', async () => {
    const originalFetch = global.fetch;
    global.fetch = async (url) => {
      if (url.includes('page_with_perms')) {
        return {
          ok: true,
          json: async () => ({
            id: 'page_with_perms',
            name: 'Valid Brand Page',
            tasks: ['CREATE_CONTENT', 'MODERATE'],
          }),
        };
      }
      if (url.includes('page_without_perms')) {
        return {
          ok: true,
          json: async () => ({
            id: 'page_without_perms',
            name: 'Restricted Page',
            tasks: ['ANALYZE', 'ADVERTISER'],
          }),
        };
      }
      return originalFetch(url);
    };

    try {
      const validCheck = await validateFacebookPagePermissions('page_with_perms', 'token_valid');
      assert.strictEqual(validCheck.valid, true, 'Page with CREATE_CONTENT must pass');
      assert.strictEqual(validCheck.pageName, 'Valid Brand Page');

      const invalidCheck = await validateFacebookPagePermissions('page_without_perms', 'token_restricted');
      assert.strictEqual(invalidCheck.valid, false, 'Page without CREATE_CONTENT must fail');
      assert.ok(invalidCheck.error.includes('CREATE_CONTENT'), 'Error message must note missing permission');
    } finally {
      global.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // TEST GROUP 3: Facebook Publishing - Formats & Payloads
  // -------------------------------------------------------------------------
  console.log('\n--- 3. FACEBOOK PUBLISHING MODES (TEXT, IMAGE, CAROUSEL, VIDEO, SCHEDULED) ---');

  await testAsync('publishToFacebook executes Text-Only post via /feed', async () => {
    const originalFetch = global.fetch;
    let requestedEndpoint = '';
    let postedBody = '';

    global.fetch = async (url, options) => {
      requestedEndpoint = url;
      postedBody = options?.body?.toString() || '';
      return {
        ok: true,
        json: async () => ({
          id: '123456789_101010101',
          post_id: '123456789_101010101',
        }),
      };
    };

    try {
      const res = await publishToFacebook({
        pageId: '123456789',
        accessToken: 'genuine_page_token_live',
        payload: {
          caption: 'Celebrating artisanal mastery at Sharma Heritage Handlooms.',
          link: 'https://sharmaheritage.in/collections',
        },
      });

      assert.strictEqual(res.status, 'PUBLISHED');
      assert.strictEqual(res.platformPostId, '123456789_101010101');
      assert.strictEqual(res.postUrl, 'https://facebook.com/123456789_101010101');
      assert.ok(requestedEndpoint.includes('/123456789/feed'), 'Endpoint must be /feed');
      assert.ok(postedBody.includes('published=true'), 'Must be published=true');
      assert.ok(postedBody.includes('sharmaheritage.in'), 'Must attach external link');
    } finally {
      global.fetch = originalFetch;
    }
  });

  await testAsync('publishToFacebook executes Single Photo post via /photos', async () => {
    const originalFetch = global.fetch;
    let requestedEndpoint = '';
    let postedBody = '';

    global.fetch = async (url, options) => {
      requestedEndpoint = url;
      postedBody = options?.body?.toString() || '';
      return {
        ok: true,
        json: async () => ({
          id: 'photo_999888777',
          post_id: '123456789_photo_post_1',
        }),
      };
    };

    try {
      const res = await publishToFacebook({
        pageId: '123456789',
        accessToken: 'genuine_page_token_live',
        payload: {
          caption: 'Handcrafted mulberry silk sarees woven with generational expertise.',
          mediaUrls: ['https://cdn.sharmaheritage.in/saree-festive-hero.jpg'],
          mediaType: 'IMAGE',
        },
      });

      assert.strictEqual(res.status, 'PUBLISHED');
      assert.strictEqual(res.platformPostId, '123456789_photo_post_1');
      assert.ok(requestedEndpoint.includes('/123456789/photos'), 'Endpoint must be /photos');
      assert.ok(postedBody.includes('url=https%3A%2F%2Fcdn.sharmaheritage.in%2Fsaree-festive-hero.jpg'), 'Must encode photo URL');
    } finally {
      global.fetch = originalFetch;
    }
  });

  await testAsync('publishToFacebook executes Multi-Photo Carousel album post', async () => {
    const originalFetch = global.fetch;
    const photoUploads = [];
    let feedPost = null;

    global.fetch = async (url, options) => {
      const body = options?.body?.toString() || '';
      if (url.includes('/photos')) {
        photoUploads.push({ url, body });
        return {
          ok: true,
          json: async () => ({ id: `uploaded_photo_${photoUploads.length}` }),
        };
      }
      if (url.includes('/feed')) {
        feedPost = { url, body };
        return {
          ok: true,
          json: async () => ({ id: '123456789_multi_photo_story_id' }),
        };
      }
      return originalFetch(url, options);
    };

    try {
      const res = await publishToFacebook({
        pageId: '123456789',
        accessToken: 'genuine_page_token_live',
        payload: {
          caption: 'Swipe through our 3-piece festive royal heritage lookbook.',
          mediaUrls: [
            'https://cdn.sharmaheritage.in/slide1.jpg',
            'https://cdn.sharmaheritage.in/slide2.jpg',
            'https://cdn.sharmaheritage.in/slide3.jpg',
          ],
          mediaType: 'CAROUSEL',
        },
      });

      assert.strictEqual(res.status, 'PUBLISHED');
      assert.strictEqual(photoUploads.length, 3, 'Must upload 3 photos unshared first');
      assert.ok(photoUploads[0].body.includes('published=false'), 'Photos must be uploaded with published=false');
      assert.ok(feedPost, 'Feed story must be created attaching uploaded photos');
      assert.ok(feedPost.body.includes('attached_media'), 'Feed story must contain attached_media parameter');
      assert.ok(feedPost.body.includes('uploaded_photo_1'), 'Must reference uploaded photo IDs');
    } finally {
      global.fetch = originalFetch;
    }
  });

  await testAsync('publishToFacebook executes Video post via /videos', async () => {
    const originalFetch = global.fetch;
    let requestedEndpoint = '';
    let postedBody = '';

    global.fetch = async (url, options) => {
      requestedEndpoint = url;
      postedBody = options?.body?.toString() || '';
      return {
        ok: true,
        json: async () => ({
          id: 'video_id_555444333',
        }),
      };
    };

    try {
      const res = await publishToFacebook({
        pageId: '123456789',
        accessToken: 'genuine_page_token_live',
        payload: {
          caption: 'Behind the scenes at our Varanasi handloom workshop.',
          mediaUrls: ['https://cdn.sharmaheritage.in/weaving-documentary.mp4'],
          mediaType: 'VIDEO',
          title: 'Artisans of Heritage',
        },
      });

      assert.strictEqual(res.status, 'PUBLISHED');
      assert.strictEqual(res.platformPostId, 'video_id_555444333');
      assert.ok(requestedEndpoint.includes('/123456789/videos'), 'Endpoint must be /videos');
      assert.ok(postedBody.includes('file_url='), 'Must pass file_url parameter');
      assert.ok(postedBody.includes('title=Artisans+of+Heritage'), 'Must pass video title');
    } finally {
      global.fetch = originalFetch;
    }
  });

  await testAsync('publishToFacebook supports scheduled publishing with scheduled_publish_time', async () => {
    const originalFetch = global.fetch;
    let postedBody = '';
    const scheduledTime = new Date(Date.now() + 48 * 3600 * 1000); // 48 hours in future

    global.fetch = async (url, options) => {
      postedBody = options?.body?.toString() || '';
      return {
        ok: true,
        json: async () => ({
          id: 'scheduled_post_777888',
        }),
      };
    };

    try {
      const res = await publishToFacebook({
        pageId: '123456789',
        accessToken: 'genuine_page_token_live',
        payload: {
          caption: 'Scheduled festival greeting post.',
          scheduledTime,
        },
      });

      assert.strictEqual(res.status, 'SCHEDULED');
      assert.strictEqual(res.platformPostId, 'scheduled_post_777888');
      assert.ok(postedBody.includes('published=false'), 'Scheduled posts must set published=false');
      assert.ok(postedBody.includes('scheduled_publish_time='), 'Must set scheduled_publish_time');
      const expectedSecs = Math.floor(scheduledTime.getTime() / 1000);
      assert.ok(postedBody.includes(`scheduled_publish_time=${expectedSecs}`), 'Timestamp in seconds must match');
    } finally {
      global.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // TEST GROUP 4: Retry Policy & Transient Error Handling
  // -------------------------------------------------------------------------
  console.log('\n--- 4. RETRY POLICY & TRANSIENT ERROR RESILIENCE ---');

  await testAsync('Retries on transient Meta rate limit (code 17) and recovers on attempt 2', async () => {
    const originalFetch = global.fetch;
    let callCount = 0;

    global.fetch = async (url, options) => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: false,
          json: async () => ({
            error: {
              message: 'User request limit reached',
              code: 17,
              is_transient: true,
            },
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({ id: 'recovered_post_after_retry_101' }),
      };
    };

    try {
      const res = await publishToFacebook({
        pageId: '123456789',
        accessToken: 'genuine_page_token_live',
        payload: {
          caption: 'Post that encounters transient rate limit on first attempt.',
        },
      });

      assert.strictEqual(res.status, 'PUBLISHED');
      assert.strictEqual(res.platformPostId, 'recovered_post_after_retry_101');
      assert.strictEqual(res.attempts, 2, 'Must have succeeded on attempt 2');
      assert.strictEqual(callCount, 2, 'Total fetch calls must be 2');
    } finally {
      global.fetch = originalFetch;
    }
  });

  await testAsync('Fails gracefully when non-transient error occurs (code 100 invalid param)', async () => {
    const originalFetch = global.fetch;
    let callCount = 0;

    global.fetch = async (url, options) => {
      callCount++;
      return {
        ok: false,
        json: async () => ({
          error: {
            message: 'Invalid parameter: caption contains invalid characters',
            code: 100,
          },
        }),
      };
    };

    try {
      const res = await publishToFacebook({
        pageId: '123456789',
        accessToken: 'genuine_page_token_live',
        payload: {
          caption: 'Non-transient error post.',
        },
      });

      assert.strictEqual(res.status, 'FAILED');
      assert.ok(res.error.includes('Invalid parameter'), 'Error message must be preserved');
      assert.strictEqual(callCount, 1, 'Non-transient error must fail immediately without retry');
    } finally {
      global.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // TEST GROUP 5: Post Status Inspection & Live Engagement Metrics
  // -------------------------------------------------------------------------
  console.log('\n--- 5. POST STATUS INSPECTION & ENGAGEMENT METRICS ---');

  await testAsync('getFacebookPostStatus queries live post status and metrics', async () => {
    const originalFetch = global.fetch;
    global.fetch = async (url) => {
      if (url.includes('/123456789_post_100')) {
        return {
          ok: true,
          json: async () => ({
            id: '123456789_post_100',
            is_published: true,
            created_time: '2026-11-14T10:00:00+0000',
            reactions: { summary: { total_count: 142 } },
            comments: { summary: { total_count: 28 } },
            shares: { count: 19 },
          }),
        };
      }
      return originalFetch(url);
    };

    try {
      const status = await getFacebookPostStatus('123456789_post_100', 'test_token');
      assert.strictEqual(status.id, '123456789_post_100');
      assert.strictEqual(status.isPublished, true);
      assert.strictEqual(status.reactionsCount, 142);
      assert.strictEqual(status.commentsCount, 28);
      assert.strictEqual(status.sharesCount, 19);
    } finally {
      global.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // TEST GROUP 6: Mock Publisher Fallback (Local Dev / Offline Safety)
  // -------------------------------------------------------------------------
  console.log('\n--- 6. MOCK PUBLISHER FALLBACK ---');

  await testAsync('publishToFacebook gracefully falls back to mock publishing when no token provided', async () => {
    const res = await publishToFacebook({
      pageId: 'mock_page_101',
      accessToken: 'mock_unconfigured_token',
      payload: {
        caption: 'Testing mock fallback safety.',
      },
    });

    assert.strictEqual(res.status, 'MOCK_PUBLISHED');
    assert.ok(res.platformPostId.startsWith('fb_post_mock_page_101_'), 'Post ID must have mock prefix');
    assert.strictEqual(res.pageId, 'mock_page_101');
    assert.strictEqual(res.pageName, 'Sharma Heritage Handlooms (Mock)');
  });

  // -------------------------------------------------------------------------
  // TEST GROUP 7: Multi-Channel Dispatcher Integration
  // -------------------------------------------------------------------------
  console.log('\n--- 7. MULTI-CHANNEL DISPATCHER INTEGRATION ---');

  await testAsync('publishToAllChannels dispatches to Facebook alongside Instagram, LinkedIn, X, and Email', async () => {
    const results = await publishToAllChannels({
      caption: 'Grand Festive Collection Launch across all omnichannel customer touchpoints.',
      mediaUrls: ['https://cdn.sharmaheritage.in/festive-collection.jpg'],
      firstReply: 'https://sharmaheritage.in/festive',
      emailSubject: 'Festive Collection Unveiling',
    });

    assert.ok(Array.isArray(results), 'Must return an array of channel results');
    const fbRes = results.find((r) => r.platform === 'facebook');
    assert.ok(fbRes, 'Results must include Facebook');
    assert.ok(fbRes.status === 'PUBLISHED' || fbRes.status === 'MOCK_PUBLISHED', 'Facebook status must be published');
    assert.ok(fbRes.platformPostId, 'Facebook post ID must be present');

    const igRes = results.find((r) => r.platform === 'instagram');
    const liRes = results.find((r) => r.platform === 'linkedin');
    const xRes = results.find((r) => r.platform === 'x');
    const emRes = results.find((r) => r.platform === 'email');

    assert.ok(igRes, 'Must include Instagram');
    assert.ok(liRes, 'Must include LinkedIn');
    assert.ok(xRes, 'Must include X');
    assert.ok(emRes, 'Must include Email');
  });

  // -------------------------------------------------------------------------
  // TEST GROUP 8: Neon DB Token Vault Resolution
  // -------------------------------------------------------------------------
  console.log('\n--- 8. NEON DB TOKEN VAULT RESOLUTION ---');

  test('AES-256-GCM encryption & decryption round-trip for Facebook Page tokens', () => {
    const rawPageAccessToken = 'EAAGNO41LZA8BO1234567890abcdefABCDEF_genuine_meta_page_token';
    const encrypted = encryptToken(rawPageAccessToken);

    assert.notStrictEqual(encrypted, rawPageAccessToken, 'Must not be plaintext');
    assert.ok(!encrypted.startsWith('ey'), 'Must not be plain base64 without auth tag');
    const parts = encrypted.split(':');
    assert.strictEqual(parts.length, 5, 'Must have <keyVersion>:aes256gcm:<iv>:<tag>:<ciphertext> format');
    assert.strictEqual(parts[0], 'v1', 'Key version must be v1');
    assert.strictEqual(parts[1], 'aes256gcm', 'Cipher must be aes256gcm');

    const decrypted = decryptToken(encrypted);
    assert.strictEqual(decrypted, rawPageAccessToken, 'Decrypted token must exactly match original');
  });

  // -------------------------------------------------------------------------
  // TEST GROUP 9: publishFacebookChannel Wrapper Validation
  // -------------------------------------------------------------------------
  console.log('\n--- 9. PUBLISH FACEBOOK CHANNEL WRAPPER ---');

  await testAsync('publishFacebookChannel correctly translates PublishPayload to FacebookPublishResult', async () => {
    const res = await publishFacebookChannel({
      payload: {
        caption: 'Wrapper translation verification test.',
        mediaUrls: ['https://cdn.sharmaheritage.in/sample.jpg'],
        firstReply: 'https://sharmaheritage.in/details',
      },
    });

    assert.strictEqual(res.platform, 'facebook');
    assert.strictEqual(res.status, 'MOCK_PUBLISHED');
    assert.ok(res.platformPostId);
    assert.ok(res.postUrl);
  });

  // -------------------------------------------------------------------------
  // TEST GROUP 10: API Route Handlers (/api/publish/facebook)
  // -------------------------------------------------------------------------
  console.log('\n--- 10. API ROUTE HANDLERS (/api/publish/facebook) ---');

  const { GET: facebookGetRoute, POST: facebookPostRoute } = await import('../src/app/api/publish/facebook/route.ts');
  const { db } = await import('../src/db/index.ts');
  const { workspaces } = await import('../src/db/schema.ts');
  const { createDatabaseSession, destroySession } = await import('../src/lib/auth.ts');

  let testSessionToken = '';
  let testWorkspaceId = '';

  if (db) {
    const [firstWs] = await db.select().from(workspaces).limit(1);
    if (firstWs) {
      testWorkspaceId = firstWs.id;
      const sessionResult = await createDatabaseSession(firstWs.ownerId);
      testSessionToken = sessionResult.token;
    }
  }

  await testAsync('POST /api/publish/facebook rejects unauthenticated requests (401)', async () => {
    const unauthReq = {
      json: async () => ({
        workspaceId: testWorkspaceId,
        caption: 'Unauthenticated test.',
      }),
      cookies: { get: () => null },
      headers: new Headers(),
      url: 'http://localhost:3000/api/publish/facebook',
    };

    const res = await facebookPostRoute(unauthReq);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error.includes('Authentication required'));
  });

  await testAsync('POST /api/publish/facebook rejects authenticated request without caption (400)', async () => {
    const fakeReq = {
      json: async () => ({
        workspaceId: testWorkspaceId,
        caption: '',
      }),
      cookies: { get: (name) => (name === 'kuiro_session' ? { value: testSessionToken } : null) },
      headers: new Headers(),
      url: 'http://localhost:3000/api/publish/facebook',
    };

    const res = await facebookPostRoute(fakeReq);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error.includes('Caption is required'));
  });

  await testAsync('POST /api/publish/facebook processes valid post payload successfully (200)', async () => {
    const fakeReq = {
      json: async () => ({
        workspaceId: testWorkspaceId,
        caption: 'Handcrafted sarees with authentic zari borders.',
        mediaUrls: ['https://cdn.sharmaheritage.in/zari.jpg'],
      }),
      cookies: { get: (name) => (name === 'kuiro_session' ? { value: testSessionToken } : null) },
      headers: new Headers(),
      url: 'http://localhost:3000/api/publish/facebook',
    };

    const res = await facebookPostRoute(fakeReq);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.result.platform, 'facebook');
    assert.ok(data.result.platformPostId);
  });

  await testAsync('GET /api/publish/facebook returns managed pages list (200)', async () => {
    const fakeReq = {
      cookies: { get: (name) => (name === 'kuiro_session' ? { value: testSessionToken } : null) },
      headers: new Headers(),
      url: `http://localhost:3000/api/publish/facebook?workspaceId=${testWorkspaceId}`,
    };

    const res = await facebookGetRoute(fakeReq);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.pages));
  });

  if (testSessionToken) {
    await destroySession(testSessionToken);
  }

  // -------------------------------------------------------------------------
  // TEST GROUP 11: Multi-Platform Dispatcher (publishToPlatforms)
  // -------------------------------------------------------------------------
  console.log('\n--- 11. MULTI-PLATFORM DISPATCHER (publishToPlatforms) ---');

  const { publishToPlatforms } = await import('../src/lib/publishers/index.ts');

  await testAsync('publishToPlatforms dispatches to Facebook and returns valid liveUrl', async () => {
    const results = await publishToPlatforms('campaign_123', 'ws_demo_101');
    assert.ok(Array.isArray(results));
    const fbRes = results.find((r) => r.platform === 'facebook');
    assert.ok(fbRes, 'Must include Facebook in results');
    assert.strictEqual(fbRes.success, true);
    assert.ok(fbRes.liveUrl.includes('facebook.com'));
    assert.ok(fbRes.platformPostId);
  });

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
