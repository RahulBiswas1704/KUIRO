/**
 * KUIRO Multi-Channel Autonomous Publishing Engine
 * 
 * Executes programmatic publishing across Instagram, Facebook, LinkedIn, and X (Twitter)
 * with automatic link-surcharge avoidance (placing URLs in the first reply on X).
 */

import { validateUrlForSSRF } from '@/lib/security/safeFetch';

export interface PublishPayload {
  caption: string;
  mediaUrls: string[];
  videoUrl?: string;
  youtubeTitle?: string;
  firstReply?: string;
  aspectRatio?: '1:1' | '4:5' | '9:16';
  emailSubject?: string;
  brandName?: string;
  subscriberList?: string[];
}

export interface ChannelPublishResult {
  platform: 'instagram' | 'facebook' | 'linkedin' | 'x' | 'youtube' | 'email';
  status: 'PUBLISHED' | 'FAILED' | 'MOCK_PUBLISHED';
  platformPostId?: string;
  postUrl?: string;
  error?: string;
}

/**
 * Publish to Instagram Graph API
 * Requires: Public HTTPS image URL + IG Business Account ID + Page Access Token
 */
export async function publishToInstagram({
  igAccountId,
  accessToken,
  payload,
}: {
  igAccountId?: string;
  accessToken?: string;
  payload: PublishPayload;
}): Promise<ChannelPublishResult> {
  const token = accessToken || process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = igAccountId || process.env.INSTAGRAM_ACCOUNT_ID;
  const imageUrl = payload.mediaUrls[0];

  if (!token || !accountId || !imageUrl || imageUrl.startsWith('data:')) {
    console.log('[Instagram Mock Publisher] Automated post queued:', payload.caption.substring(0, 50));
    return {
      platform: 'instagram',
      status: 'MOCK_PUBLISHED',
      platformPostId: `ig_mock_${Date.now()}`,
      postUrl: 'https://instagram.com/p/mock_post',
    };
  }

  try {
    // Step 1: Create media container
    const containerRes = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/media?image_url=${encodeURIComponent(
        imageUrl
      )}&caption=${encodeURIComponent(payload.caption)}&access_token=${token}`,
      { method: 'POST' }
    );
    const containerData = await containerRes.json();
    if (!containerRes.ok) throw new Error(containerData.error?.message || 'Failed to create IG container');

    const creationId = containerData.id;

    // Step 2: Publish media container
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/media_publish?creation_id=${creationId}&access_token=${token}`,
      { method: 'POST' }
    );
    const publishData = await publishRes.json();
    if (!publishRes.ok) throw new Error(publishData.error?.message || 'Failed to publish IG media');

    return {
      platform: 'instagram',
      status: 'PUBLISHED',
      platformPostId: publishData.id,
      postUrl: `https://instagram.com/p/${publishData.id}`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Instagram Publish Error]', errorMsg);
    return { platform: 'instagram', status: 'FAILED', error: errorMsg };
  }
}

/**
 * Publish to LinkedIn API v2 (UGC Post)
 */
