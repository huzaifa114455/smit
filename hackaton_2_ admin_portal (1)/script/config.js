import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyAb91jJFzoJeAWxAqQvH2faJOYzWC13PPs",
  authDomain: "admin-portal-dd3f6.firebaseapp.com",
  projectId: "admin-portal-dd3f6",
  storageBucket: "admin-portal-dd3f6.appspot.com",
  messagingSenderId: "465526537608",
  appId: "1:465526537608:web:aaf00b0dca0b825fd68e3d",
  measurementId: "G-ZDPHS4DLB9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);