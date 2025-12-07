import { apiClient } from "./client"
import type { LoginDto, RegisterDto, AuthResponse, ApiResponse } from "@/lib/types/api"
import { getAccountIdFromToken } from "@/lib/utils/token"

export const authApi = {
  login: async (data: LoginDto): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/authentication/login", data)

    console.log("AUTH>>>", response.data)

    if (typeof window !== "undefined" && response.data.token) {
      localStorage.setItem("access_token", response.data.token)
      localStorage.setItem("refresh_token", response.data.refreshToken)

      // Cache accountId for token refresh
      const accountId = getAccountIdFromToken(response.data.token)
      if (accountId) {
        localStorage.setItem("account_id", accountId.toString())
      }
    }

    return response
  },

  register: async (data: RegisterDto): Promise<ApiResponse<{ accountId: number; email: string; message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ accountId: number; email: string; message: string }>>(
      "/authentication/register",
      data,
    )
    // Don't save tokens here - user needs to activate account first
    return response
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/authentication/logout")
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("account_id")
        localStorage.removeItem("user")
      }
    }
  },

  refreshToken: async (accountId: number, refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
    console.log("[v0] authApi.refreshToken called with accountId:", accountId)

    const response = await apiClient.post<ApiResponse<AuthResponse>>("/Authentication/refresh-token", {
      accountId,
      refreshToken,
    })

    console.log("[v0] authApi.refreshToken response:", response)

    if (typeof window !== "undefined" && response.isSuccess && response.data?.token) {
      localStorage.setItem("access_token", response.data.token)
      // Update refresh token if a new one is provided
      if (response.data.refreshToken) {
        localStorage.setItem("refresh_token", response.data.refreshToken)
        console.log("[v0] New refresh token saved")
      }
      // Cache accountId for future refresh attempts
      localStorage.setItem("account_id", accountId.toString())
    }

    return response
  },

  refreshTokenFromCache: async (): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.get<ApiResponse<AuthResponse>>("/Authentication/refresh-token")

    if (typeof window !== "undefined" && response.isSuccess && response.data?.token) {
      localStorage.setItem("access_token", response.data.token)
      if (response.data.refreshToken) {
        localStorage.setItem("refresh_token", response.data.refreshToken)
      }
    }

    return response
  },

  activateAccount: async (token: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.get<ApiResponse<AuthResponse>>(`/Authentication/activate-account/${token}`)

    // Save tokens for auto-login after activation
    if (typeof window !== "undefined" && response.data?.token) {
      localStorage.setItem("access_token", response.data.token)
      localStorage.setItem("refresh_token", response.data.refreshToken)

      // Cache accountId for token refresh
      const accountId = getAccountIdFromToken(response.data.token)
      if (accountId) {
        localStorage.setItem("account_id", accountId.toString())
      }
    }

    return response
  },

  resendActivationEmail: async (email: string): Promise<ApiResponse<{ email: string; message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ email: string; message: string }>>(
      "/Authentication/resend-activation-email",
      { email },
    )
    return response
  },

  sendOtpEmail: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>("/Authentication/send-otp-email", { email })
    return response
  },

  verifyOtp: async (email: string, otp: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>("/Authentication/verify-otp", {
      email,
      otp,
    })
    return response
  },

  changePasswordWithOtp: async (
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      "/Authentication/change-password-with-otp",
      { email, otp, newPassword },
    )
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

  loginGoogle: async (): Promise<ApiResponse<{ url: string }>> => {
    const response = await apiClient.get<ApiResponse<{ url: string }>>("/Authentication/google-login-url")
    console.log("Google login API response:", response)
    return response
  },

  exchangeGoogleCode: async (code: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/Authentication/exchange-google", { code })

    if (typeof window !== "undefined" && response.isSuccess && response.data?.token) {
      localStorage.setItem("access_token", response.data.token)
      localStorage.setItem("refresh_token", response.data.refreshToken)

      // Cache accountId for token refresh
      const accountId = getAccountIdFromToken(response.data.token)
      if (accountId) {
        localStorage.setItem("account_id", accountId.toString())
      }
    }

    return response
  },

  callbackGoogle: async (code: string): Promise<ApiResponse<AuthResponse>> => {
    console.log("Calling Google callback with code:", code)
    const response = await apiClient.get<ApiResponse<AuthResponse>>(`/Authentication/callback-google?code=${code}`)
    console.log("Google callback response:", response)

    if (typeof window !== "undefined" && response.isSuccess && response.data?.token) {
      console.log("Saving tokens to localStorage")
      localStorage.setItem("access_token", response.data.token)
      localStorage.setItem("refresh_token", response.data.refreshToken)

      // Cache accountId for token refresh
      const accountId = getAccountIdFromToken(response.data.token)
      if (accountId) {
        localStorage.setItem("account_id", accountId.toString())
      }
    }

    return response
  },
}
