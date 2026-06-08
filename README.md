# PulseBoard

PulseBoard is a developer-focused API status monitor built as a clean SaaS-style dashboard. It lets a user create monitors, run health checks, inspect latency history, and review incidents from a simple workspace.

## Current state

This repository is currently in `portfolio-grade MVP` shape:

- Firebase Auth email/password login
- Firebase-backed monitor CRUD
- manual health checks
- incident creation and resolution
- monitor detail page with history and chart
- dashboard onboarding
- demo data toggle

It is not yet production-ready as a paid hosted service.

## Product goal

PulseBoard should evolve into an `open core + paid hosted` service:

- open source core for local/self-hosted monitoring
- paid hosted version for convenience, scheduling, alerts, reliability, and team features

See:

- [instruction.md](/Users/lathekid/Documents/Api-Stat-Monitor/instruction.md)
- [READINESS_CHECKLIST.md](/Users/lathekid/Documents/Api-Stat-Monitor/READINESS_CHECKLIST.md)
- [ROADMAP.md](/Users/lathekid/Documents/Api-Stat-Monitor/ROADMAP.md)
- [PROJECT_MANAGEMENT.md](/Users/lathekid/Documents/Api-Stat-Monitor/PROJECT_MANAGEMENT.md)

## Core features

- email/password auth
- workspace-scoped monitors
- create, edit, pause, resume, and delete monitors
- run all checks or single-monitor checks
- response-time history
- incident tracking
- dashboard summary cards
- demo data toggle for onboarding

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Firebase Auth
- Cloud Firestore
- Recharts

## Local development

1. Install dependencies

```bash
npm install
```

2. Create local environment file

```bash
cp .env.example .env.local
```

3. Start Firebase emulators

```bash
npm run dev:emulators
```

4. Start the web app

```bash
npm run dev
```

5. Open the app

```bash
http://127.0.0.1:3001/auth/login
```

## Firebase project

- project id: `pulseboard-lathe`
- web app id: `1:570054826036:web:b11f5ae28d47be14149261`
- local development defaults to Firebase emulators

Production deployment still requires:

- remote Firestore/Auth API enablement
- Firebase Admin credentials for server-side access
- deployment environment setup

## Scripts

- `npm run dev`
- `npm run dev:emulators`
- `npm run lint`
- `npm run build`
- `npm run firebase:deploy:rules`

## API routes

- `GET /api/monitors`
- `POST /api/monitors`
- `GET /api/monitors/:id`
- `PATCH /api/monitors/:id`
- `DELETE /api/monitors/:id`
- `POST /api/monitors/:id/run`
- `GET /api/monitors/:id/history?limit=`
- `POST /api/checks/run`
- `GET /api/incidents`
- `GET /api/demo/seed`
- `POST /api/demo/seed`
- `POST /api/session/login`
- `POST /api/session/logout`

## Production gaps

The main missing areas before a real paid launch are:

- hosted Firebase setup and production secrets
- reliable recurring scheduler
- alert delivery
- plan limits and billing
- tenant hardening and operational monitoring
- deployment pipeline and support docs

Use [READINESS_CHECKLIST.md](/Users/lathekid/Documents/Api-Stat-Monitor/READINESS_CHECKLIST.md) as the source of truth for launch readiness.
