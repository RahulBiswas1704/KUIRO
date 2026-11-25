'use client';

import React, { useState } from 'react';
import { ArrowRight, ChevronDown, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const FAQS = [
  {
    q: 'Do I really never need to log into a dashboard?',
    a: 'Yes. 48 hours before any scheduled post or Indian festival, KUIRO sends a complete preview directly to your WhatsApp. Tap Approve, send a voice note to change something, or let it publish automatically at peak hours.',
  },
  {
    q: 'Does it support Hindi, Bengali, and Tamil cleanly?',
    a: 'Yes. KUIRO uses official Google Noto fonts rendered cleanly onto each visual so Hindi, Bengali, Tamil, and English captions look crisp with zero broken characters.',
  },
  {
    q: 'How does editing over WhatsApp voice note work?',
    a: 'Reply to your WhatsApp preview card with a quick voice note in Hinglish, Hindi, Bengali, or English—for example, changing a discount offer or headline. KUIRO updates your post in seconds.',
  },
  {
    q: 'Is KUIRO safe for my Instagram, Facebook, and YouTube accounts?',
    a: 'Yes. KUIRO connects exclusively through official platform approvals (Meta, Google, LinkedIn, and X)—never unofficial scripts or password sharing.',
  },
  {
    q: 'Can I get a GST invoice and cancel anytime?',
    a: 'Yes. Every subscription via Razorpay generates an automatic 18% GST invoice with your company GSTIN, and there are zero contracts or lock-in fees.',
  },
];

/**
 * Warm Cream FAQ Accordion + Zorcha-style Warm Editorial Closing CTA banner above light Footer.
 */
export default function FaqAndFooterCta() {
  const { isLoggedIn, handleGetStarted } = useAuth();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <>
      {/* FAQ SECTION */}
      <section id="faq" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6] border-t border-gray-200/70">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <div className="inline-block px-6 py-2 rounded-full bg-white border border-gray-200 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.12)] text-sm font-semibold text-[#0B0F14] mb-6">
            FAQ
          </div>

          <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-center text-[#0B0F14] tracking-tight mb-12">
            Common questions about KUIRO
          </h2>

          <ul className="w-full space-y-3.5 text-left">
            {FAQS.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <li
                  key={item.q}
                  className="bg-[#FFF8F1] rounded-2xl border border-[#F0DFCF] overflow-hidden"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <h3 className="font-sora text-sm sm:text-base font-semibold text-[#0B0F14]">
                      {item.q}
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
                      {item.a}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* WARM EDITORIAL CLOSING CTA */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAF9F6] to-[#F5F2EB] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-sora text-4xl sm:text-6xl font-extrabold text-[#0B0F14] tracking-tight leading-[1.1]">
            Your marketing. <br />
            Handled every day.
          </h2>

          <p className="text-base sm:text-lg text-[#374151] max-w-xl mx-auto font-inter font-medium">
            Join businesses, clinics, and creators across India growing consistently with KUIRO.
          </p>

          <div className="pt-2 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={handleGetStarted}
              className="cursor-pointer inline-flex items-center justify-center bg-[#0B0F14] hover:bg-[#1F2937] text-white font-sora font-bold text-sm sm:text-base rounded-2xl px-7 py-3.5 shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all group"
            >
              <span>{isLoggedIn ? 'Open Dashboard' : 'Start for free'}</span>
              <ArrowRight size={17} className="ml-2 group-hover:translate-x-0.5 transition-transform" />
            </button>

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
