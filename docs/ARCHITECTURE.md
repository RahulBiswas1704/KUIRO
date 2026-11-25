# KUIRO System Architecture & Engineering Guide

> **High-Reliability Autonomous AI Marketing Employee Platform**  
> Technical documentation detailing subsystem boundaries, data models, state machines, and testing architecture.

---

## 1. High-Level Architectural Topology

```
                                  [EXTERNAL CHANNELS & PROVIDERS]
            Meta Cloud API      Instagram Graph     LinkedIn API      X (Twitter) API     Razorpay / UPI
                  │                    │                   │                 │                  │
                  ▼                    ▼                   ▼                 ▼                  ▼
    ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
    │                                  INGESTION & SECURITY PERIMETER                                 │
    │  - HMAC-SHA256 Signatures     - IP/SSRF Blocklist (RFC 1918)    - 5-Attempt Brute-Force Defense │
    │  - Anti-Replay Event Cache    - Request Correlation IDs         - AES-256-GCM OAuth Token Vault │
    └───────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                    │
                                                    ▼
    ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
    │                               NEXT.JS 15 APPLICATION RUNTIME                                    │
    │                                                                                                 │
    │   APP ROUTER LAYER (src/app/)                                                                   │
    │   ├── Public & Marketing Routes:  /, /pricing, /services, /contact, /login, /signup             │
    │   ├── Operator Console:           /admin (Level 5 Clearance & Audit Ledger)                     │
    │   ├── Multi-Tenant Dashboard:     /dashboard (Brand Brain, Cultural Calendar, Inbox, Simulator) │
    │   └── Serverless API Endpoints:   /api/auth/*, /api/campaigns/*, /api/inbox/*, /api/billing/*   │
    │                                                                                                 │
    │   CORE SUBSYSTEMS (src/lib/)                                                                    │
    │   ├── ai/              Gemini 3.5 Flash Lite, 6D AI Critic, Voice Transcription                 │
    │   ├── brand-brain/     URL Extraction, Industry Detection, Tone & Negative Constraints          │
    │   ├── campaigns/       48-Hour Finite State Machine, Multi-Channel Generator, Surgical Reviser  │
    │   ├── cron/            Vercel Cron Authentication & Schedule Timing Window                      │
    │   ├── crypto/          AES-256-GCM Token Vault with Multi-Version Key Rotation                  │
    │   ├── events/          Durable Event Processing, Idempotency Ledger, Failure Classifier         │
    │   ├── inbox/           Omni-Channel Dispatcher, 24-Hour Messaging Window, SSE Event Hub         │
    │   ├── inngest/         Resilient Outbox Dispatcher, Inngest Workflow Engine                     │
    │   ├── media/           High-DPI Sharp Compositor, Bundled Indic Fonts (Bengali, Deva, Tamil)    │
    │   ├── observability/   Structured JSON Logger, 10-Area Telemetry Metrics, Real-Time Alerts      │
    │   ├── realtime/        Distributed Shared Pub/Sub Engine & Subscription Authorization           │
    │   ├── scheduler/       Consolidated Schedulers Inventory & Telemetry Tracker                    │
    │   ├── security/        safeFetch, DNS Resolution & Cloud Metadata Protection                    │
    │   └── social/          Meta OAuth Refresh Loop, Multi-Channel Publishers                        │
    └───────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                    │
                                                    ▼
    ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
    │                             PERSISTENT STATE & STORAGE TIERS                                    │
    │                                                                                                 │
    │   Neon Serverless PostgreSQL (Drizzle ORM)                     Cloudflare R2 / Neon Storage     │
    │   ├── 22 Relational Tables (Users, Workspaces, Campaigns)      ├── Brand Mark Vectors & Logos   │
    │   ├── 64 Optimized Indexes & Foreign Key Constraints           ├── Composited 4:5 Social Images │
    │   ├── Durable Event Ledger & Processed Webhooks                └── Inbound Voice Audio Notes    │
    │   ├── Real-Time Pub/Sub Notification Queue                     │                                │
    │   └── Anomaly Alerts & Operator Audit Trail                    │                                │
    └────────────────────────────────────────────────────────────────┴────────────────────────────────┘
```

---

## 2. Directory Structure & Subsystem Map

