# PulseBoard Self-Hosting Guide

This guide explains how to deploy and run PulseBoard on your own infrastructure for free.

---

## Prerequisites

To self-host PulseBoard, you will need:
1. A **Firebase Project** (Free Spark tier is sufficient).
2. An **Email delivery provider** (Either SMTP credentials or a free Resend account).
3. A hosting target (Vercel, Docker, or any Node.js server).

---

## 1. Firebase Backend Setup

PulseBoard uses Firebase Auth for login and Cloud Firestore for storing monitor configurations, response checks, and incidents.

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add Project**.
2. Give your project a name (e.g. `my-pulseboard`).
3. (Optional) Disable Google Analytics unless you want it.
4. Click **Create Project**.

### Step 2: Enable Authentication
1. In the Firebase left sidebar, click **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, select **Email/Password**, enable it, and save.

### Step 3: Enable Firestore Database
1. In the Firebase sidebar, click **Build > Firestore Database**.
2. Click **Create Database**.
3. Choose your database location (choose one close to your servers).
4. Start in **Production Mode** and click **Create**.

### Step 4: Register a Web App
1. Go to your Firebase project overview (home icon at the top left).
2. Click the **Web** icon (`</>`) to add an app.
3. Name it `pulseboard-web` and click **Register app**.
4. Save the config object values (e.g. `apiKey`, `authDomain`, `projectId`). You will add these to your environment variables.

---

## 2. Environment Configurations

Create a copy of `.env.example` named `.env.local` (for local runs) or configure these in your hosting provider's dashboard:

### Web Client Credentials (from Step 4)
* `NEXT_PUBLIC_FIREBASE_API_KEY`
* `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
* `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
* `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
* `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
* `NEXT_PUBLIC_FIREBASE_APP_ID`
* `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false` (Make sure this is `false` in production!)

### Firebase Admin Credentials (required for Server APIs)
1. In the Firebase Console, click the gear icon (Project Settings) > **Service Accounts** tab.
2. Click **Generate new private key** at the bottom.
3. Open the downloaded JSON file and extract these two keys:
   * `FIREBASE_CLIENT_EMAIL`: The `client_email` value.
   * `FIREBASE_PRIVATE_KEY`: The `private_key` value. Ensure you include the full key block with `\n` characters preserved.

### Secure Cron Token
* `CRON_SECRET`: Choose a secure random string. This token blocks unauthorized users from manually triggering checks.

### Email Alerts Configuration
You can configure **either** SMTP **or** Resend. SMTP is recommended for complete self-hosting.

#### Option A: SMTP (Recommended)
* `SMTP_HOST`: e.g. `smtp.gmail.com` or `smtp.mailgun.org`
* `SMTP_PORT`: e.g. `465` or `587`
* `SMTP_USER`: Your email SMTP username
* `SMTP_PASS`: Your email SMTP password
* `SMTP_SECURE`: `true` for port 465, `false` for port 587
* `SMTP_FROM_EMAIL`: The sender address (e.g. `PulseBoard Alerts <alerts@yourdomain.com>`)

#### Option B: Resend API
* `RESEND_API_KEY`: Your Resend API key
* `ALERT_FROM_EMAIL`: The sender email address verified in your Resend dashboard

---

## 3. Deploying Firebase Rules and Indexes

PulseBoard requires specific database indexes and rules. Install the Firebase CLI locally to deploy them:

1. Authenticate the CLI:
   ```bash
   npx firebase-tools login
   ```
2. Link the project (replace with your Firebase project ID):
   ```bash
   npx firebase-tools use --add your-firebase-project-id
   ```
3. Deploy the rules and indexes:
   ```bash
   npm run firebase:deploy:rules
   ```

---

## 4. Hosting Options

### Option A: Vercel (Fastest & Easiest)
1. Push this repository to your own private GitHub/GitLab account.
2. Link the repository to [Vercel](https://vercel.com).
3. Under **Environment Variables**, copy and paste all the keys configured in section 2.
4. Click **Deploy**. Vercel will automatically build and serve the application.

### Option B: Docker Compose (Self-Managed Servers)
We supply a production-ready multi-stage `Dockerfile` and `docker-compose.yml`.

1. Install Docker and Docker Compose on your server.
2. Create a `.env` file containing your configurations in the root directory.
3. Build and launch the container in the background:
   ```bash
   docker compose up -d --build
   ```
4. The dashboard will be live on port `3000`.

---

## 5. Setting up the Scheduler (Cron)

Because serverless hosting environments don't run permanent background processes, you need an external trigger to tell PulseBoard when to check your endpoints.

PulseBoard provides a secure endpoint: `POST /api/checks/scheduled`.

Set up a recurring cron job (we suggest **every 5 minutes** or **every 1 minute** depending on your monitor settings) to call this endpoint.

### Options to trigger it:
1. **GitHub Actions**: Run a scheduled workflow containing a curl request:
   ```bash
   curl -X POST -H "Authorization: Bearer <your-cron-secret>" https://your-pulseboard-url.com/api/checks/scheduled
   ```
2. **Cron-job.org / EasyCron**: Set up a free account on [cron-job.org](https://cron-job.org/) to hit your URL with the `Authorization` header set.
3. **System Crontab (VPS/Docker)**: If hosting on your own Linux server, add this to your system crontab (`crontab -e`):
   ```text
   */5 * * * * curl -X POST -H "Authorization: Bearer <your-cron-secret>" http://localhost:3000/api/checks/scheduled >/dev/null 2>&1
   ```
