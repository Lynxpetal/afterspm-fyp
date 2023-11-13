'use client'
import { programmeCollection } from '../lib/controller'
import { NewProgrammeType } from '../../../types/institute'
import { useEffect, useState } from 'react'
import { DocumentData, QuerySnapshot, deleteDoc, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore'
import MoonLoader from "react-spinners/MoonLoader"
import { Button, Table, Kbd, Pagination } from 'flowbite-react'
import Link from 'next/link'
import { AiOutlineEye } from 'react-icons/ai'
import { AiOutlineEdit } from 'react-icons/ai'
import { AiOutlineDelete } from 'react-icons/ai'
import { FaGraduationCap } from 'react-icons/fa'
import { GrAddCircle } from 'react-icons/gr'
import Swal from 'sweetalert2'
import { db } from '../FirebaseConfig/firebaseConfig'


export default function ProgrammeAdmin() {
  const [programme, setProgramme] = useState<NewProgrammeType[]>([])
  const [isProgrammeFetchAllDataLoading, setIsProgrammeFetchAllDataLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  //know how many pages based on data stored inside firebase
  const [totalPages, setTotalPages] = useState(1)
  const [totalData, setTotalData] = useState(0)
  const [startProgrammeIndex, setStartProgrammeIndex] = useState(1)
  const itemsPerPage = 6
  const onPageChange = (page: number) => setCurrentPage(page)


  //fetch programme data from database and display
  const fetchAllProgrammeData = async () => {
    //calculate the start and end index based on the current page
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setStartProgrammeIndex(startIndex)
    //data is fetching = loading
    setIsProgrammeFetchAllDataLoading(true)

    //display data by latest update timestamp
    const q = query(programmeCollection, orderBy('ProgrammeLastUpdateTimestamp', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const totalItems = snapshot.docs.length
      setTotalData(totalItems)
      //to know total page
      setTotalPages(Math.ceil(totalItems / itemsPerPage))

      //only get the data based on the current page
      const slicedProgrammeData = snapshot.docs.slice(startIndex, endIndex).map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProgramme(slicedProgrammeData)
      setIsProgrammeFetchAllDataLoading(false)
    })

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }

  const handleDeleteProgrammeClick = (id: string | undefined) => {
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
        const instituteDocRef = doc(db, 'Programme', id)
        deleteDoc(instituteDocRef)
        Swal.fire({
          title: "Deleted!",
          text: "This programme data has been deleted.",
          icon: "success"
        });
      }
    });

  }

  //trigger fetch when currentPage changes
  useEffect(() => {
    fetchAllProgrammeData();
  }, [currentPage])

  if (isProgrammeFetchAllDataLoading)
    return <div className="grid">
      <MoonLoader
        loading={isProgrammeFetchAllDataLoading}
        size={50}
        color="#8DD3E2"

      />
      <h1>Loading...</h1>
    </div>
  return (
    <div className="card" style={{ margin: '30px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h2 style={{ color: 'black', display: 'flex', alignItems: 'center' }}>
          <FaGraduationCap className="mr-2 h-5 w-5" />
          All Programmes in the database
        </h2>
      </div>
      <div>
        <Button style={{ backgroundColor: "#B8FFCC", color: "black", marginBottom: "30px", marginTop: "30px" }}>
          <GrAddCircle className="mr-2 h-5 w-5" />
          <Link href={{ pathname: '/programmeAdmin/addProgramme' }}>Add Programme</Link>
        </Button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <Table striped>
          <Table.Head>
            <Table.HeadCell style={{ width: '5%', backgroundColor: '#8DD3E2' }}>ID</Table.HeadCell>
            <Table.HeadCell style={{ width: '20%', backgroundColor: '#8DD3E2' }}>Programme Name</Table.HeadCell>
            <Table.HeadCell style={{ width: '20%', backgroundColor: '#8DD3E2' }}>Offered By</Table.HeadCell>
            <Table.HeadCell style={{ width: '5%', backgroundColor: '#8DD3E2' }}>Duration</Table.HeadCell>
            <Table.HeadCell style={{ width: '15%', backgroundColor: '#8DD3E2' }}>Study Level</Table.HeadCell>
            <Table.HeadCell style={{ width: '15%', backgroundColor: '#8DD3E2' }}>Last Update</Table.HeadCell>
            <Table.HeadCell style={{ width: '20%', backgroundColor: '#8DD3E2' }}>Actions</Table.HeadCell>
          </Table.Head>

          <Table.Body className="divide-y">
            {programme && programme.length ? (
              programme.map((prgm, index) => (
                <Table.Row
                  key={prgm.id}
                  style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#E9FFFB' }}
                >
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white" style={{ width: '5%' }}>{startProgrammeIndex + index + 1}</Table.Cell>
                  <Table.Cell style={{ width: '20%' }}>{prgm.ProgrammeName}</Table.Cell>
                  <Table.Cell style={{ width: '20%' }}>{prgm.InstituteName}</Table.Cell>
                  <Table.Cell style={{ width: '5%' }}>{prgm.ProgrammeDuration}</Table.Cell>
                  <Table.Cell style={{ width: '15%' }}>{prgm.ProgrammeStudyLevel}</Table.Cell>
                  <Table.Cell style={{ width: '15%' }}>{prgm.ProgrammeLastUpdateTimestamp?.toDate().toString()}</Table.Cell>
                  <Table.Cell style={{ width: '20%' }}>
                    <div>
                      <Link
                        href={{
                          pathname: '/programmeAdmin/viewProgrammeDetails',
                          query: {
                            search: prgm.id
                          }
                        }}
                      >
                        <Kbd icon={AiOutlineEye} style={{ fontSize: '18px' }} />
                      </Link>
                      <Link
                        href={{
                          pathname: '/programmeAdmin/updateProgramme',
                          query: {
                            search: prgm.id
                          }
                        }}
                      >
                        <Kbd icon={AiOutlineEdit} style={{ fontSize: '18px' }} />
                      </Link>
                      <Kbd icon={AiOutlineDelete} style={{ fontSize: '18px' }} onClick={() => handleDeleteProgrammeClick(prgm.id)} />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <tr>
                <td colSpan={4}>There are no programme.</td>
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

  )
}