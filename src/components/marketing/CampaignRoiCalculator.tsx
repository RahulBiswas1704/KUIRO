'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  Building2,
  Users,
  Smartphone,
  Share2,
  Zap,
  BarChart3,
  Download
} from 'lucide-react';
import ExecutiveRoiExporterModal from '@/components/dashboard/ExecutiveRoiExporterModal';
import { useAuth } from '@/context/AuthContext';

interface IndustryPreset {
  name: string;
  emoji: string;
  aov: number;
  inquiries: number;
  closeRate: number;
  agencySpend: number;
  sampleDeal: string;
}

const PRESETS: Record<string, IndustryPreset> = {
  retail: {
    name: 'Retail & Local Commerce',
    emoji: '🛍️',
    aov: 3200,
    inquiries: 65,
    closeRate: 20,
    agencySpend: 35000,
    sampleDeal: 'Festive apparel, jewellery, specialty groceries & boutique gifts',
  },
  artisan: {
    name: 'Artisan Handlooms & Luxury Craft',
    emoji: '🧵',
    aov: 16500,
    inquiries: 40,
    closeRate: 22,
    agencySpend: 55000,
    sampleDeal: 'Pure silk Banarasi sarees, bespoke bridal stoles & volume gifting sets',
  },
  advisory: {
    name: 'B2B Advisory, Tech & Founders',
    emoji: '🚀',
    aov: 48000,
    inquiries: 25,
    closeRate: 15,
    agencySpend: 65000,
    sampleDeal: 'Quarterly executive coaching, B2B growth sprints & retainers',
  },
  practice: {
    name: 'Professional Practice & Studio',
    emoji: '🩺',
    aov: 7500,
    inquiries: 50,
    closeRate: 26,
    agencySpend: 45000,
    sampleDeal: 'Architecture consultations, wellness packages & diagnostic screenings',
  },
};

