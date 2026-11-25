'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import KuiroLoader from './KuiroLoader';

/**
 * Provides:
 * 1. A kinetic KUIRO vector-draw entrance reveal on initial load that adapts
 *    to light editorial pages (#FAF9F6) and dark dashboard/admin workspaces (#0B0F14).
 * 2. A whisper-thin #FF7A00 top hairline indicator during Next.js route changes.
 */
export default function RouteLoaderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const isDarkRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  const [showSplash, setShowSplash] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Initial page-entry vector choreography (~950ms hold -> smooth 320ms lift-fade)
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setShowSplash(false);
      return;
    }

    const fadeTimer = window.setTimeout(() => {
      setIsExiting(true);
    }, 980);

    const unmountTimer = window.setTimeout(() => {
      setShowSplash(false);
    }, 1320);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(unmountTimer);
    };
  }, []);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = (e.target as HTMLElement | null)?.closest('a');
      if (!target) return;
      if (target.target === '_blank' || target.hasAttribute('download')) return;

      const rawHref = target.getAttribute('href');
      if (
        !rawHref ||
        rawHref.startsWith('#') ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('tel:')
      ) {
        return;
      }

      try {
        const destUrl = new URL(target.href, window.location.origin);
        if (destUrl.origin !== window.location.origin) return;
        if (destUrl.pathname === window.location.pathname && !destUrl.search) return;

        setIsNavigating(true);
      } catch {
        // Ignore malformed links
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  useEffect(() => {
    if (!isNavigating) return;
    const safety = window.setTimeout(() => setIsNavigating(false), 4000);
    return () => window.clearTimeout(safety);
  }, [isNavigating]);

  return (
    <>
      {isNavigating && (
        <div
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 h-[2.5px] z-[120] overflow-hidden bg-transparent pointer-events-none"
        >
          <div className="kuiro-loader-bar w-2/5 h-full bg-gradient-to-r from-[#FF7A00] via-[#FFB36B] to-[#FF7A00]" />
        </div>
      )}

      {showSplash && (
        <div
          aria-hidden={isExiting}
          className={`fixed inset-0 z-[110] transition-all duration-300 ease-out ${
            isExiting
              ? 'opacity-0 -translate-y-2 pointer-events-none'
              : 'opacity-100 translate-y-0'
          }`}
        >
          <KuiroLoader
            variant="fullscreen"
            mode="once"
            theme={isDarkRoute ? 'dark' : 'light'}
          />
        </div>
      )}

      {children}
    </>
  );
}
