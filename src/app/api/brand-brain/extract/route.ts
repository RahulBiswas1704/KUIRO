import { NextRequest, NextResponse } from 'next/server';
import { extractBrandBrainFromUrl } from '@/lib/brand-brain/extractor';
import { db, workspaces, brandProfiles, users } from '@/db';
import { eq, and } from 'drizzle-orm';
import { authorizeWorkspace } from '@/lib/auth';
import { validateUrlForSSRF } from '@/lib/security/safeFetch';

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

    // Upfront SSRF & Scheme Validation
    const validation = validateUrlForSSRF(url);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error, code: 'SSRF_BLOCKED' },
        { status: 400 }
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
            .where(and(eq(workspaces.id, ws.id), eq(workspaces.ownerId, auth.session!.user.id)));
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
    const msg = error?.message || 'Brand Brain extraction failed';
    const isSsrfOrClientError =
      msg.includes('SSRF_BLOCKED') ||
      msg.includes('Prohibited') ||
      msg.includes('credentials') ||
      msg.includes('prohibited') ||
      msg.includes('private') ||
      msg.includes('loopback') ||
      msg.includes('exceeds maximum permitted limit') ||
      msg.includes('exceeded maximum size limit') ||
      msg.includes('Unsupported content type') ||
      msg.includes('Too many redirects') ||
      msg.includes('DNS_RESOLUTION_FAILED');

    const status = isSsrfOrClientError ? 400 : 500;
    return NextResponse.json(
      {
        success: false,
        error: msg,
        code: isSsrfOrClientError ? 'SSRF_BLOCKED' : 'EXTRACTION_ERROR',
      },
      { status }
    );
  }
}
