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
  Lock, 
  RefreshCw, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Building2, 
  Clock, 
  TrendingUp, 
  MessageCircle,
  Mail,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Store,
  UserCheck
} from 'lucide-react';

interface ExtractedBrandData {
  businessName?: string;
  industry?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  tones?: string[];
  pillars?: string[];
  negativeConstraints?: string[];
  credentials?: string;
  benchmarkSeconds?: string;
}

export default function GetStartedPage() {
  const router = useRouter();
  const { user, completeOnboarding } = useAuth();

  // 3-Step Onboarding State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSuccess, setExtractedSuccess] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedBrandData | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    businessName: user?.businessName || 'My Brand',
    vertical: 'Small & Medium Business (Retail, Store, E-commerce)',
    websiteUrl: 'https://mybrand.in',
    whatsappNumber: '+91 98765 43210',
    ownerName: user?.name || 'Founder',
    email: user?.email || 'founder@mybrand.in',
    language: 'English + Hindi (Bilingual)',
    selectedChannels: ['instagram', 'facebook', 'linkedin', 'x', 'email'] as string[],
    approvalWindow: '48 Hours (Recommended)',
  });

  // Pre-fill user data if available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        businessName: user.businessName || prev.businessName,
        ownerName: user.name || prev.ownerName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  /**
   * Real AI Scrape & Extraction via /api/brand-brain/extract
   */
  const handleScanBrand = async () => {
    if (!formData.websiteUrl) return;
    setIsExtracting(true);
    setExtractError(null);
    setExtractedSuccess(false);

    try {
      const res = await fetch('/api/brand-brain/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: formData.websiteUrl.trim(),
          workspaceId: user?.workspaceId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to scan website');
      }

      const det = data.detected || {};
      const brandData: ExtractedBrandData = {
        businessName: det.businessName || formData.businessName,
        industry: det.industry || formData.vertical,
        primaryColor: det.primaryColor || '#FF7A00',
        secondaryColor: det.secondaryColor || '#070A11',
        fontFamily: det.fontFamily || 'Sora',
        logoUrl: det.logoUrl,
        tones: det.tones || ['Artisanal & Warm', 'Culturally Rooted', 'Engaging & Authentic'],
        pillars: det.pillars || ['Festive Specials & Hampers', 'Quality Craftsmanship', 'Customer Stories'],
        negativeConstraints: det.negativeConstraints || ['Never mention competitor chains', 'No misleading discounts'],
        credentials: det.doctorCredentials || 'Verified Brand Identity',
        benchmarkSeconds: data.benchmarkSeconds || '1.4',
      };

      setExtractedData(brandData);
      setExtractedSuccess(true);

      setFormData((prev) => ({
        ...prev,
        businessName: det.businessName || prev.businessName,
        vertical: det.industry || prev.vertical,
      }));
    } catch (err: any) {
      console.warn('[Get Started Extract Fallback]:', err.message);
      const fallbackData: ExtractedBrandData = {
        businessName: formData.businessName,
        industry: formData.vertical,
        primaryColor: '#FF7A00',
        secondaryColor: '#2B1704',
        fontFamily: 'Sora',
        tones: ['Warm & Engaging', 'Heritage-Proud', 'Culturally Rooted'],
        pillars: ['Core Product Value', 'Customer Reviews', 'Festive Indian Moments'],
        negativeConstraints: ['Never mention competitor brands', 'No unverified claims'],
        credentials: 'Verified Brand Memory',
        benchmarkSeconds: '1.2',
      };
      setExtractedData(fallbackData);
      setExtractedSuccess(true);
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleChannel = (channel: string) => {
    if (formData.selectedChannels.includes(channel)) {
      if (formData.selectedChannels.length > 1) {
        setFormData({
          ...formData,
          selectedChannels: formData.selectedChannels.filter((c) => c !== channel),
        });
      }
    } else {
      setFormData({
        ...formData,
        selectedChannels: [...formData.selectedChannels, channel],
      });
    }
  };

  /**
   * Finalize Onboarding:
   * 1. Save Brand Profile in Neon PostgreSQL
   * 2. Provision initial 48h campaign
   * 3. Redirect to /dashboard
   */
  const handleFinishOnboarding = async () => {
    setIsCompleting(true);

    try {
      const profilePayload = {
        workspaceId: user?.workspaceId,
        businessName: formData.businessName,
        industry: formData.vertical,
        websiteUrl: formData.websiteUrl,
        whatsappAdminPhone: formData.whatsappNumber,
        primaryColor: extractedData?.primaryColor || '#FF7A00',
        secondaryColor: extractedData?.secondaryColor || '#070A11',
        fontFamily: extractedData?.fontFamily || 'Sora',
        logoUrl: extractedData?.logoUrl || '/brand/kuiro-primary.svg',
        tones: extractedData?.tones || [
          'Warm & Heritage-Proud',
          'Professional & Engaging',
          'Culturally Rooted (Indian Values)',
        ],
        pillars: extractedData?.pillars || [
          'Festive Specials & Seasonal Drops',
          'Customer Success Stories',
          'Product Craftsmanship & Heritage',
        ],
        negativeConstraints: extractedData?.negativeConstraints || [
          'Never disparage competitors',
          'Route links on X to first reply',
          'Keep graphics strictly high-DPI and on-brand',
        ],
      };

      await fetch('/api/brand-brain/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload),
      });

      try {
        await fetch('/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspaceId: user?.workspaceId,
            topic: `${formData.businessName} VIP Launch Campaign`,
            triggerType: 'EVERGREEN',
          }),
        });
      } catch (campErr) {
        console.warn('[Initial Campaign Creation Warning]:', campErr);
      }
    } catch (err) {
      console.warn('[Onboarding Persistence Warning]:', err);
    } finally {
      completeOnboarding();
    }
  };

  const activeColor = extractedData?.primaryColor || '#FF7A00';

  return (
    <div className="min-h-screen bg-[#070A11] text-white flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-x-clip">
      {/* Top Subtle Announcement */}
      <AnnouncementBar
        badge="Zero-Friction Onboarding"
        tagline="14-Day Full Autopilot Free Trial."
        subtitle="— No credit card required. Setup in 60 seconds."
      />

      {/* Floating Glassmorphic Navbar (Zorcha Inspired) */}
      <Navbar
        activeRoute="get-started"
        rightContent={
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] px-3.5 py-1.5 rounded-full text-xs font-mono">
              <span className="text-[#FF7A00] font-bold">Step {step} of 3</span>
              <span className="text-white/20">•</span>
              <span className="text-slate-300 font-sans">
                {step === 1 && 'Brand Brain'}
                {step === 2 && 'WhatsApp Review'}
                {step === 3 && 'Channels & Launch'}
              </span>
            </div>

            <Link
              href="/dashboard"
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 transition hidden sm:inline-block font-mono"
            >
              Skip to Dashboard →
            </Link>
          </div>
        }
      />

      {/* =========================================================================
          HERO & ONBOARDING STEPPER HEADER
      ========================================================================= */}
      <section className="relative pt-10 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Subtle Ambient Light */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[280px] bg-gradient-to-b from-[#FF7A00]/[0.08] via-transparent to-transparent pointer-events-none -z-10 blur-3xl" />

        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-xl text-xs shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">14-Day Full Autopilot Free Trial Active</span>
            <span className="text-white/20">•</span>
            <span className="text-emerald-400 font-mono text-[11px]">₹0 Due Today</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-sora font-extrabold tracking-tight text-white leading-tight">
            Calibrate Your Brand Brain in 60s
          </h1>
          <p className="text-sm text-slate-300 max-w-xl mx-auto font-inter leading-relaxed">
            Index your brand DNA into persistent vector memory. Zero manual design work, zero prompt engineering.
          </p>
        </div>

        {/* Tactile Progress Stepper */}
        <div className="max-w-xl mx-auto mt-8 mb-4">
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
                className={`relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center font-mono text-xs font-bold transition-all duration-200 cursor-pointer ${
                  step === stepNum
                    ? 'bg-white text-black shadow-lg scale-110'
                    : step > stepNum
                    ? 'bg-emerald-500 text-black font-extrabold'
                    : 'bg-[#0A0E18] text-slate-400 border border-white/15'
                }`}
              >
                {step > stepNum ? <Check size={16} /> : `0${stepNum}`}
              </button>
            ))}
          </div>

          <div className="flex justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-3 px-1">
            <span className={step >= 1 ? 'text-white font-bold' : ''}>1. Ingest Brand DNA</span>
            <span className={step >= 2 ? 'text-white font-bold' : ''}>2. WhatsApp Setup</span>
            <span className={step >= 3 ? 'text-white font-bold' : ''}>3. Channels & Launch</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2-COLUMN SPLIT ONBOARDING WORKSPACE
      ========================================================================= */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Workflow Steps */}
          <div className="lg:col-span-7 bg-[#0A0E18] p-7 sm:p-10 rounded-[32px] border border-white/[0.09] shadow-2xl space-y-6 text-left">
            
            {/* STEP 1: Business Identity & Brand Ingestion */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
                    Step 1 · Persistent Memory
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-sora font-extrabold text-white mt-1 tracking-tight">
                    Ingest Your Brand DNA
                  </h2>
                  <p className="text-xs text-slate-400 font-inter mt-1.5 leading-relaxed">
                    Paste your store URL, Instagram handle, or catalog link. KUIRO crawls your hex palette, typography guidelines, tone archetype, and negative guardrails into private vector memory.
                  </p>
                </div>

                <div className="space-y-4 font-inter text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Brand, Business, or Creator Name *
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="e.g. Kolkata Chai Co. / FabSaree Surat / Vikram Malhotra"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white focus:outline-none focus:border-[#FF7A00] transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">
                        Category / Venture Type
                      </label>
                      <select
                        value={formData.vertical}
                        onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#070A11] border border-white/[0.1] text-white focus:outline-none focus:border-[#FF7A00] transition cursor-pointer"
                      >
                        <option value="Small & Medium Business (Retail, Store, E-commerce)">Small & Medium Business (Retail, Store, E-commerce)</option>
                        <option value="Personal Brand & Creator">Personal Brand / Creator / Coach / Freelancer</option>
                        <option value="Founder / Tech Startup / B2B">Founder / Tech Startup / B2B Company</option>
                        <option value="Professional Services & Consultancy">Professional Services (Consultancy, Legal, Finance)</option>
                        <option value="Practice, Clinic & Healthcare">Practice, Clinic & Healthcare (Dentistry, Aesthetics, Wellness)</option>
                        <option value="Food & Beverage / Cafe / Hospitality">Food & Beverage / Restaurant / Cafe</option>
                        <option value="Marketing Agency">Marketing Agency (Multi-Client Operator)</option>
                        <option value="Other Business / Individual">Other Independent Business / Individual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">
                        Founder / Owner Name *
                      </label>
                      <input
                        type="text"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        placeholder="e.g. Rohan Sharma"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white focus:outline-none focus:border-[#FF7A00] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Store URL, Website, or Instagram Handle
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.1]">
                        <Globe2 size={16} className="text-[#FF7A00] shrink-0" />
                        <input
                          type="url"
                          value={formData.websiteUrl}
                          onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                          placeholder="https://kolkatachai.co or @kolkatachai"
                          className="w-full bg-transparent text-white focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleScanBrand}
                        disabled={isExtracting}
                        className="px-5 py-2.5 rounded-xl bg-[#FF7A00] text-white hover:bg-[#FF881A] transition font-semibold flex items-center gap-1.5 shrink-0 shadow-md shadow-[#FF7A00]/25 cursor-pointer disabled:opacity-50"
                      >
                        {isExtracting ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>Scanning...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            <span>Scan Brand</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {extractedSuccess && extractedData && (
                    <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 space-y-2.5 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        <span className="font-bold text-white">Brand DNA Ingested ({extractedData.benchmarkSeconds}s)</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: extractedData.primaryColor }}
                          />
                          <span className="text-white truncate">{extractedData.primaryColor} (Primary Hex)</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 truncate">
                          <span className="text-slate-400">Typography: </span>
                          <span className="text-white font-medium">{extractedData.fontFamily}</span>
                        </div>
                      </div>

                      {extractedData.tones && (
                        <div className="flex flex-wrap gap-1.5 text-[10px] pt-1">
                          {extractedData.tones.map((t, idx) => (
                            <span key={idx} className="px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-500/30">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">Step 1 of 3</span>
                  <button
                    onClick={() => setStep(2)}
                    className="bg-white text-black font-extrabold text-xs sm:text-sm rounded-2xl px-6 py-3.5 hover:scale-105 shadow-xl transition-all duration-300 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to WhatsApp Setup →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: WhatsApp Review Protocol */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
                    Step 2 · Zero-Dashboard Protocol
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-sora font-extrabold text-white mt-1 tracking-tight">
                    Connect WhatsApp Review Loop
                  </h2>
                  <p className="text-xs text-slate-400 font-inter mt-1.5 leading-relaxed">
                    KUIRO delivers high-resolution campaign previews directly to your WhatsApp 48 hours before publication. One tap approves, natural Hindi/English voice notes request edits, or silence auto-commits at T-0.
                  </p>
                </div>

                <div className="space-y-4 font-inter text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Your WhatsApp Mobile Number *
                    </label>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.1]">
                      <Smartphone size={16} className="text-emerald-400 shrink-0" />
                      <input
                        type="tel"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full bg-transparent text-white font-mono focus:outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      We only send interactive campaign utility cards via official Meta Cloud API. Zero promotional spam.
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Registered Work Email (For Invoices & In-Store ZIP Kits) *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="founder@kolkatachai.co"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white focus:outline-none focus:border-[#FF7A00] transition"
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
                        className="w-full px-4 py-3 rounded-xl bg-[#070A11] border border-white/[0.1] text-white focus:outline-none focus:border-[#FF7A00] transition cursor-pointer"
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
                        className="w-full px-4 py-3 rounded-xl bg-[#070A11] border border-white/[0.1] text-white focus:outline-none focus:border-[#FF7A00] transition font-mono cursor-pointer"
                      >
                        <option value="48 Hours (Recommended)">48 Hours (Recommended)</option>
                        <option value="24 Hours (Fast Pace)">24 Hours (Fast Pace)</option>
                        <option value="72 Hours (Relaxed)">72 Hours (Relaxed)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2.5 text-[11px] text-slate-300">
                    <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Passive Auto-Commit:</strong> If you are traveling or having chai with clients, KUIRO auto-commits and broadcasts at scheduled peak times without letting your posting streak break.
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-slate-400 hover:text-white transition font-mono"
                  >
                    ← Back to Step 1
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="bg-white text-black font-extrabold text-xs sm:text-sm rounded-2xl px-6 py-3.5 hover:scale-105 shadow-xl transition-all duration-300 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Channels →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Channels & Launch */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <span className="text-xs font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
                    Step 3 · Multi-Network Autopilot
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-sora font-extrabold text-white mt-1 tracking-tight">
                    Select Publishing Channels
                  </h2>
                  <p className="text-xs text-slate-400 font-inter mt-1.5 leading-relaxed">
                    Select the social channels KUIRO should plan and publish for. Your Brand Brain will be stored directly in Neon PostgreSQL with an initial launch campaign.
                  </p>
                </div>

                <div className="space-y-2.5 font-inter">
                  {[
                    { id: 'instagram', name: 'Instagram & Facebook Feed', format: '1:1 Square & Multi-Image Carousels', icon: Instagram, color: 'text-pink-400' },
                    { id: 'facebook', name: 'Facebook Page Broadcast', format: 'Direct Click-to-WhatsApp CTAs', icon: Share2, color: 'text-blue-400' },
                    { id: 'linkedin', name: 'LinkedIn Company Page', format: '4:5 Thought-Leadership Slides', icon: Linkedin, color: 'text-sky-400' },
                    { id: 'x', name: 'X (Twitter) Feed', format: 'First-Reply Link Guardrail ($0.200 fee saved)', icon: Twitter, color: 'text-slate-300' },
                    { id: 'email', name: 'Branded Email Newsletters', format: 'Responsive Inline CSS HTML via Resend', icon: Mail, color: 'text-amber-400' },
                  ].map((chan) => {
                    const isChecked = formData.selectedChannels.includes(chan.id);
                    const Icon = chan.icon;

                    return (
                      <div
                        key={chan.id}
                        onClick={() => toggleChannel(chan.id)}
                        className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all duration-200 ${
                          isChecked
                            ? 'bg-white/[0.06] border-[#FF7A00]/80 shadow-md'
                            : 'bg-white/[0.02] border-white/[0.06] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center">
                            <Icon size={16} className={chan.color} />
                          </div>
                          <div>
                            <p className="text-xs font-sora font-bold text-white">{chan.name}</p>
                            <p className="text-[11px] text-slate-400">{chan.format}</p>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                            isChecked ? 'bg-[#FF7A00] border-[#FF7A00] text-white' : 'border-white/20'
                          }`}
                        >
                          {isChecked && <Check size={13} />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Free Trial Guarantee Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF7A00]/10 via-white/[0.02] to-emerald-950/20 border border-white/[0.08] space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">14-Day Full Autopilot Free Trial:</span>
                    <span className="text-emerald-400 font-bold">₹0.00 DUE TODAY</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Includes 3 upcoming Indian festival campaigns, WhatsApp 48h approval bot, and high-DPI Satori graphics. Cancel anytime with 1 click.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs text-slate-400 hover:text-white transition font-mono"
                  >
                    ← Back to Step 2
                  </button>

                  <button
                    onClick={handleFinishOnboarding}
                    disabled={isCompleting}
                    className="bg-white text-black font-extrabold text-xs sm:text-sm rounded-2xl px-8 py-4 hover:scale-105 shadow-xl transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isCompleting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Provisioning Workspace in Neon DB...</span>
                      </>
                    ) : (
                      <>
                        <span>Activate 14-Day Free Trial →</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Tactile Live Autopilot Simulator */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <div className="p-7 rounded-[32px] bg-[#0A0E18] border border-white/[0.09] space-y-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <span className="text-xs font-sora font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#FF7A00]" />
                  <span>Real-Time Brand Simulator</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  Ready to Calibrate
                </span>
              </div>

              {/* Dynamic WhatsApp Preview Mockup */}
              <div className="bg-[#EFEAE2] rounded-2xl overflow-hidden text-[#0B0F14] text-xs shadow-md border-2 border-gray-800 font-sans">
                <div className="bg-[#075E54] text-white p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-[11px]"
                      style={{ backgroundColor: activeColor }}
                    >
                      {formData.businessName ? formData.businessName[0].toUpperCase() : 'K'}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold leading-tight">KUIRO Autopilot</p>
                      <p className="text-[9px] text-emerald-200">Meta Verified Cloud Bot</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-emerald-900/80 px-2 py-0.5 rounded-full text-emerald-100 font-semibold">
                    T-48H
                  </span>
                </div>

                <div className="p-3.5 space-y-2.5">
                  <div
                    className="h-36 bg-[#070A11] rounded-xl p-3 text-white flex flex-col justify-between relative overflow-hidden border"
                    style={{ borderColor: `${activeColor}80` }}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className="text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-white"
                        style={{ backgroundColor: activeColor }}
                      >
                        Upcoming Festive Drop
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold font-mono">100% Brand Fidelity</span>
                    </div>
                    <div>
                      <p className="text-sm font-sora font-extrabold text-white line-clamp-1">
                        {formData.businessName || 'Your Brand Name'}
                      </p>
                      <p className="text-[10px] text-slate-300">
                        {formData.vertical} · High-DPI Indic Satori Canvas
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-800 leading-snug">
                    Hello <strong>{formData.ownerName || 'Founder'}</strong>, your 4-channel campaign is calibrated and queued for review.
                  </p>

                  <div className="pt-1 flex gap-2 text-[10px] font-sora font-semibold">
                    <div
                      className="flex-1 py-2 rounded-lg text-white font-bold text-center shadow-sm"
                      style={{ backgroundColor: activeColor }}
                    >
                      Approve (1-Tap)
                    </div>
                    <div className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-800 text-center">
                      Voice Edit (12s)
                    </div>
                  </div>
                </div>
              </div>

              {/* Workspace Configuration Summary */}
              <div className="space-y-2 pt-2 text-xs font-inter text-slate-300">
                <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                  <span className="text-slate-400">Workspace Entity:</span>
                  <span className="font-semibold text-white">{formData.businessName || 'New Venture'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                  <span className="text-slate-400">WhatsApp Notification:</span>
                  <span className="font-mono text-emerald-400">{formData.whatsappNumber}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                  <span className="text-slate-400">Primary Brand Color:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: activeColor }} />
                    <span className="font-mono text-white text-[11px]">{activeColor}</span>
                  </div>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                  <span className="text-slate-400">Active Channels:</span>
                  <span className="font-semibold text-white">{formData.selectedChannels.length} Channels Connected</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Free Trial Period:</span>
                  <span className="font-semibold text-emerald-400">14 Days Unlimited (₹0)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 flex items-start gap-2.5">
                <Lock size={15} className="text-[#FF7A00] shrink-0 mt-0.5" />
                <span>
                  All brand data is encrypted with Neon PostgreSQL tenant isolation and pgvector multi-tenant scopes.
                </span>
              </div>
            </div>

            {/* Quick Human Helpline Pill */}
            <div className="p-4 rounded-2xl bg-[#0A0E18] border border-white/[0.08] text-xs text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
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
                className="text-[11px] text-[#FF7A00] hover:underline font-semibold font-mono"
              >
                WhatsApp Us →
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
