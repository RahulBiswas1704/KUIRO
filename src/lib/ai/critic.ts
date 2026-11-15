import { z } from 'zod';
import crypto from 'crypto';
import { 
  GeneratedAssetPayload, 
  BrandProfile, 
  CriticDimensionScores, 
  CriticIssue, 
  StructuredEvaluationResult 
} from '@/types';
import { generateWithGemini } from '@/lib/ai/gemini';

// ============================================================================
// 1. ZOD SCHEMAS FOR STRUCTURED AI CRITIC EVALUATION
// ============================================================================

export const EvaluationIssueSchema = z.object({
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['brand', 'cultural', 'platform', 'conversion', 'language', 'safety', 'compliance']),
  message: z.string(),
  platform: z.string().optional(),
});

export const DimensionScoresSchema = z.object({
  brandFidelity: z.number().min(0).max(100),
  culturalRelevance: z.number().min(0).max(100),
  platformFit: z.number().min(0).max(100),
  conversionPotential: z.number().min(0).max(100),
  languageQuality: z.number().min(0).max(100),
  safetyCompliance: z.number().min(0).max(100),
});

export const StructuredCriticEvaluationSchema = z.object({
  overallScore: z.number().min(0).max(100),
  scores: DimensionScoresSchema,
  issues: z.array(EvaluationIssueSchema),
  approved: z.boolean(),
  suggestedImprovements: z.array(z.string()),
  contentVersionHash: z.string().optional(),
  evaluatedAt: z.string().optional(),
  platformBreakdown: z.record(
    z.string(),
    z.object({
      score: z.number().min(0).max(100),
      passed: z.boolean(),
      issues: z.array(EvaluationIssueSchema),
      suggestedRefinement: z.string().optional(),
    })
  ).optional(),
});

export type StructuredCriticEvaluation = z.infer<typeof StructuredCriticEvaluationSchema>;

// Backwards-compatible PlatformCriticScore
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

// Enhanced CriticEvaluation keeping backwards-compatibility while surfacing 6D structured data
export interface CriticEvaluation {
  overallScore: number;         // 0-100 scale composite
  overallScore100: number;      // 0-100 composite (alias)
  passed: boolean;              // true if approved and overallScore >= 80
  platformScores: Record<string, PlatformCriticScore>;
  summary: string;
  hasViolations: boolean;
  refinedAssets?: GeneratedAssetPayload[];
  // New 6-Dimension Structured Data
  structuredEvaluation: StructuredCriticEvaluation;
  scores: CriticDimensionScores;
  issues: CriticIssue[];
  approved: boolean;
  suggestedImprovements: string[];
}

// ============================================================================
// 2. DICTIONARIES & DOMAIN-SPECIFIC COMPLIANCE PATTERNS
// ============================================================================

// Corporate buzzwords & ungrounded marketing jargon
export const FORBIDDEN_PHRASES = [
  { bad: 'ai-powered automation ecosystem', preferred: 'AI marketing co-pilot' },
  { bad: 'content orchestration', preferred: 'plan and publish content' },
  { bad: 'omnichannel intelligence', preferred: 'manage all your channels' },
  { bad: 'complex workflow automation', preferred: 'let KUIRO handle the routine' },
  { bad: 'paradigm shift', preferred: 'breakthrough' },
  { bad: 'synergistic value', preferred: 'real results' },
  { bad: 'best-in-class solutions', preferred: 'trusted quality' },
  { bad: 'holistic digital transformation', preferred: 'grow your brand online' },
  { bad: 'hyper-personalized customer journey', preferred: 'meaningful customer relationships' },
];

// Healthcare Compliance Patterns (Medical Advertising Standards)
const HEALTHCARE_CRITICAL_PATTERNS = [
  {
    regex: /\b(100%\s*(cure|cured|guarantee|accurate|success)|guaranteed\s*(cure|treatment|healing)|cure\s*(all|any)\s*(cancer|disease|illness)|miracle\s*(cure|remedy|drug)|reverses?\s*all\s*(disease|conditions?))\b/i,
    message: 'Healthcare compliance violation: Absolute cure guarantees and 100% efficacy claims are prohibited under medical advertising standards.',
  },
  {
    regex: /\b(100%\s*accurate\s*(diagnosis|test)|never\s*fails?|zero\s*error\s*rate)\b/i,
    message: 'Healthcare compliance violation: Diagnostic tests cannot claim 100% diagnostic infallibility without clinical qualification.',
  },
  {
    regex: /\b(stop\s*taking\s*your\s*medication|replace\s*your\s*doctor|no\s*need\s*for\s*chemo)\b/i,
    message: 'Healthcare safety alert: Discouraging standard medical treatments or advising stopping medications is strictly prohibited.',
  },
];

