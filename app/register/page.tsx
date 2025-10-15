"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleGenderChange = (gender: string) => {
    setFormData((prev) => ({ ...prev, gender }))
    if (errors.gender) {
      setErrors((prev) => ({ ...prev, gender: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Vui lòng nhập họ"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Vui lòng nhập tên"
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

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại"
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ"
    }

    if (!formData.gender) {
      newErrors.gender = "Vui lòng chọn giới tính"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      console.log("Form submitted:", formData)
      // Handle registration logic here
      alert("Đăng ký thành công!")
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff5e7e] to-[#a78bfa] flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <span className="text-2xl font-serif font-bold bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] bg-clip-text text-transparent">
                StayHub
              </span>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Đăng ký</h1>
            <p className="text-gray-600">Tạo tài khoản mới để bắt đầu trải nghiệm</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Họ</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? "border-red-500" : ""}
                  placeholder="Nguyễn"
                />
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Tên</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "border-red-500" : ""}
                  placeholder="Văn A"
                />
                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-red-500" : ""}
                placeholder="example@email.com"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-red-500" : ""}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "border-red-500" : ""}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? "border-red-500" : ""}
                placeholder="0123456789"
              />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label className="text-gray-700">Giới tính</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleGenderChange("male")}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium ${
                    formData.gender === "male"
                      ? "border-[#14b8a6] bg-[#14b8a6] text-white shadow-lg shadow-teal-500/30"
                      : "border-gray-200 hover:border-[#14b8a6]/50 text-gray-700"
                  }`}
                >
                  Nam
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderChange("female")}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium ${
                    formData.gender === "female"
                      ? "border-[#ff5e7e] bg-[#ff5e7e] text-white shadow-lg shadow-pink-500/30"
                      : "border-gray-200 hover:border-[#ff5e7e]/50 text-gray-700"
                  }`}
                >
                  Nữ
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderChange("other")}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium ${
                    formData.gender === "other"
                      ? "border-[#a78bfa] bg-[#a78bfa] text-white shadow-lg shadow-purple-500/30"
                      : "border-gray-200 hover:border-[#a78bfa]/50 text-gray-700"
                  }`}
                >
                  Khác
                </button>
              </div>
              {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#ff5e7e] to-[#ff4569] hover:from-[#ff4569] hover:to-[#ff2d54] text-white shadow-lg shadow-pink-500/30"
            >
              Đăng ký
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <a href="/login" className="text-[#ff5e7e] font-semibold hover:underline">
                Đăng nhập
              </a>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#ff5e7e] via-[#a78bfa] to-[#14b8a6] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-10"></div>
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
            <p className="text-lg text-white/95 leading-relaxed">
              Hệ thống quản lý khách sạn hiện đại với giao diện thân thiện, dễ sử dụng và đầy đủ tính năng cho người
              dùng trẻ
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
