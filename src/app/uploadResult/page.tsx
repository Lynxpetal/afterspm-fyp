'use client'

import { FileInput, Label, Button, Alert, Timeline } from 'flowbite-react'
import React, { useState, useEffect } from 'react'
import { db, storage } from '../FirebaseConfig/firebaseConfig'
import { addDoc, collection, deleteDoc, getDocs, query, where } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { HiInformationCircle } from 'react-icons/hi'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { v4 } from "uuid"
import Swal from 'sweetalert2'
import { FaFilter } from 'react-icons/fa'
import { GrDocumentUpload } from 'react-icons/gr'
import { MdOutlineRecommend } from 'react-icons/md'
import { useRouter } from 'next/navigation'
import MoonLoader from "react-spinners/MoonLoader"

interface SubjectData {
  id?: string
  SubjectAbbreviation?: string
  SubjectCode?: string
  SubjectName?: string
}

export default function uploadResult() {
  const [subjectAbbreviation, setSubjectAbbreviation] = useState<Record<string, string>>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [duplicateSubject, setDuplicateSubject] = useState(false)
  const [missingSubject, setMissingSubject] = useState(false)
  const [emptyGrade, setEmptyGrade] = useState(false)
  const [uploadFileStatus, setUploadFileStatus] = useState(true)
  const [manualInputStatus, setManualInputStatus] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [uploadFileContainer, setUploadFileContainer] = useState(true)
  const [addRowStatus, setAddRowStatus] = useState(false)
  const [deleteRowStatus, setDeleteRowStatus] = useState(false)
  const [resultImage, setResultImage] = useState<File | null>(null)
  const gradeOptions = ["A+", "A", "A-", "B+", "B", "C+", "C", "D", "E", "G", "X"]
  const compulsorySubject = ["BM", "BI", "MM", "SEJ"]
  var missingSubjectStatus = false
  var duplicateSubjectStatus = false
  var emptyGradeStatus = false
  const [isDataProcessed, setIsDataProcessed] = useState(false)
  const router = useRouter()

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
    defaultOption.value = ""
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

  //delete one row
  function handleDeleteRowContainer() {
    const gradeTableBody = document.getElementById("gradeTableBody")

    //check if there are rows to delete
    if (gradeTableBody && gradeTableBody?.children.length > 0) {
      const lastChild = gradeTableBody.lastChild as Node
      gradeTableBody?.removeChild(lastChild)
    }

  }

  //if user click on upload result button then will show the container
  function enableUploadResultContainer() {
    //mean user is currently on "Upload Result" section
    setUploadFileStatus(true)
    //user not on "Manual Input" section
    setManualInputStatus(false)
    setDuplicateSubject(false)
    setMissingSubject(false)
    setEmptyGrade(false)

    const gradeTableThead = document.getElementById("gradeTableThead")
    if (gradeTableThead) {
      //go tr section cuz want to delete the row
      const headerRowToRemove = gradeTableThead.querySelector("tr")

      //check if header row exists
      if (headerRowToRemove) {
        //remove the header row from the thead
        gradeTableThead.removeChild(headerRowToRemove)
      }
    }

    //clear the table thead then clear subject container and its row
    const subjectContainersUploadFile = document.querySelectorAll(".qualificationSubject")
    subjectContainersUploadFile.forEach(container => {
      const row = container.closest("tr")
      //remove tr 
      if (row) {
        row.remove()
      }

      //remove the select and option 
      container.remove()
    })

    //clear the table thead then clear grade container and its row
    const gradeContainerUploadFile = document.querySelectorAll(".qualificationGrade")
    gradeContainerUploadFile.forEach(container => {
      const row = container.closest("tr")
      //remove tr
      if (row) {
        row.remove()
      }

      //remove the select and option
      container.remove()
    })

    //display the upload file container
    setUploadFileContainer(true)

    //cannot add row or delete row 
    setAddRowStatus(false)
    setDeleteRowStatus(false)
  }

  //if user wants to manual input
  function showManualInput() {
    setUploadFileStatus(false)
    setUploadFileContainer(false)
    setManualInputStatus(true)
    setDuplicateSubject(false)
    setMissingSubject(false)
    setEmptyGrade(false)


    //clear the table thead then clear subject container and its row
    const subjectContainersUploadFile = document.querySelectorAll(".qualificationSubject")
    subjectContainersUploadFile.forEach(container => {
      const row = container.closest("tr")
      //remove tr 
      if (row) {
        row.remove()
      }

      //remove the select and option 
      container.remove()
    })

    //clear the table thead then clear grade container and its row
    const gradeContainerUploadFile = document.querySelectorAll(".qualificationGrade")
    gradeContainerUploadFile.forEach(container => {
      const row = container.closest("tr")
      //remove tr
      if (row) {
        row.remove()
      }

      //remove the select and option
      container.remove()
    })

    //thead
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

    //default: 4 compulory subject
    fillFieldWithCompulsorySubject()

    //can add and delete row
    setAddRowStatus(true)
    setDeleteRowStatus(true)

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

  //upload file
  const handleResultImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDataProcessed(true)
    //clear table header, subject container, grade container
    enableUploadResultContainer()

    const resultFileInput = e.target.files?.[0]
    if (resultFileInput) {
      const allowedExtensions = ["jpg", "jpeg", "png"]
      const fileExtension = resultFileInput.name.split(".").pop()?.toLowerCase()
      console.log(fileExtension)
      if (fileExtension) {
        if (!allowedExtensions.includes(fileExtension)) {
          setErrorMessage("Invalid file format. Please upload a .jpg, .jpeg, or .png file.")
          return
        }
      }

      setResultImage(resultFileInput)
    } else {
      setErrorMessage("Please upload a file")
      return
    }

    //FormData - set a new value for existing key inside object, or add the key/value if it does not exist
    const formData = new FormData()
    formData.append("file", resultFileInput)

    fetch("http://localhost:5000/uploadResult", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setIsDataProcessed(false)
        console.log(data)
        if (e.target.files?.length == 0) {
          const gradeTableThead = document.getElementById("gradeTableThead")
          if (gradeTableThead) {
            //go tr section cuz want to delete the row
            const headerRowToRemove = gradeTableThead.querySelector("tr")

            //check if header row exists
            if (headerRowToRemove) {
              //remove the header row from the thead
              gradeTableThead.removeChild(headerRowToRemove)
            }
          }

          //clear the table thead then clear subject container and its row
          const subjectContainersUploadFile = document.querySelectorAll(".qualificationSubject")
          subjectContainersUploadFile.forEach(container => {
            const row = container.closest("tr")
            //remove tr 
            if (row) {
              row.remove()
            }

            //remove the select and option 
            container.remove()
          })

          //clear the table thead then clear grade container and its row
          const gradeContainerUploadFile = document.querySelectorAll(".qualificationGrade")
          gradeContainerUploadFile.forEach(container => {
            const row = container.closest("tr")
            //remove tr
            if (row) {
              row.remove()
            }

            //remove the select and option
            container.remove()
          })
        }
        else {
          enableUploadResultContainer()
          //thead
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

          //get how many data then compute number of rows
          const count = Object.keys(data).length
          const numberOfRowsToDisplay = Math.ceil(count / 2)
          console.log(numberOfRowsToDisplay)

          //11 subjects so 6 rows
          for (let i = 0; i < numberOfRowsToDisplay; i++) {
            addTableDetails()
            console.log("1")
          }

          //return element with class = qualificationSubject
          const subjectContainers = document.querySelectorAll(".qualificationSubject")

          //return element with class = qualificationGrade
          const gradeContainers = document.querySelectorAll(".qualificationGrade")

          //return dataKeys eg {'BM', 'BC', ...}
          const dataKeys = Object.keys(data)
          console.log(dataKeys)

          //One subject has many select
          //Iterate over each subject and grade container and put value
          console.log(subjectContainers.length)
          console.log(gradeContainers.length)
          for (let i = 0; i < subjectContainers.length; i++) {
            const subjectSelect = subjectContainers[i] as HTMLSelectElement
            const gradeSelect = gradeContainers[i] as HTMLSelectElement

            if (i < dataKeys.length) {
              //subjectKey = "BM"
              const subjectKey = dataKeys[i]
              console.log(subjectKey)
              //gradeValue = "A+"
              //data format: {"BM": "A+", ...}
              //so data["BM"] = "A+"
              const gradeValue = data[subjectKey]
              console.log(gradeValue)

              //Iterate over subject options and set the selected index when thers's a match
              for (let j = 0; j < subjectSelect?.options.length; j++) {
                //subject selected index will be "BM"
                if (subjectSelect?.options[j].value == subjectKey) {
                  subjectSelect.selectedIndex = j
                  break
                }
              }

              //Iterate over grade options and set the selected index when there's a match
              for (let k = 0; k < gradeSelect?.options.length; k++) {
                //grade selected will be "A+"
                if (gradeSelect?.options[k].value == gradeValue) {
                  gradeSelect.selectedIndex = k
                  break
                }
              }
            } else {
              //if no data for this row, then reset the selections
              if (subjectSelect && gradeSelect) {
                subjectSelect.selectedIndex = 0
                gradeSelect.selectedIndex = 0
              }

            }

            setAddRowStatus(true)
            setDeleteRowStatus(true)


          }

          

        }


      })
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

  //add image to storage
  const addImageResult = async () => {
    try {
      if (resultImage) {
        const resultImageRef = ref(storage, `ResultImage/${v4()}`)
        const resultImageData = await uploadBytes(resultImageRef, resultImage)
        const resultUrlVal = await getDownloadURL(resultImageData.ref)

        const resultImageName = resultImage.name

        await deleteImageResultDataToFirestore(userId)

        await addImageResultDataToFirestore(
          userId,
          resultImageName,
          resultImageData.metadata.name,
          resultUrlVal
        )

      } else {
        console.error('Image fill is null. Unable to upload')
      }
    } catch (error) {
      console.error(error)
    }
  }

  //add data to firebase
  async function addImageResultDataToFirestore(userId: string | null, imageName: string, imagePath: string, imageUrl: string) {
    try {
      const subjectContainers = document.querySelectorAll(".qualificationSubject")
      const gradeContainers = document.querySelectorAll(".qualificationGrade")

      const latestResultData: Record<string, string> = {}

      for (let i = 0; i < subjectContainers.length; i++) {
        const subjectSelect = subjectContainers[i] as HTMLSelectElement
        const gradeSelect = gradeContainers[i] as HTMLSelectElement

        const subjectValue = subjectSelect.value
        const gradeValue = gradeSelect.value

        if (subjectValue != "") {
          latestResultData[subjectValue] = gradeValue
        }

      }

      //collection - Result
      const resultDocRef = await addDoc(collection(db, "Result"), {
        ResultBelongTo: userId,
        ResultData: latestResultData,
        ResultImageName: imageName,
        ResultImageFilePath: imagePath,
        ResultImageFileUrl: imageUrl,
      })
      console.log("Document written with ID: ", resultDocRef.id)
    } catch (error) {
      console.error("Error adding document", error)
    }
  }

  async function deleteImageResultDataToFirestore(userId: string | null): Promise<void> {
    const q = query(collection(db, 'Result'), where('ResultBelongTo', '==', userId))
    const querySnapshot = await getDocs(q)
    const deletePromises = querySnapshot.docs.map(async (doc) => {
      await deleteDoc(doc.ref)
    })

    await Promise.all(deletePromises)
  }

  async function addManualInputImage() {
    try {
      const subjectContainers = document.querySelectorAll(".qualificationSubject")
      const gradeContainers = document.querySelectorAll(".qualificationGrade")

      const latestResultData: Record<string, string> = {}

      for (let i = 0; i < subjectContainers.length; i++) {
        const subjectSelect = subjectContainers[i] as HTMLSelectElement
        const gradeSelect = gradeContainers[i] as HTMLSelectElement

        const subjectValue = subjectSelect.value
        const gradeValue = gradeSelect.value

        if (subjectValue != "") {
          latestResultData[subjectValue] = gradeValue
        }

      }

      await deleteImageResultDataToFirestore(userId)

      //collection - Result
      const resultDocRef = await addDoc(collection(db, "Result"), {
        ResultBelongTo: userId,
        ResultData: latestResultData,
        ResultImageName: null,
        ResultImageFilePath: null,
        ResultImageFileUrl: null,
      })
      console.log("Document written with ID: ", resultDocRef.id)
    } catch (error) {
      console.error("Error adding document", error)
    }
  }

  //proceed to next
  function proceedToNext() {

    //reset all
    if (manualInputStatus || uploadFileStatus) {
      duplicateSubjectStatus = false
      missingSubjectStatus = false
      emptyGradeStatus = false
    }


    //check whether got duplicate subject or not
    if (hasDuplicateSubjects()) {
      duplicateSubjectStatus = true
    } else {
      duplicateSubjectStatus = false
    }

    //check whether got missing subject or not
    const missingSubjects = hasMissingSubject()
    if (missingSubjects.length > 0) {
      missingSubjectStatus = true
    } else {
      missingSubjectStatus = false
    }


    //check whether got empty grade or not
    if (hasEmptyGrade() == true) {
      emptyGradeStatus = true
    } else {
      emptyGradeStatus = false
    }


    //if got duplicate subject
    if (duplicateSubjectStatus || missingSubjectStatus || emptyGradeStatus) {
      console.log("Fail to add inside database")
    }

    //check if user is on "Upload Result" section and has uploaded a file or not
    if (uploadFileStatus && !resultImage) {
      setErrorMessage("Please upload a file")
    }

    if (manualInputStatus && errorMessage == null && !duplicateSubjectStatus && !missingSubjectStatus && !emptyGradeStatus) {
      console.log("CongratsAAA")
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
          addManualInputImage()
          Swal.fire({
            title: "Great",
            text: "Matching data provided with all programmes in database...",
            icon: "success"
          })
          router.push("/uploadResult/filterAfterUpload")
        }
      })

    }

    if (uploadFileStatus && errorMessage == null && !duplicateSubjectStatus && !missingSubjectStatus && !emptyGradeStatus) {
      console.log("Congrats")
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
          addImageResult()
          Swal.fire({
            title: "Great",
            text: "Matching data provided with all programmes in database...",
            icon: "success"
          })
          router.push("/uploadResult/filterAfterUpload")
        }
      })

    }


  }

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

  useEffect(() => {
    //if user upload result then the error message will disappear
    if (uploadFileStatus && resultImage != null) {
      setErrorMessage(null)
    }
    //if user on manual input, then wont have error message and result image
    if (manualInputStatus) {
      setErrorMessage(null)
      setResultImage(null)
    }

  }, [addRowStatus, deleteRowStatus, resultImage, uploadFileStatus, manualInputStatus, errorMessage])

  useEffect(() => {
    async function fetchData() {
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

      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])



  return (
    <div style={{ margin: "20px" }}>
      <div style={{ margin: "20px" }}>
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
        <div className="card" style={{ margin: '30px', width: "100%" }}>
          <div style={{ backgroundColor: "#EDFDFF", margin: '30px', padding: '30px', width: '85%' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Timeline horizontal>
                <Timeline.Item>
                  <Timeline.Point icon={GrDocumentUpload}/>
                  <Timeline.Content>
                    <Timeline.Title>Step 1</Timeline.Title>
                    <Timeline.Body style={{ color: 'green', fontWeight: "bold" }}>
                      Upload SPM Result
                    </Timeline.Body>
                  </Timeline.Content>
                </Timeline.Item>
                <Timeline.Item style={{ margin: '0 auto' }}>
                  <Timeline.Point icon={FaFilter} />
                  <Timeline.Content>
                    <Timeline.Title>Step 2</Timeline.Title>
                    <Timeline.Body>
                      Filter Institute and Programme
                    </Timeline.Body>
                  </Timeline.Content>
                </Timeline.Item>
                <Timeline.Item style={{ marginLeft: 'auto' }}>
                  <Timeline.Point icon={MdOutlineRecommend} />
                  <Timeline.Content>
                    <Timeline.Title>Step 3</Timeline.Title>
                    <Timeline.Body>
                      View Recommended Programmes
                    </Timeline.Body>
                  </Timeline.Content>
                </Timeline.Item>
              </Timeline>
            </div>

            <div className="flex flex-wrap gap-2" style={{ display: 'flex', justifyContent: 'center', paddingBottom: '10px' }}>
              <Button pill onClick={enableUploadResultContainer}>
                Upload Result
              </Button>
              <Button pill onClick={showManualInput}>
                Input Manually
              </Button>
            </div>

            {uploadFileContainer && (
              <div id="fileUpload" className="max-w-md">
                <div className="mb-2 block">
                  <Label htmlFor="file" value="Upload file" />
                </div>
                <FileInput
                  id="file"
                  onChange={(e) => { handleResultImageUpload(e) }}
                />
                {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
              </div>
            )}
            <br />
            <div>
              <div style={{ display: 'flex' }}>
                <table id="table table-borderless" style={{ color: "gray" }}>
                  <thead id="gradeTableThead">
                  </thead>
                  <tbody id="gradeTableBody">
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap gap-2" style={{ margin: "20px" }}>
                {addRowStatus && (
                  <Button pill onClick={handleAddRowContainer}>
                    Add Row
                  </Button>
                )}
                {deleteRowStatus && (
                  <Button pill onClick={handleDeleteRowContainer}>
                    Delete Row
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2" style={{ margin: "20px", display: 'flex', justifyContent: 'center', paddingBottom: '10px' }}>
                <Button pill onClick={proceedToNext}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}