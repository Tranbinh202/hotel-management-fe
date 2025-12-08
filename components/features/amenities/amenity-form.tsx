"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/ui/image-upload"
import type { Amenity, CreateAmenityDto } from "@/lib/types/api"

interface AmenityFormProps {
  amenity?: Amenity
  onSubmit: (data: CreateAmenityDto) => void
  onCancel: () => void
  isLoading?: boolean
}

export function AmenityForm({ amenity, onSubmit, onCancel, isLoading }: AmenityFormProps) {
  const [formData, setFormData] = useState<CreateAmenityDto>({
    amenityName: amenity?.amenityName || "",
    description: amenity?.description || "",
    amenityType: "Common",
    isActive: amenity?.isActive ?? true,
    imageLinks: amenity?.images || [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.amenityName.trim()) {
      newErrors.amenityName = "Vui lòng nhập tên tiện nghi"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="amenityName">
          Tên tiện nghi <span className="text-red-500">*</span>
        </Label>
        <Input
          id="amenityName"
          name="amenityName"
          type="text"
          value={formData.amenityName}
          onChange={handleChange}
          className={errors.amenityName ? "border-red-500" : ""}
          placeholder="VD: Wifi miễn phí, Bể bơi..."
          disabled={isLoading}
        />
        {errors.amenityName && <p className="text-xs text-red-500">{errors.amenityName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Mô tả <span className="text-red-500">*</span>
        </Label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff5e7e] focus:border-transparent outline-none transition-all ${errors.description ? "border-red-500" : "border-slate-300"
            }`}
          placeholder="Mô tả chi tiết về tiện nghi..."
          disabled={isLoading}
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amenityType">
            Loại tiện nghi <span className="text-red-500">*</span>
          </Label>
          <select
            id="amenityType"
            name="amenityType"
            value={formData.amenityType}
            onChange={(e) => setFormData((prev) => ({ ...prev, amenityType: e.target.value as "Common" | "Additional" }))}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            disabled={isLoading}
          >
            <option value="Common">Tiện nghi chung</option>
            <option value="Additional">Tiện nghi bổ sung</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <div className="flex items-center gap-4 h-10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isActive"
                checked={formData.isActive}
                onChange={() => setFormData((prev) => ({ ...prev, isActive: true }))}
                className="w-4 h-4 text-primary focus:ring-primary"
                disabled={isLoading}
              />
              <span className="text-sm">Hoạt động</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isActive"
                checked={!formData.isActive}
                onChange={() => setFormData((prev) => ({ ...prev, isActive: false }))}
                className="w-4 h-4 text-muted-foreground focus:ring-muted-foreground"
                disabled={isLoading}
              />
              <span className="text-sm">Tạm dừng</span>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Hình ảnh</Label>
        <ImageUpload
          value={formData.imageLinks}
          onChange={(urls) => setFormData((prev) => ({ ...prev, imageLinks: urls }))}
          maxImages={5}
          folder="amenities"
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
        <Button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200"
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] hover:from-[#ff4569] hover:to-[#9370db] text-white shadow-lg"
          disabled={isLoading}
        >
          {isLoading ? "Đang xử lý..." : amenity ? "Cập nhật" : "Thêm mới"}
        </Button>
      </div>
    </form>
  )
}
