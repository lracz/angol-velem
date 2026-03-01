// ═══════════════════════════════════════════════════════════════════
// FIREBASE & API CONFIGURATION
// ═══════════════════════════════════════════════════════════════════
import { initializeApp } from 'firebase/app';
import {
    getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut,
    GoogleAuthProvider, signInWithPopup
} from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';

export const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Re-export Firebase utilities for convenience
export {
    signInWithEmailAndPassword, onAuthStateChanged, signOut,
    GoogleAuthProvider, signInWithPopup,
    doc, onSnapshot, setDoc
};
