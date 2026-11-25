'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Smartphone,
  Brain,
  CalendarDays,
  Share2,
  Settings,
  ChevronDown,
  ExternalLink,
  Menu,
  X,
  BellRing,
  LogOut,
  MessagesSquare,
  Loader2,
} from 'lucide-react';
import KuiroLogo from '@/components/brand/KuiroLogo';
import { useAuth } from '@/context/AuthContext';
import { PERSONAS_LIST } from '@/constants/personas';

const navItems = [
  {
    name: 'Autopilot Radar',
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
    name: 'WhatsApp 48h Terminal',
    href: '/dashboard/simulator',
    icon: Smartphone,
    badge: 'LIVE',
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
    name: 'Workspace Settings',
    href: '/dashboard/settings',
    icon: Settings,
    badge: 'NEW',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, isLoading, logout, switchPersona } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isSwitchingPersona, setIsSwitchingPersona] = useState(false);

  // Client-side authentication guard
  useEffect(() => {
    if (!isLoading && !isLoggedIn && !user) {
      router.push(`/get-started?mode=signin`);
    }
  }, [isLoading, isLoggedIn, user, router]);

  const getActivePersonaKey = (): 'sharma' | 'sengupta' | 'mehta' => {
    const email = user?.email?.toLowerCase() || '';
    const biz = user?.businessName?.toLowerCase() || '';
    if (email.includes('sen') || biz.includes('sen') || biz.includes('advisory')) return 'sengupta';
    if (email.includes('mehta') || biz.includes('mehta') || biz.includes('clinic') || biz.includes('care') || biz.includes('health')) return 'mehta';
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
  const userName = user?.name || activePersona.doctor.split(' •')[0];
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  return (
    <div className="min-h-screen bg-[#070A11] text-white flex flex-col md:flex-row font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-x-clip">
      {/* Ambient Radial Lighting Glow */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[500px] bg-gradient-to-b from-[#FF7A00]/[0.05] via-transparent to-transparent pointer-events-none -z-10 blur-3xl" />
      <div className="fixed bottom-0 right-10 w-[500px] h-[400px] bg-gradient-to-t from-emerald-500/[0.03] via-transparent to-transparent pointer-events-none -z-10 blur-3xl" />

      {/* =========================================================================
          MOBILE HEADER
      ========================================================================= */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#080B12]/95 border-b border-white/[0.08] backdrop-blur-xl text-white sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <KuiroLogo variant="primary" theme="dark" symbolSize={28} showTagline={false} />
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono"
          >
            <span>{activePersona.emoji}</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation Drawer"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* =========================================================================
          LUXURY OBSIDIAN SIDEBAR (Zorcha Glassmorphism)
      ========================================================================= */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 lg:w-72 bg-[#080B12]/95 backdrop-blur-2xl text-white flex flex-col z-40 transition-transform duration-200 border-r border-white/[0.08] ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Lockup Header */}
        <div className="px-6 py-5 border-b border-white/[0.08]">
          <Link href="/dashboard" className="inline-block focus:outline-none flex-shrink-0 group">
            <KuiroLogo variant="primary" theme="dark" symbolSize={32} showTagline={false} />
          </Link>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-medium text-emerald-400/90 tracking-wide uppercase">
              Autopilot Active • 48h Loop
            </span>
          </div>
        </div>

        {/* Current Workspace Selector Pill */}
        <div className="px-4 py-3.5 border-b border-white/[0.08] relative">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Active Workspace
            </span>
            <span className="text-[9px] font-mono text-[#FF7A00] bg-[#FF7A00]/10 px-1.5 py-0.5 rounded border border-[#FF7A00]/20">
              {activePersona.category}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs text-white transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 border"
                style={{ backgroundColor: `${activePersona.color}25`, borderColor: `${activePersona.color}50` }}
              >
                {activePersona.emoji}
              </div>
              <span className="truncate text-xs font-sora font-semibold text-slate-200 group-hover:text-white">
                {currentWorkspaceName}
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1 group-hover:text-white transition" />
          </button>

          {/* Persona Switcher Dropdown */}
          {isPersonaMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsPersonaMenuOpen(false)}
              />
              <div className="absolute left-4 right-4 mt-2 bg-[#0A0E18] border border-white/[0.12] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50 p-2 space-y-1 animate-fade-in text-left">
                <div className="px-3 py-2 border-b border-white/[0.06]">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Workspace Profiles
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select brand workspace profile &amp; 48h campaign queues:
                  </p>
                </div>

                {PERSONAS_LIST.map((p) => {
                  const isSelected = p.key === activePersonaKey;
                  return (
                    <button
                      key={p.key}
                      onClick={() => handlePersonaSelect(p.key)}
                      disabled={isSwitchingPersona}
                      className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#FF7A00]/15 border border-[#FF7A00]/30 text-white'
                          : 'hover:bg-white/[0.04] text-slate-300'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 border mt-0.5"
                        style={{ backgroundColor: `${p.color}20`, borderColor: `${p.color}40` }}
                      >
                        {p.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-sora font-bold text-white truncate">
                            {p.name}
                          </p>
                          {isSelected && (
                            <span className="text-[9px] font-mono font-bold text-[#FF7A00] bg-[#FF7A00]/20 px-1.5 py-0.5 rounded-full shrink-0">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {p.doctor}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-inter transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF7A00]/20 to-[#FF7A00]/5 text-white font-semibold border-l-2 border-[#FF7A00] shadow-[0_0_20px_rgba(255,122,0,0.15)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    strokeWidth={1.8}
                    className={`transition-colors duration-150 ${
                      isActive ? 'text-[#FF7A00]' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#FF7A00] text-black font-bold'
                        : 'bg-white/[0.06] text-slate-400 border border-white/[0.06]'
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
        <div className="p-3.5 mx-3 mb-3 rounded-2xl bg-[#0D121F] border border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Smartphone size={12} className="text-emerald-400" />
              <span>WhatsApp Admin</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs text-white mt-1 font-mono font-bold truncate">
            +91 98301 24589
          </p>
          <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>2 Revisions Max</span>
            <span className="text-emerald-400 font-medium">Passive OK</span>
          </div>
        </div>

        {/* User Footer with Quick Actions */}
        <div className="p-4 border-t border-white/[0.08] flex items-center justify-between bg-[#080B12]/80">
          <div className="flex items-center gap-2.5 truncate mr-2">
            <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-xs font-sora font-bold text-white shrink-0">
              {userInitials || 'RS'}
            </div>
            <div className="leading-tight truncate">
              <p className="text-xs font-sora font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px] font-mono text-slate-400 truncate">{user?.email || 'founder@kuiro.in'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={logout}
              className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/[0.05] transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
            <Link
              href="/"
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition"
              title="Public Site"
            >
              <ExternalLink size={15} />
            </Link>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CANVAS CONTAINER
      ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Bar */}
        <header className="h-16 bg-[#080B12]/80 backdrop-blur-2xl border-b border-white/[0.08] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="font-sora text-sm sm:text-base font-bold text-white tracking-tight">
              {pathname === '/dashboard' && 'Autonomous Marketing Autopilot'}
              {pathname === '/dashboard/simulator' && 'WhatsApp Interactive Simulator'}
              {pathname === '/dashboard/inbox' && 'Unified Multi-Channel Inbox & Routing'}
              {pathname === '/dashboard/brand-brain' && 'The Brand Brain Studio'}
              {pathname === '/dashboard/calendar' && '365-Day Indian Cultural Calendar'}
              {pathname === '/dashboard/settings' && 'Workspace & Platform Settings'}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400 hidden sm:inline">
              Workspace Isolated
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Multi-Tenant Workspace Pill */}
            <button
              type="button"
              onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
              disabled={isSwitchingPersona}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-mono text-slate-300 transition cursor-pointer"
              title="Switch Workspace Profile"
            >
              {isSwitchingPersona ? (
                <Loader2 size={13} className="animate-spin text-[#FF7A00]" />
              ) : (
                <span>{activePersona.emoji}</span>
              )}
              <span className="font-semibold text-white truncate max-w-[160px]">
                {currentWorkspaceName}
              </span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {/* WhatsApp Terminal Shortcut */}
            <Link
              href="/dashboard/simulator"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-semibold hover:bg-emerald-500/20 transition cursor-pointer"
            >
              <Smartphone size={13} />
              <span>WhatsApp Terminal</span>
            </Link>

            {/* Notification Bell */}
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/[0.05] relative transition cursor-pointer"
              title="Notifications"
            >
              <BellRing size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF7A00]" />
            </button>
          </div>
        </header>

        {/* Dashboard Dynamic Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
