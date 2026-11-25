'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import KuiroLogo from '@/components/brand/KuiroLogo';
import KuiroLoader from '@/components/brand/KuiroLoader';
import { AuthPageShell } from '@/components/auth';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isInvited = searchParams.get('invited') === 'true';

  useEffect(() => {
    const prefilledEmail = searchParams.get('email');
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Login failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageShell
      activeRoute="login"
      eyebrow="Password Sign In"
      title="Welcome Back."
      subtitle="Sign in to access your Brand Brain, 48-hour approval queue, and inbox."
    >
      <div className="space-y-5 text-left">
        <div className="text-center space-y-2">
          <div className="inline-flex justify-center">
            <KuiroLogo variant="primary" theme="light" symbolSize={30} showTagline={false} />
          </div>
          <h2 className="font-sora text-xl font-extrabold text-[#0B0F14] pt-1">
            Sign in with password
          </h2>
          <p className="text-xs text-gray-500 font-inter">
            Or{' '}
            <Link href="/get-started?mode=signin" className="text-[#FF7A00] font-semibold hover:underline">
              sign in faster with Phone OTP / Google
            </Link>
          </p>
        </div>

        {isInvited && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>Your workspace invitation is ready. Sign in below to enter your team dashboard.</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-inter">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-[#374151] mb-1.5"
            >
              Work / Business Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                id="login-email"
                type="email"
                required
                placeholder="name@business.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7DED3] rounded-xl pl-10 pr-3.5 py-3 text-sm text-[#0B0F14] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#FF7A00] transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-[#374151]"
              >
                Password
              </label>
              <Link
                href="/get-started?mode=signin"
                className="text-[11px] font-medium text-gray-500 hover:text-[#FF7A00] transition"
              >
                Use OTP instead?
              </Link>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                id="login-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7DED3] rounded-xl pl-10 pr-3.5 py-3 text-sm text-[#0B0F14] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#FF7A00] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer w-full py-3.5 rounded-2xl bg-[#FF7A00] hover:bg-[#E06C00] text-white text-xs sm:text-sm font-sora font-bold transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Verifying...</span>
            ) : (
              <>
                <span>Sign In &amp; Open Dashboard</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-gray-100 text-center text-xs text-gray-500">
          <span>Don&apos;t have an account yet? </span>
          <Link href="/signup" className="text-[#FF7A00] font-semibold hover:underline">
            Sign Up for Free Trial →
          </Link>
        </div>
      </div>
    </AuthPageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<KuiroLoader variant="fullscreen" theme="light" />}>
      <LoginFormContent />
    </Suspense>
  );
}
