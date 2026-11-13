'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AnnouncementBar, Navbar, Footer } from '@/components/layout';
import { 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Smartphone, 
  Globe2, 
  Layers, 
  Calendar, 
  Share2, 
  Palette, 
  Stethoscope, 
  Utensils, 
  ShoppingBag, 
  Briefcase, 
  Lock, 
  RefreshCw, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Building2, 
  Clock, 
  TrendingUp, 
  MessageCircle,
  HelpCircle,
  Award,
  Mail
} from 'lucide-react';

export default function GetStartedPage() {
  const router = useRouter();

  const { user, completeOnboarding } = useAuth();

  // 3-Step Onboarding State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSuccess, setExtractedSuccess] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    businessName: user?.businessName || 'Dr. Sharma Dental Clinics',
    vertical: 'Clinic & Healthcare',
    websiteUrl: 'https://drsharmadental.in',
    whatsappNumber: '+91 98765 43210',
    ownerName: user?.name || 'Dr. Rajesh Sharma',
    email: user?.email || 'dr.sharma@apexclinic.in',
    language: 'English + Hindi (Bilingual)',
    selectedChannels: ['instagram', 'facebook', 'linkedin', 'x', 'email'] as string[],
    approvalWindow: '48 Hours (Recommended)'
  });

  // Pre-fill user data if user signs up or logs in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        businessName: user.businessName || prev.businessName,
        ownerName: user.name || prev.ownerName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleSimulateExtract = () => {
    setIsExtracting(true);
    setExtractedSuccess(false);
    setTimeout(() => {
      setIsExtracting(false);
      setExtractedSuccess(true);
    }, 1500);
  };

  const toggleChannel = (channel: string) => {
    if (formData.selectedChannels.includes(channel)) {
      if (formData.selectedChannels.length > 1) {
        setFormData({
          ...formData,
          selectedChannels: formData.selectedChannels.filter(c => c !== channel)
        });
      }
    } else {
      setFormData({
        ...formData,
        selectedChannels: [...formData.selectedChannels, channel]
      });
    }
  };

  const handleFinishOnboarding = () => {
    setIsCompleting(true);
    setTimeout(() => {
      completeOnboarding();
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* Top Notification Announcement Bar */}
      <AnnouncementBar
        badge="Zero-Friction Onboarding"
        tagline="14-Day Full Autopilot Free Trial."
        subtitle="— No credit card required. Setup in 60 seconds."
      />

      {/* Main Sticky Navbar */}
      <Navbar
        activeRoute="get-started"
        badgeText="Workspace Setup"
        rightContent={
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#11141A] px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono">
              <span className="text-[#FF7A00] font-bold">Step {step} of 3</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-sans">
                {step === 1 && 'Brand Brain'}
                {step === 2 && 'WhatsApp Loop'}
                {step === 3 && 'Channels & Launch'}
              </span>
            </div>

            <Link
              href="/dashboard"
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 transition hidden sm:inline-block"
            >
              Skip to Dashboard →
            </Link>
          </div>
        }
      />

      {/* Main Onboarding Workflow Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Onboarding Progress Stepper */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-[#FF7A00] -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            />

            {[1, 2, 3].map((stepNum) => (
              <button
                key={stepNum}
                onClick={() => setStep(stepNum as any)}
                className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-200 ${
                  step === stepNum
                    ? 'bg-[#FF7A00] text-white shadow-lg shadow-[#FF7A00]/30 scale-110'
                    : step > stepNum
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#11141A] text-slate-400 border border-white/20'
                }`}
              >
                {step > stepNum ? <Check size={16} /> : stepNum}
              </button>
            ))}
          </div>

          <div className="flex justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-2.5 px-1">
            <span className={step >= 1 ? 'text-white font-bold' : ''}>1. Brand Brain</span>
            <span className={step >= 2 ? 'text-white font-bold' : ''}>2. WhatsApp Setup</span>
            <span className={step >= 3 ? 'text-white font-bold' : ''}>3. Channels & Launch</span>
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Form Workflow Step */}
          <div className="lg:col-span-7 bg-[#0B0F14] p-6 sm:p-8 rounded-[18px] border border-white/15 shadow-2xl space-y-6">
            {/* STEP 1: Business Identity & Brand Brain */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
                    Step 1 • Business Ingestion
                  </span>
                  <h2 className="text-2xl font-sora font-bold text-white mt-1">
                    Set Up Your Brand Brain
                  </h2>
                  <p className="text-xs text-slate-400 font-inter mt-1 leading-relaxed">
                    Paste your website URL or business profile. KUIRO automatically scans your brand colors, clinic degrees, services, and regulatory guardrails into persistent vector memory.
                  </p>
                </div>

                <div className="space-y-4 font-inter text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Business or Clinic Name *
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="e.g. Apex Multispecialty & Dental Care"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">
                        Business Category
                      </label>
                      <select
                        value={formData.vertical}
                        onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition"
                      >
                        <option value="Clinic & Healthcare">Clinic & Healthcare Practice</option>
                        <option value="Food & Beverage / Cafe">Food & Beverage / Restaurant / Cafe</option>
                        <option value="Retail & D2C Brand">Retail & D2C Boutique Store</option>
                        <option value="Marketing Agency">Marketing Agency (Multi-Client)</option>
                        <option value="Other Business">Other SMB / Founder</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">
                        Owner / Doctor Name *
                      </label>
                      <input
                        type="text"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        placeholder="Dr. Rajesh Sharma"
                        className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Website URL or Google Business Link
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-[#11141A] border border-white/15">
                        <Globe2 size={15} className="text-[#FF7A00] shrink-0" />
                        <input
                          type="url"
                          value={formData.websiteUrl}
                          onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                          placeholder="https://drsharmadental.in"
                          className="w-full bg-transparent text-white focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSimulateExtract}
                        disabled={isExtracting}
                        className="px-4 py-2 rounded-[10px] bg-[#FF7A00]/20 border border-[#FF7A00]/40 text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white transition font-medium flex items-center gap-1.5 shrink-0"
                      >
                        {isExtracting ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>Scanning...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} />
                            <span>Scan Brand</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {extractedSuccess && (
                    <div className="p-3.5 rounded-[10px] bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-start gap-2.5 animate-fade-in">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-white">Brand DNA Successfully Ingested!</p>
                        <p className="text-[11px] text-emerald-300/90 mt-0.5">
                          Extracted Primary Color: <span className="font-mono text-white">#FF7A00</span> • Credentials: <span className="text-white">BDS, MDS, 14 Yrs Exp</span> • Emergency Helpline synced.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Step 1 of 3: Brand Memory
                  </span>
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition shadow-md shadow-[#FF7A00]/25 flex items-center gap-1.5 active:scale-95"
                  >
                    <span>Continue to WhatsApp Setup</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: WhatsApp Approval Setup */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
                    Step 2 • The Zero-Dashboard Protocol
                  </span>
                  <h2 className="text-2xl font-sora font-bold text-white mt-1">
                    Connect Your WhatsApp Approval Bot
                  </h2>
                  <p className="text-xs text-slate-400 font-inter mt-1 leading-relaxed">
                    KUIRO delivers all campaign contact sheets directly to your WhatsApp 48 hours before publication. You can approve with 1 tap or send a voice note in Hindi/English to revise.
                  </p>
                </div>

                <div className="space-y-4 font-inter text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Your WhatsApp Mobile Number *
                    </label>
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15">
                      <Smartphone size={16} className="text-emerald-400 shrink-0" />
                      <input
                        type="tel"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full bg-transparent text-white font-mono focus:outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      We only send interactive campaign utility cards. Zero spam guarantee.
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Registered Work Email (For Billing & GST Invoices) *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="dr.sharma@apexclinic.in"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">
                        Voice Note Revision Language
                      </label>
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition"
                      >
                        <option value="English + Hindi (Bilingual)">English + Hindi (Bilingual / Hinglish)</option>
                        <option value="English Only">English Only</option>
                        <option value="Hindi Only">Hindi Only (Devanagari / Hinglish)</option>
                        <option value="Bengali + English">Bengali + English</option>
                        <option value="Tamil + English">Tamil + English</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">
                        Auto-Commit Window Duration
                      </label>
                      <select
                        value={formData.approvalWindow}
                        onChange={(e) => setFormData({ ...formData, approvalWindow: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#11141A] border border-white/15 text-white focus:outline-none focus:border-[#FF7A00] transition font-mono"
                      >
                        <option value="48 Hours (Recommended)">48 Hours (Recommended)</option>
                        <option value="24 Hours (Fast Pace)">24 Hours (Fast Pace)</option>
                        <option value="72 Hours (Relaxed)">72 Hours (Relaxed)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-[#11141A] border border-white/10 flex items-start gap-2.5 text-[11px] text-slate-300">
                    <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Passive Auto-Commit:</strong> If you are busy with patients or travel and do not respond within {formData.approvalWindow.split(' ')[0]} hours, KUIRO auto-commits and safely publishes on time.
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-slate-400 hover:text-white transition"
                  >
                    ← Back to Step 1
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-2.5 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition shadow-md shadow-[#FF7A00]/25 flex items-center gap-1.5 active:scale-95"
                  >
                    <span>Continue to Channel Selection</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Channel Selection & Launch */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
                    Step 3 • Channel Distribution
                  </span>
                  <h2 className="text-2xl font-sora font-bold text-white mt-1">
                    Select Your Publishing Channels
                  </h2>
                  <p className="text-xs text-slate-400 font-inter mt-1 leading-relaxed">
                    Select the social channels KUIRO should plan and publish for. You can authenticate them now or from the dashboard during your 14-day free trial.
                  </p>
                </div>

                <div className="space-y-3 font-inter">
                  {[
                    { id: 'instagram', name: 'Instagram & Facebook Feed', format: '1:1 Square & Carousels', icon: Instagram, color: 'text-pink-400' },
                    { id: 'facebook', name: 'Facebook Page Broadcast', format: 'Click-to-WhatsApp CTA', icon: Share2, color: 'text-blue-400' },
                    { id: 'linkedin', name: 'LinkedIn Company Page', format: '4:5 Executive Thought Leadership', icon: Linkedin, color: 'text-sky-400' },
                    { id: 'x', name: 'X (Twitter) Feed', format: 'First-Reply Link Guardrail', icon: Twitter, color: 'text-slate-300' },
                    { id: 'email', name: 'Branded Email Newsletters', format: 'Responsive HTML via Resend/SES', icon: Mail, color: 'text-amber-400' }
                  ].map((chan) => {
                    const isChecked = formData.selectedChannels.includes(chan.id);
                    const Icon = chan.icon;

                    return (
                      <div
                        key={chan.id}
                        onClick={() => toggleChannel(chan.id)}
                        className={`p-3.5 rounded-[12px] border cursor-pointer flex items-center justify-between transition-all duration-150 ${
                          isChecked
                            ? 'bg-[#11141A] border-[#FF7A00]/60 shadow-sm'
                            : 'bg-[#0B0F14] border-white/5 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <Icon size={16} className={chan.color} />
                          </div>
                          <div>
                            <p className="text-xs font-sora font-bold text-white">{chan.name}</p>
                            <p className="text-[11px] text-slate-400">{chan.format}</p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                          isChecked ? 'bg-[#FF7A00] border-[#FF7A00] text-white' : 'border-white/20'
                        }`}>
                          {isChecked && <Check size={13} />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Trial Summary Guarantee Box */}
                <div className="p-4 rounded-[12px] bg-gradient-to-r from-orange-950/30 via-slate-900 to-emerald-950/20 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">14-Day Full Autopilot Free Trial:</span>
                    <span className="text-emerald-400 font-bold">₹0.00 DUE TODAY</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Includes 3 upcoming Indian festival campaigns, WhatsApp 48h approval bot, and high-DPI Satori graphics. Cancel anytime with 1 click.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs text-slate-400 hover:text-white transition"
                  >
                    ← Back to Step 2
                  </button>

                  <button
                    onClick={handleFinishOnboarding}
                    disabled={isCompleting}
                    className="px-7 py-3 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition shadow-lg shadow-[#FF7A00]/30 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {isCompleting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Provisioning Brand Workspace...</span>
                      </>
                    ) : (
                      <>
                        <span>Activate 14-Day Free Trial</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Real-Time Live Preview Simulator */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-[18px] bg-[#0B0F14] border border-white/15 space-y-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-sora font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#FF7A00]" />
                  <span>Real-Time Brand Preview</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Ready to Launch
                </span>
              </div>

              {/* Dynamic WhatsApp Card Mockup */}
              <div className="bg-[#EFEAE2] rounded-[14px] overflow-hidden text-[#0B0F14] text-xs shadow-md border-2 border-gray-800">
                <div className="bg-[#075E54] text-white p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#FF7A00] flex items-center justify-center font-bold text-white text-[10px]">
                      K
                    </div>
                    <div>
                      <p className="text-[11px] font-bold leading-tight">KUIRO Autopilot</p>
                      <p className="text-[9px] text-emerald-200">Meta Verified Cloud Bot</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-emerald-900/80 px-1.5 py-0.5 rounded text-emerald-100">
                    T-48H
                  </span>
                </div>

                <div className="p-3 space-y-2">
                  <div className="h-32 bg-[#0B0F14] rounded-lg p-2.5 text-white flex flex-col justify-between relative overflow-hidden border border-orange-500/30">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] bg-[#FF7A00] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Upcoming Campaign
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">★ 9.8 Score</span>
                    </div>
                    <div>
                      <p className="text-xs font-sora font-bold text-white line-clamp-1">
                        {formData.businessName || 'Your Business Name'}
                      </p>
                      <p className="text-[10px] text-slate-300">
                        {formData.vertical} • High-DPI Visual Overlay
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-800 leading-snug">
                    Hello <strong>{formData.ownerName || 'Doctor'}</strong>, your 4-channel campaign is queued for review on WhatsApp.
                  </p>

                  <div className="pt-1 flex gap-1.5 text-[10px]">
                    <div className="flex-1 py-1.5 rounded bg-[#FF7A00] text-white font-bold text-center">
                      Approve (1-Tap)
                    </div>
                    <div className="flex-1 py-1.5 rounded bg-gray-200 text-gray-800 font-medium text-center">
                      Voice Revision
                    </div>
                  </div>
                </div>
              </div>

              {/* Workspace Provisioning Summary */}
              <div className="space-y-2 pt-2 text-xs font-inter text-slate-300">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Workspace Entity:</span>
                  <span className="font-semibold text-white">{formData.businessName || 'New Clinic'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">WhatsApp Notification:</span>
                  <span className="font-mono text-emerald-400">{formData.whatsappNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Active Channels:</span>
                  <span className="font-semibold text-white">{formData.selectedChannels.length} Channels Selected</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Free Trial Period:</span>
                  <span className="font-semibold text-emerald-400">14 Days Unlimited (₹0)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-[12px] bg-[#11141A] border border-white/10 text-[11px] text-slate-300 flex items-start gap-2.5">
                <Lock size={15} className="text-[#FF7A00] shrink-0 mt-0.5" />
                <span>
                  All brand data is securely encrypted with Neon PostgreSQL tenant isolation and pgvector multi-tenant scopes.
                </span>
              </div>
            </div>

            {/* Quick Support Card */}
            <div className="p-4 rounded-[14px] bg-[#0B0F14] border border-white/10 text-xs text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Smartphone size={16} />
                </div>
                <div>
                  <p className="text-white font-semibold">Need Help Setting Up?</p>
                  <p className="text-[11px] text-slate-400">Chat with an onboarding engineer</p>
                </div>
              </div>
              <a
                href="https://wa.me/919876543210?text=Hi%20KUIRO%20Team%2C%20I%20need%20help%20setting%20up%20my%20account"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#FF7A00] hover:underline font-semibold"
              >
                WhatsApp Us →
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
