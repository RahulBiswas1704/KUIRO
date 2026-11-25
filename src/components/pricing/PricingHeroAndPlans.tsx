'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import type { PlanTier } from '@/components/billing/SubscriptionCheckoutModal';

interface PricingHeroAndPlansProps {
  annualBilling: boolean;
  onChangeBilling: (annual: boolean) => void;
  onSelectTier: (tier: PlanTier) => void;
}

const PLAN_CARDS: Array<{
  tier: PlanTier;
  badge: string;
  name: string;
  desc: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  annualSavings?: string;
  popular?: boolean;
  cta: string;
  footnote: string;
  leadIn: string;
  features: string[];
}> = [
  {
    tier: 'STARTER',
    badge: 'Solo Founders & Clinics',
    name: 'Starter',
    desc: 'For solo creators, independent consultants, and neighborhood businesses starting consistent posting.',
    monthlyPrice: 1199,
    annualMonthlyPrice: 999,
    cta: 'Start Starter trial',
    footnote: '14 days free · Cancel anytime',
    leadIn: 'Included in Starter:',
    features: [
      '1 Brand workspace with persistent Brand Brain',
      '3 connected social channels (IG, FB, LinkedIn or X)',
      '15 automated posts / month with high-DPI visuals',
      '2,500 monthly branded email newsletters',
      'WhatsApp 48-hour 1-tap review cards',
      '1-seat WhatsApp inbox with 2 auto-reply rules',
      'Major national & cultural holiday triggers',
    ],
  },
  {
    tier: 'GROWTH',
    badge: 'Growing Businesses & D2C',
    name: 'Growth Autopilot',
    desc: 'Complete 8-engine marketing autopilot replacing costly monthly agency retainers.',
    monthlyPrice: 2799,
    annualMonthlyPrice: 2299,
    annualSavings: 'Save ₹6,000/yr',
    popular: true,
    cta: 'Start Growth Autopilot',
    footnote: 'UPI Autopay / Cards · 18% GST invoice included',
    leadIn: 'Everything in Starter, plus:',
    features: [
      'Up to 3 Brand profiles (Business + Founder brand)',
      'All channels active (IG, FB, Shorts, LinkedIn, X)',
      'Unlimited 365-day calendar + 35+ regional festivals',
      'WhatsApp voice-note edits in Hindi & English (< 12s)',
      'Live Campaign ROI & WhatsApp lead attribution',
      '1-click Creative Kit ZIP export (1080p TV, Web, SOP)',
      'Pre-shaped Bengali, Devanagari & Tamil typography',
      'X first-reply link guardrail + 15,000 emails / mo',
      '5-seat shared inbox with AI drafts & auto-replies',
    ],
  },
  {
    tier: 'AGENCY',
    badge: 'Agencies & Multi-Branch',
    name: 'Agency / Scale',
    desc: 'Built for boutique agencies and multi-location franchises managing multiple client brands.',
    monthlyPrice: 11999,
    annualMonthlyPrice: 9999,
    annualSavings: 'Save ₹24,000/yr',
    cta: 'Activate Agency Plan',
    footnote: 'Custom onboarding & SLA included',
    leadIn: 'Everything in Growth, plus:',
    features: [
      '10 isolated client workspaces (scale to 50+)',
      'Agency sender branding on WhatsApp approval loops',
      'Dedicated background publishing queues',
      'Vertical Reels & Shorts creative support',
      '100,000 monthly branded emails + custom domain',
      'Unlimited inbox seats & multi-client routing',
      'Dedicated account onboarding & priority SLA',
    ],
  },
];

/**
 * Framed Dusk-Slate Hero Stage + Zorcha-inspired Light Editorial 3-Tier Pricing Grid.
 */
