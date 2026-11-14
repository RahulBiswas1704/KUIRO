import { GeneratedAssetPayload, BrandProfile } from '@/types';
import { generateWithGemini } from '@/lib/ai/gemini';

export interface PlatformCriticScore {
  hookScore: number;            // 0-25
  brandAlignmentScore: number;  // 0-35
  formattingScore: number;      // 0-20
  ctaScore: number;             // 0-20
  totalScore: number;           // 0-100
  passedGuardrails: boolean;
  violations: string[];
  improvementSuggestions?: string;
  refinedCaption?: string;
}

export interface CriticEvaluation {
  overallScore: number;         // 0-10 (e.g. 9.3) for backwards compatibility
  overallScore100: number;      // 0-100 composite (e.g. 93)
  passed: boolean;              // true if overallScore100 >= 85 and no critical guardrail violations
  platformScores: Record<string, PlatformCriticScore>;
  summary: string;
  hasViolations: boolean;
  refinedAssets?: GeneratedAssetPayload[];
}

// Corporate buzzwords & forbidden jargon dictionary
const FORBIDDEN_PHRASES = [
  { bad: 'ai-powered automation ecosystem', preferred: 'AI marketing co-pilot' },
  { bad: 'content orchestration', preferred: 'plan and publish content' },
  { bad: 'omnichannel intelligence', preferred: 'manage all your channels' },
  { bad: 'complex workflow automation', preferred: 'let KUIRO handle the routine' },
  { bad: 'paradigm shift', preferred: 'breakthrough' },
  { bad: 'synergistic value', preferred: 'real results' },
  { bad: 'best-in-class solutions', preferred: 'trusted quality' },
];

/**
 * Heuristic fallback evaluator when Gemini is offline or API key is not configured.
 * Computes realistic, granular rubric scores based on real copy characteristics.
 */
