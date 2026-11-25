'use client';

import React, { useState } from 'react';
import { ArrowRight, ChevronDown, Heart, Smartphone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const CONTACT_FAQS = [
  {
    q: 'How fast can I get onboarded after reaching out?',
    a: 'Most SMB founders go live in under 15 minutes. After submitting your inquiry, our onboarding team connects via WhatsApp to extract your brand profile and queue your first upcoming campaign preview.',
  },
  {
    q: 'Can I see a WhatsApp campaign preview before buying?',
    a: 'Yes. During your 14-day free trial or live onboarding call, you receive an interactive preview card straight to your WhatsApp—complete with Indic typography and 1-tap Approve / Voice Revision controls.',
  },
  {
    q: 'Can KUIRO ingest our existing logos, brand colors, and guidelines?',
    a: 'Yes. During setup, KUIRO saves your brand hex colors, vector logo files, catalog pricing, and tone guidelines so every future post stays 100% consistent.',
  },
  {
    q: 'Do you offer custom workspaces for marketing agencies?',
    a: 'Yes. Agencies and franchise groups managing 10 to 50+ client accounts receive isolated client workspaces, custom WhatsApp approval workflows, and volume GST billing.',
  },
  {
    q: 'Do you issue GST tax invoices with Input Tax Credit?',
    a: 'Yes. Enter your company GSTIN at checkout and receive compliant 18% GST tax invoices automatically to your registered billing email.',
  },
];

/**
 * Warm Cream FAQ Accordion + Editorial Closing CTA matching Homepage, Services, and Pricing.
 */
export default function ContactFaqAndCta() {
  const { isLoggedIn, handleGetStarted } = useAuth();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <>
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6] border-t border-gray-200/70">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <div className="px-6 py-2 rounded-full bg-white border border-gray-200 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.12)] text-sm font-semibold text-[#0B0F14] mb-6">
            FAQ
          </div>

          <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-center text-[#0B0F14] tracking-tight mb-12">
            Quick answers before we talk
          </h2>

          <ul className="w-full space-y-3.5 text-left">
            {CONTACT_FAQS.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <li
                  key={faq.q}
                  className="bg-[#FFF8F1] rounded-2xl border border-[#F0DFCF] overflow-hidden"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <h3 className="font-sora text-sm sm:text-base font-semibold text-[#0B0F14]">
                      {faq.q}
                    </h3>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-[#0B0F14] transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#FF7A00]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-[#374151] font-inter leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAF9F6] to-[#F5F2EB] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-sora text-4xl sm:text-6xl font-extrabold text-[#0B0F14] tracking-tight leading-[1.1]">
            Ready to put your marketing <br />
            with zero routine work?
          </h2>

          <p className="text-base sm:text-lg text-[#374151] max-w-xl mx-auto font-inter font-medium">
            Set up your Brand Brain in under two minutes and preview your first WhatsApp campaign card
            today.
          </p>

          <div className="pt-2 flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleGetStarted}
                className="cursor-pointer inline-flex items-center justify-center bg-[#0B0F14] hover:bg-[#1F2937] text-white font-sora font-bold text-sm sm:text-base rounded-2xl px-7 py-3.5 shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all group"
              >
                <span>{isLoggedIn ? 'Open Dashboard' : 'Start 14-day free trial'}</span>
                <ArrowRight
                  size={17}
                  className="ml-2 group-hover:translate-x-0.5 transition-transform"
                />
              </button>

              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-[#0B0F14] text-sm font-sora font-semibold transition"
              >
                <Smartphone size={15} className="text-emerald-600" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            <p className="text-xs sm:text-sm font-medium text-[#374151] flex items-center gap-1.5">
              <span>Made with</span>
              <Heart size={14} className="text-[#FF7A00] fill-[#FF7A00]" />
              <span>in India</span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
