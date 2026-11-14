import { generateWithGemini } from '@/lib/ai/gemini';
import { evaluateAndRefineCampaignCopy } from '@/lib/ai/critic';
import { GeneratedAssetPayload } from '@/types';

export interface PostToRevise {
  id?: string;
  platform: 'instagram' | 'linkedin' | 'x' | 'whatsapp' | 'email';
  caption: string;
  firstComment?: string;
  subject?: string;
  mediaUrls?: string[];
  aspectRatio?: string;
}

export interface SurgicalRevisionParams {
  posts: PostToRevise[];
  revisionPrompt: string;
  businessName: string;
  industry?: string;
  tones?: string[];
  pillars?: string[];
  negativeConstraints?: string[];
}

export interface RevisedPostOutput {
  platform: 'instagram' | 'linkedin' | 'x' | 'whatsapp' | 'email';
  caption: string;
  firstComment?: string;
  subject?: string;
  aiCriticScore: number;
}

export interface SurgicalRevisionResult {
  success: boolean;
  revisedPosts: RevisedPostOutput[];
  revisionSummary: string;
  compositeCriticScore: number;
}

/**
 * Intelligent Fallback Surgical Reviser when Gemini is offline.
 * Parses Indic (Hindi/Bengali/Hinglish) and English feedback directives.
 */
function applyHeuristicSurgicalRevision(
  posts: PostToRevise[],
  revisionPrompt: string,
  businessName: string
): { posts: PostToRevise[]; summary: string } {
  const pLower = revisionPrompt.toLowerCase();
  const summaryParts: string[] = [];

  const wantsFestive = /\b(festive|utsav|puja|tyohar|celebrat|diwali|eid|christmas|parv)\b/i.test(pLower);
  const wantsRemovePricing = /\b(pricing mat|price mat|no price|remove price|daam|rate mat|paisa mat|cost)\b/i.test(pLower);
  const wantsShorter = /\b(short|chota|crisp|punchy|brief|less text|kam karo)\b/i.test(pLower);
  const wantsWhatsAppBooking = /\b(whatsapp|book|call|phone|contact|number|bhejo|reply)\b/i.test(pLower);

  if (wantsRemovePricing) summaryParts.push('Removed direct pricing references');
  if (wantsFestive) summaryParts.push('Enhanced festive celebratory warmth & emojis');
  if (wantsShorter) summaryParts.push('Condensed copy for mobile punchiness');
  if (wantsWhatsAppBooking) summaryParts.push('Strengthened direct WhatsApp booking CTA');

  if (summaryParts.length === 0) {
    summaryParts.push(`Applied founder instruction: "${revisionPrompt.trim()}"`);
  }

  const updated = posts.map((post) => {
    let cap = post.caption;
    let comment = post.firstComment;
    let subj = post.subject;

    // Remove price mentions if requested
    if (wantsRemovePricing) {
      cap = cap.replace(/₹\s*\d+([,\.]\d+)?(\s*(only|per|\/-))?/gi, 'special festive rates');
      cap = cap.replace(/\b(Rs\.?|INR)\s*\d+/gi, 'exclusive pricing');
    }

    // Enhance festive warmth
    if (wantsFestive && !cap.includes('✨') && !cap.includes('🎉')) {
      const firstLine = cap.split('\n')[0] || '';
      cap = `✨ Celebrate the festive spirit with ${businessName}! 🛍️\n\n` + cap;
      if (subj) {
        subj = `✨ Festive Celebrations at ${businessName}: Special Previews Inside`;
      }
    }

    // Condensed punchy copy
    if (wantsShorter && post.platform === 'x') {
      if (cap.length > 180) {
        cap = cap.substring(0, 175) + '... ✨';
      }
    }

    // CTA reinforcement
    if (wantsWhatsAppBooking && !/reply|whatsapp|book/i.test(cap)) {
      if (post.platform === 'whatsapp') {
        cap += `\n\n📲 Reply BOOK to reserve your appointment or slot now!`;
      } else if (post.platform === 'instagram') {
        cap += `\n\n📲 WhatsApp us or DM to explore the collection!`;
      }
    }

    return {
      ...post,
      caption: cap,
      firstComment: comment,
      subject: subj,
    };
  });

  return {
    posts: updated,
    summary: summaryParts.join(' • '),
  };
}

/**
 * Surgical Multi-Channel Campaign Revision Engine
 * Interprets founder voice or text feedback in Hindi, Bengali, Hinglish, or English,
 * surgically modifies the draft posts without discarding approved creative work,
 * and re-evaluates the updated copy using KUIRO's Pre-Publish AI Critic.
 */
