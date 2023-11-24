// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDKqcxjPyEyybzNFl3LqXneYv-vAHvMDYg",
  authDomain: "afterspm-web-application-d12ca.firebaseapp.com",
  projectId: "afterspm-web-application-d12ca",
  storageBucket: "afterspm-web-application-d12ca.appspot.com",
  messagingSenderId: "852859552969",
  appId: "1:852859552969:web:f30d08447cc60c678af918"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)
export const auth = getAuth(app)
export { db }
export { storage }
export default app


