'use client';

import React, { useState } from 'react';
import {
  Stethoscope,
  UtensilsCrossed,
  ShoppingBag,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  ShieldCheck
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
    id: 'healthcare',
    name: 'Clinics & Healthcare',
    icon: Stethoscope,
    badge: 'Doctors, Dentists & Diagnostics',
    clientName: 'Dr. Sharma Dental Care & Implant Center',
    location: 'Kolkata & Delhi NCR',
    headline: 'Zero missed health days, zero compliance violations',
    problem: 'Founders spend 10+ hours a day with patients; social media was erratic, missing World Health Day and local festivals.',
    solution: 'KUIRO trained on clinic brochures, medical ethics guardrails (no 100% cure claims), and automated festive oral safety campaigns.',
    results: [
      { label: 'Weekly Hours Saved', value: '6.5 hrs' },
      { label: 'New Patient Inquiries', value: '+44%' },
      { label: 'Festival Campaigns', value: '100% On-Time' },
      { label: 'Approval Speed', value: '1-Tap WhatsApp' },
    ],
    samplePost: {
      event: 'Holi 2026 (Regional Health)',
      caption: 'Celebrate Holi with vibrant colors, not stained smiles! 🎨 Before stepping out, apply protective lip care and stay hydrated.',
      format: '1:1 Satori High-DPI Feed + WhatsApp Broadcast',
    },
  },
  {
    id: 'fnb',
    name: 'F&B, Cafes & Cloud Kitchens',
    icon: UtensilsCrossed,
    badge: 'Specialty Cafes & Restaurants',
    clientName: 'Kolkata Chai Co. & Artisanal Roasters',
    location: 'Park Street & Bangalore',
    headline: 'Festive footfalls up without paying $2,000/mo agency retainers',
    problem: 'Seasonal monsoon specials, Durga Puja rush, and Poila Boishakh sweet pairings needed weekly fresh visual designs and local Bengali copy.',
    solution: 'KUIRO activates regional prompts for Bengali festivals, generating warm amber graphics and high-engagement reels copy.',
    results: [
      { label: 'Marketing Costs', value: '-82%' },
      { label: 'Weekend Table Bookings', value: '+38%' },
      { label: 'Festival Lead Time', value: '48h Prior' },
      { label: 'Revision Time', value: '< 15 seconds' },
    ],
    samplePost: {
      event: 'Poila Boishakh (Bengali New Year)',
      caption: 'Shubho Noboborsho! 🌿 Celebrate fresh beginnings with our signature saffron elaichi brew and mishti pairings.',
      format: '4:5 Instagram Carousel + Story',
    },
  },
  {
    id: 'retail',
    name: 'D2C Brands & Retailers',
    icon: ShoppingBag,
    badge: 'Fashion, Jewelry & Organic Products',
    clientName: 'Veda Organics Ayurveda',
    location: 'Mumbai & Jaipur',
    headline: 'Product launches synchronized with regional auspicious muhurats',
    problem: 'Pushing seasonal Ayurvedic skincare during Diwali, Dhanteras, and Karwa Chauth required coordination across 4 social channels and WhatsApp broadcast lists.',
    solution: 'KUIRO plans 365 days of cultural buying cycles, scheduling posts with link-surcharge avoidance on X and instant WhatsApp broadcast utility cards.',
    results: [
      { label: 'Festive Revenue', value: '2.4x' },
      { label: 'ROAS Improvement', value: '+28%' },
      { label: 'Channels Synced', value: '4 of 4' },
      { label: 'AI Critic Pass', value: '98.6%' },
    ],
    samplePost: {
      event: 'Diwali & Dhanteras Festival',
      caption: 'Light up your inner glow this Diwali! 🪔 Pure herbal kumkumadi formulations crafted for festive celebrations.',
      format: '1:1 Visual + First Reply Link on X',
    },
  },
  {
    id: 'agencies',
    name: 'Marketing Agencies',
    icon: Building2,
    badge: 'Multi-Tenant Agency Operators',
    clientName: 'Nexus Growth Digital Agency',
    location: 'Gurugram & Hyderabad',
    headline: 'Scale from 5 to 50 clients without hiring extra graphic designers',
    problem: 'Account managers were drowning in manual client approvals, revisions over Slack, and resizing Canva templates for 20+ Indian brands.',
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
      format: 'Isolated Workspace Multi-Tenant',
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
          Engineered for Indian Businesses
        </div>
        <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight">
          How Different Industries Run on Autopilot
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto mt-2 font-inter">
          From single-location dental clinics to high-growth D2C brands and multi-client agencies—see real use cases and business outcomes.
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
              <p className="text-xs text-gray-400 mt-1 font-mono font-medium">
                Client Profile: {activeVertical.clientName}
              </p>
            </div>

            <div className="space-y-3 text-xs text-gray-300 leading-relaxed font-inter">
              <div className="p-3.5 rounded-[10px] bg-[#111620] border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-400 font-mono">
                  The Problem Before KUIRO
                </span>
                <p className="text-gray-300">{activeVertical.problem}</p>
              </div>

              <div className="p-3.5 rounded-[10px] bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono">
                  The Autopilot Solution
                </span>
                <p className="text-gray-200">{activeVertical.solution}</p>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {activeVertical.results.map((r, i) => (
                <div key={i} className="p-3 rounded-[10px] bg-[#161D28] border border-white/5 text-center">
                  <div className="font-sora text-lg sm:text-xl font-bold text-white font-mono">
                    {r.value}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                    {r.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Preview Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-sm rounded-[14px] bg-[#111620] border border-white/10 p-4 space-y-3 text-left">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <span className="font-bold text-[#FF7A00] text-[11px] uppercase font-mono">
                  {activeVertical.samplePost.event}
                </span>
                <span className="text-[9px] text-gray-400 bg-white/5 px-2 py-0.5 rounded font-mono">
                  AI Synthesized
                </span>
              </div>

              <div className="aspect-[4/3] rounded-[10px] bg-gradient-to-br from-[#0B0F14] via-[#1E2530] to-[#0B0F14] p-4 flex flex-col justify-between border border-white/10 text-white relative">
                <div className="flex items-center justify-between text-[9px] text-gray-400">
                  <span className="font-bold text-[#FF7A00]">{activeVertical.clientName}</span>
                  <ShieldCheck size={14} className="text-emerald-400" />
                </div>
                <div className="my-auto space-y-1">
                  <h4 className="font-sora text-sm font-bold leading-tight">
                    {activeVertical.samplePost.event}
                  </h4>
                  <p className="text-[10px] text-gray-300 line-clamp-2">
                    {activeVertical.samplePost.caption}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[8px] text-gray-500 font-mono">
                  <span>Contact Sheet Preview</span>
                  <span>48h Passive OK</span>
                </div>
              </div>

              <div className="text-[11px] text-gray-400 leading-snug">
                <span className="text-gray-200 font-semibold">Channel Payload: </span>
                {activeVertical.samplePost.format}
              </div>

              <Link
                href="/dashboard/simulator"
                className="mt-2 w-full py-2 rounded-[8px] bg-white text-[#0B0F14] hover:bg-gray-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center"
              >
                <span>Simulate This in WhatsApp</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

