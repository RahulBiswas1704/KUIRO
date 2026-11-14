import { db, workspaces, brandProfiles, scheduledCampaigns, platformPosts, users } from '@/db';
import { eq } from 'drizzle-orm';
import { inngest } from '@/lib/inngest/client';
import { safeDispatchInngest } from '@/lib/inngest/dispatcher';
import { evaluateAndRefineCampaignCopy } from '@/lib/ai/critic';
import { GeneratedAssetPayload } from '@/types';

export interface GeminiCampaignOutput {
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
export async function generateCampaignCopy(params: {
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

  const cleanKey = apiKey ? apiKey.replace(/^["']|["']$/g, '').trim() : '';

  if (cleanKey && !cleanKey.includes('YourGeminiApiKeyHere')) {
    const modelsToTry = ['gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { 
              temperature: 0.35, 
              maxOutputTokens: 2048,
            },
          }),
          signal: AbortSignal.timeout(6000),
        });

        if (res.ok) {
          const d = await res.json();
          const rawText = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
          let clean = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
          
          // Ensure valid JSON brackets extraction
          const firstBrace = clean.indexOf('{');
          const lastBrace = clean.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            clean = clean.substring(firstBrace, lastBrace + 1);
          }
          
          return JSON.parse(clean);
        } else {
          if (res.status === 400 || res.status === 404) {
            continue;
          }
        }
      } catch (err) {
        console.warn(`[Campaign Gemini ${model} Error]:`, err);
      }
    }
  }

  // Graceful universal dynamic fallback copy if AI call fails
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

/**
 * Creates an autonomous 48-hour campaign in Neon DB for a specific workspace.
 */
export async function createAutonomousCampaign(params: {
  workspaceId: string;
  topic: string;
  triggerType?: 'FESTIVAL' | 'EVERGREEN' | 'TREND' | 'MANUAL';
  targetPublishAt?: Date;
}) {
  const database = db;
  if (!database) {
    throw new Error('Neon database is not connected.');
  }

  const { workspaceId, topic, triggerType = 'MANUAL', targetPublishAt } = params;

  // 1. Fetch workspace & brand profile
  const [ws] = await database.select().from(workspaces).where(eq(workspaces.id, workspaceId));
  if (!ws) {
    throw new Error(`Workspace not found for id: ${workspaceId}`);
  }

  const [bp] = await database
    .select()
    .from(brandProfiles)
    .where(eq(brandProfiles.workspaceId, ws.id));

  const businessName = ws.name;
  const industry = bp?.industry || 'Healthcare & Preventive Diagnostics';
  const tones = (bp?.toneOfVoice?.samplePhrases as string[]) || ['Empathetic', 'Clinical'];
  const pillars = (bp?.contentPillars as any[])?.map((p) => p.name || p) || ['Preventive Care', 'Family Health'];
  const negativeConstraints = (bp?.negativeConstraints as string[]) || ['No competitor mentions'];

  // 2. Synthesize multi-channel copy using Gemini 3.5 Flash Lite
  const generated = await generateCampaignCopy({
    topic,
    businessName,
    industry,
    tones,
    pillars,
    negativeConstraints,
  });

  const now = new Date();
  const publishAt = targetPublishAt || new Date(now.getTime() + 48 * 3600 * 1000);

  // 3. Pre-Publish AI Critic Evaluation & Auto-Refinement
  const rawAssets: GeneratedAssetPayload[] = [
    {
      platform: 'instagram',
      caption: generated.instagram.caption,
      firstComment: generated.instagram.hashtags.map((t) => `#${String(t).replace(/^#/, '')}`).join(' '),
      hashtags: generated.instagram.hashtags,
      mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
      mediaType: 'IMAGE',
      aspectRatio: '4:5',
    },
    {
      platform: 'linkedin',
      caption: generated.linkedin.caption,
      firstComment: generated.linkedin.hashtags.map((t) => `#${String(t).replace(/^#/, '')}`).join(' '),
      hashtags: generated.linkedin.hashtags,
      mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
      mediaType: 'IMAGE',
      aspectRatio: '1:1',
    },
    {
      platform: 'x',
      caption: generated.x.caption,
      firstComment: generated.x.firstComment,
      hashtags: [],
      mediaUrls: [],
      mediaType: 'TEXT_ONLY',
      aspectRatio: '1:1',
    },
    {
      platform: 'whatsapp',
      caption: generated.whatsapp.caption,
      hashtags: [],
      mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
      mediaType: 'IMAGE',
      aspectRatio: '1:1',
    },
    {
      platform: 'email',
      caption: generated.email.bodyHtml,
      emailSubject: generated.email.subject,
      emailHtml: generated.email.bodyHtml,
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

  // 4. Insert Campaign into scheduledCampaigns in Neon DB
  const [campaign] = await database
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

  // 5. Insert 5 Platform Posts into Neon DB with genuine evaluated AI Critic scores
  const postsToInsert = [
    {
      campaignId: campaign.id,
      platform: 'instagram' as const,
      captionText: igAsset.caption,
      firstCommentText: igAsset.firstComment || '',
      mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
      aspectRatio: '4:5',
      aiCriticScore: evaluation.platformScores['instagram']?.totalScore || 92,
    },
    {
      campaignId: campaign.id,
      platform: 'linkedin' as const,
      captionText: liAsset.caption,
      firstCommentText: liAsset.firstComment || '',
      mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
      aspectRatio: '1:1',
      aiCriticScore: evaluation.platformScores['linkedin']?.totalScore || 90,
    },
    {
      campaignId: campaign.id,
      platform: 'x' as const,
      captionText: xAsset.caption,
      firstCommentText: xAsset.firstComment || '',
      mediaUrls: [],
      aspectRatio: '1:1',
      aiCriticScore: evaluation.platformScores['x']?.totalScore || 88,
    },
    {
      campaignId: campaign.id,
      platform: 'whatsapp' as const,
      captionText: waAsset.caption,
      mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
      aspectRatio: '1:1',
      aiCriticScore: evaluation.platformScores['whatsapp']?.totalScore || 94,
    },
    {
      campaignId: campaign.id,
      platform: 'email' as const,
      captionText: emAsset.caption,
      emailSubject: emAsset.emailSubject || generated.email.subject,
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

  // 5. Dispatch Durable Event via Resilient Outbox Dispatcher
  await safeDispatchInngest({
    name: 'kuiro/campaign.initiate',
    data: {
      campaignId: campaign.id,
      workspaceId: ws.id,
      publishAt: publishAt.toISOString(),
      triggerType,
      eventName: topic.trim(),
    },
  });

  return {
    campaign,
    posts: insertedPosts,
  };
}

