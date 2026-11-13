'use client';

import React, { useState, useEffect } from 'react';
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
  Info
} from 'lucide-react';

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'kuiro',
      type: 'template',
      text: `✨ *Holi 2026 Campaign Queued*\n\nYour campaign for *Dr. Sharma Dental Care* is ready for multi-channel publishing.\n\n🎯 *Platforms*: Instagram, LinkedIn, X, Facebook, Email Newsletter\n🛡️ *AI Critic Score*: 96.8 / 100\n⏳ *Auto-Commit Window*: 48 Hours\n\n_If no action is taken, KUIRO will automatically publish this on March 4 at 9:00 AM IST._`,
      imageUrl: '/brand/kuiro-primary.svg',
      time: '10:00 AM',
      buttons: [
        { label: '✅ Approve & Schedule', action: 'approve' },
        { label: '🎙️ Request Revision (Voice)', action: 'voice_prompt' },
        { label: '⏸️ Emergency Pause', action: 'pause' },
      ],
    },
  ]);

  const [stateStatus, setStateStatus] = useState<
    'WAITING_48H' | 'APPROVED' | 'REVISING' | 'REVISED' | 'PAUSED' | 'PUBLISHED'
  >('WAITING_48H');
  const [revisionCount, setRevisionCount] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [customText, setCustomText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([
    '[09:59:58 AM] [Cultural Cron] Found festival trigger "Holi" for TODAY + 2 DAYS',
    '[10:00:00 AM] [Gemini 2.5] Generated structured multi-channel JSON payload',
    '[10:00:02 AM] [Satori + Sharp] Programmatic high-DPI canvas rendered',
    '[10:00:03 AM] [AI Critic] Evaluated brand constraints: Score 96.8 (Passed)',
    '[10:00:04 AM] [WhatsApp Webhook] Contact sheet utility template dispatched to +91 98301 24589',
    '[10:00:05 AM] [Inngest State Machine] Entered step.waitForEvent("whatsapp/admin.action", timeout: "48h")',
  ]);

  const handleAction = async (action: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
        `[${now}] [Inngest Event] Received "whatsapp/admin.action" -> action: "APPROVE"`,
        `[${now}] [Publisher] Campaign verified. Auto-commit confirmed for March 4 at 09:00 AM IST.`,
      ]);

      setStateStatus('APPROVED');
      setIsProcessing(false);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'kuiro',
            type: 'text',
            text: '🚀 *Confirmed!* Campaign approved. Auto-commit locked in for March 4, 9:00 AM IST. I will handle all publishing and comment seeding.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 700);
    } else if (action === 'voice_prompt' || action === 'voice_hindi') {
      if (revisionCount >= 2) {
        alert('You have reached the maximum 2 free revisions for this campaign.');
        return;
      }

      setIsProcessing(true);
      const voiceText =
        action === 'voice_hindi'
          ? 'Headline thoda bold karo aur clinic helpline number 98301 24589 niche add karo.'
          : 'Please make the title punchier and emphasize that natural colors are safer for kids braces.';

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'user',
          type: 'voice',
          text: voiceText,
          voiceDuration: '0:07',
          time: now,
        },
      ]);

      setAuditLogs((prev) => [
        ...prev,
        `[${now}] [WhatsApp Webhook] Audio note received (7s audio payload)`,
        `[${now}] [Whisper / Gemini Multimodal Audio] Transcribed: "${voiceText}"`,
        `[${now}] [Inngest Event] "kuiro/campaign.revise" queued with instruction`,
        `[${now}] [Satori + Sharp] Re-rendering typography layers with updated spec...`,
      ]);

      setStateStatus('REVISING');
      setRevisionCount((prev) => prev + 1);

      setTimeout(() => {
        setIsProcessing(false);
        setStateStatus('REVISED');
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'kuiro',
            type: 'template',
            text: `✨ *Revision ${revisionCount + 1} of 2 Completed* (< 12 seconds)\n\nI have updated the headline typography and added your emergency helpline number (+91 98301 24589) to the footer.\n\n🛡️ *Updated AI Critic Score*: 98.2 / 100\n⏳ *48h Window*: Auto-Commit active.`,
            imageUrl: '/brand/kuiro-primary.svg',
            time: replyTime,
            buttons: [
              { label: '✅ Approve Revised Post', action: 'approve' },
              { label: '🎙️ Another Voice Revision', action: 'voice_hindi' },
            ],
          },
        ]);
        setAuditLogs((prev) => [
          ...prev,
          `[${replyTime}] [AI Critic] Re-scored creative: 98.2 / 100 (Pass)`,
          `[${replyTime}] [WhatsApp Webhook] Revised contact sheet sent back to user.`,
        ]);
      }, 1500);
    } else if (action === 'pause') {
      setStateStatus('PAUSED');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'user',
          type: 'text',
          text: '⏸️ Emergency Pause requested.',
          time: now,
        },
        {
          id: (Date.now() + 1).toString(),
          sender: 'kuiro',
          type: 'text',
          text: '⏸️ *Campaign Paused.* Auto-commit has been disabled. Nothing will be published to your accounts until you click Resume.',
          time: now,
        },
      ]);
      setAuditLogs((prev) => [
        ...prev,
        `[${now}] [Inngest Event] "whatsapp/admin.action" -> action: "EMERGENCY_PAUSE"`,
        `[${now}] [Autopilot State Machine] Halting 48h wait loop. State set to PAUSED.`,
      ]);
    }
  };

  const handleSendCustomText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

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
      `[${now}] [AI Pipeline] Interpreting revision intent with Gemini 2.5 Flash...`,
    ]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'kuiro',
          type: 'text',
          text: `Got it! Applying your feedback: "${text}". Regenerating composite in < 15 seconds.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-inter">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E7EB] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Interactive Testbench
            </span>
            <span className="text-xs text-gray-500">
              WhatsApp Cloud API + Inngest 48h Durable State Machine
            </span>
          </div>
          <h2 className="font-sora text-lg md:text-xl font-bold text-[#0B0F14] mt-1">
            WhatsApp Autopilot & Voice Revision Loop
          </h2>
          <p className="text-xs text-gray-500">
            Test how KUIRO delivers utility contact sheets to founders on WhatsApp, accepts voice notes in Hindi/English, and auto-commits after 48 hours without friction.
          </p>
        </div>

        {/* State Machine Status Pill */}
        <div className="flex items-center gap-3">
          <div className="bg-white px-3 py-2 rounded-[10px] border border-[#E5E7EB] flex items-center gap-2 text-xs">
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
            onClick={() => {
              setMessages([
                {
                  id: 'm1',
                  sender: 'kuiro',
                  type: 'template',
                  text: `✨ *Holi 2026 Campaign Queued*\n\nYour campaign for *Dr. Sharma Dental Care* is ready for multi-channel publishing.\n\n🎯 *Platforms*: Instagram, LinkedIn, X, Facebook, Email Newsletter\n🛡️ *AI Critic Score*: 96.8 / 100\n⏳ *Auto-Commit Window*: 48 Hours\n\n_If no action is taken, KUIRO will automatically publish this on March 4 at 9:00 AM IST._`,
                  imageUrl: '/brand/kuiro-primary.svg',
                  time: '10:00 AM',
                  buttons: [
                    { label: '✅ Approve & Schedule', action: 'approve' },
                    { label: '🎙️ Request Revision (Voice)', action: 'voice_prompt' },
                    { label: '⏸️ Emergency Pause', action: 'pause' },
                  ],
                },
              ]);
              setRevisionCount(0);
              setStateStatus('WAITING_48H');
            }}
            className="p-2 rounded-[10px] bg-white border border-[#E5E7EB] text-gray-600 hover:text-black transition"
            title="Reset Simulator"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

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

                {messages.map((msg) => {
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
                              className="w-full py-2 px-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-[8px] text-[11px] font-semibold text-emerald-800 text-center shadow-xs transition active:scale-98 flex items-center justify-center gap-1.5"
                            >
                              <span>{btn.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Bar */}
              <div className="bg-[#F0F2F5] p-2 border-t border-gray-200 flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleAction('voice_hindi')}
                  className="p-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition shrink-0"
                  title="Simulate Voice Note (Hindi)"
                >
                  <Mic size={16} />
                </button>
                <form onSubmit={handleSendCustomText} className="flex-1 flex items-center gap-1">
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Type WhatsApp revision message..."
                    className="flex-1 bg-white border border-gray-300 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="submit"
                    className="p-1.5 text-emerald-700 hover:text-emerald-900 transition"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="text-center mt-3">
            <span className="text-[11px] text-gray-500">
              Revisions used: <strong className="text-[#0B0F14]">{revisionCount} of 2</strong> free revisions
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
              Click a preset below to see how Indian SMB founders talk to KUIRO in natural language without opening a dashboard:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleAction('voice_hindi')}
                disabled={isProcessing}
                className="p-2.5 rounded-[10px] bg-orange-50/70 border border-orange-200 text-left hover:bg-orange-100 transition text-xs group"
              >
                <div className="flex items-center justify-between text-[#FF7A00] font-semibold text-[11px] mb-1">
                  <span>Hindi Voice Note</span>
                  <Mic size={12} />
                </div>
                <p className="text-gray-700 text-[11px] font-medium leading-snug">
                  &quot;Headline thoda bold karo aur contact number add karo.&quot;
                </p>
                <span className="text-[10px] text-gray-500 block mt-1">
                  Translates intent &gt; Recomposites in &lt;15s
                </span>
              </button>

              <button
                onClick={() => handleAction('voice_prompt')}
                disabled={isProcessing}
                className="p-2.5 rounded-[10px] bg-blue-50/70 border border-blue-200 text-left hover:bg-blue-100 transition text-xs group"
              >
                <div className="flex items-center justify-between text-blue-600 font-semibold text-[11px] mb-1">
                  <span>English Voice Note</span>
                  <Mic size={12} />
                </div>
                <p className="text-gray-700 text-[11px] font-medium leading-snug">
                  &quot;Make the title punchier for parents with kids in braces.&quot;
                </p>
                <span className="text-[10px] text-gray-500 block mt-1">
                  Preserves Brand Brain &gt; Updates copy
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
                  fn: autopilot-48h-state-machine • run_id: run_holi_2026_demo
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Deterministic
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
                  {stateStatus === 'APPROVED' ? 'READY' : 'PENDING'}
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
                  <span className={log.includes('CRITIC') || log.includes('Score') ? 'text-emerald-400' : log.includes('Inngest') ? 'text-orange-400' : 'text-gray-300'}>
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

