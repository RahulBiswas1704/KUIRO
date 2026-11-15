'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AnnouncementBar, Navbar, Footer } from '@/components/layout';
import SubscriptionCheckoutModal, { PlanTier } from '@/components/billing/SubscriptionCheckoutModal';
import CampaignRoiCalculator from '@/components/marketing/CampaignRoiCalculator';
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Smartphone,
  TrendingUp,
  Layers,
  Calendar,
  Share2,
  Palette,
  Briefcase,
  Zap,
  Download,
  BarChart3,
  MessagesSquare,
  Users,
  Store,
  UserCheck,
  Stethoscope,
  Globe2,
  Lock,
  FileText
} from 'lucide-react';

export default function PricingPage() {
  const { isLoggedIn, handleGetStarted } = useAuth();
  const [annualBilling, setAnnualBilling] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCheckoutTier, setSelectedCheckoutTier] = useState<PlanTier>('GROWTH');

  const starterPrice = annualBilling ? 999 : 1199;
  const growthPrice = annualBilling ? 2299 : 2799;
  const agencyPrice = annualBilling ? 9999 : 11999;

  const faqs = [
    {
      q: 'How does the 14-day risk-free trial work?',
      a: 'You get full access to KUIRO Growth Autopilot for 14 days without paying anything. You can index your Brand Brain, connect your channels, and test the 48-hour WhatsApp review loop. No credit card is required to sign up. You only choose a plan when you are ready to publish live campaigns.',
    },
    {
      q: 'How does the 48-Hour WhatsApp Auto-Commit protocol work?',
      a: '48 hours before any festival, business milestone, or campaign date, KUIRO generates your complete multi-channel visual assets and copy, delivering an interactive preview directly to your WhatsApp. You can tap [Approve], reply with a voice note in Hindi or English to make revisions, or do nothing. If left unreviewed within 48 hours, KUIRO safely auto-commits and publishes at scheduled peak times.',
    },
    {
      q: 'Can I really send voice notes in Hindi or English to revise posts?',
      a: 'Yes! KUIRO integrates Whisper and Gemini Multimodal Audio to transcribe natural speech in Hindi, Indian English, and regional languages. Simply speak naturally: "Headline thoda bold karo aur festive discount code add karo." The AI critic re-composites your studio graphic and copy in less than 12 seconds.',
    },
    {
      q: 'How does Campaign ROI and Inbound Lead Attribution work?',
      a: 'Every campaign links to your verified WhatsApp number or custom landing URL with unique tracking tags and UTM parameters. When a customer messages your business from an Instagram post, LinkedIn carousel, or WhatsApp status, KUIRO automatically tags the lead, logs their inquiry, and calculates net revenue directly in your dashboard.',
    },
    {
      q: 'What is included in the 1-Click Creative Kit Asset Exporter?',
      a: 'On the Growth and Agency plans, KUIRO packages each campaign into a downloadable ZIP archive containing: 1) High-DPI 1080p landscape slide for in-store TV screens & counter loops, 2) 1:1 Square card (1080x1080) for WhatsApp status & feed, 3) Responsive HTML email newsletter, 4) Social post captions & hashtags, and 5) Front-desk staff talk track (SOP).',
    },
    {
      q: 'How does KUIRO avoid the X (Twitter) link penalty and $0.200 fee?',
      a: 'X’s algorithm penalizes tweets containing outbound links by approximately 40% organic reach, while charging elevated API fees. KUIRO automatically enforces a smart guardrail: your core high-DPI graphic and hook are published in the main tweet, and your promotional or booking URL is published instantly as the verified first reply.',
    },
    {
      q: 'Can digital marketing agencies whitelabel KUIRO for their clients?',
      a: 'Yes. The Agency plan includes 10 isolated client workspaces with tenant-level data segregation, custom agency branding, dedicated Inngest webhook queues, and whitelabeled WhatsApp utility templates with your agency’s sender ID.',
    },
    {
      q: 'Do you provide GST invoices with Input Tax Credit (ITC)?',
      a: 'Absolutely. All plans for Indian businesses include automated GST-compliant tax invoices with Input Tax Credit (ITC) details issued directly to your registered billing email.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070A11] text-white flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-x-clip">
      {/* Top Subtle Announcement */}
      <AnnouncementBar
        badge="Transparent Pricing"
        tagline="14-Day Full Autopilot Free Trial."
        subtitle="— No credit card required. Cancel anytime."
      />

      {/* Floating Glassmorphic Navbar (Zorcha Inspired) */}
      <Navbar activeRoute="pricing" />

      {/* =========================================================================
          HERO SECTION (ZORCHA INSPIRED: HIGH-IMPACT, CLEAN, BOLD)
      ========================================================================= */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Subtle Warm Backdrop Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[420px] bg-gradient-to-b from-[#FF7A00]/[0.08] via-transparent to-transparent pointer-events-none -z-10 blur-3xl" />

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-xl text-xs shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-pulse" />
            <span className="font-semibold text-slate-200">Transparent Indian SaaS Economics</span>
            <span className="text-white/20">•</span>
            <span className="text-[#FF7A00] font-medium font-mono text-[11px]">Zero Agency Retainers</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-sora font-extrabold tracking-tight text-white leading-[1.08]">
            Predictable Plans. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#FF7A00]">
              Zero Agency Retainers.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-inter leading-relaxed">
            Replace ₹45,000 to ₹1,00,000/mo manual agency retainers with your always-on marketing colleague on WhatsApp. Complete 14-day free trial. Zero credit card lock-ins.
          </p>

          {/* Billing Cycle Switcher (Zorcha Pill Style) */}
          <div className="pt-4 flex items-center justify-center">
            <div className="p-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl flex items-center gap-1 shadow-inner">
              <button
                onClick={() => setAnnualBilling(false)}
                className={`px-5 py-2 rounded-full text-xs font-sora font-semibold transition-all duration-200 ${
                  !annualBilling
                    ? 'bg-white text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setAnnualBilling(true)}
                className={`px-5 py-2 rounded-full text-xs font-sora font-semibold transition-all duration-200 flex items-center gap-2 ${
                  annualBilling
                    ? 'bg-white text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 rounded-full bg-[#FF7A00] text-white text-[10px] font-mono font-bold tracking-tight">
                  2 Months Free
                </span>
              </button>
            </div>
          </div>

          {/* Trust Guarantees Strip */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400 font-mono">
            <span>✓ 14-Day Full Autopilot Access</span>
            <span>✓ Zero Setup Fees</span>
            <span>✓ Instant WhatsApp Onboarding</span>
            <span>✓ GST Invoices with Input Tax Credit</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          THREE CORE PRICING CARDS (ARTISANAL, TACTILE, HIGH-CONTRAST)
      ========================================================================= */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          
          {/* Card 1: Starter */}
          <div className="p-7 sm:p-9 rounded-[32px] bg-[#0A0E18] border border-white/[0.08] flex flex-col justify-between hover:border-white/[0.16] transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider block">
                  Solopreneurs & Solo Brands
                </span>
                <h3 className="font-sora text-2xl font-bold text-white mt-1">Starter</h3>
                <p className="text-xs text-slate-400 font-inter mt-1.5 leading-relaxed">
                  For independent creators, solo consultants, and boutique brands getting started.
                </p>
              </div>

              {/* Price Lockup */}
              <div className="pt-4 pb-6 border-y border-white/[0.08] flex items-baseline justify-between">
                <div>
                  <span className="text-4xl sm:text-5xl font-extrabold font-sora text-white tracking-tight">
                    ₹{starterPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono ml-1.5">/ month</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {annualBilling ? `₹${(starterPrice * 12).toLocaleString('en-IN')}/yr` : 'Billed monthly'}
                </span>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-3 text-xs text-slate-300 font-inter">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider block">
                  Included Capabilities:
                </span>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1 Brand Workspace</strong> with persistent Brand Brain in pgvector</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>3 Connected Social Channels</strong> (Instagram, Facebook, LinkedIn or X)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>15 Automated Posts / Month</strong> with high-DPI Satori graphics</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>2,500 Monthly Branded Email Newsletters</strong> (HTML via Resend)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>WhatsApp 48-Hour 1-Tap Review Cards</strong> (Silence = Consent)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1-Seat WhatsApp Customer Inbox</strong> (2 Smart Auto-Reply Flows)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Major National & Cultural Holiday Triggers (Diwali, Eid, Holi)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06] space-y-2">
              <button
                onClick={() => {
                  setSelectedCheckoutTier('STARTER');
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-sora font-semibold transition border border-white/10 text-center block shadow-sm cursor-pointer"
              >
                Start with Starter Plan →
              </button>
              <p className="text-[10px] text-center text-slate-500 font-mono">14 days risk-free · Cancel anytime</p>
            </div>
          </div>

          {/* Card 2: Growth (Featured - Most Popular) */}
          <div className="p-7 sm:p-9 rounded-[32px] bg-gradient-to-b from-[#131A26] via-[#0A0E18] to-[#0A0E18] border-2 border-[#FF7A00] flex flex-col justify-between relative shadow-[0_20px_60px_-15px_rgba(255,122,0,0.25)] scale-[1.02] transition-all duration-300">
            {/* Top Pill Callout */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF7A00] text-white text-[10px] font-extrabold uppercase px-4 py-1 rounded-full tracking-wider shadow-md">
              Most Popular • Full 8-Engine Autopilot
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#FF7A00] font-bold tracking-wider block">
                  Growing SMBs, D2C Brands & Practices
                </span>
                <h3 className="font-sora text-2xl font-bold text-white mt-1">Growth Autopilot</h3>
                <p className="text-xs text-slate-300 font-inter mt-1.5 leading-relaxed">
                  For active businesses replacing agency retainers with end-to-end autonomous execution.
                </p>
              </div>

              {/* Price Lockup */}
              <div className="pt-4 pb-6 border-y border-white/[0.12] flex items-baseline justify-between">
                <div>
                  <span className="text-4xl sm:text-5xl font-extrabold font-sora text-white tracking-tight">
                    ₹{growthPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-300 font-mono ml-1.5">/ month</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                  {annualBilling ? `Save ₹6,000/yr` : 'Billed monthly'}
                </span>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-3 text-xs text-slate-200 font-inter">
                <span className="text-[10px] font-mono uppercase text-[#FF7A00] font-bold tracking-wider block">
                  Everything in Starter, plus:
                </span>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>1 Workspace & 3 Brand Profiles</strong> (Business + Founder Personal Brand)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>All 4 Channels Active</strong> (Instagram, Facebook, LinkedIn, X)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>Unlimited 365-Day Schedule + Daily Cron Trigger</strong> (0 0 * * *)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>35+ Regional Festivals across 28 Indian States & UTs</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>WhatsApp Voice Note Revisions</strong> in Hindi & English (&lt; 12s update)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Live Campaign ROI & Lead Attribution Dashboard</strong> (Attributed GMV)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1-Click Creative Kit Asset Exporter (ZIP)</strong> for in-store TV & web</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>Indic Typography Engine</strong> (Bengali, Devanagari, Tamil pre-shaped)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>X First-Reply Link Guardrail</strong> (Saves $0.200 per tweet +40% reach)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>15,000 Monthly Branded Email Newsletters</strong> + Audience Segments</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>5-Seat Unified Multi-Channel Customer Inbox</strong> + Smart Flow Routing</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.1] space-y-2">
              <button
                onClick={() => {
                  setSelectedCheckoutTier('GROWTH');
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-4 rounded-2xl bg-white text-black font-extrabold text-xs sm:text-sm font-sora hover:scale-105 transition-all duration-300 text-center block shadow-[0_10px_25px_-5px_rgba(255,255,255,0.3)] cursor-pointer"
              >
                Get Started with Growth →
              </button>
              <p className="text-[10px] text-center text-emerald-400 font-mono">Instant UPI Autopay / Cards · Cancel anytime</p>
            </div>
          </div>

          {/* Card 3: Agency & Multi-Location */}
          <div className="p-7 sm:p-9 rounded-[32px] bg-[#0A0E18] border border-white/[0.08] flex flex-col justify-between hover:border-white/[0.16] transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider block">
                  Agencies & Multi-Brand Networks
                </span>
                <h3 className="font-sora text-2xl font-bold text-white mt-1">Agency / Scale</h3>
                <p className="text-xs text-slate-400 font-inter mt-1.5 leading-relaxed">
                  For digital agencies managing 10 to 50 client retainers, franchises, and multi-brand groups.
                </p>
              </div>

              {/* Price Lockup */}
              <div className="pt-4 pb-6 border-y border-white/[0.08] flex items-baseline justify-between">
                <div>
                  <span className="text-4xl sm:text-5xl font-extrabold font-sora text-white tracking-tight">
                    ₹{agencyPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono ml-1.5">/ month</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {annualBilling ? `Save ₹24,000/yr` : 'Billed monthly'}
                </span>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-3 text-xs text-slate-300 font-inter">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider block">
                  Everything in Growth, plus:
                </span>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>10 Isolated Client Workspaces</strong> (Scale up to 50+) with strict RLS</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Whitelabel WhatsApp Utility Templates</strong> with agency sender ID</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Dedicated Inngest Webhook Queues</strong> for instant processing</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Programmatic Remotion Video & Reels Engine</strong> with voiceover</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>100,000 Monthly Branded Emails</strong> + Custom Domain DKIM/SPF Setup</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Unlimited Unified Inbox Seats</strong> + Multi-Client Routing Flows</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Dedicated Technical Account Manager & 99.9% Uptime SLA</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06] space-y-2">
              <button
                onClick={() => {
                  setSelectedCheckoutTier('AGENCY');
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-sora font-semibold transition border border-white/10 text-center block shadow-sm cursor-pointer"
              >
                Activate Agency Autopilot →
              </button>
              <Link
                href="/contact"
                className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-[11px] font-mono transition text-center block"
              >
                Or Contact Agency Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE CAMPAIGN ROI & REVENUE ATTRIBUTION CALCULATOR
      ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-[32px] bg-[#0A0E18] border border-white/[0.09] p-6 sm:p-10 shadow-2xl">
          <CampaignRoiCalculator />
        </div>
      </section>

      {/* =========================================================================
          DETAILED FEATURE COMPARISON MATRIX (CLEAN, HAIRLINE TABLE)
      ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#FF7A00] font-bold">
            Granular Breakdown
          </span>
          <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight">
            Compare Plan Capabilities Side-by-Side
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto font-inter">
            Every plan includes our persistent Brand Brain and WhatsApp approval engine with no hidden charges.
          </p>
        </div>

        <div className="rounded-[28px] overflow-hidden border border-white/[0.08] bg-[#0A0E18] shadow-2xl">
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full min-w-[640px] text-xs text-left">
              <thead className="bg-white/[0.02] text-[10px] font-mono uppercase text-slate-400 border-b border-white/[0.08]">
                <tr>
                  <th className="p-4 font-bold text-white w-2/5">Capabilities</th>
                  <th className="p-4 font-bold text-slate-300 w-1/5 text-center">Starter</th>
                  <th className="p-4 font-bold text-[#FF7A00] w-1/5 text-center bg-[#FF7A00]/10">Growth</th>
                  <th className="p-4 font-bold text-slate-300 w-1/5 text-center">Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] font-inter">
                {/* Section 1: Workspaces & Channels */}
                <tr className="bg-white/[0.02]">
                  <td colSpan={4} className="p-3 text-[11px] font-mono font-bold text-[#FF7A00] uppercase tracking-wider">
                    1. Workspaces & Distribution Channels
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Brand Workspaces</td>
                  <td className="p-4 text-center text-slate-300">1 Workspace</td>
                  <td className="p-4 text-center text-white font-semibold bg-[#FF7A00]/5">1 Workspace (3 Profiles)</td>
                  <td className="p-4 text-center text-slate-300">10 Isolated Workspaces</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Connected Social Channels</td>
                  <td className="p-4 text-center text-slate-300">3 Channels</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold bg-[#FF7A00]/5">All 4 Channels (IG, FB, LI, X)</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">All 4 Channels</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Monthly Post Schedule</td>
                  <td className="p-4 text-center text-slate-300">15 Posts / mo</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold bg-[#FF7A00]/5">Unlimited 365-Day Schedule</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">Unlimited Multi-Client</td>
                </tr>

                {/* Section 2: AI & WhatsApp Approval Protocol */}
                <tr className="bg-white/[0.02]">
                  <td colSpan={4} className="p-3 text-[11px] font-mono font-bold text-[#FF7A00] uppercase tracking-wider">
                    2. AI Memory & WhatsApp Review Protocol
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Persistent Brand Brain (Neon pgvector)</td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400 bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">WhatsApp 48-Hour Auto-Commit ("Silence = Consent")</td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400 bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Whisper Voice Note Revisions (Hindi & English)</td>
                  <td className="p-4 text-center text-slate-500">—</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold bg-[#FF7A00]/5">&lt; 12s Regeneration</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">&lt; 12s Regeneration</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">365-Day Regional Cultural Radar (Cron 0 0 * * *)</td>
                  <td className="p-4 text-center text-slate-300">National Holidays</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold bg-[#FF7A00]/5">35+ Events (28 States)</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">35+ Events (28 States)</td>
                </tr>

                {/* Section 3: Campaign ROI & Lead Attribution */}
                <tr className="bg-white/[0.02]">
                  <td colSpan={4} className="p-3 text-[11px] font-mono font-bold text-[#FF7A00] uppercase tracking-wider">
                    3. Campaign ROI & Lead Attribution
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Campaign ROI & Lead Attribution Dashboard</td>
                  <td className="p-4 text-center text-slate-500">—</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400 font-semibold"><Check size={16} className="mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Inbound WhatsApp Customer Lead Tagging</td>
                  <td className="p-4 text-center text-slate-500">—</td>
                  <td className="p-4 text-center text-emerald-400 bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Attributed GMV & Realized Revenue Readout</td>
                  <td className="p-4 text-center text-slate-500">—</td>
                  <td className="p-4 text-center text-emerald-400 bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                </tr>

                {/* Section 4: Creative Compositing & Creative Kit Exporter */}
                <tr className="bg-white/[0.02]">
                  <td colSpan={4} className="p-3 text-[11px] font-mono font-bold text-[#FF7A00] uppercase tracking-wider">
                    4. Creative Studio & Asset Exporter
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">High-DPI Satori & Sharp Compositing</td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400 bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">1-Click Creative Kit ZIP Exporter (TV, Web, Staff)</td>
                  <td className="p-4 text-center text-slate-500">—</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400 font-semibold"><Check size={16} className="mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Indic Ligature Typography (Hindi, Bengali, Tamil)</td>
                  <td className="p-4 text-center text-slate-500">—</td>
                  <td className="p-4 text-center text-emerald-400 bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">X First-Reply Zero-Link Guardrail ($0.200 Saved)</td>
                  <td className="p-4 text-center text-slate-500">—</td>
                  <td className="p-4 text-center text-emerald-400 bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Branded HTML Email Newsletters (Resend/SES)</td>
                  <td className="p-4 text-center text-slate-300 font-mono">2,500 / mo</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold bg-[#FF7A00]/5 font-mono">15,000 / mo</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold font-mono">100,000 / mo</td>
                </tr>

                {/* Section 5: Unified Conversations Inbox */}
                <tr className="bg-white/[0.02]">
                  <td colSpan={4} className="p-3 text-[11px] font-mono font-bold text-[#FF7A00] uppercase tracking-wider">
                    5. Unified Conversations Inbox & Team Routing
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Unified Multi-Channel Inbox</td>
                  <td className="p-4 text-center text-slate-300">WhatsApp Only (1 Seat)</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold bg-[#FF7A00]/5">4 Channels (5 Seats)</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">4 Channels (Unlimited Seats)</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Smart Keyword & Intent Routing Flows</td>
                  <td className="p-4 text-center text-slate-300">2 Basic Flows</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold bg-[#FF7A00]/5">Unlimited Flows</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">Multi-Client Flows</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Whitelabel Agency WhatsApp Sender ID</td>
                  <td className="p-4 text-center text-slate-500">—</td>
                  <td className="p-4 text-center text-slate-500 bg-[#FF7A00]/5">—</td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FREQUENTLY ASKED PRICING QUESTIONS (ACCORDION)
      ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-left">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#FF7A00] font-bold">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight">
            Frequently Asked Pricing Questions
          </h2>
          <p className="text-slate-400 text-sm font-inter">
            Direct, no-fluff answers on billing, trial periods, and team upgrades.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.08] bg-[#0A0E18] overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-sora font-semibold text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#FF7A00]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 font-inter leading-relaxed border-t border-white/[0.05] pt-3 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          BOTTOM HIGH-IMPACT CONVERSION BANNER
      ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="p-8 sm:p-14 rounded-[32px] bg-gradient-to-b from-[#0F1420] to-[#070A11] border border-white/[0.12] relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF7A00]/15 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-mono font-bold">
            <Sparkles size={13} />
            <span>Start Your 14-Day Risk-Free Trial</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-sora font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
            Put your marketing <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#FF7A00]">
              on autopilot today.
            </span>
          </h2>

          <p className="text-sm text-slate-300 font-inter max-w-xl mx-auto leading-relaxed">
            No credit card required. Experience your first WhatsApp campaign review card in less than 5 minutes.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setSelectedCheckoutTier('GROWTH');
                setIsCheckoutOpen(true);
              }}
              className="w-full sm:w-auto bg-white text-black font-extrabold text-sm sm:text-base rounded-2xl px-8 py-4 hover:scale-105 shadow-[0_10px_25px_-5px_rgba(255,255,255,0.25)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isLoggedIn ? 'Upgrade Workspace →' : 'Launch Free Trial (₹0) →'}</span>
            </button>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-sm font-semibold transition border border-white/10 flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <span>Talk to Sales</span>
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Secure Checkout & Subscription Modal */}
      <SubscriptionCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialTier={selectedCheckoutTier}
        initialAnnual={annualBilling}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          window.location.href = '/dashboard';
        }}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
