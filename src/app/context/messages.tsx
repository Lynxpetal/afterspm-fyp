import { Message } from "postcss";
import { createContext } from "react";

export const MessageContext = createContext<{
    messages: Message[]
    isMessageUpdating: boolean
    addMessages: (message: Message) => void
    removeMessage: (id: string) => void
    updateMessage: (id: string, updateFn: (prevText: string) => string) => void
    setIsMessageUpdating: (isUpdating: boolean) => void
}>({
    messages: [],
    isMessageUpdating: false,
    addMessages: () => {},
    removeMessage: () => {},
    updateMessage: () => {},
    setIsMessageUpdating: () => {}
})