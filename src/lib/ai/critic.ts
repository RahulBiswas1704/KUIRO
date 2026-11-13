import { GeneratedAssetPayload, BrandProfile } from '@/types';

export interface CriticEvaluation {
  overallScore: number;
  passed: boolean;
  platformScores: Record<
    string,
    {
      hookScore: number;
      brandAlignmentScore: number;
      formattingScore: number;
      passedGuardrails: boolean;
      violations: string[];
      improvementSuggestions?: string;
    }
  >;
  summary: string;
}

/**
 * Pre-Publish AI Critic Agent
 * Evaluates generated content against brand guidelines and platform best practices
 * before presenting it to the business owner on WhatsApp.
 */
export async function evaluateCampaignWithCritic(
  assets: GeneratedAssetPayload[],
  brandProfile?: Partial<BrandProfile>
): Promise<CriticEvaluation> {
  const negativeConstraints = brandProfile?.negative_constraints || [];
  const platformScores: CriticEvaluation['platformScores'] = {};
  let totalScore = 0;

  for (const asset of assets) {
    const violations: string[] = [];
    const textToCheck = `${asset.caption} ${asset.firstComment || ''}`.toLowerCase();

    // Check negative constraints
    for (const constraint of negativeConstraints) {
      const lowerConstraint = constraint.toLowerCase();
      if (textToCheck.includes(lowerConstraint)) {
        violations.push(`Violates rule: "${constraint}"`);
      }
    }

    // Brand Voice Jargon & Preferred Language check
    const forbiddenPhrases = [
      { bad: 'ai-powered automation ecosystem', preferred: 'AI marketing co-pilot' },
      { bad: 'content orchestration', preferred: 'plan and publish content' },
      { bad: 'omnichannel intelligence', preferred: 'manage all your channels' },
      { bad: 'complex workflow automation', preferred: 'let KUIRO handle the routine' },
    ];

    for (const phrase of forbiddenPhrases) {
      if (textToCheck.includes(phrase.bad)) {
        violations.push(`Violates Brand Voice: replace "${phrase.bad}" with "${phrase.preferred}"`);
      }
    }

    // Platform-specific formatting checks
    let formattingScore = 10;
    if (asset.platform === 'x' && asset.caption.length > 280) {
      formattingScore -= 4;
      violations.push('Exceeds 280 character limit on X');
    }

    if (asset.platform === 'instagram' && !asset.caption.includes('\n')) {
      formattingScore -= 1; // Needs clean line breaks
    }

    const hookScore = asset.caption.length > 20 ? 9 : 6;
    const brandAlignmentScore = violations.length === 0 ? 10 : 4;
    const itemScore = (hookScore + brandAlignmentScore + formattingScore) / 3;

    totalScore += itemScore;

    platformScores[asset.platform] = {
      hookScore,
      brandAlignmentScore,
      formattingScore,
      passedGuardrails: violations.length === 0,
      violations,
      improvementSuggestions: violations.length > 0 ? violations.join('; ') : undefined,
    };
  }

  const overallScore = Number((totalScore / assets.length).toFixed(1));

  return {
    overallScore,
    passed: overallScore >= 8.0,
    platformScores,
    summary:
      overallScore >= 8.0
        ? `Passed AI Critic evaluation with a composite quality score of ${overallScore}/10.`
        : `Requires automatic refinement. Composite score ${overallScore}/10 did not meet minimum threshold (8.0).`,
  };
}
