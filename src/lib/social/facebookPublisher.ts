import { db, socialConnections, platformPosts } from '@/db';
import { eq, and } from 'drizzle-orm';
import { decryptToken } from '@/lib/crypto/vault';

export interface FacebookPageInfo {
  id: string;
  name: string;
  category?: string;
  accessToken: string;
  tasks?: string[];
  canPublish: boolean;
}

export interface FacebookPublishPayload {
  caption: string;
  mediaUrls?: string[];
  mediaType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL';
  link?: string;
  title?: string;
  scheduledTime?: Date;
}

export interface FacebookPublishResult {
  platform: 'facebook';
  status: 'PUBLISHED' | 'SCHEDULED' | 'FAILED' | 'MOCK_PUBLISHED';
  platformPostId?: string;
  postUrl?: string;
  pageId?: string;
  pageName?: string;
  error?: string;
  attempts: number;
  latencyMs: number;
}

/**
 * Transient Meta Graph API error codes eligible for exponential backoff retry.
 * 1/2: Temporary service issue
 * 4/17/32/613: Rate limits
 */
const TRANSIENT_META_ERROR_CODES = new Set([1, 2, 4, 17, 32, 613]);

/**
 * Executes a Meta Graph API call with exponential backoff retry for transient errors.
 */
async function executeWithRetry<T>(
  operation: (attempt: number) => Promise<T>,
  maxRetries: number = 3
): Promise<{ result: T; attempts: number }> {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    try {
      const res = await operation(attempt);
      return { result: res, attempts: attempt };
    } catch (err: any) {
      const isTransient =
        err?.code && TRANSIENT_META_ERROR_CODES.has(err.code) ||
        err?.message?.includes('ETIMEDOUT') ||
        err?.message?.includes('ECONNRESET') ||
        err?.message?.includes('fetch failed');

      if (!isTransient || attempt >= maxRetries) {
        throw err;
      }

      const backoffMs = Math.min(500 * Math.pow(2, attempt - 1), 3000);
      console.warn(`[Facebook Publisher Retry] Transient error encountered (code: ${err.code || 'network'}). Retrying attempt ${attempt + 1}/${maxRetries} in ${backoffMs}ms...`);
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }
  throw new Error(`Exceeded maximum retry attempts (${maxRetries})`);
}

/**
 * Discovers and lists all Facebook Pages managed by the authenticated account.
 * Supports businesses managing multiple Pages and provides Page-specific access tokens.
 */
export async function getFacebookManagedPages(accessToken: string): Promise<FacebookPageInfo[]> {
  if (!accessToken) return [];

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,category,tasks,is_published&access_token=${encodeURIComponent(accessToken)}`
    );
    const data = await res.json();

    if (!res.ok || data.error) {
      console.warn('[Facebook Managed Pages Discovery Error]:', data.error?.message || 'Failed to list pages');
      return [];
    }

    const pages: FacebookPageInfo[] = (data.data || []).map((page: any) => {
      const tasks: string[] = page.tasks || [];
      const canPublish =
        tasks.length === 0 ||
        tasks.includes('CREATE_CONTENT') ||
        tasks.includes('MANAGE') ||
        tasks.includes('MODERATE');

      return {
        id: page.id,
        name: page.name,
        category: page.category,
        accessToken: page.access_token,
        tasks,
        canPublish,
      };
    });

    return pages;
  } catch (err: any) {
    console.error('[Facebook Managed Pages Network Error]:', err.message);
    return [];
  }
}

/**
 * Validates that a Page Access Token possesses publishing rights on the target Facebook Page.
 */
export async function validateFacebookPagePermissions(
  pageId: string,
  pageAccessToken: string
): Promise<{ valid: boolean; pageId: string; pageName?: string; error?: string }> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${encodeURIComponent(pageId)}?fields=id,name,tasks&access_token=${encodeURIComponent(pageAccessToken)}`
    );
    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        valid: false,
        pageId,
        error: data.error?.message || `Failed to access Facebook Page ${pageId}`,
      };
    }

    const tasks: string[] = data.tasks || [];
    const hasPublishTask =
      tasks.length === 0 ||
      tasks.includes('CREATE_CONTENT') ||
      tasks.includes('MANAGE');

    if (!hasPublishTask) {
      return {
        valid: false,
        pageId,
        pageName: data.name,
        error: `Page Access Token lacks CREATE_CONTENT permission on Page "${data.name}". Tasks granted: ${tasks.join(', ')}`,
      };
    }

    return {
      valid: true,
      pageId: data.id,
      pageName: data.name,
    };
  } catch (err: any) {
    return {
      valid: false,
      pageId,
      error: `Network validation error: ${err.message}`,
    };
  }
}

