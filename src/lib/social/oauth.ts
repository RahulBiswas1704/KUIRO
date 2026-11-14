import crypto from 'crypto';
import { PlatformKey } from '@/constants/channels';
import { db, socialConnections } from '@/db';
import { and, eq } from 'drizzle-orm';
import { decryptToken } from '@/lib/crypto/vault';

export interface OAuthPlatformConfig {
  name: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
  defaultScopes: string[];
  usePkce?: boolean;
}

export const OAUTH_PLATFORMS: Record<PlatformKey, OAuthPlatformConfig> = {
  instagram: {
    name: 'Meta (Instagram Graph API)',
    authUrl: 'https://www.facebook.com/v21.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v21.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/v21.0/me?fields=id,name',
    scopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'instagram_basic', 'instagram_content_publish', 'business_management'],
    clientIdEnv: 'META_APP_ID',
    clientSecretEnv: 'META_APP_SECRET',
    defaultScopes: ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement', 'pages_manage_posts'],
  },
  linkedin: {
    name: 'LinkedIn Community & Marketing API',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
    scopes: ['openid', 'profile', 'email', 'w_member_social'],
    clientIdEnv: 'LINKEDIN_CLIENT_ID',
    clientSecretEnv: 'LINKEDIN_CLIENT_SECRET',
    defaultScopes: ['openid', 'profile', 'w_member_social'],
  },
  x: {
    name: 'X (Twitter) Developer API v2',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    userInfoUrl: 'https://api.twitter.com/2/users/me',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    clientIdEnv: 'X_CLIENT_ID',
    clientSecretEnv: 'X_CLIENT_SECRET',
    defaultScopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    usePkce: true,
  },
  whatsapp: {
    name: 'Meta WhatsApp Cloud API',
    authUrl: 'https://www.facebook.com/v21.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v21.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/v21.0/me',
    scopes: ['whatsapp_business_messaging', 'whatsapp_business_management'],
    clientIdEnv: 'META_APP_ID',
    clientSecretEnv: 'META_APP_SECRET',
    defaultScopes: ['whatsapp_business_messaging', 'whatsapp_business_management'],
  },
  email: {
    name: 'Branded ESP & Resend DKIM Relay',
    authUrl: 'https://resend.com/api-keys',
    tokenUrl: 'https://api.resend.com/api-keys',
    userInfoUrl: 'https://api.resend.com/api-keys',
    scopes: ['email_send', 'domain_dkim_verified'],
    clientIdEnv: 'RESEND_API_KEY',
    clientSecretEnv: 'RESEND_API_KEY',
    defaultScopes: ['email_send', 'domain_dkim_verified'],
  },
};

const STATE_SECRET =
  process.env.SESSION_SECRET ||
  process.env.AUTH_SECRET ||
  process.env.BETTER_AUTH_SECRET ||
  'kuiro_oauth_state_hmac_secret_2026';

/**
 * Resolves platform Client ID from environment variables
 */
export function getPlatformClientId(platform: PlatformKey): string | undefined {
  const config = OAUTH_PLATFORMS[platform];
  if (!config) return undefined;
  if (platform === 'x') {
    return process.env.X_CLIENT_ID || process.env.X_API_KEY || process.env.TWITTER_CLIENT_ID;
  }
  return process.env[config.clientIdEnv];
}

/**
 * Resolves platform Client Secret from environment variables
 */
export function getPlatformClientSecret(platform: PlatformKey): string | undefined {
  const config = OAUTH_PLATFORMS[platform];
  if (!config) return undefined;
  if (platform === 'x') {
    return process.env.X_CLIENT_SECRET || process.env.X_API_SECRET || process.env.TWITTER_CLIENT_SECRET;
  }
  return process.env[config.clientSecretEnv];
}

/**
 * Generates high-entropy PKCE code_verifier and code_challenge (S256) per RFC 7636.
 */
export function generatePkcePair(): {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
} {
  const codeVerifier = crypto.randomBytes(48).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
  };
}

/**
 * Verifies a PKCE challenge against a verifier using constant-time comparison.
 */
export function verifyPkceChallenge(verifier: string, challenge: string): boolean {
  if (!verifier || !challenge) return false;
  const computed = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
  if (computed.length !== challenge.length) return false;
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(challenge));
}

