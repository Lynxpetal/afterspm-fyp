'use client';
import { Button, Label, TextInput } from 'flowbite-react'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { AiOutlineUser } from 'react-icons/ai'

type addInstituteFormValues = {
  name: string;
  location: string;
  phoneNumber: string;
  emailAddress: string;
}

export default function InstituteAdmin() {
  const form = useForm<[addInstituteFormValues]>();
  const [name, setInstituteEmail] = useState("")
  const [location, setInstituteLocation] = useState("")
  const [phoneNumber, setInstitutePhoneNumber] = useState("")
  const [emailAddress, setInstituteEmailAddress] = useState("")
  const { register, handleSubmit, formState } = form
  const { errors } = formState

  const isInstituteNameValid = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/
  const isInstitutePhoneNumberValid = /^(0[0-9]-\d{7,8}|011-\d{8}|01[0-9]-\d{7})$/
  const isInstituteEmailAddressValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  const addInstitute = (data: [addInstituteFormValues]) => {

  }

  useEffect(() => {
    const isNameValid = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/
    const isPhoneNumberValid = /^(0[0-9]-\d{7,8}|011-\d{8}|01[0-9]-\d{7})$/
    const isEmailAddressValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (isNameValid.test(name)) {
      form.clearErrors("0.name")
    }
    if (location == "") {
      form.clearErrors("0.location")
    }
    if (isPhoneNumberValid.test(phoneNumber)) {
      form.clearErrors("0.phoneNumber")
    }

  }, [name, form])

  return (
    <form className="flex max-w-md flex-col gap-4" style={{ margin: '20px' }} onSubmit={handleSubmit(addInstitute)} noValidate>
      <h1 className="loginHeader">Add New Institute</h1>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="name" value="Name" />
        </div>
        <TextInput
          type="text"
          className="form-control"
          id="name"
          icon={AiOutlineUser}
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

      <div>
        <div className="mb-2 block">
          <Label htmlFor="location" value="Location" />
          <TextInput
            type="text"
            className="form-control"
            id="location"
            icon={AiOutlineUser}
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

      <div>
        <div className="mb-2 block">
          <Label htmlFor="phone" value="Phone Number" />
          <TextInput
            type="tel"
            className="form-control"
            id="phoneNumber"
            icon={AiOutlineUser}
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

      <div>
        <div className="mb-2 block">
          <Label htmlFor="email" value="Email Address" />
          <TextInput
            type="tel"
            className="form-control"
            id="emailAddress"
            icon={AiOutlineUser}
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

      <Button type="submit">Add</Button>
    </form>
  )
}