// Financial Services Compliance Patterns (SEBI / RBI / SEC / FCA standards)
const FINANCIAL_CRITICAL_PATTERNS = [
  {
    regex: /\b(guaranteed\s*(\d+%\s*)?returns?|risk-free\s*(profit|returns?|investment)|double\s*your\s*money|100%\s*profit\s*guarantee|assured\s*wealth)\b/i,
    message: 'Financial compliance violation: Promising guaranteed returns or risk-free profits violates financial regulations (SEBI/RBI/SEC).',
  },
  {
    regex: /\b(surefire\s*stock|guaranteed\s*multibagger|buy\s*now\s*before\s*it\s*skyrockets|insider\s*tip)\b/i,
    message: 'Financial compliance violation: Unlicensed speculative stock recommendations and guaranteed multibagger claims are illegal.',
  },
];

// Real Estate Compliance Patterns
const REAL_ESTATE_CRITICAL_PATTERNS = [
  {
    regex: /\b(guaranteed\s*(\d+x|\d+%\s*)?(appreciation|returns?)|risk-free\s*property\s*investment)\b/i,
    message: 'Real estate compliance violation: Promising guaranteed property appreciation violates real estate regulatory guidelines.',
  },
];

// E-commerce Deceptive Claims Patterns
const RETAIL_DECEPTIVE_PATTERNS = [
  {
    regex: /\b(only\s*today\s*or\s*closed\s*forever|free\s*forever\s*no\s*catch\s*guaranteed)\b/i,
    message: 'Consumer protection alert: Deceptive urgency or misleading pricing claims violate fair trade regulations.',
  },
];

/**
 * Computes deterministic SHA-256 fingerprint for evaluated content version
 */
export function computeContentVersionHash(assets: GeneratedAssetPayload[]): string {
  const contentString = assets
    .map((a) => `${a.platform}:${a.caption}:${a.firstComment || ''}:${a.emailSubject || ''}`)
    .join('|');
  return crypto.createHash('sha256').update(contentString).digest('hex').substring(0, 16);
}

// ============================================================================
// 3. DETERMINISTIC SAFETY & COMPLIANCE EVALUATION ENGINE (DEFENSE IN DEPTH)
// ============================================================================

/**
 * Runs rigorous, deterministic safety, brand constraint, and industry compliance checks.
 * NEVER trusts LLM safety scores alone.
 */
