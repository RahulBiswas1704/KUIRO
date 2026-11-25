'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle2, Globe2, MessageSquare, Smartphone } from 'lucide-react';

interface ProcessStep {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  previewBadge: string;
  previewHeadline: string;
  previewBody: string;
  previewNote: string;
}

const STEPS: ProcessStep[] = [
  {
    id: 0,
    title: 'Add your business',
    subtitle: 'Share your website or store name once.',
    icon: Globe2,
    previewBadge: 'Step 1 • Brand Setup',
    previewHeadline: 'KUIRO learns your logo, brand colors, and writing style automatically',
    previewBody:
      'Enter your website or Instagram handle. KUIRO extracts your visual identity so every future post looks uniquely yours—not generic AI.',
    previewNote: 'Takes under 60 seconds • One-time setup',
  },
  {
    id: 1,
    title: 'Pick your festivals',
    subtitle: 'Choose local & national dates that matter.',
    icon: Calendar,
    previewBadge: 'Step 2 • Cultural Calendar',
    previewHeadline: '35+ regional & national celebrations pre-loaded on your schedule',
    previewBody:
      'Diwali, Durga Puja, Eid, Pongal, Onam, Poila Boishakh—your campaigns draft days early in English, Hindi, Bengali, or Tamil.',
    previewNote: 'Tailored to your city & industry',
  },
  {
    id: 2,
    title: 'Review on WhatsApp',
    subtitle: 'Approve or voice-edit 48 hours early.',
    icon: Smartphone,
    previewBadge: 'Step 3 • WhatsApp Review',
    previewHeadline: 'Check your upcoming post over morning chai without opening any app',
    previewBody:
      '48 hours before launch, KUIRO texts your post preview to WhatsApp. Tap Approve, or reply with a quick Hindi/English voice note.',
    previewNote: 'Silence means go • Auto-publishes on schedule',
  },
  {
    id: 3,
    title: 'Publish & convert',
    subtitle: 'Go live everywhere and chat with buyers.',
    icon: MessageSquare,
    previewBadge: 'Step 4 • Live Growth',
    previewHeadline: 'Posts publish to every channel & inquiries land in one calm inbox',
    previewBody:
      'Instagram, Facebook, YouTube Shorts, LinkedIn, and X stay updated while customer DMs and WhatsApp replies are answered automatically.',
    previewNote: 'All customer conversations in one place',
  },
];

/**
 * 4-Step Horizontal Progress Stepper inspired by zorcha.com's clean light Process section.
 */
