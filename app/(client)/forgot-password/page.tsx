"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    code: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  const validateEmail = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateCode = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code) {
      newErrors.code = "Vui lòng nhập mã xác nhận"
    } else if (formData.code.length !== 6) {
      newErrors.code = "Mã xác nhận phải có 6 ký tự"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendCode = async () => {
    if (!validateEmail()) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setCodeSent(true)

    console.log("Code sent to:", formData.email)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateCode()) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)

    console.log("Code verified:", formData.code)
    router.push("/change-password")
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

          <h1 className="text-4xl font-bold text-foreground mb-2">Quên mật khẩu</h1>
          <p className="text-muted-foreground mb-8">Nhập email để nhận mã xác nhận</p>

          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={codeSent}
                className={errors.email ? "border-red-500" : ""}
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="code">Nhập mã</Label>
                <Input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  maxLength={6}
                  className={errors.code ? "border-red-500" : ""}
                  placeholder="000000"
                />
                {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isLoading || !formData.email}
                  className="bg-[#06B6D4] hover:bg-[#0891B2] whitespace-nowrap"
                >
                  {codeSent ? "Gửi lại" : "Gửi mã"}
                </Button>
              </div>
            </div>

            {codeSent && <p className="text-sm text-green-600">Mã xác nhận đã được gửi đến email của bạn!</p>}

            <Button
              type="submit"
              disabled={isLoading || !codeSent}
              className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF5E7E] hover:opacity-90"
            >
              {isLoading ? "Đang xác nhận..." : "Xác nhận"}
            </Button>

            <p className="text-center text-muted-foreground mt-6">
              Nhớ mật khẩu?{" "}
              <Link href="/login" className="text-[#06B6D4] hover:text-[#0891B2] font-semibold transition-colors">
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#A78BFA] via-[#FF6B6B] to-[#06B6D4] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-white text-center max-w-lg">
          <div className="mb-8">
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-5xl font-bold mb-6">Đừng lo lắng!</h2>
          <p className="text-xl text-white/90 leading-relaxed">
            Chúng tôi sẽ giúp bạn khôi phục tài khoản một cách nhanh chóng và an toàn
          </p>
        </div>
      </div>
    </div>
  )
}
