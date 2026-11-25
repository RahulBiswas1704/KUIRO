'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  Download,
  Layers,
  MessagesSquare,
  Mic,
  Palette,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export type CapabilityKey =
  | 'brain'
  | 'radar'
  | 'compositor'
  | 'whatsapp'
  | 'publishing'
  | 'exporter'
  | 'inbox'
  | 'attribution';

interface CapabilityItem {
  id: CapabilityKey;
  num: string;
  shortTitle: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  outcomes: string[];
  details: { label: string; value: string }[];
}

const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'brain',
    num: '01',
    shortTitle: 'Brand Memory',
    badge: 'Persistent Brand Brain',
    title: 'Learns your business once—never sounds generic',
    subtitle: 'Your website, products, pricing, hex colors, and brand voice saved permanently.',
    description:
      'Instead of prompting ChatGPT from scratch every week, KUIRO scans your store URL and catalog once. Every post stays true to your colors, official logo, real offers, and strict compliance boundaries.',
    icon: Layers,
    outcomes: [
      'Scans your website and product pages in under 30 seconds',
      'Locks in exact hex brand colors and clean vector logo placement',
      'Respects tone of voice—artisanal, clinical, warm, or Hinglish',
      'Blocks exaggerated discounts or prohibited medical claims automatically',
    ],
    details: [
      { label: 'Setup Time', value: 'Under 30 seconds per website' },
      { label: 'Brand Safety', value: 'Strict negative guardrails active' },
    ],
  },
  {
    id: 'radar',
    num: '02',
    shortTitle: 'Festival Calendar',
    badge: '365-Day Bharat Radar',
    title: 'Never miss an Indian festival or regional retail peak',
    subtitle: 'Automated planning 48 hours ahead across regional & national dates.',
    description:
      'Diwali, Durga Puja, Eid-ul-Fitr, Pongal, Onam, Chhath Puja, Akshaya Tritiya, Doctors’ Day—KUIRO spots upcoming dates relevant to your city and industry and prepares timely campaigns before the rush.',
    icon: Calendar,
    outcomes: [
      '35+ national, state-level, and commercial milestones pre-loaded',
      'Custom flash sales, store anniversaries, and clinic camps supported',
      'Adapts messaging naturally to West Bengal, South India, North & West',
      'Drafts visuals & copy early so your shelves match your feed',
    ],
    details: [
      { label: 'Coverage', value: '35+ Cultural & Retail Dates' },
      { label: 'Lead Time', value: 'Preview ready 48 hours early' },
    ],
  },
  {
    id: 'compositor',
    num: '03',
    shortTitle: 'Indic Studio',
    badge: 'High-DPI Indic Typography',
    title: 'Crisp Hindi, Bengali & Tamil graphics—zero broken text',
    subtitle: 'Studio-grade visuals without distorted AI letters or messy Canva templates.',
    description:
      'Generic image tools mangle regional scripts. KUIRO pairs clean imagery with programmatic Noto Indic typography and your crisp SVG logo across 1:1 feed posts, 4:5 carousels, and 9:16 vertical Reels/Shorts.',
    icon: Palette,
    outcomes: [
      'Clean Bengali, Devanagari (Hindi/Marathi), Tamil & English text rendering',
      'Auto-formatted for Instagram 4:5, Feed 1:1, Stories & Shorts 9:16',
      'Handles special characters cleanly (e.g. "Roy & Sons", ₹ pricing badges)',
      'Combines posts into clean preview grids for WhatsApp approval',
    ],
    details: [
      { label: 'Languages', value: 'Hindi, Bengali, Tamil & English' },
      { label: 'Formats', value: '1:1 Square, 4:5 Post, 9:16 Video' },
    ],
  },
  {
    id: 'whatsapp',
    num: '04',
    shortTitle: 'WhatsApp Review',
    badge: '48-Hour Approval Bridge',
    title: 'Approve or edit with a voice note over morning chai',
    subtitle: 'Zero dashboard login required to review and launch every campaign.',
    description:
      '48 hours before a post goes live, KUIRO sends a preview card directly to your WhatsApp. Tap Approve, record a quick voice note in Hindi, Bengali, or English to revise, or leave it be to auto-publish on time.',
    icon: Smartphone,
    outcomes: [
      'Arrives on your WhatsApp 48 hours before scheduled publishing',
      'Voice-note edits in Hindi, Hinglish, Bengali, or English apply in seconds',
      'One-tap [Approve] or [Pause] directly inside the WhatsApp chat',
      'Automatic safety auto-commit so your page never goes quiet',
    ],
    details: [
      { label: 'Edit Speed', value: 'Under 12s per voice note' },
      { label: 'Cadence Rule', value: '48h preview window included' },
    ],
  },
  {
    id: 'publishing',
    num: '05',
    shortTitle: 'All Channels',
    badge: 'Official Multi-Channel Sync',
    title: 'Publish across every platform via official APIs',
    subtitle: 'Instagram, Facebook, YouTube Shorts, LinkedIn, X & WhatsApp synchronized.',
    description:
      'Each network gets tailored copy, hashtags, and media framing. Links on X (Twitter) are automatically placed in the first reply to preserve organic reach and avoid link-surcharge fees.',
    icon: Share2,
    outcomes: [
      'Direct publishing via official Meta, Google, LinkedIn & X approvals',
      'Encrypted OAuth tokens with automatic refresh—zero password sharing',
      'Automatic first-reply link placement on X to protect organic impressions',
      'Automatic retry handling if any social API is temporarily busy',
    ],
    details: [
      { label: 'Connected Apps', value: 'IG, FB, YouTube, LinkedIn, X' },
      { label: 'X Protection', value: 'First-reply link routing active' },
    ],
  },
  {
    id: 'exporter',
    num: '06',
    shortTitle: 'Print & TV Kit',
    badge: '360° Creative Kit Export',
    title: 'Download ready-to-use in-store TV slides & staff SOPs',
    subtitle: 'Digital campaigns packaged for your showroom screen, email list & front desk.',
    description:
      'Great marketing bridges online posts and offline footfall. Download a neat 1-click ZIP bundle containing a 1080p showroom TV graphic, square social card, promotional email HTML, and counter staff talking points.',
    icon: Download,
    outcomes: [
      '1920x1080 widescreen graphic ready for in-store TVs and displays',
      'Responsive promotional newsletter HTML ready to send to subscribers',
      'Simple front-desk offer & coupon guide for your billing staff',
      'One clean ZIP download for every approved campaign',
    ],
    details: [
      { label: 'Bundle Type', value: 'One-click structured ZIP kit' },
      { label: 'Displays', value: '1080p TV + 1:1 Social + Email' },
    ],
  },
  {
    id: 'inbox',
    num: '07',
    shortTitle: 'Unified Inbox',
    badge: 'Shared Inbox & Auto-Replies',
    title: 'Every WhatsApp, Instagram & Messenger chat in one view',
    subtitle: 'Instant keyword auto-replies, Brand Brain drafts & in-chat UPI links.',
    description:
      'Never lose an inquiry across scattered phones. Customer messages sync in real time with 1-click AI draft replies grounded in your product catalog, custom keyword automations, and instant UPI payment links.',
    icon: MessagesSquare,
    outcomes: [
      'WhatsApp Business, Instagram DMs & Messenger synced live',
      'Custom keyword auto-responders (e.g. "PRICE", "MENU", "BOOKING")',
      '1-click Brand Brain reply suggestions tailored to your catalog',
      'Generate Razorpay/UPI payment links right inside the conversation',
    ],
    details: [
      { label: 'Sync Mode', value: 'Real-time multi-channel stream' },
      { label: 'Meta Guard', value: '24-hour reply window tracking' },
    ],
  },
  {
    id: 'attribution',
    num: '08',
    shortTitle: 'ROI & Leads',
    badge: 'Lead & Revenue Attribution',
    title: 'See which festival post brought real WhatsApp inquiries',
    subtitle: 'Connect every campaign directly to leads, cost-per-inquiry & closed sales.',
    description:
      'Move past vanity likes. KUIRO links inbound WhatsApp clicks, UTM links, and recorded payments back to the campaign that sparked them—with 1-click PDF & CSV reports for owners or agency clients.',
    icon: BarChart3,
    outcomes: [
      'Tracks Cost Per Lead (CPL), WhatsApp inquiries & attributed revenue',
      'Pre-filled wa.me tracking links baked into every campaign caption',
      'Live breakdown across festive spikes vs. evergreen posts',
      'Executive PDF & CSV summary export in one click',
    ],
    details: [
      { label: 'Visibility', value: 'Campaign-to-sale attribution' },
      { label: 'Reports', value: 'One-click executive CSV / PDF' },
    ],
  },
];

