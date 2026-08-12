/**
 * Firebase Configuration
 * Uses the existing FoodEaze Firebase project credentials.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyCRFOCqpGFeP35kGZImCmx1rBxqIdacbos",
    authDomain: "foodeaze-92ef8.firebaseapp.com",
    projectId: "foodeaze-92ef8",
    storageBucket: "foodeaze-92ef8.firebasestorage.app",
    messagingSenderId: "885505647653",
    appId: "1:885505647653:web:54a2327eb0dc9eba808bcc",
    measurementId: "G-HGG8KEW6X7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const usersCollection = 'users';
const ordersCollection = 'orders';

window.FoodEazeFirebase = {
    app,
    auth,
    db,
    usersCollection,
    ordersCollection
};

export { app, auth, db, usersCollection, ordersCollection };
