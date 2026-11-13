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
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <KuiroLogo variant="primary" theme="dark" symbolSize={28} showTagline={false} />
          <p className="text-[11px] text-gray-500 mt-1 text-center md:text-left">
            Your always-on AI marketing employee for Indian SMBs, clinics, and agencies.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-300">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <Link href="/services" className="hover:text-white transition">Services</Link>
          <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
          <Link href="/contact" className="hover:text-white transition">Contact Us</Link>
          <Link href="/get-started" className="text-[#FF7A00] font-semibold hover:text-[#FF881A] transition">Get Started</Link>
        </div>

        <p className="text-[11px] text-gray-600">
          © 2026 KUIRO Technologies Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

