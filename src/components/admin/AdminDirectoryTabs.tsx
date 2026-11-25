'use client';

import React from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import type { AdminCampaign, AdminUser, AdminWorkspace } from './types';
import { formatShortDate } from './types';

interface AdminWorkspacesTabProps {
  workspaces: AdminWorkspace[];
  tierFilter: string;
  searchQuery: string;
  onTierFilterChange: (tier: string) => void;
  onSearchChange: (q: string) => void;
  onOpenNewModal: () => void;
  onInspectWorkspace: (ws: AdminWorkspace) => void;
}

export function AdminWorkspacesTab({
  workspaces,
  tierFilter,
  searchQuery,
  onTierFilterChange,
  onSearchChange,
  onOpenNewModal,
  onInspectWorkspace,
}: AdminWorkspacesTabProps) {
  return (
    <section className="rounded-[24px] bg-white border border-gray-200/90 shadow-[0_14px_34px_-22px_rgba(11,15,20,0.14)] p-5 sm:p-7 space-y-5 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h2 className="font-sora text-base sm:text-lg font-extrabold text-[#0B0F14]">
            Client Workspaces Directory
          </h2>
          <p className="text-xs text-[#4B5563] font-inter mt-0.5">
            Multi-tenant workspace isolation, subscription tiers, and WhatsApp admin routing.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewModal}
          className="cursor-pointer self-start sm:self-auto py-2.5 px-4 rounded-full bg-[#FF7A00] hover:bg-[#E06C00] text-white text-xs font-sora font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={14} />
          <span>Provision Workspace</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 font-mono">
          {['ALL', 'STARTER', 'GROWTH', 'AGENCY'].map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => onTierFilterChange(tier)}
              className={`cursor-pointer px-3 py-1.5 rounded-full border transition text-[11px] ${
                tierFilter === tier
                  ? 'bg-[#0B0F14] border-[#0B0F14] text-white font-bold'
                  : 'bg-[#FAF8F5] border-[#EFE7DE] text-[#4B5563] hover:text-[#0B0F14] hover:border-gray-300'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search workspace or owner..."
            className="w-full pl-9 pr-3.5 py-2 rounded-full bg-[#FAF8F5] border border-[#E7DED3] text-xs text-[#0B0F14] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#FF7A00] transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-[10px] font-mono uppercase tracking-wider">
              <th className="py-3 pr-3 font-semibold">Workspace</th>
              <th className="py-3 pr-3 font-semibold">Owner</th>
              <th className="py-3 pr-3 font-semibold">Tier</th>
              <th className="py-3 pr-3 font-semibold">WhatsApp Admin</th>
              <th className="py-3 pr-3 font-semibold">Created</th>
              <th className="py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {workspaces.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 font-mono">
                  No workspaces match this filter.
                </td>
              </tr>
            ) : (
              workspaces.map((ws) => (
                <tr key={ws.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: ws.brandProfile?.primaryHex || '#FF7A00' }}
                        title={ws.brandProfile?.industry || 'Brand Palette'}
                      />
                      <div>
                        <p className="font-sora font-bold text-[#0B0F14]">{ws.name}</p>
                        {ws.brandProfile?.industry && (
                          <p className="text-[11px] text-gray-500 font-inter truncate max-w-[200px]">
                            {ws.brandProfile.industry}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-[11px] text-[#374151]">
                    <span className="block font-semibold">{ws.ownerName || '—'}</span>
                    <span className="text-gray-500">{ws.ownerEmail}</span>
                  </td>
                  <td className="py-3.5 pr-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        ws.subscriptionTier === 'AGENCY'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : ws.subscriptionTier === 'GROWTH'
                          ? 'bg-[#FFF3E6] text-[#C85600] border-[#FFD3AC]'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}
                    >
                      {ws.subscriptionTier}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-emerald-700 text-[11px]">
                    {ws.whatsappAdminPhone || 'Not configured'}
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-gray-500 text-[11px]">
                    {formatShortDate(ws.createdAt)}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onInspectWorkspace(ws)}
                      className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#0B0F14] text-[#0B0F14] hover:text-white border border-[#E7DED3] hover:border-[#0B0F14] text-[11px] font-sora font-semibold transition"
                    >
                      Inspect
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

interface AdminUsersTabProps {
  users: AdminUser[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleEmailVerified: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
}

export function AdminUsersTab({
  users,
  searchQuery,
  onSearchChange,
  onToggleEmailVerified,
  onDeleteUser,
}: AdminUsersTabProps) {
  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.email || '').toLowerCase().includes(q) ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  });

  return (
    <section className="rounded-[24px] bg-white border border-gray-200/90 shadow-[0_14px_34px_-22px_rgba(11,15,20,0.14)] p-5 sm:p-7 space-y-5 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h2 className="font-sora text-base sm:text-lg font-extrabold text-[#0B0F14]">
            Registered User Directory
          </h2>
          <p className="text-xs text-[#4B5563] font-inter mt-0.5">
            Founders, workspace admins, verification status, and active session counts.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by email, name, or role..."
            className="w-full pl-9 pr-3.5 py-2 rounded-full bg-[#FAF8F5] border border-[#E7DED3] text-xs text-[#0B0F14] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#FF7A00] transition"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-[10px] font-mono uppercase tracking-wider">
              <th className="py-3 pr-3 font-semibold">User</th>
              <th className="py-3 pr-3 font-semibold">Email</th>
              <th className="py-3 pr-3 font-semibold">Role</th>
              <th className="py-3 pr-3 font-semibold">Workspaces &amp; Sessions</th>
              <th className="py-3 pr-3 font-semibold">Verification</th>
              <th className="py-3 pr-3 font-semibold">Joined</th>
              <th className="py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500 font-mono">
                  No matching users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-2.5 font-sora font-bold text-[#0B0F14]">
                      <div className="w-7 h-7 rounded-full bg-[#0B0F14] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {u.name?.slice(0, 2).toUpperCase() || u.email.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{u.name || 'Unnamed User'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-[#374151] text-[11px]">{u.email}</td>
                  <td className="py-3.5 pr-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-[#FAF8F5] border border-[#E7DED3] text-[#374151]">
                      {u.role || 'Founder'}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-[11px] text-[#4B5563]">
                    <span>{u.workspacesCount ?? 0} ws</span>
                    <span className="mx-1.5 text-gray-300">•</span>
                    <span>{u.activeSessionsCount ?? 0} sessions</span>
                  </td>
                  <td className="py-3.5 pr-3">
                    <button
                      type="button"
                      onClick={() => onToggleEmailVerified(u)}
                      title="Click to toggle verification state"
                      className={`cursor-pointer px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border transition ${
                        u.emailVerified
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {u.emailVerified ? 'Verified' : 'Pending OTP'}
                    </button>
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-gray-500 text-[11px]">
                    {formatShortDate(u.createdAt)}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteUser(u)}
                      title="Delete user and sessions"
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

interface AdminCampaignsTabProps {
  campaigns: AdminCampaign[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onInspectCampaign: (camp: AdminCampaign) => void;
}

const CAMPAIGN_STATUS_FILTERS = [
  'ALL',
  'AUTO_QUEUED',
  'REVIEW_PENDING',
  'APPROVED',
  'PUBLISHED',
  'PAUSED',
];

function getCampaignStatusBadge(status: string): string {
  switch (status) {
    case 'APPROVED':
    case 'PUBLISHED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'AUTO_QUEUED':
    case 'REVIEW_PENDING':
    case 'REVISION_REQUESTED':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'PAUSED':
    case 'FAILED':
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-sky-50 text-sky-700 border-sky-200';
  }
}

export function AdminCampaignsTab({
  campaigns,
  statusFilter,
  onStatusFilterChange,
  onInspectCampaign,
}: AdminCampaignsTabProps) {
  return (
    <section className="rounded-[24px] bg-white border border-gray-200/90 shadow-[0_14px_34px_-22px_rgba(11,15,20,0.14)] p-5 sm:p-7 space-y-5 animate-fade-in text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h2 className="font-sora text-base sm:text-lg font-extrabold text-[#0B0F14]">
            Global 48-Hour Campaign Radar
          </h2>
          <p className="text-xs text-[#4B5563] font-inter mt-0.5">
            Monitor autonomous queues, inspect platform-native drafts, and override publishing state.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          {CAMPAIGN_STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusFilterChange(status)}
              className={`cursor-pointer px-3 py-1.5 rounded-full border transition ${
                statusFilter === status
                  ? 'bg-[#0B0F14] border-[#0B0F14] text-white font-bold'
                  : 'bg-[#FAF8F5] border-[#EFE7DE] text-[#4B5563] hover:text-[#0B0F14] hover:border-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-[10px] font-mono uppercase tracking-wider">
              <th className="py-3 pr-3 font-semibold">Topic Summary</th>
              <th className="py-3 pr-3 font-semibold">Workspace</th>
              <th className="py-3 pr-3 font-semibold">Critic</th>
              <th className="py-3 pr-3 font-semibold">Status</th>
              <th className="py-3 pr-3 font-semibold">Scheduled Publish</th>
              <th className="py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 font-mono">
                  No campaigns found for status {statusFilter}.
                </td>
              </tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3.5 pr-3 font-sora font-bold text-[#0B0F14] max-w-xs truncate">
                    {c.topicSummary}
                  </td>
                  <td className="py-3.5 pr-3 text-[#374151] font-inter text-xs">
                    {c.workspaceName || `${c.workspaceId?.slice(0, 8)}...`}
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-[11px] font-semibold text-[#0B0F14]">
                    {c.avgCriticScore}/100 ({c.postsCount} posts)
                  </td>
                  <td className="py-3.5 pr-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getCampaignStatusBadge(
                        c.status
                      )}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-[#374151] text-[11px]">
                    <span className="block">{formatShortDate(c.publishAt, true)}</span>
                    <span className="text-[10px] text-gray-500">
                      {c.isExpired ? 'Window elapsed' : `T-${c.countdownFormatted}`}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onInspectCampaign(c)}
                      className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#0B0F14] text-[#0B0F14] hover:text-white border border-[#E7DED3] hover:border-[#0B0F14] text-[11px] font-sora font-semibold transition"
                    >
                      Inspect Posts
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
