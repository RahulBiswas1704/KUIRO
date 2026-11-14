import { NextRequest, NextResponse } from 'next/server';
import { db, socialConnections, workspaces } from '@/db';
import { eq, and } from 'drizzle-orm';
import { verifyOAuthState, exchangeOAuthCode } from '@/lib/social/oauth';
import { encryptToken } from '@/lib/crypto/vault';
import { PlatformKey } from '@/constants/channels';

export const dynamic = 'force-dynamic';

/**
 * Universal OAuth 2.0 Callback Handler
 * 
 * Invoked by Meta, LinkedIn, X, or Google upon user consent.
 * 1. Cryptographically verifies HMAC state token to prevent CSRF.
 * 2. Exchanges authorization code for long-lived OAuth 2.0 access tokens.
 * 3. Encrypts tokens with AES-256-GCM.
 * 4. Persists the credentials into Neon PostgreSQL social_connections vault.
 * 5. Redirects to Dashboard Settings with connection confirmation.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await params;
    const { searchParams } = new URL(req.url);

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      console.warn(`[OAuth Provider Callback Error] ${platform}:`, error, errorDescription);
      return NextResponse.redirect(
        new URL(`/dashboard/settings?oauth_error=${encodeURIComponent(errorDescription || error)}`, req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Invalid OAuth callback: missing code or state parameter.' },
        { status: 400 }
      );
    }

    // 1. Verify tamper-proof state HMAC
    const verifiedState = verifyOAuthState(state);
    if (!verifiedState) {
      return NextResponse.json(
        { error: 'Invalid or expired OAuth state parameter (CSRF detected).' },
        { status: 403 }
      );
    }

    const { workspaceId, userId, platform: statePlatform } = verifiedState;
    const platformKey = (statePlatform || platform) as PlatformKey;

    // 2. Exchange code for access & refresh tokens
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const redirectUri = `${origin}/api/auth/oauth/${platformKey}/callback`;
    const tokenResult = await exchangeOAuthCode(platformKey, code, redirectUri);

    // 3. Encrypt tokens via AES-256-GCM Vault
    const encryptedAccessToken = encryptToken(tokenResult.accessToken);
    const encryptedRefreshToken = tokenResult.refreshToken ? encryptToken(tokenResult.refreshToken) : null;
    const expiresAt = new Date(Date.now() + tokenResult.expiresIn * 1000);

    // 4. Persist to Neon PostgreSQL
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
        await db
          .update(socialConnections)
          .set({
            platformAccountId: tokenResult.platformAccountId,
            accessTokenEncrypted: encryptedAccessToken,
            refreshTokenEncrypted: encryptedRefreshToken,
            tokenExpiresAt: expiresAt,
            status: 'CONNECTED',
          })
          .where(eq(socialConnections.id, existing.id));
      } else {
        await db.insert(socialConnections).values({
          workspaceId,
          platform: platformKey,
          platformAccountId: tokenResult.platformAccountId,
          accessTokenEncrypted: encryptedAccessToken,
          refreshTokenEncrypted: encryptedRefreshToken,
          tokenExpiresAt: expiresAt,
          status: 'CONNECTED',
        });
      }
    }

    console.log(`[OAuth 2.0 Success] Successfully linked ${platformKey} to workspace ${workspaceId}`);

    return NextResponse.redirect(
      new URL(`/dashboard/settings?connected=${platformKey}&status=verified`, req.url)
    );
  } catch (err: any) {
    console.error('[OAuth Callback Error]:', err);
    return NextResponse.redirect(
      new URL(`/dashboard/settings?oauth_error=${encodeURIComponent(err.message || 'OAuth linking failed')}`, req.url)
    );
  }
}
