'use client';

import React from 'react';
import { Check, MessageCircle, Sparkles } from 'lucide-react';

/**
 * Bright, Warm Editorial "Gains" Section inspired directly by zorcha.com's spacious light bento.
 * Soft peach/amber atmosphere behind 3 clean bordered cards with clear human copy and gentle visual mocks.
 */
export default function GainsBentoSection() {
  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#F9FAFD]">
      {/* Subtle warm ambient glows behind white cards (matching Zorcha's light pastel atmosphere) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-44 left-1/2 -translate-x-1/2 w-[680px] h-[420px] rounded-full bg-gradient-to-tr from-[#FFE2C6]/70 via-[#FFF0E0]/60 to-[#E8ECFF]/50 blur-[90px]"
      />

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center">
        {/* Frosted Pill Header */}
        <div className="px-6 py-2 rounded-full bg-white border border-gray-200 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.12)] text-sm sm:text-base font-semibold text-[#0B0F14] mb-6">
          Gains
        </div>

        <h2 className="font-sora text-3xl sm:text-5xl lg:text-6xl font-extrabold text-center text-[#0B0F14] tracking-tight leading-[1.1] max-w-2xl">
          Show up for every moment —{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] to-[#E85D04]">
            effortlessly
          </span>
        </h2>

        <p className="mt-5 text-base sm:text-xl text-[#374151] font-medium text-center max-w-xl font-inter">
          Grow your customers — and reclaim 40 hours every month.
        </p>

        {/* Bento Grid (1 Full Width + 2 Side-by-Side) */}
        <div className="mt-12 sm:mt-16 w-full space-y-6">
          {/* Card 1: Full-Width Feature Card */}
          <div className="p-px rounded-[26px] bg-gradient-to-b from-[#FF8E3C]/55 via-[#FF8E3C]/15 to-transparent">
            <div className="bg-white rounded-[25px] p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left overflow-hidden">
              <div className="lg:col-span-5 space-y-3">
                <h3 className="font-sora text-2xl sm:text-4xl font-extrabold text-[#0B0F14] leading-tight">
                  Never miss a festive rush again
                </h3>
                <p className="text-sm sm:text-base text-[#4B5563] font-inter leading-relaxed">
                  Diwali, Durga Puja, Eid, Pongal—KUIRO spots important cultural dates early and prepares studio-grade creatives in Hindi, Bengali, Tamil, and English.
                </p>
              </div>

              {/* Clean calm "Before vs After" curve */}
              <div className="lg:col-span-7 relative pt-4">
                <div className="rounded-2xl bg-[#FAF9F6] border border-gray-200/80 p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                    <span>Monthly Audience Reach</span>
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                      After KUIRO
                    </span>
                  </div>
                  <svg viewBox="0 0 460 130" className="w-full h-32 overflow-visible" aria-hidden="true">
                    <defs>
                      <linearGradient id="kuiroGrowthFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#FF7A00" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Baseline before KUIRO */}
                    <path
                      d="M 10 108 Q 95 104, 170 110 T 260 105"
                      fill="none"
                      stroke="#D1D5DB"
                      strokeWidth="2.5"
                      strokeDasharray="5 5"
                    />
                    {/* Area + Rising curve after KUIRO */}
                    <path
                      d="M 220 98 C 275 94, 315 62, 360 44 C 398 28, 425 22, 448 16 L 448 122 L 220 122 Z"
                      fill="url(#kuiroGrowthFill)"
                    />
                    <path
                      d="M 220 98 C 275 94, 315 62, 360 44 C 398 28, 425 22, 448 16"
                      fill="none"
                      stroke="#FF7A00"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <circle cx="448" cy="16" r="5" fill="#FF7A00" />
                  </svg>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200/70">
                    <span>Inconsistent posting before</span>
                    <span className="font-semibold text-[#0B0F14]">Steady festive &amp; weekly momentum</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cards 2 & 3: Two Side-by-Side Light Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 2 */}
            <div className="p-px rounded-[26px] bg-gradient-to-b from-[#FF8E3C]/55 via-[#FF8E3C]/15 to-transparent">
              <div className="bg-white rounded-[25px] p-7 sm:p-9 h-full flex flex-col justify-between space-y-6 text-left">
                <div className="space-y-3">
                  <h3 className="font-sora text-2xl sm:text-3xl font-extrabold text-[#0B0F14] leading-tight">
                    Approve on WhatsApp in 5 seconds
                  </h3>
                  <p className="text-sm sm:text-base text-[#4B5563] font-inter leading-relaxed">
                    No complex tools to learn. Your upcoming campaign lands on WhatsApp 48 hours early—just tap Approve or reply with a voice note.
                  </p>
                </div>

                {/* Light Simple Chat Visual */}
                <div className="rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0B0F14] flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#FF7A00]" />
                      <span>Diwali Post Preview</span>
                    </span>
                    <span className="text-[11px] text-gray-500">48h before live</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-gray-200/80 text-xs text-gray-700">
                    &ldquo;Flat 20% festive greeting card ready for Instagram &amp; Facebook. Publish Thursday 10 AM?&rdquo;
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#0B0F14] text-white text-[11px] font-semibold">
                      <Check size={12} className="text-[#FF7A00]" />
                      <span>Approve Now</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 text-[11px] font-medium">
                      Request Edit
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-px rounded-[26px] bg-gradient-to-b from-[#FF8E3C]/55 via-[#FF8E3C]/15 to-transparent">
              <div className="bg-white rounded-[25px] p-7 sm:p-9 h-full flex flex-col justify-between space-y-6 text-left">
                <div className="space-y-3">
                  <h3 className="font-sora text-2xl sm:text-3xl font-extrabold text-[#0B0F14] leading-tight">
                    Turn replies into real buyers
                  </h3>
                  <p className="text-sm sm:text-base text-[#4B5563] font-inter leading-relaxed">
                    Every WhatsApp, Instagram DM, and email inquiry flows into one simple inbox with automatic answers for pricing and bookings.
                  </p>
                </div>

                {/* Light Clean Customer Conversation Visual */}
                <div className="rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] p-4 space-y-2.5 text-xs">
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200/80 rounded-2xl rounded-tl-sm px-3.5 py-2 text-[#0B0F14] max-w-[82%]">
                      Hi! Can I get pricing for 25 festive gift hampers?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-[#0B0F14] text-white rounded-2xl rounded-tr-sm px-3.5 py-2 max-w-[85%] flex items-start gap-1.5">
                      <MessageCircle size={13} className="text-[#FF7A00] shrink-0 mt-0.5" />
                      <span>
                        Here&apos;s our festive catalog! Reply BOOK and our team will confirm your order today.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