```
src/
├── app/                        # Next.js 15 App Router pages & serverless API endpoints
│   ├── (public)/               # Landing page (/), pricing, services, contact, legal, auth
│   ├── invite/accept/          # Signed workspace team invitation onboarding
│   ├── admin/                  # Level 5 Operator Admin Command Center (HMAC locked)
│   ├── api/                    # 40+ REST & webhook endpoints
│   │   ├── admin/              # Operator metrics, audits, alerts, and calendar sweeps
│   │   ├── auth/               # NIST session login, registration, passwordless OTP, OAuth
│   │   ├── billing/            # Checkout session initiation, payment verification, webhooks
│   │   ├── brand-brain/        # URL extraction, profile persistence, logo upload
│   │   ├── calendar/           # 365 Indian Cultural Radar, milestone triggers
│   │   ├── campaigns/          # 48h campaign generation, approval, revisions, export
│   │   ├── inbox/              # Multi-channel messaging, automations, reply dispatch, SSE stream
│   │   ├── inngest/            # Inngest webhook runtime
│   │   ├── realtime/           # Shared pub/sub subscription authorization
│   │   └── webhooks/           # Meta WhatsApp, Instagram, Messenger, Razorpay
│   └── dashboard/              # Client SaaS dashboard suite
│       ├── brand-brain/        # Knowledge visualizer & brand identity studio
│       ├── calendar/           # Indian festival radar & custom event creator
│       ├── inbox/              # Omni-channel unified inbox & instant UPI payments
│       ├── settings/           # Workspace profile, WhatsApp admin phone, team RBAC
│       └── simulator/          # Interactive 48-hour state machine simulator
├── components/                 # Domain-partitioned UI components
│   ├── auth/                   # AuthModal, GetStartedButton
│   ├── billing/                # SubscriptionCheckoutModal
│   ├── brand/                  # KuiroLogo SVG, KuiroLoader & RouteLoaderProvider
│   ├── calendar/               # CustomMilestoneModal
│   ├── contact/                # ContactHeroSection, ContactHubAndFormSection, ContactFaqAndCta
│   ├── dashboard/              # BrandStudioCanvas, CampaignRoiDashboard, Exporter
│   ├── home/                   # HeroSection, GainsBentoSection, ProcessSteps, SocialProof, Faq
│   ├── inbox/                  # DynamicSnippetManagerModal, InChatPaymentModal
│   ├── layout/                 # Navbar, Footer, AnnouncementBar
│   ├── marketing/              # CampaignRoiCalculator
│   ├── pricing/                # PricingHeroAndPlans & PricingComparisonAndFaq
│   └── services/               # ServicesHero, CapabilitiesExplorer, IndustriesAndSavings, ServicesFaq
├── constants/                  # Persona definitions, channel configurations
├── context/                    # AuthContext (session state & active persona)
├── db/                         # Drizzle ORM database access layer
│   ├── migrations/             # Authoritative SQL migration files
│   ├── index.ts                # Drizzle connection & instance
│   ├── migrate.ts              # Programmatic migration executor
│   ├── schema.ts               # Schema definitions (Auth, Brand Brain, Campaigns, Inbox, Billing, Alerts)
│   └── seed.ts                 # Seeding scripts for workspaces & calendar
├── lib/                        # Core Domain Subsystems
│   ├── ai/                     # Gemini Flash Lite, 6D AI Critic, Voice Processing
│   ├── brand-brain/            # URL Scraper, Knowledge Schemas, Logo Analysis
│   ├── campaigns/              # 48-Hour FSM, Multi-Channel Generator, Surgical Reviser
│   ├── cron/                   # Vercel Cron Authentication & Schedule Gate
│   ├── crypto/                 # AES-256-GCM Authenticated Token Vault
│   ├── email/                  # Transactional Email, Invitations & Autonomous Newsletter Publisher
│   ├── events/                 # Durable Events, Idempotency Key Builder, Classifier
│   ├── inbox/                  # Omni-Channel Dispatcher, Auto-Responder, 24h Messaging Window
│   ├── inngest/                # Durable Workflow Client & Resilient Outbox Dispatcher
│   ├── media/                  # High-DPI Sharp Compositor & Bundled Indic Typography
│   ├── observability/          # Structured JSON Logger, Telemetry Metrics, Alert Engine
│   ├── publishers/             # Social Publishing Dispatchers
│   ├── realtime/               # Distributed Shared Pub/Sub Engine
│   ├── scheduler/              # Scheduler Inventory, Execution Engine & Telemetry
│   ├── security/               # SSRF Protection & safeFetch IP Filter
│   ├── social/                 # Meta OAuth, Token Auto-Refresh, Social Publishers (incl. YouTube)
│   ├── storage/                # Cloudflare R2 / Neon Object Storage Client
│   ├── whatsapp/               # WhatsApp Cloud API, Webhook Security, Voice Transcriber
│   ├── adminAuth.ts            # Level 5 Operator Authentication
│   ├── auth.ts                 # User Session Management & Multi-Tenant Authorization
│   ├── billing.ts              # Razorpay/Cashfree Gateway & GST Invoicing Engine
│   └── index.ts                # Central Barrel Hub
└── types/                      # Centralized TypeScript domain interfaces
```

