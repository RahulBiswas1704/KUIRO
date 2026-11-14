import { NextRequest, NextResponse } from 'next/server';
import { getCachedFallbackAsset } from '@/lib/storage/r2';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ key: string[] }> }
) {
  const { key } = await context.params;
  const objectKey = (key || []).join('/');

  if (!objectKey) {
    return NextResponse.json({ error: 'Missing object key' }, { status: 400 });
  }

  const asset = getCachedFallbackAsset(objectKey);

  if (asset) {
    return new NextResponse(new Uint8Array(asset.buffer) as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': asset.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-KUIRO-Storage-Source': 'fallback-memory-cache',
      },
    });
  }

  // Fallback 1x1 transparent PNG if requested asset has expired or is missing
  const transparentPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const transparentBuffer = Buffer.from(transparentPngBase64, 'base64');

  return new NextResponse(new Uint8Array(transparentBuffer) as unknown as BodyInit, {
    status: 404,
    headers: {
      'Content-Type': 'image/png',
      'X-KUIRO-Fallback': 'asset-not-found',
    },
  });
}