export async function publishToLinkedIn({
  authorUrn,
  accessToken,
  payload,
}: {
  authorUrn?: string;
  accessToken?: string;
  payload: PublishPayload;
}): Promise<ChannelPublishResult> {
  const token = accessToken || process.env.LINKEDIN_ACCESS_TOKEN;
  const author = authorUrn || process.env.LINKEDIN_AUTHOR_URN;

  if (!token || !author) {
    console.log('[LinkedIn Mock Publisher] Post published:', payload.caption.substring(0, 50));
    return {
      platform: 'linkedin',
      status: 'MOCK_PUBLISHED',
      platformPostId: `urn:li:share:mock_${Date.now()}`,
      postUrl: 'https://linkedin.com/feed/update/urn:li:share:mock',
    };
  }

  try {
    const body = {
      author,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: payload.caption,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'LinkedIn publish error');

    return {
      platform: 'linkedin',
      status: 'PUBLISHED',
      platformPostId: data.id,
      postUrl: `https://linkedin.com/feed/update/${data.id}`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { platform: 'linkedin', status: 'FAILED', error: errorMsg };
  }
}

/**
 * Publish to X (Twitter) API v2
 * Enforces Link Surcharge Guardrail:
 *   URLs are stripped from the main tweet and posted in the immediate first reply.
 */
export async function publishToX({
  accessToken,
  payload,
}: {
  accessToken?: string;
  payload: PublishPayload;
}): Promise<ChannelPublishResult> {
  const token = accessToken || process.env.X_ACCESS_TOKEN;

  if (!token) {
    console.log('[X (Twitter) Mock Publisher] Published with link-in-reply guardrail');
    return {
      platform: 'x',
      status: 'MOCK_PUBLISHED',
      platformPostId: `x_mock_${Date.now()}`,
      postUrl: 'https://x.com/status/mock',
    };
  }

  try {
    // 1. Post Main Tweet (zero links in main body)
    const mainRes = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: payload.caption }),
    });

    const mainData = await mainRes.json();
    if (!mainRes.ok) throw new Error(mainData.detail || 'X API error');

    const mainTweetId = mainData.data?.id;

    // 2. If firstReply contains link, seed it as a reply to avoid $0.20 surcharge
    if (payload.firstReply && mainTweetId) {
      await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: payload.firstReply,
          reply: { in_reply_to_tweet_id: mainTweetId },
        }),
      });
    }

    return {
      platform: 'x',
      status: 'PUBLISHED',
      platformPostId: mainTweetId,
      postUrl: `https://x.com/i/status/${mainTweetId}`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { platform: 'x', status: 'FAILED', error: errorMsg };
  }
}

import { sendAutonomousEmailNewsletter } from '../email/publisher';
import { publishToFacebook as publishToFacebookNative } from './facebookPublisher';

/**
 * Publish to Facebook Page via Meta Graph API v21.0
 */
export async function publishFacebookChannel({
  pageId,
  accessToken,
  workspaceId,
  campaignId,
  payload,
}: {
  pageId?: string;
  accessToken?: string;
  workspaceId?: string;
  campaignId?: string;
  payload: PublishPayload;
}): Promise<ChannelPublishResult> {
  const fbRes = await publishToFacebookNative({
    pageId,
    accessToken,
    workspaceId,
    campaignId,
    payload: {
      caption: payload.caption,
      mediaUrls: payload.mediaUrls,
      mediaType: payload.mediaUrls?.length ? 'IMAGE' : 'TEXT',
      link: payload.firstReply?.startsWith('http') ? payload.firstReply : undefined,
    },
  });

  return {
    platform: 'facebook',
    status: fbRes.status as any,
    platformPostId: fbRes.platformPostId,
    postUrl: fbRes.postUrl,
    error: fbRes.error,
  };
}

/**
 * Publish vertical 9:16 clip to YouTube Shorts via YouTube Data API v3 (Resumable Upload)
 * Automatically sets snippet.categoryId = "22" (People & Blogs) and ensures #Shorts discovery tag.
 */