---

## 3. The 48-Hour Campaign State Machine

```
   [Trigger: Festival / Evergreen]
                 │
                 ▼
          (GENERATING)
                 │
                 ▼ (AI Critic Pass >= 80)
        (REVIEW_PENDING) ───[Customer: "Change color"]───► (REVISION_REQUESTED)
                 │                                                    │
                 │                                                    ▼ (Surgical Revision)
                 ├───────[Customer: "Pause campaign"]───► (PAUSED)    │
                 │                                           │        │
                 │◄──────[Customer: "Unpause & approve"]─────┘        │
                 │                                                    │
                 ├───────[Customer: "Approve now"]────────────────────┤
                 │                                                    │
                 ▼ (Timeout 48h: Auto-Commit)                         │
            (APPROVED) ◄──────────────────────────────────────────────┘
                 │
                 ▼ (At publishAt: Asia/Kolkata 10:00 AM)
        (READY_TO_PUBLISH)
                 │
                 ▼ (Acquire Lock via durable_events)
           (PUBLISHING)
                 │
        ┌────────┴──────────────────────────┐
        │                                   │
        ▼ (Provider 200 OK)                 ▼ (Transient 503 / Timeout)
   (PUBLISHED)                          (FAILED)
   [Terminal]                               │
                                            ▼ (Auto-Retry / Operator Sweep)
                                    (READY_TO_PUBLISH)
```

---

## 4. Multi-Tenant Security & Isolation Model

KUIRO implements zero-trust tenant isolation:
1. **Database-Level Tenant Keys**: Every resource table (`scheduled_campaigns`, `conversations`, `brand_profiles`, `social_connections`) has a mandatory `workspace_id` foreign key.
2. **Session Gate (`authorizeWorkspace`)**: Every protected route verifies that the requesting user's active session strictly owns or holds membership in the target workspace in Neon PostgreSQL.
3. **SSRF Guard (`safeFetch`)**: Prevents server-side request forgery by blocking private RFC 1918 addresses, loopback (`127.0.0.1`, `::1`), link-local (`169.254.169.254` AWS/GCP cloud metadata), and non-standard ports.
4. **Token Vault (AES-256-GCM)**: OAuth tokens are encrypted at rest with multi-version key rotation support (`<v1>:aes256gcm:<iv>:<tag>:<ciphertext>`), preventing plaintext leakage even in raw database dumps.

---

## 5. Three-Tier Testing Architecture & Release Gates

| Test Tier | Directory | Scope | Assertions |
| :--- | :--- | :--- | :---: |
| **Level A: Unit Tests** | `tests/unit/` | Cryptography, SSRF, AI Critic Zod schemas, FSM transitions, idempotency keys | 108 |
| **Level B: Integration Tests** | `tests/integration/` | Neon PostgreSQL persistence, tenant isolation, Meta webhooks, Razorpay activation, durable retries | 73 |
| **Level C: End-to-End Tests** | `tests/e2e/` | Complete 12-step simulated customer lifecycle | 34 |
| **Total Test Assertions** | `tests/runner.ts` | **6 Mandatory Release Gates** | **215** |

### Release Gates Enforced by CI/CD:
- **Gate 1**: Cryptographic Authentication & Password Integrity (100% Pass)
- **Gate 2**: Webhook HMAC Cryptographic Signatures & Anti-Replay (100% Pass)
- **Gate 3**: Regulatory AI Critic Guardrails & Schema Conformance (100% Pass)
- **Gate 4**: Campaign State Machine Determinism & Idempotency Formatting (100% Pass)
- **Gate 5**: Multi-Tenant Isolation & Zero Data Leakage (100% Pass)
- **Gate 6**: Complete 12-Step Customer Journey End-to-End (100% Pass)
