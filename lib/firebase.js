import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB0E9-0xJJ5aOYoX0yWluDvMgwb-LA_r7Q",
  authDomain: "fambams-app.firebaseapp.com",
  projectId: "Fambams-app",
  storageBucket: "fambams-app.firebasestorage.app",
  messagingSenderId: "622060419946",
  appId: "1:622060419946:web:35a0472d5dcf993a214313",
  measurementId: "G-ENFV9QHVCZ"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);