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
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already logged in, immediately redirect to dashboard
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Login failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white">
      <AnnouncementBar subtitle="— Sign in to access your autonomous marketing dashboard." />
      <Navbar activeRoute="none" badgeText="Sign In" />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md rounded-[18px] bg-[#0B0F14] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-block">
              <KuiroLogo variant="primary" theme="dark" symbolSize={36} showTagline={false} />
            </Link>
            <h1 className="text-2xl font-sora font-bold text-white mt-2">
              Sign In to Your Workspace
            </h1>
            <p className="text-xs text-slate-400 font-inter">
              Access your Brand Brain, 48-hour approval queue & calendar.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-[10px] bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-inter text-xs">
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-medium text-slate-300">
                  Password
                </label>
                <span className="text-[10px] text-slate-400 hover:text-[#FF7A00] cursor-pointer">
                  Forgot?
                </span>
              </div>
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition-all duration-150 shadow-lg shadow-[#FF7A00]/25 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Sign In & Open Dashboard</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-white/10 text-center text-xs text-slate-400">
            <span>Don&apos;t have an account yet? </span>
            <Link href="/signup" className="text-[#FF7A00] font-semibold hover:underline">
              Sign Up for Free Trial →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

