'use client';

import React from 'react';
import { KUIRO_SYMBOL_PARTS, KUIRO_SYMBOL_PATH, KUIRO_WORDMARK_PATH } from './KuiroLogo';

export interface KuiroLoaderProps {
  variant?: 'fullscreen' | 'inline' | 'compact';
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  mode?: 'loop' | 'once';
  label?: string;
  showWordmark?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { icon: 28, lockupH: 30 },
  md: { icon: 40, lockupH: 42 },
  lg: { icon: 54, lockupH: 54 },
};

/**
 * Bespoke KUIRO Architectural Vector Loader.
 * No circular spinner rings or generic shimmer bars — KUIRO's folded geometric K
 * traces itself in hairline drafting strokes, blooms into #FF7A00, reveals the
 * horizontal KUIRO wordmark lockup, and beats through "Create · Approve · Grow."
 */
export default function KuiroLoader({
  variant = 'inline',
  theme = 'light',
  size = variant === 'fullscreen' ? 'lg' : variant === 'compact' ? 'sm' : 'md',
  mode = 'loop',
  label,
  showWordmark = variant !== 'compact',
  className = '',
}: KuiroLoaderProps) {
  const isLight = theme === 'light';
  const dims = SIZE_MAP[size];
  const strokeClass = mode === 'once' ? 'kuiro-stroke-once' : 'kuiro-stroke-loop';

  // Official geometric parts from KuiroLogo: [upperWing, leftSpine, lowerWing]
  const upperWing = KUIRO_SYMBOL_PARTS[0] ?? KUIRO_SYMBOL_PATH;
  const leftSpine = KUIRO_SYMBOL_PARTS[1] ?? '';
  const lowerWing = KUIRO_SYMBOL_PARTS[2] ?? '';

  const drawPaths = (
    <>
      {leftSpine ? (
        <>
          <path
            d={leftSpine}
            fill="#FF7A00"
            fillRule="evenodd"
            stroke="#FF7A00"
            strokeWidth={1.75}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            pathLength={100}
            className={strokeClass}
            style={{ '--kuiro-delay': '0ms' } as React.CSSProperties}
          />
          <path
            d={upperWing}
            fill="#FF7A00"
            fillRule="evenodd"
            stroke="#FF7A00"
            strokeWidth={1.75}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            pathLength={100}
            className={strokeClass}
            style={{ '--kuiro-delay': '110ms' } as React.CSSProperties}
          />
          <path
            d={lowerWing}
            fill="#FF7A00"
            fillRule="evenodd"
            stroke="#FF7A00"
            strokeWidth={1.75}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            pathLength={100}
            className={strokeClass}
            style={{ '--kuiro-delay': '220ms' } as React.CSSProperties}
          />
        </>
      ) : (
        <path
          d={upperWing}
          fill="#FF7A00"
          fillRule="evenodd"
          stroke="#FF7A00"
          strokeWidth={1.75}
          vectorEffect="non-scaling-stroke"
          pathLength={100}
          className={strokeClass}
        />
      )}
    </>
  );

  if (variant === 'compact') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label || 'Loading KUIRO'}
        className={`inline-flex items-center gap-2.5 ${className}`}
      >
        <svg
          aria-hidden="true"
          viewBox="60 145 920 730"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible select-none shrink-0"
          style={{ width: dims.icon, height: dims.icon }}
        >
          {drawPaths}
        </svg>
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

  // Separate HTML-wrapped symbol + wordmark lockup so CSS clip-path/transform never collides with SVG transform attributes
  const symbolHeight = dims.lockupH;
  const wordmarkHeight = Math.round(dims.lockupH * 0.56);
  const wordmarkWidth = Math.round(wordmarkHeight * (990 / 214));
  const wordmarkColor = isLight ? '#0B0F14' : '#FFFFFF';

  const core = (
    <div className="relative z-10 flex flex-col items-center text-center px-6">
      <div className="inline-flex items-center justify-center gap-3 sm:gap-4 select-none">
        <svg
          aria-hidden="true"
          viewBox="60 145 920 730"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible shrink-0"
          style={{ width: symbolHeight, height: symbolHeight }}
        >
          {drawPaths}
        </svg>

        {showWordmark && (
          <div className={mode === 'once' ? 'kuiro-wordmark-wipe' : ''}>
            <svg
              aria-hidden="true"
              viewBox="20 182 990 214"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="block select-none"
              style={{ width: wordmarkWidth, height: wordmarkHeight }}
            >
              <path d={KUIRO_WORDMARK_PATH} fill={wordmarkColor} fillRule="evenodd" stroke="none" />
            </svg>
          </div>
        )}
      </div>

      {/* KUIRO Editorial Beat Underlay */}
      {label ? (
        <p
          className={`mt-5 text-xs sm:text-sm font-inter font-medium tracking-wide ${
            isLight ? 'text-[#4B5563]' : 'text-slate-400'
          }`}
        >
          {label}
        </p>
      ) : (
        <div
          className={`mt-5 inline-flex items-center gap-2 text-xs sm:text-sm font-sora font-semibold tracking-tight ${
            isLight ? 'text-[#374151]' : 'text-slate-300'
          }`}
        >
          <span
            className="kuiro-beat-word"
            style={{ '--beat-delay': '0.18s' } as React.CSSProperties}
          >
            Create
          </span>
          <span className="text-[#FF7A00] font-bold">/</span>
          <span
            className="kuiro-beat-word"
            style={{ '--beat-delay': '0.36s' } as React.CSSProperties}
          >
            Approve
          </span>
          <span className="text-[#FF7A00] font-bold">/</span>
          <span
            className="kuiro-beat-word text-[#FF7A00]"
            style={{ '--beat-delay': '0.54s' } as React.CSSProperties}
          >
            Grow.
          </span>
        </div>
      )}
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label || 'Loading KUIRO'}
        className={`min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden ${
          isLight ? 'bg-[#FAF9F6] text-[#0B0F14]' : 'bg-[#0B0F14] text-white'
        } ${className}`}
      >
        {/* Warm Editorial Horizon Wash (matches redesigned site palette without blur clutter) */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -bottom-28 left-1/2 -translate-x-1/2 w-[780px] h-[340px] rounded-full blur-[120px] ${
            isLight ? 'bg-[#FF7A00]/[0.14]' : 'bg-[#FF7A00]/[0.12]'
          }`}
        />
        {core}
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
      {core}
    </div>
  );
}
