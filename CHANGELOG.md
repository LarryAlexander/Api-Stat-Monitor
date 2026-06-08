# Changelog

All notable changes to PulseBoard will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

> Changes in `main` that haven't been tagged yet.

---

## [v0.5.0] — 2026-06-08

### Added
- **Phase 5 — Open Core Packaging**: Full public-release preparation
- `Dockerfile` and `docker-compose.yml` for containerized self-hosting
- `SELF_HOSTING.md` — comprehensive guide for self-hosted deployments
- `LICENSE` — MIT open-source license
- `OPEN_CORE_STRATEGY.md` — business model documentation
- `READINESS_CHECKLIST.md` — pre-launch checklist for operators
- `DEPLOY.md` — deployment reference guide
- `ROADMAP.md` — public product roadmap
- `PROJECT_MANAGEMENT.md` — project governance document
- `next.config.ts` updated to use `output: "standalone"` for optimized Docker builds
- `.env.example` updated with all required and optional environment variables

---

## [v0.4.0] — 2026-06-08

### Added
- **Phase 4 — Stripe Billing Integration**
- Stripe subscription management via `/api/billing/` routes
- Webhook endpoint (`/api/billing/webhook`) for real-time subscription sync
- `NEXT_PUBLIC_BILLING_ENABLED` kill-switch — set to `false` for fully unlimited, free deployments
- Monitor gating based on workspace subscription status (`isWorkspaceGated`)
- `stripe_customer_id`, `subscription_status`, `subscription_id` fields on `Workspace` model

---

## [v0.3.0] — 2026-06-08

### Added
- **Phase 3 — Alerting System**
- `lib/alerts.ts` — prioritized alert dispatch: SMTP (via Nodemailer) → Resend API → console fallback
- Email alerts triggered on monitor incidents (status transitions to `down`)
- `nodemailer` and `@types/nodemailer` added as dependencies
- SMTP and Resend configuration in `.env.example`

---

## [v0.2.0] — 2026-06-08

### Added
- **Phase 2 — Recurring Scheduled Checks**
- `/api/checks/scheduled` endpoint for cron-driven health checks
- Background execution via Next.js `after()` to avoid cold-start timeouts
- Monitor scheduling logic respecting individual check intervals

---

## [v0.1.0] — 2026-06-07

### Added
- **Phase 1 — Core Platform**
- Firebase Authentication (Google SSO)
- Firestore-backed workspace and monitor data model
- Real-time dashboard with monitor status, uptime %, and response time charts
- Manual "check now" capability
- Incident history and timeline view
- Next.js 16 App Router architecture
- Tailwind CSS v4 styling

---

[Unreleased]: https://github.com/LarryAlexander/Api-Stat-Monitor/compare/v0.5.0...HEAD
[v0.5.0]: https://github.com/LarryAlexander/Api-Stat-Monitor/compare/v0.4.0...v0.5.0
[v0.4.0]: https://github.com/LarryAlexander/Api-Stat-Monitor/compare/v0.3.0...v0.4.0
[v0.3.0]: https://github.com/LarryAlexander/Api-Stat-Monitor/compare/v0.2.0...v0.3.0
[v0.2.0]: https://github.com/LarryAlexander/Api-Stat-Monitor/compare/v0.1.0...v0.2.0
[v0.1.0]: https://github.com/LarryAlexander/Api-Stat-Monitor/releases/tag/v0.1.0
