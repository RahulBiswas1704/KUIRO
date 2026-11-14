'use client';

import React from 'react';
import Link from 'next/link';
import { AnnouncementBar, Navbar, Footer } from '@/components/layout';
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  Server,
  Share2,
  FileText,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Mail,
  Scale,
  RefreshCw,
  Globe2
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'November 14, 2026';

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* Top Announcement Bar */}
      <AnnouncementBar subtitle="— Transparency first. Your proprietary business DNA is strictly isolated and never sold." />

      {/* Main Navbar */}
      <Navbar activeRoute="none" badgeText="Legal & Trust" />

      {/* Hero Header */}
      <header className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-700/50 text-emerald-300 text-xs font-mono">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>DPDP Act (India) & GDPR Compliant Standards</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-sora font-bold text-white tracking-tight">
            Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-inter">
            How KUIRO Technologies Inc. collects, protects, stores, and handles your business DNA, customer inquiries, and campaign data.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-500 pt-2">
            <span>Effective Date: November 14, 2026</span>
            <span>•</span>
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>
      </header>

      {/* Quick Summary Pill Strip */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full mb-10">
        <div className="p-4 sm:p-5 rounded-[14px] bg-[#0B0F14] border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-inter">
          <div className="flex items-start gap-2.5">
            <Lock size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-sora">Zero AI Model Training</strong>
              <span className="text-slate-400">Your proprietary brand data is never used to train public LLMs.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Database size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-sora">Tenant-Isolated pgvector</strong>
              <span className="text-slate-400">Workspace data is row-level secured with zero cross-tenant leakage.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Eye size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-sora">Right to Erasure</strong>
              <span className="text-slate-400">Export your data anytime or purge your vector memory in 1-click.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Privacy Body */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full pb-20">
        <div className="p-6 sm:p-10 rounded-[18px] bg-[#0B0F14] border border-white/15 space-y-10 text-slate-300 font-inter text-sm leading-relaxed shadow-xl">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">01.</span>
              <span>Introduction & Scope</span>
            </h2>
            <p>
              This Privacy Policy applies to all services, software, web applications, and APIs provided by <strong>KUIRO Technologies Inc.</strong> (&quot;KUIRO&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), including our website at <Link href="https://kuiro.vercel.app" className="text-[#FF7A00] underline">kuiro.vercel.app</Link>, the KUIRO marketing operating system dashboard, our WhatsApp review bot, campaign compositor APIs, and customer conversations hub.
            </p>
            <p>
              We provide an autonomous marketing operating system engineered for small and medium businesses (SMBs), personal brands, solopreneurs, startup founders, retail stores, professional practices, and marketing agencies. By creating an account or connecting your channels to KUIRO, you acknowledge and agree to the practices described in this Privacy Policy.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">02.</span>
              <span>Information We Collect</span>
            </h2>
            <p>To power our autonomous marketing and conversation engines, we collect and process the following categories of data:</p>
            
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1.5">
                <h3 className="font-sora font-semibold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#FF7A00]" />
                  <span>Account & Contact Identifiers</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Full name, business email address, phone number (used for WhatsApp approvals), business name, industry classification, and billing/GST identification numbers.
                </p>
              </div>

              <div className="p-4 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1.5">
                <h3 className="font-sora font-semibold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#FF7A00]" />
                  <span>Brand Brain & Business DNA Materials</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Public business website URLs, scraped text content, product or services catalogs, pricing structures, verified licenses or degrees, brand color palettes (hex codes), vector logos (SVG/PNG), and editorial guidelines provided during onboarding or ongoing usage.
                </p>
              </div>

              <div className="p-4 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1.5">
                <h3 className="font-sora font-semibold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#FF7A00]" />
                  <span>WhatsApp Voice Notes & Review Feedback</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Incoming WhatsApp messages, button taps ([Approve] or [Request Revisions]), and voice notes delivered in Hindi, English, or regional languages. Audio notes are transcribed into text via speech-to-text models and retained solely to execute your revision instructions.
                </p>
              </div>

              <div className="p-4 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1.5">
                <h3 className="font-sora font-semibold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#FF7A00]" />
                  <span>Social Media API Tokens & Permissions</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Encrypted OAuth 2.0 access tokens and page identifiers for connected channels (Meta Graph API for Instagram/Facebook, LinkedIn UGC API, X / Twitter API v2). We do not store or inspect your personal private direct messages or unrelated personal posts.
                </p>
              </div>

              <div className="p-4 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1.5">
                <h3 className="font-sora font-semibold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#FF7A00]" />
                  <span>Lead Attribution & Conversation Logs</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Aggregated campaign metrics (impressions, clicks, verified WhatsApp inbound inquiries, cost-per-lead, and attribution tags) to render your Campaign ROI Dashboard.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">03.</span>
              <span>Our Firm AI Training & Privacy Guarantee</span>
            </h2>
            <div className="p-4 rounded-[12px] bg-gradient-to-r from-orange-950/30 to-[#0B0F14] border border-[#FF7A00]/30 space-y-2">
              <p className="text-xs text-slate-200 font-medium">
                <strong>We commit unconditionally:</strong> Your business documents, product catalogs, customer leads, voice notes, and marketing assets are <strong>NEVER used to train, fine-tune, or improve public third-party AI models</strong> (such as OpenAI GPT, Google Gemini, or Meta Llama).
              </p>
              <p className="text-xs text-slate-400">
                All AI inference operations are executed via zero-data-retention enterprise API endpoints. When data is vectorized into our database, it is stored in isolated tenant partitions accessible exclusively by your authenticated workspace credentials.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">04.</span>
              <span>How We Store & Protect Your Data</span>
            </h2>
            <p>
              KUIRO enforces bank-grade security standards across every tier of our technical infrastructure:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300">
              <li><strong>Encryption in Transit:</strong> All data transmissions between your browser, our servers, WhatsApp, and third-party APIs are encrypted with TLS 1.3 and HTTPS.</li>
              <li><strong>Encryption at Rest:</strong> All database records, vector embeddings, and media files are encrypted at rest using AES-256.</li>
              <li><strong>Neon Serverless PostgreSQL:</strong> High-security cloud PostgreSQL with strict Row-Level Security (RLS) ensuring strict isolation between tenant workspaces.</li>
              <li><strong>Cloudflare R2 Object Storage:</strong> Media assets, 1080p TV graphics, and 1-Click Creative Kit ZIP archives are stored in encrypted S3-compatible buckets with fine-grained access controls.</li>
              <li><strong>OAuth Token Security:</strong> Social media tokens are stored using salted key encryption and refreshed automatically via official platform protocols.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">05.</span>
              <span>Third-Party Sub-Processors</span>
            </h2>
            <p>
              To deliver our autonomous marketing infrastructure, KUIRO contracts with trusted enterprise infrastructure providers:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-white/10 rounded-[10px] overflow-hidden">
                <thead className="bg-[#11141A] text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
                  <tr>
                    <th className="p-3">Partner / Provider</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Location / Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-inter text-slate-300">
                  <tr>
                    <td className="p-3 font-semibold text-white">Meta Cloud API</td>
                    <td className="p-3">WhatsApp review delivery & Instagram/Facebook publishing</td>
                    <td className="p-3">Official Meta Business Partner APIs</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Neon Inc.</td>
                    <td className="p-3">PostgreSQL database & pgvector memory engine</td>
                    <td className="p-3">SOC 2 Type II, ISO 27001</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Cloudflare, Inc.</td>
                    <td className="p-3">R2 object storage, global CDN, and DDoS protection</td>
                    <td className="p-3">SOC 2, ISO 27001, GDPR compliant</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Google Cloud & OpenAI</td>
                    <td className="p-3">Enterprise AI synthesis & speech-to-text inference</td>
                    <td className="p-3">Enterprise Zero-Data-Retention agreements</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Inngest Inc.</td>
                    <td className="p-3">Durable event-driven queues & midnight cron scheduling</td>
                    <td className="p-3">SOC 2 Type II compliant</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">06.</span>
              <span>Your Data Rights & Choices</span>
            </h2>
            <p>Under the Digital Personal Data Protection Act (India) and international privacy frameworks, you hold full sovereignty over your data:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300">
              <li><strong>Right of Access & Portability:</strong> You can download all your brand assets, campaigns, and lead attribution data in CSV and ZIP formats directly from your dashboard.</li>
              <li><strong>Right to Rectification:</strong> You can update or re-scrape your Brand Brain at any time to reflect new products, prices, or services.</li>
              <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Upon account cancellation, you may request permanent deletion of your Brand Brain vector embeddings, media files, and lead logs.</li>
              <li><strong>Right to Disconnect Channels:</strong> You can revoke KUIRO&apos;s access to your Instagram, Facebook, LinkedIn, or X accounts in one click from Dashboard Settings or directly via the respective platform&apos;s app permissions.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">07.</span>
              <span>Contact Us & Grievance Officer</span>
            </h2>
            <p>
              If you have questions regarding this Privacy Policy, wish to exercise your data rights, or need to contact our designated Data Protection & Grievance Officer, please reach out to:
            </p>
            <div className="p-4 rounded-[12px] bg-[#11141A] border border-white/5 text-xs space-y-1 font-mono text-slate-300">
              <div className="font-bold text-white font-sora text-sm">KUIRO Technologies Inc. • Privacy & Grievance Office</div>
              <div>Attention: Data Protection Officer</div>
              <div>Email: <a href="mailto:privacy@kuiro.in" className="text-[#FF7A00] underline">privacy@kuiro.in</a> / <a href="mailto:support@kuiro.in" className="text-[#FF7A00] underline">support@kuiro.in</a></div>
              <div>Operating Jurisdiction: Kolkata, West Bengal, India</div>
              <div>SLA: Grievance inquiries acknowledged within 24 business hours</div>
            </div>
          </section>

          {/* Navigation Links */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <Link href="/terms" className="text-[#FF7A00] hover:underline flex items-center gap-1.5">
              <span>Read Terms & Conditions</span>
              <ArrowRight size={13} />
            </Link>
            <Link href="/disclaimer" className="text-slate-400 hover:text-white transition">
              Read Disclaimer →
            </Link>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

