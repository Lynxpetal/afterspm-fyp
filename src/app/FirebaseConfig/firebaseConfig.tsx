// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyC3uH_8vGqRPbwiFvApJDQn8LdjSy0ksvU",
  authDomain: "afterspm-web-application-4.firebaseapp.com",
  projectId: "afterspm-web-application-4",
  storageBucket: "afterspm-web-application-4.appspot.com",
  messagingSenderId: "472866006919",
  appId: "1:472866006919:web:7f7264c7440f7fd8b81522"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)
export const auth = getAuth(app)
export { db }
export { storage }
export default app


