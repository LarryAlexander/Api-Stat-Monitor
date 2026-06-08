# PulseBoard Roadmap

## Phase 0: Current baseline

Current state:

- dashboard works locally
- Firebase emulator workflow works
- manual checks work
- incidents and history work

Goal:

- freeze a stable MVP baseline

## Phase 1: Production backend hardening

Deliverables:

- hosted Firebase project fully enabled
- production secrets configured
- Firestore indexes and rules validated remotely
- environment-specific config documented

Why first:

- the project cannot become a real service until the backend exists outside local emulators

## Phase 2: Real recurring monitoring

Deliverables:

- scheduled check execution
- concurrency and timeout controls
- retry rules
- check runner isolation from the web app request path

Why second:

- monitoring without reliable scheduling is not a real monitoring service

## Phase 3: Alerts and incident usability

Deliverables:

- email alerts
- incident notifications and recovery notifications
- incident filtering and better detail views
- clearer degraded/down messaging

Why third:

- users pay for timely awareness more than for a nice table of statuses

## Phase 4: Commercial foundation

Deliverables:

- billing integration
- free and paid plans
- usage caps and enforcement
- account management pages

Why fourth:

- this is the minimum layer needed to operate it as a paid product

## Phase 5: Open core packaging

Deliverables:

- repo cleanup for public release
- self-hosted setup guide
- license decision
- public/private feature boundary

Why fifth:

- do not open source a messy or unstable baseline

## Recommended order of execution

1. Production backend hardening
2. Real recurring monitoring
3. Alerts and incident usability
4. Commercial foundation
5. Open core packaging
