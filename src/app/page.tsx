import Image from 'next/image'
import Link from 'next/link'
import { HiOutlineArrowRight } from 'react-icons/hi'
import Banner from "../../public/29493.jpg"

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen ">
      <div className="p-2 m-2 bg-slate-100 flex flex-col items-center justify-center">
        <legend className=" text-3xl font-bold antialiased pl-20 p-4 m-3 w-full bg-slate-300">
          AfterSPM
        </legend>
        <div className=' bg-slate-50 w-full p-3 m-2' style={{color: "black"}}>
          <p className=' font-semibold text-lg'>Find your dream career & the perfect path, powered by AI.</p>
          <div className=' font-medium text-md'>
            Feeling lost in a sea of career options? Worry not, future-focused student! Our AI-powered platform is your ultimate compass, guiding you towards a fulfilling career and the courses that pave the way.
            <br />
            Uncover your hidden potential:
            <ul className='list-disc pl-9'>
              <li>Take our personalized psychology test and get tailored reccomendations of careers powered by AI that match your unique profile.</li>
              <li>Talk to our AI powered chatbot for a more insightful view into your career selection</li>
              <li>Choose institutes based on your needs without hassle with our filtering system</li>
            </ul>
            <br />
            Ready to chart your course to success? Start your journey today and find your perfect career match!
          </div>
        </div>
        <div className=' flex bg-slate-200 w-full p-3 m-2 items-center justify-center'>
          <Link className='bg-teal-500 text-gray-50 rounded-xl m-2 p-3 w-auto flex flex-row hover:bg-teal-700' href='/login'>
            Log In to access our features now!
            <HiOutlineArrowRight className="ml-2 mt-1 h-5 w-5" />
          </Link>
        </div>
        <Image src={Banner} alt="Image" style={{width: "100%", height: "50%"}} className='justify-center items-center p-3'/>
      </div>
    </main>
  )
}
