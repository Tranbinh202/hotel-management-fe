"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "@/lib/api/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Hook để đăng nhập
export function useLogin() {
  const router = useRouter()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      toast.success("Đăng nhập thành công!")
      // Redirect dựa vào role
      if (data.user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/")
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Email hoặc mật khẩu không đúng")
    },
  })
}

// Hook để đăng ký
export function useRegister() {
  const router = useRouter()

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.")
      router.push("/login")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi đăng ký")
    },
  })
}

// Hook để đăng xuất
export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear tất cả cache
      queryClient.clear()
      toast.success("Đăng xuất thành công!")
      router.push("/login")
    },
    onError: () => {
      // Vẫn logout ở client side ngay cả khi API lỗi
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
      }
      queryClient.clear()
      router.push("/login")
    },
  })
}

// Hook để quên mật khẩu
export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast.success("Đã gửi email khôi phục mật khẩu!")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra")
    },
  })
}

// Hook để đổi mật khẩu
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      authApi.changePassword(oldPassword, newPassword),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công!")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Mật khẩu cũ không đúng")
    },
  })
}
