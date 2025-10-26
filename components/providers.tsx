"use client"

import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { queryClient } from "@/lib/api"
import { QueryClientProvider } from "@tanstack/react-query"
import type React from "react"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                {children}
                <Toaster />
            </AuthProvider>
        </QueryClientProvider>
    )
}
