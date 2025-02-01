import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyB4Ak1JIMD_r5s-HjnfTWUYjg2iT_UddY0",
  authDomain: "crochettobya-9a8c5.firebaseapp.com",
  projectId: "crochettobya-9a8c5",
  storageBucket: "crochettobya-9a8c5.firebasestorage.app",
  messagingSenderId: "768758429931",
  appId: "1:768758429931:web:1231357b328d5c9db226ae",
  measurementId: "G-WLFF06T49C",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
