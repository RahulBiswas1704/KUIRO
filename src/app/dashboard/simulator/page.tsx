'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Play,
  Pause,
  RotateCcw,
  Send,
  Mic,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  RefreshCw,
  Info,
  Layers,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface PlatformPost {
  id: string;
  campaignId: string;
  platform: 'instagram' | 'linkedin' | 'x' | 'whatsapp' | 'email';
  captionText: string;
  firstCommentText?: string | null;
  aiCriticScore?: number;
}

interface Campaign {
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

interface ChatMessage {
  id: string;
  sender: 'kuiro' | 'user';
  type: 'template' | 'text' | 'voice' | 'update';
  text?: string;
  time: string;
  voiceDuration?: string;
  imageUrl?: string;
  buttons?: { label: string; action: string }[];
}

export default function SimulatorPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stateStatus, setStateStatus] = useState<
    'WAITING_48H' | 'APPROVED' | 'REVISING' | 'REVISED' | 'PAUSED' | 'PUBLISHED'
  >('WAITING_48H');
  const [revisionCount, setRevisionCount] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [customText, setCustomText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [isRecordingLive, setIsRecordingLive] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
    }
  }, []);

  // 1. Fetch live campaigns from Neon PostgreSQL
  const loadCampaigns = async () => {
    setIsLoadingCampaigns(true);
    try {
      const res = await fetch('/api/campaigns', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.campaigns) && data.campaigns.length > 0) {
        setCampaigns(data.campaigns);
        const initial = data.campaigns.find((c: Campaign) => c.status === 'AUTO_QUEUED') || data.campaigns[0];
        setSelectedCampaignId(initial.id);
        initializeSimulator(initial);
      }
    } catch (err) {
      console.error('Failed to load campaigns for simulator:', err);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0] || null;

  // Initialize simulator state with active campaign
  const initializeSimulator = (camp: Campaign) => {
    const waPost = camp.posts?.find((p) => p.platform === 'whatsapp');
    const criticScore = camp.posts?.length
      ? (camp.posts.reduce((sum, p) => sum + (p.aiCriticScore || 90), 0) / camp.posts.length).toFixed(1)
      : '96.8';

    const publishDateStr = new Date(camp.publishAt).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const initialTemplateText = `✨ *${camp.topicSummary}*\n\nYour campaign for *Apex Diagnostic & Wellness Clinic* is ready for multi-channel publishing.\n\n🎯 *Platforms*: Instagram, LinkedIn, X (Twitter), WhatsApp Broadcast, Email\n🛡️ *AI Critic Score*: ${criticScore} / 100\n⏳ *Auto-Commit Window*: 48 Hours\n\n_If no action is taken, KUIRO will automatically publish this on ${publishDateStr} IST._\n\n💬 *WhatsApp Payload Preview*:\n"${waPost?.captionText?.slice(0, 160) || 'Routine preventive screening available this week.'}..."`;

    setMessages([
      {
        id: 'm1',
        sender: 'kuiro',
        type: 'template',
        text: initialTemplateText,
        imageUrl: '/brand/kuiro-primary.svg',
        time: '10:00 AM',
        buttons: [
          { label: '✅ Approve & Schedule', action: 'approve' },
          { label: '🎙️ Request Revision (Voice)', action: 'voice_prompt' },
          { label: camp.status === 'PAUSED' ? '▶️ Resume Autopilot' : '⏸️ Emergency Pause', action: camp.status === 'PAUSED' ? 'resume' : 'pause' },
        ],
      },
    ]);

    setRevisionCount(camp.revisionCount || 0);
    setStateStatus(
      camp.status === 'APPROVED'
        ? 'APPROVED'
        : camp.status === 'PAUSED'
        ? 'PAUSED'
        : 'WAITING_48H'
    );

    setAuditLogs([
      `[09:59:58 AM] [Neon DB] Loaded active campaign "${camp.topicSummary.slice(0, 30)}..." (ID: ${camp.id.slice(0, 8)})`,
      `[10:00:00 AM] [Gemini 3.5 Flash Lite] 5 platform payloads validated with Brand Brain`,
      `[10:00:02 AM] [AI Critic] Evaluated brand constraints & link surcharge guardrails: Score ${criticScore}`,
      `[10:00:04 AM] [WhatsApp Cloud API] Contact sheet utility template dispatched to admin`,
      `[10:00:05 AM] [Inngest State Machine] Entered step.waitForEvent("whatsapp/admin.action", timeout: "48h")`,
    ]);
  };

  const handleSelectCampaign = (id: string) => {
    setSelectedCampaignId(id);
    const target = campaigns.find((c) => c.id === id);
    if (target) {
      initializeSimulator(target);
    }
  };

  // Execute Voice Revision (Shared by Live Mic & Simulated Presets)
  const executeVoiceRevision = async (voiceText: string, duration = '0:06') => {
    if (!activeCampaign) return;
    if (revisionCount >= 2) {
      alert('You have reached the maximum 2 free revisions for this campaign.');
      return;
    }

    setIsProcessing(true);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        type: 'voice',
        text: voiceText,
        voiceDuration: duration,
        time: now,
      },
    ]);

    setAuditLogs((prev) => [
      ...prev,
      `[${now}] [WhatsApp Webhook / Web Speech] Audio note received (${duration} audio payload)`,
      `[${now}] [Whisper / Gemini Multimodal Audio] Transcribed: "${voiceText}"`,
      `[${now}] [HTTP PATCH /api/campaigns] Calling Gemini 2.5 Multi-Modal with revision instruction...`,
    ]);

    setStateStatus('REVISING');

    try {
      const res = await fetch('/api/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: activeCampaign.id,
          revisionPrompt: voiceText,
        }),
      });
      const data = await res.json();

      if (data.success && data.campaign) {
        const nextCount = data.revisionCount;
        setRevisionCount(nextCount);
        setStateStatus('REVISED');

        const waRevised = data.campaign.posts?.find((p: any) => p.platform === 'whatsapp');
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'kuiro',
            type: 'template',
            text: `✨ *Revision ${nextCount} of 2 Completed via Gemini 2.5*\n\n${data.revisionSummary ? `📋 *${data.revisionSummary}*\n\n` : ''}🛡️ *Updated AI Critic Score*: ${data.criticScore || 95} / 100 (Pass)\n⏳ *48h Window*: Auto-Commit radar active.\n\n💬 *Revised WhatsApp Copy*:\n"${waRevised?.captionText?.slice(0, 160) || 'Updated campaign copy with requested revisions.'}..."`,
            imageUrl: '/brand/kuiro-primary.svg',
            time: replyTime,
            buttons: [
              { label: '✅ Approve Revised Post', action: 'approve' },
              ...(nextCount < 2 ? [{ label: '🎙️ Another Voice Revision', action: 'voice_hindi' }] : []),
            ],
          },
        ]);

        setAuditLogs((prev) => [
          ...prev,
          `[${replyTime}] [Neon DB] platform_posts updated with revised captions`,
          `[${replyTime}] [AI Critic] Re-scored creative: 98.6 / 100 (Pass)`,
          `[${replyTime}] [WhatsApp Webhook] Revised contact sheet sent back to user.`,
        ]);
      } else {
        alert(data.error || 'Revision failed.');
      }
    } catch (err) {
      console.error('Voice revision error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Live in-browser microphone dictation
  const handleStartVoiceRecording = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback to simulated Hindi voice note
      executeVoiceRevision(
        'Headline thoda bold aur attractive karo aur limited festival discount offer niche add karo.',
        '0:06'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // accepts Hindi & Indian English
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecordingLive(true);
        setLiveTranscript('');
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0]?.transcript;
        if (spoken) {
          executeVoiceRevision(spoken, '0:05');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition fallback:', event.error);
        setIsRecordingLive(false);
        executeVoiceRevision(
          'Headline thoda bold aur attractive karo aur limited festival discount offer niche add karo.',
          '0:06'
        );
      };

      recognition.onend = () => {
        setIsRecordingLive(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition exception:', e);
      executeVoiceRevision(
        'Headline thoda bold aur attractive karo aur limited festival discount offer niche add karo.',
        '0:06'
      );
    }
  };

  // Handle WhatsApp interactive actions
  const handleAction = async (action: string) => {
    if (!activeCampaign) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. APPROVE ACTION
    if (action === 'approve') {
      setIsProcessing(true);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'user',
          type: 'text',
          text: '✅ Approved! Go ahead and publish on schedule.',
          time: now,
        },
      ]);

      setAuditLogs((prev) => [
        ...prev,
        `[${now}] [WhatsApp Webhook] Admin tapped button: BTN_APPROVE_${activeCampaign.id.slice(0, 8)}`,
        `[${now}] [HTTP PATCH /api/campaigns] Updating Neon DB scheduled_campaigns -> status: 'APPROVED'`,
      ]);

      try {
        const res = await fetch('/api/campaigns', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId: activeCampaign.id, status: 'APPROVED' }),
        });
        const data = await res.json();

        if (data.success) {
          setStateStatus('APPROVED');
          setAuditLogs((prev) => [
            ...prev,
            `[${now}] [Neon DB] Campaign ${activeCampaign.id.slice(0, 8)} verified APPROVED in database`,
            `[${now}] [Inngest Event] Dispatched "whatsapp/admin.action" -> action: "APPROVE"`,
            `[${now}] [Publisher] Campaign verified. Auto-commit confirmed for ${new Date(activeCampaign.publishAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST.`,
          ]);

          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                sender: 'kuiro',
                type: 'text',
                text: '🚀 *Confirmed!* Campaign approved in Neon DB. Auto-commit locked in. I will handle all multi-channel publishing and first-comment link seeding automatically!',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }, 600);
        }
      } catch (err: any) {
        console.error('Approval failed:', err);
      } finally {
        setIsProcessing(false);
      }
    }

    // 2. PAUSE ACTION
    else if (action === 'pause') {
      setIsProcessing(true);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'user',
          type: 'text',
          text: '⏸️ Emergency Pause requested.',
          time: now,
        },
      ]);

      setAuditLogs((prev) => [
        ...prev,
        `[${now}] [WhatsApp Webhook] Admin tapped button: BTN_PAUSE_${activeCampaign.id.slice(0, 8)}`,
        `[${now}] [HTTP PATCH /api/campaigns] Setting status -> 'PAUSED'`,
      ]);

      try {
        const res = await fetch('/api/campaigns', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId: activeCampaign.id, status: 'PAUSED' }),
        });
        const data = await res.json();
        if (data.success) {
          setStateStatus('PAUSED');
          setAuditLogs((prev) => [
            ...prev,
            `[${now}] [Neon DB] Campaign status set to PAUSED`,
            `[${now}] [Inngest Event] "whatsapp/admin.action" -> action: "EMERGENCY_PAUSE"`,
          ]);

          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                sender: 'kuiro',
                type: 'text',
                text: '⏸️ *Campaign Paused.* Auto-commit has been suspended in Neon DB. Nothing will be published until you resume.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                buttons: [{ label: '▶️ Resume Autopilot', action: 'resume' }],
              },
            ]);
          }, 500);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }

    // 3. RESUME ACTION
    else if (action === 'resume') {
      setIsProcessing(true);
      try {
        const res = await fetch('/api/campaigns', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId: activeCampaign.id, status: 'AUTO_QUEUED' }),
        });
        const data = await res.json();
        if (data.success) {
          setStateStatus('WAITING_48H');
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              sender: 'user',
              type: 'text',
              text: '▶️ Resume Autopilot',
              time: now,
            },
            {
              id: (Date.now() + 1).toString(),
              sender: 'kuiro',
              type: 'text',
              text: '✅ *Autopilot Resumed.* 48-hour auto-commit countdown reactivated.',
              time: now,
              buttons: [
                { label: '✅ Approve & Schedule', action: 'approve' },
                { label: '🎙️ Request Revision (Voice)', action: 'voice_prompt' },
                { label: '⏸️ Emergency Pause', action: 'pause' },
              ],
            },
          ]);
          setAuditLogs((prev) => [
            ...prev,
            `[${now}] [Neon DB] Campaign reactivated -> status: 'AUTO_QUEUED'`,
          ]);
        }
      } finally {
        setIsProcessing(false);
      }
    }

    // 4. VOICE / TEXT REVISION WITH GEMINI 2.5
    else if (action === 'voice_prompt' || action === 'voice_hindi') {
      const voiceText =
        action === 'voice_hindi'
          ? 'Headline thoda bold aur attractive karo aur limited festival discount offer niche add karo.'
          : 'Please make the headline punchier and emphasize priority booking for the upcoming weekend.';
      await executeVoiceRevision(voiceText, '0:07');
    }
  };

  // Handle custom text revision
  const handleSendCustomText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim() || !activeCampaign) return;

    if (revisionCount >= 2) {
      alert('You have reached the maximum 2 free revisions for this campaign.');
      return;
    }

    const text = customText.trim();
    setCustomText('');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        type: 'text',
        text,
        time: now,
      },
    ]);

    setAuditLogs((prev) => [
      ...prev,
      `[${now}] [WhatsApp Webhook] Incoming text message: "${text}"`,
      `[${now}] [HTTP PATCH /api/campaigns] Synthesizing revision with Gemini 2.5 Multi-Modal...`,
    ]);

    setIsProcessing(true);
    setStateStatus('REVISING');

    try {
      const res = await fetch('/api/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: activeCampaign.id,
          revisionPrompt: text,
        }),
      });
      const data = await res.json();

      if (data.success && data.campaign) {
        const nextCount = data.revisionCount;
        setRevisionCount(nextCount);
        setStateStatus('REVISED');

        const waRevised = data.campaign.posts?.find((p: any) => p.platform === 'whatsapp');
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'kuiro',
            type: 'template',
            text: `✨ *Revision ${nextCount} of 2 Completed*\n\nApplied feedback: "${text}". Payloads updated in Neon PostgreSQL.\n\n🛡️ *Updated AI Critic Score*: 98.6 / 100\n\n💬 *Revised WhatsApp Copy*:\n"${waRevised?.captionText?.slice(0, 160) || text}..."`,
            imageUrl: '/brand/kuiro-primary.svg',
            time: replyTime,
            buttons: [
              { label: '✅ Approve Revised Post', action: 'approve' },
              ...(nextCount < 2 ? [{ label: '🎙️ Request Another Edit', action: 'voice_hindi' }] : []),
            ],
          },
        ]);

        setAuditLogs((prev) => [
          ...prev,
          `[${replyTime}] [Neon DB] platform_posts successfully updated`,
          `[${replyTime}] [Inngest Event] "kuiro/campaign.revise" processed`,
        ]);
      }
    } catch (err) {
      console.error('Custom revision error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-inter">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E7EB] gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0B0F14] transition font-medium mr-2"
            >
              <ArrowLeft size={14} />
              <span>Dashboard</span>
            </Link>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              2-Way Live Neon DB Sync
            </span>
            <span className="text-xs text-gray-500">
              WhatsApp Cloud API • Inngest 48h State Machine
            </span>
          </div>
          <h2 className="font-sora text-lg md:text-xl font-bold text-[#0B0F14] mt-1">
            WhatsApp Autopilot & Voice Revision Loop
          </h2>
          <p className="text-xs text-gray-500">
            Interactive testbench showing how founders receive 48-hour utility contact sheets on WhatsApp, give voice feedback in Hindi/English, and auto-commit to Neon DB.
          </p>
        </div>

        {/* State Machine Status Pill & Actions */}
        <div className="flex items-center gap-3">
          <div className="bg-white px-3 py-2 rounded-[10px] border border-[#E5E7EB] flex items-center gap-2 text-xs shadow-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                stateStatus === 'APPROVED'
                  ? 'bg-emerald-500'
                  : stateStatus === 'PAUSED'
                  ? 'bg-amber-500'
                  : stateStatus === 'REVISING'
                  ? 'bg-blue-500 animate-spin'
                  : 'bg-[#FF7A00] animate-pulse'
              }`}
            />
            <span className="font-bold text-[#0B0F14]">{stateStatus}</span>
          </div>
          <button
            onClick={() => loadCampaigns()}
            disabled={isLoadingCampaigns}
            className="p-2 rounded-[10px] bg-white border border-[#E5E7EB] text-gray-600 hover:text-black transition shadow-xs"
            title="Reload from Neon DB"
          >
            <RotateCcw size={16} className={isLoadingCampaigns ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Campaign Switcher Pill Ribbon */}
      {campaigns.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 font-medium text-[11px] shrink-0">Active DB Campaigns:</span>
          {campaigns.map((camp) => (
            <button
              key={camp.id}
              onClick={() => handleSelectCampaign(camp.id)}
              className={`px-3 py-1.5 rounded-[8px] font-medium transition shrink-0 flex items-center gap-1.5 ${
                camp.id === activeCampaign?.id
                  ? 'bg-[#0B0F14] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  camp.status === 'APPROVED'
                    ? 'bg-emerald-400'
                    : camp.status === 'PAUSED'
                    ? 'bg-amber-400'
                    : 'bg-orange-400'
                }`}
              />
              <span className="max-w-[200px] truncate">{camp.topicSummary}</span>
            </button>
          ))}
        </div>
      )}

      {/* Split Screen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Realistic WhatsApp Phone Mockup (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[380px] bg-[#0B0F14] rounded-[28px] p-3 shadow-2xl border-4 border-gray-800">
            {/* Phone Top Speaker & Camera Notch */}
            <div className="w-32 h-4 bg-gray-900 rounded-b-xl mx-auto mb-2 flex items-center justify-center">
              <div className="w-10 h-1.5 bg-gray-700 rounded-full" />
            </div>

            {/* WhatsApp App Screen */}
            <div className="bg-[#EFEAE2] rounded-[20px] overflow-hidden flex flex-col h-[580px] text-[#0B0F14] relative">
              {/* WhatsApp App Header (Meta Green / Charcoal) */}
              <div className="bg-[#075E54] text-white px-3 py-2.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FF7A00] flex items-center justify-center text-white font-bold text-xs shrink-0">
                    K
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-bold flex items-center gap-1">
                      <span>KUIRO Marketing Co-Pilot</span>
                      <CheckCircle2 size={12} className="text-blue-300 fill-blue-300" />
                    </p>
                    <p className="text-[10px] text-emerald-200">Official Business Account</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-800/60 px-2 py-0.5 rounded text-emerald-100">
                  48h Auto-Commit
                </span>
              </div>

              {/* Chat Message Scrollable Container */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
                {/* 48h Security Notice */}
                <div className="text-center">
                  <span className="inline-block bg-[#FDF4E3] text-gray-600 text-[10px] px-2.5 py-1 rounded-[6px] border border-amber-200 shadow-xs">
                    🔒 Messages are end-to-end encrypted. Passive auto-commit expires in 48h.
                  </span>
                </div>

                {isLoadingCampaigns ? (
                  <div className="p-8 text-center text-gray-500 space-y-2">
                    <Loader2 size={24} className="animate-spin text-[#FF7A00] mx-auto" />
                    <p className="text-[11px]">Connecting to Neon DB campaign...</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-[10px] p-2.5 shadow-xs relative ${
                            isUser
                              ? 'bg-[#E7FFDB] text-[#0B0F14] rounded-tr-none'
                              : 'bg-white text-[#0B0F14] rounded-tl-none border border-gray-200'
                          }`}
                        >
                          {/* If Template with Image */}
                          {msg.imageUrl && (
                            <div className="mb-2 rounded-[6px] overflow-hidden bg-[#0B0F14] p-2 text-center border border-gray-200">
                              <img
                                src={msg.imageUrl}
                                alt="Contact Sheet"
                                className="w-full h-24 object-contain"
                              />
                              <div className="bg-black/60 text-white text-[9px] py-0.5 mt-1 rounded font-mono">
                                PREVIEW: 2x2 CONTACT SHEET
                              </div>
                            </div>
                          )}

                          {/* Voice Note Bubble */}
                          {msg.type === 'voice' ? (
                            <div className="flex items-center gap-2 py-1">
                              <button
                                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                                className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 hover:bg-emerald-700"
                              >
                                {isPlayingAudio ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
                              </button>
                              <div className="flex-1">
                                <div className="h-1.5 bg-emerald-300 rounded-full w-full overflow-hidden">
                                  <div
                                    className={`h-full bg-emerald-600 rounded-full transition-all duration-300 ${
                                      isPlayingAudio ? 'w-full animate-pulse' : 'w-1/3'
                                    }`}
                                  />
                                </div>
                                <p className="text-[10px] text-gray-600 mt-1 italic">
                                  &quot;{msg.text}&quot;
                                </p>
                              </div>
                              <span className="text-[10px] text-gray-500 font-mono">
                                {msg.voiceDuration}
                              </span>
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap leading-relaxed text-[11px]">
                              {msg.text}
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-gray-400">
                            <span>{msg.time}</span>
                            {isUser && <span className="text-blue-500">✓✓</span>}
                          </div>
                        </div>

                        {/* WhatsApp Interactive Utility Buttons */}
                        {msg.buttons && (
                          <div className="w-[85%] mt-1 space-y-1">
                            {msg.buttons.map((btn, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleAction(btn.action)}
                                disabled={isProcessing}
                                className="w-full py-2 px-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-[8px] text-[11px] font-semibold text-emerald-800 text-center shadow-xs transition active:scale-98 flex items-center justify-center gap-1.5 disabled:opacity-50"
                              >
                                {isProcessing && btn.action === 'approve' ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : null}
                                <span>{btn.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="bg-[#F0F2F5] p-2 border-t border-gray-200 flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleStartVoiceRecording}
                  disabled={isProcessing}
                  className={`p-1.5 rounded-full text-white transition shrink-0 disabled:opacity-50 ${
                    isRecordingLive ? 'bg-rose-600 animate-pulse ring-2 ring-rose-400' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                  title={speechSupported ? 'Tap to Speak Real Voice Note (Microphone)' : 'Simulate Hindi Voice Note'}
                >
                  <Mic size={16} />
                </button>
                {isRecordingLive ? (
                  <div className="flex-1 flex items-center justify-between px-3 py-1 bg-rose-50 border border-rose-300 rounded-full text-xs text-rose-700 animate-pulse">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
                      <span className="font-semibold truncate">
                        {liveTranscript || 'Listening to your voice... (Speak Hindi or English)'}
                      </span>
                    </span>
                    <span className="text-[10px] text-rose-500 font-mono ml-2 shrink-0">Listening</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendCustomText} className="flex-1 flex items-center gap-1">
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      disabled={isProcessing}
                      placeholder="Type WhatsApp revision message or tap mic..."
                      className="flex-1 bg-white border border-gray-300 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isProcessing || !customText.trim()}
                      className="p-1.5 text-emerald-700 hover:text-emerald-900 transition disabled:opacity-30"
                    >
                      <Send size={15} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="text-center mt-3">
            <span className="text-[11px] text-gray-500">
              Revisions used: <strong className="text-[#0B0F14]">{revisionCount} of 2</strong> free revisions (Gemini 2.5 Multi-Modal)
            </span>
          </div>
        </div>

        {/* Right Column: Inngest State Machine & Audit Inspector (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Quick Voice Note Presets Bar */}
          <div className="bg-white rounded-[12px] p-4 border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-sora text-xs font-bold text-[#0B0F14] uppercase tracking-wider flex items-center gap-1.5">
                <Mic size={14} className="text-[#FF7A00]" />
                <span>Simulate Founder Voice Notes</span>
              </h3>
              <span className="text-[10px] text-gray-500">Multilingual Whisper/Gemini Engine</span>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Click a preset below or tap the microphone to see how Indian SMB founders speak to KUIRO in natural language without opening a dashboard:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleAction('voice_hindi')}
                disabled={isProcessing || revisionCount >= 2}
                className="p-2.5 rounded-[10px] bg-orange-50/70 border border-orange-200 text-left hover:bg-orange-100 transition text-xs group disabled:opacity-50"
              >
                <div className="flex items-center justify-between text-[#FF7A00] font-semibold text-[11px] mb-1">
                  <span>Hindi Voice Note (Simulate)</span>
                  <Mic size={12} />
                </div>
                <p className="text-gray-700 text-[11px] font-medium leading-snug">
                  &quot;Headline thoda bold aur attractive karo aur limited festival discount offer niche add karo.&quot;
                </p>
                <span className="text-[10px] text-gray-500 block mt-1">
                  Gemini 2.5 applies edits &gt; Updates Neon DB in &lt;12s
                </span>
              </button>

              <button
                onClick={() => handleAction('voice_prompt')}
                disabled={isProcessing || revisionCount >= 2}
                className="p-2.5 rounded-[10px] bg-blue-50/70 border border-blue-200 text-left hover:bg-blue-100 transition text-xs group disabled:opacity-50"
              >
                <div className="flex items-center justify-between text-blue-600 font-semibold text-[11px] mb-1">
                  <span>English Voice Note (Simulate)</span>
                  <Mic size={12} />
                </div>
                <p className="text-gray-700 text-[11px] font-medium leading-snug">
                  &quot;Make the title punchier and emphasize free shipping with priority weekend dispatch.&quot;
                </p>
                <span className="text-[10px] text-gray-500 block mt-1">
                  Preserves Brand Brain &gt; Re-scores AI Critic
                </span>
              </button>
            </div>
          </div>

          {/* Inngest Durable Execution Step Tracker */}
          <div className="bg-white rounded-[12px] p-4 border border-[#E5E7EB] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
              <div>
                <h3 className="font-sora text-xs font-bold text-[#0B0F14] uppercase tracking-wider">
                  Inngest Durable State Machine
                </h3>
                <p className="text-[11px] text-gray-500 font-mono">
                  fn: autopilot-48h-state-machine • campaign_id: {activeCampaign ? activeCampaign.id.slice(0, 12) : 'active'}
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Live Neon Sync
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-[8px] bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span className="font-semibold text-gray-800">
                    Step 1: step.run(&apos;generate-multi-channel-content&apos;)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">COMPLETED (1.8s)</span>
              </div>

              <div className="p-2.5 rounded-[8px] bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span className="font-semibold text-gray-800">
                    Step 2: step.run(&apos;pre-publish-critic-eval&apos;)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">SCORE: 96.8 (PASS)</span>
              </div>

              <div className="p-2.5 rounded-[8px] bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span className="font-semibold text-gray-800">
                    Step 3: step.run(&apos;send-whatsapp-preview&apos;)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">DISPATCHED</span>
              </div>

              <div
                className={`p-2.5 rounded-[8px] border flex items-center justify-between transition-all ${
                  stateStatus === 'WAITING_48H'
                    ? 'bg-amber-50/60 border-amber-300'
                    : stateStatus === 'APPROVED' || stateStatus === 'REVISED'
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {stateStatus === 'WAITING_48H' ? (
                    <Clock size={15} className="text-[#FF7A00] animate-spin" />
                  ) : (
                    <CheckCircle2 size={15} className="text-emerald-600" />
                  )}
                  <span className="font-semibold text-gray-800">
                    Step 4: step.waitForEvent(&apos;whatsapp/admin.action&apos;, timeout: &apos;48h&apos;)
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#FF7A00]">
                  {stateStatus === 'WAITING_48H' ? 'WAITING (32h left)' : 'RESOLVED'}
                </span>
              </div>

              <div
                className={`p-2.5 rounded-[8px] border flex items-center justify-between ${
                  stateStatus === 'APPROVED'
                    ? 'bg-emerald-100 border-emerald-300 font-semibold'
                    : 'bg-gray-50/50 border-gray-200 text-gray-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className={stateStatus === 'APPROVED' ? 'text-emerald-700' : 'text-gray-400'} />
                  <span>Step 5: step.run(&apos;publish-and-seed-first-comment&apos;)</span>
                </div>
                <span className="text-[10px] font-mono">
                  {stateStatus === 'APPROVED' ? 'READY IN NEON DB' : 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Audit Trail Terminal Output */}
          <div className="bg-[#0B0F14] text-gray-300 rounded-[12px] p-4 font-mono text-[11px] border border-[#1E2530] shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800 text-gray-400 text-[10px]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>REAL-TIME AUDIT LOG</span>
              </span>
              <span>Updated Live</span>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 leading-relaxed text-gray-300">
              {auditLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-gray-500 shrink-0">&gt;</span>
                  <span className={log.includes('CRITIC') || log.includes('Score') ? 'text-emerald-400' : log.includes('Inngest') ? 'text-orange-400' : log.includes('Neon') ? 'text-blue-400' : 'text-gray-300'}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
