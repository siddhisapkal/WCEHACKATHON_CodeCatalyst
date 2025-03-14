// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDIuTv_GlJjBpRdmJU4FVgLWxY-J_XAh7s",
  authDomain: "wcehacks.firebaseapp.com",
  projectId: "wcehacks",
  storageBucket: "wcehacks.firebasestorage.app",
  messagingSenderId: "583969795199",
  appId: "1:583969795199:web:b710c40f240d5191fc234a",
  measurementId: "G-C7EW3DT1CH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);