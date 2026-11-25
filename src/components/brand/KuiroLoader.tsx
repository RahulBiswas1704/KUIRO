'use client';

import React from 'react';
import { KUIRO_SYMBOL_PARTS, KUIRO_SYMBOL_PATH, KUIRO_WORDMARK_PATH } from './KuiroLogo';

export interface KuiroLoaderProps {
  variant?: 'fullscreen' | 'inline' | 'compact';
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  sublabel?: string;
  showWordmark?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { badge: 52, svg: 30, wordmarkW: 96, wordmarkH: 22 },
  md: { badge: 76, svg: 42, wordmarkW: 122, wordmarkH: 28 },
  lg: { badge: 96, svg: 54, wordmarkW: 148, wordmarkH: 34 },
};

/**
 * Personalized KUIRO Geometric Brand Loader.
 * Assembles KUIRO's three geometric 'K' strokes sequentially inside an orbiting #FF7A00 progress arc.
 */
export default function KuiroLoader({
  variant = 'inline',
  theme = 'light',
  size = variant === 'fullscreen' ? 'lg' : variant === 'compact' ? 'sm' : 'md',
  label,
  sublabel = 'Create · Approve · Grow',
  showWordmark = variant !== 'compact',
  className = '',
}: KuiroLoaderProps) {
  const isLight = theme === 'light';
  const dims = SIZE_MAP[size];

  // Fallback gracefully if subpath extraction ever yields fewer than 3 segments
  const upperWing = KUIRO_SYMBOL_PARTS[0] ?? KUIRO_SYMBOL_PATH;
  const leftSpine = KUIRO_SYMBOL_PARTS[1] ?? '';
  const lowerWing = KUIRO_SYMBOL_PARTS[2] ?? '';

  const emblem = (
    <div
      className="relative inline-flex items-center justify-center select-none"
      style={{ width: dims.badge, height: dims.badge }}
    >
      {/* Subtle Warm KUIRO Glow Halo */}
      <div
        aria-hidden="true"
        className={`kuiro-loader-halo absolute inset-0 rounded-full blur-xl ${
          isLight ? 'bg-[#FF7A00]/20' : 'bg-[#FF7A00]/25'
        }`}
      />

      {/* Medallion Surface */}
      <div
        className={`relative w-full h-full rounded-full flex items-center justify-center border ${
          isLight
            ? 'bg-white border-[#EFE7DE] shadow-[0_14px_34px_-16px_rgba(11,15,20,0.18)]'
            : 'bg-[#0F1622] border-white/10 shadow-[0_18px_44px_-16px_rgba(0,0,0,0.75)]'
        }`}
      >
        {/* Rotating Orbital Progress Ring */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full -rotate-90"
          fill="none"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke={isLight ? '#EFE7DE' : 'rgba(255,255,255,0.08)'}
            strokeWidth="2.5"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="#FF7A00"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeDasharray="289"
            className="kuiro-loader-ring"
          />
        </svg>

        {/* Animated Assembling KUIRO 'K' Emblem */}
        <svg
          aria-hidden="true"
          viewBox="60 145 920 730"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative overflow-visible"
          style={{ width: dims.svg, height: dims.svg }}
        >
          {leftSpine ? (
            <>
              <path
                d={leftSpine}
                fill="#FF7A00"
                fillRule="evenodd"
                className="kuiro-loader-spine"
              />
              <path
                d={upperWing}
                fill="#FF7A00"
                fillRule="evenodd"
                className="kuiro-loader-upper"
              />
              <path
                d={lowerWing}
                fill="#FF7A00"
                fillRule="evenodd"
                className="kuiro-loader-lower"
              />
            </>
          ) : (
            <path d={upperWing} fill="#FF7A00" fillRule="evenodd" />
          )}
        </svg>
      </div>
    </div>
  );

  if (variant === 'compact') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label || 'Loading KUIRO'}
        className={`inline-flex items-center gap-3 ${className}`}
      >
        {emblem}
        {label && (
          <span
            className={`font-sora text-xs font-semibold ${
              isLight ? 'text-[#0B0F14]' : 'text-white'
            }`}
          >
            {label}
          </span>
        )}
      </div>
    );
  }

  const content = (
    <div className="relative z-10 flex flex-col items-center text-center px-6">
      {emblem}

      {showWordmark && (
        <svg
          aria-hidden="true"
          viewBox="20 182 990 214"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mt-5 select-none"
          style={{ width: dims.wordmarkW, height: dims.wordmarkH }}
        >
          <path
            d={KUIRO_WORDMARK_PATH}
            fill={isLight ? '#0B0F14' : '#FFFFFF'}
            fillRule="evenodd"
          />
        </svg>
      )}

      {/* Sleek Warm Shimmer Bar */}
      <div
        className={`mt-4 w-36 h-[3px] rounded-full overflow-hidden ${
          isLight ? 'bg-[#EFE7DE]' : 'bg-white/10'
        }`}
      >
        <div className="kuiro-loader-bar w-1/2 h-full rounded-full bg-gradient-to-r from-[#FF7A00] via-[#FFB36B] to-[#FF7A00]" />
      </div>

      <p
        className={`mt-3 text-xs font-inter font-medium tracking-wide ${
          isLight ? 'text-[#4B5563]' : 'text-slate-400'
        }`}
      >
        {label || sublabel}
      </p>
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label || 'Loading KUIRO'}
        className={`min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden ${
          isLight ? 'bg-[#F9FAFD] text-[#0B0F14]' : 'bg-[#0B0F14] text-white'
        } ${className}`}
      >
        {/* Subtle Editorial Horizon Wash */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[340px] rounded-full blur-[110px] ${
            isLight
              ? 'bg-gradient-to-tr from-[#FFE2C6]/75 via-[#FFF0E0]/60 to-[#E8ECFF]/45'
              : 'bg-[#FF7A00]/12'
          }`}
        />
        {content}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label || 'Loading KUIRO'}
      className={`w-full py-12 flex flex-col items-center justify-center relative ${className}`}
    >
      {content}
    </div>
  );
}
