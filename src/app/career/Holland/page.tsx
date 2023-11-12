"use client"

import { nanoid } from "nanoid";
import { FC, HTMLAttributes, useContext, useRef, useState } from "react";
import { Spinner, Toast } from "flowbite-react";
import PsychForm from "@/app/component/PsychForms";
import holland from "@/json/hollands.json";
import { Question } from "@/app/lib/validators/message";

interface ChatInputProps extends HTMLAttributes<HTMLDivElement> { }


const ChatInput: FC<ChatInputProps> = ({ }) => {
    const hollandForm: Question[] =  holland.content
    
    return (
        <div className={"flex flex-col min-h-screen "}>
            <div className="p-10 m-6 bg-slate-100">
            <PsychForm Title="Holland's Career" Form={hollandForm} />
            </div>
        </div>
    )
}

export default ChatInput