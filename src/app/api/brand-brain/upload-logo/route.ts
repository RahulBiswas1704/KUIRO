import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/storage/r2';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'png';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `logos/${Date.now()}-${cleanFileName}`;

    const contentType = file.type || `image/${ext}`;
    const publicUrl = await uploadToR2(buffer, key, contentType);

    return NextResponse.json({
      success: true,
      publicUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error('[Upload Logo Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload logo' },
      { status: 500 }
    );
  }
}

