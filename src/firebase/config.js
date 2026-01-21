import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration
// Get your Firebase config from Firebase Console > Project Settings > Your apps
// For local development, create a .env file with:
// VITE_FIREBASE_API_KEY=your-api-key
// VITE_FIREBASE_AUTH_DOMAIN=to-do-list-b36f2.firebaseapp.com
// VITE_FIREBASE_STORAGE_BUCKET=to-do-list-b36f2.appspot.com
// VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
// VITE_FIREBASE_APP_ID=your-app-id
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDUMMY-KEY-REPLACE-WITH-YOUR-ACTUAL-KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "to-do-list-b36f2.firebaseapp.com",
  projectId: "to-do-list-b36f2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "to-do-list-b36f2.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
}

// Initialize Firebase
let app
try {
  app = initializeApp(firebaseConfig)
} catch (error) {
  console.error('Firebase initialization error:', error)
  throw new Error('Failed to initialize Firebase. Please check your Firebase configuration.')
}

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

// Set custom parameters for Google sign-in
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export default app
