import { NextRequest, NextResponse } from 'next/server';
import { db, workspaces, brandProfiles, users } from '@/db';
import { eq } from 'drizzle-orm';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({
        success: true,
        source: 'mock',
        data: null,
      });
    }

    const session = await getSessionFromRequest(req);
    const workspaceIdParam = req.nextUrl.searchParams.get('workspaceId');
    const targetWorkspaceId = workspaceIdParam || session?.workspace.id;

    // 1. Find or create scoped workspace
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
        [u] = await db.insert(users).values({
          name: 'KUIRO Administrator',
          email: 'admin@kuiro.ai',
          emailVerified: true,
        }).returning();
      }
      [ws] = await db.insert(workspaces).values({
        name: 'Apex Diagnostic & Wellness Clinic',
        ownerId: u.id,
        subscriptionTier: 'GROWTH',
        whatsappAdminPhone: '+919876543210',
      }).returning();
    }

    // 2. Fetch existing brand profile from Neon PostgreSQL
    let [bp] = await db
      .select()
      .from(brandProfiles)
      .where(eq(brandProfiles.workspaceId, ws.id));

    if (!bp) {
      // Seed default profile for Apex Clinic
      [bp] = await db
        .insert(brandProfiles)
        .values({
          workspaceId: ws.id,
          industry: 'Healthcare & Preventive Diagnostics',
          websiteUrl: 'https://drsharmadental.in',
          toneOfVoice: {
            style: 'clinical_empathetic',
            formality: 'semi-formal',
            archetype: 'compassionate_caregiver',
            samplePhrases: [
              'Empathetic & Caring',
              'Clinically Authoritative',
              'Jargon-Free',
              'Culturally Warm (Indian Family Values)',
            ],
          },
          visualIdentity: {
            primaryHex: '#0B3B60',
            secondaryHex: '#FF7A00',
            accentHex: '#10B981',
            fontFamily: 'Sora',
            logoUrl: '/brand/kuiro-primary.svg',
          },
          contentPillars: [
            { name: 'Preventive Care & Diagnostics', weight: 40 },
            { name: 'Treatment Options & Clear Aligners', weight: 30 },
            { name: 'Indian Festival Greetings & Health Tips', weight: 15 },
            { name: 'Patient Case Studies & Myths Busted', weight: 15 },
          ],
          negativeConstraints: [
            'Never mention competitor chains or compare pricing',
            'No clinical guarantees without medical disclaimer',
            'Place links on X in the first reply to avoid API link post fees',
            'Keep graphics clean and avoid cluttered stock photos',
          ],
        })
        .returning();
    }

    const sanitizePillars = (pillars: any): string[] => {
      if (!Array.isArray(pillars)) return [];
      return pillars
        .map((p: any) => (typeof p === 'string' ? p : p?.name || String(p)))
        .filter(Boolean);
    };

    const sanitizeTones = (tones: any): string[] => {
      if (!Array.isArray(tones)) return [];
      return tones
        .map((t: any) => (typeof t === 'string' ? t : t?.phrase || t?.name || String(t)))
        .filter(Boolean);
    };

    const sanitizeRules = (rules: any): string[] => {
      if (!Array.isArray(rules)) return [];
      return rules
        .map((r: any) => (typeof r === 'string' ? r : r?.rule || String(r)))
        .filter(Boolean);
    };

    const rawTones = sanitizeTones(bp.toneOfVoice?.samplePhrases);
    const finalTones = rawTones.length > 0 ? rawTones : [
      'Empathetic & Caring',
      'Clinically Authoritative',
      'Jargon-Free',
      'Culturally Warm',
    ];

    const rawPillars = sanitizePillars(bp.contentPillars);
    const finalPillars = rawPillars.length > 0 ? rawPillars : [
      'Preventive Care & Diagnostics',
      'Treatment Options & Clear Aligners',
      'Indian Festival Greetings & Health Tips',
      'Patient Case Studies & Myths Busted',
    ];

    const finalRules = sanitizeRules(bp.negativeConstraints);

    return NextResponse.json({
      success: true,
      source: 'neon_postgres',
      data: {
        workspaceId: ws.id,
        businessName: ws.name,
        industry: bp.industry || 'Healthcare & Diagnostics',
        websiteUrl: bp.websiteUrl || '',
        tones: finalTones,
        visualIdentity: bp.visualIdentity || {
          primaryHex: '#0B3B60',
          secondaryHex: '#FF7A00',
          accentHex: '#10B981',
          fontFamily: 'Sora',
          logoUrl: '/brand/kuiro-primary.svg',
        },
        pillars: finalPillars,
        negativeConstraints: finalRules,
        updatedAt: bp.createdAt ? bp.createdAt.toISOString() : new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Brand Brain Profile GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch brand profile' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessName,
      industry,
      websiteUrl,
      primaryColor,
      secondaryColor,
      fontFamily,
      logoUrl,
      tones = [],
      pillars = [],
      negativeConstraints = [],
    } = body;

    if (!db) {
      return NextResponse.json({
        success: true,
        source: 'mock',
        message: 'Saved to mock storage',
      });
    }

    // 1. Get or create scoped workspace
    const session = await getSessionFromRequest(req);
    const targetWorkspaceId = body.workspaceId || session?.workspace.id;
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
        [u] = await db.insert(users).values({
          name: 'KUIRO Administrator',
          email: 'admin@kuiro.ai',
          emailVerified: true,
        }).returning();
      }
      [ws] = await db.insert(workspaces).values({
        name: businessName || 'My Business',
        ownerId: u.id,
        subscriptionTier: 'GROWTH',
      }).returning();
    } else if (businessName && businessName !== ws.name) {
      await db.update(workspaces).set({ name: businessName }).where(eq(workspaces.id, ws.id));
    }

    // 2. Format & Sanitize JSON payloads
    const cleanTones = (Array.isArray(tones) ? tones : [])
      .map((t: any) => (typeof t === 'string' ? t.trim() : t?.phrase || t?.name || String(t).trim()))
      .filter(Boolean);

    const cleanPillars = (Array.isArray(pillars) ? pillars : [])
      .map((p: any) => ({
        name: typeof p === 'string' ? p.trim() : p?.name || String(p).trim(),
        weight: typeof p === 'object' && p?.weight ? Number(p.weight) : 25,
      }))
      .filter((p: any) => Boolean(p.name));

    const cleanConstraints = (Array.isArray(negativeConstraints) ? negativeConstraints : [])
      .map((c: any) => (typeof c === 'string' ? c.trim() : c?.rule || String(c).trim()))
      .filter(Boolean);

    const toneOfVoice = {
      style: 'clinical_empathetic' as const,
      formality: 'semi-formal' as const,
      archetype: 'compassionate_caregiver',
      samplePhrases: cleanTones,
    };

    const visualIdentity = {
      primaryHex: primaryColor || '#0B3B60',
      secondaryHex: secondaryColor || '#FF7A00',
      accentHex: '#10B981',
      fontFamily: fontFamily || 'Sora',
      logoUrl: logoUrl || '/brand/kuiro-primary.svg',
    };

    const contentPillars = cleanPillars.length > 0 ? cleanPillars : [
      { name: 'Preventive Care & Diagnostics', weight: 40 },
      { name: 'Treatment Options & Clear Aligners', weight: 30 },
      { name: 'Indian Festival Greetings & Health Tips', weight: 15 },
      { name: 'Patient Case Studies & Myths Busted', weight: 15 },
    ];

    const negativeRules = cleanConstraints.length > 0 ? cleanConstraints : [
      'Never mention competitor chains or compare pricing',
      'No clinical guarantees without medical disclaimer',
      'Place links on X in the first reply to avoid API link post fees',
      'Keep graphics clean and avoid cluttered stock photos',
    ];

    // 3. Upsert brand profile in Neon PostgreSQL
    const existing = await db
      .select()
      .from(brandProfiles)
      .where(eq(brandProfiles.workspaceId, ws.id));

    let savedProfile;
    if (existing.length > 0) {
      const [updated] = await db
        .update(brandProfiles)
        .set({
          industry: industry || 'Healthcare & Dentistry',
          websiteUrl: websiteUrl || '',
          toneOfVoice,
          visualIdentity,
          contentPillars,
          negativeConstraints: negativeRules,
        })
        .where(eq(brandProfiles.workspaceId, ws.id))
        .returning();
      savedProfile = updated;
    } else {
      const [created] = await db
        .insert(brandProfiles)
        .values({
          workspaceId: ws.id,
          industry: industry || 'Healthcare & Dentistry',
          websiteUrl: websiteUrl || '',
          toneOfVoice,
          visualIdentity,
          contentPillars,
          negativeConstraints: negativeRules,
        })
        .returning();
      savedProfile = created;
    }

    return NextResponse.json({
      success: true,
      source: 'neon_postgres',
      message: 'Brand Brain permanently saved to Neon PostgreSQL database!',
      savedProfile,
    });
  } catch (error: any) {
    console.error('[Brand Brain Profile POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save brand profile' },
      { status: 500 }
    );
  }
}