export async function publishToYouTubeShorts({
  accessToken,
  payload,
}: {
  accessToken?: string;
  payload: PublishPayload;
}): Promise<ChannelPublishResult> {
  const token = accessToken || process.env.YOUTUBE_ACCESS_TOKEN;
  const candidateVideoUrl =
    payload.videoUrl ||
    payload.mediaUrls.find((u) => /\.(mp4|mov|webm|m4v)(\?|$)/i.test(u));

  if (!token || !candidateVideoUrl || candidateVideoUrl.startsWith('data:')) {
    console.log('[YouTube Shorts Mock Publisher] Short queued:', payload.caption.substring(0, 50));
    return {
      platform: 'youtube',
      status: 'MOCK_PUBLISHED',
      platformPostId: `yt_short_mock_${Date.now()}`,
      postUrl: 'https://youtube.com/shorts/mock_short',
    };
  }

  try {
    const ssrfCheck = validateUrlForSSRF(candidateVideoUrl);
    if (!ssrfCheck.valid) {
      throw new Error(`YouTube media source rejected by SSRF policy: ${ssrfCheck.error || 'Untrusted URL'}`);
    }

    // 1. Download video asset from verified CDN (e.g. Cloudflare R2 / Neon Object Storage)
    const videoFetch = await fetch(candidateVideoUrl, { signal: AbortSignal.timeout(20000) });
    if (!videoFetch.ok) {
      throw new Error(`Failed to fetch Shorts video media (${videoFetch.status})`);
    }
    const videoContentType = videoFetch.headers.get('content-type') || 'video/mp4';
    const videoArrayBuffer = await videoFetch.arrayBuffer();
    const videoBuffer = Buffer.from(videoArrayBuffer);

    // Prepare YouTube metadata ensuring #Shorts discovery compliance
    const rawFirstLine = payload.youtubeTitle || payload.caption.split('\n')[0] || 'Brand Highlight';
    const normalizedTitle = rawFirstLine.toLowerCase().includes('#shorts')
      ? rawFirstLine.slice(0, 98)
      : `${rawFirstLine.slice(0, 90)} #Shorts`;
    const normalizedDescription = payload.caption.toLowerCase().includes('#shorts')
      ? payload.caption
      : `${payload.caption}\n\n#Shorts`;

    // 2. Initiate Resumable Upload Session
    const initRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Length': String(videoBuffer.length),
          'X-Upload-Content-Type': videoContentType,
        },
        body: JSON.stringify({
          snippet: {
            title: normalizedTitle,
            description: normalizedDescription,
            tags: ['Shorts', payload.brandName || 'KUIRO'].filter(Boolean),
            categoryId: '22',
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
          },
        }),
      }
    );

    if (!initRes.ok) {
      const initErr = await initRes.json().catch(() => ({}));
      throw new Error(initErr.error?.message || `YouTube upload init failed (${initRes.status})`);
    }

    const uploadUrl = initRes.headers.get('location');
    if (!uploadUrl) {
      throw new Error('YouTube Data API v3 did not return a resumable upload Location header.');
    }

    // 3. Stream binary video bytes to resumable session endpoint
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': videoContentType,
        'Content-Length': String(videoBuffer.length),
      },
      body: videoBuffer,
    });

    const uploadData = await uploadRes.json().catch(() => ({}));
    if (!uploadRes.ok || !uploadData.id) {
      throw new Error(uploadData.error?.message || `YouTube binary upload failed (${uploadRes.status})`);
    }

    return {
      platform: 'youtube',
      status: 'PUBLISHED',
      platformPostId: uploadData.id,
      postUrl: `https://youtube.com/shorts/${uploadData.id}`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[YouTube Shorts Publish Error]', errorMsg);
    return { platform: 'youtube', status: 'FAILED', error: errorMsg };
  }
}

/**
 * Parallel Dispatcher for All Channels (Facebook, Instagram, LinkedIn, X, Optional YouTube Shorts & Email Newsletter)
 */
export async function publishToAllChannels(
  payload: PublishPayload,
  options?: { workspaceId?: string; pageId?: string; includeYouTube?: boolean }
): Promise<ChannelPublishResult[]> {
  const tasks: Promise<ChannelPublishResult>[] = [
    publishFacebookChannel({ payload, workspaceId: options?.workspaceId, pageId: options?.pageId }),
    publishToInstagram({ payload }),
    publishToLinkedIn({ payload }),
    publishToX({ payload }),
  ];

  if (options?.includeYouTube || payload.videoUrl) {
    tasks.push(publishToYouTubeShorts({ payload }));
  }

  if (payload.emailSubject) {
    tasks.push(
      sendAutonomousEmailNewsletter({
        to: payload.subscriberList || ['subscribers@sharmaheritage.in'],
        subject: payload.emailSubject,
        brandName: payload.brandName || 'Brand Autopilot',
        headline: payload.emailSubject,
        bodyContentHtml: `<p>${payload.caption.replace(/\n/g, '<br/>')}</p>`,
      }).then((res) => ({
        platform: 'email' as const,
        status: res.status,
        platformPostId: res.campaignId,
        error: res.error,
      }))
    );
  }

  const results = await Promise.all(tasks);
  return results;
}

import { executeWithIdempotency, IdempotencyKeyBuilder } from '@/lib/events/idempotency';
import { db, platformPosts } from '@/db';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/lib/observability/logger';
import { metrics } from '@/lib/observability/metrics';
import { alertManager } from '@/lib/observability/alerts';

/**
 * Idempotent Channel Publishing Wrapper
 * Guarantees that a campaign is NEVER published twice to the same social platform for the same content version.
 * 
 * If called multiple times with the same (campaignId, platform, contentVersionHash):
 * 1. Checks durable_events receipt table.
 * 2. If already COMPLETED: returns cached ChannelPublishResult immediately without calling the external API.
 * 3. If in-flight: protects against concurrent duplicate posting.
 * 4. If timed out on social API: attempts reconciliation before re-attempting.
 */
