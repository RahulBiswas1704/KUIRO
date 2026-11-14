'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  User,
  Building2,
  Stethoscope,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  ShieldCheck,
  UtensilsCrossed
} from 'lucide-react';
import Link from 'next/link';

interface VerticalCase {
  id: string;
  name: string;
  icon: React.ElementType;
  badge: string;
  clientName: string;
  location: string;
  headline: string;
  problem: string;
  solution: string;
  results: { label: string; value: string }[];
  samplePost: {
    event: string;
    caption: string;
    format: string;
  };
}

const verticals: VerticalCase[] = [
  {
    id: 'smb-retail',
    name: 'Small & Medium Businesses (SMBs)',
    icon: ShoppingBag,
    badge: 'Retail, Boutiques, Cafes & Local Stores',
    clientName: 'Kolkata Chai Co. & Artisanal Goods',
    location: 'Kolkata & Bangalore',
    headline: 'Consistent footfall and festive sales without $2,000/mo agency retainers',
    problem: 'Seasonal monsoon specials, Durga Puja rushes, and Poila Boishakh launches needed weekly graphics, local language copy, and customer WhatsApp broadcasts.',
    solution: 'KUIRO plans 365 days of cultural and seasonal buying cycles, generating warm high-DPI graphics and WhatsApp broadcast cards with zero manual designer delays.',
    results: [
      { label: 'Marketing Costs', value: '-82%' },
      { label: 'Festive Store Footfall', value: '+38%' },
      { label: 'Festival Lead Time', value: '48h Prior' },
      { label: 'WhatsApp Revisions', value: '< 15 seconds' },
    ],
    samplePost: {
      event: 'Poila Boishakh (Bengali New Year)',
      caption: 'Shubho Noboborsho! 🌿 Celebrate fresh beginnings with our signature saffron elaichi brew and festive gift pairings.',
      format: '1:1 Feed Post + WhatsApp Broadcast Card',
    },
  },
  {
    id: 'personal-brands',
    name: 'Personal Brands & Creators',
    icon: User,
    badge: 'Coaches, Consultants, Executives & Authors',
    clientName: 'Vikram Malhotra • Growth Advisory',
    location: 'Mumbai & Remote',
    headline: 'Executive LinkedIn & Twitter presence on autopilot while serving clients',
    problem: 'Solopreneurs and consultants spend all their energy working for clients. Consistent thought leadership writing and carousel design fell behind every week.',
    solution: 'KUIRO indexes their core philosophy and frameworks, generating multi-slide carousels and X threads with link-surcharge avoidance built in.',
    results: [
      { label: 'Weekly Hours Saved', value: '8.5 hrs' },
      { label: 'LinkedIn Inbound Leads', value: '+62%' },
      { label: 'Reach Protection', value: 'First-Reply Links' },
      { label: 'Tone Consistency', value: '100% On-Brand' },
    ],
    samplePost: {
      event: 'Weekly Growth Playbook',
      caption: 'Why high-ticket consultants lose organic reach: Outbound URLs in main posts trigger an algorithm penalty. Here is the zero-link framework:',
      format: '4:5 LinkedIn Carousel + First-Reply Link on X',
    },
  },
  {
    id: 'founders-b2b',
    name: 'Startups & Professional Services',
    icon: Briefcase,
    badge: 'Tech Founders, Legal, Finance & Consultancies',
    clientName: 'GrowthCraft Software & B2B Solutions',
    location: 'Bengaluru & Hyderabad',
    headline: 'Zero dashboard fatigue: multi-channel announcements from WhatsApp',
    problem: 'Founders cannot context-switch into complex social scheduling tools. Product updates and industry milestone commentary were missed regularly.',
    solution: 'KUIRO delivers prepared announcements directly to the founder’s WhatsApp 48 hours ahead. One tap approves or a quick voice note refines the angle.',
    results: [
      { label: 'Dashboard Logins Needed', value: '0 Logins' },
      { label: 'Pipeline Attributed', value: '₹1.85 Lakh/mo' },
      { label: 'Approval Speed', value: '1-Tap WhatsApp' },
      { label: 'Organic Impressions', value: '3.4x Growth' },
    ],
    samplePost: {
      event: 'Quarterly Industry Milestone',
      caption: 'Building sustainable unit economics in 2026 requires replacing bloated agency retainers with autonomous AI infrastructure.',
      format: 'Multi-Channel Synchronized Broadcast',
    },
  },
  {
    id: 'healthcare-wellness',
    name: 'Practices, Clinics & Wellness',
    icon: Stethoscope,
    badge: 'Doctors, Aesthetic Centers & Studios',
    clientName: 'Apex Healthcare & Aesthetic Center',
    location: 'Delhi NCR & Kolkata',
    headline: 'Zero missed awareness days with strict ethical and regulatory standards',
    problem: 'Practitioners spend all day with patients. Social media was erratic, missing World Health Day, local festivals, and seasonal health awareness.',
    solution: 'KUIRO trained on verified credentials, medical ethics guardrails (no false cure claims), and automated festive educational campaigns.',
    results: [
      { label: 'Weekly Hours Saved', value: '7.0 hrs' },
      { label: 'New Client Inquiries', value: '+44%' },
      { label: 'Cultural Holidays', value: '100% On-Time' },
      { label: 'Compliance Pass', value: '99.8%' },
    ],
    samplePost: {
      event: 'Holi 2026 (Preventive Care)',
      caption: 'Celebrate festive colors with preventive care! Simple tips to protect your skin and health before stepping out.',
      format: '1:1 Visual + Reception Display Card',
    },
  },
  {
    id: 'agencies',
    name: 'Marketing Agencies & Operators',
    icon: Building2,
    badge: 'Multi-Client Agency Teams',
    clientName: 'Nexus Growth Digital Agency',
    location: 'Gurugram & Pune',
    headline: 'Scale from 5 to 50 clients without hiring extra graphic designers',
    problem: 'Account managers were drowning in manual client approvals, Slack feedback ping-pong, and resizing Canva templates for 20+ brands.',
    solution: 'Each client gets an isolated Brand Brain workspace and automated 48-hour WhatsApp approval loop. Client founders approve on WhatsApp directly.',
    results: [
      { label: 'Clients Handled', value: '35+' },
      { label: 'Designer Overtime', value: '-90%' },
      { label: 'Gross Margin', value: '91.2%' },
      { label: 'Client Churn', value: '< 2%' },
    ],
    samplePost: {
      event: 'Multi-Client Cultural Pipeline',
      caption: 'Automated 48h approval workflows running concurrently across 35 workspaces with whitelabel utility templates.',
      format: 'Isolated Multi-Tenant Workspace',
    },
  },
];

