# KUIRO — The Autonomous AI Marketing Employee

> **An AI Marketing Employee for Every Business.**  
> Not another social media scheduler. Not another festival poster generator. Not just another chatbot.  
> A system that takes responsibility for the repetitive marketing workflow while keeping the business owner in control.

---

## ⚡ Core Philosophy & Competitive Moat

Your biggest competitive advantage will not be the raw AI model you use. It will be how reliably you combine **business knowledge**, **regional context**, **branded content**, **approvals**, and **publishing** into one zero-friction experience:

1. **Business Knowledge (The Brand Brain)**: Extracts and persists brand identity, core offerings, tone of voice, visual palette, and strict negative constraints in Neon PostgreSQL.
2. **Regional & Cultural Context**: 365-day hyper-local radar tracking Indian cultural, regional, and industry milestones (Diwali, Durga Puja, Doctors' Day, etc.) tied to specific business offerings.
3. **Studio Branded Content**: AI background canvases composited with Sharp SVG overlays for high-DPI typography and verified logos.
4. **48-Hour Passive Approval ("Auto-Commit")**: WhatsApp-first preview cards sent 48 hours early. Zero action required to auto-publish. Instant revisions via WhatsApp voice notes.
5. **Zero-Click Multi-Channel Sync**: Parallel publishing via official APIs to Facebook Pages, Instagram, LinkedIn, X (Twitter), YouTube Shorts, and WhatsApp.
6. **Unified Omni Inbox & Payment Link Engine**: Live multi-channel inbox with real-time SSE sync, dynamic quick snippets, and in-chat instant UPI payment link generation.
7. **Level 5 Cryptographic Operator Clearance**: Direct operator terminal (`/admin`) secured with 8-hour HMAC session tokens, brute-force timing defenses, and server-side route guards.

---

## 🏗️ Architecture Stack

- **Framework**: Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS)
- **Database & Auth**: Neon Serverless PostgreSQL (Drizzle ORM) + NIST-compliant persistent database sessions
- **Storage & Media Compositor**: Cloudflare R2 / Neon Storage (S3 SDK) + Sharp Compositor with bundled pre-shaped Indic Google Fonts (Noto Sans Bengali, Devanagari, Tamil)
- **Async Engine & 48h Timer**: Inngest Durable Workflows (`step.sleepUntil(publishAt)`)
- **AI Models**: Google Gemini 3.5 Flash Lite (Brand Brain URL extraction, multi-channel copy synthesis & AI Critic)
- **Messaging & Channels**: Meta WhatsApp Business Cloud API, Instagram Graph API, LinkedIn Community API, and X Developer App (with zero-link surcharge guardrail)
- **Billing & Tax Invoicing**: Dual gateway integration (Razorpay & Cashfree) supporting UPI, NetBanking, Cards, and automated 18% GST Input Tax Credit (ITC) invoices
- **Operator Command Center**: Multi-Tenant Administration Console (`/admin`) and 1-Click Persona Simulator

---

## 📂 Codebase Directory Organization

```
KUIRO/
├── public/                     # Static assets, logos, brand vectors & Indic TTF fonts
│   ├── brand/                  # Official KUIRO logos (SVG, PNG) & dark/light variants
│   └── fonts/                  # Bundled Indic fonts (Bengali, Devanagari, Tamil)
├── src/
│   ├── app/                    # Next.js 15 App Router pages & API routes
│   │   ├── (public)/           # Public landing, pricing, services, legal pages
│   │   ├── admin/              # Level 5 Operator Admin Command Center (locked)
│   │   ├── api/                # 36+ Serverless API routes (admin, auth, campaigns, inbox, etc.)
│   │   └── dashboard/          # Client dashboard suite
│   │       ├── brand-brain/    # Visual brand identity & Brand Brain studio
│   │       ├── calendar/       # 365 Indian Cultural Radar & custom milestone builder
│   │       ├── inbox/          # Unified Omni Inbox, quick snippets & UPI link generator
│   │       ├── settings/       # Workspace profile, WhatsApp loop, billing & RBAC team seats
│   │       └── simulator/      # Interactive WhatsApp 48h loop state machine simulator
│   ├── components/             # Reusable UI component modules (with barrel index exports)
│   │   ├── auth/               # Authentication modals & Get Started triggers
│   │   ├── billing/            # SubscriptionCheckoutModal (Razorpay / Cashfree / UPI)
│   │   ├── brand/              # Dynamic SVG KuiroLogo component
│   │   ├── calendar/           # CustomMilestoneModal (flash sales & anniversaries)
│   │   ├── dashboard/          # BrandStudioCanvas, ROI Dashboard, Channels Modal, Exporter
│   │   ├── inbox/              # DynamicSnippetManagerModal & InChatPaymentModal
│   │   ├── layout/             # AnnouncementBar, Navbar, Footer
│   │   └── marketing/          # HeroMockups, CampaignRoiCalculator, SmbVerticalUseCases
│   ├── constants/              # Multi-tenant personas, social channels configuration
│   ├── context/                # Client-side AuthContext & persona simulation provider
│   ├── data/                   # Navigation items and site metadata
│   ├── db/                     # Neon PostgreSQL Drizzle connection, schema & seeds
│   ├── lib/                    # Authentication helpers, HMAC tokens & admin route guards
│   └── types/                  # Centralized TypeScript interfaces and data models
├── scripts/                    # Offline verification, migration & benchmark test scripts
├── drizzle.config.ts           # Drizzle ORM configuration for Neon Lakebase
├── next.config.ts              # Next.js bundler, remote image domains & security headers
└── tailwind.config.ts          # Custom brand colors (Kuiro Orange #FF7A00, Charcoal #0B0F14)
```

---

## 🚀 Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and configure your credentials:
```bash
cp .env.example .env.local
```

### 3. Database Migration & Schema
Push schema to Neon PostgreSQL via Drizzle:
```bash
npm run db:push
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the KUIRO Autopilot dashboard and interactive 48-Hour state machine simulator.

### 5. Run Inngest Dev Server
```bash
npx inngest-cli@latest dev
```
Navigate to [http://localhost:8288](http://localhost:8288) to inspect the 48-hour sleep state machine, retry queues, and function runs.
