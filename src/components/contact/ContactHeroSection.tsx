'use client';

import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

/**
 * Framed Dusk-Slate Hero Stage for /contact matching the redesigned Homepage, Services & Pricing pages.
 */
export default function ContactHeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-[#667387] via-[#465163] to-[#232A38] overflow-hidden rounded-b-[28px] sm:rounded-b-[40px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[780px] h-[340px] rounded-full bg-[#FF7A00]/25 blur-[110px]"
      />

      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-14 sm:pb-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs text-white/90 font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
          <span>Real Human Support &amp; Onboarding • Avg reply &lt; 15 mins</span>
        </div>

        <h1 className="font-sora text-4xl sm:text-6xl lg:text-[64px] font-extrabold tracking-[-0.03em] text-white leading-[1.06]">
          Let’s Put Your
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF9D42] via-[#FF7A00] to-[#FFB36B]">
            Marketing on Autopilot.
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-lg text-white/80 max-w-2xl font-inter leading-relaxed">
          Have questions about Brand Brain setup, WhatsApp 48-hour approvals, ROI attribution, or
          multi-client agency workspaces? Connect directly with our India team.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs text-white/80 font-inter">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>&lt; 15 mins avg WhatsApp reply</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-300" />
            <span>Free 1-on-1 setup walkthrough</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#FFB36B]" />
            <span>18% GST invoices with Input Tax Credit</span>
          </span>
        </div>
      </div>
    </section>
  );
}
