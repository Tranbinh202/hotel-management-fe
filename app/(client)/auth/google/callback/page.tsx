"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useGoogleCallback } from "@/lib/hooks/use-auth"
import { Loader2 } from "lucide-react"

function CallbackContent() {
  const searchParams = useSearchParams()
  const googleCallback = useGoogleCallback()

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    console.log("[v0] Google callback page loaded")
    console.log("[v0] Code:", code)
    console.log("[v0] Error:", error)

    if (error) {
      console.error("[v0] OAuth error:", error)
      window.location.href = "/login?error=google_auth_failed"
      return
    }

    if (code) {
      console.log("[v0] Processing Google OAuth code...")
      googleCallback.mutate(code)
    } else {
      console.error("[v0] No code found in callback URL")
      window.location.href = "/login?error=no_code"
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <h2 className="text-2xl font-semibold text-foreground">Đang xử lý đăng nhập...</h2>
        <p className="text-muted-foreground">Vui lòng đợi trong giây lát</p>
        {googleCallback.isError && (
          <p className="text-destructive text-sm">Đã xảy ra lỗi. Đang chuyển hướng về trang đăng nhập...</p>
        )}
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
