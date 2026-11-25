'use client';

import React from 'react';
import { Navbar, Footer } from '@/components/layout';
import {
  ServicesHeroSection,
  CapabilitiesExplorerSection,
  IndustriesAndSavingsSection,
  ServicesFaqAndCta,
} from '@/components/services';

/**
 * Clean, light-editorial KUIRO Services Page aligned with the redesigned Homepage aesthetic.
 */
export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFD] text-[#0B0F14] flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-x-clip">
      {/* Sticky Frosted-White Floating Pill Navbar */}
      <Navbar activeRoute="services" theme="light" floating />

      <main className="flex-1">
        {/* 1. Framed Dusk Hero & 4-Pillar Overview Strip */}
        <ServicesHeroSection />

        {/* 2. Light 8-Capability Interactive Explorer & 6-Phase Workflow Timeline */}
        <CapabilitiesExplorerSection />

        {/* 3. Industries Bento & Retainer Savings Estimator */}
        <IndustriesAndSavingsSection />

        {/* 4. Cream FAQ Accordion & Editorial Closing CTA */}
        <ServicesFaqAndCta />
      </main>

      <Footer theme="light" />
    </div>
  );
}
