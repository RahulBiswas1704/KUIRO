'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AnnouncementBar, Navbar, Footer } from '@/components/layout';
import {
  FloatingInstagramCard,
  FloatingLinkedInCard,
  FloatingWhatsAppCard,
  FloatingXCard,
  FloatingEmailNewsletterCard
} from '@/components/marketing/HeroMockups';
import InteractiveFestivalGenerator from '@/components/marketing/InteractiveFestivalGenerator';
import SmbVerticalUseCases from '@/components/marketing/SmbVerticalUseCases';
import WorkflowTimeline from '@/components/marketing/WorkflowTimeline';
import {
  CheckCircle2,
  Sparkles,
  Send,
  Mic,
  Calendar,
  ShieldCheck,
  Share2,
  Layers,
  ArrowRight,
  Smartphone,
  Flame,
  Globe2,
  RefreshCw,
  ExternalLink,
  Check,
  Instagram,
  Linkedin,
  Twitter,
  Clock,
  Zap,
  Lock,
  ChevronRight,
  TrendingUp,
  Award,
  Mail,
  Play,
  RotateCcw,
  Cpu,
  FileCheck,
  CheckCheck,
  MessagesSquare,
  ChevronDown,
  Calculator,
  Star,
  Bot,
  User,
  Users,
  Building2,
  Stethoscope,
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  HelpCircle,
  PhoneCall,
  Download,
  Archive,
  BarChart3,
  DollarSign,
  Monitor,
  Activity,
  FileText
} from 'lucide-react';

