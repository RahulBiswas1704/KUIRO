import { NextRequest, NextResponse } from 'next/server';
import { db, workspaces, brandProfiles, scheduledCampaigns, platformPosts, users } from '@/db';
import { eq, desc, and } from 'drizzle-orm';
import { inngest } from '@/lib/inngest/client';
import { safeDispatchInngest } from '@/lib/inngest/dispatcher';
import { evaluateAndRefineCampaignCopy, evaluateCampaignWithCritic } from '@/lib/ai/critic';
import { reviseCampaignSurgically } from '@/lib/campaigns/reviser';
import { GeneratedAssetPayload } from '@/types';
import { getSessionFromRequest, authorizeWorkspace } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface GeminiCampaignOutput {
  topicSummary: string;
  instagram: {
    hook: string;
    caption: string;
    hashtags: string[];
  };
  linkedin: {
    hook: string;
    caption: string;
    hashtags: string[];
  };
  x: {
    caption: string;
    firstComment: string;
  };
  whatsapp: {
    caption: string;
  };
  email: {
    subject: string;
    bodyHtml: string;
  };
}

/**
 * Generates platform-native copy using Google Gemini 3.5 Flash Lite
 */
async function generateCampaignCopy(params: {
  topic: string;
  businessName: string;
  industry: string;
  tones: string[];
  pillars: string[];
  negativeConstraints: string[];
}): Promise<GeminiCampaignOutput> {
  const { topic, businessName, industry, tones, pillars, negativeConstraints } = params;
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `You are an elite multi-channel Copywriting Director for KUIRO (autonomous marketing AI).
Brand Profile:
- Business Name: "${businessName}"
- Industry / Niche: "${industry}"
- Tone of Voice: ${tones.join(', ') || 'Empathetic, Authoritative, Culturally Warm'}
- Content Pillars: ${pillars.join(', ') || 'Preventive Health, Patient Stories, Festival Tips'}
- Strict Guardrails: ${negativeConstraints.join(', ') || 'No competitor mentions, medical disclaimer when needed'}

Campaign Topic: "${topic}"

Craft platform-native posts for this exact campaign topic. You MUST follow these unit-economics and platform rules:
1. Instagram: Hook in first line, 2-3 engaging body paragraphs with line breaks, 4 relevant hashtags.
2. LinkedIn: Thought leadership style, professional tone, actionable takeaway, 3 hashtags.
3. X (Twitter): Main caption MUST be punchy and under 240 characters with NO links. Put the website or booking link in "firstComment" to avoid X's $0.200 per link-post API surcharge!
4. WhatsApp: Crisp utility message with emojis and a clear call-to-action (e.g. Reply BOOK or call us).
5. Email: High-open subject line + 2-3 paragraph clean HTML body.

You MUST return ONLY a raw valid JSON object (no markdown, no backticks, no markdown codeblocks):
{
  "topicSummary": "${topic}",
  "instagram": {
    "hook": "1-sentence attention hook",
    "caption": "Full Instagram caption with linebreaks and emojis",
    "hashtags": ["tag1", "tag2", "tag3", "tag4"]
  },
  "linkedin": {
    "hook": "Executive insight hook",
    "caption": "Structured professional thought-leadership caption",
    "hashtags": ["tag1", "tag2", "tag3"]
  },
  "x": {
    "caption": "Punchy tweet under 240 chars with zero external links",
    "firstComment": "Booking link or full guide link: https://kuiro.in/book"
  },
  "whatsapp": {
    "caption": "Interactive WhatsApp broadcast message with clear CTA"
  },
  "email": {
    "subject": "Compelling newsletter subject line",
    "bodyHtml": "<p>Engaging email copy...</p><p>Call to action button or link.</p>"
  }
}`;

  if (apiKey && !apiKey.includes('YourGeminiApiKeyHere')) {
    const modelsToTry = ['gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.35, maxOutputTokens: 2048 },
          }),
          signal: AbortSignal.timeout(6000),
        });

        if (res.ok) {
          const d = await res.json();
          const rawText = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const clean = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
          const parsed = JSON.parse(clean);
          return {
            topicSummary: parsed.topicSummary || topic,
            instagram: {
              hook: parsed.instagram?.hook || '',
              caption: parsed.instagram?.caption || '',
              hashtags: Array.isArray(parsed.instagram?.hashtags)
                ? parsed.instagram.hashtags
                : typeof parsed.instagram?.hashtags === 'string'
                  ? parsed.instagram.hashtags.split(/\s+/).filter(Boolean)
                  : ['GrowYourBrand', 'QualityFirst', 'IndiaBusiness', 'CustomerFirst'],
            },
            linkedin: {
              hook: parsed.linkedin?.hook || '',
              caption: parsed.linkedin?.caption || '',
              hashtags: Array.isArray(parsed.linkedin?.hashtags)
                ? parsed.linkedin.hashtags
                : typeof parsed.linkedin?.hashtags === 'string'
                  ? parsed.linkedin.hashtags.split(/\s+/).filter(Boolean)
                  : ['BusinessLeadership', 'Innovation', 'GrowthMindset'],
            },
            x: {
              caption: parsed.x?.caption || '',
              firstComment: parsed.x?.firstComment || '',
            },
            whatsapp: {
              caption: parsed.whatsapp?.caption || '',
            },
            email: {
              subject: parsed.email?.subject || `Update from ${businessName}`,
              bodyHtml: parsed.email?.bodyHtml || `<p>${topic}</p>`,
            },
          };
        }
      } catch (err) {
        console.warn(`[Campaign Gemini ${model} Error]:`, err);
      }
    }
  }

  // Graceful universal dynamic fallback copy if AI call is unavailable
  const indLower = (industry || '').toLowerCase();
  const isRetail = indLower.includes('retail') || indLower.includes('store') || indLower.includes('cloth') || indLower.includes('jewel') || indLower.includes('fashion');
  const isCreatorOrTech = indLower.includes('consult') || indLower.includes('coach') || indLower.includes('founder') || indLower.includes('tech') || indLower.includes('studio') || indLower.includes('saas');
  const isClinic = indLower.includes('clinic') || indLower.includes('dental') || indLower.includes('health') || indLower.includes('doctor');

  if (isRetail) {
    return {
      topicSummary: topic,
      instagram: {
        hook: `Craftsmanship that celebrates your unique style and heritage. ✨🛍️`,
        caption: `Craftsmanship that celebrates your unique style and heritage. ✨🛍️\n\nCelebrate the season with our authentic collections crafted with attention to every single detail. Discover what makes ${businessName} the go-to destination for timeless quality.\n\n📍 Visit our store or WhatsApp us for instant video call assistance and doorstep delivery.`,
        hashtags: ['FestiveCollection', 'HandcraftedLuxury', 'LocalRetailIndia', 'TimelessStyle'],
      },
      linkedin: {
        hook: `Retail leadership is won in the details: authenticity, customer trust, and memorable experiences.`,
        caption: `Retail leadership is won in the details: authenticity, customer trust, and memorable experiences.\n\nAt ${businessName}, we believe every product must carry genuine pride of craftsmanship.\n\nHow is your retail operation innovating customer loyalty this quarter?`,
        hashtags: ['RetailLeadership', 'CustomerExperience', 'CommerceIndia'],
      },
      x: {
        caption: `Fresh seasonal arrivals have landed at ${businessName}. Crafted for authenticity, designed for everyday elegance. ✨🛍️`,
        firstComment: `Explore our latest collection lookbook: https://kuiro.in/catalog`,
      },
      whatsapp: {
        caption: `🌟 *Exclusive Preview from ${businessName}*\n\nCelebrate with our latest arrivals! We have reserved priority customer previews and festive specials this week.\n\nReply *VIEW* to receive the catalog or visit our store.`,
      },
      email: {
        subject: `✨ Exclusive Showcase & Festive Previews from ${businessName}`,
        bodyHtml: `<p>Dear Valued Customer,</p><p>We are delighted to invite you to an exclusive showcase of our newest arrivals at ${businessName}.</p><p>Visit our store or reach out on WhatsApp to experience our curated collection.</p>`,
      },
    };
  }

  if (isCreatorOrTech) {
    return {
      topicSummary: topic,
      instagram: {
        hook: `High velocity is about focused execution, not endless busywork. 🚀📈`,
        caption: `High velocity is about focused execution, not endless busywork. 🚀📈\n\nWhen you strip away unnecessary friction, real business momentum begins. At ${businessName}, we help modern operators build durable growth systems.\n\n📍 Tap the link in bio or WhatsApp us for strategic consultations.`,
        hashtags: ['GrowthStrategy', 'FounderMindset', 'BusinessSystems', 'Leadership'],
      },
      linkedin: {
        hook: `Most growth bottlenecks aren’t marketing problems—they are clarity and distribution problems.`,
        caption: `Most growth bottlenecks aren’t marketing problems—they are clarity and distribution problems.\n\nWhen your value proposition is crystal clear and distribution is autonomous, customer trust compounds exponentially.\n\nAt ${businessName}, our frameworks empower high-performing founders.\n\nWhat is your biggest operational focus this quarter?`,
        hashtags: ['ExecutiveLeadership', 'Strategy', 'ScalableGrowth'],
      },
      x: {
        caption: `Clarity > Complexity. Sustainable growth happens when you eliminate routine friction and double down on core value. 🚀`,
        firstComment: `Read our full strategy breakdown: https://kuiro.in/insights`,
      },
      whatsapp: {
        caption: `🚀 *Strategic Brief from ${businessName}*\n\nWe just published our newest advisory breakdown on building high-leverage growth engines.\n\nReply *ADVISORY* to schedule a consultation with our team.`,
      },
      email: {
        subject: `📈 Executive Brief: High-Leverage Strategic Insights from ${businessName}`,
        bodyHtml: `<p>Dear Colleague,</p><p>We are sharing our latest strategic playbook on scaling operations with speed and precision at ${businessName}.</p><p>Reach out directly to discuss how these frameworks apply to your goals.</p>`,
      },
    };
  }

  if (isClinic) {
    return {
      topicSummary: topic,
      instagram: {
        hook: `Invest in the only home you will ever truly live in—your health and well-being. ✨🩺`,
        caption: `Invest in the only home you will ever truly live in—your health and well-being. ✨🩺\n\nEarly diagnostic detection turns anxieties into peace of mind. Get a comprehensive screening at ${businessName}.\n\n📍 Tap link in bio or WhatsApp us to schedule your appointment.`,
        hashtags: ['PreventiveCare', 'HealthFirst', 'WellnessIndia', 'EarlyDetection'],
      },
      linkedin: {
        hook: `Preventive healthcare isn’t a personal expense; it’s the single highest ROI investment.`,
        caption: `Preventive healthcare isn’t a personal expense; it’s the single highest ROI investment a founder or executive can make.\n\nAt ${businessName}, our clinical workflows deliver reliable precision.\n\nHow does your organization prioritize proactive health resilience?`,
        hashtags: ['CorporateWellness', 'Leadership', 'PreventiveMedicine'],
      },
      x: {
        caption: `A busy schedule is no excuse to ignore your body’s signals. Early detection beats late regrets every single time. 🩺 Morning slots open at ${businessName}.`,
        firstComment: `Book direct consultation: https://kuiro.in/book`,
      },
      whatsapp: {
        caption: `🌟 *Priority Update from ${businessName}*\n\nRoutine prevention is always better than cure. We have reserved priority slots for comprehensive wellness checkups this week.\n\nReply *BOOK* to reserve your slot or tap below to confirm.`,
      },
      email: {
        subject: `🩺 Prioritize Your Health: Exclusive Wellness Insights from ${businessName}`,
        bodyHtml: `<p>Dear Valued Client,</p><p>Routine prevention is always better than cure. We are pleased to announce priority weekend slots at ${businessName}.</p>`,
      },
    };
  }

  // Universal Default for all other SMBs
  return {
    topicSummary: topic,
    instagram: {
      hook: `Excellence is not an accident—it is the result of high intention and sincere effort. ✨`,
      caption: `Excellence is not an accident—it is the result of high intention and sincere effort. ✨\n\nAt ${businessName}, we are dedicated to delivering unmatched value, dependable consistency, and personalized care for every client we serve.\n\n📍 Tap the link in bio or WhatsApp us directly to get started today.`,
      hashtags: ['QualityService', 'CustomerFirst', 'IndiaBusiness', 'Excellence'],
    },
    linkedin: {
      hook: `Building lasting customer trust requires continuous reliability and clear communication.`,
      caption: `Building lasting customer trust requires continuous reliability and clear communication.\n\nAt ${businessName}, our priority is creating enduring value for our partners and clients.\n\nHow is your team elevating customer experience this month?`,
      hashtags: ['BusinessLeadership', 'CustomerTrust', 'OperationalExcellence'],
    },
    x: {
      caption: `Quality, consistency, and customer focus are the foundation of everything we build at ${businessName}. Discover what sets us apart. ✨`,
      firstComment: `Connect with our team directly: https://kuiro.in/connect`,
    },
    whatsapp: {
      caption: `🌟 *Special Announcement from ${businessName}*\n\nWe are excited to share our latest offerings with you! Enjoy priority scheduling and dedicated assistance.\n\nReply *INFO* to speak with our team or schedule a consultation.`,
    },
    email: {
      subject: `✨ News & Exclusive Announcements from ${businessName}`,
      bodyHtml: `<p>Dear Valued Client,</p><p>We are delighted to share our latest updates and priority offerings at ${businessName}.</p><p>Thank you for trusting us as your partner.</p>`,
    },
  };
}

