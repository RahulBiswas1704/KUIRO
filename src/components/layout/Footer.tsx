'use client';

import React from 'react';
import Link from 'next/link';
import KuiroLogo from '@/components/brand/KuiroLogo';

export interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`mt-auto border-t border-white/10 bg-[#060a12] py-12 px-4 text-xs text-slate-500 ${className}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Upper Row: Brand & Product Navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <KuiroLogo variant="primary" theme="dark" symbolSize={28} showTagline={false} />
            <p className="text-[11px] text-gray-400 mt-1 text-center md:text-left max-w-md font-inter">
              The autonomous marketing operating system for SMBs, personal brands, founders, retail shops, and creators.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-300 font-medium">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/services" className="hover:text-white transition">Services</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/contact" className="hover:text-white transition">Contact Us</Link>
            <Link href="/get-started" className="text-[#FF7A00] font-semibold hover:text-[#FF881A] transition">Get Started</Link>
          </div>
        </div>

        {/* Lower Row: Legal, Compliance & Copyright */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400 font-inter">
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link href="/privacy" className="hover:text-slate-200 transition">
              Privacy Policy
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/terms" className="hover:text-slate-200 transition">
              Terms &amp; Conditions
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/disclaimer" className="hover:text-slate-200 transition">
              Disclaimer
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-gray-500">
            <span>© 2026 KUIRO Technologies Inc. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <span className="text-emerald-500/80 font-mono text-[10px]">DPDP Act (India) Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
