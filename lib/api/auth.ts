import axiosInstance from "@/lib/axios"

// Types cho Authentication
export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  gender: "male" | "female" | "other"
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: number
    email: string
    firstName: string
    lastName: string
    role: string
  }
}

// API functions
export const authApi = {
  // Đăng nhập
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/login", data)
    // Lưu token vào localStorage
    if (typeof window !== "undefined" && response.data.accessToken) {
      localStorage.setItem("access_token", response.data.accessToken)
      localStorage.setItem("refresh_token", response.data.refreshToken)
    }
    return response.data
  },

  // Đăng ký
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/register", data)
    return response.data
  },

  // Đăng xuất
  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout")
    // Xóa token khỏi localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    }
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/refresh", { refreshToken })
    if (typeof window !== "undefined" && response.data.accessToken) {
      localStorage.setItem("access_token", response.data.accessToken)
    }
    return response.data
  },

  // Quên mật khẩu
  forgotPassword: async (email: string): Promise<void> => {
    await axiosInstance.post("/auth/forgot-password", { email })
  },

  // Đổi mật khẩu
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await axiosInstance.post("/auth/change-password", { oldPassword, newPassword })
  },
}
