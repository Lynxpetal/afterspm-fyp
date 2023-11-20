"use client"

import { Message } from "@/app/lib/validators/message";
import { useMutation } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { FC, HTMLAttributes, useContext, useRef, useState } from "react";
import { MessageContext } from "../../context/messages";
import { Spinner, Toast } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";

interface ReccomendProps extends HTMLAttributes<HTMLDivElement> { }


const Reccomend: FC<ReccomendProps> = ({  }) => {
    const [input, setInput] = useState<string>('hello how are you?')
    const [isLoading, setLoading] = useState<boolean>(false)
    const [showToast, setShowToast] = useState<boolean>(false);
    const {
        messages,
        addMessage,
        removeMessage,
        updateMessage,
        setIsMessageUpdating,
    } = useContext(MessageContext)

    const { mutate: sendMessage } = useMutation({
        mutationKey: ['sendMessage'],
        mutationFn: async (messages: Message) => {
            setLoading(true)
            const response = await fetch("/api/message", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: [messages] }),
            })
            if (!response.ok) {
                throw new Error();
            }

            return response.body
        },
        onMutate(message) {
            addMessage(message)
        },
        onSuccess: async (stream) => {
            if (!stream) throw new Error("No stream found")

            const id = nanoid()
            const responseMessage: Message = {
                id,
                isUserMessage: false,
                text: '',
            }

            addMessage(responseMessage)

            setIsMessageUpdating(true)


            const reader = stream.getReader()
            const decoder = new TextDecoder()
            let done = false

            while (!done) {
                const { value, done: doneReading } = await reader.read()
                done = doneReading
                const chunkValue = decoder.decode(value)
                updateMessage(id, (prev) => prev + chunkValue)
            }

            setIsMessageUpdating(false)
            setInput('')

            setTimeout(() => {
            }, 10)
            setLoading(false)
        },
        onError(_, message) {
            removeMessage(message.id)
            setShowToast(true)
            setLoading(false)
        }
    })

    fetch("http://localhost:5000/Reccomend", {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data != null) {
          console.log(data)
        }
      

      })
  

    return (
        <div className={"flex flex-col min-h-screen "}>
            {showToast && (<Toast className="absolute top-1 right-3">
                <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
                    <HiExclamation className="h-5 w-5" />
                </div>
                <div className="ml-3 text-sm font-normal">Error with ChatGPT fetch.</div>
                <Toast.Toggle onDismiss={() => setShowToast(false)}/>
            </Toast>)}
            <div className="p-10 m-6 bg-slate-100 text-lg font-bold">
                Compatible Careers for You

                <kbd className="inline-flex items-center w-12 h-9 rounded border bg-white border-gray-200 px-2.5 font-sans text-xs text-gray-400">
                        {isLoading ? <Spinner size="md" /> : <button onClick={() => sendMessage({
                            id: nanoid(),
                            text: input,
                            isUserMessage: true
                        })}>Enter</button>}
                    </kbd>
            </div>
        </div>
    )
}

export default Reccomend