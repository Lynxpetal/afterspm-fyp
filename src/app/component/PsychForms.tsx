"use client"
import { FC, HTMLAttributes, useState } from "react";
import { cn } from "../lib/validators/utils";
import { Label, Radio } from 'flowbite-react';
import { Question } from "../lib/validators/message";


interface FormProps extends HTMLAttributes<HTMLDivElement> {
    Form: Question[]
    Title: string
}

const PsychForm: FC<FormProps> = ({ className, Form, Title, ...props }) => {
    const [CurrentForm, setCurrentForm] = useState<Question[]>(Form)

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
                            <legend className="mb-4">{questions.label}</legend>
                            {questions.options.map((option) => {
                                if (option == 3) {
                                    return <div className="flex items-center gap-2">
                                    <Radio id="united-state" name={questions.label} value={option} defaultChecked />
                                    <Label htmlFor="united-state">
                                        {getLabel(option)}</Label>
                                </div>
                                }
                                return <div className="flex items-center gap-2">
                                    <Radio id="united-state" name={questions.label} value={option} />
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