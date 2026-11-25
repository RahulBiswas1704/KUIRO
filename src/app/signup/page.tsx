'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, CheckCircle2, Lock, Mail, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import KuiroLogo from '@/components/brand/KuiroLogo';
import { AuthPageShell } from '@/components/auth';

export default function SignUpPage() {
  const router = useRouter();
  const { isLoggedIn, signup } = useAuth();

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await signup(fullName, businessName || 'My Business', email, password);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed.');
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    'w-full bg-[#FAF8F5] border border-[#E7DED3] rounded-xl pl-10 pr-3.5 py-3 text-sm text-[#0B0F14] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#FF7A00] transition';

  return (
    <AuthPageShell
      activeRoute="signup"
      eyebrow="14-Day Full Autopilot Free Trial"
      title="Create Your Account."
      subtitle="Set up your Brand Brain in under a minute and connect your channels anytime."
    >
      <div className="space-y-5 text-left">
        <div className="text-center space-y-2">
          <div className="inline-flex justify-center">
            <KuiroLogo variant="primary" theme="light" symbolSize={30} showTagline={false} />
          </div>
          <h2 className="font-sora text-xl font-extrabold text-[#0B0F14] pt-1">
            Register with Email &amp; Password
          </h2>
          <p className="text-xs text-gray-500 font-inter">
            Or{' '}
            <Link href="/get-started" className="text-[#FF7A00] font-semibold hover:underline">
              continue faster with Phone OTP / Google
            </Link>
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 font-inter">
          <div>
            <label
              htmlFor="signup-name"
              className="block text-xs font-semibold text-[#374151] mb-1.5"
            >
              Your Full Name
            </label>
            <div className="relative">
              <UserIcon size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                id="signup-name"
                type="text"
                required
                placeholder="e.g. Rajesh Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-business"
              className="block text-xs font-semibold text-[#374151] mb-1.5"
            >
              Brand, Clinic, or Business Name
            </label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                id="signup-business"
                type="text"
                placeholder="e.g. Kolkata Chai Co. / Aura Derm"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-email"
              className="block text-xs font-semibold text-[#374151] mb-1.5"
            >
              Work / Business Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                id="signup-email"
                type="email"
                required
                placeholder="name@business.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-password"
              className="block text-xs font-semibold text-[#374151] mb-1.5"
            >
              Password (minimum 8 characters)
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                id="signup-password"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          <p className="text-[11px] text-gray-500 text-center pt-1">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-[#0B0F14] font-medium hover:underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[#0B0F14] font-medium hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer w-full py-3.5 rounded-2xl bg-[#FF7A00] hover:bg-[#E06C00] text-white text-xs sm:text-sm font-sora font-bold transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Create Account &amp; Start Setup</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] space-y-1 text-xs">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span>Next: Brand Brain Setup (Step 1 of 3)</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            KUIRO scans your website colors and connects WhatsApp 48h approvals right after signup.
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100 text-center text-xs text-gray-500">
          <span>Already have an account? </span>
          <Link href="/login" className="text-[#FF7A00] font-semibold hover:underline">
            Sign In to Dashboard →
          </Link>
        </div>
      </div>
    </AuthPageShell>
  );
}
