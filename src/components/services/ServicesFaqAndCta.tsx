'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const SERVICE_FAQS = [
  {
    q: 'How does KUIRO stop posts from sounding like generic AI copy?',
    a: 'KUIRO indexes your real website, offerings, prices, and brand tone into your workspace Brand Brain before drafting anything. Every post is reviewed against strict negative guardrails—never invented offers or exaggerated medical claims.',
  },
  {
    q: 'Do I really not have to open a dashboard every week?',
    a: 'Yes. Upcoming festival and weekly campaigns are sent straight to your WhatsApp 48 hours in advance. You can tap Approve, send a quick Hindi/Bengali/English voice note for edits, or let it auto-publish on schedule.',
  },
  {
    q: 'How are Hindi, Bengali, and Tamil graphics kept crisp without Canva?',
    a: 'Instead of asking an image model to spell words, KUIRO renders clean Google Noto Indic typography programmatically on high-DPI canvases with your exact logo SVG and brand hex palette.',
  },
  {
    q: 'Why does KUIRO move links to the first reply on X (Twitter)?',
    a: 'Posting external links in the main post can reduce organic visibility on X. KUIRO keeps your main visual post clean and automatically replies with your link underneath.',
  },
  {
    q: 'Can agencies manage multiple client brands under one login?',
    a: 'Yes. Agency plans include isolated client workspaces—each with its own Brand Brain, social connections, WhatsApp approval contact, and team access permissions.',
  },
];

/**
 * Warm Cream FAQ Accordion + Editorial Closing CTA matching the redesigned Homepage.
 */
export default function ServicesFaqAndCta() {
  const { isLoggedIn, handleGetStarted } = useAuth();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <>
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6] border-t border-gray-200/70">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <div className="inline-block px-6 py-2 rounded-full bg-white border border-gray-200 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.12)] text-sm font-semibold text-[#0B0F14] mb-6">
            FAQ
          </div>

          <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-center text-[#0B0F14] tracking-tight mb-12">
            Common questions about our engines
          </h2>

          <ul className="w-full space-y-3.5 text-left">
            {SERVICE_FAQS.map((faq, idx) => {
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
            Ready to put all 8 engines <br />
            to work for you?
          </h2>

          <p className="text-base sm:text-lg text-[#374151] max-w-xl mx-auto font-inter font-medium">
            Try KUIRO free for 14 days—scan your brand website, pick your local festivals, and receive
            your first WhatsApp preview card in minutes.
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

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-[#0B0F14] text-sm font-sora font-semibold transition"
              >
                View Pricing
              </Link>
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
