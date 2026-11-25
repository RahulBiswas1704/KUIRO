import crypto from 'crypto';

/**
 * Constant-time equality comparison using equalized UTF-8 buffers to mitigate
 * side-channel timing analysis even across mismatched string lengths.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Extracts the originating client IP address from standard reverse-proxy headers.
 */
export function getClientIp(
  req: { headers: Pick<Headers, 'get'> },
  fallback: string = '127.0.0.1'
): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return fallback;
}
