import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql as drizzleSql } from 'drizzle-orm';
import { checkStorageHealth } from '@/lib/storage/r2';
import { getOutboxTelemetry } from '@/lib/inngest/dispatcher';
import { getSchedulerTelemetry } from '@/lib/scheduler/telemetry';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();

  // 1. Check Neon PostgreSQL
  let dbStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN' = 'DOWN';
  let dbLatencyMs = 0;
  let dbError: string | undefined;

  if (db) {
    const dbStart = Date.now();
    try {
      await db.execute(drizzleSql`SELECT 1 as ping`);
      dbLatencyMs = Date.now() - dbStart;
      dbStatus = 'HEALTHY';
    } catch (err: any) {
      dbLatencyMs = Date.now() - dbStart;
      dbStatus = 'DOWN';
      dbError = err.message || String(err);
    }
  }

  // 2. Check Storage Provider (Neon Object Storage / Cloudflare R2 / Fallback)
  const storageHealth = await checkStorageHealth();

  // 3. Check Inngest Durable Outbox
  const outboxTelemetry = getOutboxTelemetry();

  // 4. Check External Integrations Readiness
  const hasGeminiKey = !!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('YourGeminiApiKeyHere');
  const hasWhatsAppKey = !!process.env.WHATSAPP_ACCESS_TOKEN || !!process.env.META_WA_ACCESS_TOKEN;
  const hasResendKey = !!process.env.RESEND_API_KEY;

  // 5. System Runtime Metrics
  const memUsage = process.memoryUsage();
  const uptimeSeconds = Math.round(process.uptime());

  // Overall Health Assessment
  const overallHealthy = dbStatus === 'HEALTHY' && storageHealth.status !== 'DEGRADED';
  const overallStatus: 'healthy' | 'degraded' | 'unhealthy' =
    dbStatus === 'DOWN' ? 'unhealthy' : overallHealthy ? 'healthy' : 'degraded';

  const durationMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      durationMs,
      uptimeSeconds,
      version: '0.1.0',
      checks: {
        database: {
          status: dbStatus,
          provider: 'Neon Lakebase PostgreSQL (Serverless)',
          latencyMs: dbLatencyMs,
          error: dbError,
        },
        storage: {
          status: storageHealth.status,
          provider: storageHealth.provider,
          bucket: storageHealth.bucket,
          latencyMs: storageHealth.latencyMs,
          writeReady: storageHealth.writeReady,
          cachedFallbackCount: storageHealth.cachedFallbackCount,
          error: storageHealth.error,
        },
        inngestDurableJobs: {
          status: process.env.INNGEST_EVENT_KEY ? 'CONFIGURED' : 'LOCAL_FALLBACK',
          queueHealth: outboxTelemetry.queueHealth,
          totalDispatched: outboxTelemetry.totalDispatched,
          totalFallback: outboxTelemetry.totalFallback,
          pendingOutboxCount: outboxTelemetry.pendingOutboxCount,
          lastDispatch: outboxTelemetry.lastDispatchTimestamp,
          lastError: outboxTelemetry.lastError,
        },
        scheduler: {
          status: 'ACTIVE',
          telemetry: getSchedulerTelemetry(),
        },
        externalServices: {
          geminiAi: hasGeminiKey ? 'OPERATIONAL' : 'KEY_MISSING',
          whatsAppCloud: hasWhatsAppKey ? 'OPERATIONAL' : 'MOCK_SANDBOX',
          resendEmail: hasResendKey ? 'OPERATIONAL' : 'MOCK_MODE',
        },
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryMb: {
          rss: Math.round(memUsage.rss / (1024 * 1024)),
          heapUsed: Math.round(memUsage.heapUsed / (1024 * 1024)),
          heapTotal: Math.round(memUsage.heapTotal / (1024 * 1024)),
        },
      },
    },
    { status: overallStatus === 'unhealthy' ? 503 : 200 }
  );
}
