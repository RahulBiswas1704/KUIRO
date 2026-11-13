'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Share2,
  Smartphone,
  Flame,
  ArrowRight,
  ShieldCheck,
  Instagram,
  Linkedin,
  Twitter,
  MessageSquare,
  RefreshCw,
  Eye,
  Sliders,
  Check,
  Mail,
  MessagesSquare
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [approvedList, setApprovedList] = useState<string[]>([]);
  const [campaignAction, setCampaignAction] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setApprovedList((prev) => [...prev, id]);
    setCampaignAction('Campaign approved manually! Marked for immediate publishing.');
    setTimeout(() => setCampaignAction(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast alert */}
      {campaignAction && (
        <div className="p-3.5 rounded-[12px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{campaignAction}</span>
          </div>
          <button
            onClick={() => setCampaignAction(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Welcome & Autopilot Banner */}
      <div className="rounded-[14px] bg-[#0B0F14] text-white p-6 border border-[#1E2530] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] text-[10px] font-semibold tracking-wider uppercase">
                Autonomous Co-Pilot Active
              </span>
              <span className="text-gray-400 text-xs">• 365 Regional Engine</span>
            </div>
            <h2 className="font-sora text-xl md:text-2xl font-bold tracking-tight">
              Your marketing. <span className="text-[#FF7A00]">On autopilot.</span>
            </h2>
            <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-xl">
              KUIRO plans, generates, checks compliance, and prepares multi-channel posts 48 hours in advance. Do nothing, and it auto-commits to your channels.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/simulator"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-white text-[#0B0F14] text-xs font-semibold hover:bg-gray-100 transition shadow-sm"
            >
              <Smartphone size={15} />
              <span>Open WhatsApp Sim</span>
            </Link>
            <Link
              href="/dashboard/brand-brain"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#FF7A00] text-white text-xs font-semibold hover:bg-[#E66E00] transition shadow-sm"
            >
              <Sparkles size={15} />
              <span>Edit Brand Brain</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics (Inter Medium Numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              48h Queue Status
            </span>
            <Clock size={16} className="text-[#FF7A00]" />
          </div>
          <div className="text-2xl font-bold text-[#0B0F14] font-inter">
            2 Campaigns
          </div>
          <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            1 in 48h Auto-Commit window
          </p>
        </div>

        <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              AI Critic Quality Pass
            </span>
            <ShieldCheck size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-[#0B0F14] font-inter">
            96.8 / 100
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            Zero link surcharges, 100% brand tone
          </p>
        </div>

        <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              WhatsApp Approvals
            </span>
            <Smartphone size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#0B0F14] font-inter">
            Zero-Click
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            48h passive auto-commit enabled
          </p>
        </div>

        <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Connected Channels
            </span>
            <Share2 size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-[#0B0F14] font-inter">
            4 of 4 Live
          </div>
          <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-medium">All tokens healthy</span>
          </p>
        </div>
      </div>

      {/* Primary 48-Hour Campaign Spotlight Card */}
      <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-4 border-b border-[#E5E7EB] gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF7A00] shrink-0 mt-0.5">
              <Flame size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  AUTO_QUEUED (48H WINDOW)
                </span>
                <span className="text-xs text-gray-500">Trigger: Regional Festival Calendar</span>
              </div>
              <h3 className="font-sora text-base md:text-lg font-bold text-[#0B0F14] mt-0.5">
                Holi Festive Smiles & Organic Color Dental Safety Guide
              </h3>
              <p className="text-xs text-gray-500">
                Target Industries: Healthcare / Dental Clinics • Regions: Pan-India
              </p>
            </div>
          </div>

          {/* 48h Timer & Countdown */}
          <div className="flex items-center gap-3 bg-[#F9FAFB] p-3 rounded-[12px] border border-[#E5E7EB]">
            <Clock size={20} className="text-[#FF7A00]" />
            <div>
              <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                Passive Auto-Commit In
              </div>
              <div className="text-sm font-bold text-[#0B0F14] font-mono">
                32h 45m 18s
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Visual & Copy Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Contact Sheet / Multi-channel preview */}
          <div className="lg:col-span-1 space-y-3">
            <div className="relative rounded-[12px] overflow-hidden border border-[#E5E7EB] bg-gray-900 group">
              <div className="aspect-square bg-gradient-to-br from-[#0B0F14] via-[#1E2530] to-[#0B0F14] p-4 flex flex-col justify-between text-white relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-[#FF7A00] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                    <span>KUIRO</span>
                  </div>
                  <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-gray-300">
                    Satori + Sharp High-DPI
                  </span>
                </div>

                <div className="space-y-1.5 my-auto text-center">
                  <p className="text-[11px] font-semibold text-[#FF7A00] uppercase tracking-wider">
                    Dr. Sharma Dental Care
                  </p>
                  <h4 className="font-sora text-lg font-bold leading-tight">
                    Protect Your Enamel This Holi
                  </h4>
                  <p className="text-[11px] text-gray-300 max-w-xs mx-auto">
                    Quick tips to safeguard dental fillings and braces from harsh synthetic dyes.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400">
                  <span>98301 24589</span>
                  <span>drsharmadental.in</span>
                </div>
              </div>

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Link
                  href="/dashboard/simulator"
                  className="px-3 py-1.5 rounded-[8px] bg-white text-xs font-semibold text-[#0B0F14] hover:bg-gray-100"
                >
                  Inspect in WhatsApp
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <span>Contact Sheet (2x2 Multi-Channel)</span>
              <span className="text-[#FF7A00] font-medium text-[11px]">Meta Utility Template</span>
            </div>
          </div>

          {/* Platform Tailored Copy & Rules */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-[12px] bg-[#F9FAFB] border border-[#E5E7EB] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-[#0B0F14]">
                    AI Multi-Channel Tailoring (Gemini 2.5 Structured JSON)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-gray-500">
                  Revision 0 of 2 (Free)
                </span>
              </div>

              {/* Instagram / Facebook Caption */}
              <div className="text-xs text-gray-700 bg-white p-3 rounded-[8px] border border-[#E5E7EB] space-y-1">
                <div className="flex items-center gap-1.5 text-pink-600 font-semibold text-[11px]">
                  <Instagram size={13} />
                  <span>Instagram & Facebook Payload:</span>
                </div>
                <p>
                  Celebrate Holi with vibrant colors, not stained smiles! 🎨✨ Before stepping out, apply a thin coat of petroleum jelly around your lips, hydrate well, and rinse immediately after. Wishing everyone a healthy, safe, and joyful Holi!
                </p>
                <p className="text-gray-400 text-[10px]">
                  #Holi2026 #DentalCare #HealthySmiles #DrSharmaClinic #PreventiveDentistry
                </p>
              </div>

              {/* X (Twitter) Surcharge Guardrail Demonstration */}
              <div className="text-xs text-gray-700 bg-white p-3 rounded-[8px] border border-[#E5E7EB] space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sky-500 font-semibold text-[11px]">
                    <Twitter size={13} />
                    <span>X (Twitter) Payload:</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Surcharge Guardrail Active (Link in 1st Reply)
                  </span>
                </div>
                <p>
                  Quick Holi tip from our clinic: Organic gulal is your friend, but synthetic dyes can erode tooth enamel. Drink plenty of water and avoid brushing immediately after playing with colors!
                </p>
                <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded border border-dashed border-gray-300">
                  <span className="font-semibold text-gray-700">First Reply (Link Post Surcharge $0.20 Avoided): </span>
                  Read our 3-step post-Holi dental safety routine at drsharmadental.in/holi-tips
                </div>
              </div>

              {/* AI Critic Score Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2 bg-white rounded-[8px] border border-[#E5E7EB] text-center">
                  <div className="text-[10px] text-gray-400 uppercase font-medium">Tone Fidelity</div>
                  <div className="text-sm font-bold text-emerald-600">98 / 100</div>
                </div>
                <div className="p-2 bg-white rounded-[8px] border border-[#E5E7EB] text-center">
                  <div className="text-[10px] text-gray-400 uppercase font-medium">Visual Quality</div>
                  <div className="text-sm font-bold text-emerald-600">94 / 100</div>
                </div>
                <div className="p-2 bg-white rounded-[8px] border border-[#E5E7EB] text-center">
                  <div className="text-[10px] text-gray-400 uppercase font-medium">X Link Guardrail</div>
                  <div className="text-sm font-bold text-emerald-600">100% Pass</div>
                </div>
                <div className="p-2 bg-white rounded-[8px] border border-[#E5E7EB] text-center">
                  <div className="text-[10px] text-gray-400 uppercase font-medium">Negative Alerts</div>
                  <div className="text-sm font-bold text-emerald-600">0 Violations</div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-gray-500">
                Auto-Commit will trigger publishing on <span className="font-semibold text-gray-700">March 4, 2026 at 09:00 AM IST</span>.
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/simulator"
                  className="px-3.5 py-2 rounded-[10px] bg-gray-100 text-[#0B0F14] text-xs font-semibold hover:bg-gray-200 transition"
                >
                  Voice / Text Revise
                </Link>
                <button
                  onClick={() => handleApprove('camp-holi-2026')}
                  disabled={approvedList.includes('camp-holi-2026')}
                  className={`px-4 py-2 rounded-[10px] text-xs font-semibold transition flex items-center gap-1.5 ${
                    approvedList.includes('camp-holi-2026')
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#FF7A00] text-white hover:bg-[#E66E00]'
                  }`}
                >
                  {approvedList.includes('camp-holi-2026') ? (
                    <>
                      <Check size={14} />
                      <span>Approved</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Approve Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Multi-Channel Customer Inbox Activity Widget */}
      <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF7A00] shrink-0">
              <MessagesSquare size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  OMNI-CHANNEL LIVE INBOX
                </span>
                <span className="text-xs text-gray-500">WhatsApp • Instagram • Messenger • Email</span>
              </div>
              <h3 className="font-sora text-sm md:text-base font-bold text-[#0B0F14] mt-0.5">
                Shared Customer Conversations Workspace
              </h3>
            </div>
          </div>

          <Link
            href="/dashboard/inbox"
            className="px-4 py-2 rounded-[8px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-semibold font-sora transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto shrink-0"
          >
            <span>Open Unified Inbox</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* 3 Live Inbound Teaser Rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href="/dashboard/inbox"
            className="p-3 rounded-[10px] bg-gray-50 hover:bg-orange-50/50 border border-gray-200 hover:border-orange-200 transition space-y-1.5 block group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0B0F14] group-hover:text-[#FF7A00] transition flex items-center gap-1.5">
                <Smartphone size={13} className="text-emerald-600" />
                <span>Ananya Mukherjee</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono">10:42 AM</span>
            </div>
            <p className="text-[11px] text-gray-600 line-clamp-2">
              "Can I schedule a consultation for Invisalign clear aligners this Saturday?"
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-[9px] font-mono">
              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">WhatsApp</span>
              <span className="bg-orange-100 text-[#FF7A00] px-1.5 py-0.2 rounded font-bold">#ClearAligners</span>
            </div>
          </Link>

          <Link
            href="/dashboard/inbox"
            className="p-3 rounded-[10px] bg-gray-50 hover:bg-orange-50/50 border border-gray-200 hover:border-orange-200 transition space-y-1.5 block group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0B0F14] group-hover:text-[#FF7A00] transition flex items-center gap-1.5">
                <Instagram size={13} className="text-pink-600" />
                <span>Rohit Verma</span>
              </span>
              <span className="text-[10px] text-rose-600 font-bold font-mono">URGENT</span>
            </div>
            <p className="text-[11px] text-gray-600 line-clamp-2">
              "Chipped my front tooth playing football an hour ago. Do you take emergency walk-ins?"
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-[9px] font-mono">
              <span className="bg-pink-100 text-pink-800 px-1.5 py-0.2 rounded font-bold">Instagram DM</span>
              <span className="bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold">#Emergency</span>
            </div>
          </Link>

          <Link
            href="/dashboard/inbox"
            className="p-3 rounded-[10px] bg-gray-50 hover:bg-orange-50/50 border border-gray-200 hover:border-orange-200 transition space-y-1.5 block group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0B0F14] group-hover:text-[#FF7A00] transition flex items-center gap-1.5">
                <Mail size={13} className="text-amber-600" />
                <span>Meera Deshmukh</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono">09:20 AM</span>
            </div>
            <p className="text-[11px] text-gray-600 line-clamp-2">
              "Reviewed your corporate dental wellness proposal. Will discuss in committee."
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-[9px] font-mono">
              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">Email</span>
              <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">#CorporateB2B</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Connected Channel Health Grid (id="channels") */}
      <div id="channels" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-sora text-sm font-bold text-[#0B0F14]">
            Connected Channels & Token Vault
          </h3>
          <span className="text-xs text-gray-500">
            Encrypted AES-256 Storage • Token Auto-Refresh
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                <Instagram size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0B0F14]">Instagram Graph</p>
                <p className="text-[10px] text-gray-500">@drsharma.dental</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>

          <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Linkedin size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0B0F14]">LinkedIn Page</p>
                <p className="text-[10px] text-gray-500">Dr. Sharma Clinics</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>

          <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <Twitter size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0B0F14]">X (Twitter)</p>
                <p className="text-[10px] text-gray-500">@sharmadental_in</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>

          <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageSquare size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0B0F14]">WhatsApp Admin</p>
                <p className="text-[10px] text-gray-500">+91 98301 24589</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified
            </span>
          </div>

          <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0B0F14]">Branded Email (ESP)</p>
                <p className="text-[10px] text-gray-500">1,840 Active Subs</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              DKIM Pass
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

