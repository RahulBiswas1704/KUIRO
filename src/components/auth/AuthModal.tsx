'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import KuiroLogo from '@/components/brand/KuiroLogo';
import {
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  Building2,
  CheckCircle2,
  Zap
} from 'lucide-react';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    signup,
    loginDemoUser,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (authModalMode === 'login') {
        if (!email) {
          setErrorMessage('Please enter your email address');
          setIsSubmitting(false);
          return;
        }
        await login(email, password);
      } else {
        if (!fullName || !email) {
          setErrorMessage('Please fill in your name and email address');
          setIsSubmitting(false);
          return;
        }
        await signup(fullName, businessName || 'My Business', email, password);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-[18px] bg-[#0B0F14] border border-white/15 p-6 sm:p-8 shadow-2xl z-10 space-y-6 text-white font-sans animate-scale-up">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Top Brand Lockup */}
        <div className="flex flex-col items-center text-center space-y-2">
          <KuiroLogo variant="primary" theme="dark" symbolSize={32} showTagline={false} />
          
          {authModalMode === 'signup' ? (
            <div>
              <h2 className="text-xl sm:text-2xl font-sora font-bold text-white mt-2">
                Start Your 14-Day Free Trial
              </h2>
              <p className="text-xs text-slate-400 font-inter mt-1">
                Zero credit card required. Set up your Brand Brain in 60 seconds.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl sm:text-2xl font-sora font-bold text-white mt-2">
                Welcome Back to KUIRO
              </h2>
              <p className="text-xs text-slate-400 font-inter mt-1">
                Sign in to access your autonomous marketing dashboard.
              </p>
            </div>
          )}
        </div>

        {/* Tab Switcher: Sign Up vs Sign In */}
        <div className="grid grid-cols-2 p-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold font-sora">
          <button
            type="button"
            onClick={() => {
              setErrorMessage('');
              openAuthModal('signup');
            }}
            className={`py-2 px-3 rounded-full transition-all text-center ${
              authModalMode === 'signup'
                ? 'bg-[#FF7A00] text-white shadow-md shadow-[#FF7A00]/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMessage('');
              openAuthModal('login');
            }}
            className={`py-2 px-3 rounded-full transition-all text-center ${
              authModalMode === 'login'
                ? 'bg-[#FF7A00] text-white shadow-md shadow-[#FF7A00]/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* 1-Click Fast Demo Sign In Pill (Highlighted for immediate test drive) */}
        {authModalMode === 'login' && (
          <button
            type="button"
            onClick={loginDemoUser}
            className="w-full p-3 rounded-[12px] bg-gradient-to-r from-emerald-950/60 to-[#121A15] border border-emerald-500/40 hover:border-emerald-500/80 text-left transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Zap size={15} />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                  1-Click Demo Login
                </p>
                <p className="text-[10px] text-emerald-400/80">
                  Dr. Sharma Dental Clinics (Pre-configured Workspace)
                </p>
              </div>
            </div>
            <ArrowRight size={14} className="text-emerald-400 group-hover:translate-x-1 transition" />
          </button>
        )}

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-3 rounded-[10px] bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 font-inter text-xs">
          {authModalMode === 'signup' && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <UserIcon size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#11141A] border border-white/10 rounded-[10px] pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7A00] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Clinic / Business Name
                </label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Apex Health & Dental"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-[#11141A] border border-white/10 rounded-[10px] pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7A00] transition"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Work / Business Email
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@company.in"
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
              {authModalMode === 'login' && (
                <span className="text-[10px] text-slate-400 hover:text-[#FF7A00] cursor-pointer">
                  Forgot?
                </span>
              )}
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
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
            className="w-full mt-2 py-3 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition-all duration-150 shadow-lg shadow-[#FF7A00]/25 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : authModalMode === 'signup' ? (
              <>
                <span>Create Account & Setup Brand Brain</span>
                <ArrowRight size={14} />
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer Guarantee */}
        <div className="pt-2 text-center text-[11px] text-slate-400 font-inter border-t border-white/10 flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Encrypted PostgreSQL Tenant Isolation • 14-Day Free Trial</span>
        </div>
      </div>
    </div>
  );
}
