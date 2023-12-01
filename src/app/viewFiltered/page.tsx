'use client'
import { useSearchParams } from "next/navigation"
import { Table } from 'flowbite-react'
import { useEffect, useState } from "react"

interface InstituteType {
  "Institute Name": string
  "InstituteName": string
  "Programme Name": string
  "Campus": string
  "Programme Duration": number
  "Programme Estimated Price": number
  "Programme Study Level": string
  "Driving Duration": string
  duration?: string
  "Minimum Entry Requirement": Map<string, string>
  Result?: Map<string, string>
}

const desiredOrder = [
  "Institute Name",
  "InstituteName",
  "Programme Name",
  "Campus",
  "Programme Duration",
  "Programme Estimated Price",
  "Programme Study Level",
  "Driving Duration",
  "duration",
  "Minimum Entry Requirement",
  "Result"
]

interface SubjectData {
  id?: string
  SubjectAbbreviation?: string
  SubjectCode?: string
  SubjectName?: string
}


export default function view() {
  const [filterInstitute, setFilterInstitute] = useState<InstituteType[]>([])
  const searchParams = useSearchParams()


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

  const displayData = () => {
    const data = searchParams.get('search')
    console.log('Data received:', data)
  
    if (data) {
      try {
        // Try to parse the string into an array
        const dataArray = JSON.parse(data);
  
        if (Array.isArray(dataArray)) {
          //rearrange data based on desired order
          const rearrangedData = dataArray.map((item) => {
            const reorderedItem = {}
            desiredOrder.forEach((property) => {
              if (item.hasOwnProperty(property)) {
                reorderedItem[property] = item[property]
              }
            });
            return reorderedItem;
          });
  
          setFilterInstitute(rearrangedData);
          console.log('Data length:', rearrangedData.length)
        } else {
          console.error('Invalid data format:', dataArray);
        }
      } catch (error) {
        console.error('Error parsing data:', error);
      }
    }
  };
  
  useEffect(() => {
    displayData()
  }, [])



  return (
    <div className="card" style={{ margin: '30px' }}>
      <div style={{ overflowX: 'auto' }}>
        <Table striped style={{ fontFamily: "Arial, Helvetica, sans-serif", fontWeight: "bold" }}>
          <Table.Body className="=divide-y">
            {filterInstitute && filterInstitute.length ? (
              Object.keys(filterInstitute[0]).map((property, index) => (
                property != 'InstituteName' && property != 'duration' && property != 'Result' && (
                  <Table.Row style={{ backgroundColor: index % 2 === 0 ? '#E9FFFB' : '#8DD3E2' }}>
                    <Table.Cell style={{ width: '15%', fontSize: "15px" }}>
                      {property}
                    </Table.Cell>
                    {filterInstitute.map((inst, dataIndex) => (
                      <Table.Cell key={dataIndex} style={{ width: '20%', backgroundColor: dataIndex % 2 == 0 ? '#FFFFFF' : '#E9FFFB', fontSize: "15px" }}>
                        {property == 'Minimum Entry Requirement' ? (
                          <div>
                            {Object.keys(inst[property]).map((subject, i) => (
                              <div key={i}>
                                <h1 style={{ textDecoration: 'underline' }}>{subject}</h1>
                                <div>Minimum Entry Requirement: {inst[property][subject]}</div>
                                <div>Your Actual Result: {inst['Result'][subject]}</div>
                                <br />
                              </div>
                            ))}
                          </div>
                        )
                          : property == 'Institute Name'
                            ? (
                              <div>
                                <img src={inst[property]} alt="Institute Image" height="auto" width="auto" style={{ marginTop: "10px" }} />
                                <div>{inst['InstituteName']}</div>
                              </div>
                            )
                            : property == 'Campus'
                              ? (
                                <div>
                                  {getState(inst['Campus'])}
                                </div>
                              )
                              : property == 'Driving Duration'
                                ? (
                                  <div>
                                    <div>{inst['Driving Duration']} ({inst['duration']})</div>
                                  </div>
                                )
                                : inst[property as keyof InstituteType]
                        }
                      </Table.Cell>
                    ))}
                  </Table.Row>
                )
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={5}>There are no institutes.</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  )

}
