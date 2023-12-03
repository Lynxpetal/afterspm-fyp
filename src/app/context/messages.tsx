import { nanoid } from "nanoid";
import { Message} from "@/app/lib/validators/message";
import { ReactNode, createContext, useState } from "react";
import { defaultPrompt, formsPrompt } from "../helpers/constants/chatbot-prompts";

export const MessageContext = createContext<{
    messages: Message[]
    isMessageUpdating: boolean
    addMessage: (message: Message) => void
    removeMessage: (id: string) => void
    updateMessage: (id: string, updateFn: (prevText: string) => string) => void
    setIsMessageUpdating: (isUpdating: boolean) => void
    resetMessage: (mode: string) => void
}>({
    messages: [],
    isMessageUpdating: false,
    addMessage: () => { },
    removeMessage: () => { },
    updateMessage: () => { },
    setIsMessageUpdating: () => { },
    resetMessage: () => { }
})

export function MessageProvider({ children }: { children: ReactNode }) {
    const [isMessageUpdating, setIsMessageUpdating] = useState<boolean>(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: nanoid(),
            text: defaultPrompt ,
            isUserMessage: "system",
        },
    ])

    const addMessage = (message: Message) => {
        setMessages((prev) => [...prev, message])
    }

    const removeMessage = (id: string) => {
        setMessages((prev) => prev.filter((message) => message.id !== id))
    }

    const updateMessage = (id: string, updateFn: (prevText: string) => string) => {
        setMessages((prev) => prev.map((message) => {
            if (message.id === id) {
                return { ...message, text: updateFn(message.text) }
            }
            return message
        }))
    }

    const resetMessage = (mode: string) => {
        switch (mode) {
            case "question":
                setMessages([])
                break;
            case "normal":
                setMessages([
                    {
                        id: nanoid(),
                        text: defaultPrompt ,
                        isUserMessage: "system",
                    },
                ])
                break
            default:
                console.log("what is going on")
                break;
        }
        
    }

    return <MessageContext.Provider value={{
        messages,
        isMessageUpdating,
        addMessage,
        removeMessage,
        updateMessage,
        setIsMessageUpdating,
        resetMessage
    }}>{children}</MessageContext.Provider>

}