'use client';

import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Database,
  Layers,
  Mail,
  Server,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import type {
  ActivityItem,
  AdminAlert,
  MetricOverview,
  SystemHealth,
} from './types';
import { formatShortDate, isHealthyStatus } from './types';

interface AdminOverviewPanelProps {
  metrics: MetricOverview | null;
  health: SystemHealth | null;
  activities: ActivityItem[];
  alerts: AdminAlert[];
  isLoading: boolean;
  updatingAlertId: string | null;
  onUpdateAlertStatus: (alertId: string, status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED') => void;
}

function getStatusPillStyle(status?: string): { dot: string; badge: string; label: string } {
  const raw = status || 'UNKNOWN';
  const upper = raw.toUpperCase();
  if (upper === 'HEALTHY' || upper === 'OPERATIONAL') {
    return {
      dot: 'bg-emerald-500',
      badge: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      label: upper,
    };
  }
  if (upper === 'LOCAL_OUTBOX' || upper === 'FALLBACK_ACTIVE' || upper === 'FALLBACK_LOCAL') {
    return {
      dot: 'bg-amber-500',
      badge: 'bg-amber-50 border-amber-200 text-amber-800',
      label: upper,
    };
  }
  return {
    dot: 'bg-rose-500',
    badge: 'bg-rose-50 border-rose-200 text-rose-700',
    label: upper,
  };
}

function getSeverityBadge(severity: string): string {
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
    case 'ERROR':
      return 'bg-rose-50 border-rose-200 text-rose-700';
    case 'WARNING':
      return 'bg-amber-50 border-amber-200 text-amber-800';
    default:
      return 'bg-slate-100 border-slate-200 text-slate-700';
  }
}

