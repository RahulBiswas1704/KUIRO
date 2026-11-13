import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// 1. Neon Object Storage Credentials (AWS S3-compatible, branch-scoped)
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsEndpoint = process.env.AWS_ENDPOINT_URL_S3;
const awsRegion = process.env.AWS_REGION || 'us-east-2';
const bucketName = process.env.NEON_BUCKET_NAME || process.env.R2_BUCKET_NAME || 'kuiro-media';

// 2. Cloudflare R2 Credentials (Fallback)
const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const customPublicBaseUrl = process.env.R2_PUBLIC_URL;

let s3Client: S3Client | null = null;
let activeStorageProvider: 'neon' | 'r2' | 'mock' = 'mock';

// Priority 1: Neon Object Storage
if (awsAccessKeyId && awsSecretAccessKey && awsEndpoint) {
  try {
    s3Client = new S3Client({
      region: awsRegion,
      endpoint: awsEndpoint,
      forcePathStyle: true, // Required for Neon Object Storage path-style addressing
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      },
    });
    activeStorageProvider = 'neon';
  } catch (err) {
    console.warn('[Neon Object Storage] Failed to initialize S3Client:', err);
  }
}
// Priority 2: Cloudflare R2
else if (r2AccountId && r2AccessKeyId && r2SecretAccessKey) {
  try {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
    });
    activeStorageProvider = 'r2';
  } catch (err) {
    console.warn('[Cloudflare R2] Failed to initialize S3Client:', err);
  }
}

export function getStorageProvider(): 'neon' | 'r2' | 'mock' {
  return activeStorageProvider;
}

/**
 * Uploads a binary buffer to Cloud Object Storage (Neon Object Storage or Cloudflare R2).
 * Returns the public CDN / direct HTTPS URL required by Meta, LinkedIn, and WhatsApp.
 */
export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string = 'image/png'
): Promise<string> {
  const cleanKey = key.replace(/^\/+/, '');

  if (s3Client) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: cleanKey,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      });

      await s3Client.send(command);

      // Return public read URL
      if (activeStorageProvider === 'neon' && awsEndpoint) {
        // Neon public_read bucket format: ${AWS_ENDPOINT_URL_S3}/<bucket>/<object-key>
        return `${awsEndpoint.replace(/\/$/, '')}/${bucketName}/${cleanKey}`;
      } else if (customPublicBaseUrl) {
        return `${customPublicBaseUrl.replace(/\/$/, '')}/${cleanKey}`;
      }
    } catch (error) {
      console.error(`[${activeStorageProvider.toUpperCase()} Storage Upload Error]:`, error);
    }
  }

  // Graceful Mock fallback for offline local testing
  const base64 = buffer.toString('base64');
  return `data:${contentType};base64,${base64}`;
}

/**
 * Returns a presigned GET URL for sharing private objects securely
 */
export async function getPresignedDownloadUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
  const cleanKey = key.replace(/^\/+/, '');

  if (s3Client) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: cleanKey,
      });
      return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
    } catch (err) {
      console.error('[Storage Presign Error]:', err);
    }
  }

  return getPublicR2Url(cleanKey);
}

/**
 * Returns the public CDN URL for an object key.
 */
export function getPublicR2Url(key: string): string {
  if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('data:')) {
    return key;
  }
  const cleanKey = key.replace(/^\/+/, '');
  if (activeStorageProvider === 'neon' && awsEndpoint) {
    return `${awsEndpoint.replace(/\/$/, '')}/${bucketName}/${cleanKey}`;
  }
  if (customPublicBaseUrl) {
    return `${customPublicBaseUrl.replace(/\/$/, '')}/${cleanKey}`;
  }
  return `/${cleanKey}`;
}
