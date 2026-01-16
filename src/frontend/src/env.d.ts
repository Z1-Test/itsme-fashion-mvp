/// <reference types="vite/client" />

// Project-specific typings for Vite import.meta.env variables
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_AUTH_EMULATOR_URL?: string;
  readonly DEV?: boolean;
  // Add other `VITE_` variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
