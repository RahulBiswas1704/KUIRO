'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Navbar, Footer } from '@/components/layout';
import type { NavbarProps } from '@/components/layout/Navbar';

interface AuthPageShellProps {
  activeRoute: NavbarProps['activeRoute'];
  eyebrow: string;
  title: string;
  accentTitle?: string;
  subtitle: string;
  children: React.ReactNode;
}

/**
 * Shared light-editorial auth frame for /get-started, /login, and /signup.
 * Features the translucent glassmorphic floating Navbar over a framed dusk horizon,
 * overlapping into a crisp warm-bordered white card on #F9FAFD.
 */
export default function AuthPageShell({
  activeRoute,
  eyebrow,
  title,
  accentTitle,
  subtitle,
  children,
}: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-[#F9FAFD] text-[#0B0F14] flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-x-clip">
      <Navbar activeRoute={activeRoute} theme="light" floating />

      <main className="flex-1 flex flex-col">
        {/* Framed Dusk Horizon Stage */}
        <section className="relative bg-gradient-to-b from-[#667387] via-[#465163] to-[#232A38] rounded-b-[28px] sm:rounded-b-[44px] pt-28 sm:pt-32 pb-32 sm:pb-36 px-4 text-center overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-[#FF7A00]/25 blur-[110px]"
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs text-white/90 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
              <span>{eyebrow}</span>
            </div>

            <h1 className="font-sora text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white leading-[1.08]">
              {title}
              {accentTitle && (
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF9D42] via-[#FF7A00] to-[#FFB36B]">
                  {accentTitle}
                </span>
              )}
            </h1>

            <p className="text-xs sm:text-base text-white/80 font-inter max-w-lg mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>
        </section>

        {/* Overlapping Warm-Bordered Light Auth Card */}
        <section className="relative z-20 -mt-20 sm:-mt-24 px-4 sm:px-6 pb-16 sm:pb-20 w-full flex flex-col items-center">
          <div className="w-full max-w-[440px] p-px rounded-[28px] bg-gradient-to-b from-[#FF8E3C]/65 via-[#FF8E3C]/20 to-gray-200/80 shadow-[0_24px_60px_-24px_rgba(11,15,20,0.22)]">
            <div className="bg-white rounded-[27px] p-6 sm:p-8">{children}</div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-inter text-gray-500">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#374151]">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>14-day full autopilot trial</span>
            </span>
            <span aria-hidden="true" className="text-gray-300">
              •
            </span>
            <span>No credit card required</span>
            <span aria-hidden="true" className="text-gray-300">
              •
            </span>
            <span>Cancel anytime</span>
          </div>
        </section>
      </main>

      <Footer theme="light" />
    </div>
  );
}
