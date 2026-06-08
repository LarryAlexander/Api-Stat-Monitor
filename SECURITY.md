# Security Policy

## Supported Versions

We actively support and release security patches for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.5.x   | ✅ Yes (current)   |
| < 0.5   | ❌ No              |

---

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

If you discover a security issue, please report it privately so we can address it before it becomes public knowledge.

### How to Report

1. **Open a [GitHub Security Advisory](https://github.com/LarryAlexander/Api-Stat-Monitor/security/advisories/new)** — this is the preferred method.
2. Alternatively, email the maintainer directly with "[SECURITY]" in the subject line. See the GitHub profile for contact info.

### What to Include

- A description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact assessment
- Any suggested mitigations or fixes (optional but appreciated)

---

## Response Timeline

| Stage | Timeline |
|-------|---------|
| Initial acknowledgement | Within **48 hours** |
| Severity assessment | Within **5 business days** |
| Patch / mitigation | Within **30 days** for high/critical severity |
| Public disclosure | After patch is released and users have had time to update |

---

## Security Best Practices for Self-Hosters

If you are self-hosting PulseBoard, please follow these recommendations:

- **Never commit `.env.local`** — it contains secrets
- **Rotate credentials regularly**: Firebase service account keys, Stripe keys, SMTP passwords
- **Use Firestore Security Rules** — the bundled `firestore.rules` restricts access to authenticated owners only
- **Keep dependencies up to date** — run `npm audit` regularly
- **Use HTTPS** — always serve PulseBoard behind TLS in production
- **Restrict the Stripe Webhook endpoint** — validate the `Stripe-Signature` header (already implemented)
- **Set `NEXT_PUBLIC_BILLING_ENABLED=false`** if you don't use Stripe to avoid exposing billing routes

---

## Dependency Vulnerabilities

We use `npm audit` as part of our development workflow. If you find a vulnerable dependency, please open a standard GitHub issue (not a security advisory) unless the vulnerability is exploitable via PulseBoard's attack surface.
