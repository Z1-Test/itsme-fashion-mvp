import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getRemoteConfig } from "firebase/remote-config";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcp1rSTXeqrpETPv1ifb52iEkUhCsL49A",
  authDomain: "dev-ecom-test-010126.firebaseapp.com",
  projectId: "dev-ecom-test-010126",
  storageBucket: "dev-ecom-test-010126.firebasestorage.app",
  messagingSenderId: "717616470424",
  appId: "1:717616470424:web:3a926d60fcc4acc920f3ed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const remoteConfig = getRemoteConfig(app);

// Connect to emulators in development
connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
connectFirestoreEmulator(db, "localhost", 8080);
connectStorageEmulator(storage, "localhost", 9199);
connectFunctionsEmulator(functions, "localhost", 5001);

console.log("🔧 Connected to Firebase Emulators");

export default app;
