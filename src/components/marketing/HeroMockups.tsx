'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Mic,
  Check,
  Sparkles,
  ExternalLink,
  Clock,
  ArrowRight,
  Mail
} from 'lucide-react';
import KuiroLogo, { KuiroSymbol } from '@/components/brand/KuiroLogo';

export function FloatingInstagramCard({ className = '' }: { className?: string }) {
  const [liked, setLiked] = useState(false);

  return (
    <div
      className={`w-72 rounded-[14px] bg-[#0B0F14] border border-white/15 p-3.5 shadow-2xl backdrop-blur-md transition-all hover:scale-102 hover:border-[#FF7A00]/50 select-none ${className}`}
    >
      {/* IG Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-[1.5px]">
            <div className="w-full h-full bg-[#0B0F14] rounded-full flex items-center justify-center text-[10px] font-bold text-white">
              DS
            </div>
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-bold text-white flex items-center gap-1">
              <span>drsharma.dental</span>
              <CheckCircle2 size={11} className="text-sky-400 fill-sky-400" />
            </p>
            <p className="text-[9px] text-[#FF7A00] font-mono">Automated by KUIRO</p>
          </div>
        </div>
        <span className="text-[9px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
          1:1 FEED
        </span>
      </div>

      {/* Visual Canvas (Satori High-DPI preview) */}
      <div className="relative rounded-[10px] overflow-hidden bg-gradient-to-br from-[#0B0F14] via-[#161F2E] to-[#0B0F14] p-3.5 border border-white/10 aspect-square flex flex-col justify-between text-left">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-full bg-[#FF7A00] text-white text-[9px] font-bold tracking-wider uppercase">
            Holi 2026
          </span>
          <KuiroSymbol size={18} />
        </div>

        <div className="my-auto space-y-1">
          <p className="text-[10px] font-semibold text-[#FF7A00] uppercase tracking-wider">
            Preventive Oral Care
          </p>
          <h4 className="font-sora text-sm font-bold text-white leading-tight">
            Protect Your Enamel This Holi 🎨
          </h4>
          <p className="text-[10px] text-gray-300 leading-snug">
            Safeguard pediatric braces & fillings from synthetic dyes.
          </p>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-gray-400">
          <span>Dr. Sharma Clinics</span>
          <span>98301 24589</span>
        </div>
      </div>

      {/* Engagement Actions */}
      <div className="pt-2.5 flex items-center justify-between text-gray-300 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-1 transition ${liked ? 'text-rose-500' : 'hover:text-white'}`}
          >
            <Heart size={14} className={liked ? 'fill-rose-500' : ''} />
            <span className="text-[10px] font-mono">{liked ? '1,421' : '1,420'}</span>
          </button>
          <div className="flex items-center gap-1 text-gray-400">
            <MessageCircle size={14} />
            <span className="text-[10px] font-mono">86</span>
          </div>
          <Share2 size={13} className="text-gray-400" />
        </div>
        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
          AI Critic: 98.4
        </span>
      </div>
    </div>
  );
}

export function FloatingLinkedInCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-72 rounded-[14px] bg-[#0B0F14] border border-white/15 p-3.5 shadow-2xl backdrop-blur-md transition-all hover:scale-102 hover:border-blue-500/50 select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            RS
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-bold text-white flex items-center gap-1">
              <span>Dr. Rahul Sharma</span>
              <span className="text-gray-400 text-[10px] font-normal">• 1st</span>
            </p>
            <p className="text-[9px] text-gray-400 truncate">Founder & Chief Implantologist</p>
          </div>
        </div>
        <span className="text-[9px] font-mono text-blue-400 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800">
          4:5 CAROUSEL
        </span>
      </div>

      {/* Slide Visual (Executive Deck style) */}
      <div className="rounded-[10px] p-3.5 bg-gradient-to-br from-[#101726] to-[#0B0F14] border border-blue-900/30 text-left space-y-2">
        <div className="flex items-center justify-between text-[9px] text-blue-300 font-mono">
          <span>SLIDE 1 OF 5</span>
          <span>HEALTHCARE ROI</span>
        </div>
        <h4 className="font-sora text-xs font-bold text-white leading-snug">
          Why Preventive Dental Checkups Save SMB Teams 65% in Lost Productivity
        </h4>
        <div className="space-y-1 pt-1 text-[10px] text-gray-300">
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-blue-400" />
            <span>Early cavity interception avoids root canals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-blue-400" />
            <span>Corporate wellness reduces sick leaves</span>
          </div>
        </div>
      </div>

      {/* Metrics Footer */}
      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400">
        <span>3,890 Impressions</span>
        <span className="text-emerald-400 font-semibold font-mono">42 Patient Inquiries</span>
      </div>
    </div>
  );
}

