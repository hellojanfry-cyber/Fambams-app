import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBmw0dwxCvPeUtMxsgZtRKuDIlKWDBzwLU",
  authDomain: "fambams.firebaseapp.com",
  projectId: "fambams",
  storageBucket: "fambams.firebasestorage.app",
  messagingSenderId: "587210522120",
  appId: "1:587210522120:web:53fd3d963503eeaf8adbbd"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);