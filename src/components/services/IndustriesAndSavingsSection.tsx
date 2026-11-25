'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Briefcase, Stethoscope, Store, UserCheck } from 'lucide-react';

const BUSINESS_VERTICALS = [
  {
    title: 'Retail Stores & Showrooms',
    niche: 'Handlooms, Jewelry, Boutiques & Electronics',
    desc: 'Turn local and regional festivals into walk-in traffic with in-store TV counter graphics, bilingual festive posts, and staff offer codes.',
    icon: Store,
    badge: 'Online + Showroom',
    outcome: 'Showroom displays & social in sync',
  },
  {
    title: 'D2C Brands & Creators',
    niche: 'Artisanal Food, Beauty, Coffee & Apparel',
    desc: 'Zero tool fatigue. Connect your website once, review upcoming festive drops on WhatsApp over chai, and edit with a voice note.',
    icon: UserCheck,
    badge: 'Founder-First',
    outcome: 'Minutes per week instead of hours',
  },
  {
    title: 'Clinics & Medical Practices',
    niche: 'Dermatology, Dental, Diagnostics & Wellness',
    desc: 'Respectful clinical tone, doctor credential consistency, health awareness days, and a calm WhatsApp & Instagram patient inbox.',
    icon: Stethoscope,
    badge: 'ASCI Guardrails',
    outcome: 'Zero unverified claim risks',
  },
  {
    title: 'Marketing Agencies & Franchises',
    niche: 'Studios & Multi-Branch Operators',
    desc: 'Separate workspaces per brand with isolated brand memory, role-based team invites, and 48-hour client approval loops that scale.',
    icon: Briefcase,
    badge: 'Multi-Workspace',
    outcome: 'Scale clients without extra headcount',
  },
];

/**
 * Light Editorial Industries Bento Grid + Interactive Agency Retainer Savings Calculator.
 */
export default function IndustriesAndSavingsSection() {
  const [monthlySpend, setMonthlySpend] = useState<number>(35000);
  const growthTierCost = 2799;
  const monthlySavings = Math.max(0, monthlySpend - growthTierCost);
  const reductionPct = monthlySpend > 0 ? Math.round((monthlySavings / monthlySpend) * 100) : 0;

  return (
    <div className="bg-[#F9FAFD] text-[#0B0F14]">
      {/* BUILT FOR REAL INDIAN BUSINESSES */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-200/70">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="px-6 py-2 rounded-full bg-white border border-gray-200 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.12)] text-sm font-semibold text-[#0B0F14] mb-6">
            Who It’s Built For
          </div>

          <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-center text-[#0B0F14] tracking-tight max-w-2xl">
            Tailored for every team that values{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] to-[#E85D04]">
              time and craft
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-lg text-[#4B5563] text-center max-w-xl font-inter">
            Whether you run a neighborhood storefront, ship nationwide D2C orders, care for patients,
            or manage 15 client brands.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full text-left">
            {BUSINESS_VERTICALS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-px rounded-[24px] bg-gradient-to-b from-[#FF8E3C]/45 via-gray-200/60 to-transparent"
                >
                  <div className="bg-white rounded-[23px] p-6 h-full flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF5EB] border border-[#F5DEC6] text-[#FF7A00] flex items-center justify-center">
                        <Icon size={19} />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-[#FF7A00] block">
                          {item.badge}
                        </span>
                        <h3 className="font-sora text-lg font-bold text-[#0B0F14] mt-0.5">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{item.niche}</p>
                      </div>
                      <p className="text-xs sm:text-sm text-[#4B5563] font-inter leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 text-xs font-semibold text-emerald-700">
                      {item.outcome}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* RETAINER SAVINGS ESTIMATOR */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-200/70">
        <div className="max-w-5xl mx-auto p-px rounded-[28px] bg-gradient-to-b from-[#FF8E3C]/55 via-[#FF8E3C]/15 to-transparent">
          <div className="bg-white rounded-[27px] p-7 sm:p-12 space-y-8 text-center">
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="inline-block px-5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#EFE7DE] text-xs font-semibold text-[#FF7A00]">
                Unit Economics
              </div>
              <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-[#0B0F14] tracking-tight">
                Compare retainers vs. KUIRO
              </h2>
              <p className="text-sm sm:text-base text-[#4B5563] font-inter">
                Slide to match what you currently spend on freelancers or retainers to see the capital
                freed for inventory or ads.
              </p>
            </div>

            <div className="max-w-xl mx-auto rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] p-5 sm:p-6 space-y-4 text-left">
              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="retainer-spend-range"
                  className="text-xs sm:text-sm font-medium text-[#374151]"
                >
                  Current monthly marketing spend
                </label>
                <span className="font-sora text-lg sm:text-xl font-extrabold text-[#0B0F14] tabular-nums">
                  ₹{monthlySpend.toLocaleString('en-IN')} / mo
                </span>
              </div>

              <input
                id="retainer-spend-range"
                type="range"
                min={15000}
                max={150000}
                step={5000}
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full accent-[#FF7A00] h-2 bg-[#E8DFD4] rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-gray-500 font-inter tabular-nums">
                <span>₹15,000 (Freelancer)</span>
                <span>₹45,000 (Small Agency)</span>
                <span>₹1,50,000 (Retainer)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] p-5">
                <span className="text-xs font-medium text-gray-500 block">KUIRO Growth Plan</span>
                <span className="font-sora text-2xl font-extrabold text-[#0B0F14] tabular-nums mt-1 block">
                  ₹{growthTierCost.toLocaleString('en-IN')} / mo
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5 block">All 8 engines included</span>
              </div>

              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-5">
                <span className="text-xs font-medium text-emerald-800 block">Monthly Saved</span>
                <span className="font-sora text-2xl font-extrabold text-emerald-700 tabular-nums mt-1 block">
                  ₹{monthlySavings.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
                  {reductionPct}% lower fixed cost
                </span>
              </div>

              <div className="rounded-2xl bg-[#FFF8F1] border border-[#F5DEC6] p-5">
                <span className="text-xs font-medium text-[#C25400] block">Annual Saved</span>
                <span className="font-sora text-2xl font-extrabold text-[#FF7A00] tabular-nums mt-1 block">
                  ₹{(monthlySavings * 12).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-[#C25400] mt-0.5 block">Ready to reinvest</span>
              </div>
            </div>

            <div>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B0F14] hover:bg-[#1F2937] text-white text-xs sm:text-sm font-sora font-semibold transition group"
              >
                <span>See full pricing &amp; GST plans</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