export function runDeterministicSafetyChecks(
  assets: GeneratedAssetPayload[],
  brandProfile?: Partial<BrandProfile> | any
): {
  issues: CriticIssue[];
  dimensionPenalties: Record<keyof CriticDimensionScores, number>;
  hasCriticalSafetyViolation: boolean;
  platformViolations: Record<string, string[]>;
} {
  const issues: CriticIssue[] = [];
  const platformViolations: Record<string, string[]> = {};
  const dimensionPenalties: Record<keyof CriticDimensionScores, number> = {
    brandFidelity: 0,
    culturalRelevance: 0,
    platformFit: 0,
    conversionPotential: 0,
    languageQuality: 0,
    safetyCompliance: 0,
  };

  const negativeConstraints: string[] =
    brandProfile?.negative_constraints ||
    brandProfile?.negativeConstraints ||
    [];

  const businessName = (brandProfile?.businessName || brandProfile?.name || '').toLowerCase().trim();
  const rawIndustry = (brandProfile?.industry || '').toLowerCase().trim();
  let hasCriticalSafetyViolation = false;

  const isHealthcare = /health|clinic|diagnostic|wellness|pharma|medical|doctor|hospital|ayurveda/i.test(rawIndustry);
  const isFinancial = /finance|fintech|invest|wealth|bank|stock|trading|mutual\s*fund|insurance/i.test(rawIndustry);
  const isRealEstate = /real\s*estate|property|builder|realty|housing/i.test(rawIndustry);

  for (const asset of assets) {
    platformViolations[asset.platform] = [];
    const textToCheck = `${asset.caption} ${asset.firstComment || ''} ${asset.emailSubject || ''}`.toLowerCase();
    const rawText = `${asset.caption} ${asset.firstComment || ''} ${asset.emailSubject || ''}`;

    // 1. Negative Constraints Check (Brand Rules)
    for (const constraint of negativeConstraints) {
      if (!constraint) continue;
      const lowerConstraint = constraint.toLowerCase().trim();
      if (lowerConstraint && textToCheck.includes(lowerConstraint)) {
        const msg = `Violates negative brand constraint: "${constraint}"`;
        issues.push({
          severity: 'critical',
          category: 'brand',
          message: msg,
          platform: asset.platform,
        });
        platformViolations[asset.platform].push(msg);
        dimensionPenalties.brandFidelity += 35;
        dimensionPenalties.safetyCompliance += 20;
        hasCriticalSafetyViolation = true;
      }
    }

    // 2. Forbidden Corporate Buzzwords & Jargon Check
    for (const phrase of FORBIDDEN_PHRASES) {
      if (textToCheck.includes(phrase.bad)) {
        const msg = `Corporate Buzzword Alert: Replace "${phrase.bad}" with "${phrase.preferred}" for authentic tone.`;
        issues.push({
          severity: 'medium',
          category: 'language',
          message: msg,
          platform: asset.platform,
        });
        platformViolations[asset.platform].push(msg);
        dimensionPenalties.languageQuality += 10;
        dimensionPenalties.brandFidelity += 5;
      }
    }

    // 3. Domain-Specific Compliance: Healthcare
    if (isHealthcare) {
      for (const pattern of HEALTHCARE_CRITICAL_PATTERNS) {
        if (pattern.regex.test(rawText)) {
          issues.push({
            severity: 'critical',
            category: 'compliance',
            message: pattern.message,
            platform: asset.platform,
          });
          platformViolations[asset.platform].push(pattern.message);
          dimensionPenalties.safetyCompliance += 50;
          hasCriticalSafetyViolation = true;
        }
      }
    }

    // 4. Domain-Specific Compliance: Financial Services
    if (isFinancial) {
      for (const pattern of FINANCIAL_CRITICAL_PATTERNS) {
        if (pattern.regex.test(rawText)) {
          issues.push({
            severity: 'critical',
            category: 'compliance',
            message: pattern.message,
            platform: asset.platform,
          });
          platformViolations[asset.platform].push(pattern.message);
          dimensionPenalties.safetyCompliance += 50;
          hasCriticalSafetyViolation = true;
        }
      }
    }

    // 5. Domain-Specific Compliance: Real Estate
    if (isRealEstate) {
      for (const pattern of REAL_ESTATE_CRITICAL_PATTERNS) {
        if (pattern.regex.test(rawText)) {
          issues.push({
            severity: 'critical',
            category: 'compliance',
            message: pattern.message,
            platform: asset.platform,
          });
          platformViolations[asset.platform].push(pattern.message);
          dimensionPenalties.safetyCompliance += 40;
          hasCriticalSafetyViolation = true;
        }
      }
    }

    // 6. Retail & Consumer Protection
    for (const pattern of RETAIL_DECEPTIVE_PATTERNS) {
      if (pattern.regex.test(rawText)) {
        issues.push({
          severity: 'high',
          category: 'compliance',
          message: pattern.message,
          platform: asset.platform,
        });
        platformViolations[asset.platform].push(pattern.message);
        dimensionPenalties.safetyCompliance += 30;
      }
    }

    // 7. Platform Fit & Formatting
    if (asset.platform === 'x') {
      if (asset.caption.length > 240) {
        const msg = 'X post caption exceeds 240 character limit (reduces readability and causes truncation).';
        issues.push({
          severity: 'medium',
          category: 'platform',
          message: msg,
          platform: 'x',
        });
        platformViolations[asset.platform].push(msg);
        dimensionPenalties.platformFit += 15;
      }
      if (/https?:\/\//i.test(asset.caption) && asset.firstComment) {
        const msg = 'Link placed directly in X tweet rather than first reply (incurs $0.200 API link surcharge).';
        issues.push({
          severity: 'low',
          category: 'platform',
          message: msg,
          platform: 'x',
        });
        platformViolations[asset.platform].push(msg);
        dimensionPenalties.platformFit += 10;
      }
    } else if (asset.platform === 'instagram') {
      if (!asset.caption.includes('\n')) {
        const msg = 'Instagram caption lacks structured paragraph line breaks.';
        issues.push({
          severity: 'low',
          category: 'platform',
          message: msg,
          platform: 'instagram',
        });
        platformViolations[asset.platform].push(msg);
        dimensionPenalties.platformFit += 8;
      }
      const hashtags = asset.hashtags || [];
      if (hashtags.length === 0 && !/#\w+/.test(asset.caption)) {
        const msg = 'Instagram post is missing relevant discoverability hashtags.';
        issues.push({
          severity: 'low',
          category: 'platform',
          message: msg,
          platform: 'instagram',
        });
        dimensionPenalties.platformFit += 8;
      }
    } else if (asset.platform === 'whatsapp') {
      if (asset.caption.length > 600) {
        const msg = 'WhatsApp broadcast message exceeds 600 characters (too lengthy for mobile engagement).';
        issues.push({
          severity: 'medium',
          category: 'platform',
          message: msg,
          platform: 'whatsapp',
        });
        platformViolations[asset.platform].push(msg);
        dimensionPenalties.platformFit += 12;
      }
    }

    // 8. Conversion & CTA Quality
    const ctaRegex = /\b(book|visit|call|order|reserve|reply|dm|whatsapp|contact|schedule|discover|join|get started|link in bio|register|claim|download)\b/i;
    const hasCta = ctaRegex.test(asset.caption) || (asset.firstComment && ctaRegex.test(asset.firstComment));
    if (!hasCta) {
      const msg = `Missing or weak Call-to-Action (CTA) on ${asset.platform}. The copy lacks an actionable next step for customers.`;
      issues.push({
        severity: 'medium',
        category: 'conversion',
        message: msg,
        platform: asset.platform,
      });
      platformViolations[asset.platform].push(msg);
      dimensionPenalties.conversionPotential += 20;
    }
  }

  return {
    issues,
    dimensionPenalties,
    hasCriticalSafetyViolation,
    platformViolations,
  };
}

