/**
 * Firebase Configuration & Initialization
 * Comprehensive setup for Auth, Firestore, and Storage
 * Includes emulator connections for development
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  Firestore,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { 
  getStorage, 
  connectStorageEmulator,
  FirebaseStorage
} from 'firebase/storage';

// ============================================================================
// Firebase Configuration
// ============================================================================

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'localhost',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-itsme-fashion',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'demo-app-id',
};

// ============================================================================
// Initialize Firebase App
// ============================================================================

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ============================================================================
// Initialize Firebase Services
// ============================================================================

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// ============================================================================
// Firebase Emulator Setup (Development Only)
// ============================================================================

if (import.meta.env.DEV) {
  // Connect to Firebase Auth Emulator
  const authEmulatorUrl = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL;
  if (authEmulatorUrl && !auth.emulatorConfig) {
    try {
      connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true });
      console.info(`✅ Auth Emulator: Connected to ${authEmulatorUrl}`);
    } catch (error) {
      console.warn('⚠️ Auth Emulator: Connection failed', error);
    }
  }

  // Connect to Firestore Emulator
  const firestoreEmulatorHost = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST;
  if (firestoreEmulatorHost) {
    try {
      const [host, port] = firestoreEmulatorHost.split(':');
      connectFirestoreEmulator(db, host, parseInt(port, 10));
      console.info(`✅ Firestore Emulator: Connected to ${firestoreEmulatorHost}`);
    } catch (error) {
      console.warn('⚠️ Firestore Emulator: Connection failed', error);
    }
  }

  // Connect to Storage Emulator
  const storageEmulatorHost = import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST;
  if (storageEmulatorHost) {
    try {
      const [host, port] = storageEmulatorHost.split(':');
      connectStorageEmulator(storage, host, parseInt(port, 10));
      console.info(`✅ Storage Emulator: Connected to ${storageEmulatorHost}`);
    } catch (error) {
      console.warn('⚠️ Storage Emulator: Connection failed', error);
    }
  }

  // Enable offline persistence for Firestore
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Multiple tabs open: IndexedDB persistence disabled');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Browser does not support IndexedDB persistence');
    }
  });
}

// ============================================================================
// Firestore Collection References (for convenience)
// ============================================================================

export const COLLECTIONS = {
  PRODUCTS: 'products',
  USERS: 'users',
  ORDERS: 'orders',
} as const;

export const getUserPath = (userId: string) => `${COLLECTIONS.USERS}/${userId}`;
export const getUserCartPath = (userId: string) => `${getUserPath(userId)}/cart`;
export const getUserCartDataPath = (userId: string) => `${getUserCartPath(userId)}/data`;
export const getUserLoveListPath = (userId: string) => `${getUserPath(userId)}/loveList`;
export const getUserLoveListDataPath = (userId: string) => `${getUserLoveListPath(userId)}/data`;

// ============================================================================
// Exports
// ============================================================================

export default app;

// Export all services for use in hooks
export const firebaseServices = {
  app,
  auth,
  db,
  storage,
} as const;
