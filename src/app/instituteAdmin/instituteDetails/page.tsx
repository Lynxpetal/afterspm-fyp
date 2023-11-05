'use client'
import React, { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../FirebaseConfig/firebaseConfig";
import { Button, Label, TextInput, FileInput } from 'flowbite-react'
import { BiSolidUser } from 'react-icons/bi'
import { ImLocation2 } from 'react-icons/im'
import { BsFillTelephoneFill } from 'react-icons/bs'
import { HiMail } from 'react-icons/hi'

export default function InstituteDetails() {
  //retrieve the id
  const searchParams = useSearchParams();
  const instituteId = searchParams.get('search')
  console.log(instituteId)

  //Fetch the single document
  //const getHotel = doc(firestore,  `Institute/${instituteId}`)
  const [isInstituteFetchDataLoading, setIsInstituteFetchDataLoading] = useState(false)
  const [institute, setInstitute] = useState({})

  const fetchInstituteData = async () => {
    //data is fetching = loading
    setIsInstituteFetchDataLoading(true);
  
    try {
      const instituteDocRef = doc(db, "Institute", instituteId);
      const instituteDocSnap = await getDoc(instituteDocRef);
  
      if (instituteDocSnap.exists()) {
        console.log("Document data: ", instituteDocSnap.data());
        setInstitute(instituteDocSnap.data());
      } else {
        console.log("No document");
      }
    } catch (error) {
      console.error("Error fetching document: ", error);
      
      //data is fetched successfully
    } finally {
      setIsInstituteFetchDataLoading(false);
    }
  };
  

  useEffect(() => {
    fetchInstituteData();
  }, [])

  if (isInstituteFetchDataLoading) return <div><h1>sssssssssssss</h1></div>
  return (
    <form className="flex max-w-md flex-col gap-4" style={{ margin: '20px', padding: '20px', backgroundColor: '#EDFDFF', width:"500px" }} noValidate>
      <h1 className="loginHeader">View Institute Information</h1>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="name" value="Name" />
          <TextInput
            type="text"
            className="form-control"
            id="name"
            icon={BiSolidUser}
            placeholder="Tunku Abdul Rahman University of Management and Technology"
            value={institute.InstituteName}
            disabled
          />
        </div>
      </div>




    </form>
  )

}