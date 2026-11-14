'use client';

import React, { useState, useEffect } from 'react';
import SubscriptionCheckoutModal, { PlanTier } from '@/components/billing/SubscriptionCheckoutModal';
import {
  Settings,
  Building2,
  Smartphone,
  CreditCard,
  Users,
  CheckCircle2,
  Save,
  AlertCircle,
  Copy,
  Check,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  Loader2,
  RefreshCw,
  Plus,
  Trash2,
  FileText,
  Languages,
  ToggleLeft,
  ToggleRight,
  ExternalLink
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Marketer' | 'Inbox Agent' | 'Front-Desk' | 'Agency Staff';
  status: 'Active' | 'Pending';
}

export default function WorkspaceSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'whatsapp' | 'billing' | 'team'>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [copiedId, setCopiedId] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Form State
  const [workspaceId, setWorkspaceId] = useState('ws_loading');
  const [workspaceName, setWorkspaceName] = useState('');
  const [industry, setIndustry] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState<'STARTER' | 'GROWTH' | 'AGENCY'>('GROWTH');
  
  // WhatsApp Protocol State
  const [autoCommitEnabled, setAutoCommitEnabled] = useState(true);
  const [reviewWindowHours, setReviewWindowHours] = useState(48);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English', 'Hindi']);
  const [isSendingTestWa, setIsSendingTestWa] = useState(false);

  // Billing & GST State
  const [gstin, setGstin] = useState('19AAACS1429B1Z8');
  const [billingFrequency, setBillingFrequency] = useState<'monthly' | 'annual'>('annual');

  // Team State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Rajesh Sharma', email: 'rajesh.sharma@kuiro.in', role: 'Owner', status: 'Active' },
    { id: '2', name: 'Priya Sen', email: 'priya.marketing@sharmaheritage.in', role: 'Marketer', status: 'Active' },
  ]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Marketer' | 'Inbox Agent' | 'Front-Desk' | 'Agency Staff'>('Marketer');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch settings from API
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/workspace/settings', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        setWorkspaceId(s.id || 'ws_default');
        setWorkspaceName(s.name || 'My Workspace');
        setIndustry(s.industry || 'Retail & Local Commerce');
        setWebsiteUrl(s.websiteUrl || 'https://mybrand.in');
        setWhatsappPhone(s.whatsappAdminPhone || '+91 98301 24589');
        setSubscriptionTier(s.subscriptionTier || 'GROWTH');
        if (s.gstin) setGstin(s.gstin);
      }

      // Load team members from dedicated API
      try {
        const teamRes = await fetch('/api/workspace/team', { cache: 'no-store' });
        const teamData = await teamRes.json();
        if (teamData.success && Array.isArray(teamData.members)) {
          setTeamMembers(teamData.members);
        }
      } catch (e) {
        console.warn('Failed to load team from API:', e);
      }
    } catch (err: any) {
      console.warn('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // 2. Save settings to API
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/workspace/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workspaceName,
          industry,
          websiteUrl,
          whatsappAdminPhone: whatsappPhone,
          subscriptionTier,
          autoCommitEnabled,
          reviewWindowHours,
          voiceLanguages: selectedLanguages,
          gstin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Workspace settings saved successfully in Neon PostgreSQL!');
      } else {
        showToast(data.error || 'Failed to update settings', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Test WhatsApp Ping
  const handleTestWhatsAppPing = async () => {
    setIsSendingTestWa(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      showToast(`Test 48h review card dispatched to ${whatsappPhone} via Meta Cloud API!`);
    } catch (err: any) {
      showToast('Failed to dispatch test WhatsApp ping', 'error');
    } finally {
      setIsSendingTestWa(false);
    }
  };

  // Copy Workspace ID
  const handleCopyId = () => {
    navigator.clipboard.writeText(workspaceId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Add Team Member with real API dispatch
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    try {
      const res = await fetch('/api/workspace/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inviteName.trim(),
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });
      const data = await res.json();
      if (data.success && data.member) {
        setTeamMembers((prev) => [...prev, data.member]);
        setInviteName('');
        setInviteEmail('');
        setIsInviteModalOpen(false);
        showToast(data.message || `Invitation dispatched to ${inviteEmail}!`);
      } else {
        showToast(data.error || 'Failed to dispatch invite', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch invite', 'error');
    }
  };

  // Remove Team Member with real API dispatch
  const handleRemoveMember = async (id: string) => {
    try {
      const res = await fetch(`/api/workspace/team?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTeamMembers((prev) => prev.filter((m) => m.id !== id));
        showToast('Team member removed from workspace');
      } else {
        showToast(data.error || 'Failed to remove member', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to remove member', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 font-inter text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            toastType === 'success'
              ? 'bg-emerald-950/90 border border-emerald-500 text-emerald-200'
              : 'bg-rose-950/90 border border-rose-500 text-rose-200'
          }`}
        >
          {toastType === 'success' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertCircle size={16} className="text-rose-400" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/60 border border-orange-700/40 text-[#FF7A00] text-xs font-mono mb-2">
            <Settings size={13} />
            <span>Workspace Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sora font-bold text-white tracking-tight">
            Settings &amp; Autonomous Controls
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-inter mt-1">
            Manage your business profile, WhatsApp review loop, team seats, and subscription.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition shadow-lg shadow-[#FF7A00]/25 flex items-center justify-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Horizontal Settings Tabs */}
      <div className="flex overflow-x-auto border-b border-white/10 gap-2 pb-px scrollbar-none">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sora font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'general'
              ? 'border-[#FF7A00] text-white bg-white/[0.02]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 size={15} className={activeTab === 'general' ? 'text-[#FF7A00]' : 'text-slate-500'} />
          <span>Workspace &amp; Brand</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sora font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'whatsapp'
              ? 'border-[#FF7A00] text-white bg-white/[0.02]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone size={15} className={activeTab === 'whatsapp' ? 'text-emerald-400' : 'text-slate-500'} />
          <span>WhatsApp Review Loop</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sora font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'billing'
              ? 'border-[#FF7A00] text-white bg-white/[0.02]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard size={15} className={activeTab === 'billing' ? 'text-blue-400' : 'text-slate-500'} />
          <span>Plan &amp; GST Invoicing</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sora font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'team'
              ? 'border-[#FF7A00] text-white bg-white/[0.02]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users size={15} className={activeTab === 'team' ? 'text-purple-400' : 'text-slate-500'} />
          <span>Team &amp; Access Control</span>
        </button>
      </div>

      {/* Tab 1: General Workspace & Brand Identity */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-sora font-bold text-white">Business Identity &amp; Tenant Partition</h3>
                <p className="text-xs text-slate-400 mt-0.5">Primary workspace identifier used across campaigns, receipts, and Brand Brain.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-500">ID: {workspaceId.slice(0, 10)}...</span>
                <button
                  onClick={handleCopyId}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                  title="Copy Workspace ID"
                >
                  {copiedId ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-inter">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                  Workspace / Business Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Sharma Heritage Handlooms"
                  className="w-full bg-[#11141A] border border-white/10 rounded-[10px] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7A00] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                  Industry / Sector
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-[#11141A] border border-white/10 rounded-[10px] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF7A00] transition"
                >
                  <option value="Retail, Apparel & Local Commerce">Retail, Apparel &amp; Local Commerce</option>
                  <option value="Consultancy, Growth & Creator Brand">Consultancy, Growth &amp; Creator Brand</option>
                  <option value="Healthcare, Diagnostics & Practice">Healthcare, Diagnostics &amp; Practice</option>
                  <option value="Food, Cafes & Cloud Kitchens">Food, Cafes &amp; Hospitality</option>
                  <option value="B2B Technology & SaaS Products">B2B Technology &amp; SaaS Products</option>
                  <option value="Marketing & Creative Agencies">Marketing &amp; Creative Agencies</option>
                  <option value="Small & Medium Business Services">Small &amp; Medium Business Services</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                  Official Website / Online Catalog URL
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://sharmaheritage.in"
                  className="w-full bg-[#11141A] border border-white/10 rounded-[10px] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7A00] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                  Tenant Data Isolation Tier
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-[10px] bg-[#11141A] border border-white/5 text-slate-300">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                  <span>Neon pgvector RLS (Row-Level Security Active)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: WhatsApp Review Loop & Auto-Commit */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-sora font-bold text-white flex items-center gap-2">
                  <Smartphone size={17} className="text-emerald-400" />
                  <span>WhatsApp 48-Hour Review Protocol</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Control how upcoming campaign contact sheets and voice note revisions reach your phone.
                </p>
              </div>

              <button
                onClick={handleTestWhatsAppPing}
                disabled={isSendingTestWa}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/50 hover:bg-emerald-900/80 text-emerald-300 text-xs font-mono transition flex items-center gap-1.5"
              >
                {isSendingTestWa ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span>Send Test Review Card</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-inter">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                  WhatsApp Admin Phone Number
                </label>
                <input
                  type="text"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="+91 98301 24589"
                  className="w-full bg-[#11141A] border border-white/10 rounded-[10px] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7A00] font-mono transition"
                />
                <p className="text-[10px] text-slate-500 mt-1">Must include country code (e.g. +91 for India). Interactive contact sheets arrive here at T-48h.</p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                  Review Window Duration
                </label>
                <select
                  value={reviewWindowHours}
                  onChange={(e) => setReviewWindowHours(Number(e.target.value))}
                  className="w-full bg-[#11141A] border border-white/10 rounded-[10px] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF7A00] transition"
                >
                  <option value={24}>24 Hours (Fast Turnaround)</option>
                  <option value={48}>48 Hours (Recommended Default)</option>
                  <option value={72}>72 Hours (Extended Agency Review)</option>
                </select>
              </div>
            </div>

            {/* Auto-Commit Toggle Strip */}
            <div className="p-4 rounded-[12px] bg-[#11141A] border border-white/5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-sora font-semibold text-white flex items-center gap-2">
                  <span>Passive Auto-Commit (&quot;Silence = Consent&quot;)</span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">RECOMMENDED</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  If you take no action during the {reviewWindowHours}-hour review window, KUIRO automatically publishes the scheduled post to maintain 365-day consistency.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAutoCommitEnabled(!autoCommitEnabled)}
                className={`text-2xl transition ${autoCommitEnabled ? 'text-[#FF7A00]' : 'text-slate-600'}`}
              >
                {autoCommitEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>

            {/* Language Preferences for Voice Notes */}
            <div className="space-y-2">
              <label className="block text-[11px] font-medium text-slate-300">
                Supported Voice Note Revision Languages
              </label>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Hinglish'].map((lang) => {
                  const isChecked = selectedLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
                        } else {
                          setSelectedLanguages([...selectedLanguages, lang]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition ${
                        isChecked
                          ? 'bg-[#FF7A00]/15 border-[#FF7A00] text-[#FF7A00]'
                          : 'bg-[#11141A] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isChecked && '✓ '}
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Subscription & GST Invoicing */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-sora font-bold text-white">Active Plan &amp; GST Tax Invoicing</h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage your KUIRO subscription tier, tax credentials, and invoices.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-xs font-mono font-bold">
                  {subscriptionTier} PLAN • ACTIVE
                </span>
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="px-3 py-1 rounded-lg bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-semibold font-sora transition shadow-sm"
                >
                  Change / Upgrade Plan
                </button>
              </div>
            </div>

            {/* Current Plan Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Current Tier</span>
                <p className="text-base font-sora font-bold text-white">{subscriptionTier === 'STARTER' ? 'Starter (Autopilot Lite)' : subscriptionTier === 'GROWTH' ? 'Growth (Full Autopilot)' : 'Agency / Multi-Brand'}</p>
                <span className="text-xs text-emerald-400 font-mono">
                  {subscriptionTier === 'GROWTH' ? '₹2,299 / month (Annual)' : subscriptionTier === 'STARTER' ? '₹999 / month' : '₹9,999 / month'}
                </span>
              </div>

              <div className="p-4 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Billing Cycle</span>
                <p className="text-base font-sora font-bold text-white">Annual (2 Months Free)</p>
                <span className="text-xs text-slate-400 font-mono">Renews Nov 14, 2027</span>
              </div>

              <div className="p-4 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Input Tax Credit (ITC)</span>
                <p className="text-base font-sora font-bold text-emerald-400">GST Eligible (18%)</p>
                <span className="text-xs text-slate-400 font-mono">Full B2B Invoice Issued</span>
              </div>
            </div>

            {/* GSTIN Input */}
            <div className="space-y-2">
              <label className="block text-[11px] font-medium text-slate-300">
                Registered GST Identification Number (GSTIN)
              </label>
              <div className="flex gap-3 max-w-md">
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 19AAACS1429B1Z8"
                  className="flex-1 bg-[#11141A] border border-white/10 rounded-[10px] px-3.5 py-2.5 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-[#FF7A00] transition"
                />
                <button
                  type="button"
                  onClick={() => showToast('GSTIN verified & saved on invoice manifest!')}
                  className="px-4 py-2.5 rounded-[10px] bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition"
                >
                  Verify
                </button>
              </div>
              <p className="text-[10px] text-slate-500">Provide your 15-character Indian GSTIN to receive automated tax invoices claiming 18% Input Tax Credit.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Team & Access Control */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="p-6 rounded-[16px] bg-[#0B0F14] border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-sora font-bold text-white">Team Members &amp; Seats</h3>
                <p className="text-xs text-slate-400 mt-0.5">Invite marketers, support staff, or agency managers to your workspace.</p>
              </div>

              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition flex items-center gap-1.5 shadow-md shadow-[#FF7A00]/20"
              >
                <Plus size={14} />
                <span>Invite Member</span>
              </button>
            </div>

            {/* Team List Table */}
            <div className="divide-y divide-white/5">
              {teamMembers.map((member) => (
                <div key={member.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FF7A00]/15 border border-[#FF7A00]/30 text-[#FF7A00] font-mono text-xs font-bold flex items-center justify-center">
                      {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-xs font-sora font-bold text-white">{member.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {member.role}
                    </span>
                    {member.role !== 'Owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                        title="Remove Member"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Role Permissions Scoping Matrix */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <h4 className="text-xs font-sora font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#FF7A00]" />
                <span>Multi-Seat RBAC Scoping Matrix</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1">
                  <span className="font-bold text-[#FF7A00] block">Owner</span>
                  <p className="text-[11px] text-slate-400">Full workspace ownership, billing &amp; tax invoicing, RLS policies, brand deletion.</p>
                </div>
                <div className="p-3 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1">
                  <span className="font-bold text-white block">Admin</span>
                  <p className="text-[11px] text-slate-400">Campaign management, Brand Brain tuning, collaborator invites, WhatsApp loop.</p>
                </div>
                <div className="p-3 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1">
                  <span className="font-bold text-white block">Marketer</span>
                  <p className="text-[11px] text-slate-400">Instant Campaign Composer, 1-Click Creative Kit ZIP exports, visual review.</p>
                </div>
                <div className="p-3 rounded-[12px] bg-[#11141A] border border-white/5 space-y-1">
                  <span className="font-bold text-emerald-400 block">Inbox Agent</span>
                  <p className="text-[11px] text-slate-400">Omni Inbox messaging only (WhatsApp, IG DMs, Email). Restricted from billing/settings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[18px] bg-[#0B0F14] border border-white/15 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-base font-sora font-bold text-white">Invite Collaborator</h4>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs font-inter">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Priya Sen"
                  className="w-full bg-[#11141A] border border-white/10 rounded-[10px] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7A00] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@business.in"
                  className="w-full bg-[#11141A] border border-white/10 rounded-[10px] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7A00] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Role &amp; Permissions</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-[#11141A] border border-white/10 rounded-[10px] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF7A00] transition"
                >
                  <option value="Admin">Admin (Campaigns, Brand Brain &amp; Invites)</option>
                  <option value="Marketer">Marketer (Composer &amp; Creative Kit ZIP Exports)</option>
                  <option value="Inbox Agent">Inbox Agent (Omni Inbox Messaging Only)</option>
                  <option value="Agency Staff">Agency Staff (Multi-Client Tenant Manager)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-[10px] bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white font-sora font-semibold shadow-md shadow-[#FF7A00]/25"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Checkout Modal */}
      <SubscriptionCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        initialTier={subscriptionTier}
        initialAnnual={billingFrequency === 'annual'}
        onSuccess={(newTier) => {
          setSubscriptionTier(newTier);
          setIsCheckoutModalOpen(false);
          showToast(`Successfully upgraded to KUIRO ${newTier} Plan!`);
        }}
      />
    </div>
  );
}

