// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBAU9-zJ98493q6BiSdnoJi2raBEemENSs",
  authDomain: "main-backend-for-mvp.firebaseapp.com",
  projectId: "main-backend-for-mvp",
  storageBucket: "main-backend-for-mvp.firebasestorage.app",
  messagingSenderId: "356535367563",
  appId: "1:356535367563:web:dc991f08345b8fee80218e",
  measurementId: "G-YZNSMG6QDJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
