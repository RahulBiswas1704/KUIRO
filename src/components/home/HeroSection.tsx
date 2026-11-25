'use client';

import React, { useState } from 'react';
import { ArrowRight, Check, Mic, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { KuiroSymbol } from '@/components/brand/KuiroLogo';

/**
 * Clean, centered hero stage inspired by high-craft modern SaaS clarity (Zorcha aesthetic).
 * One clear message, one clear primary CTA, and one tactile WhatsApp phone preview flanked by 2 simple callouts.
 */
export default function HeroSection() {
  const { isLoggedIn, handleGetStarted } = useAuth();
  const [phoneState, setPhoneState] = useState<'pending' | 'revising' | 'approved'>('pending');
  const [offerApplied, setOfferApplied] = useState(false);

  const handleVoiceEdit = () => {
    setPhoneState('revising');
    setTimeout(() => {
      setOfferApplied(true);
      setPhoneState('pending');
    }, 1000);
  };

  return (
    <section className="relative bg-gradient-to-b from-[#667387] via-[#465163] to-[#232A38] overflow-hidden rounded-b-[28px] sm:rounded-b-[40px] flex flex-col items-center">
      {/* Soft warm atmospheric sun-horizon glow at base */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[780px] h-[360px] rounded-full bg-[#FF7A00]/25 blur-[110px]"
      />

      {/* Centered Headline & Primary Action */}
      <div className="relative z-20 flex flex-col items-center text-center pt-28 sm:pt-36 px-4 max-w-4xl mx-auto">
        <h1 className="font-sora text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-[-0.03em] text-white leading-[1.05]">
          Your Marketing.
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF9D42] via-[#FF7A00] to-[#FFB36B]">
            On Autopilot.
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-lg text-white/80 max-w-xl font-inter leading-relaxed font-normal">
          KUIRO creates your festival and daily posts, sends them to WhatsApp 48 hours early, and publishes everywhere automatically.
        </p>

        <button
          type="button"
          onClick={handleGetStarted}
          className="cursor-pointer mt-8 inline-flex items-center justify-center bg-white hover:bg-gray-50 text-[#0B0F14] font-sora font-bold text-sm sm:text-base rounded-2xl px-6 py-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.22)] hover:scale-[1.03] active:scale-[0.98] transition-all group"
        >
          <span>{isLoggedIn ? 'Open Dashboard' : 'Start for free'}</span>
          <ArrowRight size={17} className="ml-2 text-[#0B0F14] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Centered Tactile Phone Stage with 2 Clean Numbered Callouts */}
      <div className="relative z-20 w-full max-w-4xl mx-auto mt-10 sm:mt-14 px-4 flex justify-center items-end">
        {/* Callout 1 (Desktop Left) */}
        <div className="hidden md:flex flex-col items-end text-right mr-8 mb-36 max-w-[200px]">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-white text-[#0B0F14] font-sora font-extrabold text-xs flex items-center justify-center shadow-sm shrink-0">
              1
            </span>
            <span className="text-white text-sm font-medium leading-snug text-left">
              KUIRO drafts posts 48h early
            </span>
          </div>
          <svg
            aria-hidden="true"
            viewBox="0 0 110 42"
            fill="none"
            className="w-24 h-10 text-white/75 mt-1 mr-2"
          >
            <path
              d="M6 6 C 38 6, 72 18, 98 34"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeDasharray="4 4"
            />
            <path d="M90 35 L100 35 L96 26" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Clean Realistic Smartphone Frame */}
        <div className="w-full max-w-[330px] sm:max-w-[360px] rounded-t-[38px] bg-[#0B0F14] p-2.5 pb-0 border-x-[3px] border-t-[3px] border-[#1F2735] shadow-[0_-10px_50px_rgba(0,0,0,0.45)] translate-y-2">
          <div className="rounded-t-[30px] bg-[#ECE5DD] text-[#111B21] overflow-hidden">
            {/* Clean Notch */}
            <div className="bg-[#075E54] px-4 pt-3 pb-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0B0F14] flex items-center justify-center border border-white/20">
                  <KuiroSymbol size={16} />
                </div>
                <div className="text-left">
                  <p className="font-sora text-xs font-bold leading-tight flex items-center gap-1">
                    <span>KUIRO Assistant</span>
                    <CheckCircle2 size={11} className="text-emerald-300" />
                  </p>
                  <p className="text-[10px] text-white/75">WhatsApp Business</p>
                </div>
              </div>
              <span className="text-[10px] text-white/80 font-medium">Today</span>
            </div>

            {/* WhatsApp Chat Content */}
            <div className="p-3.5 pb-16 sm:pb-20 space-y-2.5 text-left">
              <div className="bg-white rounded-xl rounded-tl-none p-2.5 shadow-xs space-y-2 max-w-[94%]">
                {/* Crisp Miniature Festive Preview Card */}
                <div className="rounded-lg bg-gradient-to-br from-[#23140A] to-[#0B0F14] p-3 text-white space-y-1.5">
                  <div className="flex items-center justify-between text-[9px] text-[#FF9D42] font-semibold uppercase tracking-wider">
                    <span>Diwali Campaign</span>
                    <span>Thu 10:00 AM</span>
                  </div>
                  <p className="font-sora text-[13px] font-bold leading-snug">
                    {offerApplied
                      ? 'Flat 25% Off Festive Handloom Weaves ✨'
                      : 'Celebrate Diwali With Handcrafted Silk ✨'}
                  </p>
                  <p className="text-[10px] text-white/75">
                    Ready for Instagram, Facebook &amp; WhatsApp
                  </p>
                </div>

                <p className="text-[11px] text-[#111B21] leading-snug">
                  {phoneState === 'revising'
                    ? 'Listening to voice note...'
                    : phoneState === 'approved'
                    ? 'Scheduled! Your Diwali post will publish Thursday at 10:00 AM.'
                    : 'Your Diwali post goes live in 48 hours. Look good?'}
                </p>
              </div>

              {/* Clean Interactive Quick Reply Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPhoneState('approved')}
                  className={`py-2 px-2.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 shadow-xs transition cursor-pointer ${
                    phoneState === 'approved'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white hover:bg-gray-50 text-[#075E54]'
                  }`}
                >
                  <Check size={12} />
                  <span>{phoneState === 'approved' ? 'Approved' : 'Approve'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleVoiceEdit}
                  className="py-2 px-2.5 rounded-lg bg-white hover:bg-gray-50 text-[#111B21] text-[11px] font-semibold flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <Mic size={12} className="text-[#FF7A00]" />
                  <span>{offerApplied ? 'Edited' : 'Voice edit'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Callout 2 (Desktop Right) */}
        <div className="hidden md:flex flex-col items-start text-left ml-8 mb-32 max-w-[190px]">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-white text-[#0B0F14] font-sora font-extrabold text-xs flex items-center justify-center shadow-sm shrink-0">
              2
            </span>
            <span className="text-white text-sm font-medium leading-snug">
              Approve with one tap
            </span>
          </div>
          <svg
            aria-hidden="true"
            viewBox="0 0 100 42"
            fill="none"
            className="w-24 h-10 text-white/75 mt-1"
          >
            <path
              d="M90 6 C 58 6, 30 18, 8 34"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeDasharray="4 4"
            />
            <path d="M16 35 L6 35 L10 26" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Frosted Proof Glass Badge at Bottom Center */}
        <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
          <div className="px-5 py-1.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/50 shadow-lg">
            <span className="font-sora text-3xl sm:text-5xl font-extrabold text-white drop-shadow-sm">
              35+
            </span>
          </div>
          <div className="mt-2 px-4 py-1 rounded-full bg-white text-[#0B0F14] text-xs font-semibold shadow-md border border-gray-200 whitespace-nowrap">
            Indian Festivals Automated
          </div>
        </div>
      </div>
    </section>
  );
}
