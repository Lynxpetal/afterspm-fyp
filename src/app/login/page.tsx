'use client'
import { Button, Label, TextInput, Alert } from 'flowbite-react'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import app from '../FirebaseConfig/firebaseConfig'
import { auth } from '../FirebaseConfig/firebaseConfig'
import { useRouter } from 'next/navigation'
import { useAuthState } from "react-firebase-hooks/auth"
import { HiMail } from 'react-icons/hi'
import { HiInformationCircle } from 'react-icons/hi'
import Swal from 'sweetalert2'


type LoginFormValues = {
  email: string
  password: string
}

export default function Login() {
  const form = useForm<[LoginFormValues]>()
  const [email, setLoginEmail] = useState("")
  const [password, setLoginPassword] = useState("")
  const { register, handleSubmit, formState } = form
  const { errors } = formState
  const [failureVerifyEmailAlert, setFailureVerifyEmailAlert] = useState(false)
  const router = useRouter()

  //Option 1 - input (email & password)
  const authLogin = getAuth(app)

  //Option 2 - Sign in with Google
  const [user, loading] = useAuthState(auth)
  const googleProvider = new GoogleAuthProvider()

  const SignInBtnClickHandler = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider)
      alert("Successfully logged in")
    } catch (err) {
      alert("Authentication Failed")
    }
  }

  const loginAccount = (data: [LoginFormValues]) => {
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
        signInWithEmailAndPassword(authLogin, email, password)
          .then((userCredential) => {
            const user = userCredential.user
            if (user.emailVerified) {
              setFailureVerifyEmailAlert(false)
              Swal.fire({
                title: "Great!",
                text: "You have successfully signed in",
                icon: "success"
              })
            }
            else {
              setFailureVerifyEmailAlert(true)
            }

          })
          .catch((error) => {
            const errorCode = error.code
            if (errorCode == "auth/invalid-login-credentials") {
              setFailureVerifyEmailAlert(false)
              form.setError("0.password", {
                type: "manual",
                message: "Incorrect password. Please try again.",
              })
            } else {
              setFailureVerifyEmailAlert(false)
              //alert(errorCode)
            }
          })
      }
    })


  }

  const isLoginEmailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  useEffect(() => {
    const isEmailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (isEmailValid.test(email)) {
      form.clearErrors("0.email")
    }
    if (password != '') {
      form.clearErrors("0.password")

    }


  }, [email, password, form])



  return (
    <form style={{ margin: '20px' }} onSubmit={handleSubmit(loginAccount)} noValidate>
      <div className="card" style={{ margin: '30px' }}>
        <div style={{ backgroundColor: "#EDFDFF", margin: '30px', padding: '30px', width: '50%' }}>
          {failureVerifyEmailAlert && (
            <Alert color="failure" icon={HiInformationCircle} onDismiss={() => setFailureVerifyEmailAlert(false)}>
              <span className="font-medium">Info alert!</span> Please verify your email address: <h1>{email}</h1>
            </Alert>
          )}
          <h1 className="loginHeader">Welcome Back</h1>
          <h1 className="loginDescription">Welcome Back! Plese enter your details</h1>

          <div style={{ paddingBottom: '20px' }}>
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
                  value: isLoginEmailValid,
                  message: "Invalid email format. Follow the format: abc@gmail.com"
                }
              })}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <p className="loginValidationError">{errors[0]?.email?.message}</p>
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
              })}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <p className="loginValidationError">{errors[0]?.password?.message}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '10px' }}>
            <Button type="submit">Login</Button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '10px' }}>
            <Button onClick={SignInBtnClickHandler}> Login With Google</Button>
          </div>

          <p className='loginToRegisterHeader'>Don't have an account?
            <a href="/register" className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500">
              Register
            </a>
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '10px' }}>
            <a href="/login/forgetPassword" className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500" style={{ textAlign: 'center' }}>
              Forgot Password?
            </a>
          </div>



        </div>
      </div>
    </form>
  )
}

