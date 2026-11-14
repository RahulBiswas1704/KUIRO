import { NextRequest, NextResponse } from 'next/server';
import { extractBrandBrainFromUrl } from '@/lib/brand-brain/extractor';
import { db, workspaces, brandProfiles, users } from '@/db';
import { eq } from 'drizzle-orm';
import { authorizeWorkspace } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const { url, workspaceId } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    // Authorize workspace access (Strict Multi-Tenant Isolation)
    const auth = await authorizeWorkspace(req, workspaceId);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const extractionResult = await extractBrandBrainFromUrl(url.trim());
    const benchmarkSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

    // Persist immediately to Neon PostgreSQL so changes are saved in real-time
    if (db) {
      try {
        const wsId = auth.workspaceId!;
        const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, wsId)).limit(1);

        if (ws && extractionResult.detected.businessName) {
          await db
            .update(workspaces)
            .set({ name: extractionResult.detected.businessName })
            .where(eq(workspaces.id, ws.id));
        }

        const existing = await db
          .select()
          .from(brandProfiles)
          .where(eq(brandProfiles.workspaceId, ws.id));

        const toneOfVoice = {
          style: 'clinical_empathetic' as const,
          formality: 'semi-formal' as const,
          archetype: 'compassionate_caregiver',
          samplePhrases: extractionResult.detected.tones,
        };

        const visualIdentity = {
          primaryHex: extractionResult.detected.primaryColor,
          secondaryHex: extractionResult.detected.secondaryColor,
          accentHex: '#10B981',
          fontFamily: extractionResult.detected.fontFamily,
          logoUrl: extractionResult.detected.logoUrl,
        };

        const contentPillars = extractionResult.detected.pillars.map((name, i) => ({
          name,
          weight: i === 0 ? 40 : i === 1 ? 30 : 15,
        }));

        if (existing.length > 0) {
          await db
            .update(brandProfiles)
            .set({
              industry: extractionResult.detected.industry,
              websiteUrl: url.trim(),
              toneOfVoice,
              visualIdentity,
              contentPillars,
              negativeConstraints: extractionResult.detected.negativeConstraints,
            })
            .where(eq(brandProfiles.workspaceId, ws.id));
        } else {
          await db.insert(brandProfiles).values({
            workspaceId: ws.id,
            industry: extractionResult.detected.industry,
            websiteUrl: url.trim(),
            toneOfVoice,
            visualIdentity,
            contentPillars,
            negativeConstraints: extractionResult.detected.negativeConstraints,
          });
        }
      } catch (dbErr) {
        console.warn('[Brand Brain Extract DB Sync Warning]:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      benchmarkSeconds,
      data: extractionResult,
      detected: extractionResult.detected,
    });
  } catch (error: any) {
    console.error('Brand Brain extraction error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
