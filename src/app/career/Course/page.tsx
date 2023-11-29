"use client"

import { FC, HTMLAttributes, use, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { careerCollection, testCollection } from "@/app/lib/controller";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Button, Label, Table, TextInput } from 'flowbite-react';
import { HiOutlineArrowRight } from "react-icons/hi";
import Link from "next/link";
import { split } from "postcss/lib/list";


export default function Reccomend() {
    const [reccomendations, setReccomendation] = useState([''])
    const [uid, setUID] = useState('')
    const [displayResult, setDisplayResult] = useState([[0], [0]])


    const auth = getAuth()
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            if (user.uid != uid) {
                setUID(user.uid)
                const reccomends = query(careerCollection, where("UserID", "==", user.uid))
                const reccoSnapshot = await getDocs(reccomends)
                if (reccoSnapshot.size != 0) {
                    setReccomendation(reccoSnapshot.docs[0].data().Careers.split(","))
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
                reccomendations: displayResult
            })
        }).then(response => {
            let output = response.json()
            console.log(output)
            return output
        }).then(message => {
            console.log(message["message"])
            let received = String(message["message"])
            setReccomendation(received.split(","))
        })
            .catch(error => console.error('Error:', error));
    }


    return (
        <div className={"flex flex-col min-h-screen "}>
            <div className="p-10 m-6 bg-slate-100 flex flex-col items-center justify-center">
                <legend className=" text-xl font-bold antialiased pl-20 p-4 m-3 w-full bg-slate-300">
                    Course Reccomender
                </legend>
                <div className="p-4 w-full bg-slate-50">
                    <form className="flex w-11/12 ml-16 pl-12 p-3 gap-4 bg-slate-100">
                        <div className=" w-4/6">
                            <div>
                                <div className="mb-2 block">
                                    <Label value="Insert Career Here" />
                                </div>
                                <TextInput placeholder="doctor, accountant, etc." required />
                                <Button type="submit" onClick={onReccomend} className=" w-48 m-6  ">Submit</Button>
                            </div>
                        </div>
                        
                    </form>
                </div>

                {reccomendations[0] == '' ? <div className="text-center">no reccomendations yet try pressing submit?</div> : <></>}
                <div className="bg-white row-span-full  flex items-center justify-center">
                     
                </div>
            </div>
        </div>
    )


}

