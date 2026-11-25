'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  Clock,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Users,
  X,
} from 'lucide-react';
import KuiroLogo from '@/components/brand/KuiroLogo';
import KuiroLoader from '@/components/brand/KuiroLoader';
import {
  AdminAuditTab,
  AdminCalendarTab,
  AdminCampaignsTab,
  AdminOptimizerTab,
  AdminOverviewPanel,
  AdminUsersTab,
  AdminWorkspacesTab,
  InspectCampaignModal,
  InspectWorkspaceModal,
  NewCalendarEventModal,
  NewWorkspaceModal,
  type ActivityItem,
  type AdminAlert,
  type AdminAuditLog,
  type AdminCalendarEvent,
  type AdminCampaign,
  type AdminOptimizerConfig,
  type AdminTabId,
  type AdminUser,
  type AdminWorkspace,
  type MetricOverview,
  type OptimizerEnvironmentKeys,
  type SystemHealth,
} from '@/components/admin';

const DEFAULT_OPTIMIZER_CONFIG: AdminOptimizerConfig = {
  aiCritic: {
    minimumPassScore: 85,
    hookWeight: 25,
    brandAlignmentWeight: 35,
    ctaWeight: 20,
    complianceWeight: 20,
    strictNegativeConstraints: true,
  },
  modelRouting: {
    primaryModel: 'gemini-2.5-flash-lite',
    fallbackModel: 'gemini-2.5-pro',
    temperature: 0.7,
    maxOutputTokens: 2048,
    frequencyPenalty: 0.2,
  },
  unitEconomics: {
    enforceXLinkInReply: true,
    estimatedMonthlySavingsUsd: 1420,
    aspectRatioRule: '4:5 on mobile feeds, 1:1 on messaging cards',
  },
  autonomousEngine: {
    autoCommitWindowHours: 48,
    maxFreeRevisions: 2,
    radarSweepFrequencyCron: '0 0 * * *',
    voiceTranscriptionEngine: 'Gemini Whisper Multi-Lingual',
  },
};

const EMPTY_WS_FORM = {
  name: '',
  ownerName: '',
  ownerEmail: '',
  subscriptionTier: 'GROWTH',
  whatsappAdminPhone: '+919876543210',
  industry: 'Retail, Commerce & Professional Services',
};

