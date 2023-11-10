"use client"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { FC, ReactNode } from "react";
import { MessageProvider } from "../context/messages";

interface ProvidersProps {
    children: ReactNode
}

const MessageProviders: FC<ProvidersProps> = ({ children }) => {
    const queryClient = new QueryClient()


    return <QueryClientProvider client={queryClient}>
        <MessageProvider>{children}</MessageProvider>
    </QueryClientProvider>
}

export default MessageProviders