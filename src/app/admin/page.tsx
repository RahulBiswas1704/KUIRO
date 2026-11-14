'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import KuiroLogo from '@/components/brand/KuiroLogo';
import {
  ShieldCheck,
  LayoutDashboard,
  Building2,
  Users,
  Sparkles,
  CalendarDays,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Eye,
  ExternalLink,
  Smartphone,
  Send,
  Zap,
  Activity,
  Check,
  X,
  Lock,
  Mail,
  Share2,
  TrendingUp,
  Cpu,
  Layers,
  ChevronDown,
  EyeOff,
  Key,
  ShieldAlert,
  LogOut,
  AlertCircle
} from 'lucide-react';

interface MetricOverview {
  users: number;
  workspaces: number;
  brandProfiles: number;
  campaigns: number;
  platformPosts: number;
  conversations: number;
  messages: number;
  calendarEvents: number;
  activeSessions: number;
}

interface SystemHealth {
  database: { status: string; branch: string; engine: string; latencyMs: number };
  geminiAi: { status: string; model: string };
  whatsappCloud: { status: string; graphApiVersion: string; phoneId: string };
  inngestEngine: { status: string; scheduler: string };
  cloudflareR2: { status: string; bucket: string };
  resendEmail: { status: string; from: string };
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  timestamp: string;
  badgeColor: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'workspaces' | 'users' | 'campaigns' | 'calendar' | 'optimizer'
  >('overview');

