import { NextRequest, NextResponse } from 'next/server';
import { db, socialConnections } from '@/db';
import { eq, and } from 'drizzle-orm';
import { authorizeWorkspace } from '@/lib/auth';
import { decryptToken } from '@/lib/crypto/vault';
import {
  publishToFacebook,
  getFacebookManagedPages,
  FacebookPublishPayload,
} from '@/lib/social/facebookPublisher';

export const dynamic = 'force-dynamic';

/**
 * GET /api/publish/facebook
 * Discovers and lists managed Facebook Pages for the authenticated workspace.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceIdParam = searchParams.get('workspaceId');

    const auth = await authorizeWorkspace(req, workspaceIdParam);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const workspaceId = auth.workspaceId!;

    // 1. Resolve encrypted token for Facebook (or Meta/Instagram) from Token Vault
    let accessToken: string | null = null;

    if (db) {
      const [fbConn] = await db
        .select()
        .from(socialConnections)
        .where(
          and(
            eq(socialConnections.workspaceId, workspaceId),
            eq(socialConnections.platform, 'facebook')
          )
        )
        .limit(1);

      if (fbConn?.accessTokenEncrypted) {
        accessToken = decryptToken(fbConn.accessTokenEncrypted);
      } else {
        // Fallback to Instagram/Meta token
        const [igConn] = await db
          .select()
          .from(socialConnections)
          .where(
            and(
              eq(socialConnections.workspaceId, workspaceId),
              eq(socialConnections.platform, 'instagram')
            )
          )
          .limit(1);

        if (igConn?.accessTokenEncrypted) {
          accessToken = decryptToken(igConn.accessTokenEncrypted);
        }
      }
    }

    if (!accessToken) {
      accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.META_WA_ACCESS_TOKEN || null;
    }

    if (!accessToken) {
      return NextResponse.json({
        success: true,
        source: 'unconnected',
        pages: [],
        message: 'No connected Meta/Facebook account found for this workspace. Please connect Facebook via OAuth.',
      });
    }

    // 2. Discover Facebook Pages
    const pages = await getFacebookManagedPages(accessToken);

    return NextResponse.json({
      success: true,
      pages,
      count: pages.length,
    });
  } catch (err: any) {
    console.error('[API /api/publish/facebook GET Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/publish/facebook
 * Publishes or schedules a post directly to a Facebook Page.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      workspaceId: bodyWorkspaceId,
      pageId,
      caption,
      mediaUrls,
      mediaType,
      link,
      title,
      scheduledTime,
      campaignId,
    } = body;

    const auth = await authorizeWorkspace(req, bodyWorkspaceId);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const workspaceId = auth.workspaceId!;

    if (!caption || typeof caption !== 'string' || caption.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Caption is required for Facebook publishing.' },
        { status: 400 }
      );
    }

    let parsedScheduledTime: Date | undefined;
    if (scheduledTime) {
      parsedScheduledTime = new Date(scheduledTime);
      if (isNaN(parsedScheduledTime.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid scheduledTime format. Provide a valid ISO timestamp.' },
          { status: 400 }
        );
      }
    }

    const payload: FacebookPublishPayload = {
      caption: caption.trim(),
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : undefined,
      mediaType: mediaType || (mediaUrls?.length > 1 ? 'CAROUSEL' : mediaUrls?.length === 1 ? 'IMAGE' : 'TEXT'),
      link: link || undefined,
      title: title || undefined,
      scheduledTime: parsedScheduledTime,
    };

    const result = await publishToFacebook({
      pageId,
      workspaceId,
      campaignId,
      payload,
    });

    const isSuccess = result.status === 'PUBLISHED' || result.status === 'SCHEDULED' || result.status === 'MOCK_PUBLISHED';

    return NextResponse.json(
      {
        success: isSuccess,
        result,
      },
      { status: isSuccess ? 200 : 502 }
    );
  } catch (err: any) {
    console.error('[API /api/publish/facebook POST Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
