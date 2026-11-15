import './setup';
import { runAuthUnitTests } from './unit/auth.test';
import { runSecurityUnitTests } from './unit/security.test';
import { runAiCriticUnitTests } from './unit/ai-critic.test';
import { runStateMachineUnitTests } from './unit/state-machine.test';
import { runSignupLoginIntegrationTests } from './integration/signup-login.test';
import { runTenantIsolationIntegrationTests } from './integration/tenant-isolation.test';
import { runMetaWebhookIntegrationTests } from './integration/meta-webhook.test';
import { runPaymentActivationIntegrationTests } from './integration/payment-activation.test';
import { runResilientPublishingIntegrationTests } from './integration/resilient-publishing.test';
import { runCustomerJourneyE2ETests } from './e2e/customer-journey.test';

interface GateResult {
  gateNumber: number;
  name: string;
  passed: boolean;
  testCount: number;
  failureCount: number;
}

async function main() {
  const args = process.argv.slice(2);
  const runUnit = args.includes('--unit') || args.length === 0;
  const runIntegration = args.includes('--integration') || args.length === 0;
  const runE2E = args.includes('--e2e') || args.length === 0;

  console.log(`\n================================================================`);
  console.log(`  KUIRO ENTERPRISE AUTOMATED TEST RUNNER & RELEASE GATE ENGINE  `);
  console.log(`================================================================`);
  console.log(`Modes Selected: Unit=${runUnit}, Integration=${runIntegration}, E2E=${runE2E}\n`);

  const startTime = Date.now();
  const gates: GateResult[] = [];
  let totalAssertions = 0;
  let totalFailures = 0;

  // --------------------------------------------------------------------------
  // LEVEL A: UNIT TEST SUITES
  // --------------------------------------------------------------------------
  if (runUnit) {
    // Suite 1: Auth & Cryptography
    const authSuite = await runAuthUnitTests();
    totalAssertions += authSuite.passed + authSuite.failed;
    totalFailures += authSuite.failed;
    gates.push({
      gateNumber: 1,
      name: 'Cryptographic Authentication & Password Integrity',
      passed: authSuite.failed === 0,
      testCount: authSuite.passed + authSuite.failed,
      failureCount: authSuite.failed,
    });

    // Suite 2: Security & Webhooks
    const secSuite = await runSecurityUnitTests();
    totalAssertions += secSuite.passed + secSuite.failed;
    totalFailures += secSuite.failed;
    gates.push({
      gateNumber: 2,
      name: 'Webhook HMAC Cryptographic Signatures & Anti-Replay',
      passed: secSuite.failed === 0,
      testCount: secSuite.passed + secSuite.failed,
      failureCount: secSuite.failed,
    });

    // Suite 3: AI Critic & Regulatory Compliance
    const criticSuite = await runAiCriticUnitTests();
    totalAssertions += criticSuite.passed + criticSuite.failed;
    totalFailures += criticSuite.failed;
    gates.push({
      gateNumber: 3,
      name: 'Regulatory AI Critic Guardrails & Schema Conformance',
      passed: criticSuite.failed === 0,
      testCount: criticSuite.passed + criticSuite.failed,
      failureCount: criticSuite.failed,
    });

    // Suite 4: State Machine Determinism
    const smSuite = await runStateMachineUnitTests();
    totalAssertions += smSuite.passed + smSuite.failed;
    totalFailures += smSuite.failed;
    gates.push({
      gateNumber: 4,
      name: 'Campaign State Machine Determinism & Idempotency Formatting',
      passed: smSuite.failed === 0,
      testCount: smSuite.passed + smSuite.failed,
      failureCount: smSuite.failed,
    });
  }

  // --------------------------------------------------------------------------
  // LEVEL B: INTEGRATION TEST SUITES
  // --------------------------------------------------------------------------
  if (runIntegration) {
    // Suite 5: Signup & Login Database Integration
    const signupSuite = await runSignupLoginIntegrationTests();
    totalAssertions += signupSuite.passed + signupSuite.failed;
    totalFailures += signupSuite.failed;

    // Suite 6: Multi-Tenant Isolation
    const tenantSuite = await runTenantIsolationIntegrationTests();
    totalAssertions += tenantSuite.passed + tenantSuite.failed;
    totalFailures += tenantSuite.failed;
    gates.push({
      gateNumber: 5,
      name: 'Multi-Tenant Isolation & Zero Data Leakage',
      passed: tenantSuite.failed === 0,
      testCount: tenantSuite.passed + tenantSuite.failed,
      failureCount: tenantSuite.failed,
    });

    // Suite 7: Meta Webhook Integration
    const webhookSuite = await runMetaWebhookIntegrationTests();
    totalAssertions += webhookSuite.passed + webhookSuite.failed;
    totalFailures += webhookSuite.failed;

    // Suite 8: Payment Activation Integration
    const paymentSuite = await runPaymentActivationIntegrationTests();
    totalAssertions += paymentSuite.passed + paymentSuite.failed;
    totalFailures += paymentSuite.failed;

    // Suite 9: Resilient Publishing Integration
    const pubSuite = await runResilientPublishingIntegrationTests();
    totalAssertions += pubSuite.passed + pubSuite.failed;
    totalFailures += pubSuite.failed;
  }

  // --------------------------------------------------------------------------
  // LEVEL C: END-TO-END CUSTOMER JOURNEY
  // --------------------------------------------------------------------------
  if (runE2E) {
    // Suite 10: 12-Step Customer Journey
    const e2eSuite = await runCustomerJourneyE2ETests();
    totalAssertions += e2eSuite.passed + e2eSuite.failed;
    totalFailures += e2eSuite.failed;
    gates.push({
      gateNumber: 6,
      name: 'Complete 12-Step Customer Journey End-to-End',
      passed: e2eSuite.failed === 0,
      testCount: e2eSuite.passed + e2eSuite.failed,
      failureCount: e2eSuite.failed,
    });
  }

  // --------------------------------------------------------------------------
  // RELEASE GATES EVALUATION REPORT
  // --------------------------------------------------------------------------
  const durationSec = Math.round((Date.now() - startTime) / 100) / 10;
  console.log(`\n================================================================`);
  console.log(`                KUIRO RELEASE GATE VERIFICATION                 `);
  console.log(`================================================================`);

  let allGatesPassed = true;
  for (const gate of gates) {
    const icon = gate.passed ? '✓ [PASSED]' : '✗ [FAILED]';
    console.log(`  ${icon} Gate ${gate.gateNumber}: ${gate.name}`);
    console.log(`            Assertions: ${gate.testCount} | Failures: ${gate.failureCount}`);
    if (!gate.passed) {
      allGatesPassed = false;
    }
  }

  console.log(`----------------------------------------------------------------`);
  console.log(`Total Assertions Passed: ${totalAssertions - totalFailures} / ${totalAssertions}`);
  console.log(`Total Failures:          ${totalFailures}`);
  console.log(`Execution Duration:      ${durationSec}s`);
  console.log(`Overall Release Status:  ${allGatesPassed && totalFailures === 0 ? 'READY FOR PRODUCTION RELEASE' : 'BLOCKED - GATES FAILED'}`);
  console.log(`================================================================\n`);

  if (!allGatesPassed || totalFailures > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('\nFatal Error in Test Runner:', err);
  process.exit(1);
});
