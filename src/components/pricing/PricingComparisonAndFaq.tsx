'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ChevronDown, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { PlanTier } from '@/components/billing/SubscriptionCheckoutModal';

interface ComparisonGroup {
  section: string;
  rows: Array<{
    feature: string;
    starter: string | boolean;
    growth: string | boolean;
    agency: string | boolean;
  }>;
}

const COMPARISON_GROUPS: ComparisonGroup[] = [
  {
    section: '1. Workspaces & Distribution Channels',
    rows: [
      {
        feature: 'Brand Workspaces & Profiles',
        starter: '1 Workspace',
        growth: '1 Workspace (3 Profiles)',
        agency: '10 Client Workspaces',
      },
      {
        feature: 'Connected Social Channels',
        starter: '3 Channels',
        growth: 'All Channels (IG, FB, YT, LI, X)',
        agency: 'All Channels per Client',
      },
      {
        feature: 'Monthly Post Schedule',
        starter: '15 Posts / mo',
        growth: 'Unlimited 365-Day Schedule',
        agency: 'Unlimited Multi-Client',
      },
    ],
  },
  {
    section: '2. Brand Brain & WhatsApp Review',
    rows: [
      {
        feature: 'Persistent Brand Brain Memory',
        starter: true,
        growth: true,
        agency: true,
      },
      {
        feature: 'WhatsApp 48-Hour Auto-Commit Preview',
        starter: true,
        growth: true,
        agency: true,
      },
      {
        feature: 'Hindi & English Voice-Note Revisions',
        starter: false,
        growth: 'Under 12s updates',
        agency: 'Under 12s updates',
      },
      {
        feature: 'Regional Cultural Festival Radar',
        starter: 'National holidays',
        growth: '35+ Events (28 States)',
        agency: '35+ Events + Custom',
      },
    ],
  },
  {
    section: '3. ROI & Lead Attribution',
    rows: [
      {
        feature: 'Campaign ROI & Lead Attribution Dashboard',
        starter: false,
        growth: true,
        agency: true,
      },
      {
        feature: 'WhatsApp Customer Lead Tagging',
        starter: false,
        growth: true,
        agency: true,
      },
      {
        feature: 'Executive PDF & CSV Attribution Reports',
        starter: false,
        growth: true,
        agency: true,
      },
    ],
  },
  {
    section: '4. Studio Design & Creative Kit',
    rows: [
      {
        feature: 'High-DPI Visual Compositing',
        starter: true,
        growth: true,
        agency: true,
      },
      {
        feature: '1-Click Creative Kit ZIP Export (1080p TV, Web, SOP)',
        starter: false,
        growth: true,
        agency: true,
      },
      {
        feature: 'Pre-Shaped Indic Typography (Hindi, Bengali, Tamil)',
        starter: false,
        growth: true,
        agency: true,
      },
      {
        feature: 'X First-Reply Link Protection',
        starter: false,
        growth: true,
        agency: true,
      },
      {
        feature: 'Branded Email Newsletters',
        starter: '2,500 / mo',
        growth: '15,000 / mo',
        agency: '100,000 / mo',
      },
    ],
  },
  {
    section: '5. Shared Inbox & Team Access',
    rows: [
      {
        feature: 'Unified Customer Inbox',
        starter: 'WhatsApp (1 Seat)',
        growth: '4 Channels (5 Seats)',
        agency: 'All Channels (Unlimited)',
      },
      {
        feature: 'Keyword Auto-Responder Rules',
        starter: '2 Active Flows',
        growth: 'Unlimited Flows',
        agency: 'Multi-Client Flows',
      },
      {
        feature: 'Whitelabel Agency WhatsApp Sender ID',
        starter: false,
        growth: false,
        agency: true,
      },
    ],
  },
];

const PRICING_FAQS = [
  {
    q: 'How does the 14-day risk-free trial work?',
    a: 'You get full access to Growth Autopilot for 14 days without paying upfront. Index your Brand Brain, connect your channels, and test the 48-hour WhatsApp review loop before choosing a plan.',
  },
  {
    q: 'How does the 48-Hour WhatsApp approval loop work?',
    a: '48 hours before any festival, milestone, or scheduled date, KUIRO sends a complete preview card directly to your WhatsApp. Tap Approve, send a voice note to revise, or leave it untouched to auto-publish on schedule.',
  },
  {
    q: 'Can I really send voice notes in Hindi or English to edit posts?',
    a: 'Yes. Reply with a natural voice note in Hindi, Hinglish, Bengali, or English—for example, changing a festive discount or headline emphasis. KUIRO updates your visual and caption in seconds.',
  },
  {
    q: 'Do you provide GST invoices for Input Tax Credit (ITC)?',
    a: 'Yes. Enter your company GSTIN during checkout and every monthly or annual Razorpay/Cashfree invoice includes a compliant 18% GST tax breakdown automatically.',
  },
  {
    q: 'Can agencies manage separate client brands on one account?',
    a: 'Yes. The Agency / Scale plan creates isolated client workspaces—each with its own brand memory, social accounts, team seats, and separate WhatsApp approval recipients.',
  },
  {
    q: 'Can I switch plans or cancel anytime?',
    a: 'Yes. Upgrade, downgrade, or cancel straight from Workspace Settings with zero lock-in contracts or cancellation fees.',
  },
];