/**
 * Publishes content to an official Facebook Business Page via Meta Graph API v21.0.
 * Supports Text, Image, Multi-Image Carousel, Video, and Scheduled Publishing.
 */
export async function publishToFacebook({
  pageId: customPageId,
  accessToken: customAccessToken,
  workspaceId,
  campaignId,
  payload,
}: {
  pageId?: string;
  accessToken?: string;
  workspaceId?: string;
  campaignId?: string;
  payload: FacebookPublishPayload;
}): Promise<FacebookPublishResult> {
  const startTime = Date.now();
  let pageId = customPageId || process.env.FACEBOOK_PAGE_ID;
  let accessToken = customAccessToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.META_WA_ACCESS_TOKEN;

  const isUuid = (val?: string) => !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

  // 1. If credentials not explicitly passed, attempt resolution from Neon DB Token Vault
  if ((!pageId || !accessToken) && isUuid(workspaceId) && db) {
    try {
      const [conn] = await db
        .select()
        .from(socialConnections)
        .where(
          and(
            eq(socialConnections.workspaceId, workspaceId!),
            eq(socialConnections.platform, 'facebook')
          )
        )
        .limit(1);

      if (conn?.accessTokenEncrypted) {
        accessToken = decryptToken(conn.accessTokenEncrypted);
        pageId = conn.platformAccountId.replace(/^page_/, '') || pageId;
      }
    } catch (vaultErr) {
      console.warn('[Facebook Publisher Vault Lookup Warning]:', vaultErr);
    }
  }

  // Fallback: Check if an Instagram connection with linked Facebook Page exists
  if ((!pageId || !accessToken) && isUuid(workspaceId) && db) {
    try {
      const [conn] = await db
        .select()
        .from(socialConnections)
        .where(
          and(
            eq(socialConnections.workspaceId, workspaceId!),
            eq(socialConnections.platform, 'instagram')
          )
        )
        .limit(1);

      if (conn?.accessTokenEncrypted) {
        accessToken = decryptToken(conn.accessTokenEncrypted);
      }
    } catch {}
  }

  // 2. Mock Publishing Fallback (when running in local development without live Meta App credentials)
  if (!accessToken || !pageId || accessToken.startsWith('kuiro_oauth2_') || pageId.startsWith('mock_')) {
    const mockPostId = `fb_post_${pageId || 'mock_page'}_${Date.now()}`;
    const isScheduled = payload.scheduledTime && payload.scheduledTime.getTime() > Date.now() + 10 * 60 * 1000;
    console.log(`[Facebook Mock Publisher] Post ${isScheduled ? 'scheduled' : 'published'} for page ${pageId || 'mock_page'}: "${payload.caption.substring(0, 50)}..."`);

    return {
      platform: 'facebook',
      status: isScheduled ? 'SCHEDULED' : 'MOCK_PUBLISHED',
      platformPostId: mockPostId,
      postUrl: `https://facebook.com/${mockPostId}`,
      pageId: pageId || 'mock_page_101',
      pageName: 'Sharma Heritage Handlooms (Mock)',
      attempts: 1,
      latencyMs: Date.now() - startTime,
    };
  }

  // 3. Execution against Live Meta Graph API v21.0
  try {
    const { result, attempts } = await executeWithRetry(async (attemptNum) => {
      const isScheduled = payload.scheduledTime && payload.scheduledTime.getTime() > Date.now() + 10 * 60 * 1000;
      const scheduledTimestamp = isScheduled ? Math.floor(payload.scheduledTime!.getTime() / 1000) : undefined;
      const mediaUrls = (payload.mediaUrls || []).filter((u) => u && !u.startsWith('data:'));

      let endpoint = '';
      let bodyParams = new URLSearchParams();
      bodyParams.set('access_token', accessToken!);

      if (isScheduled && scheduledTimestamp) {
        bodyParams.set('published', 'false');
        bodyParams.set('scheduled_publish_time', scheduledTimestamp.toString());
      } else {
        bodyParams.set('published', 'true');
      }

      // Case A: Video Post
      if (payload.mediaType === 'VIDEO' && mediaUrls[0]) {
        endpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(pageId!)}/videos`;
        bodyParams.set('file_url', mediaUrls[0]);
        bodyParams.set('description', payload.caption);
        if (payload.title) bodyParams.set('title', payload.title);
      }

      // Case B: Multi-Photo Carousel / Album Post (2+ images)
      else if (mediaUrls.length > 1) {
        // Step 1: Upload each photo unshared
        const photoIds: string[] = [];
        for (const imgUrl of mediaUrls.slice(0, 5)) {
          const photoUploadRes = await fetch(
            `https://graph.facebook.com/v21.0/${encodeURIComponent(pageId!)}/photos`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                url: imgUrl,
                published: 'false',
                access_token: accessToken!,
              }),
            }
          );
          const photoData = await photoUploadRes.json();
          if (photoUploadRes.ok && photoData.id) {
            photoIds.push(photoData.id);
          }
        }

        // Step 2: Publish feed story attaching uploaded photos
        endpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(pageId!)}/feed`;
        bodyParams.set('message', payload.caption);
        if (photoIds.length > 0) {
          const attachedMedia = photoIds.map((id) => ({ media_fbid: id }));
          bodyParams.set('attached_media', JSON.stringify(attachedMedia));
        }
      }

      // Case C: Single Photo Post
      else if (mediaUrls.length === 1) {
        endpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(pageId!)}/photos`;
        bodyParams.set('url', mediaUrls[0]);
        bodyParams.set('caption', payload.caption);
      }

      // Case D: Text-Only Post with Optional Link
      else {
        endpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(pageId!)}/feed`;
        bodyParams.set('message', payload.caption);
        if (payload.link) bodyParams.set('link', payload.link);
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyParams,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const error = new Error(data.error?.message || `Meta Graph API error (${res.status})`);
        (error as any).code = data.error?.code;
        (error as any).subcode = data.error?.error_subcode;
        throw error;
      }

      const platformPostId = data.post_id || data.id;
      return {
        platformPostId,
        isScheduled,
      };
    }, 3);

    const isScheduled = result.isScheduled;
    const postUrl = `https://facebook.com/${result.platformPostId}`;
    const latencyMs = Date.now() - startTime;

    console.log(`[Facebook Publisher Success] Published to Page ${pageId} -> Post ID: ${result.platformPostId} (${latencyMs}ms, ${attempts} attempts)`);

    // 4. Synchronize post record in Neon PostgreSQL if campaignId provided
    if (isUuid(campaignId) && db) {
      try {
        await db
          .update(platformPosts)
          .set({
            platformPostId: result.platformPostId,
            captionText: payload.caption,
          })
          .where(
            and(
              eq(platformPosts.campaignId, campaignId!),
              eq(platformPosts.platform, 'facebook')
            )
          );
      } catch (dbSyncErr) {
        console.warn('[Facebook Post DB Sync Warning]:', dbSyncErr);
      }
    }

    return {
      platform: 'facebook',
      status: isScheduled ? 'SCHEDULED' : 'PUBLISHED',
      platformPostId: result.platformPostId,
      postUrl,
      pageId,
      attempts,
      latencyMs,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    console.error(`[Facebook Publisher Error] Failed to publish post to Page ${pageId}:`, err.message);

    return {
      platform: 'facebook',
      status: 'FAILED',
      pageId,
      error: err.message || 'Facebook Graph API publishing failed.',
      attempts: 3,
      latencyMs,
    };
  }
}

/**
 * Checks the live status, engagement metrics, and visibility of a published Facebook Page post.
 */
export async function getFacebookPostStatus(
  postId: string,
  pageAccessToken: string
): Promise<{
  id: string;
  isPublished: boolean;
  createdTime?: string;
  reactionsCount: number;
  commentsCount: number;
  sharesCount: number;
  error?: string;
}> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${encodeURIComponent(postId)}?fields=id,is_published,created_time,reactions.summary(true),comments.summary(true),shares&access_token=${encodeURIComponent(pageAccessToken)}`
    );
    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        id: postId,
        isPublished: false,
        reactionsCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        error: data.error?.message || 'Failed to fetch Facebook post status',
      };
    }

    return {
      id: data.id,
      isPublished: data.is_published ?? true,
      createdTime: data.created_time,
      reactionsCount: data.reactions?.summary?.total_count || 0,
      commentsCount: data.comments?.summary?.total_count || 0,
      sharesCount: data.shares?.count || 0,
    };
  } catch (err: any) {
    return {
      id: postId,
      isPublished: false,
      reactionsCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      error: err.message,
    };
  }
}
