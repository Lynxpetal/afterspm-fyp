'use client';
import { Button, Label, TextInput, FileInput, Toast, Kbd } from 'flowbite-react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { BiSolidUser } from 'react-icons/bi'
import { ImLocation2 } from 'react-icons/im'
import { BsFillTelephoneFill } from 'react-icons/bs'
import { HiMail } from 'react-icons/hi'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { v4 } from "uuid"
import { storage } from '@/app/FirebaseConfig/firebaseConfig'
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { db } from '@/app/FirebaseConfig/firebaseConfig'
import { useRouter } from 'next/navigation'
import { HiCheck } from 'react-icons/hi'
import Link from 'next/link'
import { AiOutlineClose } from 'react-icons/ai'

export default function InstituteAdmin() {
  //retrieve the id
  const searchParams = useSearchParams();
  const instituteId = searchParams.get('search')
  console.log(instituteId)

  const [institute, setInstitute] = useState({})
  const [instituteImageUrl, setInstituteImageUrl] = useState('')
  const [instituteName, setInstituteName] = useState('')
  const [instituteLocation, setInstituteLocation] = useState('')
  const [institutePhoneNumber, setInstitutePhoneNumber] = useState('')
  const [instituteEmailAddress, setInstituteEmailAddress] = useState('')
  const [instituteImageFile, setInstituteImageFile] = useState<File | null>(null);
  const [instituteImageSizeError, setInstituteImageSizeError] = useState("")
  const [instituteImageFormatError, setInstituteImageFormatError] = useState("")
  const [instituteImageFilePath, setInstituteImageFilePath] = useState("")
  const [instituteImageFileUrl, setInstituteImageFileUrl] = useState("")

  const handleInstituteImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const instituteFile = e.target.files?.[0];

    if (instituteFile && instituteFile.size > 100000000) {
      setInstituteImageSizeError("Image size too large");
    } else {
      setInstituteImageSizeError("");
    }

    if (instituteFile && instituteFile.type != "image/jpeg") {
      setInstituteImageFormatError("Invalid image format");
    } else {
      setInstituteImageFormatError("");
    }

    //Check both conditions and set error messages accordingly
    if (instituteFile && instituteFile.size > 100000000 && instituteFile.type != "image/jpeg") {
      setInstituteImageSizeError("Image size too large");
      setInstituteImageFormatError("Invalid image format");
    }

    //If both conditions pass, set the image file
    if (instituteFile && instituteFile.size <= 100000000 && instituteFile.type == "image/jpeg") {
      setInstituteImageFile(instituteFile);
    }
    else {
      setInstituteImageFile(null);
    }
  }

  const updateInstitute = () => {
    const docRef = doc(db, 'Institute', instituteId)

    updateDoc(docRef, {
      InstituteName: instituteName,
      InstituteLocation: instituteLocation,
      InstitutePhoneNumber: institutePhoneNumber,
      InstituteEmailAddress: instituteEmailAddress,
      InstituteImagePath: instituteImageFilePath,
      InstituteImageUrl: instituteImageFileUrl,
      InstituteLastUpdateTimestamp: serverTimestamp(),
    })

    console.log("Complete Updating")
  }

  const fetchUpdateInstituteData = async () => {
    try {
      const updateInstituteDocRef = doc(db, "Institute", instituteId)
      const updateInstituteDocSnap = await getDoc(updateInstituteDocRef)

      if (updateInstituteDocSnap.exists()) {
        console.log("Document data: ", updateInstituteDocSnap.data());
        setInstitute(updateInstituteDocSnap.data());
        setInstituteName(updateInstituteDocSnap.data().InstituteName)
        setInstituteLocation(updateInstituteDocSnap.data().InstituteLocation)
        setInstitutePhoneNumber(updateInstituteDocSnap.data().InstitutePhoneNumber)
        setInstituteEmailAddress(updateInstituteDocSnap.data().InstituteEmailAddress)
        setInstituteImageUrl(updateInstituteDocSnap.data().InstituteImageUrl)
      } else {
        console.log("No document");
      }
    } catch (error) {
      console.error("Error fetching document: ", error);

      //data is fetched successfully
    } finally {
      //setIsInstituteFetchDataLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdateInstituteData();
  }, [])


  return (
    <div>
      <form style={{ margin: '20px' }}>
        <div className="card" style={{ margin: '30px' }}>
          <div style={{ backgroundColor: "#EDFDFF", margin: '30px', padding: '30px', width: '75%' }}>
            <div style={{ paddingBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href={{ pathname: '/instituteAdmin' }}>
                  <Kbd icon={AiOutlineClose} style={{ fontSize: '24px', backgroundColor: 'transparent', border: 'none' }} />
                </Link>
                <h1 className="loginHeader">Update Institute Information</h1>
                <div>
                  <Kbd icon={HiCheck} onClick={(updateInstitute)} style={{ fontSize: '24px', backgroundColor: 'transparent', border: 'none' }} />
                </div>
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div className="mb-2 block">
                <Label htmlFor="name" value="Name" />
                <TextInput
                  type="text"
                  className="form-control"
                  id="name"
                  icon={BiSolidUser}
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                />
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div className="mb-2 block">
                <Label htmlFor="location" value="Location" />
                <TextInput
                  type="text"
                  className="form-control"
                  id="location"
                  icon={ImLocation2}
                  value={instituteLocation}
                  onChange={(e) => setInstituteLocation(e.target.value)}
                />
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div className="mb-2 block">
                <Label htmlFor="phone" value="Phone Number" />
                <TextInput
                  type="tel"
                  className="form-control"
                  id="phoneNumber"
                  icon={BsFillTelephoneFill}
                  value={institutePhoneNumber}
                  onChange={(e) => setInstitutePhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Email Address" />
                <TextInput
                  type="tel"
                  className="form-control"
                  id="emailAddress"
                  icon={HiMail}
                  value={instituteEmailAddress}
                  onChange={(e) => setInstituteEmailAddress(e.target.value)}
                />
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div id="fileUpload" className="max-w-md">
                <div className="mb-2 block">
                  <Label htmlFor="file" value="Image" />
                </div>
                <FileInput
                  className='form-control'
                  id="file"
                  onChange={(e) => { handleInstituteImageUpload(e) }}
                />
              </div>
              <div>        
              <img src={instituteImageUrl} height="auto" width="auto" style={{marginTop: "10px"}}/>
            </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )


}