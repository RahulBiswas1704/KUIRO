'use client';

import React from 'react';
import Link from 'next/link';
import { AnnouncementBar, Navbar, Footer } from '@/components/layout';
import {
  AlertTriangle,
  Scale,
  ShieldAlert,
  CheckCircle2,
  Stethoscope,
  TrendingUp,
  Share2,
  FileText,
  ArrowRight,
  Info,
  HelpCircle
} from 'lucide-react';

export default function DisclaimerPage() {
  const lastUpdated = 'November 14, 2026';

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* Top Announcement Bar */}
      <AnnouncementBar subtitle="— Important legal, AI content, and industry-specific regulatory disclosures." />

      {/* Main Navbar */}
      <Navbar activeRoute="none" badgeText="Legal & Trust" />

      {/* Hero Header */}
      <header className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/70 border border-amber-700/50 text-amber-300 text-xs font-mono">
            <AlertTriangle size={14} className="text-amber-400" />
            <span>Product & Regulatory Disclosures</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-sora font-bold text-white tracking-tight">
            Legal Disclaimer
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-inter">
            Important information regarding AI-generated marketing content, industry regulatory compliance, and performance attribution.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-500 pt-2">
            <span>Effective Date: November 14, 2026</span>
            <span>•</span>
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>
      </header>

      {/* Quick Summary Strip */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full mb-10">
        <div className="p-4 sm:p-5 rounded-[14px] bg-[#0B0F14] border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-inter">
          <div className="flex items-start gap-2.5">
            <Info size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-sora">AI Editorial Responsibility</strong>
              <span className="text-slate-400">Review all generated campaign copy and prices within the 48h review window.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <TrendingUp size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-sora">ROI & Performance</strong>
              <span className="text-slate-400">Case metrics reflect benchmark cohorts; individual sales results vary by execution.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Scale size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-sora">Not Professional Advice</strong>
              <span className="text-slate-400">Software does not substitute for medical, legal, or licensed financial counsel.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Disclaimer Body */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full pb-20">
        <div className="p-6 sm:p-10 rounded-[18px] bg-[#0B0F14] border border-white/15 space-y-10 text-slate-300 font-inter text-sm leading-relaxed shadow-xl">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">01.</span>
              <span>General Information Disclaimer</span>
            </h2>
            <p>
              The information, software tools, marketing automation features, and creative materials provided by <strong>KUIRO Technologies Inc.</strong> (&quot;KUIRO&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) on <Link href="https://kuiro.vercel.app" className="text-[#FF7A00] underline">kuiro.vercel.app</Link> and associated dashboards are provided for business marketing, communication, and promotional automation purposes only.
            </p>
            <p>
              KUIRO is an autonomous software-as-a-service (SaaS) platform. We do not provide licensed legal, medical, accounting, financial, or formal advertising agency fiduciary services. All decisions regarding business promotion, product pricing, customer terms, and public disclosures remain solely the customer&apos;s responsibility.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">02.</span>
              <span>AI-Generated Marketing Content & Editorial Discretion</span>
            </h2>
            <div className="p-4 rounded-[12px] bg-gradient-to-r from-orange-950/30 to-[#0B0F14] border border-[#FF7A00]/30 space-y-2 text-xs">
              <p className="text-slate-200">
                <strong>Algorithmic Content Generation:</strong> KUIRO utilizes generative artificial intelligence, neural embeddings (pgvector), and programmatic layout compositing to synthesize marketing copy, social media graphics, 1080p TV slides, and email newsletters.
              </p>
              <p className="text-slate-300">
                While KUIRO&apos;s Persistent Brand Brain strictly references your ingested business materials, AI models may occasionally produce inaccuracies, misinterpret colloquial nuances, or hallucinate details.
              </p>
              <p className="text-slate-200 font-semibold">
                To guarantee complete brand control, KUIRO delivers all campaigns 48 hours in advance via WhatsApp. You are responsible for reviewing and verifying all factual claims, pricing offers, discount codes, contact phone numbers, and legal disclosures before allowing publication.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">03.</span>
              <span>Industry-Specific Regulatory Disclaimers</span>
            </h2>
            <p className="text-xs text-slate-300">
              Users operating in regulated Indian industries must comply with respective regulatory guidelines when using KUIRO:
            </p>

            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1 text-xs">
                <strong className="text-white font-sora flex items-center gap-2">
                  <Stethoscope size={14} className="text-emerald-400" />
                  <span>Healthcare & Clinical Practices</span>
                </strong>
                <p className="text-slate-400 leading-relaxed">
                  Content generated for clinics, dentists, dermatologists, and healthcare professionals is intended for general patient education and awareness only. It does not constitute medical advice, diagnosis, or treatment. All health-related campaigns must comply with the National Medical Commission (NMC) Professional Conduct Regulations and Consumer Protection Act guidelines in India.
                </p>
              </div>

              <div className="p-3.5 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1 text-xs">
                <strong className="text-white font-sora flex items-center gap-2">
                  <TrendingUp size={14} className="text-blue-400" />
                  <span>Financial & Investment Services</span>
                </strong>
                <p className="text-slate-400 leading-relaxed">
                  Content generated for wealth managers, fintechs, or advisors does not constitute SEBI-registered investment advice, stock recommendations, or financial solicitations. Users must ensure mandatory risk disclosures are included where required by law.
                </p>
              </div>

              <div className="p-3.5 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1 text-xs">
                <strong className="text-white font-sora flex items-center gap-2">
                  <Scale size={14} className="text-purple-400" />
                  <span>Legal Services & Consultancies</span>
                </strong>
                <p className="text-slate-400 leading-relaxed">
                  Information generated for legal consultancies or advocates is for informational purposes only and does not establish an attorney-client relationship. Content must adhere to Bar Council of India advertising guidelines.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">04.</span>
              <span>Marketing Performance & ROI Disclaimers</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Case studies, performance benchmarks, and return-on-investment metrics displayed on our website (such as &quot;5.2x Average ROI&quot;, &quot;+44% Inquiries&quot;, &quot;94% Retainer Savings&quot;, or cost-per-lead estimates) represent real or simulated results achieved by specific benchmark cohorts under controlled parameters.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              These figures are illustrative and <strong>do not constitute a guarantee of specific revenue, footfall, sales volume, or conversion rates</strong> for your business. Marketing success is influenced by factors outside KUIRO&apos;s control, including product demand, seasonal market shifts, local competition, advertising expenditure, and front-desk sales follow-up.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">05.</span>
              <span>Third-Party Social Media Platforms & Algorithm Changes</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              KUIRO publishes content across third-party social media networks (Instagram, Facebook, LinkedIn, X / Twitter) using their official public APIs. Social networks frequently update their ranking algorithms, distribution models, content policies, and API pricing (such as link surcharges on X).
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              While KUIRO&apos;s &quot;Zero-Link Surcharge Guard&quot; and formatting algorithms are continuously engineered to comply with platform best practices, we cannot guarantee constant algorithmic reach or prevent changes enacted unilaterally by third-party social media networks.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">06.</span>
              <span>Questions & Legal Inquiries</span>
            </h2>
            <p className="text-xs text-slate-300">
              For questions regarding this Disclaimer or our regulatory compliance safeguards, please contact our legal and compliance desk at:
            </p>
            <div className="p-4 rounded-[12px] bg-[#11141A] border border-white/5 text-xs space-y-1 font-mono text-slate-300">
              <div className="font-bold text-white font-sora text-sm">KUIRO Technologies Inc. • Compliance & Legal Desk</div>
              <div>Email: <a href="mailto:legal@kuiro.in" className="text-[#FF7A00] underline">legal@kuiro.in</a> / <a href="mailto:support@kuiro.in" className="text-[#FF7A00] underline">support@kuiro.in</a></div>
              <div>Operating Address: Kolkata, West Bengal, India</div>
            </div>
          </section>

          {/* Navigation Links */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <Link href="/privacy" className="text-[#FF7A00] hover:underline flex items-center gap-1.5">
              <span>Read Privacy Policy</span>
              <ArrowRight size={13} />
            </Link>
            <Link href="/terms" className="text-slate-400 hover:text-white transition">
              Read Terms & Conditions →
            </Link>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
