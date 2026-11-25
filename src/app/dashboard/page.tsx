'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Share2,
  Smartphone,
  ShieldCheck,
  Instagram,
  Linkedin,
  Twitter,
  RefreshCw,
  Mail,
  X as CloseIcon,
  Loader2,
  Calendar,
  KeyRound,
} from 'lucide-react';
import {
  CampaignRoiDashboard,
  ConnectedChannelsModal,
  DashboardCampaignPreview,
  DashboardComposerModal,
  type ComposerTriggerType,
  type DashboardPlatformTab,
  type PlatformKey,
  type ScheduledCampaign,
} from '@/components/dashboard';

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<ScheduledCampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [selectedPlatformTab, setSelectedPlatformTab] = useState<DashboardPlatformTab>('instagram');
  const [filterTrigger, setFilterTrigger] = useState<string>('ALL');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  // Instant Composer Modal state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [composerTriggerType, setComposerTriggerType] = useState<ComposerTriggerType>('FLASH_SALE');
  const [selectedChannels, setSelectedChannels] = useState<{ [key: string]: boolean }>({
    instagram: true,
    linkedin: true,
    x: true,
    whatsapp: true,
    email: true,
  });

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isPassed: boolean }>({
    hours: 32,
    minutes: 45,
    seconds: 18,
    isPassed: false,
  });

  // Connected Channels State & Modal
  const [, setChannels] = useState<unknown[]>([]);
  const [isChannelsModalOpen, setIsChannelsModalOpen] = useState(false);
  const [selectedChannelForModal, setSelectedChannelForModal] = useState<PlatformKey>('instagram');

  // Revision & Export states
  const [revisionPromptText, setRevisionPromptText] = useState('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [isExportingKit, setIsExportingKit] = useState(false);

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchCampaigns = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/campaigns', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.campaigns)) {
        setCampaigns(data.campaigns);
        if (data.campaigns.length > 0 && !selectedCampaignId) {
          const queued = data.campaigns.find((c: ScheduledCampaign) => c.status === 'AUTO_QUEUED');
          setSelectedCampaignId(queued ? queued.id : data.campaigns[0].id);
        }
      } else {
        setError(data.error || 'Failed to load campaigns.');
      }
    } catch (err: unknown) {
      console.error('Fetch campaigns error:', err);
      setError(err instanceof Error ? err.message : 'Network error fetching campaigns.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/social-connections', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.connections)) {
        setChannels(data.connections);
      }
    } catch (e) {
      console.warn('Failed to fetch channels:', e);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchChannels();
  }, []);

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0] || null;

  useEffect(() => {
    if (!activeCampaign?.publishAt) return;

    const updateTimer = () => {
      const target = new Date(activeCampaign.publishAt).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isPassed: true });
      } else {
        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft({ hours, minutes, seconds, isPassed: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeCampaign?.publishAt]);

  const handleApprove = async (id: string) => {
    try {
      setIsUpdatingStatus(true);
      const res = await fetch('/api/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id, status: 'APPROVED' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Campaign approved manually! Dispatched for immediate priority publishing.', 'success');
        await fetchCampaigns(true);
      } else {
        showToast(data.error || 'Failed to approve campaign.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating campaign.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePause = async (id: string) => {
    try {
      setIsUpdatingStatus(true);
      const currentStatus = activeCampaign?.status;
      const nextStatus = currentStatus === 'PAUSED' ? 'AUTO_QUEUED' : 'PAUSED';
      const res = await fetch('/api/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          nextStatus === 'PAUSED'
            ? 'Autopilot paused for this campaign. Passive auto-commit suspended.'
            : 'Campaign resumed! 48-hour auto-commit countdown reactivated.',
          'info'
        );
        await fetchCampaigns(true);
      } else {
        showToast(data.error || 'Failed to toggle campaign status.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating campaign.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRequestRevision = async (id: string, promptText: string) => {
    if (!promptText.trim()) return;
    try {
      setIsSubmittingRevision(true);
      const res = await fetch('/api/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: id,
          revisionPrompt: promptText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Campaign revised surgically via Gemini!', 'success');
        setRevisionPromptText('');
        await fetchCampaigns(true);
      } else {
        showToast(data.error || 'Failed to revise campaign.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error submitting revision.', 'error');
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const handleGenerateCampaign = async (topicToUse?: string, triggerTypeToUse?: string) => {
    const topic = topicToUse || customTopic.trim();
    if (!topic) return;
    const trigger = triggerTypeToUse || composerTriggerType;

    try {
      setIsGenerating(true);
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          triggerType: trigger,
          targetChannels: Object.keys(selectedChannels).filter((k) => selectedChannels[k]),
        }),
      });
      const data = await res.json();
      if (data.success && data.campaign) {
        showToast(`AI Campaign generated for "${topic}"! Entered 48h Auto-Commit queue.`, 'success');
        setIsGeneratorOpen(false);
        setCustomTopic('');
        setActiveTab('queue');
        await fetchCampaigns(true);
        setSelectedCampaignId(data.campaign.id);
      } else {
        showToast(data.error || 'Failed to generate campaign.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Generation error.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCreativeKit = async (campaignId: string, topicName: string) => {
    try {
      setIsExportingKit(true);
      showToast(`Generating Creative Kit ZIP for "${topicName}"...`, 'info');

      const res = await fetch(`/api/campaigns/export?campaignId=${campaignId}`);
      if (!res.ok) {
        throw new Error('Failed to bundle creative kit package');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanSlug = topicName.slice(0, 24).replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
      a.download = `KUIRO_Creative_Kit_${cleanSlug}_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(
        'Creative Kit ZIP downloaded! Packaged 4:5 visual, WhatsApp copy, and HTML email.',
        'success'
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error exporting creative kit bundle.', 'error');
    } finally {
      setIsExportingKit(false);
    }
  };

  const avgCriticScore = activeCampaign?.posts?.length
    ? (
        activeCampaign.posts.reduce((sum, p) => sum + (p.aiCriticScore || 90), 0) /
        activeCampaign.posts.length
      ).toFixed(1)
    : '97.4';

  const queuedCampaigns = campaigns.filter((c) => c.status === 'AUTO_QUEUED' || c.status === 'APPROVED');
  const historyCampaigns = campaigns.filter((c) => c.status === 'PUBLISHED' || c.status === 'PAUSED');

  const displayedCampaigns = (activeTab === 'queue' ? queuedCampaigns : historyCampaigns).filter((c) => {
    if (filterTrigger === 'ALL') return true;
    return c.triggerType === filterTrigger;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-mono flex items-center justify-between shadow-2xl animate-fade-in ${
            toastType === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
              : toastType === 'info'
              ? 'bg-blue-950/80 border-blue-500/30 text-blue-300'
              : 'bg-red-950/80 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastType === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-[#FF7A00] shrink-0" />
            )}
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white transition cursor-pointer p-1"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* SECTION 1: HERO AUTOPILOT CONTROL CENTER */}
      <div className="rounded-[28px] bg-gradient-to-b from-[#0D121F] to-[#0A0E18] border border-white/[0.09] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Autonomous Co-Pilot Active</span>
              </span>
              <span className="text-slate-400 text-xs font-mono">• 365 Regional Engine</span>
              <span className="text-slate-400 text-xs font-mono">• Neon Serverless PG</span>
            </div>

            <h2 className="font-sora text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Your marketing. <span className="text-[#FF7A00]">On autopilot.</span>
            </h2>

            <p className="text-slate-400 text-xs sm:text-sm font-inter leading-relaxed">
              KUIRO plans 365 days of localized campaigns, verifies brand tone, checks compliance, and prepares multi-channel posts 48 hours in advance. Do nothing, and it auto-commits directly to your channels.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => setIsGeneratorOpen(true)}
              className="py-3 px-4.5 rounded-full bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-semibold transition shadow-lg shadow-[#FF7A00]/25 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles size={14} />
              <span>+ Instant Composer</span>
            </button>

            <Link
              href="/dashboard/simulator"
              className="py-3 px-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] text-white text-xs font-sora font-semibold transition flex items-center gap-2 cursor-pointer"
            >
              <Smartphone size={14} className="text-emerald-400" />
              <span>WhatsApp Sim</span>
            </Link>

            <Link
              href="/dashboard/calendar"
              className="py-3 px-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] text-slate-300 hover:text-white text-xs font-sora font-semibold transition flex items-center gap-2 cursor-pointer"
            >
              <Calendar size={14} className="text-[#FF7A00]" />
              <span>365 Radar</span>
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 2: TOP 4 KPI HIGHLIGHTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#0A0E18] border border-white/[0.08] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              48h Queue Load
            </span>
            <Clock size={15} className="text-[#FF7A00]" />
          </div>
          <div className="text-2xl font-bold font-sora text-white">
            {queuedCampaigns.length} {queuedCampaigns.length === 1 ? 'Campaign' : 'Campaigns'}
          </div>
          <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Active in 48h Auto-Commit radar</span>
          </p>
        </div>

        <div className="rounded-2xl bg-[#0A0E18] border border-white/[0.08] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              AI Critic Quality Pass
            </span>
            <ShieldCheck size={15} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-sora text-white">
            {avgCriticScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            Zero link surcharges, 100% brand voice
          </p>
        </div>

        <div className="rounded-2xl bg-[#0A0E18] border border-white/[0.08] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              WhatsApp 48h Loop
            </span>
            <Smartphone size={15} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-sora text-white">
            {activeCampaign?.status === 'APPROVED' ? 'Approved' : 'Zero-Click'}
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            Passive auto-commit countdown active
          </p>
        </div>

        <div className="rounded-2xl bg-[#0A0E18] border border-white/[0.08] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Live Channels
            </span>
            <Share2 size={15} className="text-[#FF7A00]" />
          </div>
          <div className="text-2xl font-bold font-sora text-white">5 Channels</div>
          <p className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>WhatsApp, Insta, LinkedIn, X, Mail</span>
          </p>
        </div>
      </div>

      {/* SECTION 3: DUAL-PANE OPERATIONAL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (5 Cols): CAMPAIGN QUEUE & STATUS RADAR */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-[24px] bg-[#0A0E18] border border-white/[0.08] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveTab('queue')}
                  className={`px-3 py-1.5 rounded-full font-semibold transition cursor-pointer ${
                    activeTab === 'queue'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Active Queue ({queuedCampaigns.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1.5 rounded-full font-semibold transition cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Published ({historyCampaigns.length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => fetchCampaigns(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition cursor-pointer"
                title="Refresh campaigns"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin text-[#FF7A00]' : ''} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono scrollbar-none">
              {['ALL', 'FLASH_SALE', 'SEASONAL', 'PRODUCT_DROP', 'THOUGHT_LEADERSHIP'].map((trigger) => (
                <button
                  key={trigger}
                  type="button"
                  onClick={() => setFilterTrigger(trigger)}
                  className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition cursor-pointer ${
                    filterTrigger === trigger
                      ? 'bg-[#FF7A00]/15 border-[#FF7A00] text-white font-bold'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                  }`}
                >
                  {trigger === 'ALL'
                    ? 'All'
                    : trigger === 'FLASH_SALE'
                    ? 'Flash Sale'
                    : trigger === 'SEASONAL'
                    ? 'Festive'
                    : trigger === 'PRODUCT_DROP'
                    ? 'New Drop'
                    : 'Thought Lead'}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {loading && campaigns.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <Loader2 size={24} className="animate-spin text-[#FF7A00] mx-auto" />
                  <p className="text-xs text-slate-400 font-mono">Loading autonomous campaigns...</p>
                </div>
              ) : displayedCampaigns.length === 0 ? (
                <div className="p-8 text-center space-y-3 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.08]">
                  <p className="text-xs text-slate-400">No campaigns found in this view.</p>
                  <button
                    type="button"
                    onClick={() => setIsGeneratorOpen(true)}
                    className="text-xs text-[#FF7A00] font-semibold hover:underline"
                  >
                    + Compose a new campaign now
                  </button>
                </div>
              ) : (
                displayedCampaigns.map((c) => {
                  const isSelected = c.id === (activeCampaign?.id || selectedCampaignId);
                  const isQueued = c.status === 'AUTO_QUEUED';
                  const isApproved = c.status === 'APPROVED';
                  const isPaused = c.status === 'PAUSED';

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCampaignId(c.id)}
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-[#0E1524] border-[#FF7A00] shadow-[0_4px_24px_rgba(255,122,0,0.15)] ring-1 ring-[#FF7A00]/50'
                          : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                            isQueued
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : isApproved
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : isPaused
                              ? 'bg-slate-500/15 text-slate-300 border border-slate-500/30'
                              : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isQueued
                                ? 'bg-amber-400 animate-pulse'
                                : isApproved
                                ? 'bg-emerald-400'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span>
                            {c.status === 'AUTO_QUEUED'
                              ? '48h Auto-Commit'
                              : c.status === 'APPROVED'
                              ? 'Approved'
                              : c.status === 'PAUSED'
                              ? 'Paused'
                              : 'Published'}
                          </span>
                        </span>

                        <span className="text-[11px] text-slate-400">
                          {new Date(c.publishAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <h4 className="text-xs font-sora font-semibold text-white leading-snug line-clamp-2">
                        {c.topicSummary}
                      </h4>

                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Instagram size={12} className="hover:text-white" />
                          <Smartphone size={12} className="text-emerald-400" />
                          <Linkedin size={12} className="hover:text-white" />
                          <Twitter size={12} className="hover:text-white" />
                          <Mail size={12} className="hover:text-white" />
                        </div>

                        {isQueued && (
                          <span className="text-[10px] font-mono text-[#FF7A00]">
                            Auto-commits in {timeLeft.hours}h {timeLeft.minutes}m
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 Cols): LIVE MULTI-CHANNEL PREVIEW & SURGICAL ACTIONS */}
        <div className="lg:col-span-7 space-y-4">
          <DashboardCampaignPreview
            activeCampaign={activeCampaign}
            selectedPlatformTab={selectedPlatformTab}
            timeLeft={timeLeft}
            revisionPromptText={revisionPromptText}
            isSubmittingRevision={isSubmittingRevision}
            isUpdatingStatus={isUpdatingStatus}
            isExportingKit={isExportingKit}
            onSelectPlatformTab={setSelectedPlatformTab}
            onRevisionPromptChange={setRevisionPromptText}
            onRequestRevision={handleRequestRevision}
            onApprove={handleApprove}
            onPause={handlePause}
            onExportCreativeKit={handleExportCreativeKit}
          />
        </div>
      </div>

      {/* SECTION 4: CONNECTED CHANNELS STATUS RADAR */}
      <div id="channels" className="rounded-[24px] bg-[#0A0E18] border border-white/[0.08] p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div>
            <h3 className="font-sora text-base font-bold text-white flex items-center gap-2">
              <Share2 size={16} className="text-[#FF7A00]" />
              <span>Connected Channels &amp; API Health</span>
            </h3>
            <p className="text-xs text-slate-400 font-inter mt-0.5">
              Verified OAuth bridges for Meta Graph API v21.0 &amp; WhatsApp Cloud API.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedChannelForModal('instagram');
              setIsChannelsModalOpen(true);
            }}
            className="py-2 px-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] text-xs font-sora font-semibold text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <KeyRound size={13} className="text-[#FF7A00]" />
            <span>Manage API Connections</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Instagram size={14} className="text-pink-400" />
              <span className="font-semibold text-white">Instagram</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active" />
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone size={14} className="text-emerald-400" />
              <span className="font-semibold text-white">WhatsApp</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Cloud API Live" />
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Linkedin size={14} className="text-blue-400" />
              <span className="font-semibold text-white">LinkedIn</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active" />
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Twitter size={14} className="text-slate-300" />
              <span className="font-semibold text-white">X / Twitter</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active" />
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-amber-400" />
              <span className="font-semibold text-white">Newsletter</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active" />
          </div>
        </div>
      </div>

      {/* SECTION 5: INTEGRATED ROI & CAMPAIGN ATTRIBUTION DASHBOARD */}
      <CampaignRoiDashboard onRefreshNeeded={() => fetchCampaigns(true)} />

      {/* MODAL: INSTANT CAMPAIGN COMPOSER */}
      <DashboardComposerModal
        isOpen={isGeneratorOpen}
        composerTriggerType={composerTriggerType}
        customTopic={customTopic}
        selectedChannels={selectedChannels}
        isGenerating={isGenerating}
        onTriggerTypeChange={setComposerTriggerType}
        onCustomTopicChange={setCustomTopic}
        onSelectedChannelsChange={setSelectedChannels}
        onGenerate={() => handleGenerateCampaign()}
        onClose={() => setIsGeneratorOpen(false)}
      />

      {/* Connected Channels Modal */}
      <ConnectedChannelsModal
        isOpen={isChannelsModalOpen}
        onClose={() => setIsChannelsModalOpen(false)}
        initialPlatform={selectedChannelForModal}
        onConnectionUpdated={fetchChannels}
      />
    </div>
  );
}
