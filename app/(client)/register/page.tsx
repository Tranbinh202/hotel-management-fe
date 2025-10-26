"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRegister } from "@/lib/hooks"

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
    <div className="min-h-screen flex bg-background">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-xl">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B6B] to-[#06B6D4] flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#FF6B6B] to-[#06B6D4] bg-clip-text text-transparent">
                StayHub
              </span>
            </Link>
            <h1 className="text-4xl font-bold text-foreground mb-2">Đăng ký tài khoản</h1>
            <p className="text-muted-foreground">Điền thông tin để tạo tài khoản mới</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground font-medium">
                Tên đăng nhập
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className={`h-11 ${errors.username ? "border-red-500" : ""}`}
                placeholder="username123"
              />
              {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground font-medium">
                Họ và tên
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                className={`h-11 ${errors.fullName ? "border-red-500" : ""}`}
                placeholder="Nguyễn Văn A"
              />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                placeholder="example@email.com"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password fields in grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`h-11 ${errors.password ? "border-red-500" : ""}`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                  Xác nhận mật khẩu
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`h-11 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="identityCard" className="text-foreground font-medium">
                  Số CMND/CCCD
                </Label>
                <Input
                  name="identityCard"
                  type="text"
                  value={formData.identityCard}
                  onChange={handleChange}
                  className={`h-11 ${errors.identityCard ? "border-red-500" : ""}`}
                  placeholder="001234567890"
                />
                {errors.identityCard && <p className="text-xs text-red-500">{errors.identityCard}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-foreground font-medium">
                  Số điện thoại
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`h-11 ${errors.phoneNumber ? "border-red-500" : ""}`}
                  placeholder="0536549059"
                />
                {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber}</p>}
              </div>
            </div>


            <div className="space-y-2">
              <Label htmlFor="address" className="text-foreground font-medium">
                Địa chỉ
              </Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`min-h-[80px] resize-none ${errors.address ? "border-red-500" : ""}`}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
              />
              {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#FF6B6B] to-[#FF5E7E] hover:opacity-90 text-white shadow-lg"
            >
              Đăng ký
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-[#06B6D4] hover:text-[#0891B2] font-semibold transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#FF6B6B] via-[#A78BFA] to-[#06B6D4] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center text-white max-w-lg">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm mb-6 shadow-2xl">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold mb-4">Chào mừng đến với StayHub</h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Hệ thống quản lý khách sạn hiện đại với đầy đủ tính năng và giao diện thân thiện
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-12">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-white/20">
              <div className="text-3xl font-bold mb-1">1000+</div>
              <div className="text-sm text-white/90">Khách sạn</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-white/20">
              <div className="text-3xl font-bold mb-1">50K+</div>
              <div className="text-sm text-white/90">Người dùng</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-white/20">
              <div className="text-3xl font-bold mb-1">4.9★</div>
              <div className="text-sm text-white/90">Đánh giá</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
