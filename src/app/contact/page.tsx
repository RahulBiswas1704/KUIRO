'use client';

import React from 'react';
import { Navbar, Footer } from '@/components/layout';
import {
  ContactHeroSection,
  ContactHubAndFormSection,
  ContactFaqAndCta,
} from '@/components/contact';

/**
 * Clean, light-editorial KUIRO Contact Us Page aligned with the redesigned Homepage, Services & Pricing pages.
 */
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFD] text-[#0B0F14] flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-x-clip">
      {/* Sticky Frosted-White Floating Pill Navbar */}
      <Navbar activeRoute="contact" theme="light" floating />

      <main className="flex-1">
        {/* 1. Framed Dusk Hero */}
        <ContactHeroSection />

        {/* 2. Light 2-Column Communication Hubs & Consultation Form + Agency Callout */}
        <ContactHubAndFormSection />

        {/* 3. Warm Cream FAQ Accordion & Closing Editorial CTA */}
        <ContactFaqAndCta />
      </main>

      <Footer theme="light" />
    </div>
  );
}