interface PricingComparisonAndFaqProps {
  onStartTrial: (tier: PlanTier) => void;
}

function renderCell(val: string | boolean, highlight = false) {
  if (val === true) {
    return (
      <Check
        size={16}
        className={`mx-auto ${highlight ? 'text-[#FF7A00]' : 'text-emerald-600'}`}
      />
    );
  }
  if (val === false) {
    return <span className="text-gray-400">—</span>;
  }
  return <span className={highlight ? 'font-semibold text-[#0B0F14]' : 'text-[#374151]'}>{val}</span>;
}

/**
 * Clean White Plan Comparison Table + Warm Cream FAQ Accordion + Editorial Closing CTA.
 */
export default function PricingComparisonAndFaq({ onStartTrial }: PricingComparisonAndFaqProps) {
  const { isLoggedIn } = useAuth();
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  return (
    <>
      {/* PLAN COMPARISON MATRIX */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F9FAFD] border-t border-gray-200/70">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="px-6 py-2 rounded-full bg-white border border-gray-200 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.12)] text-sm font-semibold text-[#0B0F14] mb-6">
            Side-by-Side
          </div>

          <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-center text-[#0B0F14] tracking-tight">
            Compare plan capabilities
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#4B5563] text-center max-w-xl font-inter">
            Every tier includes persistent Brand Brain memory and 48-hour WhatsApp approvals—zero
            hidden add-ons.
          </p>

          <div className="mt-12 w-full rounded-[26px] bg-white border border-gray-200 shadow-[0_14px_38px_-24px_rgba(15,23,42,0.14)] overflow-hidden">
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full min-w-[640px] text-xs sm:text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#FAF9F6] text-xs font-sora font-bold">
                    <th className="p-4 sm:p-5 text-[#0B0F14] w-2/5">Capability</th>
                    <th className="p-4 sm:p-5 text-center text-[#374151] w-1/5">Starter</th>
                    <th className="p-4 sm:p-5 text-center text-[#FF7A00] bg-[#FFF8F1] w-1/5">
                      Growth
                    </th>
                    <th className="p-4 sm:p-5 text-center text-[#374151] w-1/5">Agency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-inter">
                  {COMPARISON_GROUPS.map((group) => (
                    <React.Fragment key={group.section}>
                      <tr className="bg-[#FAF8F5]">
                        <td
                          colSpan={4}
                          className="px-4 sm:px-5 py-3 text-[11px] font-sora font-bold uppercase tracking-wider text-[#C25400]"
                        >
                          {group.section}
                        </td>
                      </tr>
                      {group.rows.map((row) => (
                        <tr key={row.feature} className="hover:bg-[#FAF9F6]/60 transition">
                          <td className="px-4 sm:px-5 py-3.5 text-[#0B0F14] font-medium">
                            {row.feature}
                          </td>
                          <td className="px-4 sm:px-5 py-3.5 text-center text-xs">
                            {renderCell(row.starter)}
                          </td>
                          <td className="px-4 sm:px-5 py-3.5 text-center text-xs bg-[#FFF8F1]/60">
                            {renderCell(row.growth, true)}
                          </td>
                          <td className="px-4 sm:px-5 py-3.5 text-center text-xs">
                            {renderCell(row.agency)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* WARM CREAM FAQ */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6] border-t border-gray-200/70">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <div className="px-6 py-2 rounded-full bg-white border border-gray-200 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.12)] text-sm font-semibold text-[#0B0F14] mb-6">
            FAQ
          </div>

          <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-center text-[#0B0F14] tracking-tight mb-12">
            Frequently asked billing questions
          </h2>

          <ul className="w-full space-y-3.5 text-left">
            {PRICING_FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <li
                  key={faq.q}
                  className="bg-[#FFF8F1] rounded-2xl border border-[#F0DFCF] overflow-hidden"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
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

      {/* WARM EDITORIAL CLOSING CTA */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAF9F6] to-[#F5F2EB] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-sora text-4xl sm:text-6xl font-extrabold text-[#0B0F14] tracking-tight leading-[1.1]">
            Put your marketing <br />
            on autopilot today.
          </h2>

          <p className="text-base sm:text-lg text-[#374151] max-w-xl mx-auto font-inter font-medium">
            No credit card required to start. See your first WhatsApp campaign preview in minutes.
          </p>

          <div className="pt-2 flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => onStartTrial('GROWTH')}
                className="cursor-pointer inline-flex items-center justify-center bg-[#0B0F14] hover:bg-[#1F2937] text-white font-sora font-bold text-sm sm:text-base rounded-2xl px-7 py-3.5 shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all group"
              >
                <span>{isLoggedIn ? 'Upgrade Workspace' : 'Start 14-day free trial'}</span>
                <ArrowRight
                  size={17}
                  className="ml-2 group-hover:translate-x-0.5 transition-transform"
                />
              </button>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-[#0B0F14] text-sm font-sora font-semibold transition"
              >
                Talk to Sales
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
