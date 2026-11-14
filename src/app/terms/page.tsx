'use client';

import React from 'react';
import Link from 'next/link';
import { AnnouncementBar, Navbar, Footer } from '@/components/layout';
import {
  FileText,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Smartphone,
  ArrowRight,
  AlertCircle,
  CreditCard,
  Building2,
  Zap
} from 'lucide-react';

export default function TermsAndConditionsPage() {
  const lastUpdated = 'November 14, 2026';

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* Top Announcement Bar */}
      <AnnouncementBar subtitle="— Clear, predictable terms designed to protect your business and creative assets." />

      {/* Main Navbar */}
      <Navbar activeRoute="none" badgeText="Legal & Trust" />

      {/* Hero Header */}
      <header className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-950/70 border border-orange-700/50 text-orange-300 text-xs font-mono">
            <Scale size={14} className="text-[#FF7A00]" />
            <span>Master Software-as-a-Service Agreement</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-sora font-bold text-white tracking-tight">
            Terms & Conditions
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-inter">
            Please read these terms carefully before accessing or subscribing to the KUIRO autonomous marketing operating system.
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
            <Building2 size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-sora">You Own 100% of Assets</strong>
              <span className="text-slate-400">All generated images, copy, and creative kits belong entirely to you.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-sora">48h Review Protocol</strong>
              <span className="text-slate-400">Approve, voice-revise, or allow auto-commit to ensure consistency.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CreditCard size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-sora">No Lock-In Contracts</strong>
              <span className="text-slate-400">Cancel your subscription anytime directly from your billing portal.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Terms Body */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full pb-20">
        <div className="p-6 sm:p-10 rounded-[18px] bg-[#0B0F14] border border-white/15 space-y-10 text-slate-300 font-inter text-sm leading-relaxed shadow-xl">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">01.</span>
              <span>Agreement to Terms</span>
            </h2>
            <p>
              These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you—whether individually, as a sole proprietor, or on behalf of a corporate entity (&quot;Customer&quot;, &quot;you&quot;, or &quot;your&quot;)—and <strong>KUIRO Technologies Inc.</strong> (&quot;KUIRO&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), regarding your access to and use of our website, web application, APIs, and automated marketing services.
            </p>
            <p>
              By accessing the website at <Link href="https://kuiro.vercel.app" className="text-[#FF7A00] underline">kuiro.vercel.app</Link>, registering for an account, linking your WhatsApp number, or connecting social media profiles, you expressly agree to be bound by these Terms. If you do not agree, you must immediately discontinue use of the platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">02.</span>
              <span>Description of Service</span>
            </h2>
            <p>
              KUIRO is an autonomous marketing operating system designed for small and medium businesses (SMBs), personal brands, solopreneurs, startup founders, retail stores, professional practices, and marketing agencies. The platform comprises:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
              <li><strong>Persistent Brand Brain:</strong> Vector memory engine that crawls and extracts business guidelines, colors, logos, and catalogs.</li>
              <li><strong>365-Day Regional Calendar Radar:</strong> Autonomous scheduling engine monitoring 100+ Indian cultural and retail moments.</li>
              <li><strong>Studio Compositor & Indic Typography:</strong> High-DPI canvas generation with pre-shaped font support for Devanagari, Bengali, Tamil, etc.</li>
              <li><strong>WhatsApp 48-Hour Review Protocol:</strong> Interactive contact sheets, multilingual voice-note revisions, and passive auto-commit.</li>
              <li><strong>Campaign ROI & Lead Attribution:</strong> Real-time ad spend vs. verified WhatsApp leads, CPL calculation, and closed revenue tracking.</li>
              <li><strong>1-Click Creative Kit Exporter:</strong> Downloadable ZIP bundle with 1080p in-store TV slides, social cards, email copy, and front desk SOPs.</li>
              <li><strong>Unified Conversations Inbox:</strong> Centralized messaging hub aggregating WhatsApp, Instagram, Messenger, and Email.</li>
              <li><strong>Multi-Channel Publishing:</strong> Official API broadcasting with zero-link surcharge protection on X (Twitter).</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">03.</span>
              <span>Account Registration & Responsibilities</span>
            </h2>
            <p>
              To access KUIRO, you must register for an account using accurate, current, and complete business information. You are solely responsible for maintaining the confidentiality of your login credentials and for all activities conducted under your workspace.
            </p>
            <p>
              You must immediately notify KUIRO at <a href="mailto:security@kuiro.in" className="text-[#FF7A00] underline">security@kuiro.in</a> upon discovering any unauthorized access or breach of security. KUIRO will not be liable for any loss resulting from unauthorized use of your credentials.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">04.</span>
              <span>Subscription Plans, Free Trials & Billing</span>
            </h2>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1">
                <strong className="text-white font-sora block">14-Day Free Trial:</strong>
                <span>New workspaces receive a 14-day full autopilot free trial. No credit card is required to initiate setup. At the conclusion of the trial, you may choose a paid tier to maintain autonomous publishing.</span>
              </div>
              <div className="p-3.5 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1">
                <strong className="text-white font-sora block">Pricing Tiers:</strong>
                <span>Subscriptions are offered on Monthly and Annual billing frequencies: Starter (₹999/mo annual / ₹1,199/mo monthly), Growth (₹2,299/mo annual / ₹2,799/mo monthly), and Agency (₹9,999/mo annual / ₹11,999/mo monthly). Annual plans include a 20% discount + 2 months free.</span>
              </div>
              <div className="p-3.5 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1">
                <strong className="text-white font-sora block">GST Compliance & Tax Invoices:</strong>
                <span>All prices are quoted exclusive of applicable Goods & Services Tax (GST). Registered Indian entities can input their GSTIN during checkout to receive compliant GST tax invoices eligible for Input Tax Credit (ITC).</span>
              </div>
              <div className="p-3.5 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1">
                <strong className="text-white font-sora block">Cancellation & Refund Policy:</strong>
                <span>You may cancel your subscription at any time via Dashboard Settings. Cancellation takes effect at the end of the current billing cycle. We offer a 7-day money-back satisfaction guarantee on new initial plan subscriptions if requested in writing.</span>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">05.</span>
              <span>The 48-Hour WhatsApp Review & &quot;Silence = Consent&quot; Protocol</span>
            </h2>
            <div className="p-4 rounded-[12px] bg-gradient-to-r from-emerald-950/30 to-[#0B0F14] border border-emerald-500/30 space-y-2 text-xs">
              <p className="text-slate-200">
                <strong>Operational Mechanism:</strong> KUIRO schedules automated campaigns at T-48 hours and transmits an interactive contact sheet to your designated WhatsApp number. During this 48-hour window, you have three options:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>1-Tap Approval:</strong> Tap the [Approve Campaign] button to authorize immediate or scheduled publication.</li>
                <li><strong>Voice / Text Revision:</strong> Send a text message or a Hindi/English voice note specifying changes. KUIRO regenerates the campaign within 12 seconds.</li>
                <li><strong>Passive Auto-Commit:</strong> If you take no action within 48 hours, KUIRO automatically publishes the campaign at the scheduled time to ensure 365-day marketing consistency.</li>
              </ul>
              <p className="text-slate-400 pt-1">
                You retain complete editorial authority and can disable or modify the Auto-Commit setting at any time in Dashboard &gt; Settings.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">06.</span>
              <span>Intellectual Property Rights</span>
            </h2>
            <div className="space-y-3 text-xs">
              <p>
                <strong>Customer Ownership:</strong> You retain 100% intellectual property ownership of all business materials uploaded to KUIRO (including logos, trademarks, catalogs, text copy, and images). Furthermore, <strong>you own all final campaign creatives, 1080p TV slides, social cards, and copy generated for your account</strong>.
              </p>
              <p>
                <strong>KUIRO Intellectual Property:</strong> KUIRO Technologies Inc. retains all right, title, and interest in and to the platform, including its software, UI design, Satori compositing workflows, vector memory architectures, and brand trademarks. You are granted a non-exclusive, non-transferable, revocable license to access the SaaS suite.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">07.</span>
              <span>Prohibited Uses & Content Standards</span>
            </h2>
            <p>You agree not to use KUIRO to create, publish, or distribute content that:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
              <li>Violates Indian statutory laws or international regulations, including false medical claims violating National Medical Commission (NMC) regulations or consumer protection statutes;</li>
              <li>Promotes deceptive, fraudulent, defamatory, sexually explicit, or hate-speech material;</li>
              <li>Infringes on third-party intellectual property rights, copyrights, or registered trademarks;</li>
              <li>Attempts to reverse engineer, scrape, decompile, or bypass security mechanisms of the KUIRO platform;</li>
              <li>Transmits malware, automated spam, or unsolicited mass messaging violating WhatsApp Business policies.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">08.</span>
              <span>Third-Party Platforms (Meta, LinkedIn, X)</span>
            </h2>
            <p className="text-xs text-slate-300">
              KUIRO connects to third-party social networks via official developer APIs. You must maintain active and compliant accounts with Meta, LinkedIn, and X. KUIRO is not responsible for suspensions, reach limitations, or API modifications implemented by third-party social media networks.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">09.</span>
              <span>Limitation of Liability</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              To the maximum extent permitted by applicable law, KUIRO Technologies Inc., its directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business goodwill. KUIRO&apos;s total aggregate liability arising out of or related to these Terms shall not exceed the total amount paid by you to KUIRO in the twelve (12) months preceding the event giving rise to liability.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
              <span className="text-[#FF7A00] font-mono text-base">10.</span>
              <span>Governing Law & Dispute Resolution</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              These Terms and any dispute arising out of them shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any legal action or proceeding arising under these Terms shall be brought exclusively in the courts located in <strong>Kolkata, West Bengal, India</strong>, and the parties hereby consent to personal jurisdiction and venue therein.
            </p>
          </section>

          {/* Navigation Links */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <Link href="/privacy" className="text-[#FF7A00] hover:underline flex items-center gap-1.5">
              <span>Read Privacy Policy</span>
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