const LIFECYCLE_PHASES = [
  {
    phase: 'T-7 Days',
    tag: 'Calendar Scan',
    title: 'Festival detected early',
    desc: 'KUIRO spots an upcoming regional festival or store event and pulls your brand colors, offers, and language preferences.',
  },
  {
    phase: 'T-48 Hours',
    tag: 'Indic Studio',
    title: 'Visuals & copy crafted',
    desc: 'Post formats for Instagram, Facebook, Shorts, LinkedIn, and X are rendered cleanly in your chosen regional scripts.',
  },
  {
    phase: '48h Window',
    tag: 'WhatsApp Review',
    title: 'Approve over morning tea',
    desc: 'A preview lands in your WhatsApp. Tap Approve, speak an edit by voice note, or let Silence = Consent publish safely.',
  },
  {
    phase: 'Launch Hour',
    tag: 'Auto-Publish',
    title: 'Goes live everywhere',
    desc: 'All connected channels publish in parallel via official APIs with smart X link-threading to preserve reach.',
  },
  {
    phase: 'Same Day',
    tag: 'Creative Kit',
    title: 'Showroom TV & email ready',
    desc: 'Export your matching 1080p counter TV screen graphic, newsletter HTML, and team offer guide in one ZIP.',
  },
  {
    phase: 'Always On',
    tag: 'Inbox & ROI',
    title: 'Replies & revenue tracked',
    desc: 'Customer DMs and WhatsApp questions stream into your shared inbox while inquiries and sales roll up to ROI.',
  },
];

