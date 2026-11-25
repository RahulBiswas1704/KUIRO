'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Check, Mail, RefreshCw, Smartphone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import KuiroLogo from '@/components/brand/KuiroLogo';
import KuiroLoader from '@/components/brand/KuiroLoader';
import { AuthPageShell } from '@/components/auth';

function GetStartedAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuth();

  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [activeMethod, setActiveMethod] = useState<'phone' | 'email'>('phone');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(0);

  // Keep tab synced dynamically with ?mode=signin / ?mode=login / ?mode=signup
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signin' || mode === 'login') {
      setAuthMode('signin');
    } else if (mode === 'signup') {
      setAuthMode('signup');
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, router]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setDevOtp(null);

    const identifier = activeMethod === 'phone' ? phoneNumber.trim() : emailAddress.trim();
    if (!identifier) {
      setErrorMessage(
        activeMethod === 'phone'
          ? 'Please enter your mobile phone number.'
          : 'Please enter your email address.'
      );
      return;
    }

    if (activeMethod === 'phone') {
      const cleanDigits = identifier.replace(/[^0-9]/g, '');
      if (cleanDigits.length < 10) {
        setErrorMessage('Please enter a valid 10-digit mobile number.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: activeMethod === 'phone' ? identifier : undefined,
          email: activeMethod === 'email' ? identifier : undefined,
          type: 'MAGIC_LINK',
          isSignup: authMode === 'signup',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch verification code.');
      }

      if (data.devCode) {
        setDevOtp(data.devCode);
      }
      setStep('otp');
      setResendTimer(45);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    const identifier = activeMethod === 'phone' ? phoneNumber.trim() : emailAddress.trim();

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: activeMethod === 'phone' ? identifier : undefined,
          email: activeMethod === 'email' ? identifier : undefined,
          otp: otpCode.trim(),
          type: 'MAGIC_LINK',
          isSignup: authMode === 'signup',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid or expired verification code.');
      }

      setStep('success');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 800);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Verification failed. Please check the code.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    window.location.href = '/api/auth/oauth/google/authorize';
  };

  return (
    <AuthPageShell
      activeRoute="get-started"
      eyebrow={
        authMode === 'signup'
          ? '14-Day Free Trial • Instant Access'
          : 'Welcome Back • Quick OTP or Google Sign In'
      }
      title={authMode === 'signup' ? 'Start Your Autopilot.' : 'Sign In to KUIRO.'}
      subtitle={
        authMode === 'signup'
          ? 'Create your workspace in 30 seconds with WhatsApp OTP or Google—set up your brand anytime.'
          : 'Access your Brand Brain, 48-hour WhatsApp review queue, and unified inbox.'
      }
    >
      <div className="space-y-6 text-left">
        {/* Card Brand Lockup & Segmented Switcher */}
        <div className="text-center space-y-4">
          <div className="inline-flex justify-center">
            <KuiroLogo variant="primary" theme="light" symbolSize={30} showTagline={false} />
          </div>

          <div className="flex items-center p-1 rounded-full bg-[#FAF8F5] border border-[#EAE1D5] max-w-[270px] mx-auto text-xs font-sora">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setStep('input');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 rounded-full font-semibold transition cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-[#0B0F14] text-white shadow-xs'
                  : 'text-gray-600 hover:text-[#0B0F14]'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setStep('input');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 rounded-full font-semibold transition cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-[#0B0F14] text-white shadow-xs'
                  : 'text-gray-600 hover:text-[#0B0F14]'
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* STEP 1: Input & Provider Selection */}
        {step === 'input' && (
          <div className="space-y-5">
            {/* Google One-Tap */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="cursor-pointer w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-[#FAF9F6] text-[#0B0F14] border border-gray-200 font-sora font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition shadow-[0_6px_18px_-10px_rgba(11,15,20,0.18)]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <span className="relative px-3 bg-white text-[11px] font-medium uppercase tracking-wider text-gray-400">
                or use a one-time code
              </span>
            </div>

            {/* Channel Tabs: Phone OTP vs Email OTP */}
            <div className="grid grid-cols-2 gap-2.5 text-xs font-sora">
              <button
                type="button"
                onClick={() => {
                  setActiveMethod('phone');
                  setErrorMessage('');
                }}
                className={`cursor-pointer py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                  activeMethod === 'phone'
                    ? 'bg-[#FFF8F1] border-[#FF7A00] text-[#0B0F14] font-bold'
                    : 'bg-[#FAF8F5] border-[#EAE1D5] text-gray-600 hover:text-[#0B0F14]'
                }`}
              >
                <Smartphone size={14} className="text-emerald-600" />
                <span>Phone OTP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMethod('email');
                  setErrorMessage('');
                }}
                className={`cursor-pointer py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                  activeMethod === 'email'
                    ? 'bg-[#FFF8F1] border-[#FF7A00] text-[#0B0F14] font-bold'
                    : 'bg-[#FAF8F5] border-[#EAE1D5] text-gray-600 hover:text-[#0B0F14]'
                }`}
              >
                <Mail size={14} className="text-[#FF7A00]" />
                <span>Email OTP</span>
              </button>
            </div>

            {/* OTP Input Form */}
            <form onSubmit={handleSendOtp} className="space-y-4 font-inter">
              {activeMethod === 'phone' ? (
                <div>
                  <label
                    htmlFor="otp-phone-input"
                    className="block text-xs font-semibold text-[#374151] mb-1.5"
                  >
                    Mobile Number (WhatsApp Ready)
                  </label>
                  <div className="flex items-center rounded-xl bg-[#FAF8F5] border border-[#E7DED3] focus-within:bg-white focus-within:border-[#FF7A00] transition overflow-hidden">
                    <span className="px-3.5 py-3 bg-[#F3ECE3] text-[#374151] font-mono text-xs font-semibold border-r border-[#E7DED3] select-none">
                      🇮🇳 +91
                    </span>
                    <input
                      id="otp-phone-input"
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full px-3.5 py-3 bg-transparent text-[#0B0F14] placeholder:text-gray-400 font-mono text-sm focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1.5 block">
                    We’ll send a 6-digit verification code.
                  </span>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="otp-email-input"
                    className="block text-xs font-semibold text-[#374151] mb-1.5"
                  >
                    Work or Personal Email
                  </label>
                  <div className="flex items-center px-3.5 py-3 rounded-xl bg-[#FAF8F5] border border-[#E7DED3] focus-within:bg-white focus-within:border-[#FF7A00] transition">
                    <Mail size={16} className="text-gray-400 shrink-0 mr-2.5" />
                    <input
                      id="otp-email-input"
                      type="email"
                      required
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="founder@mybrand.in"
                      className="w-full bg-transparent text-[#0B0F14] placeholder:text-gray-400 text-sm focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1.5 block">
                    We’ll dispatch a 6-digit login code to your inbox.
                  </span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer w-full py-3.5 rounded-2xl bg-[#FF7A00] hover:bg-[#E06C00] text-white text-xs sm:text-sm font-sora font-bold transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Sending Verification Code...</span>
                  </>
                ) : (
                  <span>Send 6-Digit Code →</span>
                )}
              </button>
            </form>

            {/* Password Account Cross-Link */}
            <div className="pt-3 border-t border-gray-100 text-center text-xs text-gray-500">
              <span>Prefer email &amp; password? </span>
              <Link
                href={authMode === 'signin' ? '/login' : '/signup'}
                className="text-[#FF7A00] font-semibold hover:underline"
              >
                {authMode === 'signin' ? 'Sign in with password →' : 'Create password account →'}
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: 6-Digit Code Entry */}
        {step === 'otp' && (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#FF7A00]">
                Verification Code
              </span>
              <h2 className="font-sora text-xl font-extrabold text-[#0B0F14]">Enter 6-Digit Code</h2>
              <p className="text-xs text-gray-500 font-inter">
                Sent to{' '}
                <strong className="text-[#0B0F14] font-mono">
                  {activeMethod === 'phone' ? phoneNumber : emailAddress}
                </strong>
              </p>
            </div>

            {devOtp && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-mono">
                <span>Testing Code: </span>
                <button
                  type="button"
                  onClick={() => setOtpCode(devOtp)}
                  className="font-bold underline hover:text-emerald-950 cursor-pointer"
                >
                  {devOtp} (Click to Fill)
                </button>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4 font-inter">
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[0.55em] text-2xl font-mono py-3.5 px-4 rounded-xl bg-[#FAF8F5] border border-[#E7DED3] focus:bg-white focus:border-[#FF7A00] text-[#0B0F14] focus:outline-none font-bold"
                autoFocus
              />

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="cursor-pointer w-full py-3.5 rounded-2xl bg-[#0B0F14] hover:bg-[#1F2937] text-white font-sora font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify &amp; Open Workspace →</span>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1 text-gray-500">
                <button
                  type="button"
                  onClick={() => {
                    setStep('input');
                    setOtpCode('');
                    setErrorMessage('');
                  }}
                  className="hover:text-[#0B0F14] transition cursor-pointer font-medium"
                >
                  ← Change {activeMethod === 'phone' ? 'Number' : 'Email'}
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || isLoading}
                  onClick={() => handleSendOtp()}
                  className="text-[#FF7A00] font-semibold hover:underline disabled:text-gray-400 disabled:no-underline cursor-pointer"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Verified State */}
        {step === 'success' && (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <Check size={28} />
            </div>
            <h2 className="font-sora text-xl font-extrabold text-[#0B0F14]">Account Verified!</h2>
            <p className="text-xs text-gray-500">Redirecting to your workspace...</p>
          </div>
        )}
      </div>
    </AuthPageShell>
  );
}

export default function GetStartedAuthPage() {
  return (
    <Suspense fallback={<KuiroLoader variant="fullscreen" theme="light" />}>
      <GetStartedAuthContent />
    </Suspense>
  );
}
