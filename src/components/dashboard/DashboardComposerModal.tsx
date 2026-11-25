'use client';

import React from 'react';
import { ArrowRight, Loader2, Sparkles, X as CloseIcon } from 'lucide-react';
import { COMPOSER_PRESETS, type ComposerTriggerType } from './types';

interface DashboardComposerModalProps {
  isOpen: boolean;
  composerTriggerType: ComposerTriggerType;
  customTopic: string;
  selectedChannels: { [key: string]: boolean };
  isGenerating: boolean;
  onTriggerTypeChange: (trigger: ComposerTriggerType) => void;
  onCustomTopicChange: (val: string) => void;
  onSelectedChannelsChange: (next: { [key: string]: boolean }) => void;
  onGenerate: () => void;
  onClose: () => void;
}

export default function DashboardComposerModal({
  isOpen,
  composerTriggerType,
  customTopic,
  selectedChannels,
  isGenerating,
  onTriggerTypeChange,
  onCustomTopicChange,
  onSelectedChannelsChange,
  onGenerate,
  onClose,
}: DashboardComposerModalProps) {
  if (!isOpen) return null;

  return (
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
              <p className="text-[11px] text-slate-400">
                Generate multi-channel assets with 48h loop auto-commit.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-white/[0.05]"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Campaign Preset Trigger Switcher */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-300 font-semibold block">
            Trigger Type &amp; Objective:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            {[
              { key: 'FLASH_SALE' as const, label: 'Flash Sale' },
              { key: 'SEASONAL' as const, label: 'Festive / India' },
              { key: 'PRODUCT_DROP' as const, label: 'New Drop' },
              { key: 'THOUGHT_LEADERSHIP' as const, label: 'Thought Lead' },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => onTriggerTypeChange(t.key)}
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
                onClick={() => onCustomTopicChange(preset)}
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
            onChange={(e) => onCustomTopicChange(e.target.value)}
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
                    onSelectedChannelsChange({ ...selectedChannels, [ch]: e.target.checked })
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
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl text-xs font-sora font-semibold text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isGenerating || !customTopic.trim()}
            onClick={onGenerate}
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
                <span>Generate &amp; Enqueue 48h Loop</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
