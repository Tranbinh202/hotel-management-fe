// api-client.ts
import axios, { type AxiosError, AxiosHeaders, type AxiosInstance, type AxiosRequestConfig } from "axios"
import type { ApiError, ApiResponse, AuthResponse } from "@/lib/types/api"
import { QueryClient } from "@tanstack/react-query"
import { isTokenExpired, getAccountIdFromToken } from "@/lib/utils/token"

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
})

class ApiClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api",
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    })
    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      async (config) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

        if (!config.headers) config.headers = new AxiosHeaders()
        const h = config.headers as AxiosHeaders

        if (token && isTokenExpired(token)) {
          console.log("Token expired, refreshing before request...")

          try {
            const newToken = await this.handleTokenRefresh()
            if (newToken) {
              h.set("Authorization", `Bearer ${newToken}`)
            }
          } catch (error) {
            console.error("Failed to refresh token in request interceptor:", error)
            // Continue with expired token, let response interceptor handle it
            if (token) {
              h.set("Authorization", `Bearer ${token}`)
            }
          }
        } else if (token) {
          h.set("Authorization", `Bearer ${token}`)
        }

        if (!h.has("Content-Type")) {
          h.set("Content-Type", "application/json")
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined
        const status = error.response?.status

        if (!original || original._retry) {
          return Promise.reject(this.handleError(error))
        }

        if (status === 401) {
          original._retry = true

          if (!isRefreshing) {
            isRefreshing = true
            try {
              const newToken = await this.handleTokenRefresh()

              if (!newToken) {
                throw new Error("Failed to refresh token")
              }

              // Notify all queued requests
              refreshQueue.forEach((cb) => cb(newToken))
              refreshQueue = []
              isRefreshing = false

              // Retry original request with new token
              if (!original.headers) original.headers = new AxiosHeaders()
              ;(original.headers as AxiosHeaders).set("Authorization", `Bearer ${newToken}`)

              return this.instance(original)
            } catch (e) {
              console.error("Token refresh failed:", e)
              refreshQueue.forEach((cb) => cb(null))
              refreshQueue = []
              isRefreshing = false

              if (typeof window !== "undefined") {
                localStorage.removeItem("access_token")
                localStorage.removeItem("refresh_token")
                localStorage.removeItem("user")
                window.location.href = "/login"
              }
              return Promise.reject(this.handleError(error))
            }
          } else {
            // Wait for ongoing refresh
            return new Promise((resolve, reject) => {
              refreshQueue.push((newToken) => {
                if (!newToken) {
                  reject(this.handleError(error))
                  return
                }
                if (!original.headers) original.headers = new AxiosHeaders()
                ;(original.headers as AxiosHeaders).set("Authorization", `Bearer ${newToken}`)
                resolve(this.instance(original))
              })
            })
          }
        }

        return Promise.reject(this.handleError(error))
      },
    )
  }

  private async handleTokenRefresh(): Promise<string | null> {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null
    const accessToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

    if (!refreshToken) {
      console.error("No refresh token available")
      return null
    }

    try {
      // Try to get accountId from current access token
      let accountId: number | null = null
      if (accessToken) {
        accountId = getAccountIdFromToken(accessToken)
      }

      let response: any

      if (accountId) {
        // Use POST endpoint with accountId and refreshToken
        console.log("Refreshing token with POST endpoint (accountId:", accountId, ")")
        response = await refreshClient.post<ApiResponse<AuthResponse>>("/Authentication/refresh-token", {
          accountId,
          refreshToken,
        })
      } else {
        // Fallback to GET endpoint (from cache)
        console.log("Refreshing token with GET endpoint (from cache)")
        response = await refreshClient.get<ApiResponse<AuthResponse>>("/Authentication/refresh-token", {
          headers: { Authorization: `Bearer ${refreshToken}` },
        })
      }

      const newAccessToken = response.data?.data?.token || response.data?.token
      const newRefreshToken = response.data?.data?.refreshToken || response.data?.refreshToken

      if (!newAccessToken) {
        throw new Error("No access token in refresh response")
      }

      // Update tokens in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", newAccessToken)
        if (newRefreshToken) {
          localStorage.setItem("refresh_token", newRefreshToken)
        }
      }

      console.log("Token refreshed successfully")
      return newAccessToken
    } catch (error) {
      console.error("Token refresh error:", error)
      throw error
    }
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      const data = error.response.data as any
      return {
        message: data?.message || "Đã xảy ra lỗi từ máy chủ",
        code: data?.code,
        status: error.response.status,
        errors: data?.errors,
      }
    } else if (error.request) {
      return { message: "Không thể kết nối đến máy chủ", code: "NETWORK_ERROR" }
    } else {
      return { message: error.message || "Đã xảy ra lỗi không xác định", code: "UNKNOWN_ERROR" }
    }
  }

  // wrappers...
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.get<T>(url, config)
    return res.data
  }
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.post<T>(url, data, config)
    return res.data
  }
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.put<T>(url, data, config)
    return res.data
  }
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.patch<T>(url, data, config)
    return res.data
  }
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.delete<T>(url, config)
    return res.data
  }
}

export const apiClient = new ApiClient()

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 }, mutations: { retry: 1 } },
})
