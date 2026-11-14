'use client';

import React, { useState, useEffect } from 'react';
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
  Menu, 
  MessageCircle, 
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
  Info
} from 'lucide-react';

export default function PricingPage() {
  const { isLoggedIn, handleGetStarted } = useAuth();
  const [annualBilling, setAnnualBilling] = useState(true);
  const [currentAgencySpend, setCurrentAgencySpend] = useState(45000); // INR per month
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const calculateSavings = () => {
    const kuiroMonthlyCost = annualBilling ? 2799 : 3499;
    const monthlySavings = Math.max(0, currentAgencySpend - kuiroMonthlyCost);
    const annualSavings = monthlySavings * 12;
    const percentSavings = Math.round((monthlySavings / currentAgencySpend) * 100);
    return { monthlySavings, annualSavings, percentSavings };
  };

  const { monthlySavings, annualSavings, percentSavings } = calculateSavings();

  const faqs = [
    {
      q: 'How does the 14-day risk-free trial work?',
      a: 'You can launch your Brand Brain and simulate your 4-channel WhatsApp approval workflow for 14 days without paying anything. No credit card is required to sign up. You only select a plan when you are ready to publish live to your social media accounts.'
    },
    {
      q: 'How does the 48-Hour WhatsApp Auto-Commit loop work?',
      a: '48 hours before any campaign date, KUIRO generates your complete multi-channel visual assets and copy, sending a 2x2 contact sheet directly to your WhatsApp. You can tap "Approve", reply with a quick Hindi or English voice note to make revisions, or do nothing. If no revision is requested within 48 hours, KUIRO auto-commits and safely publishes at T-0.'
    },
    {
      q: 'Can I really send voice notes in Hindi to revise my posts?',
      a: 'Yes! KUIRO integrates Whisper and Gemini Multimodal Audio to transcribe natural speech in Hindi, Indian English, and regional languages. Simply say: "Headline thoda bold karo aur emergency helpline number add karo." The AI critic re-composites your high-DPI graphic and copy in less than 12 seconds.'
    },
    {
      q: 'How does KUIRO avoid the X (Twitter) link-penalty?',
      a: 'X’s recommendation algorithm penalizes posts containing outbound links by approximately 40% reach. KUIRO automatically enforces a smart guardrail: your core graphic and value hook are published in the main tweet, and your promotional or booking URL is published instantly as the verified first reply.'
    },
    {
      q: 'Can digital marketing agencies whitelabel KUIRO for their clients?',
      a: 'Yes. The Agency plan includes 10 isolated workspaces with tenant-level data segregation, custom agency branding, dedicated Inngest webhook queues, and whitelabeled WhatsApp utility templates with your agency’s sender ID.'
    },
    {
      q: 'Do you provide GST invoices for Indian businesses?',
      a: 'Absolutely. All plans for Indian businesses include automated GST-compliant tax invoices with input tax credit (ITC) details sent directly to your registered billing email.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* Top Notification Announcement Bar */}
      <AnnouncementBar 
        badge="14-Day Risk-Free Trial" 
        tagline="No credit card required." 
        subtitle="— Full access to WhatsApp 48h loop & Brand Brain." 
      />

      {/* Main Sticky Navbar */}
      <Navbar activeRoute="pricing" badgeText="Transparent Pricing" statusText="14-Day Free Trial" />

      {/* Pricing Hero Header */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-950/80 border border-orange-700/50 text-orange-300 text-xs sm:text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-[#FF7A00]" />
            <span>Unit Economics Designed for Indian SMBs</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-sora font-bold text-white tracking-tight leading-tight">
            Predictable Pricing. <br />
            <span className="text-[#FF7A00]">Zero Agency Retainers.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-inter leading-relaxed">
            Replace ₹40,000/mo agency retainers with your always-on AI marketing employee at 90%+ gross margin efficiency.
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
        </div>
      </section>

      {/* 3 Core Pricing Cards */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Starter Plan */}
          <div className="p-8 rounded-[16px] bg-[#0B0F14] border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Individuals, Creators, Solopreneurs & Small Shops
              </span>
              <h3 className="font-sora text-xl font-bold text-white mt-1">Starter (Autopilot Lite)</h3>
              <p className="text-xs text-slate-400 font-inter mt-1">
                For solopreneurs, independent creators, consultants, boutique stores, and solo founders.
              </p>

              <div className="mt-6 flex items-baseline gap-1.5 pb-6 border-b border-white/10">
                <span className="text-4xl font-bold font-inter text-white">
                  {annualBilling ? '₹1,199' : '₹1,499'}
                </span>
                <span className="text-xs text-slate-400 font-mono">/month</span>
                <span className="text-[11px] text-slate-500 font-mono ml-auto">
                  {annualBilling ? '₹14,388/yr' : 'Billed monthly'}
                </span>
              </div>

              <div className="mt-6 space-y-3 text-xs text-slate-300 font-inter">
                <p className="text-[11px] font-mono uppercase text-slate-400 font-bold">What is included:</p>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1 Brand Workspace</strong> with persistent Brand Brain</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>3 Social Channels</strong> (Instagram, Facebook, LinkedIn or X)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>15 Automated Posts / Month</strong> with high-DPI Satori graphics</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>2,500 Monthly Branded Email Newsletters</strong> (Resend / SES)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1-Seat WhatsApp Customer Inbox</strong> (2 Smart Auto-Reply Flows)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Major National & Cultural Festival Triggers (Diwali, Eid, Holi)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>WhatsApp 48-Hour Interactive Review Cards</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Community & Standard Email Support</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <button
                onClick={handleGetStarted}
                className="w-full py-3 rounded-[10px] bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition text-center block shadow-sm"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Start 14-Day Free Trial'}
              </button>
              <p className="text-[10px] text-center text-slate-500 mt-2 font-mono">No credit card required</p>
            </div>
          </div>

          {/* Growth Plan (Featured - Most Popular) */}
          <div className="p-8 rounded-[16px] bg-[#0B0F14] border-2 border-[#FF7A00] flex flex-col justify-between relative shadow-2xl shadow-[#FF7A00]/15 scale-[1.02]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF7A00] text-white text-[10px] font-extrabold uppercase px-4 py-0.5 rounded-full tracking-wider shadow-md">
              Most Popular • Full Autopilot
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#FF7A00] font-bold block">
                Growing SMBs, Brands & Consultancies
              </span>
              <h3 className="font-sora text-xl font-bold text-white mt-1">Growth (Full Autopilot)</h3>
              <p className="text-xs text-slate-400 font-inter mt-1">
                For small & medium businesses, retail stores, D2C brands, consulting firms, and active practices.
              </p>

              <div className="mt-6 flex items-baseline gap-1.5 pb-6 border-b border-white/10">
                <span className="text-4xl font-bold font-inter text-white">
                  {annualBilling ? '₹2,799' : '₹3,499'}
                </span>
                <span className="text-xs text-slate-400 font-mono">/month</span>
                <span className="text-[11px] text-emerald-400 font-mono ml-auto">
                  {annualBilling ? 'Save ₹8,400/yr' : 'Billed monthly'}
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
                  <span><strong>Unlimited 365-Day Autopilot Scheduling</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>100+ Pan-India & 28 State Regional Cultural Calendar</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>WhatsApp Voice Note Revisions</strong> in Hindi & English (&lt; 12s)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>X First-Reply Link Placement Guardrail</strong> (Bypasses reach penalty)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>15,000 Monthly Branded Email Newsletters</strong> + Audience Segmentation</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                  <span><strong>5-Seat Unified Multi-Channel Inbox</strong> (WhatsApp, IG, Messenger, Email) + Smart Routing</span>
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
                className="w-full py-3.5 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition text-center block shadow-lg shadow-[#FF7A00]/25 active:scale-95"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Start 14-Day Free Trial'}
              </button>
              <p className="text-[10px] text-center text-emerald-400 mt-2 font-mono">14 days full access • Cancel anytime</p>
            </div>
          </div>

          {/* Agency Plan */}
          <div className="p-8 rounded-[16px] bg-[#0B0F14] border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Agencies, Multi-Brand & Multi-Location Ventures
              </span>
              <h3 className="font-sora text-xl font-bold text-white mt-1">Agency / Multi-Location</h3>
              <p className="text-xs text-slate-400 font-inter mt-1">
                For digital marketing agencies managing 10 to 50 client retainers, franchises, and multi-brand networks.
              </p>

              <div className="mt-6 flex items-baseline gap-1.5 pb-6 border-b border-white/10">
                <span className="text-4xl font-bold font-inter text-white">
                  {annualBilling ? '₹11,999' : '₹14,999'}
                </span>
                <span className="text-xs text-slate-400 font-mono">/month</span>
                <span className="text-[11px] text-slate-500 font-mono ml-auto">
                  {annualBilling ? 'Save ₹36,000/yr' : 'Billed monthly'}
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
                  <span><strong>Unlimited Unified Inbox Seats</strong> + Multi-Client Routing Flows & CRM Analytics</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Priority Headless Chromium Fallback for Complex Regional Ligatures</span>
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
                className="w-full py-3 rounded-[10px] bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition text-center block shadow-sm"
              >
                Contact Agency Sales
              </Link>
              <p className="text-[10px] text-center text-slate-500 mt-2 font-mono">Custom client volume & GST billing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Savings & ROI Calculator */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="p-5 sm:p-8 md:p-12 rounded-[20px] bg-gradient-to-br from-[#0B0F14] via-[#121720] to-[#0B0F14] border border-white/15 relative shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A00]/15 text-[#FF7A00] text-xs font-semibold">
                <Calculator size={14} />
                <span>ROI & Retainer Savings Calculator</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-sora font-bold text-white tracking-tight">
                See How Much You Save vs. Traditional Retainers
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 font-inter">
                Adjust your current monthly marketing spend on graphic designers, social media agencies, or copywriters:
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

              <p className="text-[11px] text-slate-400 font-inter leading-snug">
                Plus zero review friction, 12s voice revisions, and 100% 365-day posting consistency.
              </p>

              <button
                onClick={handleGetStarted}
                className="w-full py-3 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition block shadow-md shadow-[#FF7A00]/25"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Claim Your Savings with Free Trial'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Feature Comparison Matrix */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/10">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
            Feature Breakdown
          </span>
          <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight mt-1">
            Compare Plan Capabilities
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto font-inter">
            Every plan includes our core Brand Brain and WhatsApp approval engine with no hidden charges.
          </p>
        </div>

        {/* Mobile Table Swipe Hint */}
        <div className="sm:hidden text-center text-[10px] text-slate-500 font-mono mb-2">
          ← Swipe table sideways to compare all plans →
        </div>

        <div className="rounded-[16px] overflow-hidden border border-white/15 bg-[#0B0F14]">
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
              <tbody className="divide-y border-white/5 font-inter">
                {/* Section 1: Workspaces & Channels */}
                <tr className="bg-white/[0.02]">
                  <td colSpan={4} className="p-3 text-[11px] font-mono font-bold text-[#FF7A00] uppercase tracking-wider">
                    Workspaces & Distribution Channels
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
                  <td className="p-4 text-slate-200">Monthly Post Volume</td>
                  <td className="p-4 text-center text-slate-300">15 Posts / mo</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold bg-[#FF7A00]/5">Unlimited 365-Day Schedule</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">Unlimited Multi-Client</td>
                </tr>

                {/* Section 2: AI & WhatsApp Approval */}
                <tr className="bg-white/[0.02]">
                  <td colSpan={4} className="p-3 text-[11px] font-mono font-bold text-[#FF7A00] uppercase tracking-wider">
                    AI Knowledge & Approval Protocol
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">The Brand Brain (Vector Knowledge Base)</td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400 bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">WhatsApp 48-Hour Auto-Commit Bot</td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400 bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Whisper Voice Note Revisions (Hindi/English)</td>
                  <td className="p-4 text-center text-slate-500">—</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold bg-[#FF7A00]/5">&lt; 12s Regeneration</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">&lt; 12s Regeneration</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">365-Day Regional Cultural Radar</td>
                  <td className="p-4 text-center text-slate-300">National Only</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold bg-[#FF7A00]/5">100+ Events (28 States)</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">100+ Events (28 States)</td>
                </tr>

                {/* Section 3: Creative & Media */}
                <tr className="bg-white/[0.02]">
                  <td colSpan={4} className="p-3 text-[11px] font-mono font-bold text-[#FF7A00] uppercase tracking-wider">
                    Creative Compositing & Media Formats
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">High-DPI Satori & Sharp Compositing</td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400 bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Indic Ligature Shaping (Hindi, Bengali, Tamil)</td>
                  <td className="p-4 text-center text-slate-500">—</td>
                  <td className="p-4 text-center text-emerald-400 bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Remotion Short Video & Reels Pipeline</td>
                  <td className="p-4 text-center text-slate-500">—</td>
                  <td className="p-4 text-center text-slate-500 bg-[#FF7A00]/5">—</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">ElevenLabs Voiceover</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">X First-Reply Link Guardrail</td>
                  <td className="p-4 text-center text-slate-500">—</td>
                  <td className="p-4 text-center text-emerald-400 bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Autonomous Email Newsletters (HTML via Resend/SES)</td>
                  <td className="p-4 text-center text-slate-300 font-mono">2,500 / mo</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold bg-[#FF7A00]/5 font-mono">15,000 / mo</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold font-mono">100,000 / mo</td>
                </tr>

                {/* Section 4: Customer Inbox & Smart Routing */}
                <tr className="bg-white/[0.02]">
                  <td colSpan={4} className="p-3 text-[11px] font-mono font-bold text-[#FF7A00] uppercase tracking-wider">
                    Unified Multi-Channel Inbox & Smart Routing
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Unified Multi-Channel Inbox</td>
                  <td className="p-4 text-center text-slate-300">WhatsApp Only (1 Seat)</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold bg-[#FF7A00]/5">4 Channels (5 Seats)</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">4 Channels (Unlimited Seats)</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Smart Keyword & Off-Hours Routing Flows</td>
                  <td className="p-4 text-center text-slate-300">2 Basic Flows</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold bg-[#FF7A00]/5">Unlimited Flows</td>
                  <td className="p-4 text-center text-emerald-400 font-semibold">Multi-Client Flows</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Team Collaboration & Private Internal Notes</td>
                  <td className="p-4 text-center text-slate-500">—</td>
                  <td className="p-4 text-center text-emerald-400 bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-200">Campaign Attribution & CRM Contact Drawer</td>
                  <td className="p-4 text-center text-slate-500">—</td>
                  <td className="p-4 text-center text-emerald-400 bg-[#FF7A00]/5"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check size={16} className="mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
            Got Questions?
          </span>
          <h2 className="text-3xl font-sora font-bold text-white tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            Everything you need to know about our plans, billing, and autonomous execution.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-[12px] bg-[#0B0F14] border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-sora font-semibold text-sm text-white">{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} className="text-[#FF7A00] shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-slate-300 font-inter leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-[20px] bg-gradient-to-br from-[#0B0F14] via-[#1A1208] to-[#0B0F14] border-2 border-[#FF7A00]/40 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] text-xs font-semibold">
              <Sparkles size={13} />
              <span>Start Your 14-Day Free Trial</span>
            </span>

            <h2 className="font-sora text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Put your marketing <br />
              <span className="text-[#FF7A00]">on autopilot today.</span>
            </h2>

            <p className="text-sm text-slate-300 font-inter leading-relaxed">
              No credit card required. Experience your first WhatsApp campaign review in less than 5 minutes.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-7 py-3.5 rounded-[12px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-sm font-sora font-semibold transition shadow-lg shadow-[#FF7A00]/30 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{isLoggedIn ? 'Go to Dashboard' : 'Launch Free Trial'}</span>
                <ArrowRight size={15} />
              </button>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 py-3.5 rounded-[12px] bg-white text-[#0B0F14] hover:bg-gray-100 text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                <span>Talk to Sales</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

