'use client';
import { Button, Label, TextInput } from 'flowbite-react'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { HiMail } from 'react-icons/hi'
import { createUserWithEmailAndPassword, getAuth, sendEmailVerification } from 'firebase/auth';
import app from '../FirebaseConfig/firebaseConfig';
import { useRouter } from 'next/navigation';


type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const authRegister = getAuth(app);
  const form = useForm<[RegisterFormValues]>();
  const { register, handleSubmit, formState } = form;
  const { errors } = formState;
  const [email, setRegisterEmail] = useState("")
  const [password, setRegisterPassword] = useState("")
  const [confirmPassword, setRegisterConfirmPassword] = useState("")
  const router = useRouter();

  const validatePasswordMatch = (value: string, values: { password: string }) => {
    return value === values.password || "Passwords do not match";
  };

  const isRegisterEmailValid = /^(?=.{1,64}@)[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*@[^-][A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(\.[A-Za-z]{2,})$/;
  
  //if want have the color
  const getEmailColor = () => {
    if (errors[0]?.email) {
      return "failure";
    } else if (email) {
      return "success";
    } else {
      return "gray";
    }
  };

  useEffect(() => {
    const isPasswordValid = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const isEmailValid = /^(?=.{1,64}@)[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*@[^-][A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(\.[A-Za-z]{2,})$/;

    if (isEmailValid.test(email)) {
      form.clearErrors("0.email")
    }
    if (isPasswordValid.test(password)) {
      form.clearErrors("0.password")
    }
    if (password == confirmPassword) {
      form.clearErrors("0.confirmPassword")
    }

  }, [email, password, form]);

  const createAccount = (data: [RegisterFormValues]) => {
    console.log("Ok", data);
    createUserWithEmailAndPassword(authRegister, email, password)
    .then((userCredential) => {
      const user = userCredential.user
      sendEmailVerification(user)
      alert("Registered successfully. Please check your email address for verification")
      //Will decide where to go
      router.push("/login")
    })
    .catch((error) => {
      const errorCode = error.errorCode
      alert(errorCode)
    })
  }

  return (
    <form className="flex max-w-md flex-col gap-4" style={{ margin: '20px' }} onSubmit={handleSubmit(createAccount)} noValidate>
      <h1 className="registerHeader">Register</h1>
      <h1 className="registerDescription">Create an account and enjoy it</h1>
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
              value: isRegisterEmailValid,
              message: "Invalid email format. Follow the format: abc@gmail.com"
            }
          })}
          onChange={(e) => setRegisterEmail(e.target.value)}
          helperText={
            <>
              We'll never share your details. Read our
              <a href="#" className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                Privacy Policy
              </a>
              .
            </>
          }
        />
        <p className="registerValidationError">{errors[0]?.email?.message}</p>
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
            pattern: {
              value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              message: "Password must meet the criteria: at least 8 characters long including at least  one uppercase letter, one lowercase letter, one digit, and one special character"
            },
          })}
          onChange={(e) => setRegisterPassword(e.target.value)}
        />
        <p className="registerValidationError">{errors[0]?.password?.message}</p>
      </div>
      <div>
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
        />
        <p className="registerValidationError">{errors[0]?.confirmPassword?.message}</p>
      </div>
      <Button type="submit">Register</Button>
      <h2 className="haveAnAccountHeader">Have an account?
        <a href="/login" className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500">
          Login
        </a>
      </h2>
    </form>
  );
}

