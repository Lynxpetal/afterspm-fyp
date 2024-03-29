'use client'
import { Button, Table, Kbd, Pagination } from 'flowbite-react'
import { useState, useEffect } from 'react'
import { DocumentData, QuerySnapshot, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore'
import { instituteCollection } from '../lib/controller'
import { NewInstituteType } from '../../../types/institute'
import { AiOutlineEye } from 'react-icons/ai'
import { AiOutlineEdit } from 'react-icons/ai'
import { AiOutlineDelete } from 'react-icons/ai'
import Link from 'next/link'
import MoonLoader from "react-spinners/MoonLoader"
import { GrAddCircle } from 'react-icons/gr'
import { FaUniversity } from 'react-icons/fa'
import Swal from 'sweetalert2'
import { db } from '../FirebaseConfig/firebaseConfig'


export default function InstituteAdmin() {
  const [institute, setInstitute] = useState<NewInstituteType[]>([])
  const [isInstituteFetchAllDataLoading, setIsInstituteFetchAllDataLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  //know how many pages based on data stored inside firebase
  const [totalPages, setTotalPages] = useState(1)
  const [totalData, setTotalData] = useState(0)
  const [startInstituteIndex, setStartInstituteIndex] = useState(1)

  const itemsPerPage = 6
  const onPageChange = (page: number) => setCurrentPage(page)

  const fetchAllInstituteData = async () => {
    //calculate the start and end index based on the current page
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setStartInstituteIndex(startIndex)
    //data is fetching = loading
    setIsInstituteFetchAllDataLoading(true)

    //display data by latest update timestamp
    const q = query(instituteCollection, orderBy('InstituteLastUpdateTimestamp', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const totalItems = snapshot.docs.length
      setTotalData(totalItems)
      //to know total page
      setTotalPages(Math.ceil(totalItems / itemsPerPage))

      //only get the data based on the current page
      const slicedInstituteData = snapshot.docs.slice(startIndex, endIndex).map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setInstitute(slicedInstituteData)
      setIsInstituteFetchAllDataLoading(false)
    })


    // Cleanup the listener when the component unmounts
    return () => unsubscribe()
  }

  const handleDeleteInstituteClick = (id: string | undefined) => {
    console.log(id)
    Swal.fire({
      title: "Are you sure?",
      text: "This process cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete"
    }).then((result) => {
      if (result.isConfirmed) {
        const instituteDocRef = doc(db, 'Institute', id)
        deleteDoc(instituteDocRef)
        Swal.fire({
          title: "Deleted!",
          text: "This institute data has been deleted.",
          icon: "success"
        })
      }
    })

  }

  //trigger fetch when currentPage changes
  useEffect(() => {
    fetchAllInstituteData()
  }, [currentPage])

  if (isInstituteFetchAllDataLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="card p-3 m-3 flex justify-center items-center">
        <div className="grid">
          <MoonLoader
            loading={isInstituteFetchAllDataLoading}
            size={50}
            color="#8DD3E2"
          />
          <h1 style={{ color: "black" }}>Loading... Fetching institute data from the database</h1>
        </div>
      </div>
    </div>
  )
  return (
    <div className="flex justify-center items-center">
      <div className="card w-full p-3 m-3 flex justify-center items-center">
        <div className='p-3 m-3 bg-slate-100 w-[100%]' style={{ padding: "30px" }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ color: 'black', display: 'flex', alignItems: 'center' }}>
              <FaUniversity className="mr-2 h-5 w-5" />
              All Institutes In The Database
            </div>
          </div>
          <div>
            <Button style={{ marginBottom: "30px", marginTop: "30px" }}>
              <GrAddCircle className="mr-2 h-5 w-5" />
              <Link href={{ pathname: '/instituteAdmin/addInstitute' }}>Add Institute</Link>
            </Button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <Table striped>
              <Table.Head>
                <Table.HeadCell style={{ width: '5%', backgroundColor: '#8DD3E2' }}>ID</Table.HeadCell>
                <Table.HeadCell style={{ width: '20%', backgroundColor: '#8DD3E2' }}>Name</Table.HeadCell>
                <Table.HeadCell style={{ width: '15%', backgroundColor: '#8DD3E2' }}>Email Address</Table.HeadCell>
                <Table.HeadCell style={{ width: '10%', backgroundColor: '#8DD3E2' }}>Phone Number</Table.HeadCell>
                <Table.HeadCell style={{ width: '15%', backgroundColor: '#8DD3E2' }}>Last Update</Table.HeadCell>
                <Table.HeadCell style={{ width: '15%', backgroundColor: '#8DD3E2' }}>Actions</Table.HeadCell>
              </Table.Head>

              <Table.Body className="divide-y">
                {institute && institute.length ? (
                  institute.map((inst, index) => (
                    <Table.Row
                      key={inst.id}
                      style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : 'rgba(137, 207, 240, 0.3)' }}
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white" style={{ width: '5%' }}>{startInstituteIndex + index + 1}</Table.Cell>
                      <Table.Cell style={{ width: '20%' }}>{inst.InstituteName}</Table.Cell>
                      <Table.Cell style={{ width: '15%' }}>{inst.InstituteEmailAddress}</Table.Cell>
                      <Table.Cell style={{ width: '10%' }}>{inst.InstitutePhoneNumber}</Table.Cell>
                      <Table.Cell style={{ width: '15%' }}>{inst.InstituteLastUpdateTimestamp?.toDate().toString()}</Table.Cell>
                      <Table.Cell style={{ width: '15%' }}>
                        <div>
                          <Link
                            href={{
                              pathname: '/instituteAdmin/viewInstituteDetails',
                              query: {
                                search: inst.id
                              }
                            }}
                          >
                            <Kbd icon={AiOutlineEye} style={{ fontSize: '18px' }} />
                          </Link>
                          <Link
                            href={{
                              pathname: '/instituteAdmin/updateInstitute',
                              query: {
                                search: inst.id
                              }
                            }}
                          >
                            <Kbd icon={AiOutlineEdit} style={{ fontSize: '18px' }} />
                          </Link>
                          <Kbd icon={AiOutlineDelete} style={{ fontSize: '18px' }} onClick={() => handleDeleteInstituteClick(inst.id)} />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>There are no institutes.</td>
                  </tr>
                )}
              </Table.Body>
            </Table>
          </div>
          <div className="flex overflow-x-auto sm:justify-left" style={{ color: "black", marginTop: "10px" }}>
            <h1>Showing {currentPage} to {totalPages} of {totalData} Entries </h1>
          </div>
          <div className="flex overflow-x-auto sm:justify-left">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} showIcons />
          </div>
        </div>
      </div>
    </div>

  )
}