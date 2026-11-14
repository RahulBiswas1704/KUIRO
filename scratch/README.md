# KUIRO Security & Architecture Automated Test Suites

This directory contains standalone, automated verification test suites authored to test and validate KUIRO's production security guardrails, tenant isolation, and mission-critical workflows against the running server.

## Test Suites

| Test Suite | Purpose | Target Endpoints / Subsystems |
| :--- | :--- | :--- |
| `test-auth-hardening.js` | Validates removal of client-side fake user fallbacks and strict server authentication. | `/api/auth/login`, `/api/auth/signup`, `/api/auth/me` |
| `test-passwordless-bypass.js` | Verifies rejection of missing passwords, brute-force rate limiting, and OTP flows. | `/api/auth/login`, `/api/auth/otp/*`, `/api/auth/reset-password` |
| `test-api-session-enforcement.js` | Enforces verified session validation (`requireSession`) across protected API routes. | All 45 application API routes |
| `test-tenant-isolation-enforcement.js` | Verifies strict tenant scoping (`authorizedWorkspaceId`) on queries, mutations, deletes, and SSE streams. | `/api/campaigns`, `/api/inbox/*`, `/api/brand-brain/*`, `/api/social-connections` |
| `test-ssrf-protection.js` | Tests SSRF guardrails (loopback, private RFC 1918, link-local, metadata, credentials, ports, size limits). | `/api/brand-brain/extract`, `safeFetch` |
| `test-meta-webhook-verification.js` | Verifies Meta WhatsApp webhook challenge verification, HMAC-SHA256 signatures, and event deduplication. | `/api/webhooks/whatsapp` |
| `test-production-infrastructure.js` | Verifies resilient Inngest dispatching, S3/R2 storage health, and multi-frequency cron sweeper. | `/api/health`, `/api/inngest`, `/api/calendar/cron-trigger` |
| `test-ai-campaign-workflows.js` | Verifies multi-channel generation, AI Critic scoring rubric (0-100), and surgical revision loop. | `/api/campaigns`, `/api/inbox/ai-suggest` |

## Execution

Ensure the development or production server is running on `http://localhost:3000`:
```bash
node scratch/<test-file>.js
```
