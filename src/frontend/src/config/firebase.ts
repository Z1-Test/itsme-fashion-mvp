import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'localhost',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-itsme-fashion',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'demo-app-id',
};

// Initialize Firebase app once and reuse to prevent duplicate-app errors
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Connect to Firebase Auth emulator in development
if (import.meta.env.DEV) {
  const authEmulatorUrl = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL;
  if (authEmulatorUrl) {
    try {
      connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true });
      console.info(`🔧 Connected to Firebase Auth emulator at ${authEmulatorUrl}`);
    } catch (error) {
      console.warn('Firebase Auth Emulator connection failed:', error);
    }
  }

  // Connect to Firestore emulator in development
  const firestoreEmulatorUrl = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST;
  if (firestoreEmulatorUrl) {
    try {
      const [host, port] = firestoreEmulatorUrl.split(':');
      connectFirestoreEmulator(db, host, parseInt(port, 10));
      console.info(`🔧 Connected to Firestore emulator at ${firestoreEmulatorUrl}`);
    } catch (error) {
      console.warn('Firestore Emulator connection failed:', error);
    }
  }
}

export default app;