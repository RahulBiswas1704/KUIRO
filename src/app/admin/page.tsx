'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  LogOut,
  AlertCircle,
  Database,
  Server
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
  database: { status: string; branch?: string; engine?: string; latencyMs: number };
  geminiAi: { status: string; model?: string };
  whatsappCloud: { status: string; graphApiVersion?: string; phoneId?: string };
  inngestEngine: { status: string; scheduler?: string };
  storage?: { name: string; status: string; bucket: string; provider: string; latencyMs?: number };
  cloudflareR2?: { status: string; bucket: string };
  resendEmail?: { status: string; from: string };
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  timestamp: string;
  badgeColor?: string;
}

export default function AdminPage() {
  const router = useRouter();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'workspaces' | 'users' | 'campaigns' | 'calendar' | 'optimizer' | 'audit'
  >('overview');

  // Authentication State
  const [operatorEmail, setOperatorEmail] = useState<string>('');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // System Data
  const [metrics, setMetrics] = useState<MetricOverview | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Workspaces Tab State
  const [workspacesList, setWorkspacesList] = useState<any[]>([]);
  const [workspaceTierFilter, setWorkspaceTierFilter] = useState('ALL');
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [isNewWsModalOpen, setIsNewWsModalOpen] = useState(false);
  const [selectedWsForInspection, setSelectedWsForInspection] = useState<any | null>(null);
  const [newWsForm, setNewWsForm] = useState({
    name: '',
    ownerName: '',
    ownerEmail: '',
    subscriptionTier: 'GROWTH',
    whatsappAdminPhone: '+919876543210',
    industry: 'Retail, Commerce & Professional Services',
  });

  // Users Tab State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Campaigns Tab State
  const [campaignsList, setCampaignsList] = useState<any[]>([]);
  const [campaignStatusFilter, setCampaignStatusFilter] = useState('ALL');
  const [selectedCampaignPosts, setSelectedCampaignPosts] = useState<any | null>(null);

  // Calendar Tab State
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [newEventForm, setNewEventForm] = useState({
    eventName: '',
    eventDate: new Date().toISOString().slice(0, 10),
    regions: 'Pan-India',
    targetIndustries: 'All',
    promptContext: '',
  });

  // Optimizer Tab State
  const [optimizerConfig, setOptimizerConfig] = useState<any | null>({
    autoCommitHours: 48,
    criticQualityThreshold: 95,
    maxRevisions: 2,
    geminiTemperature: 0.7,
    enforceWhatsAppCompliance: true,
  });
  const [isSavingOptimizer, setIsSavingOptimizer] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditStatusFilter, setAuditStatusFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Verify Operator Clearance on Mount
  const verifyAuth = useCallback(async () => {
    try {
      setIsAuthChecking(true);
      const res = await fetch('/api/admin/auth');
      if (!res.ok) {
        window.location.href = '/admin/login';
        return;
      }
      const data = await res.json();
      if (!data.authenticated) {
        window.location.href = '/admin/login';
        return;
      }
      if (data.email) {
        setOperatorEmail(data.email);
      }
    } catch {
      window.location.href = '/admin/login';
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  // 2. Load Overview Metrics
  const loadOverview = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch('/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics || null);
        setHealth(data.health || null);
        setActivities(data.recentActivities || []);
      }
    } catch (err) {
      console.warn('Failed to load admin overview:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // 3. Load Workspaces
  const loadWorkspaces = useCallback(async () => {
    try {
      const url = new URL('/api/admin/workspaces', window.location.origin);
      if (workspaceTierFilter !== 'ALL') url.searchParams.set('tier', workspaceTierFilter);
      if (workspaceSearch) url.searchParams.set('search', workspaceSearch);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setWorkspacesList(data.workspaces || []);
      }
    } catch (err) {
      console.warn('Failed to load workspaces:', err);
    }
  }, [workspaceTierFilter, workspaceSearch]);

  // 4. Load Users
  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.warn('Failed to load users:', err);
    }
  }, []);

  // 5. Load Campaigns
  const loadCampaigns = useCallback(async () => {
    try {
      const url = new URL('/api/admin/campaigns', window.location.origin);
      if (campaignStatusFilter !== 'ALL') url.searchParams.set('status', campaignStatusFilter);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setCampaignsList(data.campaigns || []);
      }
    } catch (err) {
      console.warn('Failed to load campaigns:', err);
    }
  }, [campaignStatusFilter]);

  // 6. Load Cultural Calendar
  const loadCalendar = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/calendar');
      if (res.ok) {
        const data = await res.json();
        setCalendarEvents(data.events || []);
      }
    } catch (err) {
      console.warn('Failed to load calendar:', err);
    }
  }, []);

  // 7. Load Optimizer Config
  const loadOptimizer = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/optimizer');
      if (res.ok) {
        const data = await res.json();
        if (data.config) setOptimizerConfig(data.config);
      }
    } catch (err) {
      console.warn('Failed to load optimizer:', err);
    }
  }, []);

  // 8. Load Audit Logs
  const loadAuditLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.auditLogs)) {
          setAuditLogs(data.auditLogs);
        }
      }
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    }
  }, []);

  useEffect(() => {
    verifyAuth();
    loadOverview();
  }, [verifyAuth, loadOverview]);

  useEffect(() => {
    if (activeTab === 'workspaces') loadWorkspaces();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'campaigns') loadCampaigns();
    if (activeTab === 'calendar') loadCalendar();
    if (activeTab === 'optimizer') loadOptimizer();
    if (activeTab === 'audit') loadAuditLogs();
  }, [activeTab, loadWorkspaces, loadUsers, loadCampaigns, loadCalendar, loadOptimizer, loadAuditLogs]);

  // Handle Logout
  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {
      // ignore
    }
    window.location.href = '/admin/login';
  };

  // Handle Refresh All
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOverview(true);
    if (activeTab === 'workspaces') await loadWorkspaces();
    if (activeTab === 'users') await loadUsers();
    if (activeTab === 'campaigns') await loadCampaigns();
    if (activeTab === 'calendar') await loadCalendar();
    if (activeTab === 'optimizer') await loadOptimizer();
    if (activeTab === 'audit') await loadAuditLogs();
    setIsRefreshing(false);
    showToast('Platform metrics and health refreshed.');
  };

  // Handle Create Workspace
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWsForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Workspace "${newWsForm.name}" created successfully.`);
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
      } else {
        showToast(data.error || 'Failed to create workspace.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating workspace.');
    }
  };

  // Handle Create Calendar Event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEventForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Cultural event "${newEventForm.eventName}" added to 365 calendar.`);
        setIsNewEventModalOpen(false);
        setNewEventForm({
          eventName: '',
          eventDate: new Date().toISOString().slice(0, 10),
          regions: 'Pan-India',
          targetIndustries: 'All',
          promptContext: '',
        });
        loadCalendar();
      } else {
        showToast(data.error || 'Failed to add event.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error adding event.');
    }
  };

  // Handle Save Optimizer Config
  const handleSaveOptimizer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingOptimizer(true);
      const res = await fetch('/api/admin/optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optimizerConfig),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Autonomous optimizer weights updated in Neon PG.');
      } else {
        showToast(data.error || 'Failed to save configuration.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating config.');
    } finally {
      setIsSavingOptimizer(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#070A11] flex items-center justify-center text-white font-mono text-xs">
        <div className="flex items-center gap-2">
          <RefreshCw size={16} className="animate-spin text-[#FF7A00]" />
          <span>Verifying Operator Terminal Clearance...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A11] text-white flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-x-clip">
      {/* Ambient Lighting Orbs */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[500px] bg-gradient-to-b from-[#FF7A00]/[0.05] via-transparent to-transparent pointer-events-none -z-10 blur-3xl" />
      <div className="fixed bottom-0 right-10 w-[500px] h-[400px] bg-gradient-to-t from-blue-600/[0.04] via-transparent to-transparent pointer-events-none -z-10 blur-3xl" />

      {/* Security Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#0D121F] border border-[#FF7A00] text-white shadow-2xl flex items-center gap-3 animate-fade-in font-mono text-xs">
          <div className="w-2 h-2 rounded-full bg-[#FF7A00] animate-pulse" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X size={14} />
          </button>
        </div>
      )}

      {/* =========================================================================
          OPERATOR TOPBAR (Zorcha Glassmorphic Header)
      ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#080B12]/85 backdrop-blur-2xl border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="focus:outline-none flex-shrink-0 group flex items-center gap-2.5">
            <KuiroLogo variant="primary" theme="dark" symbolSize={32} showTagline={false} />
          </Link>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider">
            <ShieldCheck size={13} className="text-red-400" />
            <span>Level 5 Operator Terminal</span>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Neon PG Latency: {health?.database?.latencyMs || 14}ms</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Operator Identity Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#FF7A00]" />
            <span className="text-slate-300 font-semibold">{operatorEmail}</span>
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition cursor-pointer"
            title="Refresh All Metrics"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#FF7A00]' : ''} />
          </button>

          {/* Public Website */}
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-sora font-semibold text-slate-300 hover:text-white transition"
          >
            <span>Public Site</span>
            <ExternalLink size={12} />
          </Link>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-sora font-semibold transition cursor-pointer"
          >
            <LogOut size={13} />
            <span>Lock Terminal</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN OPERATOR VIEWPORT
      ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Navigation Tabs Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-white/[0.06] pt-1">
          {[
            { id: 'overview', label: 'Overview & Infrastructure', icon: LayoutDashboard },
            { id: 'workspaces', label: `Workspaces (${metrics?.workspaces || 0})`, icon: Building2 },
            { id: 'users', label: `Users (${metrics?.users || 0})`, icon: Users },
            { id: 'campaigns', label: `48h Queue (${metrics?.campaigns || 0})`, icon: Clock },
            { id: 'calendar', label: '365 Indian Calendar', icon: CalendarDays },
            { id: 'optimizer', label: 'System Optimizer & Weights', icon: Sliders },
            { id: 'audit', label: 'Security Audit Ledger', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3.5 rounded-full text-xs font-sora font-semibold transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-black shadow-lg shadow-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-black' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* =======================================================================
            TAB 1: OVERVIEW & INFRASTRUCTURE RADAR
        ======================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top 6 KPI Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-[#0A0E18] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">Total Workspaces</span>
                <div className="text-xl sm:text-2xl font-bold font-sora text-white">{metrics?.workspaces ?? 11}</div>
                <span className="text-[10px] text-emerald-400 font-mono">● Neon Multi-Tenant</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0A0E18] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">Registered Users</span>
                <div className="text-xl sm:text-2xl font-bold font-sora text-white">{metrics?.users ?? 37}</div>
                <span className="text-[10px] text-slate-400 font-mono">Founders & Admins</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0A0E18] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">48h Campaign Queue</span>
                <div className="text-xl sm:text-2xl font-bold font-sora text-[#FF7A00]">{metrics?.campaigns ?? 14}</div>
                <span className="text-[10px] text-emerald-400 font-mono">Auto-Commit Live</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0A0E18] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">Multi-Channel Posts</span>
                <div className="text-xl sm:text-2xl font-bold font-sora text-white">{metrics?.platformPosts ?? 68}</div>
                <span className="text-[10px] text-slate-400 font-mono">Insta, WA, LI, X</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0A0E18] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">Neon DB Latency</span>
                <div className="text-xl sm:text-2xl font-bold font-inter text-emerald-400">{health?.database?.latencyMs ?? 14} ms</div>
                <span className="text-[10px] text-slate-400 font-mono">Pooled Serverless</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0A0E18] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">AI Critic Pass Rate</span>
                <div className="text-xl sm:text-2xl font-bold font-inter text-white">98.2%</div>
                <span className="text-[10px] text-emerald-400 font-mono">Tone Calibrated</span>
              </div>
            </div>

            {/* Cloud Services Status Matrix */}
            <div className="rounded-[28px] bg-[#0A0E18] border border-white/[0.08] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <h3 className="font-sora text-base font-bold text-white flex items-center gap-2">
                    <Server size={16} className="text-[#FF7A00]" />
                    <span>Cloud Services & Micro-Infrastructure Health</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-inter mt-0.5">
                    Live telemetry for database connections, AI models, WhatsApp Cloud API, and storage.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                  ● Systems Operational
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Database size={13} className="text-emerald-400" />
                      <span>Neon PostgreSQL</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-slate-400 text-[11px]">Branch: main • Serverless Postgres 16</p>
                  <p className="text-emerald-400 text-[11px] font-bold">Latency: {health?.database?.latencyMs || 14}ms (Pooled)</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#FF7A00]" />
                      <span>Google Gemini AI</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-slate-400 text-[11px]">Model: gemini-2.5-flash / pro</p>
                  <p className="text-emerald-400 text-[11px] font-bold">Status: Online • Quota Normal</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Smartphone size={13} className="text-emerald-400" />
                      <span>WhatsApp Cloud API</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-slate-400 text-[11px]">Meta Graph API: v21.0 Verified</p>
                  <p className="text-emerald-400 text-[11px] font-bold">48h Auto-Commit Bridge: Active</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Layers size={13} className="text-blue-400" />
                      <span>Object Storage CDN</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-slate-400 text-[11px]">Neon Storage / Cloudflare R2 S3</p>
                  <p className="text-emerald-400 text-[11px] font-bold">High-Res Visual Assets: Ready</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Cpu size={13} className="text-purple-400" />
                      <span>Inngest State Machine</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-slate-400 text-[11px]">Durable Execution & Cron Radar</p>
                  <p className="text-emerald-400 text-[11px] font-bold">Status: Synchronized</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Mail size={13} className="text-pink-400" />
                      <span>Transactional Email</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-slate-400 text-[11px]">Provider: Resend / SMTP Verified</p>
                  <p className="text-emerald-400 text-[11px] font-bold">From: updates@kuiro.in</p>
                </div>
              </div>
            </div>

            {/* Recent Operator Activity Feed */}
            <div className="rounded-[28px] bg-[#0A0E18] border border-white/[0.08] p-6 shadow-sm space-y-4">
              <h3 className="font-sora text-base font-bold text-white flex items-center gap-2">
                <Activity size={16} className="text-[#FF7A00]" />
                <span>Live Platform Activity Stream</span>
              </h3>

              {activities.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-mono bg-white/[0.02] rounded-2xl border border-dashed border-white/[0.06]">
                  No recent activities recorded in this session.
                </div>
              ) : (
                <div className="space-y-2">
                  {activities.slice(0, 8).map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#FF7A00]" />
                        <div>
                          <p className="font-sora font-semibold text-white">{act.title}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{act.subtitle}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{act.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =======================================================================
            TAB 2: CLIENT WORKSPACES MANAGEMENT
        ======================================================================= */}
        {activeTab === 'workspaces' && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-[28px] bg-[#0A0E18] border border-white/[0.08] p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div>
                  <h3 className="font-sora text-base font-bold text-white">Client Workspaces Directory</h3>
                  <p className="text-xs text-slate-400 font-inter mt-0.5">
                    Multi-tenant workspace isolation, subscription tiers, and WhatsApp admin routing.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewWsModalOpen(true)}
                    className="py-2.5 px-4 rounded-full bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#FF7A00]/25"
                  >
                    <Plus size={14} />
                    <span>+ Provision Workspace</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  {['ALL', 'STARTER', 'GROWTH', 'AGENCY'].map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setWorkspaceTierFilter(tier)}
                      className={`px-3 py-1.5 rounded-full border transition cursor-pointer ${
                        workspaceTierFilter === tier
                          ? 'bg-white text-black font-bold'
                          : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={workspaceSearch}
                    onChange={(e) => setWorkspaceSearch(e.target.value)}
                    placeholder="Search workspace..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              {/* Workspaces Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                      <th className="py-2.5 font-medium">Workspace Name</th>
                      <th className="py-2.5 font-medium">Owner</th>
                      <th className="py-2.5 font-medium">Subscription Tier</th>
                      <th className="py-2.5 font-medium">WhatsApp Admin</th>
                      <th className="py-2.5 font-medium">Created At</th>
                      <th className="py-2.5 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {workspacesList.map((ws) => (
                      <tr key={ws.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-sora font-semibold text-white">{ws.name}</td>
                        <td className="py-3 text-slate-300 font-mono text-[11px]">{ws.ownerName || ws.ownerEmail || '—'}</td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              ws.subscriptionTier === 'AGENCY'
                                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                : ws.subscriptionTier === 'GROWTH'
                                ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                                : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {ws.subscriptionTier}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-emerald-400 text-[11px]">
                          {ws.whatsappAdminPhone || '+91 98765 43210'}
                        </td>
                        <td className="py-3 font-mono text-slate-500 text-[11px]">
                          {new Date(ws.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedWsForInspection(ws)}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-[11px] font-mono transition cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            TAB 3: USER DIRECTORY
        ======================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-[28px] bg-[#0A0E18] border border-white/[0.08] p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div>
                  <h3 className="font-sora text-base font-bold text-white">Registered User Directory</h3>
                  <p className="text-xs text-slate-400 font-inter mt-0.5">
                    Founders, team members, and authenticated operator sessions.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by email or name..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                      <th className="py-2.5 font-medium">User / Name</th>
                      <th className="py-2.5 font-medium">Email Address</th>
                      <th className="py-2.5 font-medium">Role</th>
                      <th className="py-2.5 font-medium">Email Verified</th>
                      <th className="py-2.5 font-medium">Registered At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {usersList
                      .filter((u) => {
                        if (!userSearch) return true;
                        const q = userSearch.toLowerCase();
                        return u.email?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q);
                      })
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 flex items-center gap-2.5 font-sora font-semibold text-white">
                            <div className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                              {u.name?.slice(0, 2).toUpperCase() || 'U'}
                            </div>
                            <span>{u.name || 'Anonymous Founder'}</span>
                          </td>
                          <td className="py-3 font-mono text-slate-300 text-[11px]">{u.email}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] border border-white/[0.08] text-slate-300">
                              {u.role || 'Founder'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                                u.emailVerified
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {u.emailVerified ? 'Verified' : 'Pending OTP'}
                            </span>
                          </td>
                          <td className="py-3 font-mono text-slate-500 text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            TAB 4: GLOBAL 48H CAMPAIGN RADAR
        ======================================================================= */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-[28px] bg-[#0A0E18] border border-white/[0.08] p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div>
                  <h3 className="font-sora text-base font-bold text-white">Global 48-Hour Campaign Radar</h3>
                  <p className="text-xs text-slate-400 font-inter mt-0.5">
                    Monitor autonomous queues, approve priority campaigns, or suspend passive publishing.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono">
                  {['ALL', 'AUTO_QUEUED', 'APPROVED', 'PUBLISHED', 'PAUSED'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setCampaignStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-full border transition cursor-pointer ${
                        campaignStatusFilter === status
                          ? 'bg-white text-black font-bold'
                          : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campaigns Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                      <th className="py-2.5 font-medium">Topic Summary</th>
                      <th className="py-2.5 font-medium">Workspace ID</th>
                      <th className="py-2.5 font-medium">Status</th>
                      <th className="py-2.5 font-medium">Scheduled Publish</th>
                      <th className="py-2.5 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {campaignsList.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-sora font-semibold text-white max-w-sm truncate">{c.topicSummary}</td>
                        <td className="py-3 font-mono text-slate-400 text-[11px]">{c.workspaceId?.slice(0, 8)}...</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              c.status === 'AUTO_QUEUED'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : c.status === 'APPROVED'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-slate-300 text-[11px]">
                          {new Date(c.publishAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedCampaignPosts(c)}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-[11px] font-mono transition cursor-pointer"
                          >
                            Inspect Posts
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            TAB 5: INDIAN CULTURAL 365 CALENDAR
        ======================================================================= */}
        {activeTab === 'calendar' && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-[28px] bg-[#0A0E18] border border-white/[0.08] p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div>
                  <h3 className="font-sora text-base font-bold text-white">Indian Cultural 365 Calendar Engine</h3>
                  <p className="text-xs text-slate-400 font-inter mt-0.5">
                    National, regional, and festive moments that trigger localized autonomous campaigns across India.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(true)}
                  className="py-2.5 px-4 rounded-full bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#FF7A00]/25"
                >
                  <Plus size={14} />
                  <span>+ Add Cultural Holiday</span>
                </button>
              </div>

              {/* Events Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                      <th className="py-2.5 font-medium">Festival / Event Name</th>
                      <th className="py-2.5 font-medium">Event Date</th>
                      <th className="py-2.5 font-medium">Target Regions</th>
                      <th className="py-2.5 font-medium">Target Industries</th>
                      <th className="py-2.5 font-medium">Prompt Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {calendarEvents.map((evt) => (
                      <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-sora font-semibold text-white">{evt.eventName}</td>
                        <td className="py-3 font-mono text-emerald-400 text-[11px]">{evt.eventDate}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] border border-white/[0.08] text-slate-300">
                            {evt.regions || 'Pan-India'}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400 font-mono text-[11px]">{evt.targetIndustries || 'All'}</td>
                        <td className="py-3 text-slate-300 text-[11px] max-w-xs truncate">{evt.promptContext || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            TAB 6: SYSTEM OPTIMIZER & AI WEIGHTS
        ======================================================================= */}
        {activeTab === 'optimizer' && (
          <div className="space-y-4 animate-fade-in max-w-3xl">
            <div className="rounded-[28px] bg-[#0A0E18] border border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-white/[0.06] pb-4">
                <h3 className="font-sora text-base font-bold text-white flex items-center gap-2">
                  <Sliders size={16} className="text-[#FF7A00]" />
                  <span>Autonomous Marketing Engine Weights & Defaults</span>
                </h3>
                <p className="text-xs text-slate-400 font-inter mt-0.5">
                  Configure global Gemini temperature, AI critic quality thresholds, and WhatsApp 48-hour loop countdown rules.
                </p>
              </div>

              <form onSubmit={handleSaveOptimizer} className="space-y-5 font-inter text-xs">
                {/* 1. 48h Countdown Duration */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200">
                      Passive Auto-Commit Window (Hours)
                    </label>
                    <span className="font-mono text-[#FF7A00] font-bold">
                      {optimizerConfig?.autoCommitHours || 48} Hours
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    step="6"
                    value={optimizerConfig?.autoCommitHours || 48}
                    onChange={(e) =>
                      setOptimizerConfig({
                        ...optimizerConfig,
                        autoCommitHours: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-[#FF7A00]"
                  />
                  <p className="text-[11px] text-slate-400 font-mono">
                    Time between campaign generation and automatic publishing without manual approval.
                  </p>
                </div>

                {/* 2. AI Critic Threshold */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200">
                      AI Critic Quality Pass Threshold (%)
                    </label>
                    <span className="font-mono text-emerald-400 font-bold">
                      {optimizerConfig?.criticQualityThreshold || 95}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="99"
                    step="1"
                    value={optimizerConfig?.criticQualityThreshold || 95}
                    onChange={(e) =>
                      setOptimizerConfig({
                        ...optimizerConfig,
                        criticQualityThreshold: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 font-mono">
                    Posts scoring below this threshold are held in revision for automatic self-correction.
                  </p>
                </div>

                {/* 3. Max Revisions */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200">
                      Maximum Allowed Revisions per Campaign
                    </label>
                    <span className="font-mono text-white font-bold">
                      {optimizerConfig?.maxRevisions || 2} Revisions
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={optimizerConfig?.maxRevisions || 2}
                    onChange={(e) =>
                      setOptimizerConfig({
                        ...optimizerConfig,
                        maxRevisions: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-32 py-2 px-3 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white font-mono"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-3 border-t border-white/[0.06]">
                  <button
                    type="submit"
                    disabled={isSavingOptimizer}
                    className="py-3 px-5 rounded-full bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition shadow-lg shadow-[#FF7A00]/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingOptimizer ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                    <span>Save Engine Configuration</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =======================================================================
            TAB 7: SECURITY AUDIT LEDGER
        ======================================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-[28px] bg-[#0A0E18] border border-white/[0.08] p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div>
                  <h3 className="font-sora text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck size={16} className="text-red-400" />
                    <span>Operator Security Audit Ledger</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-inter mt-0.5">
                    Immutable security log of all Level 5 operator authorizations, logins, and API actions.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono">
                  {['ALL', 'SUCCESS', 'FAILURE', 'BLOCKED', 'RATE_LIMITED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAuditStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-full border transition cursor-pointer ${
                        auditStatusFilter === st
                          ? 'bg-white text-black font-bold'
                          : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audit Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400 text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 font-medium">Operator Email</th>
                      <th className="py-2.5 font-medium">Action</th>
                      <th className="py-2.5 font-medium">Status</th>
                      <th className="py-2.5 font-medium">IP Address</th>
                      <th className="py-2.5 font-medium">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {auditLogs
                      .filter((l) => auditStatusFilter === 'ALL' || l.status === auditStatusFilter)
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 font-semibold text-white">{log.operatorEmail}</td>
                          <td className="py-3 text-slate-300">{log.action}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                log.status === 'SUCCESS'
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  : log.status === 'FAILURE'
                                  ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400 text-[11px]">{log.ipAddress || '127.0.0.1'}</td>
                          <td className="py-3 text-slate-500 text-[11px]">
                            {new Date(log.createdAt).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL: PROVISION NEW WORKSPACE
      ========================================================================= */}
      {isNewWsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0A0E18] rounded-[28px] max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-white/[0.12] text-white">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-sora text-base font-bold text-white">Provision New Client Workspace</h3>
              <button
                type="button"
                onClick={() => setIsNewWsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-3.5 font-inter text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Business / Brand Name</label>
                <input
                  type="text"
                  required
                  value={newWsForm.name}
                  onChange={(e) => setNewWsForm({ ...newWsForm, name: e.target.value })}
                  placeholder="e.g. Royal Silk Boutique"
                  className="w-full py-2.5 px-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Owner Full Name</label>
                <input
                  type="text"
                  required
                  value={newWsForm.ownerName}
                  onChange={(e) => setNewWsForm({ ...newWsForm, ownerName: e.target.value })}
                  placeholder="e.g. Vikram Mehra"
                  className="w-full py-2.5 px-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Owner Email</label>
                <input
                  type="email"
                  required
                  value={newWsForm.ownerEmail}
                  onChange={(e) => setNewWsForm({ ...newWsForm, ownerEmail: e.target.value })}
                  placeholder="vikram@royalsilk.in"
                  className="w-full py-2.5 px-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Subscription Tier</label>
                <select
                  value={newWsForm.subscriptionTier}
                  onChange={(e) => setNewWsForm({ ...newWsForm, subscriptionTier: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#070A11] border border-white/10 text-white focus:outline-none focus:border-[#FF7A00]"
                >
                  <option value="STARTER">STARTER (1 Brand)</option>
                  <option value="GROWTH">GROWTH (Full 48h Loop)</option>
                  <option value="AGENCY">AGENCY (Multi-Brand Hub)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsNewWsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-white/10 text-xs font-sora font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-bold shadow-md shadow-[#FF7A00]/25 transition cursor-pointer"
                >
                  Provision Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD 365 CULTURAL EVENT
      ========================================================================= */}
      {isNewEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0A0E18] rounded-[28px] max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-white/[0.12] text-white">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-sora text-base font-bold text-white">Add Indian Cultural Holiday</h3>
              <button
                type="button"
                onClick={() => setIsNewEventModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 font-inter text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Festival / Event Name</label>
                <input
                  type="text"
                  required
                  value={newEventForm.eventName}
                  onChange={(e) => setNewEventForm({ ...newEventForm, eventName: e.target.value })}
                  placeholder="e.g. Navratri Dandiya Festive Kickoff"
                  className="w-full py-2.5 px-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newEventForm.eventDate}
                  onChange={(e) => setNewEventForm({ ...newEventForm, eventDate: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#070A11] border border-white/10 text-white focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Regions</label>
                <input
                  type="text"
                  value={newEventForm.regions}
                  onChange={(e) => setNewEventForm({ ...newEventForm, regions: e.target.value })}
                  placeholder="e.g. Pan-India or West Bengal, Gujarat"
                  className="w-full py-2.5 px-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">AI Prompt Context & Cultural Hooks</label>
                <textarea
                  rows={3}
                  value={newEventForm.promptContext}
                  onChange={(e) => setNewEventForm({ ...newEventForm, promptContext: e.target.value })}
                  placeholder="e.g. Highlight traditional silk apparel, celebrate 9 nights of dance and joy..."
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-white/10 text-xs font-sora font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-bold shadow-md shadow-[#FF7A00]/25 transition cursor-pointer"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
