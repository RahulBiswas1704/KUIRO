'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Smartphone,
  Brain,
  CalendarDays,
  Share2,
  Settings,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Menu,
  X,
  BellRing,
  LogOut,
  MessagesSquare,
  Building2,
  Check,
  Loader2,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import KuiroLogo from '@/components/brand/KuiroLogo';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  {
    name: 'Autopilot Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: 'LIVE',
  },
  {
    name: 'Unified Omni Inbox',
    href: '/dashboard/inbox',
    icon: MessagesSquare,
    badge: 'OMNI',
  },
  {
    name: 'WhatsApp Simulator',
    href: '/dashboard/simulator',
    icon: Smartphone,
    badge: '48h Loop',
  },
  {
    name: 'Brand Brain Studio',
    href: '/dashboard/brand-brain',
    icon: Brain,
  },
  {
    name: '365 Cultural Calendar',
    href: '/dashboard/calendar',
    icon: CalendarDays,
    badge: 'India',
  },
  {
    name: 'Connected Channels',
    href: '/dashboard#channels',
    icon: Share2,
  },
  {
    name: 'Admin Command Center',
    href: '/admin',
    icon: ShieldCheck,
    badge: 'CORE',
  },
];

const PERSONAS_LIST = [
  {
    key: 'sharma' as const,
    name: 'Dr. Sharma Dental Clinics',
    doctor: 'Dr. Rajesh Sharma (BDS, MDS)',
    category: 'Healthcare',
    color: '#FF7A00',
    iconBg: 'bg-orange-50 text-[#FF7A00] border-orange-200',
    emoji: '🩺',
  },
  {
    key: 'sengupta' as const,
    name: 'Sengupta Aesthetic & Skin Clinic',
    doctor: 'Dr. Debolina Sengupta (MD Derm)',
    category: 'Dermatology',
    color: '#6366F1',
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    emoji: '✨',
  },
  {
    key: 'mehta' as const,
    name: 'Mehta Yoga & Holistic Wellness',
    doctor: 'Ananya Mehta (E-RYT 500)',
    category: 'Fitness/Wellness',
    color: '#00C88C',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    emoji: '🧘',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout, switchPersona } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isSwitchingPersona, setIsSwitchingPersona] = useState(false);

  const getActivePersonaKey = (): 'sharma' | 'sengupta' | 'mehta' => {
    const email = user?.email?.toLowerCase() || '';
    const biz = user?.businessName?.toLowerCase() || '';
    if (email.includes('sengupta') || biz.includes('sengupta')) return 'sengupta';
    if (email.includes('mehta') || biz.includes('mehta') || biz.includes('yoga')) return 'mehta';
    return 'sharma';
  };

  const activePersonaKey = getActivePersonaKey();
  const activePersona = PERSONAS_LIST.find((p) => p.key === activePersonaKey) || PERSONAS_LIST[0];

  const handlePersonaSelect = async (key: 'sharma' | 'sengupta' | 'mehta') => {
    if (key === activePersonaKey) {
      setIsPersonaMenuOpen(false);
      return;
    }
    setIsPersonaMenuOpen(false);
    setIsSwitchingPersona(true);
    await switchPersona(key);
    setIsSwitchingPersona(false);
  };

  const currentWorkspaceName = user?.businessName || activePersona.name;
  const userName = user?.name || activePersona.doctor.split(' (')[0];
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col md:flex-row text-[#0B0F14] font-inter">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0B0F14] border-b border-gray-800 text-white z-50">
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <KuiroLogo variant="primary" theme="dark" symbolSize={30} />
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-gray-900 text-gray-300 hover:text-white"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu backdrop"
        />
      )}

      {/* Charcoal Sidebar (30% Surface Allocation) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0B0F14] text-white flex flex-col z-40 transition-transform duration-200 border-r border-[#1E2530] ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Lockup */}
        <div className="px-6 py-6 border-b border-[#1E2530]">
          <Link href="/dashboard" className="inline-block focus:outline-none flex-shrink-0">
            <KuiroLogo variant="primary" theme="dark" symbolSize={34} />
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-gray-400 tracking-wide uppercase">
              Autopilot Active • 48h Loop
            </span>
          </div>
        </div>

        {/* Workspace Selector */}
        <div className="px-4 py-3 border-b border-[#1E2530] relative">
          <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
            Current Workspace
          </label>
          <button
            onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] bg-[#161C24] hover:bg-[#1E2530] border border-[#27313F] text-sm text-gray-200 transition text-left"
          >
            <div className="flex items-center gap-2 truncate">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{ backgroundColor: activePersona.color }}
              >
                {activePersona.emoji}
              </div>
              <span className="truncate text-xs font-medium">{currentWorkspaceName}</span>
            </div>
            <ChevronDown size={14} className="text-gray-400 shrink-0 ml-1" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-[10px] text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#1E2530] text-white border-l-2 border-[#FF7A00] font-semibold'
                    : 'text-gray-300 hover:bg-[#151B22] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    strokeWidth={1.8}
                    className={isActive ? 'text-[#FF7A00]' : 'text-gray-400'}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#FF7A00]/20 text-[#FF7A00]'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* WhatsApp Guardian Pill */}
        <div className="p-3 mx-3 mb-3 rounded-[12px] bg-[#141B22] border border-[#232D3B]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
              WhatsApp Admin
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs text-gray-200 mt-1 font-mono font-medium truncate">
            +91 98301 24589
          </p>
          <div className="mt-2 pt-2 border-t border-[#232D3B] flex items-center justify-between text-[11px] text-gray-400">
            <span>2 Revisions Max</span>
            <span className="text-emerald-400 font-medium">Passive OK</span>
          </div>
        </div>

        {/* User Footer with Sign Out */}
        <div className="p-4 border-t border-[#1E2530] flex items-center justify-between bg-[#0B0F14]">
          <div className="flex items-center gap-2.5 truncate mr-2">
            <div className="w-8 h-8 rounded-full bg-[#1E2530] border border-[#2D3748] flex items-center justify-center text-xs font-semibold text-white shrink-0">
              {userInitials || 'RS'}
            </div>
            <div className="leading-tight truncate">
              <p className="text-xs font-medium text-white truncate">{userName}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email || 'dr.sharma@apexclinic.in'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={logout}
              className="text-gray-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-white/5 transition"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
            <Link
              href="/"
              className="text-gray-400 hover:text-white p-1.5 rounded-md hover:bg-white/5 transition"
              title="Public Site"
            >
              <ExternalLink size={15} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Canvas (55% White Reading Canvas) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="font-sora text-sm font-semibold text-[#0B0F14]">
              {pathname === '/dashboard' && 'Autonomous Marketing Autopilot'}
              {pathname === '/dashboard/simulator' && 'WhatsApp Interactive Simulator'}
              {pathname === '/dashboard/inbox' && 'Unified Multi-Channel Inbox & Routing'}
              {pathname === '/dashboard/brand-brain' && 'The Brand Brain Studio'}
              {pathname === '/dashboard/calendar' && '365-Day Indian Cultural Calendar'}
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium hidden sm:inline">
              Workspace Isolated
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* 1-Click Tenant Switcher / Persona Simulator */}
            <div className="relative">
              <button
                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                disabled={isSwitchingPersona}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-[#0B0F14] transition shadow-sm"
                title="Switch Multi-Tenant Operator Persona"
              >
                {isSwitchingPersona ? (
                  <Loader2 size={14} className="animate-spin text-[#FF7A00]" />
                ) : (
                  <span className="text-sm">{activePersona.emoji}</span>
                )}
                <div className="text-left hidden lg:block leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Tenant Simulator:</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-gray-200 text-gray-700">{activePersona.category}</span>
                  </div>
                  <p className="font-semibold text-xs text-[#0B0F14] truncate max-w-[190px]">
                    {activePersona.name}
                  </p>
                </div>
                <ChevronDown size={13} className="text-gray-400 shrink-0 ml-0.5" />
              </button>

              {/* Persona Dropdown Menu */}
              {isPersonaMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsPersonaMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-fade-in text-left">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        1-Click Tenant Persona Simulator
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Instantly inspect workspace Brand Brain, colors, and 48h campaign queues:
                      </p>
                    </div>

                    {PERSONAS_LIST.map((p) => {
                      const isSelected = p.key === activePersonaKey;
                      return (
                        <button
                          key={p.key}
                          onClick={() => handlePersonaSelect(p.key)}
                          disabled={isSwitchingPersona}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition ${
                            isSelected
                              ? 'bg-orange-50 border border-orange-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 border"
                            style={{ backgroundColor: `${p.color}15`, borderColor: `${p.color}40` }}
                          >
                            {p.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-gray-900 truncate">
                                {p.name}
                              </p>
                              {isSelected && (
                                <span className="text-[9px] font-bold text-[#FF7A00] bg-orange-100 px-1.5 py-0.5 rounded-full shrink-0">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">
                              {p.doctor}
                            </p>
                            <span className="inline-block text-[9px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded mt-1">
                              {p.category}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <Link
              href="/dashboard/simulator"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-orange-50 border border-orange-200 text-[#FF7A00] text-xs font-semibold hover:bg-orange-100 transition"
            >
              <Smartphone size={14} />
              <span>Simulate WhatsApp</span>
            </Link>
            <button className="p-2 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 relative">
              <BellRing size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF7A00]" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3.5 sm:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

