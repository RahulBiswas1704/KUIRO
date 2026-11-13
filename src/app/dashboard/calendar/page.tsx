'use client';

import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';

interface CulturalEvent {
  id: string;
  eventName: string;
  date: string;
  daysRemaining: number;
  regions: string[];
  targetIndustries: string[];
  status: 'QUEUED' | 'UPCOMING' | 'TRIGGERED';
  promptContext: string;
}

const mockEvents: CulturalEvent[] = [
  {
    id: 'e1',
    eventName: 'Maha Shivratri',
    date: 'February 15, 2026',
    daysRemaining: 2,
    regions: ['Pan-India'],
    targetIndustries: ['All'],
    status: 'TRIGGERED',
    promptContext: 'Spiritual discipline, inner peace, fasting health tips, meditation, family togetherness.',
  },
  {
    id: 'e2',
    eventName: 'Holi (Festival of Colors)',
    date: 'March 4, 2026',
    daysRemaining: 19,
    regions: ['Pan-India', 'North India', 'West Bengal'],
    targetIndustries: ['Healthcare', 'F&B', 'D2C', 'Retail'],
    status: 'QUEUED',
    promptContext: 'Joyful celebration, organic gulal, herbal safety, dental protection from colors, festive thandai.',
  },
  {
    id: 'e3',
    eventName: 'World Oral Health Day',
    date: 'March 20, 2026',
    daysRemaining: 35,
    regions: ['Pan-India'],
    targetIndustries: ['Healthcare', 'Clinics'],
    status: 'UPCOMING',
    promptContext: 'A Happy Mouth is A Happy Mind. Cavity prevention, pediatric checkups, flossing habits.',
  },
  {
    id: 'e4',
    eventName: 'Gudi Padwa & Ugadi (Deccan New Year)',
    date: 'March 22, 2026',
    daysRemaining: 37,
    regions: ['Maharashtra', 'Karnataka', 'Andhra Pradesh', 'Telangana'],
    targetIndustries: ['All', 'Retail', 'Real Estate', 'Jewelry'],
    status: 'UPCOMING',
    promptContext: 'New beginnings, Toran, Shrikhand Puri, auspicious purchases, neem and jaggery symbolism.',
  },
  {
    id: 'e5',
    eventName: 'Eid al-Fitr',
    date: 'March 21, 2026',
    daysRemaining: 36,
    regions: ['Pan-India'],
    targetIndustries: ['All', 'F&B', 'Fashion', 'Retail'],
    status: 'UPCOMING',
    promptContext: 'Gratitude, community feasts, sheer khurma, charity (Zakat), warm family greetings.',
  },
  {
    id: 'e6',
    eventName: 'Poila Boishakh (Bengali New Year)',
    date: 'April 15, 2026',
    daysRemaining: 61,
    regions: ['West Bengal', 'Tripura', 'Assam'],
    targetIndustries: ['All', 'F&B', 'Retail', 'Agencies'],
    status: 'UPCOMING',
    promptContext: 'Shubho Noboborsho, Haal Khata accounting tradition, sweets (sandesh), fresh starts, traditional attire.',
  },
  {
    id: 'e7',
    eventName: 'National Technology Day',
    date: 'May 11, 2026',
    daysRemaining: 87,
    regions: ['Pan-India'],
    targetIndustries: ['Tech', 'SaaS', 'Startups', 'Agencies'],
    status: 'UPCOMING',
    promptContext: 'Pokhran innovation, Indian deeptech engineering, indigenous AI software, automation efficiency.',
  },
  {
    id: 'e8',
    eventName: 'National Doctors\' Day',
    date: 'July 1, 2026',
    daysRemaining: 138,
    regions: ['Pan-India'],
    targetIndustries: ['Healthcare', 'Clinics', 'Pharma'],
    status: 'UPCOMING',
    promptContext: 'Honoring Dr. B.C. Roy, tireless medical service, selfless patient care, preventive health advocacy.',
  },
  {
    id: 'e9',
    eventName: 'Independence Day',
    date: 'August 15, 2026',
    daysRemaining: 183,
    regions: ['Pan-India'],
    targetIndustries: ['All'],
    status: 'UPCOMING',
    promptContext: 'Patriotic pride, Har Ghar Tiranga, freedom of entrepreneurship, Make in India.',
  },
  {
    id: 'e10',
    eventName: 'Durga Puja & Navratri',
    date: 'October 15, 2026',
    daysRemaining: 244,
    regions: ['West Bengal', 'Gujarat', 'Delhi', 'Pan-India'],
    targetIndustries: ['All', 'F&B', 'Retail', 'Fashion', 'Clinics'],
    status: 'UPCOMING',
    promptContext: 'Dhaak beats, Pandal hopping, Garba/Dandiya, victory of light over darkness, grand festive shopping.',
  },
  {
    id: 'e11',
    eventName: 'Diwali & Dhanteras',
    date: 'November 8, 2026',
    daysRemaining: 268,
    regions: ['Pan-India'],
    targetIndustries: ['All'],
    status: 'UPCOMING',
    promptContext: 'Diyas, Lakshmi Puja, prosperity, new investments, festive bonuses, gifting, sweet distribution.',
  },
];

export default function CalendarPage() {
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [testRunNotice, setTestRunNotice] = useState<string | null>(null);

  const filteredEvents = mockEvents.filter((e) => {
    const matchesRegion =
      selectedRegion === 'All' ||
      e.regions.includes(selectedRegion) ||
      e.regions.includes('Pan-India');
    const matchesIndustry =
      selectedIndustry === 'All' ||
      e.targetIndustries.includes(selectedIndustry) ||
      e.targetIndustries.includes('All');
    const matchesSearch =
      e.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.promptContext.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesIndustry && matchesSearch;
  });

  const handleTestRun = (eventName: string) => {
    setTestRunNotice(`Triggered test campaign for "${eventName}". Inngest event sent.`);
    setTimeout(() => setTestRunNotice(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-inter">
      {/* Toast Alert */}
      {testRunNotice && (
        <div className="p-3.5 rounded-[12px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
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
            <span className="text-xs text-gray-500">
              Daily 4:00 AM IST Cron Active (Inngest)
            </span>
          </div>
          <h2 className="font-sora text-xl font-bold text-[#0B0F14] mt-1">
            Indian Cultural & Regional Calendar
          </h2>
          <p className="text-xs text-gray-500">
            KUIRO wakes up 48 hours prior to every festival and professional day, crafting authentic multi-channel creatives tailored to your region and business.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-3">
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
              <option value="Karnataka">Karnataka</option>
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
              <option value="Healthcare">Healthcare & Clinics</option>
              <option value="F&B">F&B & Cafes</option>
              <option value="Retail">Retail & D2C</option>
              <option value="Tech">Tech & Startups</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-[14px] border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-gray-300 transition"
          >
            <div>
              {/* Status Header */}
              <div className="flex items-center justify-between mb-2">
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
                  {event.status === 'UPCOMING' && `In ${event.daysRemaining} Days`}
                </span>
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
                onClick={() => handleTestRun(event.eventName)}
                className="text-xs font-semibold text-[#FF7A00] hover:text-[#E66E00] flex items-center gap-1"
              >
                <span>Test Run</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

