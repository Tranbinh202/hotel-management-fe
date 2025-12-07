"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, X, Upload } from "lucide-react"
import type { Amenity } from "@/lib/api"
import { useAmenities, useCreateAmenity, useUpdateAmenity, useDeleteAmenity, useToggleAmenityActive } from "@/lib/hooks"
import { fileApi } from "@/lib/api/file"

export default function AmenitiesPage() {
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [amenityTypeFilter, setAmenityTypeFilter] = useState<string>("all")
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all")

  const [pageSize] = useState(10)

  const [formData, setFormData] = useState({
    amenityName: "",
    description: "",
    amenityType: "Common" as "Common" | "Additional",
    isActive: true,
    imageLinks: [] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingCount, setUploadingCount] = useState(0)

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useAmenities({
    PageSize: pageSize,
    ...(searchTerm && { Search: searchTerm }),
    ...(amenityTypeFilter !== "all" && { AmenityType: amenityTypeFilter }),
    ...(isActiveFilter !== "all" && { IsActive: isActiveFilter === "active" }),
  })

  const createMutation = useCreateAmenity()
  const updateMutation = useUpdateAmenity()
  const deleteMutation = useDeleteAmenity()
  const toggleActiveMutation = useToggleAmenityActive()

  useEffect(() => {
    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách tiện nghi",
        variant: "destructive",
      })
    }
  }, [error, toast])

  const amenities: readonly Amenity[] = data?.pages?.flatMap<Amenity>((page: any) => page.items) ?? []
  const totalCount = data?.pages[0]?.totalCount || 0

  const handleOpenModal = (amenity?: Amenity) => {
    if (amenity) {
      setEditingAmenity(amenity)
      setFormData({
        amenityName: amenity.amenityName,
        description: amenity.description,
        amenityType: amenity.amenityType,
        isActive: amenity.isActive,
        imageLinks: amenity.images,
      })
    } else {
      setEditingAmenity(null)
      setFormData({
        amenityName: "",
        description: "",
        amenityType: "Common",
        isActive: true,
        imageLinks: [],
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
      amenityType: "Common",
      isActive: true,
      imageLinks: [],
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadingCount(files.length)

    try {
      const uploadPromises = files.map(async (file) => {
        try {
          const result = await fileApi.upload(file)
          return result.secureUrl
        } catch (error) {
          console.error("Failed to upload file:", file.name, error)
          toast({
            title: "Lỗi tải lên",
            description: `Không thể tải lên ${file.name}`,
            variant: "destructive",
          })
          return null
        }
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const successfulUrls = uploadedUrls.filter((url): url is string => url !== null)

      if (successfulUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          imageLinks: [...prev.imageLinks, ...successfulUrls],
        }))

        toast({
          title: "Thành công",
          description: `Đã tải lên ${successfulUrls.length} hình ảnh`,
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải lên hình ảnh",
        variant: "destructive",
      })
    } finally {
      setUploadingCount(0)
      e.target.value = ""
    }
  }

  const removeImageLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageLinks: prev.imageLinks.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const submitData = {
        amenityName: formData.amenityName,
        description: formData.description,
        amenityType: formData.amenityType,
        isActive: formData.isActive,
        imageLinks: formData.imageLinks,
      }

      if (editingAmenity) {
        await updateMutation.mutateAsync({
          amenityId: editingAmenity.amenityId,
          ...submitData,
        })
      } else {
        await createMutation.mutateAsync(submitData)
      }

      handleCloseModal()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDelete = async (amenityId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa tiện nghi này?")) {
      try {
        await deleteMutation.mutateAsync(amenityId)
      } catch (error) {
        // Error handled by mutation
      }
    }
  }

  const handleToggleActive = async (amenityId: number) => {
    try {
      await toggleActiveMutation.mutateAsync(amenityId)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getAmenityTypeBadge = (type: string) => {
    return type === "Common" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Phổ biến
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00008b]/10 text-[#00008b]">
        Bổ sung
      </span>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý tiện nghi</h1>
          <p className="text-sm text-slate-600 mt-1">
            Tổng: <span className="font-semibold text-slate-900">{totalCount}</span> tiện nghi
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-[#00008b] to-[#ffd700] hover:from-[#00006b] hover:to-[#e6c200] text-white"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm tiện nghi
        </Button>
      </div>

      <Card className="border-0 shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
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
                className="pl-9 h-9"
              />
            </div>

            <Select value={amenityTypeFilter} onValueChange={(value) => setAmenityTypeFilter(value)}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="Loại tiện nghi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="Common">Phổ biến</SelectItem>
                <SelectItem value="Additional">Bổ sung</SelectItem>
              </SelectContent>
            </Select>

            <Select value={isActiveFilter} onValueChange={(value) => setIsActiveFilter(value)}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Tạm dừng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Amenities Table */}
      <Card className="border-0 shadow">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#00008b]" />
            </div>
          ) : amenities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Không tìm thấy tiện nghi nào</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Tên tiện nghi</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Mô tả</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Loại</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Trạng thái</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Cập nhật</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amenities.map((amenity) => (
                      <tr
                        key={amenity.amenityId}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm font-medium text-slate-900">#{amenity.amenityId}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{amenity.amenityName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-600 max-w-xs truncate">{amenity.description}</div>
                        </td>
                        <td className="py-3 px-4">{getAmenityTypeBadge(amenity.amenityType)}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleActive(amenity.amenityId)}
                            disabled={toggleActiveMutation.isPending}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                              amenity.isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                            }`}
                          >
                            {amenity.isActive ? "Hoạt động" : "Tạm dừng"}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">{formatDate(amenity.updatedAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(amenity)}
                              className="p-1.5 text-slate-600 hover:text-[#00008b] hover:bg-[#00008b]/10 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                              disabled={deleteMutation.isPending}
                              className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

              {hasNextPage && (
                <div className="flex items-center justify-center px-4 py-4 border-t border-slate-200">
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="min-w-[200px]"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang tải...
                      </>
                    ) : (
                      "Tải thêm"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00008b] focus:border-transparent outline-none transition-all ${
                    errors.description ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="Mô tả chi tiết về tiện nghi..."
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amenityType">Loại tiện nghi</Label>
                  <Select
                    value={formData.amenityType}
                    onValueChange={(value: "Common" | "Additional") =>
                      setFormData((prev) => ({ ...prev, amenityType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Common">Phổ biến</SelectItem>
                      <SelectItem value="Additional">Bổ sung</SelectItem>
                    </SelectContent>
                  </Select>
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

                {formData.imageLinks.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {formData.imageLinks.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Uploaded ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageLink(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadingCount > 0 && (
                  <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-sm text-blue-600">Đang tải lên {uploadingCount} hình ảnh...</span>
                  </div>
                )}

                <label className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#00008b] transition-colors cursor-pointer block">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploadingCount > 0}
                    className="hidden"
                  />
                  <Upload className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">Nhấp để tải lên hoặc kéo thả hình ảnh</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF tối đa 10MB</p>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200"
                  disabled={createMutation.isPending || updateMutation.isPending || uploadingCount > 0}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#00008b] to-[#ffd700] hover:from-[#00006b] hover:to-[#e6c200] text-white"
                  disabled={createMutation.isPending || updateMutation.isPending || uploadingCount > 0}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : editingAmenity ? (
                    "Cập nhật"
                  ) : (
                    "Thêm mới"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
