'use client'
import { useEffect, useState } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import app from "../FirebaseConfig/firebaseConfig"
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore"

export default function UploadResult() {
  const [userId, setUserId] = useState<string | null>(null)
  const firestore = getFirestore(app)
  const resultCollection = collection(firestore, 'Result')



  useEffect(() => {
    const auth = getAuth()
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid
        setUserId(uid)
        console.log(uid)
        console.log(userId)

        const q = query(resultCollection, where('ResultBelongTo', '==', uid))
        const querySnapshot = await getDocs(q)

        if(querySnapshot.size > 0) {
          console.log("Good")
        } else {
          console.log("Fail")
        }

      } else {
        setUserId(null)
        console.log(userId)
      }
    })
  }, [userId])

}