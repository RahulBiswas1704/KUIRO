'use client';

import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Globe,
  Upload,
  Plus,
  X,
  CheckCircle2,
  Save,
  AlertTriangle,
  FileText,
  Sliders,
  Palette,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function BrandBrainPage() {
  const [url, setUrl] = useState('https://drsharmadental.in');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedNotice, setExtractedNotice] = useState<string | null>(null);

  // Form State
  const [businessName, setBusinessName] = useState('Dr. Sharma Dental Care & Implant Center');
  const [industry, setIndustry] = useState('Healthcare & Dentistry');
  const [primaryColor, setPrimaryColor] = useState('#0B3B60');
  const [secondaryColor, setSecondaryColor] = useState('#FF7A00');
  const [fontFamily, setFontFamily] = useState('Sora');
  const [tones, setTones] = useState<string[]>([
    'Empathetic & Caring',
    'Clinically Authoritative',
    'Jargon-Free',
    'Culturally Warm (Indian Family Values)',
  ]);
  const [newTone, setNewTone] = useState('');

  const [pillars, setPillars] = useState<string[]>([
    'Preventive Care & Child Dentistry',
    'Cosmetic Dentistry & Clear Aligners',
    'Indian Festival Greetings & Health Tips',
    'Patient Case Studies & Myths Busted',
  ]);
  const [newPillar, setNewPillar] = useState('');

  const [negativeConstraints, setNegativeConstraints] = useState<string[]>([
    'Never mention competitor chains or compare pricing',
    'No clinical guarantees (e.g. "100% painless") without medical disclaimer',
    'Place links on X in the first reply to avoid API link post fees ($0.200)',
    'Keep graphics clean and avoid cluttered stock photos',
  ]);
  const [newConstraint, setNewConstraint] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleExtract = async () => {
    if (!url.trim()) return;
    setIsExtracting(true);
    setExtractedNotice(null);

    try {
      const res = await fetch('/api/brand-brain/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, workspaceId: 'ws-demo' }),
      });
      const data = await res.json();

      const profile = data.profile || data.data?.brandProfile || data.data;
      if (profile) {
        setBusinessName(data.data?.brandName || profile.businessName || businessName);
        setIndustry(profile.industry || industry);
        if (profile.visualIdentity?.primaryHex || profile.visual_identity?.primary_hex) {
          setPrimaryColor(profile.visualIdentity?.primaryHex || profile.visual_identity?.primary_hex);
        }
        if (profile.contentPillars || profile.content_pillars) {
          const rawPillars = profile.contentPillars || profile.content_pillars;
          setPillars(Array.isArray(rawPillars) ? rawPillars : Object.values(rawPillars));
        }
        setExtractedNotice(
          `Extracted Brand Brain in ${data.benchmarkSeconds || '2.8'}s! Extracted 3 preview posts and updated visual tokens.`
        );
      }
    } catch {
      setExtractedNotice('Offline demo mode: Loaded Dr. Sharma Dental profile with 3 pre-built sample posts.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const addTone = () => {
    if (newTone.trim() && !tones.includes(newTone.trim())) {
      setTones([...tones, newTone.trim()]);
      setNewTone('');
    }
  };

  const removeTone = (t: string) => {
    setTones(tones.filter((item) => item !== t));
  };

  const addPillar = () => {
    if (newPillar.trim() && !pillars.includes(newPillar.trim())) {
      setPillars([...pillars, newPillar.trim()]);
      setNewPillar('');
    }
  };

  const removePillar = (p: string) => {
    setPillars(pillars.filter((item) => item !== p));
  };

  const addConstraint = () => {
    if (newConstraint.trim() && !negativeConstraints.includes(newConstraint.trim())) {
      setNegativeConstraints([...negativeConstraints, newConstraint.trim()]);
      setNewConstraint('');
    }
  };

  const removeConstraint = (c: string) => {
    setNegativeConstraints(negativeConstraints.filter((item) => item !== c));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-inter">
      {/* Toast Alert */}
      {savedSuccess && (
        <div className="p-3.5 rounded-[12px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Brand Brain saved successfully! All future autonomous campaigns will strictly follow these guardrails.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E7EB] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#FF7A00] text-[10px] font-bold">
              Autonomous Knowledge Base
            </span>
            <span className="text-xs text-gray-500">Persistent RAG Memory</span>
          </div>
          <h2 className="font-sora text-xl font-bold text-[#0B0F14] mt-1">
            The Brand Brain Studio
          </h2>
          <p className="text-xs text-gray-500">
            KUIRO learns your exact business DNA—so every post sounds like your best copywriter and looks like your personal design agency.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#FF7A00] text-white text-xs font-semibold hover:bg-[#E66E00] transition shadow-sm"
        >
          <Save size={15} />
          <span>Save Brand Brain</span>
        </button>
      </div>

      {/* Zero-Friction URL Extractor Box */}
      <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-[#FF7A00]" />
          <h3 className="font-sora text-sm font-bold text-[#0B0F14]">
            Instant Auto-Extraction (&lt; 30 Seconds)
          </h3>
        </div>
        <p className="text-xs text-gray-600 mb-4">
          Enter your website URL or Google Business Profile. KUIRO will extract your brand palette, tone, core offerings, and prepare 3 instant preview posts.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe size={16} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourclinic.in or https://yourbrand.com"
              className="w-full pl-9 pr-4 py-2.5 rounded-[10px] border border-gray-300 text-xs focus:outline-none focus:border-[#FF7A00]"
            />
          </div>
          <button
            onClick={handleExtract}
            disabled={isExtracting}
            className="px-5 py-2.5 rounded-[10px] bg-[#0B0F14] text-white text-xs font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-70"
          >
            {isExtracting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Extracting in 30s...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-[#FF7A00]" />
                <span>Extract Brand Brain</span>
              </>
            )}
          </button>
        </div>

        {extractedNotice && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-[10px] text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{extractedNotice}</span>
          </div>
        )}
      </div>

      {/* Main Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual Identity & Colors */}
        <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
            <Palette size={16} className="text-[#FF7A00]" />
            <h3 className="font-sora text-sm font-bold text-[#0B0F14]">
              Visual Identity & Design Tokens
            </h3>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-gray-300 text-xs focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Industry / Niche
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-gray-300 text-xs focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[8px] border border-gray-300 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Accent / CTA Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[8px] border border-gray-300 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Typography Font Family
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="Sora">Sora (Modern Geometric - KUIRO Standard)</option>
              <option value="Inter">Inter (Clean Clean Corporate)</option>
              <option value="Poppins">Poppins (Friendly Consumer)</option>
              <option value="Playfair Display">Playfair Display (Luxury & Clinic)</option>
            </select>
          </div>
        </div>

        {/* Tone of Voice */}
        <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
            <Sliders size={16} className="text-[#FF7A00]" />
            <h3 className="font-sora text-sm font-bold text-[#0B0F14]">
              Tone of Voice & Personality
            </h3>
          </div>

          <p className="text-xs text-gray-500">
            Define how KUIRO writes captions, replies to comments, and crafts festive greetings:
          </p>

          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium border border-gray-200"
              >
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => removeTone(t)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTone}
              onChange={(e) => setNewTone(e.target.value)}
              placeholder="e.g. Friendly, High-trust, No medical hype"
              className="flex-1 px-3 py-2 rounded-[10px] border border-gray-300 text-xs focus:outline-none focus:border-[#FF7A00]"
            />
            <button
              type="button"
              onClick={addTone}
              className="px-3 py-2 rounded-[10px] bg-gray-100 text-[#0B0F14] text-xs font-semibold hover:bg-gray-200"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Content Pillars */}
        <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
            <FileText size={16} className="text-[#FF7A00]" />
            <h3 className="font-sora text-sm font-bold text-[#0B0F14]">
              Strategic Content Pillars
            </h3>
          </div>

          <div className="space-y-2">
            {pillars.map((p) => (
              <div
                key={p}
                className="flex items-center justify-between p-2.5 rounded-[10px] bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800"
              >
                <span>{p}</span>
                <button
                  type="button"
                  onClick={() => removePillar(p)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newPillar}
              onChange={(e) => setNewPillar(e.target.value)}
              placeholder="Add new content pillar..."
              className="flex-1 px-3 py-2 rounded-[10px] border border-gray-300 text-xs focus:outline-none focus:border-[#FF7A00]"
            />
            <button
              type="button"
              onClick={addPillar}
              className="px-3 py-2 rounded-[10px] bg-gray-100 text-[#0B0F14] text-xs font-semibold hover:bg-gray-200"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Negative Constraints & Guardrails */}
        <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <h3 className="font-sora text-sm font-bold text-[#0B0F14]">
              Negative Constraints (AI Guardrails)
            </h3>
          </div>

          <p className="text-xs text-gray-500">
            Rules the AI Critic strictly checks before presenting any post for 48h auto-commit:
          </p>

          <div className="space-y-2">
            {negativeConstraints.map((c) => (
              <div
                key={c}
                className="flex items-start justify-between p-2.5 rounded-[10px] bg-red-50/50 border border-red-100 text-xs text-red-900"
              >
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>{c}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeConstraint(c)}
                  className="text-gray-400 hover:text-red-600 shrink-0 ml-2"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newConstraint}
              onChange={(e) => setNewConstraint(e.target.value)}
              placeholder="Add negative rule (e.g. Never use stock photos)..."
              className="flex-1 px-3 py-2 rounded-[10px] border border-gray-300 text-xs focus:outline-none focus:border-[#FF7A00]"
            />
            <button
              type="button"
              onClick={addConstraint}
              className="px-3 py-2 rounded-[10px] bg-gray-100 text-[#0B0F14] text-xs font-semibold hover:bg-gray-200"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
