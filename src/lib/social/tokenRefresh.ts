import { db, socialConnections } from '@/db';
import { eq, and, or, isNull, lt, lte, sql } from 'drizzle-orm';
import { decryptToken, encryptToken, isEncrypted, maskToken } from '@/lib/crypto/vault';
import { getPlatformClientId, getPlatformClientSecret, OAUTH_PLATFORMS, testPlatformConnection } from '@/lib/social/oauth';
import { PlatformKey } from '@/constants/channels';

export interface RefreshResult {
  connectionId: string;
  workspaceId: string;
  platform: string;
  success: boolean;
  status: 'CONNECTED' | 'EXPIRED' | 'REVOKED' | 'SKIPPED';
  message: string;
  newExpiresAt?: string;
  latencyMs: number;
}

export interface RefreshOptions {
  thresholdDays?: number; // Refresh if expiring within X days (default: 7)
  workspaceId?: string; // Optional: restrict to a specific workspace
  force?: boolean; // Force refresh regardless of expiry timestamp
}

/**
 * Atomically acquires a distributed lock on a social connection record
 * to prevent duplicate or overlapping concurrent refresh jobs.
 */
export async function acquireRefreshLock(
  connectionId: string,
  currentVersion: number,
  lockTtlMs: number = 120000 // 2 minutes lock TTL
): Promise<boolean> {
  if (!db) return false;

  const now = new Date();
  const lockUntil = new Date(now.getTime() + lockTtlMs);

  const updated = await db
    .update(socialConnections)
    .set({
      lockedUntil: lockUntil,
    })
    .where(
      and(
        eq(socialConnections.id, connectionId),
        eq(socialConnections.tokenVersion, currentVersion),
        or(
          isNull(socialConnections.lockedUntil),
          lt(socialConnections.lockedUntil, now)
        )
      )
    )
    .returning({ id: socialConnections.id });

  return updated.length > 0;
}

/**
 * Releases a distributed lock on a social connection record
 */
export async function releaseRefreshLock(connectionId: string): Promise<void> {
  if (!db) return;
  try {
    await db
      .update(socialConnections)
      .set({ lockedUntil: null })
      .where(eq(socialConnections.id, connectionId));
  } catch (err) {
    console.warn(`[TokenVault Lock Release Warning] Failed to release lock for ${connectionId}:`, err);
  }
}

/**
 * Refreshes an individual social connection's tokens using provider-native OAuth refresh flows.
 * Enforces optimistic concurrency control via token_version to prevent race condition overwrites.
 */
