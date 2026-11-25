'use client';

import React from 'react';
import {
  ArrowRight,
  Check,
  Download,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  Pause,
  Play,
  Smartphone,
  Sparkles,
  Twitter,
} from 'lucide-react';
import type { DashboardPlatformTab, ScheduledCampaign } from './types';

interface DashboardCampaignPreviewProps {
  activeCampaign: ScheduledCampaign | null;
  selectedPlatformTab: DashboardPlatformTab;
  timeLeft: { hours: number; minutes: number; seconds: number; isPassed: boolean };
  revisionPromptText: string;
  isSubmittingRevision: boolean;
  isUpdatingStatus: boolean;
  isExportingKit: boolean;
  onSelectPlatformTab: (tab: DashboardPlatformTab) => void;
  onRevisionPromptChange: (val: string) => void;
  onRequestRevision: (campaignId: string, prompt: string) => void;
  onApprove: (campaignId: string) => void;
  onPause: (campaignId: string) => void;
  onExportCreativeKit: (campaignId: string, topicName: string) => void;
}

export default function DashboardCampaignPreview({
  activeCampaign,
  selectedPlatformTab,
  timeLeft,
  revisionPromptText,
  isSubmittingRevision,
  isUpdatingStatus,
  isExportingKit,
  onSelectPlatformTab,
  onRevisionPromptChange,
  onRequestRevision,
  onApprove,
  onPause,
  onExportCreativeKit,
}: DashboardCampaignPreviewProps) {
  if (!activeCampaign) {
    return (
      <div className="p-12 text-center rounded-[28px] bg-[#0A0E18] border border-white/[0.08] space-y-3">
        <Sparkles size={32} className="text-[#FF7A00] mx-auto animate-pulse" />
        <h3 className="font-sora text-lg font-bold text-white">No active campaign selected</h3>
        <p className="text-xs text-slate-400">
          Select a campaign from the left queue to inspect multi-channel previews.
        </p>
      </div>
    );
  }

  const instagramPost = activeCampaign.posts?.find((p) => p.platform === 'instagram');
  const whatsappPost = activeCampaign.posts?.find((p) => p.platform === 'whatsapp');
  const linkedinPost = activeCampaign.posts?.find((p) => p.platform === 'linkedin');
  const xPost = activeCampaign.posts?.find((p) => p.platform === 'x');
  const emailPost = activeCampaign.posts?.find((p) => p.platform === 'email');

  return (
    <div className="rounded-[28px] bg-[#0A0E18] border border-white/[0.08] p-6 shadow-xl space-y-5">
      {/* Spotlight Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-[#FF7A00] font-bold uppercase tracking-wider">
              Target Campaign:
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ID: {activeCampaign.id.slice(0, 8)}...
            </span>
          </div>
          <h3 className="text-base font-sora font-bold text-white line-clamp-1">
            {activeCampaign.topicSummary}
          </h3>
        </div>

        {/* 48h Auto-Commit Countdown Timer Box */}
        <div className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-right">
          <span className="text-[9px] font-mono uppercase text-slate-400 block">
            Auto-Commit Clock
          </span>
          <span className="text-sm font-mono font-bold text-[#FF7A00]">
            {timeLeft.hours.toString().padStart(2, '0')}h :{' '}
            {timeLeft.minutes.toString().padStart(2, '0')}m :{' '}
            {timeLeft.seconds.toString().padStart(2, '0')}s
          </span>
        </div>
      </div>

      {/* Channel Selector Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-x-auto text-xs font-mono">
        <button
          type="button"
          onClick={() => onSelectPlatformTab('instagram')}
          className={`flex-1 min-w-[105px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            selectedPlatformTab === 'instagram'
              ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Instagram size={13} className="text-pink-400" />
          <span>Instagram</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPlatformTab('whatsapp')}
          className={`flex-1 min-w-[105px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            selectedPlatformTab === 'whatsapp'
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone size={13} className="text-emerald-400" />
          <span>WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPlatformTab('linkedin')}
          className={`flex-1 min-w-[105px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            selectedPlatformTab === 'linkedin'
              ? 'bg-blue-500/20 border border-blue-500/30 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Linkedin size={13} className="text-blue-400" />
          <span>LinkedIn</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPlatformTab('x')}
          className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            selectedPlatformTab === 'x'
              ? 'bg-white/10 border border-white/20 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Twitter size={13} className="text-slate-300" />
          <span>X / Tweet</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPlatformTab('email')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            selectedPlatformTab === 'email'
              ? 'bg-amber-500/20 border border-amber-500/30 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mail size={13} className="text-amber-400" />
          <span>Newsletter</span>
        </button>
      </div>

      {/* PLATFORM LIVE PREVIEWS */}
      <div className="rounded-2xl bg-[#070A11] border border-white/[0.08] p-4 sm:p-5 relative overflow-hidden">
        {/* 1. INSTAGRAM FEED PREVIEW */}
        {selectedPlatformTab === 'instagram' && (
          <div className="space-y-4 animate-fade-in max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF7A00] to-pink-500 p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-[#070A11] flex items-center justify-center text-[10px] font-bold text-white">
                    KB
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white">kuiro.brand</span>
                    <span className="w-3 h-3 rounded-full bg-blue-500 text-[8px] flex items-center justify-center text-white">
                      ✓
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Original Audio</span>
                </div>
              </div>
              <span className="text-slate-400 text-sm">•••</span>
            </div>

            <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-[#121829] via-[#0E1424] to-[#182136] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between p-6">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-black/60 text-white border border-white/10">
                  4:5 High-Res Grid
                </span>
                <span className="px-2 py-0.5 rounded bg-[#FF7A00]/20 text-[#FF7A00] font-bold border border-[#FF7A00]/30">
                  AI Critic: {instagramPost?.aiCriticScore || 98.4}%
                </span>
              </div>

              <div className="space-y-2 text-center my-auto">
                <div className="w-12 h-12 rounded-2xl bg-[#FF7A00]/20 text-[#FF7A00] flex items-center justify-center mx-auto mb-2 border border-[#FF7A00]/30 shadow-lg">
                  <Sparkles size={24} />
                </div>
                <h4 className="font-sora text-lg font-bold text-white drop-shadow">
                  {activeCampaign.topicSummary}
                </h4>
                <p className="text-xs text-slate-300 font-inter max-w-xs mx-auto drop-shadow">
                  Autonomous AI Production • Color Calibrated • Studio Approved
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>#MadeInIndia</span>
                <span>Auto-Tagged Brand Brain</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-inter">
              <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                <strong className="text-white mr-1.5 font-sora">kuiro.brand</strong>
                {instagramPost?.captionText ||
                  'Handcrafted perfection tailored for your festive season. Tap link in bio to reserve your priority order before midnight.'}
              </p>

              {instagramPost?.firstCommentText && (
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-slate-400">
                  <span className="text-[#FF7A00] font-bold mr-1.5">First Comment (Auto):</span>
                  <span>{instagramPost.firstCommentText}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. WHATSAPP 48H LOOP PREVIEW */}
        {selectedPlatformTab === 'whatsapp' && (
          <div className="space-y-4 animate-fade-in max-w-md mx-auto">
            <div className="p-3 rounded-xl bg-[#0F1C15] border border-emerald-500/25 flex items-center justify-between text-xs font-mono text-emerald-300">
              <div className="flex items-center gap-2">
                <Smartphone size={14} className="text-emerald-400" />
                <span>Verified WhatsApp Cloud API</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="rounded-2xl bg-[#121B22] border border-emerald-500/20 p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-white/[0.06] pb-2">
                <span className="text-emerald-400 font-bold">KUIRO Official VIP Updates</span>
                <span>10:42 AM</span>
              </div>

              <div className="text-xs font-inter text-slate-100 whitespace-pre-line leading-relaxed">
                {whatsappPost?.captionText ||
                  `✨ *Exclusive Announcement:*\n\nNamaste Founder! Your 48-hour priority window is now live.\n\nTake advantage of this limited-run collection before general public release.\n\nReply *YES* to claim, or click below:`}
              </div>

              <div className="pt-1">
                <div className="w-full py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-center text-xs font-mono text-emerald-400 font-bold cursor-pointer">
                  🔗 View Festive Catalog &amp; Order Now
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. LINKEDIN POST PREVIEW */}
        {selectedPlatformTab === 'linkedin' && (
          <div className="space-y-3 animate-fade-in max-w-lg mx-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#0077B5] flex items-center justify-center font-bold text-white text-xs">
                KB
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Rahul Biswas • Founder</h5>
                <p className="text-[10px] text-slate-400 font-mono">1st • Building KUIRO • 2h</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-inter text-slate-200 leading-relaxed whitespace-pre-line">
              {linkedinPost?.captionText ||
                `Most brands spend 15 hours a week coordinating designers, copywriters, and schedulers.\n\nWe spent the last 6 months automating the entire loop with multi-modal AI and strict compliance rules.\n\nHere are 3 fundamental shifts we observed:`}
            </div>
          </div>
        )}

        {/* 4. X / TWITTER PREVIEW */}
        {selectedPlatformTab === 'x' && (
          <div className="space-y-3 animate-fade-in max-w-lg mx-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Rahul Biswas</span>
              <span className="text-xs text-slate-400 font-mono">@kuiro_hq • 1h</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-inter text-slate-200 leading-relaxed whitespace-pre-line">
              {xPost?.captionText ||
                `Autonomous marketing isn't about spamming feeds—it's about never missing a cultural or festive moment across India while keeping brand voice razor-sharp.\n\n48-hour auto-commit loop running at 100% compliance.`}
            </div>
          </div>
        )}

        {/* 5. EMAIL NEWSLETTER PREVIEW */}
        {selectedPlatformTab === 'email' && (
          <div className="space-y-3 animate-fade-in max-w-lg mx-auto">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono space-y-1">
              <div>
                <span className="text-slate-400">Subject: </span>
                <strong className="text-white">
                  {emailPost?.emailSubject ||
                    `[Exclusive] Priority Festive Access: ${activeCampaign.topicSummary}`}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">From: </span>
                <span className="text-slate-200">updates@kuiro.in</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-inter text-slate-200 leading-relaxed whitespace-pre-line">
              {emailPost?.captionText ||
                `Hello,\n\nWe are pleased to introduce our newest collection curated specifically for your celebratory milestones.\n\nDiscover the artisanal craft behind each piece:`}
            </div>
          </div>
        )}
      </div>

      {/* INLINE AI REVISION BAR */}
      <div className="space-y-2 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-white font-semibold">
            <Sparkles size={13} className="text-[#FF7A00]" />
            <span>Surgical AI Revision Prompt</span>
          </span>
          <span>{activeCampaign.revisionCount || 0} / 2 Revisions Used</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={revisionPromptText}
            onChange={(e) => onRevisionPromptChange(e.target.value)}
            placeholder="e.g. 'Make tone more festive' or 'Shorten WhatsApp copy by 20%'"
            className="flex-1 py-2.5 px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.1] focus:border-[#FF7A00] text-xs text-white focus:outline-none font-inter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onRequestRevision(activeCampaign.id, revisionPromptText);
              }
            }}
          />
          <button
            type="button"
            disabled={isSubmittingRevision || !revisionPromptText.trim()}
            onClick={() => onRequestRevision(activeCampaign.id, revisionPromptText)}
            className="py-2.5 px-4 rounded-xl bg-[#FF7A00] hover:bg-[#FF881A] disabled:opacity-40 text-white text-xs font-sora font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {isSubmittingRevision ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <>
                <span>Revise</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* TACTICAL ACTION CONTROLS (Approve, Pause, Export) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
        <button
          type="button"
          disabled={isUpdatingStatus}
          onClick={() => onApprove(activeCampaign.id)}
          className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-sora font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
        >
          <Check size={14} />
          <span>Approve Now</span>
        </button>

        <button
          type="button"
          disabled={isUpdatingStatus}
          onClick={() => onPause(activeCampaign.id)}
          className="py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-sora font-semibold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {activeCampaign.status === 'PAUSED' ? (
            <>
              <Play size={14} className="text-emerald-400" />
              <span>Resume 48h Loop</span>
            </>
          ) : (
            <>
              <Pause size={14} className="text-amber-400" />
              <span>Pause Autopilot</span>
            </>
          )}
        </button>

        <button
          type="button"
          disabled={isExportingKit}
          onClick={() => onExportCreativeKit(activeCampaign.id, activeCampaign.topicSummary)}
          className="py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-sora font-semibold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isExportingKit ? (
            <Loader2 size={14} className="animate-spin text-[#FF7A00]" />
          ) : (
            <Download size={14} className="text-[#FF7A00]" />
          )}
          <span>Export Kit ZIP</span>
        </button>
      </div>
    </div>
  );
}
