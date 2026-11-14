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
      {/* IG Header - SMB Retail & Artisanal Brand */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-[1.5px]">
            <div className="w-full h-full bg-[#0B0F14] rounded-full flex items-center justify-center text-[10px] font-bold text-amber-400">
              KC
            </div>
          </div>
          <div className="leading-tight text-left">
            <p className="text-[11px] font-bold text-white flex items-center gap-1">
              <span>kolkatachai.co</span>
              <CheckCircle2 size={11} className="text-sky-400 fill-sky-400" />
            </p>
            <p className="text-[9px] text-[#FF7A00] font-mono">Retail SMB • Park Street</p>
          </div>
        </div>
        <span className="text-[9px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
          1:1 FEED
        </span>
      </div>

      {/* Visual Canvas (Satori High-DPI preview) */}
      <div className="relative rounded-[10px] overflow-hidden bg-gradient-to-br from-[#1A1208] via-[#2A1D0E] to-[#140D05] p-3.5 border border-[#FF7A00]/30 aspect-square flex flex-col justify-between text-left">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-full bg-[#FF7A00] text-white text-[9px] font-bold tracking-wider uppercase">
            Festive Special
          </span>
          <KuiroSymbol size={18} />
        </div>

        <div className="my-auto space-y-1">
          <p className="text-[10px] font-semibold text-[#FF7A00] uppercase tracking-wider">
            Artisanal Roasts & Blends
          </p>
          <h4 className="font-sora text-sm font-bold text-white leading-tight">
            Saffron Elaichi Chai & Fresh Beginnings 🌿
          </h4>
          <p className="text-[10px] text-gray-300 leading-snug">
            Small-batch brews made for seasonal celebrations.
          </p>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-gray-400">
          <span>Kolkata Chai Co.</span>
          <span>Order on Swiggy / In-Store</span>
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
            <span className="text-[10px] font-mono">{liked ? '2,841' : '2,840'}</span>
          </button>
          <div className="flex items-center gap-1 text-gray-400">
            <MessageCircle size={14} />
            <span className="text-[10px] font-mono">142</span>
          </div>
          <Share2 size={13} className="text-gray-400" />
        </div>
        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
          AI Critic: 98.6
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
      {/* Header - Personal Brand & Growth Consultant */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            VM
          </div>
          <div className="leading-tight text-left">
            <p className="text-[11px] font-bold text-white flex items-center gap-1">
              <span>Vikram Malhotra</span>
              <span className="text-gray-400 text-[10px] font-normal">• 1st</span>
            </p>
            <p className="text-[9px] text-gray-400 truncate">Growth Consultant & Solopreneur</p>
          </div>
        </div>
        <span className="text-[9px] font-mono text-blue-400 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800">
          4:5 CAROUSEL
        </span>
      </div>

      {/* Slide Visual (Thought Leadership style) */}
      <div className="rounded-[10px] p-3.5 bg-gradient-to-br from-[#101726] to-[#0B0F14] border border-blue-900/30 text-left space-y-2">
        <div className="flex items-center justify-between text-[9px] text-blue-300 font-mono">
          <span>SLIDE 1 OF 6</span>
          <span>CREATOR PLAYBOOK</span>
        </div>
        <h4 className="font-sora text-xs font-bold text-white leading-snug">
          Why Solopreneurs Lose 60% of Organic Reach to Link-Penalties
        </h4>
        <div className="space-y-1 pt-1 text-[10px] text-gray-300">
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-blue-400" />
            <span>Outbound URLs in main post get algorithm-suppressed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-blue-400" />
            <span>Zero-link first-reply guardrails boost retention +40%</span>
          </div>
        </div>
      </div>

      {/* Metrics Footer */}
      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400">
        <span>6,420 Impressions</span>
        <span className="text-emerald-400 font-semibold font-mono">24 Inbound Leads</span>
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
          <div className="leading-tight text-left">
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
          <span className="font-bold text-emerald-900 text-[11px]">✨ Festival Campaign Queued</span>
          <span className="text-[9px] text-gray-400 font-mono">10:00 AM</span>
        </div>
        <p className="text-[10px] text-gray-700 leading-snug">
          Multi-channel assets prepared for <strong>Your Brand</strong>. Auto-commits in <strong>32h 45m</strong>.
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
            <span>Voice Note: &quot;Add festival discount code&quot;</span>
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
      {/* X Tweet Header - Tech Founder & Creator */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center font-bold text-white text-[10px]">
            𝕏
          </div>
          <div className="leading-tight text-left">
            <p className="text-[11px] font-bold text-white flex items-center gap-1">
              <span>Priya Sengupta</span>
            </p>
            <p className="text-[9px] text-gray-400 font-mono">@priyacreates • Founder</p>
          </div>
        </div>
        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
          GUARDRAIL PASS
        </span>
      </div>

      {/* Tweet Body */}
      <div className="text-left text-[11px] text-gray-200 leading-snug space-y-1.5">
        <p>
          The best marketing strategy for small business owners: Show up 365 days a year with localized cultural relevance. 🚀
        </p>
        {/* Reply Box avoiding link surcharge */}
        <div className="p-2 rounded-[8px] bg-[#161C24] border border-dashed border-gray-700 text-[10px] text-gray-400">
          <span className="text-emerald-400 font-bold">First Reply (Saved $0.20 Fee): </span>
          Check our latest collection: store.brand.in
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-gray-400">
        <span>Zero Link Penalty</span>
        <span className="text-sky-400 font-mono">3.4K Views</span>
      </div>
    </div>
  );
}

export function FloatingEmailNewsletterCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-72 rounded-[14px] bg-[#0B0F14] border border-white/15 p-3.5 shadow-2xl backdrop-blur-md transition-all hover:scale-102 hover:border-amber-500/50 select-none ${className}`}
    >
      {/* Email Inbox Header - D2C Boutique Store */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white text-[10px]">
            <Mail size={12} />
          </div>
          <div className="leading-tight text-left">
            <p className="text-[11px] font-bold text-white flex items-center gap-1">
              <span>Veda Botanics</span>
            </p>
            <p className="text-[9px] text-gray-400 font-mono">newsletter@vedabotanics.in</p>
          </div>
        </div>
        <span className="text-[9px] font-mono text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800">
          HTML EMAIL
        </span>
      </div>

      {/* Email Preview Body */}
      <div className="p-2.5 rounded-[10px] bg-white text-[#0B0F14] text-left text-xs space-y-1.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-1">
          <span className="font-bold text-gray-900 text-[10px]">Exclusive Festive Drop ✨</span>
          <span className="text-[9px] text-gray-400 font-mono">44.8% Open</span>
        </div>
        <p className="text-[10px] text-gray-600 leading-snug">
          Namaste VIP Members! Early access to our organic festive gift collections is now live with priority shipping.
        </p>
        <div className="pt-1">
          <div className="w-full py-1 rounded bg-[#FF7A00] text-white text-[10px] font-semibold text-center">
            Shop Exclusive Drop →
          </div>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-gray-400">
        <span>Resend / SES Synced</span>
        <span className="text-emerald-400 font-mono font-medium">99.8% Delivered</span>
      </div>
    </div>
  );
}
