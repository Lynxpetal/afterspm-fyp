'use client';
import { Button, Label, TextInput } from 'flowbite-react';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import app from '../FirebaseConfig/firebaseConfig';
import { auth } from '../FirebaseConfig/firebaseConfig';
import { useRouter } from 'next/navigation';
import { useAuthState } from "react-firebase-hooks/auth"
import { HiMail } from 'react-icons/hi'


type LoginFormValues = {
  email: string;
  password: string;
}

export default function Login() {
  const form = useForm<[LoginFormValues]>();
  const [email, setLoginEmail] = useState("")
  const [password, setLoginPassword] = useState("")
  const { register, handleSubmit, formState } = form
  const { errors } = formState
  const router = useRouter();

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
    signInWithEmailAndPassword(authLogin, email, password)
      .then((userCredential) => {
        const user = userCredential.user
        if (user.emailVerified) {
          //router.push("/login")
          alert("This user has successfully signed in")
        }
        else {
          alert("Please verify your email address")
        }

      })
      .catch((error) => {
        const errorCode = error.code
        if (errorCode == "auth/invalid-login-credentials") {
          form.setError("0.password", {
            type: "manual",
            message: "Incorrect password. Please try again.",
          });
        } else {
          alert(errorCode);
        }
      })

    setLoginEmail("")
    setLoginPassword("")
  }

  const isLoginEmailValid = /^(?=.{1,64}@)[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*@[^-][A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(\.[A-Za-z]{2,})$/;

  useEffect(() => {
    const isEmailValid = /^(?=.{1,64}@)[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*@[^-][A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(\.[A-Za-z]{2,})$/;

    if (isEmailValid.test(email)) {
      form.clearErrors("0.email")
    }
    if (password != '') {
      form.clearErrors("0.password")
    }


  }, [email, password, form]);



  return (
    <form className="flex max-w-md flex-col gap-4" style={{ margin: '20px' }} onSubmit={handleSubmit(loginAccount)} noValidate>
      <h1 className="loginHeader">Welcome Back</h1>
      <h1 className="loginDescription">Welcome Back! Plese enter your details</h1>
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
              value: isLoginEmailValid,
              message: "Invalid email format. Follow the format: abc@gmail.com"
            }
          })}
          onChange={(e) => setLoginEmail(e.target.value)}
        />
        <p className="loginValidationError">{errors[0]?.email?.message}</p>
      </div>
      <div>
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
      <Button type="submit">Login</Button>
      <Button onClick={SignInBtnClickHandler}>Login With Google</Button>
      <p className='loginToRegisterHeader'>Don't have an account?
        <a href="/register" className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500">
          Register
        </a>
      </p>
      <a href="/forgetPassword" className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500" style={{ textAlign: 'center' }}>
        Forgot Password?
      </a>
    </form>
  );
}

