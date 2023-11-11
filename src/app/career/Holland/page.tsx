"use client"

import { nanoid } from "nanoid";
import { FC, HTMLAttributes, useContext, useRef, useState } from "react";
import { Spinner, Toast } from "flowbite-react";
import PsychForm from "@/app/component/PsychForms";
import holland from "@/json/hollands.json";

interface ChatInputProps extends HTMLAttributes<HTMLDivElement> { }

const ChatInput: FC<ChatInputProps> = ({ }) => {
    function init() {
        let holland = [{
            labels: "string",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "",
        },
        {
            labels: "string",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "",
        },
        {
            labels: "string",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "",
        },
        {
            labels: "string",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "",
        },
    ]

    }
    return (
        <div className={"flex flex-col pl-1 p-4 min-h-screen relative"}>
            <PsychForm Title="Holland's Career" Form={[]} />
        </div>
    )
}

export default ChatInput