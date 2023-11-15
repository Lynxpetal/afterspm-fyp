"use client"
import { FC, HTMLAttributes, useEffect, useState } from "react";
import { cn } from "../lib/validators/utils";
import { Button, Label, Pagination, Progress, Radio, Tooltip } from 'flowbite-react';
import { Question } from "../lib/validators/message";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../FirebaseConfig/firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { testCollection } from "../lib/controller";



interface FormProps extends HTMLAttributes<HTMLDivElement> {
    Form: Question[]
    Title: string
}

const PsychForm: FC<FormProps> = ({ className, Form, Title, ...props }) => {
    const [Answer, setAnswer] = useState<Number[]>(Array(Form.length).fill(0))
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [ProgressState, setProgressState] = useState<number>(0)
    const onPageChange = (page: number) => {
        setCurrentPage(page)
    };
    async function submitForms(HollandResult: string, BigFiveResult: string) {
        const auth = getAuth()
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const q = query(testCollection, where("user", "==", user.uid))
                const querySnapshot = await getDocs(q)

                if (querySnapshot.size == 0) {
                    try {
                        // collection - Test
                        await addDoc(collection(db, "Test"), {
                            UserID: user.uid,
                            BigFiveResult: BigFiveResult,
                            HollandResult: HollandResult, 
                        })
                        console.log("Document written with ID")
                        return true
                    } catch (error) {
                        console.error("Error adding document", error)
                        return false
                    }
                }
                else{
                    querySnapshot[0]
                }
            }
            else {
                console.log("no id")
            }
        })

    }

    function onSubmit() {
        console.log("halo")
        let temp = document.querySelectorAll("input")
        if (temp != null) {
            temp.forEach(element => {
                if (element.checked) {
                    let change: number = Number(element.value)
                    let answer = Answer
                    answer[currentPage - 1] = change
                    setAnswer(answer)
                }
            });
        }
        let count = 0
        Answer.forEach(element => {
            if (element != 0) {
                count++
            }
            console.log("working")
        });
        console.log(count / Answer.length * 100)
        setProgressState(count / Answer.length * 100)
        console.log(Answer)
    }

    function getLabel(value: number) {
        switch (value) {
            case 1:
                return "Disagree"
            case 2:
                return "Slightly Disagree"
            case 3:
                return "Maybe"
            case 4:
                return "Slightly Agree"
            case 5:
                return "Agree"
            default:
                console.log("invalid value");
                break;
        }
    }
    function pageDisplay() {
        return <fieldset className="flex max-w-md pl-11 flex-col gap-4">
            <legend className="mb-4 text-lg font-semibold antialiased">{Form[currentPage].label}</legend>
            {Form[currentPage].options.map((option) => {
                return <div className="flex pl-6 items-center gap-2">
                    <Radio id={Form[currentPage].label + option} name={Form[currentPage].label} value={option} />
                    <Label htmlFor="united-state">
                        {getLabel(option)}</Label>
                </div>
            })}
            <Button type="submit" onClick={onSubmit}>Confirm Answer</Button>
        </fieldset>
    }
    function progressDisplay() {
        return (
            <div className="flex flex-col gap-3">
                <Progress progress={ProgressState} />
                <div className=" flex flex-wrap gap-1 shadow-md rounded-md">{Answer.map(element => {
                    return <div className={cn(" h-10 w-10 border-solid border-2 border-white rounded-md", {
                        " bg-slate-600": element == 0,
                        " bg-green-400": element != 0 && element != null,
                    })} />
                })
                }</div></div>)
    }

    return (
        <div
            {...props}
            className={cn(
                'relative',
                className
            )}>
            <div className="flex flex-col gap-10">
                <fieldset className="flex mt-5 py-10 w-full flex-col gap-4 shadow-md rounded bg-white">
                    <legend className="m-3 p-3 text-2xl font-semibold antialiased bg-slate-50 shadow-md rounded-md">{Title}</legend>
                    {pageDisplay()}
                </fieldset >
                {progressDisplay()}
                <div className="flex overflow-x-auto sm:justify-center">
                    <Pagination layout="navigation" currentPage={currentPage} totalPages={Form.length} onPageChange={onPageChange} showIcons />
                </div>
            </div>
            <div className="absolute inset-y-40 right-10 content-center">
                <Tooltip className="" content="Make sure you answer all the questions">
                    <Button gradientDuoTone="greenToBlue" className="w-40 h-40 text-center justify-center rounded-lg shadow-lg" >Submit Form</Button>
                </Tooltip>
            </div>
        </div >
    )
}

export default PsychForm