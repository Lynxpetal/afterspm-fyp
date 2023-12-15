// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyBkd3OfNIMN_n_dEnajxFCMWFmFLXlW4WE",
  authDomain: "afterspm-web-application-5.firebaseapp.com",
  projectId: "afterspm-web-application-5",
  storageBucket: "afterspm-web-application-5.appspot.com",
  messagingSenderId: "980740504780",
  appId: "1:980740504780:web:04b7c9bcc9a49040799669"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)
export const auth = getAuth(app)
export { db }
export { storage }
export default app


