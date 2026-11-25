'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AnnouncementBar, Navbar, Footer } from '@/components/layout';
import KuiroLogo from '@/components/brand/KuiroLogo';
import {
  Layers,
  Calendar,
  Palette,
  Smartphone,
  BarChart3,
  Download,
  MessagesSquare,
  Share2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Volume2,
  UserCheck,
  Stethoscope,
  Briefcase,
  Check,
  Store,
} from 'lucide-react';

export default function ServicesPage() {
  const router = useRouter();
  const { isLoggedIn, handleGetStarted, openAuthModal } = useAuth();

  // Active engine in deep-dive console
  const [activeEngine, setActiveEngine] = useState<
    'brain' | 'radar' | 'compositor' | 'whatsapp' | 'attribution' | 'exporter' | 'inbox' | 'publishing'
  >('brain');

  // Interactive Voice Simulation in Engine 04
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

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Retainer spend state for savings calculator
  const [monthlySpend, setMonthlySpend] = useState<number>(45000);
  const kuiroPrice = 2799;
  const savings = Math.max(0, monthlySpend - kuiroPrice);

  const engines = {
    brain: {
      id: 'brain',
      num: '01',
      badge: 'Zero Hallucinations · Vector Memory',
      title: 'Persistent Brand Brain & Vector Memory',
      tagline: 'Continuous ingestion of brand DNA into zero-retraining pgvector memory.',
      desc: 'The Brand Brain eliminates generic, hallucinated AI copy forever. By indexing your store URL, product catalog, verified credentials, pricing, and visual guidelines into Neon PostgreSQL with pgvector, KUIRO operates like an experienced in-house brand marketer who knows your business inside and out.',
      icon: Layers,
      accent: '#FF7A00',
      specs: [
        { label: 'Storage Engine', val: 'Neon Serverless Postgres' },
        { label: 'Vector Index', val: 'pgvector (HNSW Indexing)' },
        { label: 'Ingestion Speed', val: '< 30 Seconds per URL' },
        { label: 'Tenant Isolation', val: 'Strict Row-Level Security (RLS)' }
      ],
      highlights: [
        'Automatic URL, product catalog, and brand guidelines crawling with semantic chunking',
        'Preserves exact hex color palettes (#FF7A00, #2B1704) and official SVG vector lockups',
        'Strict negative guardrails: blocks prohibited medical claims, misleading discounts, or unverified claims',
        'Learns nuanced brand voice: artisanal, premium, conversational Hinglish, or executive professional'
      ],
      mockup: {
        type: 'brain',
        title: 'Kolkata Chai Co. · Brand Memory Vault',
        vectorCount: '1,420 Embeddings',
        fidelity: '100% Brand Fidelity Locked',
        palette: ['#FF7A00', '#2B1704', '#FDFBF7', '#10B981'],
        fonts: 'Noto Sans Bengali + Sora (SemiBold)',
        voice: 'Warm, Heritage-Proud, Artisanal Tea Culture',
        guardrails: 'Never mention chemical sweeteners; never use stock tea cups'
      }
    },
    radar: {
      id: 'radar',
      num: '02',
      badge: 'Autonomous Radar · 35+ Festivals',
      title: '365-Day Bharat Cultural Radar',
      tagline: 'Proactive scheduling 48 hours ahead across all 28 Indian states and Union Territories.',
      desc: 'Never miss an Indian festival, regional state observance, or commercial retail moment. KUIRO’s autonomous cultural radar monitors 35+ regional festivals across India, automatically queuing custom multi-lingual campaigns at T-48 hours without requiring manual calendar reminders or agency briefs.',
      icon: Calendar,
      accent: '#3B82F6',
      specs: [
        { label: 'Calendar Scope', val: '35+ Regional & National Events' },
        { label: 'Trigger Window', val: '7 Days Prior & 48h Final Lock' },
        { label: 'Scheduling Engine', val: 'Inngest Durable Cron (00:00 IST)' },
        { label: 'Geographic Nuance', val: 'State-Level Holiday Mapping' }
      ],
      highlights: [
        'Pre-loaded cultural triggers: Holi, Diwali, Durga Puja, Eid-ul-Fitr, Pongal, Onam, Chhath Puja, Rakhi',
        'Commercial retail peaks: Akshaya Tritiya, Dhanteras, Independence Day Sale, Year-End Clearance',
        'State-specific language mapping (West Bengal, Maharashtra, Gujarat, Tamil Nadu, Karnataka)',
        'Zero agency delay: campaign concepts generated 7 days before event and delivered 48 hours in advance'
      ],
      mockup: {
        type: 'radar',
        festival: 'Durga Puja & Festive Grand Bazaar',
        region: 'West Bengal & Eastern India (Regional Peak)',
        countdown: 'T-48h Autopilot Active',
        projectedReach: '240,000+ Regional Shoppers',
        suggestedHook: 'Pure Mulberry Silk Festive Drop · শারদোৎসব বিশেষ সংগ্রহ'
      }
    },
    compositor: {
      id: 'compositor',
      num: '03',
      badge: 'Native Indic Typography · High-DPI Canvas',
      title: 'Studio Compositor & Indic Typography',
      tagline: 'Satori & Sharp hybrid canvas compositing with pre-shaped Indic scripts.',
      desc: 'Say goodbye to fragile Canva templates and distorted AI text gibberish. KUIRO pairs photorealistic, text-free background canvases with programmatic high-DPI typography, verified client SVG logos, and flawless Indic script shaping without glyph clipping or broken ligatures.',
      icon: Palette,
      accent: '#F59E0B',
      specs: [
        { label: 'Render Stack', val: 'Satori (JSX to SVG) + Sharp (SVG to WebP)' },
        { label: 'Font Engine', val: 'Google Noto Sans Indic Series' },
        { label: 'Aspect Ratios', val: '1:1 Square, 4:5 Portrait, 9:16 Reel' },
        { label: 'Asset Storage', val: 'Neon Lakebase S3-Compatible Storage' }
      ],
      highlights: [
        'Pre-shaped font rendering for Devanagari (Hindi, Marathi), Bengali, Tamil, Telugu, and Kannada',
        'Multi-aspect ratio generation: 1:1 Feed square, 4:5 LinkedIn carousel, 9:16 vertical stories/reels',
        'Dynamic XML entity sanitization (safely handles & in brand names like "Roy & Sons")',
        '2x2 and 3x2 composite contact sheets for instant single-message WhatsApp previews'
      ],
      mockup: {
        type: 'compositor',
        ratio: '1:1 Feed Square (1080x1080)',
        headlineText: 'रंगों का त्योहार, अपनों का प्यार',
        subText: 'Handcrafted Festive Hampers · Zero Artificial Colors',
        badgeText: 'PRE-SHAPED DEVANAGARI GLYPHS OK'
      }
    },
    whatsapp: {
      id: 'whatsapp',
      num: '04',
      badge: '48-Hour Autopilot · WhatsApp Bridge',
      title: '48h WhatsApp Auto-Commit & Voice Notes',
      tagline: 'Zero dashboard fatigue. Review, voice-revise, or auto-publish straight from your chat.',
      desc: 'Business owners and creators do not have time to log into complex social media dashboards. KUIRO delivers an interactive WhatsApp review card 48 hours before publication. One tap approves, natural Hindi/English voice notes request edits in 12s, or silence auto-commits at T-0.',
      icon: Smartphone,
      accent: '#10B981',
      specs: [
        { label: 'API Provider', val: 'Meta WhatsApp Cloud API (Utility Tier)' },
        { label: 'Voice Transcriber', val: 'Whisper Large v3 / Gemini Audio' },
        { label: 'Revision Latency', val: '< 12 Seconds per Voice Note' },
        { label: 'Silence Protocol', val: 'Auto-Commit at T-0 if Unchanged' }
      ],
      highlights: [
        'Interactive Meta Cloud API Utility templates featuring high-resolution composite preview cards',
        'Multilingual WhatsApp voice note transcription: speak feedback in Hindi, English, or Bengali',
        'Instant action buttons: [Approve Campaign] and [Request Revisions] with zero login barriers',
        'Passive Auto-Commit: Silent approval after 48h ensures your marketing consistency never lapses'
      ],
      mockup: {
        type: 'whatsapp',
        sender: 'KUIRO Autopilot (+91 98765 43210)',
        time: 'Today, 9:15 AM',
        content: 'Namaste Rahul! Your Holi Special Carousel is ready for review. Scheduled to publish in 48 hours on Instagram & Meta Ads.',
        status: voiceApplied ? 'Voice Edit Applied in 11.4s!' : isVoicePlaying ? 'Transcribing Hindi Voice Note...' : 'Review Pending (T-47h 45m left)'
      }
    },
    attribution: {
      id: 'attribution',
      num: '05',
      badge: 'Real GMV · Lead Attribution',
      title: 'Campaign ROI & Inbound Lead Attribution',
      tagline: 'Connect marketing campaigns directly to WhatsApp inquiries, cost-per-lead, and sales.',
      desc: 'Stop guessing if your marketing works. KUIRO attributes every inbound WhatsApp inquiry, form submission, and purchase back to the exact campaign that generated it. Track ad spend, verified leads, cost per lead (CPL), and closed revenue on a live attribution ledger.',
      icon: BarChart3,
      accent: '#10B981',
      specs: [
        { label: 'Attribution Model', val: 'First & Last Touch Lead Mapping' },
        { label: 'Average CPL', val: '₹38 – ₹64 / Verified Inquiry' },
        { label: 'Attribution Tags', val: 'Dynamic UTMs + Pre-filled wa.me Tokens' },
        { label: 'Ledger Database', val: 'Neon PostgreSQL Captured Payments Table' }
      ],
      highlights: [
        'Live tracking of total ad spend, inbound WhatsApp leads, and confirmed customer conversions',
        'Dynamic UTM and WhatsApp wa.me link generation with custom campaign tracking tags',
        'Real-time Cost Per Verified Lead (CPL) and Return on Ad Spend (ROAS) calculation',
        '1-click CSV & PDF export for executive reviews, accountant records, or client reports'
      ],
      mockup: {
        type: 'attribution',
        adSpend: '₹8,500',
        inboundLeads: '184 Verified Chats',
        avgCPL: '₹46.20',
        attributedGMV: '₹1,48,200',
        roas: '17.4x Return'
      }
    },
    exporter: {
      id: 'exporter',
      num: '06',
      badge: '360° Creative Kit · 1-Click ZIP',
      title: '1-Click Creative Kit Asset Exporter',
      tagline: 'Turn digital campaigns into printable in-store displays, TV graphics, emails, and staff SOPs.',
      desc: 'Marketing does not stop at social media. KUIRO generates a complete 360° Creative Kit for every campaign. With 1 click, download a structured ZIP bundle containing 1080p in-store TV display graphics, 1:1 social cards, ready-to-send promotional email HTML, and front desk SOP guidelines.',
      icon: Download,
      accent: '#EC4899',
      specs: [
        { label: 'Archive Engine', val: 'Streaming JSZip (Compression Level 6)' },
        { label: 'In-Store TV Slide', val: '1920x1080 High-DPI Landscape Graphic' },
        { label: 'Promotional Email', val: 'Responsive Inline CSS HTML + Text' },
        { label: 'Staff Training', val: 'Front-Desk Offer Redemption Markdown SOP' }
      ],
      highlights: [
        '1080p Landscape In-Store TV Slide (1920x1080) for smart TV loops, counter displays, and digital signage',
        '1:1 High-Resolution Square Card (1080x1080) for Instagram feed, WhatsApp broadcast, and catalog print',
        'Ready-to-send promotional email HTML with preheaders, responsive layout, and WhatsApp CTAs',
        'Front Desk & Staff SOP with offer redemption codes, FAQs, and staff talking points'
      ],
      mockup: {
        type: 'exporter',
        zipName: 'kuiro-festive-kit-holi-2026.zip',
        fileCount: '5 Production Files Included',
        files: [
          '01-tv-display-1920x1080.webp (In-Store Display)',
          '02-social-card-1080x1080.webp (Instagram & WhatsApp)',
          '03-promo-newsletter.html (Ready-to-Send Email)',
          '04-front-desk-staff-sop.md (Counter Talk Track)',
          'manifest.json (Campaign Metadata & UTMs)'
        ]
      }
    },
    inbox: {
      id: 'inbox',
      num: '07',
      badge: 'Unified Multi-Channel · AI Co-Pilot',
      title: 'Unified Multi-Channel Inbox & Routing',
      tagline: 'Aggregate WhatsApp, Instagram, Messenger, and Email into one collaborative command center.',
      desc: 'Never lose a prospective customer because an inquiry slipped through the cracks. KUIRO unifies inbound messages across WhatsApp, Instagram DM, Facebook Messenger, and Email into a single fast inbox with Gemini Brand Brain AI co-pilot, internal team notes, and automated lead routing.',
      icon: MessagesSquare,
      accent: '#10B981',
      specs: [
        { label: 'Realtime Delivery', val: 'Server-Sent Events (SSE) + Shared Pub/Sub' },
        { label: 'AI Suggestion', val: 'Gemini 2.5 Flash with Brand Memory Context' },
        { label: 'Meta Window', val: '24-Hour Messaging Policy Guardrail Active' },
        { label: 'Team Locks', val: 'Zero-Collision Presence Indicators' }
      ],
      highlights: [
        'Omnichannel aggregation: WhatsApp Business, Instagram DM, Facebook Messenger, and Email',
        'Gemini Brand Brain AI co-pilot suggests accurate, brand-aligned answers in 1 click',
        'Private internal team notes (@mention) with zero-collision live presence indicators',
        'Intelligent lead qualification and routing by inquiry type (Pricing, Booking, Support, Partnership)'
      ],
      mockup: {
        type: 'inbox',
        customer: 'Ananya Sharma (@ananya_tea_lover)',
        channel: 'WhatsApp Business',
        inquiry: 'Do you deliver your Darjeeling First Flush blend to Bangalore before Friday?',
        aiSuggestion: 'Yes, Ananya! We dispatch via Bluedart Air with 48h Bangalore delivery. Use code HOLI15 for 15% off.',
        windowRemaining: '22h 40m remaining in 24h Meta window'
      }
    },
    publishing: {
      id: 'publishing',
      num: '08',
      badge: 'Multi-Network Sync · Zero Link Penalty',
      title: 'Official Multi-Channel Publishing & X Guard',
      tagline: 'Synchronized broadcasting across Instagram, Facebook, LinkedIn, and X with link surcharge protection.',
      desc: 'Broadcasting across 4 major social networks with built-in algorithmic optimization. KUIRO formats copy, hashtags, and media ratios for each platform, and automatically routes external promotional URLs to the first reply on X to avoid algorithm reach penalties and the $0.200 per-link surcharge.',
      icon: Share2,
      accent: '#8B5CF6',
      specs: [
        { label: 'Meta Ecosystem', val: 'Instagram Graph API v21.0 + Facebook Pages' },
        { label: 'Professional Tier', val: 'LinkedIn UGC v2 API' },
        { label: 'Microblogging', val: 'X (Twitter) v2 with Reply Threader' },
        { label: 'Resilience', val: 'Exponential Backoff Retry with Anti-Ghosting' }
      ],
      highlights: [
        'Instagram Graph API: Feed images, multi-image carousels, and vertical Reel containers',
        'LinkedIn UGC API v2: Thought-leadership formatting, bullet structures, and document slides',
        'X (Twitter) v2: First-reply link placement guardrail to protect organic reach & eliminate link fees',
        'Facebook Graph API: Page posts with direct click-to-WhatsApp contact buttons'
      ],
      mockup: {
        type: 'publishing',
        networks: ['Instagram Graph API', 'LinkedIn UGC v2', 'X / Twitter API v2', 'Facebook Graph API'],
        postStatus: 'SYNCHRONIZED BROADCAST ACTIVE',
        xGuard: 'Link routed to First-Reply Thread (Saved $0.200 fee & 3.2x reach)',
        deliveryReceipt: 'All 4 Networks Acknowledged (HTTP 200)'
      }
    }
  };

  const current = engines[activeEngine];
  const CurrentIcon = current.icon;

  const personas = [
    {
      title: 'Retail Stores & Showrooms',
      niche: 'Apparel, Handlooms, Boutiques, Jewelers',
      desc: 'Turn regional festivals into packed showrooms. 1080p in-store TV slides, festive flash sales, regional festival greetings in Bengali/Hindi, and counter staff discount SOPs.',
      icon: Store,
      badge: 'Offline + Digital Synergy',
      metric: '3.4x Festive Footfall'
    },
    {
      title: 'D2C Founders & Creators',
      niche: 'Artisanal Food, Specialty Coffee, Clean Beauty',
      desc: 'Zero dashboard fatigue. Index your brand DNA once, review campaigns on WhatsApp while having chai, and approve with a 1-tap thumb press or voice note.',
      icon: UserCheck,
      badge: 'Zero Dashboard Fatigue',
      metric: '45s Weekly Review Time'
    },
    {
      title: 'Healthcare & Clinical Practices',
      niche: 'Dermatology, Dental Clinics, Wellness',
      desc: 'Strict ASCI ethical compliance, doctor credentials preservation, clinical awareness day calendars, and a unified patient chat inbox with zero data leakage.',
      icon: Stethoscope,
      badge: '100% ASCI & Ethical Guardrails',
      metric: '99.8% Medical Compliance'
    },
    {
      title: 'Marketing Agencies & Franchises',
      niche: 'Boutique Agencies Managing 10-50 Clients',
      desc: 'White-label multi-tenant workspaces. Replace high-turnover graphic design bottlenecks with automated 48-hour client review loops that scale without payroll bloat.',
      icon: Briefcase,
      badge: 'Multi-Tenant Workspaces',
      metric: '10x Client Accounts per Marketer'
    }
  ];

  const faqs = [
    {
      q: 'How does KUIRO prevent hallucinated or generic AI copy?',
      a: 'Unlike generic ChatGPT wrappers, KUIRO ingests your verified store URL, product ingredients, price points, and brand tone into an isolated pgvector database in Neon PostgreSQL. Every generated sentence is checked against deterministic safety critics and your brand guidelines before reaching your WhatsApp.'
    },
    {
      q: 'Do I really not need to log into any dashboard?',
      a: 'Yes. KUIRO was engineered specifically for busy Indian founders and creators. Campaigns arrive directly on your verified WhatsApp 48 hours before publication. You can tap [Approve], send a voice note for changes, or let the 48-hour silence-as-consent protocol auto-publish.'
    },
    {
      q: 'How does Indic typography rendering work without Canva?',
      a: 'We built a programmatic rendering pipeline using Satori and Sharp with Google Noto Sans Indic series. This mathematically shapes Devanagari (Hindi, Marathi), Bengali, Tamil, Telugu, and Kannada ligatures at high-DPI resolution without the broken glyphs or text distortion common in generic AI image generators.'
    },
    {
      q: 'What is the X (Twitter) zero-link surcharge guardrail?',
      a: 'Twitter’s algorithm penalizes tweets containing external URLs and charges high API access tiers. KUIRO automatically posts your main message with rich media to maximize organic impressions, then instantly attaches your promotional purchase link in the first reply thread.'
    },
    {
      q: 'Can I add multiple client brands under one account?',
      a: 'Yes. Agency and Scale plans include isolated multi-tenant workspaces. Each brand gets its own Brand Brain, isolated vector embeddings, separate social credentials, and dedicated WhatsApp approval routing.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070A11] text-white flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-x-clip">
      {/* Top Subtle Announcement */}
      <AnnouncementBar
        badge="Autonomous 2.0"
        tagline="The Marketing Operating System for Bharat & Beyond."
        subtitle="— 8 autonomous engines running 24/7 on autopilot."
      />

      {/* Floating Glassmorphic Navbar (Zorcha Inspired) */}
      <Navbar activeRoute="services" />

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
            <span className="font-semibold text-slate-200">Autonomous Marketing Architecture</span>
            <span className="text-white/20">•</span>
            <span className="text-[#FF7A00] font-medium font-mono text-[11px]">8 Specialized Engines</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-sora font-extrabold tracking-tight text-white leading-[1.08]">
            8 Autonomous Engines. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#FF7A00]">
              Zero Routine Agency Friction.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-inter leading-relaxed">
            From persistent vector brand memory and 35+ regional festival radars to high-DPI Indic studio typography, 1-tap WhatsApp voice reviews, omnichannel broadcasting, and live GMV attribution.
          </p>

          {/* High-Contrast Action Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-white text-black font-extrabold text-sm sm:text-base rounded-2xl px-7 py-3.5 hover:scale-105 shadow-[0_10px_25px_-5px_rgba(255,255,255,0.25)] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>{isLoggedIn ? 'Go to Dashboard →' : 'Launch All 8 Engines Free →'}</span>
            </button>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-sm font-semibold transition border border-white/10 flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <span>Compare Agency Economics</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          {/* At-a-Glance Architectural Metrics */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-md">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Continuous Memory</span>
              <span className="text-xl sm:text-2xl font-sora font-bold text-white mt-1 block">pgvector</span>
              <span className="text-[11px] text-emerald-400 mt-0.5 block">Zero retraining needed</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-md">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Cultural Scope</span>
              <span className="text-xl sm:text-2xl font-sora font-bold text-white mt-1 block">35+ Festivals</span>
              <span className="text-[11px] text-[#FF7A00] mt-0.5 block">28 States & UTs covered</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-md">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Approval Loop</span>
              <span className="text-xl sm:text-2xl font-sora font-bold text-white mt-1 block">48 Hours</span>
              <span className="text-[11px] text-emerald-400 mt-0.5 block">1-Tap WhatsApp consent</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-md">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Creative Formats</span>
              <span className="text-xl sm:text-2xl font-sora font-bold text-white mt-1 block">5-in-1 ZIP</span>
              <span className="text-[11px] text-purple-400 mt-0.5 block">1080p TV + Social + Email</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE 8-ENGINE CONSOLE & DEEP DIVE (ZORCHA TACTILE STYLE)
      ========================================================================= */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-8 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#FF7A00] font-bold">
            Interactive Architecture Inspector
          </span>
          <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight">
            Explore KUIRO’s 8 Autonomous Engines
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto font-inter">
            Select any engine below to inspect its production stack, architectural capabilities, and real-time execution preview.
          </p>
        </div>

        {/* Engine Switcher Pill Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-8">
          {(Object.keys(engines) as Array<keyof typeof engines>).map((key) => {
            const item = engines[key];
            const Icon = item.icon;
            const isSelected = activeEngine === key;

            return (
              <button
                key={key}
                onClick={() => setActiveEngine(key)}
                className={`p-3 rounded-2xl text-left transition-all duration-200 border flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-white/[0.08] border-[#FF7A00] shadow-[0_4px_20px_rgba(255,122,0,0.15)] scale-[1.02]'
                    : 'bg-[#0A0E17]/60 border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-[#FF7A00] text-white shadow-md' : 'bg-white/[0.05] text-slate-400 group-hover:text-white'
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">{item.num}</span>
                </div>
                <div>
                  <span
                    className={`text-xs font-sora font-semibold block line-clamp-1 ${
                      isSelected ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {item.title.split('&')[0].replace('365-Day ', '').replace('Persistent ', '')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Engine Active Console */}
        <div className="rounded-[32px] bg-[#0A0E18] border border-white/[0.09] shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-6 sm:p-10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Details, Capabilities & Tech Specs */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-mono font-bold mb-3">
                  <CurrentIcon size={13} />
                  <span>{current.badge}</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-sora font-extrabold text-white tracking-tight leading-tight">
                  {current.title}
                </h3>
                <p className="text-sm font-medium text-slate-400 mt-2 font-inter leading-relaxed">
                  {current.tagline}
                </p>
              </div>

              <p className="text-sm text-slate-300 font-inter leading-relaxed">
                {current.desc}
              </p>

              {/* Architectural Capabilities */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-bold tracking-wider block">
                  Core Engineering Capabilities:
                </span>
                <div className="space-y-2.5">
                  {current.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200 font-inter">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Stack Specifications */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-bold tracking-wider block">
                  Production Infrastructure Stack:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {current.specs.map((spec, i) => (
                    <div key={i} className="p-2 rounded-xl bg-black/30 border border-white/[0.04]">
                      <span className="text-[10px] text-slate-400 block uppercase">{spec.label}</span>
                      <span className="text-slate-200 font-semibold block mt-0.5">{spec.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Tactile Live Sandbox Representation */}
            <div className="lg:col-span-6 h-full flex flex-col justify-center">
              <div className="rounded-2xl border border-white/[0.08] bg-[#070A11] p-5 sm:p-7 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono text-slate-300 uppercase font-bold tracking-wider">
                      Live Execution Sandbox
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08]">
                    Engine {current.num} Active
                  </span>
                </div>

                {/* Conditional Sandbox Visual based on Active Engine */}
                {activeEngine === 'brain' && (
                  <div className="space-y-4 font-mono text-xs">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold font-sora">Kolkata Chai Co. & Artisanal Blends</span>
                        <span className="text-emerald-400 text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                          1,420 Vectors Indexed
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Ingested from store URL & catalog · pgvector HNSW cosine similarity active
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-slate-400 text-[11px] uppercase">Calibrated Brand Palette:</span>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-12 rounded bg-[#FF7A00] flex items-center justify-center text-[9px] text-white font-bold">#FF7A00</div>
                        <div className="h-6 w-12 rounded bg-[#2B1704] flex items-center justify-center text-[9px] text-white font-bold">#2B1704</div>
                        <div className="h-6 w-12 rounded bg-[#FDFBF7] flex items-center justify-center text-[9px] text-black font-bold">#FDFBF7</div>
                        <div className="h-6 w-12 rounded bg-[#10B981] flex items-center justify-center text-[9px] text-white font-bold">#10B981</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase block">Tone & Persona Guidelines:</span>
                      <p className="text-slate-200 text-[11px] leading-relaxed">
                        Warm, heritage-proud, artisanal tea culture. Use sensory descriptors (cardamom, roasted clay, monsoon mornings). Strictly avoid clinical or corporate marketing jargon.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                      <span>100% ASCI Compliance & Negative Guardrails Verified</span>
                    </div>
                  </div>
                )}

                {activeEngine === 'radar' && (
                  <div className="space-y-4 font-mono text-xs">
                    <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-300 font-bold font-sora text-sm">Upcoming Cultural Trigger</span>
                        <span className="text-blue-400 text-[10px] bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                          Auto-Detected
                        </span>
                      </div>
                      <p className="text-white text-base font-sora font-extrabold">Holi Festival of Colors · वसंतोत्सव</p>
                      <p className="text-slate-400 text-[11px]">Region: Pan-India (Primary: North & Western Hubs)</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <span className="text-slate-400 block">Trigger Window:</span>
                        <span className="text-emerald-400 font-bold">T-48h Advance Review</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <span className="text-slate-400 block">Audience Reach:</span>
                        <span className="text-[#FF7A00] font-bold">High Commercial Intent</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase block">Suggested Festive Hook:</span>
                      <p className="text-slate-200 text-[11px] leading-relaxed">
                        "Organic Gulal & Saffron Thandai Hampers · Celebrate pure traditions with 100% natural heritage ingredients."
                      </p>
                    </div>
                  </div>
                )}

                {activeEngine === 'compositor' && (
                  <div className="space-y-4 font-mono text-xs">
                    <div className="aspect-square max-w-[280px] mx-auto rounded-2xl bg-gradient-to-br from-[#2B1704] via-[#1A0E02] to-[#FF7A00]/20 border border-white/10 p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-sora font-semibold">
                          Kolkata Chai Co.
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-bold font-sora text-white leading-tight">
                          রঙের উৎসবে খাঁটি চায়ের উষ্ণতা
                        </h4>
                        <p className="text-[11px] text-amber-200/90 font-inter">
                          Artisanal Clay-Pot Chai & Organic Festive Hampers
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/10 text-[9px] text-slate-300">
                        <span>Pre-Shaped Bengali Ligatures</span>
                        <span className="text-emerald-400 font-bold">1080x1080 High-DPI</span>
                      </div>
                    </div>
                    <p className="text-center text-slate-400 text-[11px]">
                      Composited via Satori (JSX → SVG) and Sharp (SVG → Lossless WebP) in 410ms
                    </p>
                  </div>
                )}

                {activeEngine === 'whatsapp' && (
                  <div className="space-y-4 font-mono text-xs">
                    <div className="p-4 rounded-2xl bg-[#0B141A] border border-[#202C33] space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-emerald-400 font-bold">KUIRO Autopilot Bridge</span>
                        <span>09:15 AM</span>
                      </div>
                      <p className="text-slate-200 text-xs font-sans leading-relaxed">
                        Namaste Rahul! Your Holi Campaign is calibrated. We are scheduled to broadcast in 48 hours. Tap below to review or send a voice note for changes.
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                        <button
                          onClick={() => alert('Campaign Approved! Scheduled to broadcast automatically.')}
                          className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <Check size={13} />
                          <span>Approve (1-Tap)</span>
                        </button>
                        <button
                          onClick={handleSimulateVoice}
                          disabled={isVoicePlaying}
                          className="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <Volume2 size={13} className={isVoicePlaying ? 'animate-bounce text-[#FF7A00]' : ''} />
                          <span>{isVoicePlaying ? 'Applying...' : 'Simulate Voice Edit'}</span>
                        </button>
                      </div>
                    </div>
                    {voiceApplied && (
                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-[11px] animate-fade-in flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        <span>Voice edit transcribed & updated in 11.4s! "Make background saffron warm" applied.</span>
                      </div>
                    )}
                    <p className="text-slate-400 text-[10px] text-center">
                      Silence = Consent: If left unreviewed, campaign auto-commits at T-0 to preserve cadence.
                    </p>
                  </div>
                )}

                {activeEngine === 'attribution' && (
                  <div className="space-y-4 font-mono text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <span className="text-slate-400 block text-[10px]">Attributed GMV:</span>
                        <span className="text-xl font-sora font-extrabold text-emerald-400 mt-1 block">₹1,48,200</span>
                        <span className="text-[10px] text-slate-500">From 184 WhatsApp Leads</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <span className="text-slate-400 block text-[10px]">Cost Per Lead (CPL):</span>
                        <span className="text-xl font-sora font-extrabold text-white mt-1 block">₹46.20</span>
                        <span className="text-[10px] text-emerald-400 font-bold">17.4x ROAS Multiplier</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Campaign ID: camp_holi_festive_2026</span>
                        <span className="text-emerald-400 font-bold">LIVE INGESTION</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono space-y-1">
                        <div className="flex justify-between">
                          <span>Ad Spend: ₹8,500</span>
                          <span>WhatsApp Clicks: 312</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Orders Closed: 64</span>
                          <span>Average Order Value: ₹2,315</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-400 text-[10px] text-center">
                      Every order is tied back to exact campaign UTMs and wa.me pre-filled intent parameters.
                    </p>
                  </div>
                )}

                {activeEngine === 'exporter' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3.5 rounded-xl bg-pink-950/20 border border-pink-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-pink-300 font-bold block">kuiro-festive-kit-holi-2026.zip</span>
                        <span className="text-slate-400 text-[10px]">5 Production Files · Structured ZIP Archive</span>
                      </div>
                      <button
                        onClick={() => alert('ZIP export generated dynamically via streaming JSZip!')}
                        className="p-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold transition flex items-center gap-1.5"
                      >
                        <Download size={13} />
                        <span>Download ZIP</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                        <span className="text-slate-200">01-tv-display-1920x1080.webp</span>
                        <span className="text-slate-400 text-[10px]">In-Store Counter Display</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                        <span className="text-slate-200">02-social-card-1080x1080.webp</span>
                        <span className="text-slate-400 text-[10px]">Feed & WhatsApp Broadcast</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                        <span className="text-slate-200">03-promo-newsletter.html</span>
                        <span className="text-slate-400 text-[10px]">Inline CSS Email Template</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                        <span className="text-slate-200">04-front-desk-staff-sop.md</span>
                        <span className="text-slate-400 text-[10px]">Counter Talk Track & FAQs</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeEngine === 'inbox' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold font-sora">Ananya Sharma</span>
                        <span className="text-emerald-400 text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          WhatsApp Business
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs font-sans">
                        "Do you deliver your Darjeeling First Flush blend to Bangalore before Friday?"
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                      <div className="flex items-center gap-1.5 text-purple-300 font-bold text-[11px]">
                        <Sparkles size={12} />
                        <span>Gemini Brand Brain Suggestion (1-Click Send):</span>
                      </div>
                      <p className="text-slate-200 text-xs font-sans leading-relaxed">
                        "Yes, Ananya! We dispatch via Bluedart Air with guaranteed 48h delivery to Bangalore. Use code FESTIVE15 for 15% off at checkout."
                      </p>
                      <button
                        onClick={() => alert('Reply Dispatched to Customer!')}
                        className="py-1.5 px-3 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-sans text-xs font-semibold transition"
                      >
                        Send Approved Reply →
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Meta 24h Window: 22h 40m remaining</span>
                      <span className="text-emerald-400">Zero Collision Lock Active</span>
                    </div>
                  </div>
                )}

                {activeEngine === 'publishing' && (
                  <div className="space-y-4 font-mono text-xs">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                      <span className="text-slate-400 text-[10px] uppercase block">Synchronized Broadcast Status:</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                          <span>Instagram Graph</span>
                          <span className="text-emerald-400 font-bold">PUBLISHED</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                          <span>LinkedIn UGC v2</span>
                          <span className="text-emerald-400 font-bold">PUBLISHED</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                          <span>Facebook Pages</span>
                          <span className="text-emerald-400 font-bold">PUBLISHED</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                          <span>X / Twitter v2</span>
                          <span className="text-emerald-400 font-bold">PUBLISHED</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span>X (Twitter) Zero-Link Surcharge Guard Active</span>
                      </div>
                      <p className="text-slate-300 text-[10px] leading-relaxed">
                        Promotional store URL routed into first auto-reply comment. Saved $0.200 per-link fee and preserved 3.4x organic reach!
                      </p>
                    </div>
                  </div>
                )}

                {/* Bottom Launch CTA inside Console */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Ready to activate this engine?</span>
                  <button
                    onClick={handleGetStarted}
                    className="px-4 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition flex items-center gap-1.5"
                  >
                    <span>Launch in Workspace</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          THE 48-HOUR LIFECYCLE WALKTHROUGH (TIMELINE SYMPHONY)
      ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#FF7A00] font-bold">
            Autonomous Symphony
          </span>
          <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight">
            How The 8 Engines Work Together
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto font-inter">
            Watch a single campaign flow seamlessly from cultural calendar trigger to WhatsApp review, multi-channel broadcast, in-store creative kit export, and live revenue attribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-[#0A0E18] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#FF7A00] font-bold px-2 py-0.5 rounded bg-[#FF7A00]/10 border border-[#FF7A00]/30">
                Phase 1 · T-7 Days
              </span>
              <span className="text-slate-500">Radar & Memory</span>
            </div>
            <h3 className="text-lg font-sora font-bold text-white">Cultural Radar Scan</h3>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              At midnight IST, the regional radar triggers on an upcoming festival. The Brand Brain queries your isolated pgvector store for verified USPs, hex colors, and logo SVGs.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0A0E18] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-950/40 border border-blue-800">
                Phase 2 · T-48 Hours
              </span>
              <span className="text-slate-500">Studio Compositor</span>
            </div>
            <h3 className="text-lg font-sora font-bold text-white">Indic Typography Canvas</h3>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              Satori and Sharp composite 1:1 square, 4:5 carousel, and 9:16 vertical visuals. Indic Devanagari or Bengali scripts are pre-shaped with zero ligature breaks.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0A0E18] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800">
                Phase 3 · T-48h to T-0
              </span>
              <span className="text-slate-500">WhatsApp Bridge</span>
            </div>
            <h3 className="text-lg font-sora font-bold text-white">1-Tap WhatsApp Review</h3>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              Founder receives a high-res WhatsApp card. One tap approves, voice notes edit in 12s, or silence triggers auto-commit at T-0 to preserve cadence.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0A0E18] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-purple-400 font-bold px-2 py-0.5 rounded bg-purple-950/40 border border-purple-800">
                Phase 4 · T-0 Publish
              </span>
              <span className="text-slate-500">Publishing & Guard</span>
            </div>
            <h3 className="text-lg font-sora font-bold text-white">Omnichannel Broadcast</h3>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              Synchronized broadcast across Instagram, Facebook, and LinkedIn. On X (Twitter), links are placed in the first reply to protect reach and eliminate fees.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0A0E18] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-pink-400 font-bold px-2 py-0.5 rounded bg-pink-950/40 border border-pink-800">
                Phase 5 · T+1 Hour
              </span>
              <span className="text-slate-500">Creative Kit Exporter</span>
            </div>
            <h3 className="text-lg font-sora font-bold text-white">In-Store TV & Staff SOP</h3>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              The campaign is automatically bundled into a 1-click ZIP: 1080p landscape TV displays for counter loops, responsive email HTML, and counter staff SOPs.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0A0E18] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800">
                Phase 6 · T+24 Hours
              </span>
              <span className="text-slate-500">Inbox & Attribution</span>
            </div>
            <h3 className="text-lg font-sora font-bold text-white">Inbox & GMV Attribution</h3>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              Customer inquiries stream into the Unified Inbox with Gemini AI suggested answers. Inbound chats and sales are attributed to the campaign in real time.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BUILT FOR REAL INDIAN SECTORS (BENTO PERSONAS)
      ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#FF7A00] font-bold">
            Universal Versatility
          </span>
          <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight">
            Engineered For Every Indian Business & Practice
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto font-inter">
            Whether you run a local showroom, lead a high-growth D2C brand, operate a healthcare clinic, or manage 30 agency client accounts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {personas.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-[28px] bg-[#0A0E18] border border-white/[0.08] space-y-4 hover:border-[#FF7A00]/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-[#FF7A00] flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#FF7A00] font-bold block">
                      {p.badge}
                    </span>
                    <h3 className="text-lg font-sora font-bold text-white mt-1">{p.title}</h3>
                    <span className="text-xs text-slate-400 block mt-0.5">{p.niche}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-inter leading-relaxed">
                    {p.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Impact:</span>
                  <span className="text-emerald-400 font-bold">{p.metric}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          RETAINER SAVINGS CALCULATOR & UNIT ECONOMICS
      ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-[32px] bg-[#0A0E18] border border-white/[0.09] p-6 sm:p-12 shadow-2xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#FF7A00] font-bold">
              Unbeatable Unit Economics
            </span>
            <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight">
              Traditional Agency Retainer vs. KUIRO
            </h2>
            <p className="text-slate-400 text-sm font-inter">
              Drag the slider to see how much your business saves annually by switching routine marketing work to KUIRO.
            </p>
          </div>

          {/* Interactive Spend Slider */}
          <div className="max-w-xl mx-auto p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase">Current Monthly Agency Spend:</span>
              <span className="text-white text-base font-sora font-bold">₹{monthlySpend.toLocaleString('en-IN')} / mo</span>
            </div>
            <input
              type="range"
              min={15000}
              max={150000}
              step={5000}
              value={monthlySpend}
              onChange={(e) => setMonthlySpend(Number(e.target.value))}
              className="w-full accent-[#FF7A00] h-2 bg-white/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>₹15,000/mo (Freelancer)</span>
              <span>₹45,000/mo (Mid Agency)</span>
              <span>₹1,50,000/mo (Full Retainer)</span>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-center font-mono">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[11px] text-slate-400 uppercase block">KUIRO Growth Tier</span>
              <span className="text-2xl font-sora font-bold text-white mt-1 block">₹2,799 / mo</span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Includes all 8 engines</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-[11px] text-emerald-400 uppercase block">Monthly Capital Saved</span>
              <span className="text-2xl font-sora font-bold text-emerald-300 mt-1 block">
                ₹{savings.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-400/80 mt-0.5 block">
                {Math.round((savings / monthlySpend) * 100)}% Cost Reduction
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
              <span className="text-[11px] text-emerald-300 uppercase block font-bold">Annual Capital Saved</span>
              <span className="text-2xl font-sora font-extrabold text-emerald-400 mt-1 block">
                ₹{(savings * 12).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-400 mt-0.5 block">Reinvested into ad spend</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          COMMON QUESTIONS / FAQ ACCORDION (ZORCHA STYLE)
      ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#FF7A00] font-bold">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight">
            Everything You Need To Know
          </h2>
          <p className="text-slate-400 text-sm font-inter">
            Direct, no-fluff answers on how KUIRO works for your business.
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
          FINAL HIGH-IMPACT CALL TO ACTION
      ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="p-8 sm:p-14 rounded-[32px] bg-gradient-to-b from-[#0F1420] to-[#070A11] border border-white/[0.12] relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF7A00]/15 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-mono font-bold">
            <Sparkles size={13} />
            <span>Deploy All 8 Autonomous Engines Today</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-sora font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
            Ready to automate your marketing with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#FF7A00]">
              zero routine manual work?
            </span>
          </h2>

          <p className="text-sm text-slate-300 font-inter max-w-xl mx-auto leading-relaxed">
            Start with our 14-day free trial. Your Brand Brain calibrates in 30 seconds, your cultural calendar populates, and your first WhatsApp review card arrives 48 hours before your next festive peak.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-white text-black font-extrabold text-sm sm:text-base rounded-2xl px-8 py-4 hover:scale-105 shadow-[0_10px_25px_-5px_rgba(255,255,255,0.25)] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>{isLoggedIn ? 'Go to Dashboard →' : 'Launch All 8 Engines Free →'}</span>
            </button>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-sm font-semibold transition border border-white/10 flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <span>View Predictable Pricing</span>
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
