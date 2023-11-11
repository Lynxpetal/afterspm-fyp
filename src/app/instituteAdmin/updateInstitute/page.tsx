'use client';
import { Label, TextInput, FileInput, Toast, Kbd } from 'flowbite-react'
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
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { db } from '@/app/FirebaseConfig/firebaseConfig'
import { HiCheck } from 'react-icons/hi'
import Link from 'next/link'
import { AiOutlineClose } from 'react-icons/ai'

type updateInstituteFormValues = {
  name: string;
  location: string;
  phoneNumber: string;
  emailAddress: string;
  imageFile: File;
}

export default function InstituteAdmin() {
  //retrieve the id
  const searchParams = useSearchParams();
  const instituteId = searchParams.get('search')
  console.log(instituteId)

  const form = useForm<[updateInstituteFormValues]>();
  const [institute, setInstitute] = useState({})
  const [instituteName, setInstituteName] = useState('')
  const [instituteLocation, setInstituteLocation] = useState('')
  const [institutePhoneNumber, setInstitutePhoneNumber] = useState('')
  const [instituteEmailAddress, setInstituteEmailAddress] = useState('')
  const [instituteImageFile, setInstituteImageFile] = useState<File | null>(null);
  const [instituteImageSizeError, setInstituteImageSizeError] = useState("")
  const [instituteImageFormatError, setInstituteImageFormatError] = useState("")
  const [instituteImageFilePath, setInstituteImageFilePath] = useState("")
  const [instituteImageFileUrl, setInstituteImageFileUrl] = useState("")
  const [instituteImageName, setInstituteImageName] = useState("")
  const [previousInstituteImageName, setPreviousInstituteImageName] = useState("")
  const [updateSuccessfulStatus, setUpdateSuccessfulStatus] = useState(false)
  const { register, handleSubmit, formState } = form
  const { errors } = formState
  const isInstituteNameValid = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/
  const isInstitutePhoneNumberValid = /^(0[0-9]-\d{7,8}|011-\d{8}|01[02-9]-\d{7})$/
  const isInstituteEmailAddressValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

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
        setPreviousInstituteImageName(updateInstituteDocSnap.data().InstituteImageName)
        setInstituteImageName(updateInstituteDocSnap.data().InstituteImageName)
        setInstituteImageFilePath(updateInstituteDocSnap.data().InstituteImagePath)
        setInstituteImageFileUrl(updateInstituteDocSnap.data().InstituteImageUrl)
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

  const handleUpdateInstituteImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setInstituteImageName(instituteFile.name)
    }
    else {
      setInstituteImageFile(null);
    }
  }

  const updateInstitute = async (data: [updateInstituteFormValues]) => {
    try {
      console.log(instituteImageName)
      console.log(previousInstituteImageName)
      //if different then store latest
      if (instituteImageName != previousInstituteImageName) {
        if (instituteImageFile) {
          const instituteImageRef = ref(storage, `InstituteImage/${v4()}`)
          const instituteData = await uploadBytes(instituteImageRef, instituteImageFile)
          const instituteUrlVal = await getDownloadURL(instituteData.ref)
  
          setInstituteImageFileUrl(instituteUrlVal)
          setInstituteImageFilePath(instituteData.metadata.name)

          const updateInstituteData = await updateInstituteDataToFirestore(
            instituteName,
            instituteLocation,
            institutePhoneNumber,
            instituteEmailAddress,
            instituteData.metadata.name,
            instituteUrlVal,
            instituteImageName,
            instituteId
          )

          if (updateInstituteData) {
            setUpdateSuccessfulStatus(true)
          }
      
        } 
        else {
          console.error("Image file is null. Unable to upload")
        }   

      }
      else {
        const updateInstituteData = await updateInstituteDataToFirestore(
          instituteName,
          instituteLocation,
          institutePhoneNumber,
          instituteEmailAddress,
          instituteImageFilePath,
          instituteImageFileUrl,
          instituteImageName,
          instituteId
        )

        if (updateInstituteData) {
          setUpdateSuccessfulStatus(true)
        }
      }
    }
    catch (error) {
      console.error("Error handling institute click", error)
    }

  }


  async function updateInstituteDataToFirestore(instituteName: string, instituteLocation: string, institutePhoneNumber: string, instituteEmailAddress: string, instituteImageFilePath: string, instituteImageFileUrl: string, instituteImageName: string, instituteId: string|null) {
    try {
      const updateDocRef = doc(db, 'Institute', instituteId)
      updateDoc(updateDocRef, {
        InstituteName: instituteName,
        InstituteLocation: instituteLocation,
        InstitutePhoneNumber: institutePhoneNumber,
        InstituteEmailAddress: instituteEmailAddress,
        InstituteImagePath: instituteImageFilePath,
        InstituteImageUrl: instituteImageFileUrl,
        InstituteImageName: instituteImageName,
        InstituteLastUpdateTimestamp: serverTimestamp(),
      })
      console.log("Complete Updating")
      return true
  
    } catch (error) {
      console.error("Error updating document", error)
      return false
      
    }
}


