# KUIRO — The Autonomous AI Marketing Employee

> **An AI Marketing Employee for Every Business.**  
> Not another social media scheduler. Not another festival poster generator. Not just another chatbot.  
> A system that takes responsibility for the repetitive marketing workflow while keeping the business owner in control.

---

## ⚡ Core Philosophy & Competitive Moat

Your biggest competitive advantage will not be the raw AI model you use. It will be how reliably you combine **business knowledge**, **regional context**, **branded content**, **approvals**, and **publishing** into one zero-friction experience:

1. **Business Knowledge (The Brand Brain)**: Extracts and persists brand identity, core offerings, tone of voice, visual palette, and strict negative constraints.
2. **Regional & Cultural Context**: 365-day hyper-local radar tracking Indian cultural, regional, and industry milestones (Diwali, Durga Puja, Doctors' Day, etc.) tied to specific business offerings.
3. **Studio Branded Content**: AI background canvases (Flux.1 / Imagen 3) composited with programmatic `@vercel/og` (Satori) and Sharp SVG overlays for high-DPI typography and verified logos.
4. **48-Hour Passive Approval ("Auto-Commit")**: WhatsApp-first preview cards sent 48 hours early. Zero action required to auto-publish. Instant revisions via WhatsApp voice notes (Whisper AI).
5. **Zero-Click Multi-Channel Sync**: Parallel publishing via official APIs to Facebook Pages, Instagram, LinkedIn, X (Twitter), YouTube Shorts, and WhatsApp.

---

## 🏗️ Architecture Stack

- **Framework**: Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS)
- **Database & Auth**: Supabase (PostgreSQL, Row-Level Security, pgvector)
- **Async Queue & 48h Timer**: Inngest (`step.sleepUntil(publishAt)`)
- **AI Models**:
  - Copywriting & Critic: Google Gemini 2.5 Flash / Pro
  - Voice Note Revisions: OpenAI Whisper / Gemini Multimodal Audio
  - Visuals: Flux.1 Pro/Dev & Satori / Sharp Compositor
- **Messaging**: Meta WhatsApp Business Cloud API

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

### 3. Database Migration
Apply the Supabase migration and seed cultural calendar:
```bash
supabase db push
# or run supabase/migrations/20261113000000_init_kuiro.sql in the Supabase SQL editor
# and seed with supabase/seed.sql
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
