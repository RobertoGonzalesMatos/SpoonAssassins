// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfilWmyKbAJlAnfLBfX1VPtPQbJN7lVNM",
  authDomain: "spoonassassins-51a41.firebaseapp.com",
  projectId: "spoonassassins-51a41",
  storageBucket: "spoonassassins-51a41.firebasestorage.app",
  messagingSenderId: "716522625005",
  appId: "1:716522625005:web:25a816b6d4b0fd6ffbf9e4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, signInWithPopup, GoogleAuthProvider, db };