useEffect(() => {
  fetchUpdateInstituteData();
}, []);

useEffect(() => {
  const isNameValid = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/
  const isPhoneNumberValid = /^(0[0-9]-\d{7,8}|011-\d{8}|01[02-9]-\d{7})$/
  const isEmailAddressValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (isNameValid.test(instituteName) && instituteName.length >= 20) {
    form.clearErrors("0.name")
  }
  if (instituteLocation.length >= 25) {
    form.clearErrors("0.location")
  }
  if (isPhoneNumberValid.test(institutePhoneNumber)) {
    form.clearErrors("0.phoneNumber")
  }
  if (isEmailAddressValid.test(instituteEmailAddress)) {
    form.clearErrors("0.emailAddress")
  }
  if (instituteImageFile != null) {
    form.clearErrors("0.imageFile")
  }

}, [instituteName, instituteLocation, institutePhoneNumber, instituteEmailAddress, instituteImageFile, form]);


return (
  <div>
      {updateSuccessfulStatus && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1000 }}>
          {/* Overlay to cover the entire screen */}
        </div>
      )}
      {updateSuccessfulStatus && (
        <Toast style={{ position: "fixed", top: "5%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1001 }}>
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
            <HiCheck className="h-5 w-5" />
          </div>
          <div className="ml-3 text-sm font-normal">Data updated successfully.</div>
          <button
            className="rounded-lg p-1.5 text-sm font-medium text-cyan-600 hover:bg-cyan-100 dark:text-cyan-500 dark:hover:bg-gray-700"
            onClick={() => {
              window.location.href = '/instituteAdmin';
            }}
          >
            Ok
          </button>
        </Toast>
      )}
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
                <Kbd icon={HiCheck} onClick={handleSubmit(updateInstitute)} style={{ fontSize: '24px', backgroundColor: 'transparent', border: 'none' }} />
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
                {...register("0.name", {
                  minLength: {
                    value: 20,
                    message: "At least 20 characters long"
                  },
                  pattern: {
                    value: isInstituteNameValid,
                    message: "Invalid institute name"
                  }
                })}
                onChange={(e) => setInstituteName(e.target.value)}
              />
              <p className="addInstituteValidationError">{errors[0]?.name?.message}</p>
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
                {...register("0.location", {
                  minLength: {
                    value: 25,
                    message: "At least 25 characters long"
                  },
                })}
                onChange={(e) => setInstituteLocation(e.target.value)}
              />
              <p className="addInstituteValidationError">{errors[0]?.location?.message}</p>
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
                {...register("0.phoneNumber", {
                  pattern: {
                    value: isInstitutePhoneNumberValid,
                    message: "Invalid phone number format"
                  },
                })}
                onChange={(e) => setInstitutePhoneNumber(e.target.value)}
              />
              <p className="addInstituteValidationError">{errors[0]?.phoneNumber?.message}</p>
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
                {...register("0.emailAddress", {
                  pattern: {
                    value: isInstituteEmailAddressValid,
                    message: "Invalid email address format. Follow the format: abc@gmail.com"
                  },
                })}
                onChange={(e) => setInstituteEmailAddress(e.target.value)}
              />
              <p className="addInstituteValidationError">{errors[0]?.emailAddress?.message}</p>
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
                onChange={(e) => { handleUpdateInstituteImageUpload(e) }}
              />
              {instituteImageSizeError && <p className="addInstituteValidationError">{instituteImageSizeError}</p>}
              {instituteImageFormatError && <p className="addInstituteValidationError">{instituteImageFormatError}</p>}
            </div>
            <div>
              <h1 style={{ color: "black" }}>Current File Name: {instituteImageName}</h1>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
)


}