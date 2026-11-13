import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || 'kuiro-media';
const publicBaseUrl = process.env.R2_PUBLIC_URL || 'https://pub-r2.kuiro.ai';

let s3Client: S3Client | null = null;

if (accountId && accessKeyId && secretAccessKey) {
  try {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  } catch (err) {
    console.warn('[Cloudflare R2] Failed to initialize S3Client, falling back to local storage helper:', err);
  }
}

/**
 * Uploads a binary buffer to Cloudflare R2 bucket.
 * Returns the public CDN HTTPS URL required by Meta (Facebook/Instagram),
 * LinkedIn, and YouTube publishing APIs.
 */
export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string = 'image/png'
): Promise<string> {
  // If Cloudflare R2 is configured, upload directly to S3 endpoint
  if (s3Client) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await s3Client.send(command);
      return `${publicBaseUrl.replace(/\/$/, '')}/${key}`;
    } catch (error) {
      console.error('[Cloudflare R2 Upload Error]:', error);
      // Fallback to local data URL on upload failure
    }
  }

  // Developer / Mock fallback: Return a base64 Data URL or static asset path
  // so the application and 48h simulator function out of the box
  const base64 = buffer.toString('base64');
  return `data:${contentType};base64,${base64}`;
}

/**
 * Returns the public CDN URL for an R2 object key.
 */
export function getPublicR2Url(key: string): string {
  if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('data:')) {
    return key;
  }
  return `${publicBaseUrl.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
}

