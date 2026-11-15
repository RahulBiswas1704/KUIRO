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
  badgeText?: string;
  statusText?: string;
  rightContent?: React.ReactNode;
  className?: string;
}

export default function Navbar({
  activeRoute = 'home',
  badgeText = '',
  statusText = '',
  rightContent,
  className = '',
}: NavbarProps) {
  const router = useRouter();
  const { isLoggedIn, user, openAuthModal } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 sm:top-3.5 z-50 transition-all duration-300 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full ${className}`}
    >
      <div 
        className={`transition-all duration-300 rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3 border backdrop-blur-2xl flex items-center justify-between ${
          scrolled 
            ? 'bg-[#080B11]/88 border-white/[0.14] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.85),0_0_24px_rgba(255,122,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.16)]' 
            : 'bg-[#0A0E17]/70 border-white/[0.09] shadow-[0_12px_32px_-10px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)]'
        }`}
      >
        {/* Left: Brand Identity Lockup */}
        <div className="flex items-center gap-3.5 flex-shrink-0">
          <Link href="/" className="focus:outline-none flex items-center flex-shrink-0 group">
            <KuiroLogo variant="primary" theme="dark" symbolSize={34} showTagline={false} />
          </Link>
          {badgeText && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
              <span>{badgeText}</span>
            </div>
          )}
        </div>

        {/* Center: Floating Pill Navigation Menu */}
        <nav className="hidden md:flex items-center p-1 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          <Link 
            href="/" 
            className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 flex items-center gap-1.5 ${
              activeRoute === 'home'
                ? 'bg-white/10 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {activeRoute === 'home' && <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />}
            <span>Home</span>
          </Link>
          <Link 
            href="/services" 
            className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 flex items-center gap-1.5 ${
              activeRoute === 'services'
                ? 'bg-white/10 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {activeRoute === 'services' && <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />}
            <span>Services</span>
          </Link>
          <Link 
            href="/pricing" 
            className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 flex items-center gap-1.5 ${
              activeRoute === 'pricing'
                ? 'bg-white/10 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {activeRoute === 'pricing' && <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />}
            <span>Pricing</span>
          </Link>
          <Link 
            href="/contact" 
            className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 flex items-center gap-1.5 ${
              activeRoute === 'contact'
                ? 'bg-white/10 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {activeRoute === 'contact' && <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />}
            <span>Contact Us</span>
          </Link>
        </nav>

        {/* Right: Channels Online Status & Primary CTA */}
        <div className="flex items-center gap-3">
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
                  className={`hidden sm:inline-block text-xs font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full hover:bg-white/[0.06] transition cursor-pointer ${
                    activeRoute === 'get-started' ? 'text-white font-semibold' : ''
                  }`}
                >
                  Sign In
                </Link>
              )}

              <GetStartedButton />
            </>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-[10px] bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <CloseIcon size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 rounded-2xl border border-white/10 bg-[#080B11]/95 backdrop-blur-2xl px-4 py-5 space-y-3 animate-fade-in shadow-[0_20px_40px_rgba(0,0,0,0.85)]">
          <div className="grid grid-cols-2 gap-2 pb-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-[10px] text-xs font-medium flex items-center gap-2.5 transition ${
                activeRoute === 'home'
                  ? 'bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30 font-semibold'
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
                  : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <MessageCircle size={14} className="text-[#FF7A00]" />
              <span>Contact Us</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-white/10 space-y-2">
            <a
              href="https://wa.me/919876543210?text=Hi%20KUIRO%20Team%2C%20I%20would%20like%20to%20learn%20more"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 px-3 rounded-[10px] bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Smartphone size={14} />
                <span>WhatsApp Demo (+91 98765 43210)</span>
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
                  className="py-2.5 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-sora font-semibold transition text-center border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
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

