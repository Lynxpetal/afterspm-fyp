'use client'
import { Button } from 'flowbite-react'
import { useRouter } from 'next/navigation'

export default function privacyPolicy() {
  const router = useRouter()

  const handleBackToRegister = () => {
    router.push('/register')
  }

  return (
    <div>
      <form style={{ margin: '20px' }}>
        <div className="card" style={{ margin: '30px' }}>
          <div style={{ backgroundColor: "#EDFDFF", margin: '30px', padding: '30px', width: '75%' }}>
            <h1 style={{ color: "black" }}>
              This privacy policy will help you understand how AfterSPM Website uses and protects
              the data you provide to us when you visit and access AfterSPM Website.
              <br />
              <br />
              We reserve the right to change this policy at any given time, of which you will be
              promptly updated. If you want to make sure that you are up to date with the latest changes,
              we advise you to frequently visit this page.
              <h2 style={{ color: "black", fontWeight: "bold" }}>
                <br />
                What User Data We Collect
              </h2>
              <br />
              When you visit the website, we may collect the following data:
              <div>
                <br />
                <li>Your Email Address</li>
                <li>Your SPM Subject (if got)</li>
                <li>Your Home Address (if got)</li>
                <br />
              </div>
              <h2 style={{ color: "black", fontWeight: "bold" }}>
                Why We Collect Your Data
              </h2>
              <br />
              We are collecting your data for several reasons:
              <div>
                <br />
                <li>To send you emails containing the information we think you will find interesting</li>
                <li>To improve our services</li>
                <br />
              </div>
              <h2 style={{ color: "black", fontWeight: "bold" }}>
                Safeguarding and Securing the Data
              </h2>
              <br />
              AfterSPM is committed to securing your data and keeping it confidential.
              AfterSPM has done all in its power to prevent data theft, unauthorized
              access, and disclosure by implementing the latest technologies and
              software, which help us safeguard all the information we collect online.
              <h2 style={{ color: "black", fontWeight: "bold" }}>
                <br />
                Our Cookie Policy
              </h2>
              <br />
              Once you agree to allow our website to use cookies, you also agree to use the
              data it collects regarding your online behavior (analyze web traffic, web pages you
              visit and spend the most time on).
              <br />
              <br />
              The data we collect by using cookies is used to customize our website to your needs.
              After we use the data for statistical analysis, the data is completely removed from
              our systems.
              <br />
              <br />
              Please note that cookies don't allow us to gain control of your computer in any way.
              They are strictly used to monitor which pages you find useful and which you do not
              so that we can provide a better experience for you.
              <br />
              <br />
              If you want to disable cookies, you can do it by accessing the settings of your Internet
              browser. You can visit internetcookies.com, which contains comprehensive information on how
              to do this on a wide variery of browsers and devices.
              <br />
              <br />
            </h1>

            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '10px' }}>
              <Button onClick={handleBackToRegister}>Back</Button>
            </div>
          </div>
          
        </div>

      </form>
    </div>
  )
}