'use client'
import React, { useEffect, useState } from "react"
import { useSearchParams } from 'next/navigation'
import { doc, getDoc } from "firebase/firestore"
import { db } from "../../FirebaseConfig/firebaseConfig"
import { Label, TextInput, Kbd, FileInput } from 'flowbite-react'
import { BiSolidUser } from 'react-icons/bi'
import { ImLocation2 } from 'react-icons/im'
import { BsFillTelephoneFill } from 'react-icons/bs'
import { HiMail } from 'react-icons/hi'
import MoonLoader from "react-spinners/MoonLoader"
import { BiArrowBack } from "react-icons/bi"
import Link from "next/link"

export default function InstituteDetails() {
  //retrieve the id
  const searchParams = useSearchParams();
  const instituteId = searchParams.get('search')
  console.log(instituteId)

  //Fetch the single document
  //const getHotel = doc(firestore,  `Institute/${instituteId}`)
  const [isInstituteFetchDataLoading, setIsInstituteFetchDataLoading] = useState(true)
  const [instituteImageUrl, setInstituteImageUrl] = useState('')
  const [instituteName, setInstituteName] = useState('')
  const [instituteLocation, setInstituteLocation] = useState('')
  const [institutePhoneNumber, setInstitutePhoneNumber] = useState('')
  const [instituteEmailAddress, setInstituteEmailAddress] = useState('')
  const [instituteImageName, setInstituteImageName] = useState('')

  const fetchInstituteData = async () => {
    //data is fetching = loading
    setIsInstituteFetchDataLoading(true);

    try {
      const instituteDocRef = doc(db, "Institute", instituteId);
      const instituteDocSnap = await getDoc(instituteDocRef);

      if (instituteDocSnap.exists()) {
        console.log("Document data: ", instituteDocSnap.data())
        setInstituteName(instituteDocSnap.data().InstituteName)
        setInstituteLocation(instituteDocSnap.data().InstituteLocation)
        setInstitutePhoneNumber(instituteDocSnap.data().InstitutePhoneNumber)
        setInstituteEmailAddress(instituteDocSnap.data().InstituteEmailAddress)
        setInstituteImageName(instituteDocSnap.data().InstituteImageName)
        setInstituteImageUrl(instituteDocSnap.data().InstituteImageUrl)

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
    const fetchData = async () => {
      await fetchInstituteData();
      console.log("Institute Image Name:", instituteImageName);
    };
  
    fetchData();
  }, [instituteImageName])

  if (isInstituteFetchDataLoading)
    return <div className="grid">
      <MoonLoader
        loading={isInstituteFetchDataLoading}
        size={50}
        color="#8DD3E2"

      />
      <h1>Loading...</h1>
    </div>
  return (
    <form style={{ margin: '20px' }}>
      <div className="card" style={{ margin: '30px' }}>
        <div style={{ backgroundColor: "#EDFDFF", margin: '30px', padding: '30px', width: '75%' }}>
          <div style={{ paddingBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link href={{ pathname: '/instituteAdmin' }}>
                <Kbd icon={BiArrowBack} style={{ fontSize: '24px', backgroundColor: 'transparent', border: 'none' }} />
              </Link>
              <h1 className="loginHeader" style={{ marginLeft: 'auto', marginRight: 'auto' }}>View Institute Information</h1>
            </div>
          </div>

          <div style={{ paddingBottom: '20px' }}>
            <div className="mb-2 block">
              <Label htmlFor="name" value="Name" />
            </div>
            <TextInput
              type="text"
              className="form-control"
              id="name"
              icon={BiSolidUser}
              value={instituteName}
            />
          </div>

          <div style={{ paddingBottom: '20px' }}>
            <div className="mb-2 block">
              <Label htmlFor="location" value="Location" />
            </div>
            <TextInput
              type="text"
              className="form-control"
              id="location"
              icon={ImLocation2}
              value={instituteLocation}
            />
          </div>

          <div style={{ paddingBottom: '20px' }}>
            <div className="mb-2 block">
              <Label htmlFor="phone" value="Phone Number" />
            </div>
            <TextInput
              type="tel"
              className="form-control"
              id="phoneNumber"
              icon={BsFillTelephoneFill}
              value={institutePhoneNumber}
            />
          </div>

          <div style={{ paddingBottom: '20px' }}>
            <div className="mb-2 block">
              <Label htmlFor="email" value="Email Address" />
            </div>
            <TextInput
              type="tel"
              className="form-control"
              id="emailAddress"
              icon={HiMail}
              value={instituteEmailAddress}
            />
          </div>

          <div style={{ paddingBottom: '20px' }}>
            <div id="fileUpload" className="max-w-md">
              <div className="mb-2 block">
                <Label htmlFor="file" value="Image" />
              </div>
            </div>
            <div>
              <h1 style={{ color: "black" }}>Current File Name: {instituteImageName}</h1>
            </div>
            <div>        
              <img src={instituteImageUrl} height="auto" width="auto" style={{marginTop: "10px"}}/>
            </div>
          </div>
        </div>
      </div>
    </form>
  )

}