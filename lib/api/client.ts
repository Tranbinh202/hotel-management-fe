import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios"
import type { ApiError } from "@/lib/types/api"

class ApiClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        return config
      },
      (error) => {
        return Promise.reject(this.handleError(error))
      },
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null

            if (refreshToken) {
              const response = await this.instance.post("/auth/refresh", { refreshToken })
              const { accessToken } = response.data

              if (typeof window !== "undefined") {
                localStorage.setItem("access_token", accessToken)
              }

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
              }

              return this.instance(originalRequest)
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            if (typeof window !== "undefined") {
              localStorage.removeItem("access_token")
              localStorage.removeItem("refresh_token")
              window.location.href = "/login"
            }
          }
        }

        return Promise.reject(this.handleError(error))
      },
    )
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error
      const data = error.response.data as any
      return {
        message: data?.message || "Đã xảy ra lỗi từ máy chủ",
        code: data?.code,
        status: error.response.status,
        errors: data?.errors,
      }
    } else if (error.request) {
      // Request made but no response
      return {
        message: "Không thể kết nối đến máy chủ",
        code: "NETWORK_ERROR",
      }
    } else {
      // Something else happened
      return {
        message: error.message || "Đã xảy ra lỗi không xác định",
        code: "UNKNOWN_ERROR",
      }
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient()
