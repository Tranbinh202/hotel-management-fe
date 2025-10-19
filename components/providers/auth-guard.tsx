"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { LoadingSpinner } from "@/components/shared/loading-spinner"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export function AuthGuard({ children, requireAuth = true, requireAdmin = false, redirectTo }: AuthGuardProps) {
  const { user, account, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  console.log("AuthGuard:", { user, account, isAuthenticated, isLoading })

  useEffect(() => {
    if (isLoading) return

    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo || "/login")
      return
    }

    if (requireAdmin && account?.roleId !== 1) {
      router.push("/")
      return
    }
  }, [isAuthenticated, isLoading, requireAuth, requireAdmin, user, account, router, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return <>{children}</>
}
