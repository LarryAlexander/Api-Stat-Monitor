import { getApp, getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseProjectId } from "@/lib/firebase/config";

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(
        clientEmail && privateKey
          ? {
              credential: cert({
                projectId: firebaseProjectId,
                clientEmail,
                privateKey,
              }),
              projectId: firebaseProjectId,
            }
          : {
              projectId: firebaseProjectId,
            },
      );

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
