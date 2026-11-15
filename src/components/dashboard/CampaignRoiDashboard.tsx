'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Smartphone,
  Instagram,
  Mail,
  ShieldCheck,
  RefreshCw,
  Plus,
  ChevronDown,
  ChevronUp,
  Check,
  Tag,
  Clock,
  Layers,
  Award,
  Download,
  X as CloseIcon
} from 'lucide-react';
import ExecutiveRoiExporterModal from '@/components/dashboard/ExecutiveRoiExporterModal';
import { WorkspaceRoiSummary, CampaignRoiMetric, AttributedLeadItem } from '@/types';

interface CampaignRoiDashboardProps {
  onRefreshNeeded?: () => void;
}

export default function CampaignRoiDashboard({ onRefreshNeeded }: CampaignRoiDashboardProps) {
  const [roiData, setRoiData] = useState<WorkspaceRoiSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaignForModal, setSelectedCampaignForModal] = useState<CampaignRoiMetric | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedLeadForBooking, setSelectedLeadForBooking] = useState<AttributedLeadItem | null>(null);
  const [customBookingValue, setCustomBookingValue] = useState<string>('5000');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporterModalOpen, setIsExporterModalOpen] = useState(false);

  const fetchRoiData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/campaigns/roi', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.roi) {
        setRoiData(data.roi);
      } else {
        setError(data.error || 'Failed to fetch campaign ROI metrics.');
      }
    } catch (err: any) {
      console.warn('Failed to load ROI metrics:', err);
      setError(err.message || 'Network error fetching ROI metrics.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoiData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForBooking) return;

    setIsSubmittingBooking(true);
    try {
      const res = await fetch('/api/campaigns/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedLeadForBooking.id,
          bookedValue: parseInt(customBookingValue.replace(/[^0-9]/g, ''), 10) || 5000,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Appointment marked as confirmed!');
        setIsBookingModalOpen(false);
        setSelectedLeadForBooking(null);
        await fetchRoiData(true);
        if (onRefreshNeeded) onRefreshNeeded();
      } else {
        showToast(data.error || 'Failed to mark appointment.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error marking appointment.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const channelIcons: Record<string, React.ReactNode> = {
    whatsapp: <Smartphone size={13} className="text-emerald-400" />,
    instagram: <Instagram size={13} className="text-pink-400" />,
    email: <Mail size={13} className="text-blue-400" />,
    messenger: <Smartphone size={13} className="text-purple-400" />,
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-[24px] bg-[#0A0E18] border border-white/[0.08] animate-pulse space-y-4">
        <div className="h-4 bg-white/10 rounded w-1/4" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-20 bg-white/[0.03] rounded-xl" />
          <div className="h-20 bg-white/[0.03] rounded-xl" />
          <div className="h-20 bg-white/[0.03] rounded-xl" />
          <div className="h-20 bg-white/[0.03] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !roiData) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <CloseIcon size={14} />
          </button>
        </div>
      )}

      {/* Main ROI & Lead Attribution Banner Card */}
      <div className="rounded-[24px] bg-[#0A0E18] border border-white/[0.08] shadow-sm overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#FF7A00]/[0.05] via-transparent to-transparent">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live ROI Attribution</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Attributed to KUIRO Multi-Channel Autopilot
              </span>
            </div>
            <h3 className="font-sora text-base sm:text-lg font-bold text-white">
              Campaign Revenue & Customer Lead Attribution
            </h3>
            <p className="text-xs text-slate-400 font-inter">
              Direct customer inquiries, client leads, and pipeline revenue generated by your automated campaigns.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => setIsExporterModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] text-[#FF7A00] text-xs font-sora font-semibold transition cursor-pointer"
            >
              <Download size={13} />
              <span>Export Executive ROI (PDF/CSV)</span>
            </button>
            <button
              onClick={() => fetchRoiData()}
              className="p-2 rounded-full border border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white text-xs transition cursor-pointer"
              title="Refresh Attribution Metrics"
            >
              <RefreshCw size={14} />
            </button>
            <Link
              href="/dashboard/inbox"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-black hover:bg-slate-100 text-xs font-sora font-semibold transition cursor-pointer"
            >
              <span>Omni-Inbox Leads</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* 4-Metric ROI Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/[0.06] border-b border-white/[0.06]">
          {/* 1. Attributed Treatment Pipeline */}
          <div className="p-5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
              Attributed Pipeline
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-inter text-white">
              ₹{roiData.totalPipelineValue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <TrendingUp size={12} />
              <span>₹{roiData.totalRealizedRevenue.toLocaleString('en-IN')} confirmed</span>
            </p>
          </div>

          {/* 2. Customer Inquiries */}
          <div className="p-5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
              Customer Inquiries
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-inter text-white">
              {roiData.totalAttributedLeads} Leads
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Captured via WhatsApp & Social
            </p>
          </div>

          {/* 3. Confirmed Deals / Appointments */}
          <div className="p-5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
              Confirmed Conversions
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-inter text-emerald-400">
              {roiData.totalAppointmentsBooked} Closed
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              {roiData.overallConversionRate}% conversion rate
            </p>
          </div>

          {/* 4. Net ROI Multiplier */}
          <div className="p-5 space-y-1 bg-[#FF7A00]/[0.03]">
            <span className="text-[10px] font-mono uppercase text-[#FF7A00] tracking-wider block">
              KUIRO Net ROI
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-inter text-[#FF7A00]">
              {roiData.netRoiMultiplier}x Return
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              vs ₹{roiData.monthlySubscriptionCost.toLocaleString('en-IN')}/mo subscription
            </p>
          </div>
        </div>

        {/* Channel Distribution Mini Ribbon */}
        <div className="px-5 py-3 bg-white/[0.02] flex items-center gap-4 flex-wrap text-xs text-slate-300 border-b border-white/[0.06] font-mono">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Inbound Inquiries:</span>
          <div className="flex items-center gap-1.5">
            <Smartphone size={13} className="text-emerald-400" />
            <span>WhatsApp: <strong>{roiData.channelBreakdown.whatsapp.leads}</strong> (₹{roiData.channelBreakdown.whatsapp.value.toLocaleString('en-IN')})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Instagram size={13} className="text-pink-400" />
            <span>Instagram: <strong>{roiData.channelBreakdown.instagram.leads}</strong> (₹{roiData.channelBreakdown.instagram.value.toLocaleString('en-IN')})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail size={13} className="text-blue-400" />
            <span>Newsletter: <strong>{roiData.channelBreakdown.email.leads}</strong> (₹{roiData.channelBreakdown.email.value.toLocaleString('en-IN')})</span>
          </div>
        </div>

        {/* Campaign Breakdown Table */}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Campaign Attribution Breakdown
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              {roiData.campaignBreakdown.length} Active & Recent Campaigns
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                  <th className="py-2.5 font-medium">Campaign Topic</th>
                  <th className="py-2.5 font-medium">Trigger Type</th>
                  <th className="py-2.5 font-medium">Top Channel</th>
                  <th className="py-2.5 font-medium text-center">Inquiries</th>
                  <th className="py-2.5 font-medium text-center">Booked</th>
                  <th className="py-2.5 font-medium text-right">Attributed Value</th>
                  <th className="py-2.5 font-medium text-right">ROI</th>
                  <th className="py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {roiData.campaignBreakdown.map((camp) => (
                  <tr key={camp.campaignId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-3">
                      <div className="font-semibold text-white font-sora">{camp.topicSummary}</div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Published: {new Date(camp.publishAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                        {camp.triggerType}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 capitalize text-slate-300 font-mono">
                        {channelIcons[camp.topInboundChannel] || <Smartphone size={13} />}
                        <span>{camp.topInboundChannel}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center font-bold text-white font-mono">
                      {camp.inquiriesCount}
                    </td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full text-[10px] font-mono">
                        <Check size={10} />
                        {camp.appointmentsBookedCount} Booked
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-white font-inter">
                      ₹{camp.estimatedPipelineValue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-extrabold text-[#FF7A00] font-mono">
                        {camp.roiMultiplier}x
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCampaignForModal(camp)}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-[11px] font-mono transition cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inspect Leads Modal */}
      {selectedCampaignForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0A0E18] rounded-[24px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-white/[0.12] max-h-[90vh] overflow-y-auto text-white">
            <div className="flex items-start justify-between border-b border-white/[0.06] pb-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#FF7A00]/20 text-[#FF7A00] font-bold border border-[#FF7A00]/30">
                  Campaign Lead Attribution
                </span>
                <h3 className="font-sora text-base sm:text-lg font-bold text-white mt-1">
                  {selectedCampaignForModal.topicSummary}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedCampaignForModal.inquiriesCount} inquiries • ₹{selectedCampaignForModal.estimatedPipelineValue.toLocaleString('en-IN')} pipeline
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCampaignForModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05]"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider">
                Inbound Customer Conversations:
              </h4>

              {selectedCampaignForModal.recentLeads.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-white/[0.02] border border-dashed border-white/[0.06] rounded-2xl">
                  No inbound inquiries have arrived for this campaign yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedCampaignForModal.recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-sora">{lead.customerName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({lead.customerHandle})</span>
                          <span className="capitalize text-[10px] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] font-mono flex items-center gap-1">
                            {channelIcons[lead.channel]}
                            {lead.channel}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] line-clamp-1 italic">
                          &quot;{lead.lastMessageText}&quot;
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                          <span>Est. Value: <strong className="text-white">₹{lead.estimatedValue.toLocaleString('en-IN')}</strong></span>
                          <span>•</span>
                          <span>Source: {lead.campaignSource}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {lead.isBooked ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-mono font-bold flex items-center gap-1">
                            <Check size={12} />
                            Confirmed & Closed
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLeadForBooking(lead);
                              setCustomBookingValue(String(lead.estimatedValue || 5000));
                              setIsBookingModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-full bg-white text-black hover:bg-slate-100 text-[11px] font-sora font-semibold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Calendar size={12} />
                            <span>Mark Closed</span>
                          </button>
                        )}
                        <Link
                          href="/dashboard/inbox"
                          className="p-1.5 rounded-lg border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.05]"
                          title="Open in Omni-Inbox"
                        >
                          <ExternalLink size={13} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCampaignForModal(null)}
                className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-xs font-sora font-semibold text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Mark Booked Modal */}
      {isBookingModalOpen && selectedLeadForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0A0E18] rounded-[24px] max-w-md w-full p-6 shadow-2xl space-y-4 border border-white/[0.12] text-white">
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                Confirm Customer Conversion
              </span>
              <h3 className="font-sora text-base font-bold text-white mt-1">
                Record Booking for {selectedLeadForBooking.customerName}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Attributed to: {selectedLeadForBooking.campaignSource}
              </p>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-3.5">
              <div>
                <label className="text-xs font-mono font-semibold text-slate-300 block mb-1">
                  Confirmed Conversion / Order Value (INR):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs font-mono">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={customBookingValue}
                    onChange={(e) => setCustomBookingValue(e.target.value)}
                    required
                    min="100"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#FF7A00] font-mono"
                    placeholder="e.g. 45000 for High-Value Order, 1500 for Consultation"
                  />
                </div>
                <p className="text-[10px] font-mono text-slate-400 mt-1">
                  Directly updates your realized ROI metrics in Neon PostgreSQL.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-3 py-1.5 rounded-full border border-white/[0.08] text-xs font-sora font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-sora font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingBooking ? 'Saving...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Executive ROI Exporter Modal */}
      <ExecutiveRoiExporterModal
        isOpen={isExporterModalOpen}
        onClose={() => setIsExporterModalOpen(false)}
        roiData={roiData}
      />
    </div>
  );
}
