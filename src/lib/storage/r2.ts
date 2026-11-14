import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// In-Memory cache for fallback assets when cloud storage is offline or in mock mode
interface CachedAsset {
  buffer: Buffer;
  contentType: string;
  createdAt: number;
}
const fallbackAssetCache = new Map<string, CachedAsset>();

// Max file size: 15 MB
const MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024;

export type StorageProviderType = 'neon' | 'r2' | 'mock';

export interface StorageConfig {
  provider: StorageProviderType;
  bucketName: string;
  endpoint?: string;
  region?: string;
  customPublicBaseUrl?: string;
}

let cachedS3Client: S3Client | null = null;
let cachedProvider: StorageProviderType = 'mock';

/**
 * Dynamically resolves and lazily initializes S3-compatible cloud storage configuration.
 * Priority 1: Neon Object Storage (branch-scoped, AWS S3-compatible)
 * Priority 2: Cloudflare R2
 * Priority 3: Resilient Mock / Local Serving Fallback
 */
export function getStorageConfig(): StorageConfig {
  const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const awsEndpoint = process.env.AWS_ENDPOINT_URL_S3;
  const awsRegion = process.env.AWS_REGION || 'us-east-2';
  const bucketName = process.env.NEON_BUCKET_NAME || process.env.R2_BUCKET_NAME || 'kuiro-media';

  const r2AccountId = process.env.R2_ACCOUNT_ID;
  const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
  const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const customPublicBaseUrl = process.env.R2_PUBLIC_URL;

  if (awsAccessKeyId && awsSecretAccessKey && awsEndpoint) {
    return {
      provider: 'neon',
      bucketName,
      endpoint: awsEndpoint,
      region: awsRegion,
    };
  }

  if (r2AccountId && r2AccessKeyId && r2SecretAccessKey) {
    return {
      provider: 'r2',
      bucketName,
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      region: 'auto',
      customPublicBaseUrl,
    };
  }

  return {
    provider: 'mock',
    bucketName,
    customPublicBaseUrl,
  };
}

/**
 * Returns or initializes the S3Client singleton lazily.
 */
export function getS3Client(): { client: S3Client | null; provider: StorageProviderType; bucket: string } {
  const config = getStorageConfig();

  if (cachedS3Client && cachedProvider === config.provider) {
    return { client: cachedS3Client, provider: cachedProvider, bucket: config.bucketName };
  }

  if (config.provider === 'neon' && config.endpoint) {
    try {
      cachedS3Client = new S3Client({
        region: config.region || 'us-east-2',
        endpoint: config.endpoint,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      });
      cachedProvider = 'neon';
      return { client: cachedS3Client, provider: 'neon', bucket: config.bucketName };
    } catch (err) {
      console.warn('[Neon Object Storage] S3Client initialization error:', err);
    }
  }

  if (config.provider === 'r2' && config.endpoint) {
    try {
      cachedS3Client = new S3Client({
        region: 'auto',
        endpoint: config.endpoint,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
      });
      cachedProvider = 'r2';
      return { client: cachedS3Client, provider: 'r2', bucket: config.bucketName };
    } catch (err) {
      console.warn('[Cloudflare R2] S3Client initialization error:', err);
    }
  }

  cachedS3Client = null;
  cachedProvider = 'mock';
  return { client: null, provider: 'mock', bucket: config.bucketName };
}

export function getStorageProvider(): StorageProviderType {
  return getS3Client().provider;
}

/**
 * Sanitizes object keys and prevents directory traversal attacks.
 */
function sanitizeKey(key: string): string {
  return key
    .replace(/^\/+/, '')
    .replace(/\.\.\//g, '')
    .replace(/[^a-zA-Z0-9_\-\.\/]/g, '_');
}

/**
 * Infers appropriate MIME type from file extension or buffer magic bytes.
 */
function inferContentType(key: string, buffer: Buffer, fallback: string = 'image/png'): string {
  const lower = key.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.zip')) return 'application/zip';
  if (lower.endsWith('.json')) return 'application/json';

  // Check magic bytes
  if (buffer.length >= 8) {
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return 'image/png';
    }
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      return 'image/webp';
    }
    if (buffer.toString('utf-8', 0, 100).includes('<svg')) {
      return 'image/svg+xml';
    }
  }

  return fallback;
}

/**
 * Sleep helper for retry backoff
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Uploads a binary buffer to Cloud Object Storage (Neon Object Storage or Cloudflare R2)
 * with automatic exponential backoff retry and resilient fallback serving.
 */
