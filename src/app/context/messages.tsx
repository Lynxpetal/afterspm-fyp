import { nanoid } from "nanoid";
import { Message, Question } from "@/app/lib/validators/message";
import { ReactNode, createContext, useState } from "react";

export const MessageContext = createContext<{
    messages: Message[]
    isMessageUpdating: boolean
    addMessage: (message: Message) => void
    removeMessage: (id: string) => void
    updateMessage: (id: string, updateFn: (prevText: string) => string) => void
    setIsMessageUpdating: (isUpdating: boolean) => void
}>({
    messages: [],
    isMessageUpdating: false,
    addMessage: () => {},
    removeMessage: () => {},
    updateMessage: () => {},
    setIsMessageUpdating: () => {}
})

export function MessageProvider({children} : {children: ReactNode}) {
    const [isMessageUpdating, setIsMessageUpdating] = useState<boolean>(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: nanoid(),
            text: "Hi, how are you today?" ,
            isUserMessage: false,
        },
    ])
    const [answered , setAnswer] = useState<Question[]>([])
    const [tobeAnswered, setQuestion] = useState<Question[]>([])

    const addMessage = (message: Message) => {
        setMessages((prev) => [...prev, message])
    }

    const removeMessage = (id: string) => {
        setMessages((prev) => prev.filter((message) => message.id !== id))
    }

    const updateMessage = (id: string, updateFn: (prevText: string)=> string) => {
        setMessages((prev) => prev.map((message) => {
            if (message.id === id) {
                return {...message, text: updateFn(message.text)}
            }
            return message
        }))
    }

    return <MessageContext.Provider value={{
        messages,
        isMessageUpdating,
        addMessage,
        removeMessage,
        updateMessage,
        setIsMessageUpdating,
    }}>{children}</MessageContext.Provider>
    
}