import { NextRequest, NextResponse } from 'next/server';
import { authorizeWorkspace } from '@/lib/auth';
import { buildAuthorizationUrl, OAUTH_PLATFORMS } from '@/lib/social/oauth';
import { PlatformKey } from '@/constants/channels';

export const dynamic = 'force-dynamic';

/**
 * Initiates the OAuth 2.0 Authorization Code Flow for a social platform.
 * 
 * Generates a signed anti-CSRF state token and redirects the browser
 * to the official authorization screen of Meta, LinkedIn, X, etc.
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

    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const redirectUri = `${origin}/api/auth/oauth/${platformKey}/callback`;

    const { url, state } = buildAuthorizationUrl(
      platformKey,
      auth.workspaceId!,
      auth.session!.user.id,
      redirectUri
    );

    // If caller requests JSON (e.g. from frontend modal), return JSON payload
    if (req.headers.get('accept')?.includes('application/json')) {
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
