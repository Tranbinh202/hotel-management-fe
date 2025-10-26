"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { accountApi } from "@/lib/api/account"

interface LoginResponse {
  isSuccess: boolean
  data: {
    token: string
    refreshToken: string
    roles: string[]
  }
  message: string
}

interface AccountSummary {
  accountId: number
  username: string
  email: string
  isLocked: boolean
  roles: string[]
  accountType: string
  profileDetails: {
    employeeId?: number
    customerId?: number
    fullName: string
    phoneNumber: string
    employeeTypeName?: string
    hireDate?: string
    isActive?: boolean
  }
}

interface AuthContextType {
  user: AccountSummary | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AccountSummary | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load auth data from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token")
    const storedUser = localStorage.getItem("user")

    // Clean up old token keys if they exist
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")

    if (storedToken && storedUser) {
      setToken(storedToken)
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
    }
    setIsLoading(false)
  }, [])

  // Fetch user account summary
  const fetchUserSummary = async (): Promise<AccountSummary> => {
    const result = await accountApi.getSummary(0)

    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to fetch user data")
    }

    return result.data
  }

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const loginData = await authApi.login({ email, password })

      if (!loginData.isSuccess) {
        throw new Error(loginData.message || "Login failed")
      }

      const { token: authToken, refreshToken, roles } = loginData.data

      localStorage.setItem("access_token", authToken)
      localStorage.setItem("refresh_token", refreshToken)

      setToken(authToken)

      // Fetch full user data
      const userData = await fetchUserSummary()
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)

      // Role-based routing
      const userRoles = userData.roles || roles
      const isAdminOrManager = userRoles.some((role) => role === "Admin" || role === "Manager")

      if (isAdminOrManager) {
        router.push("/admin/dashboard")
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")

    authApi.logout()
    setToken(null)
    setUser(null)
    router.push("/login")
  }

  // Refresh user data
  const refreshUserData = async () => {
    if (!token) return

    try {
      const userData = await fetchUserSummary()
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error("Failed to refresh user data:", error)
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
