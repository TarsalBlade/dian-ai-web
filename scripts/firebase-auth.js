import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import {getAuth,signInAnonymously,signInWithPopup,GoogleAuthProvider,createUserWithEmailAndPassword,signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {getFirestore,doc,setDoc} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"; 

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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const authErrorElement = document.getElementById('auth-error');
const db = getFirestore(app);

function displayAuthError(message) {
    if (authErrorElement) {
        authErrorElement.textContent = message;
    } else {
        alert(message);
    }
}
function clearAuthError() {
    if (authErrorElement) {
        authErrorElement.textContent = '';
    }
}

window.signInAsGuest = async function () {
try {
  const result = await signInAnonymously(auth);
  const user = result.user;
  const guestName = `Guest_${Math.floor(1000 + Math.random() * 9000)}`; // Example: Guest_1832

  // Save guest username to Firestore
  await setDoc(doc(db, "guests", user.uid), {
    uid: user.uid,
    guestName: guestName,
    createdAt: new Date(),
  });

  console.log("Guest signed in with username:", guestName);
  window.location.href = 'home.html'; // Redirect on success
  // Redirect or update UI here
} catch (error) {
  document.getElementById("auth-error").innerText = error.message;
}
};

// --- Google Login ---
window.loginWithGoogle = function () {
  clearAuthError();
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log("Google Login Successful:", user);
      logEvent(analytics, 'login', { method: 'Google' });
      // alert("Welcome, " + user.displayName); // Optional: show welcome message
      window.location.href = 'home.html'; // Redirect on success
    })
    .catch((error) => {
      console.error("Google Login Error:", error);
      displayAuthError("Google login failed: " + error.message);
      logEvent(analytics, 'login_failure', { method: 'Google', error_code: error.code, error_message: error.message });
    });
};

// --- Email/Password Sign Up ---
window.signUpWithEmailPassword = function () {
  clearAuthError();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    displayAuthError("Please enter both email and password to sign up.");
    return;
  }
  if (password.length < 6) {
      displayAuthError("Password should be at least 6 characters long.");
      return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Sign Up Successful:", user);
      logEvent(analytics, 'sign_up', { method: 'Email/Password' });
      // alert("Account created successfully! Welcome!"); // Optional: show welcome message
      window.location.href = 'home.html'; // Redirect on success
    })
    .catch((error) => {
      console.error("Sign Up Error:", error);
      let friendlyMessage = "Sign up failed. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
          friendlyMessage = "This email address is already in use. Try logging in instead.";
      } else if (error.code === 'auth/invalid-email') {
          friendlyMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/weak-password') {
          friendlyMessage = "Password is too weak. Please use a stronger password.";
      } else {
          friendlyMessage = `Sign up failed: ${error.message}`;
      }
      displayAuthError(friendlyMessage);
      logEvent(analytics, 'sign_up_failure', { method: 'Email/Password', error_code: error.code, error_message: error.message });
    });
};

// --- Email/Password Sign In ---
window.signInWithEmailPassword = function () {
  clearAuthError();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    displayAuthError("Please enter both email and password to log in.");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Login Successful:", user);
      logEvent(analytics, 'login', { method: 'Email/Password' });
      // alert("Welcome back!"); // Optional: show welcome message
      window.location.href = 'home.html'; // Redirect on success
    })
    .catch((error) => {
      console.error("Login Error:", error);
        let friendlyMessage = "Login failed. Please try again.";
        // Use 'auth/invalid-credential' for newer SDK versions catching both user-not-found and wrong-password
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            friendlyMessage = "Invalid email or password. Please check your details.";
        } else if (error.code === 'auth/invalid-email') {
            friendlyMessage = "Please enter a valid email address.";
        } else {
            friendlyMessaage = `Login failed: ${error.message}`;
        }
      displayAuthError(friendlyMessage);
      logEvent(analytics, 'login_failure', { method: 'Email/Password', error_code: error.code, error_message: error.message });
    });
};