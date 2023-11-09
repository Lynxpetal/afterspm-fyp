"use client"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { FC, ReactNode } from "react";
import { Provider } from "../context/messages";

interface ProvidersProps {
    children: ReactNode
}

const Providers: FC<ProvidersProps> = ({ children }) => {
    const queryClient = new QueryClient()


    return <QueryClientProvider client={queryClient}>
        <Provider>{children}</Provider>
    </QueryClientProvider>
}

export default Providers