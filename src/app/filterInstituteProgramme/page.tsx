'use client'
import { Label, Pagination, TextInput, Dropdown, Button } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import { ImLocation2 } from 'react-icons/im'
import { distanceMatrixResultCollection, instituteCollection, programmeCollection } from '../lib/controller'
import { DocumentData, QuerySnapshot, addDoc, collection, deleteDoc, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../FirebaseConfig/firebaseConfig'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { stringSimilarity } from "string-similarity-js"


declare global {
  interface Window {
    initAutocomplete: () => void
    initComputeDistance: () => void
  }
}

type programme = {
  instituteName: string
  programmeCategory: string
  programmeName: string
  programmePrice: number
  programmeStudyLevel: string
  programmeDuration: number
}

type distance = {
  distance: string
  duration: string
  origin: string
  destination: string
  instituteName: string
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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalData, setTotalData] = useState(0)
  const [programmeFilter, setProgrammeFilter] = useState<programme[]>([])
  const [instituteImageUrlList, setInstituteImageUrlList] = useState<Record<string, string>>({})

  const cardsPerPage = 3
  const onPageChange = (page: number) => setCurrentPage(page)

  const getProgramsForCurrentPage = () => {
    const startIndex = (currentPage - 1) * cardsPerPage
    const endIndex = startIndex + cardsPerPage
    return programmeFilter.slice(startIndex, endIndex)
  }

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

  const executeFilter = async () => {
    if (location != "") {
      await initComputeDistance()
      console.log("DW")
      try {
        const distanceFilter = query(distanceMatrixResultCollection,
          orderBy('distanceInUnit'),
          where('user', '==', userId))
        const distanceSnapshot = await getDocs(distanceFilter)
        console.log(distanceSnapshot.docs.map(doc => doc.data()))

        const sortedInstitutes = distanceSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            distance: data.distance,
            duration: data.duration,
            origin: data.origin,
            destination: data.destination,
            instituteName: data.instituteName
          }
        })

        console.log(value[0])
        console.log(value[1])
        console.log(studyLevel)
        console.log(programmeCategory)

        const allProgrammeDataPromises = sortedInstitutes.map((institute) => {
          return new Promise((resolve, reject) => {
            const queryFilter = query(programmeCollection,
              where('ProgrammePrice', '>=', value[0]),
              where('ProgrammePrice', '<=', value[1]),
              where('ProgrammeStudyLevel', '==', studyLevel),
              where('ProgrammeCategory', '==', programmeCategory),
              where('InstituteName', '==', institute.instituteName)
            )

            onSnapshot(queryFilter, (snapshot: QuerySnapshot<DocumentData>) => {
              const programmeData: programme[] = []
              snapshot.forEach((doc) => {
                const data = doc.data()
                const programme: programme = {
                  instituteName: data.InstituteName,
                  programmeCategory: data.ProgrammeCategory,
                  programmeName: data.ProgrammeName,
                  programmePrice: data.ProgrammePrice,
                  programmeStudyLevel: data.ProgrammeStudyLevel,
                  programmeDuration: data.ProgrammeDuration,
                }

                programmeData.push(programme)
              })

              //mean programmeData is ready
              resolve(programmeData)
            })
          })
        })

        const allProgrammeData = await Promise.all(allProgrammeDataPromises)
        const mergeAllArray = [].concat(...allProgrammeData)
        console.log(mergeAllArray)
        setProgrammeFilter(mergeAllArray)
        setTotalData(mergeAllArray.length)
        setTotalPages(Math.ceil(mergeAllArray.length / cardsPerPage))


      } catch (error) {
        console.error("Error fetching initial data:", error)
      }

    } else {
      console.log("DW2")
      console.log(value[0])
      console.log(value[1])
      console.log(studyLevel)
      console.log(programmeCategory)

      const queryWithoutLocationFilter = query(programmeCollection,
        where('ProgrammePrice', '>=', value[0]),
        where('ProgrammePrice', '<=', value[1]),
        where('ProgrammeStudyLevel', '==', studyLevel),
        where('ProgrammeCategory', '==', programmeCategory)
      )

      const getData = async () => {
        const snapshotA = await getDocs(queryWithoutLocationFilter)

        const programmeWithoutLocationData: programme[] = []
        snapshotA.forEach((doc) => {
          const data = doc.data()
          if (data) {
            const programmeA: programme = {
              instituteName: data.InstituteName,
              programmeCategory: data.ProgrammeCategory,
              programmeName: data.ProgrammeName,
              programmePrice: data.ProgrammePrice,
              programmeStudyLevel: data.ProgrammeStudyLevel,
              programmeDuration: data.ProgrammeDuration
            }

            programmeWithoutLocationData.push(programmeA)
          }
        })

        console.log(programmeWithoutLocationData)
        console.log("Safe")
        setProgrammeFilter(programmeWithoutLocationData)
        setTotalData(programmeWithoutLocationData.length)
        setTotalPages(Math.ceil(programmeWithoutLocationData.length / cardsPerPage))
      }

      getData()

      
    }
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
      const results: string[] = []

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
          }

          results.push(result)
        })
      })

      await deleteDistanceMatrixResults(userId)
      // Store results in Firebase
      await Promise.all(results.map(async (data) => {
        const docRef = await addDoc(collection(db, 'DistanceMatrixResults'), data)
        console.log('Document written with ID: ', docRef.id)
      }))
    })


  }

  //delete document
  async function deleteDistanceMatrixResults(userId: string | null): Promise<void> {
    const q = query(collection(db, 'DistanceMatrixResults'), where('user', '==', userId))
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
      const instituteImageDictionary: Record<string, string> = {}

      snapshot.docs.forEach(doc => {
        const instituteData = doc.data()
        const instituteName = instituteData.InstituteName
        const instituteLocation = instituteData.InstituteLocation
        const instituteImage = instituteData.InstituteImageUrl

        instituteDataDictionary[instituteLocation] = instituteName
        instituteImageDictionary[instituteName] = instituteImage
      })

      console.log(instituteDataDictionary)
      setInstituteList(instituteDataDictionary)
      setInstituteImageUrlList(instituteImageDictionary)

      //store location
      setInstituteLocationList(Object.keys(instituteDataDictionary))
    })
  }

  function getState(location: string): string | undefined {
    if (location.toLowerCase().includes("selangor")) {
      return "Selangor"
    }
    else if (location.toLowerCase().includes("johor")) {
      return "Johor"
    }
    else if (location.toLowerCase().includes("kelantan")) {
      return "Kelantan"
    }
    else if (location.toLowerCase().includes("melaka")) {
      return "Melaka"
    }
    else if (location.toLowerCase().includes("negeri sembilan")) {
      return "Negeri Sembilan"
    }
    else if (location.toLowerCase().includes("pahang")) {
      return "pahang"
    }
    else if (location.toLowerCase().includes("penang")) {
      return "penang"
    }
    else if (location.toLowerCase().includes("perak")) {
      return "Perak"
    }
    else if (location.toLowerCase().includes("perlis")) {
      return "Perlis"
    }
    else if (location.toLowerCase().includes("sabah")) {
      return "Sabah"
    }
    else if (location.toLowerCase().includes("sarawak")) {
      return "Sarawak"
    }
    else if (location.toLowerCase().includes("terengganu")) {
      return "Terengganu"
    }
    else if (location.toLowerCase().includes("labuan")) {
      return "Labuan"
    }
    else if (location.toLowerCase().includes("putrajaya")) {
      return "Putrajaya"
    }
    else {
      return "Kuala Lumpur"
    }

  }

  function getInstituteState(name: string): string | undefined {
    for (const [location, instituteName] of Object.entries(instituteList)) {
      if (instituteName == name) {
        return getState(location)
      }
    }

    //if no match found
    return undefined

  }

  function getImage(name: string): string | undefined {
    for (const [instituteName, imageUrl] of Object.entries(instituteImageUrlList)) {
      if (instituteName == name) {
        return imageUrl
      }
    }

    //if no match found
    return undefined

  }

  useEffect(() => {
    if (!window.initAutocomplete) {
      const newScript = document.createElement('script')
      //newScript.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD1VHOjqeJLkei_MrpViqAsfADYp0Q3QSs&callback=initAutocomplete&libraries=places&v=weekly"
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
    const initialQuery = query(programmeCollection,
      where('ProgrammePrice', '>=', value[0]),
      where('ProgrammePrice', '<=', value[1]),
      where('ProgrammeStudyLevel', '==', studyLevel),
      where('ProgrammeCategory', '==', programmeCategory)
    )

    const getData = async () => {
      const snapshotB = await getDocs(initialQuery)

      const programmeInitialWithoutLocationData: programme[] = []
      snapshotB.forEach((doc) => {
        const data = doc.data()
        if (data) {
          const programmeA: programme = {
            instituteName: data.InstituteName,
            programmeCategory: data.ProgrammeCategory,
            programmeName: data.ProgrammeName,
            programmePrice: data.ProgrammePrice,
            programmeStudyLevel: data.ProgrammeStudyLevel,
            programmeDuration: data.ProgrammeDuration
          }

          programmeInitialWithoutLocationData.push(programmeA)
        }
      })

      console.log(programmeInitialWithoutLocationData)
      console.log("First initial")
      setProgrammeFilter(programmeInitialWithoutLocationData)
      setTotalData(programmeInitialWithoutLocationData.length)
      setTotalPages(Math.ceil(programmeInitialWithoutLocationData.length / cardsPerPage))
    }

    getData()
  }, [])

  // useEffect(() => {
  //   initComputeDistance()
  // }, [location])

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

  return (
    <div className={"flex min-h-screen "}>
      <div className="flex-1 flex flex-col p-10 m-6 bg-slate-100" style={{ flex: '35%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: "20px" }}>
          <h1 style={{ color: "black", fontSize: "20px" }}>Filter</h1>
        </div>

        <div>
          <Label htmlFor="name" value="Price Range" style={{ fontSize: "16px", marginBottom: "5px" }} />
          <div>
            <Box sx={{ width: 300 }}>
              <Slider
                min={0}
                max={50000}
                value={value}
                onChange={handleChange}
                valueLabelDisplay="auto"
              />

              <div style={{ display: 'flex', marginBottom: "20px" }}>

                <div style={{ marginRight: "10px" }}>
                  <Label htmlFor="minimumPrice" value="Minimum Price" />
                  <TextInput
                    type="number"
                    className="form-control"
                    id="name"
                    value={value[0]}
                    onChange={(e) => handleInputChange(0, e.target.value)}
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
                  />
                </div>
              </div>
            </Box>
          </div>
        </div>

        <div style={{ paddingBottom: '20px' }}>
          <div className="mb-2 block">
            <Label htmlFor="name" value="Course Category" style={{ fontSize: "16px", marginBottom: "5px" }} />
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
        </div>

        <div style={{ paddingBottom: '20px' }}>
          <div className="mb-2 block">
            <Label htmlFor="name" value="Study Level " style={{ fontSize: "16px", marginBottom: "5px" }} />
            <Dropdown
              label={studyLevel}
              dismissOnClick={true}
              style={{ backgroundColor: "#FFFFFF", color: "black", width: "100%", border: "1px solid #ced4da", borderRadius: "0.50rem" }}
              placement="bottom">
              <Dropdown.Item onClick={() => setStudyLevel('Foundation')}>Foundation</Dropdown.Item>
              <Dropdown.Item onClick={() => setStudyLevel('Diploma')}>Diploma</Dropdown.Item>
            </Dropdown>
          </div>
        </div>


        <div style={{ paddingBottom: '20px' }}>
          <div className="mb-2 block" style={{ color: "black" }}>
            <Label htmlFor="name" value="Home Location " style={{ fontSize: "16px", marginBottom: "5px" }} />
            <TextInput
              type="text"
              id="location"
              icon={ImLocation2}
              required
              autoComplete="off"
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>


        <div>
          <Button onClick={executeFilter}>Filter</Button>
        </div>


      </div>
      <div className="flex-1 p-10 m-6 bg-slate-100" style={{ flex: '65%' }}>
        {getProgramsForCurrentPage().length > 0 ? (
          getProgramsForCurrentPage().map((program) => (
            <div style={{ marginLeft: "30px", marginBottom: "30px", height: "170px", backgroundColor: "white", width: "600px" }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flex: '35%', flexDirection: 'column' }}>
                  <img src={getImage(program.instituteName)} height="auto" width="auto" style={{ marginRight: "10px", marginLeft: "10px" }} />
                </div>

                <div style={{ display: 'flex', flex: '65%', flexDirection: 'column', marginRight: '10px' }}>
                  <h5 style={{ color: "black", fontSize: "16px", fontFamily: "sans-serif", fontWeight: "bold" }}>
                    {program.instituteName}
                  </h5>
                  <h1 style={{ fontSize: "14px", color: "rgba(0, 0, 0, 0.6)" }}>
                    {getInstituteState(program.instituteName)}
                  </h1>
                  <p style={{ fontSize: "16px", marginBottom: "10px", color: "rgba(0, 0, 0, 0.8)" }}>
                    {program.programmeName}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flex: '35%', flexDirection: 'column' }}>
                      <h1 style={{ fontSize: "14px", color: "rgba(0, 0, 0, 0.6)" }}>
                        Duration
                      </h1>
                      <h1 style={{ color: "black", fontSize: "14px" }}>
                        {program.programmeDuration}
                      </h1>
                    </div>

                    <div style={{ display: 'flex', flex: '65%', flexDirection: 'column' }}>
                      <h1 style={{ fontSize: "14px", color: "rgba(0, 0, 0, 0.6)" }}>
                        Estimated Tuition Fees
                      </h1>

                      <h1 style={{ color: "black", fontSize: "14px" }}>
                        RM{program.programmePrice}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h1 style={{ color: "black", fontSize: "14px" }}>No matched institute programme</h1>
          </div>
        )}

        <div className="flex overflow-x-auto sm:justify-left" style={{ color: "black", marginTop: "10px" }}>
          <h1>Showing {currentPage} to {totalPages} of {totalData} Entries </h1>
        </div>
        <div className="flex overflow-x-auto sm:justify-left">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} showIcons />
        </div>
      </div>
    </div>
  )
}
