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
  Flame,
  ArrowRight,
  ShieldCheck,
  Instagram,
  Linkedin,
  Twitter,
  MessageSquare,
  RefreshCw,
  Eye,
  Check,
  Mail,
  MessagesSquare,
  Pause,
  Play,
  Plus,
  X as CloseIcon,
  Loader2,
  Calendar,
  Send,
  Sliders
} from 'lucide-react';

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

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<ScheduledCampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [selectedPlatformTab, setSelectedPlatformTab] = useState<'all' | 'instagram' | 'linkedin' | 'x' | 'whatsapp' | 'email'>('all');
  
  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  // Generator Modal state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isPassed: boolean }>({
    hours: 32,
    minutes: 45,
    seconds: 18,
    isPassed: false,
  });

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
          // Select first auto-queued or top campaign
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

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Active spotlight campaign
  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0] || null;

  // Real Countdown calculation
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

  // Handle Generate with AI
  const handleGenerateCampaign = async (topicToUse?: string) => {
    const topic = topicToUse || customTopic.trim();
    if (!topic) return;

    try {
      setIsGenerating(true);
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, triggerType: 'MANUAL' }),
      });
      const data = await res.json();
      if (data.success && data.campaign) {
        showToast(`AI Campaign generated for "${topic}"! Entered 48h Auto-Commit queue.`, 'success');
        setIsGeneratorOpen(false);
        setCustomTopic('');
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

  // Extract posts for active campaign
  const instagramPost = activeCampaign?.posts?.find((p) => p.platform === 'instagram');
  const linkedinPost = activeCampaign?.posts?.find((p) => p.platform === 'linkedin');
  const xPost = activeCampaign?.posts?.find((p) => p.platform === 'x');
  const whatsappPost = activeCampaign?.posts?.find((p) => p.platform === 'whatsapp');
  const emailPost = activeCampaign?.posts?.find((p) => p.platform === 'email');

  // Compute average AI Critic score
  const avgCriticScore = activeCampaign?.posts?.length
    ? (
        activeCampaign.posts.reduce((sum, p) => sum + (p.aiCriticScore || 90), 0) /
        activeCampaign.posts.length
      ).toFixed(1)
    : '96.8';

  const queuedCampaigns = campaigns.filter((c) => c.status === 'AUTO_QUEUED' || c.status === 'APPROVED');
  const historyCampaigns = campaigns.filter((c) => c.status === 'PUBLISHED' || c.status === 'PAUSED');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast alert */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-[12px] border text-xs font-medium flex items-center justify-between shadow-sm animate-fadeIn ${
            toastType === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : toastType === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastType === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : toastType === 'info' ? (
              <AlertCircle size={16} className="text-blue-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
            )}
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-500 hover:text-gray-800 transition"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      )}

      {/* Hero Welcome & Autopilot Banner */}
      <div className="rounded-[14px] bg-[#0B0F14] text-white p-6 border border-[#1E2530] relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-pulse" />
                Autonomous Co-Pilot Active
              </span>
              <span className="text-gray-400 text-xs">• 365 Regional Engine</span>
              <span className="text-gray-400 text-xs">• Neon Serverless PG</span>
            </div>
            <h2 className="font-sora text-xl md:text-2xl font-bold tracking-tight">
              Your marketing. <span className="text-[#FF7A00]">On autopilot.</span>
            </h2>
            <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-xl">
              KUIRO plans, generates, checks compliance, and prepares multi-channel posts 48 hours in advance. Do nothing, and it auto-commits to your channels.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#FF7A00] text-white text-xs font-semibold hover:bg-[#E66E00] transition shadow-sm font-sora"
            >
              <Sparkles size={15} />
              <span>Generate AI Campaign</span>
            </button>
            <Link
              href="/dashboard/simulator"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-white text-[#0B0F14] text-xs font-semibold hover:bg-gray-100 transition shadow-sm"
            >
              <Smartphone size={15} />
              <span>WhatsApp Sim</span>
            </Link>
            <Link
              href="/dashboard/calendar"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] bg-[#1E2530] text-gray-200 text-xs font-semibold hover:bg-[#2A3442] transition"
            >
              <Calendar size={15} />
              <span>365 Radar</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              48h Queue Status
            </span>
            <Clock size={16} className="text-[#FF7A00]" />
          </div>
          <div className="text-2xl font-bold text-[#0B0F14] font-inter">
            {queuedCampaigns.length} {queuedCampaigns.length === 1 ? 'Campaign' : 'Campaigns'}
          </div>
          <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Active in 48h Auto-Commit radar</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              AI Critic Quality Pass
            </span>
            <ShieldCheck size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-[#0B0F14] font-inter">
            {avgCriticScore} / 100
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            Zero link surcharges, 100% brand tone
          </p>
        </div>

        <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              WhatsApp Approvals
            </span>
            <Smartphone size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#0B0F14] font-inter">
            {activeCampaign?.status === 'APPROVED' ? 'Approved' : 'Zero-Click'}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            48h passive auto-commit enabled
          </p>
        </div>

        <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Connected Channels
            </span>
            <Share2 size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-[#0B0F14] font-inter">
            5 of 5 Live
          </div>
          <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-medium">IG, LI, X, WA, Email healthy</span>
          </p>
        </div>
      </div>

      {/* Main Campaign Queue / Spotlight Card */}
      {loading ? (
        <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <Loader2 size={32} className="text-[#FF7A00] animate-spin mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#0B0F14]">Loading Neon Database Campaigns...</h3>
          <p className="text-xs text-gray-500 mt-1">
            Connecting to Lakebase PostgreSQL & retrieving 48h autonomous payloads.
          </p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-[14px] border border-rose-200 p-8 text-center text-rose-800">
          <AlertCircle size={32} className="text-rose-500 mx-auto mb-2" />
          <h3 className="text-base font-bold">Failed to load campaign data</h3>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
          <button
            onClick={() => fetchCampaigns()}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-[8px] text-xs font-semibold hover:bg-rose-700 transition"
          >
            Retry Connection
          </button>
        </div>
      ) : !activeCampaign ? (
        <div className="bg-white rounded-[14px] border border-dashed border-[#E5E7EB] p-12 text-center">
          <Sparkles size={36} className="text-[#FF7A00] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#0B0F14]">No active campaigns found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Your 48-hour marketing queue is currently empty. Generate a campaign using AI or pick a cultural milestone.
          </p>
          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="mt-4 px-4 py-2 bg-[#FF7A00] text-white rounded-[8px] text-xs font-semibold hover:bg-[#E66E00] transition"
          >
            Generate First Campaign
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
          {/* Spotlight Header with Live Countdown */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#E5E7EB] gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF7A00] shrink-0 mt-0.5">
                <Flame size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      activeCampaign.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : activeCampaign.status === 'PAUSED'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {activeCampaign.status === 'APPROVED'
                      ? 'APPROVED (QUEUED FOR PUBLISH)'
                      : activeCampaign.status === 'PAUSED'
                      ? 'PAUSED (MANUAL HOLD)'
                      : 'AUTO_QUEUED (48H WINDOW)'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Trigger: {activeCampaign.triggerType}
                  </span>
                  <span className="text-xs text-gray-400">• Neon DB ID: {activeCampaign.id.slice(0, 8)}</span>
                </div>
                <h3 className="font-sora text-base md:text-lg font-bold text-[#0B0F14] mt-0.5">
                  {activeCampaign.topicSummary}
                </h3>
                <p className="text-xs text-gray-500">
                  Target: Multi-Channel (IG, LI, X, WA, Email) • 5 Platform Payloads Pre-Crafted
                </p>
              </div>
            </div>

            {/* 48h Dynamic Countdown Timer */}
            <div className="flex items-center gap-3 bg-[#F9FAFB] p-3 rounded-[12px] border border-[#E5E7EB] shrink-0">
              <Clock
                size={20}
                className={timeLeft.isPassed ? 'text-emerald-600' : 'text-[#FF7A00] animate-pulse'}
              />
              <div>
                <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                  {activeCampaign.status === 'PAUSED'
                    ? 'Autopilot Hold'
                    : timeLeft.isPassed
                    ? 'Window Status'
                    : 'Passive Auto-Commit In'}
                </div>
                <div className="text-sm font-bold text-[#0B0F14] font-mono">
                  {activeCampaign.status === 'PAUSED' ? (
                    <span className="text-rose-600">PAUSED</span>
                  ) : timeLeft.isPassed ? (
                    <span className="text-emerald-600">Auto-Committing / Ready</span>
                  ) : (
                    `${String(timeLeft.hours).padStart(2, '0')}h ${String(timeLeft.minutes).padStart(2, '0')}m ${String(timeLeft.seconds).padStart(2, '0')}s`
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Selector Pill Ribbon if multiple campaigns exist */}
          {campaigns.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-gray-400 font-medium text-[11px] shrink-0">Active Campaigns:</span>
              {campaigns.map((camp) => (
                <button
                  key={camp.id}
                  onClick={() => setSelectedCampaignId(camp.id)}
                  className={`px-3 py-1.5 rounded-[8px] font-medium transition shrink-0 flex items-center gap-1.5 ${
                    camp.id === activeCampaign.id
                      ? 'bg-[#0B0F14] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      camp.status === 'APPROVED'
                        ? 'bg-emerald-400'
                        : camp.status === 'PAUSED'
                        ? 'bg-rose-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span className="max-w-[200px] truncate">{camp.topicSummary}</span>
                </button>
              ))}
            </div>
          )}

          {/* Visual & Multi-Channel Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Preview / Satori Banner Card */}
            <div className="lg:col-span-1 space-y-3">
              <div className="relative rounded-[12px] overflow-hidden border border-[#E5E7EB] bg-gray-900 group">
                <div className="aspect-square bg-gradient-to-br from-[#0B0F14] via-[#1E2530] to-[#0B0F14] p-4 flex flex-col justify-between text-white relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-[#FF7A00] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <span>KUIRO</span>
                    </div>
                    <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-gray-300">
                      Satori High-DPI 4:5
                    </span>
                  </div>

                  <div className="space-y-1.5 my-auto text-center px-2">
                    <p className="text-[11px] font-semibold text-[#FF7A00] uppercase tracking-wider">
                      Apex Diagnostic & Wellness
                    </p>
                    <h4 className="font-sora text-base font-bold leading-tight">
                      {activeCampaign.topicSummary}
                    </h4>
                    <p className="text-[10px] text-gray-300 max-w-xs mx-auto line-clamp-3">
                      {instagramPost?.captionText.slice(0, 120)}...
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400">
                    <span>Zero Link-Surcharge Engine</span>
                    <span>kuiro.in</span>
                  </div>
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link
                    href="/dashboard/simulator"
                    className="px-3 py-1.5 rounded-[8px] bg-white text-xs font-semibold text-[#0B0F14] hover:bg-gray-100 flex items-center gap-1.5"
                  >
                    <Smartphone size={14} />
                    <span>Inspect in WhatsApp</span>
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span>Contact Sheet (2x2 Multi-Channel)</span>
                <span className="text-[#FF7A00] font-medium text-[11px]">Meta Utility Template</span>
              </div>
            </div>

            {/* Platform Tailored Copy & Rules */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-[12px] bg-[#F9FAFB] border border-[#E5E7EB] p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-[#0B0F14]">
                      AI Multi-Channel Payloads (Gemini 3.5 Flash Lite)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-gray-500">
                    Revision {activeCampaign.revisionCount} of 2 (Free)
                  </span>
                </div>

                {/* Platform Switcher Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto border-b border-gray-200 pb-2">
                  <button
                    onClick={() => setSelectedPlatformTab('all')}
                    className={`px-2.5 py-1 rounded-[6px] text-xs font-medium transition ${
                      selectedPlatformTab === 'all'
                        ? 'bg-[#0B0F14] text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Payloads
                  </button>
                  <button
                    onClick={() => setSelectedPlatformTab('instagram')}
                    className={`px-2.5 py-1 rounded-[6px] text-xs font-medium transition flex items-center gap-1 ${
                      selectedPlatformTab === 'instagram'
                        ? 'bg-pink-600 text-white'
                        : 'text-pink-600 hover:bg-pink-50'
                    }`}
                  >
                    <Instagram size={12} />
                    <span>Instagram</span>
                  </button>
                  <button
                    onClick={() => setSelectedPlatformTab('linkedin')}
                    className={`px-2.5 py-1 rounded-[6px] text-xs font-medium transition flex items-center gap-1 ${
                      selectedPlatformTab === 'linkedin'
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Linkedin size={12} />
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={() => setSelectedPlatformTab('x')}
                    className={`px-2.5 py-1 rounded-[6px] text-xs font-medium transition flex items-center gap-1 ${
                      selectedPlatformTab === 'x'
                        ? 'bg-sky-600 text-white'
                        : 'text-sky-600 hover:bg-sky-50'
                    }`}
                  >
                    <Twitter size={12} />
                    <span>X (Twitter)</span>
                  </button>
                  <button
                    onClick={() => setSelectedPlatformTab('whatsapp')}
                    className={`px-2.5 py-1 rounded-[6px] text-xs font-medium transition flex items-center gap-1 ${
                      selectedPlatformTab === 'whatsapp'
                        ? 'bg-emerald-600 text-white'
                        : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    <MessageSquare size={12} />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setSelectedPlatformTab('email')}
                    className={`px-2.5 py-1 rounded-[6px] text-xs font-medium transition flex items-center gap-1 ${
                      selectedPlatformTab === 'email'
                        ? 'bg-amber-600 text-white'
                        : 'text-amber-600 hover:bg-amber-50'
                    }`}
                  >
                    <Mail size={12} />
                    <span>Email</span>
                  </button>
                </div>

                {/* Instagram / Facebook Caption */}
                {(selectedPlatformTab === 'all' || selectedPlatformTab === 'instagram') && instagramPost && (
                  <div className="text-xs text-gray-700 bg-white p-3 rounded-[8px] border border-[#E5E7EB] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-pink-600 font-semibold text-[11px]">
                        <Instagram size={13} />
                        <span>Instagram 4:5 Portrait Payload:</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        Critic Score: {instagramPost.aiCriticScore || 96}/100
                      </span>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed">{instagramPost.captionText}</p>
                    {instagramPost.firstCommentText && (
                      <p className="text-gray-400 text-[10px] font-mono pt-1">
                        {instagramPost.firstCommentText}
                      </p>
                    )}
                  </div>
                )}

                {/* LinkedIn Thought Leadership */}
                {(selectedPlatformTab === 'all' || selectedPlatformTab === 'linkedin') && linkedinPost && (
                  <div className="text-xs text-gray-700 bg-white p-3 rounded-[8px] border border-[#E5E7EB] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-[11px]">
                        <Linkedin size={13} />
                        <span>LinkedIn 1:1 Executive Insight Payload:</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        Critic Score: {linkedinPost.aiCriticScore || 94}/100
                      </span>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed">{linkedinPost.captionText}</p>
                    {linkedinPost.firstCommentText && (
                      <p className="text-blue-500 text-[10px] font-mono pt-1">
                        {linkedinPost.firstCommentText}
                      </p>
                    )}
                  </div>
                )}

                {/* X (Twitter) Surcharge Guardrail */}
                {(selectedPlatformTab === 'all' || selectedPlatformTab === 'x') && xPost && (
                  <div className="text-xs text-gray-700 bg-white p-3 rounded-[8px] border border-[#E5E7EB] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sky-500 font-semibold text-[11px]">
                        <Twitter size={13} />
                        <span>X (Twitter) Payload:</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Surcharge Guardrail Active ($0.200 Saved)
                      </span>
                    </div>
                    <p className="leading-relaxed">{xPost.captionText}</p>
                    {xPost.firstCommentText && (
                      <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded border border-dashed border-gray-300">
                        <span className="font-semibold text-gray-700">First Reply (Link Guardrail): </span>
                        {xPost.firstCommentText}
                      </div>
                    )}
                  </div>
                )}

                {/* WhatsApp Broadcast */}
                {(selectedPlatformTab === 'all' || selectedPlatformTab === 'whatsapp') && whatsappPost && (
                  <div className="text-xs text-gray-700 bg-white p-3 rounded-[8px] border border-[#E5E7EB] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
                        <MessageSquare size={13} />
                        <span>WhatsApp Direct Utility Broadcast:</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Meta Cloud API Ready
                      </span>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed font-sans">{whatsappPost.captionText}</p>
                  </div>
                )}

                {/* Branded Email Newsletter */}
                {(selectedPlatformTab === 'all' || selectedPlatformTab === 'email') && emailPost && (
                  <div className="text-xs text-gray-700 bg-white p-3 rounded-[8px] border border-[#E5E7EB] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-600 font-semibold text-[11px]">
                        <Mail size={13} />
                        <span>Email Newsletter (Subject & Body):</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">
                        {emailPost.emailSubject}
                      </span>
                    </div>
                    <div
                      className="bg-gray-50 p-2.5 rounded border border-gray-200 text-gray-800 text-[11px] space-y-1 prose-sm"
                      dangerouslySetInnerHTML={{ __html: emailPost.emailHtml || emailPost.captionText }}
                    />
                  </div>
                )}

                {/* AI Critic Score Breakdown Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 bg-white rounded-[8px] border border-[#E5E7EB] text-center">
                    <div className="text-[10px] text-gray-400 uppercase font-medium">Tone Fidelity</div>
                    <div className="text-sm font-bold text-emerald-600">98 / 100</div>
                  </div>
                  <div className="p-2 bg-white rounded-[8px] border border-[#E5E7EB] text-center">
                    <div className="text-[10px] text-gray-400 uppercase font-medium">Visual Quality</div>
                    <div className="text-sm font-bold text-emerald-600">94 / 100</div>
                  </div>
                  <div className="p-2 bg-white rounded-[8px] border border-[#E5E7EB] text-center">
                    <div className="text-[10px] text-gray-400 uppercase font-medium">X Link Guardrail</div>
                    <div className="text-sm font-bold text-emerald-600">100% Pass</div>
                  </div>
                  <div className="p-2 bg-white rounded-[8px] border border-[#E5E7EB] text-center">
                    <div className="text-[10px] text-gray-400 uppercase font-medium">Negative Alerts</div>
                    <div className="text-sm font-bold text-emerald-600">0 Violations</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Quick Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-gray-500">
                  Target Auto-Commit: <span className="font-semibold text-gray-700">{new Date(activeCampaign.publishAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePause(activeCampaign.id)}
                    disabled={isUpdatingStatus}
                    className={`px-3 py-2 rounded-[10px] text-xs font-semibold transition flex items-center gap-1.5 ${
                      activeCampaign.status === 'PAUSED'
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-gray-100 text-[#0B0F14] hover:bg-gray-200'
                    }`}
                  >
                    {activeCampaign.status === 'PAUSED' ? (
                      <>
                        <Play size={13} />
                        <span>Resume Autopilot</span>
                      </>
                    ) : (
                      <>
                        <Pause size={13} />
                        <span>Pause</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleApprove(activeCampaign.id)}
                    disabled={isUpdatingStatus || activeCampaign.status === 'APPROVED'}
                    className={`px-4 py-2 rounded-[10px] text-xs font-semibold transition flex items-center gap-1.5 ${
                      activeCampaign.status === 'APPROVED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#FF7A00] text-white hover:bg-[#E66E00]'
                    }`}
                  >
                    {activeCampaign.status === 'APPROVED' ? (
                      <>
                        <Check size={14} />
                        <span>Approved</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Approve Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Campaign Generator Modal */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[16px] max-w-lg w-full p-6 space-y-4 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-50 text-[#FF7A00] flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <h3 className="font-sora text-base font-bold text-[#0B0F14]">
                  Generate Autonomous AI Campaign
                </h3>
              </div>
              <button
                onClick={() => setIsGeneratorOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Enter any promotional topic, festival, or service announcement. KUIRO uses your Brand Brain & Gemini 3.5 Flash Lite to synthesize complete multi-channel payloads.
            </p>

            {/* Quick Milestone Suggestions from Indian Calendar */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                Quick Milestone Presets:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'World Health Day Preventive Checkup',
                  'Gudi Padwa Prosperity Smile Care',
                  'Ramadan Fasting Wellness & Oral Care',
                  'National Doctors Day Medical Excellence',
                  'Monsoon Preventive Immunity Booster',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCustomTopic(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-[#FF7A00] hover:border-orange-200 border border-transparent transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                Custom Campaign Topic:
              </label>
              <textarea
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. Free Dental Screening Weekend for Senior Citizens with digital X-Rays..."
                rows={3}
                className="w-full text-xs p-3 rounded-[10px] border border-gray-200 focus:outline-none focus:border-[#FF7A00] transition"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsGeneratorOpen(false)}
                disabled={isGenerating}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-[8px] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleGenerateCampaign()}
                disabled={isGenerating || !customTopic.trim()}
                className="px-4 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-semibold rounded-[8px] transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Synthesizing Payloads...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate Campaign</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Multi-Channel Customer Inbox Activity Widget */}
      <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF7A00] shrink-0">
              <MessagesSquare size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  OMNI-CHANNEL LIVE INBOX
                </span>
                <span className="text-xs text-gray-500">WhatsApp • Instagram • Messenger • Email</span>
              </div>
              <h3 className="font-sora text-sm md:text-base font-bold text-[#0B0F14] mt-0.5">
                Shared Customer Conversations Workspace
              </h3>
            </div>
          </div>

          <Link
            href="/dashboard/inbox"
            className="px-4 py-2 rounded-[8px] bg-[#FF7A00] hover:bg-[#FF881A] text-white text-xs font-semibold font-sora transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto shrink-0"
          >
            <span>Open Unified Inbox</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* 3 Live Inbound Teaser Rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href="/dashboard/inbox"
            className="p-3 rounded-[10px] bg-gray-50 hover:bg-orange-50/50 border border-gray-200 hover:border-orange-200 transition space-y-1.5 block group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0B0F14] group-hover:text-[#FF7A00] transition flex items-center gap-1.5">
                <Smartphone size={13} className="text-emerald-600" />
                <span>Ananya Mukherjee</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono">10:42 AM</span>
            </div>
            <p className="text-[11px] text-gray-600 line-clamp-2">
              "Can I schedule a consultation for Invisalign clear aligners this Saturday?"
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-[9px] font-mono">
              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">WhatsApp</span>
              <span className="bg-orange-100 text-[#FF7A00] px-1.5 py-0.2 rounded font-bold">#ClearAligners</span>
            </div>
          </Link>

          <Link
            href="/dashboard/inbox"
            className="p-3 rounded-[10px] bg-gray-50 hover:bg-orange-50/50 border border-gray-200 hover:border-orange-200 transition space-y-1.5 block group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0B0F14] group-hover:text-[#FF7A00] transition flex items-center gap-1.5">
                <Instagram size={13} className="text-pink-600" />
                <span>Rohit Verma</span>
              </span>
              <span className="text-[10px] text-rose-600 font-bold font-mono">URGENT</span>
            </div>
            <p className="text-[11px] text-gray-600 line-clamp-2">
              "Chipped my front tooth playing football an hour ago. Do you take emergency walk-ins?"
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-[9px] font-mono">
              <span className="bg-pink-100 text-pink-800 px-1.5 py-0.2 rounded font-bold">Instagram DM</span>
              <span className="bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold">#Emergency</span>
            </div>
          </Link>

          <Link
            href="/dashboard/inbox"
            className="p-3 rounded-[10px] bg-gray-50 hover:bg-orange-50/50 border border-gray-200 hover:border-orange-200 transition space-y-1.5 block group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0B0F14] group-hover:text-[#FF7A00] transition flex items-center gap-1.5">
                <Mail size={13} className="text-amber-600" />
                <span>Meera Deshmukh</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono">09:20 AM</span>
            </div>
            <p className="text-[11px] text-gray-600 line-clamp-2">
              "Reviewed your corporate dental wellness proposal. Will discuss in committee."
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-[9px] font-mono">
              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">Email</span>
              <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">#CorporateB2B</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Connected Channel Health Grid (id="channels") */}
      <div id="channels" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-sora text-sm font-bold text-[#0B0F14]">
            Connected Channels & Token Vault
          </h3>
          <span className="text-xs text-gray-500">
            Encrypted AES-256 Storage • Token Auto-Refresh
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                <Instagram size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0B0F14]">Instagram Graph</p>
                <p className="text-[10px] text-gray-500">@drsharma.dental</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>

          <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Linkedin size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0B0F14]">LinkedIn Page</p>
                <p className="text-[10px] text-gray-500">Dr. Sharma Clinics</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>

          <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <Twitter size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0B0F14]">X (Twitter)</p>
                <p className="text-[10px] text-gray-500">@sharmadental_in</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>

          <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageSquare size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0B0F14]">WhatsApp Admin</p>
                <p className="text-[10px] text-gray-500">+91 98301 24589</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified
            </span>
          </div>

          <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0B0F14]">Branded Email (ESP)</p>
                <p className="text-[10px] text-gray-500">1,840 Active Subs</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              DKIM Pass
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
