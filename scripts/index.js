// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-app.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCuiGdZrHMl2uxUtrG6bePHSslFGaLBHz0",
    authDomain: "nutri-planner-726ab.firebaseapp.com",
    projectId: "nutri-planner-726ab",
    storageBucket: "nutri-planner-726ab.appspot.com",
    messagingSenderId: "349049113208",
    appId: "1:349049113208:web:fa5ba88c1b686699f2fb8d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
console.log("firebase initialized")
