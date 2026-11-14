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
  Award
} from 'lucide-react';
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
    whatsapp: <Smartphone size={13} className="text-emerald-500" />,
    instagram: <Instagram size={13} className="text-pink-500" />,
    email: <Mail size={13} className="text-blue-500" />,
    messenger: <Smartphone size={13} className="text-purple-500" />,
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-[14px] bg-white border border-[#E5E7EB] animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-20 bg-gray-100 rounded-[10px]" />
          <div className="h-20 bg-gray-100 rounded-[10px]" />
          <div className="h-20 bg-gray-100 rounded-[10px]" />
          <div className="h-20 bg-gray-100 rounded-[10px]" />
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
        <div className="p-3.5 rounded-[12px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            &times;
          </button>
        </div>
      )}

      {/* Main ROI & Lead Attribution Banner Card */}
      <div className="rounded-[14px] bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#F3F4F6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-orange-50/40 via-white to-white">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live ROI Attribution
              </span>
              <span className="text-[11px] text-gray-500 font-mono">
                Attributed to KUIRO Multi-Channel Autopilot
              </span>
            </div>
            <h3 className="font-sora text-base sm:text-lg font-bold text-[#0B0F14]">
              Campaign Revenue & Patient Lead Attribution
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Direct patient inquiries and appointment pipeline generated by your automated campaigns.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRoiData()}
              className="p-2 rounded-[8px] border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs transition"
              title="Refresh Attribution Metrics"
            >
              <RefreshCw size={14} />
            </button>
            <Link
              href="/dashboard/inbox"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#0B0F14] text-white text-xs font-semibold hover:bg-gray-800 transition"
            >
              <span>Omni-Inbox Leads</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* 4-Metric ROI Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#F3F4F6] border-b border-[#F3F4F6]">
          {/* 1. Attributed Treatment Pipeline */}
          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-medium uppercase text-gray-500 tracking-wider block mb-1">
              Attributed Pipeline
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-inter text-[#0B0F14]">
              ₹{roiData.totalPipelineValue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp size={12} />
              <span>₹{roiData.totalRealizedRevenue.toLocaleString('en-IN')} confirmed</span>
            </p>
          </div>

          {/* 2. Patient Inquiries */}
          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-medium uppercase text-gray-500 tracking-wider block mb-1">
              Patient Inquiries
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-inter text-[#0B0F14]">
              {roiData.totalAttributedLeads} Leads
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Captured via WhatsApp & Social
            </p>
          </div>

          {/* 3. Confirmed Appointments */}
          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-medium uppercase text-gray-500 tracking-wider block mb-1">
              Appointments Booked
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-inter text-emerald-600">
              {roiData.totalAppointmentsBooked} Booked
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {roiData.overallConversionRate}% booking conversion rate
            </p>
          </div>

          {/* 4. Net ROI Multiplier */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-orange-50/50 to-white">
            <span className="text-[11px] font-medium uppercase text-[#FF7A00] tracking-wider block mb-1">
              KUIRO Net ROI
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-inter text-[#FF7A00]">
              {roiData.netRoiMultiplier}x Return
            </div>
            <p className="text-[11px] text-gray-500 mt-1 font-mono">
              vs ₹{roiData.monthlySubscriptionCost.toLocaleString('en-IN')}/mo subscription
            </p>
          </div>
        </div>

        {/* Channel Distribution Mini Ribbon */}
        <div className="px-5 py-3 bg-[#FAFAFA] flex items-center gap-4 flex-wrap text-xs text-gray-600 border-b border-[#F3F4F6]">
          <span className="text-[11px] font-mono uppercase text-gray-400 font-bold">Inbound Inquiries by Channel:</span>
          <div className="flex items-center gap-1.5 font-medium">
            <Smartphone size={14} className="text-emerald-600" />
            <span>WhatsApp: <strong>{roiData.channelBreakdown.whatsapp.leads}</strong> (₹{roiData.channelBreakdown.whatsapp.value.toLocaleString('en-IN')})</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Instagram size={14} className="text-pink-600" />
            <span>Instagram: <strong>{roiData.channelBreakdown.instagram.leads}</strong> (₹{roiData.channelBreakdown.instagram.value.toLocaleString('en-IN')})</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Mail size={14} className="text-blue-600" />
            <span>Email Newsletter: <strong>{roiData.channelBreakdown.email.leads}</strong> (₹{roiData.channelBreakdown.email.value.toLocaleString('en-IN')})</span>
          </div>
        </div>

        {/* Campaign Breakdown Table */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold font-sora uppercase tracking-wider text-gray-700">
              Campaign Attribution Breakdown
            </h4>
            <span className="text-[11px] text-gray-500 font-mono">
              {roiData.campaignBreakdown.length} Active & Recent Campaigns
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 text-[10px] font-mono uppercase tracking-wider">
                  <th className="py-2.5 font-medium">Campaign Topic</th>
                  <th className="py-2.5 font-medium">Trigger Type</th>
                  <th className="py-2.5 font-medium">Top Channel</th>
                  <th className="py-2.5 font-medium text-center">Inquiries</th>
                  <th className="py-2.5 font-medium text-center">Booked Consultations</th>
                  <th className="py-2.5 font-medium text-right">Attributed Value</th>
                  <th className="py-2.5 font-medium text-right">ROI Multiplier</th>
                  <th className="py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roiData.campaignBreakdown.map((camp) => (
                  <tr key={camp.campaignId} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 pr-3">
                      <div className="font-semibold text-[#0B0F14]">{camp.topicSummary}</div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        Published: {new Date(camp.publishAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-gray-100 text-gray-700">
                        {camp.triggerType}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 capitalize text-gray-700">
                        {channelIcons[camp.topInboundChannel] || <Smartphone size={13} />}
                        <span>{camp.topInboundChannel}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center font-bold text-gray-800">
                      {camp.inquiriesCount}
                    </td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                        <Check size={11} />
                        {camp.appointmentsBookedCount} Booked
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-gray-900 font-inter">
                      ₹{camp.estimatedPipelineValue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-extrabold text-[#FF7A00] font-inter">
                        {camp.roiMultiplier}x
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedCampaignForModal(camp)}
                        className="px-2.5 py-1 rounded-[6px] bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-medium transition"
                      >
                        Inspect Leads
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[16px] max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#FF7A00]/10 text-[#FF7A00] font-bold">
                  Campaign Lead Attribution
                </span>
                <h3 className="font-sora text-lg font-bold text-[#0B0F14] mt-1">
                  {selectedCampaignForModal.topicSummary}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedCampaignForModal.inquiriesCount} inquiries • ₹{selectedCampaignForModal.estimatedPipelineValue.toLocaleString('en-IN')} attributed pipeline
                </p>
              </div>
              <button
                onClick={() => setSelectedCampaignForModal(null)}
                className="text-gray-400 hover:text-gray-700 text-lg leading-none p-1"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase font-mono tracking-wider">
                Inbound Patient Conversations:
              </h4>

              {selectedCampaignForModal.recentLeads.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 rounded-[12px]">
                  No inbound inquiries have arrived for this campaign yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedCampaignForModal.recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3.5 rounded-[12px] bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0B0F14]">{lead.customerName}</span>
                          <span className="text-[10px] text-gray-400 font-mono">({lead.customerHandle})</span>
                          <span className="capitalize text-[10px] px-2 py-0.5 rounded bg-white border border-gray-200 font-semibold flex items-center gap-1">
                            {channelIcons[lead.channel]}
                            {lead.channel}
                          </span>
                        </div>
                        <p className="text-gray-600 text-[11px] line-clamp-1 italic">
                          &quot;{lead.lastMessageText}&quot;
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span>Est. Value: <strong className="text-gray-800">₹{lead.estimatedValue.toLocaleString('en-IN')}</strong></span>
                          <span>•</span>
                          <span>Source: {lead.campaignSource}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {lead.isBooked ? (
                          <span className="px-2.5 py-1 rounded-[6px] bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                            <Check size={12} />
                            Appointment Booked
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedLeadForBooking(lead);
                              setCustomBookingValue(String(lead.estimatedValue || 5000));
                              setIsBookingModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-[6px] bg-[#0B0F14] hover:bg-gray-800 text-white text-[11px] font-semibold transition flex items-center gap-1"
                          >
                            <Calendar size={12} />
                            <span>Mark Booked</span>
                          </button>
                        )}
                        <Link
                          href="/dashboard/inbox"
                          className="p-1.5 rounded-[6px] border border-gray-300 text-gray-600 hover:bg-gray-100"
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

            <div className="pt-3 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedCampaignForModal(null)}
                className="px-4 py-2 rounded-[8px] bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Mark Booked Modal */}
      {isBookingModalOpen && selectedLeadForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[16px] max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-600 font-bold">
                Confirm Patient Appointment
              </span>
              <h3 className="font-sora text-base font-bold text-[#0B0F14] mt-1">
                Record Booking for {selectedLeadForBooking.customerName}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Attributed to: {selectedLeadForBooking.campaignSource}
              </p>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Confirmed Procedure / Consultation Value (INR):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={customBookingValue}
                    onChange={(e) => setCustomBookingValue(e.target.value)}
                    required
                    min="100"
                    className="w-full pl-7 pr-3 py-2 rounded-[8px] border border-gray-300 text-xs focus:outline-none focus:border-[#FF7A00]"
                    placeholder="e.g. 45000 for Invisalign, 1500 for Consultation"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  This confirmed amount will directly update your clinic’s realized ROI metrics.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-3 py-1.5 rounded-[8px] border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="px-4 py-1.5 rounded-[8px] bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                >
                  {isSubmittingBooking ? 'Saving...' : 'Confirm Appointment Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