export async function GET(req: NextRequest) {
  try {
    // 1. Authorize workspace access (Strict Multi-Tenant Isolation)
    const workspaceIdParam = req.nextUrl.searchParams.get('workspaceId');
    const auth = await authorizeWorkspace(req, workspaceIdParam);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const database = db;
    if (!database) {
      return NextResponse.json({ success: true, count: 0, campaigns: [] });
    }

    const wsId = auth.workspaceId!;
    const [ws] = await database.select().from(workspaces).where(eq(workspaces.id, wsId)).limit(1);
    if (!ws) {
      return NextResponse.json({ success: false, error: 'Workspace not found' }, { status: 404 });
    }

    // 2. Query campaigns for this workspace
    const rawCampaigns = await database
      .select()
      .from(scheduledCampaigns)
      .where(eq(scheduledCampaigns.workspaceId, ws.id))
      .orderBy(desc(scheduledCampaigns.createdAt));

    // 3. If zero campaigns exist, seed an initial 48-Hour Campaign so the dashboard is live
    if (rawCampaigns.length === 0) {
      const [bp] = await database
        .select()
        .from(brandProfiles)
        .where(eq(brandProfiles.workspaceId, ws.id));

      const businessName = ws.name;
      const industry = bp?.industry || 'Retail, Commerce & Creative Studio';
      const tones = (bp?.toneOfVoice?.samplePhrases as string[]) || ['Culturally Warm', 'Authoritative', 'Modern Indian'];
      const pillars = (bp?.contentPillars as any[])?.map((p) => p.name || p) || ['Artisan Heritage', 'Customer Stories', 'Festive Drops'];
      const negativeConstraints = (bp?.negativeConstraints as string[]) || ['No competitor mentions'];

      const initialTopic = 'Festive Season Kickoff & Exclusive Member Appreciation';
      const generated = await generateCampaignCopy({
        topic: initialTopic,
        businessName,
        industry,
        tones,
        pillars,
        negativeConstraints,
      });

      const now = new Date();
      const publishAt = new Date(now.getTime() + 32 * 3600 * 1000 + 45 * 60 * 1000); // 32h 45m from now

      const [newCamp] = await database
        .insert(scheduledCampaigns)
        .values({
          workspaceId: ws.id,
          triggerType: 'FESTIVAL',
          topicSummary: initialTopic,
          status: 'AUTO_QUEUED',
          revisionCount: 0,
          generateAt: now,
          publishAt: publishAt,
        })
        .returning();

      // Pre-Publish AI Critic Evaluation & Auto-Refinement
      const rawAssets: GeneratedAssetPayload[] = [
        {
          platform: 'instagram',
          caption: generated.instagram?.caption || '',
          firstComment: (generated.instagram?.hashtags || []).map((t) => `#${String(t).replace(/^#/, '')}`).join(' '),
          hashtags: generated.instagram?.hashtags || [],
          mediaUrls: ['/brand/kuiro-primary.svg'],
          mediaType: 'IMAGE',
          aspectRatio: '4:5',
        },
        {
          platform: 'linkedin',
          caption: generated.linkedin?.caption || '',
          firstComment: (generated.linkedin?.hashtags || []).map((t) => `#${String(t).replace(/^#/, '')}`).join(' '),
          hashtags: generated.linkedin?.hashtags || [],
          mediaUrls: ['/brand/kuiro-primary.svg'],
          mediaType: 'IMAGE',
          aspectRatio: '1:1',
        },
        {
          platform: 'x',
          caption: generated.x?.caption || '',
          firstComment: generated.x?.firstComment || '',
          hashtags: [],
          mediaUrls: [],
          mediaType: 'TEXT_ONLY',
          aspectRatio: '1:1',
        },
        {
          platform: 'whatsapp',
          caption: generated.whatsapp?.caption || '',
          hashtags: [],
          mediaUrls: ['/brand/kuiro-primary.svg'],
          mediaType: 'IMAGE',
          aspectRatio: '1:1',
        },
        {
          platform: 'email',
          caption: generated.email?.bodyHtml || '',
          emailSubject: generated.email?.subject || `Festive Updates from ${businessName}`,
          emailHtml: generated.email?.bodyHtml || '',
          hashtags: [],
          mediaUrls: ['/brand/kuiro-primary.svg'],
          mediaType: 'TEXT_ONLY',
          aspectRatio: '1:1',
        },
      ];

      const { evaluation, refinedAssets } = await evaluateAndRefineCampaignCopy(rawAssets, {
        businessName,
        industry,
        tones,
        pillars,
        negativeConstraints,
      });

      const igAsset = refinedAssets.find((a) => a.platform === 'instagram') || rawAssets[0];
      const liAsset = refinedAssets.find((a) => a.platform === 'linkedin') || rawAssets[1];
      const xAsset = refinedAssets.find((a) => a.platform === 'x') || rawAssets[2];
      const waAsset = refinedAssets.find((a) => a.platform === 'whatsapp') || rawAssets[3];
      const emAsset = refinedAssets.find((a) => a.platform === 'email') || rawAssets[4];

      // Insert platform posts with dynamic evaluated AI Critic scores
      const postsToInsert = [
        {
          campaignId: newCamp.id,
          platform: 'instagram' as const,
          captionText: igAsset.caption,
          firstCommentText: igAsset.firstComment || '',
          mediaUrls: ['/brand/kuiro-primary.svg'],
          aspectRatio: '4:5',
          aiCriticScore: evaluation.platformScores['instagram']?.totalScore || 92,
        },
        {
          campaignId: newCamp.id,
          platform: 'linkedin' as const,
          captionText: liAsset.caption,
          firstCommentText: liAsset.firstComment || '',
          mediaUrls: ['/brand/kuiro-primary.svg'],
          aspectRatio: '1:1',
          aiCriticScore: evaluation.platformScores['linkedin']?.totalScore || 90,
        },
        {
          campaignId: newCamp.id,
          platform: 'x' as const,
          captionText: xAsset.caption,
          firstCommentText: xAsset.firstComment || '',
          mediaUrls: [],
          aspectRatio: '1:1',
          aiCriticScore: evaluation.platformScores['x']?.totalScore || 88,
        },
        {
          campaignId: newCamp.id,
          platform: 'whatsapp' as const,
          captionText: waAsset.caption,
          mediaUrls: ['/brand/kuiro-primary.svg'],
          aspectRatio: '1:1',
          aiCriticScore: evaluation.platformScores['whatsapp']?.totalScore || 95,
        },
        {
          campaignId: newCamp.id,
          platform: 'email' as const,
          captionText: emAsset.caption,
          emailSubject: emAsset.emailSubject || generated.email?.subject || `Update from ${businessName}`,
          emailHtml: emAsset.emailHtml || emAsset.caption,
          mediaUrls: ['/brand/kuiro-primary.svg'],
          aspectRatio: '1:1',
          aiCriticScore: evaluation.platformScores['email']?.totalScore || 91,
        },
      ];

      for (const p of postsToInsert) {
        await database.insert(platformPosts).values(p);
      }

      // Re-fetch created campaign with posts
      const seededPosts = await database
        .select()
        .from(platformPosts)
        .where(eq(platformPosts.campaignId, newCamp.id));

      return NextResponse.json({
        success: true,
        source: 'neon_postgres_seeded',
        count: 1,
        campaigns: [
          {
            ...newCamp,
            posts: seededPosts,
          },
        ],
      });
    }

    // 4. Fetch posts for each campaign
    const campaignsWithPosts = await Promise.all(
      rawCampaigns.map(async (camp) => {
        const posts = await database
          .select()
          .from(platformPosts)
          .where(eq(platformPosts.campaignId, camp.id));
        return {
          ...camp,
          posts,
        };
      })
    );

    return NextResponse.json({
      success: true,
      source: 'neon_postgres',
      count: campaignsWithPosts.length,
      campaigns: campaignsWithPosts,
    });
  } catch (error: any) {
    console.error('[Campaigns GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, triggerType = 'MANUAL' } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Topic string is required.' }, { status: 400 });
    }

    // 1. Authorize workspace access (Strict Multi-Tenant Isolation)
    const auth = await authorizeWorkspace(req, body.workspaceId);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const database = db;
    if (!database) {
      return NextResponse.json({ success: false, error: 'Database not connected' }, { status: 500 });
    }

    const wsId = auth.workspaceId!;
    const [ws] = await database.select().from(workspaces).where(eq(workspaces.id, wsId)).limit(1);
    if (!ws) {
      return NextResponse.json({ success: false, error: 'Workspace not found' }, { status: 404 });
    }

    const [bp] = await database
      .select()
      .from(brandProfiles)
      .where(eq(brandProfiles.workspaceId, ws.id));

    const businessName = ws.name;
    const industry = bp?.industry || 'Retail, Commerce & Creative Studio';
    const tones = (bp?.toneOfVoice?.samplePhrases as string[]) || ['Culturally Warm', 'Authoritative', 'Modern Indian'];
    const pillars = (bp?.contentPillars as any[])?.map((p) => p.name || p) || ['Brand Quality', 'Client Stories', 'Exclusive Drops'];
    const negativeConstraints = (bp?.negativeConstraints as string[]) || ['No competitor mentions'];

    // 2. Generate multi-platform copy using Gemini
    const generated = await generateCampaignCopy({
      topic: topic.trim(),
      businessName,
      industry,
      tones,
      pillars,
      negativeConstraints,
    });

    const now = new Date();
    const publishAt = new Date(now.getTime() + 48 * 3600 * 1000); // exactly 48h from now

    // 3. Insert Campaign into scheduledCampaigns
    const [newCamp] = await database
      .insert(scheduledCampaigns)
      .values({
        workspaceId: ws.id,
        triggerType,
        topicSummary: topic.trim(),
        status: 'AUTO_QUEUED',
        revisionCount: 0,
        generateAt: now,
        publishAt: publishAt,
      })
      .returning();

    // 4. Pre-Publish AI Critic Evaluation & Auto-Refinement
    const rawAssets: GeneratedAssetPayload[] = [
      {
        platform: 'instagram',
        caption: generated.instagram?.caption || '',
        firstComment: (generated.instagram?.hashtags || []).map((t) => `#${String(t).replace(/^#/, '')}`).join(' '),
        hashtags: generated.instagram?.hashtags || [],
        mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
        mediaType: 'IMAGE',
        aspectRatio: '4:5',
      },
      {
        platform: 'linkedin',
        caption: generated.linkedin?.caption || '',
        firstComment: (generated.linkedin?.hashtags || []).map((t) => `#${String(t).replace(/^#/, '')}`).join(' '),
        hashtags: generated.linkedin?.hashtags || [],
        mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
        mediaType: 'IMAGE',
        aspectRatio: '1:1',
      },
      {
        platform: 'x',
        caption: generated.x?.caption || '',
        firstComment: generated.x?.firstComment || '',
        hashtags: [],
        mediaUrls: [],
        mediaType: 'TEXT_ONLY',
        aspectRatio: '1:1',
      },
      {
        platform: 'whatsapp',
        caption: generated.whatsapp?.caption || '',
        hashtags: [],
        mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
        mediaType: 'IMAGE',
        aspectRatio: '1:1',
      },
      {
        platform: 'email',
        caption: generated.email?.bodyHtml || '',
        emailSubject: generated.email?.subject || `Update from ${businessName}`,
        emailHtml: generated.email?.bodyHtml || '',
        hashtags: [],
        mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
        mediaType: 'TEXT_ONLY',
        aspectRatio: '1:1',
      },
    ];

    const { evaluation, refinedAssets } = await evaluateAndRefineCampaignCopy(rawAssets, {
      businessName,
      industry,
      tones,
      pillars,
      negativeConstraints,
    });

    const igAsset = refinedAssets.find((a) => a.platform === 'instagram') || rawAssets[0];
    const liAsset = refinedAssets.find((a) => a.platform === 'linkedin') || rawAssets[1];
    const xAsset = refinedAssets.find((a) => a.platform === 'x') || rawAssets[2];
    const waAsset = refinedAssets.find((a) => a.platform === 'whatsapp') || rawAssets[3];
    const emAsset = refinedAssets.find((a) => a.platform === 'email') || rawAssets[4];

    // 5. Insert Posts for all platforms with dynamic evaluated AI Critic scores
    const postsToInsert = [
      {
        campaignId: newCamp.id,
        platform: 'instagram' as const,
        captionText: igAsset.caption,
        firstCommentText: igAsset.firstComment || '',
        mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
        aspectRatio: '4:5',
        aiCriticScore: evaluation.platformScores['instagram']?.totalScore || 92,
      },
      {
        campaignId: newCamp.id,
        platform: 'linkedin' as const,
        captionText: liAsset.caption,
        firstCommentText: liAsset.firstComment || '',
        mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
        aspectRatio: '1:1',
        aiCriticScore: evaluation.platformScores['linkedin']?.totalScore || 90,
      },
      {
        campaignId: newCamp.id,
        platform: 'x' as const,
        captionText: xAsset.caption,
        firstCommentText: xAsset.firstComment || '',
        mediaUrls: [],
        aspectRatio: '1:1',
        aiCriticScore: evaluation.platformScores['x']?.totalScore || 88,
      },
      {
        campaignId: newCamp.id,
        platform: 'whatsapp' as const,
        captionText: waAsset.caption,
        mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
        aspectRatio: '1:1',
        aiCriticScore: evaluation.platformScores['whatsapp']?.totalScore || 95,
      },
      {
        campaignId: newCamp.id,
        platform: 'email' as const,
        captionText: emAsset.caption,
        emailSubject: emAsset.emailSubject || generated.email?.subject || `Update from ${businessName}`,
        emailHtml: emAsset.emailHtml || emAsset.caption,
        mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
        aspectRatio: '1:1',
        aiCriticScore: evaluation.platformScores['email']?.totalScore || 91,
      },
    ];

    const insertedPosts = [];
    for (const p of postsToInsert) {
      const [created] = await database.insert(platformPosts).values(p).returning();
      insertedPosts.push(created);
    }

    // 5. Trigger Inngest Durable Workflow via Resilient Dispatcher
    await safeDispatchInngest({
      name: 'kuiro/campaign.initiate',
      data: {
        campaignId: newCamp.id,
        workspaceId: ws.id,
        publishAt: publishAt.toISOString(),
        triggerType,
        eventName: topic.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      source: 'neon_postgres',
      message: `Autonomous campaign "${topic}" created and entered 48-hour Auto-Commit queue!`,
      campaign: {
        ...newCamp,
        posts: insertedPosts,
      },
    });
  } catch (error: any) {
    console.error('[Campaigns POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required. Active session required.' }, { status: 401 });
    }

    const body = await req.json();
    const { campaignId, status, revisionPrompt } = body;

    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
    }

    const database = db;
    if (!database) {
      return NextResponse.json({ success: false, error: 'Database not connected' }, { status: 500 });
    }

    // POLICY ENFORCEMENT: Email verification required before approving/publishing campaigns
    if (status === 'APPROVED' && !session.user.emailVerified) {
      return NextResponse.json(
        {
          error: 'Email verification required. Please verify your business email before approving and publishing campaigns.',
          code: 'EMAIL_VERIFICATION_REQUIRED',
        },
        { status: 403 }
      );
    }

    const auth = await authorizeWorkspace(req, body.workspaceId);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const wsId = auth.workspaceId!;

    const [campRecord] = await database
      .select()
      .from(scheduledCampaigns)
      .where(and(
        eq(scheduledCampaigns.id, campaignId),
        eq(scheduledCampaigns.workspaceId, wsId)
      ))
      .limit(1);

    if (!campRecord) {
      return NextResponse.json({ error: 'Campaign not found or does not belong to authorized workspace.' }, { status: 404 });
    }

    // 1. Handle Voice / Text Revision Request with Gemini AI
    if (revisionPrompt && typeof revisionPrompt === 'string') {
      const [camp] = await database
        .select()
        .from(scheduledCampaigns)
        .where(and(
          eq(scheduledCampaigns.id, campaignId),
          eq(scheduledCampaigns.workspaceId, wsId)
        ));

      if (!camp) {
        return NextResponse.json({ error: 'Campaign not found or does not belong to authorized workspace.' }, { status: 404 });
      }

      if (camp.revisionCount >= 2) {
        return NextResponse.json(
          { error: 'Maximum 2 free revisions reached for this campaign.' },
          { status: 400 }
        );
      }

      const [bp] = await database
        .select()
        .from(brandProfiles)
        .where(eq(brandProfiles.workspaceId, wsId));

      const [ws] = await database
        .select()
        .from(workspaces)
        .where(and(eq(workspaces.id, wsId), eq(workspaces.ownerId, auth.session!.user.id)));

      const businessName = ws?.name || 'Sharma Heritage Handlooms & Retail';
      const industry = bp?.industry || 'Retail, Commerce & Professional Services';
      const tones = (bp?.toneOfVoice?.samplePhrases as string[]) || ['Culturally Warm', 'Authoritative', 'Modern Indian'];
      const pillars = (bp?.contentPillars as any[])?.map((p) => p.name || p) || ['Artisan Heritage', 'Quality Craftsmanship', 'Festive Offerings'];
      const negativeConstraints = (bp?.negativeConstraints as string[]) || ['No competitor mentions'];

      // Fetch existing posts for surgical revision
      const existingPosts = await database
        .select()
        .from(platformPosts)
        .where(eq(platformPosts.campaignId, campaignId));

      // Surgically revise the existing posts using Gemini and founder feedback (Hindi/Bengali/Hinglish/English)
      const revisionResult = await reviseCampaignSurgically({
        posts: existingPosts.map((p) => ({
          id: p.id,
          platform: p.platform as any,
          caption: p.captionText,
          firstComment: p.firstCommentText || undefined,
          subject: p.emailSubject || undefined,
          mediaUrls: p.mediaUrls,
          aspectRatio: p.aspectRatio,
        })),
        revisionPrompt: revisionPrompt.trim(),
        businessName,
        industry,
        tones,
        pillars,
        negativeConstraints,
      });

      const nextRevisionCount = (camp.revisionCount || 0) + 1;
      const [updatedCamp] = await database
        .update(scheduledCampaigns)
        .set({
          revisionCount: nextRevisionCount,
          status: 'AUTO_QUEUED', // reset to auto-queued with fresh revision
        })
        .where(eq(scheduledCampaigns.id, campaignId))
        .returning();

      // Update platform posts in Neon DB with surgically revised copy & real evaluated AI Critic scores
      for (const rev of revisionResult.revisedPosts) {
        const matchingOriginal = existingPosts.find((p) => p.platform === rev.platform);
        if (matchingOriginal) {
          await database
            .update(platformPosts)
            .set({
              captionText: rev.caption,
              firstCommentText: rev.firstComment !== undefined ? rev.firstComment : matchingOriginal.firstCommentText,
              emailSubject: rev.subject !== undefined ? rev.subject : matchingOriginal.emailSubject,
              emailHtml: rev.platform === 'email' ? rev.caption : matchingOriginal.emailHtml,
              aiCriticScore: rev.aiCriticScore,
            })
            .where(eq(platformPosts.id, matchingOriginal.id));
        }
      }

      // Trigger Inngest event via Resilient Dispatcher
      await safeDispatchInngest({
        name: 'kuiro/campaign.revise',
        data: {
          campaignId,
          instruction: revisionPrompt,
          revisionCount: nextRevisionCount,
        },
      });

      const revisedPosts = await database
        .select()
        .from(platformPosts)
        .where(eq(platformPosts.campaignId, campaignId));

      return NextResponse.json({
        success: true,
        source: 'neon_postgres',
        action: 'revised',
        message: revisionResult.revisionSummary || `Campaign revised successfully based on: "${revisionPrompt}"`,
        revisionSummary: revisionResult.revisionSummary,
        criticScore: revisionResult.compositeCriticScore,
        revisionCount: nextRevisionCount,
        campaign: {
          ...updatedCamp,
          posts: revisedPosts,
        },
      });
    }

    // 2. Handle Status Change (APPROVE, PAUSE, RESUME)
    if (!status) {
      return NextResponse.json({ error: 'status or revisionPrompt is required' }, { status: 400 });
    }

    const [updated] = await database
      .update(scheduledCampaigns)
      .set({ status })
      .where(and(
        eq(scheduledCampaigns.id, campaignId),
        eq(scheduledCampaigns.workspaceId, wsId)
      ))
      .returning();

    // Trigger Inngest event so state machine unblocks via Resilient Dispatcher
    await safeDispatchInngest({
      name: 'whatsapp/admin.action',
      data: {
        campaignId,
        action: status === 'APPROVED' ? 'APPROVE' : status === 'PAUSED' ? 'EMERGENCY_PAUSE' : 'SKIP',
      },
    });

    return NextResponse.json({
      success: true,
      source: 'neon_postgres',
      action: 'status_updated',
      campaign: updated,
    });
  } catch (error: any) {
    console.error('[Campaigns PATCH Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId') || searchParams.get('id');
    const workspaceIdParam = searchParams.get('workspaceId');

    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
    }

    const auth = await authorizeWorkspace(req, workspaceIdParam);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const database = db;
    if (!database) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
    }

    const wsId = auth.workspaceId!;

    // Verify campaign belongs to authorized workspace
    const [camp] = await database
      .select()
      .from(scheduledCampaigns)
      .where(and(
        eq(scheduledCampaigns.id, campaignId),
        eq(scheduledCampaigns.workspaceId, wsId)
      ))
      .limit(1);

    if (!camp) {
      return NextResponse.json({ error: 'Campaign not found or does not belong to authorized workspace.' }, { status: 404 });
    }

    // Cascade delete platform posts and the campaign
    await database.delete(platformPosts).where(eq(platformPosts.campaignId, campaignId));
    await database.delete(scheduledCampaigns).where(and(
      eq(scheduledCampaigns.id, campaignId),
      eq(scheduledCampaigns.workspaceId, wsId)
    ));

    return NextResponse.json({
      success: true,
      message: 'Campaign and associated platform posts permanently deleted.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete campaign' }, { status: 500 });
  }
}
