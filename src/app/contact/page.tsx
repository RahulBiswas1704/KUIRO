'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AnnouncementBar, Navbar, Footer } from '@/components/layout';
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  SendHorizontal,
  Briefcase,
  ChevronDown,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export default function ContactPage() {
  const { isLoggedIn, handleGetStarted } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    whatsapp: '',
    email: '',
    ventureType: 'Small & Medium Business (Retail, Store, E-commerce)',
    inquiryTopic: '14-Day Free Trial & Onboarding',
    preferredContact: 'WhatsApp Message (Fastest)',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setTimeout(() => {
      setFormStatus('success');
    }, 1000);
  };

  const contactFaqs = [
    {
      q: 'Who is KUIRO built for?',
      a: 'KUIRO is engineered for Indian SMBs, retail store owners, D2C brands, creators, startup founders, consultants, and clinical practices. If you want consistent, high-converting digital marketing without spending hours on design or paying expensive agency retainers, KUIRO is for you.',
    },
    {
      q: 'How fast will someone respond after I reach out?',
      a: 'During standard Indian business hours (Mon–Sat, 9:00 AM – 8:00 PM IST), our solutions onboarding engineers respond on WhatsApp in under 15 minutes. For email inquiries, you will receive a detailed answer within 2 hours.',
    },
    {
      q: 'Can you help set up WhatsApp review on our existing business number?',
      a: 'Yes! Our team guides you through connecting your existing mobile or virtual number via official Meta Cloud API utility templates so you never lose any customer chat history.',
    },
    {
      q: 'Can KUIRO ingest our existing logos, brand colors, and guidelines?',
      a: 'Absolutely. During setup, KUIRO extracts your brand hex colors, SVG logos, pricing, and voice guidelines into persistent Neon PostgreSQL vector memory, ensuring all future campaigns are 100% on-brand.',
    },
    {
      q: 'Do you offer white-labeling and custom plans for marketing agencies?',
      a: 'Yes. Agencies and operators managing 10 to 50+ client brands receive dedicated multi-tenant workspaces, white-labeled WhatsApp sender IDs, custom Inngest queues, volume discounts, and GST-compliant invoicing.',
    },
    {
      q: 'Do you provide GST tax invoices with Input Tax Credit (ITC)?',
      a: 'Yes. All paid plans and custom subscriptions include automated GST tax invoices with Input Tax Credit (ITC) details sent directly to your registered billing email.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070A11] text-white flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-x-clip">
      {/* Top Subtle Announcement */}
      <AnnouncementBar
        badge="Priority Support Online"
        tagline="Instant WhatsApp Triage Active."
        subtitle="— Average response time under 15 minutes."
      />

      {/* Floating Glassmorphic Navbar (Zorcha Inspired) */}
      <Navbar activeRoute="contact" />

      {/* =========================================================================
          HERO SECTION (ZORCHA INSPIRED: HIGH-IMPACT, CLEAN, BOLD)
      ========================================================================= */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Subtle Warm Backdrop Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[420px] bg-gradient-to-b from-[#FF7A00]/[0.08] via-transparent to-transparent pointer-events-none -z-10 blur-3xl" />

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-xl text-xs shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-pulse" />
            <span className="font-semibold text-slate-200">Real Human Support & Onboarding</span>
            <span className="text-white/20">•</span>
            <span className="text-[#FF7A00] font-medium font-mono text-[11px]">&lt; 15 Mins Avg Response</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-sora font-extrabold tracking-tight text-white leading-[1.08]">
            We’re Here to Put Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#FF7A00]">
              Marketing on Autopilot.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-inter leading-relaxed">
            Have questions about Brand Brain ingestion, our 48-hour WhatsApp approval loop, Campaign ROI tracking, or agency workspaces? Connect with our team directly.
          </p>

          {/* Quick SLA Metrics Strip */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-bold">&lt; 15 Mins</span> Avg WhatsApp Response
            </div>
            <span className="hidden sm:inline text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Free 1-on-1 Onboarding Call</span>
            </div>
            <span className="hidden sm:inline text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#FF7A00]" />
              <span>GST Invoicing & Input Tax Credit</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MAIN 2-COLUMN CONTACT & DIRECT CONSULTATION GRID
      ========================================================================= */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (5 cols): Direct Reach Channels & SLA Cards */}
          <div className="lg:col-span-5 space-y-6 text-left">
            {/* Priority WhatsApp Direct Channel Card */}
            <div className="p-7 rounded-[32px] bg-gradient-to-br from-[#0C151B] to-[#0A0E18] border border-emerald-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                  Fastest Channel
                </span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Team Online
                </span>
              </div>

              <div>
                <h3 className="font-sora text-2xl font-bold text-white">Chat on WhatsApp</h3>
                <p className="text-xs text-slate-300 font-inter mt-1.5 leading-relaxed">
                  Message our solutions engineers directly for instant onboarding assistance, setup questions, or live bot previews.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <span className="text-sm font-mono font-bold text-white block">+91 98765 43210</span>
                    <span className="text-[11px] text-slate-400 block font-inter">Mon–Sat • 9:00 AM – 8:00 PM IST</span>
                  </div>
                </div>

                <a
                  href="https://wa.me/919876543210?text=Hi%20KUIRO%20Team%2C%20I%20want%20to%20learn%20more%20about%20putting%20my%20marketing%20on%20autopilot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-sora transition whitespace-nowrap shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <span>Chat Now</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Direct Communication Hubs Card */}
            <div className="p-7 rounded-[32px] bg-[#0A0E18] border border-white/[0.08] space-y-5 shadow-2xl">
              <h3 className="font-sora text-xl font-bold text-white">Direct Communication Hubs</h3>

              <div className="space-y-3.5 text-xs font-inter">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail size={16} />
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-white block">Email Channels</span>
                    <p className="text-slate-400 text-[11px]">
                      General: <a href="mailto:hello@kuiro.in" className="text-white hover:text-[#FF7A00] font-mono">hello@kuiro.in</a>
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Customer Support: <a href="mailto:support@kuiro.in" className="text-white hover:text-[#FF7A00] font-mono">support@kuiro.in</a>
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Agencies & Partners: <a href="mailto:partners@kuiro.in" className="text-white hover:text-[#FF7A00] font-mono">partners@kuiro.in</a>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Telephone Helpline</span>
                    <p className="text-slate-300 font-mono text-[11px] mt-0.5">+91 (080) 4123 9870</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">Toll-free customer line (Mon–Sat, 9 AM – 8 PM IST)</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Indian Operating Hubs</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      <strong>Bengaluru:</strong> Indiranagar 100ft Road, Karnataka 560038
                    </p>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      <strong>Mumbai:</strong> Bandra Kurla Complex (BKC), Maharashtra 400051
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-300 flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>GST Invoicing Available. Input Tax Credit (ITC) details issued on all paid plans.</span>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Tactile Direct Message & Consultation Form */}
          <div className="lg:col-span-7 bg-[#0A0E18] p-7 sm:p-10 rounded-[32px] border border-white/[0.09] shadow-2xl text-left">
            <div className="mb-6 space-y-1.5">
              <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
                Direct Message
              </span>
              <h2 className="text-2xl sm:text-3xl font-sora font-extrabold text-white tracking-tight">
                Tell Us About Your Venture
              </h2>
              <p className="text-xs text-slate-400 font-inter leading-relaxed">
                Whether you run an SMB, personal brand, startup, clinical practice, or agency, tell us what you need. We will calibrate your Brand Brain preview and answer any questions.
              </p>
            </div>

            {formStatus === 'success' ? (
              <div className="p-8 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-4 animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check size={28} />
                </div>
                <h3 className="font-sora font-bold text-white text-xl">Inquiry Successfully Received!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed font-inter">
                  Thank you, <strong className="text-white">{formData.name || 'Friend'}</strong>. Our solutions team has received your details and will connect via <span className="text-emerald-400 font-semibold">{formData.preferredContact}</span> at <span className="font-mono text-emerald-400 font-bold">{formData.whatsapp || '+91 98765 43210'}</span> within 15 minutes.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={`https://wa.me/919876543210?text=Hi%20KUIRO%20Team%2C%20this%20is%20${encodeURIComponent(formData.name)}%20from%20${encodeURIComponent(formData.businessName)}.%20I%20just%20submitted%20the%20contact%20form%20for%20${encodeURIComponent(formData.inquiryTopic)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-sora transition shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2"
                  >
                    <Smartphone size={14} />
                    <span>Continue on WhatsApp Now</span>
                  </a>

                  <button
                    onClick={() => {
                      setFormStatus('idle');
                      setFormData({
                        name: '',
                        businessName: '',
                        whatsapp: '',
                        email: '',
                        ventureType: 'Small & Medium Business (Retail, Store, E-commerce)',
                        inquiryTopic: '14-Day Free Trial & Onboarding',
                        preferredContact: 'WhatsApp Message (Fastest)',
                        message: ''
                      });
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold font-sora transition border border-white/10"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 font-inter text-xs">
                {/* Name & Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rohan Sharma / Vikram Malhotra"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white focus:outline-none focus:border-[#FF7A00] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Brand, Business, or Creator Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="e.g. Kolkata Chai Co. / Studio Apex"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white focus:outline-none focus:border-[#FF7A00] transition"
                    />
                  </div>
                </div>

                {/* WhatsApp & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      WhatsApp Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white focus:outline-none focus:border-[#FF7A00] transition font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Work / Personal Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rohan@mybrand.in"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white focus:outline-none focus:border-[#FF7A00] transition"
                    />
                  </div>
                </div>

                {/* Venture Type & Inquiry Topic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Venture / Business Category
                    </label>
                    <select
                      value={formData.ventureType}
                      onChange={(e) => setFormData({ ...formData, ventureType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#0A0E18] border border-white/[0.1] text-white focus:outline-none focus:border-[#FF7A00] transition cursor-pointer"
                    >
                      <option value="Small & Medium Business (Retail, Store, E-commerce)">Small & Medium Business (Retail, Store, E-commerce)</option>
                      <option value="Personal Brand & Creator">Personal Brand / Creator / Executive / Coach</option>
                      <option value="Founder / Startup / B2B">Founder / Tech Startup / B2B Company</option>
                      <option value="Professional Services & Consultancy">Professional Services (Consultancy, Legal, Real Estate)</option>
                      <option value="Practice, Clinic & Healthcare">Practice, Clinic & Healthcare (Dentistry, Aesthetics, Wellness)</option>
                      <option value="Food & Beverage / Restaurant">Food & Beverage / Cafe / Hospitality</option>
                      <option value="Marketing Agency">Marketing Agency (Multi-Client Operator)</option>
                      <option value="Other Business / Individual">Other Independent Business / Individual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      What would you like to explore?
                    </label>
                    <select
                      value={formData.inquiryTopic}
                      onChange={(e) => setFormData({ ...formData, inquiryTopic: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#0A0E18] border border-white/[0.1] text-white focus:outline-none focus:border-[#FF7A00] transition cursor-pointer"
                    >
                      <option value="14-Day Free Trial & Onboarding">14-Day Free Trial & Onboarding</option>
                      <option value="Brand Brain Extraction Walkthrough">Brand Brain Extraction Walkthrough</option>
                      <option value="WhatsApp Review Bot Integration">WhatsApp Review Bot Integration</option>
                      <option value="Campaign ROI Attribution Setup">Campaign ROI Attribution Setup</option>
                      <option value="Agency Multi-Client Workspace">Agency Multi-Client Workspace (10+ Brands)</option>
                      <option value="Custom Billing / Enterprise Plan">Custom Billing / Enterprise Plan</option>
                    </select>
                  </div>
                </div>

                {/* Preferred Contact Method */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    Preferred Contact Channel
                  </label>
                  <select
                    value={formData.preferredContact}
                    onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0A0E18] border border-white/[0.1] text-white focus:outline-none focus:border-[#FF7A00] transition cursor-pointer"
                  >
                    <option value="WhatsApp Message (Fastest)">WhatsApp Message (Fastest • Avg &lt; 15 mins)</option>
                    <option value="Phone Call">Phone Call from a Solutions Engineer</option>
                    <option value="Google Meet Consultation">Google Meet Strategy &amp; Setup Session</option>
                    <option value="Email Response">Email Response</option>
                  </select>
                </div>

                {/* Message / Goals */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    How can we help your venture? (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your brand goals, monthly post schedule, channels you want to automate, or specific questions..."
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white focus:outline-none focus:border-[#FF7A00] transition resize-none"
                  />
                </div>

                {/* High-Contrast Action Button */}
                <button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className="w-full py-4 rounded-2xl bg-white text-black font-extrabold text-xs sm:text-sm font-sora hover:scale-105 transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {formStatus === 'submitting' ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Sending Inquiry to Onboarding Team...</span>
                    </>
                  ) : (
                    <>
                      <SendHorizontal size={14} />
                      <span>Send Inquiry & Request Priority Walkthrough →</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          AGENCY & MULTI-CLIENT PARTNERSHIP SECTION
      ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="p-8 sm:p-12 rounded-[32px] bg-[#0A0E18] border border-white/[0.09] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl text-left">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono uppercase font-bold">
              Agencies & Operators
            </div>
            <h3 className="font-sora text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Managing 10+ Client Accounts, Stores, or Franchises?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-inter leading-relaxed">
              We offer dedicated multi-tenant workspaces, white-labeled WhatsApp sender IDs, custom Inngest queues, volume discounts, and specialized billing agreements for agency operators.
            </p>
          </div>

          <a
            href="mailto:partners@kuiro.in?subject=Agency%20Partnership%20Inquiry%20-%20KUIRO"
            className="px-7 py-3.5 rounded-2xl bg-white text-black font-extrabold font-sora text-xs sm:text-sm hover:scale-105 transition-all duration-300 shadow-lg shrink-0 flex items-center gap-2 whitespace-nowrap"
          >
            <Briefcase size={14} />
            <span>Schedule Agency Meeting →</span>
          </a>
        </div>
      </section>

      {/* =========================================================================
          FREQUENTLY ASKED CONTACT QUESTIONS (ACCORDION)
      ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-left">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#FF7A00] font-bold">
            Quick Answers
          </span>
          <h2 className="text-3xl sm:text-4xl font-sora font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-sm font-inter">
            Got questions before getting started? Here is how our team and platform work.
          </p>
        </div>

        <div className="space-y-3">
          {contactFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.08] bg-[#0A0E18] overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-sora font-semibold text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#FF7A00]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 font-inter leading-relaxed border-t border-white/[0.05] pt-3 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          BOTTOM HIGH-IMPACT CONVERSION BANNER
      ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="p-8 sm:p-14 rounded-[32px] bg-gradient-to-b from-[#0F1420] to-[#070A11] border border-white/[0.12] relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF7A00]/15 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-mono font-bold">
            <Sparkles size={13} />
            <span>14-Day Risk-Free Trial</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-sora font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
            Ready to automate your marketing <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#FF7A00]">
              with zero routine work?
            </span>
          </h2>

          <p className="text-sm text-slate-300 font-inter max-w-xl mx-auto leading-relaxed">
            Launch your Brand Brain in 60 seconds. Experience your first WhatsApp campaign review in minutes.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-white text-black font-extrabold text-sm sm:text-base rounded-2xl px-8 py-4 hover:scale-105 shadow-[0_10px_25px_-5px_rgba(255,255,255,0.25)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isLoggedIn ? 'Go to Dashboard →' : 'Start 14-Day Free Trial (₹0) →'}</span>
            </button>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-sm font-semibold transition border border-white/10 flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <Smartphone size={16} />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
