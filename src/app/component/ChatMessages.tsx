"use client"
import { MessageContext } from "@/app/context/messages";
import { FC, HTMLAttributes, useContext } from "react";
import { cn } from "../lib/validators/utils";

interface ChatMessagesProps extends HTMLAttributes<HTMLDivElement>{}

const ChatMessages: FC<ChatMessagesProps> = ({className, ...props}) => {
    const {messages} = useContext(MessageContext)
    const inverseMessages = [...messages].reverse()
    
    return <div {...props} className={cn(
        'flex flex-col-reverse gap-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch', 
        className
    )}>
        <div className="flex-1 flex-grow" />
        {inverseMessages.map((message) => (
            <div key={message.id} className="chat-message">
                <div className=""
            </div>
        ))}
        ChatMessage
    </div>

}

export default ChatMessages