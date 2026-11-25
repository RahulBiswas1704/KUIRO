'use client';

import React from 'react';
import Link from 'next/link';
import KuiroLogo from '@/components/brand/KuiroLogo';

export interface FooterProps {
  className?: string;
  theme?: 'dark' | 'light';
}

export default function Footer({ className = '', theme = 'dark' }: FooterProps) {
  const isLight = theme === 'light';

  return (
    <footer
      className={`mt-auto border-t py-12 px-4 text-xs ${
        isLight
          ? 'border-[#E6E0D6] bg-[#F5F2EB] text-slate-600'
          : 'border-white/10 bg-[#060a12] text-slate-500'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Upper Row: Brand & Product Navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <KuiroLogo variant="primary" theme={isLight ? 'light' : 'dark'} symbolSize={28} showTagline={false} />
            <p className={`text-[11px] mt-1 text-center md:text-left max-w-md font-inter ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Your always-on AI marketing colleague for growing businesses, creators, and agencies.
            </p>
          </div>

          <div className={`flex flex-wrap items-center justify-center gap-6 text-xs font-medium ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
            <Link href="/" className={isLight ? 'hover:text-black transition' : 'hover:text-white transition'}>Home</Link>
            <Link href="/services" className={isLight ? 'hover:text-black transition' : 'hover:text-white transition'}>Services</Link>
            <Link href="/pricing" className={isLight ? 'hover:text-black transition' : 'hover:text-white transition'}>Pricing</Link>
            <Link href="/contact" className={isLight ? 'hover:text-black transition' : 'hover:text-white transition'}>Contact Us</Link>
            <Link href="/get-started" className="text-[#FF7A00] font-semibold hover:text-[#E06C00] transition">Get Started</Link>
          </div>
        </div>

        {/* Lower Row: Legal, Compliance & Copyright */}
        <div
          className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-inter ${
            isLight ? 'border-[#E6E0D6] text-slate-600' : 'border-white/5 text-gray-400'
          }`}
        >
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link href="/privacy" className={isLight ? 'hover:text-black transition underline' : 'hover:text-slate-200 transition'}>
              Privacy Policy
            </Link>
            <span className={isLight ? 'text-slate-300' : 'text-gray-700'}>•</span>
            <Link href="/terms" className={isLight ? 'hover:text-black transition underline' : 'hover:text-slate-200 transition'}>
              Terms &amp; Conditions
            </Link>
            <span className={isLight ? 'text-slate-300' : 'text-gray-700'}>•</span>
            <Link href="/disclaimer" className={isLight ? 'hover:text-black transition underline' : 'hover:text-slate-200 transition'}>
              Disclaimer
            </Link>
          </div>

          <div className={`flex flex-wrap items-center justify-center gap-3 ${isLight ? 'text-slate-600' : 'text-gray-500'}`}>
            <span>© 2026 KUIRO Technologies Inc. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <span className={`font-mono text-[10px] ${isLight ? 'text-emerald-700 font-semibold' : 'text-emerald-500/80'}`}>DPDP Act (India) Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
