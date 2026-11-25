'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Navbar, Footer } from '@/components/layout';

export interface LegalSummaryItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export interface LegalTocItem {
  id: string;
  num: string;
  label: string;
}

interface LegalPageShellProps {
  activeDoc: 'privacy' | 'terms' | 'disclaimer';
  badgeIcon: React.ReactNode;
  badgeText: string;
  title: string;
  subtitle: string;
  effectiveDate: string;
  lastUpdated: string;
  highlights: LegalSummaryItem[];
  toc: LegalTocItem[];
  children: React.ReactNode;
}

const DOC_TABS: Array<{ id: 'privacy' | 'terms' | 'disclaimer'; label: string; href: string }> = [
  { id: 'privacy', label: 'Privacy Policy', href: '/privacy' },
  { id: 'terms', label: 'Terms & Conditions', href: '/terms' },
  { id: 'disclaimer', label: 'Legal Disclaimer', href: '/disclaimer' },
];

/**
 * Shared light-editorial layout shell for KUIRO's Legal & Trust pages.
 * Aligns /privacy, /terms, and /disclaimer with the dusk hero, frosted glass Navbar,
 * warm cream highlights, and crisp white reading paper design system.
 */
export default function LegalPageShell({
  activeDoc,
  badgeIcon,
  badgeText,
  title,
  subtitle,
  effectiveDate,
  lastUpdated,
  highlights,
  toc,
  children,
}: LegalPageShellProps) {
  const otherDocs = DOC_TABS.filter((d) => d.id !== activeDoc);

  return (
    <div className="min-h-screen bg-[#F9FAFD] text-[#0B0F14] flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-x-clip">
      <Navbar activeRoute="none" theme="light" floating />

      <main className="flex-1 flex flex-col">
        {/* Framed Dusk Horizon Header */}
        <header className="relative bg-gradient-to-b from-[#667387] via-[#465163] to-[#232A38] rounded-b-[28px] sm:rounded-b-[44px] pt-28 sm:pt-34 pb-24 sm:pb-28 px-4 sm:px-6 text-center overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[720px] h-[300px] rounded-full bg-[#FF7A00]/22 blur-[110px]"
          />

          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs text-white/95 font-medium">
              {badgeIcon}
              <span>{badgeText}</span>
            </div>

            <h1 className="font-sora text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-white leading-[1.08]">
              {title}
            </h1>

            <p className="text-sm sm:text-base text-white/80 font-inter max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-mono text-white/70">
              <span>Effective: {effectiveDate}</span>
              <span aria-hidden="true" className="text-white/30">
                •
              </span>
              <span>Last Updated: {lastUpdated}</span>
            </div>
          </div>
        </header>

        {/* Overlapping Summary Strip */}
        <section className="relative z-20 -mt-12 sm:-mt-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white border border-gray-200/90 shadow-[0_14px_34px_-18px_rgba(11,15,20,0.16)] p-5 flex items-start gap-3 text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#EFE7DE] flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <strong className="font-sora text-sm font-bold text-[#0B0F14] block">
                    {item.title}
                  </strong>
                  <p className="text-xs text-[#4B5563] font-inter mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Document Grid (Sticky TOC + High-Clarity Reading Paper) */}
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sticky Navigation Sidebar */}
            <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-5 text-left">
              <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-3 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.12)]">
                <span className="text-[11px] font-sora font-bold uppercase tracking-wider text-gray-500 block">
                  On This Page
                </span>
                <nav aria-label="Document sections" className="space-y-1.5">
                  {toc.map((entry) => (
                    <a
                      key={entry.id}
                      href={`#${entry.id}`}
                      className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#374151] hover:text-[#0B0F14] hover:bg-[#FAF8F5] transition font-inter"
                    >
                      <span className="font-mono text-[#FF7A00] font-semibold shrink-0">
                        {entry.num}
                      </span>
                      <span className="leading-snug">{entry.label}</span>
                    </a>
                  ))}
                </nav>
              </div>

              <div className="rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] p-5 space-y-2.5">
                <span className="text-[11px] font-sora font-bold uppercase tracking-wider text-gray-500 block">
                  Legal Library
                </span>
                <div className="space-y-1.5">
                  {DOC_TABS.map((doc) => {
                    const isCurrent = doc.id === activeDoc;
                    return (
                      <Link
                        key={doc.id}
                        href={doc.href}
                        className={`block px-3 py-2 rounded-xl text-xs font-sora transition ${
                          isCurrent
                            ? 'bg-[#0B0F14] text-white font-bold'
                            : 'text-[#374151] hover:bg-white hover:text-[#0B0F14] font-medium'
                        }`}
                      >
                        {doc.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Document Body Paper */}
            <article className="lg:col-span-9 p-px rounded-[28px] bg-gradient-to-b from-[#FF8E3C]/45 via-gray-200/70 to-gray-200/40 shadow-[0_18px_48px_-26px_rgba(15,23,42,0.14)]">
              <div className="bg-white rounded-[27px] p-6 sm:p-10 space-y-10 text-left text-[#374151] font-inter text-sm leading-relaxed">
                {children}

                {/* Cross-Document Footer Links */}
                <div className="pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs font-sora">
                  <Link
                    href={otherDocs[0].href}
                    className="inline-flex items-center gap-1.5 text-[#FF7A00] font-bold hover:underline"
                  >
                    <span>Read {otherDocs[0].label}</span>
                    <ArrowRight size={14} />
                  </Link>
                  <Link
                    href={otherDocs[1].href}
                    className="inline-flex items-center gap-1.5 text-[#374151] hover:text-[#0B0F14] font-semibold transition"
                  >
                    <span>Read {otherDocs[1].label} →</span>
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>

      <Footer theme="light" />
    </div>
  );
}
