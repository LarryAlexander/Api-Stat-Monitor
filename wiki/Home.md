# Welcome to the PulseBoard Wiki

PulseBoard is a production-ready, open-core API uptime and latency monitoring SaaS built on Next.js 16, Tailwind CSS v4, Firebase Auth + Firestore, and Stripe billing.

This Wiki serves as the official technical manual, operational guide, and contributor documentation.

## Documentation Index

- [Architecture & Data Flow](file:///Users/lathekid/Documents/Api-Stat-Monitor/wiki/Architecture-&-Data-Flow.md) — Under-the-hood look at how checks run, how auth is guarded, and how billing is gated.
- [Local Development Setup](file:///Users/lathekid/Documents/Api-Stat-Monitor/wiki/Local-Development-Setup.md) — How to spin up the local emulator suite, run Playwright E2E tests, and set up environment keys.
- [Operations & Self-Hosting](file:///Users/lathekid/Documents/Api-Stat-Monitor/wiki/Operations-&-Self-Hosting.md) — Docker standalone guides, Firebase rule deployments, and setting up automated cron triggers.
- [Troubleshooting & FAQ](file:///Users/lathekid/Documents/Api-Stat-Monitor/TROUBLESHOOTING.md) — Real-world solutions for common issues (auth, caching, emulator ports, etc.).

## Core Philosophy

PulseBoard operates under an **Open-Core / Source-Available** model using the **Elastic License 2.0 (ELv2)**:
1. **Developer First**: Fully self-hostable with zero restrictions for internal or non-commercial monitoring.
2. **Business Protected**: Strictly prohibits competing SaaS hosting, making it safe for us to build and run a commercial cloud business.
3. **Optimized Overhead**: Uses Firebase for a serverless database layer, keeping operational costs for the SaaS extremely low.
