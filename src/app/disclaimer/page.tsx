'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Info, Scale, Stethoscope, TrendingUp } from 'lucide-react';
import { LegalPageShell, LegalSummaryItem, LegalTocItem } from '@/components/legal';

const HIGHLIGHTS: LegalSummaryItem[] = [
  {
    icon: <Info size={16} className="text-[#FF7A00]" />,
    title: 'AI Editorial Responsibility',
    desc: 'Review generated claims and prices within the 48-hour WhatsApp review window.',
  },
  {
    icon: <TrendingUp size={16} className="text-emerald-600" />,
    title: 'ROI & Performance',
    desc: 'Example metrics show benchmark cohorts; real results vary by execution.',
  },
  {
    icon: <Scale size={16} className="text-blue-600" />,
    title: 'Not Professional Advice',
    desc: 'Software never replaces licensed medical, legal, or financial counsel.',
  },
];

const TOC: LegalTocItem[] = [
  { id: 'general', num: '01.', label: 'General Information' },
  { id: 'ai-discretion', num: '02.', label: 'AI Content & Review Control' },
  { id: 'regulated', num: '03.', label: 'Industry Regulatory Notices' },
  { id: 'roi', num: '04.', label: 'Marketing Performance & ROI' },
  { id: 'algorithms', num: '05.', label: 'Third-Party Algorithms' },
  { id: 'legal-desk', num: '06.', label: 'Questions & Legal Inquiries' },
];

