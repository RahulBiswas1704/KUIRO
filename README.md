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
├── .github/
│   └── workflows/              # GitHub Actions CI quality gates (.github/workflows/ci.yml)
├── public/                     # Static assets, logos, brand vectors & Indic TTF fonts
│   ├── brand/                  # Official KUIRO logos (SVG, PNG) & dark/light variants
│   └── fonts/                  # Bundled Indic fonts (Bengali, Devanagari, Tamil)
├── src/
│   ├── app/                    # Next.js 15 App Router pages & API routes
│   │   ├── (public)/           # Public landing, pricing, services, legal pages
│   │   ├── admin/              # Level 5 Operator Admin Command Center
│   │   ├── api/                # 40+ Serverless API routes (admin, auth, campaigns, inbox, webhooks, etc.)
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
│   ├── db/                     # Neon PostgreSQL Drizzle connection, schema & migrations
│   │   ├── migrations/         # Authoritative Drizzle SQL migration ledger
│   │   ├── migrate.ts          # Migration executor (tsx src/db/migrate.ts)
│   │   ├── schema.ts           # 22 tables, 64 indexes (Auth, Brand Brain, Campaigns, Inbox, Billing, Alerts, PubSub)
│   │   └── seed.ts             # Initial demo workspace & cultural calendar seeds
│   ├── lib/                    # 19 Mission-Critical Domain Subsystems (with index.ts barrel hub)
│   │   ├── ai/                 # Gemini Flash Lite, 6D AI Critic, image analysis & voice transcription
│   │   ├── brand-brain/        # URL knowledge extraction, schema validation, logo analysis
│   │   ├── campaigns/          # 48-hour state machine, multi-channel generator, surgical reviser
│   │   ├── cron/               # Vercel Cron authentication & timing validation
│   │   ├── crypto/             # AES-256-GCM token vault with multi-version key rotation
│   │   ├── email/              # Transactional email & autonomous newsletter publisher
│   │   ├── events/             # Durable event handling, idempotency key builder & failure classifier
│   │   ├── inbox/              # Omni-channel dispatch service, 24h messaging window, event hub
│   │   ├── inngest/            # Resilient outbox dispatcher & background cron workflows
│   │   ├── media/              # High-DPI compositor, SVG ligature builder, Indic typography
│   │   ├── observability/      # Structured JSON logger, multi-area metrics & anomaly alerts
│   │   ├── publishers/         # Multi-platform post dispatchers
│   │   ├── realtime/           # Distributed shared pub/sub manager & subscription authorization
│   │   ├── scheduler/          # Scheduler inventory, execution engine & telemetry
│   │   ├── security/           # SSRF protection, private IP filtering, safeFetch
│   │   ├── social/             # Meta OAuth, token auto-refresh, multi-channel publishers
│   │   ├── storage/            # Cloudflare R2 / Neon Object Storage S3 client
│   │   ├── supabase/           # Read-only Supabase compatibility client
│   │   └── whatsapp/           # Meta WhatsApp Cloud API client, webhook security & voice processor
│   └── types/                  # Centralized TypeScript interfaces and domain data models
├── tests/                      # Three-Tier Automated Quality Architecture
│   ├── unit/                   # Level A: Auth, Security/SSRF, AI Critic, State Machine (108 tests)
│   ├── integration/            # Level B: Neon DB, Multi-Tenant, Meta Webhook, Billing, Idempotency (73 tests)
│   ├── e2e/                    # Level C: Complete 12-Step Customer Journey (34 tests)
│   ├── runner.ts               # Master test runner enforcing 6 Release Gates (215 assertions)
│   └── setup.ts                # Environment fixtures & assertions framework
├── scripts/                    # Offline verification, Indic font downloader & seed scripts
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

### 3. Database Migrations
Apply Drizzle migrations to Neon PostgreSQL:
```bash
npm run db:migrate
```

### 4. Run Automated Tests & Quality Gates
Execute the comprehensive test suites across all three tiers:
```bash
# Run all 6 release gates (Level A, Level B, and Level C)
npm test

# Run Level A unit test suites
npm run test:unit

# Run Level B database integration suites
npm run test:integration

# Run Level C full 12-step customer journey
npm run test:e2e

# Run strict TypeScript compilation check
npm run typecheck
```

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the KUIRO Autopilot dashboard and interactive 48-Hour state machine simulator.

### 6. Run Inngest Dev Server
```bash
npx inngest-cli@latest dev
```
Navigate to [http://localhost:8288](http://localhost:8288) to inspect the 48-hour sleep state machine, retry queues, and function runs.