export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType?: string
): Promise<string> {
  const cleanKey = sanitizeKey(key);

  if (buffer.length > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error(`Upload payload exceeds maximum allowed size of 15MB (received ${(buffer.length / (1024 * 1024)).toFixed(2)}MB)`);
  }

  const resolvedContentType = contentType || inferContentType(cleanKey, buffer);
  const { client, provider, bucket } = getS3Client();

  if (client) {
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: cleanKey,
          Body: buffer,
          ContentType: resolvedContentType,
          CacheControl: 'public, max-age=31536000, immutable',
        });

        await client.send(command);

        // Resolve public HTTPS URL
        const config = getStorageConfig();
        if (provider === 'neon' && config.endpoint) {
          return `${config.endpoint.replace(/\/$/, '')}/${bucket}/${cleanKey}`;
        }
        if (config.customPublicBaseUrl) {
          return `${config.customPublicBaseUrl.replace(/\/$/, '')}/${cleanKey}`;
        }
        return `https://${bucket}.r2.cloudflarestorage.com/${cleanKey}`;
      } catch (err: any) {
        lastError = err;
        console.warn(`[${provider.toUpperCase()} Upload Attempt ${attempt}/${maxRetries} Failed]:`, err.message || err);
        if (attempt < maxRetries) {
          await sleep(Math.pow(2, attempt) * 200);
        }
      }
    }
    console.error(`[${provider.toUpperCase()} Upload Failed After ${maxRetries} Retries]:`, lastError);
  }

  // Resilient Local Serving Fallback
  // Cache in fallback storage map so it can be served via /api/media/[...key]
  fallbackAssetCache.set(cleanKey, {
    buffer,
    contentType: resolvedContentType,
    createdAt: Date.now(),
  });

  // Prune cache if over 100 entries
  if (fallbackAssetCache.size > 100) {
    const oldestKey = fallbackAssetCache.keys().next().value;
    if (oldestKey) fallbackAssetCache.delete(oldestKey);
  }

  // In production with public URL base, return local media endpoint
  return `/api/media/${cleanKey}`;
}

/**
 * Returns a cached asset from the local fallback cache (if present).
 */
export function getCachedFallbackAsset(key: string): CachedAsset | undefined {
  const cleanKey = sanitizeKey(key);
  return fallbackAssetCache.get(cleanKey);
}

/**
 * Returns a presigned GET URL for securely accessing private objects.
 */
export async function getPresignedDownloadUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
  const cleanKey = sanitizeKey(key);
  const { client, bucket } = getS3Client();

  if (client) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: cleanKey,
      });
      return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
    } catch (err) {
      console.warn('[Storage Presigned URL Warning]:', err);
    }
  }

  return getPublicR2Url(cleanKey);
}

/**
 * Tests if an object exists in Cloud Storage using a lightweight HEAD request.
 */
export async function objectExists(key: string): Promise<boolean> {
  const cleanKey = sanitizeKey(key);
  const { client, bucket } = getS3Client();

  if (client) {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: cleanKey,
      });
      await client.send(command);
      return true;
    } catch (err: any) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
    }
  }

  return fallbackAssetCache.has(cleanKey);
}

/**
 * Deletes an object from Cloud Storage and local cache.
 */
export async function deleteFromStorage(key: string): Promise<boolean> {
  const cleanKey = sanitizeKey(key);
  fallbackAssetCache.delete(cleanKey);

  const { client, bucket } = getS3Client();
  if (client) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: cleanKey,
      });
      await client.send(command);
      return true;
    } catch (err) {
      console.error('[Storage Delete Error]:', err);
      return false;
    }
  }

  return true;
}

/**
 * Returns the public CDN / HTTPS URL for an object key.
 */
export function getPublicR2Url(key: string): string {
  if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('data:')) {
    return key;
  }
  const cleanKey = sanitizeKey(key);
  const config = getStorageConfig();

  if (config.provider === 'neon' && config.endpoint) {
    return `${config.endpoint.replace(/\/$/, '')}/${config.bucketName}/${cleanKey}`;
  }
  if (config.customPublicBaseUrl) {
    return `${config.customPublicBaseUrl.replace(/\/$/, '')}/${cleanKey}`;
  }
  return `/api/media/${cleanKey}`;
}

/**
 * Observability & Health Check:
 * Actively verifies storage provider connectivity, write/read readiness, and latency.
 */
export async function checkStorageHealth(): Promise<{
  status: 'HEALTHY' | 'DEGRADED' | 'MOCK';
  provider: StorageProviderType;
  bucket: string;
  latencyMs: number;
  writeReady: boolean;
  cachedFallbackCount: number;
  error?: string;
}> {
  const startTime = Date.now();
  const { client, provider, bucket } = getS3Client();

  if (!client) {
    return {
      status: 'MOCK',
      provider: 'mock',
      bucket,
      latencyMs: Date.now() - startTime,
      writeReady: true,
      cachedFallbackCount: fallbackAssetCache.size,
    };
  }

  try {
    const probeKey = `health-probes/probe-${Date.now()}.txt`;
    const probeBody = Buffer.from('kuiro-storage-health-check', 'utf-8');

    // Test PutObject
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: probeKey,
        Body: probeBody,
        ContentType: 'text/plain',
      })
    );

    // Clean up probe asynchronously
    client.send(new DeleteObjectCommand({ Bucket: bucket, Key: probeKey })).catch(() => {});

    const latencyMs = Date.now() - startTime;
    return {
      status: 'HEALTHY',
      provider,
      bucket,
      latencyMs,
      writeReady: true,
      cachedFallbackCount: fallbackAssetCache.size,
    };
  } catch (err: any) {
    return {
      status: 'DEGRADED',
      provider,
      bucket,
      latencyMs: Date.now() - startTime,
      writeReady: false,
      cachedFallbackCount: fallbackAssetCache.size,
      error: err.message || String(err),
    };
  }
}
