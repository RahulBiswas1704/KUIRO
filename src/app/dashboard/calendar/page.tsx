'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Filter,
  Sparkles,
  MapPin,
  Tag,
  Clock,
  ArrowRight,
  Flame,
  Search,
  CheckCircle2,
  Loader2,
  Database,
  RefreshCw,
  Plus
} from 'lucide-react';
import CustomMilestoneModal from '@/components/calendar/CustomMilestoneModal';

interface CulturalEvent {
  id: string;
  eventName: string;
  eventDate: string;
  date: string;
  daysRemaining: number;
  regions: string[];
  targetIndustries: string[];
  status: 'QUEUED' | 'UPCOMING' | 'TRIGGERED';
  promptContext: string;
  isCustomMilestone?: boolean;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [testRunNotice, setTestRunNotice] = useState<string | null>(null);
  const [totalInDb, setTotalInDb] = useState<number>(35);
  const [isScanningRadar, setIsScanningRadar] = useState(false);
  const [generatingEventId, setGeneratingEventId] = useState<string | null>(null);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);

  const handleEventCreated = (newEvent: any) => {
    setEvents((prev) => [newEvent, ...prev]);
    setTotalInDb((prev) => prev + 1);
    setTestRunNotice(`🎉 Milestone "${newEvent.eventName}" successfully saved & queued for 48h autonomous campaign generation!`);
  };

  const fetchEvents = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (selectedRegion !== 'All') params.set('region', selectedRegion);
    if (selectedIndustry !== 'All') params.set('industry', selectedIndustry);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());

    fetch(`/api/calendar/events?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events)) {
          setEvents(data.events);
          if (data.totalMilestonesInNeon) setTotalInDb(data.totalMilestonesInNeon);
        }
      })
      .catch((err) => console.warn('[Calendar Load Error]:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedRegion, selectedIndustry]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  // 1-Click trigger campaign generation for an individual event
  const handleTestRun = async (event: CulturalEvent) => {
    setGeneratingEventId(event.id);
    setTestRunNotice(`Synthesizing 48h campaign for "${event.eventName}" with Gemini 3.5 Flash Lite...`);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: event.eventName,
          triggerType: 'FESTIVAL',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestRunNotice(`✨ AI Campaign created for "${event.eventName}"! 5 platform payloads generated and queued in Neon DB.`);
      } else {
        setTestRunNotice(data.error || 'Failed to trigger campaign.');
      }
    } catch (err: any) {
      setTestRunNotice(err.message || 'Error triggering campaign.');
    } finally {
      setGeneratingEventId(null);
      setTimeout(() => setTestRunNotice(null), 6000);
    }
  };

  // Trigger 48h daily cultural radar cron scan across Neon DB
  const handleScanRadar = async () => {
    setIsScanningRadar(true);
    setTestRunNotice('Running 48h Cultural Radar Scan across all active workspaces in Neon DB...');
    try {
      const res = await fetch('/api/calendar/cron-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setTestRunNotice(`Radar Scan Complete! ${data.message}`);
        fetchEvents();
      } else {
        setTestRunNotice(data.error || 'Radar scan failed.');
      }
    } catch (err: any) {
      setTestRunNotice(err.message || 'Error triggering radar scan.');
    } finally {
      setIsScanningRadar(false);
      setTimeout(() => setTestRunNotice(null), 6000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-inter">
      {/* Toast Alert */}
      {testRunNotice && (
        <div className="p-3.5 rounded-[12px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{testRunNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E7EB] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#FF7A00] text-[10px] font-bold">
              365-Day Autonomous Engine
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Database size={12} className="text-emerald-600" />
              <span>{totalInDb} Milestones Live in Neon PostgreSQL</span>
            </span>
          </div>
          <h2 className="font-sora text-xl font-bold text-[#0B0F14] mt-1">
            Indian Cultural &amp; Regional Calendar
          </h2>
          <p className="text-xs text-gray-500">
            KUIRO automatically wakes up 48 hours prior to every festival and professional day, crafting authentic multi-channel creatives tailored to your region and business.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setIsMilestoneModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-[#0B0F14] hover:bg-gray-800 text-white text-xs font-semibold transition shadow-xs whitespace-nowrap active:scale-95"
          >
            <Plus size={14} className="text-[#FF7A00]" />
            <span>Create Milestone / Flash Sale</span>
          </button>
          <button
            onClick={handleScanRadar}
            disabled={isScanningRadar}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[10px] bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-semibold transition shadow-xs disabled:opacity-50"
          >
            {isScanningRadar ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            <span>Trigger 48h Radar Scan</span>
          </button>
          <button
            onClick={fetchEvents}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Sync Calendar</span>
          </button>
        </div>
      </div>

      {/* Live Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-[12px] bg-white border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
            Total Milestones in Neon DB
          </div>
          <div className="text-xl font-bold text-[#0B0F14] mt-1">{totalInDb} Annual Triggers</div>
          <p className="text-[10px] text-emerald-600 mt-0.5">Pan-India, Regional, and Industry Days</p>
        </div>

        <div className="p-3.5 rounded-[12px] bg-white border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
            Active 48h Auto-Commit Radar
          </div>
          <div className="text-xl font-bold text-[#FF7A00] mt-1">
            {events.filter((e) => e.status === 'TRIGGERED' || e.status === 'QUEUED').length} Campaigns
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">In current 14-day window</p>
        </div>

        <div className="p-3.5 rounded-[12px] bg-white border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
            Autonomous Daily Cron
          </div>
          <div className="text-xl font-bold text-[#0B0F14] mt-1">04:00 AM UTC (09:30 AM IST)</div>
          <p className="text-[10px] text-gray-500 mt-0.5">Inngest Cloud Serverless Trigger</p>
        </div>
      </div>

      {/* Filter Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-3"
      >
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search festivals or industry days..."
            className="w-full pl-9 pr-3 py-1.5 rounded-[8px] border border-gray-300 text-xs focus:outline-none focus:border-[#FF7A00]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Region Filter */}
          <div className="flex items-center gap-1.5 shrink-0 text-xs text-gray-600">
            <MapPin size={14} className="text-[#FF7A00]" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-2.5 py-1.5 rounded-[8px] border border-gray-300 bg-white text-xs text-gray-700 focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="All">All Regions (Pan-India)</option>
              <option value="Pan-India">Pan-India Only</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="North India">North India</option>
              <option value="South India">South India</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Punjab">Punjab</option>
              <option value="Assam">Assam &amp; North East</option>
              <option value="Kerala">Kerala</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Bihar">Bihar &amp; Eastern UP</option>
            </select>
          </div>

          {/* Industry Filter */}
          <div className="flex items-center gap-1.5 shrink-0 text-xs text-gray-600">
            <Tag size={14} className="text-blue-500" />
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-2.5 py-1.5 rounded-[8px] border border-gray-300 bg-white text-xs text-gray-700 focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="All">All Industries</option>
              <option value="Healthcare">Healthcare &amp; Clinics</option>
              <option value="Retail">Retail &amp; D2C</option>
              <option value="Jewelry">Jewelry &amp; Gold</option>
              <option value="Apparel">Apparel &amp; Fashion</option>
              <option value="Tech">Tech &amp; SaaS</option>
              <option value="Food & Dining">Food &amp; Dining</option>
              <option value="Financial Services">Fintech &amp; CA</option>
              <option value="B2B Services">B2B &amp; MSME</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-3 py-1.5 rounded-[8px] bg-[#0B0F14] text-white text-xs font-semibold hover:bg-gray-800 transition shrink-0"
          >
            Apply
          </button>
        </div>
      </form>

      {/* Events Grid */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-[14px] border border-[#E5E7EB]">
          <Loader2 size={24} className="animate-spin text-[#FF7A00] mx-auto mb-2" />
          <p className="text-xs text-gray-500">Loading live cultural radar from Neon PostgreSQL...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-[14px] border border-[#E5E7EB]">
          <CalendarDays size={28} className="text-gray-300 mx-auto mb-2" />
          <h3 className="font-sora text-sm font-semibold text-gray-700">No matching festivals found</h3>
          <p className="text-xs text-gray-400 mt-1">Try resetting the region or industry filter above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-[14px] border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-gray-300 transition"
            >
              <div>
                {/* Status Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {event.isCustomMilestone && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-linear-to-r from-orange-500 to-rose-500 text-white flex items-center gap-1 shadow-2xs">
                        <Flame size={10} />
                        <span>CUSTOM MILESTONE</span>
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        event.status === 'TRIGGERED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : event.status === 'QUEUED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {event.status === 'TRIGGERED' && 'TRIGGERED TODAY'}
                      {event.status === 'QUEUED' && 'AUTO_QUEUED (48h)'}
                      {event.status === 'UPCOMING' &&
                        (event.daysRemaining > 0
                          ? `In ${event.daysRemaining} Days`
                          : event.daysRemaining === 0
                          ? 'Today'
                          : `${Math.abs(event.daysRemaining)} Days Ago`)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                    <Clock size={12} />
                    <span>{event.date}</span>
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-sora text-sm font-bold text-[#0B0F14] leading-snug">
                  {event.eventName}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {event.regions.map((r) => (
                    <span
                      key={r}
                      className="text-[10px] font-medium px-2 py-0.5 rounded bg-orange-50 text-[#FF7A00] border border-orange-100"
                    >
                      {r}
                    </span>
                  ))}
                  {event.targetIndustries.map((ind) => (
                    <span
                      key={ind}
                      className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600"
                    >
                      {ind}
                    </span>
                  ))}
                </div>

                {/* Context Prompt Snippet */}
                <div className="mt-3 p-2.5 rounded-[8px] bg-gray-50 border border-gray-100 text-[11px] text-gray-600 leading-relaxed">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                    AI Context Seed
                  </span>
                  {event.promptContext}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 mt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  Trigger: 48h prior (4:00 AM IST)
                </span>
                <button
                  onClick={() => handleTestRun(event)}
                  disabled={generatingEventId === event.id}
                  className="text-xs font-semibold text-[#FF7A00] hover:text-[#E66E00] flex items-center gap-1 transition disabled:opacity-50"
                >
                  {generatingEventId === event.id ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <span>Trigger 48h Campaign</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Milestone & Flash Sale Builder Modal */}
      <CustomMilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
}
