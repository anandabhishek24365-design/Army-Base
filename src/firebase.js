import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAJnVw6mvuKmENuatzTePqEoE3yTRKcKy4",
  authDomain: "army-base-fbce6.firebaseapp.com",
  projectId: "army-base-fbce6",
  storageBucket: "army-base-fbce6.firebasestorage.app",
  messagingSenderId: "715892715062",
  appId: "1:715892715062:web:cb7b668ae0343f0346b297",
  measurementId: "G-727MFPX348"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and export
export const auth = getAuth(app);

// Initialize Google Auth Provider and export
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