export async function refreshConnectionToken(
  conn: typeof socialConnections.$inferSelect
): Promise<RefreshResult> {
  const startTime = Date.now();
  const platform = conn.platform as PlatformKey;
  const config = OAUTH_PLATFORMS[platform];

  // 1. Acquire distributed lock with current token_version
  const locked = await acquireRefreshLock(conn.id, conn.tokenVersion);
  if (!locked) {
    return {
      connectionId: conn.id,
      workspaceId: conn.workspaceId,
      platform,
      success: false,
      status: 'SKIPPED',
      message: 'Connection is currently locked by another refresh worker or token version changed.',
      latencyMs: Date.now() - startTime,
    };
  }

  try {
    const clientId = getPlatformClientId(platform);
    const clientSecret = getPlatformClientSecret(platform);

    let newAccessToken = '';
    let newRefreshToken = conn.refreshTokenEncrypted ? decryptToken(conn.refreshTokenEncrypted) : undefined;
    let expiresInSec = 60 * 24 * 3600; // default 60 days
    let refreshTokenExpiresInSec: number | undefined;

    // A. Meta (Facebook / Instagram) Token Refresh Flow
    // Meta uses grant_type=fb_exchange_token over the long-lived access token
    if (platform === 'instagram' || platform === 'whatsapp') {
      if (!clientId || !clientSecret) {
        throw new Error(`Missing Meta client credentials in environment (${config.clientIdEnv} / ${config.clientSecretEnv}).`);
      }

      const currentAccessToken = decryptToken(conn.accessTokenEncrypted);
      const params = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: clientId,
        client_secret: clientSecret,
        fb_exchange_token: currentAccessToken,
      });

      const res = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        const errCode = data.error?.code;
        // Error code 190 represents revoked, expired, or invalid session
        const isRevoked = errCode === 190;
        const msg = data.error?.message || 'Meta token exchange failed.';
        
        if (db) {
          await db
            .update(socialConnections)
            .set({
              status: isRevoked ? 'REVOKED' : 'EXPIRED',
              lastError: msg,
              lockedUntil: null,
            })
            .where(eq(socialConnections.id, conn.id));
        }

        return {
          connectionId: conn.id,
          workspaceId: conn.workspaceId,
          platform,
          success: false,
          status: isRevoked ? 'REVOKED' : 'EXPIRED',
          message: msg,
          latencyMs: Date.now() - startTime,
        };
      }

      newAccessToken = data.access_token;
      expiresInSec = data.expires_in || 60 * 24 * 3600;
    }

    // B. LinkedIn Token Refresh Flow (Standard OAuth 2.0 refresh_token)
    else if (platform === 'linkedin') {
      if (!conn.refreshTokenEncrypted) {
        // If LinkedIn was connected without offline access, probe active token
        const probe = await testPlatformConnection(platform, decryptToken(conn.accessTokenEncrypted), conn.platformAccountId, conn.workspaceId);
        await releaseRefreshLock(conn.id);
        return {
          connectionId: conn.id,
          workspaceId: conn.workspaceId,
          platform,
          success: probe.success,
          status: probe.success ? 'CONNECTED' : (probe.status as any),
          message: probe.message,
          latencyMs: Date.now() - startTime,
        };
      }

      if (!clientId || !clientSecret) {
        throw new Error(`Missing LinkedIn client credentials (${config.clientIdEnv} / ${config.clientSecretEnv}).`);
      }

      const decryptedRefreshToken = decryptToken(conn.refreshTokenEncrypted);
      const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: decryptedRefreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        const msg = data.error_description || data.error || 'LinkedIn refresh token rejected.';
        if (db) {
          await db
            .update(socialConnections)
            .set({
              status: 'REVOKED',
              lastError: msg,
              lockedUntil: null,
            })
            .where(eq(socialConnections.id, conn.id));
        }

        return {
          connectionId: conn.id,
          workspaceId: conn.workspaceId,
          platform,
          success: false,
          status: 'REVOKED',
          message: msg,
          latencyMs: Date.now() - startTime,
        };
      }

      newAccessToken = data.access_token;
      expiresInSec = data.expires_in || 60 * 24 * 3600;
      if (data.refresh_token) {
        newRefreshToken = data.refresh_token;
      }
      if (data.refresh_token_expires_in) {
        refreshTokenExpiresInSec = data.refresh_token_expires_in;
      }
    }

    // C. X (Twitter) Token Refresh Flow (OAuth 2.0 with rotating refresh_token)
    else if (platform === 'x') {
      if (!conn.refreshTokenEncrypted) {
        const probe = await testPlatformConnection(platform, decryptToken(conn.accessTokenEncrypted), conn.platformAccountId, conn.workspaceId);
        await releaseRefreshLock(conn.id);
        return {
          connectionId: conn.id,
          workspaceId: conn.workspaceId,
          platform,
          success: probe.success,
          status: probe.success ? 'CONNECTED' : (probe.status as any),
          message: probe.message,
          latencyMs: Date.now() - startTime,
        };
      }

      if (!clientId || !clientSecret) {
        throw new Error(`Missing X client credentials (${config.clientIdEnv} / ${config.clientSecretEnv}).`);
      }

      const decryptedRefreshToken = decryptToken(conn.refreshTokenEncrypted);
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const res = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: decryptedRefreshToken,
          client_id: clientId,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        const msg = data.error_description || data.error || 'X OAuth refresh token rejected.';
        if (db) {
          await db
            .update(socialConnections)
            .set({
              status: 'REVOKED',
              lastError: msg,
              lockedUntil: null,
            })
            .where(eq(socialConnections.id, conn.id));
        }

        return {
          connectionId: conn.id,
          workspaceId: conn.workspaceId,
          platform,
          success: false,
          status: 'REVOKED',
          message: msg,
          latencyMs: Date.now() - startTime,
        };
      }

      newAccessToken = data.access_token;
      expiresInSec = data.expires_in || 7200;
      // Twitter rotates refresh token on every refresh
      if (data.refresh_token) {
        newRefreshToken = data.refresh_token;
      }
    }

    // D. Static API Key Channels (e.g. Email / Resend)
    else {
      const probe = await testPlatformConnection(platform, decryptToken(conn.accessTokenEncrypted), conn.platformAccountId, conn.workspaceId);
      await releaseRefreshLock(conn.id);
      return {
        connectionId: conn.id,
        workspaceId: conn.workspaceId,
        platform,
        success: probe.success,
        status: probe.success ? 'CONNECTED' : (probe.status as any),
        message: probe.message,
        latencyMs: Date.now() - startTime,
      };
    }

    // 2. Encrypt new credentials with AES-256-GCM
    const encryptedAccessToken = encryptToken(newAccessToken);
    const encryptedRefreshToken = newRefreshToken ? encryptToken(newRefreshToken) : null;
    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + expiresInSec * 1000);
    const newRefreshTokenExpiresAt = refreshTokenExpiresInSec
      ? new Date(now.getTime() + refreshTokenExpiresInSec * 1000)
      : conn.refreshTokenExpiresAt;

    // 3. Update Database with Optimistic Concurrency Control (OCC)
    // Only update if token_version matches the version we locked!
    if (db) {
      const [updated] = await db
        .update(socialConnections)
        .set({
          accessTokenEncrypted: encryptedAccessToken,
          refreshTokenEncrypted: encryptedRefreshToken,
          tokenExpiresAt: newExpiresAt,
          refreshTokenExpiresAt: newRefreshTokenExpiresAt,
          lastRefreshedAt: now,
          lastApiCheckAt: now,
          lastError: null,
          status: 'CONNECTED',
          tokenVersion: conn.tokenVersion + 1,
          lockedUntil: null,
        })
        .where(
          and(
            eq(socialConnections.id, conn.id),
            eq(socialConnections.tokenVersion, conn.tokenVersion)
          )
        )
        .returning();

      if (!updated) {
        // Concurrency collision: another job incremented tokenVersion in the interim
        console.warn(`[TokenVault OCC Conflict] Connection ${conn.id} version updated concurrently. Abandoning stale write.`);
        return {
          connectionId: conn.id,
          workspaceId: conn.workspaceId,
          platform,
          success: false,
          status: 'SKIPPED',
          message: 'Optimistic concurrency check failed: token was already updated by another concurrent process.',
          latencyMs: Date.now() - startTime,
        };
      }
    }

    return {
      connectionId: conn.id,
      workspaceId: conn.workspaceId,
      platform,
      success: true,
      status: 'CONNECTED',
      message: `Successfully refreshed OAuth tokens for ${platform}. New expiry: ${newExpiresAt.toISOString()}`,
      newExpiresAt: newExpiresAt.toISOString(),
      latencyMs: Date.now() - startTime,
    };
  } catch (err: any) {
    console.error(`[Token Refresh Error] Failed to refresh token for connection ${conn.id} (${platform}):`, err.message);
    await releaseRefreshLock(conn.id);

    if (db) {
      try {
        await db
          .update(socialConnections)
          .set({
            status: 'EXPIRED',
            lastError: err.message,
            lockedUntil: null,
          })
          .where(eq(socialConnections.id, conn.id));
      } catch {}
    }

    return {
      connectionId: conn.id,
      workspaceId: conn.workspaceId,
      platform,
      success: false,
      status: 'EXPIRED',
      message: err.message || 'Token refresh failed.',
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Scans for tokens approaching expiry and refreshes them automatically.
 * Suitable for running in background cron jobs (e.g. daily calendar sweep).
 */
export async function refreshExpiringTokens(
  options: RefreshOptions = {}
): Promise<{
  scanned: number;
  refreshed: number;
  failed: number;
  skipped: number;
  results: RefreshResult[];
}> {
  if (!db) {
    return { scanned: 0, refreshed: 0, failed: 0, skipped: 0, results: [] };
  }

  const thresholdDays = options.thresholdDays ?? 7;
  const thresholdDate = new Date(Date.now() + thresholdDays * 24 * 3600 * 1000);

  // Find connections that are not REVOKED and expire before thresholdDate
  const conditions = [
    sql`${socialConnections.status} != 'REVOKED'`,
    options.force
      ? sql`1=1`
      : or(
          isNull(socialConnections.tokenExpiresAt),
          lte(socialConnections.tokenExpiresAt, thresholdDate)
        ),
  ];

  if (options.workspaceId) {
    conditions.push(eq(socialConnections.workspaceId, options.workspaceId));
  }

  const candidates = await db
    .select()
    .from(socialConnections)
    .where(and(...conditions));

  const results: RefreshResult[] = [];
  let refreshed = 0;
  let failed = 0;
  let skipped = 0;

  for (const conn of candidates) {
    const res = await refreshConnectionToken(conn);
    results.push(res);
    if (res.success) {
      refreshed++;
    } else if (res.status === 'SKIPPED') {
      skipped++;
    } else {
      failed++;
    }
  }

  return {
    scanned: candidates.length,
    refreshed,
    failed,
    skipped,
    results,
  };
}
