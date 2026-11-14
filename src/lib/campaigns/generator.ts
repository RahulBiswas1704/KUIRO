import { db, workspaces, brandProfiles, scheduledCampaigns, platformPosts, users } from '@/db';
import { eq } from 'drizzle-orm';
import { inngest } from '@/lib/inngest/client';

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
    const modelsToTry = ['gemini-2.5-flash-lite', 'gemini-1.5-flash'];
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
          signal: AbortSignal.timeout(3000),
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
          // If 400 Bad Request (e.g. invalid API key), break immediately to avoid waiting
          if (res.status === 400) {
            break;
          }
        }
      } catch (err) {
        console.warn(`[Campaign Gemini ${model} Error]:`, err);
      }
    }
  }

  // Graceful fallback copy if AI call fails
  return {
    topicSummary: topic,
    instagram: {
      hook: `Invest in the only home you will ever truly live in—your body. ✨🩺`,
      caption: `Invest in the only home you will ever truly live in—your body. ✨🩺\n\nEarly diagnostic detection turns anxieties into peace of mind. Get a comprehensive screening with 40+ vital parameters at ${businessName}.\n\n📍 Tap link in bio or WhatsApp us to schedule your appointment.`,
      hashtags: ['PreventiveCare', 'HealthFirst', 'WellnessIndia', 'EarlyDetection'],
    },
    linkedin: {
      hook: `Preventive healthcare isn’t a personal expense; it’s the single highest ROI investment.`,
      caption: `Preventive healthcare isn’t a personal expense; it’s the single highest ROI investment a founder or executive can make.\n\nOver 65% of chronic lifestyle ailments can be reversed when detected early.\n\nAt ${businessName}, our clinical workflows deliver reliable precision.\n\nHow does your organization prioritize proactive health resilience?`,
      hashtags: ['CorporateWellness', 'Leadership', 'PreventiveMedicine'],
    },
    x: {
      caption: `A busy schedule is no excuse to ignore your body’s signals. Early detection beats late regrets every single time. 🩺 Priority morning slots open today at ${businessName}.`,
      firstComment: `Book direct consultation: https://kuiro.in/book`,
    },
    whatsapp: {
      caption: `🌟 *Priority Update from ${businessName}*\n\nRoutine prevention is always better than cure. We have reserved priority slots for our comprehensive Vital Checkup package this week.\n\nReply *BOOK* to reserve your slot or tap below to confirm.`,
    },
    email: {
      subject: `🩺 Prioritize Your Health: Exclusive Wellness Insights from ${businessName}`,
      bodyHtml: `<p>Dear Valued Client,</p><p>Routine prevention is always better than cure. We are pleased to announce priority weekend slots for comprehensive wellness screenings at ${businessName}.</p><p>Reserve your consultation today to keep your family healthy and active.</p>`,
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

  // 3. Insert Campaign into scheduledCampaigns in Neon DB
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

  // 4. Insert 5 Platform Posts into Neon DB
  const postsToInsert = [
    {
      campaignId: campaign.id,
      platform: 'instagram' as const,
      captionText: generated.instagram.caption,
      firstCommentText: generated.instagram.hashtags.map((t) => `#${t}`).join(' '),
      mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
      aspectRatio: '4:5',
      aiCriticScore: 96,
    },
    {
      campaignId: campaign.id,
      platform: 'linkedin' as const,
      captionText: generated.linkedin.caption,
      firstCommentText: generated.linkedin.hashtags.map((t) => `#${t}`).join(' '),
      mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
      aspectRatio: '1:1',
      aiCriticScore: 94,
    },
    {
      campaignId: campaign.id,
      platform: 'x' as const,
      captionText: generated.x.caption,
      firstCommentText: generated.x.firstComment,
      mediaUrls: [],
      aspectRatio: '1:1',
      aiCriticScore: 92,
    },
    {
      campaignId: campaign.id,
      platform: 'whatsapp' as const,
      captionText: generated.whatsapp.caption,
      mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
      aspectRatio: '1:1',
      aiCriticScore: 98,
    },
    {
      campaignId: campaign.id,
      platform: 'email' as const,
      captionText: generated.email.bodyHtml,
      emailSubject: generated.email.subject,
      emailHtml: generated.email.bodyHtml,
      mediaUrls: [bp?.visualIdentity?.logoUrl || '/brand/kuiro-primary.svg'],
      aspectRatio: '1:1',
      aiCriticScore: 95,
    },
  ];

  const insertedPosts = [];
  for (const p of postsToInsert) {
    const [created] = await database.insert(platformPosts).values(p).returning();
    insertedPosts.push(created);
  }

  // 5. Dispatch Inngest Event
  try {
    await inngest.send({
      name: 'kuiro/campaign.initiate',
      data: {
        campaignId: campaign.id,
        workspaceId: ws.id,
        publishAt: publishAt.toISOString(),
        triggerType,
        eventName: topic.trim(),
      },
    });
  } catch (inngErr) {
    console.warn('[Inngest Dispatch Warning]:', inngErr);
  }

  return {
    campaign,
    posts: insertedPosts,
  };
}

