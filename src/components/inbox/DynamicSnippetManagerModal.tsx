'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Command,
  Check,
  RotateCcw,
  Tag,
  Search,
  MessageSquare
} from 'lucide-react';

export interface QuickSnippetItem {
  id: string;
  trigger: string;
  label: string;
  text: string;
  category: 'Sales & Payment' | 'Appointments' | 'Operations' | 'Promotions' | 'General';
  isSystemAction?: boolean;
}

export const DEFAULT_SNIPPETS: QuickSnippetItem[] = [
  {
    id: 'snip-pay',
    trigger: '!pay-link',
    label: 'Generate UPI / Payment Link',
    text: '[Opens in-chat instant UPI & invoice generator for quick closing]',
    category: 'Sales & Payment',
    isSystemAction: true,
  },
  {
    id: 'snip-booking',
    trigger: '!booking-confirm',
    label: 'Studio Visit Confirmed',
    text: 'Saturday 11:30 AM studio visit confirmed! Flagship map: https://maps.app.goo.gl/kuiro. Looking forward to hosting you!',
    category: 'Appointments',
  },
  {
    id: 'snip-hours',
    trigger: '!studio-hours',
    label: 'Operating Hours & Walk-ins',
    text: 'Our studio timings are Mon-Sat, 9:30 AM to 8:00 PM. Walk-ins and private bridal appointments are always welcome.',
    category: 'Operations',
  },
  {
    id: 'snip-quote',
    trigger: '!bespoke-quote',
    label: 'Bespoke Handloom Quote',
    text: 'Bespoke handloom bridal sets start at ₹28,000 including custom fitting, artisan authenticity certificates, and insured courier dispatch.',
    category: 'Sales & Payment',
  },
  {
    id: 'snip-festive',
    trigger: '!festive-promo',
    label: 'Festive Season Discount',
    text: 'Use coupon code PROSPERITY15 for a flat 15% festive discount on all handloom orders placed this week!',
    category: 'Promotions',
  },
  {
    id: 'snip-catalog',
    trigger: '!lookbook',
    label: 'High-Res Digital Lookbook',
    text: 'Browse our latest high-resolution Festive & Wedding Lookbook here: https://kuiro.vercel.app/lookbook',
    category: 'General',
  },
];

interface DynamicSnippetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  snippets: QuickSnippetItem[];
  onSaveSnippets: (updated: QuickSnippetItem[]) => void;
  onSelectSnippet: (snippet: QuickSnippetItem) => void;
}

