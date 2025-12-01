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
      console.log("Google login response:", response)

      // The API client returns res.data, so response structure is:
      // { isSuccess: true, data: { url: "..." }, message: "...", statusCode: 200 }
      const googleUrl = response.data?.url || response.url

      console.log("Google OAuth URL:", googleUrl)

      if (googleUrl) {
        console.log("Redirecting to Google OAuth...")
        window.location.href = googleUrl
      } else {
        console.error("No URL found in response:", response)
        toast({
          title: "Lỗi đăng nhập Google",
          description: "Không thể lấy URL đăng nhập từ server",
          variant: "destructive",
        })
      }
    },
    onError: (error: any) => {
      console.error("Google login error:", error)
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
      console.log("Google callback success:", response)
      queryClient.clear()
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn đến với StayHub!",
      })

      try {
        console.log("Fetching user data...")
        const userData = await accountApi.getSummary(0)
        if (userData.isSuccess) {
          console.log("User data fetched:", userData.data)

          if (userData.data.isLocked) {
            console.log("Account is locked, redirecting to locked page")
            localStorage.removeItem("access_token")
            localStorage.removeItem("refresh_token")
            router.push("/account-locked")
            return
          }

          localStorage.setItem("user", JSON.stringify(userData.data))
        }
      } catch (error) {
        console.error("Failed to fetch user data after Google login:", error)
      }

      console.log("Redirecting to home page...")
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 1000)
    },
    onError: (error: any) => {
      console.error("Google callback error:", error)
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

export function useSendOtpEmail() {
  return useMutation({
    mutationFn: authApi.sendOtpEmail,
    onSuccess: () => {
      toast({
        title: "Đã gửi mã OTP",
        description: "Vui lòng kiểm tra email để nhận mã xác thực",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Gửi mã thất bại",
        description: error.message || "Không tìm thấy tài khoản với email này",
        variant: "destructive",
      })
    },
  })
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => authApi.verifyOtp(email, otp),
    onSuccess: () => {
      toast({
        title: "Xác thực thành công",
        description: "Mã OTP hợp lệ. Vui lòng nhập mật khẩu mới",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Xác thực thất bại",
        description: error.message || "Mã OTP không hợp lệ hoặc đã hết hạn",
        variant: "destructive",
      })
    },
  })
}

export function useChangePasswordWithOtp() {
  const router = useRouter()

  return useMutation({
    mutationFn: ({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }) =>
      authApi.changePasswordWithOtp(email, otp, newPassword),
    onSuccess: () => {
      toast({
        title: "Đổi mật khẩu thành công",
        description: "Bạn có thể đăng nhập với mật khẩu mới",
      })
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    },
    onError: (error: any) => {
      toast({
        title: "Đổi mật khẩu thất bại",
        description: error.message || "Mã OTP không hợp lệ hoặc đã hết hạn",
        variant: "destructive",
      })
    },
  })
}

export function useGoogleExchange() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.exchangeGoogleCode,
    onSuccess: async (response) => {
      console.log("[v0] Google exchange success:", response)
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

          if (userData.data.isLocked) {
            console.log("[v0] Account is locked, redirecting to locked page")
            localStorage.removeItem("access_token")
            localStorage.removeItem("refresh_token")
            router.push("/account-locked")
            return
          }

          localStorage.setItem("user", JSON.stringify(userData.data))
        }
      } catch (error) {
        console.error("[v0] Failed to fetch user data after Google login:", error)
      }

      console.log("[v0] Redirecting to home page...")
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 1000)
    },
    onError: (error: any) => {
      console.error("[v0] Google exchange error:", error)
      toast({
        title: "Đăng nhập thất bại",
        description: error.message || "Mã xác thực không hợp lệ",
        variant: "destructive",
      })
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    },
  })
}
