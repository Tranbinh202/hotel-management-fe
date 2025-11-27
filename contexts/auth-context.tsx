"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { accountApi } from "@/lib/api/account"
import { isTokenExpired, getAccountIdFromToken } from "@/lib/utils/token"

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
  isInitializing: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AccountSummary | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("access_token")
      const storedRefreshToken = localStorage.getItem("refresh_token")
      const storedUser = localStorage.getItem("user")

      console.log("[v0] Initializing auth...")
      console.log("[v0] Has stored token:", !!storedToken)
      console.log("[v0] Has stored refresh token:", !!storedRefreshToken)
      console.log("[v0] Has stored user:", !!storedUser)

      // Clean up old token keys if they exist
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")

      if (storedToken && storedUser) {
        // Check if token is expired
        const tokenExpired = isTokenExpired(storedToken)
        console.log("[v0] Token expired:", tokenExpired)

        if (tokenExpired) {
          console.log("[v0] Access token expired on load, attempting refresh...")

          if (storedRefreshToken) {
            try {
              const accountId = getAccountIdFromToken(storedToken)
              console.log("[v0] Account ID from token:", accountId)

              if (accountId) {
                // Attempt to refresh the token
                const refreshResult = await authApi.refreshToken(accountId, storedRefreshToken)
                console.log("[v0] Refresh result:", refreshResult)

                if (refreshResult.isSuccess && refreshResult.data.token) {
                  console.log("[v0] Token refreshed successfully on load")
                  const newToken = refreshResult.data.token
                  const newRefreshToken = refreshResult.data.refreshToken

                  localStorage.setItem("access_token", newToken)
                  if (newRefreshToken) {
                    localStorage.setItem("refresh_token", newRefreshToken)
                  }

                  setToken(newToken)
                  const parsedUser = JSON.parse(storedUser)
                  setUser(parsedUser)
                } else {
                  console.log("[v0] Token refresh failed, clearing auth data")
                  localStorage.removeItem("access_token")
                  localStorage.removeItem("refresh_token")
                  localStorage.removeItem("user")
                }
              } else {
                console.log("[v0] Could not extract accountId, clearing auth data")
                localStorage.removeItem("access_token")
                localStorage.removeItem("refresh_token")
                localStorage.removeItem("user")
              }
            } catch (error) {
              console.error("[v0] Error refreshing token on load:", error)
              localStorage.removeItem("access_token")
              localStorage.removeItem("refresh_token")
              localStorage.removeItem("user")
            }
          } else {
            console.log("[v0] No refresh token available, clearing auth data")
            localStorage.removeItem("access_token")
            localStorage.removeItem("refresh_token")
            localStorage.removeItem("user")
          }
        } else {
          // Token is still valid
          console.log("[v0] Token is still valid, setting auth state")
          setToken(storedToken)
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        }
      } else {
        console.log("[v0] No stored auth data found")
      }

      setIsInitializing(false)
      console.log("[v0] Auth initialization complete")
    }

    initializeAuth()
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
        const errorMessage = loginData.message || "Tên đăng nhập hoặc mật khẩu không chính xác"
        throw new Error(errorMessage)
      }

      const { token: authToken, refreshToken, roles } = loginData.data

      localStorage.setItem("access_token", authToken)
      localStorage.setItem("refresh_token", refreshToken)

      setToken(authToken)

      // Fetch full user data
      const userData = await fetchUserSummary()
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)

      if (userData.isLocked) {
        // Clear tokens and redirect to locked page
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user")
        setToken(null)
        setUser(null)
        router.push("/account-locked")
        throw new Error("Tài khoản đã bị khóa")
      }

      // Role-based routing
      const userRoles = userData.roles || roles
      const isAdminOrManagerOrReceptionist = userRoles.some(
        (role) => role === "Admin" || role === "Manager" || role === "Receptionist",
      )

      if (isAdminOrManagerOrReceptionist) {
        router.push("/admin/dashboard")
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Login error:", error)
      if (error instanceof Error) {
        throw error
      } else {
        throw new Error("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.")
      }
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

  const refreshUserData = async () => {
    if (!token) {
      console.log("[v0] No token available for refresh")
      return
    }

    // Check if token is expired before fetching
    const tokenExpired = isTokenExpired(token)
    console.log("[v0] Refreshing user data, token expired:", tokenExpired)

    if (tokenExpired) {
      console.log("[v0] Token expired, refreshing before fetching user data...")
      const refreshToken = localStorage.getItem("refresh_token")
      const accountId = getAccountIdFromToken(token)

      console.log("[v0] Has refresh token:", !!refreshToken)
      console.log("[v0] Account ID:", accountId)

      if (refreshToken && accountId) {
        try {
          const refreshResult = await authApi.refreshToken(accountId, refreshToken)
          console.log("[v0] Token refresh result:", refreshResult)

          if (refreshResult.isSuccess && refreshResult.data.token) {
            const newToken = refreshResult.data.token
            const newRefreshToken = refreshResult.data.refreshToken

            localStorage.setItem("access_token", newToken)
            if (newRefreshToken) {
              localStorage.setItem("refresh_token", newRefreshToken)
            }

            setToken(newToken)
            console.log("[v0] Token refreshed successfully")
          } else {
            console.log("[v0] Token refresh failed, logging out")
            logout()
            return
          }
        } catch (error) {
          console.error("[v0] Failed to refresh token:", error)
          logout()
          return
        }
      } else {
        console.log("[v0] Missing refresh token or account ID, logging out")
        logout()
        return
      }
    }

    try {
      console.log("[v0] Fetching user summary...")
      const userData = await fetchUserSummary()
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
      console.log("[v0] User data refreshed successfully")
    } catch (error) {
      console.error("[v0] Failed to refresh user data:", error)
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    isInitializing,
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
