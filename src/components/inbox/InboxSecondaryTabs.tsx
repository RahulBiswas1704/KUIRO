'use client';

import React from 'react';
import {
  Bot,
  Clock,
  Filter,
  Loader2,
  MessageSquare,
  Plus,
  ShieldCheck,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import type {
  AutomationFlowRule,
  Conversation,
  ConversationChannel,
  TeamMember,
} from '@/types';

export interface NewRuleFormState {
  name: string;
  triggerType: AutomationFlowRule['triggerType'];
  channel: ConversationChannel | 'all';
  matchMode: 'contains' | 'exact';
  keywordsText: string;
  autoReplyText: string;
  applyTagText: string;
}

export function InboxAutomationsTab({
  rules,
  onOpenNewRuleModal,
  onToggleRule,
  onDeleteRule,
}: {
  rules: AutomationFlowRule[];
  onOpenNewRuleModal: () => void;
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[14px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Autopilot Engine Active
            </span>
            <span className="text-xs text-gray-500">
              {rules.filter((r) => r.enabled).length} of {rules.length} Active Flow Rules
            </span>
          </div>
          <h2 className="font-sora text-lg md:text-xl font-bold text-[#0B0F14] mt-1">
            Automation, Keyword Flows &amp; Smart Routing
          </h2>
          <p className="text-xs text-gray-500 max-w-2xl mt-0.5">
            Automatically qualify leads, reply during off-hours, route high-value inquiries to specialists, and trigger WhatsApp utility templates without human delay.
          </p>
        </div>

        <button
          onClick={onOpenNewRuleModal}
          className="px-4 py-2.5 rounded-[10px] bg-[#FF7A00] text-white text-xs font-semibold hover:bg-[#E66E00] transition flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
        >
          <Plus size={15} />
          <span>Create New Routing Flow</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white rounded-[14px] border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4 hover:border-gray-300 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-bold uppercase">
                    {rule.triggerType}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {rule.triggerCount} Executions
                  </span>
                  {rule.persistedInDb && (
                    <span className="text-[10px] font-mono text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-semibold">
                      Live Neon DB
                    </span>
                  )}
                </div>
                <h3 className="font-sora text-sm font-bold text-[#0B0F14] mt-1.5">
                  {rule.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{rule.description}</p>
              </div>

              {/* Toggle Switch & Delete for DB Rules */}
              <div className="flex items-center gap-2 shrink-0">
                {rule.persistedInDb && (
                  <button
                    type="button"
                    onClick={() => onDeleteRule(rule.id)}
                    title="Delete custom rule"
                    className="p-1.5 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button
                  onClick={() => onToggleRule(rule.id)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    rule.enabled ? 'bg-[#FF7A00]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      rule.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Conditions & Trigger Criteria */}
            <div className="p-3 rounded-[10px] bg-gray-50 border border-gray-100 space-y-1.5 text-xs">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-700">
                <Filter size={13} className="text-[#FF7A00]" />
                <span>Trigger Condition:</span>
              </div>
              <p className="text-gray-600 text-[11px] font-mono">{rule.conditions}</p>

              {rule.keywords && (
                <div className="flex items-center gap-1 pt-1 flex-wrap">
                  <span className="text-[10px] text-gray-400 font-mono">Matched keywords:</span>
                  {rule.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-1.5 py-0.2 rounded bg-white text-gray-700 border border-gray-200 font-mono"
                    >
                      &quot;{kw}&quot;
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Performed */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                Automated Actions ({rule.actions.length}):
              </span>
              <div className="space-y-1.5">
                {rule.actions.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-[8px] bg-emerald-50/60 border border-emerald-200/50 flex items-start gap-2 text-[11px] text-emerald-950"
                  >
                    <Zap size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-mono text-[10px] uppercase">{act.type}: </strong>
                      <span>{act.payload}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InboxContactsTab({
  conversations,
  onExportCsv,
  onOpenChat,
}: {
  conversations: Conversation[];
  onExportCsv: () => void;
  onOpenChat: (convId: string) => void;
}) {
  return (
    <div className="bg-white rounded-[14px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="p-5 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="font-sora text-base font-bold text-[#0B0F14]">
            Customer Contacts &amp; Omni-Channel Reachability
          </h2>
          <p className="text-xs text-gray-500">
            Directory of verified clients, retail buyers, and leads across WhatsApp, Instagram, Messenger, and Email.
          </p>
        </div>

        <button
          onClick={onExportCsv}
          className="px-3.5 py-2 rounded-[8px] bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 transition"
        >
          Export Contacts (CSV)
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-none">
        <table className="w-full text-xs text-left">
          <thead className="bg-gray-50 text-[10px] font-mono uppercase text-gray-500 border-b border-gray-200">
            <tr>
              <th className="p-3.5 font-bold">Contact Name</th>
              <th className="p-3.5 font-bold">Primary Channel</th>
              <th className="p-3.5 font-bold">Phone / Handle</th>
              <th className="p-3.5 font-bold">Category</th>
              <th className="p-3.5 font-bold">Lifetime Value</th>
              <th className="p-3.5 font-bold">Attributed Campaign</th>
              <th className="p-3.5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-inter">
            {conversations.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition">
                <td className="p-3.5 font-medium text-gray-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-900 text-white font-bold text-[10px] flex items-center justify-center font-sora">
                    {c.customerName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <span>{c.customerName}</span>
                </td>
                <td className="p-3.5">
                  <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gray-100 text-gray-700">
                    {c.channel}
                  </span>
                </td>
                <td className="p-3.5 font-mono text-gray-600">{c.customerHandle}</td>
                <td className="p-3.5">{c.crmData.patientOrClientType}</td>
                <td className="p-3.5 font-mono font-bold text-emerald-700">
                  {c.crmData.totalSpend}
                </td>
                <td className="p-3.5 text-gray-500">
                  {c.campaignAttribution?.campaignName || 'Organic Walk-In'}
                </td>
                <td className="p-3.5 text-right">
                  <button
                    onClick={() => onOpenChat(c.id)}
                    className="px-2.5 py-1 rounded bg-[#FF7A00]/15 text-[#FF7A00] font-semibold text-[11px] hover:bg-[#FF7A00] hover:text-white transition"
                  >
                    Open Chat →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function InboxAnalyticsTab({ teamMembers }: { teamMembers: TeamMember[] }) {
  return (
    <div className="space-y-6">
      {/* Top 4 Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-medium uppercase font-mono">First Response Time (FRT)</span>
            <Clock size={16} className="text-[#FF7A00]" />
          </div>
          <div className="text-2xl font-bold text-[#0B0F14] font-inter">1m 42s</div>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp size={12} />
            <span>92% faster with KUIRO AI Co-Pilot</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-medium uppercase font-mono">Total Volume (Monthly)</span>
            <MessageSquare size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-[#0B0F14] font-inter">1,284 Chats</div>
          <p className="text-[11px] text-gray-500 mt-1">
            WhatsApp: 54% • Instagram: 28% • Email: 18%
          </p>
        </div>

        <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-medium uppercase font-mono">AI Autonomous Deflection</span>
            <Bot size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-[#0B0F14] font-inter">68.4%</div>
          <p className="text-[11px] text-gray-500 mt-1">
            Resolved without touching human agent
          </p>
        </div>

        <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-medium uppercase font-mono">Customer CSAT</span>
            <ShieldCheck size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-[#0B0F14] font-inter">4.9 / 5.0 ⭐</div>
          <p className="text-[11px] text-gray-500 mt-1">
            Based on 312 post-inquiry ratings
          </p>
        </div>
      </div>

      {/* Team Workload & Channel Distribution Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Team Leaderboard */}
        <div className="lg:col-span-7 bg-white p-5 rounded-[14px] border border-[#E5E7EB] space-y-4">
          <h3 className="font-sora text-sm font-bold text-[#0B0F14] flex items-center justify-between">
            <span>Team Workload &amp; Assignment Matrix</span>
            <span className="text-xs text-gray-500 font-mono font-normal">Active Today</span>
          </h3>

          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-[10px] bg-gray-50 border border-gray-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0B0F14] text-white font-bold text-xs flex items-center justify-center font-sora">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{member.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-gray-200 text-gray-700 capitalize">
                        {member.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">{member.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-sm font-bold text-gray-900 font-mono block">
                      {member.activeChatsCount}
                    </span>
                    <span className="text-[10px] text-gray-400">Active Chats</span>
                  </div>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      member.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'
                    }`}
                    title={member.isOnline ? 'Online' : 'Offline'}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Inbound Conversion Attribution */}
        <div className="lg:col-span-5 bg-white p-5 rounded-[14px] border border-[#E5E7EB] space-y-4">
          <h3 className="font-sora text-sm font-bold text-[#0B0F14]">
            Inbound Inquiries by Broadcast Campaign
          </h3>

          <div className="space-y-2.5 text-xs font-inter">
            <div className="p-3 rounded-[10px] bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-between font-semibold text-gray-800">
                <span>Diwali Festive Prosperity Broadcast</span>
                <span className="font-mono text-[#FF7A00]">44 Inquiries</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#FF7A00] rounded-full" style={{ width: '68%' }} />
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">Conversion: 18 Studio Visits Booked</span>
            </div>

            <div className="p-3 rounded-[10px] bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-between font-semibold text-gray-800">
                <span>Instagram Reel: Scalable Artisan Weaves</span>
                <span className="font-mono text-pink-600">22 Inquiries</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-pink-500 rounded-full" style={{ width: '42%' }} />
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">Conversion: 7 Direct Wholesale Orders</span>
            </div>

            <div className="p-3 rounded-[10px] bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-between font-semibold text-gray-800">
                <span>Corporate Festive Gifting Newsletter</span>
                <span className="font-mono text-amber-600">12 Inquiries</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '28%' }} />
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">Conversion: 3 Group Corporate Deals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InboxRuleModal({
  isOpen,
  form,
  isSaving,
  onChange,
  onSubmit,
  onClose,
}: {
  isOpen: boolean;
  form: NewRuleFormState;
  isSaving: boolean;
  onChange: React.Dispatch<React.SetStateAction<NewRuleFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-inter">
      <div className="bg-white rounded-[16px] max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-orange-100 text-[#FF7A00] flex items-center justify-center">
              <Zap size={16} />
            </div>
            <div>
              <h3 className="font-sora text-sm font-bold text-[#0B0F14]">
                Create Live Inbox Automation Rule
              </h3>
              <p className="text-[11px] text-gray-500">
                Saved directly to Neon PostgreSQL &amp; evaluated on incoming WhatsApp messages
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Rule Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => onChange((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Bridal & Silk Catalog Auto-Responder"
              className="w-full px-3 py-2 rounded-[8px] border border-gray-300 text-[#0B0F14] focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Trigger Type
              </label>
              <select
                value={form.triggerType}
                onChange={(e) =>
                  onChange((f) => ({
                    ...f,
                    triggerType: e.target.value as AutomationFlowRule['triggerType'],
                  }))
                }
                className="w-full px-3 py-2 rounded-[8px] border border-gray-300 bg-white text-[#0B0F14] focus:outline-none focus:border-[#FF7A00]"
              >
                <option value="KEYWORD">Keyword Match</option>
                <option value="OFF_HOURS">After Hours</option>
                <option value="NEW_CONVERSATION">First-Time Contact</option>
                <option value="CAMPAIGN_REPLY">Campaign Broadcast Reply</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Target Channel
              </label>
              <select
                value={form.channel}
                onChange={(e) =>
                  onChange((f) => ({
                    ...f,
                    channel: e.target.value as ConversationChannel | 'all',
                  }))
                }
                className="w-full px-3 py-2 rounded-[8px] border border-gray-300 bg-white text-[#0B0F14] focus:outline-none focus:border-[#FF7A00]"
              >
                <option value="whatsapp">WhatsApp Cloud</option>
                <option value="all">All Channels</option>
                <option value="instagram">Instagram DM</option>
                <option value="messenger">Messenger</option>
                <option value="email">Email</option>
              </select>
            </div>
          </div>

          {form.triggerType === 'KEYWORD' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={form.keywordsText}
                  onChange={(e) => onChange((f) => ({ ...f, keywordsText: e.target.value }))}
                  placeholder="pricing, catalog, bridal, discount"
                  className="w-full px-3 py-2 rounded-[8px] border border-gray-300 text-[#0B0F14] focus:outline-none focus:border-[#FF7A00]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Match Mode
                </label>
                <select
                  value={form.matchMode}
                  onChange={(e) =>
                    onChange((f) => ({
                      ...f,
                      matchMode: e.target.value as 'contains' | 'exact',
                    }))
                  }
                  className="w-full px-3 py-2 rounded-[8px] border border-gray-300 bg-white text-[#0B0F14] focus:outline-none focus:border-[#FF7A00]"
                >
                  <option value="contains">Contains Phrase</option>
                  <option value="exact">Exact Match</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Automated WhatsApp / Channel Reply
            </label>
            <textarea
              required
              rows={3}
              value={form.autoReplyText}
              onChange={(e) => onChange((f) => ({ ...f, autoReplyText: e.target.value }))}
              placeholder="Namaste! Thank you for contacting us. Here is our latest festive catalog link..."
              className="w-full px-3 py-2 rounded-[8px] border border-gray-300 text-[#0B0F14] focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Auto-Apply CRM Tag (Optional)
            </label>
            <input
              type="text"
              value={form.applyTagText}
              onChange={(e) => onChange((f) => ({ ...f, applyTagText: e.target.value }))}
              placeholder="e.g. Catalog Lead"
              className="w-full px-3 py-2 rounded-[8px] border border-gray-300 text-[#0B0F14] focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[8px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-[8px] bg-[#FF7A00] hover:bg-[#E66E00] text-white font-sora font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving Rule...</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Save &amp; Activate Rule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
