"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export function useLogin() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user)
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${data.user.firstName}!`,
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
    onSuccess: () => {
      toast({
        title: "Đăng ký thành công",
        description: "Vui lòng đăng nhập để tiếp tục",
      })
      router.push("/login")
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
