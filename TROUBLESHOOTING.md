# 🛠️ Troubleshooting & Known Issues

Common issues self-hosters and contributors will encounter with PulseBoard, and exactly how to fix them.

---

## Table of Contents

- [Runtime Error: Unauthorized](#runtime-error-unauthorized)
- [Blank screen / infinite redirect loop](#blank-screen--infinite-redirect-loop)
- [Firebase Admin SDK errors](#firebase-admin-sdk-errors)
- [Emulators not running (local dev)](#emulators-not-running-local-dev)
- [proxy.ts vs middleware.ts — Next.js 16 convention change](#proxyts-vs-middlewarets--nextjs-16-convention-change)
- [favicon.svg 404](#faviconsvg-404)
- [SyntaxError: Unexpected end of JSON input](#syntaxerror-unexpected-end-of-json-input)
- [Stripe Webhook 400 errors](#stripe-webhook-400-errors)
- [Monitors not auto-checking](#monitors-not-auto-checking)
- [Alert emails not sending](#alert-emails-not-sending)
- [Build succeeds but app crashes in production](#build-succeeds-but-app-crashes-in-production)

---

## Runtime Error: Unauthorized

**Symptom:** Red "Runtime Error — Unauthorized" overlay on the dashboard. Server logs show:
```
⨯ Error: Unauthorized at requireUserSession (lib/firebase/session.ts:41)
GET /dashboard 500
```

**Root Cause:** One of three things:
1. `proxy.ts` (the auth guard) is missing or has the wrong export name
2. Firebase emulators are enabled in `.env.local` but not actually running
3. The user's session cookie expired or was cleared

**Fix:**

### 1. Make sure `proxy.ts` exists and exports `proxy` (not `middleware`)
```ts
// ✅ Correct for Next.js 16
export function proxy(request: NextRequest) { ... }

// ❌ Wrong — this was the old Next.js 13/14 convention
export function middleware(request: NextRequest) { ... }
```

> **Note:** Next.js 16 renamed `middleware.ts` → `proxy.ts` and the export from `middleware` → `proxy`. If you see a warning like `"middleware" file convention is deprecated, use "proxy" instead`, this is why.

### 2. Disable emulators if they're not running
In `.env.local`:
```env
# Change this:
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true  ❌

# To this:
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false ✅

# And comment out or remove these:
# FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
# FIRESTORE_EMULATOR_HOST=127.0.0.1:8081
```

### 3. If it's a stale session, just sign out and sign back in
Navigate to `/auth/login` and sign in fresh.

---

## Blank screen / infinite redirect loop

**Symptom:** The page endlessly redirects or shows a blank screen.

**Root Cause:** `proxy.ts` is redirecting to `/auth/login`, but the login page itself may also be protected, or the session cookie isn't being set properly after sign-in.

**Fix:**
1. Ensure `/auth/login` is in the `PUBLIC_PATHS` set inside `proxy.ts`
2. Check that `/api/session/login` is also public (it must be — it's what sets the session cookie)
3. Clear all browser cookies for `localhost` and try again: **DevTools → Application → Cookies → Clear All**

---

## Firebase Admin SDK errors

**Symptom:** Errors like `Error: Failed to determine service account`, `credential implementation provided to initializeApp()`, or `UNAUTHENTICATED`.

**Root Cause:** `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` are empty or malformed in `.env.local`.

**Fix:**

1. Go to [Firebase Console](https://console.firebase.google.com) → your project → **Project Settings** → **Service Accounts**
2. Click **Generate new private key** → download the JSON file
3. Copy the values into `.env.local`:

```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----\n"
```

> ⚠️ **Critical:** The private key must be wrapped in double quotes and must use literal `\n` (not real newlines). If you paste it raw, it will break. The app handles the `\n` → newline conversion automatically.

---

## Emulators not running (local dev)

**Symptom:** Auth or Firestore calls fail locally, or you see connection refused errors on ports `9099` / `8081`.

**Fix (Option A — use real Firebase):** Set `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false` in `.env.local`. Easiest.

**Fix (Option B — actually run the emulators):**
```bash
npm run dev:emulators  # starts Firebase Auth + Firestore emulators
# In a second terminal:
npm run dev            # starts Next.js
```
The emulator UI is at [http://localhost:4000](http://localhost:4000).

---

## proxy.ts vs middleware.ts — Next.js 16 convention change

**Symptom:** Warning in the console:
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

**Explanation:** Next.js 16 changed the routing middleware file from `middleware.ts` (exporting `middleware`) to `proxy.ts` (exporting `proxy`). If you copied middleware code from older Next.js docs or tutorials, it will still partially work but throw this warning.

**Fix:** Rename the file and the export:
```bash
mv middleware.ts proxy.ts
```
```ts
// proxy.ts
export function proxy(request: NextRequest) { /* ... */ }  // ✅
```

---

## favicon.svg 404

**Symptom:** `GET /favicon.svg 404` in server logs.

**Root Cause:** Next.js looks for `favicon.ico` by default; a `.svg` favicon needs to be placed in `/app/` as `icon.svg`, not in `/public/`.

**Fix:** Either:
- Add a real `favicon.ico` to `/public/`
- Or place `icon.svg` inside the `/app/` directory (Next.js App Router picks it up automatically)

> This is cosmetic — it doesn't break anything.

---

## SyntaxError: Unexpected end of JSON input

**Symptom:** `SyntaxError: Unexpected end of JSON input` in server logs after startup.

**Root Cause:** Usually caused by a malformed `.env.local` value (e.g. a JSON-formatted header value for a monitor that wasn't closed properly), or a Firestore document with a corrupted field.

**Fix:**
1. Check `.env.local` for any values with unmatched quotes or brackets
2. Check monitor "Custom Headers" fields — they must be valid JSON: `{"key": "value"}`

---

## Stripe Webhook 400 errors

**Symptom:** Stripe dashboard shows webhook deliveries failing with 400.

**Root Cause:** `STRIPE_WEBHOOK_SECRET` is wrong, or the request body was consumed before signature verification.

**Fix:**
1. Copy the webhook signing secret from **Stripe Dashboard → Webhooks → your endpoint → Signing secret**
2. Set it in `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`
3. Make sure you're using the **live** secret for production and the **test** secret for local dev (use Stripe CLI: `stripe listen --forward-to localhost:3000/api/billing/webhook`)

---

## Monitors not auto-checking

**Symptom:** Monitors aren't being checked automatically on their schedule.

**Root Cause:** The `/api/checks/scheduled` endpoint must be called by an external cron job. PulseBoard doesn't have a built-in scheduler daemon.

**Fix:** Set up a cron job to hit the endpoint on a regular interval (e.g., every minute):

```bash
# Using cURL from a cron job or external service (e.g., cron-job.org, Upstash QStash):
curl -X POST https://your-domain.com/api/checks/scheduled \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Add `CRON_SECRET` to `.env.local` and validate it in the route handler for security.

> For local dev, you can trigger it manually: `curl -X POST http://localhost:3000/api/checks/scheduled`

---

## Alert emails not sending

**Symptom:** Monitors go down but no email alerts arrive.

**Root Cause:** SMTP or Resend credentials are not configured.

**Fix (Option A — SMTP):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password   # Use an App Password, not your real password
ALERT_FROM_EMAIL=alerts@yourdomain.com
ALERT_TO_EMAIL=you@yourdomain.com
```

**Fix (Option B — Resend):**
```env
RESEND_API_KEY=re_...
ALERT_FROM_EMAIL=alerts@yourdomain.com
ALERT_TO_EMAIL=you@yourdomain.com
```

The alert system tries SMTP first, then Resend, then falls back to console logging.

---

## Sign-up fails with "auth/configuration-not-found"

**Symptom:** Clicking "Create account" shows an error, and the browser console or server log contains `auth/configuration-not-found`.

**Root Cause:** The **Email/Password sign-in provider is disabled** in your Firebase project. Firebase rejects all `createUserWithEmailAndPassword` calls before they even reach your server.

**Fix:**
1. Open [Firebase Console → Authentication → Sign-in providers](https://console.firebase.google.com/project/_/authentication/providers)
2. Click **Email/Password**
3. Toggle **Enable** → **Save**

Done. No code changes needed.

---

## Firebase Admin SDK uses wrong credentials after adding env vars

**Symptom:** You added `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` to `.env.local`, but the server still returns ADC (Application Default Credentials) errors like `identitytoolkit.googleapis.com requires a quota project`.

**Root Cause:** The Firebase Admin SDK initializes once at module load time. If the dev server was **already running** when you added the credentials, it cached a no-credential instance — the hot reload of env vars doesn't re-initialize it.

**Fix:** Fully restart the dev server after adding credentials:
```bash
# Ctrl+C to stop, then:
npm run dev
```
The updated `lib/firebase/admin.ts` now uses a lazy getter to prevent this, but a restart is still required if the app was already initialized without credentials.

---

## Build succeeds but app crashes in production

**Symptom:** `npm run build` passes, but the deployed app crashes immediately.

**Most common causes:**

| Cause | Fix |
|---|---|
| Missing env vars on the server | Ensure all vars from `.env.example` are set in your host's environment settings |
| `FIREBASE_PRIVATE_KEY` newlines broken | Wrap in double quotes; use `\n` not real newlines |
| `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true` in prod | Set to `false` |
| Admin SDK initialized without credentials | Add service account key vars |

---

> 💡 **Still stuck?** Open a [GitHub Discussion](https://github.com/LarryAlexander/Api-Stat-Monitor/discussions) or file a [Bug Report](https://github.com/LarryAlexander/Api-Stat-Monitor/issues/new/choose).
