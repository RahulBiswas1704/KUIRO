import net from 'net';
import dns from 'dns';
import http from 'http';
import https from 'https';
import { URL } from 'url';

export const MAX_RESPONSE_SIZE = 1024 * 1024; // 1 MB
export const MAX_REDIRECTS = 5;
export const REQUEST_TIMEOUT_MS = 5000;
export const ALLOWED_CONTENT_TYPES = ['text/html', 'application/xhtml+xml', 'text/plain'];

/**
 * Converts an IPv4 dotted decimal string to a 32-bit unsigned integer.
 */
function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

/**
 * Checks if a given 32-bit IPv4 integer falls within a CIDR subnet.
 */
function isInSubnet(ipInt: number, subnetInt: number, maskBits: number): boolean {
  if (maskBits === 0) return true;
  const mask = (~0 << (32 - maskBits)) >>> 0;
  return (ipInt & mask) === (subnetInt & mask);
}

/**
 * Evaluates whether an IPv4 address is in a private, loopback, link-local, carrier-grade,
 * or reserved address space (RFC 1918, RFC 1122, RFC 3927, RFC 6598, etc.).
 */
export function isPrivateOrRestrictedIPv4(ip: string): boolean {
  if (!net.isIPv4(ip)) return false;
  const ipInt = ipToInt(ip);

  // 0.0.0.0/8 (Broadcast/Current network)
  if (isInSubnet(ipInt, ipToInt('0.0.0.0'), 8)) return true;
  // 10.0.0.0/8 (Private RFC 1918)
  if (isInSubnet(ipInt, ipToInt('10.0.0.0'), 8)) return true;
  // 100.64.0.0/10 (Carrier-Grade NAT RFC 6598)
  if (isInSubnet(ipInt, ipToInt('100.64.0.0'), 10)) return true;
  // 127.0.0.0/8 (Loopback RFC 1122)
  if (isInSubnet(ipInt, ipToInt('127.0.0.0'), 8)) return true;
  // 169.254.0.0/16 (Link-Local & Cloud Metadata RFC 3927)
  if (isInSubnet(ipInt, ipToInt('169.254.0.0'), 16)) return true;
  // 172.16.0.0/12 (Private RFC 1918: 172.16.0.0 - 172.31.255.255)
  if (isInSubnet(ipInt, ipToInt('172.16.0.0'), 12)) return true;
  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (isInSubnet(ipInt, ipToInt('192.0.0.0'), 24)) return true;
  // 192.0.2.0/24 (TEST-NET-1)
  if (isInSubnet(ipInt, ipToInt('192.0.2.0'), 24)) return true;
  // 192.88.99.0/24 (6to4 Relay)
  if (isInSubnet(ipInt, ipToInt('192.88.99.0'), 24)) return true;
  // 192.168.0.0/16 (Private RFC 1918)
  if (isInSubnet(ipInt, ipToInt('192.168.0.0'), 16)) return true;
  // 198.18.0.0/15 (Benchmarking)
  if (isInSubnet(ipInt, ipToInt('198.18.0.0'), 15)) return true;
  // 198.51.100.0/24 (TEST-NET-2)
  if (isInSubnet(ipInt, ipToInt('198.51.100.0'), 24)) return true;
  // 203.0.113.0/24 (TEST-NET-3)
  if (isInSubnet(ipInt, ipToInt('203.0.113.0'), 24)) return true;
  // 224.0.0.0/4 (Multicast)
  if (isInSubnet(ipInt, ipToInt('224.0.0.0'), 4)) return true;
  // 240.0.0.0/4 (Reserved)
  if (isInSubnet(ipInt, ipToInt('240.0.0.0'), 4)) return true;
  // 255.255.255.255/32 (Broadcast)
  if (ip === '255.255.255.255') return true;

  return false;
}

/**
 * Evaluates whether an IPv6 address is in a loopback, unique local, link-local,
 * multicast, or IPv4-mapped private range.
 */
export function isPrivateOrRestrictedIPv6(ip: string): boolean {
  if (!net.isIPv6(ip)) return false;
  const lower = ip.toLowerCase();

  // IPv4-mapped IPv6 (::ffff:127.0.0.1, 0:0:0:0:0:ffff:192.168.1.1, etc.)
  if (lower.includes(':ffff:')) {
    const v4part = lower.split(':ffff:')[1];
    if (net.isIPv4(v4part)) {
      return isPrivateOrRestrictedIPv4(v4part);
    }
  }

  // Loopback ::1
  if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') return true;
  // Unspecified ::
  if (lower === '::' || lower === '0:0:0:0:0:0:0:0') return true;
  // Unique Local Address (fc00::/7 -> fc.. or fd..)
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
  // Link-Local (fe80::/10 -> fe8, fe9, fea, feb)
  if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true;
  // Multicast (ff00::/8)
  if (lower.startsWith('ff')) return true;
  // Documentation (2001:db8::/32)
  if (lower.startsWith('2001:db8:')) return true;

  return false;
}

