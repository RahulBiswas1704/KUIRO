'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AnnouncementBar, Navbar, Footer } from '@/components/layout';
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Check,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Clock,
  SendHorizontal,
  Building2,
  Briefcase,
  Layers,
  Calendar,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Globe2,
  Lock,
  Headphones,
  TrendingUp,
  Zap,
  Users,
  ShoppingBag,
  User,
  Stethoscope,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function RedesignedContactPage() {
  const { isLoggedIn, handleGetStarted } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
    }, 1100);
  };

  const contactFaqs = [
    {
      q: 'Who can use KUIRO?',
      a: 'KUIRO is built for everyone: small and medium businesses (SMBs), local retail stores, personal brands, creators, freelancers, startup founders, consultants, and professional practices. If you want consistent, high-converting digital marketing without spending hours on design or paying expensive agency retainers, KUIRO is for you.',
    },
    {
      q: 'How fast will someone respond after I reach out?',
      a: 'During standard Indian business hours (Mon–Sat, 9:00 AM – 8:00 PM IST), our onboarding engineers respond on WhatsApp in under 15 minutes. For email inquiries, you will receive a detailed answer within 2 hours.',
    },
    {
      q: 'Can you help set up WhatsApp review on our existing business number?',
      a: 'Yes! Our team will guide you through connecting your existing mobile or virtual number via official Meta Cloud API utility templates so you never lose any customer chat history.',
    },
    {
      q: 'Can KUIRO ingest our existing logos, brand colors, and guidelines?',
      a: 'Absolutely. During setup, KUIRO extracts your brand hex colors, logos, pricing, and voice guidelines into persistent Neon DB vector memory, ensuring all future campaigns are 100% on-brand.',
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* 1. Top Announcement Notification Bar */}
      <AnnouncementBar
        badge="Priority Support Online"
        tagline="Instant WhatsApp Triage Active."
        subtitle="— Average response time under 15 minutes."
      />

      {/* 2. Unified Sticky Navbar */}
      <Navbar
        activeRoute="contact"
        badgeText="Contact & Support"
        statusText="Support Online"
        rightContent={
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/919876543210?text=Hi%20KUIRO%20Team%2C%20I%20have%20a%20question%20about%20putting%20my%20marketing%20on%20autopilot"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex text-[11px] text-emerald-400 items-center gap-1.5 font-medium bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-500/20 hover:border-emerald-500/50 transition"
            >
              <Smartphone size={13} className="text-emerald-400" />
              <span>WhatsApp Helpline</span>
            </a>

            <button
              onClick={handleGetStarted}
              className="px-4 py-1.5 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-semibold font-sora transition shadow-md shadow-[#FF7A00]/25"
            >
              <span>{isLoggedIn ? 'Dashboard' : 'Get Started'}</span>
            </button>
          </div>
        }
      />

      {/* 3. Hero Header Section */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Radiant Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-semibold tracking-wide">
            <Headphones className="h-4 w-4 text-[#FF7A00]" />
            <span>Dedicated Customer Support & Solutions</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-sora font-bold text-white tracking-tight leading-tight">
            We’re Here to Put Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] via-[#FFA34D] to-emerald-400">
              Marketing on Autopilot.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-inter leading-relaxed">
            Have questions about Brand Brain ingestion, our 48-hour WhatsApp approval loop, Campaign ROI tracking, or agency workspaces? Connect with our team directly.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-bold">&lt; 15 Mins</span> Avg WhatsApp Response
            </div>
            <span className="hidden sm:inline text-slate-600">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Free 1-on-1 Onboarding Call</span>
            </div>
            <span className="hidden sm:inline text-slate-600">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#FF7A00]" />
              <span>GST Invoicing & Input Tax Credit</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Main 2-Column Contact & Consultation Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 cols): Direct Channels & SLA Metrics */}
          <div className="lg:col-span-5 space-y-6 text-left">
            {/* Priority WhatsApp Support Card */}
            <div className="p-6 rounded-[20px] bg-gradient-to-br from-[#0C151B] to-[#0B0F14] border border-emerald-500/30 shadow-2xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                  Fastest Channel
                </span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Team Online
                </span>
              </div>

              <div>
                <h3 className="font-sora text-xl font-bold text-white">Chat on WhatsApp</h3>
                <p className="text-xs text-slate-300 font-inter mt-1 leading-relaxed">
                  Message our solutions engineers directly for instant onboarding help, setup questions, or live bot previews.
                </p>
              </div>

              <div className="p-4 rounded-[12px] bg-[#111620] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Smartphone size={18} />
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
                  className="px-4 py-2 rounded-[8px] bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-sora transition whitespace-nowrap shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <span>Chat Now</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Direct Communication Channels Card */}
            <div className="p-6 rounded-[20px] bg-[#0B0F14] border border-white/10 space-y-5">
              <h3 className="font-sora text-lg font-bold text-white">Direct Communication Hubs</h3>

              <div className="space-y-3.5 text-xs font-inter">
                <div className="p-3.5 rounded-[12px] bg-[#11141A] border border-white/5 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
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

                <div className="p-3.5 rounded-[12px] bg-[#11141A] border border-white/5 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Telephone Helpline</span>
                    <p className="text-slate-300 font-mono text-[11px] mt-0.5">+91 (080) 4123 9870</p>
                    <p className="text-slate-500 text-[10px]">Toll-free customer line (Mon–Sat, 9 AM – 8 PM)</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-[12px] bg-[#11141A] border border-white/5 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
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

              <div className="p-3.5 rounded-[12px] bg-white/[0.03] border border-white/10 text-[11px] text-slate-300 flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>GST Invoicing Available. Input Tax Credit (ITC) details issued on all paid plans.</span>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Interactive Contact & Consultation Form */}
          <div className="lg:col-span-7 bg-[#0B0F14] p-6 sm:p-8 rounded-[20px] border border-white/15 shadow-2xl text-left">
            <div className="mb-6 space-y-1.5">
              <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
                Direct Message
              </span>
              <h2 className="text-2xl sm:text-3xl font-sora font-bold text-white">
                Tell Us About Your Venture
              </h2>
              <p className="text-xs text-slate-400 font-inter leading-relaxed">
                Whether you run an SMB, personal brand, startup, clinical practice, or agency, tell us what you are looking for. We will configure your Brand Brain preview and answer any questions.
              </p>
            </div>

            {formStatus === 'success' ? (
              <div className="p-8 rounded-[16px] bg-emerald-950/40 border border-emerald-500/40 text-center space-y-4 animate-fade-in">
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
                    className="w-full sm:w-auto px-6 py-2.5 rounded-[10px] bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-sora transition shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2"
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
                    className="w-full sm:w-auto px-5 py-2.5 rounded-[10px] bg-white/10 hover:bg-white/20 text-white text-xs font-semibold font-sora transition"
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
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition"
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
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition"
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
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition font-mono"
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
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition"
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
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition"
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
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition"
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
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition"
                  >
                    <option value="WhatsApp Message (Fastest)">WhatsApp Message (Fastest • Avg &lt; 15 mins)</option>
                    <option value="Phone Call">Phone Call from a Solutions Engineer</option>
                    <option value="Google Meet Live Demo">Google Meet Screen-Share Demo</option>
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
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className="w-full py-3.5 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition shadow-lg shadow-[#FF7A00]/25 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {formStatus === 'submitting' ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Sending Inquiry to Onboarding Team...</span>
                    </>
                  ) : (
                    <>
                      <SendHorizontal size={14} />
                      <span>Send Inquiry & Request Priority Walkthrough</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 5. Agency & Multi-Client Partnership Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/10">
        <div className="p-8 sm:p-10 rounded-[20px] bg-gradient-to-r from-[#0B0F14] via-[#111722] to-[#0B0F14] border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl text-left">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono uppercase font-bold">
              Agencies & Operators
            </div>
            <h3 className="font-sora text-xl sm:text-2xl font-bold text-white">
              Managing 10+ Client Accounts, Stores, or Franchises?
            </h3>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              We offer dedicated multi-tenant workspaces, white-labeled WhatsApp sender IDs, custom Inngest queues, volume discounts, and specialized billing agreements for agency operators.
            </p>
          </div>

          <a
            href="mailto:partners@kuiro.in?subject=Agency%20Partnership%20Inquiry%20-%20KUIRO"
            className="px-6 py-3 rounded-[10px] bg-white text-[#0B0F14] hover:bg-gray-100 font-sora font-semibold text-xs transition shadow-md shrink-0 flex items-center gap-2 whitespace-nowrap"
          >
            <Briefcase size={14} />
            <span>Schedule Agency Meeting</span>
          </a>
        </div>
      </section>

      {/* 6. FAQ Accordion Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-left">
        <div className="text-center mb-10 space-y-1">
          <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
            Quick Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-sora font-bold text-white tracking-tight">
            Frequently Asked Contact Questions
          </h2>
          <p className="text-xs text-slate-400 font-inter">
            Got questions before getting started? Here is how our team and platform work.
          </p>
        </div>

        <div className="space-y-3">
          {contactFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-[12px] bg-[#0B0F14] border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 focus:outline-none font-sora font-semibold text-sm text-white hover:text-[#FF7A00] transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-[#FF7A00] shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-slate-300 font-inter leading-relaxed border-t border-white/5 pt-3 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Bottom Conversion Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-[20px] bg-gradient-to-br from-[#0B0F14] via-[#1A1208] to-[#0B0F14] border-2 border-[#FF7A00]/40 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] text-xs font-semibold">
              <Sparkles size={13} />
              <span>14-Day Risk-Free Trial</span>
            </span>

            <h2 className="font-sora text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Ready to automate your marketing <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] via-[#FFA34D] to-emerald-400">
                with zero routine work?
              </span>
            </h2>

            <p className="text-sm text-slate-300 font-inter leading-relaxed">
              Launch your Brand Brain in 60 seconds. Experience your first WhatsApp campaign review in minutes.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-7 py-3.5 rounded-[12px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-sm font-sora font-semibold transition shadow-lg shadow-[#FF7A00]/30 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{isLoggedIn ? 'Go to Dashboard' : 'Start 14-Day Free Trial (₹0)'}</span>
                <ArrowRight size={15} />
              </button>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-[12px] bg-white text-[#0B0F14] hover:bg-gray-100 text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                <Smartphone size={16} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Unified Global Footer */}
      <Footer />
    </div>
  );
}
