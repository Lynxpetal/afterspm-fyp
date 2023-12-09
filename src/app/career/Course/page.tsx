"use client"

import { FC, HTMLAttributes, use, useEffect, useRef, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { careerCollection, testCollection } from "@/app/lib/controller";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Banner, Button, Label, Spinner, Table, TextInput } from 'flowbite-react';
import TextareaAutosizeProps from "react-textarea-autosize";
import { MdAnnouncement } from "react-icons/md";
import { HiX } from "react-icons/hi";
import { useRouter } from "next/router";
import { string } from "zod";
import useStringStore from "@/app/helpers/store/store";


export default function Reccomend() {
    const textareaRef = useRef<null | HTMLTextAreaElement>(null)
    const [reccomendations, setReccomendation] = useState(' ^^^ Try inserting a career above to get some interesting reccomendations for courses you can pursue! ^^^')
    const [input, setInput] = useState<string>("")
    const [isLoading, setLoading] = useState<boolean>(false)
    const { value, resetValue } = useStringStore()
    useEffect(() => {
        setInput(value)
    }, []);

    async function onReccomend() {
        setLoading(true)
        await fetch("http://localhost:5000/Career/Course", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: input
            })
        }).then(response => {
            let output = response.json()
            console.log(output)
            return output
        }).then(message => {
            console.log(message["message"])
            let received = String(message["message"])
            setReccomendation(received)

        })
            .catch(error => console.error('Error:', error));
        setLoading(false)
        resetValue()
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
                                <TextareaAutosizeProps
                                    ref={textareaRef}
                                    rows={2}
                                    id="userInput"
                                    maxRows={4}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    autoFocus
                                    disabled={isLoading}
                                    placeholder={"Provide a career you would like to pursue! Doctor, Accountant, etc."}
                                    className="peer z-0 disabled:opacity-50 resize-none block border-0 bg-white py-1.5 text-gray-900 focus:ring-0 text-md sm:leading-6 w-7/12 xl:w-10/12 2xl:w-11/12 lg:w-9/12 rounded" />
                                <Button type="submit" disabled={isLoading} onClick={onReccomend} className=" w-48 m-6  ">Submit</Button>
                            </div>
                        </div>

                    </form>
                </div>

                {isLoading ? <div className="flex py-20 bg-white w-full justify-center"><Spinner size="xl" /></div> : <div className=" text-left bg-white p-6 font-mono font-normal antialiased min-w-full" style={{ whiteSpace: 'pre-line' }} >{reccomendations}</div>}


            </div>
            <Banner className="absolute bottom-9 w-[80%] mx-12">
                <div className="flex w-full justify-between border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                    <div className="mx-auto flex items-center">
                        <p className="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400">
                            <MdAnnouncement className="mr-4 h-4 w-4" />
                            <span>
                                You can insert multiple course inside the input to let the reccomender find the best course for your career. <br /> i.e. Software Developer, Diploma in Computer Science, Diploma in Information Technology, Diploma in Software Engineering.
                            </span>
                        </p>
                    </div>
                    <Banner.CollapseButton color="gray" className="border-0 bg-transparent text-gray-500 dark:text-gray-400">
                        <HiX className="h-4 w-4" />
                    </Banner.CollapseButton>
                </div>
            </Banner>
        </div>
    )


}

