'use client';
import { Button, Label, TextInput, FileInput, Toast, Kbd } from 'flowbite-react'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { BiSolidUser } from 'react-icons/bi'
import { ImLocation2 } from 'react-icons/im'
import { BsFillTelephoneFill } from 'react-icons/bs'
import { HiMail } from 'react-icons/hi'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { v4 } from "uuid"
import { storage } from '@/app/FirebaseConfig/firebaseConfig'
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from '@/app/FirebaseConfig/firebaseConfig'
import { useRouter } from 'next/navigation'
import { HiCheck } from 'react-icons/hi'
import Link from 'next/link'
import { AiOutlineClose } from 'react-icons/ai'


type addInstituteFormValues = {
  name: string;
  location: string;
  phoneNumber: string;
  emailAddress: string;
  imageFile: File;
}

export default function InstituteAdmin() {
  const form = useForm<[addInstituteFormValues]>();
  const [name, setInstituteEmail] = useState("")
  const [location, setInstituteLocation] = useState("")
  const [phoneNumber, setInstitutePhoneNumber] = useState("")
  const [emailAddress, setInstituteEmailAddress] = useState("")
  const [instituteImageFile, setInstituteImageFile] = useState<File | null>(null);
  const [instituteImageSizeError, setInstituteImageSizeError] = useState("")
  const [instituteImageFormatError, setInstituteImageFormatError] = useState("")
  const [instituteImageFilePath, setInstituteImageFilePath] = useState("")
  const [instituteImageFileUrl, setInstituteImageFileUrl] = useState("")
  const { register, handleSubmit, formState } = form
  const { errors } = formState
  const [addSuccessfulStatus, setAddSuccessfulStatus] = useState(false)
  const router = useRouter();

  const isInstituteNameValid = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/
  const isInstitutePhoneNumberValid = /^(0[0-9]-\d{7,8}|011-\d{8}|01[02-9]-\d{7})$/
  const isInstituteEmailAddressValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/


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

  //add  inside storage
  //retrieve the image url so that can store inside firestore
  const addInstitute = async (data: [addInstituteFormValues]) => {
    try {
      if (instituteImageFile) {
        const instituteImageRef = ref(storage, `InstituteImage/${v4()}`)
        const instituteData = await uploadBytes(instituteImageRef, instituteImageFile)
        const instituteUrlVal = await getDownloadURL(instituteData.ref)

        console.log(instituteUrlVal)
        setInstituteImageFileUrl(instituteUrlVal)

        console.log(instituteData.metadata.name)
        setInstituteImageFilePath(instituteData.metadata.name)

        const addedInstituteData = await addRegisterInstituteDataToFirestore(
          name,
          location,
          phoneNumber,
          emailAddress,
          instituteData.metadata.name,
          instituteUrlVal
        )

        if (addedInstituteData) {
          setAddSuccessfulStatus(true)
        }

      }
      else {
        console.error("Image file is null. Unable to upload")
      }

    } catch (error) {
      console.error("Error handling institute click", error)
    }
  }

  async function addRegisterInstituteDataToFirestore(name: string, location: string, phoneNumber: string, emailAddress: string, imagePath: string, imageUrl: string) {
    try {
      // collection - Institute
      const instituteDocRef = await addDoc(collection(db, "Institute"), {
        InstituteName: name,
        InstituteLocation: location,
        InstitutePhoneNumber: phoneNumber,
        InstituteEmailAddress: emailAddress,
        InstituteImagePath: imagePath,
        InstituteImageUrl: imageUrl,
        InstituteLastUpdateTimestamp: serverTimestamp(),
      });
      console.log("Document written with ID: ", instituteDocRef.id)
      return true
    } catch (error) {
      console.error("Error adding document", error)
      return false
    }
  }

  useEffect(() => {
    const isNameValid = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/
    const isPhoneNumberValid = /^(0[0-9]-\d{7,8}|011-\d{8}|01[02-9]-\d{7})$/
    const isEmailAddressValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (isNameValid.test(name) && name.length >= 20) {
      form.clearErrors("0.name")
    }
    if (location.length >= 25) {
      form.clearErrors("0.location")
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


  }, [name, location, phoneNumber, emailAddress, instituteImageFile, form])

  return (
    <div>
      {addSuccessfulStatus && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1000 }}>
          {/* Overlay to cover the entire screen */}
        </div>
      )}
      {addSuccessfulStatus && (
        <Toast style={{ position: "fixed", top: "5%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1001 }}>
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
            <HiCheck className="h-5 w-5" />
          </div>
          <div className="ml-3 text-sm font-normal">Data added successfully.</div>
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
                <h1 className="loginHeader">Add New Institute</h1>
                <div>
                  <Kbd icon={HiCheck} onClick={handleSubmit(addInstitute)} style={{ fontSize: '24px', backgroundColor: 'transparent', border: 'none' }} />
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
                  placeholder="Tunku Abdul Rahman University of Management and Technology"
                  {...register("0.name", {
                    required: {
                      value: true,
                      message: "Name is required"
                    },
                    minLength: {
                      value: 20,
                      message: "At least 20 characters long"
                    },
                    pattern: {
                      value: isInstituteNameValid,
                      message: "Invalid institute name"
                    }
                  })}
                  onChange={(e) => setInstituteEmail(e.target.value)}
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
                  placeholder="Ground Floor, Bangunan Tan Sri Khaw Kai Boh (Block A), Jalan Genting Kelang, Setapak, 53300 Kuala Lumpur, Federal Territory of Kuala Lumpur"
                  {...register("0.location", {
                    required: {
                      value: true,
                      message: "Location is required"
                    },
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
                <Label htmlFor="email" value="Email Address" />
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
                  <Label htmlFor="file" value="Image" />
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
          </div>
        </div>
      </form>
    </div>
  )


}