  // Management Security Clearance State
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isManagementAuthenticated, setIsManagementAuthenticated] = useState(false);
  const [managementEmail, setManagementEmail] = useState('');
  const [managementPasskey, setManagementPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Overview Data
  const [metrics, setMetrics] = useState<MetricOverview | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Workspaces Data
  const [workspacesList, setWorkspacesList] = useState<any[]>([]);
  const [workspaceTierFilter, setWorkspaceTierFilter] = useState('ALL');
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [isNewWsModalOpen, setIsNewWsModalOpen] = useState(false);
  const [selectedWsForInspection, setSelectedWsForInspection] = useState<any | null>(null);

  // New Workspace Form
  const [newWsForm, setNewWsForm] = useState({
    name: '',
    ownerName: '',
    ownerEmail: '',
    subscriptionTier: 'GROWTH',
    whatsappAdminPhone: '+919876543210',
    industry: 'Retail, Commerce & Professional Services',
  });

  // Users Data
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Campaigns Data
  const [campaignsList, setCampaignsList] = useState<any[]>([]);
  const [campaignStatusFilter, setCampaignStatusFilter] = useState('ALL');
  const [selectedCampaignPosts, setSelectedCampaignPosts] = useState<any | null>(null);

  // Calendar Data
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [calendarRegionFilter, setCalendarRegionFilter] = useState('All');
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [newEventForm, setNewEventForm] = useState({
    eventName: '',
    eventDate: new Date().toISOString().slice(0, 10),
    regions: 'Pan-India',
    targetIndustries: 'All',
    promptContext: '',
  });

  // Optimizer Data
  const [optimizerConfig, setOptimizerConfig] = useState<any | null>(null);
  const [isSavingOptimizer, setIsSavingOptimizer] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check Active Management Clearance
  const checkManagementAuth = useCallback(async () => {
    try {
      setIsAuthChecking(true);
      const res = await fetch('/api/admin/auth');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setIsManagementAuthenticated(true);
          setManagementEmail(data.email || 'management@kuiro.in');
          return true;
        }
      }
      setIsManagementAuthenticated(false);
      return false;
    } catch (err) {
      setIsManagementAuthenticated(false);
      return false;
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  // 1. Fetch Overview
  const loadOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/overview');
      if (res.status === 401 || res.status === 403) {
        setIsManagementAuthenticated(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setHealth(data.health);
        setActivities(data.recentActivities || []);
      }
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    }
  }, []);

  // 2. Fetch Workspaces
  const loadWorkspaces = useCallback(async () => {
    try {
      const url = new URL('/api/admin/workspaces', window.location.origin);
      if (workspaceTierFilter !== 'ALL') url.searchParams.set('tier', workspaceTierFilter);
      if (workspaceSearch) url.searchParams.set('search', workspaceSearch);

      const res = await fetch(url.toString());
      if (res.status === 401 || res.status === 403) {
        setIsManagementAuthenticated(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setWorkspacesList(data.workspaces || []);
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    }
  }, [workspaceTierFilter, workspaceSearch]);

  // 3. Fetch Users
  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.status === 401 || res.status === 403) {
        setIsManagementAuthenticated(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  }, []);

  // 4. Fetch Campaigns
  const loadCampaigns = useCallback(async () => {
    try {
      const url = new URL('/api/admin/campaigns', window.location.origin);
      if (campaignStatusFilter !== 'ALL') url.searchParams.set('status', campaignStatusFilter);

      const res = await fetch(url.toString());
      if (res.status === 401 || res.status === 403) {
        setIsManagementAuthenticated(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setCampaignsList(data.campaigns || []);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    }
  }, [campaignStatusFilter]);

  // 5. Fetch Calendar Events
  const loadCalendar = useCallback(async () => {
    try {
      const url = new URL('/api/admin/calendar', window.location.origin);
      if (calendarRegionFilter !== 'All') url.searchParams.set('region', calendarRegionFilter);

      const res = await fetch(url.toString());
      if (res.status === 401 || res.status === 403) {
        setIsManagementAuthenticated(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setCalendarEvents(data.events || []);
      }
    } catch (err) {
      console.error('Failed to load calendar events:', err);
    }
  }, [calendarRegionFilter]);

  // 6. Fetch Optimizer Config
  const loadOptimizer = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/optimizer');
      if (res.status === 401 || res.status === 403) {
        setIsManagementAuthenticated(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setOptimizerConfig(data.config);
      }
    } catch (err) {
      console.error('Failed to load optimizer:', err);
    }
  }, []);

  // Refresh current view
  const refreshCurrentView = async () => {
    setIsRefreshing(true);
    if (activeTab === 'overview') await loadOverview();
    else if (activeTab === 'workspaces') await loadWorkspaces();
    else if (activeTab === 'users') await loadUsers();
    else if (activeTab === 'campaigns') await loadCampaigns();
    else if (activeTab === 'calendar') await loadCalendar();
    else if (activeTab === 'optimizer') await loadOptimizer();
    setIsRefreshing(false);
  };

  // Initial Auth Check & Data Hydration
  useEffect(() => {
    async function init() {
      const isAuthed = await checkManagementAuth();
      if (isAuthed) {
        setIsLoading(true);
        await Promise.all([
          loadOverview(),
          loadWorkspaces(),
          loadUsers(),
          loadCampaigns(),
          loadCalendar(),
          loadOptimizer(),
        ]);
        setIsLoading(false);
      }
    }
    init();
  }, [checkManagementAuth, loadOverview, loadWorkspaces, loadUsers, loadCampaigns, loadCalendar, loadOptimizer]);

  // Management Login Handler
  const handleManagementLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthorizing(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: managementEmail, passkey: managementPasskey }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Access Denied: Invalid management clearance credentials.');
        return;
      }
      setIsManagementAuthenticated(true);
      setManagementEmail(data.user?.email || managementEmail);
      showToast('KUIRO Management Clearance Granted: Terminal Unlocked');
      setIsLoading(true);
      await Promise.all([
        loadOverview(),
        loadWorkspaces(),
        loadUsers(),
        loadCampaigns(),
        loadCalendar(),
        loadOptimizer(),
      ]);
      setIsLoading(false);
    } catch (err: any) {
      setAuthError(err.message || 'Network error while attempting authorization');
    } finally {
      setIsAuthorizing(false);
    }
  };

  // Management Logout / Lock Handler
  const handleManagementLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setIsManagementAuthenticated(false);
      setManagementPasskey('');
      showToast('KUIRO Management Terminal Locked');
    } catch (err) {
      console.error(err);
      setIsManagementAuthenticated(false);
    }
  };

  // Workspace Actions
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWsForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast(`Workspace "${newWsForm.name}" created!`);
      setIsNewWsModalOpen(false);
      setNewWsForm({
        name: '',
        ownerName: '',
        ownerEmail: '',
        subscriptionTier: 'GROWTH',
        whatsappAdminPhone: '+919876543210',
        industry: 'Retail, Commerce & Professional Services',
      });
      loadWorkspaces();
      loadOverview();
    } catch (err: any) {
      alert(err.message || 'Failed to create workspace');
    }
  };

  const handleUpdateWorkspaceTier = async (wsId: string, tier: string) => {
    try {
      const res = await fetch('/api/admin/workspaces', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: wsId, subscriptionTier: tier }),
      });
      if (res.ok) {
        showToast('Workspace subscription tier updated.');
        loadWorkspaces();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWorkspace = async (wsId: string, wsName: string) => {
    if (!confirm(`Are you sure you want to delete workspace "${wsName}"? All campaigns and profiles will be erased.`)) return;
    try {
      const res = await fetch(`/api/admin/workspaces?id=${wsId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Workspace "${wsName}" deleted.`);
        loadWorkspaces();
        loadOverview();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // User Actions
  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role }),
      });
      if (res.ok) {
        showToast('User role updated.');
        loadUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleEmailVerified = async (userId: string, current: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, emailVerified: !current }),
      });
      if (res.ok) {
        showToast(`Email verification set to ${!current}.`);
        loadUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Campaign Actions
  const handleUpdateCampaignStatus = async (campId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campId, status }),
      });
      if (res.ok) {
        showToast(`Campaign status updated to ${status}.`);
        loadCampaigns();
        loadOverview();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calendar Actions
  const handleAddCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: newEventForm.eventName,
          eventDate: newEventForm.eventDate,
          regions: newEventForm.regions.split(',').map((s) => s.trim()),
          targetIndustries: newEventForm.targetIndustries.split(',').map((s) => s.trim()),
          promptContext: newEventForm.promptContext,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast(`Milestone "${newEventForm.eventName}" added to calendar!`);
      setIsNewEventModalOpen(false);
      setNewEventForm({
        eventName: '',
        eventDate: new Date().toISOString().slice(0, 10),
        regions: 'Pan-India',
        targetIndustries: 'All',
        promptContext: '',
      });
      loadCalendar();
      loadOverview();
    } catch (err: any) {
      alert(err.message || 'Failed to add calendar milestone');
    }
  };

  const handleDeleteCalendarEvent = async (eventId: string, name: string) => {
    if (!confirm(`Delete milestone "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/calendar?id=${eventId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Milestone removed.');
        loadCalendar();
        loadOverview();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerRadarSweep = async () => {
    try {
      showToast('Initiating 48-Hour Radar sweep across all workspaces...');
      const res = await fetch('/api/calendar/cron-trigger', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        const autoCount = data.autoCommitted?.length || 0;
        showToast(`Radar scan complete! Evaluated ${data.workspacesEvaluated || 0} workspaces. ${autoCount > 0 ? `${autoCount} campaigns auto-committed.` : ''}`);
        loadCampaigns();
        loadOverview();
      } else {
        showToast(data.error || 'Failed to trigger radar sweep');
      }
    } catch (err) {
      showToast('Failed to trigger radar sweep');
    }
  };

  // Optimizer Save
  const handleSaveOptimizer = async () => {
    if (!optimizerConfig) return;
    setIsSavingOptimizer(true);
    try {
      const res = await fetch('/api/admin/optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optimizerConfig),
      });
      if (res.ok) {
        showToast('AI Critic & Engine optimization settings saved live!');
      }
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setIsSavingOptimizer(false);
    }
  };

  // 1. Initial Clearance Verification State
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#06090F] flex flex-col items-center justify-center p-6 text-slate-100 font-sans selection:bg-[#FF7A00] selection:text-white">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/30 flex items-center justify-center shadow-2xl shadow-[#FF7A00]/20 animate-pulse">
            <ShieldCheck className="w-10 h-10 text-[#FF7A00]" />
          </div>
          <div className="absolute inset-0 rounded-2xl border border-[#FF7A00]/20 animate-ping opacity-25" />
        </div>
        <h2 className="text-xl font-bold font-syne text-white tracking-wide text-center">
          Verifying Management Clearance
        </h2>
        <p className="text-xs text-slate-400 font-inter mt-2 text-center max-w-sm">
          Cryptographically authenticating session token with Lakebase Neon Security Module...
        </p>
      </div>
    );
  }

  // 2. High-Security Terminal Lock Gate
  if (!isManagementAuthenticated) {
    return (
      <div className="min-h-screen bg-[#06090F] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF7A00]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-10 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Security Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-[12px] bg-[#111822] border border-[#FF7A00] text-white shadow-2xl flex items-center gap-3 animate-fade-in font-inter text-xs">
            <div className="w-2 h-2 rounded-full bg-[#FF7A00] animate-ping" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="w-full max-w-md relative z-10">
          {/* Top Brand & Clearance Badge */}
          <div className="flex flex-col items-center text-center mb-8">
            <Link href="/" className="mb-4 inline-block hover:opacity-90 transition">
              <KuiroLogo variant="primary" theme="dark" symbolSize={38} showTagline={false} />
            </Link>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-mono font-bold tracking-wider uppercase mb-3">
              <ShieldAlert size={14} className="animate-pulse" />
              <span>Level 5 Restricted • Management Only</span>
            </div>
            
            <h1 className="text-2xl font-bold font-syne text-white tracking-tight">
              Operator Terminal Locked
            </h1>
            <p className="text-xs text-slate-400 font-inter mt-1.5 max-w-sm">
              Restricted to KUIRO Executive Management & Systems Operators. Access requires signed root clearance.
            </p>
          </div>

          {/* Secure Card */}
          <div className="bg-[#0B101B]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative">
            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#FF7A00] to-transparent" />

            <form onSubmit={handleManagementLogin} className="space-y-4">
              {/* Error Banner */}
              {authError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 font-inter leading-relaxed">{authError}</div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-inter">
                  Management Clearance Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={managementEmail}
                    onChange={(e) => setManagementEmail(e.target.value)}
                    placeholder="e.g. rahul.biswas1704@gmail.com or name@kuiro.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06090F] border border-white/10 text-white placeholder-slate-500 text-xs font-inter focus:outline-none focus:border-[#FF7A00] transition"
                    autoComplete="username"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-inter">
                  Authorized domains: <span className="text-slate-400 font-mono">@kuiro.in</span>, <span className="text-slate-400 font-mono">@sharmaheritage.in</span>, or registered executive email.
                </p>
              </div>

              {/* Master Security Passkey */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-inter">
                  Master Security Passkey
                </label>
                <div className="relative">
                  <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPasskey ? 'text' : 'password'}
                    required
                    value={managementPasskey}
                    onChange={(e) => setManagementPasskey(e.target.value)}
                    placeholder="Enter Master Passkey"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#06090F] border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-[#FF7A00] transition"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1"
                    title={showPasskey ? 'Hide passkey' : 'Show passkey'}
                  >
                    {showPasskey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAuthorizing}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#E05300] hover:from-[#ff881a] hover:to-[#eb5e0d] text-white text-xs font-bold font-syne tracking-wide uppercase transition shadow-lg shadow-[#FF7A00]/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAuthorizing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Verifying Clearance...</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Authorize Management Terminal</span>
                  </>
                )}
              </button>
            </form>

            {/* Terminal Security Metrics */}
            <div className="mt-6 pt-5 border-t border-white/[0.08] grid grid-cols-2 gap-3 text-center">
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <div className="text-[10px] uppercase font-mono text-slate-500">Session Guard</div>
                <div className="text-[11px] font-mono text-emerald-400 font-semibold mt-0.5">HMAC-SHA256 8h</div>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <div className="text-[10px] uppercase font-mono text-slate-500">Security Clearance</div>
                <div className="text-[11px] font-mono text-[#FF7A00] font-semibold mt-0.5">Tier 5 Root</div>
              </div>
            </div>
          </div>

          {/* Links back to workspace */}
          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="text-xs text-slate-400 hover:text-white transition inline-flex items-center gap-1.5 font-inter"
            >
              <span>← Return to Client Workspace Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06090F] text-slate-100 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-[12px] bg-[#111822] border border-[#FF7A00] text-white shadow-2xl flex items-center gap-3 animate-fade-in font-inter text-xs">
          <div className="w-2 h-2 rounded-full bg-[#FF7A00] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="h-16 bg-[#090D14]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <KuiroLogo variant="primary" theme="dark" symbolSize={30} showTagline={false} />
          </Link>
          <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 rounded-md bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={13} />
              <span>Operator Core</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 hidden md:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Neon PostgreSQL 18.7 Live</span>
            </span>
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Executive:</span>
              <span className="font-semibold text-emerald-300">{managementEmail}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshCurrentView}
            disabled={isRefreshing}
            className="p-2 rounded-[10px] bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs"
            title="Refresh current view"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#FF7A00]' : ''} />
            <span className="hidden sm:inline">Sync Data</span>
          </button>

          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-[10px] bg-white/[0.06] hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center gap-1.5"
          >
            <span>Client Dashboard</span>
            <ExternalLink size={13} />
          </Link>

          <button
            onClick={handleManagementLogout}
            className="px-3 py-1.5 rounded-[10px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-400 hover:text-red-300 transition flex items-center gap-1.5 cursor-pointer"
            title="Lock Terminal & Terminate Session"
          >
            <Lock size={13} />
            <span className="hidden sm:inline">Lock Terminal</span>
          </button>
        </div>
      </header>

      {/* Main Admin Sub-Navigation Tabs */}
      <div className="bg-[#0A0E16] border-b border-white/[0.06] px-4 sm:px-6 overflow-x-auto flex items-center gap-2 py-2">
        {[
          { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
          { id: 'workspaces', label: 'Tenants & Workspaces', icon: Building2, count: metrics?.workspaces },
          { id: 'users', label: 'Users & Sessions', icon: Users, count: metrics?.users },
          { id: 'campaigns', label: '48h Campaign Queue', icon: Sparkles, count: metrics?.campaigns },
          { id: 'calendar', label: '365 Indian Calendar', icon: CalendarDays, count: metrics?.calendarEvents },
          { id: 'optimizer', label: 'AI Critic & Optimizer', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-[10px] text-xs font-medium transition flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#FF7A00] text-white font-semibold shadow-md shadow-[#FF7A00]/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* TAB 1: OVERVIEW & COMMAND CENTER */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#101722] via-[#0E1520] to-[#151D2A] p-5 rounded-[16px] border border-white/10">
              <div>
                <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
                  <span>Global Autonomous Command Center</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Cross-tenant observability and engine orchestration for Indian SMB marketing.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleTriggerRadarSweep}
                  className="px-4 py-2 rounded-[10px] bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition"
                >
                  <Zap size={14} />
                  <span>Run 48h Radar Sweep Now</span>
                </button>
                <button
                  onClick={() => setIsNewWsModalOpen(true)}
                  className="px-4 py-2 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition"
                >
                  <Plus size={14} />
                  <span>Provision Tenant Workspace</span>
                </button>
              </div>
            </div>

            {/* KPI Metric Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {[
                { label: 'Workspaces', value: metrics?.workspaces ?? 11, icon: Building2, color: 'text-amber-400' },
                { label: 'Registered Users', value: metrics?.users ?? 4, icon: Users, color: 'text-blue-400' },
                { label: '48h Campaigns', value: metrics?.campaigns ?? 11, icon: Sparkles, color: 'text-[#FF7A00]' },
                { label: 'Multi-Channel Posts', value: metrics?.platformPosts ?? 55, icon: Share2, color: 'text-emerald-400' },
                { label: 'Cultural Milestones', value: metrics?.calendarEvents ?? 35, icon: CalendarDays, color: 'text-purple-400' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="p-4 rounded-[14px] bg-[#0C111A] border border-white/[0.08] relative overflow-hidden">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[11px] font-medium">{stat.label}</span>
                      <Icon size={16} className={stat.color} />
                    </div>
                    <p className="text-2xl font-sora font-bold text-white">{stat.value}</p>
                    <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Live in Neon DB</span>
                  </div>
                );
              })}
            </div>

            {/* Infrastructure Health Grid */}
            <div className="space-y-3">
              <h3 className="font-sora text-sm font-semibold text-white flex items-center gap-2">
                <Cpu size={16} className="text-[#FF7A00]" />
                <span>Core Infrastructure Pulse</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[
                  {
                    name: 'Neon Serverless PostgreSQL',
                    status: health?.database.status || 'HEALTHY',
                    desc: health?.database.engine || 'PostgreSQL 18.7',
                    meta: `Latency: ${health?.database.latencyMs ?? 18}ms • Branch: production`,
                    color: 'emerald',
                  },
                  {
                    name: 'Google Gemini 3.5 AI Engine',
                    status: health?.geminiAi.status || 'OPERATIONAL',
                    desc: health?.geminiAi.model || 'Flash Lite + Pro Fallback',
                    meta: 'Copywriting, Brand Brain & Critic Active',
                    color: 'emerald',
                  },
                  {
                    name: 'Meta WhatsApp Cloud API',
                    status: health?.whatsappCloud.status || 'OPERATIONAL',
                    desc: `Phone ID: ${health?.whatsappCloud.phoneId || '1528322460354543'}`,
                    meta: 'Graph API v21.0 • Webhook Active',
                    color: 'emerald',
                  },
                  {
                    name: 'Inngest Durable State Machine',
                    status: health?.inngestEngine.status || 'OPERATIONAL',
                    desc: '48h Auto-Commit Scheduler',
                    meta: 'Race-condition free timer loop',
                    color: 'emerald',
                  },
                  {
                    name: 'Cloudflare R2 Media Vault',
                    status: health?.cloudflareR2.status || 'OPERATIONAL',
                    desc: `Bucket: ${health?.cloudflareR2.bucket || 'kuiro-media'}`,
                    meta: 'S3-Compatible High-DPI CDN',
                    color: 'blue',
                  },
                  {
                    name: 'Resend Transactional Email',
                    status: health?.resendEmail.status || 'OPERATIONAL',
                    desc: 'DKIM & Verified Sender',
                    meta: health?.resendEmail.from || 'onboarding@resend.dev',
                    color: 'blue',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-[14px] bg-[#0C111A] border border-white/[0.08] flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white truncate">{item.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/20">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 truncate">{item.desc}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">{item.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity Stream */}
            <div className="p-5 rounded-[16px] bg-[#0C111A] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-sora text-sm font-semibold text-white flex items-center gap-2">
                  <Activity size={16} className="text-[#FF7A00]" />
                  <span>Real-time System Activity Feed</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Live Cross-Tenant Audits</span>
              </div>

              <div className="divide-y divide-white/[0.05]">
                {activities.map((act) => (
                  <div key={act.id} className="py-3 flex items-center justify-between text-xs font-inter">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          act.type === 'CAMPAIGN'
                            ? 'bg-[#FF7A00]/20 text-[#FF7A00]'
                            : act.type === 'INBOX'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}
                      >
                        {act.type === 'CAMPAIGN' ? 'CMP' : act.type === 'INBOX' ? 'INB' : 'USR'}
                      </div>
                      <div>
                        <p className="text-white font-medium">{act.title}</p>
                        <p className="text-[11px] text-slate-400">{act.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TENANTS & WORKSPACES */}
        {activeTab === 'workspaces' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-sora font-bold text-white">Tenants & Workspaces Management</h2>
                <p className="text-xs text-slate-400">Manage business profiles, subscription tiers, and WhatsApp numbers.</p>
              </div>
              <button
                onClick={() => setIsNewWsModalOpen(true)}
                className="px-4 py-2 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus size={14} />
                <span>New Workspace</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#0C111A] p-3 rounded-[12px] border border-white/[0.08]">
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search workspace or founder..."
                  value={workspaceSearch}
                  onChange={(e) => setWorkspaceSearch(e.target.value)}
                  className="w-full bg-[#111722] border border-white/10 rounded-[8px] pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {['ALL', 'STARTER', 'GROWTH', 'AGENCY'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setWorkspaceTierFilter(tier)}
                    className={`px-3 py-1 rounded-[8px] text-[11px] font-medium transition ${
                      workspaceTierFilter === tier
                        ? 'bg-[#FF7A00] text-white font-semibold'
                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Workspaces Table */}
            <div className="rounded-[14px] bg-[#0C111A] border border-white/[0.08] overflow-hidden">
              <table className="w-full text-left text-xs font-inter">
                <thead className="bg-[#101622] text-slate-400 uppercase font-mono text-[10px] border-b border-white/[0.06]">
                  <tr>
                    <th className="px-4 py-3">Workspace</th>
                    <th className="px-4 py-3">Owner / Email</th>
                    <th className="px-4 py-3">Tier</th>
                    <th className="px-4 py-3">WhatsApp Admin</th>
                    <th className="px-4 py-3">Brand Brain</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {workspacesList.map((ws) => (
                    <tr key={ws.id} className="hover:bg-white/[0.02] transition">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-white block">{ws.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">{ws.id.slice(0, 8)}...</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-200 block">{ws.ownerName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{ws.ownerEmail}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={ws.subscriptionTier}
                          onChange={(e) => handleUpdateWorkspaceTier(ws.id, e.target.value)}
                          className="bg-[#111722] border border-white/10 rounded-[6px] px-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#FF7A00]"
                        >
                          <option value="STARTER">STARTER</option>
                          <option value="GROWTH">GROWTH</option>
                          <option value="AGENCY">AGENCY</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300 text-[11px]">
                        {ws.whatsappAdminPhone || <span className="text-slate-500 italic">None</span>}
                      </td>
                      <td className="px-4 py-3">
                        {ws.brandProfile ? (
                          <button
                            onClick={() => setSelectedWsForInspection(ws)}
                            className="px-2 py-1 rounded-[6px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium hover:bg-emerald-500/20 transition flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ws.brandProfile.primaryHex }} />
                            <span>{ws.brandProfile.industry.slice(0, 18)}...</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Unconfigured</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedWsForInspection(ws)}
                            className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white"
                            title="Inspect Brand Brain"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteWorkspace(ws.id, ws.name)}
                            className="p-1.5 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                            title="Delete Workspace"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: USERS & SESSIONS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-sora font-bold text-white">Users & Session Authorization</h2>
                <p className="text-xs text-slate-400">Inspect Neon DB credentials, user roles, and token sessions.</p>
              </div>
            </div>

            <div className="rounded-[14px] bg-[#0C111A] border border-white/[0.08] overflow-hidden">
              <table className="w-full text-left text-xs font-inter">
                <thead className="bg-[#101622] text-slate-400 uppercase font-mono text-[10px] border-b border-white/[0.06]">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Email Verified</th>
                    <th className="px-4 py-3">Workspaces</th>
                    <th className="px-4 py-3">Sessions</th>
                    <th className="px-4 py-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {usersList.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition">
                      <td className="px-4 py-3 font-semibold text-white">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300 text-[11px]">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role || 'Founder'}
                          onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                          className="bg-[#111722] border border-white/10 rounded-[6px] px-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#FF7A00]"
                        >
                          <option value="Founder">Founder</option>
                          <option value="Administrator">Administrator</option>
                          <option value="Operator">Operator</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleEmailVerified(user.id, !!user.emailVerified)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                            user.emailVerified
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {user.emailVerified ? 'VERIFIED' : 'UNVERIFIED'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                        {user.workspacesCount} Tenant(s)
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-emerald-400">
                        {user.activeSessionsCount} active
                      </td>
                      <td className="px-4 py-3 text-[11px] font-mono text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: CAMPAIGNS & 48-HOUR LOOP */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-sora font-bold text-white">Cross-Tenant Campaign Queue</h2>
                <p className="text-xs text-slate-400">Oversee the 48-hour Auto-Commit state machine across all businesses.</p>
              </div>

              <div className="flex items-center gap-1.5">
                {['ALL', 'AUTO_QUEUED', 'APPROVED', 'PAUSED', 'PUBLISHED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setCampaignStatusFilter(st)}
                    className={`px-3 py-1 rounded-[8px] text-[11px] font-medium transition ${
                      campaignStatusFilter === st
                        ? 'bg-[#FF7A00] text-white font-semibold'
                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[14px] bg-[#0C111A] border border-white/[0.08] overflow-hidden">
              <table className="w-full text-left text-xs font-inter">
                <thead className="bg-[#101622] text-slate-400 uppercase font-mono text-[10px] border-b border-white/[0.06]">
                  <tr>
                    <th className="px-4 py-3">Topic / Summary</th>
                    <th className="px-4 py-3">Workspace</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">48h Countdown</th>
                    <th className="px-4 py-3">Voice Revisions</th>
                    <th className="px-4 py-3">Critic Score</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {campaignsList.map((camp) => (
                    <tr key={camp.id} className="hover:bg-white/[0.02] transition">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-white block max-w-xs truncate">{camp.topicSummary}</span>
                        <span className="text-[10px] font-mono text-[#FF7A00]">{camp.triggerType} Trigger</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-[11px]">
                        {camp.workspaceName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                            camp.status === 'PUBLISHED'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                              : camp.status === 'APPROVED'
                              ? 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                              : camp.status === 'PAUSED'
                              ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {camp.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300 text-[11px]">
                        {camp.status === 'PUBLISHED' ? (
                          <span className="text-emerald-400 font-semibold">Live Dispatched</span>
                        ) : (
                          <span>{camp.countdownFormatted}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        {camp.revisionCount} / 2
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-emerald-400 font-semibold">
                        {camp.avgCriticScore}/100
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCampaignPosts(camp)}
                            className="px-2.5 py-1 rounded-[6px] bg-white/[0.05] hover:bg-white/10 text-slate-300 text-[11px] font-medium"
                          >
                            Inspect Payloads
                          </button>
                          {camp.status !== 'APPROVED' && camp.status !== 'PUBLISHED' && (
                            <button
                              onClick={() => handleUpdateCampaignStatus(camp.id, 'APPROVED')}
                              className="px-2.5 py-1 rounded-[6px] bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold"
                            >
                              Approve
                            </button>
                          )}
                          {camp.status !== 'PAUSED' && camp.status !== 'PUBLISHED' && (
                            <button
                              onClick={() => handleUpdateCampaignStatus(camp.id, 'PAUSED')}
                              className="px-2.5 py-1 rounded-[6px] bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-semibold"
                            >
                              Pause
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: 365 INDIAN CULTURAL CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-sora font-bold text-white">365 Indian Cultural & Sector Calendar</h2>
                <p className="text-xs text-slate-400">Seeded with 35 regional milestones driving 48-hour autonomous marketing triggers.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerRadarSweep}
                  className="px-3 py-1.5 rounded-[8px] bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Zap size={14} />
                  <span>Trigger Radar Scan</span>
                </button>
                <button
                  onClick={() => setIsNewEventModalOpen(true)}
                  className="px-3 py-1.5 rounded-[8px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Add Cultural Event</span>
                </button>
              </div>
            </div>

            {/* Vercel Cron Engine Status Card */}
            <div className="p-3.5 rounded-[12px] bg-emerald-950/20 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <div>
                  <span className="font-semibold text-emerald-300">Vercel Cron Active: </span>
                  <span className="text-slate-300 font-mono text-[11px]">0 0 * * * (Daily 00:00 UTC / 05:30 AM IST)</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Endpoint: <code className="text-emerald-400 font-mono">/api/calendar/cron-trigger</code> (GET/POST) • 48h Radar + T-0h Auto-Commit Fail-Safe
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  CRON_SECRET Protected
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto bg-[#0C111A] p-2.5 rounded-[12px] border border-white/[0.08]">
              {['All', 'Pan-India', 'East India', 'West Bengal', 'Maharashtra', 'North India', 'South India'].map((reg) => (
                <button
                  key={reg}
                  onClick={() => setCalendarRegionFilter(reg)}
                  className={`px-3 py-1 rounded-[8px] text-[11px] font-medium transition ${
                    calendarRegionFilter === reg
                      ? 'bg-[#FF7A00] text-white font-semibold'
                      : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {calendarEvents.map((ev) => (
                <div key={ev.id} className="p-4 rounded-[14px] bg-[#0C111A] border border-white/[0.08] space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-slate-400">{ev.eventDate}</span>
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                          ev.isTriggerWindow
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30 animate-pulse'
                            : ev.daysRemaining <= 14
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {ev.daysRemaining >= 0 ? `${ev.daysRemaining} days left` : 'Passed'}
                      </span>
                    </div>

                    <h4 className="font-sora font-semibold text-sm text-white">{ev.eventName}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{ev.promptContext}</p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono text-slate-500">{ev.regions?.join(', ')}</span>
                    <button
                      onClick={() => handleDeleteCalendarEvent(ev.id, ev.eventName)}
                      className="text-slate-500 hover:text-rose-400 transition"
                      title="Delete Event"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: AI CRITIC & OPTIMIZER */}
        {activeTab === 'optimizer' && optimizerConfig && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-sora font-bold text-white">AI Critic & Engine Optimizer</h2>
                <p className="text-xs text-slate-400">Calibrate unit-economics guardrails, LLM routing, and autonomous thresholds.</p>
              </div>
              <button
                onClick={handleSaveOptimizer}
                disabled={isSavingOptimizer}
                className="px-5 py-2 rounded-[10px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition disabled:opacity-50"
              >
                <Check size={14} />
                <span>{isSavingOptimizer ? 'Saving Live...' : 'Save Optimization Live'}</span>
              </button>
            </div>

            {/* AI Critic Score Calibration */}
            <div className="p-5 rounded-[16px] bg-[#0C111A] border border-white/[0.08] space-y-4">
              <h3 className="font-sora text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-[#FF7A00]" />
                <span>AI Critic Rubric & Pass Thresholds</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-inter">
                <div>
                  <label className="block text-slate-300 mb-1">
                    Minimum Pass Rubric Score (0–100): <strong className="text-white">{optimizerConfig.aiCritic.minimumPassScore}</strong>
                  </label>
                  <input
                    type="range"
                    min="70"
                    max="98"
                    value={optimizerConfig.aiCritic.minimumPassScore}
                    onChange={(e) =>
                      setOptimizerConfig({
                        ...optimizerConfig,
                        aiCritic: { ...optimizerConfig.aiCritic, minimumPassScore: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-[#FF7A00]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">
                    Brand Alignment Weight (%): <strong className="text-white">{optimizerConfig.aiCritic.brandAlignmentWeight}%</strong>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={optimizerConfig.aiCritic.brandAlignmentWeight}
                    onChange={(e) =>
                      setOptimizerConfig({
                        ...optimizerConfig,
                        aiCritic: { ...optimizerConfig.aiCritic, brandAlignmentWeight: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-[#FF7A00]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="strictNeg"
                  checked={optimizerConfig.aiCritic.strictNegativeConstraints}
                  onChange={(e) =>
                    setOptimizerConfig({
                      ...optimizerConfig,
                      aiCritic: { ...optimizerConfig.aiCritic, strictNegativeConstraints: e.target.checked },
                    })
                  }
                  className="rounded accent-[#FF7A00]"
                />
                <label htmlFor="strictNeg" className="text-xs text-slate-300">
                  Strictly reject any campaign mentioning competing clinical chains or non-medical claims
                </label>
              </div>
            </div>

            {/* Unit Economics: Zero Link-Surcharge Guardrail */}
            <div className="p-5 rounded-[16px] bg-[#0C111A] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-sora text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-400" />
                  <span>X (Twitter) Zero Link-Surcharge Enforcement</span>
                </h3>
                <span className="text-[11px] font-mono font-bold text-emerald-400">
                  Est. Savings: ${optimizerConfig.unitEconomics.estimatedMonthlySavingsUsd}/mo
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                By automatically routing external URLs into the <code className="text-[#FF7A00]">firstComment</code> reply thread, KUIRO eliminates the $0.200 per post API fee imposed on direct link tweets.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="xlink"
                  checked={optimizerConfig.unitEconomics.enforceXLinkInReply}
                  onChange={(e) =>
                    setOptimizerConfig({
                      ...optimizerConfig,
                      unitEconomics: { ...optimizerConfig.unitEconomics, enforceXLinkInReply: e.target.checked },
                    })
                  }
                  className="rounded accent-emerald-500"
                />
                <label htmlFor="xlink" className="text-xs text-slate-200 font-medium">
                  Enforce Link-in-Reply on all automated X broadcasts
                </label>
              </div>
            </div>

            {/* Model Routing */}
            <div className="p-5 rounded-[16px] bg-[#0C111A] border border-white/[0.08] space-y-4">
              <h3 className="font-sora text-sm font-semibold text-white flex items-center gap-2">
                <Cpu size={16} className="text-blue-400" />
                <span>LLM Multi-Model Orchestration</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-inter">
                <div>
                  <label className="block text-slate-300 mb-1">Primary Fast Engine</label>
                  <select
                    value={optimizerConfig.modelRouting.primaryModel}
                    onChange={(e) =>
                      setOptimizerConfig({
                        ...optimizerConfig,
                        modelRouting: { ...optimizerConfig.modelRouting, primaryModel: e.target.value },
                      })
                    }
                    className="w-full bg-[#111722] border border-white/10 rounded-[8px] px-3 py-2 text-white"
                  >
                    <option value="gemini-2.5-flash-lite">Google Gemini 3.5 Flash Lite (Recommended)</option>
                    <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Heavy Reasoning)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">
                    Temperature (Creativity): <strong className="text-white">{optimizerConfig.modelRouting.temperature}</strong>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={optimizerConfig.modelRouting.temperature}
                    onChange={(e) =>
                      setOptimizerConfig({
                        ...optimizerConfig,
                        modelRouting: { ...optimizerConfig.modelRouting, temperature: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-[#FF7A00]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: Provision New Tenant Workspace */}
      {isNewWsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C111A] border border-white/15 rounded-[18px] max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in font-inter text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-sora font-bold text-white">Provision New Tenant Workspace</h3>
              <button onClick={() => setIsNewWsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Clinic / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CareMax Diagnostics & Labs"
                  value={newWsForm.name}
                  onChange={(e) => setNewWsForm({ ...newWsForm, name: e.target.value })}
                  className="w-full bg-[#111722] border border-white/10 rounded-[8px] px-3 py-2 text-white focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Founder / Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Amit Bannerjee"
                    value={newWsForm.ownerName}
                    onChange={(e) => setNewWsForm({ ...newWsForm, ownerName: e.target.value })}
                    className="w-full bg-[#111722] border border-white/10 rounded-[8px] px-3 py-2 text-white focus:outline-none focus:border-[#FF7A00]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Owner Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="amit@caremax.in"
                    value={newWsForm.ownerEmail}
                    onChange={(e) => setNewWsForm({ ...newWsForm, ownerEmail: e.target.value })}
                    className="w-full bg-[#111722] border border-white/10 rounded-[8px] px-3 py-2 text-white focus:outline-none focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Subscription Tier</label>
                  <select
                    value={newWsForm.subscriptionTier}
                    onChange={(e) => setNewWsForm({ ...newWsForm, subscriptionTier: e.target.value })}
                    className="w-full bg-[#111722] border border-white/10 rounded-[8px] px-3 py-2 text-white"
                  >
                    <option value="STARTER">STARTER</option>
                    <option value="GROWTH">GROWTH</option>
                    <option value="AGENCY">AGENCY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">WhatsApp Admin Phone</label>
                  <input
                    type="text"
                    placeholder="+919830012345"
                    value={newWsForm.whatsappAdminPhone}
                    onChange={(e) => setNewWsForm({ ...newWsForm, whatsappAdminPhone: e.target.value })}
                    className="w-full bg-[#111722] border border-white/10 rounded-[8px] px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Industry / Vertical</label>
                <input
                  type="text"
                  placeholder="e.g. Healthcare & Preventive Diagnostics"
                  value={newWsForm.industry}
                  onChange={(e) => setNewWsForm({ ...newWsForm, industry: e.target.value })}
                  className="w-full bg-[#111722] border border-white/10 rounded-[8px] px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewWsModalOpen(false)}
                  className="px-4 py-2 rounded-[8px] bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[8px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-semibold shadow-md"
                >
                  Provision Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Inspect Brand Brain */}
      {selectedWsForInspection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C111A] border border-white/15 rounded-[18px] max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in font-inter text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-sora font-bold text-white">{selectedWsForInspection.name}</h3>
                <span className="text-[11px] text-slate-400">Owner: {selectedWsForInspection.ownerName}</span>
              </div>
              <button onClick={() => setSelectedWsForInspection(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {selectedWsForInspection.brandProfile ? (
              <div className="space-y-3">
                <div className="p-3 rounded-[10px] bg-[#111722] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Industry</span>
                    <span className="text-xs font-semibold text-white">{selectedWsForInspection.brandProfile.industry}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Primary Hex</span>
                    <span className="font-mono text-xs font-bold" style={{ color: selectedWsForInspection.brandProfile.primaryHex }}>
                      {selectedWsForInspection.brandProfile.primaryHex}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-[10px] bg-[#111722] border border-white/5">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Tone & Voice</span>
                  <span className="text-xs text-slate-200 capitalize">
                    {selectedWsForInspection.brandProfile.style.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-xs italic py-4">No brand profile foundation yet configured for this workspace.</p>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedWsForInspection(null)}
                className="px-4 py-2 rounded-[8px] bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Inspect 5-Channel Payloads */}
      {selectedCampaignPosts && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C111A] border border-white/15 rounded-[18px] max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-fade-in font-inter text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-sora font-bold text-white">{selectedCampaignPosts.topicSummary}</h3>
                <span className="text-[11px] text-slate-400">Workspace: {selectedCampaignPosts.workspaceName}</span>
              </div>
              <button onClick={() => setSelectedCampaignPosts(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {selectedCampaignPosts.posts.map((p: any) => (
                <div key={p.id} className="p-3.5 rounded-[12px] bg-[#111722] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase font-mono text-[#FF7A00]">{p.platform} Payload</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Score: {p.aiCriticScore}/100
                    </span>
                  </div>
                  {p.emailSubject && (
                    <p className="text-xs font-semibold text-white">Subject: {p.emailSubject}</p>
                  )}
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-black/20 p-2.5 rounded-[8px]">
                    {p.caption}
                  </p>
                  {p.firstComment && (
                    <div className="text-[11px] text-slate-400 font-mono bg-white/[0.03] p-2 rounded">
                      <strong className="text-slate-300">Link-in-Reply (Zero-Surcharge):</strong> {p.firstComment}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCampaignPosts(null)}
                className="px-4 py-2 rounded-[8px] bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Cultural Milestone */}
      {isNewEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C111A] border border-white/15 rounded-[18px] max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in font-inter text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-sora font-bold text-white">Add Cultural or Sector Milestone</h3>
              <button onClick={() => setIsNewEventModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCalendarEvent} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Milestone Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. World Diabetes Day"
                  value={newEventForm.eventName}
                  onChange={(e) => setNewEventForm({ ...newEventForm, eventName: e.target.value })}
                  className="w-full bg-[#111722] border border-white/10 rounded-[8px] px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Event Date (YYYY-MM-DD) *</label>
                <input
                  type="date"
                  required
                  value={newEventForm.eventDate}
                  onChange={(e) => setNewEventForm({ ...newEventForm, eventDate: e.target.value })}
                  className="w-full bg-[#111722] border border-white/10 rounded-[8px] px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Regions (comma separated)</label>
                  <input
                    type="text"
                    value={newEventForm.regions}
                    onChange={(e) => setNewEventForm({ ...newEventForm, regions: e.target.value })}
                    className="w-full bg-[#111722] border border-white/10 rounded-[8px] px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Industries</label>
                  <input
                    type="text"
                    value={newEventForm.targetIndustries}
                    onChange={(e) => setNewEventForm({ ...newEventForm, targetIndustries: e.target.value })}
                    className="w-full bg-[#111722] border border-white/10 rounded-[8px] px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">AI Prompt Context *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the cultural significance, health context, and festival greeting angle..."
                  value={newEventForm.promptContext}
                  onChange={(e) => setNewEventForm({ ...newEventForm, promptContext: e.target.value })}
                  className="w-full bg-[#111722] border border-white/10 rounded-[8px] px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(false)}
                  className="px-4 py-2 rounded-[8px] bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[8px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-semibold shadow-md"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

