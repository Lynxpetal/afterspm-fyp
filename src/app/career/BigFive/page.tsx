"use client"

import { FC, HTMLAttributes } from "react";
import PsychForm from "@/app/component/PsychForms";
import bigfive from "@/json/bigfive.json";
import { Question } from "@/app/lib/validators/message";

interface ChatInputProps extends HTMLAttributes<HTMLDivElement> { }


const ChatInput: FC<ChatInputProps> = ({ }) => {
    const hollandForm: Question[] =  bigfive.content
    
    return (
        <div className={"flex flex-col min-h-screen "}>
            <div className="p-10 m-6 bg-slate-100">
            <PsychForm Title="Big Five Personality Test" Form={hollandForm} />
            </div>
        </div>
    )
}

export default ChatInput