/**
 * Validates any IP string against private/reserved ranges.
 */
export function isPrivateOrRestrictedIP(ip: string): boolean {
  return isPrivateOrRestrictedIPv4(ip) || isPrivateOrRestrictedIPv6(ip);
}

/**
 * Prohibits access to internal local domains, service names, and cloud metadata endpoints.
 */
export function isProhibitedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase().trim();
  const cleanHost = lower.startsWith('[') && lower.endsWith(']') ? lower.slice(1, -1) : lower;

  if (net.isIP(cleanHost)) {
    return isPrivateOrRestrictedIP(cleanHost);
  }

  if (
    cleanHost === 'localhost' ||
    cleanHost.endsWith('.localhost') ||
    cleanHost.endsWith('.local') ||
    cleanHost.endsWith('.internal') ||
    cleanHost.endsWith('.lan') ||
    cleanHost.endsWith('.home.arpa') ||
    cleanHost === 'instance-data' ||
    cleanHost === 'metadata.google.internal' ||
    cleanHost === 'metadata.internal' ||
    cleanHost === '169.254.169.254'
  ) {
    return true;
  }

  return false;
}

export interface UrlValidationResult {
  valid: boolean;
  error?: string;
  url?: URL;
}

/**
 * Validates user-supplied URL structure against SSRF attack vectors before any network access.
 * 1. Checks scheme (strictly http: or https:).
 * 2. Rejects embedded credentials (username/password).
 * 3. Prohibits non-standard ports.
 * 4. Checks against prohibited hostnames and IP literals.
 */
