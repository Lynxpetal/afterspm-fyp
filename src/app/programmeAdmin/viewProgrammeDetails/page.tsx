'use client'
import { db } from '@/app/FirebaseConfig/firebaseConfig'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import MoonLoader from "react-spinners/MoonLoader"
import Link from "next/link"
import { Label, TextInput, Kbd } from 'flowbite-react'
import { BiArrowBack } from "react-icons/bi"

interface SubjectData {
  id?: string
  SubjectAbbreviation?: string
  SubjectCode?: string
  SubjectName?: string
}

export default function ViewProgrammeDetails() {
  //retrieve the id
  const searchParams = useSearchParams()
  const programmeId = searchParams.get('search')
  console.log(programmeId)

  //fetch the single document
  const [isProgrammeFetchDataLoading, setIsProgrammeFetchDataLoading] = useState(true)
  const [programmeName, setProgrammeName] = useState('')
  const [programmeCourseCategory, setProgrammeCourseCategory] = useState('')
  const [instituteName, setInstituteName] = useState('')
  const [programmeDuration, setProgrammeDuration] = useState(0)
  const [programmePrice, setProgrammePrice] = useState(0)
  const [programmeStudyLevel, setProgrammeStudyLevel] = useState('')
  const [subjectGrades, setSubjectGrades] = useState<[string, string][]>([])
  const [subjectAbbreviation, setSubjectAbbreviation] = useState<Record<string, string>>({})
  const gradeOptions = ["A+", "A", "A-", "B+", "B", "C+", "C", "D", "E", "G", "X"]
  const [subjectDataFetched, setSubjectDataFetched] = useState(false)
  const [allReady, setAllReady] = useState(false)

  const fetchProgrammeData = async () => {
    //data is fetching = loading
    setIsProgrammeFetchDataLoading(true)

    try {
      const programmeDocRef = doc(db, "Programme", programmeId)
      const programmeDocSnap = await getDoc(programmeDocRef)

      if (programmeDocSnap.exists()) {
        console.log("Programme data: ", programmeDocSnap.data())
        setProgrammeName(programmeDocSnap.data().ProgrammeName)
        setProgrammeCourseCategory(programmeDocSnap.data().ProgrammeCategory)
        setInstituteName(programmeDocSnap.data().InstituteName)
        setProgrammeDuration(programmeDocSnap.data().ProgrammeDuration)
        setProgrammePrice(programmeDocSnap.data().ProgrammePrice)
        setProgrammeStudyLevel(programmeDocSnap.data().ProgrammeStudyLevel)

        const entries: [string, string][] = Object.entries(programmeDocSnap.data().ProgrammeMinimumEntryRequirement)
        setSubjectGrades(entries)
        console.log(entries)

      } else {
        console.log("No document")

      }
    } catch (error) {
      console.error("Error fetching document: ", error)

      //data is fetched successfully
    } finally {
      setIsProgrammeFetchDataLoading(false)
    }

  }

  //fetch subject data from database
  const fetchSubjectData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Subject"))

      //declare the data type of the data
      const data: SubjectData[] = []

      //get all the data and push inside the data variable
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as SubjectData)
      })

      //declare a dictionary cuz want to get {"BC": "BAHASA CINA", ...}
      const subjectAbbreviationDictionary: Record<string, string> = {}
      data.forEach(({ SubjectAbbreviation, SubjectName }) => {
        if (SubjectAbbreviation && SubjectName) {
          subjectAbbreviationDictionary[SubjectAbbreviation] = SubjectName
        }
      })

      //put it inside subjectAbbreviation
      setSubjectAbbreviation(subjectAbbreviationDictionary)
      console.log(subjectDataFetched)


    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }


  useEffect(() => {
    const fetchData = async () => {
      await fetchProgrammeData()
      await fetchSubjectData()
      setSubjectDataFetched(true)
    }

    fetchData()
  }, [programmeId])

  //once fetch subject data successfully, then ready to display
  useEffect(() => {
    console.log(subjectDataFetched)
    if (subjectDataFetched == true) {
      console.log(subjectAbbreviation)
      setAllReady(true)
    }
  }, [subjectDataFetched])


  if (!allReady) {
    return (
      <div className="grid">
        <MoonLoader loading={!allReady} size={50} color="#8DD3E2" />
        <h1>Loading...</h1>
      </div>
    )
  }
  return (
    <div>
      <form>
        <div className="card" style={{ margin: '30px' }}>
          <div style={{ backgroundColor: "#EDFDFF", margin: '30px', padding: '30px', width: '75%' }}>
            <div style={{ paddingBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href={{ pathname: '/programmeAdmin' }}>
                  <Kbd icon={BiArrowBack} style={{ fontSize: '24px', backgroundColor: 'transparent', border: 'none' }} />
                </Link>
                <h1 className="programmeHeader" style={{ marginLeft: 'auto', marginRight: 'auto' }}>View Programme Information</h1>
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div className="mb-2 block">
                <Label htmlFor="name" value="Programme Name " />
                <span style={{ color: "red" }}>*</span>
                <TextInput
                  type="text"
                  className="form-control"
                  id="name"
                  value={programmeName}
                />
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div className="mb-2 block">
                <Label htmlFor="name" value="Course Category " />
                <span style={{ color: "red" }}>*</span>
                <TextInput
                  type="text"
                  className="form-control"
                  id="name"
                  value={programmeCourseCategory}
                />
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div className="mb-2 block">
                <Label htmlFor="name" value="Institute Name " />
                <span style={{ color: "red" }}>*</span>
                <TextInput
                  type="text"
                  className="form-control"
                  id="name"
                  value={instituteName}
                />
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div className="mb-2 block">
                <Label htmlFor="phone" value="Estimated Price " />
                <span style={{ color: "red" }}>*</span>
                <TextInput
                  type="number"
                  className="form-control"
                  id="price"
                  value={programmePrice}
                />
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div className="mb-2 block">
                <Label htmlFor="duration" value="Duration (in years) " />
                <span style={{ color: "red" }}>*</span>
                <TextInput
                  type="number"
                  className="form-control"
                  id="duration"
                  value={programmeDuration}
                />
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div className="mb-2 block">
                <Label htmlFor="name" value="Study Level " />
                <span style={{ color: "red" }}>*</span>
                <TextInput
                  type="text"
                  className="form-control"
                  id="name"
                  value={programmeStudyLevel}
                />
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div className="mb-2 block">
                <Label htmlFor="minimumEntryReq" value="Minimum Entry Requirement Details " />
                <span style={{ color: "red" }}>*</span>
              </div>
              <div>
                <div style={{ display: 'flex' }}>
                  <table id="table table-borderless" style={{ color: "gray" }}>
                    <thead id="gradeTableThead">
                      <tr>
                        <th style={{ width: "35%", color: 'black' }}>Subject</th>
                        <th style={{ width: "15%", color: 'black' }}>Grade</th>
                        <th style={{ width: "35%", color: 'black' }}>Subject</th>
                        <th style={{ width: "15%", color: 'black' }}>Grade</th>
                      </tr>
                    </thead>
                    <tbody id="gradeTableBody">
                      {subjectGrades.map(([subject, grade], index) => (
                        //if the index is even then open new row
                        //then map the subject abbreviation to get the text
                        index % 2 == 0 && (
                          <tr key={index}>
                            <td style={{ width: "35%" }}>
                              {Object.entries(subjectAbbreviation).map(([value, text]) => (
                                value == subjectGrades[index][0] && (
                                  <TextInput
                                    key={value}
                                    type="text"
                                    className="form-control"
                                    id="name"
                                    value={text}
                                  />
                                )
                              ))}
                            </td>
                            <td style={{ width: "15%" }}>
                              {gradeOptions.map((optionValue) => (
                                optionValue == subjectGrades[index][1] && (
                                  <TextInput
                                    key={optionValue}
                                    type="text"
                                    className="form-control"
                                    id="name"
                                    value={optionValue}
                                  />
                                )))}
                            </td>
                            {/*will check whether next index exists or not*/}
                            {subjectGrades[index + 1] && (
                              <>
                                <td style={{ width: "35%" }}>
                                  {Object.entries(subjectAbbreviation).map(([value, text]) => (
                                    value == subjectGrades[index + 1][0] && (
                                      <TextInput
                                        key={value}
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        value={text}
                                      />
                                    )
                                  ))}
                                </td>
                                <td style={{ width: "15%" }}>
                                  {gradeOptions.map((optionValue) => (
                                    optionValue == subjectGrades[index + 1][1] && (
                                      <TextInput
                                        key={optionValue}
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        value={optionValue}
                                      />
                                    )))}
                                </td>
                              </>
                            )}
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>



          </div>
        </div>
      </form>
    </div>
  )

}