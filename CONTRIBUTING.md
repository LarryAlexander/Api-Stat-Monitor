# Contributing to PulseBoard

First off — thank you for your interest in contributing! 🎉

PulseBoard is an open-core project and we welcome contributions of all kinds: bug fixes, features, documentation improvements, and feedback.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Branching Strategy](#branching-strategy)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Conventions](#coding-conventions)
- [Commit Message Format](#commit-message-format)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Code of Conduct

This project follows a simple rule: **be respectful.** Constructive feedback is always welcome; harassment or disrespect is not.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/Api-Stat-Monitor.git
   cd Api-Stat-Monitor
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/LarryAlexander/Api-Stat-Monitor.git
   ```

---

## Development Setup

### Prerequisites

- **Node.js** `>= 20.x`
- **npm** `>= 10.x`
- A **Firebase** project (Auth + Firestore enabled)
- Optional: **Stripe** account for billing features
- Optional: **Docker** for containerized testing

### Steps

```bash
# Install dependencies
npm install

# Copy the environment file and fill in your values
cp .env.example .env.local

# Start Firebase emulators (optional but recommended for local dev)
npm run dev:emulators

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> See [SELF_HOSTING.md](./SELF_HOSTING.md) for detailed configuration instructions.

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable, production-ready code. Only merged via reviewed PRs. |
| `develop` | Integration branch for completed features (if used) |
| `feature/<short-description>` | New features |
| `fix/<short-description>` | Bug fixes |
| `docs/<short-description>` | Documentation changes |
| `chore/<short-description>` | Maintenance, dependency updates, CI changes |

**Always branch from `main`** unless specifically instructed otherwise.

---

## Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/my-awesome-feature
   ```
2. Make your changes following the [Coding Conventions](#coding-conventions)
3. Ensure the app builds without errors:
   ```bash
   npm run build
   ```
4. Ensure there are no lint errors:
   ```bash
   npm run lint
   ```
5. Update `CHANGELOG.md` under the `[Unreleased]` section

---

## Pull Request Process

1. Push your branch to your fork:
   ```bash
   git push origin feature/my-awesome-feature
   ```
2. Open a Pull Request against `LarryAlexander/Api-Stat-Monitor:main`
3. Fill out the PR template completely
4. Wait for CI to pass (lint + build checks)
5. Address any review feedback
6. Once approved, a maintainer will merge your PR

**Do not merge your own PRs.** At least one maintainer review is required.

---

## Coding Conventions

- **Language**: TypeScript — use strict types, avoid `any`
- **Framework**: Next.js App Router — use Server Components where possible
- **Styling**: Tailwind CSS v4 utility classes
- **State**: Prefer React `useState`/`useReducer` for local state; avoid global state libraries unless necessary
- **Error Handling**: Always handle async errors with try/catch and return meaningful HTTP error codes from API routes
- **Env Vars**: Never hardcode secrets; always use environment variables and document them in `.env.example`
- **Comments**: Write comments for *why*, not *what*

---

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

**Examples**:
```
feat(monitors): add support for TCP port checks
fix(billing): handle expired Stripe webhook signatures gracefully
docs(self-hosting): add section on custom SMTP configuration
chore(deps): bump stripe from 22.1.0 to 22.2.0
```

---

## Reporting Bugs

Use the [Bug Report issue template](.github/ISSUE_TEMPLATE/bug_report.yml). Please include:
- Your PulseBoard version
- Steps to reproduce
- Expected vs. actual behavior
- Logs or screenshots

---

## Requesting Features

Use the [Feature Request issue template](.github/ISSUE_TEMPLATE/feature_request.yml).
Check the [ROADMAP.md](./ROADMAP.md) first — your feature may already be planned!

---

Thank you for helping make PulseBoard better. 🚀
