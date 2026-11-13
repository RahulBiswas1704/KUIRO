'use client';

import React from 'react';

interface AnnouncementBarProps {
  badge?: string;
  tagline?: string;
  subtitle?: string;
  className?: string;
}

export default function AnnouncementBar({
  badge = 'Autonomous Protocol Active',
  tagline = 'Create / Approve / Grow.',
  subtitle = '— Your marketing. On autopilot.',
  className = '',
}: AnnouncementBarProps) {
  return (
    <div className={`bg-[#080C12] border-b border-white/[0.06] px-3 sm:px-4 py-2 text-[11px] sm:text-xs text-center text-slate-300 flex items-center justify-center gap-2 flex-wrap ${className}`}>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30 uppercase tracking-wider font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-pulse" />
        {badge}
      </span>
      <span className="font-medium text-slate-200">{tagline}</span>
      {subtitle && <span className="hidden sm:inline text-slate-400">{subtitle}</span>}
    </div>
  );
}

