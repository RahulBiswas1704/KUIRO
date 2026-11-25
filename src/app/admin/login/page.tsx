'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Key,
  Lock,
  Mail,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import KuiroLogo from '@/components/brand/KuiroLogo';
import KuiroLoader from '@/components/brand/KuiroLoader';
import { Footer, Navbar } from '@/components/layout';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [passkey, setPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [useRecoveryMode, setUseRecoveryMode] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            router.push(redirectPath);
          }
        }
      } catch {
        // Ignore silent probe error
      }
    }
    checkAuth();
  }, [router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !passkey.trim()) {
      setErrorMessage('Operator email and master passkey are required.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          passkey: passkey.trim(),
          mfaCode: !useRecoveryMode && mfaCode.trim() ? mfaCode.trim() : undefined,
          recoveryCode: useRecoveryMode && recoveryCode.trim() ? recoveryCode.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.mfaRequired) {
          setShowMfa(true);
          setErrorMessage('MFA verification required. Enter your 6-digit TOTP or recovery code.');
        } else {
          setErrorMessage(data.error || 'Access Denied: Invalid operator clearance.');
        }
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Clearance Level 5 Granted. Initializing Operator Terminal...');
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 500);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Network error reaching operator authentication service.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFD] text-[#0B0F14] flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-x-clip">
      <Navbar
        activeRoute="none"
        theme="light"
        floating
        badgeText="Operator Gate"
        rightContent={
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-700 text-[11px] font-mono font-semibold">
              <ShieldAlert size={12} />
              <span>Level 5 Clearance</span>
            </span>
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-full bg-[#0B0F14]/90 hover:bg-[#0B0F14] text-white text-xs font-sora font-semibold transition border border-white/15"
            >
              Client Sign In
            </Link>
          </div>
        }
      />

      <main className="flex-1 flex flex-col">
        {/* Framed Dusk Horizon Stage */}
        <section className="relative bg-gradient-to-b from-[#667387] via-[#465163] to-[#232A38] rounded-b-[28px] sm:rounded-b-[44px] pt-28 sm:pt-32 pb-32 sm:pb-36 px-4 text-center overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-[#FF7A00]/25 blur-[110px]"
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs text-white/95 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-pulse" />
              <span>Level 5 Restricted • Operator Gate</span>
            </div>

            <h1 className="font-sora text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white leading-[1.08]">
              Operator Terminal
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF9D42] via-[#FF7A00] to-[#FFB36B]">
                Control Gate.
              </span>
            </h1>

            <p className="text-xs sm:text-base text-white/80 font-inter max-w-lg mx-auto leading-relaxed">
              Internal platform operations, multi-tenant health telemetry, and global autonomous safeguards.
            </p>
          </div>
        </section>

        {/* Overlapping Warm-Bordered Light Operator Card */}
        <section className="relative z-20 -mt-20 sm:-mt-24 px-4 sm:px-6 pb-16 sm:pb-20 w-full flex flex-col items-center">
          <div className="w-full max-w-[450px] p-px rounded-[28px] bg-gradient-to-b from-[#FF8E3C]/65 via-[#FF8E3C]/20 to-gray-200/80 shadow-[0_24px_60px_-24px_rgba(11,15,20,0.22)]">
            <div className="bg-white rounded-[27px] p-6 sm:p-8 space-y-5 text-left">
              <div className="text-center space-y-2">
                <div className="inline-flex justify-center">
                  <KuiroLogo variant="primary" theme="light" symbolSize={30} showTagline={false} />
                </div>
                <h2 className="font-sora text-xl font-extrabold text-[#0B0F14] pt-1">
                  Authorize Operator Session
                </h2>
                <p className="text-xs text-gray-500 font-inter">
                  Signed 8-hour HMAC session with constant-time verification.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 font-inter text-xs">
                <div>
                  <label
                    htmlFor="operator-email"
                    className="block text-xs font-semibold text-[#374151] mb-1.5"
                  >
                    Authorized Operator Email
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      id="operator-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@kuiro.in"
                      autoComplete="username"
                      className="w-full bg-[#FAF8F5] border border-[#E7DED3] rounded-xl pl-10 pr-3.5 py-3 text-sm font-mono text-[#0B0F14] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#FF7A00] transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="operator-passkey"
                    className="block text-xs font-semibold text-[#374151] mb-1.5"
                  >
                    Master Operator Passkey
                  </label>
                  <div className="relative">
                    <Key size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      id="operator-passkey"
                      type={showPasskey ? 'text' : 'password'}
                      required
                      value={passkey}
                      onChange={(e) => setPasskey(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="w-full bg-[#FAF8F5] border border-[#E7DED3] rounded-xl pl-10 pr-10 py-3 text-sm font-mono text-[#0B0F14] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#FF7A00] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasskey(!showPasskey)}
                      className="cursor-pointer absolute right-3 top-3 text-gray-400 hover:text-[#0B0F14] transition p-0.5"
                      title={showPasskey ? 'Hide passkey' : 'Show passkey'}
                      aria-label={showPasskey ? 'Hide passkey' : 'Show passkey'}
                    >
                      {showPasskey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {showMfa && (
                  <div className="p-4 rounded-2xl bg-[#FFF7EE] border border-[#FFD3AC] space-y-2.5 animate-fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-sora font-bold text-[#C85600] flex items-center gap-1.5">
                        <ShieldCheck size={14} />
                        <span>{useRecoveryMode ? 'Operator Recovery Code' : 'Operator 2FA / TOTP'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setUseRecoveryMode(!useRecoveryMode)}
                        className="cursor-pointer text-[11px] font-mono text-[#374151] hover:text-[#FF7A00] underline"
                      >
                        {useRecoveryMode ? 'Use TOTP code' : 'Use recovery token'}
                      </button>
                    </div>

                    {useRecoveryMode ? (
                      <input
                        type="text"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        placeholder="Emergency recovery token"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E7DED3] font-mono text-xs text-[#0B0F14] focus:outline-none focus:border-[#FF7A00]"
                        autoFocus
                      />
                    ) : (
                      <input
                        type="text"
                        maxLength={6}
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="• • • • • •"
                        className="w-full text-center tracking-[0.5em] text-lg font-mono py-2.5 rounded-xl bg-white border border-[#E7DED3] text-[#0B0F14] focus:outline-none focus:border-[#FF7A00]"
                        autoFocus
                      />
                    )}
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
                      <span>Verifying Operator Clearance...</span>
                    </>
                  ) : (
                    <>
                      <span>Authorize Operator Terminal</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-gray-100 text-center space-y-2 text-[11px] font-mono text-gray-500">
                <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
                  <span className="inline-flex items-center gap-1 text-[#374151] font-medium">
                    <Lock size={12} className="text-emerald-600" />
                    <span>HMAC-SHA256 Token</span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span>8-Hour Session</span>
                  <span className="text-gray-300">•</span>
                  <span>Rate-Limited</span>
                </div>

                <div>
                  <Link href="/" className="text-[#374151] hover:text-[#FF7A00] transition font-inter font-medium">
                    ← Return to Public Website
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer theme="light" />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<KuiroLoader variant="fullscreen" theme="light" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