/**
 * Interactive 8-Capability Explorer + Clean 6-Phase Workflow Timeline in KUIRO's light editorial system.
 */
export default function CapabilitiesExplorerSection() {
  const { handleGetStarted } = useAuth();
  const [activeId, setActiveId] = useState<CapabilityKey>('brain');
  const [waApproved, setWaApproved] = useState(false);
  const [waVoiceApplied, setWaVoiceApplied] = useState(false);
  const [inboxReplied, setInboxReplied] = useState(false);
  const [kitPrepared, setKitPrepared] = useState(false);

  const current = CAPABILITIES.find((item) => item.id === activeId) ?? CAPABILITIES[0];
  const CurrentIcon = current.icon;

  return (
    <>
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F9FAFD] relative overflow-hidden">
        {/* Soft warm Zorcha-style ambient backdrop behind featured card */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-44 left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full bg-gradient-to-tr from-[#FFE2C6]/65 via-[#FFF0E0]/55 to-[#E8ECFF]/45 blur-[95px]"
        />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center">
          {/* Pill Badge Header */}
          <div className="px-6 py-2 rounded-full bg-white border border-gray-200 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.12)] text-sm font-semibold text-[#0B0F14] mb-6">
            Capabilities
          </div>

          <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-center text-[#0B0F14] tracking-tight leading-[1.1] max-w-3xl">
            Everything one marketing employee does—
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] to-[#E85D04]">
              working seamlessly
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-lg text-[#4B5563] text-center max-w-xl font-inter">
            Select any capability below to explore how it works in plain terms and try the live preview.
          </p>

          {/* 8 Clean Pill Switcher Tabs (2x4 grid prevents label clipping at laptop widths) */}
          <div
            role="tablist"
            aria-label="KUIRO capabilities"
            className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full"
          >
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              const isSelected = cap.id === activeId;
              return (
                <button
                  key={cap.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveId(cap.id)}
                  className={`cursor-pointer p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#0B0F14] border-[#0B0F14] text-white shadow-[0_12px_26px_-12px_rgba(11,15,20,0.5)]'
                      : 'bg-white border-gray-200 text-[#0B0F14] hover:border-[#FF7A00]/50 hover:bg-[#FFFBF7]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#FF7A00] text-white'
                          : 'bg-[#FAF5F0] text-[#FF7A00]'
                      }`}
                    >
                      <Icon size={15} />
                    </div>
                    <span className="font-sora text-xs sm:text-sm font-bold leading-snug">
                      {cap.shortTitle}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold shrink-0 ${
                      isSelected ? 'text-white/60' : 'text-gray-400'
                    }`}
                  >
                    {cap.num}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Capability Editorial Split Stage */}
          <div
            role="tabpanel"
            className="mt-6 w-full p-px rounded-[28px] bg-gradient-to-b from-[#FF8E3C]/55 via-[#FF8E3C]/15 to-transparent"
          >
            <div className="bg-white rounded-[27px] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center text-left">
              {/* Left Narrative Column */}
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF5EB] border border-[#F5DEC6] text-xs font-semibold text-[#C25400]">
                  <CurrentIcon size={13} className="text-[#FF7A00]" />
                  <span>{current.badge}</span>
                </div>

                <div>
                  <h3 className="font-sora text-2xl sm:text-3xl font-extrabold text-[#0B0F14] tracking-tight leading-tight">
                    {current.title}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base font-medium text-[#374151] font-inter">
                    {current.subtitle}
                  </p>
                </div>

                <p className="text-sm text-[#4B5563] font-inter leading-relaxed">
                  {current.description}
                </p>

                <ul className="space-y-2.5 pt-1">
                  {current.outcomes.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-[#1F2937] font-inter"
                    >
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 grid grid-cols-2 gap-3">
                  {current.details.map((spec) => (
                    <div
                      key={spec.label}
                      className="rounded-xl bg-[#FAF8F5] border border-[#EFE8DF] p-3"
                    >
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 block">
                        {spec.label}
                      </span>
                      <span className="text-xs sm:text-sm font-sora font-bold text-[#0B0F14] mt-0.5 block">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGetStarted}
                    className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B0F14] hover:bg-[#1F2937] text-white text-xs sm:text-sm font-sora font-semibold transition group"
                  >
                    <span>Try {current.shortTitle} Free</span>
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </button>
                </div>
              </div>

              {/* Right Light Tactile Interactive Preview */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#EFE7DE] text-xs">
                    <span className="font-sora font-bold text-[#0B0F14] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Interactive Preview</span>
                    </span>
                    <span className="text-[11px] font-mono text-gray-500 bg-white px-2.5 py-0.5 rounded-full border border-gray-200">
                      {current.num} • {current.shortTitle}
                    </span>
                  </div>

                  {activeId === 'brain' && (
                    <div className="space-y-3.5 text-xs">
                      <div className="p-4 rounded-xl bg-white border border-gray-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-sora font-bold text-sm text-[#0B0F14]">
                            Kolkata Chai Co.
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                            Brand Profile Active
                          </span>
                        </div>
                        <p className="text-gray-500 text-[11px]">
                          Indexed store catalog, signature tea blends &amp; story in 24s
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-gray-200/80 space-y-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block">
                          Locked Brand Palette &amp; Fonts
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-[#FF7A00] text-white font-mono text-[11px] font-bold">
                            #FF7A00
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-[#2B1704] text-white font-mono text-[11px] font-bold">
                            #2B1704
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-gray-200 text-[#0B0F14] font-mono text-[11px] font-bold">
                            #FAF8F5
                          </span>
                        </div>
                        <p className="text-[11px] text-[#374151] pt-1">
                          Voice: Warm, handcrafted chai heritage · Bengali &amp; English enabled
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2 font-medium">
                        <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                        <span>Guardrails active: authentic pricing, never generic stock promises</span>
                      </div>
                    </div>
                  )}

                  {activeId === 'radar' && (
                    <div className="space-y-3.5 text-xs">
                      <div className="p-4 rounded-xl bg-white border border-gray-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#FF7A00]">
                            Upcoming Regional Milestone
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#FFF5EB] text-[#C25400] border border-[#F5DEC6] text-[10px] font-semibold">
                            Queued 48h Early
                          </span>
                        </div>
                        <p className="font-sora text-base font-extrabold text-[#0B0F14]">
                          Durga Puja &amp; Sharadiya Collection
                        </p>
                        <p className="text-[11px] text-gray-500">
                          West Bengal &amp; Pan-India • Festive Retail Peak
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-3 rounded-xl bg-white border border-gray-200/80">
                          <span className="text-[10px] text-gray-500 block">Drafted Hook</span>
                          <span className="font-semibold text-[#0B0F14] mt-0.5 block">
                            শারদোৎসব স্পেশাল অফার
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-gray-200/80">
                          <span className="text-[10px] text-gray-500 block">Channels Ready</span>
                          <span className="font-semibold text-emerald-700 mt-0.5 block">
                            IG, FB, Shorts &amp; WhatsApp
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeId === 'compositor' && (
                    <div className="space-y-3 text-xs">
                      <div className="aspect-square max-w-[260px] mx-auto rounded-2xl bg-gradient-to-br from-[#2B1704] via-[#1B1005] to-[#7A3B08] p-5 flex flex-col justify-between text-white shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-sora font-semibold">
                            Kolkata Chai Co.
                          </span>
                          <span className="text-[10px] text-[#FFB36B] font-semibold">1080×1080</span>
                        </div>
                        <div className="space-y-1.5">
                          <p className="font-sora text-lg font-bold leading-snug">
                            রঙের উৎসবে খাঁটি চায়ের উষ্ণতা
                          </p>
                          <p className="text-[11px] text-white/80">
                            Handcrafted Clay-Pot Chai &amp; Festive Gift Boxes
                          </p>
                        </div>
                        <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[10px] text-white/80">
                          <span>Google Noto Bengali + Sora</span>
                          <span className="text-emerald-300 font-semibold">Razor Sharp</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeId === 'whatsapp' && (
                    <div className="space-y-3 text-xs">
                      <div className="rounded-xl bg-[#ECE5DD] border border-[#DDD5CC] p-3.5 space-y-2.5 text-[#111B21]">
                        <div className="flex items-center justify-between text-[11px] text-[#075E54] font-semibold">
                          <span>KUIRO Assistant • WhatsApp</span>
                          <span>09:15 AM</span>
                        </div>
                        <div className="bg-white rounded-xl rounded-tl-none p-3 space-y-1.5 shadow-xs">
                          <p className="font-sora font-bold text-xs">
                            {waVoiceApplied
                              ? 'Updated: Holi Hamper + 20% Festive Offer'
                              : 'Holi Special Festive Post Ready'}
                          </p>
                          <p className="text-[11px] text-gray-600 leading-relaxed">
                            {waApproved
                              ? 'Approved! Scheduled to publish on Instagram, Facebook & Shorts Thursday 10:00 AM.'
                              : 'Your Holi campaign goes live in 48 hours. Reply or tap below to confirm.'}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setWaApproved(true)}
                            className={`cursor-pointer py-2 px-2.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition ${
                              waApproved
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white hover:bg-gray-50 text-[#075E54]'
                            }`}
                          >
                            <Check size={12} />
                            <span>{waApproved ? 'Approved' : 'Approve'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setWaVoiceApplied(true);
                              setWaApproved(false);
                            }}
                            className="cursor-pointer py-2 px-2.5 rounded-lg bg-white hover:bg-gray-50 text-[#111B21] text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                          >
                            <Mic size={12} className="text-[#FF7A00]" />
                            <span>{waVoiceApplied ? 'Voice Edit Saved' : 'Voice Edit'}</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 text-center">
                        Silence = Consent: leaves unchanged posts publishing on schedule at T-0.
                      </p>
                    </div>
                  )}

                  {activeId === 'publishing' && (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { name: 'Instagram Feed & Reels', status: 'Synced' },
                          { name: 'Facebook Business Page', status: 'Synced' },
                          { name: 'YouTube Shorts', status: 'Synced' },
                          { name: 'LinkedIn & X Thread', status: 'Synced' },
                        ].map((net) => (
                          <div
                            key={net.name}
                            className="p-3 rounded-xl bg-white border border-gray-200/80 flex items-center justify-between gap-2"
                          >
                            <span className="font-medium text-[#0B0F14] text-[11px]">{net.name}</span>
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                              {net.status}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border border-gray-200/80 space-y-1">
                        <span className="font-sora font-bold text-xs text-[#0B0F14] flex items-center gap-1.5">
                          <ShieldCheck size={14} className="text-[#FF7A00]" />
                          <span>Smart X Link Threading Enabled</span>
                        </span>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          Your main post goes live cleanly with full reach, while your store or WhatsApp
                          link is attached automatically in the first reply.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeId === 'exporter' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-white border border-gray-200/80 flex items-center justify-between gap-3">
                        <div>
                          <span className="font-sora font-bold text-[#0B0F14] block">
                            holi-creative-kit-2026.zip
                          </span>
                          <span className="text-[11px] text-gray-500">
                            4 ready-to-use files for online &amp; in-store
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setKitPrepared(true)}
                          className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#0B0F14] hover:bg-[#1F2937] text-white text-[11px] font-semibold flex items-center gap-1.5 shrink-0 transition"
                        >
                          <Download size={12} />
                          <span>{kitPrepared ? 'Ready in Workspace' : 'Sample Kit'}</span>
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {[
                          ['showroom-tv-1920x1080.webp', 'Counter TV Display'],
                          ['social-square-1080x1080.webp', 'Feed & Broadcast Graphic'],
                          ['festive-email-template.html', 'Customer Newsletter'],
                          ['staff-offer-guide.md', 'Front-Desk Redemption SOP'],
                        ].map(([file, role]) => (
                          <div
                            key={file}
                            className="px-3 py-2 rounded-lg bg-white border border-gray-200/80 flex items-center justify-between text-[11px]"
                          >
                            <span className="font-mono text-[#0B0F14]">{file}</span>
                            <span className="text-gray-500">{role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeId === 'inbox' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-white border border-gray-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-sora font-bold text-[#0B0F14]">Ananya Sharma</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                            WhatsApp
                          </span>
                        </div>
                        <p className="text-[#374151]">
                          &ldquo;Do you deliver Darjeeling gift hampers to Bangalore by Friday?&rdquo;
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FFF8F1] border border-[#F0DFCF] space-y-2">
                        <span className="text-[11px] font-semibold text-[#C25400] flex items-center gap-1.5">
                          <Sparkles size={12} className="text-[#FF7A00]" />
                          <span>Suggested Reply (From Your Brand Brain)</span>
                        </span>
                        <p className="text-[#1F2937] leading-relaxed">
                          &ldquo;Yes, Ananya! Express air shipping reaches Bangalore in 48 hours. Use code
                          FESTIVE15 for 15% off—want a UPI payment link?&rdquo;
                        </p>
                        <button
                          type="button"
                          onClick={() => setInboxReplied(true)}
                          className={`cursor-pointer px-3 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                            inboxReplied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#0B0F14] hover:bg-[#1F2937] text-white'
                          }`}
                        >
                          {inboxReplied ? 'Sent to Ananya via WhatsApp' : 'Send Approved Reply →'}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeId === 'attribution' && (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-3.5 rounded-xl bg-white border border-gray-200/80">
                          <span className="text-[11px] text-gray-500 block">Attributed Sales</span>
                          <span className="font-sora text-xl font-extrabold text-emerald-700 tabular-nums mt-0.5 block">
                            ₹1,48,200
                          </span>
                          <span className="text-[10px] text-gray-500">From 184 verified chats</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white border border-gray-200/80">
                          <span className="text-[11px] text-gray-500 block">Cost Per Lead</span>
                          <span className="font-sora text-xl font-extrabold text-[#0B0F14] tabular-nums mt-0.5 block">
                            ₹46.20
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">17.4x Return</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border border-gray-200/80 flex items-center justify-between text-[11px]">
                        <span className="text-gray-600">Pre-filled WhatsApp UTMs &amp; order totals synced</span>
                        <span className="font-semibold text-[#FF7A00]">1-Click CSV &amp; PDF</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLEAN 6-PHASE LIFECYCLE ON CRISP WHITE CANVAS */}
      <section className="py-20 sm:py-24 bg-white rounded-t-[36px] sm:rounded-t-[52px] border-t border-[#EFE8DF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="px-6 py-2 rounded-full bg-white border border-gray-200 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.12)] text-sm font-semibold text-[#0B0F14] mb-6">
            Weekly Flow
          </div>

          <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-center text-[#0B0F14] tracking-tight max-w-2xl">
            How every campaign runs from idea to revenue
          </h2>
          <p className="mt-4 text-sm sm:text-lg text-[#4B5563] text-center max-w-xl font-inter">
            One connected timeline replaces agencies, designers, schedulers, and manual follow-ups.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full text-left">
            {LIFECYCLE_PHASES.map((step) => (
              <div
                key={step.phase}
                className="rounded-2xl bg-[#FAF9F6] border border-[#EAE2D6] p-6 space-y-2.5 hover:border-[#FF7A00]/45 transition"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#E5DDD0] text-[#FF7A00] font-semibold">
                    {step.phase}
                  </span>
                  <span className="text-gray-500 font-medium">{step.tag}</span>
                </div>
                <h3 className="font-sora text-lg font-bold text-[#0B0F14]">{step.title}</h3>
                <p className="text-xs sm:text-sm text-[#4B5563] font-inter leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