function createEmptyEventForm() {
  return {
    eventName: '',
    eventDate: new Date().toISOString().slice(0, 10),
    regions: 'Pan-India',
    targetIndustries: 'All',
    promptContext: '',
  };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');

  // Authentication State
  const [operatorEmail, setOperatorEmail] = useState<string>('');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [usingDefaultCredentials, setUsingDefaultCredentials] = useState(false);

  // Overview Telemetry & Alerts
  const [metrics, setMetrics] = useState<MetricOverview | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [updatingAlertId, setUpdatingAlertId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Workspaces Tab
  const [workspacesList, setWorkspacesList] = useState<AdminWorkspace[]>([]);
  const [workspaceTierFilter, setWorkspaceTierFilter] = useState('ALL');
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [isNewWsModalOpen, setIsNewWsModalOpen] = useState(false);
  const [selectedWsForInspection, setSelectedWsForInspection] = useState<AdminWorkspace | null>(null);
  const [newWsForm, setNewWsForm] = useState(EMPTY_WS_FORM);

  // Users Tab
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Campaigns Tab
  const [campaignsList, setCampaignsList] = useState<AdminCampaign[]>([]);
  const [campaignStatusFilter, setCampaignStatusFilter] = useState('ALL');
  const [selectedCampaignPosts, setSelectedCampaignPosts] = useState<AdminCampaign | null>(null);

  // Cultural Calendar Tab
  const [calendarEvents, setCalendarEvents] = useState<AdminCalendarEvent[]>([]);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isRunningSweep, setIsRunningSweep] = useState(false);
  const [newEventForm, setNewEventForm] = useState(createEmptyEventForm);

  // Optimizer Tab
  const [optimizerConfig, setOptimizerConfig] = useState<AdminOptimizerConfig>(
    DEFAULT_OPTIMIZER_CONFIG
  );
  const [optimizerEnvKeys, setOptimizerEnvKeys] = useState<OptimizerEnvironmentKeys | null>(null);
  const [isSavingOptimizer, setIsSavingOptimizer] = useState(false);

  // Security Audit Ledger Tab
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [auditStatusFilter, setAuditStatusFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

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
      if (data.email) setOperatorEmail(data.email);
      setUsingDefaultCredentials(Boolean(data.usingDefaultCredentials));
    } catch {
      window.location.href = '/admin/login';
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  const loadOverviewAndAlerts = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [overviewRes, alertsRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/alerts?limit=25'),
      ]);
      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setMetrics(data.metrics || null);
        setHealth(data.health || null);
        setActivities(data.recentActivities || []);
      }
      if (alertsRes.ok) {
        const alertData = await alertsRes.json();
        setAlerts(alertData.alerts || []);
      }
    } catch (err) {
      console.warn('Failed to load admin overview:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

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

  const loadOptimizer = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/optimizer');
      if (res.ok) {
        const data = await res.json();
        if (data.config) setOptimizerConfig(data.config);
        if (data.environmentKeys) setOptimizerEnvKeys(data.environmentKeys);
      }
    } catch (err) {
      console.warn('Failed to load optimizer:', err);
    }
  }, []);

  const loadAuditLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/audit-logs?limit=100');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(Array.isArray(data.logs) ? data.logs : []);
      }
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    }
  }, []);

  useEffect(() => {
    verifyAuth();
    loadOverviewAndAlerts();
  }, [verifyAuth, loadOverviewAndAlerts]);

  useEffect(() => {
    if (activeTab === 'workspaces') loadWorkspaces();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'campaigns') loadCampaigns();
    if (activeTab === 'calendar') loadCalendar();
    if (activeTab === 'optimizer') loadOptimizer();
    if (activeTab === 'audit') loadAuditLogs();
  }, [
    activeTab,
    loadWorkspaces,
    loadUsers,
    loadCampaigns,
    loadCalendar,
    loadOptimizer,
    loadAuditLogs,
  ]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {
      // Ignore error and redirect to operator gate
    }
    window.location.href = '/admin/login';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOverviewAndAlerts(true);
    if (activeTab === 'workspaces') await loadWorkspaces();
    if (activeTab === 'users') await loadUsers();
    if (activeTab === 'campaigns') await loadCampaigns();
    if (activeTab === 'calendar') await loadCalendar();
    if (activeTab === 'optimizer') await loadOptimizer();
    if (activeTab === 'audit') await loadAuditLogs();
    setIsRefreshing(false);
    showToast('Platform telemetry and active view refreshed.');
  };

  const handleUpdateAlertStatus = async (
    alertId: string,
    status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
  ) => {
    try {
      setUpdatingAlertId(alertId);
      const res = await fetch('/api/admin/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId, status }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, status: data.alert?.status || status } : a))
        );
        showToast(`Alert marked ${status.toLowerCase()}.`);
      } else {
        showToast(data.error || 'Failed to update alert status.');
      }
    } catch {
      showToast('Network error updating alert.');
    } finally {
      setUpdatingAlertId(null);
    }
  };

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
        setNewWsForm(EMPTY_WS_FORM);
        await Promise.all([loadWorkspaces(), loadOverviewAndAlerts(true)]);
      } else {
        showToast(data.error || 'Failed to create workspace.');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error creating workspace.');
    }
  };

  const handleUpdateWorkspace = async (payload: {
    id: string;
    name: string;
    subscriptionTier: string;
    whatsappAdminPhone: string;
  }) => {
    try {
      const res = await fetch('/api/admin/workspaces', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Workspace updated successfully.');
        setSelectedWsForInspection(null);
        await loadWorkspaces();
      } else {
        showToast(data.error || 'Failed to update workspace.');
      }
    } catch {
      showToast('Error updating workspace.');
    }
  };

  const handleDeleteWorkspace = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/workspaces?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Workspace deleted.');
        setSelectedWsForInspection(null);
        await Promise.all([loadWorkspaces(), loadOverviewAndAlerts(true)]);
      } else {
        showToast(data.error || 'Failed to delete workspace.');
      }
    } catch {
      showToast('Error deleting workspace.');
    }
  };

  const handleToggleUserVerified = async (user: AdminUser) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, emailVerified: !user.emailVerified }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Updated verification for ${user.email}.`);
        await loadUsers();
      } else {
        showToast(data.error || 'Failed to update user.');
      }
    } catch {
      showToast('Error updating user verification.');
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`User ${user.email} removed.`);
        await Promise.all([loadUsers(), loadOverviewAndAlerts(true)]);
      } else {
        showToast(data.error || 'Failed to delete user.');
      }
    } catch {
      showToast('Error deleting user.');
    }
  };

  const handleUpdateCampaignStatus = async (id: string, status: 'APPROVED' | 'PAUSED') => {
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Campaign updated to ${status}.`);
        setSelectedCampaignPosts(null);
        await loadCampaigns();
      } else {
        showToast(data.error || 'Failed to update campaign.');
      }
    } catch {
      showToast('Error updating campaign status.');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/campaigns?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Campaign removed.');
        setSelectedCampaignPosts(null);
        await Promise.all([loadCampaigns(), loadOverviewAndAlerts(true)]);
      } else {
        showToast(data.error || 'Failed to remove campaign.');
      }
    } catch {
      showToast('Error removing campaign.');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const regionsArray = newEventForm.regions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const industriesArray = newEventForm.targetIndustries
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/admin/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: newEventForm.eventName,
          eventDate: newEventForm.eventDate,
          regions: regionsArray.length > 0 ? regionsArray : ['Pan-India'],
          targetIndustries: industriesArray.length > 0 ? industriesArray : ['All'],
          promptContext: newEventForm.promptContext,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Cultural event "${newEventForm.eventName}" added.`);
        setIsNewEventModalOpen(false);
        setNewEventForm(createEmptyEventForm());
        await Promise.all([loadCalendar(), loadOverviewAndAlerts(true)]);
      } else {
        showToast(data.error || 'Failed to add event.');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error adding event.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/calendar?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Calendar event removed.');
        await loadCalendar();
      } else {
        showToast(data.error || 'Failed to remove event.');
      }
    } catch {
      showToast('Error deleting event.');
    }
  };

  const handleTriggerSweep = async () => {
    try {
      setIsRunningSweep(true);
      const res = await fetch('/api/admin/calendar/sweep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'all' }),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        showToast('Autonomous cultural & campaign sweep executed.');
        await Promise.all([loadCalendar(), loadOverviewAndAlerts(true)]);
      } else {
        showToast(data.error || 'Radar sweep returned a warning.');
      }
    } catch {
      showToast('Network error executing sweep.');
    } finally {
      setIsRunningSweep(false);
    }
  };

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
        if (data.config) setOptimizerConfig(data.config);
        showToast('System optimizer weights updated for active runtime.');
      } else {
        showToast(data.error || 'Failed to save configuration.');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating config.');
    } finally {
      setIsSavingOptimizer(false);
    }
  };

  if (isAuthChecking) {
    return <KuiroLoader variant="fullscreen" mode="loop" theme="light" />;
  }

  const openAlertsCount = alerts.filter((a) => a.status === 'OPEN').length;

  const navTabs: Array<{ id: AdminTabId; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
    { id: 'overview', label: 'Overview & Telemetry', icon: LayoutDashboard },
    { id: 'workspaces', label: `Workspaces (${metrics?.workspaces ?? '—'})`, icon: Building2 },
    { id: 'users', label: `Users (${metrics?.users ?? '—'})`, icon: Users },
    { id: 'campaigns', label: `48h Queue (${metrics?.campaigns ?? '—'})`, icon: Clock },
    { id: 'calendar', label: '365 Calendar', icon: CalendarDays },
    { id: 'optimizer', label: 'Optimizer & Weights', icon: Sliders },
    { id: 'audit', label: 'Security Audit', icon: ShieldCheck },
  ];

  const kpiCards = [
    {
      label: 'Workspaces',
      value: metrics ? String(metrics.workspaces) : '—',
      meta: 'Multi-tenant orgs',
      accent: 'text-[#0B0F14]',
    },
    {
      label: 'Registered Users',
      value: metrics ? String(metrics.users) : '—',
      meta: 'Founders & seats',
      accent: 'text-[#0B0F14]',
    },
    {
      label: '48h Queue',
      value: metrics ? String(metrics.campaigns) : '—',
      meta: 'Auto-commit loop',
      accent: 'text-[#FF7A00]',
    },
    {
      label: 'Platform Posts',
      value: metrics ? String(metrics.platformPosts) : '—',
      meta: `${metrics?.brandProfiles ?? '—'} Brand Brains`,
      accent: 'text-[#0B0F14]',
    },
    {
      label: 'DB Latency',
      value: health?.database?.latencyMs !== undefined ? `${health.database.latencyMs} ms` : '—',
      meta: 'Pooled Neon PG',
      accent: 'text-emerald-700',
    },
    {
      label: 'Open Alerts',
      value: String(openAlertsCount),
      meta: `${metrics?.activeSessions ?? '—'} active sessions`,
      accent: openAlertsCount > 0 ? 'text-rose-600' : 'text-emerald-700',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFD] text-[#0B0F14] flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-x-clip">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#0B0F14] border border-[#FF8E3C]/60 text-white shadow-2xl flex items-center gap-3 animate-fade-in font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-pulse" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="cursor-pointer text-slate-400 hover:text-white ml-2"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* =========================================================================
          FROSTED GLASSMORPHIC OPERATOR TOPBAR
      ========================================================================= */}
      <header className="fixed left-0 right-0 top-3.5 z-40 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3 border border-white/80 bg-white/70 backdrop-blur-2xl backdrop-saturate-[1.8] ring-1 ring-black/[0.05] shadow-[0_18px_42px_-14px_rgba(11,15,20,0.18),inset_0_1px_1.5px_rgba(255,255,255,0.95)] flex items-center justify-between gap-3">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
          />

          <div className="relative z-10 flex items-center gap-3 flex-wrap">
            <Link href="/admin" className="focus:outline-none flex items-center flex-shrink-0">
              <KuiroLogo variant="primary" theme="light" symbolSize={30} showTagline={false} />
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-700 text-[10px] font-mono font-bold uppercase tracking-wider">
              <ShieldCheck size={12} />
              <span>Level 5 Operator</span>
            </span>

            {health?.database?.latencyMs !== undefined && (
              <span className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[10px] font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Neon PG {health.database.latencyMs}ms</span>
              </span>
            )}
          </div>

          <div className="relative z-10 flex items-center gap-2">
            {operatorEmail && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-white/80 text-[11px] font-mono text-[#374151]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
                <span className="font-semibold">{operatorEmail}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleRefresh}
              className="cursor-pointer p-2 rounded-full bg-white/75 hover:bg-white border border-white/85 text-[#374151] hover:text-[#0B0F14] transition shadow-sm"
              title="Refresh All Telemetry"
              aria-label="Refresh All Telemetry"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#FF7A00]' : ''} />
            </button>

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/75 hover:bg-white border border-white/85 text-xs font-sora font-semibold text-[#0B0F14] transition shadow-sm"
            >
              <span>Public Site</span>
              <ExternalLink size={12} />
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0B0F14] hover:bg-[#1E2532] text-white text-xs font-sora font-semibold transition shadow-sm"
            >
              <LogOut size={13} className="text-[#FF7A00]" />
              <span className="hidden xs:inline">Lock Terminal</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* =========================================================================
            FRAMED DUSK HORIZON COMMAND HEADER + PILL TAB DOCK
        ========================================================================= */}
        <section className="relative bg-gradient-to-b from-[#667387] via-[#465163] to-[#232A38] rounded-b-[28px] sm:rounded-b-[44px] pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[780px] h-[300px] rounded-full bg-[#FF7A00]/22 blur-[115px]"
          />

          <div className="relative z-10 max-w-7xl mx-auto space-y-5 text-left">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[11px] text-white/95 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
                  <span>Level 5 Restricted • Platform Operations Console</span>
                </div>

                <h1 className="font-sora text-2xl sm:text-4xl font-extrabold tracking-[-0.03em] text-white leading-tight">
                  KUIRO Control Plane
                </h1>
              </div>

              <p className="text-xs sm:text-sm text-white/80 font-inter max-w-md">
                Inspect multi-tenant workspaces, override 48-hour campaign queues, manage the 365 cultural radar, and audit operator security.
              </p>
            </div>

            {/* Glassmorphic Navigation Tab Dock */}
            <nav
              aria-label="Operator sections"
              className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1.5 rounded-2xl sm:rounded-full bg-white/10 border border-white/20 backdrop-blur-xl w-full lg:w-fit"
            >
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`cursor-pointer py-2 px-3.5 rounded-full text-xs font-sora font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-[#0B0F14] shadow-sm font-bold'
                        : 'text-white/85 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-[#FF7A00]' : 'text-white/75'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </section>

        {/* =========================================================================
            OVERLAPPING 6-CARD KPI RIBBON
        ========================================================================= */}
        <section className="relative z-20 -mt-10 sm:-mt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-left">
            {kpiCards.map((kpi) => (
              <div
                key={kpi.label}
                className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-[0_14px_34px_-18px_rgba(11,15,20,0.16)] space-y-1"
              >
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">
                  {kpi.label}
                </span>
                <div className={`text-xl sm:text-2xl font-extrabold font-sora ${kpi.accent}`}>
                  {kpi.value}
                </div>
                <span className="text-[11px] text-[#4B5563] font-mono block truncate">
                  {kpi.meta}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            MAIN OPERATOR VIEWPORT
        ========================================================================= */}
        <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1 space-y-6">
          {usingDefaultCredentials && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start sm:items-center gap-3 text-xs font-inter text-left">
              <AlertTriangle size={17} className="text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-sora font-bold">Fallback Operator Credentials Active: </span>
                <span>
                  Configure dedicated{' '}
                  <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-950">
                    KUIRO_MANAGEMENT_PASSKEY
                  </code>{' '}
                  and{' '}
                  <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-950">
                    KUIRO_MANAGEMENT_JWT_SECRET
                  </code>{' '}
                  in environment variables before production rollout.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <AdminOverviewPanel
              metrics={metrics}
              health={health}
              activities={activities}
              alerts={alerts}
              isLoading={isLoading}
              updatingAlertId={updatingAlertId}
              onUpdateAlertStatus={handleUpdateAlertStatus}
            />
          )}

          {activeTab === 'workspaces' && (
            <AdminWorkspacesTab
              workspaces={workspacesList}
              tierFilter={workspaceTierFilter}
              searchQuery={workspaceSearch}
              onTierFilterChange={setWorkspaceTierFilter}
              onSearchChange={setWorkspaceSearch}
              onOpenNewModal={() => setIsNewWsModalOpen(true)}
              onInspectWorkspace={(ws) => setSelectedWsForInspection(ws)}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab
              users={usersList}
              searchQuery={userSearch}
              onSearchChange={setUserSearch}
              onToggleEmailVerified={handleToggleUserVerified}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'campaigns' && (
            <AdminCampaignsTab
              campaigns={campaignsList}
              statusFilter={campaignStatusFilter}
              onStatusFilterChange={setCampaignStatusFilter}
              onInspectCampaign={(camp) => setSelectedCampaignPosts(camp)}
            />
          )}

          {activeTab === 'calendar' && (
            <AdminCalendarTab
              events={calendarEvents}
              isRunningSweep={isRunningSweep}
              onOpenNewModal={() => setIsNewEventModalOpen(true)}
              onTriggerSweep={handleTriggerSweep}
              onDeleteEvent={handleDeleteEvent}
            />
          )}

          {activeTab === 'optimizer' && (
            <AdminOptimizerTab
              config={optimizerConfig}
              envKeys={optimizerEnvKeys}
              isSaving={isSavingOptimizer}
              onChange={setOptimizerConfig}
              onSave={handleSaveOptimizer}
            />
          )}

          {activeTab === 'audit' && (
            <AdminAuditTab
              logs={auditLogs}
              statusFilter={auditStatusFilter}
              searchQuery={auditSearch}
              onStatusFilterChange={setAuditStatusFilter}
              onSearchChange={setAuditSearch}
            />
          )}
        </section>
      </main>

      {/* Light Editorial Operator Footer Strip */}
      <footer className="mt-auto border-t border-[#E6E0D6] bg-[#F5F2EB] py-5 px-4 sm:px-6 lg:px-8 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <KuiroLogo variant="primary" theme="light" symbolSize={22} showTagline={false} />
            <span className="text-[11px] font-mono text-gray-500">
              Level 5 Operator Console
            </span>
          </div>
          <div className="flex items-center gap-5 text-[11px] font-sora font-semibold">
            <Link href="/" className="hover:text-[#0B0F14] transition">
              Public Site
            </Link>
            <Link href="/dashboard" className="hover:text-[#0B0F14] transition">
              Client Dashboard
            </Link>
            <Link href="/privacy" className="hover:text-[#0B0F14] transition">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      {isNewWsModalOpen && (
        <NewWorkspaceModal
          form={newWsForm}
          onChange={setNewWsForm}
          onSubmit={handleCreateWorkspace}
          onClose={() => setIsNewWsModalOpen(false)}
        />
      )}

      {selectedWsForInspection && (
        <InspectWorkspaceModal
          workspace={selectedWsForInspection}
          onUpdateWorkspace={handleUpdateWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
          onClose={() => setSelectedWsForInspection(null)}
        />
      )}

      {selectedCampaignPosts && (
        <InspectCampaignModal
          campaign={selectedCampaignPosts}
          onUpdateStatus={handleUpdateCampaignStatus}
          onDeleteCampaign={handleDeleteCampaign}
          onClose={() => setSelectedCampaignPosts(null)}
        />
      )}

      {isNewEventModalOpen && (
        <NewCalendarEventModal
          form={newEventForm}
          onChange={setNewEventForm}
          onSubmit={handleCreateEvent}
          onClose={() => setIsNewEventModalOpen(false)}
        />
      )}
    </div>
  );
}
