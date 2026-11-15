import fs from 'fs';
import path from 'path';

/**
 * ============================================================================
 * KUIRO TEST ENVIRONMENT SETUP & FIXTURE UTILITIES
 * ============================================================================
 */

// Load .env.local into process.env before any DB modules are loaded
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// Set test mock mode so external live social/billing gateways are safely simulated
process.env.KUIRO_TEST_MOCK_PROVIDERS = 'true';
(process.env as any).NODE_ENV = 'test';

// Set test operator passkey
if (!process.env.KUIRO_MANAGEMENT_PASSKEY) {
  process.env.KUIRO_MANAGEMENT_PASSKEY = 'kuiro_management_secure_passkey_at_least_32_characters_long_2026';
}
if (!process.env.KUIRO_MANAGEMENT_JWT_SECRET) {
  process.env.KUIRO_MANAGEMENT_JWT_SECRET = 'kuiro_management_jwt_secret_at_least_32_characters_long_2026';
}

export interface AssertionStats {
  passed: number;
  failed: number;
  total: number;
}

export class TestSuiteContext {
  name: string;
  passed = 0;
  failed = 0;

  constructor(name: string) {
    this.name = name;
  }

  assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      this.passed++;
      console.log(`    ✓ [PASS] ${testName}`);
    } else {
      this.failed++;
      console.error(`    ✗ [FAIL] ${testName}`);
      if (details) {
        console.error('      Details:', details);
      }
      throw new Error(`Test assertion failed: ${testName}`);
    }
  }

  getSummary(): { passed: number; failed: number; total: number } {
    return {
      passed: this.passed,
      failed: this.failed,
      total: this.passed + this.failed,
    };
  }
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
