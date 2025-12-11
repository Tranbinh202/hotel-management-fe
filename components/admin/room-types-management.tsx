"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, X, GripVertical } from "lucide-react"
import type { RoomType, CreateRoomTypeDto, UpdateRoomTypeDto, ImageMediaDto } from "@/lib/types/api"
import { useRoomTypes, useCreateRoomType, useUpdateRoomType, useDeleteRoomType } from "@/lib/hooks/use-room-type"
import { fileApi } from "@/lib/api/file"
import { toast } from "@/hooks/use-toast"

const BED_TYPES = ["Single", "Double", "Queen", "King"]

// Extended image type for form state management
interface FormImageState {
  mediaId: number | null // null for new images, number for existing
  url: string
  altText: string
  isMarkedForRemoval: boolean // Track if user wants to remove this image
}

export default function RoomTypesManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Basic form data (without images)
  const [formData, setFormData] = useState({
    typeName: "",
    typeCode: "",
    description: "",
    basePriceNight: 0,
    roomSize: 0,
    maxOccupancy: 2,
    numberOfBeds: 1,
    bedType: "Double",
  })

  // Separate state for images with Media CRUD tracking
  const [images, setImages] = useState<FormImageState[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingCount, setUploadingCount] = useState(0)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useRoomTypes({
    PageSize: 20,
    Search: searchTerm || undefined,
  })

  const createMutation = useCreateRoomType()
  const updateMutation = useUpdateRoomType()
  const deleteMutation = useDeleteRoomType()

  const roomTypes = data?.pages.flatMap((page) => page.items) ?? []

  const handleOpenModal = (roomType?: RoomType) => {
    if (roomType) {
      // Edit mode: Load existing room type data
      setEditingRoomType(roomType)
      setFormData({
        typeName: roomType.typeName,
        typeCode: roomType.typeCode,
        description: roomType.description,
        basePriceNight: roomType.basePriceNight,
        roomSize: roomType.roomSize,
        maxOccupancy: roomType.maxOccupancy,
        numberOfBeds: roomType.numberOfBeds,
        bedType: roomType.bedType,
      })

      // Load existing images into form state
      setImages(
        roomType.images.map((img) => ({
          mediaId: img.mediaId,
          url: img.filePath,
          altText: img.description || "",
          isMarkedForRemoval: false,
        }))
      )
    } else {
      // Create mode: Reset to defaults
      setEditingRoomType(null)
      setFormData({
        typeName: "",
        typeCode: "",
        description: "",
        basePriceNight: 0,
        roomSize: 0,
        maxOccupancy: 2,
        numberOfBeds: 1,
        bedType: "Double",
      })
      setImages([])
    }
    setErrors({})
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingRoomType(null)
    setErrors({})
    setImages([])
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.typeName.trim()) {
      newErrors.typeName = "Vui lòng nhập tên loại phòng"
    }

    if (!formData.typeCode.trim()) {
      newErrors.typeCode = "Vui lòng nhập mã loại phòng"
    }

    if (!formData.basePriceNight || formData.basePriceNight <= 0) {
      newErrors.basePriceNight = "Giá phải lớn hơn 0"
    }

    if (!formData.roomSize || formData.roomSize <= 0) {
      newErrors.roomSize = "Diện tích phải lớn hơn 0"
    }

    if (!formData.maxOccupancy || formData.maxOccupancy <= 0) {
      newErrors.maxOccupancy = "Số người tối đa phải lớn hơn 0"
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
        // Add new images to state (mediaId = null means new image)
        const newImages: FormImageState[] = successfulUrls.map((url) => ({
          mediaId: null,
          url: url,
          altText: "",
          isMarkedForRemoval: false,
        }))

        setImages((prev) => [...prev, ...newImages])

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

  const removeImage = (index: number) => {
    const image = images[index]

    if (image.mediaId === null) {
      // New image (not saved yet) - just remove from array
      setImages((prev) => prev.filter((_, i) => i !== index))
    } else {
      // Existing image - mark for removal (will be sent as "remove" in CRUD)
      setImages((prev) => prev.map((img, i) => (i === index ? { ...img, isMarkedForRemoval: true } : img)))
    }
  }

  const updateImageAltText = (index: number, altText: string) => {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, altText } : img)))
  }

  // Drag and drop handlers for reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const draggedItem = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedItem)

    setImages(newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // Build imageMedia array for Media CRUD API
  const buildImageMedia = (): ImageMediaDto[] => {
    const imageMedia: ImageMediaDto[] = []

    images.forEach((img, index) => {
      if (img.isMarkedForRemoval && img.mediaId !== null) {
        // Remove existing image
        imageMedia.push({
          id: img.mediaId,
          crudKey: "remove",
          url: null,
          altText: null,
          providerId: null,
        })
      } else if (!img.isMarkedForRemoval) {
        if (img.mediaId === null) {
          // Add new image
          imageMedia.push({
            id: null,
            crudKey: "add",
            url: img.url,
            altText: img.altText || null,
            providerId: null,
          })
        } else {
          // Keep existing image (update alt text and order)
          imageMedia.push({
            id: img.mediaId,
            crudKey: "keep",
            url: null, // Don't modify URL
            altText: img.altText || null,
            providerId: null,
          })
        }
      }
    })

    return imageMedia
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      if (editingRoomType) {
        // Update mode: Use Media CRUD system
        const imageMedia = buildImageMedia()

        const updateDto: UpdateRoomTypeDto = {
          roomTypeId: editingRoomType.roomTypeId,
          ...formData,
          imageMedia: imageMedia.length > 0 ? imageMedia : null,
        }

        await updateMutation.mutateAsync(updateDto)
      } else {
        // Create mode: Use simple imageUrls array
        const imageUrls = images.filter((img) => !img.isMarkedForRemoval).map((img) => img.url)

        const createDto: CreateRoomTypeDto = {
          ...formData,
          imageUrls: imageUrls,
        }

        await createMutation.mutateAsync(createDto)
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

  // Filter out images marked for removal for display
  const visibleImages = images.filter((img) => !img.isMarkedForRemoval)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Loại phòng</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Tổng số: <span className="font-semibold text-slate-900">{data?.pages[0]?.totalCount || 0}</span> loại phòng
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          size="sm"
          className="h-8 text-xs bg-gradient-to-r from-[#00008b] to-[#ffd700] hover:from-[#00006b] hover:to-[#e6c200] text-white"
        >
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm
        </Button>
      </div>

      <Card className="border-0 shadow">
        <CardContent className="p-4">
          <div className="relative">
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
              placeholder="Tìm kiếm loại phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Room Types Table */}
      <Card className="border-0 shadow">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : roomTypes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Không tìm thấy loại phòng nào</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Mã</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Tên loại</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Giá/đêm</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Diện tích</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Sức chứa</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Giường</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomTypes.map((roomType) => (
                      <tr
                        key={roomType.roomTypeId}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm font-mono font-medium text-slate-900">{roomType.typeCode}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{roomType.typeName}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">{roomType.description}</div>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-slate-900">
                          {roomType.basePriceNight.toLocaleString("vi-VN")} VNĐ
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">{roomType.roomSize}m²</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{roomType.maxOccupancy} người</td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {roomType.numberOfBeds} {roomType.bedType}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(roomType)}
                              className="p-1.5 text-slate-600 hover:text-[#14b8a6] hover:bg-[#14b8a6]/10 rounded-lg transition-colors"
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
                              onClick={() => handleDelete(roomType.roomTypeId)}
                              className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              disabled={deleteMutation.isPending}
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
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    variant="outline"
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingRoomType ? "Chỉnh sửa loại phòng" : "Thêm loại phòng mới"}
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
                    onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
                    className={errors.typeName ? "border-red-500" : ""}
                    placeholder="VD: Deluxe Double"
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
                    onChange={(e) => setFormData({ ...formData, typeCode: e.target.value })}
                    className={errors.typeCode ? "border-red-500" : ""}
                    placeholder="VD: DLX-DBL"
                  />
                  {errors.typeCode && <p className="text-xs text-red-500">{errors.typeCode}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[100px] px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00008b]"
                  placeholder="Mô tả chi tiết về loại phòng..."
                />
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
                    onChange={(e) => setFormData({ ...formData, basePriceNight: Number(e.target.value) })}
                    className={errors.basePriceNight ? "border-red-500" : ""}
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
                    onChange={(e) => setFormData({ ...formData, roomSize: Number(e.target.value) })}
                    className={errors.roomSize ? "border-red-500" : ""}
                  />
                  {errors.roomSize && <p className="text-xs text-red-500">{errors.roomSize}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxOccupancy">
                    Số người tối đa <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="maxOccupancy"
                    name="maxOccupancy"
                    type="number"
                    min="1"
                    value={formData.maxOccupancy}
                    onChange={(e) => setFormData({ ...formData, maxOccupancy: Number(e.target.value) })}
                    className={errors.maxOccupancy ? "border-red-500" : ""}
                  />
                  {errors.maxOccupancy && <p className="text-xs text-red-500">{errors.maxOccupancy}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfBeds">Số giường</Label>
                  <Input
                    id="numberOfBeds"
                    name="numberOfBeds"
                    type="number"
                    min="1"
                    value={formData.numberOfBeds}
                    onChange={(e) => setFormData({ ...formData, numberOfBeds: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedType">Loại giường</Label>
                  <Select
                    value={formData.bedType}
                    onValueChange={(value) => setFormData({ ...formData, bedType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BED_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hình ảnh</Label>
                <p className="text-xs text-slate-500">
                  {editingRoomType
                    ? "Kéo thả để sắp xếp lại thứ tự hình ảnh. Hình đầu tiên sẽ là ảnh đại diện."
                    : "Tải lên hình ảnh cho loại phòng"}
                </p>

                {visibleImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {visibleImages.map((img, index) => {
                      const actualIndex = images.findIndex((i) => i === img)
                      return (
                        <div
                          key={actualIndex}
                          draggable={editingRoomType !== null}
                          onDragStart={() => handleDragStart(actualIndex)}
                          onDragOver={(e) => handleDragOver(e, actualIndex)}
                          onDragEnd={handleDragEnd}
                          className={`relative group border-2 rounded-lg overflow-hidden ${
                            draggedIndex === actualIndex ? "border-blue-500 opacity-50" : "border-slate-200"
                          } ${editingRoomType ? "cursor-move" : ""}`}
                        >
                          {/* Drag handle */}
                          {editingRoomType && (
                            <div className="absolute top-2 left-2 bg-white/90 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical className="w-4 h-4 text-slate-600" />
                            </div>
                          )}

                          <img
                            src={img.url || "/placeholder.svg"}
                            alt={img.altText || `Image ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />

                          {/* Image info overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <input
                              type="text"
                              value={img.altText}
                              onChange={(e) => updateImageAltText(actualIndex, e.target.value)}
                              placeholder="Mô tả ảnh..."
                              className="w-full text-xs bg-white/20 text-white placeholder-white/70 border-0 rounded px-2 py-1 focus:outline-none focus:bg-white/30"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => removeImage(actualIndex)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          {/* Order badge */}
                          <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                            #{index + 1}
                          </div>
                        </div>
                      )
                    })}
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

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-[#00008b] to-[#ffd700] hover:from-[#00006b] hover:to-[#e6c200] text-white"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingRoomType ? "Cập nhật" : "Thêm mới"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
