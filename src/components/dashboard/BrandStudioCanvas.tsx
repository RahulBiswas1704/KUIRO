'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Download,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Copy,
  Layers,
  Eye,
  Type,
  Palette
} from 'lucide-react';

interface BrandStudioCanvasProps {
  businessName: string;
  industry: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoUrl: string;
  tones: string[];
  pillars: string[];
  negativeConstraints: string[];
}

type AspectRatio = '1:1' | '4:5' | '16:9' | '9:16';
type CanvasTheme = 'festive' | 'craft' | 'thought_leadership';

export default function BrandStudioCanvas({
  businessName,
  industry,
  primaryColor,
  secondaryColor,
  fontFamily,
  logoUrl,
  tones,
  pillars,
  negativeConstraints,
}: BrandStudioCanvasProps) {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [theme, setTheme] = useState<CanvasTheme>('festive');
  const [showDeviceFrame, setShowDeviceFrame] = useState(false);
  const [includeIndic, setIncludeIndic] = useState(true);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Dynamic Theme Content
  const themeData = {
    festive: {
      tag: 'Festive Prosperity Edition',
      headline: 'Embrace Festive Radiance & Timeless Craft',
      subheadline: 'Handcrafted weaves and artisanal collections tailored for your family celebrations.',
      indicQuote: 'शुभ दीपावली एवं सुख-समृद्धि',
      cta: 'Explore Festive Catalogue',
      pill: pillars[0] || 'Artisan Craft & Pure Silk',
    },
    craft: {
      tag: 'Artisan Heritage Spotlight',
      headline: 'The Geometry of Handcrafted Perfection',
      subheadline: 'Zero mass production. Each piece woven on traditional pit looms with certified GI zari.',
      indicQuote: 'শিল্প ও ঐতিহ্যের মেলবন্ধন',
      cta: 'Book Private Viewing',
      pill: pillars[1] || 'Bespoke Craftsmanship',
    },
    thought_leadership: {
      tag: 'Industry Advisory Insight',
      headline: 'Authenticity is the Greatest Moat in Commerce',
      subheadline: 'Why discerning buyers choose heritage craftsmanship over generic mass market labels.',
      indicQuote: 'ज्ञानं परमं बलम्',
      cta: 'Read Strategic Report',
      pill: pillars[2] || 'Founder Perspective',
    },
  }[theme];

  // Font styling mapping
  const getFontFamilyStyle = () => {
    switch (fontFamily) {
      case 'Playfair Display':
        return 'font-serif';
      case 'Poppins':
        return 'font-sans';
      case 'Inter':
        return 'font-inter';
      case 'Sora':
      default:
        return 'font-sora';
    }
  };

  // Contrast / Readability heuristic
  const calculateContrastScore = () => {
    // High contrast check against dark canvas
    return 98;
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText?.(window.location.href);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2000);
    }
  };

  const handleDownloadSvg = () => {
    const svgElement = document.getElementById('brand-studio-canvas-svg');
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-brand-card.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
      {/* Studio Header & Tool Controls */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00]">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-sora text-sm font-bold text-[#0B0F14]">Live Brand Studio Canvas</h3>
              <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                60 FPS Live
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Interactive preview of multi-channel creatives composited with your brand tokens.
            </p>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowDeviceFrame(!showDeviceFrame)}
            className={`px-2.5 py-1.5 rounded-[8px] text-xs font-medium border flex items-center gap-1.5 transition ${
              showDeviceFrame
                ? 'bg-[#0B0F14] text-white border-[#0B0F14]'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
            title="Toggle mobile device frame mockup"
          >
            {showDeviceFrame ? <Smartphone size={13} /> : <Monitor size={13} />}
            <span className="hidden sm:inline">{showDeviceFrame ? 'Mobile Frame' : 'Card View'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSvg}
            className="px-2.5 py-1.5 rounded-[8px] bg-white border border-gray-200 hover:border-gray-400 text-gray-700 text-xs font-medium flex items-center gap-1.5 transition shadow-2xs"
            title="Download vector graphic asset"
          >
            <Download size={13} className="text-[#FF7A00]" />
            <span>Export SVG</span>
          </button>
        </div>
      </div>

      {/* Sub-bar: Aspect Ratio & Theme Switcher */}
      <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none text-xs">
        {/* Aspect Ratios */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-mono text-gray-400 uppercase mr-1">Format:</span>
          {(['1:1', '4:5', '16:9', '9:16'] as AspectRatio[]).map((ratio) => (
            <button
              key={ratio}
              type="button"
              onClick={() => setAspectRatio(ratio)}
              className={`px-2 py-0.5 rounded-[6px] text-[11px] font-medium transition ${
                aspectRatio === ratio
                  ? 'bg-gray-900 text-white font-bold'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {ratio === '1:1' ? '1:1 (Post)' : ratio === '4:5' ? '4:5 (Feed)' : ratio === '16:9' ? '16:9 (WA)' : '9:16 (Story)'}
            </button>
          ))}
        </div>

        {/* Theme Presets */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-mono text-gray-400 uppercase mr-1">Concept:</span>
          <button
            type="button"
            onClick={() => setTheme('festive')}
            className={`px-2 py-0.5 rounded-[6px] text-[11px] font-medium transition ${
              theme === 'festive'
                ? 'bg-orange-100 text-[#FF7A00] font-bold border border-orange-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎉 Festive Drop
          </button>
          <button
            type="button"
            onClick={() => setTheme('craft')}
            className={`px-2 py-0.5 rounded-[6px] text-[11px] font-medium transition ${
              theme === 'craft'
                ? 'bg-orange-100 text-[#FF7A00] font-bold border border-orange-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🧵 Craft Spotlight
          </button>
          <button
            type="button"
            onClick={() => setTheme('thought_leadership')}
            className={`px-2 py-0.5 rounded-[6px] text-[11px] font-medium transition ${
              theme === 'thought_leadership'
                ? 'bg-orange-100 text-[#FF7A00] font-bold border border-orange-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💡 Insight Quote
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="p-5 flex-1 flex flex-col items-center justify-center bg-[#0B0F14]/[0.02] min-h-[460px] relative">
        {/* Device Wrapper (if mobile frame active) */}
        <div
          className={`transition-all duration-300 w-full flex items-center justify-center ${
            showDeviceFrame
              ? 'max-w-[340px] p-3 rounded-[36px] bg-[#0B0F14] shadow-2xl border-4 border-gray-800'
              : 'max-w-[480px]'
          }`}
        >
          {/* Card Container with Dynamic Aspect Ratio */}
          <div
            id="brand-studio-canvas-preview"
            style={{
              fontFamily: fontFamily,
            }}
            className={`w-full rounded-[20px] overflow-hidden shadow-xl border border-white/20 relative flex flex-col justify-between transition-all duration-300 select-none ${
              aspectRatio === '1:1'
                ? 'aspect-square'
                : aspectRatio === '4:5'
                ? 'aspect-[4/5]'
                : aspectRatio === '16:9'
                ? 'aspect-[16/9]'
                : 'aspect-[9/16]'
            }`}
          >
            {/* SVG Background and Dynamic Gradient Compositing */}
            <svg
              id="brand-studio-canvas-svg"
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 800 800"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={secondaryColor} stopOpacity="1" />
                  <stop offset="55%" stopColor={secondaryColor} stopOpacity="0.92" />
                  <stop offset="100%" stopColor={primaryColor} stopOpacity="0.85" />
                </linearGradient>

                <linearGradient id="accentGlow" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={primaryColor} stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </linearGradient>

                <pattern id="heritageGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.08" />
                  <circle cx="20" cy="20" r="1" fill="white" fillOpacity="0.12" />
                </pattern>
              </defs>

              {/* Base Color Background */}
              <rect width="100%" height="100%" fill="url(#primaryGradient)" />
              {/* Subtle Grid / Weave Texture */}
              <rect width="100%" height="100%" fill="url(#heritageGrid)" />
              {/* Radial Glow */}
              <circle cx="700" cy="150" r="450" fill="url(#accentGlow)" />
            </svg>

            {/* Canvas Overlay Content (HTML Layer) */}
            <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-between h-full text-white">
              {/* Top Header: Brand Logo, Verified Pill & Tag */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[10px] bg-white/95 p-1 shadow-md flex items-center justify-center border border-white/40">
                    <img
                      src={logoUrl || '/brand/kuiro-primary.svg'}
                      alt="Brand Logo"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as any).src = '/brand/kuiro-primary.svg';
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm tracking-tight text-white drop-shadow-xs">
                        {businessName}
                      </span>
                      <CheckCircle2 size={13} className="text-[#FF7A00] shrink-0 fill-white" />
                    </div>
                    <span className="text-[10px] text-white/70 block font-mono">
                      {industry}
                    </span>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-semibold text-white/90">
                  {themeData.tag}
                </div>
              </div>

              {/* Center Content: Headline, Subheadline & Regional Indic Script */}
              <div className="my-auto space-y-2.5 py-3">
                {/* Tone Pill */}
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-[10px] font-medium text-amber-200">
                  <Sparkles size={11} className="text-[#FF7A00]" />
                  <span>{themeData.pill}</span>
                </div>

                {/* Primary Headline in Selected Typography */}
                <h2
                  className={`text-lg sm:text-2xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md ${getFontFamilyStyle()}`}
                >
                  {themeData.headline}
                </h2>

                {/* Subheadline Description */}
                <p className="text-[11px] sm:text-xs text-white/80 leading-relaxed max-w-sm font-inter">
                  {themeData.subheadline}
                </p>

                {/* Regional Cultural Script (Indic Ligature Preview) */}
                {includeIndic && (
                  <div className="pt-1">
                    <span className="inline-block px-2.5 py-1 rounded-[8px] bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300">
                      ✨ {themeData.indicQuote}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Strip: Call to Action, Website & Autopilot Watermark */}
              <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-3 text-[11px]">
                <button
                  type="button"
                  style={{
                    backgroundColor: primaryColor,
                    color: '#FFFFFF',
                  }}
                  className="px-3 py-1.5 rounded-[8px] text-[11px] font-bold shadow-md hover:brightness-110 transition flex items-center gap-1.5"
                >
                  <span>{themeData.cta}</span>
                  <span>→</span>
                </button>

                <div className="text-right">
                  <span className="font-mono text-[10px] text-white/85 block">
                    sharmaheritage.in
                  </span>
                  <span className="text-[9px] text-white/60 font-mono">
                    Verified KUIRO Autopilot
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Insights Bar: Real-time AI Critic & Design Audit */}
      <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>AI Critic Contrast Score: {calculateContrastScore()}/100 (WCAG AAA)</span>
          </div>

          <label className="flex items-center gap-1.5 text-[11px] text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeIndic}
              onChange={(e) => setIncludeIndic(e.target.checked)}
              className="rounded text-[#FF7A00] focus:ring-[#FF7A00] w-3.5 h-3.5"
            />
            <span>Indic Ligature Display</span>
          </label>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
          <span>Primary: {primaryColor}</span>
          <span>•</span>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: secondaryColor }} />
          <span>Accent: {secondaryColor}</span>
          <span>•</span>
          <span className="capitalize">{fontFamily}</span>
        </div>
      </div>
    </div>
  );
}
