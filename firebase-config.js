import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlgNSFKsvbbhrC3rh5L2s9WV817a9Nj6o",
  authDomain: "wemeal-61b0c.firebaseapp.com",
  projectId: "wemeal-61b0c",
  storageBucket: "wemeal-61b0c.firebasestorage.app",
  messagingSenderId: "249534240675",
  appId: "1:249534240675:web:bd53f63fc233643f2dec16",
  measurementId: "G-3EXKT63E0K"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
