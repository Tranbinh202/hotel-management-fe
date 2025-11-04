"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { accountApi } from "@/lib/api/account"
import { toast } from "@/hooks/use-toast"

export function useLogin() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // queryClient.setQueryData(["user"], data.user)
      toast({
        title: "Đăng nhập thành công",
        // description: `Chào mừng ${data.user.firstName}!`,
      })
      router.push("/admin/dashboard")
    },
    onError: (error: any) => {
      toast({
        title: "Đăng nhập thất bại",
        description: error.message || "Email hoặc mật khẩu không đúng",
        variant: "destructive",
      })
    },
  })
}

export function useRegister() {
  const router = useRouter()

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      toast({
        title: "Đăng ký thành công",
        description: "Vui lòng kiểm tra email để kích hoạt tài khoản",
      })
      // Redirect to registration success page with email
      router.push(`/registration-success?email=${encodeURIComponent(response.data.email)}`)
    },
    onError: (error: any) => {
      toast({
        title: "Đăng ký thất bại",
        description: error.message || "Không thể tạo tài khoản",
        variant: "destructive",
      })
    },
  })
}

export function useActivateAccount() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.activateAccount,
    onSuccess: async (response) => {
      queryClient.clear()
      toast({
        title: "Kích hoạt thành công",
        description: "Tài khoản của bạn đã được kích hoạt. Đang tự động đăng nhập...",
      })

      try {
        const userData = await accountApi.getSummary(0)
        if (userData.isSuccess) {
          localStorage.setItem("user", JSON.stringify(userData.data))
        }
      } catch (error) {
        console.error("Failed to fetch user data after activation:", error)
      }

      // Redirect to home page after auto-login
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 1500)
    },
    onError: (error: any) => {
      toast({
        title: "Kích hoạt thất bại",
        description: error.message || "Link kích hoạt không hợp lệ hoặc đã hết hạn",
        variant: "destructive",
      })
    },
  })
}

export function useResendActivationEmail() {
  return useMutation({
    mutationFn: authApi.resendActivationEmail,
    onSuccess: () => {
      toast({
        title: "Đã gửi email",
        description: "Email kích hoạt mới đã được gửi. Vui lòng kiểm tra hộp thư của bạn.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Gửi email thất bại",
        description: error.message || "Không thể gửi email kích hoạt",
        variant: "destructive",
      })
    },
  })
}

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear()
      toast({
        title: "Đã đăng xuất",
        description: "Hẹn gặp lại bạn!",
      })
      router.push("/login")
    },
    onError: () => {
      queryClient.clear()
      router.push("/login")
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Vui lòng kiểm tra email để đặt lại mật khẩu",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gửi email",
        variant: "destructive",
      })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      authApi.changePassword(oldPassword, newPassword),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã đổi mật khẩu",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đổi mật khẩu",
        variant: "destructive",
      })
    },
  })
}

export function useCurrentUser() {
  return authApi.getCurrentUser()
}

export function useIsAuthenticated() {
  return authApi.isAuthenticated()
}

export function useGoogleLogin() {
  return useMutation({
    mutationFn: authApi.loginGoogle,
    onSuccess: (response) => {
      console.log("[v0] Google login response:", response)

      // The API client returns res.data, so response structure is:
      // { isSuccess: true, data: { url: "..." }, message: "...", statusCode: 200 }
      const googleUrl = response.data?.url || response.url

      console.log("[v0] Google OAuth URL:", googleUrl)

      if (googleUrl) {
        console.log("[v0] Redirecting to Google OAuth...")
        window.location.href = googleUrl
      } else {
        console.error("[v0] No URL found in response:", response)
        toast({
          title: "Lỗi đăng nhập Google",
          description: "Không thể lấy URL đăng nhập từ server",
          variant: "destructive",
        })
      }
    },
    onError: (error: any) => {
      console.error("[v0] Google login error:", error)
      toast({
        title: "Lỗi đăng nhập Google",
        description: error.message || "Không thể kết nối với Google",
        variant: "destructive",
      })
    },
  })
}

export function useGoogleCallback() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.callbackGoogle,
    onSuccess: async (response) => {
      console.log("[v0] Google callback success:", response)
      queryClient.clear()
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn đến với StayHub!",
      })

      try {
        console.log("[v0] Fetching user data...")
        const userData = await accountApi.getSummary(0)
        if (userData.isSuccess) {
          console.log("[v0] User data fetched:", userData.data)
          localStorage.setItem("user", JSON.stringify(userData.data))
        }
      } catch (error) {
        console.error("[v0] Failed to fetch user data after Google login:", error)
      }

      // Redirect to home page
      console.log("[v0] Redirecting to home page...")
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 1000)
    },
    onError: (error: any) => {
      console.error("[v0] Google callback error:", error)
      toast({
        title: "Đăng nhập thất bại",
        description: error.message || "Mã xác thực không hợp lệ",
        variant: "destructive",
      })
      // Redirect to login page on error
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    },
  })
}