/**
 * Pure deterministic structured evaluator.
 * Serves as fail-safe fallback and provides ground-truth deterministic validation.
 */
export function evaluateStructuredWithDeterministicEngine(
  assets: GeneratedAssetPayload[],
  brandProfile?: Partial<BrandProfile> | any
): StructuredEvaluationResult {
  const { issues, dimensionPenalties, hasCriticalSafetyViolation, platformViolations } =
    runDeterministicSafetyChecks(assets, brandProfile);

  // Compute baseline scores
  const brandFidelity = Math.min(100, Math.max(10, 95 - dimensionPenalties.brandFidelity));
  const culturalRelevance = Math.min(100, Math.max(20, 92 - dimensionPenalties.culturalRelevance));
  const platformFit = Math.min(100, Math.max(15, 94 - dimensionPenalties.platformFit));
  const conversionPotential = Math.min(100, Math.max(10, 90 - dimensionPenalties.conversionPotential));
  const languageQuality = Math.min(100, Math.max(15, 96 - dimensionPenalties.languageQuality));
  
  let safetyCompliance = Math.min(100, Math.max(0, 98 - dimensionPenalties.safetyCompliance));
  if (hasCriticalSafetyViolation) {
    safetyCompliance = Math.min(safetyCompliance, 30);
  }

  const scores: CriticDimensionScores = {
    brandFidelity,
    culturalRelevance,
    platformFit,
    conversionPotential,
    languageQuality,
    safetyCompliance,
  };

  // Standard weighted composite calculation (0-100 scale)
  const overallScore = Math.round(
    brandFidelity * 0.20 +
    culturalRelevance * 0.15 +
    platformFit * 0.15 +
    conversionPotential * 0.15 +
    languageQuality * 0.15 +
    safetyCompliance * 0.20
  );

  // Approved condition: Score >= 80, safety >= 75, and ZERO critical or high issues
  const hasCriticalOrHigh = issues.some((i) => i.severity === 'critical' || i.severity === 'high');
  const approved = overallScore >= 80 && safetyCompliance >= 75 && !hasCriticalOrHigh;

  const suggestedImprovements = Array.from(
    new Set(
      issues.map((i) => {
        if (i.category === 'conversion') return 'Add a clear, specific call-to-action (e.g., booking link or phone contact).';
        if (i.category === 'compliance') return 'Remove unverified absolute claims or add required regulatory/medical disclaimers.';
        if (i.category === 'brand') return 'Ensure all copy adheres to brand negative constraints and tone guidelines.';
        if (i.category === 'platform') return 'Refine platform-specific formatting and character length.';
        if (i.category === 'language') return 'Replace corporate buzzwords with natural, conversational language.';
        return i.message;
      })
    )
  );

  const contentVersionHash = computeContentVersionHash(assets);

  // Platform breakdown mapping
  const platformBreakdown: StructuredEvaluationResult['platformBreakdown'] = {};
  for (const asset of assets) {
    const pViolations = platformViolations[asset.platform] || [];
    const pScore = Math.min(100, Math.max(10, 95 - pViolations.length * 15));
    platformBreakdown[asset.platform] = {
      score: pScore,
      passed: pScore >= 80 && pViolations.length === 0,
      issues: issues.filter((i) => i.platform === asset.platform),
      suggestedRefinement: pViolations.length > 0 ? pViolations.join('; ') : undefined,
    };
  }

  return {
    overallScore,
    scores,
    issues,
    approved,
    suggestedImprovements,
    contentVersionHash,
    evaluatedAt: new Date().toISOString(),
    platformBreakdown,
  };
}

