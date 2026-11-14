'use client';

import React, { useState, useEffect } from 'react';
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
  Flame,
  CheckCircle2,
  ArrowRight,
  Check,
  ShieldCheck,
  Globe2,
  Mic,
  Clock,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  Zap,
  Cpu,
  Code2,
  FileCheck,
  Users,
  Building2,
  Stethoscope,
  Utensils,
  ShoppingBag,
  Briefcase,
  Menu,
  X as CloseIcon,
  MessageCircle,
  Play,
  RotateCcw,
  Mail,
  MessagesSquare
} from 'lucide-react';

export default function ServicesPage() {
  const { isLoggedIn, handleGetStarted } = useAuth();
  const [activeTab, setActiveTab] = useState<'brain' | 'calendar' | 'graphics' | 'whatsapp' | 'publishing' | 'video' | 'email' | 'inbox'>('brain');

  const servicesData = {
    brain: {
      id: 'brain',
      badge: 'Service 01 • Persistent Memory Engine',
      title: 'Persistent Brand Brain',
      subtitle: 'Continuous ingestion of business DNA into zero-retraining vector memory.',
      description: 'The Brand Brain eliminates generic AI copy forever. By indexing your website, product catalog, services, verified credentials, pricing, and visual guidelines into Neon pgvector, KUIRO acts as an employee who knows your business or personal brand inside and out.',
      icon: Layers,
      color: '#FF7A00',
      metrics: [
        { label: 'Ingestion Time', value: '< 30 Seconds' },
        { label: 'Memory Retention', value: '100% Persistent' },
        { label: 'Brand Compliance', value: '99.4% Pass Rate' }
      ],
      features: [
        'Automatic website, catalog, and service scraping with semantic chunking',
        'Industry-specific ethics and regulatory guardrails (retail, B2B, healthcare, creators)',
        'Preserves exact hex color codes (#FF7A00, #0B0F14) and verified SVG logos',
        'Retains professional credentials, product USPs, and direct call-to-actions',
        'Zero prompt re-engineering required for ongoing campaigns'
      ],
      workflowSteps: [
        { step: '01', title: 'Input Ingestion', desc: 'Paste business website, catalog, or social profile' },
        { step: '02', title: 'Vector Indexing', desc: 'Embeddings saved with pgvector tenant isolation' },
        { step: '03', title: 'Context Retrieval', desc: 'Retrieved automatically during every campaign generation' }
      ]
    },
    calendar: {
      id: 'calendar',
      badge: 'Service 02 • Regional Intelligence',
      title: '365-Day Cultural & Regional Calendar',
      subtitle: 'Proactive scheduling 5 days ahead across all 28 Indian states.',
      description: 'Never miss an Indian festival, local holiday, or awareness day. KUIRO’s autonomous regional radar evaluates 100+ cultural moments across 28 states, proactively creating localized campaigns at T-5 days without manual calendar reminders.',
      icon: Calendar,
      color: '#3B82F6',
      metrics: [
        { label: 'Events Mapped', value: '100+ Pan-India' },
        { label: 'Proactive Lead Time', value: '5 Days Ahead' },
        { label: 'Regional Coverage', value: '28 States & UTs' }
      ],
      features: [
        'Pre-loaded cultural triggers (Diwali, Eid, Pongal, Durga Puja, Onam, Chhath)',
        'Industry observance days (National Startup Day, Handloom Day, World Health Day, MSME Day)',
        'State-specific language & cultural nuance mapping',
        'Automatic seasonal sales schedules (Monsoon specials, festive discounts)',
        'Midnight cron execution at 00:00 IST for durable daily scheduling'
      ],
      workflowSteps: [
        { step: '01', title: 'Radar Scan', desc: 'Midnight cron scans events happening in 5 days' },
        { step: '02', title: 'Regional Filter', desc: 'Matches business audience with regional cultural significance' },
        { step: '03', title: 'Queue Generation', desc: 'Campaign dispatched to WhatsApp review queue' }
      ]
    },
    graphics: {
      id: 'graphics',
      badge: 'Service 03 • High-DPI Studio Compositor',
      title: 'Studio-Grade Programmatic Graphics',
      subtitle: 'Satori & Sharp hybrid canvas compositing with native Indic script shaping.',
      description: 'Say goodbye to fragile Canva templates and blurry social graphics. KUIRO pairs clean text-free canvases with programmatic high-DPI typography, verified client SVG lockups, and flawless regional script rendering.',
      icon: Palette,
      color: '#F59E0B',
      metrics: [
        { label: 'Render Speed', value: '< 450ms' },
        { label: 'Aspect Ratios', value: '1:1, 4:5, 9:16' },
        { label: 'Format Output', value: 'WebP / PNG High-DPI' }
      ],
      features: [
        'Headless Chromium worker fallback for Hindi (Devanagari), Bengali, and Tamil ligatures',
        'Multi-format rendering: 1:1 Feed square, 4:5 LinkedIn carousel, 9:16 vertical stories',
        'XML entity sanitization (safe handling of & in brand names like Kolkata Chai Co. & Sons)',
        '2x2 & 3x2 Contact Sheet generation for single-message WhatsApp reviews',
        'Direct Cloudflare R2 media upload with public HTTPS URLs'
      ],
      workflowSteps: [
        { step: '01', title: 'Canvas Base', desc: 'Generate luxury text-free background canvas' },
        { step: '02', title: 'Satori Overlay', desc: 'Overlay high-DPI Sora/Inter typography & verified SVG logo' },
        { step: '03', title: 'R2 CDN Deploy', desc: 'Optimized WebP uploaded to Cloudflare CDN' }
      ]
    },
    whatsapp: {
      id: 'whatsapp',
      badge: 'Service 04 • Zero-Dashboard Approval',
      title: '48-Hour WhatsApp Auto-Commit',
      subtitle: 'Zero dashboard fatigue. Review, voice-revise, or auto-publish from your phone.',
      description: 'Founders, creators, and business owners don’t have time to log into complicated social media dashboards. KUIRO sends an interactive WhatsApp contact sheet 48 hours before publication. One tap approves, natural Hindi/English voice notes revise, or silence auto-commits at T-0.',
      icon: Smartphone,
      color: '#10B981',
      metrics: [
        { label: 'Review Window', value: '48 Hours' },
        { label: 'Voice Revision', value: '< 12s Regeration' },
        { label: 'Zero Login Needed', value: '100% WhatsApp' }
      ],
      features: [
        'Interactive Meta Cloud API Utility Templates with 2x2 multi-platform contact sheets',
        'Multilingual WhatsApp voice note transcription via Whisper / Gemini Audio',
        'Quick-reply buttons: [Approve Campaign] and [Request Revisions]',
        'Passive Auto-Commit: Silent approval after 48h to maintain 365-day consistency',
        'Inngest state machine handles durable delays and webhook interrupt cancellations'
      ],
      workflowSteps: [
        { step: '01', title: 'T-48h Dispatch', desc: 'WhatsApp contact sheet sent with quick-reply buttons' },
        { step: '02', title: 'Voice Note Feedback', desc: 'Optional Hindi audio note transcribed and applied in 12s' },
        { step: '03', title: 'T-0 Auto-Commit', desc: 'Campaign publishes automatically if approved or silent' }
      ]
    },
    publishing: {
      id: 'publishing',
      badge: 'Service 05 • Algorithmic Distribution',
      title: 'Official Multi-Channel Publishing',
      subtitle: 'Synchronized broadcasting across Instagram, Facebook, LinkedIn, and X.',
      description: 'Official API distribution with native channel guardrails built in. KUIRO automatically formats posts to match the algorithm of each platform, including placing external links in the first reply on X to protect your organic reach.',
      icon: Share2,
      color: '#8B5CF6',
      metrics: [
        { label: 'Channels Active', value: '4 Major Networks' },
        { label: 'API Verification', value: '100% Official APIs' },
        { label: 'Reach Protection', value: 'First-Reply Links' }
      ],
      features: [
        'Instagram Graph API: Single feed images, multi-slide carousels, and Reels containers',
        'LinkedIn UGC v2: Executive thought leadership formatting and document carousels',
        'X (Twitter) v2: First-reply link placement guardrail to avoid -40% algorithm reach penalty',
        'Facebook Graph API: Page posts with direct WhatsApp click-to-chat integration',
        'Automated retry queue with exponential backoff on platform rate limits'
      ],
      workflowSteps: [
        { step: '01', title: 'Channel Adaptation', desc: 'Tailor copy, hashtags, and aspect ratio for each channel' },
        { step: '02', title: 'First-Reply Guardrail', desc: 'External URLs extracted and queued as first comments' },
        { step: '03', title: 'Simultaneous Post', desc: 'Broadcast across all authenticated accounts' }
      ]
    },
    video: {
      id: 'video',
      badge: 'Service 06 • Short-Form Video Pipeline',
      title: 'Programmatic Reels & Audio',
      subtitle: 'Vertical video synthesis with ElevenLabs natural Indian narration.',
      description: 'Dominate Instagram Reels and YouTube Shorts without hiring video editors. KUIRO combines Remotion video compositing, ElevenLabs multilingual narration (Hindi, Indian English), and synchronized kinetic typography for high-retention video posts.',
      icon: Flame,
      color: '#EC4899',
      metrics: [
        { label: 'Video Format', value: '9:16 Vertical HD' },
        { label: 'Voiceover Engine', value: 'ElevenLabs Multilingual' },
        { label: 'Subtitle Accuracy', value: 'Word-Level Sync' }
      ],
      features: [
        'Programmatic React video rendering using Remotion and FFmpeg',
        'Natural Indian English & Hindi voiceover narration via ElevenLabs TTS API',
        'Word-level animated karaoke captions for maximum sound-off viewer retention',
        'Integration of brand b-roll, product showcases, founder video, and catalog items',
        'Automatic background music ducking behind vocal voiceovers'
      ],
      workflowSteps: [
        { step: '01', title: 'Script & Audio', desc: 'Generate industry-tailored script and synthesize voiceover' },
        { step: '02', title: 'Remotion Render', desc: 'Programmatic 9:16 video rendered with kinetic captions' },
        { step: '03', title: 'Reel Publishing', desc: 'Container polling and upload via Instagram Reels API' }
      ]
    },
    email: {
      id: 'email',
      badge: 'Service 07 • Retention & Retargeting',
      title: 'Autonomous Email Newsletters',
      subtitle: 'Responsive branded newsletters dispatched to customer lists on autopilot.',
      description: 'Turn one-time visitors into repeat lifelong customers. KUIRO autonomously writes, designs, and schedules festive offers, VIP product drops, educational advice, and weekly updates formatted in responsive HTML with high deliverability via Resend and Amazon SES.',
      icon: Mail,
      color: '#F59E0B',
      metrics: [
        { label: 'Average Open Rate', value: '44.8% Open Rate' },
        { label: 'Design Standard', value: 'Responsive HTML' },
        { label: 'Deliverability', value: 'DKIM / SPF Verified' }
      ],
      features: [
        'Zero-effort weekly and festival newsletters auto-synced with your 365 calendar',
        'Responsive dark/light inbox rendering optimized for Apple Mail, Gmail, and Outlook',
        'Direct customer, subscriber & client list synchronization from CSV or Google Sheets',
        'Smart call-to-action buttons linking to WhatsApp, booking pages, or your online store',
        'Automated CAN-SPAM and unsubscribe compliance management'
      ],
      workflowSteps: [
        { step: '01', title: 'Context & Subject', desc: 'Generate punchy subject lines and personalized preheaders' },
        { step: '02', title: 'Branded Layout', desc: 'Composite brand logo, colors, and responsive copy structure' },
        { step: '03', title: 'Batch Delivery', desc: 'Dispatch to subscribers with automated click and open tracking' }
      ]
    },
    inbox: {
      id: 'inbox',
      badge: 'Service 08 • Customer Conversations Hub',
      title: 'Unified Multi-Channel Inbox & Routing',
      subtitle: 'Brings WhatsApp, Instagram, Messenger, and Email into one collaborative workspace.',
      description: 'Sales and support teams reply 92% faster, automate routine FAQs with Brand Brain AI, collaborate through private internal notes, and route leads by inquiry type and urgency across 4 major channels.',
      icon: MessagesSquare,
      color: '#10B981',
      metrics: [
        { label: 'First Response Time', value: '< 2 Minutes' },
        { label: 'AI Deflection Rate', value: '68.4% Auto-Resolved' },
        { label: 'Connected Channels', value: '4 Major Networks' }
      ],
      features: [
        'Unified conversation inbox aggregating WhatsApp, Instagram DM, Facebook Messenger, and Email',
        'Gemini Brand Brain AI co-pilot for 1-click brand-aligned auto-replies',
        'Private internal team notes (@mention) with zero-collision live presence indicators',
        'Automated lead qualification and intelligent routing to team members or front desk',
        'Campaign attribution linking every inquiry back to specific WhatsApp or email broadcasts'
      ],
      workflowSteps: [
        { step: '01', title: 'Omni Ingestion', desc: 'Inbound chats from WhatsApp, Instagram, Messenger & Email stream into 1 inbox' },
        { step: '02', title: 'Smart Flow Routing', desc: 'AI filters keywords, qualifies intent, and assigns to specialist or front desk' },
        { step: '03', title: 'Rapid AI Resolution', desc: 'Team collaborates with internal notes or dispatches 1-click AI replies' }
      ]
    }
  };

  const activeService = servicesData[activeTab];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* Top Notification Announcement Bar */}
      <AnnouncementBar subtitle="— 8 specialized marketing & conversation services on autopilot." />

      {/* Main Sticky Navbar */}
      <Navbar activeRoute="services" badgeText="Services Suite" statusText="All 8 Services Active" />

      {/* Services Hero Header */}
      <section className="relative pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-950/80 border border-orange-700/50 text-orange-300 text-xs sm:text-sm font-medium">
            <Cpu className="h-4 w-4 text-[#FF7A00]" />
            <span>Autonomous Service Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-sora font-bold text-white tracking-tight leading-tight">
            Complete Autonomous Suite. <br />
            <span className="text-[#FF7A00]">Your Marketing On Autopilot.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-inter leading-relaxed">
            From persistent brand memory and 365-day regional calendar tracking to high-DPI studio graphics, WhatsApp auto-commit, and unified conversations—everything SMBs, creators, and founders need to grow.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-[#0B0F14] border border-white/10 text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Zero Retraining Required</span>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-[#0B0F14] border border-white/10 text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>100% WhatsApp Approval Loop</span>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-[#0B0F14] border border-white/10 text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Official Meta & X API Verified</span>
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Service Deep-Dive Navigator */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Mobile Swipe Hint */}
        <div className="lg:hidden text-center text-[10px] text-slate-500 font-mono mb-3">
          ← Swipe horizontally to browse all 8 services →
        </div>

        {/* Service Switcher Tabs */}
        <div className="flex overflow-x-auto lg:grid lg:grid-cols-8 gap-2 mb-10 pb-2 lg:pb-0 scrollbar-none snap-x">
          {(Object.keys(servicesData) as Array<keyof typeof servicesData>).map((key) => {
            const item = servicesData[key];
            const Icon = item.icon;
            const isSelected = activeTab === key;

            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`p-3.5 rounded-[12px] text-left transition-all duration-200 border flex flex-col justify-between group min-w-[155px] sm:min-w-[170px] lg:min-w-0 snap-start shrink-0 lg:shrink ${isSelected
                    ? 'bg-[#0B0F14] border-[#FF7A00] shadow-lg shadow-[#FF7A00]/10 scale-[1.02]'
                    : 'bg-[#0B0F14]/60 border-white/10 hover:border-white/20 hover:bg-[#0B0F14]'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-[#FF7A00] text-white' : 'bg-white/5 text-slate-400 group-hover:text-white'
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
                    Service 0{Object.keys(servicesData).indexOf(key) + 1}
                  </span>
                  <span className={`text-xs font-sora font-semibold block mt-0.5 line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-300'
                    }`}>
                    {item.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Service Active Showcase Card */}
        <div className="p-5 sm:p-8 md:p-12 rounded-[20px] bg-[#0B0F14] border border-white/15 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Details & Capabilities */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF7A00] bg-[#FF7A00]/10 px-3 py-1 rounded-full border border-[#FF7A00]/30 inline-block mb-3">
                  {activeService.badge}
                </span>
                <h2 className="text-2xl sm:text-4xl font-sora font-bold text-white tracking-tight">
                  {activeService.title}
                </h2>
                <p className="text-sm text-slate-400 font-inter mt-1 font-medium">
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
                  Core Enterprise Capabilities:
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

              {/* CTA Action */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition shadow-md shadow-[#FF7A00]/25 flex items-center gap-2"
                >
                  <span>Launch This Service in Dashboard</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/contact"
                  className="px-5 py-3 rounded-[10px] bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition border border-white/10"
                >
                  Request Technical Demo
                </Link>
              </div>
            </div>

            {/* Right Column: Execution Workflow Box */}
            <div className="lg:col-span-5 bg-[#11141A] p-6 rounded-[16px] border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-sora font-bold text-white flex items-center gap-2">
                  <Cpu size={14} className="text-[#FF7A00]" />
                  <span>Autonomous Execution Flow</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Zero Human Touch
                </span>
              </div>

              <div className="space-y-4">
                {activeService.workflowSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-[12px] bg-[#0B0F14] border border-white/5 relative">
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

              {/* Architecture Guarantee Note */}
              <div className="p-4 rounded-[12px] bg-gradient-to-r from-orange-950/20 to-slate-900 border border-orange-500/20 text-[11px] text-slate-300 flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                <span>
                  Backed by Neon Serverless PostgreSQL with pgvector, Inngest durable queue execution, and AWS S3-compatible Cloudflare R2 media storage.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vertical Adaptation Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/10">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
            Industry Blueprints
          </span>
          <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight mt-1">
            Engineered for High-Stakes Indian Businesses
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto font-inter">
            How KUIRO’s six services tailor their vocabulary, regulatory compliance, and cultural calendar for specific verticals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Vertical 1: Clinics */}
          <div className="p-6 rounded-[14px] bg-[#0B0F14] border border-white/10 space-y-4 hover:border-[#FF7A00]/30 transition">
            <div className="w-10 h-10 rounded-[10px] bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Stethoscope size={20} />
            </div>
            <h3 className="font-sora font-bold text-base text-white">Clinics & Healthcare</h3>
            <p className="text-xs text-slate-400 font-inter leading-relaxed">
              Dental clinics, dermatology centers, and IVF practices. Strict medical ethical compliance, doctor degree preservation, and preventive health guides.
            </p>
            <div className="pt-3 border-t border-white/5 text-[11px] text-emerald-400 font-mono">
              +44% Patient Inquiries
            </div>
          </div>

          {/* Vertical 2: F&B */}
          <div className="p-6 rounded-[14px] bg-[#0B0F14] border border-white/10 space-y-4 hover:border-[#FF7A00]/30 transition">
            <div className="w-10 h-10 rounded-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Utensils size={20} />
            </div>
            <h3 className="font-sora font-bold text-base text-white">Food & Restaurants</h3>
            <p className="text-xs text-slate-400 font-inter leading-relaxed">
              Cafes, bakeries, and cloud kitchens. Monsoon snack specials, weekend brunch carousels, and festive takeaway hampers scheduled automatically.
            </p>
            <div className="pt-3 border-t border-white/5 text-[11px] text-emerald-400 font-mono">
              +3.8x Weekend Footfall
            </div>
          </div>

          {/* Vertical 3: Retail & D2C */}
          <div className="p-6 rounded-[14px] bg-[#0B0F14] border border-white/10 space-y-4 hover:border-[#FF7A00]/30 transition">
            <div className="w-10 h-10 rounded-[10px] bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <h3 className="font-sora font-bold text-base text-white">Retail & D2C Brands</h3>
            <p className="text-xs text-slate-400 font-inter leading-relaxed">
              Apparel boutiques, jewelry stores, and wellness products. Flash drop announcements, seasonal sales, and Instagram Reels with voiceover.
            </p>
            <div className="pt-3 border-t border-white/5 text-[11px] text-emerald-400 font-mono">
              -82% Creative Production Cost
            </div>
          </div>

          {/* Vertical 4: Agencies */}
          <div className="p-6 rounded-[14px] bg-[#0B0F14] border border-white/10 space-y-4 hover:border-[#FF7A00]/30 transition">
            <div className="w-10 h-10 rounded-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Briefcase size={20} />
            </div>
            <h3 className="font-sora font-bold text-base text-white">Marketing Agencies</h3>
            <p className="text-xs text-slate-400 font-inter leading-relaxed">
              Digital agencies managing 10 to 50 local SMB clients. Multi-tenant workspace isolation, whitelabel WhatsApp templates, and automated delivery.
            </p>
            <div className="pt-3 border-t border-white/5 text-[11px] text-emerald-400 font-mono">
              Scale 10x Without Hiring
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Traditional Agency vs KUIRO Services */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/10">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
            Unit Economics
          </span>
          <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight mt-1">
            Traditional Retainers vs. KUIRO Autonomous Suite
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto font-inter">
            Why forward-thinking clinics and businesses are migrating from high-friction retainers to autonomous AI marketing.
          </p>
        </div>

        <div className="rounded-[16px] overflow-hidden border border-white/15 bg-[#0B0F14]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#11141A] text-[10px] font-mono uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="p-4 font-bold text-slate-300">Dimension</th>
                <th className="p-4 font-bold text-red-400">Traditional Agency Retainer</th>
                <th className="p-4 font-bold text-emerald-400 bg-emerald-950/20">KUIRO Autonomous Employee</th>
              </tr>
            </thead>
            <tbody className="divide-y border-white/5 font-inter">
              <tr>
                <td className="p-4 font-semibold text-white">Monthly Cost</td>
                <td className="p-4 text-slate-400">₹35,000 – ₹75,000 / month</td>
                <td className="p-4 text-emerald-300 font-semibold bg-emerald-950/10">₹3,499 / month (90% savings)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Review Friction</td>
                <td className="p-4 text-slate-400">Endless email threads, Google Docs & lost feedback</td>
                <td className="p-4 text-emerald-300 font-semibold bg-emerald-950/10">1-Tap WhatsApp cards & Hindi voice notes</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Regional Intelligence</td>
                <td className="p-4 text-slate-400">Manual tracking; frequently forgets state holidays</td>
                <td className="p-4 text-emerald-300 font-semibold bg-emerald-950/10">365-day automated calendar across 28 states</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Turnaround Time</td>
                <td className="p-4 text-slate-400">3 to 5 business days per design iteration</td>
                <td className="p-4 text-emerald-300 font-semibold bg-emerald-950/10">&lt; 12 seconds for AI voice revisions</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Consistency Guarantee</td>
                <td className="p-4 text-slate-400">Drops during holidays & agency staff turnover</td>
                <td className="p-4 text-emerald-300 font-semibold bg-emerald-950/10">48h Auto-Commit ensures 100% publishing uptime</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-[20px] bg-gradient-to-br from-[#0B0F14] via-[#1A1208] to-[#0B0F14] border-2 border-[#FF7A00]/40 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] text-xs font-semibold">
              <Sparkles size={13} />
              <span>Deploy All 6 Services Today</span>
            </span>

            <h2 className="font-sora text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Ready to automate your marketing <br />
              <span className="text-[#FF7A00]">with zero routine work?</span>
            </h2>

            <p className="text-sm text-slate-300 font-inter leading-relaxed">
              Start with a 14-day free trial. Your Brand Brain extracts in 30 seconds and your first WhatsApp review arrives in minutes.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-7 py-3.5 rounded-[12px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-sm font-sora font-semibold transition shadow-lg shadow-[#FF7A00]/30 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{isLoggedIn ? 'Go to Dashboard' : 'Launch All 8 Services Free'}</span>
                <ArrowRight size={15} />
              </button>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 py-3.5 rounded-[12px] bg-white text-[#0B0F14] hover:bg-gray-100 text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                <span>Book Custom Walkthrough</span>
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
