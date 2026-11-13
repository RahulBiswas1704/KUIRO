'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowRight,
  ChevronDown,
  UserPlus,
  LogIn,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface GetStartedButtonProps {
  className?: string;
  variant?: 'navbar' | 'hero' | 'compact';
  label?: string;
}

export default function GetStartedButton({
  className = '',
  variant = 'navbar',
  label = 'Get Started'
}: GetStartedButtonProps) {
  const router = useRouter();
  const { user, isLoggedIn, openAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. If user is already logged in, clicking Get Started always redirects to dashboard!
  const handleClickMain = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      setDropdownOpen(!dropdownOpen);
    }
  };

  const handleSelectOption = (mode: 'signup' | 'login') => {
    setDropdownOpen(false);
    openAuthModal(mode);
  };

  // Logged-in State: clean CTA taking them directly to their dashboard
  if (isLoggedIn) {
    return (
      <button
        onClick={() => router.push('/dashboard')}
        className={`px-4 py-2 rounded-[10px] bg-gradient-to-r from-[#FF7A00] to-[#FF881A] text-white text-xs font-sora font-semibold transition-all duration-150 shadow-[0_0_20px_rgba(255,122,0,0.3)] hover:shadow-[0_0_25px_rgba(255,122,0,0.5)] active:scale-95 flex items-center gap-2 group ${className}`}
        title={`Logged in as ${user?.name}`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Dashboard</span>
        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition" />
      </button>
    );
  }

  // Not Logged In State: Button with dropdown options (Sign Up & Sign In)
  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={handleClickMain}
        className={`px-4 sm:px-5 py-2 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition-all duration-150 shadow-[0_0_20px_rgba(255,122,0,0.3)] hover:shadow-[0_0_25px_rgba(255,122,0,0.5)] active:scale-95 flex items-center gap-1.5 ${className}`}
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
      >
        <span>{label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 text-white/90 ${dropdownOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Two-Choice Dropdown Popover */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-32px)] rounded-[14px] bg-[#0B0F14] border border-white/15 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-fade-in space-y-1">
          {/* Option 1: Sign Up (New Account -> Onboarding Setup) */}
          <button
            onClick={() => handleSelectOption('signup')}
            className="w-full p-3 rounded-[10px] text-left transition-all hover:bg-white/[0.06] border border-transparent hover:border-[#FF7A00]/30 group flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FF7A00]/15 text-[#FF7A00] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition">
              <UserPlus size={16} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-sora font-bold text-white group-hover:text-[#FF7A00] transition">
                  Create Account (Sign Up)
                </p>
                <span className="text-[9px] font-mono text-[#FF7A00] bg-[#FF7A00]/10 px-1.5 py-0.5 rounded">
                  14D Free
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-inter mt-0.5 leading-snug">
                New to KUIRO? Set up your Brand Brain, WhatsApp loop & 365 calendar.
              </p>
            </div>
          </button>

          {/* Option 2: Sign In (Existing Member -> Straight to Dashboard) */}
          <button
            onClick={() => handleSelectOption('login')}
            className="w-full p-3 rounded-[10px] text-left transition-all hover:bg-white/[0.06] border border-transparent hover:border-emerald-500/30 group flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition">
              <LogIn size={16} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-sora font-bold text-white group-hover:text-emerald-400 transition">
                  Sign In (Existing Member)
                </p>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                  Dashboard
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-inter mt-0.5 leading-snug">
                Already have an account? Jump directly to your active workspace.
              </p>
            </div>
          </button>

          {/* Subtle footer tip */}
          <div className="pt-2 px-2 pb-1 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-inter">
            <span>Instant Demo Login available</span>
            <span className="text-emerald-400">100% Encrypted</span>
          </div>
        </div>
      )}
    </div>
  );
}