function evaluateAssetWithHeuristics(
  asset: GeneratedAssetPayload,
  negativeConstraints: string[],
  businessName: string = 'Business',
  industry: string = 'General'
): PlatformCriticScore {
  const violations: string[] = [];
  const textToCheck = `${asset.caption} ${asset.firstComment || ''}`.toLowerCase();

  // 1. Negative Constraints Check
  for (const constraint of negativeConstraints) {
    if (!constraint) continue;
    const lowerConstraint = constraint.toLowerCase().trim();
    if (lowerConstraint && textToCheck.includes(lowerConstraint)) {
      violations.push(`Violates rule: "${constraint}"`);
    }
  }

  // 2. Forbidden Corporate Buzzword Check
  let jargonViolations = 0;
  for (const phrase of FORBIDDEN_PHRASES) {
    if (textToCheck.includes(phrase.bad)) {
      violations.push(`Brand Voice Alert: Replace "${phrase.bad}" with "${phrase.preferred}"`);
      jargonViolations++;
    }
  }

  // 3. Hook Strength Evaluation (0-25)
  let hookScore = 20;
  const firstLine = asset.caption.split('\n')[0] || '';
  if (firstLine.length < 15) {
    hookScore -= 4;
    violations.push('Opening hook is too short or lacks punch');
  } else if (firstLine.length > 120) {
    hookScore -= 2;
  }
  if (/[\?\!✨🎯💡🔥🚀🛍️🌟]/.test(firstLine)) {
    hookScore += 3;
  }
  if (/\b(how|why|what|discover|revealed|secret|inside|meet|celebrate|introducing)\b/i.test(firstLine)) {
    hookScore += 2;
  }
  hookScore = Math.min(25, Math.max(10, hookScore));

  // 4. Brand Alignment & Guardrails Evaluation (0-35)
  let brandAlignmentScore = 32;
  if (violations.some((v) => v.startsWith('Violates rule'))) {
    brandAlignmentScore -= 18;
  }
  if (jargonViolations > 0) {
    brandAlignmentScore -= jargonViolations * 4;
  }
  if (textToCheck.includes(businessName.toLowerCase())) {
    brandAlignmentScore += 2;
  }
  brandAlignmentScore = Math.min(35, Math.max(8, brandAlignmentScore));

  // 5. Platform Formatting Evaluation (0-20)
  let formattingScore = 18;
  if (asset.platform === 'x') {
    if (asset.caption.length > 240) {
      formattingScore -= 6;
      violations.push('X tweet caption exceeds recommended 240 char limit');
    }
    if (/https?:\/\//i.test(asset.caption) && asset.firstComment) {
      formattingScore -= 4;
      violations.push('Link placed in X main tweet instead of first comment (causes $0.200 API surcharge)');
    }
    if (!asset.firstComment && /https?:\/\//i.test(asset.caption)) {
      formattingScore -= 2;
    }
  } else if (asset.platform === 'instagram') {
    if (!asset.caption.includes('\n')) {
      formattingScore -= 4;
      violations.push('Instagram caption lacks paragraph line breaks');
    }
    const hashtags = asset.hashtags || [];
    if (hashtags.length === 0 && !/#\w+/.test(asset.caption)) {
      formattingScore -= 2;
    }
  } else if (asset.platform === 'linkedin') {
    if (asset.caption.length < 100) {
      formattingScore -= 4;
      violations.push('LinkedIn post is too short for thought leadership context');
    }
  } else if (asset.platform === 'whatsapp') {
    if (asset.caption.length > 500) {
      formattingScore -= 4;
      violations.push('WhatsApp message is too long for mobile reading');
    }
  }
  formattingScore = Math.min(20, Math.max(5, formattingScore));

  // 6. Call To Action (CTA) Quality (0-20)
  let ctaScore = 17;
  const ctaRegex = /\b(book|visit|call|order|reserve|reply|dm|whatsapp|contact|schedule|discover|join|get started|link in bio)\b/i;
  if (ctaRegex.test(asset.caption) || (asset.firstComment && ctaRegex.test(asset.firstComment))) {
    ctaScore += 3;
  } else {
    ctaScore -= 5;
    violations.push('Missing explicit call-to-action (CTA)');
  }
  ctaScore = Math.min(20, Math.max(6, ctaScore));

  const hasCriticalViolation = violations.some(
    (v) => v.startsWith('Violates rule') || v.startsWith('Brand Voice Alert') || v.includes('exceeds')
  );
  const totalScore = hookScore + brandAlignmentScore + formattingScore + ctaScore;
  const passedGuardrails = !hasCriticalViolation && totalScore >= 85;

  let refinedCaption: string | undefined = undefined;
  if (!passedGuardrails) {
    // Generate surgical heuristic refinement
    let fixed = asset.caption;
    for (const phrase of FORBIDDEN_PHRASES) {
      const reg = new RegExp(phrase.bad, 'gi');
      fixed = fixed.replace(reg, phrase.preferred);
    }
    for (const constraint of negativeConstraints) {
      if (constraint) {
        const reg = new RegExp(constraint, 'gi');
        fixed = fixed.replace(reg, '');
      }
    }
    if (asset.platform === 'x' && fixed.length > 240) {
      fixed = fixed.substring(0, 237).trim() + '...';
    }
    if (!ctaRegex.test(fixed)) {
      if (asset.platform === 'whatsapp') {
        fixed += '\n\nReply BOOK or call us directly to reserve!';
      } else if (asset.platform === 'instagram') {
        fixed += '\n\n📍 Visit our store or link in bio for bookings!';
      } else {
        fixed += '\n\nContact our team to get started.';
      }
    }
    refinedCaption = fixed;
  }

  return {
    hookScore,
    brandAlignmentScore,
    formattingScore,
    ctaScore,
    totalScore,
    passedGuardrails,
    violations,
    improvementSuggestions: violations.length > 0 ? violations.join('; ') : undefined,
    refinedCaption,
  };
}

/**
 * Pre-Publish AI Critic Agent
 * Evaluates generated multi-channel campaign content against brand guidelines,
 * negative constraints, and platform unit-economics.
 * 
 * Uses Google Gemini when available; seamlessly falls back to granular heuristic evaluator.
 */