export default function DisclaimerPage() {
  const lastUpdated = 'November 14, 2026';

  return (
    <LegalPageShell
      activeDoc="disclaimer"
      badgeIcon={<AlertTriangle size={14} className="text-amber-300" />}
      badgeText="Product & Regulatory Disclosures"
      title="Legal Disclaimer"
      subtitle="Important disclosures regarding AI-generated content review, industry compliance boundaries, and performance estimates."
      effectiveDate="November 14, 2026"
      lastUpdated={lastUpdated}
      highlights={HIGHLIGHTS}
      toc={TOC}
    >
      {/* 01 */}
      <section id="general" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">01.</span>
          <span>General Information Disclaimer</span>
        </h2>
        <p>
          Information, software workflows, automation tools, and creative templates provided by{' '}
          <strong>KUIRO Technologies Inc.</strong> (&quot;KUIRO&quot;) at{' '}
          <Link href="https://kuiro.vercel.app" className="text-[#FF7A00] font-medium underline">
            kuiro.vercel.app
          </Link>{' '}
          and within our application dashboard are furnished strictly for business marketing,
          customer communication, and scheduling support.
        </p>
        <p>
          KUIRO is a software-as-a-service (SaaS) platform and does not render licensed medical,
          legal, tax, investment, or fiduciary advertising agency services. All final decisions on
          pricing, commercial claims, offers, and regulatory disclosures remain the customer’s
          responsibility.
        </p>
      </section>

      {/* 02 */}
      <section id="ai-discretion" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">02.</span>
          <span>AI-Generated Marketing Content &amp; Editorial Discretion</span>
        </h2>
        <div className="p-5 rounded-2xl bg-[#FFF8F1] border border-[#F0DFCF] space-y-2.5 text-xs sm:text-sm">
          <p className="text-[#0B0F14] leading-relaxed">
            <strong>Algorithmic Synthesis:</strong> KUIRO combines generative models, Brand Brain
            memory, and programmatic layout engines to prepare captions, graphics, showroom slides,
            and emails.
          </p>
          <p className="text-[#374151] leading-relaxed">
            While your workspace Brand Brain anchors generated output to your verified materials,
            automated models can still misread context or introduce wording inaccuracies.
          </p>
          <p className="text-[#0B0F14] font-semibold leading-relaxed">
            To preserve full brand oversight, KUIRO sends every draft to your WhatsApp 48 hours early
            for approval. You are responsible for verifying prices, offers, promo codes, contact
            details, and mandatory disclosures before publishing.
          </p>
        </div>
      </section>

      {/* 03 */}
      <section id="regulated" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">03.</span>
          <span>Industry-Specific Regulatory Disclaimers</span>
        </h2>
        <p>
          Businesses operating in regulated Indian sectors must verify outgoing material meets
          applicable professional rules:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] space-y-1.5 text-xs sm:text-sm">
            <strong className="font-sora text-[#0B0F14] flex items-center gap-2">
              <Stethoscope size={15} className="text-emerald-600" />
              <span>Healthcare &amp; Clinical Practices</span>
            </strong>
            <p className="text-[#4B5563] leading-relaxed">
              Posts drafted for clinics, dentists, dermatologists, and wellness centers are for
              general patient education only and never constitute medical diagnosis or treatment.
              Campaigns must adhere to National Medical Commission (NMC) Professional Conduct rules
              and Consumer Protection guidelines.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] space-y-1.5 text-xs sm:text-sm">
            <strong className="font-sora text-[#0B0F14] flex items-center gap-2">
              <TrendingUp size={15} className="text-blue-600" />
              <span>Financial &amp; Investment Services</span>
            </strong>
            <p className="text-[#4B5563] leading-relaxed">
              Educational or promotional posts for advisors and fintech brands do not constitute
              SEBI-registered investment counsel or stock recommendations. Include statutory risk
              disclosures wherever required.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] space-y-1.5 text-xs sm:text-sm">
            <strong className="font-sora text-[#0B0F14] flex items-center gap-2">
              <Scale size={15} className="text-[#FF7A00]" />
              <span>Legal Services &amp; Consultancies</span>
            </strong>
            <p className="text-[#4B5563] leading-relaxed">
              Updates shared by advocates or legal firms are purely informational, create no
              attorney-client relationship, and must follow Bar Council of India guidelines.
            </p>
          </div>
        </div>
      </section>

      {/* 04 */}
      <section id="roi" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">04.</span>
          <span>Marketing Performance &amp; ROI Disclaimers</span>
        </h2>
        <p>
          Case examples and ROI calculator estimates (such as time saved, cost-per-lead ranges, and
          attributed revenue projections) represent illustrative benchmarks under normal conditions.
        </p>
        <p>
          These examples <strong>do not guarantee specific revenue, walk-in traffic, or close rates</strong>{' '}
          for your business, as conversion outcomes depend on product demand, local pricing, ad
          budgets, seasonality, and front-desk sales execution.
        </p>
      </section>

      {/* 05 */}
      <section id="algorithms" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">05.</span>
          <span>Third-Party Social Media Platforms &amp; Algorithm Changes</span>
        </h2>
        <p>
          KUIRO connects to Instagram, Facebook, YouTube, LinkedIn, and X via official platform
          APIs. Networks regularly evolve ranking algorithms, reach distribution, and API pricing.
        </p>
        <p>
          Features like first-reply link routing on X follow best practices to protect organic
          visibility, though KUIRO cannot guarantee uninterrupted algorithmic reach across third-party
          networks.
        </p>
      </section>

      {/* 06 */}
      <section id="legal-desk" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">06.</span>
          <span>Questions &amp; Legal Inquiries</span>
        </h2>
        <p>For questions about these disclosures or regulatory safeguards, contact our legal desk:</p>
        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] text-xs space-y-1.5 font-mono text-[#374151]">
          <div className="font-bold text-[#0B0F14] font-sora text-sm">
            KUIRO Technologies Inc. • Compliance &amp; Legal Desk
          </div>
          <div>
            Email:{' '}
            <a href="mailto:legal@kuiro.in" className="text-[#FF7A00] font-semibold underline">
              legal@kuiro.in
            </a>{' '}
            /{' '}
            <a href="mailto:support@kuiro.in" className="text-[#FF7A00] font-semibold underline">
              support@kuiro.in
            </a>
          </div>
          <div>Operating Address: Kolkata, West Bengal, India</div>
        </div>
      </section>
    </LegalPageShell>
  );
}