export default function CampaignRoiCalculator() {
  const { isLoggedIn, handleGetStarted } = useAuth();
  const [selectedIndustry, setSelectedIndustry] = useState<string>('artisan');

  // Interactive Sliders State
  const [inquiriesPerMonth, setInquiriesPerMonth] = useState<number>(PRESETS.artisan.inquiries);
  const [averageOrderValue, setAverageOrderValue] = useState<number>(PRESETS.artisan.aov);
  const [conversionRate, setConversionRate] = useState<number>(PRESETS.artisan.closeRate);
  const [currentAgencySpend, setCurrentAgencySpend] = useState<number>(PRESETS.artisan.agencySpend);
  const [copiedReport, setCopiedReport] = useState(false);
  const [isExporterOpen, setIsExporterOpen] = useState(false);

  // KUIRO Growth Autopilot Plan Price
  const KUIRO_GROWTH_PRICE = 2299; // INR/month on annual billing

  // Math Calculations
  const payingCustomers = Math.max(1, Math.round(inquiriesPerMonth * (conversionRate / 100)));
  const monthlyAttributedRevenue = payingCustomers * averageOrderValue;
  const annualAttributedRevenue = monthlyAttributedRevenue * 12;

  const monthlyAgencySavings = Math.max(0, currentAgencySpend - KUIRO_GROWTH_PRICE);
  const annualAgencySavings = monthlyAgencySavings * 12;

  const combinedMonthlyValue = monthlyAttributedRevenue + monthlyAgencySavings;
  const combinedAnnualValue = annualAttributedRevenue + annualAgencySavings;
  const roiMultiple = (combinedMonthlyValue / KUIRO_GROWTH_PRICE).toFixed(1);

  // Apply Industry Preset
  const handleSelectPreset = (key: string) => {
    setSelectedIndustry(key);
    const p = PRESETS[key];
    if (p) {
      setInquiriesPerMonth(p.inquiries);
      setAverageOrderValue(p.aov);
      setConversionRate(p.closeRate);
      setCurrentAgencySpend(p.agencySpend);
    }
  };

  const handleCopyReport = () => {
    const report = `📊 KUIRO Campaign ROI Forecast for ${PRESETS[selectedIndustry]?.name || 'My Business'}:
• Monthly Attributed Revenue: ₹${monthlyAttributedRevenue.toLocaleString('en-IN')} (${payingCustomers} customers @ ₹${averageOrderValue.toLocaleString('en-IN')})
• Annual Pipeline Revenue: ₹${annualAttributedRevenue.toLocaleString('en-IN')}
• Monthly Retainer Savings: ₹${monthlyAgencySavings.toLocaleString('en-IN')}
• Net Economic Multiplier: ${roiMultiple}x ROI
• Calculated via KUIRO: https://kuiro.vercel.app/pricing`;

    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText?.(report);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    }
  };

  return (
    <div className="rounded-[24px] bg-gradient-to-br from-[#0B0F14] via-[#101722] to-[#070B10] border border-white/15 p-6 sm:p-10 shadow-2xl relative overflow-hidden text-left font-inter">
      {/* Background Ambient Glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Preset Switcher */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A00]/15 text-[#FF7A00] text-xs font-semibold">
            <Calculator size={14} />
            <span>Dual-Engine Value Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-sora font-bold text-white tracking-tight mt-2">
            Campaign ROI &amp; Revenue Attribution Calculator
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Calculate your combined financial return: <strong>New Inbound Customer Revenue</strong> attributed from WhatsApp &amp; social campaigns plus <strong>Agency Retainer Savings</strong>.
          </p>
        </div>

        {/* 1-Click Copy Forecast */}
        <button
          type="button"
          onClick={handleCopyReport}
          className="px-3.5 py-2 rounded-[10px] bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition flex items-center gap-1.5 shrink-0 self-start md:self-auto cursor-pointer"
        >
          {copiedReport ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          <span>{copiedReport ? 'Copied ROI Forecast!' : 'Share ROI Forecast'}</span>
        </button>
      </div>

      {/* Industry Archetype Selector */}
      <div className="relative z-10 pt-6">
        <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block mb-2.5">
          Select Your Industry Model:
        </span>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {Object.entries(PRESETS).map(([key, p]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectPreset(key)}
              className={`p-3 rounded-[12px] border text-left transition flex items-center gap-2.5 cursor-pointer ${
                selectedIndustry === key
                  ? 'bg-gradient-to-r from-[#FF7A00]/20 to-orange-950/30 border-[#FF7A00] text-white shadow-md'
                  : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
              }`}
            >
              <span className="text-xl shrink-0">{p.emoji}</span>
              <div className="truncate">
                <span className="text-xs font-bold font-sora block truncate text-white">{p.name}</span>
                <span className="text-[10px] text-slate-400 font-mono block">AOV: ₹{p.aov.toLocaleString('en-IN')}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Controls & Live Output Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-8">
        {/* Left Column (7 Cols): 4 Real-Time Sliders */}
        <div className="lg:col-span-7 space-y-6">
          {/* Slider 1: Monthly Inbound Inquiries */}
          <div className="p-4 rounded-[14px] bg-white/[0.02] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Users size={14} className="text-[#FF7A00]" />
                <span>Monthly Inbound Inquiries (WhatsApp, DMs, Email)</span>
              </span>
              <span className="font-mono text-sm font-bold text-white">{inquiriesPerMonth} Leads / mo</span>
            </div>
            <input
              type="range"
              min="10"
              max="250"
              step="5"
              value={inquiriesPerMonth}
              onChange={(e) => setInquiriesPerMonth(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FF7A00]"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>10 solo leads</span>
              <span>120 scaling brand</span>
              <span>250+ high velocity</span>
            </div>
          </div>

          {/* Slider 2: Average Order / Transaction Value */}
          <div className="p-4 rounded-[14px] bg-white/[0.02] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-400" />
                <span>Average Transaction / Customer Value (AOV)</span>
              </span>
              <span className="font-mono text-sm font-bold text-emerald-400">
                ₹{averageOrderValue.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={averageOrderValue}
              onChange={(e) => setAverageOrderValue(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>₹1k Retail</span>
              <span>₹25k Bespoke Silk / Luxury</span>
              <span>₹1,00,000 High-Ticket / B2B</span>
            </div>
          </div>

          {/* Slider 3: Conversion Rate */}
          <div className="p-4 rounded-[14px] bg-white/[0.02] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <TrendingUp size={14} className="text-[#FF7A00]" />
                <span>Lead-to-Order Conversion Rate (WhatsApp Utility Closes)</span>
              </span>
              <span className="font-mono text-sm font-bold text-[#FF7A00]">{conversionRate}% Close Rate</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={conversionRate}
              onChange={(e) => setConversionRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FF7A00]"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>5% Cold web form</span>
              <span>18% Standard WhatsApp</span>
              <span>40% Repeat / High intent</span>
            </div>
          </div>

          {/* Slider 4: Current Monthly Agency / Freelancer Spend */}
          <div className="p-4 rounded-[14px] bg-white/[0.02] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Building2 size={14} className="text-sky-400" />
                <span>Current Monthly Agency / Graphic Retainer Spend</span>
              </span>
              <span className="font-mono text-sm font-bold text-sky-300">
                ₹{currentAgencySpend.toLocaleString('en-IN')} / mo
              </span>
            </div>
            <input
              type="range"
              min="15000"
              max="150000"
              step="5000"
              value={currentAgencySpend}
              onChange={(e) => setCurrentAgencySpend(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>₹15k Part-time freelancer</span>
              <span>₹50k Boutique agency</span>
              <span>₹1.5L Full-service team</span>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Live Dynamic Output Matrix */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#141A24] via-[#0E131B] to-[#0A0D12] p-6 rounded-[20px] border-2 border-[#FF7A00] shadow-2xl relative space-y-5 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono tracking-wider">
            <Zap size={11} className="text-emerald-400 fill-emerald-400" />
            <span>ESTIMATED FINANCIAL ADVANTAGE</span>
          </div>

          {/* Big Multiplier Badge */}
          <div className="space-y-1">
            <span className="text-4xl sm:text-5xl font-extrabold font-sora text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] via-amber-300 to-emerald-400 block tracking-tight">
              {roiMultiple}x ROI
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Net Financial Multiple vs. KUIRO ₹{KUIRO_GROWTH_PRICE.toLocaleString('en-IN')}/mo
            </span>
          </div>

          {/* Breakdown Metric Cards */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 text-left">
            <div className="p-3 rounded-[12px] bg-white/[0.04] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Attributed Revenue:</span>
              <span className="text-lg font-bold font-sora text-emerald-400 block">
                ₹{monthlyAttributedRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                {payingCustomers} orders @ ₹{averageOrderValue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 rounded-[12px] bg-white/[0.04] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Retainer Savings:</span>
              <span className="text-lg font-bold font-sora text-amber-300 block">
                ₹{monthlyAgencySavings.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                saved every month
              </span>
            </div>
          </div>

          {/* Annualized Economic Impact Banner */}
          <div className="p-3.5 rounded-[14px] bg-gradient-to-r from-emerald-950/50 to-slate-900 border border-emerald-500/30 text-left space-y-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Annual Combined Advantage:</span>
              </span>
              <span className="text-sm font-sora">₹{combinedAnnualValue.toLocaleString('en-IN')} / yr</span>
            </div>
            <p className="text-[10px] text-slate-300 font-inter leading-relaxed">
              Includes ₹{annualAttributedRevenue.toLocaleString('en-IN')} projected top-line pipeline + ₹{annualAgencySavings.toLocaleString('en-IN')} direct cost reduction.
            </p>
          </div>

          {/* Verified Features Strip */}
          <div className="text-left text-xs font-mono text-slate-300 space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">WhatsApp 48-Hour Review:</span>
              <span className="text-white font-bold">&lt; 15s Revisions</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Campaign Attribution:</span>
              <span className="text-emerald-400 font-bold">100% UTM &amp; WA Tagged</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Time Saved Per Week:</span>
              <span className="text-white font-bold">8+ Hours</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleGetStarted}
              className="w-full py-3.5 rounded-[12px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition block shadow-lg shadow-[#FF7A00]/25 active:scale-95 cursor-pointer"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Claim 14-Day Free Autopilot Trial'}
            </button>
            <button
              type="button"
              onClick={() => setIsExporterOpen(true)}
              className="w-full py-2.5 rounded-[12px] bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={13} className="text-[#FF7A00]" />
              <span>Export Executive ROI (PDF/CSV)</span>
            </button>
            <p className="text-[10px] text-slate-400 mt-2 font-mono text-center">
              No credit card required • 14 days risk-free
            </p>
          </div>
        </div>
      </div>

      {/* Executive ROI Exporter Modal */}
      <ExecutiveRoiExporterModal
        isOpen={isExporterOpen}
        onClose={() => setIsExporterOpen(false)}
        businessName={`${PRESETS[selectedIndustry]?.name || 'Enterprise'} Studio`}
        roiData={{
          totalPipelineValue: monthlyAttributedRevenue,
          totalRealizedRevenue: Math.round(monthlyAttributedRevenue * 0.75),
          totalAttributedLeads: inquiriesPerMonth,
          totalAppointmentsBooked: payingCustomers,
          estimatedAgencySavings: monthlyAgencySavings,
          netRoiMultiplier: Number(roiMultiple) || 12.5,
          campaignBreakdown: [
            {
              campaignId: 'calc-1',
              topicSummary: `${PRESETS[selectedIndustry]?.name || 'Seasonal'} Autonomous Broadcast`,
              publishAt: 'Scheduled (48h Protocol)',
              realizedRevenue: Math.round(monthlyAttributedRevenue * 0.6),
              inquiriesCount: Math.round(inquiriesPerMonth * 0.6),
              appointmentsBookedCount: Math.round(payingCustomers * 0.6),
              status: 'AUTO_QUEUED',
            },
            {
              campaignId: 'calc-2',
              topicSummary: 'WhatsApp High-Intent Lead Conversion Stream',
              publishAt: 'Daily Automated Trigger',
              realizedRevenue: Math.round(monthlyAttributedRevenue * 0.4),
              inquiriesCount: Math.round(inquiriesPerMonth * 0.4),
              appointmentsBookedCount: Math.round(payingCustomers * 0.4),
              status: 'PUBLISHED',
            },
          ],
        }}
      />
    </div>
  );
}