/**
 * Generates an unpredictable, tamper-proof cryptographic OAuth 2.0 state parameter.
 * Encodes workspaceId, userId, platform, timestamp, nonce, and optional PKCE codeVerifier.
 * Format: base64url(payload.hmacSignature)
 */
export function generateOAuthState(
  workspaceId: string,
  userId: string,
  platform: PlatformKey,
  codeVerifier?: string
): string {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  const verifierPart = codeVerifier || '';
  const payload = `${workspaceId}.${userId}.${platform}.${timestamp}.${nonce}.${verifierPart}`;
  const hmac = crypto
    .createHmac('sha256', STATE_SECRET)
    .update(payload)
    .digest('hex');
  return Buffer.from(`${payload}.${hmac}`).toString('base64url');
}

/**
 * Validates and decodes the OAuth 2.0 state parameter.
 * Rejects tampered states, malformed states, or states older than 15 minutes.
 */
export function verifyOAuthState(stateString: string): {
  workspaceId: string;
  userId: string;
  platform: PlatformKey;
  codeVerifier?: string;
} | null {
  try {
    if (!stateString) return null;
    const decoded = Buffer.from(stateString, 'base64url').toString('utf8');
    const parts = decoded.split('.');
    if (parts.length !== 7) return null;

    const [workspaceId, userId, platform, timestampStr, nonce, codeVerifier, signature] = parts;
    const payload = `${workspaceId}.${userId}.${platform}.${timestampStr}.${nonce}.${codeVerifier}`;

    const expectedHmac = crypto
      .createHmac('sha256', STATE_SECRET)
      .update(payload)
      .digest('hex');

    if (
      signature.length !== expectedHmac.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))
    ) {
      return null;
    }

    const timestamp = parseInt(timestampStr, 10);
    // 15-minute expiration window for OAuth authorization state
    if (Date.now() - timestamp > 15 * 60 * 1000) {
      return null;
    }

    return {
      workspaceId,
      userId,
      platform: platform as PlatformKey,
      codeVerifier: codeVerifier || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Validates that redirect URI points strictly to the approved OAuth callback endpoint
 * and belongs to an authorized app origin. Prevents open redirect attacks.
 */
export function validateRedirectUri(redirectUri: string, allowedOrigin?: string): boolean {
  try {
    const url = new URL(redirectUri);
    // Disallow dangerous or unexpected protocols
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return false;
    }
    // Only allow http: on localhost / 127.0.0.1
    if (url.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(url.hostname)) {
      return false;
    }

    // Path must strictly be the OAuth callback endpoint
    if (!/^\/api\/auth\/oauth\/[a-z0-9_-]+\/callback$/.test(url.pathname)) {
      return false;
    }

    // Whitelist allowed origins
    const allowedHosts = new Set<string>(['localhost:3000', 'localhost', '127.0.0.1:3000', '127.0.0.1']);

    const addOriginHost = (originStr?: string) => {
      if (!originStr) return;
      try {
        const full = originStr.startsWith('http') ? originStr : `https://${originStr}`;
        const u = new URL(full);
        allowedHosts.add(u.host);
        allowedHosts.add(u.hostname);
      } catch {}
    };

    addOriginHost(allowedOrigin);
    addOriginHost(process.env.BETTER_AUTH_URL);
    addOriginHost(process.env.NEXT_PUBLIC_APP_URL);
    addOriginHost(process.env.VERCEL_URL);

    return allowedHosts.has(url.host) || allowedHosts.has(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Constructs the official OAuth 2.0 authorization URL for a social platform.
 * Automatically injects PKCE challenge parameters for X (Twitter) and signed state tokens.
 */
export function buildAuthorizationUrl(
  platform: PlatformKey,
  workspaceId: string,
  userId: string,
  redirectUri: string
): { url: string; state: string; codeVerifier?: string } {
  const config = OAUTH_PLATFORMS[platform];
  if (!config) {
    throw new Error(`Unsupported OAuth platform: ${platform}`);
  }

  const clientId = getPlatformClientId(platform);
  if (!clientId) {
    throw new Error(`OAuth credentials not configured for ${platform} (${config.clientIdEnv} is missing).`);
  }

  let codeVerifier: string | undefined;
  let codeChallenge: string | undefined;

  if (config.usePkce) {
    const pkce = generatePkcePair();
    codeVerifier = pkce.codeVerifier;
    codeChallenge = pkce.codeChallenge;
  }

  const state = generateOAuthState(workspaceId, userId, platform, codeVerifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: config.scopes.join(platform === 'instagram' ? ',' : ' '),
  });

  if (codeChallenge) {
    params.set('code_challenge', codeChallenge);
    params.set('code_challenge_method', 'S256');
  }

  return {
    url: `${config.authUrl}?${params.toString()}`,
    state,
    codeVerifier,
  };
}

/**
 * Meta (Facebook / Instagram) OAuth Adapter
 * 1. Exchanges auth code for short-lived user access token
 * 2. Exchanges short-lived token for 60-day long-lived access token
 * 3. Discovers connected Facebook Pages and linked Instagram Business Accounts
 */
export async function exchangeMetaOAuth(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string
): Promise<{
  accessToken: string;
  expiresIn: number;
  platformAccountId: string;
  handle: string;
  scopes: string[];
}> {
  // 1. Exchange authorization code for short-lived token
  const tokenParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  });

  const tokenRes = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?${tokenParams.toString()}`);
  const tokenJson = await tokenRes.json();

  if (!tokenRes.ok || tokenJson.error) {
    const errDetail = tokenJson.error?.message || 'Failed to exchange Meta authorization code';
    throw new Error(`Meta OAuth Exchange Error: ${errDetail}`);
  }

  const shortLivedToken = tokenJson.access_token;

  // 2. Exchange short-lived token for long-lived user token (~60 days)
  let longLivedToken = shortLivedToken;
  let expiresIn = tokenJson.expires_in || 60 * 24 * 3600;

  try {
    const longLivedParams = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: clientId,
      client_secret: clientSecret,
      fb_exchange_token: shortLivedToken,
    });

    const llRes = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?${longLivedParams.toString()}`);
    const llJson = await llRes.json();
    if (llRes.ok && llJson.access_token) {
      longLivedToken = llJson.access_token;
      expiresIn = llJson.expires_in || 60 * 24 * 3600;
    }
  } catch (llErr) {
    console.warn('[Meta Long-Lived Token Exchange Warning]:', llErr);
  }

  // 3. Account Discovery: Query Facebook Pages and linked Instagram Business Accounts
  let platformAccountId = 'meta_account';
  let handle = '@meta_verified';
  let finalAccessToken = longLivedToken;

  try {
    const accountsRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,category,instagram_business_account{id,username,name}&access_token=${encodeURIComponent(longLivedToken)}`
    );
    const accountsJson = await accountsRes.json();

    if (accountsRes.ok && accountsJson.data && accountsJson.data.length > 0) {
      // Find the first Page with an attached Instagram Business account
      const igPage = accountsJson.data.find((p: any) => p.instagram_business_account?.id);
      if (igPage) {
        platformAccountId = igPage.instagram_business_account.id;
        handle = `@${igPage.instagram_business_account.username || igPage.instagram_business_account.name || 'instagram_business'}`;
        finalAccessToken = igPage.access_token || longLivedToken;
      } else {
        const firstPage = accountsJson.data[0];
        platformAccountId = firstPage.id;
        handle = `@${firstPage.name.replace(/\s+/g, '_').toLowerCase()}`;
        finalAccessToken = firstPage.access_token || longLivedToken;
      }
    } else {
      // Fallback: Query /me user profile
      const meRes = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${encodeURIComponent(longLivedToken)}`);
      const meJson = await meRes.json();
      if (meRes.ok && meJson.id) {
        platformAccountId = meJson.id;
        handle = `@${(meJson.name || 'meta_user').replace(/\s+/g, '_').toLowerCase()}`;
      }
    }
  } catch (discoveryErr) {
    console.warn('[Meta Account Discovery Warning]:', discoveryErr);
  }

  return {
    accessToken: finalAccessToken,
    expiresIn,
    platformAccountId,
    handle,
    scopes: OAUTH_PLATFORMS.instagram.defaultScopes,
  };
}

