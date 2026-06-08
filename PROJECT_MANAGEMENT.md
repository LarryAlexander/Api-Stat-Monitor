# PulseBoard Project Management

## Working principles

- keep scope small and commercial
- finish the operational core before adding adjacent features
- prefer reliability work over cosmetic expansion
- preserve the simple user experience

## Source of truth documents

- [README.md](/Users/lathekid/Documents/Api-Stat-Monitor/README.md): project overview
- [instruction.md](/Users/lathekid/Documents/Api-Stat-Monitor/instruction.md): user operating guide
- [READINESS_CHECKLIST.md](/Users/lathekid/Documents/Api-Stat-Monitor/READINESS_CHECKLIST.md): launch status
- [ROADMAP.md](/Users/lathekid/Documents/Api-Stat-Monitor/ROADMAP.md): sequence of major work

## Decision rules

When prioritizing work:

1. Prefer features that make PulseBoard a real monitoring service.
2. Prefer reliability improvements over edge-case expansions.
3. Prefer platform fundamentals over growth ideas.
4. Reject features that create enterprise complexity too early.

## Near-term priorities

- stabilize production Firebase setup
- build recurring checks
- add email alerts
- write tests for critical flows
- define plan packaging

## Explicitly out of scope for now

- public status pages
- Slack and SMS alerting
- team permissions
- advanced RBAC
- enterprise SSO
- custom domains
- billing edge cases

## Suggested milestone structure

### Milestone A

- hosted backend works
- deploy path documented

### Milestone B

- recurring checks work reliably
- incidents reflect scheduled failures correctly

### Milestone C

- alerts work
- basic production observability exists

### Milestone D

- billing and plan gating work
- product can be tested with real users

## Review checklist for every milestone

- does it improve product viability
- does it reduce launch risk
- is it testable
- is it documented
- does it preserve the simple UX
