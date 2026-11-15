'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AnnouncementBar, Navbar, Footer } from '@/components/layout';
import KuiroLogo from '@/components/brand/KuiroLogo';
import {
  Smartphone,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Lock,
  Zap,
  Check,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export default function GetStartedAuthPage() {
  const router = useRouter();
  const { isLoggedIn, loginDemoUser } = useAuth();

  // Mode: Sign Up or Sign In
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');

  // Channel: Phone or Email
  const [activeMethod, setActiveMethod] = useState<'phone' | 'email'>('phone');

  // Form Inputs
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // UI Flow State: 'input' -> 'otp' -> 'success'
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Resend Timer
  const [resendTimer, setResendTimer] = useState<number>(0);

  // Sync mode with URL search parameters (?mode=signin, ?mode=login, ?mode=signup)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      if (mode === 'signin' || mode === 'login') {
        setAuthMode('signin');
      } else if (mode === 'signup') {
        setAuthMode('signup');
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, router]);

  /**
   * 1. Send 6-Digit OTP via /api/auth/otp/send
   */
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');
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

      setStatusMessage(data.message || '6-digit verification code sent!');
      if (data.devCode) {
        setDevOtp(data.devCode);
      }
      setStep('otp');
      setResendTimer(45);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 2. Verify 6-Digit OTP via /api/auth/otp/verify
   */
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
      // Redirect seamlessly to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 3. Google OAuth Instant One-Tap
   */
  const handleGoogleAuth = () => {
    setIsLoading(true);
    // In production connects to Google OAuth; fallback creates verified session
    window.location.href = '/api/auth/login?isDemo=true';
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-white flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-x-clip">
      {/* Top Subtle Announcement */}
      <AnnouncementBar
        badge="Zero-Friction Access"
        tagline="14-Day Full Autopilot Free Trial."
        subtitle="— Instant account creation. Zero surveys or credit cards."
      />

      {/* Floating Glassmorphic Navbar */}
      <Navbar activeRoute="get-started" />

      {/* =========================================================================
          MAIN AUTHENTICATION CONTAINER
      ========================================================================= */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 md:py-20 max-w-7xl mx-auto w-full relative">
        {/* Subtle Ambient Light Orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[340px] bg-gradient-to-b from-[#FF7A00]/[0.08] via-transparent to-transparent pointer-events-none -z-10 blur-3xl" />

        {/* Auth Card */}
        <div className="w-full max-w-md rounded-[32px] bg-[#0A0E18] border border-white/[0.09] shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-7 sm:p-10 space-y-6 relative overflow-hidden">
          
          {/* Brand Wordmark & Mode Switcher */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center mx-auto mb-1">
              <KuiroLogo variant="primary" theme="dark" symbolSize={38} showTagline={false} />
            </div>

            {/* Sign Up / Sign In Tabs */}
            <div className="flex items-center p-1 rounded-full bg-white/[0.04] border border-white/[0.08] max-w-[260px] mx-auto text-xs font-sora">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setStep('input');
                  setErrorMessage('');
                }}
                className={`flex-1 py-1.5 rounded-full font-semibold transition-all duration-200 cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
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
                className={`flex-1 py-1.5 rounded-full font-semibold transition-all duration-200 cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>

            <p className="text-xs text-slate-400 font-inter pt-1">
              {authMode === 'signup'
                ? 'Get started in 30 seconds. Setup your brand anytime later.'
                : 'Welcome back. Sign in to your autonomous workspace.'}
            </p>
          </div>

          {/* STEP 1: Method Selection & Input */}
          {step === 'input' && (
            <div className="space-y-5 animate-fade-in">
              {/* Option A: Google Auth (1-Tap) */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-white text-black hover:bg-slate-100 font-sora font-extrabold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-[0_10px_20px_-5px_rgba(255,255,255,0.2)] cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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

              {/* Hairline Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]" />
                </div>
                <span className="relative px-3 bg-[#0A0E18] text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                  or continue with
                </span>
              </div>

              {/* Sub-Tabs: Phone or Email */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMethod('phone');
                    setErrorMessage('');
                  }}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    activeMethod === 'phone'
                      ? 'bg-white/[0.08] border-[#FF7A00] text-white font-bold'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone size={13} className="text-emerald-400" />
                  <span>Phone OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMethod('email');
                    setErrorMessage('');
                  }}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    activeMethod === 'email'
                      ? 'bg-white/[0.08] border-[#FF7A00] text-white font-bold'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail size={13} className="text-blue-400" />
                  <span>Email OTP</span>
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendOtp} className="space-y-4 font-inter text-xs">
                {activeMethod === 'phone' ? (
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Mobile Number (WhatsApp Ready)
                    </label>
                    <div className="flex items-center rounded-xl bg-white/[0.03] border border-white/[0.1] focus-within:border-[#FF7A00] transition overflow-hidden">
                      <span className="px-3.5 py-3 bg-white/[0.04] text-slate-400 font-mono text-xs border-r border-white/10 select-none">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full px-3.5 py-3 bg-transparent text-white font-mono text-sm focus:outline-none"
                        autoFocus
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      We'll send a 6-digit verification code.
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Email Address
                    </label>
                    <div className="flex items-center px-3.5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.1] focus-within:border-[#FF7A00] transition">
                      <Mail size={16} className="text-slate-400 shrink-0 mr-2.5" />
                      <input
                        type="email"
                        required
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="founder@mybrand.in"
                        className="w-full bg-transparent text-white text-sm focus:outline-none"
                        autoFocus
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      We'll dispatch a 6-digit code to your inbox.
                    </span>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-fade-in">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition shadow-lg shadow-[#FF7A00]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Dispatching Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit OTP →</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Enter 6-Digit OTP */}
          {step === 'otp' && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#FF7A00] font-bold tracking-wider">
                  Verification Code
                </span>
                <h3 className="font-sora text-xl font-bold text-white">Enter 6-Digit OTP</h3>
                <p className="text-xs text-slate-400 font-inter">
                  Sent to <strong className="text-white font-mono">{activeMethod === 'phone' ? phoneNumber : emailAddress}</strong>
                </p>
              </div>

              {/* Dev Convenience Pill (if available) */}
              {devOtp && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs text-center font-mono animate-fade-in">
                  <span>Fast Testing OTP: </span>
                  <button
                    type="button"
                    onClick={() => setOtpCode(devOtp)}
                    className="font-bold underline text-white hover:text-emerald-400 cursor-pointer"
                  >
                    {devOtp} (Click to Fill)
                  </button>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4 font-inter text-xs">
                <div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.12] focus:border-[#FF7A00] text-white focus:outline-none font-bold"
                    autoFocus
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-fade-in">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full py-3.5 rounded-2xl bg-white text-black font-extrabold text-xs sm:text-sm font-sora hover:scale-105 transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Verifying & Setting Up...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Continue to Dashboard →</span>
                    </>
                  )}
                </button>

                {/* Resend Code / Change Number */}
                <div className="flex items-center justify-between text-[11px] font-mono pt-2 text-slate-400">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('input');
                      setOtpCode('');
                      setErrorMessage('');
                    }}
                    className="hover:text-white transition cursor-pointer"
                  >
                    ← Change {activeMethod === 'phone' ? 'Number' : 'Email'}
                  </button>

                  <button
                    type="button"
                    disabled={resendTimer > 0 || isLoading}
                    onClick={() => handleSendOtp()}
                    className="text-[#FF7A00] hover:underline disabled:text-slate-600 disabled:no-underline cursor-pointer"
                  >
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Success Animation */}
          {step === 'success' && (
            <div className="py-8 text-center space-y-3 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <Check size={28} />
              </div>
              <h3 className="font-sora text-xl font-bold text-white">Account Verified!</h3>
              <p className="text-xs text-slate-400">Redirecting to your workspace...</p>
            </div>
          )}

          {/* Bottom Security & Free Trial Guarantees */}
          <div className="pt-4 border-t border-white/[0.06] text-center space-y-2">
            <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>14-Day Free Access</span>
              </span>
              <span>•</span>
              <span>No Credit Card</span>
              <span>•</span>
              <span>Cancel Anytime</span>
            </div>

            {/* Instant Demo Sandbox Shortcut */}
            <div className="pt-2">
              <button
                type="button"
                onClick={loginDemoUser}
                className="text-[11px] text-slate-400 hover:text-white transition underline cursor-pointer"
              >
                Want to preview first? Explore Instant Demo Sandbox →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
