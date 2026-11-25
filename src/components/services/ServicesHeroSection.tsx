'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const OVERVIEW_PILLARS = [
  {
    label: 'Brand Memory',
    value: 'Zero-prompt setup',
    detail: 'Learns website, logo & colors',
  },
  {
    label: 'Bharat Radar',
    value: '35+ Festivals',
    detail: '28 states & regional dates',
  },
  {
    label: 'WhatsApp Loop',
    value: '48h Early',
    detail: '1-tap approve or voice edit',
  },
  {
    label: 'Full Output',
    value: 'All Channels',
    detail: 'Social, TV slides, email & inbox',
  },
];

/**
 * Framed Dusk-Slate Hero Stage for /services matching the redesigned KUIRO homepage.
 */
export default function ServicesHeroSection() {
  const { isLoggedIn, handleGetStarted } = useAuth();

  return (
    <section className="relative bg-gradient-to-b from-[#667387] via-[#465163] to-[#232A38] overflow-hidden rounded-b-[28px] sm:rounded-b-[40px]">
      {/* Warm sun-horizon ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[780px] h-[340px] rounded-full bg-[#FF7A00]/25 blur-[110px]"
      />

      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-14 sm:pb-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs text-white/90 font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
          <span>8 Integrated Capabilities • Zero Routine Friction</span>
        </div>

        <h1 className="font-sora text-4xl sm:text-6xl lg:text-[64px] font-extrabold tracking-[-0.03em] text-white leading-[1.06]">
          One Marketing Team.
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF9D42] via-[#FF7A00] to-[#FFB36B]">
            Built Into Software.
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-lg text-white/80 max-w-2xl font-inter leading-relaxed">
          From learning your brand voice and spotting Indian festivals early, to Hindi/Bengali/Tamil
          studio visuals, 48-hour WhatsApp approvals, and a shared customer inbox.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleGetStarted}
            className="cursor-pointer w-full sm:w-auto inline-flex items-center justify-center bg-white hover:bg-gray-50 text-[#0B0F14] font-sora font-bold text-sm sm:text-base rounded-2xl px-6 py-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.22)] hover:scale-[1.03] active:scale-[0.98] transition-all group"
          >
            <span>{isLoggedIn ? 'Open Dashboard' : 'Start for free'}</span>
            <ArrowRight
              size={17}
              className="ml-2 text-[#0B0F14] group-hover:translate-x-0.5 transition-transform"
            />
          </button>

          <Link
            href="/pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold backdrop-blur-md transition"
          >
            <span>Compare Plans &amp; Savings</span>
            <ChevronRight size={15} />
          </Link>
        </div>

        {/* Clean 4-Metric Summary Strip */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 w-full text-left">
          {OVERVIEW_PILLARS.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl bg-white/[0.08] border border-white/15 backdrop-blur-md p-4 sm:p-5"
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/65 block">
                {item.label}
              </span>
              <span className="font-sora text-lg sm:text-xl font-bold text-white mt-1 block">
                {item.value}
              </span>
              <span className="text-xs text-[#FFB36B] mt-0.5 block">{item.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
