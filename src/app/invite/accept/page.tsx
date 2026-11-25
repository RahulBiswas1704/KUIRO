'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import KuiroLogo from '@/components/brand/KuiroLogo';
import { Navbar, Footer, AnnouncementBar } from '@/components/layout';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Loader2,
} from 'lucide-react';

interface InviteDetails {
  email: string;
  name: string;
  workspaceName: string;
  role: string;
  hasPassword: boolean;
}

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [isValidating, setIsValidating] = useState(true);
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!token) {
      setValidationError('No invitation token was found in this URL.');
      setIsValidating(false);
      return;
    }

    fetch(`/api/workspace/team/accept?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setInviteDetails({
            email: data.email,
            name: data.name || '',
            workspaceName: data.workspaceName,
            role: data.role,
            hasPassword: Boolean(data.hasPassword),
          });
          setFullName(data.name || '');
        } else {
          setValidationError(data.error || 'This invitation link is invalid or has expired.');
        }
      })
      .catch(() => {
        setValidationError('Unable to verify your invitation right now. Please try again.');
      })
      .finally(() => setIsValidating(false));
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (inviteDetails && !inviteDetails.hasPassword) {
      if (password.length < 8) {
        setSubmitError('Password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setSubmitError('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/workspace/team/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: fullName.trim() || undefined,
          password: password || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAccepted(true);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        setSubmitError(data.error || 'Failed to accept invitation.');
        setIsSubmitting(false);
      }
    } catch {
      setSubmitError('Network error while activating your account.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md rounded-[18px] bg-[#0B0F14] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block">
          <KuiroLogo variant="primary" theme="dark" symbolSize={36} showTagline={false} />
        </Link>
        <h1 className="text-2xl font-sora font-bold text-white mt-2">
          Accept Workspace Invitation
        </h1>
        <p className="text-xs text-slate-400 font-inter">
          Join your team&apos;s autonomous KUIRO marketing command center.
        </p>
      </div>

      {isValidating ? (
        <div className="py-10 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
          <Loader2 size={24} className="animate-spin text-[#FF7A00]" />
          <span>Verifying cryptographic invitation signature...</span>
        </div>
      ) : validationError ? (
        <div className="space-y-4">
          <div className="p-4 rounded-[12px] bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-100">Invitation Unavailable</p>
              <p className="mt-1 text-rose-200/80">{validationError}</p>
            </div>
          </div>
          <Link
            href="/login"
            className="w-full py-2.5 rounded-[10px] bg-white/10 hover:bg-white/15 text-white text-xs font-sora font-semibold flex items-center justify-center transition"
          >
            Go to Workspace Sign In
          </Link>
        </div>
      ) : accepted ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <h2 className="font-sora text-base font-bold text-white">Membership Activated!</h2>
          <p className="text-xs text-slate-400">
            Redirecting you to <strong>{inviteDetails?.workspaceName}</strong>...
          </p>
        </div>
      ) : (
        inviteDetails && (
          <form onSubmit={handleAccept} className="space-y-4 font-inter text-xs">
            {/* Invitation Metadata Summary Card */}
            <div className="p-3.5 rounded-[12px] bg-[#111620] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Building2 size={13} className="text-[#FF7A00]" />
                  <span>Workspace</span>
                </span>
                <span className="font-semibold text-white">{inviteDetails.workspaceName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Assigned Role</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30 text-[10px] font-bold font-mono">
                  {inviteDetails.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Invited Email</span>
                <span className="font-mono text-slate-200">{inviteDetails.email}</span>
              </div>
            </div>

            {submitError && (
              <div className="p-3 rounded-[10px] bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
                {submitError}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-[#11141A] border border-white/10 rounded-[10px] pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7A00] transition"
                />
              </div>
            </div>

            {!inviteDetails.hasPassword && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Create Account Password (min. 8 chars)
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#11141A] border border-white/10 rounded-[10px] pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7A00] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#11141A] border border-white/10 rounded-[10px] pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7A00] transition"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition-all duration-150 shadow-lg shadow-[#FF7A00]/25 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Activating Access...</span>
                </>
              ) : (
                <>
                  <span>Accept Invitation &amp; Enter Workspace</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )
      )}
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white">
      <AnnouncementBar subtitle="— You have been invited to collaborate on a KUIRO Workspace." />
      <Navbar activeRoute="none" badgeText="Team Invite" />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />
        <Suspense
          fallback={
            <div className="relative z-10 w-full max-w-md rounded-[18px] bg-[#0B0F14] border border-white/15 p-8 text-center text-xs text-slate-400">
              Loading invitation...
            </div>
          }
        >
          <AcceptInviteContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
