/**
 * Firebase Configuration & Initialization
 * Comprehensive setup for Auth, Firestore, and Storage
 * Includes emulator connections for development
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getRemoteConfig, RemoteConfig } from 'firebase/remote-config';

// ============================================================================
// Firebase Configuration
// ============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyCcp1rSTXeqrpETPv1ifb52iEkUhCsL49A",
  authDomain: "dev-ecom-test-010126.firebaseapp.com",
  projectId: "dev-ecom-test-010126",
  storageBucket: "dev-ecom-test-010126.firebasestorage.app",
  messagingSenderId: "717616470424",
  appId: "1:717616470424:web:3a926d60fcc4acc920f3ed"
};

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
// };


// ============================================================================
// // Initialize Firebase App
// ============================================================================

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ============================================================================
// Initialize Firebase Services
// ============================================================================

export const auth: Auth = getAuth(app);
// Connect to the named database 'dev-db' (or default for emulator)
export const db: Firestore = getFirestore(app, 'dev-db');
export const storage: FirebaseStorage = getStorage(app);
export const remoteConfig: RemoteConfig = getRemoteConfig(app);

// ============================================================================
// Environment Detection (for Remote Config conditions)
// ============================================================================

const ENVIRONMENT = (() => {
  try {
    const env = (import.meta as any)?.env;
    if (env?.VITE_ENVIRONMENT) return env.VITE_ENVIRONMENT;
    if (env?.VITE_USE_EMULATOR === 'true') return 'dev';
  } catch (e) {
    // ignore
  }
  // Default to 'dev' if in localhost, else 'production'
  return typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'dev' : 'production';
})();

const IS_DEV = ENVIRONMENT === 'dev';
const IS_STAGING = ENVIRONMENT === 'staging';
const IS_PRODUCTION = ENVIRONMENT === 'production';

console.log(`🌍 Environment: ${ENVIRONMENT.toUpperCase()}`);

// ============================================================================
// Connect to Emulators (Development Only)
// ============================================================================

const EMULATOR_MODE = (() => {
  // Prefer Vite envs in the browser
  try {
    // import.meta.env is available in Vite-built browser code
    // Support both `VITE_USE_EMULATOR` and legacy `REACT_APP_USE_EMULATOR` keys
    const env = (import.meta as any)?.env;
    if (env) {
      return env.VITE_USE_EMULATOR === 'true' || env.REACT_APP_USE_EMULATOR === 'true';
    }
  } catch (e) {
    // ignore — fallback to next check
  }

  // Fallback for Node (SSR) or unexpected environments
  if (typeof process !== 'undefined' && process && (process as any).env) {
    return (process as any).env.REACT_APP_USE_EMULATOR === 'true';
  }

  return false;
})();

if (EMULATOR_MODE) {
  console.log('🔥 EMULATOR MODE ENABLED');

  // Connect Firestore Emulator
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('✅ Connected to Firestore Emulator (localhost:8080)');
  } catch (err: any) {
    if (err.code !== 'failed-precondition') {
      console.error('❌ Failed to connect Firestore Emulator:', err);
    }
  }

  // Connect Auth Emulator
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('✅ Connected to Auth Emulator (localhost:9099)');
  } catch (err: any) {
    if (err.code !== 'auth/emulator-config-failed') {
      console.error('❌ Failed to connect Auth Emulator:', err);
    }
  }

  // Connect Storage Emulator
  try {
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('✅ Connected to Storage Emulator (localhost:9199)');
  } catch (err: any) {
    if (err.code !== 'storage/invalid-default-bucket') {
      console.error('❌ Failed to connect Storage Emulator:', err);
    }
  }
} else {
  console.log('🌐 PRODUCTION MODE - Using Firebase (dev-ecom-test-010126)');
}

// ============================================================================
// Enable offline persistence for Firestore (Production Only)
// ============================================================================

if (!EMULATOR_MODE) {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Multiple tabs open: IndexedDB persistence disabled');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Browser does not support IndexedDB persistence');
    }
  });
}

// ============================================================================
// Remote Config Configuration with Environment Signals
// ============================================================================

// Cache settings: shorter for dev, longer for production
if (!EMULATOR_MODE) {
  // Set longer cache duration for production (e.g., 1 hour)
  remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
} else {
  // Set shorter cache duration for development/emulator (e.g., 1 minute)
  remoteConfig.settings.minimumFetchIntervalMillis = 60000;
}

// Custom claims for Remote Config conditions (used in Firebase Console)
// These allow conditions to filter by: isDev, isStaging, isProduction
const customClaims = {
  isDev: IS_DEV ? 'true' : 'false',
  isStaging: IS_STAGING ? 'true' : 'false',
  isProduction: IS_PRODUCTION ? 'true' : 'false',
  environment: ENVIRONMENT,
};

console.log(`✅ Remote Config Custom Signals: isDev=${IS_DEV}, isStaging=${IS_STAGING}, isProduction=${IS_PRODUCTION}`);

// Set default values for all feature flags (fallback when RC unavailable)
remoteConfig.defaultConfig = {
  // Wishlist Feature (enabled by default in dev, disabled elsewhere)
  feature_fe_16_fl_17_private_wishlist_enabled: IS_DEV,
  // Other features (enabled in dev/staging, disabled in prod)
  feature_fe_20_fl_21_product_catalog_browsing_enabled: !IS_PRODUCTION,
  feature_fe_38_fl_39_user_authentication_enabled: !IS_PRODUCTION,
} as const;

// Export custom claims for use in Remote Config targeting
export const remoteConfigSignals = customClaims;

// ============================================================================
// ============================================================================
// Firestore Collection References (for convenience)
// ============================================================================

export const COLLECTIONS = {
  PRODUCTS: 'products',
  USERS: 'users',
  remoteConfig,
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