export default function SmbVerticalUseCases() {
  const [activeVertical, setActiveVertical] = useState<VerticalCase>(verticals[0]);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/10">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-semibold mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Built for Businesses, Creators & Individuals</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight">
          How Different Ventures Run on Autopilot
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto mt-2 font-inter">
          From retail stores and solopreneurs to personal brands, clinics, and digital agencies—see real use cases and business outcomes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto sm:flex-wrap sm:justify-center gap-2 mb-8 pb-2 sm:pb-0 scrollbar-none snap-x">
        {verticals.map((v) => {
          const Icon = v.icon;
          const isActive = v.id === activeVertical.id;
          return (
            <button
              key={v.id}
              onClick={() => setActiveVertical(v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-xs font-semibold transition border whitespace-nowrap shrink-0 snap-start ${
                isActive
                  ? 'bg-[#FF7A00] text-white border-[#FF7A00] shadow-lg shadow-[#FF7A00]/20'
                  : 'bg-[#0B0F14] text-gray-300 border-white/10 hover:border-white/25 hover:text-white'
              }`}
            >
              <Icon size={15} />
              <span>{v.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Vertical Card */}
      <div className="p-6 sm:p-8 rounded-[16px] bg-[#0B0F14] border border-white/15 relative overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Details (7 cols) */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 text-[10px] font-mono">
                  {activeVertical.badge}
                </span>
                <span className="text-xs text-[#FF7A00] font-mono">• {activeVertical.location}</span>
              </div>
              <h3 className="font-sora text-xl sm:text-2xl font-bold text-white leading-snug">
                {activeVertical.headline}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">Client: {activeVertical.clientName}</p>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-[10px] bg-red-950/20 border border-red-900/30">
                <p className="text-red-300 font-semibold mb-1 text-[11px] uppercase tracking-wider font-mono">
                  The Problem
                </p>
                <p className="text-slate-300 font-inter text-xs leading-relaxed">{activeVertical.problem}</p>
              </div>

              <div className="p-3.5 rounded-[10px] bg-emerald-950/20 border border-emerald-900/30">
                <p className="text-emerald-300 font-semibold mb-1 text-[11px] uppercase tracking-wider font-mono">
                  The KUIRO Autopilot Solution
                </p>
                <p className="text-slate-300 font-inter text-xs leading-relaxed">{activeVertical.solution}</p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {activeVertical.results.map((r, i) => (
                <div key={i} className="p-3 rounded-[10px] bg-white/[0.03] border border-white/10">
                  <p className="text-lg font-bold font-sora text-emerald-400">{r.value}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{r.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Preview (5 cols) */}
          <div className="lg:col-span-5 bg-[#111620] rounded-[14px] p-5 border border-white/10 space-y-4 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white font-sora">Sample Automated Output</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">
                Verified Satori Composite
              </span>
            </div>

            <div className="p-4 rounded-[10px] bg-[#070B14] border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-[10px] text-[#FF7A00] font-mono">
                <span>{activeVertical.samplePost.event}</span>
                <span>{activeVertical.samplePost.format}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-inter italic">
                "{activeVertical.samplePost.caption}"
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Auto-Commit: T-48h Active</span>
                <span className="text-emerald-400">Zero Link Penalty Pass</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link
                href="/get-started"
                className="inline-flex items-center gap-1.5 text-xs text-[#FF7A00] font-semibold hover:text-[#FF881A] transition"
              >
                <span>Automate your venture now</span>
                <ArrowRight size={13} />
              </Link>
              <span className="text-[11px] text-slate-500 font-mono">14-Day Free Trial</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
