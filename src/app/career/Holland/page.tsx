"use client"

import { nanoid } from "nanoid";
import { FC, HTMLAttributes, useContext, useRef, useState } from "react";
import { Spinner, Toast } from "flowbite-react";
import PsychForm from "@/app/component/PsychForms";

interface ChatInputProps extends HTMLAttributes<HTMLDivElement> { }

const ChatInput: FC<ChatInputProps> = ({ }) => {
    
    return (
        <div className={"flex flex-col pl-1 p-4 min-h-screen relative"}>
            <PsychForm Title="Holland's Career" />
        </div>
    )
}

export default ChatInput