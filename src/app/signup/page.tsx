'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import KuiroLogo from '@/components/brand/KuiroLogo';
import { Navbar, Footer, AnnouncementBar } from '@/components/layout';
import {
  Mail,
  Lock,
  User as UserIcon,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { isLoggedIn, signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      setErrorMessage('Please provide your name and business email.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await signup(fullName, businessName || 'My Business', email, password);
      // signup automatically redirects to /get-started!
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white">
      <AnnouncementBar subtitle="— 14-day full autopilot free trial. No credit card required." />
      <Navbar activeRoute="none" badgeText="Sign Up" />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md rounded-[18px] bg-[#0B0F14] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-block">
              <KuiroLogo variant="primary" theme="dark" symbolSize={36} showTagline={false} />
            </Link>
            <h1 className="text-2xl font-sora font-bold text-white mt-2">
              Create Your KUIRO Account
            </h1>
            <p className="text-xs text-slate-400 font-inter">
              Get started with your 14-day free trial. Setup your Brand Brain in 60s.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-[10px] bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 font-inter text-xs">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <UserIcon size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#11141A] border border-white/10 rounded-[10px] pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7A00] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Clinic / Brand / Business Name
              </label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Apex Studio / Sharma Retail / Care Clinic"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-[#11141A] border border-white/10 rounded-[10px] pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7A00] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Work / Business Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@business.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#11141A] border border-white/10 rounded-[10px] pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7A00] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#11141A] border border-white/10 rounded-[10px] pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7A00] transition"
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center font-inter pt-1">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-slate-400 hover:text-white underline">
                Terms &amp; Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-slate-400 hover:text-white underline">
                Privacy Policy
              </Link>.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition-all duration-150 shadow-lg shadow-[#FF7A00]/25 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account & Start Brand Setup</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="p-3 rounded-[10px] bg-white/[0.03] border border-white/5 space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 size={13} />
              <span>Next: Set Up Your Brand Brain (Step 1 of 3)</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-snug">
              After signing up, KUIRO guides you through extracting your website, configuring WhatsApp approvals, and choosing channels.
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 text-center text-xs text-slate-400">
            <span>Already have an account? </span>
            <Link href="/login" className="text-[#FF7A00] font-semibold hover:underline">
              Sign In to Dashboard →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