export default function DynamicSnippetManagerModal({
  isOpen,
  onClose,
  snippets,
  onSaveSnippets,
  onSelectSnippet,
}: DynamicSnippetManagerModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formTrigger, setFormTrigger] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formCategory, setFormCategory] = useState<QuickSnippetItem['category']>('General');
  const [formText, setFormText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const categories = ['all', 'Sales & Payment', 'Appointments', 'Operations', 'Promotions', 'General'];

  const filteredSnippets = snippets.filter((s) => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      s.trigger.toLowerCase().includes(q) ||
      s.label.toLowerCase().includes(q) ||
      s.text.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const handleStartEdit = (snip: QuickSnippetItem) => {
    setEditingId(snip.id);
    setFormTrigger(snip.trigger.startsWith('!') ? snip.trigger : `!${snip.trigger}`);
    setFormLabel(snip.label);
    setFormCategory(snip.category);
    setFormText(snip.text);
    setErrorMsg('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormTrigger('');
    setFormLabel('');
    setFormCategory('General');
    setFormText('');
    setErrorMsg('');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    let cleanedTrigger = formTrigger.trim();
    if (!cleanedTrigger.startsWith('!')) {
      cleanedTrigger = `!${cleanedTrigger}`;
    }

    if (cleanedTrigger.length < 2) {
      setErrorMsg('Trigger shortcut must start with ! followed by a short name.');
      return;
    }

    if (!formLabel.trim()) {
      setErrorMsg('Please specify a friendly label.');
      return;
    }

    if (!formText.trim()) {
      setErrorMsg('Please enter the expansion text.');
      return;
    }

    if (editingId) {
      // Update existing
      const updated = snippets.map((s) =>
        s.id === editingId
          ? {
              ...s,
              trigger: cleanedTrigger,
              label: formLabel.trim(),
              category: formCategory,
              text: formText.trim(),
            }
          : s
      );
      onSaveSnippets(updated);
      handleCancelEdit();
    } else {
      // Create new
      const newSnippet: QuickSnippetItem = {
        id: `snip-${Date.now()}`,
        trigger: cleanedTrigger,
        label: formLabel.trim(),
        category: formCategory,
        text: formText.trim(),
      };
      onSaveSnippets([newSnippet, ...snippets]);
      handleCancelEdit();
    }
  };

  const handleDelete = (id: string) => {
    const updated = snippets.filter((s) => s.id !== id);
    onSaveSnippets(updated);
    if (editingId === id) handleCancelEdit();
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all shortcuts to factory defaults? Any custom shortcuts will be lost.')) {
      onSaveSnippets(DEFAULT_SNIPPETS);
      handleCancelEdit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-inter">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0B0F14] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#FF7A00] to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Command size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sora font-semibold text-base sm:text-lg">Quick Snippets & Canned Shortcuts</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-orange-500/20 text-[#FF7A00] border border-orange-500/30">
                  {snippets.length} active
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Speed up live conversations with single-click replies and commerce triggers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/70 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shortcuts by !trigger, label, or text content..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF7A00]"
              />
            </div>
            <button
              onClick={handleResetDefaults}
              title="Reset to default snippets"
              className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg bg-white flex items-center gap-1.5 whitespace-nowrap hover:border-gray-300 transition"
            >
              <RotateCcw size={12} />
              <span>Defaults</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition text-[11px] font-medium capitalize ${
                  activeCategory === cat
                    ? 'bg-[#0B0F14] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat === 'all' ? 'All Shortcuts' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Two Columns on Large Screens */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* Snippet List (Left 7 Cols) */}
          <div className="md:col-span-7 overflow-y-auto p-4 space-y-2.5 max-h-[480px]">
            {filteredSnippets.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                <MessageSquare size={28} className="mx-auto mb-2 text-gray-300" />
                <p>No snippets found matching your query.</p>
              </div>
            ) : (
              filteredSnippets.map((snip) => (
                <div
                  key={snip.id}
                  className={`p-3 rounded-xl border transition group ${
                    editingId === snip.id
                      ? 'border-[#FF7A00] bg-orange-50/30'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#FF7A00] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        {snip.trigger}
                      </span>
                      <span className="text-xs font-semibold text-gray-900">{snip.label}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {snip.category}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-2.5">
                    {snip.text}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                    <button
                      onClick={() => {
                        onSelectSnippet(snip);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-[#0B0F14] text-white hover:bg-gray-800 font-semibold text-[10px] transition flex items-center gap-1"
                    >
                      <span>Insert in Chat</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(snip)}
                        className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                        title="Edit snippet"
                      >
                        <Edit2 size={13} />
                      </button>
                      {!snip.isSystemAction && (
                        <button
                          onClick={() => handleDelete(snip.id)}
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete snippet"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form Panel: Add / Edit (Right 5 Cols) */}
          <div className="md:col-span-5 p-4 bg-gray-50/50 flex flex-col justify-between overflow-y-auto max-h-[480px]">
            <form onSubmit={handleSaveForm} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5 font-sora">
                  <Tag size={13} className="text-[#FF7A00]" />
                  {editingId ? 'Edit Shortcut' : 'Create New Shortcut'}
                </span>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-[10px] text-gray-500 hover:text-gray-800 underline"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {errorMsg && (
                <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[11px]">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Trigger Command
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formTrigger}
                    onChange={(e) => setFormTrigger(e.target.value)}
                    placeholder="!festive-quote"
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF7A00]"
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Short slug typed in chat to trigger this text
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Friendly Label
                </label>
                <input
                  type="text"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="e.g. Diwali Gift Promo"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as QuickSnippetItem['category'])}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF7A00]"
                >
                  <option value="Sales & Payment">Sales & Payment</option>
                  <option value="Appointments">Appointments</option>
                  <option value="Operations">Operations</option>
                  <option value="Promotions">Promotions</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Expanded Canned Text
                </label>
                <textarea
                  rows={4}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Full message text sent or inserted when clicked..."
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF7A00] leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-98 flex items-center justify-center gap-1.5"
              >
                {editingId ? (
                  <>
                    <Check size={14} />
                    <span>Update Shortcut</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    <span>Save Shortcut</span>
                  </>
                )}
              </button>
            </form>

            <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-100 text-[11px] text-gray-600 space-y-1 mt-3">
              <span className="font-semibold text-[#FF7A00] block">Pro Tip:</span>
              <span>
                Use short triggers like <code>!map</code> or <code>!upi</code>. When clicked from the snippet bar, the complete text is inserted right into your message composer.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
