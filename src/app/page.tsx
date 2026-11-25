'use client';

import React from 'react';
import { Navbar, Footer } from '@/components/layout';
import {
  HeroSection,
  GainsBentoSection,
  ProcessStepsSection,
  SocialProofAndPricing,
  FaqAndFooterCta,
} from '@/components/home';

const PARTNER_BADGES = [
  { name: 'Meta Official API', sub: 'Instagram & Facebook' },
  { name: 'WhatsApp Cloud', sub: '48h Approval Loop' },
  { name: 'YouTube Shorts', sub: 'Vertical Video Ready' },
  { name: 'Google Noto Indic', sub: 'Hindi, Bengali & Tamil' },
  { name: 'Razorpay GST', sub: 'Automatic ITC Invoices' },
];

/**
 * Clean, human, light-editorial KUIRO Homepage inspired by https://zorcha.com/.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F9FAFD] text-[#0B0F14] flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-x-clip">
      {/* Sticky Frosted-White Floating Pill Navbar */}
      <Navbar activeRoute="home" theme="light" floating />

      <main className="flex-1">
        {/* 1. Framed Dusk Hero with Tactile WhatsApp Phone Preview */}
        <HeroSection />

        {/* 2. Airy Trusted Integrations Strip */}
        <section
          aria-label="Official platform integrations"
          className="py-12 sm:py-16 px-4 bg-[#F9FAFD]"
        >
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-gray-400 font-semibold">
              Verified Integrations &amp; Regional Fonts
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {PARTNER_BADGES.map((item) => (
                <div key={item.name} className="text-center">
                  <p className="font-sora text-sm sm:text-base font-bold text-[#0B0F14]/75">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-gray-500 font-inter">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Light Bento Gains Showcase */}
        <GainsBentoSection />

        {/* 4. 4-Step Interactive Clean Process Flow */}
        <ProcessStepsSection />

        {/* 5. At a Glance + Founder Proof + Clean Pricing */}
        <SocialProofAndPricing />

        {/* 6. Cream FAQ Accordion + Warm Editorial Closing CTA */}
        <FaqAndFooterCta />
      </main>

      <Footer theme="light" />
    </div>
  );
}