export default function RedesignedHomePage() {
  const { isLoggedIn, handleGetStarted } = useAuth();

  // 1. Hero Brand Brain Scanner State
  const [websiteUrl, setWebsiteUrl] = useState('https://kolkatachai.co');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSuccess, setExtractedSuccess] = useState(false);
  const [extractionStep, setExtractionStep] = useState(0);

  // 2. Interactive Product Showcase Tab State
  const [showcaseTab, setShowcaseTab] = useState<'roi' | 'export' | 'whatsapp' | 'omni'>('roi');

  // 3. WhatsApp 48-Hour Approval Simulator State
  const [approvalStatus, setApprovalStatus] = useState<'AUTO_QUEUED' | 'APPROVED' | 'REVISED'>('AUTO_QUEUED');
  const [simulatedVoiceNote, setSimulatedVoiceNote] = useState(false);
  const [voiceNotePlayed, setVoiceNotePlayed] = useState(false);

  // 4. Creative Kit Asset Exporter Simulator State
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipExported, setZipExported] = useState(false);

  // 5. Multi-Tenant Persona Simulator State (Universal: Retail SMB, Personal Brand, Professional, Lifestyle)
  const [activePersona, setActivePersona] = useState<'smb' | 'creator' | 'practice' | 'lifestyle'>('smb');

  // 6. Interactive Retainer ROI Calculator State
  const [monthlySpend, setMonthlySpend] = useState<number>(45000);

  // 7. FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Brand Brain Extraction Simulator Handler
  const handleExtract = () => {
    if (!websiteUrl) return;
    setIsExtracting(true);
    setExtractedSuccess(false);
    setExtractionStep(1);

    setTimeout(() => setExtractionStep(2), 500);
    setTimeout(() => setExtractionStep(3), 1000);
    setTimeout(() => {
      setIsExtracting(false);
      setExtractedSuccess(true);
      setExtractionStep(4);
    }, 1500);
  };

  // WhatsApp Voice Note Simulation Handler
  const handleSimulateVoice = () => {
    setSimulatedVoiceNote(true);
    setVoiceNotePlayed(true);
    setTimeout(() => {
      setSimulatedVoiceNote(false);
      setApprovalStatus('REVISED');
    }, 1800);
  };

  // 1-Click Creative Kit Download Simulation
  const handleSimulateExport = () => {
    setIsExportingZip(true);
    setZipExported(false);
    setTimeout(() => {
      setIsExportingZip(false);
      setZipExported(true);
    }, 1400);
  };

  // ROI Calculator Calculations
  const kuiroMonthlyCost = 2799;
  const monthlySavings = Math.max(0, monthlySpend - kuiroMonthlyCost);
  const annualSavings = monthlySavings * 12;

  // Persona Data Profiles (Representing Small Business, Personal Brand, Practice, Lifestyle)
  const personas = {
    smb: {
      name: 'Rohan Banerjee',
      brand: 'Kolkata Chai Co. & Artisanal Goods',
      city: 'Park Street, Kolkata',
      niche: 'Small & Medium Business (Retail / D2C)',
      offerings: 'Artisanal Teas • Festive Gift Hampers • In-Store Experiences',
      colors: ['#FF7A00', '#0B0F14'],
      sampleCampaign: 'Poila Boishakh Saffron Elaichi Tea Launch',
      attributedLeads: 48,
      attributedPipeline: '₹1,48,500',
      indicQuote: 'শুভ নববর্ষ ও উৎসবের আনন্দ!',
      script: 'Bengali Script'
    },
    creator: {
      name: 'Vikram Malhotra',
      brand: 'Vikram Malhotra • Growth Advisory',
      city: 'Mumbai & Remote',
      niche: 'Personal Brand, Creator & Consultant',
      offerings: 'Executive Advisory • B2B Growth Strategy • Keynotes',
      colors: ['#3B82F6', '#0F172A'],
      sampleCampaign: 'Why Solopreneurs Lose 60% Reach to Link-Penalties',
      attributedLeads: 34,
      attributedPipeline: '₹1,95,000',
      indicQuote: 'ज्ञानं परमं बलम्',
      script: 'Devanagari / English'
    },
    practice: {
      name: 'Dr. Rajesh Sharma',
      brand: 'Apex Healthcare & Dental Center',
      city: 'Kolkata & Delhi NCR',
      niche: 'Healthcare Practice & Professional Services',
      offerings: 'Preventive Healthcare • Clear Aligners • Consultations',
      colors: ['#10B981', '#064E3B'],
      sampleCampaign: 'Diwali Festive Care & Family Health Awareness',
      attributedLeads: 42,
      attributedPipeline: '₹1,40,000',
      indicQuote: 'शुभ दीपावली एवं स्वस्थ जीवन!',
      script: 'Devanagari Script'
    },
    lifestyle: {
      name: 'Ananya Mehta',
      brand: 'Mehta Wellness & Yoga Studio',
      city: 'Bandra, Mumbai',
      niche: 'Fitness, Studios & Lifestyle Brands',
      offerings: 'Sound Bath Therapy • Corporate Mindfulness • Weekend Retreats',
      colors: ['#EC4899', '#18181B'],
      sampleCampaign: 'International Yoga Day Corporate Mindfulness Pack',
      attributedLeads: 29,
      attributedPipeline: '₹92,000',
      indicQuote: 'योगः कर्मसु कौशलम्',
      script: 'Devanagari / English'
    }
  };

  // FAQ List
  const faqs = [
    {
      q: 'Who is KUIRO built for?',
      a: 'KUIRO is designed for everyone who needs consistent, professional marketing without the cost or hassle of an agency: small and medium businesses (SMBs), local retail stores, personal brands, creators, freelancers, startup founders, consultants, and professional practices. Whether you are an individual consultant building an audience on LinkedIn or a multi-location business driving footfall and orders, KUIRO runs your marketing on autopilot.',
    },
    {
      q: 'Do I really never have to log into a marketing dashboard?',
      a: 'Zero mandatory dashboard logins. 48 hours before any festival, business milestone, or campaign date, KUIRO generates your complete multi-channel visual assets and delivers an interactive preview directly to your WhatsApp. One tap approves, voice notes revise, or doing nothing auto-commits at scheduled peak times.',
    },
    {
      q: 'How does Campaign ROI & Customer Lead Attribution work?',
      a: 'Every campaign links to your verified WhatsApp number or booking URL with tracking tags and UTM parameters. When a customer or client messages your business from an Instagram post, LinkedIn carousel, or WhatsApp status, KUIRO automatically tags the lead, logs their inquiry or order interest, and attributes net revenue directly to the campaign in real time.',
    },
    {
      q: 'What is included in the 1-Click Creative Kit Asset Exporter?',
      a: 'When you click "Export Creative Kit" (or via API), KUIRO compiles a ready-to-use ZIP bundle containing: 1) High-DPI 4:5 visual (1080x1350) for in-store TV screens and Instagram feed, 2) 1:1 Square card (1080x1080) for WhatsApp status and LinkedIn, 3) Verified social post copy and hashtags, 4) Responsive HTML email newsletter, and 5) Team/Staff instructions (README_FOR_TEAM_AND_STAFF.txt).',
    },
    {
      q: 'Can KUIRO handle regional Indian languages with authentic typography?',
      a: 'Yes! Unlike generic AI image generators that produce scrambled or broken Indian text, KUIRO uses a specialized layout compositor with pre-shaped Google Noto Sans fonts for Devanagari (Hindi, Marathi), Bengali, Tamil, Telugu, and Kannada, rendering crisp festive greetings like "শুভ নববর্ষ" or "शुभ दीपावली" with perfect ligatures.',
    },
    {
      q: 'What is the Zero-Link Surcharge Guard on X / Twitter?',
      a: 'X (Twitter) v2 charges elevated API fees and algorithmically suppresses posts containing external outbound links by up to 40%. KUIRO automatically posts your high-DPI image and value hook first, then instantly attaches your destination link in the verified first reply—saving $0.200 per tweet while maximizing organic engagement.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* 1. Top Announcement Notification Bar */}
      <AnnouncementBar
        badge="Autonomous 2.0"
        tagline="Create / Approve / Grow."
        subtitle="— For SMBs, Personal Brands, Creators, Founders & Individuals."
      />

      {/* 2. Unified Sticky Navbar */}
      <Navbar activeRoute="home" badgeText="AI Marketing Co-Pilot" statusText="Autonomous Cron Online" />

      {/* 3. Hero Section: The Autonomous AI Marketing Engine */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-[#FF7A00]/12 blur-[150px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-emerald-500/8 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-500/8 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-semibold tracking-wide shadow-sm shadow-[#FF7A00]/5">
              <Sparkles size={14} className="animate-spin text-[#FF7A00]" />
              <span className="font-mono uppercase tracking-wider text-[11px]">
                Autonomous Marketing OS • 365 Regional Radar + ROI Attribution
              </span>
              <span className="w-1 h-1 rounded-full bg-[#FF7A00]" />
              <span className="text-slate-300 font-normal">For SMBs, Creators, Founders & Individuals</span>
            </div>

            {/* Main Sora Headline */}
            <h1 className="font-sora text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.12]">
              Create. Approve. Grow. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] via-[#FFA34D] to-emerald-400">
                Your marketing. On autopilot.
              </span>
            </h1>

            {/* Value Proposition */}
            <p className="text-base sm:text-lg text-slate-300 font-inter max-w-3xl mx-auto leading-relaxed">
              KUIRO turns WhatsApp into your marketing command center. Whether you run a retail store, personal brand, high-growth startup, consultancy, clinic, or individual venture, KUIRO indexes your Brand Brain in vector memory, monitors 100+ cultural moments across 28 states, composites studio graphics, auto-commits at peak hours, and attributes real customer revenue.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-8 py-3.5 rounded-[12px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-sm font-sora font-semibold transition-all duration-200 shadow-xl shadow-[#FF7A00]/30 hover:shadow-[#FF7A00]/50 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{isLoggedIn ? 'Go to Dashboard' : 'Start 14-Day Free Trial (₹0)'}</span>
                <ArrowRight size={16} />
              </button>

              <Link
                href="/services"
                className="w-full sm:w-auto px-6 py-3.5 rounded-[12px] bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-sm font-medium border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Layers size={16} className="text-[#FF7A00]" />
                <span>Explore 8-Service Suite</span>
              </Link>

              <a
                href="https://wa.me/919876543210?text=Hi%20KUIRO%20Team%2C%20show%20me%20a%20live%20WhatsApp%20approval%20demo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3.5 rounded-[12px] bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-300 text-sm font-medium border border-emerald-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Smartphone size={16} className="text-emerald-400" />
                <span>WhatsApp Live Demo</span>
              </a>
            </div>

            {/* Trust Proof Strip */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Zero Dashboard Logins Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>48-Hour WhatsApp Auto-Commit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Campaign ROI & Inbound Leads</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>1-Click Creative Kit ZIP Export</span>
              </div>
            </div>
          </div>

          {/* Interactive 30-Second Brand Brain Ingestion Bar */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="p-3 sm:p-4 rounded-[16px] bg-[#0B0F14]/90 border border-white/15 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Globe2 size={16} />
                  </div>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="Enter your website, store, or social link (e.g. kolkatachai.co or yourbrand.in)"
                    className="w-full pl-10 pr-4 py-3 rounded-[10px] bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#FF7A00] transition"
                  />
                </div>
                <button
                  onClick={handleExtract}
                  disabled={isExtracting}
                  className="w-full sm:w-auto px-6 py-3 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] disabled:opacity-75 text-white font-sora font-semibold text-xs sm:text-sm whitespace-nowrap transition shadow-lg shadow-[#FF7A00]/25 flex items-center justify-center gap-2 shrink-0"
                >
                  {isExtracting ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Ingesting DNA...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={15} />
                      <span>Extract Brand Brain</span>
                    </>
                  )}
                </button>
              </div>

              {/* Extraction Progress Feedback */}
              {isExtracting && (
                <div className="mt-3 p-3 rounded-[10px] bg-white/[0.02] border border-white/5 space-y-2 animate-fade-in text-left">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                    <span className="flex items-center gap-2 text-[#FF7A00]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-ping" />
                      {extractionStep === 1 && 'Ingesting brand identity, core offerings & audience values...'}
                      {extractionStep === 2 && 'Detecting official brand hex colors & verified logo...'}
                      {extractionStep === 3 && 'Generating Neon pgvector tenant & 365-day calendar...'}
                    </span>
                    <span>Step {extractionStep}/3</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF7A00] to-emerald-400 transition-all duration-500"
                      style={{ width: `${(extractionStep / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Extraction Success Card */}
              {extractedSuccess && (
                <div className="mt-3 p-3.5 rounded-[12px] bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Kolkata Chai Co. & Artisanal Goods</span>
                        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                          pgvector ID: #KC-8842
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Extracted: Retail SMB • Colors: #FF7A00, #0B0F14 • Ready for 365-Day Autopilot
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleGetStarted}
                    className="px-4 py-1.5 rounded-[8px] bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-sora whitespace-nowrap transition flex items-center gap-1.5"
                  >
                    <span>{isLoggedIn ? 'Go to Dashboard' : 'Activate Autopilot'}</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive 4-Tab Product Showcase (Omni Studio, 48h WhatsApp, ROI & Attribution, 1-Click Creative Kit) */}
      <section className="py-16 border-t border-white/[0.08] bg-[#060a12]/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-semibold">
              <Zap size={14} />
              <span>Interactive Platform Tour</span>
            </div>
            <h2 className="font-sora text-3xl sm:text-5xl font-bold text-white tracking-tight">
              One Closed Loop. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] via-emerald-400 to-sky-400">
                From Studio Broadcast to Customer Revenue.
              </span>
            </h2>
            <p className="text-sm text-slate-300 font-inter">
              Explore our four core production engines: Live Campaign ROI Attribution, the 1-Click Creative Kit Exporter, the 48-Hour WhatsApp Review Loop, and Omni-Channel Publishing.
            </p>

            {/* 4 Showcase Tabs */}
            <div className="pt-4 flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setShowcaseTab('roi')}
                className={`px-4 py-2.5 rounded-[12px] text-xs font-sora font-semibold transition flex items-center gap-2 border ${
                  showcaseTab === 'roi'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/25'
                    : 'bg-[#0B0F14] text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <TrendingUp size={14} />
                <span>1. Campaign ROI & Leads (NEW)</span>
              </button>

              <button
                onClick={() => setShowcaseTab('export')}
                className={`px-4 py-2.5 rounded-[12px] text-xs font-sora font-semibold transition flex items-center gap-2 border ${
                  showcaseTab === 'export'
                    ? 'bg-[#FF7A00] text-white border-[#FF7A00] shadow-lg shadow-[#FF7A00]/25'
                    : 'bg-[#0B0F14] text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <Archive size={14} />
                <span>2. 1-Click Creative Kit (NEW)</span>
              </button>

              <button
                onClick={() => setShowcaseTab('whatsapp')}
                className={`px-4 py-2.5 rounded-[12px] text-xs font-sora font-semibold transition flex items-center gap-2 border ${
                  showcaseTab === 'whatsapp'
                    ? 'bg-emerald-700 text-white border-emerald-600 shadow-lg shadow-emerald-700/25'
                    : 'bg-[#0B0F14] text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <Smartphone size={14} />
                <span>3. 48-Hour WhatsApp Loop</span>
              </button>

              <button
                onClick={() => setShowcaseTab('omni')}
                className={`px-4 py-2.5 rounded-[12px] text-xs font-sora font-semibold transition flex items-center gap-2 border ${
                  showcaseTab === 'omni'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/25'
                    : 'bg-[#0B0F14] text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <Share2 size={14} />
                <span>4. Omni Studio (5 Channels)</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Real-Time Campaign ROI & Lead Attribution (NEW) */}
          {showcaseTab === 'roi' && (
            <div className="max-w-6xl mx-auto rounded-[20px] bg-[#0B0F14] border border-white/15 p-6 sm:p-8 shadow-2xl animate-fade-in text-left">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                    <TrendingUp size={14} />
                    <span>Live Attributed Revenue & Inbound Leads</span>
                  </div>
                  <h3 className="font-sora text-2xl sm:text-3xl font-bold text-white leading-tight">
                    Don’t just track likes. <br />
                    <span className="text-emerald-400">Track actual customer pipeline.</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-inter leading-relaxed">
                    When prospective buyers or clients message your business via WhatsApp or click on social posts, KUIRO attributes their inquiries and orders directly to the underlying campaign. Real-time net ROI calculation shows founders exactly which festival, offer, or announcement generated revenue.
                  </p>
                  
                  <div className="space-y-2.5 text-xs text-slate-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      <span>WhatsApp Cloud API webhook auto-parses inbound lead intent and inquiries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      <span>Calculates net ROI against KUIRO’s flat ₹2,799/mo subscription</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      <span>Exports full CSV and customer inquiry logs for immediate team follow-up</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/dashboard#roi"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-sora transition shadow-lg shadow-emerald-500/25"
                    >
                      <span>Explore Live ROI Engine</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Live ROI Dashboard Card Preview */}
                <div className="lg:col-span-7 bg-[#111620] rounded-[16px] border border-white/10 p-5 space-y-4 shadow-xl">
                  {/* Top Metric Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-[10px] bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Attributed Pipeline</span>
                      <span className="text-lg font-bold font-sora text-white">₹1,48,500</span>
                      <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-mono">
                        <TrendingUp size={10} /> +42% MoM
                      </span>
                    </div>
                    <div className="p-3 rounded-[10px] bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Net Closed</span>
                      <span className="text-lg font-bold font-sora text-emerald-400">₹94,000</span>
                      <span className="text-[9px] text-slate-400 font-mono">7 Confirmed</span>
                    </div>
                    <div className="p-3 rounded-[10px] bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Customer Leads</span>
                      <span className="text-lg font-bold font-sora text-white">48</span>
                      <span className="text-[9px] text-emerald-400 font-mono">36 WhatsApp</span>
                    </div>
                    <div className="p-3 rounded-[10px] bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Net Blended ROI</span>
                      <span className="text-lg font-bold font-sora text-[#FF7A00]">53.0x</span>
                      <span className="text-[9px] text-slate-400 font-mono">vs ₹2,799 fee</span>
                    </div>
                  </div>

                  {/* Attributed Inbound Leads Stream */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-white/10">
                      <span className="font-bold text-white font-sora flex items-center gap-1.5">
                        <Smartphone size={14} className="text-emerald-400" />
                        Live Inbound Customer Inquiries
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Auto-Attributed</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-[8px] bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">Ananya Mukherjee</span>
                            <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                              WhatsApp Status
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">Corporate Festive Gift Hampers (30 Units)</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-400 font-mono">₹45,000</span>
                          <span className="text-[9px] text-emerald-400 block font-semibold">Order Confirmed</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-[8px] bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">Rohit Verma</span>
                            <span className="text-[9px] font-mono bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded">
                              Instagram Ad
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">Artisanal Tea Sampler Box & Subscription</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-400 font-mono">₹18,500</span>
                          <span className="text-[9px] text-emerald-400 block font-semibold">Paid & Dispatched</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-[8px] bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">Pooja Sengupta</span>
                            <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                              LinkedIn Carousel
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">Growth Advisory Quarterly Retainer</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-400 font-mono">₹85,000</span>
                          <span className="text-[9px] text-slate-500 block">Proposal In Review</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Channel Breakdown */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>WhatsApp 46%</span>
                    <span>Instagram 34%</span>
                    <span>LinkedIn 14%</span>
                    <span>Email 6%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 1-Click Creative Kit Asset Exporter (NEW) */}
          {showcaseTab === 'export' && (
            <div className="max-w-6xl mx-auto rounded-[20px] bg-[#0B0F14] border border-white/15 p-6 sm:p-8 shadow-2xl animate-fade-in text-left">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30 text-xs font-mono font-bold">
                    <Archive size={14} />
                    <span>Omni-Asset Production Engine</span>
                  </div>
                  <h3 className="font-sora text-2xl sm:text-3xl font-bold text-white leading-tight">
                    Beyond Social Media. <br />
                    <span className="text-[#FF7A00]">In-Store Displays & Staff Handouts.</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-inter leading-relaxed">
                    Founders and brick-and-mortar businesses don't just market online—they need high-contrast visuals for in-store TV screens, front-desk staff printouts, WhatsApp status updates, and email blasts. KUIRO packages everything into a standardized ZIP file in 1 second.
                  </p>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-[#FF7A00] shrink-0" />
                      <span><strong>High-DPI 4:5 Visual (1080x1350)</strong> for in-store display TV & Instagram</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-[#FF7A00] shrink-0" />
                      <span><strong>1:1 Square Card (1080x1080)</strong> for WhatsApp Status & LinkedIn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-[#FF7A00] shrink-0" />
                      <span><strong>Responsive HTML Newsletter</strong> with zero code required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-[#FF7A00] shrink-0" />
                      <span><strong>README_FOR_TEAM_AND_STAFF.txt</strong> with talking points and hashtags</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSimulateExport}
                      disabled={isExportingZip}
                      className="px-6 py-3 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] disabled:opacity-75 text-white text-xs font-bold font-sora transition shadow-lg shadow-[#FF7A00]/25 flex items-center gap-2"
                    >
                      {isExportingZip ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Assembling ZIP Archive...</span>
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          <span>Simulate 1-Click ZIP Export</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Exporter Visual File Tree & Manifest */}
                <div className="lg:col-span-7 bg-[#111620] rounded-[16px] border border-white/10 p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Archive size={16} className="text-[#FF7A00]" />
                      <span className="text-xs font-bold text-white font-mono">
                        KUIRO_CREATIVE_KIT_CAMPAIGN_2026.zip
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Total Size: 3.42 MB</span>
                  </div>

                  {/* File Manifest List */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-[8px] bg-white/[0.03] border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#FF7A00]/20 text-[#FF7A00] flex items-center justify-center font-bold text-[10px]">
                          PNG
                        </div>
                        <div>
                          <p className="font-semibold text-white">01_VISUAL_4x5_HIGH_DPI.png</p>
                          <p className="text-[10px] text-slate-400">1080 x 1350 • In-Store TV Displays & Instagram Feed</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">1.84 MB</span>
                    </div>

                    <div className="p-2.5 rounded-[8px] bg-white/[0.03] border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                          PNG
                        </div>
                        <div>
                          <p className="font-semibold text-white">02_WHATSAPP_CARD_1x1.png</p>
                          <p className="text-[10px] text-slate-400">1080 x 1080 • WhatsApp Status, Broadcast & LinkedIn</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">1.12 MB</span>
                    </div>

                    <div className="p-2.5 rounded-[8px] bg-white/[0.03] border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                          HTML
                        </div>
                        <div>
                          <p className="font-semibold text-white">04_EMAIL_NEWSLETTER.html</p>
                          <p className="text-[10px] text-slate-400">Standalone Responsive Template • Ready for Resend / SES</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">24.2 KB</span>
                    </div>

                    <div className="p-2.5 rounded-[8px] bg-white/[0.03] border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                          TXT
                        </div>
                        <div>
                          <p className="font-semibold text-white">06_README_FOR_TEAM_AND_STAFF.txt</p>
                          <p className="text-[10px] text-slate-400">In-Store SOP, Talking Points & Verified Hashtags</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">4.8 KB</span>
                    </div>
                  </div>

                  {zipExported && (
                    <div className="p-3 rounded-[10px] bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs animate-fade-in">
                      <div className="flex items-center gap-2 text-emerald-300">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span>ZIP successfully packaged! Available for instant download.</span>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-500 text-black px-2 py-0.5 rounded font-bold">
                        READY (3.42 MB)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Interactive WhatsApp 48-Hour Phone Simulator */}
          {showcaseTab === 'whatsapp' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto animate-fade-in">
              {/* Phone Frame */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="w-full max-w-[360px] rounded-[32px] bg-[#0B0F14] border-4 border-slate-700/60 p-3 shadow-2xl relative">
                  <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3" />

                  {/* Header */}
                  <div className="bg-[#1F2C34] p-3 rounded-[12px] flex items-center justify-between text-white mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#FF7A00] flex items-center justify-center font-bold text-xs">
                        K
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold">KUIRO Co-Pilot</span>
                          <CheckCheck size={14} className="text-emerald-400" />
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">Official Cloud API</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">00:00 IST</span>
                  </div>

                  {/* Body */}
                  <div className="bg-[#0B141A] p-3 rounded-[16px] border border-white/5 space-y-3 text-xs text-left">
                    <div className="bg-[#1F2C34] p-3 rounded-[12px] rounded-tl-none text-slate-200 space-y-2 border border-white/5">
                      <div className="flex items-center justify-between text-[10px] text-[#FF7A00] font-mono">
                        <span>CAMPAIGN #2026-FESTIVAL</span>
                        <span>T-48H DISPATCH</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Namaste <strong>Rohan</strong>! 🙏 <br />
                        Your brand’s Festive Special campaign is ready across Instagram, LinkedIn, X, and Email.
                      </p>

                      <div className="p-2 rounded-[8px] bg-black/40 border border-white/10 space-y-1.5">
                        <div className="aspect-[4/3] rounded bg-gradient-to-br from-[#1A1208] via-[#2A1D0E] to-[#1A1208] p-2.5 flex flex-col justify-between border border-[#FF7A00]/20">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-[#FF7A00]">FESTIVAL SPECIAL</span>
                            <span className="text-[8px] font-mono text-slate-400">1080x1350 High-DPI</span>
                          </div>
                          <p className="text-[11px] font-bold text-white">
                            "Celebrate Fresh Beginnings With Artisanal Blends ✨"
                          </p>
                          <span className="text-[9px] text-slate-400">Kolkata Chai Co. • Park Street</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Auto-commit in:</span>
                          <span className="text-emerald-400 font-bold">47h 58m</span>
                        </div>
                      </div>

                      <div className="pt-1 space-y-1.5">
                        <button
                          onClick={() => setApprovalStatus('APPROVED')}
                          className={`w-full py-2 rounded-[8px] text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                            approvalStatus === 'APPROVED'
                              ? 'bg-emerald-600 text-white shadow-lg'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                          }`}
                        >
                          <Check size={14} />
                          <span>{approvalStatus === 'APPROVED' ? 'Approved & Queued' : 'Approve Campaign (1-Tap)'}</span>
                        </button>

                        <button
                          onClick={handleSimulateVoice}
                          disabled={simulatedVoiceNote}
                          className="w-full py-2 rounded-[8px] bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 flex items-center justify-center gap-1.5 transition"
                        >
                          <Mic size={14} className={simulatedVoiceNote ? 'text-red-400 animate-pulse' : 'text-[#FF7A00]'} />
                          <span>{simulatedVoiceNote ? 'Transcribing Audio...' : 'Simulate Voice Note Revision'}</span>
                        </button>
                      </div>
                    </div>

                    {voiceNotePlayed && (
                      <div className="bg-[#005D4B] p-2.5 rounded-[12px] rounded-tr-none text-white text-xs ml-auto max-w-[85%] space-y-1 animate-fade-in">
                        <div className="flex items-center gap-2">
                          <Play size={12} className="text-emerald-300" />
                          <div className="h-1 bg-white/30 rounded-full flex-1">
                            <div className="h-full bg-white rounded-full w-2/3" />
                          </div>
                          <span className="text-[9px] font-mono text-emerald-200">0:04</span>
                        </div>
                        <p className="text-[10px] text-emerald-100 italic">
                          "Headline thoda bold karo aur festive discount code add karo."
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Explanatory Panel */}
              <div className="lg:col-span-6 space-y-5 text-left">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Zero Dashboard Logins Needed
                </span>
                <h3 className="font-sora text-2xl sm:text-3xl font-bold text-white">
                  Review and approve from the app you check 50 times a day.
                </h3>
                <p className="text-sm text-slate-300 font-inter leading-relaxed">
                  Founders, creators, and business owners don't want to log into bloated marketing tools. KUIRO turns WhatsApp into your command center. Send a voice note in the car between meetings, and Gemini updates the studio composite in 12 seconds.
                </p>
                <div className="space-y-2.5 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>One tap approves without passwords or email confirmations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Whisper voice-to-text transcribes Hindi and Indian English audio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Silence = Consent: if you take zero action, it auto-commits at T-0</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Omni-Channel Synchronized Previews */}
          {showcaseTab === 'omni' && (
            <div className="space-y-4 animate-fade-in">
              <div className="sm:hidden text-center text-[10px] text-slate-500 font-mono mb-2 flex items-center justify-center gap-1">
                <span>← Swipe cards horizontally to view all 5 channels →</span>
              </div>

              <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-7xl mx-auto pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-none">
                <div className="min-w-[280px] sm:min-w-0 snap-center shrink-0 sm:shrink">
                  <FloatingInstagramCard className="w-full" />
                </div>
                <div className="min-w-[280px] sm:min-w-0 snap-center shrink-0 sm:shrink">
                  <FloatingLinkedInCard className="w-full" />
                </div>
                <div className="min-w-[280px] sm:min-w-0 snap-center shrink-0 sm:shrink">
                  <FloatingWhatsAppCard className="w-full" />
                </div>
                <div className="min-w-[280px] sm:min-w-0 snap-center shrink-0 sm:shrink">
                  <FloatingXCard className="w-full" />
                </div>
                <div className="min-w-[280px] sm:min-w-0 snap-center shrink-0 sm:shrink">
                  <FloatingEmailNewsletterCard className="w-full" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Multi-Tenant Persona Simulator (Small Business, Personal Brand, Practice, Lifestyle) */}
      <section className="py-20 border-t border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Users size={14} />
              <span>Multi-Tenant Persona Simulator</span>
            </div>
            <h2 className="font-sora text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Built for Every Business & Personal Brand
            </h2>
            <p className="text-sm text-slate-300 font-inter">
              See how KUIRO customizes cultural moments, brand tone of voice, and regional Indic scripts across different industries and individual creators.
            </p>

            {/* Persona Switcher Buttons */}
            <div className="pt-3 flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => setActivePersona('smb')}
                className={`px-4 py-2 rounded-[10px] text-xs font-sora font-semibold transition border ${
                  activePersona === 'smb'
                    ? 'bg-[#FF7A00] text-white border-[#FF7A00] shadow-md shadow-[#FF7A00]/25'
                    : 'bg-[#0B0F14] text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                1. Small Business (Retail & D2C)
              </button>
              <button
                onClick={() => setActivePersona('creator')}
                className={`px-4 py-2 rounded-[10px] text-xs font-sora font-semibold transition border ${
                  activePersona === 'creator'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/25'
                    : 'bg-[#0B0F14] text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                2. Personal Brand & Creator
              </button>
              <button
                onClick={() => setActivePersona('practice')}
                className={`px-4 py-2 rounded-[10px] text-xs font-sora font-semibold transition border ${
                  activePersona === 'practice'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/25'
                    : 'bg-[#0B0F14] text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                3. Professional Practice & Clinics
              </button>
              <button
                onClick={() => setActivePersona('lifestyle')}
                className={`px-4 py-2 rounded-[10px] text-xs font-sora font-semibold transition border ${
                  activePersona === 'lifestyle'
                    ? 'bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-600/25'
                    : 'bg-[#0B0F14] text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                4. Studios & Lifestyle
              </button>
            </div>
          </div>

          {/* Active Persona Card Display */}
          <div className="max-w-4xl mx-auto rounded-[20px] bg-[#0B0F14] border border-white/15 p-6 sm:p-8 shadow-2xl text-left animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold font-sora text-sm"
                    style={{ backgroundColor: personas[activePersona].colors[0] }}
                  >
                    {personas[activePersona].name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-sora text-lg font-bold text-white">{personas[activePersona].brand}</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Lead: {personas[activePersona].name} • {personas[activePersona].city}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-[8px] bg-white/[0.03] border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                      Indexed Core Offerings:
                    </span>
                    <p className="text-slate-200">{personas[activePersona].offerings}</p>
                  </div>

                  <div className="p-2.5 rounded-[8px] bg-white/[0.03] border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-[#FF7A00] uppercase font-bold block">
                      Regional Indic Script Output ({personas[activePersona].script}):
                    </span>
                    <p className="text-base font-bold text-white">{personas[activePersona].indicQuote}</p>
                  </div>
                </div>
              </div>

              {/* Persona Revenue Metrics */}
              <div className="md:col-span-5 bg-[#121720] rounded-[14px] p-5 border border-white/10 space-y-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Autopilot Attribution ({personas[activePersona].niche}):
                </span>
                <div className="text-3xl font-bold font-sora text-emerald-400">
                  {personas[activePersona].attributedPipeline}
                  <span className="text-xs text-slate-400 font-mono font-normal"> Pipeline</span>
                </div>
                <div className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-white/10">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inbound Leads:</span>
                    <span className="font-mono text-white font-bold">{personas[activePersona].attributedLeads} inquiries</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Campaign:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{personas[activePersona].sampleCampaign}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. The 5 Unfair Architectural Moats */}
      <section className="py-20 border-t border-white/[0.08] bg-[#060a12]/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-semibold">
              <Cpu size={14} />
              <span>Defensible Technology</span>
            </div>
            <h2 className="font-sora text-3xl sm:text-5xl font-bold text-white tracking-tight">
              The 5 Unfair Architectural Moats
            </h2>
            <p className="text-sm text-slate-300 font-inter">
              Why generic ChatGPT wrappers and freelance marketing agencies cannot match KUIRO.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {/* Moat 1 */}
            <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 hover:border-[#FF7A00]/50 transition group space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FF7A00]/15 text-[#FF7A00] flex items-center justify-center font-bold">
                <Layers size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Moat 01</span>
              <h3 className="font-sora text-base font-bold text-white group-hover:text-[#FF7A00] transition">
                Persistent Brand Brain
              </h3>
              <p className="text-xs text-slate-400 font-inter leading-relaxed">
                Stores your unique product catalog, certifications, verified brand colors, pricing, and tone of voice in isolated Neon pgvector memory. Zero hallucinations or repeated prompts.
              </p>
            </div>

            {/* Moat 2 */}
            <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 hover:border-emerald-500/50 transition group space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <Calendar size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Moat 02</span>
              <h3 className="font-sora text-base font-bold text-white group-hover:text-emerald-400 transition">
                365 Regional Radar (Cron)
              </h3>
              <p className="text-xs text-slate-400 font-inter leading-relaxed">
                Autonomous daily Vercel Cron (0 0 * * *) scans 100+ Indian regional festivals across 28 states at T-48h, dispatches previews to WhatsApp, and triggers fail-safe publishing at T-0h.
              </p>
            </div>

            {/* Moat 3 */}
            <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 hover:border-amber-500/50 transition group space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                <Flame size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Moat 03</span>
              <h3 className="font-sora text-base font-bold text-white group-hover:text-amber-400 transition">
                Indic Typography Engine
              </h3>
              <p className="text-xs text-slate-400 font-inter leading-relaxed">
                Pre-shaped Google Noto Sans fonts for Bengali, Devanagari, Tamil, and Telugu eliminate broken glyphs and bad kerning, producing authentic regional language greetings for every state.
              </p>
            </div>

            {/* Moat 4 */}
            <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 hover:border-emerald-500/50 transition group space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <Smartphone size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Moat 04</span>
              <h3 className="font-sora text-base font-bold text-white group-hover:text-emerald-400 transition">
                WhatsApp "Silence = Consent"
              </h3>
              <p className="text-xs text-slate-400 font-inter leading-relaxed">
                If a busy founder or creator is in meetings and takes zero action during the 48-hour preview window, KUIRO automatically commits and publishes on schedule. You never miss a key date.
              </p>
            </div>

            {/* Moat 5 */}
            <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 hover:border-blue-500/50 transition group space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                <ShieldCheck size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Moat 05</span>
              <h3 className="font-sora text-base font-bold text-white group-hover:text-blue-400 transition">
                Zero-Link Surcharge Guard
              </h3>
              <p className="text-xs text-slate-400 font-inter leading-relaxed">
                X charges $0.200 per external URL and penalizes organic reach by 40%. KUIRO places links in the first reply thread automatically, protecting your reach and saving hundreds on API costs.
              </p>
            </div>

            {/* Moat 6 */}
            <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 hover:border-purple-500/50 transition group space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                <TrendingUp size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Moat 06</span>
              <h3 className="font-sora text-base font-bold text-white group-hover:text-purple-400 transition">
                End-to-End Campaign ROI
              </h3>
              <p className="text-xs text-slate-400 font-inter leading-relaxed">
                Inbound WhatsApp inquiries are attributed directly to purchases, bookings, or consulting retainers, proving tangible ₹1,48,500+ pipeline value rather than vanity metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Industry Verticals Tailored for Everyone */}
      <section className="py-20 border-t border-white/[0.08] bg-[#060a12]/70 relative">
        <SmbVerticalUseCases />
      </section>

      {/* 8. Deterministic Workflow Timeline (The 48-Hour Protocol) */}
      <section id="workflow" className="py-20 border-t border-white/[0.08] relative overflow-hidden">
        <WorkflowTimeline />
      </section>

      {/* 9. Interactive Satori Festival Generator (Live in Browser) */}
      <section id="visual-generator" className="py-20 border-t border-white/[0.08] bg-[#060a12]/70 relative">
        <InteractiveFestivalGenerator />
      </section>

      {/* 10. Interactive Retainer ROI Savings Calculator */}
      <section className="py-20 border-t border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-[20px] bg-gradient-to-br from-[#0B0F14] via-[#121720] to-[#0B0F14] border border-white/15 relative shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A00]/15 text-[#FF7A00] text-xs font-semibold">
                  <Calculator size={14} />
                  <span>Agency Retainer Savings Calculator</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-sora font-bold text-white tracking-tight">
                  Stop burning ₹40,000 to ₹1,00,000/mo on slow agencies.
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 font-inter leading-relaxed">
                  Adjust your current monthly spend on freelancers, graphic designers, or social media agencies:
                </p>

                {/* Range Slider */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Current Monthly Agency Spend:</span>
                    <span className="text-lg font-bold text-white">
                      ₹{monthlySpend.toLocaleString('en-IN')} / mo
                    </span>
                  </div>

                  <input
                    type="range"
                    min="15000"
                    max="150000"
                    step="5000"
                    value={monthlySpend}
                    onChange={(e) => setMonthlySpend(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FF7A00]"
                  />

                  <div className="flex flex-wrap gap-2 pt-1">
                    {[25000, 45000, 75000, 120000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setMonthlySpend(amt)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition ${
                          monthlySpend === amt
                            ? 'bg-[#FF7A00] text-white font-bold'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculator Output Card */}
              <div className="lg:col-span-5 bg-[#0B0F14] p-6 rounded-[16px] border border-white/15 space-y-4 shadow-xl text-left">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Your Net Annual Savings With KUIRO:
                </span>
                <div className="text-4xl font-bold font-sora text-emerald-400 tracking-tight">
                  ₹{annualSavings.toLocaleString('en-IN')}
                  <span className="text-xs text-slate-400 font-mono font-normal"> / year</span>
                </div>
                <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">KUIRO Growth Tier:</span>
                    <span className="font-mono text-white font-bold">₹2,799 / mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time Saved Per Week:</span>
                    <span className="font-mono text-emerald-400 font-bold">8+ Hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">WhatsApp Revision Speed:</span>
                    <span className="font-mono text-white font-bold">&lt; 15 Seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Net Return Multiple:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {((monthlySpend / 2799)).toFixed(1)}x ROI
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleGetStarted}
                  className="w-full py-3 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-semibold font-sora transition shadow-md shadow-[#FF7A00]/25 text-center block mt-2"
                >
                  Start Saving Today (14-Day Free Trial)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Social Proof & Verified Testimonials */}
      <section className="py-20 border-t border-white/[0.08] bg-[#060a12]/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Star size={14} className="fill-emerald-400" />
              <span>Verified Founders, Creators & SMBs</span>
            </div>
            <h2 className="font-sora text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Trusted by 450+ Indian Businesses & Creators
            </h2>
            <p className="text-sm text-slate-300 font-inter">
              See what retail owners, personal brands, and agency founders have to say.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 space-y-4 text-left">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 font-inter leading-relaxed">
                "Our specialty roastery runs seasonal monsoon brews and Durga Puja menus. KUIRO's regional cultural radar creates authentic Bengali copy that our customers actually share. Our weekend table reservations jumped 38% without paying a designer."
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] font-bold text-xs flex items-center justify-center font-sora">
                  KC
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-sora">Kolkata Chai Co.</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Specialty Cafes & Retail • Park Street</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 space-y-4 text-left">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 font-inter leading-relaxed">
                "As an independent consultant, I need to stay top-of-mind on LinkedIn every week. KUIRO prepares thought-leadership carousels 48 hours ahead. I send a quick Hindi or English voice note to refine the angle, and it publishes flawlessly with first-reply link placement."
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center font-sora">
                  VM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-sora">Vikram Malhotra</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Executive Growth Advisory • Mumbai</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 space-y-4 text-left">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 font-inter leading-relaxed">
                "We manage 18 SMB clients across Delhi and Mumbai. The 1-Click Creative Kit exporter allows us to deliver in-store displays, WhatsApp status cards, and email newsletters to clients in seconds without hiring extra graphic designers."
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center font-sora">
                  AS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-sora">Anjali Sen</h4>
                  <p className="text-[10px] text-slate-400 font-mono">GrowthScale Digital Agency • Delhi NCR</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Transparent Pricing Grid */}
      <section id="pricing" className="py-20 border-t border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-5xl font-sora font-bold text-white tracking-tight">
              Predictable Pricing. Zero Agency Games.
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-inter">
              All plans include a 14-day risk-free trial. Upgrade, downgrade, or cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
            {/* Starter */}
            <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 space-y-5">
              <div>
                <h3 className="font-sora text-lg font-bold text-white">Starter</h3>
                <p className="text-xs text-slate-400 font-inter">For solopreneurs, creators, consultants & solo shops.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-sora text-white">₹1,199</span>
                <span className="text-xs text-slate-400 font-mono"> / month</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>1 Brand Workspace in pgvector</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>15 Auto-Generated Posts / Month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>48h WhatsApp 1-Tap Approval</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Instagram & LinkedIn Publishing</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full py-2.5 rounded-[10px] bg-white/5 hover:bg-white/10 text-white text-xs font-semibold font-sora border border-white/10 transition"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Growth (Featured) */}
            <div className="p-6 rounded-[16px] bg-gradient-to-b from-[#141A24] to-[#0B0F14] border-2 border-[#FF7A00] space-y-5 relative shadow-xl shadow-[#FF7A00]/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF7A00] text-white text-[10px] font-bold font-mono uppercase px-3 py-0.5 rounded-full">
                Most Popular
              </div>
              <div>
                <h3 className="font-sora text-lg font-bold text-white">Growth Autopilot</h3>
                <p className="text-xs text-slate-400 font-inter">Complete autonomous engine with WhatsApp loop.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-sora text-white">₹2,799</span>
                <span className="text-xs text-slate-400 font-mono"> / month</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>365-Day Regional Cultural Radar</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Unlimited Voice Note WhatsApp Revisions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Live Campaign ROI & Lead Attribution</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>1-Click Creative Kit Asset Exporter (ZIP)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Zero-Link Surcharge Guard for X</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Indic Typography (Bengali, Hindi, Tamil)</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full py-2.5 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-bold font-sora transition shadow-lg shadow-[#FF7A00]/25"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Agency / Multi-Brand */}
            <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 space-y-5">
              <div>
                <h3 className="font-sora text-lg font-bold text-white">Agency / Multi-Brand</h3>
                <p className="text-xs text-slate-400 font-inter">For multi-brand operators, agencies, and chains.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-sora text-white">₹11,999</span>
                <span className="text-xs text-slate-400 font-mono"> / month</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Up to 10 Brand Profiles & Workspaces</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Dedicated WhatsApp Cloud API Numbers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Multi-Tenant Role Permissions & Audit Logs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Custom Webhooks & Team CRM Sync</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full py-2.5 rounded-[10px] bg-white/5 hover:bg-white/10 text-white text-xs font-semibold font-sora border border-white/10 transition"
              >
                Start 14-Day Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 13. Frequently Asked Questions Accordion */}
      <section className="py-20 border-t border-white/[0.08] bg-[#060a12]/70 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
              Common Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-inter">
              Everything you need to know about our autonomous execution, WhatsApp loop, and ROI attribution.
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
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-sora text-sm sm:text-base font-semibold text-white hover:text-[#FF7A00] transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-[#FF7A00] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-slate-300 font-inter leading-relaxed border-t border-white/5 pt-3 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 14. Bottom High-Impact CTA Banner */}
      <section className="py-20 border-t border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#FF7A00]/15 blur-[150px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-sora text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Stop babysitting marketing retainers. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] via-[#FFA34D] to-emerald-400">
              Put your marketing on autopilot.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-inter max-w-2xl mx-auto leading-relaxed">
            Join hundreds of forward-thinking Indian founders, creators, retail brands, and operators. Set up your Brand Brain in 60 seconds with zero credit card required.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-[12px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-sm font-sora font-semibold transition shadow-xl shadow-[#FF7A00]/30 hover:shadow-[#FF7A00]/50 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{isLoggedIn ? 'Go to Dashboard' : 'Start Your 14-Day Free Trial (₹0)'}</span>
              <ArrowRight size={16} />
            </button>

            <Link
              href="/pricing"
              className="w-full sm:w-auto px-6 py-4 rounded-[12px] bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-medium border border-white/10 transition flex items-center justify-center gap-2"
            >
              <span>Compare Pricing & Plans</span>
            </Link>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-[11px] text-slate-400 font-mono">
            <span>✓ 14-Day Full Access</span>
            <span>✓ Cancel Anytime</span>
            <span>✓ Instant WhatsApp Onboarding</span>
          </div>
        </div>
      </section>

      {/* 15. Unified Global Footer */}
      <Footer />
    </div>
  );
}
