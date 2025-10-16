import { apiClient } from "./client"
import type { LoginDto, RegisterDto, AuthResponse } from "@/lib/types/api"

export const authApi = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", data)

    if (typeof window !== "undefined" && response.accessToken) {
      localStorage.setItem("access_token", response.accessToken)
      localStorage.setItem("refresh_token", response.refreshToken)
      localStorage.setItem("user", JSON.stringify(response.user))
    }

    return response
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>("/auth/register", data)
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout")
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user")
      }
    }
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/refresh", { refreshToken })

    if (typeof window !== "undefined" && response.accessToken) {
      localStorage.setItem("access_token", response.accessToken)
    }

    return response
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post("/auth/forgot-password", { email })
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post("/auth/change-password", { oldPassword, newPassword })
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
