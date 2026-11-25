'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Clock, CreditCard, Scale } from 'lucide-react';
import { LegalPageShell, LegalSummaryItem, LegalTocItem } from '@/components/legal';

const HIGHLIGHTS: LegalSummaryItem[] = [
  {
    icon: <Building2 size={16} className="text-[#FF7A00]" />,
    title: 'You Own 100% of Assets',
    desc: 'All generated graphics, copy, and creative kits belong entirely to you.',
  },
  {
    icon: <Clock size={16} className="text-emerald-600" />,
    title: '48h Review Protocol',
    desc: 'Approve, voice-revise, or allow auto-commit to maintain steady publishing.',
  },
  {
    icon: <CreditCard size={16} className="text-blue-600" />,
    title: 'No Lock-In Contracts',
    desc: 'Cancel your subscription anytime directly from your billing settings.',
  },
];

const TOC: LegalTocItem[] = [
  { id: 'agreement', num: '01.', label: 'Agreement to Terms' },
  { id: 'service', num: '02.', label: 'Description of Service' },
  { id: 'account', num: '03.', label: 'Account & Responsibilities' },
  { id: 'billing', num: '04.', label: 'Plans, Trials & Billing' },
  { id: 'review', num: '05.', label: '48h Review & Auto-Commit' },
  { id: 'ip', num: '06.', label: 'Intellectual Property' },
  { id: 'prohibited', num: '07.', label: 'Prohibited Uses' },
  { id: 'platforms', num: '08.', label: 'Third-Party Platforms' },
  { id: 'liability', num: '09.', label: 'Limitation of Liability' },
  { id: 'law', num: '10.', label: 'Governing Law & Jurisdiction' },
];

const BILLING_POLICIES = [
  {
    title: '14-Day Free Trial',
    desc: 'New workspaces receive a 14-day full autopilot free trial. No credit card is required to initiate setup. At the conclusion of the trial, choose a paid tier to maintain autonomous publishing.',
  },
  {
    title: 'Pricing Tiers',
    desc: 'Subscriptions are offered on Monthly and Annual billing cycles: Starter (₹999/mo annual / ₹1,199/mo monthly), Growth (₹2,299/mo annual / ₹2,799/mo monthly), and Agency (₹9,999/mo annual / ₹11,999/mo monthly). Annual billing saves 20% (2 months free).',
  },
  {
    title: 'GST Compliance & Tax Invoices',
    desc: 'All listed prices are exclusive of Goods & Services Tax (18% GST). Indian entities can enter their GSTIN during checkout to receive compliant GST tax invoices eligible for Input Tax Credit (ITC).',
  },
  {
    title: 'Cancellation & Refund Policy',
    desc: 'Cancel your subscription anytime via Workspace Settings. Cancellation takes effect at the end of the active billing cycle. New initial subscriptions carry a 7-day satisfaction refund guarantee when requested in writing.',
  },
];

