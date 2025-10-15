"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu"
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)

    console.log("Login data:", formData)
    router.push("/admin/dashboard")
  }

  const handleGoogleLogin = () => {
    console.log("Google login clicked")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-[#FF6B6B] to-[#06B6D4] bg-clip-text text-transparent"
            >
              StayHub
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-2">Đăng nhập</h1>
          <p className="text-muted-foreground mb-8">Chào mừng bạn trở lại!</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-red-500" : ""}
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-red-500" : ""}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-[#06B6D4] hover:text-[#0891B2] font-medium transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF5E7E] hover:opacity-90"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background-white text-muted-foreground">Hoặc</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full flex items-center justify-center gap-3 bg-transparent"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Đăng nhập với Google
            </Button>

            <p className="text-center text-muted-foreground mt-6">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-[#06B6D4] hover:text-[#0891B2] font-semibold transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#FF6B6B] via-[#A78BFA] to-[#06B6D4] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-white text-center max-w-lg">
          <h2 className="text-5xl font-bold mb-6">Chào mừng trở lại!</h2>
          <p className="text-xl text-white/90 leading-relaxed">
            Đăng nhập để tiếp tục quản lý khách sạn của bạn một cách hiệu quả và chuyên nghiệp
          </p>
          <div className="mt-12 grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold">1000+</div>
              <div className="text-sm text-white/80 mt-2">Khách sạn</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">50K+</div>
              <div className="text-sm text-white/80 mt-2">Người dùng</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">99%</div>
              <div className="text-sm text-white/80 mt-2">Hài lòng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
