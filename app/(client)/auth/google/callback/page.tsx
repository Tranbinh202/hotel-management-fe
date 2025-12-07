"use client"

import { useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { useGoogleExchange } from "@/lib/hooks/use-auth"

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const exchangeMutation = useGoogleExchange()
  const hasProcessedRef = useRef(false)

  useEffect(() => {
    // Prevent duplicate execution in StrictMode or re-renders
    if (hasProcessedRef.current) {
      return
    }

    const processCallback = async () => {
      const code = searchParams.get("code")
      const error = searchParams.get("error")
      const errorDescription = searchParams.get("error_description")

      // Handle OAuth error from Google
      if (error) {
        hasProcessedRef.current = true
        const displayMessage = errorDescription || "Đã xảy ra lỗi khi đăng nhập với Google"
        setTimeout(() => {
          router.push(`/login?error=${encodeURIComponent(displayMessage)}`)
        }, 2000)
        return
      }

      if (code) {
        hasProcessedRef.current = true
        exchangeMutation.mutate(code)
        return
      }

      const token = searchParams.get("token")
      const refreshToken = searchParams.get("refreshToken")

      if (token && refreshToken) {
        hasProcessedRef.current = true
        localStorage.setItem("access_token", token)
        localStorage.setItem("refresh_token", refreshToken)

        try {
          const { accountApi } = await import("@/lib/api/account")
          const result = await accountApi.getSummary(0)

          if (!result.isSuccess) {
            throw new Error(result.message || "Không thể lấy thông tin tài khoản")
          }

          const userData = result.data

          if (userData.isLocked) {
            localStorage.removeItem("access_token")
            localStorage.removeItem("refresh_token")
            setTimeout(() => {
              router.push("/account-locked")
            }, 2000)
            return
          }

          localStorage.setItem("user", JSON.stringify(userData))

          setTimeout(() => {
            router.push("/")
          }, 1500)
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định"
          setTimeout(() => {
            router.push(`/login?error=${encodeURIComponent(errorMsg)}`)
          }, 2000)
        }
        return
      }

      hasProcessedRef.current = true
      setTimeout(() => {
        router.push("/login?error=Thiếu thông tin xác thực")
      }, 2000)
    }

    processCallback()
  }, [searchParams, router, exchangeMutation])

  const error = searchParams.get("error")
  const code = searchParams.get("code")

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md px-4">
        {error ? (
          <>
            <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
            <h2 className="text-2xl font-semibold text-foreground">Đăng nhập thất bại</h2>
            <p className="text-muted-foreground">
              {searchParams.get("error_description") || "Đã xảy ra lỗi khi đăng nhập với Google"}
            </p>
            <p className="text-sm text-muted-foreground">Đang chuyển hướng về trang đăng nhập...</p>
          </>
        ) : exchangeMutation.isSuccess ? (
          <>
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500" />
            <h2 className="text-2xl font-semibold text-foreground">Đăng nhập thành công!</h2>
            <p className="text-muted-foreground">Đang chuyển hướng...</p>
          </>
        ) : exchangeMutation.isError ? (
          <>
            <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
            <h2 className="text-2xl font-semibold text-foreground">Xác thực thất bại</h2>
            <p className="text-muted-foreground">
              {exchangeMutation.error?.message || "Không thể xác thực với Google"}
            </p>
            <p className="text-sm text-muted-foreground">Đang chuyển hướng về trang đăng nhập...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">
              {code ? "Đang xác thực với Google..." : "Đang xử lý đăng nhập..."}
            </h2>
            <p className="text-muted-foreground">Vui lòng đợi trong giây lát</p>
          </>
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
