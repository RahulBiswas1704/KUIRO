'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AnnouncementBar, Navbar, Footer } from '@/components/layout';
import KuiroLogo from '@/components/brand/KuiroLogo';
import {
  ArrowRight,
  CheckCircle2,
  Check,
  Smartphone,
  Calendar,
  TrendingUp,
  ShieldCheck,
  Zap,
  Layers,
  MessageCircle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Globe2,
  Archive,
  ChevronDown,
  Sparkles,
  Flame,
  Clock,
  Mic,
  Send,
  Building2,
  Store,
  Users,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Activity,
  HeartHandshake
} from 'lucide-react';

export default function ZorchaInspiredHomePage() {
  const router = useRouter();
  const { isLoggedIn, handleGetStarted, openAuthModal } = useAuth();

  // 1. Hero Trigger-Action-Result Interactive State
  const [heroStep, setHeroStep] = useState<1 | 2 | 3>(2);
  const [heroApproval, setHeroApproval] = useState<'PENDING' | 'APPROVED' | 'SKIPPED'>('PENDING');

  // 2. Interactive Process Stepper (Step 1 to 4)
  const [activeProcessStep, setActiveProcessStep] = useState<number>(1);

  // 3. Retainer Savings Calculator
  const [monthlyAgencySpend, setMonthlyAgencySpend] = useState<number>(45000);
  const kuiroPrice = 2799;
  const monthlySavings = Math.max(0, monthlyAgencySpend - kuiroPrice);
  const annualSavings = monthlySavings * 12;

  // 4. Pricing Cycle Toggle
  const [pricingPeriod, setPricingPeriod] = useState<'monthly' | 'annual'>('monthly');

  // 5. FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // 6. Voice Revision Simulation State
  const [isVoicePlaying, setIsVoicePlaying] = useState<boolean>(false);
  const [voiceApplied, setVoiceApplied] = useState<boolean>(false);

  const handleSimulateVoice = () => {
    setIsVoicePlaying(true);
    setVoiceApplied(false);
    setTimeout(() => {
      setIsVoicePlaying(false);
      setVoiceApplied(true);
    }, 1800);
  };

  const creatorTicker = [
    { handle: '@kolkatachai.co', niche: 'Artisanal Tea Cafe', followers: '85K' },
    { handle: '@fabsaree_surat', niche: 'Pure Silk Handlooms', followers: '140K' },
    { handle: '@bluetokaicoffee', niche: 'Specialty Roasters', followers: '210K' },
    { handle: '@auraderm.clinic', niche: 'Aesthetic Dermatology', followers: '42K' },
    { handle: '@thewholetruthfoods', niche: 'Clean Protein & Bars', followers: '320K' },
    { handle: '@bombayshavingcompany', niche: 'Men’s Grooming D2C', followers: '180K' },
    { handle: '@subko.coffee', niche: 'Specialty Bakehouse', followers: '125K' },
    { handle: '@thepostbox.in', niche: 'Handcrafted Lifestyle', followers: '95K' },
  ];

  const processSteps = [
    {
      num: '01',
      title: 'Index Your Brand DNA in 30 Seconds',
      desc: 'Paste your store URL or Instagram handle. KUIRO crawls your hex palette, typography guidelines, tone archetype, and negative guardrails into private vector memory.',
      badge: 'Vector Brand Brain',
      screen: {
        tag: 'BRAND BRAIN CALIBRATED',
        title: 'Kolkata Chai Co. & Artisanal Blends',
        detail: 'Colors: #FF7A00, #2B1704 • Font: Noto Sans Bengali + Sora • Voice: Warm & Heritage-Proud',
        status: '100% Brand Fidelity Locked',
      },
    },
    {
      num: '02',
      title: '365-Day Cultural Radar Auto-Drafts Campaigns',
      desc: 'KUIRO continuously tracks 35+ Indian festivals and regional events across 28 states. 7 days before, it generates high-DPI visuals and post copy in Devanagari, Bengali, and English.',
      badge: '35+ Indian Festivals',
      screen: {
        tag: 'UPCOMING FESTIVAL RADAR',
        title: 'Diwali & Kali Puja Deepotsav 2026',
        detail: 'Generated: 4:5 Instagram Feed, 1:1 WhatsApp Card, Bengali Festive Subheadline, AI Critic: 96/100',
        status: 'Scheduled 7 Days in Advance',
      },
    },
    {
      num: '03',
      title: 'Review on WhatsApp 48 Hours Before',
      desc: '48 hours before publishing, an interactive review card arrives directly on your WhatsApp. Tap "Approve Now", tap "Skip", or send a 5-second Hinglish voice note to revise in seconds.',
      badge: 'Zero Dashboard Logins',
      screen: {
        tag: 'WHATSAPP INTERACTIVE DISPATCH',
        title: 'Diwali Dhamaka Flash Sale Card',
        detail: 'Scheduled Publish: Tomorrow 10:00 AM IST • Passive Auto-Commit Active if unedited',
        status: 'Action Required on Phone',
      },
    },
    {
      num: '04',
      title: 'Autonomous Publishing & Real Lead Attribution',
      desc: 'Posts publish automatically at peak audience hours. Inbound customer WhatsApp inquiries are automatically tagged with the originating campaign and tracked for net revenue.',
      badge: 'Direct Revenue Attribution',
      screen: {
        tag: 'OMNI-INBOX LEAD ATTRIBUTION',
        title: '₹1,42,800 Net Festive Revenue',
        detail: '48 Inbound WhatsApp Inquiries Attributed • 32 Gift Hampers Converted • Zero Agency Retainer',
        status: 'Live Lead Attributed',
      },
    },
  ];

  const faqs = [
    {
      q: 'Do I really never have to log into a marketing dashboard?',
      a: 'Zero mandatory dashboard logins. 48 hours before any Indian festival, business milestone, or seasonal sale, KUIRO generates your complete multi-channel graphics and sends an interactive preview directly to your WhatsApp. One tap approves, voice notes revise, or doing nothing auto-commits at scheduled peak times.',
    },
    {
      q: 'How does KUIRO avoid looking like generic, cheap AI generated content?',
      a: 'Unlike generic AI tools that create warped cartoon images or broken Indian text, KUIRO operates on a deterministic Brand Brain. It strictly enforces your brand hex codes, verified logos, and official fonts. For Indian languages, KUIRO uses a specialized Satori compositor that pre-shapes native Google Noto fonts for Devanagari, Bengali, Tamil, and Kannada with zero broken glyphs or clipped ligatures.',
    },
    {
      q: 'Can I get a GST invoice for my business?',
      a: 'Yes, 100%. All KUIRO subscriptions include a valid Indian GST Tax Invoice with your company name, GSTIN, and HSN/SAC code automatically generated upon payment via Razorpay.',
    },
    {
      q: 'Is KUIRO Meta Verified and safe for my accounts?',
      a: 'KUIRO is fully compliant with official Meta Graph API v21.0 protocols. All OAuth access tokens are encrypted with AES-256-GCM authenticated encryption. We never ask for your personal WhatsApp passwords or use unofficial QR-scanning browser hacks that trigger Meta account bans.',
    },
    {
      q: 'How does WhatsApp Voice Revision work?',
      a: 'If you want any adjustment, simply reply to the preview card with a voice note in Hindi, Hinglish, Bengali, or English (e.g., "Headline me 20% festive discount bold kardo aur background thoda dark karo"). KUIRO transcribes the audio, detects the design intent, and updates both copy and graphics in under 12 seconds.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes. KUIRO operates on simple month-to-month billing with zero lock-ins or contracts. You can cancel with one click from your billing portal at any time.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070A11] text-white flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-x-hidden">
      {/* Top Subtle Announcement */}
      <AnnouncementBar
        badge="Autonomous 2.0"
        tagline="The Marketing Operating System for Bharat & Beyond."
        subtitle="— 48-Hour Festival Autopilot • WhatsApp Reviews • Real Lead Attribution."
      />

      {/* Floating Glassmorphic Navbar (Zorcha Inspired) */}
      <Navbar
        activeRoute="home"
        badgeText="Meta API v21.0 Verified"
        statusText="WhatsApp Bridge Active"
      />

      {/* =========================================================================
          HERO SECTION (ZORCHA INSPIRED: HIGH-IMPACT, CLEAN, BOLD)
      ========================================================================= */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Subtle Warm Backdrop Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[420px] bg-gradient-to-b from-[#FF7A00]/[0.08] via-transparent to-transparent pointer-events-none -z-10 blur-3xl" />

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-xl text-xs shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-pulse" />
            <span className="font-semibold text-slate-200">Autonomous Marketing Colleague</span>
            <span className="text-white/20">•</span>
            <span className="text-[#FF7A00] font-medium font-mono text-[11px]">35+ Regional Festivals Tracked</span>
          </div>

          {/* Main Huge Headline (Zorcha High-Impact Style) */}
          <h1 className="font-sora text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Turn Indian Festivals <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Into Customer Revenue.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-inter leading-relaxed">
            48 hours before any Indian festival or campaign date, KUIRO prepares studio-grade creatives in native Indic fonts, pings your WhatsApp for a 5-second review, and auto-publishes at peak hours.
          </p>

          {/* Primary High-Contrast CTA Button (Zorcha Style: Solid White Button with Black Text) */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={handleGetStarted}
              className="cursor-pointer flex items-center justify-center bg-white hover:bg-slate-100 text-black font-extrabold rounded-2xl px-7 py-3.5 transition-transform hover:scale-105 shadow-xl shadow-white/10 active:scale-95 group text-sm sm:text-base font-sora"
            >
              <span>{isLoggedIn ? 'Go to Dashboard' : 'Start for free'}</span>
              <ArrowRight size={18} className="ml-2 text-black group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#how-it-works"
              className="flex items-center justify-center bg-[#10141F]/80 hover:bg-white/[0.08] text-slate-200 font-semibold rounded-2xl px-6 py-3.5 border border-white/10 hover:border-white/20 transition backdrop-blur-xl text-sm"
            >
              <Smartphone size={16} className="text-emerald-400 mr-2" />
              <span>See WhatsApp Interactive Demo</span>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400 font-inter">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Zero Dashboard Logins Required</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>100% WhatsApp Approval Window</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Devanagari & Bengali Pre-Shaped</span>
            </span>
          </div>
        </div>

        {/* =====================================================================
            HERO TRIGGER-ACTION-RESULT 3-CARD VISUAL (ZORCHA INSPIRED)
        ===================================================================== */}
        <div className="mt-14 sm:mt-18 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {/* Step 1 Card: Festival Trigger */}
            <div
              onClick={() => setHeroStep(1)}
              className={`p-6 rounded-[28px] border transition-all cursor-pointer backdrop-blur-xl ${
                heroStep === 1
                  ? 'bg-[#0E1422] border-[#FF7A00] shadow-[0_12px_32px_rgba(255,122,0,0.15)] ring-1 ring-[#FF7A00]/40'
                  : 'bg-[#0A0E18]/80 border-white/[0.08] hover:border-white/[0.16]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] flex items-center justify-center font-mono font-bold text-xs border border-[#FF7A00]/30">
                  1
                </span>
                <span className="text-[10px] font-mono uppercase bg-white/[0.05] px-2 py-0.5 rounded text-slate-400">
                  7 Days Before
                </span>
              </div>
              <h3 className="font-sora text-base font-bold text-white mb-1.5">
                Cultural Radar Detects Festival
              </h3>
              <p className="text-xs text-slate-400 font-inter leading-relaxed mb-4">
                Radar flags Diwali / Kali Puja. KUIRO generates 4:5 visual in Devanagari/Bengali with your brand logo & verified hex palette.
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-[#FF9E42] flex items-center gap-2">
                <Calendar size={13} />
                <span>Diwali Deepotsav • Auto-Drafted</span>
              </div>
            </div>

            {/* Step 2 Card: WhatsApp Review (Highlighted) */}
            <div
              onClick={() => setHeroStep(2)}
              className={`p-6 rounded-[28px] border transition-all cursor-pointer backdrop-blur-xl ${
                heroStep === 2
                  ? 'bg-[#0E1422] border-[#FF7A00] shadow-[0_12px_32px_rgba(255,122,0,0.15)] ring-1 ring-[#FF7A00]/40'
                  : 'bg-[#0A0E18]/80 border-white/[0.08] hover:border-white/[0.16]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs border border-emerald-500/30">
                  2
                </span>
                <span className="text-[10px] font-mono uppercase bg-emerald-950/60 px-2 py-0.5 rounded text-emerald-400 border border-emerald-500/20">
                  48 Hours Before
                </span>
              </div>
              <h3 className="font-sora text-base font-bold text-white mb-1.5">
                Review on WhatsApp
              </h3>
              <p className="text-xs text-slate-400 font-inter leading-relaxed mb-4">
                Interactive preview arrives on your phone. Tap &quot;Approve Now&quot;, &quot;Skip&quot;, or reply with a 5-second voice note.
              </p>

              {/* Interactive Micro Buttons */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setHeroApproval('APPROVED');
                  }}
                  className={`py-2 px-2.5 rounded-lg font-semibold text-[11px] transition flex items-center justify-center gap-1 ${
                    heroApproval === 'APPROVED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  <Check size={12} />
                  <span>{heroApproval === 'APPROVED' ? 'Approved' : 'Approve'}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setHeroApproval('SKIPPED');
                  }}
                  className={`py-2 px-2.5 rounded-lg font-semibold text-[11px] transition flex items-center justify-center gap-1 ${
                    heroApproval === 'SKIPPED'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-950/40 text-rose-300 border border-rose-500/20'
                  }`}
                >
                  <span>Skip</span>
                </button>
              </div>
            </div>

            {/* Step 3 Card: Lead & Sales Attribution */}
            <div
              onClick={() => setHeroStep(3)}
              className={`p-6 rounded-[28px] border transition-all cursor-pointer backdrop-blur-xl ${
                heroStep === 3
                  ? 'bg-[#0E1422] border-[#FF7A00] shadow-[0_12px_32px_rgba(255,122,0,0.15)] ring-1 ring-[#FF7A00]/40'
                  : 'bg-[#0A0E18]/80 border-white/[0.08] hover:border-white/[0.16]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-xs border border-blue-500/30">
                  3
                </span>
                <span className="text-[10px] font-mono uppercase bg-blue-950/60 px-2 py-0.5 rounded text-blue-400 border border-blue-500/20">
                  Peak Engagement
                </span>
              </div>
              <h3 className="font-sora text-base font-bold text-white mb-1.5">
                Auto-Published & Leads Attributed
              </h3>
              <p className="text-xs text-slate-400 font-inter leading-relaxed mb-4">
                Posts publish to Instagram & Facebook. Inbound customer WhatsApp inquiries are tagged and linked to net revenue.
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-emerald-400 flex items-center justify-between">
                <span>Festive Orders Inbound</span>
                <span className="font-bold">₹1,42,800 Net</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CREATOR & BRAND PROOF TICKER (ZORCHA STYLE)
      ========================================================================= */}
      <div className="py-6 border-y border-white/[0.08] bg-[#05070D] overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-6 animate-marquee">
          {creatorTicker.concat(creatorTicker).map((item, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0B0F17] border border-white/[0.08] text-xs font-inter"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-white">{item.handle}</span>
              <span className="text-slate-400">{item.niche}</span>
              <span className="text-[10px] font-mono bg-white/[0.05] px-2 py-0.5 rounded text-slate-300">
                {item.followers}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: "AT A GLANCE" METRIC BANNER (ZORCHA INSPIRED)
      ========================================================================= */}
      <section className="py-20 border-b border-white/[0.08] bg-[#070A11] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-mono uppercase text-[#FF7A00] tracking-wider font-semibold">
              At a Glance
            </span>
            <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Built for businesses that refuse to miss moments.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-[28px] bg-[#0A0E18] border border-white/[0.08]">
              <div className="font-sora text-4xl sm:text-5xl font-extrabold text-white">35+</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-2 font-inter">
                Indian Regional Festivals & Moments Tracked
              </div>
            </div>

            <div className="p-6 rounded-[28px] bg-[#0A0E18] border border-white/[0.08]">
              <div className="font-sora text-4xl sm:text-5xl font-extrabold text-[#FF7A00]">48h</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-2 font-inter">
                Prior WhatsApp Delivery for Zero-Panic Review
              </div>
            </div>

            <div className="p-6 rounded-[28px] bg-[#0A0E18] border border-white/[0.08]">
              <div className="font-sora text-4xl sm:text-5xl font-extrabold text-emerald-400">12s</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-2 font-inter">
                Hinglish Voice Note Surgical Creative Revision
              </div>
            </div>

            <div className="p-6 rounded-[28px] bg-[#0A0E18] border border-white/[0.08]">
              <div className="font-sora text-4xl sm:text-5xl font-extrabold text-white">₹5.0L+</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-2 font-inter">
                Average Yearly Marketing Retainer Saved
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: STEP-BY-STEP PROCESS JOURNEY (ZORCHA INSPIRED STEPPER)
      ========================================================================= */}
      <section id="how-it-works" className="py-24 border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono uppercase text-[#FF7A00] tracking-wider font-semibold">
              Process
            </span>
            <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              How KUIRO Automates Your Marketing Journey.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-inter">
              Connect your brand once. Let KUIRO handle every festival, season, and lead on autopilot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Steps List (Clickable Stepper) */}
            <div className="md:col-span-6 space-y-4 text-left">
              {processSteps.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveProcessStep(idx + 1)}
                  className={`p-6 rounded-[24px] border transition-all cursor-pointer ${
                    activeProcessStep === idx + 1
                      ? 'bg-[#0E1422] border-[#FF7A00] shadow-[0_12px_28px_rgba(255,122,0,0.12)]'
                      : 'bg-[#0A0E18]/60 border-white/[0.06] hover:border-white/[0.14]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[#FF7A00]">
                      Step {s.num}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400">
                      {s.badge}
                    </span>
                  </div>
                  <h3 className="font-sora text-base font-bold text-white mb-1.5">{s.title}</h3>
                  <p className="text-xs text-slate-300 font-inter leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Right Dynamic Live Screen Mockup */}
            <div className="md:col-span-6 p-6 sm:p-8 rounded-[32px] bg-[#0A0E18] border border-white/[0.1] backdrop-blur-2xl shadow-2xl text-left space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF7A00] animate-pulse" />
                  <span className="text-xs font-mono text-slate-300 uppercase tracking-wider font-semibold">
                    {processSteps[activeProcessStep - 1].screen.tag}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/20">
                  {processSteps[activeProcessStep - 1].screen.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#060910] border border-white/[0.06] space-y-2">
                  <h4 className="font-sora text-lg font-bold text-white">
                    {processSteps[activeProcessStep - 1].screen.title}
                  </h4>
                  <p className="text-xs text-slate-300 font-inter leading-relaxed">
                    {processSteps[activeProcessStep - 1].screen.detail}
                  </p>
                </div>

                {/* Step-specific visual interaction */}
                {activeProcessStep === 3 && (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <div className="text-[11px] font-mono text-slate-400">WhatsApp Preview Card on Phone</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSimulateVoice}
                        className="py-2 px-3 rounded-lg bg-[#FF7A00] text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        {isVoicePlaying ? <Volume2 size={13} className="animate-pulse" /> : <Mic size={13} />}
                        <span>{isVoicePlaying ? 'Transcribing Hinglish Audio...' : 'Send Voice Note Revision'}</span>
                      </button>
                      {voiceApplied && (
                        <span className="text-[11px] text-emerald-400 font-mono animate-fade-in flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          <span>Revised in 11.2s!</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 font-mono">
                  <span>Autonomous Engine: Gemini 2.5 + Satori</span>
                  <span className="text-[#FF7A00]">Active Tenant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FEATURE BENTO GRID (ZORCHA GAINS STYLE)
      ========================================================================= */}
      <section className="py-24 border-b border-white/[0.08] bg-[#070A11] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono uppercase text-[#FF7A00] tracking-wider font-semibold">
              Gains
            </span>
            <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Supercharge your brand. <br />
              <span className="text-slate-400">Save 40+ hours every month.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Card 1: The Chai Break Test */}
            <div className="p-8 rounded-[32px] bg-[#0A0E18] border border-white/[0.08] space-y-4 hover:border-white/[0.18] transition">
              <div className="w-12 h-12 rounded-2xl bg-[#FF7A00]/15 text-[#FF7A00] flex items-center justify-center font-bold">
                <Smartphone size={22} />
              </div>
              <h3 className="font-sora text-xl font-bold text-white">The &quot;Chai Break&quot; Review</h3>
              <p className="text-sm text-slate-300 font-inter leading-relaxed">
                Review your marketing over morning chai in 5 seconds. No logins, no passwords, no Jira tickets. Tap &quot;Approve Now&quot; on WhatsApp, or speak a quick voice note in Hindi or English.
              </p>
              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 pt-2">
                <CheckCircle2 size={14} />
                <span>Zero Dashboard Logins Required</span>
              </div>
            </div>

            {/* Card 2: Native Indic Typography */}
            <div className="p-8 rounded-[32px] bg-[#0A0E18] border border-white/[0.08] space-y-4 hover:border-white/[0.18] transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <Globe2 size={22} />
              </div>
              <h3 className="font-sora text-xl font-bold text-white">Authentic Indic Typography</h3>
              <p className="text-sm text-slate-300 font-inter leading-relaxed">
                Generic AI generators mangle Indian scripts. KUIRO uses pre-shaped Google Noto Sans fonts for Devanagari, Bengali, Tamil, and Kannada with perfect conjuncts and zero clipped ligatures.
              </p>
              <div className="text-xs font-mono text-[#FF7A00] flex items-center gap-1.5 pt-2">
                <CheckCircle2 size={14} />
                <span>Devanagari, Bengali & Tamil Tested</span>
              </div>
            </div>

            {/* Card 3: Inbound Lead & Revenue Attribution */}
            <div className="p-8 rounded-[32px] bg-[#0A0E18] border border-white/[0.08] space-y-4 hover:border-white/[0.18] transition">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                <TrendingUp size={22} />
              </div>
              <h3 className="font-sora text-xl font-bold text-white">Lead & Revenue Attribution</h3>
              <p className="text-sm text-slate-300 font-inter leading-relaxed">
                Every published post includes dedicated WhatsApp click-to-chat links with campaign UTM tracking. When a customer messages you, KUIRO attributes the lead and revenue directly.
              </p>
              <div className="text-xs font-mono text-blue-400 flex items-center gap-1.5 pt-2">
                <CheckCircle2 size={14} />
                <span>Direct ROI Tracking to Cash in Bank</span>
              </div>
            </div>

            {/* Card 4: 1-Click Creative Kit Exporter */}
            <div className="p-8 rounded-[32px] bg-[#0A0E18] border border-white/[0.08] space-y-4 hover:border-white/[0.18] transition">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                <Archive size={22} />
              </div>
              <h3 className="font-sora text-xl font-bold text-white">1-Click Creative Kit ZIP Export</h3>
              <p className="text-sm text-slate-300 font-inter leading-relaxed">
                Need assets for your physical store TV or retail staff? Download a ready-to-use ZIP bundle with 4:5 vertical TV posters, 1:1 WhatsApp cards, verified copy, and responsive email HTML.
              </p>
              <div className="text-xs font-mono text-purple-400 flex items-center gap-1.5 pt-2">
                <CheckCircle2 size={14} />
                <span>1080x1350 TV & Social Print Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: RETAINER SAVINGS CALCULATOR (THE MATH)
      ========================================================================= */}
      <section className="py-24 border-b border-white/[0.08] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-mono uppercase text-[#FF7A00] tracking-wider font-semibold">
              The Retainer Math
            </span>
            <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Replace a ₹45,000/mo retainer with ₹2,799.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-inter max-w-xl mx-auto">
              Traditional marketing agencies charge high retainers, miss regional Indian festival nuances, and take 4 days per revision.
            </p>
          </div>

          <div className="p-8 rounded-[32px] bg-[#0A0E18] border border-white/[0.1] backdrop-blur-2xl shadow-2xl text-left space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-medium">Your Current Monthly Marketing / Agency Spend:</span>
                <span className="font-sora font-extrabold text-white text-lg">
                  ₹{monthlyAgencySpend.toLocaleString('en-IN')}/mo
                </span>
              </div>
              <input
                type="range"
                min="15000"
                max="120000"
                step="5000"
                value={monthlyAgencySpend}
                onChange={(e) => setMonthlyAgencySpend(Number(e.target.value))}
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>₹15,000 (Freelancer)</span>
                <span>₹45,000 (Average SMB Agency)</span>
                <span>₹1,20,000 (Full Agency Retainer)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                <span className="text-[11px] font-mono text-emerald-400 uppercase">Monthly Savings</span>
                <div className="font-sora text-3xl font-extrabold text-white mt-1">
                  ₹{monthlySavings.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">Saved every 30 days vs KUIRO Growth (₹2,799).</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/30">
                <span className="text-[11px] font-mono text-[#FF7A00] uppercase">Annual Net Profit Reinvested</span>
                <div className="font-sora text-3xl font-extrabold text-white mt-1">
                  ₹{annualSavings.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">Reinvested into inventory, hiring, or founder profit.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: PRICING (ZORCHA STYLE SIMPLICITY)
      ========================================================================= */}
      <section id="pricing" className="py-24 border-b border-white/[0.08] bg-[#070A11] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-mono uppercase text-[#FF7A00] tracking-wider font-semibold">
              Pricing
            </span>
            <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              One flat fee. Cancel anytime.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-inter">
              All plans include full 14 days free trial. GST tax invoice provided automatically.
            </p>

            {/* Toggle */}
            <div className="pt-2 flex items-center justify-center gap-2">
              <div className="p-1 rounded-full bg-[#0A0E18] border border-white/10 flex items-center text-xs">
                <button
                  onClick={() => setPricingPeriod('monthly')}
                  className={`px-4 py-1.5 rounded-full font-medium transition ${
                    pricingPeriod === 'monthly' ? 'bg-[#FF7A00] text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setPricingPeriod('annual')}
                  className={`px-4 py-1.5 rounded-full font-medium transition flex items-center gap-1.5 ${
                    pricingPeriod === 'annual' ? 'bg-[#FF7A00] text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Annual</span>
                  <span className="text-[10px] bg-emerald-400 text-black px-1.5 py-0.2 rounded-full font-bold">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Starter */}
            <div className="p-8 rounded-[32px] bg-[#0A0E18] border border-white/[0.08] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Starter</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-sora text-4xl font-extrabold text-white">
                    ₹{pricingPeriod === 'annual' ? '999' : '1,199'}
                  </span>
                  <span className="text-xs text-slate-400">/ mo</span>
                </div>
                <p className="text-xs text-slate-300 font-inter">
                  For individual creators, solo consultants, and local retail stores.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-white/[0.06]">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>1 Brand Brain profile</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>15 Scheduled campaigns / mo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>WhatsApp 48-hour review card</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Instagram & Facebook publishing</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleGetStarted}
                className="w-full py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-sora font-semibold transition border border-white/10"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Growth (Most Popular) */}
            <div className="p-8 rounded-[32px] bg-[#0E1424] border-2 border-[#FF7A00] shadow-[0_20px_48px_rgba(255,122,0,0.2)] flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#FF7A00] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                Most Popular for D2C & SMBs
              </div>
              <div className="space-y-4">
                <span className="text-xs font-mono text-[#FF7A00] uppercase font-semibold">Growth Autopilot</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-sora text-4xl font-extrabold text-white">
                    ₹{pricingPeriod === 'annual' ? '2,299' : '2,799'}
                  </span>
                  <span className="text-xs text-slate-400">/ mo</span>
                </div>
                <p className="text-xs text-slate-300 font-inter">
                  Full autonomous festival autopilot with voice revisions and lead attribution.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-white/[0.06]">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#FF7A00]" />
                    <span className="font-medium text-white">Up to 3 Brand Brain profiles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#FF7A00]" />
                    <span className="font-medium text-white">Unlimited 365-Day Cultural Radar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#FF7A00]" />
                    <span>Multilingual WhatsApp Voice Revisions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#FF7A00]" />
                    <span>1-Click Creative Kit ZIP Exporter</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#FF7A00]" />
                    <span>Campaign ROI & Inbound Lead Attribution</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleGetStarted}
                className="w-full py-3.5 rounded-2xl bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition shadow-lg shadow-[#FF7A00]/25"
              >
                Activate Growth Autopilot
              </button>
            </div>

            {/* Agency */}
            <div className="p-8 rounded-[32px] bg-[#0A0E18] border border-white/[0.08] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Agency & Franchise</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-sora text-4xl font-extrabold text-white">
                    ₹{pricingPeriod === 'annual' ? '9,999' : '11,999'}
                  </span>
                  <span className="text-xs text-slate-400">/ mo</span>
                </div>
                <p className="text-xs text-slate-300 font-inter">
                  For digital marketing agencies, franchises, and multi-location retail chains.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-white/[0.06]">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Up to 15 Client Brand profiles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Multi-tenant Team Inbox & RBAC</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Custom White-Label Export Branding</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Dedicated WhatsApp Account Bridge</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleGetStarted}
                className="w-full py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-sora font-semibold transition border border-white/10"
              >
                Start Agency Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: COMMON QUESTIONS / FAQ (ZORCHA ACCORDION STYLE)
      ========================================================================= */}
      <section className="py-24 border-b border-white/[0.08] relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-14">
            <span className="text-xs font-mono uppercase text-[#FF7A00] tracking-wider font-semibold">
              FAQ
            </span>
            <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Common questions about KUIRO.
            </h2>
          </div>

          <div className="space-y-3 text-left">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-[24px] border border-white/[0.08] bg-[#0A0E18] overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-6 flex items-center justify-between gap-4 text-sm font-sora font-semibold text-white hover:text-[#FF7A00] transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform ${openFaqIndex === idx ? 'rotate-180 text-[#FF7A00]' : 'text-slate-400'}`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-6 pb-6 text-xs text-slate-300 font-inter leading-relaxed border-t border-white/[0.04] pt-4 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: FINAL HIGH-IMPACT CALL TO ACTION (ZORCHA INSPIRED)
      ========================================================================= */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF7A00] font-bold">
            Where you win the attention game
          </span>

          <h2 className="font-sora text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
            Your next festival campaign <br />
            could already be in your WhatsApp.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-inter">
            Join Indian retail stores, D2C founders, creators, and practices running their marketing on autopilot.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="cursor-pointer flex items-center justify-center bg-white hover:bg-slate-100 text-black font-extrabold rounded-2xl px-8 py-4 transition-transform hover:scale-105 shadow-2xl active:scale-95 group text-sm sm:text-base font-sora"
            >
              <span>{isLoggedIn ? 'Go to Dashboard' : 'Start for free'}</span>
              <ArrowRight size={18} className="ml-2 text-black group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="https://wa.me/919876543210?text=Hi%20KUIRO%20Team%2C%20show%20me%20a%20live%20WhatsApp%20approval%20demo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-[#10141F] hover:bg-white/[0.08] text-slate-200 font-semibold rounded-2xl px-6 py-4 border border-white/10 transition text-sm"
            >
              <Smartphone size={16} className="text-emerald-400 mr-2" />
              <span>WhatsApp Live Demo (+91 98765 43210)</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
