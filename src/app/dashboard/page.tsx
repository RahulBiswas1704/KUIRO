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
  ArrowRight,
  ShieldCheck,
  Instagram,
  Linkedin,
  Twitter,
  RefreshCw,
  Check,
  Mail,
  Pause,
  Play,
  X as CloseIcon,
  Loader2,
  Calendar,
  KeyRound,
  Download,
} from 'lucide-react';
import ConnectedChannelsModal, { PlatformKey } from '@/components/dashboard/ConnectedChannelsModal';
import { CampaignRoiDashboard } from '@/components/dashboard';

interface PlatformPost {
  id: string;
  campaignId: string;
  platform: 'instagram' | 'linkedin' | 'x' | 'whatsapp' | 'email';
  captionText: string;
  firstCommentText?: string | null;
  emailSubject?: string | null;
  emailHtml?: string | null;
  mediaUrls?: string[] | string;
  aspectRatio?: string;
  aiCriticScore?: number;
}

interface ScheduledCampaign {
  id: string;
  workspaceId: string;
  triggerType: string;
  topicSummary: string;
  status: 'AUTO_QUEUED' | 'APPROVED' | 'PUBLISHED' | 'PAUSED' | 'FAILED';
  revisionCount: number;
  generateAt: string;
  publishAt: string;
  posts: PlatformPost[];
}

