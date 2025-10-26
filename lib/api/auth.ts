import { apiClient } from "./client"
import type { LoginDto, RegisterDto, AuthResponse, ApiResponse } from "@/lib/types/api"

export const authApi = {
  login: async (data: LoginDto): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/authentication/login", data)

    console.log("AUTH>>>", response.data)

    if (typeof window !== "undefined" && response.data.token) {
      localStorage.setItem("access_token", response.data.token)
      localStorage.setItem("refresh_token", response.data.refreshToken)
    }

    return response
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/authentication/register", data)

    if (typeof window !== "undefined" && response.token) {
      localStorage.setItem("access_token", response.token)
      localStorage.setItem("refresh_token", response.refreshToken)
    }

    return response
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/authentication/logout")
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user")
      }
    }
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/authentication/refresh", { refreshToken })

    if (typeof window !== "undefined" && response.token) {
      localStorage.setItem("access_token", response.token)
    }

    return response
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post("/authentication/forgot-password", { email })
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post("/authentication/change-password", { oldPassword, newPassword })
  },

  getCurrentUser: () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user")
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  },

  isAuthenticated: () => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("access_token")
    }
    return false
  },
}
