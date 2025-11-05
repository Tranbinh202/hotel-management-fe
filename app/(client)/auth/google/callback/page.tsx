"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { accountApi } from "@/lib/api/account"

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get("token")
      const refreshToken = searchParams.get("refreshToken")

      const error = searchParams.get("error")
      const errorMessage = searchParams.get("message")

      console.log("Google callback page loaded")
      console.log("Token:", token ? "present" : "missing")
      console.log("RefreshToken:", refreshToken ? "present" : "missing")
      console.log("Error:", error)
      console.log("Error Message:", errorMessage)

      if (error) {
        console.error("OAuth error:", error, errorMessage)
        const displayMessage = errorMessage || "Đã xảy ra lỗi khi đăng nhập với Google"
        setTimeout(() => {
          router.push(`/login?error=${encodeURIComponent(displayMessage)}`)
        }, 2000)
        return
      }

      if (token && refreshToken) {
        try {
          console.log("Saving tokens to localStorage...")
          localStorage.setItem("access_token", token)
          localStorage.setItem("refresh_token", refreshToken)

          console.log("Fetching user account summary...")
          const result = await accountApi.getSummary(0)

          if (!result.isSuccess) {
            throw new Error(result.message || "Không thể lấy thông tin tài khoản")
          }

          const userData = result.data
          console.log("User data fetched:", userData)

          if (userData.isLocked) {
            console.log("Account is locked, redirecting to locked page")
            localStorage.removeItem("access_token")
            localStorage.removeItem("refresh_token")
            setTimeout(() => {
              router.push("/account-locked")
            }, 2000)
            return
          }

          localStorage.setItem("user", JSON.stringify(userData))

          console.log("Login successful, redirecting to home...")
          setTimeout(() => {
            router.push("/")
          }, 1500)
        } catch (error) {
          console.error("Error processing Google login:", error)
          const errorMsg = error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định"
          setTimeout(() => {
            router.push(`/login?error=${encodeURIComponent(errorMsg)}`)
          }, 2000)
        }
        return
      }

      console.error("No valid parameters found in callback URL")
      setTimeout(() => {
        router.push("/login?error=Thiếu thông tin xác thực")
      }, 2000)
    }

    processCallback()
  }, [searchParams, router])

  const error = searchParams.get("error")
  const token = searchParams.get("token")

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md px-4">
        {error ? (
          <>
            <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
            <h2 className="text-2xl font-semibold text-foreground">Đăng nhập thất bại</h2>
            <p className="text-muted-foreground">
              {searchParams.get("message") || "Đã xảy ra lỗi khi đăng nhập với Google"}
            </p>
            <p className="text-sm text-muted-foreground">Đang chuyển hướng về trang đăng nhập...</p>
          </>
        ) : token ? (
          <>
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500" />
            <h2 className="text-2xl font-semibold text-foreground">Đăng nhập thành công!</h2>
            <p className="text-muted-foreground">Đang chuyển hướng...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">Đang xử lý đăng nhập...</h2>
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
