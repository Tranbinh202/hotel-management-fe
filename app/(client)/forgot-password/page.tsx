"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail, Shield, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { useSendOtpEmail, useVerifyOtp, useChangePasswordWithOtp } from "@/lib/hooks/use-auth"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { isAuthenticated, isInitializing } = useAuth()
  const [step, setStep] = useState<"email" | "otp" | "password">("email")
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const sendOtpMutation = useSendOtpEmail()
  const verifyOtpMutation = useVerifyOtp()
  const changePasswordMutation = useChangePasswordWithOtp()

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isInitializing, router])

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

  const validateOtp = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.otp) {
      newErrors.otp = "Vui lòng nhập mã OTP"
    } else if (formData.otp.length !== 6) {
      newErrors.otp = "Mã OTP phải có 6 ký tự"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới"
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendOtp = async () => {
    if (!validateEmail()) return

    sendOtpMutation.mutate(formData.email, {
      onSuccess: () => {
        setStep("otp")
      },
    })
  }

  const handleVerifyOtp = async () => {
    if (!validateOtp()) return

    verifyOtpMutation.mutate(
      { email: formData.email, otp: formData.otp },
      {
        onSuccess: () => {
          setStep("password")
        },
      },
    )
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePassword()) return

    changePasswordMutation.mutate({
      email: formData.email,
      otp: formData.otp,
      newPassword: formData.newPassword,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleResendOtp = () => {
    sendOtpMutation.mutate(formData.email)
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground leading-loose">Đang tải...</span>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
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
          <p className="text-muted-foreground mb-8 leading-loose">
            {step === "email" && "Nhập email để nhận mã xác thực"}
            {step === "otp" && "Nhập mã OTP đã được gửi đến email"}
            {step === "password" && "Nhập mật khẩu mới của bạn"}
          </p>

          {/* Step 1: Email */}
          {step === "email" && (
            <div className="space-y-6">
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
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500 leading-loose">{errors.email}</p>}
              </div>

              <Button
                type="button"
                onClick={handleSendOtp}
                disabled={sendOtpMutation.isPending}
                className="w-full luxury-gradient hover:opacity-90 text-white"
              >
                {sendOtpMutation.isPending ? "Đang gửi..." : "Gửi mã OTP"}
              </Button>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">Mã OTP</Label>
                <Input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength={6}
                  className={errors.otp ? "border-red-500" : ""}
                  placeholder="000000"
                />
                {errors.otp && <p className="text-sm text-red-500 leading-loose">{errors.otp}</p>}
              </div>

              <p className="text-sm text-muted-foreground leading-loose">
                Mã OTP đã được gửi đến <span className="font-semibold">{formData.email}</span>
              </p>

              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyOtpMutation.isPending}
                className="w-full luxury-gradient hover:opacity-90 text-white"
              >
                {verifyOtpMutation.isPending ? "Đang xác thực..." : "Xác thực OTP"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleResendOtp}
                disabled={sendOtpMutation.isPending}
                className="w-full bg-transparent"
              >
                Gửi lại mã OTP
              </Button>

              <Button type="button" variant="ghost" onClick={() => setStep("email")} className="w-full">
                Quay lại
              </Button>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === "password" && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.newPassword ? "border-red-500" : ""}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-sm text-red-500 leading-loose">{errors.newPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 leading-loose">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="w-full luxury-gradient hover:opacity-90 text-white"
              >
                {changePasswordMutation.isPending ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
              </Button>
            </form>
          )}

          <p className="text-center text-muted-foreground mt-6 leading-loose">
            Nhớ mật khẩu?{" "}
            <Link href="/login" className="text-accent hover:text-accent/80 font-semibold transition-colors">
              Đăng nhập
            </Link>
          </p>
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
              <span className="text-left leading-loose">Mã OTP được mã hóa an toàn</span>
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