/**
 * LinkedIn OAuth Adapter
 * 1. Exchanges auth code for OAuth 2.0 access token
 * 2. Retrieves user profile identity via /v2/userinfo
 */
export async function exchangeLinkedInOAuth(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  platformAccountId: string;
  handle: string;
  scopes: string[];
}> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    const errDetail = data.error_description || data.error || 'Failed to exchange LinkedIn authorization code';
    throw new Error(`LinkedIn OAuth Exchange Error: ${errDetail}`);
  }

  const accessToken = data.access_token;
  const refreshToken = data.refresh_token;
  const expiresIn = data.expires_in || 60 * 24 * 3600;

  // Retrieve user profile identity
  let platformAccountId = 'urn:li:person:profile';
  let handle = 'LinkedIn Member';

  try {
    const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (userRes.ok) {
      const userJson = await userRes.json();
      platformAccountId = userJson.sub ? `urn:li:person:${userJson.sub}` : (userJson.id || platformAccountId);
      handle = userJson.name || (userJson.given_name && userJson.family_name ? `${userJson.given_name} ${userJson.family_name}` : handle);
    }
  } catch (userErr) {
    console.warn('[LinkedIn Profile Discovery Warning]:', userErr);
  }

  return {
    accessToken,
    refreshToken,
    expiresIn,
    platformAccountId,
    handle,
    scopes: OAUTH_PLATFORMS.linkedin.defaultScopes,
  };
}