export function FloatingWhatsAppCard({ className = '' }: { className?: string }) {
  const [approved, setApproved] = useState(false);

  return (
    <div
      className={`w-72 rounded-[14px] bg-[#0B0F14] border border-white/15 p-3.5 shadow-2xl backdrop-blur-md transition-all hover:scale-102 hover:border-emerald-500/50 select-none ${className}`}
    >
      {/* WhatsApp Utility Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-[10px]">
            W
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-bold text-white flex items-center gap-1">
              <span>KUIRO Autopilot</span>
              <CheckCircle2 size={10} className="text-emerald-400 fill-emerald-400" />
            </p>
            <p className="text-[9px] text-emerald-300">48h Auto-Commit Window</p>
          </div>
        </div>
        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
          UTILITY
        </span>
      </div>

      {/* WhatsApp Message Bubble */}
      <div className="p-2.5 rounded-[10px] bg-white text-[#0B0F14] text-left text-xs space-y-1.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-bold text-emerald-900 text-[11px]">✨ Holi 2026 Queued</span>
          <span className="text-[9px] text-gray-400 font-mono">10:00 AM</span>
        </div>
        <p className="text-[10px] text-gray-700 leading-snug">
          Multi-channel assets prepared for <strong>Dr. Sharma Dental</strong>. Auto-commits in <strong>32h 45m</strong>.
        </p>

        {/* Action Buttons */}
        <div className="space-y-1 pt-1">
          <button
            onClick={() => setApproved(true)}
            className={`w-full py-1.5 px-2 rounded-[6px] text-[10px] font-semibold text-center transition flex items-center justify-center gap-1 ${
              approved
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-emerald-800 border border-gray-300'
            }`}
          >
            {approved ? (
              <>
                <Check size={11} />
                <span>Auto-Commit Approved</span>
              </>
            ) : (
              <span>✅ 1-Tap Approve & Schedule</span>
            )}
          </button>
          <div className="w-full py-1.5 px-2 bg-gray-50 border border-gray-200 rounded-[6px] text-[10px] text-gray-600 text-center flex items-center justify-center gap-1">
            <Mic size={11} className="text-[#FF7A00]" />
            <span>Voice Note: &quot;Headline bold karo&quot;</span>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[9px] text-gray-400">
        <span>Whisper Transcription</span>
        <span className="text-emerald-400 font-medium">Passive OK</span>
      </div>
    </div>
  );
}

export function FloatingXCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-72 rounded-[14px] bg-[#0B0F14] border border-white/15 p-3.5 shadow-2xl backdrop-blur-md transition-all hover:scale-102 hover:border-sky-500/50 select-none ${className}`}
    >
      {/* X Tweet Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center font-bold text-white text-[10px]">
            𝕏
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-bold text-white flex items-center gap-1">
              <span>Dr. Sharma Clinics</span>
            </p>
            <p className="text-[9px] text-gray-400 font-mono">@sharmadental_in</p>
          </div>
        </div>
        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
          GUARDRAIL PASS
        </span>
      </div>

      {/* Tweet Body */}
      <div className="text-left text-[11px] text-gray-200 leading-snug space-y-1.5">
        <p>
          Quick Holi tip: Synthetic colors can erode tooth enamel. Rinse immediately and stay hydrated! 🎨🩺
        </p>
        {/* Reply Box avoiding link surcharge */}
        <div className="p-2 rounded-[8px] bg-[#161C24] border border-dashed border-gray-700 text-[10px] text-gray-400">
          <span className="text-emerald-400 font-bold">First Reply (Saved $0.20 Fee): </span>
          drsharmadental.in/holi-tips
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-gray-400">
        <span>Zero Link Penalty</span>
        <span className="text-sky-400 font-mono">1.2K Views</span>
      </div>
    </div>
  );
}

export function FloatingEmailNewsletterCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-72 rounded-[14px] bg-[#0B0F14] border border-white/15 p-3.5 shadow-2xl backdrop-blur-md transition-all hover:scale-102 hover:border-amber-500/50 select-none ${className}`}
    >
      {/* Email Inbox Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white text-[10px]">
            <Mail size={12} />
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-bold text-white flex items-center gap-1">
              <span>Dr. Sharma Dental</span>
              <CheckCircle2 size={10} className="text-amber-400 fill-amber-400" />
            </p>
            <p className="text-[9px] text-amber-300 font-mono">AUTOPILOT NEWSLETTER</p>
          </div>
        </div>
        <span className="text-[9px] font-mono text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800">
          RESPONSIVE HTML
        </span>
      </div>

      {/* Email Subject & Snippet Preview */}
      <div className="p-2.5 rounded-[10px] bg-[#121820] border border-white/10 text-left text-xs space-y-1.5 shadow-sm">
        <div className="flex items-center justify-between text-[10px] text-slate-300">
          <span className="font-semibold text-white truncate max-w-[170px]">
            ✉️ Protect Your Smile This Holi
          </span>
          <span className="text-[9px] text-slate-500 font-mono">9:30 AM</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-snug">
          20% off preventive fluoride treatments for pediatric & adult patients this week...
        </p>

        {/* Dynamic Branded Call to Action */}
        <div className="pt-1.5 border-t border-white/10 flex items-center justify-between">
          <span className="text-[9px] text-[#FF7A00] font-semibold flex items-center gap-1">
            <span>Claim Free Voucher</span>
            <ArrowRight size={10} />
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300 font-mono">
            1,840 Sent
          </span>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-gray-400">
        <span>Resend / Amazon SES</span>
        <span className="text-emerald-400 font-bold font-mono">44.8% Open Rate</span>
      </div>
    </div>
  );
}

