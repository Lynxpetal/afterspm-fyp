'use client'
import { Label, TextInput, FileInput, Kbd } from 'flowbite-react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
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
import Swal from 'sweetalert2'
import { useRouter } from "next/navigation"
import { FaUniversity } from 'react-icons/fa'

declare global {
  interface Window {
    initAutocomplete: () => void
  }
}

type updateInstituteFormValues = {
  name: string
  location: string
  phoneNumber: string
  emailAddress: string
  imageFile: File
}

export default function InstituteAdmin() {
  //retrieve the id
  const searchParams = useSearchParams()
  const instituteId = searchParams.get('search')
  console.log(instituteId)

  const form = useForm<[updateInstituteFormValues]>()
  const [instituteName, setInstituteName] = useState('')
  const [instituteLocation, setInstituteLocation] = useState('')
  const [institutePhoneNumber, setInstitutePhoneNumber] = useState('')
  const [instituteEmailAddress, setInstituteEmailAddress] = useState('')
  const [instituteImageFile, setInstituteImageFile] = useState<File | null>(null)
  const [instituteImageSizeError, setInstituteImageSizeError] = useState("")
  const [instituteImageFormatError, setInstituteImageFormatError] = useState("")
  const [instituteImageFilePath, setInstituteImageFilePath] = useState("")
  const [instituteImageFileUrl, setInstituteImageFileUrl] = useState("")
  const [instituteImageName, setInstituteImageName] = useState("")
  const [previousInstituteImageName, setPreviousInstituteImageName] = useState("")
  const { register, handleSubmit, formState } = form
  const { errors } = formState
  const router = useRouter()
  const isInstitutePhoneNumberValid = /^(0[0-9]-\d{7,8}|011-\d{8}|01[02-9]-\d{7})$/
  const isInstituteEmailAddressValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  const fetchUpdateInstituteData = async () => {
    try {
      const updateInstituteDocRef = doc(db, "Institute", instituteId)
      const updateInstituteDocSnap = await getDoc(updateInstituteDocRef)

      if (updateInstituteDocSnap.exists()) {
        console.log("Document data: ", updateInstituteDocSnap.data())
        setInstituteName(updateInstituteDocSnap.data().InstituteName)
        setInstituteLocation(updateInstituteDocSnap.data().InstituteLocation)
        setInstitutePhoneNumber(updateInstituteDocSnap.data().InstitutePhoneNumber)
        setInstituteEmailAddress(updateInstituteDocSnap.data().InstituteEmailAddress)
        setPreviousInstituteImageName(updateInstituteDocSnap.data().InstituteImageName)
        setInstituteImageName(updateInstituteDocSnap.data().InstituteImageName)
        setInstituteImageFilePath(updateInstituteDocSnap.data().InstituteImagePath)
        setInstituteImageFileUrl(updateInstituteDocSnap.data().InstituteImageUrl)
      } else {
        console.log("No document")
      }
    } catch (error) {
      console.error("Error fetching document: ", error)

      //data is fetched successfully
    } finally {
      //setIsInstituteFetchDataLoading(false)
    }
  }

  let autocomplete: google.maps.places.Autocomplete
  let locationField: HTMLInputElement

  function initAutocomplete(): void {
    console.log("Autocomplete initialized")
    locationField = document.querySelector("#location") as HTMLInputElement

    //create the autocomplete object, restricting the search predictions
    //to addresses in Malaysia
    autocomplete = new google.maps.places.Autocomplete(locationField, {
      componentRestrictions: { country: ["my"] },
      fields: ["address_components", "geometry"],
      types: ["address"],
    })
    locationField?.focus()

    //when the user selects an address from the drop down, 
    //then get the place details so that can store it inside firebase
    autocomplete.addListener("place_changed", getAddress)

  }

  function getAddress() {
    const place = autocomplete.getPlace()

    //check if place has valid address components
    if (place.address_components && place.address_components.length > 0) {
      const fullAddress = place.address_components.map((component) => component.long_name).join(', ')

      //contains the complete location details
      console.log(fullAddress)
      setInstituteLocation(fullAddress)
    }


  }

  const handleUpdateInstituteImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const instituteFile = e.target.files?.[0]

    if (instituteFile && instituteFile.size > 100000000) {
      setInstituteImageSizeError("Image size too large")
    } else {
      setInstituteImageSizeError("")
    }

    if (instituteFile && (instituteFile.type != "image/png" && instituteFile.type != "image/jpeg")) {
      setInstituteImageFormatError("Invalid image format")
    } else {
      setInstituteImageFormatError("")
    }

    //Check both conditions and set error messages accordingly
    if (instituteFile && instituteFile.size > 100000000 && (instituteFile.type != "image/png" && instituteFile.type != "image/jpeg")) {
      setInstituteImageSizeError("Image size too large")
      setInstituteImageFormatError("Invalid image format")
    }

    //If both conditions pass, set the image file
    if (instituteFile && instituteFile.size <= 100000000 && instituteFile.type != "image/png") {
      setInstituteImageFile(instituteFile)
      setInstituteImageName(instituteFile.name)
    }
    else if (instituteFile && instituteFile.size <= 100000000 && instituteFile.type != "image/jpeg") {
      setInstituteImageFile(instituteFile)
      setInstituteImageName(instituteFile.name)
    }
    else {
      setInstituteImageFile(null)
    }
  }

  const updateInstitute = async (data: [updateInstituteFormValues]) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Double confirm that information is correctly entered before updated in the database.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes"
    }).then((result) => {
      if (result.isConfirmed) {
        updateInstituteData()
        Swal.fire({
          title: "Great!",
          text: "Update successfully inside the database",
          icon: "success",
        }).then(() => {
          //Navigate to /instituteAdmin after user presses ok
          router.push('/instituteAdmin')
        })
      }
    })

  }

  async function updateInstituteData() {
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

          await updateInstituteDataToFirestore(
            instituteName,
            instituteLocation,
            institutePhoneNumber,
            instituteEmailAddress,
            instituteData.metadata.name,
            instituteUrlVal,
            instituteImageName,
            instituteId
          )

        }
        else {
          console.error("Image file is null. Unable to upload")
        }

      }
      else {
        await updateInstituteDataToFirestore(
          instituteName,
          instituteLocation,
          institutePhoneNumber,
          instituteEmailAddress,
          instituteImageFilePath,
          instituteImageFileUrl,
          previousInstituteImageName,
          instituteId
        )

      }
    }
    catch (error) {
      console.error("Error handling institute click", error)
    }

  }


  async function updateInstituteDataToFirestore(instituteName: string, instituteLocation: string, institutePhoneNumber: string, instituteEmailAddress: string, instituteImageFilePath: string, instituteImageFileUrl: string, instituteImageName: string, instituteId: string | null) {
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
    fetchUpdateInstituteData()


  }, [])

  useEffect(() => {
    if (!window.initAutocomplete) {
      //create a new script element
      const newScript = document.createElement('script')

      //set the script source with API key
      //newScript.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD1VHOjqeJLkei_MrpViqAsfADYp0Q3QSs&callback=initAutocomplete&libraries=places&v=weekly"
      newScript.async = true
      newScript.defer = true

      //define onLoad callback
      newScript.onload = () => {
        window.initAutocomplete = initAutocomplete
        initAutocomplete()
      }

      //append script to document
      document.head.appendChild(newScript)

    } else {
      initAutocomplete()
    }

    return () => {
      //cleanup code if needed
    }

  }, [])

  useEffect(() => {
    const isPhoneNumberValid = /^(0[0-9]-\d{7,8}|011-\d{8}|01[02-9]-\d{7})$/
    const isEmailAddressValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (instituteName != "" && instituteName.length >= 20) {
      form.clearErrors("0.name")
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

  }, [instituteName, institutePhoneNumber, instituteEmailAddress, instituteImageFile, form])


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
                  icon={FaUniversity}
                  value={instituteName}
                  {...register("0.name", {
                    minLength: {
                      value: 20,
                      message: "At least 20 characters long"
                    },
                  })}
                  onChange={(e) => setInstituteName(e.target.value)}
                />
                <p className="addInstituteValidationError">{errors[0]?.name?.message}</p>
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div className="mb-2 block" style={{ color: "black" }}>
                <Label htmlFor="location" value="Location" />
                <TextInput
                  type="text"
                  id="location"
                  icon={ImLocation2}
                  value={instituteLocation}
                  autoComplete='off'
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
                <h1 style={{ color: "black" }}>Current File Name: {previousInstituteImageName}</h1>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )


}