export default function ProcessStepsSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const currentStep = STEPS[activeIdx];

  return (
    <section
      id="how-it-works"
      className="relative py-20 sm:py-28 bg-white rounded-t-[36px] sm:rounded-t-[56px] border-t border-[#EFE8DF] overflow-hidden"
    >
      {/* Subtle warm top glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[240px] rounded-full bg-[#FF7A00]/[0.06] blur-[90px]"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Clean Pill Header */}
        <div className="px-6 py-2 rounded-full bg-white border border-gray-200 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.12)] text-sm sm:text-base font-semibold text-[#0B0F14] mb-6">
          Process
        </div>

        <h2 className="font-sora text-3xl sm:text-5xl lg:text-6xl font-extrabold text-center text-[#0B0F14] tracking-tight leading-[1.1] max-w-3xl">
          How KUIRO puts your marketing on{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] to-[#E85D04]">
            autopilot
          </span>
        </h2>

        <p className="mt-5 text-base sm:text-xl text-[#4B5563] font-medium text-center max-w-xl font-inter">
          Set it up once in two minutes. Let KUIRO handle every week after.
        </p>

        {/* Clean 4-Column Stepper Track */}
        <ol className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-14 sm:mt-16">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === activeIdx;
            return (
              <li key={step.id} className="flex">
                <button
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  aria-current={isActive ? 'step' : undefined}
                  className="w-full flex flex-col justify-between text-left cursor-pointer group"
                >
                  <div>
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition ${
                        isActive
                          ? 'bg-[#FF7A00] text-white'
                          : 'bg-[#FAF5F0] text-[#FF7A00] group-hover:bg-[#FFF0E0]'
                      }`}
                    >
                      <Icon size={17} />
                    </div>
                    <h3
                      className={`font-sora text-base sm:text-lg font-bold transition ${
                        isActive ? 'text-[#0B0F14]' : 'text-[#0B0F14]/60 group-hover:text-[#0B0F14]'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`text-xs sm:text-sm mt-1.5 font-inter leading-relaxed transition ${
                        isActive ? 'text-[#374151]' : 'text-gray-500'
                      }`}
                    >
                      {step.subtitle}
                    </p>
                  </div>

                  {/* Horizontal Progress Track Underline */}
                  <div className="pt-4 w-full">
                    <div className="w-full h-1 rounded-full bg-[#F1E8DF] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isActive ? 'w-full bg-[#FF7A00]' : 'w-0 bg-[#FF7A00]'
                        }`}
                      />
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Spacious Uncluttered Active Step Preview Card */}
        <div className="mt-10 w-full rounded-[28px] bg-[#FAF9F6] border border-[#E9E2D8] p-6 sm:p-10 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.1)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
            <div className="md:col-span-7 space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-semibold text-[#FF7A00]">
                {currentStep.previewBadge}
              </span>
              <h4 className="font-sora text-2xl sm:text-3xl font-extrabold text-[#0B0F14] leading-snug">
                {currentStep.previewHeadline}
              </h4>
              <p className="text-sm sm:text-base text-[#4B5563] font-inter leading-relaxed">
                {currentStep.previewBody}
              </p>
              <p className="text-xs font-medium text-emerald-700 flex items-center gap-1.5 pt-1">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>{currentStep.previewNote}</span>
              </p>
            </div>

            {/* Visual Artifact matching current step calmly */}
            <div className="md:col-span-5 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              {activeIdx === 0 && (
                <>
                  <p className="text-xs font-medium text-gray-500">Your store details</p>
                  <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-[#0B0F14]">
                    sharmaheritage.in
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="w-6 h-6 rounded-full bg-[#FF7A00] border border-black/10" />
                    <span className="w-6 h-6 rounded-full bg-[#0B0F14] border border-black/10" />
                    <span className="w-6 h-6 rounded-full bg-[#FAF5F0] border border-gray-300" />
                    <span className="text-xs text-gray-600 ml-1">Brand colors synced</span>
                  </div>
                </>
              )}

              {activeIdx === 1 && (
                <div className="space-y-2 text-xs">
                  <p className="font-medium text-gray-500">Upcoming Celebrations</p>
                  {['Diwali & Dhanteras', 'Durga Puja', 'Eid al-Fitr', 'Pongal'].map((fest) => (
                    <div
                      key={fest}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#EFE6DC]"
                    >
                      <span className="font-semibold text-[#0B0F14]">{fest}</span>
                      <span className="text-emerald-700 font-medium">Auto-scheduled</span>
                    </div>
                  ))}
                </div>
              )}

              {activeIdx === 2 && (
                <div className="space-y-2.5 text-xs">
                  <p className="font-medium text-gray-500">WhatsApp Preview Card</p>
                  <div className="p-3 rounded-xl bg-[#ECE5DD] text-[#111B21] space-y-2">
                    <p className="font-medium">Your Holi Greeting Post is ready for Friday 10 AM.</p>
                    <div className="flex gap-2">
                      <span className="px-2.5 py-1 rounded bg-white text-[#075E54] font-semibold">
                        ✓ Approve
                      </span>
                      <span className="px-2.5 py-1 rounded bg-white text-gray-700 font-medium">
                        🎙️ Edit
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeIdx === 3 && (
                <div className="space-y-2 text-xs">
                  <p className="font-medium text-gray-500">Published Across Channels</p>
                  {['Instagram & Facebook', 'WhatsApp Customers', 'YouTube Shorts', 'LinkedIn & X'].map((ch) => (
                    <div
                      key={ch}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50/60 border border-emerald-200/70"
                    >
                      <span className="font-semibold text-[#0B0F14]">{ch}</span>
                      <span className="text-emerald-700 font-semibold">Live ✓</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
