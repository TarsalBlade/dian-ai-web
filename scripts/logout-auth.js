import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCm_xfJBiRpeGQM1L94SQFVC2udJz-kAuU",
  authDomain: "dian-ai.firebaseapp.com",
  projectId: "dian-ai",
  storageBucket: "dian-ai.firebasestorage.app",
  messagingSenderId: "478413535958",
  appId: "1:478413535958:web:9c6b1dec60b966fe7c2777",
  measurementId: "G-49C7QBQVZH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    console.log("User is signed in:", user);
    // You could potentially personalize the page here, e.g., display user.displayName
  } else {
    // User is signed out
    console.log("User is signed out");
    // Redirect back to login page if not authenticated
    window.location.href = 'index.html'; // Assuming your login page is login.html
  }
});

// --- Logout Function ---
window.logout = function() {
    signOut(auth).then(() => {
      // Sign-out successful.
      console.log("Logout successful");
      window.location.href = 'index.html'; // Redirect to login page after logout
    }).catch((error) => {
      // An error happened.
      console.error("Logout Error:", error);
      alert("Logout failed: " + error.message);
    });
} 
