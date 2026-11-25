'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Database, Eye, Lock, ShieldCheck } from 'lucide-react';
import { LegalPageShell, LegalSummaryItem, LegalTocItem } from '@/components/legal';

const HIGHLIGHTS: LegalSummaryItem[] = [
  {
    icon: <Lock size={16} className="text-[#FF7A00]" />,
    title: 'Zero AI Model Training',
    desc: 'Your proprietary brand data is never used to train public LLMs.',
  },
  {
    icon: <Database size={16} className="text-emerald-600" />,
    title: 'Tenant-Isolated pgvector',
    desc: 'Workspace memory is row-level secured with zero cross-tenant leakage.',
  },
  {
    icon: <Eye size={16} className="text-blue-600" />,
    title: 'Right to Erasure',
    desc: 'Export your data anytime or purge your vector memory in one click.',
  },
];

const TOC: LegalTocItem[] = [
  { id: 'scope', num: '01.', label: 'Introduction & Scope' },
  { id: 'collection', num: '02.', label: 'Information We Collect' },
  { id: 'ai-guarantee', num: '03.', label: 'AI Training & Privacy Guarantee' },
  { id: 'security', num: '04.', label: 'How We Store & Protect Data' },
  { id: 'subprocessors', num: '05.', label: 'Third-Party Sub-Processors' },
  { id: 'rights', num: '06.', label: 'Your Data Rights & Choices' },
  { id: 'grievance', num: '07.', label: 'Contact & Grievance Officer' },
];

const COLLECTED_ITEMS = [
  {
    title: 'Account & Contact Identifiers',
    desc: 'Full name, business email address, phone number (used for WhatsApp approvals), business name, industry classification, and billing/GST identification numbers.',
  },
  {
    title: 'Brand Brain & Business DNA Materials',
    desc: 'Public business website URLs, crawled copy, product or service catalogs, pricing structures, verified licenses or degrees, brand color palettes (hex codes), vector logos (SVG/PNG), and editorial guidelines provided during onboarding or ongoing usage.',
  },
  {
    title: 'WhatsApp Voice Notes & Review Feedback',
    desc: 'Incoming WhatsApp messages, button taps ([Approve] or [Request Revisions]), and voice notes delivered in Hindi, English, Bengali, or regional languages. Audio notes are transcribed into text and retained solely to execute your revision instructions.',
  },
  {
    title: 'Social Media API Tokens & Permissions',
    desc: 'Encrypted OAuth 2.0 access tokens and page identifiers for connected channels (Meta Graph API for Instagram/Facebook, YouTube/Google, LinkedIn UGC API, X / Twitter API v2). We never inspect personal private messages outside your authorized business pages.',
  },
  {
    title: 'Lead Attribution & Conversation Logs',
    desc: 'Aggregated campaign metrics (impressions, clicks, verified WhatsApp inbound inquiries, cost-per-lead, and attribution tags) used to render your Campaign ROI Dashboard.',
  },
];

const SUBPROCESSORS = [
  ['Meta Cloud API', 'WhatsApp review delivery & Instagram/Facebook publishing', 'Official Meta Business Partner APIs'],
  ['Neon Inc.', 'PostgreSQL database & pgvector memory engine', 'SOC 2 Type II, ISO 27001'],
  ['Cloudflare, Inc.', 'R2 object storage, global CDN, and DDoS protection', 'SOC 2, ISO 27001, GDPR compliant'],
  ['Google Cloud & OpenAI', 'Enterprise AI synthesis & speech-to-text inference', 'Enterprise Zero-Data-Retention agreements'],
  ['Inngest Inc.', 'Durable event-driven queues & midnight cron scheduling', 'SOC 2 Type II compliant'],
];

