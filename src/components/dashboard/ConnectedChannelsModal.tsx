'use client';

import React, { useState } from 'react';
import {
  X as CloseIcon,
  CheckCircle2,
  AlertCircle,
  Instagram,
  Linkedin,
  Twitter,
  MessageSquare,
  Mail,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  KeyRound,
  Zap,
  Lock,
} from 'lucide-react';
import { PlatformKey } from '@/constants/channels';

export type { PlatformKey };

interface ConnectedChannelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlatform?: PlatformKey;
  onConnectionUpdated?: () => void;
}

export default function ConnectedChannelsModal({
  isOpen,
  onClose,
  initialPlatform = 'instagram',
  onConnectionUpdated,
}: ConnectedChannelsModalProps) {
  const [activePlatform, setActivePlatform] = useState<PlatformKey>(initialPlatform);
  const [handleOrId, setHandleOrId] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    verifiedAccount?: string;
    permissions?: string[];
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleOAuthConnect = async () => {
    try {
      const res = await fetch(`/api/auth/oauth/${activePlatform}/authorize`, {
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        alert(data.error || 'Failed to initialize OAuth 2.0 flow.');
      }
    } catch (err: any) {
      alert(err.message || 'OAuth network error.');
    }
  };

  const handleTestHandshake = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/social-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: activePlatform,
          action: 'test',
          platformAccountId: handleOrId || undefined,
          accessToken: tokenInput || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult(data);
      } else {
        setTestResult({
          success: false,
          latencyMs: data.latencyMs,
          message: data.message || data.error || 'API Handshake failed. Please verify token permissions.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test timed out.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConnection = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/social-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: activePlatform,
          action: 'connect',
          platformAccountId: handleOrId || undefined,
          accessToken: tokenInput || undefined,
          apiSecret: appSecret || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Channel successfully encrypted with AES-256-GCM and saved to Neon Vault!',
        });
        if (onConnectionUpdated) onConnectionUpdated();
      } else {
        alert(data.error || 'Failed to save connection.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save connection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-inter">
      <div className="bg-[#0B0F14] border border-[#27313F] rounded-[16px] w-full max-w-2xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1E2530] flex items-center justify-between bg-[#11141A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF7A00]/10 border border-[#FF7A00]/30 flex items-center justify-center text-[#FF7A00]">
              <Lock size={16} />
            </div>
            <div>
              <h3 className="font-sora text-sm font-bold text-white">
                OAuth 2.0 Token Vault & Channel Connections
              </h3>
              <p className="text-[11px] text-gray-400">
                AES-256-GCM Authenticated Encryption • Zero Surcharge Link Guard Active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex border-b border-[#1E2530] bg-[#141B22] px-6 gap-2 overflow-x-auto py-2">
          {[
            { id: 'instagram', label: 'Meta (IG / FB)', icon: Instagram, color: 'text-pink-500' },
            { id: 'linkedin', label: 'LinkedIn Page', icon: Linkedin, color: 'text-blue-500' },
            { id: 'x', label: 'X (Twitter)', icon: Twitter, color: 'text-sky-400' },
            { id: 'whatsapp', label: 'WhatsApp Cloud', icon: MessageSquare, color: 'text-emerald-400' },
            { id: 'email', label: 'Branded ESP', icon: Mail, color: 'text-amber-400' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activePlatform === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActivePlatform(tab.id as PlatformKey);
                  setTestResult(null);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-[#1E2530] text-white border border-[#374151]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Icon size={14} className={tab.color} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Platform Specific Banner */}
          {activePlatform === 'instagram' && (
            <div className="p-3.5 rounded-xl bg-pink-950/30 border border-pink-900/50 flex items-start gap-3">
              <Instagram className="text-pink-400 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-semibold text-pink-200">Meta Graph API (Instagram Professional)</p>
                <p className="text-gray-400 text-[11px] mt-0.5">
                  Publishes 4:5 visual carousels, reels, and captions. Requires an Instagram Business/Creator account linked to a Meta Facebook Page.
                </p>
              </div>
            </div>
          )}

          {activePlatform === 'linkedin' && (
            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/50 flex items-start gap-3">
              <Linkedin className="text-blue-400 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-semibold text-blue-200">LinkedIn Community Management API</p>
                <p className="text-gray-400 text-[11px] mt-0.5">
                  Publishes thought-leadership editorial posts, 1:1 banners, and hashtag sets directly to your LinkedIn Organization or Founder Page.
                </p>
              </div>
            </div>
          )}

          {activePlatform === 'x' && (
            <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-900/50 flex items-start gap-3">
              <Twitter className="text-sky-400 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-semibold text-sky-200">X (Twitter) v2 Developer App &amp; Guardrail</p>
                <p className="text-gray-400 text-[11px] mt-0.5">
                  Autonomous 240-char tweets. <strong className="text-amber-300">Unit-Economics Guardrail:</strong> External URLs are placed automatically in the first comment, saving $0.200 per post on X API surcharges.
                </p>
              </div>
            </div>
          )}

          {activePlatform === 'whatsapp' && (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex items-start gap-3">
              <MessageSquare className="text-emerald-400 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-semibold text-emerald-200">Meta WhatsApp Cloud API (48h Guardian)</p>
                <p className="text-gray-400 text-[11px] mt-0.5">
                  Sends interactive campaign contact-sheet previews to the founder 48 hours prior to launch. Auto-commits if no voice/text revisions arrive.
                </p>
              </div>
            </div>
          )}

          {activePlatform === 'email' && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/50 flex items-start gap-3">
              <Mail className="text-amber-400 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-semibold text-amber-200">Transactional ESP &amp; DKIM Relay</p>
                <p className="text-gray-400 text-[11px] mt-0.5">
                  Sends branded newsletters, customer drops, and promotional announcements using authenticated domain credentials.
                </p>
              </div>
            </div>
          )}

          {/* 1-Click OAuth 2.0 Connect Action */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#161C24] border border-[#27313F]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FF7A00]/15 flex items-center justify-center text-[#FF7A00]">
                <Zap size={16} />
              </div>
              <div>
                <p className="font-semibold text-white text-xs">Official 1-Click OAuth 2.0</p>
                <p className="text-[11px] text-gray-400">Authenticate directly through {activePlatform.toUpperCase()} consent dialog</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOAuthConnect}
              className="px-3.5 py-1.5 rounded-lg bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-semibold flex items-center gap-1.5 transition font-sora shadow-sm"
            >
              <span>Connect {activePlatform.toUpperCase()}</span>
              <ExternalLink size={12} />
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-[#1E2530]"></div>
            <span className="shrink mx-3 text-[10px] uppercase font-mono text-gray-500">Or Manual AES-256 Token Vault</span>
            <div className="grow border-t border-[#1E2530]"></div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 font-medium mb-1">
                {activePlatform === 'instagram' && 'Instagram Handle or Meta Page ID'}
                {activePlatform === 'linkedin' && 'LinkedIn Organization URN or Vanity Name'}
                {activePlatform === 'x' && 'X (Twitter) Handle or Developer App ID'}
                {activePlatform === 'whatsapp' && 'WhatsApp Business Phone Number ID'}
                {activePlatform === 'email' && 'Sender Email Address / Domain'}
              </label>
              <input
                type="text"
                value={handleOrId}
                onChange={(e) => setHandleOrId(e.target.value)}
                placeholder={
                  activePlatform === 'instagram'
                    ? '@sharmaheritage'
                    : activePlatform === 'linkedin'
                    ? 'urn:li:organization:8472910'
                    : activePlatform === 'x'
                    ? '@sharmaheritage_in'
                    : activePlatform === 'whatsapp'
                    ? '+91 98301 24589'
                    : 'hello@kuiro.in'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141B22] border border-[#27313F] text-white placeholder-gray-500 focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">
                OAuth 2.0 User / Long-Lived Access Token
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="EAAGm0PX4ZC0IBO84..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141B22] border border-[#27313F] text-white placeholder-gray-500 focus:outline-none focus:border-[#FF7A00] font-mono text-xs pr-10"
                />
                <KeyRound size={16} className="absolute right-3.5 top-3 text-gray-500" />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Tokens are encrypted in Neon DB with AES-256-GCM and refreshed automatically via background cron.
              </p>
            </div>
          </div>

          {/* Test Handshake Result Box */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                testResult.success
                  ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-800 text-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold">{testResult.message}</p>
                {testResult.latencyMs && (
                  <p className="text-[11px] text-gray-400">
                    Response Latency: <span className="text-emerald-400 font-mono font-bold">{testResult.latencyMs}ms</span> • Account: <span className="text-white font-mono">{testResult.verifiedAccount}</span>
                  </p>
                )}
                {testResult.permissions && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {testResult.permissions.map((p) => (
                      <span
                        key={p}
                        className="text-[9px] font-mono bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-[#1E2530] bg-[#11141A] flex items-center justify-between">
          <button
            onClick={handleTestHandshake}
            disabled={isTesting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1E2530] hover:bg-[#27313F] text-gray-200 text-xs font-semibold transition border border-gray-700 disabled:opacity-50"
          >
            {isTesting ? <RefreshCw size={14} className="animate-spin text-[#FF7A00]" /> : <Zap size={14} className="text-[#FF7A00]" />}
            <span>{isTesting ? 'Verifying Handshake...' : 'Test Connection Handshake'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-xs transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveConnection}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#E06A00] text-white text-xs font-bold transition shadow-lg shadow-orange-950/40 disabled:opacity-50"
            >
              <ShieldCheck size={14} />
              <span>{isSaving ? 'Encrypting & Saving...' : 'Save to Token Vault'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
