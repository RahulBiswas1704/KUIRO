import { NextRequest, NextResponse } from 'next/server';
import { authorizeWorkspace } from '@/lib/auth';
import { buildAuthorizationUrl, OAUTH_PLATFORMS, validateRedirectUri, getPlatformClientId } from '@/lib/social/oauth';
import { PlatformKey } from '@/constants/channels';

export const dynamic = 'force-dynamic';

/**
 * Initiates the genuine OAuth 2.0 Authorization Code Flow for a social platform.
 * 
 * Generates an unpredictable, tamper-proof anti-CSRF state token with HMAC-SHA256,
 * calculates PKCE code_challenge (S256) for X (Twitter), verifies redirect destination,
 * and redirects the browser to the official provider authorization screen.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await params;
    const platformKey = platform as PlatformKey;

    if (!OAUTH_PLATFORMS[platformKey]) {
      return NextResponse.json(
        { error: `Unsupported OAuth platform: ${platform}` },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const workspaceIdParam = searchParams.get('workspaceId');

    const auth = await authorizeWorkspace(req, workspaceIdParam);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const clientId = getPlatformClientId(platformKey);
    if (!clientId) {
      return NextResponse.json(
        {
          error: `OAuth credentials for ${platformKey} are not configured in environment (${OAUTH_PLATFORMS[platformKey].clientIdEnv} missing).`,
        },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const redirectUri = `${origin}/api/auth/oauth/${platformKey}/callback`;

    if (!validateRedirectUri(redirectUri, origin)) {
      return NextResponse.json(
        { error: 'Security violation: Redirect URI rejected by strict whitelist policy.' },
        { status: 400 }
      );
    }

    const { url, state } = buildAuthorizationUrl(
      platformKey,
      auth.workspaceId!,
      auth.session!.user.id,
      redirectUri
    );

    // If caller requests JSON (e.g. from frontend modal or test runner), return JSON payload
    if (
      req.headers.get('accept')?.includes('application/json') ||
      searchParams.get('format') === 'json'
    ) {
      return NextResponse.json({
        success: true,
        platform: platformKey,
        authorizationUrl: url,
        state,
      });
    }

    // Otherwise standard 302 redirect to OAuth consent screen
    return NextResponse.redirect(url);
  } catch (err: any) {
    console.error('[OAuth Authorize Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to initiate OAuth authorization flow' },
      { status: 500 }
    );
  }
}
