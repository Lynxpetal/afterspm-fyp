// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  // apiKey: "AIzaSyBrZ0cF2ZbobBOoYsNEpj9DXRMGoRbWymA",
  // authDomain: "afterspm-web-application.firebaseapp.com",
  // projectId: "afterspm-web-application",
  // storageBucket: "afterspm-web-application.appspot.com",
  // messagingSenderId: "1015305610660",
  // appId: "1:1015305610660:web:6afc0c9075caaf7cbf4d31",
  // measurementId: "G-QLEWHDBVPG"
  apiKey: "AIzaSyA7TZO1xRKiODyoAnFtp7b1mwRUj3DZV7E",
  authDomain: "afterspm-web-application2.firebaseapp.com",
  projectId: "afterspm-web-application2",
  storageBucket: "afterspm-web-application2.appspot.com",
  messagingSenderId: "929814217322",
  appId: "1:929814217322:web:5ce641899f638bc5f3c013",
  measurementId: "G-54RMC2PPS0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)
export const auth = getAuth(app)
export { db }
export { storage }
export default app


