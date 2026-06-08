import { getApp, getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseProjectId } from "@/lib/firebase/config";

/**
 * Lazily initialize Firebase Admin SDK.
 * Using a getter ensures we always read env vars at call-time, not at module
 * load time — which prevents stale initialization when env vars change in dev.
 */
function getAdminApp(): App {
  if (getApps().length > 0) return getApp();

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!clientEmail || !rawPrivateKey) {
    throw new Error(
      "[PulseBoard] Firebase Admin SDK is not configured.\n" +
      "Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in your .env.local.\n" +
      "See SELF_HOSTING.md for setup instructions."
    );
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({ projectId: firebaseProjectId, clientEmail, privateKey }),
    projectId: firebaseProjectId,
  });
}

export const adminAuth = getAuth(getAdminApp());
export const adminDb = getFirestore(getAdminApp());
