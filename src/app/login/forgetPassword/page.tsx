'use client';
import React from "react";
import { Button, Label, TextInput } from 'flowbite-react';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { HiMail } from 'react-icons/hi'
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from "firebase/auth";
import app, { auth } from '../../FirebaseConfig/firebaseConfig';

type ForgetPasswordFormValue = {
  email: string;
}

export default function ForgetPassword() {
  const form = useForm<[ForgetPasswordFormValue]>();
  const [email, setForgetPasswordEmail] = useState("")
  const { register, handleSubmit, formState } = form
  const { errors } = formState
  const router = useRouter()

  const isForgetPasswordEmailValid =  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  useEffect(() => {
    const isEmailValid =  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (isEmailValid.test(email)) {
      form.clearErrors("0.email")
    }

  }, [email, form]);

  const forgetPassword = () => {
    sendPasswordResetEmail(auth, email)
      .then(data => {
        alert("A password reset request has been send to your email.")
        router.push("/login")

      }).catch(error => {
        const errorCode = error.code
        alert(errorCode)
      })
  }

  return (
    <form className="flex max-w-md flex-col gap-4" style={{ margin: '20px' }} onSubmit={handleSubmit(forgetPassword)} noValidate>
      <h1 className="forgetPasswordHeader">Forgot Password</h1>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="email" value="Email address" />
        </div>
        <TextInput
          type="email"
          className="form-control"
          //color={getEmailColor()}
          id="email"
          icon={HiMail}
          placeholder="abc@gmail.com"
          {...register("0.email", {
            required: {
              value: true,
              message: "Email is required"
            },
            pattern: {
              value: isForgetPasswordEmailValid,
              message: "Invalid email format. Follow the format: abc@gmail.com"
            }
          })}
          onChange={(e) => setForgetPasswordEmail(e.target.value)}
        />
        <p className="forgetPasswordValidationError">{errors[0]?.email?.message}</p>
      </div>
      <Button type="submit">Reset</Button>
    </form >
  )
}