export default function PrivacyPolicyPage() {
  const lastUpdated = 'November 14, 2026';

  return (
    <LegalPageShell
      activeDoc="privacy"
      badgeIcon={<ShieldCheck size={14} className="text-emerald-300" />}
      badgeText="DPDP Act (India) & GDPR Compliant Standards"
      title="Privacy Policy"
      subtitle="How KUIRO Technologies Inc. collects, protects, stores, and handles your business DNA, customer inquiries, and campaign data."
      effectiveDate="November 14, 2026"
      lastUpdated={lastUpdated}
      highlights={HIGHLIGHTS}
      toc={TOC}
    >
      {/* 01 */}
      <section id="scope" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">01.</span>
          <span>Introduction &amp; Scope</span>
        </h2>
        <p>
          This Privacy Policy applies to all services, software, web applications, and APIs provided
          by <strong>KUIRO Technologies Inc.</strong> (&quot;KUIRO&quot;, &quot;we&quot;, &quot;us&quot;, or
          &quot;our&quot;), including our website at{' '}
          <Link href="https://kuiro.vercel.app" className="text-[#FF7A00] font-medium underline">
            kuiro.vercel.app
          </Link>
          , the KUIRO marketing operating system dashboard, our WhatsApp review bridge, campaign
          compositor APIs, and customer conversations hub.
        </p>
        <p>
          We provide an autonomous marketing operating system engineered for small and medium
          businesses (SMBs), personal brands, solopreneurs, startup founders, retail stores,
          professional practices, and marketing agencies. By creating an account or connecting your
          channels to KUIRO, you acknowledge and agree to the practices described in this Privacy
          Policy.
        </p>
      </section>

      {/* 02 */}
      <section id="collection" className="space-y-4 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">02.</span>
          <span>Information We Collect</span>
        </h2>
        <p>
          To power our autonomous marketing and conversation engines, we collect and process the
          following categories of data:
        </p>
        <div className="space-y-3">
          {COLLECTED_ITEMS.map((item) => (
            <div
              key={item.title}
              className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] space-y-1.5"
            >
              <h3 className="font-sora font-bold text-[#0B0F14] text-sm flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#FF7A00] shrink-0" />
                <span>{item.title}</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 03 */}
      <section id="ai-guarantee" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">03.</span>
          <span>Our Firm AI Training &amp; Privacy Guarantee</span>
        </h2>
        <div className="p-5 rounded-2xl bg-[#FFF8F1] border border-[#F0DFCF] space-y-2.5">
          <p className="text-xs sm:text-sm text-[#0B0F14] font-medium leading-relaxed">
            <strong>We commit unconditionally:</strong> Your business documents, product catalogs,
            customer leads, voice notes, and marketing assets are{' '}
            <strong>
              NEVER used to train, fine-tune, or improve public third-party AI models
            </strong>{' '}
            (such as OpenAI GPT, Google Gemini, or Meta Llama).
          </p>
          <p className="text-xs text-[#4B5563] leading-relaxed">
            All AI inference operations are executed via zero-data-retention enterprise API
            endpoints. When data is stored in your Brand Brain, it remains in isolated tenant
            partitions accessible exclusively through your authenticated workspace credentials.
          </p>
        </div>
      </section>

      {/* 04 */}
      <section id="security" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">04.</span>
          <span>How We Store &amp; Protect Your Data</span>
        </h2>
        <p>KUIRO enforces strict security controls across every layer of our infrastructure:</p>
        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[#374151]">
          <li>
            <strong>Encryption in Transit:</strong> All transmissions between your browser, our
            servers, WhatsApp, and third-party APIs are encrypted via TLS 1.3 and HTTPS.
          </li>
          <li>
            <strong>Encryption at Rest:</strong> Database records, vector embeddings, and media
            files are encrypted at rest using AES-256.
          </li>
          <li>
            <strong>Neon Serverless PostgreSQL:</strong> Cloud PostgreSQL with strict tenant scoping
            ensuring clean isolation across customer workspaces.
          </li>
          <li>
            <strong>Object Storage (R2 / Neon S3):</strong> Media assets, 1080p TV slides, and
            Creative Kit ZIP archives are held in private S3-compatible storage buckets.
          </li>
          <li>
            <strong>OAuth Token Vault:</strong> Social media tokens are encrypted using AES-256-GCM
            and rotated/refreshed automatically via official platform protocols.
          </li>
        </ul>
      </section>

      {/* 05 */}
      <section id="subprocessors" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">05.</span>
          <span>Third-Party Sub-Processors</span>
        </h2>
        <p>
          To deliver our autonomous marketing infrastructure, KUIRO contracts with trusted cloud and
          messaging providers:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF8F5] text-[#0B0F14] font-sora font-bold border-b border-gray-200">
              <tr>
                <th className="p-3.5">Partner / Provider</th>
                <th className="p-3.5">Purpose</th>
                <th className="p-3.5">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-inter text-[#374151]">
              {SUBPROCESSORS.map(([name, purpose, compliance]) => (
                <tr key={name} className="hover:bg-[#FAF9F6] transition">
                  <td className="p-3.5 font-semibold text-[#0B0F14]">{name}</td>
                  <td className="p-3.5">{purpose}</td>
                  <td className="p-3.5 text-gray-500">{compliance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 06 */}
      <section id="rights" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">06.</span>
          <span>Your Data Rights &amp; Choices</span>
        </h2>
        <p>
          Under India’s Digital Personal Data Protection (DPDP) Act and international privacy
          standards, you hold sovereignty over your business records:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[#374151]">
          <li>
            <strong>Right of Access &amp; Portability:</strong> Export campaigns, brand assets, and
            ROI attribution ledgers in CSV and ZIP formats directly from your dashboard.
          </li>
          <li>
            <strong>Right to Rectification:</strong> Update or re-index your Brand Brain anytime to
            reflect new products, prices, or policies.
          </li>
          <li>
            <strong>Right to Erasure:</strong> Upon closing your account, request permanent deletion
            of Brand Brain memory, media assets, and lead logs.
          </li>
          <li>
            <strong>Right to Disconnect Channels:</strong> Revoke KUIRO&apos;s access to Instagram,
            Facebook, YouTube, LinkedIn, or X in one click inside Settings or the platform’s app
            permissions panel.
          </li>
        </ul>
      </section>

      {/* 07 */}
      <section id="grievance" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl font-sora font-bold text-[#0B0F14] flex items-center gap-2.5">
          <span className="text-[#FF7A00] font-mono text-base">07.</span>
          <span>Contact Us &amp; Grievance Officer</span>
        </h2>
        <p>
          For questions about this Privacy Policy or to exercise data rights under the DPDP Act,
          contact our Data Protection &amp; Grievance Office:
        </p>
        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] text-xs space-y-1.5 font-mono text-[#374151]">
          <div className="font-bold text-[#0B0F14] font-sora text-sm">
            KUIRO Technologies Inc. • Privacy &amp; Grievance Office
          </div>
          <div>Attention: Data Protection Officer</div>
          <div>
            Email:{' '}
            <a href="mailto:privacy@kuiro.in" className="text-[#FF7A00] font-semibold underline">
              privacy@kuiro.in
            </a>{' '}
            /{' '}
            <a href="mailto:support@kuiro.in" className="text-[#FF7A00] font-semibold underline">
              support@kuiro.in
            </a>
          </div>
          <div>Operating Jurisdiction: Kolkata, West Bengal, India</div>
          <div>SLA: Inquiries acknowledged within 24 business hours</div>
        </div>
      </section>
    </LegalPageShell>
  );
}
