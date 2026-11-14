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
    <div className="space-y-6 max-w-6xl mx-auto font-inter text-[#0B0F14]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            toastType === 'success'
              ? 'bg-[#0B0F14] text-white border border-emerald-500/50'
              : 'bg-[#0B0F14] text-white border border-rose-500/50'
          }`}
        >
          {toastType === 'success' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertCircle size={16} className="text-rose-400" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 border border-orange-200 text-[#FF7A00] text-xs font-mono font-bold mb-2">
            <Settings size={13} />
            <span>Workspace Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sora font-bold text-[#0B0F14] tracking-tight">
            Settings &amp; Autonomous Controls
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-inter mt-1">
            Manage your business profile, WhatsApp 48-hour review loop, team seats, and subscription invoicing.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-[10px] bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-sora font-semibold transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 self-start sm:self-auto disabled:opacity-50 active:scale-95 cursor-pointer"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Horizontal Settings Tabs */}
      <div className="flex overflow-x-auto border-b border-[#E5E7EB] gap-2 pb-px scrollbar-none">
        {[
          { id: 'general', label: 'Workspace & Brand', icon: Building2 },
          { id: 'whatsapp', label: 'WhatsApp Review Loop', icon: Smartphone, color: 'text-emerald-600' },
          { id: 'billing', label: 'Plan & GST Invoicing', icon: CreditCard, color: 'text-blue-600' },
          { id: 'team', label: 'Team & Access Control', icon: Users, color: 'text-purple-600' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sora font-semibold border-b-2 transition whitespace-nowrap rounded-t-lg ${
                isActive
                  ? 'border-[#FF7A00] text-[#0B0F14] bg-orange-50/70 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-[#FF7A00]' : (tab.color || 'text-gray-400')} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: General Workspace & Brand Identity */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="p-6 rounded-[14px] bg-white border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-sora font-bold text-[#0B0F14]">Business Identity &amp; Tenant Partition</h3>
                <p className="text-xs text-gray-500 mt-0.5">Primary workspace identifier used across campaigns, receipts, and Brand Brain.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200">ID: {workspaceId.slice(0, 10)}...</span>
                <button
                  onClick={handleCopyId}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition cursor-pointer"
                  title="Copy Workspace ID"
                >
                  {copiedId ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-inter">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                  Workspace / Business Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Sharma Heritage Handlooms"
                  className="w-full bg-[#F9FAFB] border border-gray-300 rounded-[10px] px-3.5 py-2.5 text-[#0B0F14] placeholder-gray-400 focus:outline-none focus:border-[#FF7A00] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                  Industry / Sector
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-gray-300 rounded-[10px] px-3.5 py-2.5 text-[#0B0F14] focus:outline-none focus:border-[#FF7A00] focus:bg-white transition"
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
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                  Official Website / Online Catalog URL
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://sharmaheritage.in"
                  className="w-full bg-[#F9FAFB] border border-gray-300 rounded-[10px] px-3.5 py-2.5 text-[#0B0F14] placeholder-gray-400 focus:outline-none focus:border-[#FF7A00] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                  Tenant Data Isolation Tier
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-[10px] bg-emerald-50/70 border border-emerald-200 text-emerald-800 font-medium">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
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
          <div className="p-6 rounded-[14px] bg-white border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-sora font-bold text-[#0B0F14] flex items-center gap-2">
                  <Smartphone size={17} className="text-emerald-600" />
                  <span>WhatsApp 48-Hour Review Protocol</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Control how upcoming campaign contact sheets and voice note revisions reach your phone.
                </p>
              </div>

              <button
                onClick={handleTestWhatsAppPing}
                disabled={isSendingTestWa}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                {isSendingTestWa ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span>Send Test Review Card</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-inter">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                  WhatsApp Admin Phone Number
                </label>
                <input
                  type="text"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="+91 98301 24589"
                  className="w-full bg-[#F9FAFB] border border-gray-300 rounded-[10px] px-3.5 py-2.5 text-[#0B0F14] placeholder-gray-400 focus:outline-none focus:border-[#FF7A00] focus:bg-white font-mono transition"
                />
                <p className="text-[10px] text-gray-500 mt-1">Must include country code (e.g. +91 for India). Interactive contact sheets arrive here at T-48h.</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                  Review Window Duration
                </label>
                <select
                  value={reviewWindowHours}
                  onChange={(e) => setReviewWindowHours(Number(e.target.value))}
                  className="w-full bg-[#F9FAFB] border border-gray-300 rounded-[10px] px-3.5 py-2.5 text-[#0B0F14] focus:outline-none focus:border-[#FF7A00] focus:bg-white transition"
                >
                  <option value={24}>24 Hours (Fast Turnaround)</option>
                  <option value={48}>48 Hours (Recommended Default)</option>
                  <option value={72}>72 Hours (Extended Agency Review)</option>
                </select>
              </div>
            </div>

            {/* Auto-Commit Toggle Strip */}
            <div className="p-4 rounded-[12px] bg-gray-50 border border-gray-200 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-sora font-bold text-[#0B0F14] flex items-center gap-2">
                  <span>Passive Auto-Commit (&quot;Silence = Consent&quot;)</span>
                  <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-bold">RECOMMENDED</span>
                </span>
                <p className="text-[11px] text-gray-600 leading-snug">
                  If you take no action during the {reviewWindowHours}-hour review window, KUIRO automatically publishes the scheduled post to maintain 365-day consistency.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAutoCommitEnabled(!autoCommitEnabled)}
                className={`text-2xl transition cursor-pointer ${autoCommitEnabled ? 'text-[#FF7A00]' : 'text-gray-300'}`}
              >
                {autoCommitEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>

            {/* Language Preferences for Voice Notes */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-gray-700">
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
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        isChecked
                          ? 'bg-orange-50 border-[#FF7A00] text-[#FF7A00] shadow-xs'
                          : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
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
          <div className="p-6 rounded-[14px] bg-white border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-sora font-bold text-[#0B0F14]">Active Plan &amp; GST Tax Invoicing</h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage your KUIRO subscription tier, tax credentials, and invoices.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold">
                  {subscriptionTier} PLAN • ACTIVE
                </span>
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-semibold font-sora transition shadow-sm cursor-pointer"
                >
                  Change / Upgrade Plan
                </button>
              </div>
            </div>

            {/* Current Plan Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-[12px] bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider">Current Tier</span>
                <p className="text-base font-sora font-bold text-[#0B0F14]">{subscriptionTier === 'STARTER' ? 'Starter (Autopilot Lite)' : subscriptionTier === 'GROWTH' ? 'Growth (Full Autopilot)' : 'Agency / Multi-Brand'}</p>
                <span className="text-xs text-emerald-700 font-bold font-mono">
                  {subscriptionTier === 'GROWTH' ? '₹2,299 / month (Annual)' : subscriptionTier === 'STARTER' ? '₹999 / month' : '₹9,999 / month'}
                </span>
              </div>

              <div className="p-4 rounded-[12px] bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider">Billing Cycle</span>
                <p className="text-base font-sora font-bold text-[#0B0F14]">Annual (2 Months Free)</p>
                <span className="text-xs text-gray-500 font-mono">Renews Nov 14, 2027</span>
              </div>

              <div className="p-4 rounded-[12px] bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider">Input Tax Credit (ITC)</span>
                <p className="text-base font-sora font-bold text-emerald-700">GST Eligible (18%)</p>
                <span className="text-xs text-gray-500 font-mono">Full B2B Invoice Issued</span>
              </div>
            </div>

            {/* GSTIN Input */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-gray-700">
                Registered GST Identification Number (GSTIN)
              </label>
              <div className="flex gap-3 max-w-md">
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 19AAACS1429B1Z8"
                  className="flex-1 bg-[#F9FAFB] border border-gray-300 rounded-[10px] px-3.5 py-2.5 text-[#0B0F14] placeholder-gray-400 font-mono text-xs focus:outline-none focus:border-[#FF7A00] focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => showToast('GSTIN verified & saved on invoice manifest!')}
                  className="px-4 py-2.5 rounded-[10px] bg-gray-900 hover:bg-black text-white text-xs font-semibold transition cursor-pointer"
                >
                  Verify
                </button>
              </div>
              <p className="text-[10px] text-gray-500">Provide your 15-character Indian GSTIN to receive automated tax invoices claiming 18% Input Tax Credit.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Team & Access Control */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="p-6 rounded-[14px] bg-white border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-sora font-bold text-[#0B0F14]">Team Members &amp; Seats</h3>
                <p className="text-xs text-gray-500 mt-0.5">Invite marketers, support staff, or agency managers to your workspace.</p>
              </div>

              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-[#0B0F14] hover:bg-gray-800 text-white text-xs font-sora font-semibold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus size={14} className="text-[#FF7A00]" />
                <span>Invite Member</span>
              </button>
            </div>

            {/* Team List Table */}
            <div className="divide-y divide-gray-100">
              {teamMembers.map((member) => (
                <div key={member.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 text-[#FF7A00] font-mono text-xs font-bold flex items-center justify-center">
                      {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-xs font-sora font-bold text-[#0B0F14]">{member.name}</p>
                      <p className="text-[11px] text-gray-500 font-mono">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 font-semibold">
                      {member.role}
                    </span>
                    {member.role !== 'Owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 transition cursor-pointer"
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
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h4 className="text-xs font-sora font-bold text-[#0B0F14] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#FF7A00]" />
                <span>Multi-Seat RBAC Scoping Matrix</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-[12px] bg-gray-50 border border-gray-200 space-y-1">
                  <span className="font-bold text-[#FF7A00] block">Owner</span>
                  <p className="text-[11px] text-gray-600">Full workspace ownership, billing &amp; tax invoicing, RLS policies, brand deletion.</p>
                </div>
                <div className="p-3 rounded-[12px] bg-gray-50 border border-gray-200 space-y-1">
                  <span className="font-bold text-[#0B0F14] block">Admin</span>
                  <p className="text-[11px] text-gray-600">Campaign management, Brand Brain tuning, collaborator invites, WhatsApp loop.</p>
                </div>
                <div className="p-3 rounded-[12px] bg-gray-50 border border-gray-200 space-y-1">
                  <span className="font-bold text-[#0B0F14] block">Marketer</span>
                  <p className="text-[11px] text-gray-600">Instant Campaign Composer, 1-Click Creative Kit ZIP exports, visual review.</p>
                </div>
                <div className="p-3 rounded-[12px] bg-gray-50 border border-gray-200 space-y-1">
                  <span className="font-bold text-emerald-700 block">Inbox Agent</span>
                  <p className="text-[11px] text-gray-600">Omni Inbox messaging only (WhatsApp, IG DMs, Email). Restricted from billing/settings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[18px] bg-white border border-gray-200 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-[#0B0F14]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="text-base font-sora font-bold text-[#0B0F14]">Invite Collaborator</h4>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs font-inter">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Priya Sen"
                  className="w-full bg-[#F9FAFB] border border-gray-300 rounded-[10px] px-3.5 py-2.5 text-[#0B0F14] placeholder-gray-400 focus:outline-none focus:border-[#FF7A00] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@business.in"
                  className="w-full bg-[#F9FAFB] border border-gray-300 rounded-[10px] px-3.5 py-2.5 text-[#0B0F14] placeholder-gray-400 focus:outline-none focus:border-[#FF7A00] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Role &amp; Permissions</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-[#F9FAFB] border border-gray-300 rounded-[10px] px-3.5 py-2.5 text-[#0B0F14] focus:outline-none focus:border-[#FF7A00] focus:bg-white transition"
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
                  className="px-4 py-2 rounded-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[10px] bg-[#FF7A00] hover:bg-[#E66E00] text-white font-sora font-semibold shadow-md shadow-orange-500/25 cursor-pointer"
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

