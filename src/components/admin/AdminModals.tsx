'use client';

import React, { useState } from 'react';
import { Check, Pause, Trash2, X } from 'lucide-react';
import type { AdminCampaign, AdminWorkspace } from './types';
import { formatShortDate } from './types';

function ModalFrame({
  title,
  maxWidth = 'max-w-md',
  onClose,
  children,
}: {
  title: string;
  maxWidth?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F14]/55 backdrop-blur-md animate-fade-in">
      <div className={`${maxWidth} w-full p-px rounded-[28px] bg-gradient-to-b from-[#FF8E3C]/65 via-[#FF8E3C]/20 to-gray-200/80 shadow-[0_28px_70px_-20px_rgba(11,15,20,0.45)]`}>
        <div className="bg-white rounded-[27px] p-6 sm:p-7 space-y-5 text-[#0B0F14] max-h-[88vh] overflow-y-auto text-left">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
            <h3 className="font-sora text-base font-extrabold text-[#0B0F14]">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer p-1.5 rounded-full bg-[#FAF8F5] border border-[#EFE7DE] text-gray-500 hover:text-[#0B0F14] transition"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

interface NewWorkspaceModalProps {
  form: {
    name: string;
    ownerName: string;
    ownerEmail: string;
    subscriptionTier: string;
    whatsappAdminPhone: string;
    industry: string;
  };
  onChange: (form: NewWorkspaceModalProps['form']) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function NewWorkspaceModal({
  form,
  onChange,
  onSubmit,
  onClose,
}: NewWorkspaceModalProps) {
  return (
    <ModalFrame title="Provision Client Workspace" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-3.5 font-inter text-xs">
        <div>
          <label className="block text-[#374151] font-semibold mb-1">Business / Brand Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            placeholder="e.g. Royal Silk Boutique"
            className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7DED3] text-[#0B0F14] focus:outline-none focus:bg-white focus:border-[#FF7A00]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[#374151] font-semibold mb-1">Owner Full Name</label>
            <input
              type="text"
              required
              value={form.ownerName}
              onChange={(e) => onChange({ ...form, ownerName: e.target.value })}
              placeholder="e.g. Vikram Mehra"
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7DED3] text-[#0B0F14] focus:outline-none focus:bg-white focus:border-[#FF7A00]"
            />
          </div>
          <div>
            <label className="block text-[#374151] font-semibold mb-1">Subscription Tier</label>
            <select
              value={form.subscriptionTier}
              onChange={(e) => onChange({ ...form, subscriptionTier: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-[#E7DED3] text-[#0B0F14] focus:outline-none focus:bg-white focus:border-[#FF7A00]"
            >
              <option value="STARTER">STARTER (1 Brand)</option>
              <option value="GROWTH">GROWTH (Full 48h Loop)</option>
              <option value="AGENCY">AGENCY (Multi-Brand Hub)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[#374151] font-semibold mb-1">Owner Email</label>
          <input
            type="email"
            required
            value={form.ownerEmail}
            onChange={(e) => onChange({ ...form, ownerEmail: e.target.value })}
            placeholder="vikram@royalsilk.in"
            className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7DED3] text-[#0B0F14] focus:outline-none focus:bg-white focus:border-[#FF7A00]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[#374151] font-semibold mb-1">WhatsApp Admin Phone</label>
            <input
              type="text"
              value={form.whatsappAdminPhone}
              onChange={(e) => onChange({ ...form, whatsappAdminPhone: e.target.value })}
              placeholder="+919876543210"
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7DED3] text-[#0B0F14] font-mono focus:outline-none focus:bg-white focus:border-[#FF7A00]"
            />
          </div>
          <div>
            <label className="block text-[#374151] font-semibold mb-1">Industry Vertical</label>
            <input
              type="text"
              value={form.industry}
              onChange={(e) => onChange({ ...form, industry: e.target.value })}
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7DED3] text-[#0B0F14] focus:outline-none focus:bg-white focus:border-[#FF7A00]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-4 py-2 rounded-full border border-gray-200 text-xs font-sora font-semibold text-[#374151] hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cursor-pointer px-5 py-2 rounded-full bg-[#FF7A00] hover:bg-[#E06C00] text-white text-xs font-sora font-bold shadow-sm transition"
          >
            Provision Workspace
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}

interface InspectWorkspaceModalProps {
  workspace: AdminWorkspace;
  onUpdateWorkspace: (payload: {
    id: string;
    name: string;
    subscriptionTier: string;
    whatsappAdminPhone: string;
  }) => Promise<void>;
  onDeleteWorkspace: (id: string) => Promise<void>;
  onClose: () => void;
}

export function InspectWorkspaceModal({
  workspace,
  onUpdateWorkspace,
  onDeleteWorkspace,
  onClose,
}: InspectWorkspaceModalProps) {
  const [name, setName] = useState(workspace.name);
  const [tier, setTier] = useState(workspace.subscriptionTier);
  const [phone, setPhone] = useState(workspace.whatsappAdminPhone || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onUpdateWorkspace({
      id: workspace.id,
      name,
      subscriptionTier: tier,
      whatsappAdminPhone: phone,
    });
    setIsSaving(false);
  };

  return (
    <ModalFrame title={`Workspace: ${workspace.name}`} maxWidth="max-w-lg" onClose={onClose}>
      <div className="space-y-4 font-inter text-xs">
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-gray-500">ID: {workspace.id}</span>
            <span className="font-mono text-[11px] text-gray-500">
              {formatShortDate(workspace.createdAt)}
            </span>
          </div>
          <p className="font-sora font-bold text-[#0B0F14]">
            Owner: {workspace.ownerName} ({workspace.ownerEmail})
          </p>
          {workspace.brandProfile ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/15"
                style={{ backgroundColor: workspace.brandProfile.primaryHex }}
              />
              <span className="text-[11px] text-[#374151]">
                {workspace.brandProfile.industry} • {workspace.brandProfile.fontFamily} •{' '}
                {workspace.brandProfile.pillarsCount} Content Pillars
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-amber-700">Brand Brain profile not initialized yet.</p>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block font-semibold text-[#374151] mb-1">Workspace Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7DED3] text-[#0B0F14] focus:outline-none focus:bg-white focus:border-[#FF7A00]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#374151] mb-1">Subscription Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-[#E7DED3] text-[#0B0F14] focus:outline-none focus:bg-white focus:border-[#FF7A00]"
              >
                <option value="STARTER">STARTER</option>
                <option value="GROWTH">GROWTH</option>
                <option value="AGENCY">AGENCY</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                WhatsApp Admin Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7DED3] font-mono text-[#0B0F14] focus:outline-none focus:bg-white focus:border-[#FF7A00]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => onDeleteWorkspace(workspace.id)}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-sora font-semibold transition"
            >
              <Trash2 size={13} />
              <span>Delete Workspace</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer px-4 py-2 rounded-full border border-gray-200 text-xs font-sora font-semibold text-[#374151]"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="cursor-pointer px-5 py-2 rounded-full bg-[#FF7A00] hover:bg-[#E06C00] text-white text-xs font-sora font-bold transition disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </ModalFrame>
  );
}

interface InspectCampaignModalProps {
  campaign: AdminCampaign;
  onUpdateStatus: (id: string, status: 'APPROVED' | 'PAUSED') => Promise<void>;
  onDeleteCampaign: (id: string) => Promise<void>;
  onClose: () => void;
}

export function InspectCampaignModal({
  campaign,
  onUpdateStatus,
  onDeleteCampaign,
  onClose,
}: InspectCampaignModalProps) {
  return (
    <ModalFrame
      title={`Campaign Drafts: ${campaign.workspaceName}`}
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <div className="space-y-4 font-inter text-xs">
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sora font-bold text-sm text-[#0B0F14]">{campaign.topicSummary}</p>
            <p className="text-[11px] font-mono text-[#4B5563] mt-0.5">
              Status: {campaign.status} • Avg Critic: {campaign.avgCriticScore}/100 •{' '}
              {campaign.isExpired ? 'Publish time passed' : `T-${campaign.countdownFormatted}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onUpdateStatus(campaign.id, 'APPROVED')}
              className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-sora font-bold transition"
            >
              <Check size={12} />
              <span>Force Approve</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(campaign.id, 'PAUSED')}
              className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-sora font-bold transition"
            >
              <Pause size={12} />
              <span>Pause</span>
            </button>
            <button
              type="button"
              onClick={() => onDeleteCampaign(campaign.id)}
              className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-sora font-bold transition"
            >
              <Trash2 size={12} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {campaign.posts.length === 0 ? (
            <p className="p-6 text-center font-mono text-gray-500 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E7DED3]">
              No generated platform posts attached to this campaign yet.
            </p>
          ) : (
            campaign.posts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0B0F14] text-white text-[10px] font-mono font-bold uppercase">
                    {post.platform} • {post.aspectRatio}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-emerald-700">
                    Critic Score: {post.aiCriticScore}/100
                  </span>
                </div>
                {post.emailSubject && (
                  <p className="font-sora font-semibold text-[#0B0F14]">
                    Subject: {post.emailSubject}
                  </p>
                )}
                <p className="text-xs text-[#374151] whitespace-pre-wrap leading-relaxed">
                  {post.caption}
                </p>
                {post.firstComment && (
                  <p className="text-[11px] font-mono text-[#4B5563] bg-white px-3 py-2 rounded-xl border border-gray-200">
                    First Reply Link: {post.firstComment}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </ModalFrame>
  );
}

interface NewCalendarEventModalProps {
  form: {
    eventName: string;
    eventDate: string;
    regions: string;
    targetIndustries: string;
    promptContext: string;
  };
  onChange: (form: NewCalendarEventModalProps['form']) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function NewCalendarEventModal({
  form,
  onChange,
  onSubmit,
  onClose,
}: NewCalendarEventModalProps) {
  return (
    <ModalFrame title="Add Indian Cultural Holiday" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-3.5 font-inter text-xs">
        <div>
          <label className="block text-[#374151] font-semibold mb-1">Festival / Event Name</label>
          <input
            type="text"
            required
            value={form.eventName}
            onChange={(e) => onChange({ ...form, eventName: e.target.value })}
            placeholder="e.g. Navratri Dandiya Festive Kickoff"
            className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7DED3] text-[#0B0F14] focus:outline-none focus:bg-white focus:border-[#FF7A00]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[#374151] font-semibold mb-1">Event Date</label>
            <input
              type="date"
              required
              value={form.eventDate}
              onChange={(e) => onChange({ ...form, eventDate: e.target.value })}
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7DED3] text-[#0B0F14] font-mono focus:outline-none focus:bg-white focus:border-[#FF7A00]"
            />
          </div>
          <div>
            <label className="block text-[#374151] font-semibold mb-1">
              Target Regions (comma-separated)
            </label>
            <input
              type="text"
              value={form.regions}
              onChange={(e) => onChange({ ...form, regions: e.target.value })}
              placeholder="Pan-India or West Bengal, Gujarat"
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7DED3] text-[#0B0F14] focus:outline-none focus:bg-white focus:border-[#FF7A00]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#374151] font-semibold mb-1">
            Target Industries (comma-separated)
          </label>
          <input
            type="text"
            value={form.targetIndustries}
            onChange={(e) => onChange({ ...form, targetIndustries: e.target.value })}
            placeholder="All or Retail, Healthcare"
            className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7DED3] text-[#0B0F14] focus:outline-none focus:bg-white focus:border-[#FF7A00]"
          />
        </div>

        <div>
          <label className="block text-[#374151] font-semibold mb-1">
            AI Prompt Context &amp; Cultural Hooks
          </label>
          <textarea
            rows={3}
            required
            value={form.promptContext}
            onChange={(e) => onChange({ ...form, promptContext: e.target.value })}
            placeholder="e.g. Highlight traditional silk apparel, celebrate 9 nights of dance..."
            className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7DED3] text-[#0B0F14] focus:outline-none focus:bg-white focus:border-[#FF7A00]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-4 py-2 rounded-full border border-gray-200 text-xs font-sora font-semibold text-[#374151]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cursor-pointer px-5 py-2 rounded-full bg-[#FF7A00] hover:bg-[#E06C00] text-white text-xs font-sora font-bold shadow-sm transition"
          >
            Save Event
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}
