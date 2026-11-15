import React from 'react';
import Link from 'next/link';
import KuiroLogo from '@/components/brand/KuiroLogo';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070A11] text-white flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-gradient-to-b from-[#FF7A00]/[0.08] via-transparent to-transparent pointer-events-none -z-10 blur-3xl" />

      <div className="max-w-md space-y-6">
        <Link href="/" className="inline-block hover:opacity-90 transition mx-auto">
          <KuiroLogo variant="primary" theme="dark" symbolSize={40} showTagline={false} />
        </Link>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-[#FF7A00]">
            <Compass size={14} />
            <span>HTTP 404 • Resource Not Located</span>
          </div>
          <h1 className="text-4xl font-sora font-extrabold text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-400 font-inter">
            The coordinates you requested do not exist on the KUIRO platform network.
          </p>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-sora font-semibold transition"
          >
            <ArrowLeft size={14} />
            <span>Return to Kuiro Base</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
