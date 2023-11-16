"use client"

import { FC, HTMLAttributes} from "react";
import PsychForm from "@/app/component/PsychForms";
import holland from "@/json/holland.json";
import { Question } from "@/app/lib/validators/message";

interface ChatInputProps extends HTMLAttributes<HTMLDivElement> { }


const ChatInput: FC<ChatInputProps> = ({ }) => {
    const hollandForm: Question[] =  holland.content
    
    return (
        <div className={"flex flex-col min-h-screen "}>
            <div className="p-10 m-6 bg-slate-100">
            <PsychForm Title="Holland's Career Test" Desc="Based on the actions on the statements answer based on how interested you are : " Form={hollandForm} />
            </div>
        </div>
    )
}

export default ChatInput