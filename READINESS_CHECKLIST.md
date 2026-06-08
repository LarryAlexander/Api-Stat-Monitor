# PulseBoard Readiness Checklist

## Status scale

- `Done`: implemented and validated
- `Partial`: implemented but not hardened
- `Not started`: still missing

## Product readiness

- `Done` Core dashboard workflow
- `Done` User can create and manage monitors
- `Done` User can run checks and inspect incidents
- `Partial` In-app onboarding and written instructions
- `Not started` Empty-state polish across all failure cases
- `Not started` Pricing, packaging, and plan boundaries

## Engineering readiness

- `Done` App builds successfully
- `Done` Lint passes
- `Done` Local Firebase emulator flow works
- `Partial` Firebase production environment wiring
- `Partial` API route and data model shape are stable enough for MVP
- `Not started` Automated tests
- `Not started` CI pipeline
- `Not started` structured logging and monitoring

## Backend readiness

- `Done` Auth session flow works locally
- `Done` Firestore-backed monitors/checks/incidents flow works locally
- `Partial` Manual checks work
- `Not started` Scheduled recurring checks
- `Not started` Retry, timeout, and rate-limit policy hardening
- `Not started` background worker isolation
- `Not started` production Firestore indexes verification

## Security readiness

- `Partial` Basic session gating exists
- `Partial` Local rules and project config exist
- `Not started` production Firebase rules audit
- `Not started` abuse protection and rate limiting
- `Not started` secret rotation and deployment secret management
- `Not started` audit trail for admin-sensitive actions

## SaaS readiness

- `Not started` Billing
- `Not started` Subscription gating
- `Not started` Usage quotas
- `Not started` Alerting channels
- `Not started` Team accounts
- `Not started` Customer support flow
- `Not started` Public status/legal pages

## Operations readiness

- `Not started` Production deploy target
- `Not started` Monitoring for the monitoring service
- `Not started` Error tracking
- `Not started` Backups and restore procedure
- `Not started` Incident response procedure
- `Not started` Release checklist

## Launch recommendation

Current recommendation:

- good for portfolio
- good for private demos
- good for alpha users with clear expectations
- not ready for paid public launch

## Must-finish before paid launch

1. Move off emulator-only development assumptions and verify hosted Firebase.
2. Implement a reliable recurring check scheduler.
3. Add alert delivery.
4. Add billing and plan enforcement.
5. Add automated test coverage for monitor CRUD, checks, incidents, and auth.
6. Add production monitoring, logging, and deployment documentation.
