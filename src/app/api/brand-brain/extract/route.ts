import { NextRequest, NextResponse } from 'next/server';
import { extractBrandBrainFromUrl } from '@/lib/brand-brain/extractor';
import { db, workspaces, brandProfiles, users } from '@/db';
import { eq } from 'drizzle-orm';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await getSessionFromRequest(req);
    const body = await req.json();
    const { url, workspaceId } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    const extractionResult = await extractBrandBrainFromUrl(url.trim());
    const benchmarkSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

    // Persist immediately to Neon PostgreSQL so changes are saved in real-time
    if (db) {
      try {
        const targetWorkspaceId = workspaceId || session?.workspace.id;
        let ws;
        if (targetWorkspaceId) {
          [ws] = await db.select().from(workspaces).where(eq(workspaces.id, targetWorkspaceId)).limit(1);
        }
        if (!ws) {
          [ws] = await db.select().from(workspaces).limit(1);
        }
        if (!ws) {
          let [u] = await db.select().from(users).limit(1);
          if (!u) {
            [u] = await db
              .insert(users)
              .values({
                name: 'KUIRO Administrator',
                email: 'admin@kuiro.in',
                emailVerified: true,
              })
              .returning();
          }
          [ws] = await db
            .insert(workspaces)
            .values({
              name: extractionResult.detected.businessName,
              ownerId: u.id,
              subscriptionTier: 'GROWTH',
            })
            .returning();
        } else if (extractionResult.detected.businessName) {
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
