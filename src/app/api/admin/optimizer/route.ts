import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-Memory dynamic optimization settings for runtime controls
let currentConfig = {
  aiCritic: {
    minimumPassScore: 85,
    hookWeight: 25,
    brandAlignmentWeight: 35,
    ctaWeight: 20,
    complianceWeight: 20,
    strictNegativeConstraints: true,
  },
  modelRouting: {
    primaryModel: 'gemini-2.5-flash-lite',
    fallbackModel: 'gemini-2.5-pro',
    temperature: 0.7,
    maxOutputTokens: 2048,
    frequencyPenalty: 0.2,
  },
  unitEconomics: {
    enforceXLinkInReply: true, // Saves $0.200 per tweet
    estimatedMonthlySavingsUsd: 1420.0,
    aspectRatioRule: '4:5 on mobile feeds, 1:1 on messaging cards',
  },
  autonomousEngine: {
    autoCommitWindowHours: 48,
    maxFreeRevisions: 2,
    radarSweepFrequencyCron: '0 0 * * *', // Daily 00:00 UTC
    voiceTranscriptionEngine: 'Gemini Whisper Multi-Lingual',
  },
};

export async function GET() {
  return NextResponse.json({
    success: true,
    config: currentConfig,
    environmentKeys: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasInngestKey: !!process.env.INNGEST_EVENT_KEY,
      hasWhatsAppToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
      hasR2Bucket: !!process.env.R2_BUCKET_NAME,
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.aiCritic) {
      currentConfig.aiCritic = { ...currentConfig.aiCritic, ...body.aiCritic };
    }
    if (body.modelRouting) {
      currentConfig.modelRouting = { ...currentConfig.modelRouting, ...body.modelRouting };
    }
    if (body.unitEconomics) {
      currentConfig.unitEconomics = { ...currentConfig.unitEconomics, ...body.unitEconomics };
    }
    if (body.autonomousEngine) {
      currentConfig.autonomousEngine = { ...currentConfig.autonomousEngine, ...body.autonomousEngine };
    }

    return NextResponse.json({
      success: true,
      message: 'System optimization parameters updated successfully.',
      config: currentConfig,
    });
  } catch (error: any) {
    console.error('[API /api/admin/optimizer POST] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update optimizer settings' },
      { status: 500 }
    );
  }
}