/**
 * X (Twitter) OAuth 2.0 with PKCE Adapter
 * 1. Exchanges auth code + PKCE code_verifier for OAuth 2.0 access token
 * 2. Discovers user ID and Twitter handle via /2/users/me
 */
export async function exchangeXOAuth(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string,
  codeVerifier?: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  platformAccountId: string;
  handle: string;
  scopes: string[];
}> {
  if (!codeVerifier) {
    throw new Error('PKCE code_verifier is strictly required for X (Twitter) OAuth 2.0 authorization code exchange.');
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const res = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body,
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    const errDetail = data.error_description || data.error || 'Failed to exchange X (Twitter) authorization code';
    throw new Error(`X OAuth Exchange Error: ${errDetail}`);
  }

  const accessToken = data.access_token;
  const refreshToken = data.refresh_token;
  const expiresIn = data.expires_in || 7200;

  // Retrieve user identity
  let platformAccountId = 'x_user';
  let handle = '@x_user';

  try {
    const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=username,name,verified', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (userRes.ok) {
      const userJson = await userRes.json();
      if (userJson.data) {
        platformAccountId = userJson.data.id;
        handle = userJson.data.username ? `@${userJson.data.username}` : (userJson.data.name || handle);
      }
    }
  } catch (userErr) {
    console.warn('[X User Discovery Warning]:', userErr);
  }

  return {
    accessToken,
    refreshToken,
    expiresIn,
    platformAccountId,
    handle,
    scopes: OAUTH_PLATFORMS.x.defaultScopes,
  };
}

/**
 * Exchanges authorization code for verified OAuth 2.0 access & refresh tokens.
 * Dispatches to genuine platform-specific OAuth adapters. Zero simulated fallbacks.
 */
export async function exchangeOAuthCode(
  platform: PlatformKey,
  code: string,
  redirectUri: string,
  codeVerifier?: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  platformAccountId: string;
  handle: string;
  scopes: string[];
}> {
  const config = OAUTH_PLATFORMS[platform];
  if (!config) {
    throw new Error(`Unsupported OAuth platform: ${platform}`);
  }

  const clientId = getPlatformClientId(platform);
  const clientSecret = getPlatformClientSecret(platform);

  if (!clientId || !clientSecret) {
    throw new Error(
      `OAuth client credentials for ${platform} are not configured in environment (${config.clientIdEnv} / ${config.clientSecretEnv} missing). Genuine OAuth requires live credentials.`
    );
  }

  if (platform === 'instagram' || platform === 'whatsapp') {
    return exchangeMetaOAuth(code, redirectUri, clientId, clientSecret);
  }

  if (platform === 'linkedin') {
    return exchangeLinkedInOAuth(code, redirectUri, clientId, clientSecret);
  }

  if (platform === 'x') {
    return exchangeXOAuth(code, redirectUri, clientId, clientSecret, codeVerifier);
  }

  throw new Error(`Unsupported OAuth authorization code exchange for platform: ${platform}`);
}

