'use client';
import { Button, Label, ListGroup, TextInput, Table, Kbd } from 'flowbite-react'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { DocumentData, QuerySnapshot, onSnapshot } from 'firebase/firestore'
import { instituteCollection } from '../lib/controller'
import { NewInstituteType } from '../../../types/institute'
import { AiOutlineEye } from 'react-icons/ai'
import { AiOutlineEdit } from 'react-icons/ai'
import { AiOutlineDelete } from 'react-icons/ai'
import Link from 'next/link'
import MoonLoader from "react-spinners/MoonLoader";

export default function InstituteAdmin() {
  const [institute, setInstitute] = useState<NewInstituteType[]>([])
  const [isInstituteFetchAllDataLoading, setIsInstituteFetchAllDataLoading] = useState(true)

  const fetchAllInstituteData = async () => {
    //data is fetching = loading
    setIsInstituteFetchAllDataLoading(true);

    const unsubscribe = onSnapshot(instituteCollection, (snapshot: QuerySnapshot<DocumentData>) => {
      setInstitute(
        snapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        })
      );
      setIsInstituteFetchAllDataLoading(false);

    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }

  useEffect(() => {
    fetchAllInstituteData();
  }, [])

  console.log(institute, "institute");

  if (isInstituteFetchAllDataLoading)
    return <div className="grid">
      <MoonLoader
        loading={isInstituteFetchAllDataLoading}
        size={50}
        color="#8DD3E2"

      />
      <h1>Loading...</h1>
    </div>
  return (
    <div className="card" style={{ margin: '30px' }}>
      <h2 className='title'>All Institute</h2>
      <div style={{ overflowX: 'auto' }}>
        <Table striped>
          <Table.Head>
            <Table.HeadCell style={{ width: '5%', backgroundColor: '#8DD3E2' }}>ID</Table.HeadCell>
            <Table.HeadCell style={{ width: '35%', backgroundColor: '#8DD3E2' }}>Name</Table.HeadCell>
            <Table.HeadCell style={{ width: '15%', backgroundColor: '#8DD3E2' }}>Email Address</Table.HeadCell>
            <Table.HeadCell style={{ width: '15%', backgroundColor: '#8DD3E2' }}>Phone Number</Table.HeadCell>
            <Table.HeadCell style={{ width: '15%', backgroundColor: '#8DD3E2' }}>Last Update</Table.HeadCell>
            <Table.HeadCell style={{ width: '15%', backgroundColor: '#8DD3E2' }}>Actions</Table.HeadCell>
          </Table.Head>

          <Table.Body className="divide-y">
            {institute && institute.length ? (
              institute.map((inst, index) => (
                <Table.Row
                  key={inst.id}
                  style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#E9FFFB' }}
                >
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white" style={{ width: '5%' }}>{index + 1}</Table.Cell>
                  <Table.Cell style={{ width: '35%' }}>{inst.InstituteName}</Table.Cell>
                  <Table.Cell style={{ width: '15%' }}>{inst.InstituteEmailAddress}</Table.Cell>
                  <Table.Cell style={{ width: '15%' }}>{inst.InstitutePhoneNumber}</Table.Cell>
                  <Table.Cell style={{ width: '15%' }}>{inst.InstituteLastUpdateTimestamp?.toDate().toUTCString()}</Table.Cell>
                  <Table.Cell style={{ width: '15%' }}>
                    <div className="flex flex-wrap gap-1">
                      <Link
                        href={{
                          pathname: '/instituteAdmin/instituteDetails',
                          query: {
                            search: inst.id
                          }
                        }}
                      >
                        <Kbd icon={AiOutlineEye} />
                      </Link>
                      <Kbd icon={AiOutlineEdit} />
                      <Kbd icon={AiOutlineDelete} />
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
    </div>
  )
}