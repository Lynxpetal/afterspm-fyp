'use client'
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Label, TextInput, Toast, Kbd, Dropdown, Button } from 'flowbite-react'
import { instituteCollection } from "@/app/lib/controller"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import Link from 'next/link'
import { HiCheck } from 'react-icons/hi'
import { AiOutlineClose } from 'react-icons/ai'
import { db } from "@/app/FirebaseConfig/firebaseConfig"
import MoonLoader from "react-spinners/MoonLoader"

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
  const [minimumEntryRequirement, setMinimumEntryRequirement] = useState<Record<string, string>>({})
  const { register, handleSubmit, formState } = form
  const { errors } = formState
  const gradeOptions = ["A+", "A", "A-", "B+", "B", "C+", "C", "D", "E", "G", "X"]
  const compulsorySubject = ["BM", "SEJ"]
  const [allReady, setAllReady] = useState(false)
  const [dataFetched, setDataFetched] = useState(false)

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

  //add table header
  function createTableHeader(text: string, width: string) {
    const header = document.createElement("th")
    header.textContent = text
    header.style.width = width
    return header

  }

  //add one row
  function handleAddRowContainer() {
    addTableDetails()
  }

  //populate field with required subject
  function fillFieldWithCompulsorySubject() {
    const subjectContainers = document.querySelectorAll(".qualificationSubject")
    for (let i = 0; i < subjectContainers.length; i++) {
      const subjectSelect = subjectContainers[i] as HTMLSelectElement

      if (i < compulsorySubject.length) {
        const compulsorySubjectValue = compulsorySubject[i]
        console.log(compulsorySubjectValue)
        //set the selected subject in the subject container
        subjectSelect.value = compulsorySubjectValue
        console.log(subjectSelect.value)
      }
    }
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

  //2 default programme minimum entry requirements 
  async function manualInputProgrammeMinimumEntryRequirements() {
    const gradeTableThead = document.getElementById("gradeTableThead")
    if (gradeTableThead) {
      gradeTableThead.innerHTML = ''
    }
    const headerRow = document.createElement("tr")

    //create the header for first subject and grade
    headerRow.appendChild(createTableHeader("Subject", "35%"))
    headerRow.appendChild(createTableHeader("Grade", "15%"))

    //create the header for second subject and grade
    headerRow.appendChild(createTableHeader("Subject", "35%"))
    headerRow.appendChild(createTableHeader("Grade", "15%"))

    //add inside th section
    gradeTableThead?.appendChild(headerRow)

    //show compulsory subject so get how many data first
    //then find need how many rows to display
    const count = compulsorySubject.length
    const numRowsToDisplay = Math.ceil(count / 2)

    console.log(numRowsToDisplay)
    for (let i = 0; i < numRowsToDisplay; i++) {
      addTableDetails()

    }

    //default: 2 ninimum entry requirements
    fillFieldWithCompulsorySubject()
    setAllReady(true)
    console.log("done")

  }


  const addProgramme = async (data: [addProgrammeFormValues]) => {
    console.log("Ok")
  }


  useEffect(() => {
    const fetchData = async () => {
      setDataFetched(false)
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
        setDataFetched(true)


      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    //fetch data from firebase for drop down list
    const fetchInstituteName = async () => {
      setAllReady(false)
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

        //fetch subject name , abbreviation data 
        //await cuz asynchronization
        await fetchData()

      } catch (error) {
        console.error("Error fetching institute names")
      }
    }

    //first fetch institute name from database first
    fetchInstituteName()

  }, [])

  useEffect(() => {
    //after fetch subject data successfully then display subject and grade container
    if (dataFetched == true) {
      manualInputProgrammeMinimumEntryRequirements()
    }
  })

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
  })

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
      <form style={{ margin: '20px' }}>

        <div className="card" style={{ margin: '30px' }}>
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
              <div style={{ display: 'flex' }}>
                <table id="table table-borderless" style={{ color: "gray" }}>
                  <thead id="gradeTableThead">
                  </thead>
                  <tbody id="gradeTableBody">
                  </tbody>
                </table>
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