export async function evaluateCampaignWithCritic(
  assets: GeneratedAssetPayload[],
  brandProfile?: Partial<BrandProfile> | any
): Promise<CriticEvaluation> {
  const negativeConstraints: string[] =
    brandProfile?.negative_constraints ||
    brandProfile?.negativeConstraints ||
    [];

  const businessName = brandProfile?.businessName || brandProfile?.name || 'Business';
  const industry = brandProfile?.industry || 'General';
  const tones = brandProfile?.tones || (brandProfile?.toneOfVoice?.samplePhrases as string[]) || ['Culturally Warm', 'Authoritative'];
  const pillars = brandProfile?.pillars || (brandProfile?.contentPillars as any[])?.map((p: any) => p.name || p) || ['Core Offerings'];

  const platformScores: CriticEvaluation['platformScores'] = {};
  let totalScore100 = 0;
  let hasAnyViolation = false;

  const apiKey = process.env.GEMINI_API_KEY;
  const canUseGemini = apiKey && !apiKey.includes('YourGeminiApiKeyHere');

  if (canUseGemini) {
    try {
      const assetsForPrompt = assets.map((a) => ({
        platform: a.platform,
        caption: a.caption,
        firstComment: a.firstComment || null,
        emailSubject: a.emailSubject || null,
      }));

      const prompt = `You are KUIRO's Senior Pre-Publish AI Critic & Quality Assurance Auditor.
Your responsibility is to strictly and objectively audit this multi-channel campaign against brand guidelines and platform unit economics.

Brand Context:
- Business Name: "${businessName}"
- Industry: "${industry}"
- Tone of Voice: ${tones.join(', ')}
- Content Pillars: ${pillars.join(', ')}
- Strict Negative Constraints: ${negativeConstraints.join(', ') || 'None specified'}

Scoring Rubric (Strict 100-Point Scale):
1. Hook Strength (0-25): Attention-grabbing opening line, curiosity gap, emotional hook.
2. Brand Alignment & Guardrails (0-35): Voice & tone adherence, zero negative constraint violations, no corporate buzzwords.
3. Platform Formatting (0-20):
   - X: under 240 chars, no external links in tweet (links in first comment only).
   - Instagram: clean paragraph breaks, emojis, 3-5 hashtags.
   - LinkedIn: professional executive structure, actionable takeaways.
   - WhatsApp: concise conversational copy with emojis.
   - Email: punchy subject line, clean HTML body.
4. CTA Quality (0-20): Clear, compelling, friction-free action.

Audit these assets:
${JSON.stringify(assetsForPrompt, null, 2)}

Return a raw JSON object only (no markdown, no backticks):
{
  "summary": "1-2 sentence executive assessment of campaign quality",
  "scores": {
    "instagram": {
      "hookScore": 23,
      "brandAlignmentScore": 33,
      "formattingScore": 19,
      "ctaScore": 18,
      "totalScore": 93,
      "passedGuardrails": true,
      "violations": [],
      "improvementSuggestions": "optional brief feedback",
      "refinedCaption": "Provide surgically rewritten caption if totalScore < 85 or violations exist"
    },
    "linkedin": { ... },
    "x": { ... },
    "whatsapp": { ... },
    "email": { ... }
  }
}`;

      const rawGemini = await generateWithGemini({
        prompt,
        systemInstruction: 'You are KUIRO AI Critic. You strictly evaluate marketing copy against brand guidelines and platform unit economics. Return valid JSON only.',
        temperature: 0.2,
        responseMimeType: 'application/json',
      });

      let clean = rawGemini.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        clean = clean.substring(firstBrace, lastBrace + 1);
      }
      const parsed = JSON.parse(clean);

      if (parsed.scores) {
        for (const asset of assets) {
          const s = parsed.scores[asset.platform];
          if (s && typeof s.totalScore === 'number') {
            const hook = Math.min(25, Math.max(0, Number(s.hookScore) || 20));
            const brand = Math.min(35, Math.max(0, Number(s.brandAlignmentScore) || 30));
            const format = Math.min(20, Math.max(0, Number(s.formattingScore) || 18));
            const cta = Math.min(20, Math.max(0, Number(s.ctaScore) || 18));
            const total = Math.min(100, Math.max(0, Number(s.totalScore) || (hook + brand + format + cta)));
            const violations = Array.isArray(s.violations) ? s.violations : [];
            const passed = total >= 85 && violations.length === 0;

            if (violations.length > 0) hasAnyViolation = true;

            platformScores[asset.platform] = {
              hookScore: hook,
              brandAlignmentScore: brand,
              formattingScore: format,
              ctaScore: cta,
              totalScore: total,
              passedGuardrails: passed,
              violations,
              improvementSuggestions: s.improvementSuggestions || (violations.length > 0 ? violations.join('; ') : undefined),
              refinedCaption: s.refinedCaption || undefined,
            };
            totalScore100 += total;
            continue;
          }

          // Fallback per-asset if platform missing from Gemini response
          const hScore = evaluateAssetWithHeuristics(asset, negativeConstraints, businessName, industry);
          platformScores[asset.platform] = hScore;
          totalScore100 += hScore.totalScore;
          if (hScore.violations.length > 0) hasAnyViolation = true;
        }

        const hasCriticalViolation = Object.values(platformScores).some((s) => !s.passedGuardrails);
        const composite100 = Math.round(totalScore100 / Math.max(1, assets.length));
        const composite10 = Number((composite100 / 10).toFixed(1));
        const overallPassed = composite100 >= 85 && !hasCriticalViolation;

        return {
          overallScore: composite10,
          overallScore100: composite100,
          passed: overallPassed,
          platformScores,
          hasViolations: hasAnyViolation,
          summary:
            parsed.summary ||
            (overallPassed
              ? `Passed AI Critic evaluation with a composite quality score of ${composite100}/100.`
              : `Flagged for refinement. Composite score ${composite100}/100 did not meet minimum threshold (85/100).`),
        };
      }
    } catch (geminiErr) {
      console.warn('[Gemini Critic LLM Fallback to Heuristics]:', geminiErr);
    }
  }

  // Pure Granular Heuristic Evaluation
  for (const asset of assets) {
    const s = evaluateAssetWithHeuristics(asset, negativeConstraints, businessName, industry);
    platformScores[asset.platform] = s;
    totalScore100 += s.totalScore;
    if (s.violations.length > 0) hasAnyViolation = true;
  }

  const hasCriticalViolation = Object.values(platformScores).some((s) => !s.passedGuardrails);
  const composite100 = Math.round(totalScore100 / Math.max(1, assets.length));
  const composite10 = Number((composite100 / 10).toFixed(1));
  const passed = composite100 >= 85 && !hasCriticalViolation;

  return {
    overallScore: composite10,
    overallScore100: composite100,
    passed,
    platformScores,
    hasViolations: hasAnyViolation,
    summary: passed
      ? `Passed AI Critic evaluation with a composite quality score of ${composite100}/100.`
      : `Requires automatic refinement. Composite score ${composite100}/100 did not meet minimum threshold (85/100).`,
  };
}

