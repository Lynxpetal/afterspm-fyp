'use client'
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Label, TextInput, Alert, Kbd, Dropdown, Button } from 'flowbite-react'
import { instituteCollection } from "@/app/lib/controller"
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore"
import Link from 'next/link'
import { HiCheck } from 'react-icons/hi'
import { AiOutlineClose } from 'react-icons/ai'
import { HiInformationCircle } from 'react-icons/hi'
import { db } from "@/app/FirebaseConfig/firebaseConfig"
import MoonLoader from "react-spinners/MoonLoader"
import Swal from 'sweetalert2'
import { useRouter } from "next/navigation"

type addProgrammeFormValues = {
  name: string,
  instituteName: string,
  price: string,
  duration: string
  studyLevel: string
  minimumEntryRequirement: Map<string, string>
}

interface SubjectData {
  id?: string
  SubjectAbbreviation?: string
  SubjectCode?: string
  SubjectName?: string
}

export default function AddProgramme() {
  const form = useForm<[addProgrammeFormValues]>()
  const [subjectAbbreviation, setSubjectAbbreviation] = useState<Record<string, string>>({})
  const [name, setProgrammeName] = useState("")
  const [instituteNames, setInstituteNames] = useState<string[]>([]);
  const [instituteName, setInstituteName] = useState('')
  const [price, setPrice] = useState("")
  const [duration, setDuration] = useState("")
  const [studyLevel, setStudyLevel] = useState("Diploma")
  const { register, handleSubmit, formState } = form
  const { errors } = formState
  const gradeOptions = ["A+", "A", "A-", "B+", "B", "C+", "C", "D", "E", "G", "X"]
  const [allReady, setAllReady] = useState(false)
  const [subjectDataFetched, setSubjectDataFetched] = useState(false)
  const [duplicateSubject, setDuplicateSubject] = useState(false)
  const [missingSubject, setMissingSubject] = useState(false)
  const [emptyGrade, setEmptyGrade] = useState(false)
  const compulsorySubject = ["BM", "SEJ"]
  var missingSubjectStatus = false
  var duplicateSubjectStatus = false
  var emptyGradeStatus = false
  const router = useRouter()

  const isProgrammeNameValid = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/

  //select from multiple options 
  function createSelect(className: string, name: string, id: string, arialabel: string) {
    const select = document.createElement("select")
    select.className = className
    select.name = name
    select.id = id
    select.ariaLabel = arialabel
    return select
  }

  //default option
  function createDefaultOption() {
    const defaultOption = document.createElement("option")
    defaultOption.selected = true
    defaultOption.disabled = true
    defaultOption.value = "";
    defaultOption.text = "Select an option"
    return defaultOption
  }

  //create element of option
  function createOption(value: string, text: string) {
    const option = document.createElement("option")
    option.value = value
    option.text = text
    return option
  }

  //create one subject container and grade container
  function createSubjectAndGradeContainer() {
    //navigate to table td section inside tr
    const subjectContainer = document.createElement("td")
    subjectContainer.style.width = "35%"
    const gradeContainer = document.createElement("td")
    gradeContainer.style.width = "15%"
    gradeContainer.style.marginRight = "10px"

    const subjectSelect = createSelect("form-select qualificationSubject", "qualificationSubject", "inputQualification", "Default select example")
    subjectSelect.appendChild(createDefaultOption())

    const gradeSelect = createSelect("form-select qualificationGrade", "qualificationGrade", "inputQualification", "Default select example")
    gradeSelect.appendChild(createDefaultOption())

    for (const subjectName in subjectAbbreviation) {
      subjectSelect.appendChild(createOption(subjectName, subjectAbbreviation[subjectName]))
    }

    for (const optionValue of gradeOptions) {
      gradeSelect.appendChild(createOption(optionValue, optionValue))
    }

    subjectContainer.appendChild(subjectSelect)
    gradeContainer.appendChild(gradeSelect)

    return [subjectContainer, gradeContainer]

  }

  //add one row inside table
  function addTableDetails() {
    //retrieve id so that can know where to add rows
    //navigate to table body section
    const gradeTableBody = document.getElementById("gradeTableBody")
    //navigate to table tr section
    const newRow = document.createElement("tr")

    const [subjectContainer, gradeContainer] = createSubjectAndGradeContainer()
    const [secondSubjectContainer, secondGradeContainer] = createSubjectAndGradeContainer()

    //one row got 4 container (2 subject + 2 grade)
    newRow.appendChild(subjectContainer)
    newRow.appendChild(gradeContainer)
    newRow.appendChild(secondSubjectContainer)
    newRow.appendChild(secondGradeContainer)

    //body contain 1 new row
    gradeTableBody?.appendChild(newRow)

  }

  //add one row
  function handleAddRowContainer() {
    addTableDetails()
  }


  //delete one row
  function handleDeleteRowContainer() {
    const gradeTableBody = document.getElementById("gradeTableBody")

    //check if there are rows to delete
    if (gradeTableBody && gradeTableBody?.children.length > 0) {
      const lastChild = gradeTableBody.lastChild as Node
      gradeTableBody?.removeChild(lastChild)
    }

  }

  //check duplicate subjects
  function hasDuplicateSubjects() {
    const subjectContainers = document.querySelectorAll(".qualificationSubject")
    let selectedSubjects = new Set()

    for (let i = 0; i < subjectContainers.length; i++) {
      //iterate over subject container
      const subjectSelect = subjectContainers[i] as HTMLSelectElement

      //get its value eg BM
      const subjectValue = subjectSelect.value

      if (selectedSubjects.has(subjectValue)) {
        //has duplicate subject
        setDuplicateSubject(true)
        return true
      }

      //add the subject value inside selectedSubjects
      selectedSubjects.add(subjectValue)

    }

    //if no duplicate subject found
    setDuplicateSubject(false)
    return false


  }

  //check missing subject
  function hasMissingSubject() {
    const subjectContainers = document.querySelectorAll(".qualificationSubject")
    //check whether got missing subject or not
    const missingSubjects: string[] = []
    setMissingSubject(false)

    for (const subject of compulsorySubject) {
      //initialize
      let found = false

      for (let i = 0; i < subjectContainers.length; i++) {
        const subjectSelect = subjectContainers[i] as HTMLSelectElement

        const subjectValue = subjectSelect.value
        console.log(subjectValue)

        //if got then stop looping
        if (subjectValue == subject) {
          found = true
          break
        }

      }

      //if cannot find then push inside list
      if (!found) {
        missingSubjects.push(subject)
        setMissingSubject(true)
      }
    }

    return missingSubjects
  }

  //check empty grade
  function hasEmptyGrade() {
    const subjectContainers = document.querySelectorAll(".qualificationSubject")
    const gradeContainers = document.querySelectorAll(".qualificationGrade")

    //intiial wont show error message
    setEmptyGrade(false)

    for (let i = 0; i < subjectContainers.length; i++) {
      const subjectSelect = subjectContainers[i] as HTMLSelectElement
      const gradeSelect = gradeContainers[i] as HTMLSelectElement
      const subjectValue = subjectSelect.value
      const gradeValue = gradeSelect.value

      //if got subject but empty grade then show error message
      if (subjectValue != "") {
        if (gradeValue == "") {
          //mean got duplicate
          setEmptyGrade(true)
          return true
        }
      }
    }

    setEmptyGrade(false)
    return false

  }

  //store programme data inside firebase
  async function addProgrammeDataInsideDatabase() {
    try {
      const subjectContainers = document.querySelectorAll(".qualificationSubject")
      const gradeContainers = document.querySelectorAll(".qualificationGrade")

      const latestResultData: Record<string, string> = {}

      for (let i = 0; i < subjectContainers.length; i++) {
        const subjectSelect = subjectContainers[i] as HTMLSelectElement;
        const gradeSelect = gradeContainers[i] as HTMLSelectElement;

        const subjectValue = subjectSelect.value;
        const gradeValue = gradeSelect.value;

        if (subjectValue != "") {
          latestResultData[subjectValue] = gradeValue
        }

      }

      //collection - Programme
      const programmeDocRef = await addDoc(collection(db, "Programme"), {
        InstituteName: instituteName,
        ProgrammeDuration: duration,
        ProgrammeName: name,
        ProgrammeStudyLevel: studyLevel,
        ProgrammePrice: price,
        ProgrammeLastUpdateTimestamp: serverTimestamp(),
        ProgrammeMinimumEntryRequirement: latestResultData
      })
      console.log("Document written with ID: ", programmeDocRef.id)

    } catch (error) {
      console.error("Error adding document", error)
    }
  }

  //add programme
  const addProgramme = async (data: [addProgrammeFormValues]) => {
    console.log("Ok")
    duplicateSubjectStatus = false
    missingSubjectStatus = false
    emptyGradeStatus = false

    //check whether got duplicate subject or not
    if (hasDuplicateSubjects()) {
      duplicateSubjectStatus = true
    }

    //check whether got missing subject or not
    const missingSubjects = hasMissingSubject()
    if (missingSubjects.length > 0) {
      missingSubjectStatus = true
    }


    //check whether got empty grade or not
    if (hasEmptyGrade()) {
      emptyGradeStatus = true
    }

    //if got duplicate subject
    if (duplicateSubjectStatus || missingSubjectStatus || emptyGradeStatus) {
      console.log("Fail to add inside database")
    }


    if (!duplicateSubjectStatus && !missingSubjectStatus && !emptyGradeStatus) {
      Swal.fire({
        title: "Are you sure?",
        text: "Double confirm that information is correctly entered before added in the database.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes"
      }).then((result) => {
        if (result.isConfirmed) {
          addProgrammeDataInsideDatabase()
          Swal.fire({
            title: "Great!",
            text: "Add successfully inside the database",
            icon: "success",
          }).then(() => {
            //Navigate to /programmeAdmin after user presses ok
            router.push('/programmeAdmin');
          });
        }
      });
      
    }
  }

  //fetch subject data from database
  const fetchSubjectData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Subject"));

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
      });

      //put it inside subjectAbbreviation
      setSubjectAbbreviation(subjectAbbreviationDictionary)
      console.log(subjectDataFetched)


    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  //fetch data from firebase for drop down list
  const fetchInstituteName = async () => {
    try {
      const q = query(instituteCollection, orderBy('InstituteName'))
      const querySnapshot = await getDocs(q)
      const instituteName: string[] = []
      querySnapshot.forEach((doc) => {
        instituteName.push(doc.data().InstituteName)
      })

      //sort it based on alphabetical order
      const sortedInstituteNames = instituteName.sort()

      //default: first institute name
      if (sortedInstituteNames.length > 0) {
        setInstituteName(sortedInstituteNames[0])
      }

      //update the state with the sorted institute name
      setInstituteNames(sortedInstituteNames)
      //all institute data is fetched successfully

    } catch (error) {
      console.error("Error fetching institute names")
    }
  }

  //wait to fetch institute name and subject data
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchInstituteName()
        await fetchSubjectData()
        setSubjectDataFetched(true)

      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [])


  //once fetch subject data successfully, then ready to display
  useEffect(() => {
    console.log(subjectDataFetched)
    if (subjectDataFetched == true) {
      console.log(subjectAbbreviation)
      setAllReady(true)
    }
  }, [subjectDataFetched])



  useEffect(() => {
    const isNameValid = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/

    if (isNameValid.test(name) && name.length >= 20) {
      form.clearErrors("0.name")
    }

    if (price != '') {
      form.clearErrors("0.price")
    }

    if (duration != '') {
      form.clearErrors("0.duration")
    }

    if (studyLevel != '') {
      form.clearErrors("0.studyLevel")
    }

  }, [name, price, duration, studyLevel])

  if (!allReady) {
    return (
      <div className="grid">
        <MoonLoader loading={!allReady} size={50} color="#8DD3E2" />
        <h1>Loading...</h1>
      </div>
    );
  }
  return (
    <div>
      <form>
        <div className="card" style={{ margin: '30px', width: "100%" }}>
          <div style={{ backgroundColor: "#EDFDFF", margin: '30px', padding: '30px', width: '75%' }}>
            <div style={{ paddingBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href={{ pathname: '/programmeAdmin' }}>
                  <Kbd icon={AiOutlineClose} style={{ fontSize: '24px', backgroundColor: 'transparent', border: 'none' }} />
                </Link>
                <h1 className="programmeHeader">Add New Programme</h1>
                <div>
                  <Kbd icon={HiCheck} onClick={handleSubmit(addProgramme)} style={{ fontSize: '24px', backgroundColor: 'transparent', border: 'none' }} />
                </div>
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
                  placeholder="Diploma in Computer Science"
                  {...register("0.name", {
                    required: {
                      value: true,
                      message: "Name is required"
                    },
                    minLength: {
                      value: 20,
                      message: "At least 20 characters long"
                    },
                    pattern: {
                      value: isProgrammeNameValid,
                      message: "Invalid programme name"
                    }
                  })}
                  onChange={(e) => setProgrammeName(e.target.value)}
                />
                <p className="addProgrammeValidationError">{errors[0]?.name?.message}</p>
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div className="mb-2 block">
                <Label htmlFor="name" value="Institute Name " />
                <span style={{ color: "red" }}>*</span>
                <Dropdown
                  label={instituteName}
                  dismissOnClick={true}
                  style={{ backgroundColor: "white", color: "black", width: "100%" }}
                  placement="bottom">
                  {instituteNames.map((name) => (
                    <Dropdown.Item key={name} onClick={() => setInstituteName(name)}>{name}</Dropdown.Item>
                  ))}
                </Dropdown>
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
                  placeholder="17600"
                  min="1"
                  {...register("0.price", {
                    required: {
                      value: true,
                      message: "Price is required"
                    }
                  })}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <p className="addProgrammeValidationError">{errors[0]?.price?.message}</p>
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
                  placeholder="1.5"
                  min="1"
                  step="0.5"
                  {...register("0.duration", {
                    required: {
                      value: true,
                      message: "Programme duration is required"
                    }
                  })}
                  onChange={(e) => setDuration(e.target.value)}
                />
                <p className="addProgrammeValidationError">{errors[0]?.duration?.message}</p>
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div className="mb-2 block">
                <Label htmlFor="name" value="Study Level " />
                <span style={{ color: "red" }}>*</span>
                <Dropdown
                  label={studyLevel}
                  dismissOnClick={true}
                  style={{ backgroundColor: "white", color: "black", width: "100%" }}
                  placement="bottom">
                  <Dropdown.Item onClick={() => setStudyLevel('Foundation')}>Foundation</Dropdown.Item>
                  <Dropdown.Item onClick={() => setStudyLevel('Diploma')}>Diploma</Dropdown.Item>
                </Dropdown>
              </div>
            </div>

            <div style={{ paddingBottom: '20px' }}>
              <div className="mb-2 block">
                <Label htmlFor="minimumEntryReq" value="Minimum Entry Requirement Details " />
                <span style={{ color: "red" }}>*</span>
              </div>
              <div>
                {duplicateSubject && (
                  <Alert color="failure" icon={HiInformationCircle} onDismiss={() => setDuplicateSubject(false)}>
                    <span className="font-medium">Info alert!</span> Duplicate Subjects Are Not Allowed
                  </Alert>
                )}
              </div>
              <div>
                {missingSubject && (
                  <Alert color="failure" icon={HiInformationCircle} onDismiss={() => setMissingSubject(false)}>
                    <span className="font-medium">Info alert!</span> Required Subject That Must Fill: Bahasa Melayu, Bahasa Inggeris, Mathematics, Sejarah
                  </Alert>
                )}
              </div>
              <div>
                {emptyGrade && (
                  <Alert color="failure" icon={HiInformationCircle} onDismiss={() => setEmptyGrade(false)}>
                    <span className="font-medium">Info alert!</span> Grade cannot be empty
                  </Alert>
                )}
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
                      <tr>
                        <td style={{ width: "35%" }}>
                          <select className="form-select qualificationSubject" name="qualificationSubject" id="inputQualification">
                            <option selected disabled value="">Select an option</option>
                            {Object.entries(subjectAbbreviation).map(([value, text]) => (
                              <option key={value} value={value} selected={value == "BM"}>{text}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ width: "15%" }}>
                          <select className="form-select qualificationGrade" name="qualificationGrade" id="inputQualification">
                            <option selected disabled value="">Select an option</option>
                            {gradeOptions.map((optionValue) => (
                              <option key={optionValue} value={optionValue}>{optionValue}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ width: "35%" }}>
                          <select className="form-select qualificationSubject" name="qualificationSubject" id="inputQualification">
                            <option selected disabled value="">Select an option</option>
                            {Object.entries(subjectAbbreviation).map(([value, text]) => (
                              <option key={value} value={value} selected={value == "SEJ"}>{text}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ width: "15%" }}>
                          <select className="form-select qualificationGrade" name="qualificationGrade" id="inputQualification">
                            <option selected disabled value="">Select an option</option>
                            {gradeOptions.map((optionValue) => (
                              <option key={optionValue} value={optionValue}>{optionValue}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex flex-wrap gap-2" style={{ margin: "20px" }}>
                <Button pill onClick={handleAddRowContainer}>
                  Add Row
                </Button>
                <Button pill onClick={handleDeleteRowContainer}>
                  Delete Row
                </Button>
              </div>
            </div>


          </div>
        </div>
      </form>
    </div>
  )
}