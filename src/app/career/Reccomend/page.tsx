"use client"

import { Message } from "@/app/lib/validators/message";
import { useMutation } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { FC, HTMLAttributes, useContext, useEffect, useRef, useState } from "react";
import { MessageContext } from "../../context/messages";
import { Spinner, Toast } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";

interface ChatInputProps extends HTMLAttributes<HTMLDivElement> { }


const ChatInput: FC<ChatInputProps> = ({ }) => {
    const [message, setMessage] = useState('')
    
    useEffect(() => {
        fetch("http://localhost:5000/Career/Recommend")
          .then(response => response.json())
          .then(data => setMessage(data.message))
          .catch(error => console.error('Error:', error));
      }, []);

    return (
        <div className={"flex flex-col min-h-screen "}>
            <div className="p-10 m-6 bg-slate-100">
            </div>
            <p style={{color: "black"}}>{message}</p>
        </div>
    )

    
}

export default ChatInput