"use client"
import { FC, HTMLAttributes, useState } from "react";
import { cn } from "../lib/validators/utils";
import { Carousel, Label, Pagination, Radio } from 'flowbite-react';
import { Question } from "../lib/validators/message";


interface FormProps extends HTMLAttributes<HTMLDivElement> {
    Form: Question[]
    Title: string
}

const PsychForm: FC<FormProps> = ({ className, Form, Title, ...props }) => {
    const [CurrentForm, setCurrentForm] = useState<Question[]>(Form)
    const [currentPage, setCurrentPage] = useState<number>(1);
    const onPageChange = (page: number) => setCurrentPage(page);
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
            <legend className="mb-4">{CurrentForm[currentPage].label}</legend>
            {CurrentForm[currentPage].options.map((option) => {
                if (option == 3) {
                    return <div className="flex items-center gap-2">
                        <Radio id="united-state" name={CurrentForm[currentPage].label} value={option} defaultChecked />
                        <Label htmlFor="united-state">
                            {getLabel(option)}</Label>
                    </div>
                }
                return <div className="flex items-center gap-2">
                    <Radio id="united-state" name={CurrentForm[currentPage].label} value={option} />
                    <Label htmlFor="united-state">
                        {getLabel(option)}</Label>
                </div>
            })}
        </fieldset>

    }
    return (
        <div
            {...props}
            className={cn(
                '',
                className
            )}>
            <div className="flex flex-col gap-60">
                <fieldset className="flex items-center mt-8 py-10 max-w-md flex-col gap-4 shadow-md rounded bg-white">
                    <legend className="m-3 p-3 text-2xl font-semibold antialiased bg-slate-50 shadow-md rounded-md">{Title}</legend>
                    {pageDisplay()}
                </fieldset >
                <div className="flex overflow-x-auto sm:justify-center">
                    <Pagination layout="navigation" currentPage={currentPage} totalPages={CurrentForm.length} onPageChange={onPageChange} showIcons />
                </div>
            </div>
        </div >
    )
}

export default PsychForm