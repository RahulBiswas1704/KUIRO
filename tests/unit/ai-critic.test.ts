import '../setup';
import { TestSuiteContext } from '../setup';
import {
  StructuredCriticEvaluationSchema,
  DimensionScoresSchema,
  EvaluationIssueSchema,
  computeContentVersionHash,
  runDeterministicSafetyChecks,
  FORBIDDEN_PHRASES,
} from '@/lib/ai/critic';
import { GeneratedAssetPayload } from '@/types';

function makeAsset(partial: {
  platform: any;
  caption: string;
  firstComment?: string;
  emailSubject?: string;
}): GeneratedAssetPayload {
  return {
    hashtags: [],
    mediaUrls: [],
    mediaType: 'IMAGE',
    aspectRatio: '4:5',
    ...partial,
  };
}

export async function runAiCriticUnitTests(): Promise<TestSuiteContext> {
  const ctx = new TestSuiteContext('Level A: AI Critic & Regulatory Guardrails Unit Tests');
  console.log(`\n================================================================`);
  console.log(`  RUNNING: ${ctx.name}`);
  console.log(`================================================================`);

  // 1. Zod Schema Conformance for Structured Evaluation
  {
    const validScores = {
      brandFidelity: 92,
      culturalRelevance: 88,
      platformFit: 90,
      conversionPotential: 85,
      languageQuality: 95,
      safetyCompliance: 98,
    };
    const validScoresCheck = DimensionScoresSchema.safeParse(validScores);
    ctx.assert(validScoresCheck.success, 'AI Critic Schema: DimensionScoresSchema validates correct 6-dimension scores');

    const outOfBoundsScores = {
      ...validScores,
      brandFidelity: 105, // Exceeds 100
    };
    const outOfBoundsCheck = DimensionScoresSchema.safeParse(outOfBoundsScores);
    ctx.assert(!outOfBoundsCheck.success, 'AI Critic Schema: DimensionScoresSchema rejects score > 100');

    const validIssue = {
      severity: 'medium',
      category: 'cultural',
      message: 'Consider referencing Dhanteras morning muhurat timing for authenticity.',
      platform: 'instagram',
    };
    const validIssueCheck = EvaluationIssueSchema.safeParse(validIssue);
    ctx.assert(validIssueCheck.success, 'AI Critic Schema: EvaluationIssueSchema validates structured issue object');

    const invalidIssueSeverity = {
      ...validIssue,
      severity: 'fatal_catastrophe',
    };
    const invalidSeverityCheck = EvaluationIssueSchema.safeParse(invalidIssueSeverity);
    ctx.assert(!invalidSeverityCheck.success, 'AI Critic Schema: EvaluationIssueSchema rejects invalid severity enum');

    const fullEvaluation = {
      overallScore: 89,
      scores: validScores,
      issues: [validIssue],
      approved: true,
      suggestedImprovements: ['Add clear boutique visiting hours in caption footer.'],
      contentVersionHash: 'a1b2c3d4e5f60718',
      evaluatedAt: new Date().toISOString(),
    };
    const fullCheck = StructuredCriticEvaluationSchema.safeParse(fullEvaluation);
    ctx.assert(fullCheck.success, 'AI Critic Schema: StructuredCriticEvaluationSchema parses full 6D evaluation result');
  }

  // 2. Deterministic Content Version Fingerprinting
  {
    const sampleAssets: GeneratedAssetPayload[] = [
      makeAsset({
        platform: 'instagram',
        caption: 'Celebrate festive elegance with pure handloom Banarasi silk at Sharma Heritage.',
        firstComment: '#BanarasiSilk #Festive2026 #HeritageCraft',
      }),
      makeAsset({
        platform: 'facebook',
        caption: 'Looking for authentic handcrafted bridal wear this wedding season? Visit our store today.',
      }),
    ];

    const hash1 = computeContentVersionHash(sampleAssets);
    const hash2 = computeContentVersionHash(sampleAssets);
    ctx.assert(
      typeof hash1 === 'string' && hash1.length === 16 && hash1 === hash2,
      'Content Fingerprint: Computes deterministic 16-hex fingerprint for asset payload'
    );

    const modifiedAssets: GeneratedAssetPayload[] = [
      {
        ...sampleAssets[0],
        caption: 'Celebrate festive elegance with pure Tussar silk at Sharma Heritage.',
      },
      sampleAssets[1],
    ];
    const modifiedHash = computeContentVersionHash(modifiedAssets);
    ctx.assert(
      hash1 !== modifiedHash,
      'Content Fingerprint: Produces distinct hash when any caption or platform payload is modified'
    );
  }

  // 3. Healthcare Regulatory Guardrails (Medical Advertising Standards)
  {
    const medicalViolationAssets: GeneratedAssetPayload[] = [
      makeAsset({
        platform: 'instagram',
        caption: 'Our new herbal formulation offers a 100% cure guarantee for cancer! Replace your doctor today.',
      }),
    ];

    const medicalAudit = runDeterministicSafetyChecks(medicalViolationAssets, {
      industry: 'Healthcare & Clinical Wellness',
    });
    ctx.assert(
      medicalAudit.hasCriticalSafetyViolation,
      'Regulatory Guardrail: Flags absolute medical cure guarantee as critical safety violation'
    );
    const hasHealthcareIssue = medicalAudit.issues.some(
      (iss) => iss.category === 'compliance' && iss.severity === 'critical'
    );
    ctx.assert(
      hasHealthcareIssue,
      'Regulatory Guardrail: Attaches critical severity compliance issue for prohibited medical claims'
    );
  }

  // 4. Financial Services Regulatory Guardrails (SEBI / RBI / SEC / FCA Standards)
  {
    const financialViolationAssets: GeneratedAssetPayload[] = [
      makeAsset({
        platform: 'linkedin',
        caption: 'Invest with us today for guaranteed 50% returns! Risk-free profit assured on our surefire stock picks.',
      }),
    ];

    const financialAudit = runDeterministicSafetyChecks(financialViolationAssets, {
      industry: 'Wealth Management & Financial Services',
    });
    ctx.assert(
      financialAudit.hasCriticalSafetyViolation,
      'Regulatory Guardrail: Flags guaranteed return claims as critical compliance violation'
    );
    const hasFinancialIssue = financialAudit.issues.some(
      (iss) => iss.category === 'compliance' && iss.severity === 'critical'
    );
    ctx.assert(
      hasFinancialIssue,
      'Regulatory Guardrail: Attaches critical compliance issue for unlicensed financial advice'
    );
  }

  // 5. Real Estate & Deceptive E-Commerce Patterns
  {
    const realEstateViolation: GeneratedAssetPayload[] = [
      makeAsset({
        platform: 'facebook',
        caption: 'Book this luxury villa today with guaranteed 10x appreciation and risk-free property investment.',
      }),
    ];
    const reAudit = runDeterministicSafetyChecks(realEstateViolation, {
      industry: 'Luxury Real Estate & Housing',
    });
    ctx.assert(
      reAudit.hasCriticalSafetyViolation,
      'Regulatory Guardrail: Flags guaranteed real estate appreciation as critical violation'
    );

    const deceptiveRetail: GeneratedAssetPayload[] = [
      makeAsset({
        platform: 'whatsapp',
        caption: 'Special offer! Only today or closed forever! Free forever no catch guaranteed.',
      }),
    ];
    const retailAudit = runDeterministicSafetyChecks(deceptiveRetail, {
      industry: 'E-commerce & Retail',
    });
    const hasRetailWarning = retailAudit.issues.some((iss) => iss.category === 'compliance');
    ctx.assert(
      hasRetailWarning,
      'Regulatory Guardrail: Flags deceptive urgency/fake scarcity e-commerce copy'
    );
  }

  // 6. Corporate Jargon & Forbidden Buzzwords
  {
    const jargonAssets: GeneratedAssetPayload[] = [
      makeAsset({
        platform: 'linkedin',
        caption: 'Experience our ai-powered automation ecosystem with content orchestration and paradigm shift synergy.',
      }),
    ];
    const jargonAudit = runDeterministicSafetyChecks(jargonAssets);
    const brandIssues = jargonAudit.issues.filter((iss) => iss.category === 'language');
    ctx.assert(
      brandIssues.length >= 2,
      'Forbidden Buzzwords: Flags ungrounded corporate jargon (ecosystem, orchestration, paradigm shift)'
    );
  }

  // 7. Clean, Authentic Content Passes Guardrails
  {
    const authenticAssets: GeneratedAssetPayload[] = [
      makeAsset({
        platform: 'instagram',
        caption: 'Every warp and weft tells a story. Meet our master artisan weavers behind the Durga Puja festive collection at Sharma Heritage.',
        firstComment: '#HeritageCraft #ArtisanWeaves #AuthenticSilk',
      }),
      makeAsset({
        platform: 'whatsapp',
        caption: 'Namaste! Preview our festive saree collection in our New Delhi showroom or shop online with 7-day complimentary exchanges.',
      }),
    ];

    const cleanAudit = runDeterministicSafetyChecks(authenticAssets, {
      negativeConstraints: ['Do not use competitor brand names'],
    });
    ctx.assert(
      !cleanAudit.hasCriticalSafetyViolation,
      'Safe Content: Authentic, culturally resonant content passes deterministic safety audit with zero critical violations'
    );
  }

  return ctx;
}

if (process.argv[1]?.includes('ai-critic.test.ts')) {
  runAiCriticUnitTests()
    .then((c) => {
      console.log(`\nAI Critic Unit Tests Complete: ${c.passed} passed, ${c.failed} failed.`);
      process.exit(c.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Fatal in AI Critic Unit Tests:', err);
      process.exit(1);
    });
}
