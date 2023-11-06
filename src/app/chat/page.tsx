"use client"
import { Message } from "@/app/lib/validators/message";
import { useMutation } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import TextareaAutosizeProps from "react-textarea-autosize";
import { FC, HTMLAttributes, useContext, useRef, useState } from "react";
import ChatMessages from "../component/ChatMessages";
import { MessageContext } from "../context/messages";

interface ChatInputProps extends HTMLAttributes<HTMLDivElement>{}

const ChatInput: FC<ChatInputProps> = ({}) => {
    const [input, setInput] = useState<string>('')
    const {
        messages,
        addMessage,
        removeMessage,
        updateMessage,
        setIsMessageUpdating,
    } = useContext(MessageContext)
    const textareaRef = useRef<null | HTMLTextAreaElement>(null)
    
    const {mutate: sendMessage} = useMutation({
        mutationKey: ['sendMessage'],
        mutationFn: async (messages: Message) => {
            const response = await fetch("/api/message", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({messages: [messages]}),
            })
            return response.body
        },
        onMutate(message){
            addMessage(message)
        },
        onSuccess: async (stream) => {
            if (!stream) throw new Error("No stream found")

            const id = nanoid()
            const responseMessage: Message = {
                id, 
                isUserMessage:false,
                text: '',
            }

            addMessage(responseMessage)

            setIsMessageUpdating(true)


            const reader = stream.getReader()
            const decoder = new TextDecoder()
            let done = false

            while (!done) {
                const {value, done: doneReading} = await reader.read()
                done = doneReading
                const chunkValue = decoder.decode(value)
                updateMessage(id, (prev) => prev + chunkValue)
            }

            setIsMessageUpdating(false)
            setInput('')

            setTimeout(() => {
                textareaRef.current?.focus()
            }, 10)
        },
    })
    return (
        <div className={"flex flex-col pl-1 p-4 min-h-screen relative"}>
            <ChatMessages className="px-2 py-3"/>
            <div className="flex sm:pl-6 xl:pl-16 absolute bottom-3 w-full">
                <TextareaAutosizeProps
                    ref={textareaRef}
                    rows={2}
                    onKeyDownCapture={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            const message = {
                                id: nanoid(),
                                text: input,
                                isUserMessage: true
                            }

                            sendMessage(message)
                        }
                    }}
                    maxRows={4}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    autoFocus
                    placeholder="Write something here!"
                    className="peer disabled:opacity-50 resize-none block border-0 bg-zinc-100 py-1.5 text-gray-900 focus:ring-0 text-sm sm:leading-6 w-11/12 rounded" />
            </div>
        </div> //39.50
    )
}

export default ChatInput