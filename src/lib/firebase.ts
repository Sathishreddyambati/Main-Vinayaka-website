// Firebase initialization for the EXISTING "mmr-vinayaka" project.
//
// IMPORTANT: This app only touches Cloud Firestore, Firebase Auth, and
// Firebase Storage. The existing Realtime Database in this project is never
// referenced, read, or written by any code in this app — it is left
// completely untouched.
//
// The values below are Firebase's public web config (safe to ship in a
// client bundle by design — Firebase security is enforced by Firestore/
// Storage security rules and Auth, not by hiding this config). Still, it is
// read from environment variables so you can swap projects without editing
// code.

import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Firestore is used for ALL new 2026 application data. The project's
// existing Realtime Database (asia-southeast1) is a separate product and is
// intentionally never imported or used here.
//
// ignoreUndefinedProperties: several admin forms have genuinely optional
// fields (a donation's note, an event's image, etc.) that resolve to
// `undefined` when left blank. Firestore rejects `undefined` field values
// by default; this setting makes it silently omit them instead, which is
// what we actually want (no field written, rather than a thrown error).
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, { ignoreUndefinedProperties: true });
} catch {
  // Already initialized (e.g. hot reload) — fall back to the existing instance.
  firestoreInstance = getFirestore(app);
}
export const db = firestoreInstance;
export const auth = getAuth(app);
export const storage = getStorage(app);
