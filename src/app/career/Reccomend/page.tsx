"use client"

import { FC, HTMLAttributes, use, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { careerCollection, testCollection } from "@/app/lib/controller";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Button, Table } from 'flowbite-react';
import { HiOutlineArrowRight } from "react-icons/hi";
import Link from "next/link";


interface JobData {
    jobTitle: string;
    percentage: string;
}

export default function Reccomend() {
    const [reccomendations, setReccomendation] = useState<JobData[]>()
    const [uid, setUID] = useState('')
    const [displayResult, setDisplayResult] = useState([[0], [0]])
    const defaultTable = [['No Result Found'], ['No Result Found']]
    

    const auth = getAuth()
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            if (user.uid != uid) {
                setUID(user.uid)
                const q = query(testCollection, where("UserID", "==", user.uid))
                const reccomends = query(careerCollection, where("UserID", "==", user.uid))
                const reccoSnapshot = await getDocs(reccomends)
                if (reccoSnapshot.size != 0) {
                    setReccomendation(reccoSnapshot.docs[0].data().Careers.split(","))
                }
                const querySnapshot = await getDocs(q)
                //check if doc exist
                if (querySnapshot.size != 0) {
                    var hollandResult: number[] = [0, 0, 0, 0, 0, 0]
                    var bigFiveResult: number[] = [0, 0, 0, 0, 0]
                    //holland RIASEC result processing for easier display
                    if (querySnapshot.docs[0].data().HollandResult != "none") {
                        var hollandArr: number[] = JSON.parse("[" + querySnapshot.docs[0].data().HollandResult + "]")
                        for (let i = 0; i < 6; i++) {
                            for (let j = 0; j < 8; j++) {
                                hollandResult[i] += hollandArr[(i * 8 + j)]

                            }
                            hollandResult[i] = hollandResult[i] / 8
                        }
                    }
                    //big5 OCEAN result processing for easier display  **ENACO in this case
                    if (querySnapshot.docs[0].data().BigFiveResult != "none") {
                        var bigFiveArr: number[] = JSON.parse("[" + querySnapshot.docs[0].data().BigFiveResult + "]")
                        for (let i = 0; i < 5; i++) {
                            for (let j = 0; j < 10; j++) {
                                bigFiveResult[i] += bigFiveArr[i * 10 + j]
                            }
                            bigFiveResult[i] /= 10
                        }
                    }
                    setDisplayResult([hollandResult, bigFiveResult])
                }

            }
        }
    })

    function onReccomend() {
        fetch("http://localhost:5000/Career/Recommend", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                hollands: displayResult[0],
                bigfive: displayResult[1],
            })
        }).then(response => {
            let output = response.json()
            return output
        }).then(message => {
            let received = String(message["message"])
            console.log(received)
            const dataArray: JobData[] = JSON.parse(received).map(
                ([jobTitle, percentage]: [string, string]) => ({
                  jobTitle,
                  percentage,
                })
              );
            setReccomendation(dataArray)
        })
            .catch(error => console.error('Error:', error));
    }

    
    
    return (
        <div className={"flex flex-col min-h-screen "}>
            <div className="p-10 m-6 bg-slate-100">
                <legend className=" text-xl font-bold antialiased pl-20 p-4 m-3 bg-slate-300">
                    Your Test Results
                </legend>
                <Table striped hoverable>
                    <Table.Body className="divide-y">
                        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                Test Name
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                Realistic
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                Investigative
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                Artistic
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                Social
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                Enterprising
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                Conventional
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                Holland's Test
                            </Table.Cell>
                            {displayResult[0][0] != 0 ? displayResult[0].map((individual) => {
                                return <Table.Cell>{individual}</Table.Cell>
                            }) : <Table.Cell>{defaultTable[0]}</Table.Cell>}
                        </Table.Row>
                        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                Test Name
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                Extraversion
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                Neuroticism
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                Agreeableness
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                Conscientiousness
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                Openness
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                -
                            </Table.Cell>

                        </Table.Row>
                        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                Big Five Test
                            </Table.Cell>
                            {displayResult[1][0] != 0 ? displayResult[1].map((individual) => {
                                return <Table.Cell>{individual}</Table.Cell>
                            }) : <Table.Cell>{defaultTable[1]}</Table.Cell>}
                        </Table.Row>
                    </Table.Body>
                </Table>
                <hr className=" bg-black h-0.5 my-10" />
                <legend className=" text-lg font-bold antialiased pl-20 p-4 m-3 bg-slate-300">
                    Careers you should try looking into
                </legend>
                <Table striped hoverable>
                    <Table.Head>
                        <Table.HeadCell>Career</Table.HeadCell>
                        <Table.HeadCell>Compatibility</Table.HeadCell>
                        <Table.HeadCell>
                            <span className="sr-only">Know More</span>
                        </Table.HeadCell>
                    </Table.Head>
                    {reccomendations ?
                        <Table.Body className="divide-y">
                            {reccomendations.map((career) => {
                                let tabler:string[] = []
                                tabler.push(career.jobTitle)
                                tabler.push(career.percentage)
                                tabler.push("what to study?")
                                return <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                    {tabler.map((field) => {
                                        if (field == "what to study?") {
                                            return <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                <Link href="/career/Course" >{field}</Link>
                                            </Table.Cell>
                                        }
                                        return <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            {field}
                                        </Table.Cell>
                                    })}
                                </Table.Row>
                            })}
                        </Table.Body> : <></>}
                </Table>
                {reccomendations ?<></> : <div className="text-center bg-white hover:bg-gray-100">No reccomendations made yet press the button below to get reccomendations</div>}
                <div className="bg-white row-span-full  flex items-center justify-center">
                    <Button className="my-9" onClick={onReccomend} pill>
                        Get Reccomendation
                        <HiOutlineArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )


}

