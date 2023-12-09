"use client"
import { Button, Modal, Spinner, Toast, ToggleSwitch } from "flowbite-react"
import { useContext, useEffect, useRef, useState } from "react"
import { HiExclamation, HiOutlineExclamationCircle } from "react-icons/hi"
import TextareaAutosizeProps from "react-textarea-autosize";
import { MessageContext } from "../context/messages";
import { formsPrompt } from "../helpers/constants/chatbot-prompts";
import { cn } from "../lib/validators/utils";
import { nanoid } from "nanoid";
import { IoMdArrowUp } from "react-icons/io";
import { useMutation } from "@tanstack/react-query";
import { Message } from "../lib/validators/message";
import data from "@/json/forchatbot.json";




function NewChat() {
    const {
        messages,
        addMessage,
        removeMessage,
        updateMessage,
        setIsMessageUpdating,
        resetMessage
    } = useContext(MessageContext)

    const [currentQuestion, setQuestion] = useState<number>(-1)
    const [confirm, setConfirm] = useState<boolean>(false)
    const [isQuestionMode, setMode] = useState<boolean>(false)
    const [answers, setAnswer] = useState<string>("")
    const [input, setInput] = useState<string>('')
    const [showToast, setShowToast] = useState<boolean>(false)
    const [isLoading, setLoading] = useState<boolean>(false)
    const questionList = data["list"]


    function switchMode() {
        if (isQuestionMode) {
            setMode(false)
            resetMessage("normal")
        }
        else {
            setMode(true)
            resetMessage("question")
            let temp = formsPrompt
            questionList.forEach(question => {
                temp += "\n" + question
            });
            console.log(temp)
            sendMessage({
                id: nanoid(),
                text: temp,
                isUserMessage: "system"
            })
            setQuestion(1)
        }
    }

    const { mutate: sendMessage } = useMutation({
        mutationKey: ['sendMessage'],
        mutationFn: async (message: Message) => {
            setLoading(true)
            const response = await fetch("/api/message", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: messages }),
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
                isUserMessage: 'assistant',
                text: '',
            }
            addMessage(responseMessage)
            setIsMessageUpdating(true)

            const reader = stream.getReader()
            const decoder = new TextDecoder()
            let done = false
            if (isQuestionMode) {
                let holdMessage: string = " "
                while (!done) {
                    const { value, done: doneReading } = await reader.read()
                    done = doneReading
                    const chunkValue = decoder.decode(value)
                    holdMessage += chunkValue
                }
                let answer = holdMessage.match(/\[.+?\]/g)
                holdMessage.replace(/\[.+?\]/g, "");
                if (answer != null) {
                    console.log("found answer")
                    let num = currentQuestion + 1
                    setAnswer(answers + answer + ",")
                    setQuestion(num)
                    console.log(answers)
                    if (num == 5) {
                        addMessage({
                            id: nanoid(),
                            text: "Congratulations you have completed the guided conversation would you like me to reccomend you a career based on your results? ",
                            isUserMessage: "Assistant"
                        })
                    }
                }
                updateMessage(id, (prev) => prev + holdMessage)
            }


            while (!done) {
                const { value, done: doneReading } = await reader.read()
                done = doneReading
                const chunkValue = decoder.decode(value)
                console.log(chunkValue)
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
    const textareaRef = useRef<null | HTMLTextAreaElement>(null)
    return (
        <div className={"flex flex-col pl-1 p-4 min-h-screen relative"}>
            {showToast && (<Toast className="absolute top-1 right-3">
                <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
                    <HiExclamation className="h-5 w-5" />
                </div>
                <div className="ml-3 text-sm font-normal">Error with ChatGPT fetch.</div>
                <Toast.Toggle onDismiss={() => setShowToast(false)} />
            </Toast>)}
            <Modal show={confirm} size="lg" onClose={() => setConfirm(false)} popup>
                <Modal.Header />
                <Modal.Body>
                    <div className="text-center">
                        <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            By pressing this you would switch the chat's mode and all previous record of your conversation will be reset, is that OK?
                        </h3>
                        <div className="flex justify-center gap-4">
                            <Button color="failure" onClick={() => {
                                setConfirm(false)
                                switchMode()
                            }}>
                                "Yes, I'm sure"
                            </Button>
                            <Button color="gray" onClick={() => (setConfirm(false))}>
                                No, cancel
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            <Button onClick={() => (setConfirm(true))} className="absolute top-6 w-56 left-[40%]" color="dark">Switch to other mode</Button>
            <div className="flex flex-col pl-6 ml-6 p-4 py-12 min-h-[96vh] max-h-[96vh] bg-slate-400 overflow-y-scroll">
                {messages.map((messages) => {
                    if (messages.isUserMessage == "system") {
                        return <></>
                    }
                    return <div className={cn("flex flex-row", {
                        " justify-start": messages.isUserMessage == "assistant",
                        " justify-end": messages.isUserMessage == "user"
                    })}>
                        <div className={cn(" p-3 my-3 rounded-2xl max-w-7xl", {
                            " bg-blue-600 text-white": messages.isUserMessage == "assistant",
                            " bg-slate-200": messages.isUserMessage == "user"
                        })}>
                            {messages.text}
                        </div></div>
                })}
            </div>
            <div className="absolute bottom-9 w-[98%] ml-9 text-lg">
                <TextareaAutosizeProps
                    ref={textareaRef}
                    rows={2}
                    id="userInput"
                    onKeyDownCapture={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            if (isQuestionMode) {

                            }
                            sendMessage({
                                id: nanoid(),
                                text: input,
                                isUserMessage: "user"
                            })
                        }
                    }}
                    maxRows={4}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    autoFocus
                    disabled={isLoading}
                    placeholder="Write something here!"
                    className="peer z-0 disabled:opacity-50 resize-none block border-0 bg-zinc-100 py-1.5 text-gray-900 focus:ring-0 text-md sm:leading-6 w-7/12 xl:w-10/12 2xl:w-11/12 lg:w-9/12 rounded" />

            </div>
            <button
                onClick={() => sendMessage({
                    id: nanoid(),
                    text: input,
                    isUserMessage: "user"
                })}
                className="absolute flex bottom-9 right-9 h-9 rounded-xl p-3 align-middle justify-center w-16 bg-white">
                {isLoading ? <Spinner size="sm" className="mb-20" /> : <IoMdArrowUp />}
            </button>
        </div>

    )
}

export default NewChat