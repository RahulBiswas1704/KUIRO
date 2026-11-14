import { NextRequest, NextResponse } from 'next/server';
import { db, workspaces, socialConnections } from '@/db';
import { eq, and } from 'drizzle-orm';
import { authorizeWorkspace } from '@/lib/auth';
import { DEFAULT_CHANNELS, PlatformKey } from '@/constants/channels';
import { encryptToken, decryptToken, maskToken, ACTIVE_KEY_VERSION } from '@/lib/crypto/vault';
import { testPlatformConnection, buildAuthorizationUrl, OAUTH_PLATFORMS, validateRedirectUri } from '@/lib/social/oauth';
import { refreshConnectionToken } from '@/lib/social/tokenRefresh';

export const dynamic = 'force-dynamic';

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

    if (!db) {
      return NextResponse.json({
        success: true,
        source: 'local_fallback',
        connections: DEFAULT_CHANNELS.map((def) => ({
          ...def,
          handle: 'Not connected',
          platformAccountId: 'unconfigured',
          status: 'DISCONNECTED',
          isConfigured: false,
          tokenMasked: null,
        })),
      });
    }

    const wsId = auth.workspaceId!;

    // Query Neon DB social_connections for authorized workspace
    const dbConnections = await db
      .select()
      .from(socialConnections)
      .where(eq(socialConnections.workspaceId, wsId));

    // Map verified connections from DB
    const dbMap = new Map(dbConnections.map((c) => [c.platform, c]));

    const merged = DEFAULT_CHANNELS.map((def) => {
      const match = dbMap.get(def.platform);
      if (match) {
        const isExpired = match.tokenExpiresAt ? new Date() > new Date(match.tokenExpiresAt) : false;
        const currentStatus = isExpired ? 'EXPIRED' : match.status;
        return {
          id: match.id,
          platform: match.platform,
          name: def.name,
          handle: match.platformAccountId.startsWith('@') || match.platformAccountId.startsWith('+') || match.platformAccountId.startsWith('urn:')
            ? match.platformAccountId 
            : def.handle,
          platformAccountId: match.platformAccountId,
          status: currentStatus,
          tokenMasked: maskToken(match.accessTokenEncrypted),
          expiresAt: match.tokenExpiresAt,
          scopes: match.grantedScopes?.length ? match.grantedScopes : def.scopes,
          lastRefreshedAt: match.lastRefreshedAt,
          lastApiCheckAt: match.lastApiCheckAt,
          isConfigured: currentStatus === 'CONNECTED',
        };
      }
      return {
        ...def,
        handle: 'Not connected',
        platformAccountId: 'unconfigured',
        status: 'DISCONNECTED',
        isConfigured: false,
        tokenMasked: null,
      };
    });

    return NextResponse.json({
      success: true,
      workspaceId: wsId,
      connections: merged,
    });
  } catch (error: any) {
    console.error('[Social Connections GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch social connections' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      platform,
      action = 'connect',
      platformAccountId,
      accessToken,
      apiSecret,
      workspaceId: customWsId,
    } = body;

    const auth = await authorizeWorkspace(req, customWsId);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    if (!platform || !OAUTH_PLATFORMS[platform as PlatformKey]) {
      return NextResponse.json(
        { error: 'Valid platform is required (instagram, linkedin, x, whatsapp, or email).' },
        { status: 400 }
      );
    }

    const wsId = auth.workspaceId!;
    const platformKey = platform as PlatformKey;

    // 1. Action: Generate 1-Click OAuth 2.0 Authorization URL
    if (action === 'authorize') {
      const origin = req.nextUrl.origin || 'http://localhost:3000';
      const redirectUri = `${origin}/api/auth/oauth/${platformKey}/callback`;

      if (!validateRedirectUri(redirectUri, origin)) {
        return NextResponse.json(
          { success: false, error: 'Redirect URI failed whitelist security validation.' },
          { status: 400 }
        );
      }

      const { url, state } = buildAuthorizationUrl(platformKey, wsId, auth.session!.user.id, redirectUri);

      return NextResponse.json({
        success: true,
        action: 'authorize',
        platform: platformKey,
        authorizationUrl: url,
        state,
      });
    }

    // 2. Action: Test Handshake / Verify Credentials with Real Platform Endpoint
    if (action === 'test') {
      let candidateToken = accessToken;

      // If token not provided in body, load existing decrypted token from Neon DB vault
      if (!candidateToken && db) {
        const [existing] = await db
          .select()
          .from(socialConnections)
          .where(
            and(
              eq(socialConnections.workspaceId, wsId),
              eq(socialConnections.platform, platformKey)
            )
          )
          .limit(1);

        if (existing?.accessTokenEncrypted) {
          try {
            candidateToken = decryptToken(existing.accessTokenEncrypted);
          } catch {
            candidateToken = existing.accessTokenEncrypted;
          }
        }
      }

      const testResult = await testPlatformConnection(platformKey, candidateToken, platformAccountId, wsId);

      return NextResponse.json(
        {
          success: testResult.success,
          action: 'test',
          platform: platformKey,
          status: testResult.status,
          latencyMs: testResult.latencyMs,
          verifiedAccount: testResult.verifiedAccount,
          permissions: testResult.permissions,
          tokenValid: testResult.success,
          message: testResult.message,
        },
        { status: testResult.success ? 200 : 400 }
      );
    }

    // 3. Action: Proactively Refresh Token via Token Refresh Service
    if (action === 'refresh') {
      if (!db) {
        return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
      }

      const [existing] = await db
        .select()
        .from(socialConnections)
        .where(
          and(
            eq(socialConnections.workspaceId, wsId),
            eq(socialConnections.platform, platformKey)
          )
        )
        .limit(1);

      if (!existing) {
        return NextResponse.json(
          { success: false, error: `No connection found for ${platformKey} to refresh.` },
          { status: 404 }
        );
      }

      const refreshResult = await refreshConnectionToken(existing);

      return NextResponse.json(
        {
          success: refreshResult.success,
          action: 'refresh',
          platform: platformKey,
          status: refreshResult.status,
          message: refreshResult.message,
          expiresAt: refreshResult.newExpiresAt,
          latencyMs: refreshResult.latencyMs,
        },
        { status: refreshResult.success ? 200 : 400 }
      );
    }

    // 4. Action: Disconnect / Revoke
    if (action === 'disconnect') {
      if (db) {
        await db
          .update(socialConnections)
          .set({
            status: 'REVOKED',
            accessTokenEncrypted: '',
            refreshTokenEncrypted: null,
          })
          .where(
            and(
              eq(socialConnections.workspaceId, wsId),
              eq(socialConnections.platform, platformKey)
            )
          );
      }
      return NextResponse.json({
        success: true,
        platform: platformKey,
        status: 'DISCONNECTED',
        message: `${platformKey.toUpperCase()} connection revoked and credentials securely purged from vault.`,
      });
    }

    // 4. Action: Connect & Store with AES-256-GCM Encryption in Neon DB Vault
    if (!accessToken || typeof accessToken !== 'string' || accessToken.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access token is required to establish a connection. Please authorize via OAuth 2.0 or supply valid credentials.',
        },
        { status: 400 }
      );
    }

    if (
      accessToken.startsWith('kuiro_oauth2_') ||
      accessToken.startsWith('mock_') ||
      accessToken.startsWith('simulated_')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Simulated tokens (kuiro_oauth2_*) are rejected. Genuine platform OAuth connection required.',
        },
        { status: 400 }
      );
    }

    // Validate the token against the real platform before saving
    const testResult = await testPlatformConnection(platformKey, accessToken, platformAccountId, wsId);
    if (!testResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Token verification failed against ${OAUTH_PLATFORMS[platformKey].name}.`,
          details: testResult.message,
          status: testResult.status,
        },
        { status: 400 }
      );
    }

    const accountIdentifier = testResult.verifiedAccount || platformAccountId || `@${platformKey}_account`;
    const encryptedToken = encryptToken(accessToken);
    const expiresAt = new Date(Date.now() + 60 * 24 * 3600 * 1000); // 60 days

    let updatedRecord = null;
    if (db) {
      const [existing] = await db
        .select()
        .from(socialConnections)
        .where(
          and(
            eq(socialConnections.workspaceId, wsId),
            eq(socialConnections.platform, platformKey)
          )
        )
        .limit(1);

      if (existing) {
        [updatedRecord] = await db
          .update(socialConnections)
          .set({
            platformAccountId: accountIdentifier,
            accessTokenEncrypted: encryptedToken,
            tokenExpiresAt: expiresAt,
            status: 'CONNECTED',
            grantedScopes: testResult.permissions || OAUTH_PLATFORMS[platformKey].defaultScopes,
            lastRefreshedAt: new Date(),
            lastApiCheckAt: new Date(),
            lastError: null,
            keyVersion: ACTIVE_KEY_VERSION,
            tokenVersion: existing.tokenVersion + 1,
            lockedUntil: null,
          })
          .where(eq(socialConnections.id, existing.id))
          .returning();
      } else {
        [updatedRecord] = await db
          .insert(socialConnections)
          .values({
            workspaceId: wsId,
            platform: platformKey,
            platformAccountId: accountIdentifier,
            accessTokenEncrypted: encryptedToken,
            tokenExpiresAt: expiresAt,
            status: 'CONNECTED',
            grantedScopes: testResult.permissions || OAUTH_PLATFORMS[platformKey].defaultScopes,
            lastRefreshedAt: new Date(),
            lastApiCheckAt: new Date(),
            lastError: null,
            keyVersion: ACTIVE_KEY_VERSION,
            tokenVersion: 1,
          })
          .returning();
      }
    }

    return NextResponse.json({
      success: true,
      action: 'connect',
      platform: platformKey,
      connection: {
        id: updatedRecord?.id || `conn_${Date.now()}`,
        platform: platformKey,
        platformAccountId: accountIdentifier,
        status: 'CONNECTED',
        tokenMasked: maskToken(encryptedToken),
        tokenExpiresAt: expiresAt.toISOString(),
      },
      message: `${platformKey.toUpperCase()} connected successfully to KUIRO AES-256-GCM Vault!`,
    });
  } catch (error: any) {
    console.error('[Social Connections POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update social connection' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform') as PlatformKey | null;
    const workspaceIdParam = searchParams.get('workspaceId');

    if (!platform || !OAUTH_PLATFORMS[platform]) {
      return NextResponse.json({ error: 'Valid platform query parameter is required.' }, { status: 400 });
    }

    const auth = await authorizeWorkspace(req, workspaceIdParam);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const wsId = auth.workspaceId!;
    if (db) {
      await db
        .delete(socialConnections)
        .where(
          and(
            eq(socialConnections.workspaceId, wsId),
            eq(socialConnections.platform, platform)
          )
        );
    }

    return NextResponse.json({
      success: true,
      message: `${platform.toUpperCase()} connection deleted.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete connection' }, { status: 500 });
  }
}
