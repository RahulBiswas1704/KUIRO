import { NextRequest, NextResponse } from 'next/server';
import { db, socialConnections } from '@/db';
import { eq, and } from 'drizzle-orm';
import { verifyOAuthState, exchangeOAuthCode, validateRedirectUri } from '@/lib/social/oauth';
import { encryptToken, maskToken, ACTIVE_KEY_VERSION } from '@/lib/crypto/vault';
import { PlatformKey } from '@/constants/channels';

export const dynamic = 'force-dynamic';

/**
 * Universal OAuth 2.0 Callback Handler
 * 
 * Invoked by Meta, LinkedIn, X upon user approval.
 * 1. Cryptographically verifies HMAC-SHA256 state token to prevent CSRF.
 * 2. Validates callback URL against strict origin whitelist.
 * 3. Exchanges authorization code (with PKCE code_verifier for X) for genuine access tokens.
 * 4. Encrypts tokens with AES-256-GCM.
 * 5. Persists the credentials into Neon PostgreSQL social_connections vault with genuine account IDs.
 * 6. Redirects to Dashboard Settings with connection confirmation (or returns JSON for API clients).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { searchParams } = new URL(req.url);
  const wantsJson =
    req.headers.get('accept')?.includes('application/json') ||
    searchParams.get('format') === 'json';

  try {
    const { platform } = await params;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      console.warn(`[OAuth Provider Callback Error] ${platform}:`, error, errorDescription);
      if (wantsJson) {
        return NextResponse.json(
          { success: false, error: errorDescription || error },
          { status: 400 }
        );
      }
      return NextResponse.redirect(
        new URL(`/dashboard/settings?oauth_error=${encodeURIComponent(errorDescription || error)}`, req.url)
      );
    }

    if (!code || !state) {
      if (wantsJson) {
        return NextResponse.json(
          { success: false, error: 'Invalid OAuth callback: missing code or state parameter.' },
          { status: 400 }
        );
      }
      return NextResponse.redirect(
        new URL('/dashboard/settings?oauth_error=missing_code_or_state', req.url)
      );
    }

    // 1. Verify tamper-proof state HMAC
    const verifiedState = verifyOAuthState(state);
    if (!verifiedState) {
      if (wantsJson) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired OAuth state parameter (CSRF detected).' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(
        new URL('/dashboard/settings?oauth_error=csrf_or_expired_state', req.url)
      );
    }

    const { workspaceId, userId, platform: statePlatform, codeVerifier } = verifiedState;
    const platformKey = (statePlatform || platform) as PlatformKey;

    // 2. Validate redirect URI
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const redirectUri = `${origin}/api/auth/oauth/${platformKey}/callback`;

    if (!validateRedirectUri(redirectUri, origin)) {
      if (wantsJson) {
        return NextResponse.json(
          { success: false, error: 'Security violation: Redirect URI rejected by strict whitelist policy.' },
          { status: 400 }
        );
      }
      return NextResponse.redirect(
        new URL('/dashboard/settings?oauth_error=untrusted_redirect_uri', req.url)
      );
    }

    // 3. Exchange code for access & refresh tokens via genuine platform adapter
    const tokenResult = await exchangeOAuthCode(platformKey, code, redirectUri, codeVerifier);

    // 4. Encrypt tokens via AES-256-GCM Vault
    const encryptedAccessToken = encryptToken(tokenResult.accessToken);
    const encryptedRefreshToken = tokenResult.refreshToken ? encryptToken(tokenResult.refreshToken) : null;
    const expiresAt = new Date(Date.now() + tokenResult.expiresIn * 1000);

    // 5. Persist to Neon PostgreSQL
    let connectionId = `conn_${Date.now()}`;
    if (db) {
      const [existing] = await db
        .select()
        .from(socialConnections)
        .where(
          and(
            eq(socialConnections.workspaceId, workspaceId),
            eq(socialConnections.platform, platformKey)
          )
        )
        .limit(1);

      if (existing) {
        connectionId = existing.id;
        await db
          .update(socialConnections)
          .set({
            platformAccountId: tokenResult.platformAccountId,
            accessTokenEncrypted: encryptedAccessToken,
            refreshTokenEncrypted: encryptedRefreshToken,
            tokenExpiresAt: expiresAt,
            status: 'CONNECTED',
            grantedScopes: tokenResult.scopes || [],
            lastRefreshedAt: new Date(),
            lastApiCheckAt: new Date(),
            lastError: null,
            keyVersion: ACTIVE_KEY_VERSION,
            tokenVersion: existing.tokenVersion + 1,
            lockedUntil: null,
          })
          .where(eq(socialConnections.id, existing.id));
      } else {
        const [inserted] = await db
          .insert(socialConnections)
          .values({
            workspaceId,
            platform: platformKey,
            platformAccountId: tokenResult.platformAccountId,
            accessTokenEncrypted: encryptedAccessToken,
            refreshTokenEncrypted: encryptedRefreshToken,
            tokenExpiresAt: expiresAt,
            status: 'CONNECTED',
            grantedScopes: tokenResult.scopes || [],
            lastRefreshedAt: new Date(),
            lastApiCheckAt: new Date(),
            lastError: null,
            keyVersion: ACTIVE_KEY_VERSION,
            tokenVersion: 1,
          })
          .returning();
        if (inserted) connectionId = inserted.id;
      }
    }

    console.log(`[OAuth 2.0 Success] Linked ${platformKey} (${tokenResult.handle} / ${tokenResult.platformAccountId}) to workspace ${workspaceId}`);

    if (wantsJson) {
      return NextResponse.json({
        success: true,
        platform: platformKey,
        platformAccountId: tokenResult.platformAccountId,
        handle: tokenResult.handle,
        scopes: tokenResult.scopes,
        status: 'CONNECTED',
        expiresAt: expiresAt.toISOString(),
      });
    }

    return NextResponse.redirect(
      new URL(`/dashboard/settings?connected=${platformKey}&status=verified`, req.url)
    );
  } catch (err: any) {
    console.error('[OAuth Callback Error]:', err);
    if (wantsJson) {
      return NextResponse.json(
        { success: false, error: err.message || 'OAuth linking failed' },
        { status: 400 }
      );
    }
    return NextResponse.redirect(
      new URL(`/dashboard/settings?oauth_error=${encodeURIComponent(err.message || 'OAuth linking failed')}`, req.url)
    );
  }
}
