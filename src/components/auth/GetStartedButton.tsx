'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight } from 'lucide-react';

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
  const { user, isLoggedIn } = useAuth();

  // 1. Logged-in State: clean CTA taking them directly to their dashboard
  if (isLoggedIn) {
    return (
      <Link
        href="/dashboard"
        className={`px-4 py-2 rounded-full bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition-all duration-150 shadow-[0_0_20px_rgba(255,122,0,0.3)] hover:shadow-[0_0_25px_rgba(255,122,0,0.5)] active:scale-95 flex items-center gap-1.5 group cursor-pointer ${className}`}
        title={`Logged in as ${user?.name || 'Member'}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Dashboard</span>
        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition" />
      </Link>
    );
  }

  // 2. Not Logged In State: Direct frictionless link to /get-started
  return (
    <Link
      href="/get-started"
      className={`px-4 sm:px-5 py-2 rounded-full bg-white text-black hover:bg-slate-100 font-sora font-semibold text-xs transition-all duration-150 shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 group cursor-pointer ${className}`}
    >
      <span>{label}</span>
      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition" />
    </Link>
  );
}
