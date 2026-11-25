'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const FOUNDER_REVIEWS = [
  {
    handle: '@kolkatachai.co',
    role: 'Retail Cafe • 85K',
    quote:
      'We used to miss half our seasonal launches because creating regional graphics took days. Now KUIRO texts us on WhatsApp and we approve over tea.',
  },
  {
    handle: '@fabsaree_surat',
    role: 'Handloom D2C • 140K',
    quote:
      'The Hindi and Bengali typography actually looks clean and festive—never garbled like normal AI tools. Saved us an entire ₹40,000 agency retainer.',
  },
  {
    handle: '@auraderm.clinic',
    role: 'Dermatology Practice • 42K',
    quote:
      'Zero complicated logins. I record a 5-second Hindi voice note when I want a price tweak, and the updated post is ready before I see my next patient.',
  },
];

const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthly: '1,199',
    annual: '999',
    summary: 'For solo founders, creators & neighborhood stores.',
    cta: 'Start 14-day free trial',
    popular: false,
    items: [
      '1 Brand profile',
      '15 scheduled posts / month',
      'WhatsApp 48h approval card',
      'Instagram & Facebook publishing',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    monthly: '2,799',
    annual: '2,299',
    summary: 'Complete autopilot with voice revisions & shared inbox.',
    cta: 'Start Growth free trial',
    popular: true,
    items: [
      'Up to 3 Brand profiles',
      'Unlimited festival & daily calendar',
      'WhatsApp voice note revisions',
      'YouTube Shorts, LinkedIn, X & Email',
      'Unified customer inbox + auto-replies',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    monthly: '11,999',
    annual: '9,999',
    summary: 'For marketing agencies & multi-branch brands.',
    cta: 'Start Agency trial',
    popular: false,
    items: [
      'Up to 15 client workspaces',
      'Team member roles & email invites',
      'Print-ready Creative Kit ZIP export',
      'Dedicated WhatsApp Cloud onboarding',
    ],
  },
];

/**
 * Clean light editorial At-a-Glance callout, real-feeling founder proof cards, and simple Pricing grid.
 */
export default function SocialProofAndPricing() {
  const { handleGetStarted } = useAuth();
  const [period, setPeriod] = useState<'monthly' | 'annual'>('annual');

  return (
    <div className="bg-[#F9FAFD] text-[#0B0F14]">
      {/* AT A GLANCE + TESTIMONIALS */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-200/70">
        <div className="max-w-6xl mx-auto flex flex-col items-center space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-block px-6 py-2 rounded-full bg-white border border-gray-200 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.12)] text-sm font-semibold text-[#0B0F14]">
              At a Glance
            </div>
            <h2 className="font-sora text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0B0F14] tracking-tight">
              40+ hours saved{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] to-[#E85D04]">
                every month
              </span>
            </h2>
            <p className="text-base sm:text-lg text-[#4B5563] font-medium max-w-xl mx-auto font-inter">
              Trusted by Indian stores, clinics, creators, and growing teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
            {FOUNDER_REVIEWS.map((rev) => (
              <article
                key={rev.handle}
                className="rounded-2xl bg-white border border-gray-200 p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.08)]"
              >
                <p className="text-sm text-[#1F2937] font-inter leading-relaxed">
                  &ldquo;{rev.quote}&rdquo;
                </p>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-sora font-bold text-[#0B0F14]">{rev.handle}</span>
                  <span className="text-gray-500 font-medium">{rev.role}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SIMPLE PRICING */}
      <section id="pricing" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-200/70">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="inline-block px-6 py-2 rounded-full bg-white border border-gray-200 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.12)] text-sm font-semibold text-[#0B0F14] mb-6">
            Pricing
          </div>

          <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-center text-[#0B0F14] tracking-tight">
            Simple pricing. Cancel anytime.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#4B5563] font-inter text-center">
            Every plan starts with a free 14-day trial and automatic GST tax invoices.
          </p>

          {/* Clean Toggle */}
          <div className="mt-7 inline-flex p-1 rounded-full bg-gray-200/70 border border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-1.5 rounded-full font-semibold transition cursor-pointer ${
                period === 'monthly' ? 'bg-white text-[#0B0F14] shadow-xs' : 'text-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setPeriod('annual')}
              className={`px-4 py-1.5 rounded-full font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                period === 'annual' ? 'bg-white text-[#0B0F14] shadow-xs' : 'text-gray-600'
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF7A00] text-white font-bold">
                20% OFF
              </span>
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-[24px] bg-white p-7 sm:p-8 flex flex-col justify-between space-y-6 relative ${
                  plan.popular
                    ? 'border-2 border-[#FF7A00] shadow-[0_20px_48px_-20px_rgba(255,122,0,0.22)]'
                    : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-7 px-3 py-0.5 rounded-full bg-[#FF7A00] text-white text-[11px] font-bold">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <h3 className="font-sora text-lg font-bold text-[#0B0F14]">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-sora text-4xl font-extrabold text-[#0B0F14]">
                      ₹{period === 'annual' ? plan.annual : plan.monthly}
                    </span>
                    <span className="text-xs text-gray-500">/ month</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4B5563] font-inter">{plan.summary}</p>

                  <ul className="space-y-2.5 pt-3 border-t border-gray-100 text-xs sm:text-sm text-[#1F2937]">
                    {plan.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check
                          size={15}
                          className={`shrink-0 mt-0.5 ${plan.popular ? 'text-[#FF7A00]' : 'text-emerald-600'}`}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleGetStarted}
                  className={`w-full py-3 rounded-xl text-xs sm:text-sm font-sora font-semibold transition cursor-pointer ${
                    plan.popular
                      ? 'bg-[#FF7A00] hover:bg-[#E06C00] text-white'
                      : 'bg-[#0B0F14] hover:bg-[#1F2937] text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
