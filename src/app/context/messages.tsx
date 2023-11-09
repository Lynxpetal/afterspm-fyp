import { nanoid } from "nanoid";
import { Message, Question } from "@/app/lib/validators/message";
import { ReactNode, createContext, useState } from "react";

export const Context = createContext<{
    messages: Message[]
    isMessageUpdating: boolean
    tobeAnswered: Question[]
    answered: Question[]
    answerQuestion: (question: Question) => void
    addQuestion: (question: Question[]) => void
    addMessage: (message: Message) => void
    removeMessage: (id: string) => void
    updateMessage: (id: string, updateFn: (prevText: string) => string) => void
    setIsMessageUpdating: (isUpdating: boolean) => void
}>({
    messages: [],
    isMessageUpdating: false,
    tobeAnswered: [],
    answered: [],
    answerQuestion: () => {},
    addQuestion: () => {},
    addMessage: () => {},
    removeMessage: () => {},
    updateMessage: () => {},
    setIsMessageUpdating: () => {}
})

export function Provider({children} : {children: ReactNode}) {
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
    const answerQuestion = (question: Question) => {
        setAnswer((prev) => [...prev, question])
    }

    const addQuestion = (question: Question[] ) => {
        setQuestion((prev) => prev.concat(question))
    }

    return <Context.Provider value={{
        messages,
        isMessageUpdating,
        tobeAnswered,
        answered,
        answerQuestion,
        addQuestion,
        addMessage,
        removeMessage,
        updateMessage,
        setIsMessageUpdating,
    }}>{children}</Context.Provider>
    
}