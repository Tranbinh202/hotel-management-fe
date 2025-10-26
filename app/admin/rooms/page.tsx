"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Bed, Users, Maximize, Pencil, Trash2, Upload, X, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRoomTypes, useCreateRoomType, useUpdateRoomType, useDeleteRoomType } from "@/lib/hooks/use-room-type"
import { fileApi } from "@/lib/api/file"
import type { RoomType, CreateRoomTypeDto } from "@/lib/types/api"

export default function RoomsPage() {
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [uploadingImages, setUploadingImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useRoomTypes({
    Search: searchTerm,
    PageSize: 10,
  })

  const createMutation = useCreateRoomType()
  const updateMutation = useUpdateRoomType()
  const deleteMutation = useDeleteRoomType()

  const allRooms = data?.pages.flatMap((page) => page.items) ?? []
  console.log("Fetched room types:", data)

  const [formData, setFormData] = useState<CreateRoomTypeDto>({
    typeName: "",
    typeCode: "",
    description: "",
    basePriceNight: 0,
    maxOccupancy: 1,
    roomSize: 0,
    numberOfBeds: 1,
    bedType: "",
    imageUrls: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleOpenModal = (room?: RoomType) => {
    if (room) {
      setEditingRoom(room)
      setFormData({
        typeName: room.typeName,
        typeCode: room.typeCode,
        description: room.description,
        basePriceNight: room.basePriceNight,
        maxOccupancy: room.maxOccupancy,
        roomSize: room.roomSize,
        numberOfBeds: room.numberOfBeds,
        bedType: room.bedType,
        imageUrls: room.images.map((img) => img.filePath),
      })
      setUploadingImages(room.images.map((img) => img.filePath))
    } else {
      setEditingRoom(null)
      setFormData({
        typeName: "",
        typeCode: "",
        description: "",
        basePriceNight: 0,
        maxOccupancy: 1,
        roomSize: 0,
        numberOfBeds: 1,
        bedType: "",
        imageUrls: [],
      })
      setUploadingImages([])
    }
    setErrors({})
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingRoom(null)
    setUploadingImages([])
    setErrors({})
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const response = await fileApi.upload(file)
        return response.url
      } catch (error) {
        toast({
          title: "Lỗi",
          description: `Không thể tải lên ${file.name}`,
          variant: "destructive",
        })
        return null
      }
    })

    const uploadedUrls = await Promise.all(uploadPromises)
    const validUrls = uploadedUrls.filter((url): url is string => url !== null)

    setUploadingImages((prev) => [...prev, ...validUrls])
    setFormData((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ...validUrls],
    }))
    setIsUploading(false)
  }

  const handleRemoveImage = (index: number) => {
    setUploadingImages((prev) => prev.filter((_, i) => i !== index))
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.typeName.trim()) {
      newErrors.typeName = "Vui lòng nhập tên loại phòng"
    }

    if (!formData.typeCode.trim()) {
      newErrors.typeCode = "Vui lòng nhập mã loại phòng"
    }

    if (formData.basePriceNight <= 0) {
      newErrors.basePriceNight = "Giá phòng phải lớn hơn 0"
    }

    if (formData.roomSize <= 0) {
      newErrors.roomSize = "Diện tích phải lớn hơn 0"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả"
    }

    if (!formData.bedType.trim()) {
      newErrors.bedType = "Vui lòng nhập loại giường"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      if (editingRoom) {
        await updateMutation.mutateAsync({
          ...formData,
          roomTypeId: editingRoom.roomTypeId,
        })
      } else {
        await createMutation.mutateAsync(formData)
      }
      handleCloseModal()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDelete = async (roomTypeId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa loại phòng này?")) {
      await deleteMutation.mutateAsync(roomTypeId)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "basePriceNight" || name === "maxOccupancy" || name === "roomSize" || name === "numberOfBeds"
          ? Number(value)
          : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý loại phòng</h1>
          <p className="text-sm text-slate-600 mt-1">
            Tổng số: <span className="font-semibold text-slate-900">{data?.pages[0]?.totalCount || 0}</span> loại phòng
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] hover:from-[#ff4569] hover:to-[#9370db] text-white"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm loại phòng
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
                placeholder="Tìm kiếm theo tên hoặc mã loại phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold text-slate-900">Hình ảnh</TableHead>
                  <TableHead className="font-semibold text-slate-900">Tên loại phòng</TableHead>
                  <TableHead className="font-semibold text-slate-900">Mã</TableHead>
                  <TableHead className="font-semibold text-slate-900">Giá/đêm</TableHead>
                  <TableHead className="font-semibold text-slate-900 text-center">Sức chứa</TableHead>
                  <TableHead className="font-semibold text-slate-900 text-center">Diện tích</TableHead>
                  <TableHead className="font-semibold text-slate-900 text-center">Số giường</TableHead>
                  <TableHead className="font-semibold text-slate-900">Loại giường</TableHead>
                  <TableHead className="font-semibold text-slate-900">Mô tả</TableHead>
                  <TableHead className="font-semibold text-slate-900 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-32 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                    </TableCell>
                  </TableRow>
                ) : allRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <Bed className="w-12 h-12 mb-2 text-slate-300" />
                        <p className="text-lg">Không tìm thấy loại phòng nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  allRooms.map((room) => (
                    <TableRow key={room.roomTypeId} className="hover:bg-slate-50">
                      <TableCell>
                        {room.images.length > 0 ? (
                          <img
                            src={room.images[0].filePath || "/placeholder.svg"}
                            alt={room.typeName}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center">
                            <Bed className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">{room.typeName}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {room.typeCode}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-[#ff5e7e]">{formatPrice(room.basePriceNight)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-700">{room.maxOccupancy}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Maximize className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-700">{room.roomSize}m²</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Bed className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-700">{room.numberOfBeds}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{room.bedType}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-slate-600 line-clamp-2">{room.description}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleOpenModal(room)}
                            variant="ghost"
                            size="sm"
                            className="text-[#14b8a6] hover:text-[#14b8a6] hover:bg-[#14b8a6]/10"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(room.roomTypeId)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-600 hover:bg-red-50"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {hasNextPage && (
            <div className="p-4 border-t border-slate-200 flex justify-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className="w-full max-w-xs"
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
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingRoom ? "Chỉnh sửa loại phòng" : "Thêm loại phòng mới"}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="typeName">
                    Tên loại phòng <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="typeName"
                    name="typeName"
                    type="text"
                    value={formData.typeName}
                    onChange={handleChange}
                    className={errors.typeName ? "border-red-500" : ""}
                    placeholder="VD: Phòng Tiêu Chuẩn"
                  />
                  {errors.typeName && <p className="text-xs text-red-500">{errors.typeName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="typeCode">
                    Mã loại phòng <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="typeCode"
                    name="typeCode"
                    type="text"
                    value={formData.typeCode}
                    onChange={handleChange}
                    className={errors.typeCode ? "border-red-500" : ""}
                    placeholder="VD: STD, DLX, VIP"
                  />
                  {errors.typeCode && <p className="text-xs text-red-500">{errors.typeCode}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePriceNight">
                    Giá/đêm (VNĐ) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="basePriceNight"
                    name="basePriceNight"
                    type="number"
                    min="0"
                    value={formData.basePriceNight}
                    onChange={handleChange}
                    className={errors.basePriceNight ? "border-red-500" : ""}
                    placeholder="800000"
                  />
                  {errors.basePriceNight && <p className="text-xs text-red-500">{errors.basePriceNight}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roomSize">
                    Diện tích (m²) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="roomSize"
                    name="roomSize"
                    type="number"
                    min="0"
                    value={formData.roomSize}
                    onChange={handleChange}
                    className={errors.roomSize ? "border-red-500" : ""}
                    placeholder="25"
                  />
                  {errors.roomSize && <p className="text-xs text-red-500">{errors.roomSize}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxOccupancy">Sức chứa</Label>
                  <Input
                    id="maxOccupancy"
                    name="maxOccupancy"
                    type="number"
                    min="1"
                    value={formData.maxOccupancy}
                    onChange={handleChange}
                    placeholder="2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfBeds">Số giường</Label>
                  <Input
                    id="numberOfBeds"
                    name="numberOfBeds"
                    type="number"
                    min="1"
                    value={formData.numberOfBeds}
                    onChange={handleChange}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedType">
                    Loại giường <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bedType"
                    name="bedType"
                    type="text"
                    value={formData.bedType}
                    onChange={handleChange}
                    className={errors.bedType ? "border-red-500" : ""}
                    placeholder="Queen, King..."
                  />
                  {errors.bedType && <p className="text-xs text-red-500">{errors.bedType}</p>}
                </div>
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
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff5e7e] focus:border-transparent outline-none transition-all ${
                    errors.description ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="Mô tả chi tiết về loại phòng..."
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label>Hình ảnh</Label>
                <div className="space-y-3">
                  {uploadingImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {uploadingImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#ff5e7e] transition-colors cursor-pointer block">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 mx-auto text-slate-400 animate-spin mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    )}
                    <p className="text-sm text-slate-600">
                      {isUploading ? "Đang tải lên..." : "Nhấp để tải lên hình ảnh"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF tối đa 10MB</p>
                  </label>
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
                  className="flex-1 bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] hover:from-[#ff4569] hover:to-[#9370db] text-white"
                  disabled={createMutation.isPending || updateMutation.isPending || isUploading}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : editingRoom ? (
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
