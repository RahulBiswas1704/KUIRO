'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import KuiroLogo from '@/components/brand/KuiroLogo';
import { useAuth } from '@/context/AuthContext';
import GetStartedButton from '@/components/auth/GetStartedButton';
import { 
  Sparkles, 
  Layers, 
  TrendingUp, 
  MessageCircle, 
  Smartphone, 
  ArrowRight, 
  ExternalLink,
  Menu, 
  X as CloseIcon,
  LogIn,
  UserPlus
} from 'lucide-react';

export interface NavbarProps {
  activeRoute?: 'home' | 'services' | 'pricing' | 'contact' | 'get-started' | 'login' | 'signup' | 'none';
  theme?: 'dark' | 'light';
  floating?: boolean;
  badgeText?: string;
  statusText?: string;
  rightContent?: React.ReactNode;
  className?: string;
}

const NAV_LINKS: Array<{
  route: 'home' | 'services' | 'pricing' | 'contact';
  href: string;
  label: string;
}> = [
  { route: 'home', href: '/', label: 'Home' },
  { route: 'services', href: '/services', label: 'Services' },
  { route: 'pricing', href: '/pricing', label: 'Pricing' },
  { route: 'contact', href: '/contact', label: 'Contact Us' },
];

export default function Navbar({
  activeRoute = 'home',
  theme = 'dark',
  floating = false,
  badgeText = '',
  statusText = '',
  rightContent,
  className = '',
}: NavbarProps) {
  const router = useRouter();
  const { isLoggedIn, user, openAuthModal } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`${floating ? 'fixed left-0 right-0 top-3.5' : 'sticky top-0 sm:top-3.5'} z-50 transition-all duration-300 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full ${className}`}
    >
      <div
        className={`relative overflow-hidden transition-all duration-300 rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3 border backdrop-blur-2xl backdrop-saturate-[1.8] flex items-center justify-between ${
          isLight
            ? scrolled
              ? 'bg-white/70 border-white/80 ring-1 ring-black/[0.05] shadow-[0_18px_42px_-12px_rgba(11,15,20,0.16),inset_0_1px_1.5px_rgba(255,255,255,0.95)]'
              : 'bg-white/55 hover:bg-white/62 border-white/70 ring-1 ring-black/[0.04] shadow-[0_12px_36px_-10px_rgba(11,15,20,0.18),inset_0_1px_1.5px_rgba(255,255,255,0.9)]'
            : scrolled
            ? 'bg-[#0B0F14]/65 border-white/[0.18] shadow-[0_18px_42px_-12px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.22)]'
            : 'bg-[#0B0F14]/45 border-white/[0.14] shadow-[0_12px_32px_-10px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.16)]'
        }`}
      >
        {/* Top Specular Glass Rim Reflection */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent ${
            isLight ? 'via-white' : 'via-white/40'
          } to-transparent`}
        />

        {/* Left: Brand Identity Lockup */}
        <div className="relative z-10 flex items-center gap-3.5 flex-shrink-0">
          <Link href="/" className="focus:outline-none flex items-center flex-shrink-0 group">
            <KuiroLogo variant="primary" theme={isLight ? 'light' : 'dark'} symbolSize={32} showTagline={false} />
          </Link>
          {badgeText && (
            <div
              className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border backdrop-blur-md ${
                isLight
                  ? 'bg-white/50 border-white/70 text-slate-700'
                  : 'bg-white/[0.06] border-white/[0.12] text-slate-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
              <span>{badgeText}</span>
            </div>
          )}
        </div>

        {/* Center: Frosted Glass Pill Navigation Menu */}
        <nav
          aria-label="Primary navigation"
          className={`relative z-10 hidden md:flex items-center p-1 rounded-full border backdrop-blur-xl ${
            isLight
              ? 'bg-white/35 border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]'
              : 'bg-white/[0.06] border-white/[0.12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
          }`}
        >
          {NAV_LINKS.map((item) => {
            const isActive = activeRoute === item.route;
            return (
              <Link
                key={item.route}
                href={item.href}
                className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? isLight
                      ? 'bg-white/85 text-[#0B0F14] font-semibold border border-white/90 shadow-[0_2px_10px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,1)]'
                      : 'bg-white/15 text-white font-semibold border border-white/20 shadow-sm'
                    : isLight
                    ? 'text-[#0B0F14]/75 hover:text-[#0B0F14] hover:bg-white/50'
                    : 'text-slate-200/85 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Channels Online Status & Primary CTA */}
        <div className="relative z-10 flex items-center gap-3">
          {rightContent ? (
            rightContent
          ) : (
            <>
              {statusText && (
                <span className="hidden sm:inline-flex text-[11px] text-emerald-400 items-center gap-1.5 font-medium bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{statusText}</span>
                </span>
              )}

              {!isLoggedIn && (
                <Link
                  href="/get-started?mode=signin"
                  className={`hidden sm:inline-block text-xs font-medium px-3.5 py-1.5 rounded-full transition cursor-pointer ${
                    isLight
                      ? 'text-[#0B0F14]/80 hover:text-[#0B0F14] hover:bg-white/60'
                      : 'text-slate-200 hover:text-white hover:bg-white/[0.08]'
                  } ${activeRoute === 'get-started' ? 'font-semibold' : ''}`}
                >
                  Sign In
                </Link>
              )}

              <GetStartedButton
                className={
                  isLight && !isLoggedIn
                    ? '!bg-[#0B0F14]/90 !text-white hover:!bg-[#0B0F14] !border !border-white/15 !shadow-[0_8px_20px_-6px_rgba(11,15,20,0.35)] backdrop-blur-md'
                    : ''
                }
              />
            </>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-[10px] border transition-colors backdrop-blur-md ${
              isLight
                ? 'bg-white/50 border-white/70 text-[#0B0F14] hover:bg-white/75'
                : 'bg-white/[0.08] border-white/15 text-slate-200 hover:text-white hover:bg-white/15'
            }`}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <CloseIcon size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden mt-2 rounded-2xl border backdrop-blur-2xl backdrop-saturate-[1.8] px-4 py-5 space-y-3 animate-fade-in ${
            isLight
              ? 'border-white/75 bg-white/75 text-[#0B0F14] shadow-[0_24px_48px_-14px_rgba(11,15,20,0.22),inset_0_1px_1px_rgba(255,255,255,0.9)]'
              : 'border-white/15 bg-[#0B0F14]/75 shadow-[0_20px_40px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.12)]'
          }`}
        >
          <div className="grid grid-cols-2 gap-2 pb-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-[10px] text-xs font-medium flex items-center gap-2.5 transition ${
                activeRoute === 'home'
                  ? 'bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30 font-semibold'
                  : isLight
                  ? 'bg-gray-50 text-slate-700 hover:bg-gray-100 border border-gray-200'
                  : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <Sparkles size={14} className="text-[#FF7A00]" />
              <span>Home</span>
            </Link>
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-[10px] text-xs font-medium flex items-center gap-2.5 transition ${
                activeRoute === 'services'
                  ? 'bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30 font-semibold'
                  : isLight
                  ? 'bg-gray-50 text-slate-700 hover:bg-gray-100 border border-gray-200'
                  : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <Layers size={14} className="text-[#FF7A00]" />
              <span>Services</span>
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-[10px] text-xs font-medium flex items-center gap-2.5 transition ${
                activeRoute === 'pricing'
                  ? 'bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30 font-semibold'
                  : isLight
                  ? 'bg-gray-50 text-slate-700 hover:bg-gray-100 border border-gray-200'
                  : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <TrendingUp size={14} className="text-[#FF7A00]" />
              <span>Pricing</span>
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-[10px] text-xs font-medium flex items-center gap-2.5 transition ${
                activeRoute === 'contact'
                  ? 'bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30 font-semibold'
                  : isLight
                  ? 'bg-gray-50 text-slate-700 hover:bg-gray-100 border border-gray-200'
                  : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <MessageCircle size={14} className="text-[#FF7A00]" />
              <span>Contact Us</span>
            </Link>
          </div>

          <div className={`pt-2 border-t space-y-2 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
            <a
              href="https://wa.me/919876543210?text=Hi%20KUIRO%20Team%2C%20I%20would%20like%20to%20learn%20more"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full py-2.5 px-3 rounded-[10px] border text-xs font-medium flex items-center justify-between ${
                isLight
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <Smartphone size={14} />
                <span>WhatsApp Direct (+91 98765 43210)</span>
              </span>
              <ExternalLink size={12} />
            </a>

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF881A] text-white text-xs font-sora font-semibold transition shadow-md shadow-[#FF7A00]/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Go to Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/get-started"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl bg-[#FF7A00] text-white text-xs font-sora font-semibold hover:bg-[#FF881A] transition text-center shadow-md shadow-[#FF7A00]/25 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus size={13} />
                  <span>Get Started</span>
                </Link>
                <Link
                  href="/get-started?mode=signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-sora font-semibold transition text-center border flex items-center justify-center gap-1.5 cursor-pointer ${
                    isLight
                      ? 'bg-gray-100 hover:bg-gray-200 text-[#0B0F14] border-gray-200'
                      : 'bg-white/[0.08] hover:bg-white/[0.12] text-white border-white/10'
                  }`}
                >
                  <LogIn size={13} />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

