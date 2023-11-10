'use client';

import { FileInput, Label, Select } from 'flowbite-react'
import React, { useState, useEffect } from 'react'
import { db } from '../FirebaseConfig/firebaseConfig'
import { collection, getDocs, onSnapshot } from 'firebase/firestore'

interface SubjectData {
  id?: string
  SubjectAbbreviation?: string
  SubjectCode?: string
  SubjectName?: string
}

interface GradeData {
  id?: string
  GradeName?: string
  GradeValue?: string
}

export default function uploadResult() {
  const [message, setMessage] = useState('')
  const [subjectAbbreviation, setSubjectAbbreviation] = useState<Record<string, string>>({});
  const gradeOptions = ["A+", "A", "A-", "B+", "B", "C+", "C", "D", "E", "G", "X"]

  //select from multiple options 
  function createSelect(className: string, name: string, id: string, arialabel: string) {
    const select = document.createElement("select")
    select.className = className
    select.name = name
    select.id = id
    select.ariaLabel = arialabel
    return select
  }

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

  };

  function createTableHeader(text:string, width: string) {
    const header = document.createElement("th")
    header.textContent = text
    header.style.width = width
    return header

  }

  const handleResultImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const resultFileInput = e.target.files?.[0];

    //FormData - set a new value for existing key inside object, or add the key/value if it does not exist
    const formData = new FormData()
    formData.append("file", resultFileInput)

    fetch("http://localhost:5000/uploadResult", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {

        //thread
        const gradeTableThread = document.getElementById("gradeTableThread")
        if(gradeTableThread) {
          gradeTableThread.innerHTML = ''
        }
        const headerRow = document.createElement("tr")

        //create the header for first subject and grade
        headerRow.appendChild(createTableHeader("Subject", "35%"))
        headerRow.appendChild(createTableHeader("Grade", "15%"))

        //create the header for second subject and grade
        headerRow.appendChild(createTableHeader("Subject", "35%"))
        headerRow.appendChild(createTableHeader("Grade", "15%"))

        //add inside th section
        gradeTableThread?.appendChild(headerRow)

        //get how many data then compute number of rows
        const count = Object.keys(data).length
        const numberOfRowsToDisplay = (count / 2) + 1

        //11 subjects so 6 rows
        for (let i = 1; i < numberOfRowsToDisplay; i++) {
          addTableDetails()
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
        for(let i = 0; i < subjectContainers.length; i++) {
          const subjectSelect = subjectContainers[i] as HTMLSelectElement
          const gradeSelect = gradeContainers[i] as HTMLSelectElement

          if (i < dataKeys.length) {
            //subjectKey = "BM"
            const subjectKey = dataKeys[i];
            console.log(subjectKey)
            //gradeValue = "A+"
            //data format: {"BM": "A+", ...}
            //so data["BM"] = "A+"
            const gradeValue = data[subjectKey]
            console.log(gradeValue)

            //Iterate over subject options and set the selected index when thers's a match
            for(let j = 0; j < subjectSelect?.options.length; j++) {          
              //subject selected index will be "BM"
              if(subjectSelect?.options[j].value == subjectKey) {
                subjectSelect.selectedIndex = j
                break
              }
            }

            //Iterate over grade options and set the selected index when there's a match
            for(let k = 0; k < gradeSelect?.options.length; k++) {
              //grade selected will be "A+"
              if(gradeSelect?.options[k].value == gradeValue) {
                gradeSelect.selectedIndex = k
                break
              }
            }
          } else {
            //if no data for this row, then reset the selections
            if(subjectSelect && gradeSelect) {
              subjectSelect.selectedIndex = 0
              gradeSelect.selectedIndex = 0
            }

          }


        }


      })
  }


  useEffect(() => {
    async function fetchData() {
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

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    console.log(subjectAbbreviation);
  }, [subjectAbbreviation]);


  return (
    <div>
      <p>{message}</p>
      <div id="fileUpload" className="max-w-md">
        <div className="mb-2 block">
          <Label htmlFor="file" value="Upload file" />
        </div>
        <FileInput
          id="file"
          onChange={(e) => { handleResultImageUpload(e) }}
        />
      </div>
      <br />
      <div>
        <div style={{ display: 'flex' }}>
          <table id="table table-borderless" style={{ color: "gray" }}>
            <thead id="gradeTableThread">
            </thead>
            <tbody id="gradeTableBody">
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}