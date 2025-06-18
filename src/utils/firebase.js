// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBKyo314FN6ttzgj092OdTB9TKwLrCa8Lo",
  authDomain: "eduplay-74dd2.firebaseapp.com",
  projectId: "eduplay-74dd2",
  storageBucket: "eduplay-74dd2.appspot.com", // Corrigé le domaine du storage
  messagingSenderId: "106298197309",
  appId: "1:106298197309:web:e903b09c3e49d2811df154"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation des services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export des collections Firestore pour un accès centralisé
export const COLLECTIONS = {
  USERS: 'users',
  COURSES: 'courses',
  LESSONS: 'lessons',
  QUIZZES: 'quizzes',
  USER_PROGRESS: 'userProgress'
};