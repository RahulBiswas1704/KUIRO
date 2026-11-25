'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import KuiroLoader from './KuiroLoader';

/**
 * Provides:
 * 1. A smooth, personalized KUIRO geometric entrance curtain on initial website load
 *    that adapts automatically to light public pages and dark dashboard/admin workspaces.
 * 2. A sleek #FF7A00 top progress hairline during client-side Next.js route changes.
 */
export default function RouteLoaderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const isDarkRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Initial page-entry brand choreography
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setShowSplash(false);
      return;
    }

    const fadeTimer = window.setTimeout(() => {
      setIsFading(true);
    }, 680);

    const unmountTimer = window.setTimeout(() => {
      setShowSplash(false);
    }, 1020);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(unmountTimer);
    };
  }, []);

  // Clear route navigation progress whenever pathname settles
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Listen for internal Next.js Link clicks to show the top progress indicator immediately
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
        // Ignore malformed links safely
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  // Safety timeout if a route transition aborts or resolves to the same path
  useEffect(() => {
    if (!isNavigating) return;
    const safety = window.setTimeout(() => setIsNavigating(false), 4000);
    return () => window.clearTimeout(safety);
  }, [isNavigating]);

  return (
    <>
      {/* Sleek Top Route Transition Shimmer Bar */}
      {isNavigating && (
        <div
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 h-[3px] z-[120] overflow-hidden bg-transparent pointer-events-none"
        >
          <div className="kuiro-loader-bar w-2/5 h-full bg-gradient-to-r from-[#FF7A00] via-[#FFB36B] to-[#FF7A00] shadow-[0_0_12px_rgba(255,122,0,0.65)]" />
        </div>
      )}

      {/* Personalized Geometric Logo Intro Curtain */}
      {showSplash && (
        <div
          aria-hidden={isFading}
          className={`fixed inset-0 z-[110] transition-opacity duration-300 ease-out ${
            isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <KuiroLoader
            variant="fullscreen"
            theme={isDarkRoute ? 'dark' : 'light'}
            sublabel="Create · Approve · Grow"
          />
        </div>
      )}

      {children}
    </>
  );
}
