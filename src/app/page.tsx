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
  MessageSquare,
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
  HelpCircle,
  PhoneCall
} from 'lucide-react';

export default function RedesignedHomePage() {
  const { isLoggedIn, handleGetStarted } = useAuth();

  // 1. Hero Brand Brain Scanner State
  const [websiteUrl, setWebsiteUrl] = useState('https://drsharmadental.in');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSuccess, setExtractedSuccess] = useState(false);
  const [extractionStep, setExtractionStep] = useState(0);

  // 2. Interactive Product Showcase Tab State
  const [showcaseTab, setShowcaseTab] = useState<'omni' | 'whatsapp' | 'inbox'>('omni');

  // 3. WhatsApp 48-Hour Approval Simulator State
  const [approvalStatus, setApprovalStatus] = useState<'AUTO_QUEUED' | 'APPROVED' | 'REVISED'>('AUTO_QUEUED');
  const [simulatedVoiceNote, setSimulatedVoiceNote] = useState(false);
  const [voiceNotePlayed, setVoiceNotePlayed] = useState(false);

  // 4. Interactive Retainer ROI Calculator State
  const [monthlySpend, setMonthlySpend] = useState<number>(45000);

  // 5. FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Brand Brain Extraction Simulator Handler
  const handleExtract = () => {
    if (!websiteUrl) return;
    setIsExtracting(true);
    setExtractedSuccess(false);
    setExtractionStep(1);

    setTimeout(() => setExtractionStep(2), 600);
    setTimeout(() => setExtractionStep(3), 1200);
    setTimeout(() => {
      setIsExtracting(false);
      setExtractedSuccess(true);
      setExtractionStep(4);
    }, 1800);
  };

  // WhatsApp Voice Note Simulation Handler
  const handleSimulateVoice = () => {
    setSimulatedVoiceNote(true);
    setVoiceNotePlayed(true);
    setTimeout(() => {
      setSimulatedVoiceNote(false);
      setApprovalStatus('REVISED');
    }, 2000);
  };

  // ROI Calculator Calculations
  const kuiroMonthlyCost = 2799;
  const monthlySavings = Math.max(0, monthlySpend - kuiroMonthlyCost);
  const annualSavings = monthlySavings * 12;

  // FAQ List
  const faqs = [
    {
      q: 'Do I have to log in to a dashboard every day to publish marketing?',
      a: 'Zero dashboard logins required. 48 hours before any festival, business milestone, or campaign, KUIRO generates your complete multi-channel visual assets and delivers an interactive contact sheet directly to your WhatsApp. One tap approves, voice notes revise, or doing nothing auto-commits at scheduled peak times.',
    },
    {
      q: 'What happens if I forget or am too busy to reply on WhatsApp?',
      a: 'Silence equals consent! If no changes are requested within the 48-hour passive window, KUIRO automatically commits and publishes your verified campaign at T-0h. You never miss Diwali, Holi, or a seasonal promotion because you were in surgery or in client meetings.',
    },
    {
      q: 'How does the new Unified Multi-Channel Inbox work?',
      a: 'When prospective patients or buyers respond to your WhatsApp campaigns, Instagram posts, Facebook ads, or email newsletters, their replies stream into one shared workspace. Your team can reply faster, collaborate with private internal notes, and automate routine FAQs with Brand Brain AI.',
    },
    {
      q: 'Can KUIRO handle regional Indian languages like Hindi and Bengali?',
      a: 'Yes! KUIRO includes native Indic font rendering and ligature shaping (via Satori and Google Noto fonts) for Devanagari, Bengali, Tamil, Telugu, and Kannada, complete with regional cultural nuance across 28 Indian states.',
    },
    {
      q: 'Does KUIRO use official social media and WhatsApp APIs?',
      a: '100% official APIs. We integrate via official Meta Cloud WhatsApp API, Instagram Graph API, LinkedIn UGC v2, and X (Twitter) v2 API with built-in first-reply link placement guardrails to protect your organic reach.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* 1. Top Announcement Notification Bar */}
      <AnnouncementBar
        badge="Autonomous Protocol 2.0"
        tagline="Create / Approve / Grow."
        subtitle="— Now with Unified Customer Inbox for WhatsApp, IG & Email."
      />

      {/* 2. Unified Sticky Navbar */}
      <Navbar activeRoute="home" badgeText="AI Marketing Co-Pilot" statusText="Channels Online" />

      {/* 3. Hero Section: The Autonomous AI Marketing Employee */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-[#FF7A00]/10 blur-[140px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-semibold tracking-wide shadow-sm shadow-[#FF7A00]/5">
              <Sparkles size={14} className="animate-spin text-[#FF7A00]" />
              <span className="font-mono uppercase tracking-wider text-[11px]">
                Autonomous Social Engine + Unified Chat Inbox
              </span>
              <span className="w-1 h-1 rounded-full bg-[#FF7A00]" />
              <span>For Indian SMBs, Clinics & Founders</span>
            </div>

            {/* Main Sora Headline */}
            <h1 className="font-sora text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.12]">
              Create. Approve. Grow. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] via-[#FFA34D] to-[#FF7A00]">
                Your marketing. On autopilot.
              </span>
            </h1>

            {/* Value Proposition */}
            <p className="text-base sm:text-lg text-slate-300 font-inter max-w-2xl mx-auto leading-relaxed">
              KUIRO replaces chaotic marketing retainers with an autonomous AI employee living on WhatsApp. We index your Brand Brain in vector memory, monitor 100+ cultural moments across 28 states, composite studio graphics, and bring customer chats into one shared inbox.
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
                <span>WhatsApp Demo</span>
              </a>
            </div>

            {/* Trust Proof Strip */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Zero Dashboard Logins Needed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>48-Hour WhatsApp Auto-Commit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Unified Multi-Channel Inbox</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Neon pgvector Tenant Isolation</span>
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
                    placeholder="Enter your clinic or business website (e.g. drsharmadental.in)"
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
                <div className="mt-3 p-3 rounded-[10px] bg-white/[0.02] border border-white/5 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                    <span className="flex items-center gap-2 text-[#FF7A00]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-ping" />
                      {extractionStep === 1 && 'Ingesting doctor credentials & clinical specializations...'}
                      {extractionStep === 2 && 'Detecting official hex codes & verified SVG logo...'}
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
                <div className="mt-3 p-3.5 rounded-[12px] bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Dr. Sharma Dental & Aesthetic Center</span>
                        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                          pgvector ID: #DS-8842
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Extracted: BDS, MDS Orthodontics • Colors: #FF7A00, #0B0F14 • Ready for 365-Day Autopilot
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

      {/* 4. Interactive 3-Tab Product Showcase (Omni Broadcast, 48h WhatsApp, Unified Inbox) */}
      <section className="py-16 border-t border-white/[0.08] bg-[#060a12]/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-semibold">
              <Zap size={14} />
              <span>Interactive Platform Tour</span>
            </div>
            <h2 className="font-sora text-3xl sm:text-5xl font-bold text-white tracking-tight">
              One Closed Loop. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] to-emerald-400">
                From Broadcast to Customer Conversion.
              </span>
            </h2>
            <p className="text-sm text-slate-300 font-inter">
              Switch between our 3 core interactive engines: Omni-Channel Social Broadcast, the 48-Hour WhatsApp Review Loop, and the Unified Customer Inbox.
            </p>

            {/* 3 Showcase Tabs */}
            <div className="pt-4 flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setShowcaseTab('omni')}
                className={`px-4 py-2.5 rounded-[12px] text-xs font-sora font-semibold transition flex items-center gap-2 border ${
                  showcaseTab === 'omni'
                    ? 'bg-[#FF7A00] text-white border-[#FF7A00] shadow-lg shadow-[#FF7A00]/25'
                    : 'bg-[#0B0F14] text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <Share2 size={14} />
                <span>1. Omni Broadcast (5 Channels)</span>
              </button>

              <button
                onClick={() => setShowcaseTab('whatsapp')}
                className={`px-4 py-2.5 rounded-[12px] text-xs font-sora font-semibold transition flex items-center gap-2 border ${
                  showcaseTab === 'whatsapp'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/25'
                    : 'bg-[#0B0F14] text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <Smartphone size={14} />
                <span>2. 48-Hour WhatsApp Loop</span>
              </button>

              <button
                onClick={() => setShowcaseTab('inbox')}
                className={`px-4 py-2.5 rounded-[12px] text-xs font-sora font-semibold transition flex items-center gap-2 border ${
                  showcaseTab === 'inbox'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/25'
                    : 'bg-[#0B0F14] text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <MessagesSquare size={14} />
                <span>3. Unified Team Inbox (NEW)</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Omni-Channel Synchronized Previews */}
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

          {/* TAB 2: Interactive WhatsApp 48-Hour Phone Simulator */}
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
                          <span className="text-xs font-bold">KUIRO Bot</span>
                          <CheckCheck size={14} className="text-emerald-400" />
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">Official Cloud API</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">00:00 IST</span>
                  </div>

                  {/* Body */}
                  <div className="bg-[#0B141A] p-3 rounded-[16px] border border-white/5 space-y-3 text-xs">
                    <div className="bg-[#1F2C34] p-3 rounded-[12px] rounded-tl-none text-slate-200 space-y-2 border border-white/5">
                      <div className="flex items-center justify-between text-[10px] text-[#FF7A00] font-mono">
                        <span>CAMPAIGN #2026-DIWALI</span>
                        <span>T-48H DISPATCH</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Namaste <strong>Dr. Sharma</strong>! 🙏 <br />
                        Your clinic’s Diwali Festive Smiles campaign is ready across Instagram, LinkedIn, X, and Email.
                      </p>

                      <div className="p-2 rounded-[8px] bg-black/40 border border-white/10 space-y-1.5">
                        <div className="aspect-[4/3] rounded bg-gradient-to-br from-[#1A1208] via-[#2A1D0E] to-[#1A1208] p-2 flex flex-col justify-between border border-[#FF7A00]/20">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-[#FF7A00]">DIWALI SPECIAL</span>
                            <span className="text-[8px] font-mono text-slate-400">1:1 & 9:16</span>
                          </div>
                          <p className="text-[11px] font-bold text-white">
                            "Light Up Smiles, Not Just Diyas ✨"
                          </p>
                          <span className="text-[9px] text-slate-400">Dr. Sharma Dental • BDS, MDS</span>
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
                          <span>{simulatedVoiceNote ? 'Transcribing Hindi Audio...' : 'Simulate Hindi Voice Note'}</span>
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
                          "Doctor credentials bold karo aur contact number add karo."
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
                  Review and approve from the app you already check 50 times a day.
                </h3>
                <p className="text-sm text-slate-300 font-inter leading-relaxed">
                  Indian doctors and founders don't want to log into bloated enterprise dashboards. KUIRO turns WhatsApp into your command center. Send a Hindi voice note in the car between appointments, and Gemini updates the studio composite in 12 seconds.
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
                    <span>Passive consent: if you take zero action, it auto-commits at T-0</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Unified Customer Conversations Inbox Showcase */}
          {showcaseTab === 'inbox' && (
            <div className="max-w-5xl mx-auto rounded-[20px] bg-[#0B0F14] border border-white/15 p-6 sm:p-8 shadow-2xl animate-fade-in text-left">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    Shared Conversations Workspace
                  </span>
                  <h3 className="font-sora text-2xl sm:text-3xl font-bold text-white">
                    Every WhatsApp, Instagram & Email chat. One unified inbox.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-inter leading-relaxed">
                    When your marketing broadcast launches, inquiries flood in. KUIRO unifies WhatsApp chats, Instagram DMs, Facebook messages, and customer emails into one shared workspace—with AI smart routing and internal team collaboration notes.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-[10px] bg-white/[0.03] border border-white/10">
                      <span className="text-base font-bold font-sora text-white block">1m 42s</span>
                      <span className="text-[10px] text-slate-400">First Response Time</span>
                    </div>
                    <div className="p-3 rounded-[10px] bg-white/[0.03] border border-white/10">
                      <span className="text-base font-bold font-sora text-emerald-400 block">68.4%</span>
                      <span className="text-[10px] text-slate-400">AI Auto-Resolution</span>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/inbox"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-semibold font-sora transition shadow-md shadow-[#FF7A00]/25"
                  >
                    <span>Test-Drive Live Inbox</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Inbox Visual Mini-Frame */}
                <div className="lg:col-span-6 bg-[#11141A] rounded-[16px] border border-white/10 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <MessagesSquare size={16} className="text-[#FF7A00]" />
                      <span className="text-xs font-bold text-white font-sora">Live Inbound Stream</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                      Zero Collision Active
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-[10px] bg-white/5 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Smartphone size={14} className="text-emerald-400" />
                        <div>
                          <p className="text-white font-semibold text-[11px]">Ananya Mukherjee (WhatsApp)</p>
                          <p className="text-slate-400 text-[10px]">"Can I schedule Invisalign consultation?"</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-[#FF7A00] bg-[#FF7A00]/15 px-2 py-0.5 rounded">
                        #VIP Lead
                      </span>
                    </div>

                    <div className="p-2.5 rounded-[10px] bg-white/5 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Instagram size={14} className="text-pink-400" />
                        <div>
                          <p className="text-white font-semibold text-[11px]">Rohit Verma (Instagram DM)</p>
                          <p className="text-slate-400 text-[10px]">"Chipped tooth playing football. Open today?"</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded font-bold">
                        URGENT
                      </span>
                    </div>

                    <div className="p-2.5 rounded-[10px] bg-amber-950/30 border border-amber-500/20 text-amber-200 text-[11px] space-y-1">
                      <div className="flex items-center gap-1 font-bold text-[10px]">
                        <Lock size={10} />
                        <span>INTERNAL NOTE: Dr. Sharma prepped Operatory 2</span>
                      </div>
                      <p className="text-[10px] text-amber-300/80">Visible only to clinic team members.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Deterministic Workflow Timeline (The 48-Hour Protocol) */}
      <section id="workflow" className="py-20 border-t border-white/[0.08] relative overflow-hidden">
        <WorkflowTimeline />
      </section>

      {/* 6. Interactive Satori Festival Generator (Live in Browser) */}
      <section id="visual-generator" className="py-20 border-t border-white/[0.08] bg-[#060a12]/70 relative">
        <InteractiveFestivalGenerator />
      </section>

      {/* 7. The 8-Service Autonomous Suite */}
      <section className="py-20 border-t border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-semibold">
              <Cpu size={14} />
              <span>Full-Stack Capabilities</span>
            </div>
            <h2 className="font-sora text-3xl sm:text-5xl font-bold text-white tracking-tight">
              The 8-Service Autonomous Suite
            </h2>
            <p className="text-sm text-slate-300 font-inter">
              Everything required to run an enterprise-grade digital marketing agency on autopilot.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-[14px] bg-[#0B0F14] border border-white/10 hover:border-[#FF7A00]/50 transition group space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#FF7A00]/15 text-[#FF7A00] flex items-center justify-center font-bold">
                <Layers size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Service 01</span>
              <h3 className="font-sora text-base font-bold text-white group-hover:text-[#FF7A00] transition">
                Persistent Brand Brain
              </h3>
              <p className="text-xs text-slate-400 font-inter leading-relaxed">
                Vector memory in Neon pgvector storing your doctor degrees, pricing, services, and ethical guardrails.
              </p>
            </div>

            <div className="p-5 rounded-[14px] bg-[#0B0F14] border border-white/10 hover:border-emerald-500/50 transition group space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <Calendar size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Service 02</span>
              <h3 className="font-sora text-base font-bold text-white group-hover:text-emerald-400 transition">
                365 Cultural Radar
              </h3>
              <p className="text-xs text-slate-400 font-inter leading-relaxed">
                Automated cron tracking 100+ festivals across 28 Indian states, regional health days, and local milestones.
              </p>
            </div>

            <div className="p-5 rounded-[14px] bg-[#0B0F14] border border-white/10 hover:border-amber-500/50 transition group space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                <Flame size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Service 03</span>
              <h3 className="font-sora text-base font-bold text-white group-hover:text-amber-400 transition">
                Satori High-DPI Studio
              </h3>
              <p className="text-xs text-slate-400 font-inter leading-relaxed">
                Proprietary SVG-to-PNG compositor with verified logos, crisp typography, and zero generative hallucinations.
              </p>
            </div>

            <div className="p-5 rounded-[14px] bg-[#0B0F14] border border-white/10 hover:border-emerald-500/50 transition group space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <Smartphone size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Service 04</span>
              <h3 className="font-sora text-base font-bold text-white group-hover:text-emerald-400 transition">
                48h WhatsApp Review
              </h3>
              <p className="text-xs text-slate-400 font-inter leading-relaxed">
                One-tap approve on WhatsApp, revise with Hindi voice notes, or rely on deterministic passive auto-commit.
              </p>
            </div>

            <div className="p-5 rounded-[14px] bg-[#0B0F14] border border-white/10 hover:border-blue-500/50 transition group space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                <Share2 size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Service 05</span>
              <h3 className="font-sora text-base font-bold text-white group-hover:text-blue-400 transition">
                Multi-Channel Publishing
              </h3>
              <p className="text-xs text-slate-400 font-inter leading-relaxed">
                Official API broadcasting to Instagram, Facebook, LinkedIn, and X with first-reply link placement guardrails.
              </p>
            </div>

            <div className="p-5 rounded-[14px] bg-[#0B0F14] border border-white/10 hover:border-pink-500/50 transition group space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-pink-500/15 text-pink-400 flex items-center justify-center font-bold">
                <Sparkles size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Service 06</span>
              <h3 className="font-sora text-base font-bold text-white group-hover:text-pink-400 transition">
                Programmatic Video & Reels
              </h3>
              <p className="text-xs text-slate-400 font-inter leading-relaxed">
                Remotion 9:16 vertical video engine paired with ElevenLabs Indian English and Hindi voiceovers.
              </p>
            </div>

            <div className="p-5 rounded-[14px] bg-[#0B0F14] border border-white/10 hover:border-amber-500/50 transition group space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                <Mail size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Service 07</span>
              <h3 className="font-sora text-base font-bold text-white group-hover:text-amber-400 transition">
                Autonomous Email Newsletters
              </h3>
              <p className="text-xs text-slate-400 font-inter leading-relaxed">
                Branded HTML email builder dispatched automatically to patient and customer lists via Resend and Amazon SES.
              </p>
            </div>

            <div className="p-5 rounded-[14px] bg-[#0B0F14] border border-white/10 hover:border-emerald-500/50 transition group space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <MessagesSquare size={18} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Service 08 • NEW</span>
              <h3 className="font-sora text-base font-bold text-white group-hover:text-emerald-400 transition">
                Unified Customer Inbox
              </h3>
              <p className="text-xs text-slate-400 font-inter leading-relaxed">
                Single workspace for WhatsApp, Instagram, Messenger, and Email chats with AI routing and internal notes.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] bg-white/[0.05] hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition"
            >
              <span>View Deep-Dive Architectural Breakdown of All 8 Services</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Industry Verticals Tailored for India */}
      <section className="py-20 border-t border-white/[0.08] bg-[#060a12]/70 relative">
        <SmbVerticalUseCases />
      </section>

      {/* 9. Interactive Retainer ROI Savings Calculator */}
      <section className="py-20 border-t border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-[20px] bg-gradient-to-br from-[#0B0F14] via-[#121720] to-[#0B0F14] border border-white/15 relative shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A00]/15 text-[#FF7A00] text-xs font-semibold">
                  <Calculator size={14} />
                  <span>Retainer Savings Calculator</span>
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
                    <span className="text-slate-400">Current Monthly Spend:</span>
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

      {/* 10. Social Proof & Verified Testimonials */}
      <section className="py-20 border-t border-white/[0.08] bg-[#060a12]/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Star size={14} className="fill-emerald-400" />
              <span>Verified Founders & Doctors</span>
            </div>
            <h2 className="font-sora text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Trusted by 450+ Indian Businesses
            </h2>
            <p className="text-sm text-slate-300 font-inter">
              See what founders have to say about eliminating marketing retainers.
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
                "As an orthodontist, I cannot spend hours approving Canva templates or arguing with freelance copywriters. KUIRO sends me a WhatsApp message 48 hours before every festival. I send a voice note between surgeries, and it publishes flawlessly."
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] font-bold text-xs flex items-center justify-center font-sora">
                  RS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-sora">Dr. Rajesh Sharma</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Apex Dental & Implant Center • Kolkata</p>
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
                "Our specialty roastery runs seasonal monsoon brews and Durga Puja menus. KUIRO's regional cultural radar creates authentic Bengali copy that our customers actually share. Our weekend table reservations jumped 38%."
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center font-sora">
                  KC
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-sora">Kolkata Chai Co.</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Specialty Cafes • Park Street & Bangalore</p>
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
                "We manage 18 SMB clients. Moving them to KUIRO saved our agency over 60 hours a month. The new Unified Inbox feature lets our team respond to Instagram DMs and WhatsApp inquiries with zero collisions."
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center font-sora">
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

      {/* 11. Frequently Asked Questions Accordion */}
      <section className="py-20 border-t border-white/[0.08] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
              Common Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-inter">
              Everything you need to know about our autonomous execution and WhatsApp loop.
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

      {/* 12. Bottom High-Impact CTA Banner */}
      <section className="py-20 border-t border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#FF7A00]/15 blur-[150px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-sora text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Stop babysitting marketing retainers. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] via-[#FFA34D] to-[#FF7A00]">
              Put your business marketing on autopilot.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-inter max-w-2xl mx-auto leading-relaxed">
            Join hundreds of forward-thinking Indian founders, doctors, and multi-location brands. Set up your Brand Brain in 60 seconds with zero credit card required.
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

      {/* 13. Unified Global Footer */}
      <Footer />
    </div>
  );
}
