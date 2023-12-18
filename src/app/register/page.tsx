'use client'
import { Button, Label, TextInput, Alert } from 'flowbite-react'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { HiMail } from 'react-icons/hi'
import { createUserWithEmailAndPassword, getAuth, sendEmailVerification } from 'firebase/auth'
import app from '../FirebaseConfig/firebaseConfig'
import { useRouter } from 'next/navigation'
import { HiInformationCircle } from 'react-icons/hi'
import Swal from 'sweetalert2'
import Link from 'next/link'


type RegisterFormValues = {
  email: string
  password: string
  confirmPassword: string
}

export default function Register() {
  const authRegister = getAuth(app)
  const form = useForm<[RegisterFormValues]>()
  const { register, handleSubmit, formState } = form
  const { errors } = formState
  const [email, setRegisterEmail] = useState("")
  const [password, setRegisterPassword] = useState("")
  const [confirmPassword, setRegisterConfirmPassword] = useState("")
  const router = useRouter()
  const [errorAlert, setErrorAlert] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const validatePasswordMatch = (value: string, values: { password: string }) => {
    return value === values.password || "Passwords do not match"
  }

  const isRegisterEmailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  useEffect(() => {
    const isPasswordValid = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    const isEmailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (isEmailValid.test(email)) {
      form.clearErrors("0.email")
    }
    if (isPasswordValid.test(password)) {
      form.clearErrors("0.password")
    }
    if (password == confirmPassword) {
      form.clearErrors("0.confirmPassword")
    }

  }, [email, password, form])

  const createAccount = (data: [RegisterFormValues]) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Double confirm that information is correctly entered",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes"
    }).then((result) => {
      if (result.isConfirmed) {
        setErrorMsg("")
        setErrorAlert(false)
        console.log("Ok", data)
        createUserWithEmailAndPassword(authRegister, email, password)
          .then((userCredential) => {
            const user = userCredential.user
            sendEmailVerification(user)
            //Will decide where to go
            Swal.fire({
              title: "Great!",
              text: "Login using registered email and password to access system features",
              icon: "success"
            })
            router.push("/login")
          })
          .catch((error) => {
            const errorCode = error.errorCode
            setErrorAlert(true)
            setErrorMsg(errorCode)
          })
      }
    })

  }

  return (
    <form style={{ margin: '20px' }} onSubmit={handleSubmit(createAccount)} className="flex justify-center items-center" noValidate>
      <div className="card w-full p-3 m-3 flex justify-center items-center" style={{ margin: '30px' }}>
        <div className='p-3 m-3 bg-slate-100 w-[60%]'>
          <div>
            {errorAlert && (
              <Alert color="failure" icon={HiInformationCircle} onDismiss={() => setErrorAlert(false)}>
                <span className="font-medium">Info alert!</span> Error! This email address has been previously registered.
              </Alert>
            )}
          </div>
          <div className="registerHeader">Register</div>
          <div className="registerDescription">Create an account and enjoy it</div>
          <br />
          <div style={{ paddingBottom: '20px' }}>
            <div className="mb-2 block">
              <Label htmlFor="email" value="Email address" />
            </div>
            <TextInput
              type="email"
              className="form-control"
              id="email"
              icon={HiMail}
              placeholder="abc@gmail.com"
              {...register("0.email", {
                required: {
                  value: true,
                  message: "Email is required"
                },
                pattern: {
                  value: isRegisterEmailValid,
                  message: "Invalid email format. Follow the format: abc@gmail.com"
                }
              })}
              onChange={(e) => setRegisterEmail(e.target.value)}
              helperText={
                <>
                  "Follow the format: abc@gmail.com"
                  We’ll never share your details. Read our
                  <a href="#" className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                    Privacy Policy
                  </a>
                </>
              }
            />
            <div className="registerValidationError">{errors[0]?.email?.message}</div>
          </div>

          <div style={{ paddingBottom: '20px' }}>
            <div className="mb-2 block">
              <Label htmlFor="password" value="Password" />
            </div>
            <TextInput
              type="password"
              className="form-control"
              id="password"
              placeholder="*******"
              autoComplete='off'
              {...register('0.password', {
                required: {
                  value: true,
                  message: "Password is required"
                },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: "Password must meet the criteria: at least 8 characters long including at least  one uppercase letter, one lowercase letter, one digit, and one special character"
                },
              })}
              onChange={(e) => setRegisterPassword(e.target.value)}
              helperText={
                <>
                  "Password must meet the criteria: at least 8 characters long including at least  one uppercase letter, one lowercase letter, one digit, and one special character"
                </>}
            />
            <div className="registerValidationError">{errors[0]?.password?.message}</div>
          </div>

          <div style={{ paddingBottom: '20px' }}>
            <div className="mb-2 block">
              <Label htmlFor="confirmPassword" value="Confirm password" />
            </div>
            <TextInput
              type="password"
              className="form-control"
              id="confirmPassword"
              placeholder="*******"
              autoComplete='off'
              {...register('0.confirmPassword', {
                required: {
                  value: true,
                  message: "Confirm password is required"
                },
                validate: {
                  passwordMatch: (value) => validatePasswordMatch(value, { password }),
                },
              })}
              onChange={(e) => setRegisterConfirmPassword(e.target.value)}
              onPaste={(e) => e.preventDefault()}
            />
            <div className="registerValidationError">{errors[0]?.confirmPassword?.message}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '10px' }}>
            <Button type="submit">Register</Button>
          </div>

          <div className="haveAnAccountHeader">Have an account?
            <Link href="/login" className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500">
              Login
            </Link>
          </div>
        </div>
      </div>
    </form>
  )
}