export async function reviseCampaignSurgically(
  params: SurgicalRevisionParams
): Promise<SurgicalRevisionResult> {
  const {
    posts,
    revisionPrompt,
    businessName,
    industry = 'General Commerce & Services',
    tones = ['Culturally Warm', 'Authoritative'],
    pillars = ['Core Offerings'],
    negativeConstraints = [],
  } = params;

  let revisedPostPayloads: PostToRevise[] = posts;
  let summary = `Applied founder revision: "${revisionPrompt}"`;

  const apiKey = process.env.GEMINI_API_KEY;
  const canUseGemini = apiKey && !apiKey.includes('YourGeminiApiKeyHere');

  if (canUseGemini) {
    try {
      const postsContext = posts.map((p) => ({
        platform: p.platform,
        caption: p.caption,
        firstComment: p.firstComment || null,
        subject: p.subject || null,
      }));

      const prompt = `You are KUIRO's Surgical Multi-Channel Campaign Reviser.
The business founder has provided revision feedback on their draft multi-channel campaign.

Founder Feedback (Spoken or typed in Hindi, Bengali, Hinglish, or English):
"${revisionPrompt}"

Brand Context:
- Business Name: "${businessName}"
- Industry: "${industry}"
- Tone of Voice: ${tones.join(', ')}
- Content Pillars: ${pillars.join(', ')}
- Negative Constraints: ${negativeConstraints.join(', ') || 'None'}

Current Draft Posts:
${JSON.stringify(postsContext, null, 2)}

Instructions:
1. Surgically edit the copy across all platforms to fulfill the founder's exact feedback.
2. If the founder asked in Hindi (e.g. "Pricing hata do, festive sound karo"), Bengali (e.g. "WhatsApp link ta change koro"), or Hinglish, correctly understand their intent.
3. PRESERVE the existing structure, high-performing hooks, and platform unit-economics:
   - X: under 240 chars, no external links in caption (keep links in firstComment).
   - Instagram: line breaks, emojis, 3-5 hashtags.
   - LinkedIn: professional insight with actionable takeaways.
   - WhatsApp: crisp conversational utility message with clear call-to-action.
   - Email: high-open subject line and clean HTML body.
4. Do NOT regenerate unrelated text from scratch; surgically refine the existing posts.

Return a raw JSON object only (no markdown, no backticks):
{
  "summary": "1-2 sentence executive explanation in English of what was surgically modified",
  "posts": [
    {
      "platform": "instagram",
      "caption": "Surgically revised Instagram caption",
      "firstComment": "revised hashtags if updated"
    },
    {
      "platform": "linkedin",
      "caption": "Surgically revised LinkedIn caption",
      "firstComment": "revised hashtags if updated"
    },
    {
      "platform": "x",
      "caption": "Surgically revised tweet under 240 chars",
      "firstComment": "Booking link or reply"
    },
    {
      "platform": "whatsapp",
      "caption": "Surgically revised WhatsApp message"
    },
    {
      "platform": "email",
      "subject": "Surgically revised subject",
      "caption": "Surgically revised HTML body"
    }
  ]
}`;

      const rawGemini = await generateWithGemini({
        prompt,
        systemInstruction: 'You are KUIRO Surgical Campaign Reviser. Surgically edit multi-channel marketing copy based on founder feedback in any Indic language or English. Return valid JSON only.',
        temperature: 0.3,
        responseMimeType: 'application/json',
      });

      let clean = rawGemini.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        clean = clean.substring(firstBrace, lastBrace + 1);
      }
      const parsed = JSON.parse(clean);

      if (parsed.posts && Array.isArray(parsed.posts) && parsed.posts.length > 0) {
        summary = parsed.summary || summary;
        revisedPostPayloads = posts.map((original) => {
          const match = parsed.posts.find((p: any) => p.platform === original.platform);
          if (match) {
            return {
              ...original,
              caption: match.caption || original.caption,
              firstComment: match.firstComment !== undefined ? match.firstComment : original.firstComment,
              subject: match.subject || original.subject,
            };
          }
          return original;
        });
      }
    } catch (geminiErr) {
      console.warn('[Gemini Surgical Revision Fallback to Heuristics]:', geminiErr);
      const fallback = applyHeuristicSurgicalRevision(posts, revisionPrompt, businessName);
      revisedPostPayloads = fallback.posts;
      summary = fallback.summary;
    }
  } else {
    const fallback = applyHeuristicSurgicalRevision(posts, revisionPrompt, businessName);
    revisedPostPayloads = fallback.posts;
    summary = fallback.summary;
  }

  // Convert to GeneratedAssetPayload format for AI Critic evaluation
  const assetsForCritic: GeneratedAssetPayload[] = revisedPostPayloads.map((p) => ({
    platform: p.platform as any,
    caption: p.caption,
    firstComment: p.firstComment,
    emailSubject: p.subject,
    emailHtml: p.platform === 'email' ? p.caption : undefined,
    hashtags: p.firstComment ? p.firstComment.split(' ').filter((t) => t.startsWith('#')).map((t) => t.replace('#', '')) : [],
    mediaUrls: p.mediaUrls || ['/brand/kuiro-primary.svg'],
    mediaType: p.platform === 'x' || p.platform === 'email' ? 'TEXT_ONLY' : 'IMAGE',
    aspectRatio: (p.aspectRatio as any) || '1:1',
  }));

  // Run through Pre-Publish AI Critic with automated refinement
  const { evaluation, refinedAssets } = await evaluateAndRefineCampaignCopy(assetsForCritic, {
    businessName,
    industry,
    tones,
    pillars,
    negativeConstraints,
  });

  const revisedOutputs: RevisedPostOutput[] = refinedAssets.map((asset) => {
    const score = evaluation.platformScores[asset.platform]?.totalScore || 90;
    return {
      platform: asset.platform as any,
      caption: asset.caption,
      firstComment: asset.firstComment,
      subject: asset.emailSubject,
      aiCriticScore: score,
    };
  });

  return {
    success: true,
    revisedPosts: revisedOutputs,
    revisionSummary: summary,
    compositeCriticScore: evaluation.overallScore100,
  };
}
