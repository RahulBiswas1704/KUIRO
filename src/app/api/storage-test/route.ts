import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, getStorageProvider, getPresignedDownloadUrl, checkStorageHealth } from '@/lib/storage/r2';
import { getSessionFromRequest } from '@/lib/auth';
import { verifyManagementAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const adminAuth = await verifyManagementAuth(req);
  const session = await getSessionFromRequest(req);

  if (!adminAuth.authorized && !session) {
    return NextResponse.json({ error: 'Unauthorized: Clearance or session required.' }, { status: 401 });
  }

  const startTime = Date.now();
  const provider = getStorageProvider();
  const health = await checkStorageHealth();

  try {
    // Generate a lightweight test PNG (1x1 transparent or test SVG converted)
    const testSvg = `<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0B0F14" />
      <text x="50%" y="50%" fill="#FF7A00" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle" dominant-baseline="middle">
        KUIRO Neon Storage Active
      </text>
    </svg>`;
    const testBuffer = Buffer.from(testSvg, 'utf-8');
    const timestamp = Date.now();
    const testKey = `test-verifications/verification-${timestamp}.svg`;

    // 1. Upload to storage
    const publicUrl = await uploadToR2(testBuffer, testKey, 'image/svg+xml');

    // 2. Generate presigned URL
    const presignedUrl = await getPresignedDownloadUrl(testKey, 1800);

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      provider,
      bucket: process.env.NEON_BUCKET_NAME || process.env.R2_BUCKET_NAME || 'kuiro-media',
      testKey,
      publicUrl,
      presignedUrl,
      health,
      durationMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        provider,
        health,
        error: error.message || String(error),
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
