
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration 
const firebaseConfig = {
  apiKey: "AIzaSyBjbVrxuTIsQqkNbpp-sQ5BmxxSjt0l-us",
  authDomain: "gestor-4d80d.firebaseapp.com",
  projectId: "gestor-4d80d",
  storageBucket: "gestor-4d80d.appspot.com",
  messagingSenderId: "271363360578",
  appId: "1:271363360578:web:97cc7082566e88640622ca"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
