import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC7YLH5CHxsDiP5QXCstP-k7mZlIzcpNLc",
  authDomain: "mirror-solar-vision.firebaseapp.com",
  projectId: "mirror-solar-vision",
  storageBucket: "mirror-solar-vision.firebasestorage.app",
  messagingSenderId: "37767879231",
  appId: "1:37767879231:web:ac6dd0c6a53ed23c35368a",
  measurementId: "G-G0Z4BW57W2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
