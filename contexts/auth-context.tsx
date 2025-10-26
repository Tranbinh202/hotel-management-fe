"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { API_CONFIG, getAuthHeader } from "@/lib/api-config"

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
        const storedToken = localStorage.getItem("token")
        const storedUser = localStorage.getItem("user")

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }
        setIsLoading(false)
    }, [])

    // Fetch user account summary
    const fetchUserSummary = async (authToken: string): Promise<AccountSummary> => {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCOUNT_SUMMARY}`, {
            headers: {
                ...API_CONFIG.HEADERS,
                ...getAuthHeader(authToken),
            },
        })

        if (!response.ok) {
            throw new Error("Failed to fetch user summary")
        }

        const result = await response.json()
        if (!result.isSuccess) {
            throw new Error(result.message || "Failed to fetch user data")
        }

        return result.data
    }

    // Login function
    const login = async (email: string, password: string) => {
        setIsLoading(true)
        try {
            // Call login API
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ email, password }),
            })

            if (!response.ok) {
                throw new Error("Login failed")
            }

            const loginData: LoginResponse = await response.json()

            if (!loginData.isSuccess) {
                throw new Error(loginData.message || "Login failed")
            }

            const { token: authToken, refreshToken, roles } = loginData.data

            // Store tokens
            localStorage.setItem("token", authToken)
            localStorage.setItem("refreshToken", refreshToken)
            setToken(authToken)

            // Fetch full user data
            const userData = await fetchUserSummary(authToken)
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
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")
        setToken(null)
        setUser(null)
        router.push("/login")
    }

    // Refresh user data
    const refreshUserData = async () => {
        if (!token) return

        try {
            const userData = await fetchUserSummary(token)
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
