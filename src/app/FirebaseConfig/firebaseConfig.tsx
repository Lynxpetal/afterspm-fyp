// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBrZ0cF2ZbobBOoYsNEpj9DXRMGoRbWymA",
  authDomain: "afterspm-web-application.firebaseapp.com",
  projectId: "afterspm-web-application",
  storageBucket: "afterspm-web-application.appspot.com",
  messagingSenderId: "1015305610660",
  appId: "1:1015305610660:web:6afc0c9075caaf7cbf4d31",
  measurementId: "G-QLEWHDBVPG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)
export const auth = getAuth(app)
export { db }
export { storage }
export default app


