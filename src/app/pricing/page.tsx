'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AnnouncementBar, Navbar, Footer } from '@/components/layout';
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Check,
  X as CloseIcon,
  HelpCircle,
  Smartphone,
  TrendingUp,
  Calculator,
  ChevronDown,
  ChevronUp,
  Flame,
  Layers,
  Calendar,
  Share2,
  Palette,
  Building2,
  Briefcase,
  Zap,
  Info,
  Archive,
  Download,
  DollarSign,
  BarChart3,
  Mail,
  MessagesSquare,
  RefreshCw,
  Users,
  Award,
  Globe2
} from 'lucide-react';

export default function RedesignedPricingPage() {
  const { isLoggedIn, handleGetStarted } = useAuth();
  const [annualBilling, setAnnualBilling] = useState(true);
  const [currentAgencySpend, setCurrentAgencySpend] = useState(45000); // INR per month
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Pricing Matrix calculations
  const starterPrice = annualBilling ? 999 : 1199;
  const growthPrice = annualBilling ? 2299 : 2799;
  const agencyPrice = annualBilling ? 9999 : 11999;

  const calculateSavings = () => {
    const kuiroMonthlyCost = growthPrice;
    const monthlySavings = Math.max(0, currentAgencySpend - kuiroMonthlyCost);
    const annualSavings = monthlySavings * 12;
    const percentSavings = Math.round((monthlySavings / currentAgencySpend) * 100);
    const roiMultiplier = (currentAgencySpend / kuiroMonthlyCost).toFixed(1);
    return { monthlySavings, annualSavings, percentSavings, roiMultiplier };
  };

  const { monthlySavings, annualSavings, percentSavings, roiMultiplier } = calculateSavings();

  const faqs = [
    {
      q: 'How does the 14-day risk-free trial work?',
      a: 'You get full access to KUIRO Growth Autopilot for 14 days without paying anything. You can set up your Brand Brain, connect your channels, and test the 48-hour WhatsApp review loop. No credit card is required to sign up. You only choose a plan when you are ready to publish live campaigns.',
    },
    {
      q: 'How does the 48-Hour WhatsApp Auto-Commit protocol work?',
      a: '48 hours before any festival, business milestone, or campaign date, KUIRO generates your complete multi-channel visual assets and copy, delivering an interactive preview directly to your WhatsApp. You can tap "Approve", reply with a voice note in Hindi or English to make revisions, or do nothing. If no revision is requested within 48 hours, KUIRO safely auto-commits and publishes at scheduled peak times.',
    },
    {
      q: 'Can I really send voice notes in Hindi or English to revise posts?',
      a: 'Yes! KUIRO integrates Whisper and Gemini Multimodal Audio to transcribe natural speech in Hindi, Indian English, and regional languages. Simply speak naturally: "Headline thoda bold karo aur festive discount code add karo." The AI critic re-composites your studio graphic and copy in less than 12 seconds.',
    },
    {
      q: 'How does the Campaign ROI and Inbound Lead Attribution work?',
      a: 'Every campaign links to your verified WhatsApp number or custom landing URL with unique tracking tags and UTM parameters. When a customer, patient, or client messages your business from an Instagram post, LinkedIn carousel, or WhatsApp status, KUIRO automatically tags the lead, logs their inquiry or order interest, and calculates net revenue directly in your dashboard.',
    },
    {
      q: 'What is included in the 1-Click Creative Kit Asset Exporter?',
      a: 'On the Growth and Agency plans, KUIRO packages each campaign into a downloadable ZIP archive containing: 1) High-DPI 4:5 visual (1080x1350) for in-store TV screens & Instagram, 2) 1:1 Square card (1080x1080) for WhatsApp status & LinkedIn, 3) Responsive HTML email newsletter, 4) Social post captions & hashtags, and 5) Team briefing one-sheet (README_FOR_TEAM_AND_STAFF.txt).',
    },
    {
      q: 'How does KUIRO avoid the X (Twitter) link-penalty and $0.200 fee?',
      a: 'X’s recommendation algorithm penalizes posts containing outbound links by approximately 40% organic reach, while charging elevated API fees. KUIRO automatically enforces a smart guardrail: your core high-DPI graphic and hook are published in the main tweet, and your promotional or booking URL is published instantly as the verified first reply.',
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* 1. Top Notification Announcement Bar */}
      <AnnouncementBar
        badge="Transparent Pricing"
        tagline="14-Day Full Autopilot Free Trial."
        subtitle="— No credit card required. Cancel anytime."
      />

      {/* 2. Unified Sticky Navbar */}
      <Navbar activeRoute="pricing" badgeText="Pricing & Plans" statusText="14-Day Free Trial" />

      {/* 3. Hero Header Section */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-semibold tracking-wide">
            <TrendingUp className="h-4 w-4 text-[#FF7A00]" />
            <span>Unit Economics Designed for Indian SMBs & Creators</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-sora font-bold text-white tracking-tight leading-tight">
            Predictable Pricing. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] via-[#FFA34D] to-emerald-400">
              Zero Agency Retainers.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-inter leading-relaxed">
            Replace ₹40,000 to ₹1,00,000/mo manual agency retainers with your always-on marketing co-pilot on WhatsApp at 90%+ gross margin efficiency.
          </p>

          {/* Monthly / Annual Billing Toggle */}
          <div className="pt-6 flex items-center justify-center gap-3">
            <span className={`text-xs font-medium ${!annualBilling ? 'text-white' : 'text-slate-400'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-14 h-7 rounded-full bg-[#11141A] border border-white/20 p-1 flex items-center transition-colors focus:outline-none"
              aria-label="Toggle annual billing"
            >
              <div
                className={`w-5 h-5 rounded-full bg-[#FF7A00] transition-transform duration-200 ${
                  annualBilling ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${annualBilling ? 'text-white' : 'text-slate-400'}`}>
                Annual Billing
              </span>
              <span className="text-[10px] font-mono uppercase bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/40 px-2 py-0.5 rounded-full font-bold">
                Save 20% + 2 Months Free
              </span>
            </div>
          </div>

          {/* Trust Badges Strip */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400 font-mono">
            <span>✓ 14-Day Free Access</span>
            <span>✓ Zero Setup Fees</span>
            <span>✓ WhatsApp Instant Onboarding</span>
            <span>✓ GST Input Tax Credit (ITC)</span>
          </div>
        </div>
      </section>

      {/* 4. Three Core Pricing Cards */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Plan 1: Starter */}
          <div className="p-8 rounded-[20px] bg-[#0B0F14] border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all text-left">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Solopreneurs, Creators & Solo Brands
              </span>
              <h3 className="font-sora text-xl font-bold text-white mt-1">Starter (Autopilot Lite)</h3>
              <p className="text-xs text-slate-400 font-inter mt-1 leading-relaxed">
                For independent consultants, creators, boutique stores, and solo founders starting out.
              </p>

              <div className="mt-6 flex items-baseline gap-1.5 pb-6 border-b border-white/10">
                <span className="text-4xl font-bold font-sora text-white">
                  ₹{starterPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 font-mono">/month</span>
                <span className="text-[11px] text-slate-500 font-mono ml-auto">
                  {annualBilling ? `₹${(starterPrice * 12).toLocaleString('en-IN')}/yr` : 'Billed monthly'}
                </span>
              </div>

              <div className="mt-6 space-y-3 text-xs text-slate-300 font-inter">
                <p className="text-[11px] font-mono uppercase text-slate-400 font-bold">What is included:</p>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1 Brand Workspace</strong> with persistent Brand Brain in pgvector</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>3 Connected Social Channels</strong> (Instagram, Facebook, LinkedIn or X)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>15 Automated Posts / Month</strong> with high-DPI Satori graphics</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>2,500 Monthly Branded Email Newsletters</strong> (HTML via Resend)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>WhatsApp 48-Hour 1-Tap Review Cards</strong> (Silence = Consent)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1-Seat WhatsApp Customer Inbox</strong> (2 Smart Auto-Reply Flows)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Major National & Cultural Holiday Triggers (Diwali, Eid, Holi)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Standard Community & Email Support</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <button
                onClick={handleGetStarted}
                className="w-full py-3.5 rounded-[12px] bg-white/5 hover:bg-white/10 text-white text-xs font-semibold font-sora border border-white/10 transition text-center block shadow-sm"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Start 14-Day Free Trial'}
              </button>
              <p className="text-[10px] text-center text-slate-500 mt-2 font-mono">No credit card required</p>
            </div>
          </div>

          {/* Plan 2: Growth (Featured - Most Popular) */}
          <div className="p-8 rounded-[20px] bg-gradient-to-b from-[#141A24] via-[#0B0F14] to-[#0B0F14] border-2 border-[#FF7A00] flex flex-col justify-between relative shadow-2xl shadow-[#FF7A00]/20 scale-[1.02] text-left">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF7A00] text-white text-[10px] font-extrabold uppercase px-4 py-0.5 rounded-full tracking-wider shadow-md">
              Most Popular • Full Autopilot
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#FF7A00] font-bold block">
                Growing SMBs, Brands & Consultancies
              </span>
              <h3 className="font-sora text-xl font-bold text-white mt-1">Growth (Full Autopilot)</h3>
              <p className="text-xs text-slate-400 font-inter mt-1 leading-relaxed">
                For small businesses, retail stores, D2C brands, consulting firms, and active practices.
              </p>

              <div className="mt-6 flex items-baseline gap-1.5 pb-6 border-b border-white/10">
                <span className="text-4xl font-bold font-sora text-white">
                  ₹{growthPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 font-mono">/month</span>
                <span className="text-[11px] text-emerald-400 font-mono ml-auto">
                  {annualBilling ? `Save ₹6,000/yr` : 'Billed monthly'}
                </span>
              </div>

              <div className="mt-6 space-y-3 text-xs text-slate-300 font-inter">
                <p className="text-[11px] font-mono uppercase text-[#FF7A00] font-bold">Everything in Starter, plus:</p>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>1 Workspace & 3 Brand Profiles</strong> (e.g. Business + Founder Personal Brand)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>All 4 Channels Active</strong> (Instagram, Facebook, LinkedIn, X)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>Unlimited 365-Day Schedule + Daily Cron Trigger</strong> (0 0 * * *)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>100+ Regional Festivals across 28 Indian States</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>WhatsApp Voice Note Revisions</strong> in Hindi & English (&lt; 12s)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Live Campaign ROI & Lead Attribution Dashboard</strong> (Real Revenue)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1-Click Creative Kit Asset Exporter (ZIP)</strong> for in-store displays & TV</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>Indic Typography Engine</strong> (Bengali, Devanagari, Tamil pre-shaped)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>X First-Reply Link Guardrail</strong> (Saves $0.200 per tweet +40% reach)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>15,000 Monthly Branded Email Newsletters</strong> + Audience Segments</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>5-Seat Unified Multi-Channel Customer Inbox</strong> + Smart Flow Routing</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span>Priority WhatsApp & Email Support (&lt; 15 min response time)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <button
                onClick={handleGetStarted}
                className="w-full py-3.5 rounded-[12px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition text-center block shadow-lg shadow-[#FF7A00]/25 active:scale-95"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Start 14-Day Free Trial'}
              </button>
              <p className="text-[10px] text-center text-emerald-400 mt-2 font-mono">14 days full access • Cancel anytime</p>
            </div>
          </div>

          {/* Plan 3: Agency & Multi-Brand */}
          <div className="p-8 rounded-[20px] bg-[#0B0F14] border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all text-left">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Agencies, Multi-Brand & Multi-Location Ventures
              </span>
              <h3 className="font-sora text-xl font-bold text-white mt-1">Agency / Multi-Location</h3>
              <p className="text-xs text-slate-400 font-inter mt-1 leading-relaxed">
                For digital agencies managing 10 to 50 client retainers, franchises, and multi-brand networks.
              </p>

              <div className="mt-6 flex items-baseline gap-1.5 pb-6 border-b border-white/10">
                <span className="text-4xl font-bold font-sora text-white">
                  ₹{agencyPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 font-mono">/month</span>
                <span className="text-[11px] text-slate-500 font-mono ml-auto">
                  {annualBilling ? `Save ₹24,000/yr` : 'Billed monthly'}
                </span>
              </div>

              <div className="mt-6 space-y-3 text-xs text-slate-300 font-inter">
                <p className="text-[11px] font-mono uppercase text-slate-400 font-bold">Everything in Growth, plus:</p>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>10 Isolated Client Workspaces</strong> (Scale up to 50+)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Whitelabel WhatsApp Utility Templates</strong> with agency sender ID</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Dedicated Inngest Webhook Queues</strong> for instant processing</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Programmatic Remotion Video & Reels Engine</strong> with voiceover</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>100,000 Monthly Branded Emails</strong> + Custom Domain DKIM/SPF Setup</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Unlimited Unified Inbox Seats</strong> + Multi-Client Routing Flows</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Custom Invoicing, Volume Discounts & GST Tax Credit</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Dedicated Technical Account Manager & 99.9% Uptime SLA</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <Link
                href="/contact"
                className="w-full py-3.5 rounded-[12px] bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold font-sora transition text-center block shadow-sm"
              >
                Contact Agency Sales
              </Link>
              <p className="text-[10px] text-center text-slate-500 mt-2 font-mono">Custom client volume & volume billing</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Retainer ROI Savings Calculator */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="p-5 sm:p-8 md:p-12 rounded-[20px] bg-gradient-to-br from-[#0B0F14] via-[#121720] to-[#0B0F14] border border-white/15 relative shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A00]/15 text-[#FF7A00] text-xs font-semibold">
                <Calculator size={14} />
                <span>ROI & Retainer Savings Calculator</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-sora font-bold text-white tracking-tight">
                See How Much You Save vs. Traditional Retainers
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 font-inter leading-relaxed">
                Adjust your current monthly marketing spend on freelancers, graphic designers, social media agencies, or copywriters:
              </p>

              {/* Slider & Quick Buttons */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Current Monthly Spend:</span>
                  <span className="text-lg font-bold text-white">₹{currentAgencySpend.toLocaleString('en-IN')} / mo</span>
                </div>

                <input
                  type="range"
                  min="15000"
                  max="150000"
                  step="5000"
                  value={currentAgencySpend}
                  onChange={(e) => setCurrentAgencySpend(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FF7A00]"
                />

                <div className="flex flex-wrap gap-2 pt-1">
                  {[25000, 45000, 75000, 120000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setCurrentAgencySpend(amount)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                        currentAgencySpend === amount
                          ? 'bg-[#FF7A00] text-white font-bold'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      ₹{amount / 1000}k
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="lg:col-span-5 bg-[#0B0F14] p-6 rounded-[16px] border border-[#FF7A00]/40 space-y-4 text-center">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold block">
                Estimated Net Savings with KUIRO Growth
              </span>

              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-sora font-extrabold text-[#FF7A00] block">
                  ₹{monthlySavings.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 font-mono block">saved every month</span>
              </div>

              <div className="p-3 rounded-[10px] bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>₹{annualSavings.toLocaleString('en-IN')} Annual Savings ({percentSavings}%)</span>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-white/10 text-left font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Net Return Multiple:</span>
                  <span className="text-emerald-400 font-bold">{roiMultiplier}x ROI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time Saved Per Week:</span>
                  <span className="text-white font-bold">8+ Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">WhatsApp Revision Speed:</span>
                  <span className="text-white font-bold">&lt; 15 Seconds</span>
                </div>
              </div>

              <button
                onClick={handleGetStarted}
                className="w-full py-3.5 rounded-[12px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition block shadow-md shadow-[#FF7A00]/25"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Claim Your Savings with Free Trial'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Comprehensive Feature Comparison Matrix */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/10">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
            Feature Breakdown
          </span>
          <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight">
            Compare Plan Capabilities
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto font-inter">
            Every plan includes our persistent Brand Brain and WhatsApp approval engine with no hidden charges.
          </p>
        </div>

        {/* Mobile Table Swipe Hint */}
        <div className="sm:hidden text-center text-[10px] text-slate-500 font-mono mb-2">
          ← Swipe table sideways to compare all plans →
        </div>

        <div className="rounded-[18px] overflow-hidden border border-white/15 bg-[#0B0F14]">
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full min-w-[640px] text-xs text-left">
              <thead className="bg-[#11141A] text-[10px] font-mono uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="p-4 font-bold text-white w-2/5">Capabilities</th>
                  <th className="p-4 font-bold text-slate-300 w-1/5 text-center">Starter</th>
                  <th className="p-4 font-bold text-[#FF7A00] w-1/5 text-center bg-[#FF7A00]/10">Growth</th>
                  <th className="p-4 font-bold text-slate-300 w-1/5 text-center">Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-inter">
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
                  <td className="p-4 text-center text-emerald-400 font-semibold bg-[#FF7A00]/5">100+ Events (28 States)</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">100+ Events (28 States)</td>
                </tr>

                {/* Section 3: Campaign ROI & Lead Attribution (NEW) */}
                <tr className="bg-white/[0.02]">
                  <td colSpan={4} className="p-3 text-[11px] font-mono font-bold text-[#FF7A00] uppercase tracking-wider">
                    3. Campaign ROI & Lead Attribution (NEW)
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
                  <td className="p-4 text-slate-200">Realized Revenue & Conversion Multiplier Readout</td>
                  <td className="p-4 text-center text-slate-500">—</td>
                  <td className="p-4 text-center text-emerald-400 bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                </tr>

                {/* Section 4: Creative Compositing & Creative Kit Exporter (NEW) */}
                <tr className="bg-white/[0.02]">
                  <td colSpan={4} className="p-3 text-[11px] font-mono font-bold text-[#FF7A00] uppercase tracking-wider">
                    4. Creative Studio & Asset Exporter (NEW)
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
                  <td className="p-4 text-slate-200">Team Collaboration & Internal Notes (@mentions)</td>
                  <td className="p-4 text-center text-slate-500">—</td>
                  <td className="p-4 text-center text-emerald-400 bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
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

      {/* 7. Frequently Asked Questions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-left">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
            Got Questions?
          </span>
          <h2 className="text-3xl font-sora font-bold text-white tracking-tight">
            Frequently Asked Pricing Questions
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-inter">
            Everything you need to know about our plans, billing, and autonomous execution.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-[14px] bg-[#0B0F14] border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 focus:outline-none font-sora font-semibold text-sm sm:text-base text-white hover:text-[#FF7A00] transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-[#FF7A00] shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-300 font-inter leading-relaxed border-t border-white/5 pt-3 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Bottom Conversion Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-[20px] bg-gradient-to-br from-[#0B0F14] via-[#1A1208] to-[#0B0F14] border-2 border-[#FF7A00]/40 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] text-xs font-semibold">
              <Sparkles size={13} />
              <span>Start Your 14-Day Free Trial</span>
            </span>

            <h2 className="font-sora text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Put your marketing <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] via-[#FFA34D] to-emerald-400">
                on autopilot today.
              </span>
            </h2>

            <p className="text-sm text-slate-300 font-inter leading-relaxed">
              No credit card required. Experience your first WhatsApp campaign review in less than 5 minutes.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-7 py-3.5 rounded-[12px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-sm font-sora font-semibold transition shadow-lg shadow-[#FF7A00]/30 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{isLoggedIn ? 'Go to Dashboard' : 'Launch Free Trial (₹0)'}</span>
                <ArrowRight size={15} />
              </button>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 py-3.5 rounded-[12px] bg-white text-[#0B0F14] hover:bg-gray-100 text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                <span>Talk to Sales</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Unified Global Footer */}
      <Footer />
    </div>
  );
}
