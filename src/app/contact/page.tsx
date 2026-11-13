'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { GetStartedButton } from '@/components/auth';
import { AnnouncementBar, Navbar, Footer } from '@/components/layout';
import { 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  X as CloseIcon, 
  Menu, 
  MessageCircle, 
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
  TrendingUp
} from 'lucide-react';

export default function ContactPage() {
  const { isLoggedIn, handleGetStarted } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    whatsapp: '',
    email: '',
    vertical: 'Clinic & Healthcare',
    preferredContact: 'WhatsApp Message',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setTimeout(() => {
      setFormStatus('success');
    }, 1200);
  };

  const contactFaqs = [
    {
      q: 'How fast will someone reach out after I submit this form?',
      a: 'During standard Indian business hours (9:00 AM – 8:00 PM IST), our onboarding engineers typically message you on WhatsApp or call within 15 minutes.'
    },
    {
      q: 'Can you help set up our WhatsApp Cloud bot on our existing clinic number?',
      a: 'Yes. Our team will guide you through connecting your existing clinic landline or virtual mobile number using official Meta Cloud API utility templates so you don’t lose any patient chat history.'
    },
    {
      q: 'Can you ingest our existing clinic menu, fee schedule, and Canva templates?',
      a: 'Absolutely. During onboarding, our team extracts your existing color palettes, doctor credentials, and visual templates directly into your persistent Brand Brain in pgvector.'
    },
    {
      q: 'Do you offer custom pricing and white-labeling for marketing agencies?',
      a: 'Yes! Agencies managing 10 to 50+ clients receive dedicated multi-tenant workspaces, white-labeled WhatsApp sender IDs, custom GST invoicing, and volume discounts.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* Top Notification Announcement Bar */}
      <AnnouncementBar 
        badge="Direct Support Online" 
        tagline="Instant WhatsApp Triage Active." 
        subtitle="— Average response time under 15 minutes." 
      />

      {/* Main Sticky Navbar */}
      <Navbar 
        activeRoute="contact" 
        badgeText="Contact Us" 
        rightContent={
          <>
            <a
              href="https://wa.me/919876543210?text=Hi%20KUIRO%20Team%2C%20I%20have%20a%20question%20about%20the%20AI%20Marketing%20Employee"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex text-[11px] text-emerald-400 items-center gap-1.5 font-medium bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/20 hover:border-emerald-500/50 transition"
            >
              <Smartphone size={13} className="text-emerald-400" />
              <span>WhatsApp Helpline</span>
            </a>

            <GetStartedButton />
          </>
        }
      />

      {/* Hero Header */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-950/80 border border-orange-700/50 text-orange-300 text-xs sm:text-sm font-medium">
            <Headphones className="h-4 w-4 text-[#FF7A00]" />
            <span>Dedicated Indian Support & Engineering</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-sora font-bold text-white tracking-tight leading-tight">
            We’re Here to Help Put Your <br />
            <span className="text-[#FF7A00]">Marketing on Autopilot.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-inter leading-relaxed">
            Have questions about Brand Brain extraction, our 48-hour WhatsApp protocol, or agency multi-tenant workspaces? Connect with us directly.
          </p>
        </div>
      </section>

      {/* Main 2-Column Contact Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Direct Channels & Offices */}
          <div className="lg:col-span-5 space-y-6">
            {/* WhatsApp Priority Card */}
            <div className="p-6 rounded-[18px] bg-gradient-to-br from-emerald-950/30 to-[#0B0F14] border border-emerald-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                  Fastest Response (Avg &lt; 15m)
                </span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>

              <div>
                <h3 className="font-sora text-xl font-bold text-white">Chat on WhatsApp</h3>
                <p className="text-xs text-slate-400 font-inter mt-1">
                  Connect instantly with our engineering and growth team for onboarding guidance.
                </p>
              </div>

              <div className="p-3.5 rounded-[12px] bg-[#11141A] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">+91 98765 43210</span>
                    <span className="text-[10px] text-slate-400 block">Mon-Sat, 9 AM - 8 PM IST</span>
                  </div>
                </div>
                <a
                  href="https://wa.me/919876543210?text=Hi%20KUIRO%20Team%2C%20I%20would%20like%20to%20learn%20more%20about%20the%20AI%20Marketing%20Employee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-[8px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-semibold transition"
                >
                  Chat Now
                </a>
              </div>
            </div>

            {/* Direct Channels Box */}
            <div className="p-6 rounded-[18px] bg-[#0B0F14] border border-white/10 space-y-5">
              <h3 className="font-sora text-lg font-bold text-white">Direct Communication</h3>

              <div className="space-y-4 text-xs font-inter">
                <div className="p-3.5 rounded-[12px] bg-[#11141A] border border-white/5 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Email Inquiries</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      General: <a href="mailto:hello@kuiro.ai" className="text-white hover:underline font-mono">hello@kuiro.ai</a>
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Support: <a href="mailto:support@kuiro.ai" className="text-white hover:underline font-mono">support@kuiro.ai</a>
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Agencies: <a href="mailto:partners@kuiro.ai" className="text-white hover:underline font-mono">partners@kuiro.ai</a>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-[12px] bg-[#11141A] border border-white/5 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Phone Helpline</span>
                    <p className="text-slate-300 font-mono text-[11px] mt-0.5">+91 (080) 4123 9870</p>
                    <p className="text-slate-500 text-[10px]">Toll-free customer line (Mon–Sat)</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-[12px] bg-[#11141A] border border-white/5 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Indian Operating Hubs</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      <strong>Bangalore:</strong> Indiranagar 100ft Road, Karnataka 560038
                    </p>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      <strong>Mumbai:</strong> Bandra Kurla Complex (BKC), Maharashtra 400051
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-[12px] bg-white/5 border border-white/10 text-[11px] text-slate-300 flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>GST Invoicing Available. Input Tax Credit (ITC) details issued on all paid plans.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Consultation & Message Form */}
          <div className="lg:col-span-7 bg-[#0B0F14] p-6 sm:p-8 rounded-[18px] border border-white/15 shadow-2xl">
            <div className="mb-6">
              <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
                Direct Message
              </span>
              <h2 className="text-2xl font-sora font-bold text-white mt-1">
                Send Us a Message
              </h2>
              <p className="text-xs text-slate-400 font-inter mt-1 leading-relaxed">
                Tell us about your clinic, cafe, retail brand, or agency. We'll configure your custom Brand Brain preview and answer any questions.
              </p>
            </div>

            {formStatus === 'success' ? (
              <div className="p-8 rounded-[14px] bg-emerald-950/40 border border-emerald-500/40 text-center space-y-4 animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check size={28} />
                </div>
                <h3 className="font-sora font-bold text-white text-xl">Inquiry Received!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-white">{formData.name || 'Partner'}</strong>. Our engineering team has received your details and will reach out via <span className="text-emerald-400 font-medium">{formData.preferredContact}</span> at <span className="font-mono text-emerald-400">{formData.whatsapp || '+91 98765 43210'}</span> within 15 minutes.
                </p>
                <button
                  onClick={() => {
                    setFormStatus('idle');
                    setFormData({ name: '', businessName: '', whatsapp: '', email: '', vertical: 'Clinic & Healthcare', preferredContact: 'WhatsApp Message', message: '' });
                  }}
                  className="mt-4 px-5 py-2.5 rounded-[10px] bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 font-inter text-xs">
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
                      placeholder="Dr. Rajesh Sharma"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Business or Clinic Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="Apex Multispecialty Dental Care"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition"
                    />
                  </div>
                </div>

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
                      Work Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="dr.sharma@apexclinic.in"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Business Vertical
                    </label>
                    <select
                      value={formData.vertical}
                      onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition"
                    >
                      <option value="Clinic & Healthcare">Clinic & Healthcare Practice</option>
                      <option value="Food & Beverage / Cafe">Food & Beverage / Restaurant / Cafe</option>
                      <option value="Retail & D2C Brand">Retail & D2C Store</option>
                      <option value="Marketing Agency">Marketing Agency (Multi-Client)</option>
                      <option value="Other Business">Other SMB / Founder</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Preferred Contact Method
                    </label>
                    <select
                      value={formData.preferredContact}
                      onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition"
                    >
                      <option value="WhatsApp Message">WhatsApp Message (Fastest)</option>
                      <option value="Phone Call">Phone Call</option>
                      <option value="Google Meet Demo">Google Meet Walkthrough</option>
                      <option value="Email Response">Email Response</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    How can we help your business? (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your marketing challenges, monthly post goals, or multi-location agency requirements..."
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className="w-full py-3.5 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition shadow-md shadow-[#FF7A00]/25 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {formStatus === 'submitting' ? (
                    <span>Delivering Your Message...</span>
                  ) : (
                    <>
                      <SendHorizontal size={14} />
                      <span>Send Message & Request Priority Walkthrough</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Agency & Enterprise Collaboration Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/10">
        <div className="p-8 sm:p-10 rounded-[18px] bg-gradient-to-r from-[#0B0F14] via-[#111722] to-[#0B0F14] border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono uppercase font-bold">
              Agency & Enterprise
            </div>
            <h3 className="font-sora text-xl sm:text-2xl font-bold text-white">
              Managing 10+ Clinics, Stores, or Client Accounts?
            </h3>
            <p className="text-xs text-slate-300 font-inter leading-relaxed">
              We offer dedicated multi-tenant workspaces, white-labeled WhatsApp sender IDs, custom Inngest queues, volume discounts, and specialized billing agreements.
            </p>
          </div>

          <a
            href="mailto:partners@kuiro.ai?subject=Agency%20Partnership%20Inquiry%20-%20KUIRO"
            className="px-6 py-3 rounded-[10px] bg-white text-[#0B0F14] hover:bg-gray-100 font-sora font-semibold text-xs transition shadow-md shrink-0 flex items-center gap-2"
          >
            <Briefcase size={14} />
            <span>Schedule Agency Meeting</span>
          </a>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
            Quick Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-sora font-bold text-white tracking-tight mt-1">
            Frequently Asked Contact Questions
          </h2>
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
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-sora font-semibold text-sm text-white">{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} className="text-[#FF7A00] shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-slate-300 font-inter leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-[20px] bg-gradient-to-br from-[#0B0F14] via-[#1A1208] to-[#0B0F14] border-2 border-[#FF7A00]/40 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] text-xs font-semibold">
              <Sparkles size={13} />
              <span>14-Day Full Autopilot Free Trial</span>
            </span>

            <h2 className="font-sora text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Ready to automate your marketing <br />
              <span className="text-[#FF7A00]">with zero routine work?</span>
            </h2>

            <p className="text-sm text-slate-300 font-inter leading-relaxed">
              Launch your Brand Brain in 30 seconds. Experience your first WhatsApp campaign review in minutes.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-7 py-3.5 rounded-[12px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-sm font-sora font-semibold transition shadow-lg shadow-[#FF7A00]/30 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'}</span>
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
