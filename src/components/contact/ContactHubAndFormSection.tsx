'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Check,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  SendHorizontal,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

interface ContactFormState {
  name: string;
  businessName: string;
  whatsapp: string;
  email: string;
  ventureType: string;
  inquiryTopic: string;
  preferredContact: string;
  message: string;
}

const INITIAL_FORM_STATE: ContactFormState = {
  name: '',
  businessName: '',
  whatsapp: '',
  email: '',
  ventureType: 'Small & Medium Business (Retail, Store, E-commerce)',
  inquiryTopic: '14-Day Free Trial & Onboarding',
  preferredContact: 'WhatsApp Message (Fastest)',
  message: '',
};

/**
 * Light Editorial Contact Channels Column, Interactive Onboarding Inquiry Form & Agency Callout.
 */
export default function ContactHubAndFormSection() {
  const [formData, setFormData] = useState<ContactFormState>(INITIAL_FORM_STATE);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setTimeout(() => {
      setFormStatus('success');
    }, 600);
  };

  const inputClassName =
    'w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E7DED3] text-[#0B0F14] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#FF7A00] transition text-xs sm:text-sm';

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F9FAFD] overflow-hidden">
      {/* Subtle warm editorial backdrop glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-32 left-1/2 -translate-x-1/2 w-[740px] h-[420px] rounded-full bg-gradient-to-tr from-[#FFE2C6]/60 via-[#FFF0E0]/55 to-[#E8ECFF]/40 blur-[95px]"
      />

      <div className="relative z-10 max-w-6xl mx-auto space-y-10">
        {/* MAIN 2-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-8 items-start">
          {/* LEFT COLUMN: DIRECT REACH HUBS */}
          <div className="lg:col-span-5 space-y-6 text-left">
            {/* Priority WhatsApp Card */}
            <div className="rounded-[26px] bg-white border-2 border-emerald-500/40 shadow-[0_18px_42px_-22px_rgba(16,185,129,0.22)] p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                  Fastest Channel
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Live Team Online
                </span>
              </div>

              <div>
                <h2 className="font-sora text-2xl font-extrabold text-[#0B0F14]">
                  Chat on WhatsApp
                </h2>
                <p className="text-xs sm:text-sm text-[#4B5563] font-inter mt-1.5 leading-relaxed">
                  Message our onboarding specialists directly for setup help, Brand Brain previews,
                  or quick questions.
                </p>
              </div>

              <div className="rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Smartphone size={19} />
                  </div>
                  <div>
                    <span className="font-mono text-sm font-bold text-[#0B0F14] tabular-nums block">
                      +91 98765 43210
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      Mon–Sat • 9:00 AM – 8:00 PM IST
                    </span>
                  </div>
                </div>

                <a
                  href="https://wa.me/919876543210?text=Hi%20KUIRO%20Team%2C%20I%20want%20to%20learn%20more%20about%20putting%20my%20marketing%20on%20autopilot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sora font-bold transition whitespace-nowrap inline-flex items-center gap-1.5"
                >
                  <span>Chat Now</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Communication Hubs Card */}
            <div className="rounded-[26px] bg-white border border-gray-200 shadow-[0_12px_32px_-22px_rgba(15,23,42,0.12)] p-6 sm:p-7 space-y-4">
              <h3 className="font-sora text-lg font-extrabold text-[#0B0F14]">
                Direct Communication Hubs
              </h3>

              <div className="space-y-3 text-xs font-inter">
                <div className="rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] p-4 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-[#FF7A00] flex items-center justify-center shrink-0 mt-0.5">
                    <Mail size={15} />
                  </div>
                  <div className="space-y-1">
                    <span className="font-sora font-bold text-[#0B0F14] block">Email Desks</span>
                    <p className="text-gray-600">
                      General:{' '}
                      <a
                        href="mailto:hello@kuiro.in"
                        className="font-mono font-semibold text-[#0B0F14] hover:text-[#FF7A00] transition"
                      >
                        hello@kuiro.in
                      </a>
                    </p>
                    <p className="text-gray-600">
                      Support:{' '}
                      <a
                        href="mailto:support@kuiro.in"
                        className="font-mono font-semibold text-[#0B0F14] hover:text-[#FF7A00] transition"
                      >
                        support@kuiro.in
                      </a>
                    </p>
                    <p className="text-gray-600">
                      Agencies:{' '}
                      <a
                        href="mailto:partners@kuiro.in"
                        className="font-mono font-semibold text-[#0B0F14] hover:text-[#FF7A00] transition"
                      >
                        partners@kuiro.in
                      </a>
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] p-4 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-[#FF7A00] flex items-center justify-center shrink-0 mt-0.5">
                    <Phone size={15} />
                  </div>
                  <div>
                    <span className="font-sora font-bold text-[#0B0F14] block">
                      Telephone Helpline
                    </span>
                    <p className="font-mono font-semibold text-[#0B0F14] tabular-nums mt-0.5">
                      +91 (080) 4123 9870
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Mon–Sat • 9:00 AM – 8:00 PM IST
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] p-4 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-[#FF7A00] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={15} />
                  </div>
                  <div className="space-y-1">
                    <span className="font-sora font-bold text-[#0B0F14] block">Operating Hubs</span>
                    <p className="text-[#374151]">
                      <strong>Bengaluru:</strong> Indiranagar 100ft Road, Karnataka 560038
                    </p>
                    <p className="text-[#374151]">
                      <strong>Mumbai:</strong> Bandra Kurla Complex (BKC), Maharashtra 400051
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[#FFF8F1] border border-[#F0DFCF] px-4 py-3 text-[11px] text-[#374151] flex items-center gap-2.5">
                <ShieldCheck size={15} className="text-[#FF7A00] shrink-0" />
                <span>18% GST tax invoices with Input Tax Credit issued on all paid plans.</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: INQUIRY FORM */}
          <div className="lg:col-span-7 p-px rounded-[28px] bg-gradient-to-b from-[#FF8E3C]/55 via-[#FF8E3C]/15 to-transparent">
            <div className="bg-white rounded-[27px] p-6 sm:p-10 text-left">
              <div className="mb-6 space-y-1.5">
                <span className="inline-block px-3.5 py-1 rounded-full bg-[#FFF5EB] border border-[#F5DEC6] text-[#C25400] text-[11px] font-semibold">
                  Direct Inquiry
                </span>
                <h2 className="font-sora text-2xl sm:text-3xl font-extrabold text-[#0B0F14] tracking-tight pt-1">
                  Tell us about your business
                </h2>
                <p className="text-xs sm:text-sm text-[#4B5563] font-inter leading-relaxed">
                  Whether you run a store, personal brand, clinic, or marketing agency—share your
                  goals and we’ll prepare a tailored Brand Brain walkthrough.
                </p>
              </div>

              {formStatus === 'success' ? (
                <div className="p-7 sm:p-9 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <Check size={24} />
                  </div>
                  <h3 className="font-sora font-extrabold text-[#0B0F14] text-xl">
                    Inquiry received!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#374151] max-w-md mx-auto leading-relaxed font-inter">
                    Thank you, <strong>{formData.name || 'Friend'}</strong>. Our onboarding team has
                    noted your request and will reach out via{' '}
                    <span className="text-emerald-700 font-semibold">
                      {formData.preferredContact}
                    </span>{' '}
                    at <span className="font-mono font-semibold">{formData.whatsapp}</span>.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/919876543210?text=Hi%20KUIRO%20Team%2C%20this%20is%20${encodeURIComponent(
                        formData.name
                      )}%20from%20${encodeURIComponent(
                        formData.businessName
                      )}.%20I%20just%20submitted%20an%20inquiry%20for%20${encodeURIComponent(
                        formData.inquiryTopic
                      )}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-sora font-bold transition inline-flex items-center justify-center gap-2"
                    >
                      <Smartphone size={15} />
                      <span>Continue on WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setFormStatus('idle');
                        setFormData(INITIAL_FORM_STATE);
                      }}
                      className="cursor-pointer w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-gray-50 text-[#0B0F14] text-xs sm:text-sm font-sora font-semibold transition border border-gray-200"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 font-inter">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-semibold text-[#374151] mb-1.5"
                      >
                        Your Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rohan Sharma"
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-business"
                        className="block text-xs font-semibold text-[#374151] mb-1.5"
                      >
                        Brand or Business Name *
                      </label>
                      <input
                        id="contact-business"
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={(e) =>
                          setFormData({ ...formData, businessName: e.target.value })
                        }
                        placeholder="e.g. Kolkata Chai Co."
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contact-whatsapp"
                        className="block text-xs font-semibold text-[#374151] mb-1.5"
                      >
                        WhatsApp Mobile Number *
                      </label>
                      <input
                        id="contact-whatsapp"
                        type="tel"
                        required
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        placeholder="+91 98765 43210"
                        className={`${inputClassName} font-mono`}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-semibold text-[#374151] mb-1.5"
                      >
                        Work or Personal Email *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="rohan@mybrand.in"
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contact-venture"
                        className="block text-xs font-semibold text-[#374151] mb-1.5"
                      >
                        Business Category
                      </label>
                      <select
                        id="contact-venture"
                        value={formData.ventureType}
                        onChange={(e) => setFormData({ ...formData, ventureType: e.target.value })}
                        className={`${inputClassName} cursor-pointer`}
                      >
                        <option value="Small & Medium Business (Retail, Store, E-commerce)">
                          Small &amp; Medium Business (Retail, Store, D2C)
                        </option>
                        <option value="Personal Brand & Creator">
                          Personal Brand / Creator / Executive Coach
                        </option>
                        <option value="Founder / Startup / B2B">
                          Founder / Tech Startup / B2B
                        </option>
                        <option value="Professional Services & Consultancy">
                          Professional Services (Consultancy, Legal, Real Estate)
                        </option>
                        <option value="Practice, Clinic & Healthcare">
                          Clinic &amp; Healthcare (Dental, Skin, Wellness)
                        </option>
                        <option value="Food & Beverage / Restaurant">
                          Food &amp; Beverage / Cafe / Hospitality
                        </option>
                        <option value="Marketing Agency">
                          Marketing Agency (Multi-Client)
                        </option>
                        <option value="Other Business / Individual">
                          Other Business / Independent Studio
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-topic"
                        className="block text-xs font-semibold text-[#374151] mb-1.5"
                      >
                        What would you like to explore?
                      </label>
                      <select
                        id="contact-topic"
                        value={formData.inquiryTopic}
                        onChange={(e) => setFormData({ ...formData, inquiryTopic: e.target.value })}
                        className={`${inputClassName} cursor-pointer`}
                      >
                        <option value="14-Day Free Trial & Onboarding">
                          14-Day Free Trial &amp; Onboarding
                        </option>
                        <option value="Brand Brain Extraction Walkthrough">
                          Brand Brain Extraction Walkthrough
                        </option>
                        <option value="WhatsApp Review Bot Integration">
                          WhatsApp Review Loop Setup
                        </option>
                        <option value="Campaign ROI Attribution Setup">
                          Campaign ROI &amp; Inbox Attribution
                        </option>
                        <option value="Agency Multi-Client Workspace">
                          Agency Multi-Client Workspace (10+ Brands)
                        </option>
                        <option value="Custom Billing / Enterprise Plan">
                          Custom Billing / GST Enterprise Plan
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-preferred"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      Preferred Contact Method
                    </label>
                    <select
                      id="contact-preferred"
                      value={formData.preferredContact}
                      onChange={(e) =>
                        setFormData({ ...formData, preferredContact: e.target.value })
                      }
                      className={`${inputClassName} cursor-pointer`}
                    >
                      <option value="WhatsApp Message (Fastest)">
                        WhatsApp Message (Fastest • Avg &lt; 15 mins)
                      </option>
                      <option value="Phone Call">Phone Call from Onboarding Team</option>
                      <option value="Google Meet Consultation">
                        Google Meet Strategy &amp; Setup Call
                      </option>
                      <option value="Email Response">Email Reply</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      How can we help? (Optional)
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Share your brand goals, channels you want automated, or questions..."
                      className={`${inputClassName} resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className="cursor-pointer w-full py-3.5 rounded-2xl bg-[#0B0F14] hover:bg-[#1F2937] text-white font-sora font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {formStatus === 'submitting' ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Sending Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <SendHorizontal size={15} />
                        <span>Send Inquiry &amp; Request Walkthrough →</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* AGENCY PARTNER CALLOUT */}
        <div className="rounded-[26px] bg-white border border-gray-200 p-7 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-left shadow-[0_12px_32px_-24px_rgba(15,23,42,0.1)]">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EFE7DE] text-[#FF7A00] text-[11px] font-semibold">
              Agencies &amp; Multi-Location Franchises
            </span>
            <h3 className="font-sora text-2xl sm:text-3xl font-extrabold text-[#0B0F14] tracking-tight">
              Managing 10+ client brands or store locations?
            </h3>
            <p className="text-xs sm:text-sm text-[#4B5563] font-inter leading-relaxed">
              Get isolated client workspaces, white-labeled WhatsApp sender identities, custom team
              access controls, and volume billing agreements.
            </p>
          </div>

          <a
            href="mailto:partners@kuiro.in?subject=Agency%20Partnership%20Inquiry%20-%20KUIRO"
            className="px-6 py-3.5 rounded-2xl bg-[#FF7A00] hover:bg-[#E06C00] text-white font-sora font-bold text-xs sm:text-sm transition shrink-0 inline-flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Briefcase size={15} />
            <span>Schedule Agency Call →</span>
          </a>
        </div>
      </div>
    </section>
  );
}
