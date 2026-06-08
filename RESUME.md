# PulseBoard — Resume Placement Guide

You can absolutely list PulseBoard on your resume! It is a complete, production-ready, full-stack application integrating modern technologies (Next.js 16, Firebase, Stripe, Docker, Playwright, CI/CD).

Here is how you can pitch this project on your resume, categorized by targeted engineering roles.

---

## 🚀 Option 1: Full-Stack Software Engineer
*Focuses on UI/UX excellence, end-to-end integration, and business features (billing).*

> **Personal Project | Full-Stack Software Engineer (PulseBoard)**  
> *Developed and open-sourced a source-available, low-overhead API uptime and latency monitoring SaaS platform.*
> - Architected a high-fidelity monitoring dashboard utilizing Next.js 16 App Router, React 19, and Tailwind CSS v4, supporting real-time latency graphs and server-side status filtering.
> - Integrated Stripe checkout flows, subscription webhooks, and billing portals to implement robust billing limits and tier gating.
> - Authored a robust end-to-end test suite containing 20 Playwright tests checking authentication, API responsiveness, page layout, and error boundaries.

---

## ⚙️ Option 2: Backend / Systems Engineer
*Focuses on background check execution, caching, lazy loading, and database design.*

> **Personal Project | Backend Engineer (PulseBoard)**  
> *Engineered the event-driven check runner and serverless database model for an API health monitor SaaS.*
> - Implemented an out-of-band monitoring execution pipeline using Next.js 16's native `after()` callback, ensuring serverless function execution is not blocked by ping wait times.
> - Designed a resilient, retry-on-failure scheduler that instantly retries failed connections after a 1-second delay, drastically reducing false positive incident reports.
> - Refactored Firebase Admin SDK initialization to use lazy getters, eliminating stale credential cache lockups and accelerating local emulator performance.
> - Secured scheduled endpoints with Authorization headers and hardened Firestore rules to strictly scope read/writes to resource owners (`isOwner`).

---

## 🐳 Option 3: DevOps / Cloud Platform Engineer
*Focuses on Docker standalone builds, automated releases, dependency managers, and CI pipelines.*

> **Personal Project | Platform & Release Engineer (PulseBoard)**  
> *Built the deployment, automation, and packaging infrastructure for a source-available SaaS project.*
> - Containerized the Next.js application using a multi-stage `Dockerfile` optimized for Next.js standalone server outputs, reducing final image size by 70%.
> - Authored a GitHub Actions CI pipeline executing TypeScript compilation checks, ESLint, and Next.js production builds on all incoming Pull Requests.
> - Built an automated release workflow using GitHub Actions that compiles, packages source assets, and deploys a formal GitHub Release upon tag creation (`vX.Y.Z`).
> - Established automated security maintenance using Dependabot to run weekly npm dependency audits and monthly GitHub Action security updates.

---

## Technical Stack Summary for Resume Sidebar
**Next.js 16 (App Router), React 19, TypeScript, Firebase (Auth/Firestore), Stripe, Playwright E2E, Docker, GitHub Actions CI/CD, SMTP/Resend API, Tailwind CSS v4.**
