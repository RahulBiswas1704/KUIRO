import { NextRequest, NextResponse } from 'next/server';
import { compositeBrandOverlay, generateContactSheetGrid, containsIndicScript } from '@/lib/media/compositor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      type = 'single', 
      headline, 
      subheadline, 
      brandName = 'Apex Clinic', 
      primaryColor,
      cards,
      phone,
      website 
    } = body;

    if (type === 'contact_sheet' && Array.isArray(cards)) {
      const result = await generateContactSheetGrid(cards, brandName);
      return NextResponse.json({
        success: true,
        type: 'contact_sheet',
        publicUrl: result.publicUrl,
      });
    }

    const hasIndic = containsIndicScript(`${headline || ''} ${subheadline || ''}`);

    const result = await compositeBrandOverlay({
      headline: headline || 'Invest in Your Health Today',
      subheadline: subheadline || 'Routine checkups prevent chronic diseases before they start.',
      brandName,
      primaryColor: primaryColor || '#FF7A00',
      phone,
      website,
    });

    return NextResponse.json({
      success: true,
      type: 'single',
      publicUrl: result.publicUrl,
      hasIndicScript: hasIndic,
      renderEngine: hasIndic ? 'sharp-bundled-indic-noto' : 'sharp-sora-fast',
    });
  } catch (error: any) {
    console.error('Compositor render error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

