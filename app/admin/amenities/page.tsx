"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface Amenity {
  amenityId: number
  amenityName: string
  description: string
  price: number
  isActive: boolean
  createdAt: string
  createdBy: number | null
  updatedAt: string
  updatedBy: number
  images: string[]
}

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([
    {
      amenityId: 1,
      amenityName: "Wifi miễn phí",
      description: "Kết nối internet tốc độ cao miễn phí cho khách.",
      price: 0,
      isActive: true,
      createdAt: "2025-10-15T07:26:22.5320509",
      createdBy: null,
      updatedAt: "2025-10-15T08:25:50.5334589",
      updatedBy: 0,
      images: [],
    },
    {
      amenityId: 2,
      amenityName: "Bể bơi",
      description: "Bể bơi ngoài trời với tầm nhìn tuyệt đẹp.",
      price: 0,
      isActive: true,
      createdAt: "2025-10-15T07:26:22.5320509",
      createdBy: null,
      updatedAt: "2025-10-15T08:25:50.5334589",
      updatedBy: 0,
      images: [],
    },
    {
      amenityId: 3,
      amenityName: "Spa & Massage",
      description: "Dịch vụ spa và massage chuyên nghiệp.",
      price: 500000,
      isActive: true,
      createdAt: "2025-10-15T07:26:22.5320509",
      createdBy: null,
      updatedAt: "2025-10-15T08:25:50.5334589",
      updatedBy: 0,
      images: [],
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    amenityName: "",
    description: "",
    price: 0,
    isActive: true,
    images: [] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filteredAmenities = amenities.filter(
    (amenity) =>
      amenity.amenityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      amenity.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenModal = (amenity?: Amenity) => {
    if (amenity) {
      setEditingAmenity(amenity)
      setFormData({
        amenityName: amenity.amenityName,
        description: amenity.description,
        price: amenity.price,
        isActive: amenity.isActive,
        images: amenity.images,
      })
    } else {
      setEditingAmenity(null)
      setFormData({
        amenityName: "",
        description: "",
        price: 0,
        isActive: true,
        images: [],
      })
    }
    setErrors({})
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingAmenity(null)
    setFormData({
      amenityName: "",
      description: "",
      price: 0,
      isActive: true,
      images: [],
    })
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.amenityName.trim()) {
      newErrors.amenityName = "Vui lòng nhập tên tiện nghi"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả"
    }

    if (formData.price < 0) {
      newErrors.price = "Giá không được âm"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (editingAmenity) {
      // Update existing amenity
      setAmenities(
        amenities.map((a) =>
          a.amenityId === editingAmenity.amenityId
            ? {
                ...a,
                ...formData,
                updatedAt: new Date().toISOString(),
                updatedBy: 1, // Current admin user ID
              }
            : a,
        ),
      )
      console.log("Updated amenity:", editingAmenity.amenityId)
    } else {
      // Create new amenity
      const newAmenity: Amenity = {
        amenityId: Math.max(...amenities.map((a) => a.amenityId), 0) + 1,
        ...formData,
        createdAt: new Date().toISOString(),
        createdBy: 1, // Current admin user ID
        updatedAt: new Date().toISOString(),
        updatedBy: 1,
      }
      setAmenities([...amenities, newAmenity])
      console.log("Created new amenity:", newAmenity)
    }

    handleCloseModal()
  }

  const handleDelete = (amenityId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa tiện nghi này?")) {
      setAmenities(amenities.filter((a) => a.amenityId !== amenityId))
      console.log("Deleted amenity:", amenityId)
    }
  }

  const handleToggleActive = (amenityId: number) => {
    setAmenities(
      amenities.map((a) =>
        a.amenityId === amenityId
          ? {
              ...a,
              isActive: !a.isActive,
              updatedAt: new Date().toISOString(),
              updatedBy: 1,
            }
          : a,
      ),
    )
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

  const formatPrice = (price: number) => {
    return price === 0 ? "Miễn phí" : `₫${price.toLocaleString("vi-VN")}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý tiện nghi</h1>
          <p className="text-slate-600 mt-1">Quản lý các tiện nghi và dịch vụ của khách sạn</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] hover:from-[#ff4569] hover:to-[#9370db] text-white shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm tiện nghi
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <Input
                type="text"
                placeholder="Tìm kiếm tiện nghi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-slate-600">
              Tổng: <span className="font-semibold text-slate-900">{filteredAmenities.length}</span> tiện nghi
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Tên tiện nghi</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Mô tả</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Giá</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Trạng thái</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Cập nhật</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAmenities.map((amenity) => (
                  <tr key={amenity.amenityId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">#{amenity.amenityId}</td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{amenity.amenityName}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-600 max-w-xs truncate">{amenity.description}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-slate-900">{formatPrice(amenity.price)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleActive(amenity.amenityId)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          amenity.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                        }`}
                      >
                        {amenity.isActive ? "Hoạt động" : "Tạm dừng"}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">{formatDate(amenity.updatedAt)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(amenity)}
                          className="p-2 text-slate-600 hover:text-[#14b8a6] hover:bg-[#14b8a6]/10 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(amenity.amenityId)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingAmenity ? "Chỉnh sửa tiện nghi" : "Thêm tiện nghi mới"}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff5e7e] focus:border-transparent outline-none transition-all ${
                    errors.description ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="Mô tả chi tiết về tiện nghi..."
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Giá (VNĐ)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    className={errors.price ? "border-red-500" : ""}
                    placeholder="0"
                    min="0"
                  />
                  {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                  <p className="text-xs text-slate-500">Nhập 0 nếu miễn phí</p>
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
                        className="w-4 h-4 text-[#14b8a6] focus:ring-[#14b8a6]"
                      />
                      <span className="text-sm text-slate-700">Hoạt động</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isActive"
                        checked={!formData.isActive}
                        onChange={() => setFormData((prev) => ({ ...prev, isActive: false }))}
                        className="w-4 h-4 text-slate-400 focus:ring-slate-400"
                      />
                      <span className="text-sm text-slate-700">Tạm dừng</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hình ảnh</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#ff5e7e] transition-colors cursor-pointer">
                  <svg
                    className="w-12 h-12 mx-auto text-slate-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-slate-600">Nhấp để tải lên hoặc kéo thả hình ảnh</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF tối đa 10MB</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] hover:from-[#ff4569] hover:to-[#9370db] text-white shadow-lg"
                >
                  {editingAmenity ? "Cập nhật" : "Thêm mới"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