// ============================================================================
// 4. MAIN STRUCTURED AI CRITIC EVALUATION (GEMINI + ZOD + DETERMINISTIC DEFENSE)
// ============================================================================

/**
 * Evaluates multi-channel marketing content across all six core dimensions:
 * 1. Brand Fidelity
 * 2. Cultural Relevance
 * 3. Platform Fit
 * 4. Conversion Potential
 * 5. Language Quality
 * 6. Safety & Compliance
 *
 * Uses Gemini LLM when available, strictly validates with Zod, and layers
 * deterministic safety checks on top (Defense in Depth).
 */
export async function evaluateStructuredCampaignWithCritic(
  assets: GeneratedAssetPayload[],
  brandProfile?: Partial<BrandProfile> | any
): Promise<StructuredEvaluationResult> {
  const contentVersionHash = computeContentVersionHash(assets);
  const negativeConstraints: string[] =
    brandProfile?.negative_constraints ||
    brandProfile?.negativeConstraints ||
    [];

  const businessName = brandProfile?.businessName || brandProfile?.name || 'Business';
  const industry = brandProfile?.industry || 'General';
  const tones = brandProfile?.tones || (brandProfile?.toneOfVoice?.samplePhrases as string[]) || ['Culturally Warm', 'Authoritative'];
  const pillars = brandProfile?.pillars || (brandProfile?.contentPillars as any[])?.map((p: any) => p.name || p) || ['Core Offerings'];

  const apiKey = process.env.GEMINI_API_KEY;
  const canUseGemini = apiKey && !apiKey.includes('YourGeminiApiKeyHere');

  // Fallback baseline evaluation
  const deterministicResult = evaluateStructuredWithDeterministicEngine(assets, brandProfile);

  if (!canUseGemini) {
    return deterministicResult;
  }

  try {
    const assetsForPrompt = assets.map((a) => ({
      platform: a.platform,
      caption: a.caption,
      firstComment: a.firstComment || null,
      emailSubject: a.emailSubject || null,
    }));

    const prompt = `You are KUIRO's Senior Pre-Publish AI Critic & Quality Assurance Auditor.
Evaluate this multi-channel campaign against brand guidelines, cultural appropriateness, and platform unit economics.

Brand Context:
- Business Name: "${businessName}"
- Industry / Niche: "${industry}"
- Tone of Voice: ${tones.join(', ')}
- Content Pillars: ${pillars.join(', ')}
- Strict Negative Constraints: ${negativeConstraints.join(', ') || 'None specified'}

Evaluate across these 6 Dimensions (0-100 Scale for each):
1. brandFidelity: Does content follow brand identity, tones, and strictly avoid negative constraints?
2. culturalRelevance: Are cultural, festival, or regional references accurate, respectful, and resonant?
3. platformFit: Does it suit formatting, character limits, and link placement for each channel (X < 240 chars, IG linebreaks)?
4. conversionPotential: Does it have a clear business objective and compelling call-to-action (CTA)?
5. languageQuality: Is copy clear, natural, and free of clunky corporate buzzwords?
6. safetyCompliance: Does it avoid prohibited, risky, or deceptive claims (especially medical cure guarantees or financial promises)?

Campaign Assets to Audit:
${JSON.stringify(assetsForPrompt, null, 2)}

Return ONLY a valid JSON object matching this exact schema:
{
  "overallScore": 87,
  "scores": {
    "brandFidelity": 92,
    "culturalRelevance": 85,
    "platformFit": 88,
    "conversionPotential": 82,
    "languageQuality": 90,
    "safetyCompliance": 95
  },
  "issues": [
    {
      "severity": "medium",
      "category": "conversion",
      "message": "The call to action is not sufficiently specific.",
      "platform": "instagram"
    }
  ],
  "approved": true,
  "suggestedImprovements": [
    "Use a clearer appointment booking call to action."
  ]
}`;

    const rawGemini = await generateWithGemini({
      prompt,
      systemInstruction: 'You are KUIRO Structured AI Critic. Evaluate marketing content across 6 dimensions. Return valid JSON only.',
      temperature: 0.1,
      responseMimeType: 'application/json',
    });

    let clean = rawGemini.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      clean = clean.substring(firstBrace, lastBrace + 1);
    }

    const rawParsed = JSON.parse(clean);

    // Strict Zod Validation of LLM Output
    const zodValidation = StructuredCriticEvaluationSchema.safeParse(rawParsed);

    if (!zodValidation.success) {
      console.warn('[Zod AI Critic Validation Warning]: LLM output failed schema validation. Falling back to deterministic evaluation.', zodValidation.error.format());
      return deterministicResult;
    }

    const llmData = zodValidation.data;

    // DEFENSE IN DEPTH: Merge Deterministic Safety Checks
    // Never trust model's safety score alone!
    const { issues: detIssues, hasCriticalSafetyViolation, platformViolations } =
      runDeterministicSafetyChecks(assets, brandProfile);

    // Merge issues (deduplicating by message)
    const combinedIssues: CriticIssue[] = [...llmData.issues];
    for (const det of detIssues) {
      if (!combinedIssues.some((i) => i.message.toLowerCase() === det.message.toLowerCase())) {
        combinedIssues.push(det);
      }
    }

    // Force safety overrides if deterministic violations detected
    let finalSafetyCompliance = llmData.scores.safetyCompliance;
    let finalBrandFidelity = llmData.scores.brandFidelity;

    if (hasCriticalSafetyViolation) {
      finalSafetyCompliance = Math.min(finalSafetyCompliance, 30);
    }
    if (detIssues.some((i) => i.category === 'brand' && i.severity === 'critical')) {
      finalBrandFidelity = Math.min(finalBrandFidelity, 40);
    }

    const mergedScores: CriticDimensionScores = {
      ...llmData.scores,
      safetyCompliance: finalSafetyCompliance,
      brandFidelity: finalBrandFidelity,
    };

    const recalculatedOverall = Math.round(
      mergedScores.brandFidelity * 0.20 +
      mergedScores.culturalRelevance * 0.15 +
      mergedScores.platformFit * 0.15 +
      mergedScores.conversionPotential * 0.15 +
      mergedScores.languageQuality * 0.15 +
      mergedScores.safetyCompliance * 0.20
    );

    const hasCriticalOrHigh = combinedIssues.some((i) => i.severity === 'critical' || i.severity === 'high');
    const finalApproved = recalculatedOverall >= 80 && mergedScores.safetyCompliance >= 75 && !hasCriticalOrHigh;

    const mergedImprovements = Array.from(
      new Set([...llmData.suggestedImprovements, ...deterministicResult.suggestedImprovements])
    );

    return {
      overallScore: recalculatedOverall,
      scores: mergedScores,
      issues: combinedIssues,
      approved: finalApproved,
      suggestedImprovements: mergedImprovements,
      contentVersionHash,
      evaluatedAt: new Date().toISOString(),
      platformBreakdown: deterministicResult.platformBreakdown,
    };
  } catch (err: any) {
    console.warn('[Structured AI Critic LLM Error]:', err.message);
    return deterministicResult;
  }
}

