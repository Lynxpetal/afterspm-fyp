"use client"
import { FC, HTMLAttributes, useState } from "react";
import { cn } from "../lib/validators/utils";

interface questionFormat {
    labels: string
    options: number[]
    answers: string
    category: string
}
interface ChatMessagesProps extends HTMLAttributes<HTMLDivElement> {
    Form: questionFormat[]
    Title: string
}

import { Label, Radio } from 'flowbite-react';


const PsychForm: FC<ChatMessagesProps> = ({ className, Form, Title, ...props }) => {
    const [CurrentForm, setCurrentForm] = useState<questionFormat[]>(Form)

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

    return (
        <div
            {...props}
            className={cn(
                '',
                className
            )}>
            <fieldset className="flex max-w-md flex-col gap-4">
                <legend className="mb-4 text-xl">{Title}</legend>
                {
                    CurrentForm.map((questions) => {
                        return <fieldset className="flex max-w-md flex-col gap-4">
                            <legend className="mb-4">{questions.labels}</legend>
                            {questions.options.map((option) => {
                                return <div className="flex items-center gap-2">
                                    <Radio id="united-state" name={questions.labels} value={option} defaultChecked />
                                    <Label htmlFor="united-state">
                                        {getLabel(option)}</Label>
                                </div>
                            })}
                        </fieldset>
                    })}
            </fieldset >
        </div >
    )
}

export default PsychForm