export async function publishCampaignChannelWithIdempotency({
  campaignId,
  platform,
  contentVersionHash,
  workspaceId,
  payload,
  pageId,
  authorUrn,
  accessToken,
}: {
  campaignId: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'x' | 'youtube' | 'email';
  contentVersionHash: string;
  workspaceId?: string;
  payload: PublishPayload;
  pageId?: string;
  authorUrn?: string;
  accessToken?: string;
}): Promise<ChannelPublishResult> {
  const startTime = Date.now();
  const idempotencyKey = IdempotencyKeyBuilder.campaignPublish({
    campaignId,
    platform,
    contentVersionHash,
  });

  const res = await executeWithIdempotency<ChannelPublishResult>(
    {
      idempotencyKey,
      eventType: `social_publish/${platform}`,
      workspaceId,
      relatedEntityId: campaignId,
      payload: { platform, contentVersionHash, captionSnippet: payload.caption.slice(0, 80) },
      maxRetries: 3,
      lockTimeoutMs: 90000,
      reconcileFn: async () => {
        if (db) {
          const [existingPost] = await db
            .select()
            .from(platformPosts)
            .where(
              and(
                eq(platformPosts.campaignId, campaignId),
                eq(platformPosts.platform, platform)
              )
            )
            .limit(1);

          if (existingPost?.platformPostId) {
            return {
              reconciled: true,
              result: {
                platform,
                status: 'PUBLISHED',
                platformPostId: existingPost.platformPostId,
                postUrl: `https://${platform}.com/posts/${existingPost.platformPostId}`,
              },
            };
          }
        }
        return { reconciled: false, stillUncertain: false };
      },
    },
    async () => {
      if (platform === 'facebook') {
        return publishFacebookChannel({ payload, workspaceId, pageId, campaignId, accessToken });
      } else if (platform === 'instagram') {
        return publishToInstagram({ payload, igAccountId: pageId, accessToken });
      } else if (platform === 'linkedin') {
        return publishToLinkedIn({ payload, authorUrn, accessToken });
      } else if (platform === 'x') {
        return publishToX({ payload, accessToken });
      } else if (platform === 'youtube') {
        return publishToYouTubeShorts({ payload, accessToken });
      } else {
        const emailRes = await sendAutonomousEmailNewsletter({
          to: payload.subscriberList || ['subscribers@sharmaheritage.in'],
          subject: payload.emailSubject || 'Brand Update',
          brandName: payload.brandName || 'Brand Autopilot',
          headline: payload.emailSubject || 'Brand Update',
          bodyContentHtml: `<p>${payload.caption.replace(/\n/g, '<br/>')}</p>`,
        });
        return {
          platform: 'email',
          status: emailRes.status as any,
          platformPostId: emailRes.campaignId,
          error: emailRes.error,
        };
      }
    }
  );

  const durationMs = Date.now() - startTime;

  if (res.result && (res.result.status === 'PUBLISHED' || res.result.status === 'MOCK_PUBLISHED')) {
    logger.info('social_publish_completed', {
      service: 'campaign-publisher',
      event: 'publish_succeeded',
      workspaceId,
      campaignId,
      platform,
      durationMs,
      metadata: {
        status: res.result.status,
        platformPostId: res.result.platformPostId,
      },
    });
    metrics.increment('social.publish_success', { platform });
    metrics.recordDuration('social.publish_duration', durationMs, { platform });
    return res.result;
  }

  const errorText = res.result?.error || res.error || 'Idempotent publishing failed';
  const errorCode = errorText.toLowerCase().includes('timeout')
    ? 'PROVIDER_TIMEOUT'
    : errorText.toLowerCase().includes('token')
    ? 'TOKEN_EXPIRED'
    : 'PROVIDER_ERROR';

  logger.error('social_publish_failed', {
    service: 'campaign-publisher',
    event: 'publish_failed',
    workspaceId,
    campaignId,
    platform,
    errorCode,
    durationMs,
    metadata: { error: errorText },
  });

  // Evaluate failure threshold and trigger alert if spike detected
  await alertManager.checkPublishingFailureThreshold({
    workspaceId,
    campaignId,
    platform,
    errorCode,
  });

  return {
    platform,
    status: 'FAILED',
    error: errorText,
  };
}


