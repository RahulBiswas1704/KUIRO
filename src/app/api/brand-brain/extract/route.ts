import { NextRequest, NextResponse } from 'next/server';
import { extractBrandBrainFromUrl } from '@/lib/brand-brain/extractor';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    const extractionResult = await extractBrandBrainFromUrl(url.trim());

    return NextResponse.json({
      success: true,
      data: extractionResult,
    });
  } catch (error: any) {
    console.error('Brand Brain extraction error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

