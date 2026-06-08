# PulseBoard Deployment Guide

This guide covers deploying the Next.js app and the Firebase configuration to a production environment.

## 1. Firebase Backend Deployment

The Firestore security rules and database indexes need to be deployed to the live Firebase project before the app is deployed.

Make sure you are authenticated with the Firebase CLI:
```bash
npx firebase-tools login
```

Deploy the rules and indexes:
```bash
npm run firebase:deploy:rules
```

## 2. Generate a Service Account Key

To allow the Next.js server-side code to authenticate as an admin with the production Firebase services, you need a Service Account Key.

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Open **Project Settings** (the gear icon).
3. Navigate to the **Service Accounts** tab.
4. Click **Generate new private key**.
5. Keep the downloaded JSON file secure. You will need values from it in the next step.

## 3. Configure Production Environment Variables

In your deployment platform (e.g., Vercel, Netlify), configure the following environment variables.

### Client-side Variables
These are already in your `.env.local` but must be provided to the production build:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Production Toggles
- `NEXT_PUBLIC_USE_FIREBASE_EMULATORS`: `false` (CRITICAL: this tells the app to use production, not localhost)

### Admin SDK Variables (from the downloaded Service Account Key)
- `FIREBASE_CLIENT_EMAIL`: The `client_email` value from the JSON.
- `FIREBASE_PRIVATE_KEY`: The `private_key` value from the JSON. Be sure to include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` boundaries, and preserve newlines (often handled automatically by platforms like Vercel).

## 4. Deploy the Next.js App

If deploying to Vercel:
1. Import the repository.
2. Add the environment variables listed above.
3. Deploy. The default Vercel build command (`npm run build`) is already configured correctly.
