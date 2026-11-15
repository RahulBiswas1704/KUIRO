'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import KuiroLogo from '@/components/brand/KuiroLogo';
import {
  ShieldAlert,
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || '/admin';

  const [email, setEmail] = useState('hello.kuiro@gmail.com');
  const [passkey, setPasskey] = useState('Kuiro.2026@#');
  const [showPasskey, setShowPasskey] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check if already authenticated
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
        // ignore
      }
    }
    checkAuth();
  }, [router, redirectPath]);

  const handleFillCredentials = () => {
    setEmail('hello.kuiro@gmail.com');
    setPasskey('Kuiro.2026@#');
    setErrorMessage('');
  };

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
          mfaCode: mfaCode.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.mfaRequired) {
          setShowMfa(true);
          setErrorMessage('MFA required. Enter your 6-digit TOTP code.');
        } else {
          setErrorMessage(data.error || 'Access Denied: Invalid operator clearance.');
        }
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Clearance Level 5 Granted. Initializing Operator Terminal...');

      setTimeout(() => {
        window.location.href = redirectPath;
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error reaching operator authentication service.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-gradient-to-b from-[#FF7A00]/[0.08] via-transparent to-transparent pointer-events-none -z-10 blur-3xl" />
      <div className="absolute -bottom-10 right-1/4 w-80 h-80 bg-blue-600/[0.05] rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Main Terminal Gate Card */}
      <div className="w-full max-w-md rounded-[32px] bg-[#0A0E18] border border-white/[0.09] shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-7 sm:p-10 space-y-6 relative overflow-hidden">
        {/* Top Decorative Gradient Accent */}
        <div className="absolute top-0 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-[#FF7A00] to-transparent" />

        {/* Brand Lockup & Clearance Badge */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block hover:opacity-90 transition mx-auto mb-1">
            <KuiroLogo variant="primary" theme="dark" symbolSize={38} showTagline={false} />
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-[10px] font-mono font-bold tracking-wider uppercase">
            <ShieldAlert size={13} className="animate-pulse" />
            <span>Level 5 Restricted • Operator Gate</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-sora font-extrabold text-white tracking-tight pt-1">
            Operator Terminal Locked
          </h1>
          <p className="text-xs text-slate-400 font-inter">
            Internal Platform Management & Global Systems Control.
          </p>
        </div>

        {/* 1-Click Auto-Fill Convenience Pill */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 truncate">
            <Zap size={14} className="text-[#FF7A00] shrink-0" />
            <div className="truncate text-left leading-tight">
              <span className="text-[10px] text-slate-400 uppercase block">Admin Account</span>
              <span className="text-slate-200 text-[11px] font-bold">hello.kuiro@gmail.com</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillCredentials}
            className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[#FF7A00] text-[11px] font-bold transition shrink-0 cursor-pointer"
          >
            Fill Credentials
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-inter text-xs">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5 animate-fade-in">
              <AlertCircle size={15} className="shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Operator Email Input */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5 font-inter">
              Authorized Operator Email
            </label>
            <div className="flex items-center px-3.5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.1] focus-within:border-[#FF7A00] transition">
              <Mail size={16} className="text-slate-400 shrink-0 mr-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello.kuiro@gmail.com"
                className="w-full bg-transparent text-white font-mono text-xs sm:text-sm focus:outline-none"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Master Passkey Input */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5 font-inter">
              Master Operator Passkey
            </label>
            <div className="flex items-center px-3.5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.1] focus-within:border-[#FF7A00] transition">
              <Key size={16} className="text-slate-400 shrink-0 mr-2.5" />
              <input
                type={showPasskey ? 'text' : 'password'}
                required
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-transparent text-white font-mono text-xs sm:text-sm focus:outline-none"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPasskey(!showPasskey)}
                className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
                title={showPasskey ? 'Hide passkey' : 'Show passkey'}
              >
                {showPasskey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Optional MFA Code */}
          {showMfa && (
            <div className="p-3.5 rounded-xl bg-[#FF7A00]/10 border border-[#FF7A00]/30 space-y-2 animate-fade-in">
              <label className="block text-xs font-semibold text-[#FF7A00] font-inter flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>Operator 2FA / TOTP Code</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">RFC 6238</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[0.5em] text-lg font-mono py-2.5 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none"
                autoFocus
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition shadow-lg shadow-[#FF7A00]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 active:scale-95"
          >
            {isLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Verifying Operator Clearance...</span>
              </>
            ) : (
              <>
                <span>Authorize Operator Terminal</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Card Footer Guarantees */}
        <div className="pt-4 border-t border-white/[0.06] text-center space-y-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center justify-center gap-3">
            <span className="flex items-center gap-1">
              <Lock size={12} className="text-emerald-400" />
              <span>HMAC-SHA256 Token</span>
            </span>
            <span>•</span>
            <span>8-Hour Session</span>
          </div>

          <div className="pt-1">
            <Link href="/" className="text-slate-400 hover:text-white transition underline cursor-pointer">
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
