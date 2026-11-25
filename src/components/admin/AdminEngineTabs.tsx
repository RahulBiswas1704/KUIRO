'use client';

import React from 'react';
import {
  Check,
  CheckCircle2,
  KeyRound,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sliders,
  Trash2,
  XCircle,
} from 'lucide-react';
import type {
  AdminAuditLog,
  AdminCalendarEvent,
  AdminOptimizerConfig,
  OptimizerEnvironmentKeys,
} from './types';
import { formatShortDate } from './types';

interface AdminCalendarTabProps {
  events: AdminCalendarEvent[];
  isRunningSweep: boolean;
  onOpenNewModal: () => void;
  onTriggerSweep: () => void;
  onDeleteEvent: (id: string) => void;
}

export function AdminCalendarTab({
  events,
  isRunningSweep,
  onOpenNewModal,
  onTriggerSweep,
  onDeleteEvent,
}: AdminCalendarTabProps) {
  return (
    <section className="rounded-[24px] bg-white border border-gray-200/90 shadow-[0_14px_34px_-22px_rgba(11,15,20,0.14)] p-5 sm:p-7 space-y-5 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h2 className="font-sora text-base sm:text-lg font-extrabold text-[#0B0F14]">
            Indian Cultural 365 Calendar Engine
          </h2>
          <p className="text-xs text-[#4B5563] font-inter mt-0.5">
            National, regional, and industry milestones that trigger localized autonomous campaigns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isRunningSweep}
            onClick={onTriggerSweep}
            className="cursor-pointer py-2.5 px-4 rounded-full bg-[#0B0F14] hover:bg-[#1E2532] text-white text-xs font-sora font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {isRunningSweep ? (
              <RefreshCw size={13} className="animate-spin text-[#FF7A00]" />
            ) : (
              <Play size={13} className="text-[#FF7A00]" />
            )}
            <span>{isRunningSweep ? 'Running Sweep...' : 'Run Radar Sweep'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewModal}
            className="cursor-pointer py-2.5 px-4 rounded-full bg-[#FF7A00] hover:bg-[#E06C00] text-white text-xs font-sora font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={14} />
            <span>Add Cultural Holiday</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-[10px] font-mono uppercase tracking-wider">
              <th className="py-3 pr-3 font-semibold">Festival / Milestone</th>
              <th className="py-3 pr-3 font-semibold">Date &amp; Window</th>
              <th className="py-3 pr-3 font-semibold">Regions</th>
              <th className="py-3 pr-3 font-semibold">Industries</th>
              <th className="py-3 pr-3 font-semibold">Prompt Context</th>
              <th className="py-3 text-right font-semibold">Remove</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 font-mono">
                  No cultural calendar events loaded.
                </td>
              </tr>
            ) : (
              events.map((evt) => (
                <tr key={evt.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3.5 pr-3 font-sora font-bold text-[#0B0F14]">
                    {evt.eventName}
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-[11px]">
                    <span className="text-emerald-700 font-semibold block">{evt.eventDate}</span>
                    {evt.isTriggerWindow && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-[#FFF3E6] text-[#C85600] text-[10px] font-bold">
                        48h Trigger Active
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 pr-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#FAF8F5] border border-[#E7DED3] text-[#374151]">
                      {Array.isArray(evt.regions) ? evt.regions.join(', ') : evt.regions || 'Pan-India'}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 text-[#4B5563] font-mono text-[11px]">
                    {Array.isArray(evt.targetIndustries)
                      ? evt.targetIndustries.join(', ')
                      : evt.targetIndustries || 'All'}
                  </td>
                  <td className="py-3.5 pr-3 text-[#374151] text-[11px] max-w-xs truncate">
                    {evt.promptContext || '—'}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteEvent(evt.id)}
                      title="Remove event"
                      className="cursor-pointer p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-rose-50 text-gray-500 hover:text-rose-600 border border-[#E7DED3] hover:border-rose-200 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface AdminOptimizerTabProps {
  config: AdminOptimizerConfig;
  envKeys: OptimizerEnvironmentKeys | null;
  isSaving: boolean;
  onChange: (next: AdminOptimizerConfig) => void;
  onSave: (e: React.FormEvent) => void;
}

export function AdminOptimizerTab({
  config,
  envKeys,
  isSaving,
  onChange,
  onSave,
}: AdminOptimizerTabProps) {
  const envItems = envKeys
    ? [
        { label: 'Neon Database URL', ok: envKeys.hasDatabaseUrl },
        { label: 'Gemini AI API Key', ok: envKeys.hasGeminiKey },
        { label: 'Inngest Event Key', ok: envKeys.hasInngestKey },
        { label: 'WhatsApp Cloud Token', ok: envKeys.hasWhatsAppToken },
        { label: 'Object Storage S3/R2', ok: envKeys.hasObjectStorage },
        { label: 'Resend Email Key', ok: envKeys.hasResendKey },
      ]
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in text-left">
      <section className="lg:col-span-8 rounded-[24px] bg-white border border-gray-200/90 shadow-[0_14px_34px_-22px_rgba(11,15,20,0.14)] p-5 sm:p-7 space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="font-sora text-base sm:text-lg font-extrabold text-[#0B0F14] flex items-center gap-2">
            <Sliders size={17} className="text-[#FF7A00]" />
            <span>Autonomous Engine Weights &amp; Model Routing</span>
          </h2>
          <p className="text-xs text-[#4B5563] font-inter mt-0.5">
            Adjust active runtime Gemini temperature, 6D AI Critic thresholds, and 48-hour auto-commit parameters.
          </p>
        </div>

        <form onSubmit={onSave} className="space-y-6 font-inter text-xs">
          {/* 48h Countdown & Revisions */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-sora font-bold text-[#0B0F14]">
                  Passive Auto-Commit Window (Hours)
                </label>
                <span className="font-mono text-[#FF7A00] font-bold">
                  {config.autonomousEngine.autoCommitWindowHours} Hours
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="72"
                step="6"
                value={config.autonomousEngine.autoCommitWindowHours}
                onChange={(e) =>
                  onChange({
                    ...config,
                    autonomousEngine: {
                      ...config.autonomousEngine,
                      autoCommitWindowHours: parseInt(e.target.value, 10),
                    },
                  })
                }
                className="w-full accent-[#FF7A00]"
              />
              <p className="text-[11px] text-[#4B5563]">
                Window between draft WhatsApp preview delivery and autonomous publication.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EFE7DE]">
              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Max Free Revisions per Campaign
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={config.autonomousEngine.maxFreeRevisions}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      autonomousEngine: {
                        ...config.autonomousEngine,
                        maxFreeRevisions: parseInt(e.target.value, 10) || 2,
                      },
                    })
                  }
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-[#E7DED3] text-[#0B0F14] font-mono focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Gemini Temperature ({config.modelRouting.temperature})
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.2"
                  step="0.1"
                  value={config.modelRouting.temperature}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      modelRouting: {
                        ...config.modelRouting,
                        temperature: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full mt-2.5 accent-[#FF7A00]"
                />
              </div>
            </div>
          </div>

          {/* AI Critic Quality & Rubrics */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-sora font-bold text-[#0B0F14]">
                  AI Critic Minimum Pass Score (%)
                </label>
                <span className="font-mono text-emerald-700 font-bold">
                  {config.aiCritic.minimumPassScore}%
                </span>
              </div>
              <input
                type="range"
                min="75"
                max="99"
                step="1"
                value={config.aiCritic.minimumPassScore}
                onChange={(e) =>
                  onChange({
                    ...config,
                    aiCritic: {
                      ...config.aiCritic,
                      minimumPassScore: parseInt(e.target.value, 10),
                    },
                  })
                }
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'hookWeight', label: 'Hook Weight' },
                { key: 'brandAlignmentWeight', label: 'Brand Align' },
                { key: 'ctaWeight', label: 'CTA Weight' },
                { key: 'complianceWeight', label: 'Compliance' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={config.aiCritic[field.key as keyof AdminOptimizerConfig['aiCritic']] as number}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        aiCritic: {
                          ...config.aiCritic,
                          [field.key]: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    className="w-full py-2 px-3 rounded-xl bg-white border border-[#E7DED3] text-[#0B0F14] font-mono focus:outline-none focus:border-[#FF7A00]"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#EFE7DE]">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-[#374151]">
                <input
                  type="checkbox"
                  checked={config.aiCritic.strictNegativeConstraints}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      aiCritic: {
                        ...config.aiCritic,
                        strictNegativeConstraints: e.target.checked,
                      },
                    })
                  }
                  className="accent-[#FF7A00] rounded"
                />
                <span>Enforce strict negative brand &amp; regulatory guardrails</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-[#374151]">
                <input
                  type="checkbox"
                  checked={config.unitEconomics.enforceXLinkInReply}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      unitEconomics: {
                        ...config.unitEconomics,
                        enforceXLinkInReply: e.target.checked,
                      },
                    })
                  }
                  className="accent-[#FF7A00] rounded"
                />
                <span>Place X external links in reply thread</span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-[11px] font-mono text-gray-500">
              Updates take effect immediately for this server runtime instance.
            </span>
            <button
              type="submit"
              disabled={isSaving}
              className="cursor-pointer py-2.5 px-5 rounded-full bg-[#FF7A00] hover:bg-[#E06C00] text-white text-xs font-sora font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              <span>Save Engine Configuration</span>
            </button>
          </div>
        </form>
      </section>

      {/* Right Rail: Server Environment Keys Checklist */}
      <aside className="lg:col-span-4 rounded-[24px] bg-white border border-gray-200/90 shadow-[0_14px_34px_-22px_rgba(11,15,20,0.14)] p-5 sm:p-6 space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="font-sora text-sm font-extrabold text-[#0B0F14] flex items-center gap-2">
            <KeyRound size={15} className="text-[#FF7A00]" />
            <span>Environment Key Readiness</span>
          </h3>
          <p className="text-[11px] text-[#4B5563] font-inter mt-0.5">
            Runtime credential presence reported by server process.
          </p>
        </div>

        <div className="space-y-2.5">
          {envItems.length === 0 ? (
            <p className="text-xs font-mono text-gray-500">Loading environment checks...</p>
          ) : (
            envItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE7DE] text-xs"
              >
                <span className="font-inter font-medium text-[#374151]">{item.label}</span>
                {item.ok ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700">
                    <CheckCircle2 size={13} />
                    <span>SET</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-600">
                    <XCircle size={13} />
                    <span>MISSING</span>
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}

interface AdminAuditTabProps {
  logs: AdminAuditLog[];
  statusFilter: string;
  searchQuery: string;
  onStatusFilterChange: (status: string) => void;
  onSearchChange: (q: string) => void;
}

export function AdminAuditTab({
  logs,
  statusFilter,
  searchQuery,
  onStatusFilterChange,
  onSearchChange,
}: AdminAuditTabProps) {
  const filteredLogs = logs.filter((log) => {
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    if (!matchesStatus) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.operatorEmail || '').toLowerCase().includes(q) ||
      (log.action || '').toLowerCase().includes(q) ||
      (log.resource || '').toLowerCase().includes(q) ||
      (log.ipAddress || '').toLowerCase().includes(q)
    );
  });

  return (
    <section className="rounded-[24px] bg-white border border-gray-200/90 shadow-[0_14px_34px_-22px_rgba(11,15,20,0.14)] p-5 sm:p-7 space-y-5 animate-fade-in text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h2 className="font-sora text-base sm:text-lg font-extrabold text-[#0B0F14] flex items-center gap-2">
            <ShieldCheck size={17} className="text-rose-600" />
            <span>Operator Security Audit Ledger</span>
          </h2>
          <p className="text-xs text-[#4B5563] font-inter mt-0.5">
            Security log of Level 5 operator logins, mutations, and API telemetry checks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search action or IP..."
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E7DED3] text-xs text-[#0B0F14] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#FF7A00]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono">
            {['ALL', 'SUCCESS', 'FAILURE', 'BLOCKED', 'RATE_LIMITED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onStatusFilterChange(st)}
                className={`cursor-pointer px-2.5 py-1.5 rounded-full border transition ${
                  statusFilter === st
                    ? 'bg-[#0B0F14] border-[#0B0F14] text-white font-bold'
                    : 'bg-[#FAF8F5] border-[#EFE7DE] text-[#4B5563] hover:text-[#0B0F14]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-[10px] uppercase tracking-wider">
              <th className="py-3 pr-3 font-semibold">Operator</th>
              <th className="py-3 pr-3 font-semibold">Action</th>
              <th className="py-3 pr-3 font-semibold">Status</th>
              <th className="py-3 pr-3 font-semibold">IP Address</th>
              <th className="py-3 font-semibold">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No audit events match your filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3 pr-3 font-semibold text-[#0B0F14]">{log.operatorEmail}</td>
                  <td className="py-3 pr-3 text-[#374151]">
                    <span className="block">{log.action}</span>
                    {log.resource && (
                      <span className="text-[10px] text-gray-500">{log.resource}</span>
                    )}
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : log.status === 'FAILURE' || log.status === 'BLOCKED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-[#4B5563] text-[11px]">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td className="py-3 text-gray-500 text-[11px]">
                    {formatShortDate(log.createdAt, true)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