export function validateUrlForSSRF(rawUrl: string): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'URL must be a non-empty string.' };
  }

  let normalized = rawUrl.trim();
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(normalized);
  if (!hasScheme) {
    normalized = `https://${normalized}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch (err: any) {
    return { valid: false, error: `Invalid URL format: ${err.message}` };
  }

  // 1. Accept ONLY http: and https:
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      error: `Prohibited URL scheme '${parsed.protocol}'. Only HTTP and HTTPS are permitted.`,
    };
  }

  // 2. Reject URLs containing credentials
  if (parsed.username || parsed.password) {
    return {
      valid: false,
      error: 'URLs containing embedded authentication credentials (username:password) are strictly prohibited.',
    };
  }

  // 3. Reject non-standard ports
  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
    return {
      valid: false,
      error: `Prohibited port '${parsed.port}'. Only standard web ports 80 and 443 are allowed.`,
    };
  }

  // 4. Reject prohibited hostnames and IP literals upfront
  if (isProhibitedHostname(parsed.hostname)) {
    return {
      valid: false,
      error: `SSRF_BLOCKED: Access to localhost, private, or internal cloud metadata addresses ('${parsed.hostname}') is strictly prohibited.`,
    };
  }

  return { valid: true, url: parsed };
}

/**
 * Resolves a hostname via DNS and strictly validates that ALL returned addresses
 * are public and safe. Throws an SSRF_BLOCKED error if any address is private.
 */
export async function resolveAndValidateDNS(hostname: string): Promise<string[]> {
  const cleanHost = hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname;

  if (net.isIP(cleanHost)) {
    if (isPrivateOrRestrictedIP(cleanHost)) {
      throw new Error(`SSRF_BLOCKED: Access to private or restricted IP address '${cleanHost}' is prohibited.`);
    }
    return [cleanHost];
  }

  let addresses: dns.LookupAddress[];
  try {
    addresses = await dns.promises.lookup(cleanHost, { all: true });
  } catch (err: any) {
    throw new Error(`DNS_RESOLUTION_FAILED: Failed to resolve hostname '${cleanHost}': ${err.message}`);
  }

  if (!addresses || addresses.length === 0) {
    throw new Error(`DNS_RESOLUTION_FAILED: No IP address returned for '${cleanHost}'`);
  }

  for (const item of addresses) {
    if (isPrivateOrRestrictedIP(item.address)) {
      throw new Error(
        `SSRF_BLOCKED: Hostname '${cleanHost}' resolved to prohibited private/internal IP address '${item.address}'.`
      );
    }
  }

  return addresses.map((a) => a.address);
}

/**
 * Executes a single HTTP/HTTPS GET request with custom agent lookup and size caps.
 */
function executeSingleSafeRequest(
  url: URL,
  maxBytes: number,
  timeoutMs: number
): Promise<{
  isRedirect: boolean;
  location?: string;
  statusCode: number;
  contentType: string;
  body: string;
}> {
  return new Promise((resolve, reject) => {
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const reqOptions: http.RequestOptions = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      method: 'GET',
      headers: {
        'User-Agent': 'KUIRO-BrandBot/1.0 (+https://kuiro.in)',
        Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      // Rebinding Protection: Enforce IP validation at socket creation time
      lookup: (hostname, opts, cb) => {
        dns.lookup(hostname, opts as any, (err, address, family) => {
          if (err) return (cb as any)(err, address, family);
          if (Array.isArray(address)) {
            for (const item of address) {
              const ipStr = typeof item === 'string' ? item : item.address;
              if (isPrivateOrRestrictedIP(ipStr)) {
                return (cb as any)(new Error(`SSRF_BLOCKED: DNS resolved to prohibited IP '${ipStr}'`));
              }
            }
            return (cb as any)(null, address);
          } else {
            if (isPrivateOrRestrictedIP(address)) {
              return (cb as any)(new Error(`SSRF_BLOCKED: DNS resolved to prohibited IP '${address}'`));
            }
            return (cb as any)(null, address, family);
          }
        });
      },
    };

    const timer: NodeJS.Timeout = setTimeout(() => {
      req.destroy(new Error(`Request timed out after ${timeoutMs}ms.`));
    }, timeoutMs);

    const req = client.request(reqOptions, (res) => {
      const statusCode = res.statusCode || 0;
      const contentType = res.headers['content-type'] || '';
      const contentLengthHeader = res.headers['content-length'];

      // Check Content-Length header upfront
      if (contentLengthHeader) {
        const len = parseInt(contentLengthHeader, 10);
        if (!isNaN(len) && len > maxBytes) {
          clearTimeout(timer);
          req.destroy(
            new Error(`Response size (${len} bytes) exceeds maximum permitted limit of ${maxBytes} bytes.`)
          );
          return;
        }
      }

      // Handle Redirects manually to prevent blind redirect following
      if ([301, 302, 303, 307, 308].includes(statusCode)) {
        clearTimeout(timer);
        res.resume();
        return resolve({
          isRedirect: true,
          location: res.headers.location,
          statusCode,
          contentType,
          body: '',
        });
      }

      // Check Content-Type whitelist
      const isAllowedType = ALLOWED_CONTENT_TYPES.some((type) => contentType.toLowerCase().includes(type));
      if (!isAllowedType && statusCode === 200) {
        clearTimeout(timer);
        req.destroy(
          new Error(`Unsupported content type '${contentType}'. Only HTML and text documents can be ingested.`)
        );
        return;
      }

      let receivedBytes = 0;
      const chunks: Buffer[] = [];

      res.on('data', (chunk: Buffer) => {
        receivedBytes += chunk.length;
        if (receivedBytes > maxBytes) {
          clearTimeout(timer);
          req.destroy(new Error(`Streamed response exceeded maximum size limit of ${maxBytes} bytes.`));
          return;
        }
        chunks.push(chunk);
      });

      res.on('end', () => {
        clearTimeout(timer);
        const fullBuffer = Buffer.concat(chunks);
        resolve({
          isRedirect: false,
          statusCode,
          contentType,
          body: fullBuffer.toString('utf-8'),
        });
      });
    });

    req.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    req.end();
  });
}

export interface SafeFetchOptions {
  maxRedirects?: number;
  maxBytes?: number;
  timeoutMs?: number;
}

export interface SafeFetchResult {
  html: string;
  finalUrl: string;
  statusCode: number;
  contentType: string;
}

/**
 * Dedicated SSRF-Safe Website Fetcher:
 * 1. Validates scheme, credentials, and ports.
 * 2. Resolves DNS and validates all IP targets are non-private.
 * 3. Enforces socket-level DNS rebinding checks.
 * 4. Manually steps through redirects, re-validating each destination.
 * 5. Stream-limits response size to 1 MB.
 * 6. Enforces strict connection and data timeouts.
 */
export async function safeFetchWebsite(
  initialUrl: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResult> {
  const maxRedirects = options.maxRedirects ?? MAX_REDIRECTS;
  const maxBytes = options.maxBytes ?? MAX_RESPONSE_SIZE;
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;

  let currentUrl = initialUrl;
  let redirectsRemaining = maxRedirects;

  while (redirectsRemaining >= 0) {
    // 1. Validate URL upfront
    const validation = validateUrlForSSRF(currentUrl);
    if (!validation.valid || !validation.url) {
      throw new Error(validation.error || 'Invalid or unsafe URL');
    }

    const parsed = validation.url;

    // 2. Validate DNS and all resolved IPs before connecting
    await resolveAndValidateDNS(parsed.hostname);

    // 3. Perform Restricted HTTP GET with strict streaming limits & manual redirects
    const result = await executeSingleSafeRequest(parsed, maxBytes, timeoutMs);

    // 4. Handle Redirects (301, 302, 303, 307, 308)
    if (result.isRedirect) {
      if (!result.location) {
        throw new Error('Redirect response missing Location header.');
      }
      redirectsRemaining--;
      if (redirectsRemaining < 0) {
        throw new Error(`Too many redirects (exceeded limit of ${maxRedirects}).`);
      }

      // Resolve relative redirect location against current URL
      const nextUrl = new URL(result.location, parsed).href;
      currentUrl = nextUrl;
      continue;
    }

    return {
      html: result.body,
      finalUrl: currentUrl,
      statusCode: result.statusCode,
      contentType: result.contentType,
    };
  }

  throw new Error('Too many redirects');
}

/**
 * Sanitizes fetched HTML:
 * Strips scripts, styles, iframes, SVGs, comments, and inline binary base64 blobs.
 * Extracts clean, capped textual context (headings & paragraphs, max 2000 chars) for Gemini AI.
 */
export function sanitizeHtmlContent(html: string): {
  cleanText: string;
  title: string;
  description: string;
  siteName: string;
  ogImage: string | null;
  favicon: string | null;
  themeColor: string | null;
  detectedFont: string | null;
} {
  let title = '';
  let description = '';
  let siteName = '';
  let ogImage: string | null = null;
  let favicon: string | null = null;
  let themeColor: string | null = null;
  let detectedFont: string | null = null;

  // 1. Extract <title>
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) title = titleMatch[1].trim().replace(/\s+/g, ' ');

  // 2. Extract meta descriptions
  const descMatch =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i) ||
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  if (descMatch) description = descMatch[1].trim().replace(/\s+/g, ' ');

  // 3. Extract og:site_name & og:title
  const siteNameMatch = html.match(
    /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i
  );
  if (siteNameMatch) siteName = siteNameMatch[1].trim();

  // 4. Extract og:image
  const ogImgMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  );
  if (ogImgMatch) ogImage = ogImgMatch[1].trim();

  // 5. Extract favicon / apple-touch-icon
  const iconMatch =
    html.match(/<link[^>]+rel=["'](?:apple-touch-icon|shortcut icon|icon)["'][^>]+href=["']([^"']+)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:apple-touch-icon|shortcut icon|icon)["']/i);
  if (iconMatch) favicon = iconMatch[1].trim();

  // 6. Extract theme-color hex
  const themeMatch = html.match(
    /<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i
  );
  if (themeMatch && /^#[0-9A-Fa-f]{6}$/.test(themeMatch[1].trim())) {
    themeColor = themeMatch[1].trim();
  }

  // 7. Detect Google Fonts
  if (html.includes('family=Sora')) detectedFont = 'Sora';
  else if (html.includes('family=Poppins')) detectedFont = 'Poppins';
  else if (html.includes('family=Playfair+Display')) detectedFont = 'Playfair Display';
  else if (html.includes('family=Inter')) detectedFont = 'Inter';

  // 8. Sanitize HTML body: strip scripts, styles, svg, iframes, comments, inline data blobs
  const cleanHtml = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+/gi, ' ');

  const headingsAndParas: string[] = [];
  const matches = cleanHtml.matchAll(/<(?:h1|h2|h3|h4|p|li)[^>]*>([^<]{10,250})<\/(?:h1|h2|h3|h4|p|li)>/gi);
  for (const m of matches) {
    const text = m[1].replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
    if (text.length > 15) headingsAndParas.push(text);
    if (headingsAndParas.length >= 12) break;
  }

  const cleanText = headingsAndParas.join(' | ').slice(0, 2000);

  return {
    cleanText,
    title,
    description,
    siteName,
    ogImage,
    favicon,
    themeColor,
    detectedFont,
  };
}
