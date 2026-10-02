import { initializeApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredSettings = Object.entries(firebaseConfig).filter(([, value]) => !value).map(([key]) => key);
export const firebaseConfigError = requiredSettings.length
  ? `Add ${requiredSettings.join(", ")} to .env.local to connect TRIX to your Firebase project.`
  : "";

const app = firebaseConfigError ? null : initializeApp(firebaseConfig);

export const db: Firestore = app ? getFirestore(app) : null!;
export const auth: Auth = app ? getAuth(app) : null!;

if (app && import.meta.env.VITE_USE_EMULATORS === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