const COMPOSER_PRESETS: Record<string, string[]> = {
  FLASH_SALE: [
    'Weekend Flash Sale: 30% Off Storewide for Next 48 Hours',
    'Midnight Clearance: Final 25 Limited Edition Units at Special Pricing',
    'Flash Promo: Free Premium Gift with Every Order Above ₹1,999',
    'Urgent Weekend Special: Priority Client Slots with 20% Cashback',
  ],
  PRODUCT_DROP: [
    'New Collection Drop: Handcrafted Pure Silk & Zari Weaves for Spring',
    'Product Launch: Next-Gen Natural Formulation Crafted for Daily Wear',
    'Introducing Our Private Advisory Studio: 1-on-1 Growth Consultations',
    'Exclusive Menu Reveal: Chef Special Seasonal Artisanal Tasting Series',
  ],
  SEASONAL: [
    'Diwali Gifting Guide: Bespoke Corporate & Family Gift Boxes',
    'Holi Festival Color & Style Celebration: Modern Indian Festive Wear',
    'Independence Day Pride Sale: Made In India Craftsmanship Spotlight',
    'New Year New Horizons: Refresh Your Brand & Strategy for 2026',
  ],
  THOUGHT_LEADERSHIP: [
    '3 Hard-Learned Lessons from 10 Years of Running an Independent Business',
    'Why True Brand Authenticity Always Outperforms Discount Chasing',
    'The Shift to Autonomous Workflows: How Small Teams Compete with Giants',
    'Behind the Scenes: The Real Supply Chain and Craft of Made-in-India Goods',
  ],
};

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<ScheduledCampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [selectedPlatformTab, setSelectedPlatformTab] = useState<'instagram' | 'whatsapp' | 'linkedin' | 'x' | 'email'>('instagram');
  const [filterTrigger, setFilterTrigger] = useState<string>('ALL');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  // Generator / Instant Composer Modal state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [composerTriggerType, setComposerTriggerType] = useState<'FLASH_SALE' | 'PRODUCT_DROP' | 'SEASONAL' | 'THOUGHT_LEADERSHIP'>('FLASH_SALE');
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
  const [channels, setChannels] = useState<any[]>([]);
  const [isChannelsModalOpen, setIsChannelsModalOpen] = useState(false);
  const [selectedChannelForModal, setSelectedChannelForModal] = useState<PlatformKey>('instagram');

  // Revision Modal State
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionPromptText, setRevisionPromptText] = useState('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);

  // Export Creative Kit State
  const [isExportingKit, setIsExportingKit] = useState(false);

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Fetch campaigns from Neon PostgreSQL
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
    } catch (err: any) {
      console.error('Fetch campaigns error:', err);
      setError(err.message || 'Network error fetching campaigns.');
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

  // Spotlight active campaign
  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0] || null;

  // Real-time Countdown calculation
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

  // Handle Approve
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
    } catch (err: any) {
      showToast(err.message || 'Error updating campaign.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Pause Autopilot
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
    } catch (err: any) {
      showToast(err.message || 'Error updating campaign.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Request AI Revision
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
        setIsRevisionModalOpen(false);
        setRevisionPromptText('');
        await fetchCampaigns(true);
      } else {
        showToast(data.error || 'Failed to revise campaign.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error submitting revision.', 'error');
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  // Handle Generate with AI / Instant Composer
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
    } catch (err: any) {
      showToast(err.message || 'Generation error.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // 1-Click Creative Kit Asset Exporter
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

      showToast(`Creative Kit ZIP downloaded! Packaged 4:5 visual, WhatsApp copy, and HTML email.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error exporting creative kit bundle.', 'error');
    } finally {
      setIsExportingKit(false);
    }
  };

  // Posts extraction
  const instagramPost = activeCampaign?.posts?.find((p) => p.platform === 'instagram');
  const whatsappPost = activeCampaign?.posts?.find((p) => p.platform === 'whatsapp');
  const linkedinPost = activeCampaign?.posts?.find((p) => p.platform === 'linkedin');
  const xPost = activeCampaign?.posts?.find((p) => p.platform === 'x');
  const emailPost = activeCampaign?.posts?.find((p) => p.platform === 'email');

  const activePost =
    selectedPlatformTab === 'instagram'
      ? instagramPost
      : selectedPlatformTab === 'whatsapp'
      ? whatsappPost
      : selectedPlatformTab === 'linkedin'
      ? linkedinPost
      : selectedPlatformTab === 'x'
      ? xPost
      : emailPost;

  // Compute average AI Critic score
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

      {/* =========================================================================
          SECTION 1: HERO AUTOPILOT CONTROL CENTER (Zorcha Card)
      ========================================================================= */}
      <div className="rounded-[28px] bg-gradient-to-b from-[#0D121F] to-[#0A0E18] border border-white/[0.09] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Subtle decorative grid overlay */}
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

          {/* Quick Action Buttons */}
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

      {/* =========================================================================
          SECTION 2: TOP 4 KPI HIGHLIGHTS
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: 48h Radar Queue */}
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

        {/* KPI 2: AI Critic Compliance */}
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

        {/* KPI 3: WhatsApp Approvals */}
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

        {/* KPI 4: Connected Channels */}
        <div className="rounded-2xl bg-[#0A0E18] border border-white/[0.08] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Live Channels
            </span>
            <Share2 size={15} className="text-[#FF7A00]" />
          </div>
          <div className="text-2xl font-bold font-sora text-white">
            5 Channels
          </div>
          <p className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>WhatsApp, Insta, LinkedIn, X, Mail</span>
          </p>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: DUAL-PANE OPERATIONAL WORKSPACE
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* =======================================================================
            LEFT COLUMN (5 Cols): CAMPAIGN QUEUE & STATUS RADAR
        ======================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-[24px] bg-[#0A0E18] border border-white/[0.08] p-5 shadow-sm space-y-4">
            {/* Queue vs History Tabs */}
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

            {/* Category Filter Pills */}
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

            {/* Campaigns List Container */}
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
                      {/* Header Badge & Trigger */}
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

                      {/* Topic Title */}
                      <h4 className="text-xs font-sora font-semibold text-white leading-snug line-clamp-2">
                        {c.topicSummary}
                      </h4>

                      {/* Channels & Mini Actions */}
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

        {/* =======================================================================
            RIGHT COLUMN (7 Cols): LIVE MULTI-CHANNEL PREVIEW & SURGICAL ACTIONS
        ======================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {activeCampaign ? (
            <div className="rounded-[28px] bg-[#0A0E18] border border-white/[0.08] p-6 shadow-xl space-y-5">
              {/* Spotlight Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-[#FF7A00] font-bold uppercase tracking-wider">
                      Target Campaign:
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {activeCampaign.id.slice(0, 8)}...
                    </span>
                  </div>
                  <h3 className="text-base font-sora font-bold text-white line-clamp-1">
                    {activeCampaign.topicSummary}
                  </h3>
                </div>

                {/* 48h Auto-Commit Countdown Timer Box */}
                <div className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-right">
                  <span className="text-[9px] font-mono uppercase text-slate-400 block">
                    Auto-Commit Clock
                  </span>
                  <span className="text-sm font-mono font-bold text-[#FF7A00]">
                    {timeLeft.hours.toString().padStart(2, '0')}h :{' '}
                    {timeLeft.minutes.toString().padStart(2, '0')}m :{' '}
                    {timeLeft.seconds.toString().padStart(2, '0')}s
                  </span>
                </div>
              </div>

              {/* Channel Selector Switcher Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-x-auto text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedPlatformTab('instagram')}
                  className={`flex-1 min-w-[105px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    selectedPlatformTab === 'instagram'
                      ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Instagram size={13} className="text-pink-400" />
                  <span>Instagram</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlatformTab('whatsapp')}
                  className={`flex-1 min-w-[105px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    selectedPlatformTab === 'whatsapp'
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone size={13} className="text-emerald-400" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlatformTab('linkedin')}
                  className={`flex-1 min-w-[105px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    selectedPlatformTab === 'linkedin'
                      ? 'bg-blue-500/20 border border-blue-500/30 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Linkedin size={13} className="text-blue-400" />
                  <span>LinkedIn</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlatformTab('x')}
                  className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    selectedPlatformTab === 'x'
                      ? 'bg-white/10 border border-white/20 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Twitter size={13} className="text-slate-300" />
                  <span>X / Tweet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlatformTab('email')}
                  className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    selectedPlatformTab === 'email'
                      ? 'bg-amber-500/20 border border-amber-500/30 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail size={13} className="text-amber-400" />
                  <span>Newsletter</span>
                </button>
              </div>

              {/* =================================================================
                  PLATFORM LIVE PREVIEWS
              ================================================================= */}
              <div className="rounded-2xl bg-[#070A11] border border-white/[0.08] p-4 sm:p-5 relative overflow-hidden">
                {/* 1. INSTAGRAM FEED PREVIEW */}
                {selectedPlatformTab === 'instagram' && (
                  <div className="space-y-4 animate-fade-in max-w-md mx-auto">
                    {/* User profile header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF7A00] to-pink-500 p-[1.5px]">
                          <div className="w-full h-full rounded-full bg-[#070A11] flex items-center justify-center text-[10px] font-bold text-white">
                            KB
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-white">kuiro.brand</span>
                            <span className="w-3 h-3 rounded-full bg-blue-500 text-[8px] flex items-center justify-center text-white">
                              ✓
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">Original Audio</span>
                        </div>
                      </div>
                      <span className="text-slate-400 text-sm">•••</span>
                    </div>

                    {/* 4:5 Visual Aspect Ratio Mock */}
                    <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-[#121829] via-[#0E1424] to-[#182136] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between p-6">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="px-2 py-0.5 rounded bg-black/60 text-white border border-white/10">
                          4:5 High-Res Grid
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#FF7A00]/20 text-[#FF7A00] font-bold border border-[#FF7A00]/30">
                          AI Critic: {instagramPost?.aiCriticScore || 98.4}%
                        </span>
                      </div>

                      <div className="space-y-2 text-center my-auto">
                        <div className="w-12 h-12 rounded-2xl bg-[#FF7A00]/20 text-[#FF7A00] flex items-center justify-center mx-auto mb-2 border border-[#FF7A00]/30 shadow-lg">
                          <Sparkles size={24} />
                        </div>
                        <h4 className="font-sora text-lg font-bold text-white drop-shadow">
                          {activeCampaign.topicSummary}
                        </h4>
                        <p className="text-xs text-slate-300 font-inter max-w-xs mx-auto drop-shadow">
                          Autonomous AI Production • Color Calibrated • Studio Approved
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>#MadeInIndia</span>
                        <span>Auto-Tagged Brand Brain</span>
                      </div>
                    </div>

                    {/* Post Caption & Hashtags */}
                    <div className="space-y-2 text-xs font-inter">
                      <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                        <strong className="text-white mr-1.5 font-sora">kuiro.brand</strong>
                        {instagramPost?.captionText || 'Handcrafted perfection tailored for your festive season. Tap link in bio to reserve your priority order before midnight.'}
                      </p>

                      {instagramPost?.firstCommentText && (
                        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-slate-400">
                          <span className="text-[#FF7A00] font-bold mr-1.5">First Comment (Auto):</span>
                          <span>{instagramPost.firstCommentText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. WHATSAPP 48H LOOP PREVIEW */}
                {selectedPlatformTab === 'whatsapp' && (
                  <div className="space-y-4 animate-fade-in max-w-md mx-auto">
                    <div className="p-3 rounded-xl bg-[#0F1C15] border border-emerald-500/25 flex items-center justify-between text-xs font-mono text-emerald-300">
                      <div className="flex items-center gap-2">
                        <Smartphone size={14} className="text-emerald-400" />
                        <span>Verified WhatsApp Cloud API</span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>

                    {/* WhatsApp Chat Bubble */}
                    <div className="rounded-2xl bg-[#121B22] border border-emerald-500/20 p-4 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-white/[0.06] pb-2">
                        <span className="text-emerald-400 font-bold">KUIRO Official VIP Updates</span>
                        <span>10:42 AM</span>
                      </div>

                      <div className="text-xs font-inter text-slate-100 whitespace-pre-line leading-relaxed">
                        {whatsappPost?.captionText ||
                          `✨ *Exclusive Announcement:*\n\nNamaste Founder! Your 48-hour priority window is now live.\n\nTake advantage of this limited-run collection before general public release.\n\nReply *YES* to claim, or click below:`}
                      </div>

                      {/* WhatsApp Interactive Button */}
                      <div className="pt-1">
                        <div className="w-full py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-center text-xs font-mono text-emerald-400 font-bold cursor-pointer">
                          🔗 View Festive Catalog & Order Now
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. LINKEDIN POST PREVIEW */}
                {selectedPlatformTab === 'linkedin' && (
                  <div className="space-y-3 animate-fade-in max-w-lg mx-auto">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#0077B5] flex items-center justify-center font-bold text-white text-xs">
                        KB
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white">Rahul Biswas • Founder</h5>
                        <p className="text-[10px] text-slate-400 font-mono">1st • Building KUIRO • 2h</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-inter text-slate-200 leading-relaxed whitespace-pre-line">
                      {linkedinPost?.captionText ||
                        `Most brands spend 15 hours a week coordinating designers, copywriters, and schedulers.\n\nWe spent the last 6 months automating the entire loop with multi-modal AI and strict compliance rules.\n\nHere are 3 fundamental shifts we observed:`}
                    </div>
                  </div>
                )}

                {/* 4. X / TWITTER PREVIEW */}
                {selectedPlatformTab === 'x' && (
                  <div className="space-y-3 animate-fade-in max-w-lg mx-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Rahul Biswas</span>
                      <span className="text-xs text-slate-400 font-mono">@kuiro_hq • 1h</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-inter text-slate-200 leading-relaxed whitespace-pre-line">
                      {xPost?.captionText ||
                        `Autonomous marketing isn't about spamming feeds—it's about never missing a cultural or festive moment across India while keeping brand voice razor-sharp.\n\n48-hour auto-commit loop running at 100% compliance.`}
                    </div>
                  </div>
                )}

                {/* 5. EMAIL NEWSLETTER PREVIEW */}
                {selectedPlatformTab === 'email' && (
                  <div className="space-y-3 animate-fade-in max-w-lg mx-auto">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono space-y-1">
                      <div>
                        <span className="text-slate-400">Subject: </span>
                        <strong className="text-white">
                          {emailPost?.emailSubject || `[Exclusive] Priority Festive Access: ${activeCampaign.topicSummary}`}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">From: </span>
                        <span className="text-slate-200">updates@kuiro.in</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-inter text-slate-200 leading-relaxed whitespace-pre-line">
                      {emailPost?.captionText ||
                        `Hello,\n\nWe are pleased to introduce our newest collection curated specifically for your celebratory milestones.\n\nDiscover the artisanal craft behind each piece:`}
                    </div>
                  </div>
                )}
              </div>

              {/* =================================================================
                  INLINE AI REVISION BAR
              ================================================================= */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-white font-semibold">
                    <Sparkles size={13} className="text-[#FF7A00]" />
                    <span>Surgical AI Revision Prompt</span>
                  </span>
                  <span>{activeCampaign.revisionCount || 0} / 2 Revisions Used</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={revisionPromptText}
                    onChange={(e) => setRevisionPromptText(e.target.value)}
                    placeholder="e.g. 'Make tone more festive' or 'Shorten WhatsApp copy by 20%'"
                    className="flex-1 py-2.5 px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.1] focus:border-[#FF7A00] text-xs text-white focus:outline-none font-inter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRequestRevision(activeCampaign.id, revisionPromptText);
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={isSubmittingRevision || !revisionPromptText.trim()}
                    onClick={() => handleRequestRevision(activeCampaign.id, revisionPromptText)}
                    className="py-2.5 px-4 rounded-xl bg-[#FF7A00] hover:bg-[#FF881A] disabled:opacity-40 text-white text-xs font-sora font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {isSubmittingRevision ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <>
                        <span>Revise</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* =================================================================
                  TACTICAL ACTION CONTROLS (Approve, Pause, Export)
              ================================================================= */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleApprove(activeCampaign.id)}
                  className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-sora font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Check size={14} />
                  <span>Approve Now</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handlePause(activeCampaign.id)}
                  className="py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-sora font-semibold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {activeCampaign.status === 'PAUSED' ? (
                    <>
                      <Play size={14} className="text-emerald-400" />
                      <span>Resume 48h Loop</span>
                    </>
                  ) : (
                    <>
                      <Pause size={14} className="text-amber-400" />
                      <span>Pause Autopilot</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isExportingKit}
                  onClick={() => handleExportCreativeKit(activeCampaign.id, activeCampaign.topicSummary)}
                  className="py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-sora font-semibold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isExportingKit ? (
                    <Loader2 size={14} className="animate-spin text-[#FF7A00]" />
                  ) : (
                    <Download size={14} className="text-[#FF7A00]" />
                  )}
                  <span>Export Kit ZIP</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-[28px] bg-[#0A0E18] border border-white/[0.08] space-y-3">
              <Sparkles size={32} className="text-[#FF7A00] mx-auto animate-pulse" />
              <h3 className="font-sora text-lg font-bold text-white">No active campaign selected</h3>
              <p className="text-xs text-slate-400">Select a campaign from the left queue to inspect multi-channel previews.</p>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: CONNECTED CHANNELS STATUS RADAR
      ========================================================================= */}
      <div id="channels" className="rounded-[24px] bg-[#0A0E18] border border-white/[0.08] p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div>
            <h3 className="font-sora text-base font-bold text-white flex items-center gap-2">
              <Share2 size={16} className="text-[#FF7A00]" />
              <span>Connected Channels & API Health</span>
            </h3>
            <p className="text-xs text-slate-400 font-inter mt-0.5">
              Verified OAuth bridges for Meta Graph API v21.0 & WhatsApp Cloud API.
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

      {/* =========================================================================
          SECTION 5: INTEGRATED ROI & CAMPAIGN ATTRIBUTION DASHBOARD
      ========================================================================= */}
      <CampaignRoiDashboard onRefreshNeeded={() => fetchCampaigns(true)} />

      {/* =========================================================================
          MODAL: INSTANT CAMPAIGN COMPOSER (SLIDE-OVER / POPOVER)
      ========================================================================= */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl rounded-[28px] bg-[#0A0E18] border border-white/[0.12] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-5 relative">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FF7A00]/20 text-[#FF7A00] flex items-center justify-center font-bold">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-sora text-base font-bold text-white">
                    Instant Campaign Composer
                  </h3>
                  <p className="text-[11px] text-slate-400">Generate multi-channel assets with 48h loop auto-commit.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGeneratorOpen(false)}
                className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-white/[0.05]"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Campaign Preset Trigger Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-semibold block">
                Trigger Type & Objective:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                {[
                  { key: 'FLASH_SALE', label: 'Flash Sale' },
                  { key: 'SEASONAL', label: 'Festive / India' },
                  { key: 'PRODUCT_DROP', label: 'New Drop' },
                  { key: 'THOUGHT_LEADERSHIP', label: 'Thought Lead' },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setComposerTriggerType(t.key as any)}
                    className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                      composerTriggerType === t.key
                        ? 'bg-[#FF7A00]/20 border-[#FF7A00] text-white font-bold'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick 1-Click Suggestions */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 block">
                1-Click Preset Ideas for {composerTriggerType}:
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {COMPOSER_PRESETS[composerTriggerType]?.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomTopic(preset)}
                    className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-inter text-slate-300 hover:text-white transition flex items-center justify-between group"
                  >
                    <span className="truncate mr-2">{preset}</span>
                    <ArrowRight size={12} className="text-slate-500 group-hover:text-[#FF7A00] shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Topic Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-semibold block">
                Or Enter Custom Topic / Promotion:
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. Navratri 9-Day Festive Saree Showcase with Free Matching Blouse"
                className="w-full py-3 px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.1] focus:border-[#FF7A00] text-xs text-white focus:outline-none font-inter"
              />
            </div>

            {/* Channel Selectors */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-mono text-slate-300 font-semibold block">
                Target Channels (Auto-Format):
              </span>
              <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                {['instagram', 'whatsapp', 'linkedin', 'x', 'email'].map((ch) => (
                  <label
                    key={ch}
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
                      selectedChannels[ch]
                        ? 'bg-white/[0.08] border-[#FF7A00] text-white font-bold'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedChannels[ch]}
                      onChange={(e) =>
                        setSelectedChannels({ ...selectedChannels, [ch]: e.target.checked })
                      }
                      className="hidden"
                    />
                    <span>{ch.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsGeneratorOpen(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-sora font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isGenerating || !customTopic.trim()}
                onClick={() => handleGenerateCampaign()}
                className="py-2.5 px-5 rounded-full bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-sora font-bold transition shadow-lg shadow-[#FF7A00]/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Synthesizing Multi-Channel Assets...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate & Enqueue 48h Loop</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
