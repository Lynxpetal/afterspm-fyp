"use client"
import { Context } from "@/app/context/messages";
import { FC, HTMLAttributes, useContext } from "react";
import { cn } from "../lib/validators/utils";
import MarkdownLite from "./MarkdownLite";


interface ChatMessagesProps extends HTMLAttributes<HTMLDivElement> { }


const Forms: FC<ChatMessagesProps> = ({ className, ...props }) => {
    const { answered } = useContext(Context)
    

    return (
        <div
            {...props}
            className={cn(
                'flex flex-col-reverse gap-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch',
                className
            )}>
            <div className='flex-1 flex-grow' />
            {inverseMessages.map((message) => {
                return (
                    <div className='chat-message' key={`${message.id}-${message.id}`}>
                        <div
                            className={cn('flex items-end', {
                                'justify-end': message.isUserMessage,
                            })}>
                            <div
                                className={cn('flex flex-col space-y-2 text-sm max-w-xs mx-2 overflow-x-hidden', {
                                    'order-1 items-end': message.isUserMessage,
                                    'order-2 items-start': !message.isUserMessage,
                                })}>
                                <p
                                    className={cn('px-4 py-2 rounded-lg', {
                                        'bg-blue-600 text-white': message.isUserMessage,
                                        'bg-white text-gray-900': !message.isUserMessage,
                                    })}>
                                    <MarkdownLite text={message.text} />
                                </p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Forms