export default function TermsAndConditionsPage() {
  const lastUpdated = 'November 14, 2026';

  return (
    <LegalPageShell
      activeDoc="terms"
      badgeIcon={<Scale size={14} className="text-[#FFB36B]" />}
      badgeText="Master Software-as-a-Service Agreement"
      title="Terms & Conditions"
      subtitle="Clear, predictable terms covering asset ownership, billing, WhatsApp approval controls, and platform responsibilities."
      effectiveDate="November 14, 2026"
      lastUpdated={lastUpdated}
      highlights={HIGHLIGHTS}
      toc={TOC}
    >
      {/* 01 */}
      <section id="agreement" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">01.</span>
          <span>Agreement to Terms</span>
        </h2>
        <p>
          These Terms and Conditions (&quot;Terms&quot;) form a legally binding agreement between you—whether
          individually, as a sole proprietor, or on behalf of a corporate entity (&quot;Customer&quot;,
          &quot;you&quot;, or &quot;your&quot;)—and <strong>KUIRO Technologies Inc.</strong> (&quot;KUIRO&quot;,
          &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), governing access to and use of our
          website, web application, APIs, and automated marketing services.
        </p>
        <p>
          By visiting{' '}
          <Link href="https://kuiro.vercel.app" className="text-[#FF7A00] font-medium underline">
            kuiro.vercel.app
          </Link>
          , registering an account, linking your WhatsApp number, or authorizing social channels, you
          agree to these Terms. If you do not agree, discontinue use of the platform.
        </p>
      </section>

      {/* 02 */}
      <section id="service" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">02.</span>
          <span>Description of Service</span>
        </h2>
        <p>
          KUIRO is an autonomous marketing operating system designed for Indian SMBs, creators,
          clinics, and agencies. The platform provides:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#374151]">
          <li>
            <strong>Persistent Brand Brain:</strong> Extracts and retains brand guidelines, colors,
            logos, pricing, and offerings.
          </li>
          <li>
            <strong>365-Day Cultural Calendar Radar:</strong> Schedules campaigns ahead of Indian
            regional, national, and commercial retail dates.
          </li>
          <li>
            <strong>Studio Compositor &amp; Indic Typography:</strong> High-DPI visuals with clean
            Hindi, Bengali, Tamil, and English font shaping.
          </li>
          <li>
            <strong>WhatsApp 48-Hour Review Protocol:</strong> Interactive preview cards, voice-note
            revisions, and configurable passive auto-commit.
          </li>
          <li>
            <strong>Campaign ROI &amp; Lead Attribution:</strong> Tracks ad spend alongside inbound
            WhatsApp inquiries and attributed revenue.
          </li>
          <li>
            <strong>1-Click Creative Kit Exporter:</strong> Downloadable ZIP bundle containing 1080p
            TV slides, square feed cards, newsletter HTML, and front-desk SOPs.
          </li>
          <li>
            <strong>Unified Conversations Inbox:</strong> Centralized inbox spanning WhatsApp,
            Instagram DMs, Facebook Messenger, and Email.
          </li>
          <li>
            <strong>Official Multi-Channel Publishing:</strong> Automated publishing via official
            platform APIs including first-reply link routing on X (Twitter).
          </li>
        </ul>
      </section>

      {/* 03 */}
      <section id="account" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">03.</span>
          <span>Account Registration &amp; Responsibilities</span>
        </h2>
        <p>
          You agree to register using accurate and current business details and keep your login
          credentials and team invitations confidential across all activities in your workspace.
        </p>
        <p>
          Notify{' '}
          <a href="mailto:security@kuiro.in" className="text-[#FF7A00] font-semibold underline">
            security@kuiro.in
          </a>{' '}
          immediately upon suspecting unauthorized workspace access or credential compromise.
        </p>
      </section>

      {/* 04 */}
      <section id="billing" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">04.</span>
          <span>Subscription Plans, Free Trials &amp; Billing</span>
        </h2>
        <div className="space-y-3">
          {BILLING_POLICIES.map((item) => (
            <div
              key={item.title}
              className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] space-y-1"
            >
              <strong className="font-sora text-[#0B0F14] text-sm block">{item.title}</strong>
              <span className="text-xs sm:text-sm text-[#4B5563] leading-relaxed block">
                {item.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 05 */}
      <section id="review" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">05.</span>
          <span>The 48-Hour WhatsApp Review &amp; &quot;Silence = Consent&quot; Protocol</span>
        </h2>
        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5 text-xs sm:text-sm">
          <p className="text-[#0B0F14] leading-relaxed">
            <strong>Operational Mechanism:</strong> KUIRO prepares scheduled campaigns 48 hours early
            and sends an interactive preview to your designated WhatsApp number with three choices:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#374151]">
            <li>
              <strong>1-Tap Approval:</strong> Tap [Approve] to confirm immediate or scheduled
              publishing.
            </li>
            <li>
              <strong>Voice / Text Revision:</strong> Reply with text or a Hindi/English/Bengali voice
              note specifying edits—KUIRO updates the campaign within seconds.
            </li>
            <li>
              <strong>Passive Auto-Commit:</strong> If left unedited for 48 hours, KUIRO publishes at
              the scheduled slot to preserve cadence.
            </li>
          </ul>
          <p className="text-emerald-900/80 text-xs pt-0.5">
            You retain full editorial control and can toggle Auto-Commit anytime inside Dashboard
            &gt; Settings.
          </p>
        </div>
      </section>

      {/* 06 */}
      <section id="ip" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">06.</span>
          <span>Intellectual Property Rights</span>
        </h2>
        <p>
          <strong>Customer Ownership:</strong> You retain 100% ownership of all business materials
          supplied to KUIRO (logos, trademarks, catalogs, copy, and imagery) and{' '}
          <strong>own all final campaign visuals, 1080p TV slides, and captions created for your brand</strong>.
        </p>
        <p>
          <strong>KUIRO Intellectual Property:</strong> KUIRO Technologies Inc. retains all rights
          to its underlying platform software, UI systems, compositing workflows, vector schemas, and
          brand marks. Subscribers receive a non-exclusive, revocable license to use the service.
        </p>
      </section>

      {/* 07 */}
      <section id="prohibited" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">07.</span>
          <span>Prohibited Uses &amp; Content Standards</span>
        </h2>
        <p>You agree not to use KUIRO to generate, publish, or distribute material that:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#374151]">
          <li>
            Violates Indian statutory laws or industry rules (such as false medical guarantees under
            National Medical Commission conduct guidelines or deceptive pricing laws);
          </li>
          <li>Promotes fraudulent, defamatory, sexually explicit, or hateful content;</li>
          <li>Infringes third-party copyrights, patents, or registered trademarks;</li>
          <li>Attempts to reverse engineer, scrape, or bypass KUIRO platform security guards;</li>
          <li>Transmits unsolicited spam violating WhatsApp Business Messaging policies.</li>
        </ul>
      </section>

      {/* 08 */}
      <section id="platforms" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">08.</span>
          <span>Third-Party Platforms (Meta, Google, LinkedIn, X)</span>
        </h2>
        <p>
          KUIRO integrates through official developer APIs. You remain responsible for keeping your
          linked business accounts compliant with Meta, Google/YouTube, LinkedIn, and X policies.
          KUIRO is not liable for account actions, rate caps, or API policy updates enforced by
          third-party social networks.
        </p>
      </section>

      {/* 09 */}
      <section id="liability" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">09.</span>
          <span>Limitation of Liability</span>
        </h2>
        <p>
          To the fullest extent permitted by applicable law, KUIRO Technologies Inc., its directors,
          employees, and affiliates shall not be liable for indirect, incidental, consequential, or
          punitive damages, including lost profits or goodwill. Total aggregate liability arising out
          of these Terms shall not exceed the subscription fees paid by you to KUIRO in the twelve
          (12) months preceding the claim.
        </p>
      </section>

      {/* 10 */}
      <section id="law" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">10.</span>
          <span>Governing Law &amp; Dispute Resolution</span>
        </h2>
        <p>
          These Terms are governed by the laws of <strong>India</strong>. Any disputes arising from
          these Terms shall fall under the exclusive jurisdiction of courts located in{' '}
          <strong>Kolkata, West Bengal, India</strong>.
        </p>
      </section>
    </LegalPageShell>
  );
}
