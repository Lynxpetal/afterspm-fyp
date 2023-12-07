import { collection, getFirestore } from "firebase/firestore";
import app from "../FirebaseConfig/firebaseConfig";

export const firestore = getFirestore(app)

//Institute Collection
export const instituteCollection = collection(firestore, 'Institute')
export const programmeCollection = collection(firestore, 'Programme')
export const testCollection = collection(firestore, 'Test')
export const careerCollection = collection(firestore, 'Career')
export const userCollection = collection(firestore, 'User')
export const distanceMatrixResultCollection = collection(firestore, 'DistanceMatrixResults')
export const secretCollection = collection(firestore, "Secret")