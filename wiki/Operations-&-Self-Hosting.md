# Operations & Self-Hosting

PulseBoard can be run as a self-hosted platform under the Elastic License 2.0 (ELv2) or deployed in a commercial cloud environment.

## 1. Firebase Provisioning
When running in production, ensure `NEXT_PUBLIC_USE_FIREBASE_EMULATORS` is set to `false`.

### Security Rules and Indexes
To deploy the Firestore indexes and security rules directly to your project:
```bash
# Log in to your Firebase Account
npx firebase-tools login

# Select your project
npx firebase-tools use --add

# Deploy indexes and rules
npm run firebase:deploy:rules
```

---

## 2. Docker Container Deployment

PulseBoard includes a multi-stage `Dockerfile` optimized for standalone Next.js builds:

### Building the Image
```bash
docker build -t pulseboard:latest .
```

### Running with Docker Compose
Use the pre-configured `docker-compose.yml` to spin up the containerized app:
```bash
docker compose up -d
```
The compose file maps port `3000`, loads your environment variables, and configures standalone execution.

---

## 3. Configuring the Scheduled Check Cron
Monitors require an external trigger to evaluate health checks at regular intervals.

1. **Secure the Endpoint**: Make sure `CRON_SECRET` is set in your environment variables.
2. **Setup a Trigger**: Configure an external cron runner (such as `cron-job.org`, Google Cloud Scheduler, or a local Linux crontab) to trigger a `GET` request to your endpoint:
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/checks/scheduled
   ```
3. **Execution**: The endpoint returns a `202 Accepted` response immediately, then executes all due health checks asynchronously in the background using Next.js `after()`.