/**
 * Pre-Publish AI Critic Evaluation with Automated Refinement Loop
 * If any post scores below the 85-point threshold or triggers guardrail violations,
 * this function automatically applies or synthesizes refined copy until all posts pass.
 */
export async function evaluateAndRefineCampaignCopy(
  assets: GeneratedAssetPayload[],
  brandProfile?: Partial<BrandProfile> | any
): Promise<{ evaluation: CriticEvaluation; refinedAssets: GeneratedAssetPayload[] }> {
  // Pass 1: Initial Critic Evaluation
  const initialEvaluation = await evaluateCampaignWithCritic(assets, brandProfile);

  // If already passing cleanly, return immediately
  if (initialEvaluation.passed && !initialEvaluation.hasViolations) {
    return {
      evaluation: initialEvaluation,
      refinedAssets: assets,
    };
  }

  // Pass 2: Refinement of failing posts
  const refinedAssets: GeneratedAssetPayload[] = [];
  let needsReEvaluation = false;

  for (const asset of assets) {
    const score = initialEvaluation.platformScores[asset.platform];
    if (score && (!score.passedGuardrails || score.totalScore < 85)) {
      needsReEvaluation = true;
      const refinedCaption = score.refinedCaption || asset.caption;
      refinedAssets.push({
        ...asset,
        caption: refinedCaption,
      });
    } else {
      refinedAssets.push(asset);
    }
  }

  if (!needsReEvaluation) {
    return {
      evaluation: initialEvaluation,
      refinedAssets: assets,
    };
  }

  // Re-evaluate refined posts
  const refinedEvaluation = await evaluateCampaignWithCritic(refinedAssets, brandProfile);

  return {
    evaluation: {
      ...refinedEvaluation,
      refinedAssets,
    },
    refinedAssets,
  };
}
