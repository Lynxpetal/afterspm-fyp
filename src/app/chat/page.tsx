"use client"
import { Message } from "@/app/lib/validators/message";
import { useMutation } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import TextareaAutosizeProps from "react-textarea-autosize";
import { FC, HTMLAttributes, useContext, useRef, useState } from "react";
import ChatMessages from "../component/ChatMessages";
import { MessageContext } from "../context/messages";
import { Spinner, Toast } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";

interface ChatInputProps extends HTMLAttributes<HTMLDivElement> { }

const ChatInput: FC<ChatInputProps> = ({ }) => {
    const [input, setInput] = useState<string>('')
    const [isLoading, setLoading] = useState<boolean>(false)
    const [showToast, setShowToast] = useState<boolean>(false);
    const {
        messages,
        addMessage,
        removeMessage,
        updateMessage,
        setIsMessageUpdating,
    } = useContext(MessageContext)
    const textareaRef = useRef<null | HTMLTextAreaElement>(null)

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
                textareaRef.current?.focus()
            }, 10)
            setLoading(false)
        },
        onError(_, message) {
            removeMessage(message.id)
            textareaRef.current?.focus()
            setShowToast(true)
            setLoading(false)
        }
    })
    return (
        <div className={"flex flex-col pl-1 p-4 min-h-screen relative"}>
            {showToast && (<Toast className="absolute top-1 right-3">
                <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
                    <HiExclamation className="h-5 w-5" />
                </div>
                <div className="ml-3 text-sm font-normal">Error with ChatGPT fetch.</div>
                <Toast.Toggle onDismiss={() => setShowToast(false)}/>
            </Toast>)}
            <ChatMessages className="px-2 py-3" />
            <div className="flex sm:pl-6 xl:pl-16 absolute bottom-3 w-full">
                <TextareaAutosizeProps
                    ref={textareaRef}
                    rows={2}
                    id="userInput"
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
                    disabled={isLoading}
                    placeholder="Write something here!"
                    className="peer z-0 disabled:opacity-50 resize-none block border-0 bg-zinc-100 py-1.5 text-gray-900 focus:ring-0 text-sm sm:leading-6 w-11/12 rounded" />
                <div className=" absolute inset-x-[1195px] flex w-12">
                    <kbd className="inline-flex items-center w-12 h-9 rounded border bg-white border-gray-200 px-2.5 font-sans text-xs text-gray-400">
                        {isLoading ? <Spinner size="md" /> : <button onClick={() => sendMessage({
                            id: nanoid(),
                            text: input,
                            isUserMessage: true
                        })}>Enter</button>}
                    </kbd>
                </div>
                <div
                    aria-hidden='true'
                    className="absolute w-[1114px] z-10 bottom-0 border-t border-gray-300 peer-focus:border-t-2 peer-focus:border-indigo-600 "
                />
            </div>
        </div> //39.50
    )
}

export default ChatInput