import axios from "axios"

// Tạo axios instance với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor - thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage hoặc cookie
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor - xử lý lỗi chung
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Xử lý lỗi 401 - Unauthorized
    if (error.response?.status === 401) {
      // Xóa token và redirect về trang login
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
        window.location.href = "/login"
      }
    }

    // Xử lý lỗi 403 - Forbidden
    if (error.response?.status === 403) {
      console.error("Bạn không có quyền truy cập")
    }

    // Xử lý lỗi 500 - Server Error
    if (error.response?.status === 500) {
      console.error("Lỗi server, vui lòng thử lại sau")
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
