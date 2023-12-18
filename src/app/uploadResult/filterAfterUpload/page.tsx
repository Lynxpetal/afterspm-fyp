'use client'
import { Label, TextInput, Dropdown, Button, Timeline } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import { ImLocation2 } from 'react-icons/im'
import { instituteCollection } from '../../lib/controller'
import { DocumentData, QuerySnapshot, addDoc, collection, deleteDoc, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../FirebaseConfig/firebaseConfig'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { stringSimilarity } from "string-similarity-js"
import { FaFilter } from 'react-icons/fa'
import { GrDocumentUpload } from 'react-icons/gr'
import { MdOutlineRecommend } from 'react-icons/md'
import { useRouter } from 'next/navigation'
import MoonLoader from "react-spinners/MoonLoader"


declare global {
  interface Window {
    initAutocomplete: () => void
    initComputeDistance: () => void
  }
}

export default function FilterInstituteProgramme() {
  const [value, setValue] = React.useState<number[]>([6000, 30000])
  const [studyLevel, setStudyLevel] = useState("Diploma")
  const courseCategory = ["Accounting & Business", "Arts & Communication", "Aviation & Maritime",
    "Computer & Multimedia", "Education & Languages", "Engineering & Architecture",
    "Hospitality & Tourism", "Law & Humanities", "Maths, Sciences & Technology",
    "Medicine, Health & Sciences", "Pre-University", "Environmental & Marine"]
  const [programmeCategory, setProgrammeCategory] = useState(courseCategory[3])
  const [location, setLocation] = useState("")
  const [instituteList, setInstituteList] = useState<Record<string, string>>({})
  const [instituteLocationList, setInstituteLocationList] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [data, setData] = useState<Record<string, string>>({})
  const router = useRouter()
  const [filterDataReady, setFilterDataReady] = useState(false)


  //setValue([6000, 30000]) - set an array containing 2 number
  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number[])
  }

  //put ... to ensure that not directly modifying the state array
  const handleInputChange = (index: number, inputValue: string) => {
    const updatedValue = [...value]
    //value[0] = new input, value[1] = new input
    updatedValue[index] = parseInt(inputValue)
    setValue(updatedValue)
  }

  function getInstituteName(destination: string) {
    var similarityMeasure = 0
    var finalInstituteLocation: string | undefined

    console.log(destination)

    for (const instituteLocation of instituteLocationList) {
      if (stringSimilarity(destination, instituteLocation) > similarityMeasure) {
        console.log(destination)
        console.log(instituteLocation)
        similarityMeasure = stringSimilarity(destination, instituteLocation)
        console.log(similarityMeasure)
        finalInstituteLocation = instituteLocation
        console.log(finalInstituteLocation)
      }
    }

    return finalInstituteLocation ? instituteList[finalInstituteLocation] : undefined
  }

  const viewFilteredProgrammes = async () => {
    setFilterDataReady(true)
    if (location != "") {
      await initComputeDistance()
      console.log("Got location")
      const displayResult = [
        value[0],
        value[1],
        studyLevel,
        programmeCategory,
        userId,
        location
      ]


      postData('http://localhost:5000/finalFilter', { data: displayResult }, 'POST')
        .then(data => {
          console.log(data)
          console.log(data.length)
          router.push(`/uploadResult/viewFiltered?search=${encodeURIComponent(JSON.stringify(data))}`);
          setData(data)
          setFilterDataReady(false)
        })



    } else {
      console.log("Empty location")
      const displayResult = [
        value[0],
        value[1],
        studyLevel,
        programmeCategory,
        userId,
      ]


      postData('http://localhost:5000/finalFilter', { data: displayResult }, 'POST')
        .then(data => {
          console.log(data)
          router.push(`/uploadResult/viewFiltered?search=${encodeURIComponent(JSON.stringify(data))}`);
          setData(data)
          setFilterDataReady(false)
        })

    }



  }

  async function postData(url = "", data = {}, method = "POST") {
    const response = await fetch(url, {
      method: method,
      mode: "cors",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return response.json()
  }


  async function initComputeDistance(): Promise<void> {
    //initialize services
    const service = new google.maps.DistanceMatrixService()

    //build request
    const origin = location
    console.log("Ok")

    const request = {
      origins: [origin],
      destinations: instituteLocationList,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false,
    }

    await service.getDistanceMatrix(request).then(async (response) => {
      const results: string[] = [];

      response.originAddresses.forEach((origin, originIndex) => {
        response.destinationAddresses.forEach((destination, destinationIndex) => {
          const element = response.rows[originIndex].elements[destinationIndex]

          const result = {
            origin: origin,
            destination: destination,
            distance: element.distance.text,
            distanceInUnit: element.distance.value,
            duration: element.duration.text,
            status: element.status,
            user: userId,
            instituteName: getInstituteName(destination)
          };

          results.push(result)
        })
      })

      await deleteDistanceMatrixResults(userId)
      // Store results in Firebase
      await Promise.all(results.map(async (data) => {
        const docRef = await addDoc(collection(db, 'FilterDistanceMatrixResults'), data);
        console.log('Document written with ID: ', docRef.id)
      }))
    })


  }

  //delete document
  async function deleteDistanceMatrixResults(userId: string | null): Promise<void> {
    const q = query(collection(db, 'FilterDistanceMatrixResults'), where('user', '==', userId))
    const querySnapshot = await getDocs(q)
    const deletePromises = querySnapshot.docs.map(async (doc) => {
      await deleteDoc(doc.ref)
    })

    await Promise.all(deletePromises)

  }


  let autocomplete: google.maps.places.Autocomplete
  let locationField: HTMLInputElement

  //autocomplete address 
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

  //get address so that can store inside firebase
  function getAddress() {
    const place = autocomplete.getPlace()

    //check if place has valid address components
    if (place.address_components && place.address_components.length > 0) {
      const fullAddress = place.address_components.map((component) => component.long_name).join(', ')

      //contains the complete location details
      console.log(fullAddress)
      setLocation(fullAddress)
    }


  }

  //fetch institute data
  const fetchAllInstituteData = async () => {
    const q = query(instituteCollection, orderBy('InstituteLastUpdateTimestamp', 'desc'))

    onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const instituteDataDictionary: Record<string, string> = {}

      snapshot.docs.forEach(doc => {
        const instituteData = doc.data()
        const instituteName = instituteData.InstituteName
        const instituteLocation = instituteData.InstituteLocation

        instituteDataDictionary[instituteLocation] = instituteName
      })

      console.log(instituteDataDictionary)
      setInstituteList(instituteDataDictionary)

      //store location
      setInstituteLocationList(Object.keys(instituteDataDictionary))
    });
  }

  useEffect(() => {
    if (!window.initAutocomplete) {
      const newScript = document.createElement('script');
      newScript.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyB1is7HLgac9h6mbPmOpCpJcuHCfT_pmjo&callback=initAutocomplete&libraries=places&v=weekly"
      newScript.async = true
      newScript.defer = true

      //define onLoad callback
      newScript.onload = () => {
        window.initComputeDistance = initComputeDistance
        window.initAutocomplete = initAutocomplete
      }

      //append script to document
      document.head.appendChild(newScript)

    } else {
      initAutocomplete()
      initComputeDistance()
    }

    return () => {
      //cleanup code if needed
    }

  }, [])

  useEffect(() => {
    fetchAllInstituteData()
  }, [])


  useEffect(() => {
    const auth = getAuth()
    onAuthStateChanged(auth, (user) => {
      if (user) {

        const uid = user.uid
        setUserId(uid)
        console.log(uid)
        console.log(userId)

      } else {
        setUserId(null)
        console.log(userId)
      }
    })
  }, [userId])

  if (filterDataReady)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="card p-3 m-3 flex justify-center items-center">
          <div className="grid">
            <MoonLoader
              loading={filterDataReady}
              size={50}
              color="#8DD3E2"
            />
            <h1 style={{ color: "black" }}>Matching data provided with all programmes in database...</h1>
          </div>
        </div>
      </div>
    )
  return (
    <div className="flex justify-center items-center">
      <div className="card w-full p-3 m-3 flex justify-center items-center">
        <div className='p-3 m-3 bg-slate-100 w-[70%]' style={{ padding: "30px" }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Timeline horizontal>
              <Timeline.Item>
                <Timeline.Point icon={GrDocumentUpload} />
                <Timeline.Content>
                  <Timeline.Title>Step 1</Timeline.Title>
                  <Timeline.Body>
                    Upload SPM Result
                  </Timeline.Body>
                </Timeline.Content>
              </Timeline.Item>
              <Timeline.Item style={{ margin: '0 auto' }}>
                <Timeline.Point icon={FaFilter} />
                <Timeline.Content>
                  <Timeline.Title>Step 2</Timeline.Title>
                  <Timeline.Body style={{ color: 'black', fontWeight: "bold" }}>
                    Filter Institute and Programme
                  </Timeline.Body>
                </Timeline.Content>
              </Timeline.Item>
              <Timeline.Item style={{ marginLeft: 'auto' }}>
                <Timeline.Point icon={MdOutlineRecommend} />
                <Timeline.Content>
                  <Timeline.Title>Step 3</Timeline.Title>
                  <Timeline.Body>
                    View Filtered Programmes
                  </Timeline.Body>
                </Timeline.Content>
              </Timeline.Item>
            </Timeline>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Label htmlFor="name" value="Price Range" style={{ fontSize: "16px", marginBottom: "5px", paddingBottom: "10px" }} />
            <div style={{ display: 'flex' }}>
              <Box sx={{ width: 800 }}>
                <Slider
                  min={0}
                  max={50000}
                  value={value}
                  onChange={handleChange}
                  valueLabelDisplay="auto"
                />

                <div style={{ display: 'flex', marginBottom: "20px" }}>
                  <div style={{ marginRight: "60px" }}>
                    <Label htmlFor="minimumPrice" value="Minimum Price" />
                    <TextInput
                      type="number"
                      className="form-control"
                      id="name"
                      value={value[0]}
                      onChange={(e) => handleInputChange(0, e.target.value)}
                      style={{ width: "360px" }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maximumPrice" value="Maximum Price" />
                    <TextInput
                      type="number"
                      className="form-control"
                      id="name"
                      value={value[1]}
                      onChange={(e) => handleInputChange(1, e.target.value)}
                      style={{ width: "360px" }}
                    />
                  </div>
                </div>
              </Box>
            </div>
          </div>

          <div style={{ paddingBottom: '20px' }}>
            <div className="mb-2 block">
              <Label htmlFor="name" value="Course Category" style={{ fontSize: "16px", marginBottom: "5px" }} />
            </div>
            <Dropdown
              label={programmeCategory}
              style={{ backgroundColor: "#FFFFFF", color: "black", width: "100%", border: "1px solid #ced4da", borderRadius: "0.50rem" }}
              placement="bottom"
            >
              {courseCategory.map((name) => (
                <Dropdown.Item key={name} onClick={() => setProgrammeCategory(name)}>{name}</Dropdown.Item>
              ))}
            </Dropdown>
          </div>

          <div style={{ paddingBottom: '20px' }}>
            <div className="mb-2 block">
              <Label htmlFor="name" value="Study Level " style={{ fontSize: "16px", marginBottom: "5px" }} />
            </div>
            <Dropdown
              label={studyLevel}
              dismissOnClick={true}
              style={{ backgroundColor: "#FFFFFF", color: "black", width: "100%", border: "1px solid #ced4da", borderRadius: "0.50rem" }}
              placement="bottom">
              <Dropdown.Item onClick={() => setStudyLevel('Foundation')}>Foundation</Dropdown.Item>
              <Dropdown.Item onClick={() => setStudyLevel('Diploma')}>Diploma</Dropdown.Item>
            </Dropdown>
          </div>


          <div style={{ paddingBottom: '20px' }}>
            <div className="mb-2 block" style={{ color: "black" }}>
              <Label htmlFor="name" value="Home Location " style={{ fontSize: "16px", marginBottom: "5px" }} />
            </div>
            <TextInput
              type="text"
              id="location"
              icon={ImLocation2}
              required
              autoComplete="off"
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>


          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '10px' }}>
            <Button onClick={viewFilteredProgrammes}>
              Next
            </Button>
          </div>



        </div>
      </div>
    </div>
  )
}