// ============================================================================
// 5. BACKWARD-COMPATIBLE ADAPTERS
// ============================================================================

/**
 * Standard campaign evaluator providing both backward-compatible platformScores
 * and the complete 6-dimension structured evaluation.
 */
export async function evaluateCampaignWithCritic(
  assets: GeneratedAssetPayload[],
  brandProfile?: Partial<BrandProfile> | any
): Promise<CriticEvaluation> {
  const structured = await evaluateStructuredCampaignWithCritic(assets, brandProfile);

  // Map structured evaluation into legacy PlatformCriticScore objects
  const platformScores: Record<string, PlatformCriticScore> = {};

  for (const asset of assets) {
    const pBreakdown = structured.platformBreakdown?.[asset.platform];
    const pIssues = structured.issues.filter((i) => !i.platform || i.platform === asset.platform);
    const pViolations = pIssues.map((i) => i.message);

    const hookScore = Math.min(25, Math.max(10, Math.round(structured.scores.languageQuality * 0.25)));
    const brandAlignmentScore = Math.min(35, Math.max(10, Math.round(structured.scores.brandFidelity * 0.35)));
    const formattingScore = Math.min(20, Math.max(8, Math.round(structured.scores.platformFit * 0.20)));
    const ctaScore = Math.min(20, Math.max(8, Math.round(structured.scores.conversionPotential * 0.20)));
    const totalScore = pBreakdown?.score || structured.overallScore;

    const hasCritical = pIssues.some((i) => i.severity === 'critical' || i.severity === 'high');
    const passedGuardrails = totalScore >= 80 && !hasCritical;

    // Generate refined caption if failing
    let refinedCaption: string | undefined = undefined;
    if (!passedGuardrails) {
      let fixed = asset.caption;
      for (const phrase of FORBIDDEN_PHRASES) {
        fixed = fixed.replace(new RegExp(phrase.bad, 'gi'), phrase.preferred);
      }
      const negativeConstraints: string[] =
        brandProfile?.negative_constraints || brandProfile?.negativeConstraints || [];
      for (const constraint of negativeConstraints) {
        if (constraint) fixed = fixed.replace(new RegExp(constraint, 'gi'), '');
      }
      if (asset.platform === 'x' && fixed.length > 240) {
        fixed = fixed.substring(0, 237).trim() + '...';
      }
      if (!/\b(book|visit|call|order|reserve|reply|contact)\b/i.test(fixed)) {
        fixed += '\n\nContact us or visit our link in bio to learn more!';
      }
      refinedCaption = fixed;
    }

    platformScores[asset.platform] = {
      hookScore,
      brandAlignmentScore,
      formattingScore,
      ctaScore,
      totalScore,
      passedGuardrails,
      violations: pViolations,
      improvementSuggestions: pViolations.length > 0 ? pViolations.join('; ') : undefined,
      refinedCaption,
    };
  }

  const summary = structured.approved
    ? `Passed 6-Dimension AI Critic evaluation with a composite quality score of ${structured.overallScore}/100.`
    : `Quality or compliance issues flagged (${structured.issues.length} issues). Overall score: ${structured.overallScore}/100. Human review or revision required.`;

  return {
    overallScore: structured.overallScore,
    overallScore100: structured.overallScore,
    passed: structured.approved,
    platformScores,
    summary,
    hasViolations: structured.issues.length > 0,
    structuredEvaluation: structured,
    scores: structured.scores,
    issues: structured.issues,
    approved: structured.approved,
    suggestedImprovements: structured.suggestedImprovements,
  };
}