/**
 * Performs a live handshake test with the target social platform API.
 * Uses real HTTP token inspection against provider endpoints.
 * Detects active, revoked, expired, or malformed credentials.
 */
export async function testPlatformConnection(
  platform: PlatformKey,
  accessToken?: string,
  accountId?: string,
  workspaceId?: string
): Promise<{
  success: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED' | 'REVOKED' | 'INVALID' | 'UNREACHABLE';
  latencyMs: number;
  verifiedAccount: string;
  permissions: string[];
  message: string;
  httpStatus?: number;
}> {
  const startTime = Date.now();
  const config = OAUTH_PLATFORMS[platform];
  const permissions = config.defaultScopes;
  const verifiedAccount = accountId || `@${platform}_channel`;

  // 1. Check for missing or blank token
  if (!accessToken || accessToken.trim().length === 0) {
    return {
      success: false,
      status: 'DISCONNECTED',
      latencyMs: 0,
      verifiedAccount,
      permissions: [],
      message: `Authentication token is missing. Please authorize ${config.name} via OAuth.`,
    };
  }

  // 2. Reject simulated fake tokens
  if (accessToken.startsWith('kuiro_oauth2_') || accessToken.startsWith('mock_') || accessToken.startsWith('simulated_')) {
    return {
      success: false,
      status: 'INVALID',
      latencyMs: 0,
      verifiedAccount,
      permissions: [],
      message: `Simulated or mock token rejected. Genuine OAuth provider connection required.`,
    };
  }

  // 3. Probe provider live API endpoint
  try {
    let endpoint = config.userInfoUrl;
    let headers: Record<string, string> = { Authorization: `Bearer ${accessToken}` };

    if (platform === 'instagram' || platform === 'whatsapp') {
      endpoint = `https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${encodeURIComponent(accessToken)}`;
      headers = {};
    } else if (platform === 'email') {
      endpoint = 'https://api.resend.com/api-keys';
      headers = { Authorization: `Bearer ${accessToken}` };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(endpoint, {
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      let account = verifiedAccount;
      if (json.username) {
        account = `@${json.username}`;
      } else if (json.data?.username) {
        account = `@${json.data.username}`;
      } else if (json.name) {
        account = json.name;
      } else if (json.id) {
        account = `@${json.id}`;
      }

      // If workspaceId is provided and connection exists in DB, ensure status is CONNECTED
      if (workspaceId && db) {
        try {
          await db
            .update(socialConnections)
            .set({ status: 'CONNECTED' })
            .where(
              and(
                eq(socialConnections.workspaceId, workspaceId),
                eq(socialConnections.platform, platform)
              )
            );
        } catch {}
      }

      return {
        success: true,
        status: 'CONNECTED',
        latencyMs,
        verifiedAccount: account,
        permissions,
        message: `Live HTTP handshake verified with ${config.name}. Token is active and authorized.`,
        httpStatus: res.status,
      };
    }

    // 401 or 403 indicates revoked, expired, or unauthorized access token
    if (res.status === 401 || res.status === 403) {
      if (workspaceId && db) {
        try {
          await db
            .update(socialConnections)
            .set({ status: 'REVOKED' })
            .where(
              and(
                eq(socialConnections.workspaceId, workspaceId),
                eq(socialConnections.platform, platform)
              )
            );
        } catch (dbErr) {
          console.warn('[testPlatformConnection] Failed to update revoked status in DB:', dbErr);
        }
      }

      return {
        success: false,
        status: 'REVOKED',
        latencyMs,
        verifiedAccount,
        permissions: [],
        message: `Platform API rejected credentials (${res.status} Unauthorized). Access token has been revoked or expired. Please re-authenticate.`,
        httpStatus: res.status,
      };
    }

    // Other non-OK status
    return {
      success: false,
      status: 'INVALID',
      latencyMs,
      verifiedAccount,
      permissions: [],
      message: `Platform API returned ${res.status} ${res.statusText}. Please verify permissions or re-connect.`,
      httpStatus: res.status,
    };
  } catch (netErr: any) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      status: 'UNREACHABLE',
      latencyMs,
      verifiedAccount,
      permissions: [],
      message: `Could not reach ${config.name} endpoint: ${netErr?.message || 'Network timeout'}.`,
    };
  }
}
