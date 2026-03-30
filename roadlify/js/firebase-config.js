// Firebase configuration — using compat SDK (loaded via CDN in index.html)
const firebaseConfig = {
  apiKey: "AIzaSyDrzC1khhiJLv7kyR8b_oXDTrVcGe0Npi4",
  authDomain: "roadlify-ai.firebaseapp.com",
  projectId: "roadlify-ai",
  storageBucket: "roadlify-ai.firebasestorage.app",
  messagingSenderId: "921994788400",
  appId: "1:921994788400:web:ca6f42e275f3db5b5877f5",
  measurementId: "G-MGVS6CNQ9Z"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Auth instance — used by auth.js
const firebaseAuth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();