'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AnnouncementBar, Navbar, Footer } from '@/components/layout';
import {
  Sparkles,
  Layers,
  Calendar,
  Palette,
  Smartphone,
  Share2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Globe2,
  Clock,
  TrendingUp,
  Cpu,
  ShoppingBag,
  Briefcase,
  MessageCircle,
  Mail,
  MessagesSquare,
  Download,
  BarChart3,
  Target,
  FolderArchive,
  Tv,
  Languages,
  CheckCheck,
  UserCheck,
  Stethoscope,
  Rocket,
  Compass,
  Zap,
  Sparkle,
  Sliders,
  ChevronRight,
  FileText
} from 'lucide-react';

export default function ServicesPage() {
  const { isLoggedIn, handleGetStarted } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'brain' | 'radar' | 'compositor' | 'whatsapp' | 'attribution' | 'exporter' | 'inbox' | 'publishing'
  >('brain');

  const servicesData = {
    brain: {
      id: 'brain',
      badge: 'Engine 01 • Persistent Memory',
      title: 'Persistent Brand Brain & Vector Memory',
      subtitle: 'Continuous ingestion of business DNA into zero-retraining pgvector memory.',
      description:
        'The Brand Brain eliminates generic, hallucinated AI copy forever. By indexing your website, product catalog, verified credentials, pricing, and visual guidelines into Neon PostgreSQL with pgvector, KUIRO operates like an experienced in-house marketer who knows your business or personal brand inside and out.',
      icon: Layers,
      color: '#FF7A00',
      tag: 'Zero Prompting Needed',
      metrics: [
        { label: 'Ingestion Time', value: '< 30 Seconds' },
        { label: 'Memory Persistence', value: '100% Vectorized' },
        { label: 'Brand Compliance', value: '99.8% Pass Rate' }
      ],
      features: [
        'Automatic website, catalog, and services ingestion with semantic chunking',
        'Strict ethics, medical, legal, and consumer disclosure guardrails built-in',
        'Preserves exact hex codes (#FF7A00, #0B0F14) and verified client SVG lockups',
        'Learns unique brand voice: formal, casual, energetic, or regional conversational',
        'Tenant-isolated pgvector partitions ensure your proprietary data never leaks'
      ],
      workflowSteps: [
        { step: '01', title: 'Input Ingestion', desc: 'Paste business website, product catalog, or social profile URL' },
        { step: '02', title: 'Vector Indexing', desc: 'Embeddings saved with strict multi-tenant pgvector isolation' },
        { step: '03', title: 'Context Retrieval', desc: 'Retrieved automatically during every campaign & copy synthesis' }
      ],
      techSpecs: [
        { label: 'Database', value: 'Neon Serverless PostgreSQL' },
        { label: 'Vector Extension', value: 'pgvector (HNSW Indexing)' },
        { label: 'Embedding Model', value: 'text-embedding-3-small' },
        { label: 'Isolation', value: 'Tenant Workspace ID Row-Level Security' }
      ]
    },
    radar: {
      id: 'radar',
      badge: 'Engine 02 • Cultural Intelligence',
      title: '365-Day Regional Calendar Radar',
      subtitle: 'Proactive scheduling 48 hours ahead across all 28 Indian states and Union Territories.',
      description:
        'Never miss an Indian festival, state observance, or commercial retail moment. KUIRO’s autonomous regional radar tracks 100+ cultural moments across India, evaluating regional relevance and automatically queuing tailored campaigns at T-48 hours without requiring manual calendar reminders.',
      icon: Calendar,
      color: '#3B82F6',
      tag: 'Autonomous Midnight Cron',
      metrics: [
        { label: 'Events Mapped', value: '100+ Pan-India' },
        { label: 'Proactive Lead Time', value: '48h Ahead' },
        { label: 'Regional Coverage', value: '28 States & UTs' }
      ],
      features: [
        'Pre-loaded cultural triggers: Diwali, Eid, Durga Puja, Pongal, Onam, Chhath, Rakhi, Holi',
        'Commercial & professional observances: MSME Day, National Startup Day, Handloom Day, World Health Day',
        'State-specific language & cultural nuance mapping (West Bengal, Maharashtra, Tamil Nadu, Karnataka, etc.)',
        'Automated seasonal sale schedules: Monsoon discounts, festive hampers, year-end clearance',
        'Scheduled midnight cron (0 0 * * *) with durable Inngest queue guarantees'
      ],
      workflowSteps: [
        { step: '01', title: 'Radar Scan', desc: 'Autonomous midnight cron scans cultural and retail events at T-48h' },
        { step: '02', title: 'Audience Mapping', desc: 'Matches business niche and target geography with regional significance' },
        { step: '03', title: 'Queue Generation', desc: 'Full multi-format creative dispatched to WhatsApp review queue' }
      ],
      techSpecs: [
        { label: 'Schedule Engine', value: 'Inngest Cron (0 0 * * * IST)' },
        { label: 'Data Source', value: 'Govt. of India Gazetted + Retail Calendar' },
        { label: 'Geographic Engine', value: 'State & Union Territory Geo-Tagging' },
        { label: 'Fault Tolerance', value: 'Automatic retry with exponential backoff' }
      ]
    },
    compositor: {
      id: 'compositor',
      badge: 'Engine 03 • Studio Typography Compositor',
      title: 'Studio Compositor & Indic Typography',
      subtitle: 'Satori & Sharp hybrid canvas compositing with pre-shaped Indic scripts.',
      description:
        'Say goodbye to fragile Canva templates and generic AI image text gibberish. KUIRO pairs photorealistic, text-free background canvases with programmatic high-DPI typography, verified client SVG logos, and flawless Indic script shaping without glyph clipping or ligature breaks.',
      icon: Palette,
      color: '#F59E0B',
      tag: 'Devanagari, Bengali, Tamil',
      metrics: [
        { label: 'Compositing Latency', value: '< 450ms' },
        { label: 'Multi-Aspect Output', value: '1:1, 4:5, 9:16' },
        { label: 'Resolution', value: 'Ultra-Sharp High-DPI' }
      ],
      features: [
        'Pre-shaped font rendering for Devanagari (Hindi, Marathi), Bengali, Tamil, Telugu, and Kannada',
        'Multi-aspect ratio generation: 1:1 Feed square, 4:5 LinkedIn carousel, 9:16 vertical stories/reels',
        'Dynamic XML entity sanitization (safely handles & in brand names like "Roy & Sons")',
        '2x2 and 3x2 composite contact sheets for instant single-message WhatsApp previews',
        'Instant Cloudflare R2 asset storage with edge CDN delivery and WebP compression'
      ],
      workflowSteps: [
        { step: '01', title: 'Canvas Base', desc: 'Generate high-aesthetic, text-free luxury background canvas' },
        { step: '02', title: 'Satori Overlay', desc: 'Composite Sora/Inter typography, verified SVG logo, and badges' },
        { step: '03', title: 'Cloudflare CDN', desc: 'Lossless WebP dispatched with secure public HTTPS URLs' }
      ],
      techSpecs: [
        { label: 'Rendering Core', value: 'Satori (JSX to SVG) + Sharp (SVG to WebP)' },
        { label: 'Font Engine', value: 'Google Noto Sans Indic Series (OTF/TTF)' },
        { label: 'Script Support', value: 'Devanagari, Bengali, Tamil, Kannada, Telugu' },
        { label: 'CDN Storage', value: 'Cloudflare R2 (S3-Compatible Object Store)' }
      ]
    },
    whatsapp: {
      id: 'whatsapp',
      badge: 'Engine 04 • Zero-Dashboard Loop',
      title: '48h WhatsApp Auto-Commit & Voice Notes',
      subtitle: 'Zero dashboard fatigue. Review, voice-revise, or auto-publish straight from your chat.',
      description:
        'Business owners, creators, and founders do not have time to log into complex social media dashboards. KUIRO delivers an interactive WhatsApp review card 48 hours before publication. One tap approves, natural Hindi/English voice notes request edits, or silence auto-commits at T-0.',
      icon: Smartphone,
      color: '#10B981',
      tag: 'Silence = Consent Protocol',
      metrics: [
        { label: 'Review Window', value: '48 Hours' },
        { label: 'Voice Revision', value: '< 12s Update' },
        { label: 'Dashboard Friction', value: '0% Required' }
      ],
      features: [
        'Interactive Meta Cloud API Utility templates featuring high-resolution composite preview cards',
        'Multilingual WhatsApp voice note transcription via OpenAI Whisper and Gemini Audio',
        'Instant action buttons: [Approve Campaign] and [Request Revisions]',
        'Passive Auto-Commit: Silent approval after 48h ensures your marketing consistency never lapses',
        'Inngest state machine handles durable delays and webhook interrupt cancellations safely'
      ],
      workflowSteps: [
        { step: '01', title: 'T-48h Dispatch', desc: 'Interactive WhatsApp contact sheet sent with 1-tap approval buttons' },
        { step: '02', title: 'Voice Revision', desc: 'Speak feedback in Hindi or English; audio transcribed and applied in 12s' },
        { step: '03', title: 'T-0 Auto-Commit', desc: 'Campaign broadcasts automatically if approved or left untouched' }
      ],
      techSpecs: [
        { label: 'API Provider', value: 'Meta WhatsApp Cloud API (Utility Tier)' },
        { label: 'Speech-to-Text', value: 'Whisper Large v3 / Gemini Audio' },
        { label: 'Durable Delays', value: 'Inngest step.sleepUntil(publishAt)' },
        { label: 'Webhook Engine', value: 'Next.js App Router Webhook Route with HMAC' }
      ]
    },
    attribution: {
      id: 'attribution',
      badge: 'Engine 05 • Revenue Attribution',
      title: 'Campaign ROI & Inbound Lead Attribution',
      subtitle: 'Connect marketing campaigns directly to WhatsApp inquiries, cost-per-lead, and sales.',
      description:
        'Stop guessing if your marketing works. KUIRO attributes every inbound WhatsApp inquiry, form submission, and phone call back to the exact campaign that generated it. Track ad spend, verified leads, cost per lead (CPL), and closed revenue on a live attribution dashboard.',
      icon: BarChart3,
      color: '#10B981',
      tag: 'Live CPL & Revenue Metrics',
      metrics: [
        { label: 'Attribution Model', value: 'First & Last Touch' },
        { label: 'Average CPL', value: '₹42 – ₹78 / Lead' },
        { label: 'ROI Multiplier', value: '5.2x Average' }
      ],
      features: [
        'Live tracking of total ad spend, inbound WhatsApp leads, and confirmed customer conversions',
        'Dynamic UTM and WhatsApp wa.me link generation with custom campaign tracking tags',
        'Real-time Cost Per Verified Lead (CPL) and Return on Ad Spend (ROAS) calculation',
        'Per-campaign lead breakdown table with status tags: Contacted, Converted, Retargeting',
        '1-click CSV & PDF export for executive reviews, accountant records, or client reports'
      ],
      workflowSteps: [
        { step: '01', title: 'Tag Generation', desc: 'Unique UTM parameter or wa.me pre-filled message attached to campaign' },
        { step: '02', title: 'Lead Ingestion', desc: 'Customer clicks WhatsApp link or submits inquiry; tagged with campaign ID' },
        { step: '03', title: 'ROI Calculation', desc: 'Live dashboard aggregates spend against closed revenue and conversion rate' }
      ],
      techSpecs: [
        { label: 'Analytics Core', value: 'Real-time Aggregation in PostgreSQL' },
        { label: 'Attribution Tags', value: 'UTM + Pre-filled wa.me Intent Tokens' },
        { label: 'Export Format', value: 'RFC 4180 CSV + PDF Summary Sheet' },
        { label: 'Sync Latency', value: 'Sub-second webhook attribution' }
      ]
    },
    exporter: {
      id: 'exporter',
      badge: 'Engine 06 • Omnichannel Creative Kit',
      title: '1-Click Creative Kit Asset Exporter',
      subtitle: 'Turn digital campaigns into printable in-store displays, TV graphics, emails, and staff SOPs.',
      description:
        'Marketing does not stop at social media. KUIRO generates a complete 360° Creative Kit for every campaign. With 1 click, download a structured ZIP bundle containing 1080p in-store TV display graphics, 1:1 social cards, ready-to-send promotional email HTML, and front desk SOP guidelines.',
      icon: Download,
      color: '#EC4899',
      tag: 'Instant ZIP Production',
      metrics: [
        { label: 'Asset Formats', value: '5 Formats in 1 ZIP' },
        { label: 'Packaging Time', value: '< 2 Seconds' },
        { label: 'Offline Ready', value: '1080p Landscape TV' }
      ],
      features: [
        '1080p Landscape In-Store TV Slide (1920x1080) for smart TV loops, counter displays, and digital signage',
        '1:1 High-Resolution Square Card (1080x1080) for Instagram feed, WhatsApp broadcast, and catalog print',
        'Ready-to-send promotional email HTML with preheaders, responsive layout, and WhatsApp CTAs',
        'Front Desk & Staff SOP (Markdown / Text) with offer redemption codes, FAQs, and staff talking points',
        'Structured ZIP archive generated dynamically via streaming JSZip in Next.js API routes'
      ],
      workflowSteps: [
        { step: '01', title: 'Asset Synthesis', desc: 'System automatically compiles social, email, TV, and SOP variants' },
        { step: '02', title: 'ZIP Packaging', desc: 'JSZip bundles assets into structured folders with campaign manifest' },
        { step: '03', title: 'Immediate Download', desc: 'Owner or staff downloads kit for instant in-store & digital rollout' }
      ],
      techSpecs: [
        { label: 'Archive Engine', value: 'Streaming JSZip (Compression Level 6)' },
        { label: 'Digital Signage', value: '1920x1080 High-DPI Canvas Slide' },
        { label: 'Email Format', value: 'Inline CSS Responsive HTML + Text' },
        { label: 'SOP Deliverable', value: 'Front-Desk Training Markdown & Plain Text' }
      ]
    },
    inbox: {
      id: 'inbox',
      badge: 'Engine 07 • Omnichannel Conversations',
      title: 'Unified Multi-Channel Inbox & Routing',
      subtitle: 'Aggregate WhatsApp, Instagram, Messenger, and Email into one collaborative command center.',
      description:
        'Never lose a prospective customer because an inquiry slipped through the cracks. KUIRO unifies inbound messages across WhatsApp, Instagram DM, Facebook Messenger, and Email into a single fast inbox with Gemini Brand Brain AI co-pilot, internal team notes, and automated lead routing.',
      icon: MessagesSquare,
      color: '#10B981',
      tag: 'Zero Collision Team Routing',
      metrics: [
        { label: 'Response Time', value: '< 2 Minutes' },
        { label: 'AI Deflection Rate', value: '68% Auto-Drafted' },
        { label: 'Connected Channels', value: '4 Major Networks' }
      ],
      features: [
        'Omnichannel aggregation: WhatsApp Business, Instagram DM, Facebook Messenger, and Email',
        'Gemini Brand Brain AI co-pilot suggests accurate, brand-aligned answers in 1 click',
        'Private internal team notes (@mention) with zero-collision live presence indicators',
        'Intelligent lead qualification and routing by inquiry type (Pricing, Booking, Support, Partnership)',
        'Full campaign attribution tag attached to every customer conversation thread'
      ],
      workflowSteps: [
        { step: '01', title: 'Omni Ingestion', desc: 'Inbound customer chats stream into one unified inbox in real time' },
        { step: '02', title: 'Smart Routing', desc: 'AI filters keywords, qualifies intent, and assigns to specialist or owner' },
        { step: '03', title: '1-Click Resolution', desc: 'Respond instantly with Brand Brain AI draft or private staff notes' }
      ],
      techSpecs: [
        { label: 'Websocket / Realtime', value: 'SSE + Optimistic UI Mutations' },
        { label: 'AI Assistant', value: 'Gemini 2.5 Flash with Brand Context' },
        { label: 'Team Collaboration', value: 'Private internal notes & collision locks' },
        { label: 'Channel Connectors', value: 'Official Meta Graph API + Resend Inbound' }
      ]
    },
    publishing: {
      id: 'publishing',
      badge: 'Engine 08 • Algorithmic Distribution',
      title: 'Official Multi-Channel Publishing & X Guard',
      subtitle: 'Synchronized broadcasting across Instagram, Facebook, LinkedIn, and X with link surcharge protection.',
      description:
        'Broadcasting across 4 major social networks with built-in algorithmic optimization. KUIRO formats copy, hashtags, and media ratios for each platform, and automatically routes external promotional URLs to the first reply on X to avoid algorithm reach penalties and the $0.200 per-link surcharge.',
      icon: Share2,
      color: '#8B5CF6',
      tag: 'Zero-Link Surcharge Guard',
      metrics: [
        { label: 'Channels Active', value: '4 Major Networks' },
        { label: 'API Verification', value: '100% Official APIs' },
        { label: 'Reach Protection', value: 'First-Reply Threading' }
      ],
      features: [
        'Instagram Graph API: Feed images, multi-image carousels, and vertical Reel containers',
        'LinkedIn UGC API v2: Thought-leadership formatting, bullet structures, and document slides',
        'X (Twitter) v2: First-reply link placement guardrail to protect organic reach & eliminate link fees',
        'Facebook Graph API: Page posts with direct click-to-WhatsApp contact buttons',
        'Automated retry queue with exponential backoff on platform rate limits or API hiccups'
      ],
      workflowSteps: [
        { step: '01', title: 'Format Adaptation', desc: 'Tailor copy length, hashtags, and visual ratios for each channel' },
        { step: '02', title: 'First-Reply Threading', desc: 'External links extracted and queued as first comments on X' },
        { step: '03', title: 'Synchronized Post', desc: 'Broadcast simultaneously across all connected accounts' }
      ],
      techSpecs: [
        { label: 'Meta Ecosystem', value: 'Instagram Graph API v19 + Facebook Pages API' },
        { label: 'Professional Tier', value: 'LinkedIn UGC v2 API' },
        { label: 'Microblogging', value: 'X / Twitter API v2 with reply threader' },
        { label: 'Retry Strategy', value: 'Exponential backoff with Inngest step retries' }
      ]
    }
  };

  const activeService = servicesData[activeTab];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* Top Notification Announcement Bar */}
      <AnnouncementBar subtitle="— 8 autonomous marketing & conversation engines running 24/7 on autopilot." />

      {/* Main Sticky Navbar */}
      <Navbar activeRoute="services" badgeText="Autonomous Engines" statusText="All 8 Engines Active" />

      {/* Hero Header */}
      <section className="relative pt-16 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-950/80 border border-orange-700/50 text-orange-300 text-xs sm:text-sm font-medium">
            <Cpu className="h-4 w-4 text-[#FF7A00]" />
            <span>Autonomous Marketing Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-sora font-bold text-white tracking-tight leading-tight">
            8 Autonomous Engines. <br />
            <span className="text-[#FF7A00]">Zero Routine Agency Friction.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-inter leading-relaxed">
            From persistent brand vector memory and 365-day regional calendar tracking to high-DPI Indic studio typography, WhatsApp voice-note approvals, live lead attribution, and 1-click creative kits—everything your business needs on complete autopilot.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-[#0B0F14] border border-white/10 text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Zero Prompting or Retraining</span>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-[#0B0F14] border border-white/10 text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>100% WhatsApp Approval Loop</span>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-[#0B0F14] border border-white/10 text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Live Campaign Lead Attribution</span>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-[#0B0F14] border border-white/10 text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>1-Click Creative Kit ZIP Exporter</span>
            </span>
          </div>
        </div>
      </section>

      {/* Interactive 8-Engine Deep-Dive Navigator */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Mobile Swipe Hint */}
        <div className="lg:hidden text-center text-[10px] text-slate-500 font-mono mb-3">
          ← Swipe horizontally to explore all 8 autonomous engines →
        </div>

        {/* Engine Switcher Horizontal Tabs */}
        <div className="flex overflow-x-auto lg:grid lg:grid-cols-8 gap-2 mb-8 pb-2 lg:pb-0 scrollbar-none snap-x">
          {(Object.keys(servicesData) as Array<keyof typeof servicesData>).map((key, index) => {
            const item = servicesData[key];
            const Icon = item.icon;
            const isSelected = activeTab === key;

            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`p-3.5 rounded-[12px] text-left transition-all duration-200 border flex flex-col justify-between group min-w-[160px] sm:min-w-[175px] lg:min-w-0 snap-start shrink-0 lg:shrink ${
                  isSelected
                    ? 'bg-[#0B0F14] border-[#FF7A00] shadow-lg shadow-[#FF7A00]/15 scale-[1.02]'
                    : 'bg-[#0B0F14]/60 border-white/10 hover:border-white/20 hover:bg-[#0B0F14]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-[#FF7A00] text-white' : 'bg-white/5 text-slate-400 group-hover:text-white'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-pulse" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
                    Engine 0{index + 1}
                  </span>
                  <span
                    className={`text-xs font-sora font-semibold block mt-0.5 line-clamp-1 ${
                      isSelected ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {item.title.split('&')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Engine Active Showcase Card */}
        <div className="p-5 sm:p-8 md:p-10 rounded-[20px] bg-[#0B0F14] border border-white/15 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Details & Capabilities */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF7A00] bg-[#FF7A00]/10 px-3 py-1 rounded-full border border-[#FF7A00]/30 inline-block">
                    {activeService.badge}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-800/60 inline-flex items-center gap-1">
                    <Sparkle size={11} />
                    <span>{activeService.tag}</span>
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-sora font-bold text-white tracking-tight">
                  {activeService.title}
                </h2>
                <p className="text-sm text-slate-400 font-inter mt-1.5 font-medium leading-relaxed">
                  {activeService.subtitle}
                </p>
              </div>

              <p className="text-sm text-slate-300 font-inter leading-relaxed">
                {activeService.description}
              </p>

              {/* Service Metrics Strip */}
              <div className="grid grid-cols-3 gap-3 py-4 border-y border-white/10">
                {activeService.metrics.map((metric, idx) => (
                  <div key={idx} className="p-3 rounded-[10px] bg-[#11141A] border border-white/5">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">{metric.label}</span>
                    <span className="text-base sm:text-lg font-sora font-bold text-white mt-0.5 block">{metric.value}</span>
                  </div>
                ))}
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Core Architectural Capabilities:
                </h4>
                <div className="grid grid-cols-1 gap-2 text-xs font-inter text-slate-200">
                  {activeService.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition shadow-md shadow-[#FF7A00]/25 flex items-center gap-2 active:scale-95"
                >
                  <span>Launch Engine in Dashboard</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/contact"
                  className="px-5 py-3 rounded-[10px] bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition border border-white/10"
                >
                  Request Technical Walkthrough
                </Link>
              </div>
            </div>

            {/* Right Column: Execution Flow & Tech Specs */}
            <div className="lg:col-span-5 space-y-5">
              {/* Execution Flow Box */}
              <div className="bg-[#11141A] p-5 sm:p-6 rounded-[16px] border border-white/10 space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-sora font-bold text-white flex items-center gap-2">
                    <Cpu size={14} className="text-[#FF7A00]" />
                    <span>Autonomous Execution Flow</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    Zero Routine Touch
                  </span>
                </div>

                <div className="space-y-3.5">
                  {activeService.workflowSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-[12px] bg-[#0B0F14] border border-white/5">
                      <div className="w-7 h-7 rounded-full bg-[#FF7A00]/15 border border-[#FF7A00]/30 text-[#FF7A00] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {step.step}
                      </div>
                      <div>
                        <h5 className="text-xs font-sora font-bold text-white">{step.title}</h5>
                        <p className="text-[11px] text-slate-400 font-inter mt-0.5 leading-snug">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div className="bg-[#11141A] p-5 rounded-[16px] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
                  <Sliders size={13} className="text-[#FF7A00]" />
                  <span className="text-xs font-sora font-bold text-white">Under The Hood • Production Stack</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  {activeService.techSpecs.map((spec, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                      <span className="text-slate-400">{spec.label}</span>
                      <span className="text-slate-200 font-medium text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* End-to-End Autonomous Pipeline Timeline */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/10">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
            Autonomous Symphony
          </span>
          <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight mt-1">
            How The 8 Engines Work Together in Real Life
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl mx-auto font-inter">
            Watch a single campaign flow seamlessly from cultural radar trigger to WhatsApp review, omnichannel broadcast, in-store creative kit export, and lead attribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Step 1: T-48h Radar & Memory */}
          <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#FF7A00] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FF7A00]/10 border border-[#FF7A00]/30">
                Timeline: T-48 Hours
              </span>
              <span className="text-xs font-mono text-slate-500">Phase 1</span>
            </div>
            <h3 className="text-base font-sora font-bold text-white">Radar Scan & Brand DNA Retrieval</h3>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              At 00:00 IST, the regional calendar radar identifies an upcoming cultural festival or sales moment. The Brand Brain queries your tenant-isolated pgvector database, retrieving product USPs, brand hex codes, and verified logos.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <CheckCheck size={13} className="text-emerald-400" />
              <span>Engines: Regional Radar + Brand Brain</span>
            </div>
          </div>

          {/* Step 2: Studio Compositor */}
          <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950/40 border border-blue-800">
                Timeline: T-47 Hours
              </span>
              <span className="text-xs font-mono text-slate-500">Phase 2</span>
            </div>
            <h3 className="text-base font-sora font-bold text-white">Programmatic Indic Studio Compositing</h3>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              Satori and Sharp composite high-DPI visuals across 1:1, 4:5, and 9:16 aspect ratios. Devanagari, Bengali, or Tamil typography is pre-shaped with zero ligature clipping and uploaded to Cloudflare R2 edge storage.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <CheckCheck size={13} className="text-emerald-400" />
              <span>Engine: High-DPI Studio Compositor</span>
            </div>
          </div>

          {/* Step 3: WhatsApp Review Loop */}
          <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800">
                Timeline: T-48h to T-0
              </span>
              <span className="text-xs font-mono text-slate-500">Phase 3</span>
            </div>
            <h3 className="text-base font-sora font-bold text-white">WhatsApp 48h Silence = Consent Review</h3>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              An interactive WhatsApp contact sheet arrives on the owner's phone. One tap approves, an English/Hindi voice note requests instant revisions, or if unread, it silently auto-commits to maintain 365-day posting consistency.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <CheckCheck size={13} className="text-emerald-400" />
              <span>Engine: WhatsApp 48h Auto-Commit</span>
            </div>
          </div>

          {/* Step 4: Omnichannel Broadcasting */}
          <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-950/40 border border-purple-800">
                Timeline: T-0 (Publish Time)
              </span>
              <span className="text-xs font-mono text-slate-500">Phase 4</span>
            </div>
            <h3 className="text-base font-sora font-bold text-white">Omnichannel Broadcast & X Zero-Link Guard</h3>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              Campaign publishes simultaneously across Instagram, Facebook, and LinkedIn. On X (Twitter), URLs are automatically routed into the first auto-reply thread, saving the $0.200 per-link fee and preserving organic algorithm reach.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <CheckCheck size={13} className="text-emerald-400" />
              <span>Engine: Multi-Channel Publishing</span>
            </div>
          </div>

          {/* Step 5: 1-Click Creative Kit */}
          <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-pink-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-pink-950/40 border border-pink-800">
                Timeline: T+1 Hour
              </span>
              <span className="text-xs font-mono text-slate-500">Phase 5</span>
            </div>
            <h3 className="text-base font-sora font-bold text-white">1-Click Creative Kit ZIP Packaging</h3>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              The campaign is automatically converted into a downloadable ZIP kit: 1080p landscape in-store TV slides for digital counter loops, 1:1 social cards, promotional email copy, and staff front-desk redemption SOPs.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <CheckCheck size={13} className="text-emerald-400" />
              <span>Engine: 1-Click Creative Kit Exporter</span>
            </div>
          </div>

          {/* Step 6: Unified Conversations & Lead Attribution */}
          <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800">
                Timeline: T+24 Hours to T+7 Days
              </span>
              <span className="text-xs font-mono text-slate-500">Phase 6</span>
            </div>
            <h3 className="text-base font-sora font-bold text-white">Unified Inbox Routing & Live Attribution</h3>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              Inbound customer chats stream into the Unified Inbox with Brand Brain AI reply suggestions. Every lead is attributed back to the campaign, calculating cost per lead (CPL) and closed revenue on the live ROI dashboard.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <CheckCheck size={13} className="text-emerald-400" />
              <span>Engines: Unified Inbox + Lead Attribution</span>
            </div>
          </div>
        </div>
      </section>

      {/* Universal Personas & Business Blueprints */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/10">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
            Universal Versatility
          </span>
          <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight mt-1">
            Built For Every Business, Founder & Practice
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl mx-auto font-inter">
            Whether you run a local retail store, build a personal creator brand, lead a high-growth startup, or manage 30 agency client accounts—KUIRO adapts automatically to your sector.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Retail & Local Commerce */}
          <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 space-y-4 hover:border-[#FF7A00]/40 transition">
            <div className="w-10 h-10 rounded-[10px] bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">
                Local Stores & Offline Commerce
              </span>
              <h3 className="font-sora font-bold text-lg text-white mt-1">Retail Stores & Showrooms</h3>
            </div>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              Apparel boutiques, jewelers, electronics stores, and supermarkets. 1080p in-store TV slides, festive flash sales, regional festival greetings in Bengali/Hindi, and counter staff discount SOPs.
            </p>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Primary Moat:</span>
              <span className="text-emerald-400">1-Click TV Kit & Regional Radar</span>
            </div>
          </div>

          {/* Card 2: Creators & Personal Brands */}
          <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 space-y-4 hover:border-[#FF7A00]/40 transition">
            <div className="w-10 h-10 rounded-[10px] bg-orange-500/10 border border-orange-500/30 text-[#FF7A00] flex items-center justify-center">
              <UserCheck size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF7A00] font-bold block">
                Solopreneurs & Creators
              </span>
              <h3 className="font-sora font-bold text-lg text-white mt-1">Personal Brands & Consultants</h3>
            </div>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              Coaches, technical authors, independent advisors, and executive leaders. High-DPI LinkedIn carousels, authentic tone preservation, zero dashboard time, and 1-tap voice note approval from WhatsApp.
            </p>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Primary Moat:</span>
              <span className="text-emerald-400">Voice Approvals & LinkedIn Carousels</span>
            </div>
          </div>

          {/* Card 3: Startups & Tech Founders */}
          <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 space-y-4 hover:border-[#FF7A00]/40 transition">
            <div className="w-10 h-10 rounded-[10px] bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Rocket size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold block">
                SaaS, Apps & Digital Services
              </span>
              <h3 className="font-sora font-bold text-lg text-white mt-1">Startups & Product Founders</h3>
            </div>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              B2B SaaS, mobile apps, and direct-to-consumer digital startups. Feature release announcements, live Campaign ROI attribution, cost-per-lead tracking, and Twitter zero-link surcharge protection.
            </p>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Primary Moat:</span>
              <span className="text-emerald-400">Lead Attribution & X Zero-Link Guard</span>
            </div>
          </div>

          {/* Card 4: Professional Practices & Clinics */}
          <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 space-y-4 hover:border-[#FF7A00]/40 transition">
            <div className="w-10 h-10 rounded-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Stethoscope size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                Healthcare, Legal & Consultancies
              </span>
              <h3 className="font-sora font-bold text-lg text-white mt-1">Practices & Clinics</h3>
            </div>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              Dental clinics, dermatology practices, chartered accountants, and legal advisors. Strict regulatory compliance, doctor/partner degree preservation, awareness day schedules, and unified patient chat.
            </p>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Primary Moat:</span>
              <span className="text-emerald-400">Ethical Guardrails & Unified Inbox</span>
            </div>
          </div>

          {/* Card 5: Agencies & Multi-Location Brands */}
          <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 space-y-4 hover:border-[#FF7A00]/40 transition">
            <div className="w-10 h-10 rounded-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Briefcase size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                Agencies & Multi-Brand Operators
              </span>
              <h3 className="font-sora font-bold text-lg text-white mt-1">Marketing Agencies & Franchises</h3>
            </div>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              Digital agencies managing 10 to 50 local SMB clients or franchise chains. Isolated multi-tenant workspaces, white-label client PDF reporting, unified multi-client WhatsApp delivery, and zero staff scaling bottlenecks.
            </p>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Primary Moat:</span>
              <span className="text-emerald-400">Multi-Tenant Workspaces & White-Label</span>
            </div>
          </div>

          {/* Card 6: Hospitality & Services */}
          <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 space-y-4 hover:border-[#FF7A00]/40 transition">
            <div className="w-10 h-10 rounded-[10px] bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <Compass size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold block">
                Hospitality, Fitness & Salons
              </span>
              <h3 className="font-sora font-bold text-lg text-white mt-1">Lifestyle & Local Services</h3>
            </div>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              Cafes, gyms, wellness studios, and beauty salons. Weekend specials, monsoon hampers, seasonal fitness challenges, promotional email blasts, and instant WhatsApp booking links.
            </p>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Primary Moat:</span>
              <span className="text-emerald-400">Festive Schedules & WhatsApp Inquiries</span>
            </div>
          </div>
        </div>
      </section>

      {/* Unit Economics: Traditional Retainer vs KUIRO Suite */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/10">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
            Unbeatable Unit Economics
          </span>
          <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight mt-1">
            Traditional Agency Retainers vs. KUIRO Autonomous Suite
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl mx-auto font-inter">
            Why forward-thinking business owners, creators, and practices are replacing high-friction ₹45k/mo retainers with KUIRO's autonomous infrastructure.
          </p>
        </div>

        <div className="rounded-[16px] overflow-hidden border border-white/15 bg-[#0B0F14] shadow-2xl overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[640px]">
            <thead className="bg-[#11141A] text-[10px] font-mono uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="p-4 font-bold text-slate-300">Dimension</th>
                <th className="p-4 font-bold text-red-400">Traditional Agency Retainer</th>
                <th className="p-4 font-bold text-emerald-400 bg-emerald-950/30">KUIRO Autonomous Suite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-inter">
              <tr>
                <td className="p-4 font-semibold text-white">Monthly Investment</td>
                <td className="p-4 text-slate-400">₹35,000 – ₹75,000 / month + GST</td>
                <td className="p-4 text-emerald-300 font-semibold bg-emerald-950/10">₹2,299 / month (Save up to 94%)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Onboarding & Setup</td>
                <td className="p-4 text-slate-400">2 to 3 weeks of questionnaires & kickoff calls</td>
                <td className="p-4 text-emerald-300 font-semibold bg-emerald-950/10">&lt; 30 seconds via Brand Brain URL crawl</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Review & Approval Friction</td>
                <td className="p-4 text-slate-400">Cluttered email threads, Google Docs & lost edits</td>
                <td className="p-4 text-emerald-300 font-semibold bg-emerald-950/10">1-Tap WhatsApp cards & Hindi/English voice notes</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Turnaround on Revisions</td>
                <td className="p-4 text-slate-400">3 to 5 business days per design round</td>
                <td className="p-4 text-emerald-300 font-semibold bg-emerald-950/10">&lt; 12 seconds for AI voice note regeneration</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Regional Calendar Coverage</td>
                <td className="p-4 text-slate-400">Frequently forgets regional and state festivals</td>
                <td className="p-4 text-emerald-300 font-semibold bg-emerald-950/10">365-Day autonomous radar across 28 states</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Indic Typography Support</td>
                <td className="p-4 text-slate-400">Manual Canva editing with broken ligatures</td>
                <td className="p-4 text-emerald-300 font-semibold bg-emerald-950/10">Pre-shaped Devanagari, Bengali, Tamil fonts</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Offline In-Store Assets</td>
                <td className="p-4 text-slate-400">Additional agency fees for TV slides or staff SOPs</td>
                <td className="p-4 text-emerald-300 font-semibold bg-emerald-950/10">Included: 1-Click Creative Kit ZIP with 1080p TV slides</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Lead Attribution & ROI</td>
                <td className="p-4 text-slate-400">Vanity likes report delivered 10 days after month-end</td>
                <td className="p-4 text-emerald-300 font-semibold bg-emerald-950/10">Live Dashboard: Ad spend vs WhatsApp CPL & revenue</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Reliability Guarantee</td>
                <td className="p-4 text-slate-400">Breaks when agency graphic designers quit or take leave</td>
                <td className="p-4 text-emerald-300 font-semibold bg-emerald-950/10">48h Auto-Commit ensures 100% posting consistency</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Enterprise Reliability Badges */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="p-6 sm:p-8 rounded-[16px] bg-[#0B0F14] border border-white/10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-sora font-bold text-white">Production-Hardened Infrastructure</h4>
              <p className="text-xs text-slate-400 font-inter mt-0.5">
                Every service runs on resilient serverless primitives with durable retry guarantees.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300">
            <span className="px-3 py-1.5 rounded-lg bg-[#11141A] border border-white/5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Neon pgvector</span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-[#11141A] border border-white/5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Inngest Durable Cron</span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-[#11141A] border border-white/5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Cloudflare R2 CDN</span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-[#11141A] border border-white/5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Meta Cloud API</span>
            </span>
          </div>
        </div>
      </section>

      {/* Bottom High-Impact Conversion Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-[20px] bg-gradient-to-br from-[#0B0F14] via-[#1A1208] to-[#0B0F14] border-2 border-[#FF7A00]/40 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] text-xs font-semibold">
              <Sparkles size={13} />
              <span>Deploy All 8 Autonomous Engines Today</span>
            </span>

            <h2 className="font-sora text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Ready to automate your marketing <br />
              <span className="text-[#FF7A00]">with zero routine work?</span>
            </h2>

            <p className="text-sm text-slate-300 font-inter leading-relaxed">
              Start with a 14-day free trial. Your Brand Brain extracts in 30 seconds, your regional calendar populates, and your first WhatsApp review arrives in minutes.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-7 py-3.5 rounded-[12px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-sm font-sora font-semibold transition shadow-lg shadow-[#FF7A00]/30 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{isLoggedIn ? 'Go to Dashboard' : 'Launch All 8 Engines Free'}</span>
                <ArrowRight size={15} />
              </button>
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-6 py-3.5 rounded-[12px] bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition border border-white/15 flex items-center justify-center gap-2"
              >
                <span>View Predictable Plans</span>
                <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
