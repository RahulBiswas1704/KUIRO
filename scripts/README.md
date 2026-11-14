# KUIRO Maintenance & Verification Scripts

This directory contains utility scripts for database verification, initial seeding, asset vector tracing, and verification tests.

## Categories

### 1. Database Migrations & Diagnostics
- `check-auth-tables.cjs`: Inspects Neon PostgreSQL schema to verify auth, session, and tenant table availability.
- `alter-users.cjs`: Migration helper to align user table columns with Neon Lakebase schema.
- `create-accounts.cjs`: Migration script to ensure OAuth `accounts` table exists.
- `admin-snapshot.cjs`: Takes a snapshot of current database state for operator verification.

### 2. Seed & Sample Data
- `seed-calendar.cjs`: Seeds the 365-day Indian Cultural Calendar with national and regional milestones.

### 3. Asset & Typography Pipeline
- `download-indic-fonts.cjs`: Fetches and caches Noto Sans Indic font files for Bengali, Devanagari, and Tamil scripts.
- `generate_svg_assets.js`: Vectorizes raw raster logos into crisp scalable SVGs for high-DPI compositing.
- `generate-svgs.js`: Batch generator for brand mark SVGs.
- `trace_vector.js`: Potrace-based Moore-Neighbor vector tracing algorithm for logo extraction.

### 4. Verification & Testing Suites
- `test-auth-flow.cjs`: End-to-end verification of registration, session creation, and cookie handling.
- `test-crypto.cjs`: Verifies AES-256-GCM token encryption and decryption.
- `test-indic-sharp.cjs`: Tests SVG ligature rendering and High-DPI Sharp composition for Indic text.
- `test-cron-scheduler.cjs`: Verifies the 3 Vercel cron schedules and outbox dispatch replay.
- `test-roi-attribution.cjs`: Validates calculation of ROAS, CAC, and CSV/PDF report generation.
- `verify-admin-panel.cjs`: Verifies Operator Level 5 Command Center HMAC security and dashboard isolation.

## Running Scripts

All scripts can be executed using Node.js:
```bash
node scripts/<script-name>.cjs
```
