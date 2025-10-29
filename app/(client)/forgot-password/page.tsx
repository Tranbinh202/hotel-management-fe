"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail, Shield, CheckCircle2 } from "lucide-react"

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
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-8">
            <Link href="/" className="text-2xl font-serif font-bold luxury-text-gradient">
              StayHub
            </Link>
          </div>

          <h1 className="text-4xl font-serif font-bold text-foreground mb-2 leading-tight">Quên mật khẩu</h1>
          <p className="text-muted-foreground mb-8 leading-loose">Nhập email để nhận mã xác nhận</p>

          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={codeSent}
                  className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  placeholder="your.email@example.com"
                />
              </div>
              {errors.email && <p className="text-sm text-red-500 leading-loose">{errors.email}</p>}
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
                {errors.code && <p className="text-sm text-red-500 leading-loose">{errors.code}</p>}
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isLoading || !formData.email}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground whitespace-nowrap"
                >
                  {codeSent ? "Gửi lại" : "Gửi mã"}
                </Button>
              </div>
            </div>

            {codeSent && (
              <p className="text-sm text-green-600 leading-loose flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Mã xác nhận đã được gửi đến email của bạn!
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading || !codeSent}
              className="w-full luxury-gradient hover:opacity-90 text-white"
            >
              {isLoading ? "Đang xác nhận..." : "Xác nhận"}
            </Button>

            <p className="text-center text-muted-foreground mt-6 leading-loose">
              Nhớ mật khẩu?{" "}
              <Link href="/login" className="text-accent hover:text-accent/80 font-semibold transition-colors">
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 luxury-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div
          className="relative z-10 text-white text-center max-w-lg animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="mb-8">
            <Lock className="w-24 h-24 mx-auto animate-float" />
          </div>
          <h2 className="text-5xl font-serif font-bold mb-6 leading-tight">Đừng lo lắng!</h2>
          <p className="text-xl text-white/90 leading-loose mb-8">
            Chúng tôi sẽ giúp bạn khôi phục tài khoản một cách nhanh chóng và an toàn
          </p>

          <div className="space-y-4">
            <div
              className="flex items-center gap-3 glass-effect rounded-lg p-4 animate-scale-in"
              style={{ animationDelay: "0.4s" }}
            >
              <Shield className="w-6 h-6 flex-shrink-0" />
              <span className="text-left leading-loose">Mã xác nhận được mã hóa an toàn</span>
            </div>
            <div
              className="flex items-center gap-3 glass-effect rounded-lg p-4 animate-scale-in"
              style={{ animationDelay: "0.6s" }}
            >
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <span className="text-left leading-loose">Xác thực qua email đã đăng ký</span>
            </div>
            <div
              className="flex items-center gap-3 glass-effect rounded-lg p-4 animate-scale-in"
              style={{ animationDelay: "0.8s" }}
            >
              <Lock className="w-6 h-6 flex-shrink-0" />
              <span className="text-left leading-loose">Bảo mật thông tin tuyệt đối</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
