'use client'
import { Label, TextInput, FileInput, Kbd, Button } from 'flowbite-react'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { ImLocation2 } from 'react-icons/im'
import { BsFillTelephoneFill } from 'react-icons/bs'
import { HiMail } from 'react-icons/hi'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { v4 } from "uuid"
import { storage } from '@/app/FirebaseConfig/firebaseConfig'
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from '@/app/FirebaseConfig/firebaseConfig'
import Link from 'next/link'
import { AiOutlineClose } from 'react-icons/ai'
import Swal from 'sweetalert2'
import { useRouter } from "next/navigation"
import { FaUniversity } from "react-icons/fa"

declare global {
  interface Window {
    initAutocomplete: () => void
  }
}

type addInstituteFormValues = {
  name: string
  location: string
  phoneNumber: string
  emailAddress: string
  imageFile: File
}

export default function InstituteAdmin() {
  const form = useForm<[addInstituteFormValues]>()
  const [name, setInstituteName] = useState("")
  const [location, setInstituteLocation] = useState("")
  const [phoneNumber, setInstitutePhoneNumber] = useState("")
  const [emailAddress, setInstituteEmailAddress] = useState("")
  const [instituteImageFile, setInstituteImageFile] = useState<File | null>(null)
  const [instituteImageSizeError, setInstituteImageSizeError] = useState("")
  const [instituteImageFormatError, setInstituteImageFormatError] = useState("")
  const { register, handleSubmit, formState } = form
  const { errors } = formState
  const router = useRouter()

  const isInstitutePhoneNumberValid = /^(0[0-9]-\d{7,8}|011-\d{8}|01[02-9]-\d{7})$/
  const isInstituteEmailAddressValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

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

  const handleInstituteImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const instituteFile = e.target.files?.[0]

    if (instituteFile && instituteFile.size > 100000000) {
      setInstituteImageSizeError("Image size too large")
    } else {
      setInstituteImageSizeError("")
    }

    if (instituteFile && (instituteFile.type != "image/png" && instituteFile.type != "image/jpeg")) {
      setInstituteImageFormatError("Invalid image type")
    } else {
      setInstituteImageFormatError("")
    }

    //Check both conditions and set error messages accordingly
    if (instituteFile && instituteFile.size > 100000000 && (instituteFile.type != "image/png" && instituteFile.type != "image/jpeg")) {
      setInstituteImageSizeError("Image size too large")
      setInstituteImageFormatError("Invalid image type")
    }

    //If both conditions pass, set the image file
    if (instituteFile && instituteFile.size <= 100000000 && instituteFile.type == "image/png") {
      setInstituteImageFile(instituteFile)
    }
    else if (instituteFile && instituteFile.size <= 100000000 && instituteFile.type != "image/jpeg") {
      setInstituteImageFile(instituteFile)
    }
    else {
      setInstituteImageFile(null)
    }
  }

  //add inside storage
  //retrieve the image url so that can store inside firestore
  const addInstitute = async (data: [addInstituteFormValues]) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Double confirm that information is correctly entered before added in the database.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes"
    }).then((result) => {
      if (result.isConfirmed) {
        addInstituteData()
        Swal.fire({
          title: "Great!",
          text: "Add successfully inside the database",
          icon: "success",
        }).then(() => {
          //Navigate to /instituteAdmin after user presses ok
          router.push('/instituteAdmin')
        })
      }
    })

  }

  async function addInstituteData() {
    try {
      if (instituteImageFile) {
        const instituteImageRef = ref(storage, `InstituteImage/${v4()}`)
        const instituteData = await uploadBytes(instituteImageRef, instituteImageFile)
        const instituteUrlVal = await getDownloadURL(instituteData.ref)

        const imageName = instituteImageFile.name


        await addRegisterInstituteDataToFirestore(
          name,
          location,
          phoneNumber,
          emailAddress,
          imageName,
          instituteData.metadata.name,
          instituteUrlVal
        )

      }
      else {
        console.error("Image file is null. Unable to upload")
      }

    } catch (error) {
      console.error("Error handling institute click", error)
    }
  }

  async function addRegisterInstituteDataToFirestore(name: string, location: string, phoneNumber: string, emailAddress: string, imageName: string, imagePath: string, imageUrl: string) {
    try {
      // collection - Institute
      const instituteDocRef = await addDoc(collection(db, "Institute"), {
        InstituteName: name,
        InstituteLocation: location,
        InstitutePhoneNumber: phoneNumber,
        InstituteEmailAddress: emailAddress,
        InstituteImageName: imageName,
        InstituteImagePath: imagePath,
        InstituteImageUrl: imageUrl,
        InstituteLastUpdateTimestamp: serverTimestamp(),
      })
      console.log("Document written with ID: ", instituteDocRef.id)
    } catch (error) {
      console.error("Error adding document", error)
    }
  }

  useEffect(() => {
    const isPhoneNumberValid = /^(0[0-9]-\d{7,8}|011-\d{8}|01[02-9]-\d{7})$/
    const isEmailAddressValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (name != "" && name.length > 20) {
      form.clearErrors("0.name")
    }

    if (isPhoneNumberValid.test(phoneNumber)) {
      form.clearErrors("0.phoneNumber")
    }
    if (isEmailAddressValid.test(emailAddress)) {
      form.clearErrors("0.emailAddress")
    }
    if (instituteImageFile != null) {
      form.clearErrors("0.imageFile")
    }


  }, [name, phoneNumber, emailAddress, instituteImageFile, form])

  useEffect(() => {
    if (!window.initAutocomplete) {
      const newScript = document.createElement('script')
      newScript.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyB1is7HLgac9h6mbPmOpCpJcuHCfT_pmjo&callback=initAutocomplete&libraries=places&v=weekly"
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
                <h1 className="loginHeader" style={{alignSelf:"center", marginLeft: 'auto', marginRight: 'auto'}}>Add New Institute</h1>
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div className="mb-2 block">
                <Label htmlFor="name" value="Name " />
                <span style={{ color: "red" }}>*</span>
                <TextInput
                  type="text"
                  className="form-control"
                  id="name"
                  icon={FaUniversity}
                  placeholder="Tunku Abdul Rahman University of Management and Technology"
                  maxLength={100}
                  {...register("0.name", {
                    required: {
                      value: true,
                      message: "Name is required"
                    },
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
                <Label htmlFor="name" value="Location " />
                <span style={{ color: "red" }}>*</span>
                <TextInput
                  type="text"
                  id="location"
                  icon={ImLocation2}
                  required
                  autoComplete="off"
                  {...register("0.location", {
                    required: {
                      value: true,
                      message: "Location is required"
                    },
                  })}
                  onChange={(e) => setInstituteLocation(e.target.value)}
                />
                <p className="addInstituteValidationError">{errors[0]?.location?.message}</p>
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div className="mb-2 block">
                <Label htmlFor="phone" value="Phone Number " />
                <span style={{ color: "red" }}>*</span>
                <TextInput
                  type="tel"
                  className="form-control"
                  id="phoneNumber"
                  icon={BsFillTelephoneFill}
                  placeholder="03-41450123"
                  {...register("0.phoneNumber", {
                    required: {
                      value: true,
                      message: "Phone number is required"
                    },
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
                <Label htmlFor="email" value="Email Address " />
                <span style={{ color: "red" }}>*</span>
                <TextInput
                  type="tel"
                  className="form-control"
                  id="emailAddress"
                  icon={HiMail}
                  placeholder="info@tarc.edu.my"
                  {...register("0.emailAddress", {
                    required: {
                      value: true,
                      message: "Email address is required"
                    },
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
                  <Label htmlFor="file" value="Image " />
                  <span style={{ color: "red" }}>*</span>
                </div>
                <FileInput
                  className="form-control"
                  id="file"
                  {...register("0.imageFile", {
                    required: {
                      value: true,
                      message: "Image is required"
                    }
                  })}
                  onChange={(e) => { handleInstituteImageUpload(e) }}
                />
                <p className="addInstituteValidationError">{errors[0]?.imageFile?.message}</p>
                {instituteImageSizeError && <p className="addInstituteValidationError">{instituteImageSizeError}</p>}
                {instituteImageFormatError && <p className="addInstituteValidationError">{instituteImageFormatError}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Button onClick={handleSubmit(addInstitute)} style={{ fontSize: '24px' }}>Submit</Button>
            </div>
          </div>
        </div>
      </form >
    </div >
  )


}