import { Card } from '@/components/ui/card';
// api-client.ts
import axios, { AxiosError, AxiosHeaders, AxiosInstance, AxiosRequestConfig } from "axios"
import type { ApiError } from "@/lib/types/api"
import { QueryClient } from "@tanstack/react-query"

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
})

class ApiClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    })
    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

        // Bảo đảm headers là AxiosHeaders, rồi dùng .set()
        if (!config.headers) config.headers = new AxiosHeaders()
        const h = config.headers as AxiosHeaders

        if (token) {
          h.set("Authorization", `Bearer ${token}`)
        }
        // Nếu cần set content-type
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

        // Nếu không có request gốc hoặc đã retry thì trả lỗi luôn
        if (!original || original._retry) {
          return Promise.reject(this.handleError(error))
        }

        if (status === 401) {
          original._retry = true

          // Hàng đợi các request đợi token mới
          if (!isRefreshing) {
            isRefreshing = true
            try {
              const refreshToken =
                typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null

              if (!refreshToken) throw new Error("NO_REFRESH_TOKEN")

              const res = await refreshClient.post("/auth/refresh", { refreshToken })
              const newAccess = (res.data as any)?.accessToken

              if (typeof window !== "undefined" && newAccess) {
                localStorage.setItem("access_token", newAccess)
              }

              // Thông báo cho hàng đợi
              refreshQueue.forEach((cb) => cb(newAccess ?? null))
              refreshQueue = []
              isRefreshing = false

              // Retry request cũ với token mới
              if (!original.headers) original.headers = new AxiosHeaders()
                ; (original.headers as AxiosHeaders).set("Authorization", `Bearer ${newAccess}`)

              return this.instance(original)
            } catch (e) {
              // Refresh fail -> xoá token & điều hướng
              refreshQueue.forEach((cb) => cb(null))
              refreshQueue = []
              isRefreshing = false

              if (typeof window !== "undefined") {
                localStorage.removeItem("access_token")
                localStorage.removeItem("refresh_token")
                window.location.href = "/login"
              }
              return Promise.reject(this.handleError(error))
            }
          } else {
            // Đang refresh -> chờ xong rồi retry
            return new Promise((resolve, reject) => {
              refreshQueue.push((newToken) => {
                if (!newToken) {
                  reject(this.handleError(error))
                  return
                }
                if (!original.headers) original.headers = {}
                original.headers.Authorization = `Bearer ${newToken}`
                resolve(this.instance(original))
              })
            })
          }
        }

        return Promise.reject(this.handleError(error))
      },
    )
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

export const queryClient = new QueryClient(
  { defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000, }, mutations: { retry: 1 } } }
)