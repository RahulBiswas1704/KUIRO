'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Smartphone,
  Clock,
  Send,
  ShieldCheck,
  CheckCircle2,
  Mic,
  ArrowRight,
  RefreshCw,
  Share2
} from 'lucide-react';
import Link from 'next/link';

interface TimelineStep {
  timeOffset: string;
  title: string;
  tag: string;
  icon: React.ElementType;
  description: string;
  highlight: string;
  badgeColor: string;
}

const steps: TimelineStep[] = [
  {
    timeOffset: 'T-48h (4:00 AM IST)',
    title: 'Cultural Calendar Trigger',
    tag: 'Automated Cron Engine',
    icon: Calendar,
    description: 'Inngest wakes up and scans the 365-day regional Indian calendar for festivals, holidays, or business milestones 2 days ahead.',
    highlight: 'Zero human intervention or calendar spreadsheets needed.',
    badgeColor: 'bg-orange-500/20 text-[#FF7A00] border-[#FF7A00]/30',
  },
  {
    timeOffset: 'T-47.8h (< 20 Seconds)',
    title: 'Brand Brain & AI Critic Synthesis',
    tag: 'Gemini 2.5 + Satori Compositor',
    icon: Sparkles,
    description: 'Synthesizes tailored copy across Instagram, LinkedIn, and X. Composites a high-DPI 2x2 contact sheet image. Evaluates AI Critic score.',
    highlight: 'Ensures AAA contrast ratio, exact brand hex colors, and zero banned claims.',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    timeOffset: 'T-47.5h',
    title: 'WhatsApp Utility Preview Delivered',
    tag: 'Meta Cloud API Card',
    icon: Smartphone,
    description: 'Founder receives a single WhatsApp utility card with the 2x2 multi-channel contact sheet and interactive quick-reply buttons.',
    highlight: 'Charges lowest utility conversation rate, saving 70% in messaging costs.',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    timeOffset: 'T-47.5h to T-0h',
    title: 'Passive Approval & Multilingual Voice Revisions',
    tag: 'Durable Event Wait Loop',
    icon: Clock,
    description: 'Founder can tap [Approve], send a voice note in Hindi/English ("Headline bold karo"), or simply ignore it. Silence = Consent!',
    highlight: 'Whisper/Gemini audio regenerates revisions in under 15 seconds.',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  {
    timeOffset: 'T-0h (Scheduled Peak Time)',
    title: 'Auto-Commit & Multi-Channel Broadcast',
    tag: 'Official Platform APIs',
    icon: Share2,
    description: 'KUIRO broadcasts natively to Instagram, LinkedIn, and X. X link surcharge guardrail automatically drops URLs into the first reply.',
    highlight: 'Zero link-post surcharges ($0.20/post saved). Receipt sent to WhatsApp.',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
];

export default function WorkflowTimeline() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/10">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-semibold mb-3">
          <Clock className="h-3.5 w-3.5" />
          The 48-Hour Protocol
        </div>
        <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight">
          How the Auto-Commit Loop Works in 5 Steps
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto mt-2 font-inter">
          A durable state machine designed for busy Indian founders who cannot afford to babysit marketing dashboards.
        </p>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="md:hidden text-center text-[10px] text-slate-500 font-mono mb-3">
        ← Swipe steps horizontally to explore protocol →
      </div>

      {/* Interactive Step Timeline Cards */}
      <div className="flex overflow-x-auto md:grid md:grid-cols-5 gap-3 mb-8 pb-3 md:pb-0 snap-x snap-mandatory scrollbar-none">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isSelected = activeStep === idx;
          return (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`p-4 rounded-[12px] text-left transition border flex flex-col justify-between min-w-[210px] md:min-w-0 snap-start shrink-0 md:shrink ${
                isSelected
                  ? 'bg-[#18202C] border-[#FF7A00] text-white shadow-lg shadow-[#FF7A00]/10 scale-102'
                  : 'bg-[#0B0F14] border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
              }`}
            >
              <div>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${s.badgeColor}`}>
                  {s.timeOffset}
                </span>
                <div className="flex items-center gap-2 mt-3">
                  <Icon size={16} className={isSelected ? 'text-[#FF7A00]' : 'text-gray-400'} />
                  <span className="font-sora font-bold text-xs text-white leading-tight">
                    {s.title}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-white/5 font-mono">
                Step {idx + 1} of 5
              </div>
            </button>
          );
        })}
      </div>

      {/* Step Spotlight Panel */}
      <div className="p-6 sm:p-8 rounded-[16px] bg-[#0B0F14] border border-white/15 relative overflow-hidden text-left shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${steps[activeStep].badgeColor}`}>
              {steps[activeStep].timeOffset}
            </span>
            <span className="text-xs text-gray-400 font-mono">• {steps[activeStep].tag}</span>
          </div>

          <h3 className="font-sora text-2xl font-bold text-white leading-snug">
            {steps[activeStep].title}
          </h3>

          <p className="text-sm text-slate-300 font-inter leading-relaxed">
            {steps[activeStep].description}
          </p>

          <div className="p-4 rounded-[10px] bg-[#111620] border border-white/10 flex items-start gap-3 text-xs text-gray-200 font-inter">
            <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Why it matters: </strong>
              <span>{steps[activeStep].highlight}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-4">
            <Link
              href="/dashboard/simulator"
              className="px-4 py-2.5 rounded-[10px] bg-[#FF7A00] text-white text-xs font-semibold hover:bg-[#E66E00] transition flex items-center gap-1.5 shadow-sm"
            >
              <span>Test This Step in Simulator</span>
              <ArrowRight size={14} />
            </Link>
            <span className="text-xs text-gray-400">
              Deterministic Inngest State Machine
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

