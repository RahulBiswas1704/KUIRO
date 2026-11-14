import { NextRequest } from 'next/server';
import crypto from 'crypto';

export const AUTHORIZED_MANAGEMENT_EMAILS = [
  'rahul.biswas1704@gmail.com',
  'management@kuiro.in',
  'admin@kuiro.in',
  'founder@kuiro.in',
];

export const MANAGEMENT_PASSKEY =
  process.env.KUIRO_MANAGEMENT_PASSKEY ||
  process.env.ADMIN_SECRET_KEY ||
  'KUIRO-MGMT-SECURE-2026';

const SECRET_KEY =
  process.env.BETTER_AUTH_SECRET ||
  process.env.KUIRO_MANAGEMENT_PASSKEY ||
  'kuiro_management_secure_master_secret_2026';

/**
 * Creates a cryptographically signed HMAC token for KUIRO management sessions.
 * Valid for 8 hours.
 */
export function createManagementToken(email: string): string {
  const payload = {
    email: email.toLowerCase().trim(),
    role: 'super_admin',
    issuer: 'kuiro-management-security',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Verifies a management session token.
 */
export function verifyManagementToken(token: string): { valid: boolean; email?: string } {
  try {
    if (!token) return { valid: false };
    const [data, signature] = token.split('.');
    if (!data || !signature) return { valid: false };

    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
    if (signature !== expectedSig) return { valid: false };

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (Date.now() > payload.expiresAt) return { valid: false };

    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}

/**
 * Validates whether an incoming HTTP request holds valid KUIRO Management clearance.
 * Checks HTTP-Only Cookie, Authorization Header, or Master Key Header.
 */
export async function verifyManagementAuth(
  req: NextRequest | Request
): Promise<{ authorized: boolean; email?: string; reason?: string }> {
  // 1. Direct Master Key in Header
  const headerKey = req.headers.get('x-kuiro-management-key');
  if (headerKey && headerKey === MANAGEMENT_PASSKEY) {
    return { authorized: true, email: 'management@kuiro.in' };
  }

  // 2. Cookie Verification (kuiro_mgmt_token)
  let cookieToken: string | undefined;
  if ('cookies' in req && typeof (req as any).cookies?.get === 'function') {
    cookieToken = (req as any).cookies.get('kuiro_mgmt_token')?.value;
  } else {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/kuiro_mgmt_token=([^;]+)/);
    if (match) cookieToken = match[1];
  }

  if (cookieToken) {
    const verified = verifyManagementToken(cookieToken);
    if (verified.valid) {
      return { authorized: true, email: verified.email };
    }
  }

  // 3. Bearer Token in Authorization Header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token === MANAGEMENT_PASSKEY) {
      return { authorized: true, email: 'management@kuiro.in' };
    }
    const verified = verifyManagementToken(token);
    if (verified.valid) {
      return { authorized: true, email: verified.email };
    }
  }

  return { authorized: false, reason: 'No valid KUIRO management token or passkey provided.' };
}
