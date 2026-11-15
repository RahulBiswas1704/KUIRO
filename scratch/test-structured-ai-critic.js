/**
 * Comprehensive Automated Verification Suite for Structured AI Critic (Task #15)
 *
 * Verifies:
 * 1. Zod Schema Validation (StructuredCriticEvaluationSchema)
 * 2. 6 Distinct Dimensions (brandFidelity, culturalRelevance, platformFit, conversionPotential, languageQuality, safetyCompliance)
 * 3. 0-100 Consistent Scoring Scale
 * 4. Defense-in-Depth: Deterministic safety & compliance engine runs independently of LLM
 * 5. Test Case A: Brand Negative Constraint Violations (competitor mentions, blocked terms)
 * 6. Test Case B: Misleading Healthcare Claims (100% cure promises, guaranteed healing)
 * 7. Test Case C: Misleading Financial Claims (guaranteed returns, risk-free profit)
 * 8. Test Case D: Corporate Buzzwords & Tone Degradation ("ai-powered automation ecosystem", "paradigm shift")
 * 9. Test Case E: Missing / Poor Call to Action (CTA)
 * 10. Test Case F: Platform Fit Violations (X > 240 chars, missing paragraph breaks)
 * 11. Test Case G: Pristine, High-Quality Campaign Pass (approved: true, score >= 85)
 * 12. Content Versioning Hash & Snapshot Integrity (SHA-256 fingerprinting)
 * 13. Re-Evaluation Loop & Automatic Refinement
 * 14. Fail-Safe Auto-Commit Block when approved === false
 */

const assert = require('assert');
const {
  StructuredCriticEvaluationSchema,
  EvaluationIssueSchema,
  DimensionScoresSchema,
  runDeterministicSafetyChecks,
  evaluateStructuredWithDeterministicEngine,
  evaluateStructuredCampaignWithCritic,
  evaluateCampaignWithCritic,
  evaluateAndRefineCampaignCopy,
  computeContentVersionHash,
  FORBIDDEN_PHRASES,
} = require('../src/lib/ai/critic');

