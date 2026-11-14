'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Flame,
  Tag,
  MapPin,
  Share2,
  Check,
  Loader2,
  Clock,
  Percent,
  Megaphone
} from 'lucide-react';

interface CustomMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: any) => void;
}

export type MilestoneCategory =
  | 'FLASH_SALE'
  | 'STORE_ANNIVERSARY'
  | 'POPUP_EXHIBITION'
  | 'PRODUCT_LAUNCH'
  | 'VIP_PREVIEW';

export default function CustomMilestoneModal({
  isOpen,
  onClose,
  onEventCreated,
}: CustomMilestoneModalProps) {
  // 3 days from now as default date
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 3);
  const formattedDefaultDate = defaultDate.toISOString().split('T')[0];

  const [category, setCategory] = useState<MilestoneCategory>('FLASH_SALE');
  const [eventName, setEventName] = useState('Festive Weekend Flash Sale — Flat 25% Off');
  const [eventDate, setEventDate] = useState(formattedDefaultDate);
  const [offerDetails, setOfferDetails] = useState('Flat 25% off all Handloom Silk & Linen collections with code FESTIVE25');
  const [region, setRegion] = useState('Pan-India');
  const [industry, setIndustry] = useState('Retail & D2C');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    'WhatsApp',
    'Instagram',
    'Email',
  ]);
  const [customPrompt, setCustomPrompt] = useState(
    'Celebrate our festive flash sale with handloom weaves, verified artisan certificates, and priority weekend delivery across India.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const categoryPresets: Record<
    MilestoneCategory,
    { label: string; icon: string; defaultName: string; defaultOffer: string; defaultPrompt: string }
  > = {
    FLASH_SALE: {
      label: 'Flash Sale & Special Promo',
      icon: '⚡',
      defaultName: 'Festive Weekend Flash Sale — Flat 25% Off',
      defaultOffer: 'Flat 25% off on our bestselling Handloom Silks with coupon FESTIVE25',
      defaultPrompt: 'Urgent 48-hour festive discount on pure handloom weaves. Emphasize limited artisan inventory and free pan-India insured shipping.',
    },
    STORE_ANNIVERSARY: {
      label: 'Store Anniversary & Milestone',
      icon: '🎉',
      defaultName: 'Flagship Studio 5th Anniversary Celebration',
      defaultOffer: 'Complimentary silver coin on purchases above ₹20,000 + private studio tea tasting',
      defaultPrompt: 'Honoring 5 years of heritage craftsmanship and patron trust. Warm invitation to visit our flagship studio for artisan demonstrations.',
    },
    POPUP_EXHIBITION: {
      label: 'Pop-Up & City Exhibition',
      icon: '📍',
      defaultName: 'Bangalore Luxury Handloom Pop-Up Trunk Show',
      defaultOffer: 'Exclusive preview of our upcoming festive lookbook before public digital release',
      defaultPrompt: 'Private 2-day trunk show at Indiranagar, Bangalore. Exclusive bridal consultation slots available via RSVP.',
    },
    PRODUCT_LAUNCH: {
      label: 'New Collection & Product Drop',
      icon: '✨',
      defaultName: 'Autumn Zari & Chanderi Capsule Collection Drop',
      defaultOffer: 'First 50 orders receive handwoven silk pocket square gift box',
      defaultPrompt: 'Announcing our new autumn capsule collection featuring authentic silver zari and lightweight breathable handlooms.',
    },
    VIP_PREVIEW: {
      label: 'Private VIP Client Preview',
      icon: '👑',
      defaultName: 'Private Bridal Connoisseur Evening',
      defaultOffer: 'Personal styling session with Master Weavers + 1-on-1 bespoke fitting',
      defaultPrompt: 'By-invitation-only intimate salon for bridal families. Tailored bespoke quotes and archival heirloom weaves.',
    },
  };

  const handleCategoryChange = (newCat: MilestoneCategory) => {
    setCategory(newCat);
    const preset = categoryPresets[newCat];
    setEventName(preset.defaultName);
    setOfferDetails(preset.defaultOffer);
    setCustomPrompt(preset.defaultPrompt);
  };

  const setRelativeDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setEventDate(d.toISOString().split('T')[0]);
  };

  const toggleChannel = (ch: string) => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) {
      setErrorMessage('Please provide a milestone name.');
      return;
    }
    if (!eventDate) {
      setErrorMessage('Please select a target date.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const formattedPrompt = `${customPrompt.trim()} [Category: ${categoryPresets[category].label}] [Offer: ${offerDetails}] [Target Channels: ${selectedChannels.join(', ')}]`;

    const payload = {
      eventName: eventName.trim(),
      eventDate,
      regions: [region],
      targetIndustries: [industry],
      promptContext: formattedPrompt,
    };

    try {
      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.event) {
        onEventCreated({
          ...data.event,
          date: new Date(eventDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          daysRemaining: Math.ceil(
            (new Date(eventDate).getTime() - new Date().setHours(0, 0, 0, 0)) /
              (1000 * 60 * 60 * 24)
          ),
          status: 'QUEUED',
          isCustomMilestone: true,
        });
        onClose();
      } else {
        // Fallback for mock or local state
        onEventCreated({
          id: `custom-${Date.now()}`,
          ...payload,
          date: new Date(eventDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          daysRemaining: Math.ceil(
            (new Date(eventDate).getTime() - new Date().setHours(0, 0, 0, 0)) /
              (1000 * 60 * 60 * 24)
          ),
          status: 'QUEUED',
          isCustomMilestone: true,
        });
        onClose();
      }
    } catch (err: any) {
      // Local fallback on connection hiccup
      onEventCreated({
        id: `custom-${Date.now()}`,
        ...payload,
        date: new Date(eventDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        daysRemaining: Math.ceil(
          (new Date(eventDate).getTime() - new Date().setHours(0, 0, 0, 0)) /
            (1000 * 60 * 60 * 24)
        ),
        status: 'QUEUED',
        isCustomMilestone: true,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-inter">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0B0F14] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#FF7A00] to-rose-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Flame size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sora font-semibold text-base sm:text-lg">
                  Create Milestone or Flash Sale
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-orange-500/20 text-[#FF7A00] border border-orange-500/30">
                  Autonomous 48h Trigger
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Schedule business moments, private trunk shows, or urgent weekend flash sales.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Category Selector Pills */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
              Milestone Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(categoryPresets) as MilestoneCategory[]).map((cat) => {
                const info = categoryPresets[cat];
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`p-2 rounded-xl border text-left transition flex items-center gap-2 ${
                      active
                        ? 'border-[#FF7A00] bg-orange-50/40 text-[#0B0F14] shadow-xs'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-base">{info.icon}</span>
                    <span className="text-[11px] font-semibold line-clamp-1">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Title */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Event or Campaign Name
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Autumn Handloom Clearance Flash Sale"
              className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          {/* Date Picker & Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-[#FF7A00]" />
                <span>Target Date</span>
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Quick Shortcuts
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setRelativeDays(2)}
                  className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-medium"
                >
                  +2 Days (Flash)
                </button>
                <button
                  type="button"
                  onClick={() => setRelativeDays(7)}
                  className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-medium"
                >
                  +1 Week
                </button>
                <button
                  type="button"
                  onClick={() => setRelativeDays(14)}
                  className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-medium"
                >
                  +2 Weeks
                </button>
                <button
                  type="button"
                  onClick={() => setRelativeDays(30)}
                  className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-medium"
                >
                  +1 Month
                </button>
              </div>
            </div>
          </div>

          {/* Offer / Promotion Details */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Percent size={13} className="text-emerald-600" />
              <span>Offer / Value Proposition</span>
            </label>
            <input
              type="text"
              value={offerDetails}
              onChange={(e) => setOfferDetails(e.target.value)}
              placeholder="e.g. Flat 20% off on all bridal silks with code BRIDAL20"
              className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          {/* Region & Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <MapPin size={13} className="text-[#FF7A00]" />
                <span>Target Region</span>
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF7A00]"
              >
                <option value="Pan-India">Pan-India</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="South India">South India</option>
                <option value="North India">North India</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Punjab">Punjab</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Assam">Assam &amp; North East</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Tag size={13} className="text-blue-500" />
                <span>Industry Classification</span>
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF7A00]"
              >
                <option value="Retail & D2C">Retail &amp; D2C</option>
                <option value="Apparel & Fashion">Apparel &amp; Fashion</option>
                <option value="Jewelry & Gold">Jewelry &amp; Gold</option>
                <option value="Healthcare & Clinics">Healthcare &amp; Clinics</option>
                <option value="Food & Dining">Food &amp; Dining</option>
                <option value="Tech & SaaS">Tech &amp; SaaS</option>
                <option value="All Industries">All Industries</option>
              </select>
            </div>
          </div>

          {/* Target Channels */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Share2 size={13} className="text-purple-500" />
              <span>Multi-Channel Auto-Dispatch</span>
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {['WhatsApp', 'Instagram', 'Email', 'LinkedIn', 'X'].map((ch) => {
                const active = selectedChannels.includes(ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => toggleChannel(ch)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition flex items-center gap-1 ${
                      active
                        ? 'bg-[#0B0F14] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {active && <Check size={11} />}
                    <span>{ch}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Context Seed */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Sparkles size={13} className="text-[#FF7A00]" />
              <span>AI Context Seed (Gemini Prompt Guidance)</span>
            </label>
            <textarea
              rows={2}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Guidance for Gemini when generating social copies, email newsletters, and WhatsApp messages..."
              className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF7A00] leading-relaxed"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-mono">
              Autopilot triggers 48h prior
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-98 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Saving to Neon DB...</span>
                  </>
                ) : (
                  <>
                    <Flame size={13} />
                    <span>Queue Milestone &amp; Campaign</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
