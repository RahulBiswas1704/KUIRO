'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AnnouncementBar, Navbar, Footer } from '@/components/layout';
import KuiroLogo from '@/components/brand/KuiroLogo';
import GetStartedButton from '@/components/auth/GetStartedButton';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Check,
  Smartphone,
  Calendar,
  TrendingUp,
  ShieldCheck,
  Zap,
  Layers,
  RefreshCw,
  MessageCircle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Globe2,
  Archive,
  DollarSign,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Star,
  Quote,
  Award,
  Users,
  Store,
  Building2,
  Coffee,
  ShoppingBag,
  Eye,
  Heart,
  Share2,
  AlertCircle,
  Clock,
  Mic,
  Sliders,
  Send,
  SlidersHorizontal,
  Bot,
  Flame,
  UserCheck
} from 'lucide-react';

export default function RebuiltHomePage() {
  const router = useRouter();
  const { isLoggedIn, handleGetStarted, openAuthModal } = useAuth();

  // 1. Hero Interactive Console Tab State
  const [heroConsoleTab, setHeroConsoleTab] = useState<'whatsapp' | 'brain' | 'creative'>('whatsapp');
  const [heroApprovalState, setHeroApprovalState] = useState<'PENDING' | 'APPROVED' | 'SKIPPED' | 'REVISED'>('PENDING');
  const [isPlayingHeroVoice, setIsPlayingHeroVoice] = useState(false);
  const [heroVoiceProgress, setHeroVoiceProgress] = useState(0);

  // 2. Interactive Brand Brain Scanner State
  const [scannerInput, setScannerInput] = useState('kolkatachai.co');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [activeBrandProfile, setActiveBrandProfile] = useState<{
    name: string;
    domain: string;
    niche: string;
    colors: string[];
    tone: string;
    font: string;
    pillars: string[];
    negativeRule: string;
    sampleHeadline: string;
    indicBadge: string;
  }>({
    name: 'Kolkata Chai Co. & Artisanal Blends',
    domain: 'kolkatachai.co',
    niche: 'Retail SMB & D2C Beverage',
    colors: ['#FF7A00', '#2B1704', '#F4EDE2'],
    tone: 'Warm, Nostalgic, Heritage-Proud, Crisp',
    font: 'Noto Sans Bengali + Sora',
    pillars: ['Fresh Kulhad Chai Heritage', 'Festive Gift Hampers', 'Direct Sourced Assam Leaves'],
    negativeRule: 'Never use generic stock imagery; avoid artificial discounts.',
    sampleHeadline: 'কলকাতার ঐতিহ্যে সাজানো শারদীয় চা উৎসব',
    indicBadge: 'Bengali + English Shaped',
  });

  // Preset Brand Switcher
  const presetBrands = [
    {
      label: 'Kolkata Chai Co.',
      domain: 'kolkatachai.co',
      name: 'Kolkata Chai Co. & Artisanal Blends',
      niche: 'Retail & D2C Tea Cafe',
      colors: ['#FF7A00', '#2B1704', '#F4EDE2'],
      tone: 'Warm, Nostalgic, Heritage-Proud',
      font: 'Noto Sans Bengali + Sora',
      pillars: ['Clay Cup Heritage', 'Durga Puja Gift Tins', 'Organic Estate Leaves'],
      negativeRule: 'No artificial syrup claims; never use generic stock cups.',
      sampleHeadline: 'মাটির ভাঁড়ের খাঁটি স্বাদ — পুজো স্পেশাল ব্লেন্ড',
      indicBadge: 'Bengali Script',
    },
    {
      label: 'FabSaree Surat',
      domain: 'fabsaree.in',
      name: 'FabSaree Handlooms & Silk',
      niche: 'Apparel & Festive Ethnic Wear',
      colors: ['#E11D48', '#FFD700', '#0F172A'],
      tone: 'Regal, Celebratory, Trustworthy',
      font: 'Noto Sans Devanagari + Cormorant',
      pillars: ['Pure Zari Craftsmanship', 'Wedding Trousseau', 'Surat Weaver Heritage'],
      negativeRule: 'Never use machine-print claims for genuine handloom silk.',
      sampleHeadline: 'विवाह और दीपोत्सव के लिए शुद्ध बनारसी जरी सिल्क',
      indicBadge: 'Devanagari Script',
    },
    {
      label: 'Aura Skin Studio',
      domain: 'auraderm.clinic',
      name: 'Aura Dermatology & Aesthetic Clinic',
      niche: 'Clinical Practice & Wellness',
      colors: ['#0D9488', '#0F172A', '#F0FDFA'],
      tone: 'Clinical, Reassuring, Scientific, Gentle',
      font: 'Inter + Sora (Clean Sans)',
      pillars: ['US-FDA Cleared Tech', 'Doctor-Led Consultations', 'Holistic Skin Health'],
      negativeRule: 'Never guarantee 100% cure; avoid medical superlative guarantees.',
      sampleHeadline: 'Scientifically Restored Festive Radiance — Certified Care',
      indicBadge: 'Medical Guardrails Verified',
    },
    {
      label: 'Blue Tokai Roasters',
      domain: 'bluetokai.coffee',
      name: 'Blue Tokai Specialty Coffee',
      niche: 'Specialty Beverage & Cafe Chain',
      colors: ['#2563EB', '#0F172A', '#EFF6FF'],
      tone: 'Artisanal, Educational, Minimal, Direct',
      font: 'Noto Sans Devanagari + Sora',
      pillars: ['Single Estate Arabica', 'Home Brewing Guides', 'Farm-to-Cup Transparency'],
      negativeRule: 'Never promote instant chicory coffee; emphasize freshly roasted.',
      sampleHeadline: 'ताज़ा रोस्टेड एस्टेट कॉफ़ी — दिवाली गिफ्ट बॉक्सेज लाइव',
      indicBadge: 'Bilingual Devanagari',
    },
  ];

  // 3. Cultural Radar Calendar Filter & Selected Milestone
  const [calendarRegion, setCalendarRegion] = useState<'ALL' | 'PAN_INDIA' | 'EAST' | 'WEST' | 'SOUTH' | 'NORTH'>('ALL');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('diwali');

  const culturalEvents = [
    {
      id: 'diwali',
      title: 'Diwali & Kali Puja',
      date: 'Nov 01, 2026',
      daysLeft: '48h Review',
      region: 'PAN_INDIA',
      regionLabel: 'Pan-India',
      status: 'AUTOPILOT_QUEUED',
      theme: 'Deepotsav & Festive Gift Hampers',
      criticScore: 96,
      devanagariGreeting: 'शुभ दीपावली एवं समृद्ध नववर्ष!',
      bengaliGreeting: 'শুভ দীপাবলি ও কালীপূজার শুভেচ্ছা!',
      postCaption: 'May the warmth of earthen diyas illuminate your home and hearth. Our Handcrafted Festive Tea Box is now available with guaranteed express festive delivery.',
      recommendedCta: 'Shop Festive Reserve via WhatsApp',
    },
    {
      id: 'chhath',
      title: 'Chhath Puja',
      date: 'Nov 07, 2026',
      daysLeft: '7 Days Away',
      region: 'NORTH',
      regionLabel: 'Bihar, UP & Jharkhand',
      status: 'RADAR_TRACKED',
      theme: 'Arghya & Traditional Purity',
      criticScore: 94,
      devanagariGreeting: 'छठ महापर्व की पावन शुभकामनाएं!',
      bengaliGreeting: '',
      postCaption: 'Honoring the Sun God and cosmic vitality. Celebrating the sacred traditions of cleanliness, devotion, and community blessings.',
      recommendedCta: 'Explore Pure Festive Offerings',
    },
    {
      id: 'pongal',
      title: 'Makar Sankranti & Pongal',
      date: 'Jan 14, 2027',
      daysLeft: '60 Days Away',
      region: 'SOUTH',
      regionLabel: 'Tamil Nadu, AP & Karnataka',
      status: 'SCHEDULED',
      theme: 'Harvest Bounty & Sun Gratitude',
      criticScore: 93,
      devanagariGreeting: 'मकर संक्रांति की हार्दिक बधाई!',
      bengaliGreeting: 'পৌষ সংক্রান্তির আন্তরিক প্রীতি ও শুভেচ্ছা!',
      postCaption: 'When the season turns and the fields turn golden. Celebrating new beginnings, fresh harvest jaggery, and community warmth.',
      recommendedCta: 'Discover Harvest Specials',
    },
    {
      id: 'republic',
      title: 'Republic Day of India',
      date: 'Jan 26, 2027',
      daysLeft: '72 Days Away',
      region: 'PAN_INDIA',
      regionLabel: 'Pan-India National',
      status: 'SCHEDULED',
      theme: 'Pride of Constitution & Sovereign Bharat',
      criticScore: 97,
      devanagariGreeting: 'गणतंत्र दिवस की हार्दिक शुभकामनाएं!',
      bengaliGreeting: 'প্রজাতন্ত্র দিবসের রক্তিম অভিনন্দন!',
      postCaption: '77 years of democratic sovereignty. Proudly crafted in Bharat, serving the world with uncompromising quality and integrity.',
      recommendedCta: 'Celebrate with Made in India Pride',
    },
    {
      id: 'shivratri',
      title: 'Maha Shivratri',
      date: 'Feb 15, 2027',
      daysLeft: '92 Days Away',
      region: 'NORTH',
      regionLabel: 'Pan-India Spiritual',
      status: 'SCHEDULED',
      theme: 'Cosmic Stillness & Inner Strength',
      criticScore: 92,
      devanagariGreeting: 'हर हर महादेव! महाशिवरात्रि की शुभकामनाएं',
      bengaliGreeting: 'শুভ মহাশিবরাত্রির পুণ্য শুভেচ্ছা!',
      postCaption: 'Reflecting on stillness, discipline, and cosmic resonance. Wishing all our patrons peace and inner strength this auspicious night.',
      recommendedCta: 'View Herbal & Pure Blends',
    },
    {
      id: 'holi',
      title: 'Holi & Dol Jatra',
      date: 'Mar 24, 2027',
      daysLeft: '128 Days Away',
      region: 'PAN_INDIA',
      regionLabel: 'Pan-India & Bengal',
      status: 'SCHEDULED',
      theme: 'Natural Gulal, Joy & Spring Harvest',
      criticScore: 95,
      devanagariGreeting: 'रंगों के पावन पर्व होली की बधाई!',
      bengaliGreeting: 'শুভ দোলযাত্রা ও হোলির শুভেচ্ছা!',
      postCaption: 'Celebrate with organic plant-based colors and refreshing thandai blends. Safe for your loved ones, gentle on the earth.',
      recommendedCta: 'Reserve Holi Gift Hampers',
    },
  ];

  const filteredEvents = culturalEvents.filter((ev) => {
    if (calendarRegion === 'ALL') return true;
    if (calendarRegion === 'PAN_INDIA') return ev.region === 'PAN_INDIA';
    return ev.region === calendarRegion;
  });

  const selectedMilestone = culturalEvents.find((e) => e.id === selectedMilestoneId) || culturalEvents[0];

  // 4. Voice Note Revision Demo Simulation
  const [voiceSimStep, setVoiceSimStep] = useState<'IDLE' | 'PLAYING' | 'REVISING' | 'DONE'>('IDLE');
  const [voiceSimProgress, setVoiceSimProgress] = useState(0);

  const triggerVoiceSimulation = () => {
    if (voiceSimStep !== 'IDLE' && voiceSimStep !== 'DONE') return;
    setVoiceSimStep('PLAYING');
    setVoiceSimProgress(0);

    const interval = setInterval(() => {
      setVoiceSimProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setVoiceSimStep('REVISING');
          setTimeout(() => {
            setVoiceSimStep('DONE');
          }, 1400);
          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  // 5. Retainer Savings Calculator
  const [agencyRetainerSpend, setAgencyRetainerSpend] = useState<number>(45000);
  const kuiroGrowthPrice = 2799;
  const monthlySavings = Math.max(0, agencyRetainerSpend - kuiroGrowthPrice);
  const annualSavings = monthlySavings * 12;

  // 6. Pricing Frequency (Monthly / Annual)
  const [pricingCycle, setPricingCycle] = useState<'monthly' | 'annual'>('monthly');

  // 7. FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Do I really never have to log into a dashboard to approve posts?',
      answer:
        'Zero mandatory dashboard logins. 48 hours before any scheduled festival, trending moment, or promotional campaign, KUIRO generates your multi-channel graphics and delivers an interactive preview card directly to your WhatsApp. You can tap "Approve Now", tap "Skip", or reply with a quick voice note in Hindi, Bengali, or English. If you do nothing, KUIRO automatically auto-commits and posts at scheduled peak engagement hours.',
    },
    {
      question: 'How does KUIRO avoid looking like generic, cheap AI generated content?',
      answer:
        'Unlike generic AI tools that hallucinate distorted text or recycle generic pastel blobs, KUIRO operates on a deterministic Brand Brain pipeline. It enforces your exact brand hex codes, verified SVG logos, and official font families. Furthermore, for Indian languages (Devanagari, Bengali, Tamil, Telugu), KUIRO uses a specialized Satori compositor that pre-shapes native Google Noto fonts with zero ligature clipping or broken glyphs.',
    },
    {
      question: 'Is my WhatsApp Business account and social media access safe?',
      answer:
        '100% compliant and secure. KUIRO uses official Meta Graph API v21.0 endpoints, AES-256-GCM authenticated encryption for all stored tokens, and strict per-workspace tenant isolation in Neon PostgreSQL. We never request your personal WhatsApp login or scan unofficial QR web hacks that risk Meta number bans.',
    },
    {
      question: 'How does Campaign ROI & Inbound Lead Attribution work?',
      answer:
        'Every published social post and WhatsApp status card embeds campaign-specific UTM tracking parameters and dedicated WhatsApp inquiry click-to-chat links. When a customer taps your post and messages you ("Hi, I saw your Diwali offer..."), KUIRO automatically tags the customer conversation in your Omni-Inbox with the exact originating campaign and calculates your net revenue and return on marketing spend.',
    },
    {
      question: 'What if I want to make custom adjustments before publishing?',
      answer:
        'You have three instant options: 1) Send a WhatsApp voice note (e.g., "Headline me 20% off bold kardo aur background thoda darker karo") and KUIRO applies the revision in 12 seconds; 2) Reply with a quick text instruction on WhatsApp; or 3) Open the one-click link to adjust headlines, aspect ratios, or copy directly inside the Brand Studio.',
    },
    {
      question: 'Can I export ready-to-use Creative Kits for my offline store or staff?',
      answer:
        'Yes! With 1-Click Creative Kit Export, KUIRO bundles high-DPI 4:5 posters (1080x1350) for in-store displays and Instagram, 1:1 square cards for WhatsApp status, verified copy with hashtags, and responsive HTML newsletters in a clean ZIP archive.',
    },
  ];

  // Handler for custom brand scanning
  const handleScanBrand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!scannerInput.trim()) return;

    setIsScanning(true);
    setScanStep(1);

    setTimeout(() => setScanStep(2), 400);
    setTimeout(() => setScanStep(3), 800);
    setTimeout(() => {
      setIsScanning(false);
      setScanStep(4);
      setActiveBrandProfile({
        name: scannerInput.includes('tokai')
          ? 'Blue Tokai Specialty Coffee'
          : scannerInput.includes('saree')
          ? 'FabSaree Handlooms & Silk'
          : scannerInput.includes('skin') || scannerInput.includes('aura')
          ? 'Aura Dermatology & Aesthetic Clinic'
          : `${scannerInput.replace(/https?:\/\//, '').replace(/\..*$/, '').toUpperCase()} Brand Co.`,
        domain: scannerInput,
        niche: 'Autonomous Client Profile',
        colors: ['#FF7A00', '#0F172A', '#F8FAFC'],
        tone: 'Confident, Contemporary, Grounded',
        font: 'Noto Sans Devanagari + Sora Bold',
        pillars: ['Signature Offerings', 'Festival Specials', 'Verified Customer Testimonials'],
        negativeRule: 'Never make unverified superlative claims; maintain authentic brand voice.',
        sampleHeadline: 'उत्सव की तैयारी — विशेष त्यौहारी छूट अब उपलब्ध',
        indicBadge: 'Custom Brand DNA Calibrated',
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#06080D] text-slate-100 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-hidden">
      {/* Subtle Specular Background Lighting (No cheesy glowing blobs) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[580px] bg-gradient-to-b from-[#FF7A00]/[0.07] via-[#FF7A00]/[0.02] to-transparent pointer-events-none -z-10 blur-3xl" />
      <div className="absolute top-96 left-0 w-96 h-96 bg-blue-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-96 right-0 w-96 h-96 bg-emerald-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* 1. Subtle Notification Header */}
      <AnnouncementBar
        badge="Autonomous 2.0"
        tagline="The Marketing Operating System for Bharat & Beyond."
        subtitle="— 48-Hour Festival Autopilot • WhatsApp Reviews • Real Lead Attribution."
      />

      {/* 2. Floating Frosted Glass Navbar */}
      <Navbar
        activeRoute="home"
        badgeText="Autonomous Radar Active"
        statusText="WhatsApp Bridge Online"
      />

      {/* =========================================================================
          HERO SECTION: THE AUTONOMOUS MARKETING COLLEAGUE
      ========================================================================= */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Status Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E131E]/90 border border-white/[0.12] shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.12)] text-xs backdrop-blur-xl">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7A00] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF7A00]" />
            </span>
            <span className="font-mono text-[11px] text-slate-300 font-medium">
              35+ Indian Festivals Tracked • Autonomous 48h Dispatch
            </span>
            <span className="text-white/20">•</span>
            <span className="text-[#FF7A00] font-semibold text-[11px] flex items-center gap-1">
              Zero Agency Retainers
            </span>
          </div>

          {/* Headline with Human Craft & Precision Typography */}
          <h1 className="font-sora text-4xl sm:text-6xl lg:text-[72px] font-extrabold tracking-tight text-white leading-[1.08]">
            Marketing on Autopilot. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Approved via WhatsApp.
            </span>
          </h1>

          {/* Clear, Grounded Subheadline */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-inter leading-relaxed">
            The autonomous marketing colleague that lives in your WhatsApp. KUIRO indexes your brand DNA, drafts campaigns 7 days before every festival, and sends an interactive preview 48 hours before. 
            <span className="text-white font-medium"> Review in 5 seconds over chai</span>, or let it post automatically.
          </p>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#FF7A00] hover:bg-[#FF881A] text-white text-sm font-sora font-semibold transition-all duration-200 shadow-[0_12px_28px_-6px_rgba(255,122,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>{isLoggedIn ? 'Open Your Dashboard' : 'Start 14-Day Free Trial (₹0)'}</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            <a
              href="#whatsapp-demo"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#0C1019]/80 hover:bg-white/[0.08] text-slate-200 text-sm font-medium border border-white/[0.12] hover:border-white/[0.24] transition-all backdrop-blur-xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.3)]"
            >
              <Smartphone size={16} className="text-emerald-400" />
              <span>See WhatsApp Interactive Demo</span>
            </a>
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400 font-inter">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>100% Human Approval Window</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Devanagari & Bengali Typography</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Real Inbound WhatsApp Leads</span>
            </div>
          </div>
        </div>

        {/* =====================================================================
            HERO INTERACTIVE PRODUCT CONSOLE (FROSTED GLASS CONTAINER)
        ===================================================================== */}
        <div className="mt-12 sm:mt-16 rounded-3xl border border-white/[0.12] bg-[#0A0E17]/70 backdrop-blur-2xl p-3 sm:p-5 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.12)] max-w-5xl mx-auto">
          {/* Console Header Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-3 sm:pb-4 border-b border-white/[0.08] gap-3 px-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400">
                kuiro.console • Diwali 2026 Festival Autopilot Loop
              </span>
            </div>

            {/* Interactive View Selector Tabs */}
            <div className="flex items-center p-1 rounded-full bg-[#06090F] border border-white/[0.08] shadow-inner text-xs">
              <button
                onClick={() => setHeroConsoleTab('whatsapp')}
                className={`px-3.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
                  heroConsoleTab === 'whatsapp'
                    ? 'bg-[#FF7A00] text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone size={13} />
                <span>1. WhatsApp Review</span>
              </button>
              <button
                onClick={() => setHeroConsoleTab('brain')}
                className={`px-3.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
                  heroConsoleTab === 'brain'
                    ? 'bg-[#FF7A00] text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap size={13} />
                <span>2. Brand Brain DNA</span>
              </button>
              <button
                onClick={() => setHeroConsoleTab('creative')}
                className={`px-3.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
                  heroConsoleTab === 'creative'
                    ? 'bg-[#FF7A00] text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers size={13} />
                <span>3. Multi-Channel Assets</span>
              </button>
            </div>
          </div>

          {/* TAB 1: WHATSAPP 48-HOUR REVIEW SIMULATOR */}
          {heroConsoleTab === 'whatsapp' && (
            <div className="py-5 sm:py-7 px-2 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left Column: Phone UI Simulation */}
              <div className="md:col-span-7 bg-[#05080E] border border-white/[0.1] rounded-2xl p-4 sm:p-5 shadow-2xl relative">
                {/* Simulated WhatsApp Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#FF7A00] flex items-center justify-center font-bold text-xs text-white">
                      K
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1">
                        <span>KUIRO Marketing Agent</span>
                        <CheckCircle2 size={12} className="text-emerald-400" />
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono">Official Verified Assistant</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">08:30 AM (48h Window)</span>
                </div>

                {/* WhatsApp Chat Bubble */}
                <div className="space-y-3">
                  <div className="bg-[#121B28] border border-white/[0.08] rounded-2xl p-3.5 text-xs text-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#FF7A00]">
                      <span className="flex items-center gap-1">
                        <Flame size={12} />
                        <span>UPCOMING FESTIVAL CAMPAIGN</span>
                      </span>
                      <span className="bg-[#FF7A00]/20 px-2 py-0.5 rounded text-[10px]">
                        Diwali 2026
                      </span>
                    </div>

                    {/* Creative Thumbnail Mockup */}
                    <div className="rounded-xl overflow-hidden bg-gradient-to-br from-[#1F1206] to-[#0A0502] border border-[#FF7A00]/30 p-4 text-center relative">
                      <div className="text-[11px] font-mono text-[#FF9E42] uppercase tracking-wider mb-1">
                        Kolkata Chai Co. • Festive Blend
                      </div>
                      <h4 className="font-sora font-bold text-white text-base leading-snug">
                        মাটির ভাঁড়ের ঐতিহ্যবাহী দীপাবলি চা উৎসব
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1">
                        &quot;Pre-ordered Festive Chai Gift Boxes with pure Assam First Flush & earthen kulhads.&quot;
                      </p>
                      <div className="mt-2.5 inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-[10px] font-mono text-emerald-400">
                        <span>AI Critic Score: 96/100 (Safety & Brand Aligned)</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      ⏰ <strong>Scheduled Post:</strong> Tomorrow at 10:00 AM IST across Instagram Feed (4:5) & Facebook.<br />
                      💡 <strong>Passive Auto-Commit:</strong> If you don’t reply, KUIRO will publish automatically.
                    </p>

                    {/* Interactive Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => setHeroApprovalState('APPROVED')}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold font-sora transition-all flex items-center justify-center gap-1.5 ${
                          heroApprovalState === 'APPROVED'
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        <Check size={13} />
                        <span>{heroApprovalState === 'APPROVED' ? 'Approved & Locked' : 'Approve Now'}</span>
                      </button>

                      <button
                        onClick={() => setHeroApprovalState('SKIPPED')}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold font-sora transition-all flex items-center justify-center gap-1.5 ${
                          heroApprovalState === 'SKIPPED'
                            ? 'bg-rose-600 text-white shadow-lg'
                            : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/20'
                        }`}
                      >
                        <AlertCircle size={13} />
                        <span>{heroApprovalState === 'SKIPPED' ? 'Skipped Post' : 'Skip Post'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Simulated Voice Revision Waveform */}
                  <div className="p-3 rounded-xl bg-[#090E17] border border-white/[0.08] flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setIsPlayingHeroVoice(!isPlayingHeroVoice);
                        setHeroApprovalState('REVISED');
                      }}
                      className="w-8 h-8 rounded-full bg-[#FF7A00] text-white flex items-center justify-center shrink-0 hover:bg-[#FF881A] transition shadow-md"
                    >
                      {isPlayingHeroVoice ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                        <span>Voice Revision Note (0:08)</span>
                        <span className="text-[#FF7A00]">Hinglish Audio</span>
                      </div>
                      <div className="flex items-center gap-1 h-3">
                        {[40, 70, 90, 50, 100, 80, 60, 95, 45, 80, 65, 30, 85, 90, 55, 35, 75].map((val, idx) => (
                          <span
                            key={idx}
                            style={{ height: `${val}%` }}
                            className={`w-1 rounded-full transition-colors ${
                              isPlayingHeroVoice ? 'bg-[#FF7A00] animate-pulse' : 'bg-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                      Auto-Transcribed
                    </span>
                  </div>

                  {/* Simulated Result Feedback */}
                  {heroApprovalState === 'REVISED' && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2 animate-fade-in">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      <span>Surgical revision applied in 11.4s: Headline updated to emphasize 20% festive discount.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Why This Is Transformative */}
              <div className="md:col-span-5 space-y-4 text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium border border-emerald-500/20">
                  <CheckCircle2 size={12} />
                  <span>The Chai Break Test</span>
                </div>
                <h3 className="font-sora text-xl sm:text-2xl font-bold text-white leading-snug">
                  Review campaigns in 5 seconds while having breakfast.
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-inter">
                  Traditional agencies make you wait 4 days for an email draft. KUIRO generates fully shaped graphics in advance and puts the approval right on your WhatsApp.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="text-xs text-slate-300">
                      <strong className="text-white block font-medium">One-Tap Approval:</strong>
                      Tap &quot;Approve Now&quot; to lock publication, or do nothing to allow passive auto-commit.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="text-xs text-slate-300">
                      <strong className="text-white block font-medium">Multilingual Voice Revisions:</strong>
                      Send a 5-second voice note in Hindi, Bengali, or English. KUIRO surgically adjusts copy and graphics.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRAND BRAIN DNA INSPECTOR */}
          {heroConsoleTab === 'brain' && (
            <div className="py-6 px-3 sm:px-6 text-left space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                <div>
                  <h3 className="font-sora text-lg font-bold text-white flex items-center gap-2">
                    <span>Active Vector Brand Brain</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/30">
                      Neon pgvector ID: #BRN-9021
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Deterministic guardrails extracted from your website and social profiles.
                  </p>
                </div>
                <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/20">
                  ● 100% Brand Fidelity Locked
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Brand Colors & Visual DNA */}
                <div className="p-4 rounded-xl bg-[#080C14] border border-white/[0.08] space-y-3">
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Visual Identity & Palette
                  </div>
                  <div className="flex items-center gap-2">
                    {activeBrandProfile.colors.map((c, i) => (
                      <div key={i} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-mono">
                        <span className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: c }} />
                        <span className="text-slate-300">{c}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Typography Pipeline</span>
                    <strong className="text-white">{activeBrandProfile.font}</strong>
                  </div>
                </div>

                {/* Tone of Voice Archetype */}
                <div className="p-4 rounded-xl bg-[#080C14] border border-white/[0.08] space-y-3">
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Tone & Voice Archetype
                  </div>
                  <div className="text-sm font-semibold text-[#FF7A00]">
                    {activeBrandProfile.tone}
                  </div>
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Target Audience</span>
                    <span>Urban D2C Connoisseurs & Heritage Tea Enthusiasts</span>
                  </div>
                </div>

                {/* Content Pillars & Safety Rules */}
                <div className="p-4 rounded-xl bg-[#080C14] border border-white/[0.08] space-y-3">
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Negative Constraints & Safety
                  </div>
                  <div className="text-xs text-rose-300 bg-rose-950/30 p-2 rounded-lg border border-rose-500/20">
                    ⚠️ {activeBrandProfile.negativeRule}
                  </div>
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Core Content Pillar</span>
                    <span>{activeBrandProfile.pillars[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MULTI-CHANNEL ASSET BUNDLE */}
          {heroConsoleTab === 'creative' && (
            <div className="py-6 px-3 sm:px-6 text-left space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                <div>
                  <h3 className="font-sora text-lg font-bold text-white">
                    One Campaign. 4 Production-Grade Formats.
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pre-rendered in exact aspect ratios for every major platform.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/20">
                    AI Critic Rubric: 96/100 PASSED
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#080C14] border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                    <span>Instagram Feed</span>
                    <span className="text-[#FF7A00]">4:5 Aspect</span>
                  </div>
                  <div className="h-32 rounded-lg bg-gradient-to-br from-[#1A1005] to-[#0A0502] border border-[#FF7A00]/20 flex flex-col justify-end p-2.5 text-center">
                    <span className="font-sora font-bold text-white text-[11px] leading-tight">
                      {activeBrandProfile.sampleHeadline}
                    </span>
                    <span className="text-[9px] text-[#FF9E42] mt-1 font-mono">1080 × 1350 High-DPI</span>
                  </div>
                  <span className="text-[11px] text-slate-300 block">Satori Sharp Compositor with Devanagari ligatures.</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080C14] border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                    <span>WhatsApp Status</span>
                    <span className="text-emerald-400">1:1 Square</span>
                  </div>
                  <div className="h-32 rounded-lg bg-gradient-to-br from-[#06180E] to-[#020A05] border border-emerald-500/20 flex flex-col justify-end p-2.5 text-center">
                    <span className="font-sora font-bold text-white text-[11px] leading-tight">
                      Festive Tea Gift Hampers Live
                    </span>
                    <span className="text-[9px] text-emerald-300 mt-1 font-mono">1080 × 1080 Square</span>
                  </div>
                  <span className="text-[11px] text-slate-300 block">Direct WhatsApp click-to-chat inquiry link embedded.</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080C14] border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                    <span>LinkedIn Post</span>
                    <span className="text-blue-400">Thought Leader</span>
                  </div>
                  <div className="h-32 rounded-lg bg-gradient-to-br from-[#061020] to-[#02050A] border border-blue-500/20 p-2.5 text-left text-[10px] text-slate-300 leading-snug overflow-hidden">
                    <strong className="text-white block mb-1">Founder&apos;s Festive Note:</strong>
                    &quot;Why preserving artisanal hand-blended chai matters in an era of mass commercial processing...&quot;
                  </div>
                  <span className="text-[11px] text-slate-300 block">Zero corporate buzzwords; authentic narrative voice.</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080C14] border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                    <span>Creative Kit ZIP</span>
                    <span className="text-purple-400">1-Click Bundle</span>
                  </div>
                  <div className="h-32 rounded-lg bg-gradient-to-br from-[#150820] to-[#08020D] border border-purple-500/20 flex flex-col items-center justify-center p-2.5 text-center">
                    <Archive size={28} className="text-purple-400 mb-1" />
                    <span className="font-mono text-[10px] text-purple-300">kuiro_kit_diwali.zip</span>
                    <span className="text-[9px] text-slate-400">TV Graphics + Email HTML</span>
                  </div>
                  <span className="text-[11px] text-slate-300 block">Instant bundle for in-store staff and email marketing.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: HOW IT WORKS IN 3 TACTILE STEPS
      ========================================================================= */}
      <section className="py-20 border-t border-white/[0.08] bg-[#080C14]/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-mono uppercase text-[#FF7A00] tracking-wider font-semibold">
              The Autonomous Production Architecture
            </span>
            <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Three steps. Zero marketing stress.
            </h2>
            <p className="text-sm text-slate-400 font-inter">
              How KUIRO eliminates the need for expensive agency retainers and endless review meetings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#0A0E17]/80 border border-white/[0.08] backdrop-blur-xl relative space-y-4 hover:border-white/[0.18] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#FF7A00]/15 text-[#FF7A00] flex items-center justify-center font-mono font-bold text-sm border border-[#FF7A00]/30">
                01
              </div>
              <h3 className="font-sora text-lg font-bold text-white">
                Vector Brand Brain Indexing
              </h3>
              <p className="text-xs text-slate-300 font-inter leading-relaxed">
                Paste your website, store link, or Instagram handle. KUIRO crawls your color palette, typography guidelines, core offerings, and voice tone into your private vector vault.
              </p>
              <div className="text-[11px] font-mono text-[#FF7A00] pt-2 flex items-center gap-1.5">
                <Check size={12} />
                <span>Takes 30 seconds to calibrate</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#0A0E17]/80 border border-white/[0.08] backdrop-blur-xl relative space-y-4 hover:border-white/[0.18] transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm border border-emerald-500/30">
                02
              </div>
              <h3 className="font-sora text-lg font-bold text-white">
                Cultural Radar & 48h WhatsApp Review
              </h3>
              <p className="text-xs text-slate-300 font-inter leading-relaxed">
                Our radar tracks 35+ Indian regional holidays. 7 days before, KUIRO drafts the full creative campaign. 48 hours before, an interactive card arrives on your WhatsApp with audio revision support.
              </p>
              <div className="text-[11px] font-mono text-emerald-400 pt-2 flex items-center gap-1.5">
                <Check size={12} />
                <span>One-tap approve or send voice notes</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#0A0E17]/80 border border-white/[0.08] backdrop-blur-xl relative space-y-4 hover:border-white/[0.18] transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-mono font-bold text-sm border border-blue-500/30">
                03
              </div>
              <h3 className="font-sora text-lg font-bold text-white">
                Multi-Channel Post & Lead Attribution
              </h3>
              <p className="text-xs text-slate-300 font-inter leading-relaxed">
                Posts publish automatically at peak audience hours to Instagram, Facebook, LinkedIn, and WhatsApp. Incoming inquiries are routed to your Omni-Inbox with net revenue tracking.
              </p>
              <div className="text-[11px] font-mono text-blue-400 pt-2 flex items-center gap-1.5">
                <Check size={12} />
                <span>Every post links to customer leads</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: LIVE INTERACTIVE BRAND BRAIN SCANNER
      ========================================================================= */}
      <section className="py-20 border-t border-white/[0.08] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-10">
            <span className="text-xs font-mono text-[#FF7A00] tracking-wider uppercase font-semibold">
              Interactive Test Drive
            </span>
            <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Test the Brand Brain on any business.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-inter">
              Click any of our live sample brands below, or enter your own domain to see how KUIRO extracts tone, palette, and Indian typography.
            </p>

            {/* Quick Preset Brand Chips */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              {presetBrands.map((brand, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setScannerInput(brand.domain);
                    setActiveBrandProfile(brand);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    scannerInput === brand.domain
                      ? 'bg-[#FF7A00]/20 border-[#FF7A00] text-[#FF7A00] font-semibold'
                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {brand.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scanner Input Bar */}
          <form onSubmit={handleScanBrand} className="p-2 sm:p-2.5 rounded-2xl bg-[#090D16] border border-white/[0.12] backdrop-blur-xl flex flex-col sm:flex-row items-center gap-2 shadow-2xl">
            <div className="relative w-full">
              <Globe2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={scannerInput}
                onChange={(e) => setScannerInput(e.target.value)}
                placeholder="Enter your store URL (e.g. yourbrand.in)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] border border-white/[0.06]"
              />
            </div>
            <button
              type="submit"
              disabled={isScanning}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FF7A00] hover:bg-[#FF881A] disabled:opacity-75 text-white font-sora font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-[#FF7A00]/20"
            >
              {isScanning ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Scanning DNA...</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Extract Brand Brain</span>
                </>
              )}
            </button>
          </form>

          {/* Extracted Brand Result Card */}
          <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-[#0A0E17]/90 border border-white/[0.1] shadow-2xl backdrop-blur-xl text-left space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-sora text-base font-bold text-white">{activeBrandProfile.name}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
                    {activeBrandProfile.indicBadge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-inter">{activeBrandProfile.niche}</p>
              </div>

              <div className="flex items-center gap-1.5">
                {activeBrandProfile.colors.map((hex, idx) => (
                  <div key={idx} className="flex items-center gap-1 px-2 py-1 rounded bg-white/[0.04] border border-white/10 text-[10px] font-mono text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hex }} />
                    <span>{hex}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-mono text-[10px] uppercase">Tone Archetype</span>
                <span className="text-white font-medium text-xs mt-0.5 block">{activeBrandProfile.tone}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono text-[10px] uppercase">Typography Engine</span>
                <span className="text-[#FF7A00] font-mono text-xs mt-0.5 block">{activeBrandProfile.font}</span>
              </div>
              <div className="md:col-span-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Sample Autopilot Headline</span>
                <span className="font-sora text-sm text-white font-semibold leading-relaxed block">
                  &quot;{activeBrandProfile.sampleHeadline}&quot;
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: INDIAN CULTURAL RADAR (35+ FESTIVALS)
      ========================================================================= */}
      <section className="py-20 border-t border-white/[0.08] bg-[#070B13]/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <span className="text-xs font-mono uppercase text-[#FF7A00] tracking-wider font-semibold">
              The Bharat Calendar Radar
            </span>
            <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Never miss a festival. Never post late.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-inter">
              From Diwali and Chhath to Makar Sankranti and Poila Boishakh, KUIRO prepares culturally accurate regional campaigns with zero manual planning.
            </p>

            {/* Region Filter Chips */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              {[
                { key: 'ALL', label: 'All Festivals' },
                { key: 'PAN_INDIA', label: 'Pan-India' },
                { key: 'EAST', label: 'Bengal & East' },
                { key: 'NORTH', label: 'North & NCR' },
                { key: 'SOUTH', label: 'South India' },
              ].map((rf) => (
                <button
                  key={rf.key}
                  onClick={() => setCalendarRegion(rf.key as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                    calendarRegion === rf.key
                      ? 'bg-[#FF7A00] text-white border-[#FF7A00] font-semibold'
                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Festival Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedMilestoneId(evt.id)}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition-all backdrop-blur-xl ${
                  selectedMilestoneId === evt.id
                    ? 'bg-[#0E1422] border-[#FF7A00] shadow-[0_12px_32px_rgba(255,122,0,0.15)] ring-1 ring-[#FF7A00]/40'
                    : 'bg-[#090D16]/80 border-white/[0.08] hover:border-white/[0.18]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5 text-white font-medium">
                    <Calendar size={13} className="text-[#FF7A00]" />
                    <span>{evt.date}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[10px]">
                    {evt.regionLabel}
                  </span>
                </div>

                <h3 className="font-sora text-base font-bold text-white">{evt.title}</h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 font-inter">{evt.postCaption}</p>

                <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>Score: {evt.criticScore}/100</span>
                  </span>
                  <span className="text-[#FF7A00] font-semibold">{evt.daysLeft}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: HINGLISH & REGIONAL VOICE REVISION DEMO
      ========================================================================= */}
      <section id="whatsapp-demo" className="py-20 border-t border-white/[0.08] relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Narrative */}
            <div className="md:col-span-6 space-y-4 text-left">
              <span className="text-xs font-mono uppercase text-[#FF7A00] tracking-wider font-semibold">
                Surgical Multilingual Voice Revisions
              </span>
              <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Send a 5-second voice note. Done in 12 seconds.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-inter leading-relaxed">
                Indian business moves fast. You don&apos;t have time to write Jira tickets or design briefs. Speak naturally in Hindi, Bengali, or English, and KUIRO listens, updates the text, and re-renders the high-DPI graphics instantly.
              </p>

              <div className="pt-2">
                <button
                  onClick={triggerVoiceSimulation}
                  disabled={voiceSimStep === 'PLAYING' || voiceSimStep === 'REVISING'}
                  className="px-6 py-3 rounded-full bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs sm:text-sm font-sora font-semibold transition flex items-center gap-2 shadow-lg shadow-[#FF7A00]/25"
                >
                  {voiceSimStep === 'PLAYING' ? (
                    <>
                      <Volume2 size={15} className="animate-pulse" />
                      <span>Listening to Voice Note...</span>
                    </>
                  ) : voiceSimStep === 'REVISING' ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Applying Surgical Revision...</span>
                    </>
                  ) : (
                    <>
                      <Mic size={15} />
                      <span>Play Hinglish Voice Simulation</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Interactive Voice Card */}
            <div className="md:col-span-6 p-5 sm:p-6 rounded-2xl bg-[#090D17] border border-white/[0.12] backdrop-blur-2xl shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#FF7A00] flex items-center justify-center text-white font-bold text-xs">
                    R
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Rahul Biswas (Founder)</div>
                    <div className="text-[10px] text-slate-400 font-mono">WhatsApp Audio Message</div>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                  Audio Inbound
                </span>
              </div>

              {/* Audio Player Bar */}
              <div className="p-3.5 rounded-xl bg-[#05080E] border border-white/[0.06] flex items-center gap-3">
                <button
                  onClick={triggerVoiceSimulation}
                  className="w-9 h-9 rounded-full bg-[#FF7A00] text-white flex items-center justify-center shrink-0 hover:scale-105 transition"
                >
                  <Play size={15} className="ml-0.5" />
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>&quot;Bhai headline me 20% festive discount bold kardo...&quot;</span>
                    <span>0:06</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#FF7A00] h-full transition-all duration-300"
                      style={{ width: `${voiceSimStep === 'DONE' ? 100 : voiceSimProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Transcript & Applied Output */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Transcript & Intent</span>
                <p className="text-slate-300 italic">
                  &quot;Headline me 20% off festive discount bold karo aur Bengali subheadline add karo.&quot;
                </p>
                {voiceSimStep === 'DONE' && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-emerald-300 flex items-center gap-1.5 text-xs font-semibold animate-fade-in">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Applied: Bengali Subheadline added & 20% discount highlighted.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: RETAINER SAVINGS CALCULATOR (THE MATH)
      ========================================================================= */}
      <section className="py-20 border-t border-white/[0.08] bg-[#080C14]/60 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-10">
            <span className="text-xs font-mono uppercase text-[#FF7A00] tracking-wider font-semibold">
              The Real Math
            </span>
            <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Replace a ₹45,000/mo agency retainer with ₹2,799.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-inter max-w-xl mx-auto">
              Traditional agencies assign junior interns and miss regional Indian festive nuances. KUIRO works 24/7 with zero sick days.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0E18] border border-white/[0.12] backdrop-blur-2xl shadow-2xl text-left space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-300 font-medium">Your Current Monthly Marketing / Agency Spend:</span>
                <span className="font-sora font-bold text-white text-base">₹{agencyRetainerSpend.toLocaleString('en-IN')}/mo</span>
              </div>
              <input
                type="range"
                min="15000"
                max="120000"
                step="5000"
                value={agencyRetainerSpend}
                onChange={(e) => setAgencyRetainerSpend(Number(e.target.value))}
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>₹15,000 (Freelancer)</span>
                <span>₹45,000 (Typical SMB Agency)</span>
                <span>₹1,20,000 (Full-Service Firm)</span>
              </div>
            </div>

            {/* Savings Display Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                <span className="text-[11px] font-mono text-emerald-400 uppercase">Monthly Net Savings</span>
                <div className="font-sora text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  ₹{monthlySavings.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">Saved every 30 days vs KUIRO Growth (₹2,799).</span>
              </div>

              <div className="p-4 rounded-xl bg-[#FF7A00]/10 border border-[#FF7A00]/30">
                <span className="text-[11px] font-mono text-[#FF7A00] uppercase">Annual Net Savings</span>
                <div className="font-sora text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  ₹{annualSavings.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">Reinvested into inventory, expansion, or profit.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: TRANSPARENT PRICING
      ========================================================================= */}
      <section id="pricing" className="py-20 border-t border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-mono uppercase text-[#FF7A00] tracking-wider font-semibold">
              Straightforward Pricing
            </span>
            <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              One flat fee. Cancel anytime.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-inter">
              Zero long-term lock-ins. All plans include 14 days free trial and full WhatsApp autopilot access.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="pt-2 flex items-center justify-center gap-2">
              <div className="p-1 rounded-full bg-[#090D17] border border-white/10 flex items-center text-xs">
                <button
                  onClick={() => setPricingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-full font-medium transition ${
                    pricingCycle === 'monthly' ? 'bg-[#FF7A00] text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setPricingCycle('annual')}
                  className={`px-4 py-1.5 rounded-full font-medium transition flex items-center gap-1.5 ${
                    pricingCycle === 'annual' ? 'bg-[#FF7A00] text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Annual</span>
                  <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.2 rounded-full font-bold">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Starter Tier */}
            <div className="p-6 rounded-2xl bg-[#0A0E17]/80 border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between space-y-6 hover:border-white/[0.18] transition">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Starter Plan</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-sora text-3xl font-extrabold text-white">
                    ₹{pricingCycle === 'annual' ? '999' : '1,199'}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-300 font-inter">
                  For solo founders, freelancers, and small retail stores getting started with consistent marketing.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-white/[0.06]">
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" />
                    <span>1 Active Brand Brain profile</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" />
                    <span>15 Scheduled campaigns / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" />
                    <span>WhatsApp 48-hour review card</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" />
                    <span>Instagram & Facebook publishing</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleGetStarted}
                className="w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-sora font-semibold transition border border-white/10"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Growth Tier (Popular) */}
            <div className="p-6 rounded-2xl bg-[#0D1322] border-2 border-[#FF7A00] shadow-[0_16px_40px_rgba(255,122,0,0.18)] backdrop-blur-xl flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#FF7A00] text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow">
                Most Popular for D2C & SMBs
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#FF7A00] uppercase font-semibold">Growth Plan</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-sora text-3xl font-extrabold text-white">
                    ₹{pricingCycle === 'annual' ? '2,299' : '2,799'}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-300 font-inter">
                  Full autonomous autopilot with voice revisions, lead attribution, and creative kit ZIP exports.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-white/[0.06]">
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-[#FF7A00]" />
                    <span className="font-medium text-white">Up to 3 Brand Brain profiles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-[#FF7A00]" />
                    <span className="font-medium text-white">Unlimited 365-Day Cultural Radar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-[#FF7A00]" />
                    <span>Multilingual WhatsApp Voice Revisions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-[#FF7A00]" />
                    <span>1-Click Creative Kit ZIP Exporter</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-[#FF7A00]" />
                    <span>Campaign ROI & Inbound Lead Attribution</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleGetStarted}
                className="w-full py-3 rounded-xl bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition shadow-lg shadow-[#FF7A00]/25"
              >
                Activate Growth Autopilot
              </button>
            </div>

            {/* Agency Tier */}
            <div className="p-6 rounded-2xl bg-[#0A0E17]/80 border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between space-y-6 hover:border-white/[0.18] transition">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Agency & Multi-Branch</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-sora text-3xl font-extrabold text-white">
                    ₹{pricingCycle === 'annual' ? '9,999' : '11,999'}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-300 font-inter">
                  For marketing agencies, retail franchises, and multi-location business networks.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-white/[0.06]">
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" />
                    <span>Up to 15 Client Brand profiles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" />
                    <span>Multi-tenant Team Inbox & RBAC</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" />
                    <span>Custom White-Label Export Branding</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" />
                    <span>Dedicated WhatsApp Account Bridge</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleGetStarted}
                className="w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-sora font-semibold transition border border-white/10"
              >
                Start Agency Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: FAQ ACCORDION
      ========================================================================= */}
      <section className="py-20 border-t border-white/[0.08] bg-[#070A11]/60 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-10">
            <span className="text-xs font-mono uppercase text-[#FF7A00] tracking-wider font-semibold">
              Frequently Answered
            </span>
            <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Real questions. Direct answers.
            </h2>
          </div>

          <div className="space-y-3 text-left">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.08] bg-[#090D17]/80 backdrop-blur-xl overflow-hidden transition"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-xs sm:text-sm font-sora font-semibold text-white hover:text-[#FF7A00] transition"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform ${expandedFaq === idx ? 'rotate-180 text-[#FF7A00]' : 'text-slate-400'}`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-slate-300 font-inter leading-relaxed border-t border-white/[0.04] pt-3 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: FINAL HIGH-IMPACT GLASSMORPHIC CALL TO ACTION
      ========================================================================= */}
      <section className="py-20 border-t border-white/[0.08] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0F1626] to-[#0A0D15] border border-white/[0.14] shadow-[0_24px_64px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] text-center space-y-6 relative overflow-hidden backdrop-blur-2xl">
            <span className="text-xs font-mono text-[#FF7A00] uppercase tracking-wider font-semibold">
              Ready to automate your marketing?
            </span>
            <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Your next festival campaign could already be waiting in your WhatsApp.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-inter">
              Join Indian retail stores, D2C founders, creators, and practices running their marketing on autopilot. Setup takes under 60 seconds.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#FF7A00] hover:bg-[#FF881A] text-white text-sm font-sora font-semibold transition shadow-xl shadow-[#FF7A00]/30 flex items-center justify-center gap-2 group"
              >
                <span>{isLoggedIn ? 'Go to Dashboard' : 'Start 14-Day Free Trial'}</span>
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>

              <a
                href="https://wa.me/919876543210?text=Hi%20KUIRO%20Team%2C%20I%20want%20to%20connect%20my%20brand%20to%20WhatsApp%20autopilot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-sm font-medium border border-white/10 transition flex items-center justify-center gap-2"
              >
                <Smartphone size={16} className="text-emerald-400" />
                <span>Chat with WhatsApp Support</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Clean Site Footer */}
      <Footer />
    </div>
  );
}
