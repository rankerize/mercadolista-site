import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  projectId: 'mercadologo',
  appId: '1:900019888316:web:13dae5a4aed6f0a6edf0b9',
  storageBucket: 'mercadologo.firebasestorage.app',
  apiKey: 'AIzaSyBgJF_zW25w_vIjbg8E9OExXcHNu54VCRs',
  authDomain: 'mercadologo.firebaseapp.com',
  messagingSenderId: '900019888316',
  projectNumber: '900019888316',
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