export default function PricingHeroAndPlans({
  annualBilling,
  onChangeBilling,
  onSelectTier,
}: PricingHeroAndPlansProps) {
  return (
    <>
      {/* FRAMED DUSK HERO */}
      <section className="relative bg-gradient-to-b from-[#667387] via-[#465163] to-[#232A38] overflow-hidden rounded-b-[28px] sm:rounded-b-[40px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[780px] h-[340px] rounded-full bg-[#FF7A00]/25 blur-[110px]"
        />

        <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-14 sm:pb-20 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs text-white/90 font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
            <span>14-Day Free Trial • No Credit Card Required</span>
          </div>

          <h1 className="font-sora text-4xl sm:text-6xl lg:text-[64px] font-extrabold tracking-[-0.03em] text-white leading-[1.06]">
            Simple Pricing.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF9D42] via-[#FF7A00] to-[#FFB36B]">
              Zero Agency Retainers.
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-lg text-white/80 max-w-xl font-inter leading-relaxed">
            Replace ₹45,000–₹1,00,000/mo agency fees with your always-on marketing assistant on
            WhatsApp. Automatic 18% GST invoices on every plan.
          </p>

          {/* Clean Billing Cycle Switcher */}
          <div className="mt-8 inline-flex p-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs">
            <button
              type="button"
              onClick={() => onChangeBilling(false)}
              className={`cursor-pointer px-5 py-2 rounded-full font-sora font-semibold transition ${
                !annualBilling
                  ? 'bg-white text-[#0B0F14] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => onChangeBilling(true)}
              className={`cursor-pointer px-5 py-2 rounded-full font-sora font-semibold transition flex items-center gap-2 ${
                annualBilling
                  ? 'bg-white text-[#0B0F14] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-[#FF7A00] text-white text-[10px] font-bold">
                2 Months Free
              </span>
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/75 font-inter">
            <span>✓ 14-day full access</span>
            <span>✓ Zero setup charges</span>
            <span>✓ Instant WhatsApp setup</span>
            <span>✓ GST tax invoice included</span>
          </div>
        </div>
      </section>

      {/* THREE LIGHT EDITORIAL PRICING CARDS */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F9FAFD] overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 w-[720px] h-[380px] rounded-full bg-gradient-to-tr from-[#FFE2C6]/65 via-[#FFF0E0]/55 to-[#E8ECFF]/45 blur-[95px]"
        />

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
          {PLAN_CARDS.map((plan) => {
            const displayPrice = annualBilling ? plan.annualMonthlyPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.tier}
                className={`rounded-[26px] bg-white p-7 sm:p-8 flex flex-col justify-between relative text-left transition ${
                  plan.popular
                    ? 'border-2 border-[#FF7A00] shadow-[0_24px_54px_-22px_rgba(255,122,0,0.28)]'
                    : 'border border-gray-200 shadow-[0_12px_32px_-20px_rgba(15,23,42,0.12)]'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-7 px-3.5 py-1 rounded-full bg-[#FF7A00] text-white text-[11px] font-bold shadow-sm">
                    Most Popular • Full Autopilot
                  </span>
                )}

                <div className="space-y-5">
                  <div>
                    <span
                      className={`text-[11px] font-semibold block ${
                        plan.popular ? 'text-[#FF7A00]' : 'text-gray-500'
                      }`}
                    >
                      {plan.badge}
                    </span>
                    <h2 className="font-sora text-2xl font-extrabold text-[#0B0F14] mt-1">
                      {plan.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#4B5563] font-inter mt-1.5 leading-relaxed">
                      {plan.desc}
                    </p>
                  </div>

                  {/* Price Lockup */}
                  <div className="pt-4 pb-5 border-y border-gray-100 flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-1">
                      <span className="font-sora text-4xl sm:text-5xl font-extrabold text-[#0B0F14] tabular-nums tracking-tight">
                        ₹{displayPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-gray-500 font-inter">/ mo</span>
                    </div>
                    <span
                      className={`text-[11px] font-semibold tabular-nums ${
                        annualBilling && plan.annualSavings ? 'text-emerald-700' : 'text-gray-500'
                      }`}
                    >
                      {annualBilling
                        ? plan.annualSavings || `₹${(displayPrice * 12).toLocaleString('en-IN')}/yr`
                        : 'Billed monthly'}
                    </span>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-3 text-xs sm:text-sm text-[#1F2937] font-inter">
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wider block ${
                        plan.popular ? 'text-[#FF7A00]' : 'text-gray-500'
                      }`}
                    >
                      {plan.leadIn}
                    </span>
                    <ul className="space-y-2.5">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5">
                          <Check
                            size={15}
                            className={`shrink-0 mt-0.5 ${
                              plan.popular ? 'text-[#FF7A00]' : 'text-emerald-600'
                            }`}
                          />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => onSelectTier(plan.tier)}
                    className={`cursor-pointer w-full py-3.5 rounded-2xl text-xs sm:text-sm font-sora font-bold transition flex items-center justify-center gap-2 group ${
                      plan.popular
                        ? 'bg-[#FF7A00] hover:bg-[#E06C00] text-white shadow-sm'
                        : 'bg-[#0B0F14] hover:bg-[#1F2937] text-white'
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {plan.tier === 'AGENCY' ? (
                    <Link
                      href="/contact"
                      className="block text-center text-[11px] text-gray-500 hover:text-[#0B0F14] font-medium transition pt-0.5"
                    >
                      Or talk to Agency Sales →
                    </Link>
                  ) : (
                    <p className="text-[11px] text-center text-gray-500">{plan.footnote}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
