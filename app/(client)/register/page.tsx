"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRegister } from "@/lib/hooks"
import { Sparkles, UserPlus, Shield, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const { mutate: register, isPending } = useRegister()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    identityCard: "",
    address: "",
    phoneNumber: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = "Vui lòng nhập tên đăng nhập"
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự"
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu"
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp"
    }

    if (!formData.identityCard.trim()) {
      newErrors.identityCard = "Vui lòng nhập số CMND/CCCD"
    } else if (!/^[0-9]{9,12}$/.test(formData.identityCard)) {
      newErrors.identityCard = "Số CMND/CCCD không hợp lệ (9-12 chữ số)"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ"
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại"
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ (10-11 chữ số)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        identityCard: formData.identityCard,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
      }
      console.log("Form submitted:", registrationData)
      // Handle registration logic here
      register(registrationData)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[oklch(0.99_0.005_85)] via-white to-[oklch(0.96_0.01_85)]">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-xl animate-fade-in-up">
          <div className="mb-10">
            
            <h1 className="text-5xl font-serif font-bold text-foreground mb-3 leading-tight">Đăng ký tài khoản</h1>
            <p className="text-muted-foreground text-lg leading-loose">Điền thông tin để tạo tài khoản mới</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground font-semibold text-sm">
                Tên đăng nhập
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className={`h-12 border-2 focus:border-[oklch(0.72_0.12_75)] transition-all ${errors.username ? "border-red-500" : ""}`}
                placeholder="username123"
              />
              {errors.username && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground font-semibold text-sm">
                Họ và tên
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                className={`h-12 border-2 focus:border-[oklch(0.72_0.12_75)] transition-all ${errors.fullName ? "border-red-500" : ""}`}
                placeholder="Nguyễn Văn A"
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-semibold text-sm">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`h-12 border-2 focus:border-[oklch(0.72_0.12_75)] transition-all ${errors.email ? "border-red-500" : ""}`}
                placeholder="example@email.com"
              />
              {errors.email && <p className="text-xs text-red-500 flex items-center gap-1 mt-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-semibold text-sm">
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`h-12 border-2 focus:border-[oklch(0.72_0.12_75)] transition-all ${errors.password ? "border-red-500" : ""}`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-semibold text-sm">
                  Xác nhận mật khẩu
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`h-12 border-2 focus:border-[oklch(0.72_0.12_75)] transition-all ${errors.confirmPassword ? "border-red-500" : ""}`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="identityCard" className="text-foreground font-semibold text-sm">
                  Số CMND/CCCD
                </Label>
                <Input
                  id="identityCard"
                  name="identityCard"
                  type="text"
                  value={formData.identityCard}
                  onChange={handleChange}
                  className={`h-12 border-2 focus:border-[oklch(0.72_0.12_75)] transition-all ${errors.identityCard ? "border-red-500" : ""}`}
                  placeholder="001234567890"
                />
                {errors.identityCard && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">{errors.identityCard}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-foreground font-semibold text-sm">
                  Số điện thoại
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`h-12 border-2 focus:border-[oklch(0.72_0.12_75)] transition-all ${errors.phoneNumber ? "border-red-500" : ""}`}
                  placeholder="0536549059"
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">{errors.phoneNumber}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-foreground font-semibold text-sm">
                Địa chỉ
              </Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`min-h-[90px] resize-none border-2 focus:border-[oklch(0.72_0.12_75)] transition-all ${errors.address ? "border-red-500" : ""}`}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
              />
              {errors.address && <p className="text-xs text-red-500 flex items-center gap-1 mt-1">{errors.address}</p>}
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-14 text-base font-semibold luxury-gradient hover:opacity-90 text-white shadow-lg shadow-[oklch(0.72_0.12_75)]/30 hover:shadow-xl hover:shadow-[oklch(0.72_0.12_75)]/40 transition-all duration-300"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xử lý...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Đăng ký
                </span>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground leading-loose">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-[oklch(0.25_0.04_265)] hover:text-[oklch(0.72_0.12_75)] font-semibold transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-1 luxury-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div
          className="relative z-10 text-center text-white max-w-lg animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl glass-effect mb-8 shadow-2xl">
              <Sparkles className="w-14 h-14" />
            </div>
            <h2 className="text-5xl font-serif font-bold mb-5 leading-tight">Chào mừng đến với StayHub</h2>
            <p className="text-xl text-white/95 leading-loose font-light">
              Hệ thống quản lý khách sạn hiện đại với đầy đủ tính năng và giao diện thân thiện
            </p>
          </div>

          <div className="grid grid-cols-3 gap-5 mt-14">
            <div className="glass-effect rounded-2xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-sm text-white/90 font-medium">Khách sạn</div>
            </div>
            <div
              className="glass-effect rounded-2xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-transform duration-300"
              style={{ transitionDelay: "0.1s" }}
            >
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-sm text-white/90 font-medium">Người dùng</div>
            </div>
            <div
              className="glass-effect rounded-2xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-transform duration-300"
              style={{ transitionDelay: "0.2s" }}
            >
              <div className="text-4xl font-bold mb-2">4.9★</div>
              <div className="text-sm text-white/90 font-medium">Đánh giá</div>
            </div>
          </div>

          <div className="mt-14 space-y-4">
            {[
              { icon: Shield, text: "Bảo mật thông tin tuyệt đối" },
              { icon: CheckCircle2, text: "Xác thực nhanh chóng" },
              { icon: Sparkles, text: "Trải nghiệm cao cấp" },
            ].map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="flex items-center gap-3 text-white/90 text-sm font-medium">
                  <IconComponent className="w-5 h-5 text-[oklch(0.72_0.12_75)]" />
                  <span>{feature.text}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
