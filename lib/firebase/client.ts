"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { firebasePublicConfig, useFirebaseEmulators } from "@/lib/firebase/config";

const app = getApps().length > 0 ? getApp() : initializeApp(firebasePublicConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let emulatorsConnected = false;
let persistenceReady = false;

if (useFirebaseEmulators && !emulatorsConnected) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  emulatorsConnected = true;
}

export const getFirebaseClient = async () => {
  if (!persistenceReady) {
    await setPersistence(auth, browserLocalPersistence);
    persistenceReady = true;
  }

  return { app, auth, db };
};