/**
 * Pre-Publish AI Critic Evaluation with Automated Refinement Loop.
 * Evaluates multi-channel copy against the 6 dimensions. If issues or low scores
 * are detected, refines the copy surgically and re-evaluates.
 */
export async function evaluateAndRefineCampaignCopy(
  assets: GeneratedAssetPayload[],
  brandProfile?: Partial<BrandProfile> | any
): Promise<{ evaluation: CriticEvaluation; refinedAssets: GeneratedAssetPayload[] }> {
  // Pass 1: Structured Evaluation
  const initialEvaluation = await evaluateCampaignWithCritic(assets, brandProfile);

  // If already passing cleanly with approval, return immediately
  if (initialEvaluation.passed && !initialEvaluation.hasViolations) {
    return {
      evaluation: initialEvaluation,
      refinedAssets: assets,
    };
  }

  // Pass 2: Refine failing posts
  const refinedAssets: GeneratedAssetPayload[] = [];
  let needsReEvaluation = false;

  for (const asset of assets) {
    const score = initialEvaluation.platformScores[asset.platform];
    if (score && (!score.passedGuardrails || score.totalScore < 80)) {
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

  // Pass 3: Re-evaluate refined posts
  const refinedEvaluation = await evaluateCampaignWithCritic(refinedAssets, brandProfile);

  return {
    evaluation: {
      ...refinedEvaluation,
      refinedAssets,
    },
    refinedAssets,
  };
}
