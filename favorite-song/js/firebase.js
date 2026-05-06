"use strict";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyCUBPspPEDxG1EnilF-2O4GF8Gb-Tqs6io",
    authDomain: "favorite-song-8f1c8.firebaseapp.com",
    projectId: "favorite-song-8f1c8"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);