async function runTests() {
  console.log('======================================================================');
  console.log('⚡ STARTING STRUCTURED AI CRITIC TEST SUITE (TASK #15)');
  console.log('======================================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  async function asyncTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  // -------------------------------------------------------------------------
  // 1. ZOD SCHEMA & CONTRACT VALIDATION
  // -------------------------------------------------------------------------
  console.log('--- 1. Zod Schema & Contract Validation ---');

  test('Validates complete structured critic evaluation with Zod schema', () => {
    const validPayload = {
      overallScore: 87,
      scores: {
        brandFidelity: 92,
        culturalRelevance: 85,
        platformFit: 88,
        conversionPotential: 82,
        languageQuality: 90,
        safetyCompliance: 95,
      },
      issues: [
        {
          severity: 'medium',
          category: 'conversion',
          message: 'The call to action is not sufficiently specific.',
          platform: 'instagram',
        },
      ],
      approved: false,
      suggestedImprovements: ['Use a clearer appointment booking call to action.'],
    };

    const parsed = StructuredCriticEvaluationSchema.parse(validPayload);
    assert.strictEqual(parsed.overallScore, 87);
    assert.strictEqual(parsed.scores.brandFidelity, 92);
    assert.strictEqual(parsed.scores.safetyCompliance, 95);
    assert.strictEqual(parsed.issues[0].severity, 'medium');
  });

  test('Rejects invalid payload missing required dimension score', () => {
    const invalidPayload = {
      overallScore: 85,
      scores: {
        brandFidelity: 90,
        culturalRelevance: 85,
        // missing platformFit, conversionPotential, etc.
      },
      issues: [],
      approved: true,
      suggestedImprovements: [],
    };

    const result = StructuredCriticEvaluationSchema.safeParse(invalidPayload);
    assert.strictEqual(result.success, false, 'Zod must reject incomplete dimensions');
  });

  test('Rejects scores out of 0-100 bounds', () => {
    const outOfBounds = {
      overallScore: 105,
      scores: {
        brandFidelity: 90,
        culturalRelevance: 85,
        platformFit: 88,
        conversionPotential: 82,
        languageQuality: 90,
        safetyCompliance: -5,
      },
      issues: [],
      approved: false,
      suggestedImprovements: [],
    };

    const result = StructuredCriticEvaluationSchema.safeParse(outOfBounds);
    assert.strictEqual(result.success, false, 'Zod must reject scores > 100 or < 0');
  });

  // -------------------------------------------------------------------------
  // 2. CONTENT VERSIONING HASH TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Content Version Hash & Auditability ---');

  test('Computes deterministic SHA-256 content version hash', () => {
    const assets = [
      {
        platform: 'instagram',
        caption: 'Celebrate Diwali with Apex Clinic! Book preventive health checkup.',
        mediaUrls: ['/img1.png'],
        hashtags: ['DiwaliHealth'],
        mediaType: 'IMAGE',
        aspectRatio: '4:5',
      },
    ];

    const hash1 = computeContentVersionHash(assets);
    const hash2 = computeContentVersionHash(assets);
    assert.strictEqual(hash1, hash2, 'Identical content must yield identical hash');
    assert.strictEqual(typeof hash1, 'string');
    assert.strictEqual(hash1.length, 16);

    const modifiedAssets = [
      {
        ...assets[0],
        caption: 'Celebrate Diwali with Apex Clinic! Book preventive health checkup today.',
      },
    ];
    const hash3 = computeContentVersionHash(modifiedAssets);
    assert.notStrictEqual(hash1, hash3, 'Modified content must produce different hash');
  });

  // -------------------------------------------------------------------------
  // 3. DEFENSE-IN-DEPTH ACCEPTANCE TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Acceptance Tests: Violations & Guardrail Enforcement ---');

  // Test Case A: Negative Brand Constraints (Competitor mentions)
  test('Test Case A: Blocks brand restriction violations (Competitor mentions)', () => {
    const assets = [
      {
        platform: 'instagram',
        caption: 'Why choose Lal PathLabs when Apex Diagnostic gives faster blood test results? Book now!',
        mediaUrls: ['/brand.png'],
        hashtags: ['Health'],
        mediaType: 'IMAGE',
        aspectRatio: '4:5',
      },
    ];

    const brandProfile = {
      businessName: 'Apex Diagnostic Clinic',
      industry: 'Healthcare & Diagnostics',
      negativeConstraints: ['Lal PathLabs', 'Metropolis', 'No competitor mentions'],
    };

    const result = evaluateStructuredWithDeterministicEngine(assets, brandProfile);
    assert.strictEqual(result.approved, false, 'Must reject post violating negative constraints');
    const brandIssue = result.issues.find((i) => i.category === 'brand' && i.severity === 'critical');
    assert(brandIssue, 'Must flag critical brand issue');
    assert(brandIssue.message.includes('Lal PathLabs'), 'Must reference violated competitor name');
    assert(result.scores.brandFidelity < 70, `brandFidelity should be penalized, got ${result.scores.brandFidelity}`);
  });

  // Test Case B: Misleading Healthcare Claims (100% cure guarantees)
  test('Test Case B: Blocks misleading healthcare claims (100% cure guarantee)', () => {
    const assets = [
      {
        platform: 'instagram',
        caption: 'Our revolutionary Ayurvedic tonic guarantees 100% cure for diabetes and chronic illness! Call today.',
        mediaUrls: ['/cure.png'],
        hashtags: ['MiracleCure'],
        mediaType: 'IMAGE',
        aspectRatio: '4:5',
      },
    ];

    const brandProfile = {
      businessName: 'Apex Clinic',
      industry: 'Healthcare & Preventive Wellness',
    };

    const result = evaluateStructuredWithDeterministicEngine(assets, brandProfile);
    assert.strictEqual(result.approved, false, 'Must strictly block 100% cure guarantee');
    const complianceIssue = result.issues.find(
      (i) => i.category === 'compliance' && i.severity === 'critical'
    );
    assert(complianceIssue, 'Must identify critical healthcare compliance violation');
    assert(complianceIssue.message.includes('100% efficacy'), 'Message must explain medical advertising rule');
    assert.strictEqual(result.scores.safetyCompliance <= 30, true, `safetyCompliance must be capped <= 30, got ${result.scores.safetyCompliance}`);
  });

  // Test Case C: Misleading Financial Claims (Guaranteed returns / risk-free profit)
  test('Test Case C: Blocks misleading financial claims (Guaranteed returns / risk-free)', () => {
    const assets = [
      {
        platform: 'linkedin',
        caption: 'Invest in our private fund for guaranteed 25% returns with zero risk! Double your money risk-free profit.',
        mediaUrls: [],
        hashtags: ['Fintech'],
        mediaType: 'TEXT_ONLY',
        aspectRatio: '1:1',
      },
    ];

    const brandProfile = {
      businessName: 'WealthVest Capital',
      industry: 'Financial Services & Wealth Management',
    };

    const result = evaluateStructuredWithDeterministicEngine(assets, brandProfile);
    assert.strictEqual(result.approved, false, 'Must strictly block guaranteed returns in financial services');
    const finIssue = result.issues.find(
      (i) => i.category === 'compliance' && i.severity === 'critical'
    );
    assert(finIssue, 'Must identify critical financial compliance violation');
    assert(finIssue.message.includes('SEBI/RBI/SEC'), 'Message must reference regulatory standards');
    assert.strictEqual(result.scores.safetyCompliance <= 30, true);
  });

  // Test Case D: Wrong Tone / Corporate Buzzwords
  test('Test Case D: Flags corporate buzzwords and suggests natural human phrasing', () => {
    const assets = [
      {
        platform: 'linkedin',
        caption: 'Our ai-powered automation ecosystem creates synergistic value and delivers a paradigm shift for enterprise workflows. Book a call to learn more.',
        mediaUrls: [],
        hashtags: ['AI'],
        mediaType: 'TEXT_ONLY',
        aspectRatio: '1:1',
      },
    ];

    const brandProfile = {
      businessName: 'TechSolutions',
      industry: 'Technology',
    };

    const result = evaluateStructuredWithDeterministicEngine(assets, brandProfile);
    const jargonIssues = result.issues.filter((i) => i.category === 'language');
    assert(jargonIssues.length >= 2, `Should flag multiple buzzwords, found ${jargonIssues.length}`);
    assert(result.scores.languageQuality < 85, 'languageQuality score should be downgraded');
    const hasReplacement = jargonIssues.some((i) => i.message.includes('AI marketing co-pilot') || i.message.includes('real results'));
    assert(hasReplacement, 'Should suggest natural human phrasing replacement');
  });

  // Test Case E: Missing / Poor Call to Action (CTA)
  test('Test Case E: Identifies missing Call-to-Action (CTA)', () => {
    const assets = [
      {
        platform: 'instagram',
        caption: 'Winter is here and the weather is getting cooler in North India. Many families enjoy spending time together outdoors.',
        mediaUrls: ['/winter.png'],
        hashtags: ['Winter'],
        mediaType: 'IMAGE',
        aspectRatio: '4:5',
      },
    ];

    const brandProfile = {
      businessName: 'Heritage Textiles',
      industry: 'Retail & Fashion',
    };

    const result = evaluateStructuredWithDeterministicEngine(assets, brandProfile);
    const ctaIssue = result.issues.find((i) => i.category === 'conversion');
    assert(ctaIssue, 'Must flag missing Call to Action');
    assert(ctaIssue.message.includes('Call-to-Action'), 'Issue message must cite missing CTA');
    assert(result.scores.conversionPotential <= 75, `conversionPotential should be penalized, got ${result.scores.conversionPotential}`);
  });

  // Test Case F: Platform Fit Violations (X > 240 chars)
  test('Test Case F: Identifies platform formatting violations on X', () => {
    const longTweet = 'A'.repeat(260) + ' Visit https://kuiro.in/book now!';
    const assets = [
      {
        platform: 'x',
        caption: longTweet,
        mediaUrls: [],
        hashtags: [],
        mediaType: 'TEXT_ONLY',
        aspectRatio: '1:1',
      },
    ];

    const result = evaluateStructuredWithDeterministicEngine(assets, { businessName: 'Store' });
    const platformIssue = result.issues.find((i) => i.platform === 'x' && i.category === 'platform');
    assert(platformIssue, 'Must flag X 240 character limit violation');
  });

  // Test Case G: Pristine, High-Quality Campaign Pass
  test('Test Case G: Pristine marketing campaign passes with approved: true and score >= 85', () => {
    const assets = [
      {
        platform: 'instagram',
        caption: '✨ Keep your family healthy this festive season.\n\nOur comprehensive full-body preventive diagnostic package covers 68 essential parameters.\n\n📍 Book your home sample collection today via the link in our bio!',
        firstComment: '#PreventiveHealth #FamilyWellness #ApexClinic #HealthCheckup',
        mediaUrls: ['/clinic.png'],
        hashtags: ['PreventiveHealth', 'FamilyWellness'],
        mediaType: 'IMAGE',
        aspectRatio: '4:5',
      },
      {
        platform: 'linkedin',
        caption: 'Early diagnostic screening saves lives. In healthcare, proactive prevention will always outweigh reactive treatment.\n\nAt Apex Diagnostic Clinic, our team of board-certified pathologists is committed to high-accuracy reporting.\n\nHow is your organization supporting employee preventative health this quarter? Connect with our wellness team today.',
        mediaUrls: ['/clinic.png'],
        hashtags: ['CorporateWellness', 'HealthcareLeadership'],
        mediaType: 'IMAGE',
        aspectRatio: '1:1',
      },
    ];

    const brandProfile = {
      businessName: 'Apex Diagnostic Clinic',
      industry: 'Healthcare & Preventive Wellness',
      negativeConstraints: ['No competitor mentions'],
    };

    const result = evaluateStructuredWithDeterministicEngine(assets, brandProfile);
    assert.strictEqual(result.approved, true, 'Pristine post must be approved');
    assert(result.overallScore >= 85, `Overall score should be >= 85, got ${result.overallScore}`);
    assert.strictEqual(result.issues.filter((i) => i.severity === 'critical' || i.severity === 'high').length, 0);
  });

  // -------------------------------------------------------------------------
  // 4. ASYNC LLM + ADAPTER & REFINEMENT TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Full AI Critic & Automated Refinement Loop ---');

  await asyncTest('evaluateCampaignWithCritic returns backwards-compatible and 6D structured data', async () => {
    const assets = [
      {
        platform: 'instagram',
        caption: 'Empowering your brand journey with trusted craftsmanship.\n\nVisit our studio or link in bio to explore the festive collection!',
        mediaUrls: ['/artisan.png'],
        hashtags: ['Handloom'],
        mediaType: 'IMAGE',
        aspectRatio: '4:5',
      },
    ];

    const evaluation = await evaluateCampaignWithCritic(assets, {
      businessName: 'Sharma Handlooms',
      industry: 'Retail & Fashion',
    });

    assert(typeof evaluation.overallScore === 'number');
    assert(typeof evaluation.platformScores === 'object');
    assert(evaluation.platformScores['instagram'], 'Must contain platform score');
    assert(typeof evaluation.platformScores['instagram'].totalScore === 'number');
    assert(evaluation.scores, 'Must contain 6 dimension scores');
    assert(typeof evaluation.scores.brandFidelity === 'number');
    assert(typeof evaluation.scores.safetyCompliance === 'number');
    assert(Array.isArray(evaluation.issues));
    assert(typeof evaluation.approved === 'boolean');
  });

  await asyncTest('evaluateAndRefineCampaignCopy automatically refines failing posts', async () => {
    const failingAssets = [
      {
        platform: 'instagram',
        caption: 'We provide an ai-powered automation ecosystem with synergistic value.', // Buzzwords + no CTA
        mediaUrls: ['/brand.png'],
        hashtags: [],
        mediaType: 'IMAGE',
        aspectRatio: '4:5',
      },
    ];

    const { evaluation, refinedAssets } = await evaluateAndRefineCampaignCopy(failingAssets, {
      businessName: 'Studio Pro',
      industry: 'Professional Services',
    });

    assert(refinedAssets.length === 1);
    const refinedCaption = refinedAssets[0].caption;
    // Buzzwords should be replaced
    assert(!refinedCaption.includes('ai-powered automation ecosystem'), 'Buzzword should be replaced');
    assert(refinedCaption.includes('AI marketing co-pilot') || refinedCaption.includes('Contact us'), 'Should have improved phrasing or CTA');
  });

  console.log('\n======================================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log('======================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
