"use client"

import { FC, HTMLAttributes} from "react";
import PsychForm from "@/app/component/PsychForms";
import holland from "@/json/holland.json";
import { Question } from "@/app/lib/validators/message";

interface ChatInputProps extends HTMLAttributes<HTMLDivElement> { }


const ChatInput: FC<ChatInputProps> = ({ }) => {
    const hollandForm: Question[] =  holland.content
    
    return (
        <></>
    )
}

export default ChatInput