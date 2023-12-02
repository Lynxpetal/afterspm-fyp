'use client'
import { useSearchParams } from "next/navigation"
import { Table, Timeline, Pagination } from 'flowbite-react'
import { useEffect, useState } from "react"
import { FaFilter } from 'react-icons/fa'
import { GrDocumentUpload } from 'react-icons/gr'
import { MdOutlineRecommend } from 'react-icons/md'


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



export default function view() {
  const [filterInstitute, setFilterInstitute] = useState<InstituteType[]>([])
  const searchParams = useSearchParams()

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalData, setTotalData] = useState(0)

  const cardsPerPage = 1
  const onPageChange = (page: number) => setCurrentPage(page)

  const getFinalFilterForCurrentPage = () => {
    const startIndex = (currentPage - 1) * cardsPerPage
    const endIndex = startIndex + cardsPerPage
    return filterInstitute.slice(startIndex, endIndex)
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

  const displayData = () => {
    const data = searchParams.get('search')
    console.log('Data received:', data)

    if (data) {
      try {
        // Try to parse the string into an array
        const dataArray = JSON.parse(data)

        if (Array.isArray(dataArray)) {
          //rearrange data based on desired order
          const rearrangedData = dataArray.map((item) => {
            const reorderedItem = {}
            desiredOrder.forEach((property) => {
              if (item.hasOwnProperty(property)) {
                reorderedItem[property] = item[property]
              }
            })
            return reorderedItem
          })

          setFilterInstitute(rearrangedData)
          console.log('Data length:', rearrangedData.length)
        } else {
          console.error('Invalid data format:', dataArray)
        }
      } catch (error) {
        console.error('Error parsing data:', error);
      }
    }
  }

  useEffect(() => {
    displayData()
  }, [])

  useEffect(() => {
    setTotalData(filterInstitute.length)
    setTotalPages(Math.ceil(filterInstitute.length / cardsPerPage))
  }, [filterInstitute, cardsPerPage])



  return (
    <div className="card" style={{ margin: '30px' }}>
      <div className="card" style={{ margin: '30px', width: "100%" }}>
        <div style={{ backgroundColor: "#EDFDFF", margin: '30px', padding: '30px', width: '95%' }}>
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
                  <Timeline.Body>
                    Filter Institute and Programme
                  </Timeline.Body>
                </Timeline.Content>
              </Timeline.Item>
              <Timeline.Item style={{ marginLeft: 'auto' }}>
                <Timeline.Point icon={MdOutlineRecommend} />
                <Timeline.Content>
                  <Timeline.Title>Step 3</Timeline.Title>
                  <Timeline.Body style={{ color: 'green', fontWeight: "bold" }}>
                    View Recommended Programmes
                  </Timeline.Body>
                </Timeline.Content>
              </Timeline.Item>
            </Timeline>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <Table striped style={{ fontFamily: "Arial, Helvetica, sans-serif", fontWeight: "bold" }}>
            <Table.Body className="=divide-y">
                {getFinalFilterForCurrentPage().length ? (
                  Object.keys(getFinalFilterForCurrentPage()[0]).map((property, index) => (
                    property != 'InstituteName' && property != 'duration' && property != 'Result' && (
                      <Table.Row>
                        <Table.Cell style={{ width: '15%', fontSize: "15px",  border: '1px solid #000', backgroundColor: 'rgba(141, 211, 226, 0.7)' }}>
                          {property}
                        </Table.Cell>
                        {getFinalFilterForCurrentPage().map((inst, dataIndex) => (
                          <Table.Cell key={dataIndex} style={{ width: '20%', backgroundColor: dataIndex % 2 == 0 ? 'rgba(137, 196, 244, 0.3)' : '#E9FFFB', fontSize: "15px",  border: '1px solid #000000' }}>
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
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <img src={inst[property]} alt="Institute Image" height="auto" width="auto" style={{ marginTop: "10px" }} />
                                    <br />
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

            <div className="flex overflow-x-auto sm:justify-left" style={{ color: "black", marginTop: "10px" }}>
              <h1>Showing {currentPage} to {totalPages} of {totalData} Entries </h1>
            </div>
            <div className="flex overflow-x-auto sm:justify-left">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} showIcons />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

}