export default function AdminOverviewPanel({
  metrics,
  health,
  activities,
  alerts,
  isLoading,
  updatingAlertId,
  onUpdateAlertStatus,
}: AdminOverviewPanelProps) {
  const services = [
    {
      name: 'Neon PostgreSQL',
      icon: <Database size={15} className="text-emerald-600" />,
      status: health?.database?.status,
      detail: `${health?.database?.engine || 'Serverless Postgres'} • Branch: ${health?.database?.branch || 'production'}`,
      metric:
        health?.database?.latencyMs !== undefined
          ? `Latency: ${health.database.latencyMs}ms (Pooled)`
          : isLoading
          ? 'Measuring latency...'
          : 'No telemetry',
    },
    {
      name: 'Google Gemini AI',
      icon: <Sparkles size={15} className="text-[#FF7A00]" />,
      status: health?.geminiAi?.status,
      detail: `Model: ${health?.geminiAi?.model || 'Gemini Flash Lite'}`,
      metric: `Status: ${health?.geminiAi?.status || (isLoading ? 'Checking...' : 'Unavailable')}`,
    },
    {
      name: 'WhatsApp Cloud API',
      icon: <Smartphone size={15} className="text-emerald-600" />,
      status: health?.whatsappCloud?.status,
      detail: `Meta Graph API: ${health?.whatsappCloud?.graphApiVersion || 'v21.0'}`,
      metric: `Phone ID: ${health?.whatsappCloud?.phoneId || 'Unconfigured'}`,
    },
    {
      name: 'Object Storage CDN',
      icon: <Layers size={15} className="text-blue-600" />,
      status: health?.storage?.status || health?.cloudflareR2?.status,
      detail: `${health?.storage?.name || 'Media Vault'} • Bucket: ${health?.storage?.bucket || health?.cloudflareR2?.bucket || 'kuiro-media'}`,
      metric:
        health?.storage?.latencyMs !== undefined
          ? `Latency: ${health.storage.latencyMs}ms`
          : `Provider: ${health?.storage?.provider || 'r2/neon'}`,
    },
    {
      name: 'Inngest State Machine',
      icon: <Cpu size={15} className="text-indigo-600" />,
      status: health?.inngestEngine?.status,
      detail: health?.inngestEngine?.scheduler || '48h Durable Loop & Outbox',
      metric: `${metrics?.brandProfiles ?? '—'} Brand Brains • ${metrics?.calendarEvents ?? '—'} Holidays`,
    },
    {
      name: 'Transactional Email',
      icon: <Mail size={15} className="text-rose-500" />,
      status: health?.resendEmail?.status,
      detail: 'Provider: Resend SMTP / API',
      metric: health?.resendEmail?.from || 'updates@kuiro.in',
    },
  ];

  const allServicesNominal = Boolean(
    health &&
      isHealthyStatus(health.database?.status) &&
      isHealthyStatus(health.geminiAi?.status)
  );

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Cloud Services Status Matrix */}
      <section className="rounded-[24px] bg-white border border-gray-200/90 shadow-[0_14px_34px_-22px_rgba(11,15,20,0.14)] p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h2 className="font-sora text-base sm:text-lg font-extrabold text-[#0B0F14] flex items-center gap-2">
              <Server size={17} className="text-[#FF7A00]" />
              <span>Cloud Services &amp; Micro-Infrastructure Health</span>
            </h2>
            <p className="text-xs text-[#4B5563] font-inter mt-0.5">
              Live telemetry across database branches, AI routing, Meta Cloud webhooks, and object storage.
            </p>
          </div>
          <span
            className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono font-bold ${
              allServicesNominal
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                allServicesNominal ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>{allServicesNominal ? 'Core Stack Operational' : 'Inspect Telemetry'}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          {services.map((svc) => {
            const st = getStatusPillStyle(svc.status);
            return (
              <div
                key={svc.name}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] hover:border-[#FF8E3C]/50 transition space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-sora font-bold text-[#0B0F14] flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-white border border-gray-200/80 flex items-center justify-center shrink-0">
                      {svc.icon}
                    </span>
                    <span>{svc.name}</span>
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold ${st.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    <span>{st.label}</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#4B5563] font-inter leading-snug">{svc.detail}</p>
                <p className="text-[11px] text-[#0B0F14] font-mono font-medium pt-0.5 truncate">
                  {svc.metric}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Two-Column Stream: Platform Activity + System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Live Platform Activity Stream */}
        <section className="lg:col-span-7 rounded-[24px] bg-white border border-gray-200/90 shadow-[0_14px_34px_-22px_rgba(11,15,20,0.14)] p-5 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
            <h2 className="font-sora text-base font-extrabold text-[#0B0F14] flex items-center gap-2">
              <Activity size={16} className="text-[#FF7A00]" />
              <span>Live Platform Activity Stream</span>
            </h2>
            <span className="text-[11px] font-mono text-gray-500">
              {metrics ? `${metrics.conversations} Inbox Threads • ${metrics.messages} Msgs` : 'Live feed'}
            </span>
          </div>

          {activities.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500 font-mono bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E7DED3]">
              No recent platform activities recorded yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {activities.slice(0, 8).map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFE7DE] flex items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <span
                      className={`mt-1 sm:mt-0 w-2 h-2 rounded-full shrink-0 ${
                        act.badgeColor === 'emerald'
                          ? 'bg-emerald-500'
                          : act.badgeColor === 'amber'
                          ? 'bg-amber-500'
                          : act.badgeColor === 'purple'
                          ? 'bg-indigo-500'
                          : 'bg-[#FF7A00]'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="font-sora font-semibold text-[#0B0F14] truncate">{act.title}</p>
                      <p className="text-[11px] text-[#4B5563] font-mono truncate">{act.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono shrink-0 whitespace-nowrap">
                    {formatShortDate(act.timestamp, true)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* System Anomaly Alerts Feed */}
        <section className="lg:col-span-5 rounded-[24px] bg-white border border-gray-200/90 shadow-[0_14px_34px_-22px_rgba(11,15,20,0.14)] p-5 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
            <h2 className="font-sora text-base font-extrabold text-[#0B0F14] flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#FF7A00]" />
              <span>System Alerts</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EFE7DE] text-[10px] font-mono font-semibold text-[#374151]">
              {alerts.filter((a) => a.status === 'OPEN').length} Open
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="p-8 text-center text-xs text-emerald-700 font-inter bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1.5">
              <CheckCircle2 size={20} className="mx-auto text-emerald-600" />
              <p className="font-sora font-bold">Zero Anomaly Alerts</p>
              <p className="text-[11px] text-emerald-700/80">
                All queues, webhooks, and billing monitors are clear.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {alerts.slice(0, 10).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFE7DE] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase ${getSeverityBadge(
                        alert.severity
                      )}`}
                    >
                      {alert.severity} • {alert.category}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">
                      {formatShortDate(alert.createdAt, true)}
                    </span>
                  </div>

                  <div>
                    <p className="font-sora font-bold text-[#0B0F14]">{alert.title}</p>
                    <p className="text-[11px] text-[#4B5563] font-inter mt-0.5 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#EFE7DE]">
                    <span className="text-[10px] font-mono font-semibold text-gray-500">
                      Status: {alert.status}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {alert.status === 'OPEN' && (
                        <button
                          type="button"
                          disabled={updatingAlertId === alert.id}
                          onClick={() => onUpdateAlertStatus(alert.id, 'ACKNOWLEDGED')}
                          className="cursor-pointer px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:border-[#FF7A00] text-[10px] font-sora font-semibold text-[#0B0F14] transition disabled:opacity-50"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.status !== 'RESOLVED' && (
                        <button
                          type="button"
                          disabled={updatingAlertId === alert.id}
                          onClick={() => onUpdateAlertStatus(alert.id, 'RESOLVED')}
                          className="cursor-pointer px-2.5 py-1 rounded-lg bg-[#0B0F14] hover:bg-[#1E2532] text-[10px] font-sora font-semibold text-white transition disabled:opacity-50"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
