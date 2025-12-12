"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Bed, Building2, Pencil, Trash2, Upload, X, Sparkles, Wrench, GripVertical } from "lucide-react"
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/lib/hooks/use-rooms"
import { useRoomTypes } from "@/lib/hooks/use-room-type"
import { useRoomStatuses } from "@/lib/hooks/use-common-code"
import { fileApi } from "@/lib/api/file"
import type { RoomSearchItem, ImageMediaDto } from "@/lib/types/api"
import { toast } from "@/hooks/use-toast"

// Extended image type for form state management (same as room-types-management)
interface FormImageState {
  mediaId: number | null // null for new images, number for existing
  url: string
  altText: string
  isMarkedForRemoval: boolean // Track if user wants to remove this image
}

type RoomFormData = {
  roomId?: number
  roomNumber: string
  roomTypeId: number
  floorNumber: number
  roomStatus: string
  notes?: string
}

type RoomListItem = RoomSearchItem & {
  roomNumber?: string
  floorNumber?: number
  roomStatus?: string
  statusId?: number
  notes?: string | null
  images?: string[]
  roomSize?: number
  numberOfBeds?: number
  bedType?: string
  description?: string
  roomType?: {
    roomTypeId: number
    typeName: string
    typeCode: string
  }
}

type FilterBarProps = {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedRoomType: string
  onRoomTypeChange: (value: string) => void
  roomTypes: Array<{ roomTypeId: number; typeName: string }>
  roomStatuses?: Array<{ codeName: string; codeValue: string; codeId: number }>
  selectedStatus: string
  onStatusChange: (value: string) => void
  isLoadingStatuses: boolean
}

const FilterBarWithStatus: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedRoomType,
  onRoomTypeChange,
  roomTypes,
  roomStatuses,
  selectedStatus,
  onStatusChange,
  isLoadingStatuses,
}) => (
  <Card className="border-0 shadow">
    <CardContent className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 relative min-w-[220px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            type="text"
            placeholder="Tìm kiếm theo số phòng..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <Select value={selectedRoomType} onValueChange={onRoomTypeChange}>
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder="Loại phòng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại phòng</SelectItem>
            {roomTypes.map((rt) => (
              <SelectItem key={rt.roomTypeId} value={String(rt.roomTypeId)}>
                {rt.typeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={onStatusChange} disabled={isLoadingStatuses}>
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {roomStatuses?.map((status) => (
              <SelectItem key={status.codeId} value={status.codeName}>
                {status.codeValue}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>
)

type RoomActionType =
  | "startCleaning"
  | "completeCleaning"
  | "startMaintenance"
  | "completeMaintenance"
  | "changeStatus"
  | "edit"
  | "delete"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080"

async function roomManagementRequest(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token") || localStorage.getItem("authToken")
      : null
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data?.isSuccess === false) {
    const message = data?.message || res.statusText || "Có lỗi xảy ra"
    throw new Error(message)
  }
  return data
}

// Action button component
type ActionButtonProps = {
  action: RoomActionType
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

const ActionButton: React.FC<ActionButtonProps> = ({ action, onClick, disabled, loading }) => {
  const configs = {
    startCleaning: {
      label: "Bắt đầu dọn",
      icon: <Sparkles className="w-3.5 h-3.5 mr-1" />,
      className: "text-blue-700 border-blue-200 hover:bg-blue-50",
    },
    completeCleaning: {
      label: "Hoàn tất dọn",
      icon: <Sparkles className="w-3.5 h-3.5 mr-1" />,
      className: "text-green-700 border-green-200 hover:bg-green-50",
    },
    startMaintenance: {
      label: "Bắt đầu bảo trì",
      icon: <Wrench className="w-3.5 h-3.5 mr-1" />,
      className: "text-orange-700 border-orange-200 hover:bg-orange-50",
    },
    completeMaintenance: {
      label: "Hoàn tất bảo trì",
      icon: <Wrench className="w-3.5 h-3.5 mr-1" />,
      className: "text-green-700 border-green-200 hover:bg-green-50",
    },
    changeStatus: {
      label: "Đổi trạng thái",
      icon: null,
      className: "text-slate-700 border-slate-200 hover:bg-slate-50",
    },
    edit: {
      label: "Sửa",
      icon: <Pencil className="w-3.5 h-3.5 mr-1" />,
      className: "text-[#00008b] border-[#00008b] hover:bg-[#00008b]/10",
    },
    delete: {
      label: "Xóa",
      icon: <Trash2 className="w-3.5 h-3.5" />,
      className: "text-red-600 border-red-200 hover:bg-red-50",
    },
  }

  const config = configs[action]

  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="sm"
      className={config.className}
      disabled={disabled || loading}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : config.icon}
      {config.label}
    </Button>
  )
}

// Room Card Component
type RoomCardProps = {
  room: RoomListItem
  onAction: (roomId: number, action: RoomActionType) => void
  getStatusBadge: (status: string) => React.ReactNode
  actionLoading: string | null
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onAction, getStatusBadge, actionLoading }) => {
  const roomStatus = room.statusCode || room.roomStatus || "Available"
  const isLoading = actionLoading?.startsWith(`${room.roomId}-`)

  return (
    <Card className="border-0 shadow hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        {/* Room header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg text-slate-900">{room.roomName || room.roomNumber}</h3>
            <p className="text-sm text-slate-600">{room.roomTypeName || room.roomType?.typeName}</p>
          </div>
          {room.floorNumber && (
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700">Tầng {room.floorNumber}</span>
            </div>
          )}
        </div>

        {/* Status badge */}
        <div className="mb-4">{getStatusBadge(roomStatus)}</div>

        {/* Notes */}
        {room.notes && <p className="text-xs text-slate-500 mb-4 line-clamp-2">{room.notes}</p>}

        {/* Edit Action */}
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          <ActionButton
            action="edit"
            onClick={() => onAction(room.roomId, "edit")}
            disabled={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Room Modal Component
type RoomModalProps = {
  isOpen: boolean
  editingRoom: RoomListItem | null
  formData: RoomFormData
  errors: Record<string, string>
  roomTypes: Array<{ roomTypeId: number; typeName: string; typeCode: string }>
  roomStatuses: Array<{ codeId: number; codeName: string; codeValue: string }>
  images: FormImageState[]
  onChange: (data: Partial<RoomFormData>) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  setImages: React.Dispatch<React.SetStateAction<FormImageState[]>>
  isSubmitting: boolean
}

const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  editingRoom,
  formData,
  errors,
  roomTypes,
  roomStatuses,
  images,
  onChange,
  onClose,
  onSubmit,
  setImages,
  isSubmitting,
}) => {
  const [uploadingCount, setUploadingCount] = useState(0)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

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
          console.error("Upload failed:", file.name, error)
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

  // Filter out images marked for removal for display
  const visibleImages = images.filter((img) => !img.isMarkedForRemoval)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-slate-900">{editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {editingRoom && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700">Thông tin loại phòng</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-600">Loại phòng:</span>{" "}
                  <span className="font-medium text-slate-900">{editingRoom.roomTypeName}</span>
                </div>
                <div>
                  <span className="text-slate-600">Mã:</span>{" "}
                  <span className="font-medium text-slate-900">{editingRoom.roomTypeCode}</span>
                </div>
                {editingRoom.maxOccupancy && (
                  <div>
                    <span className="text-slate-600">Sức chứa:</span>{" "}
                    <span className="font-medium text-slate-900">{editingRoom.maxOccupancy} người</span>
                  </div>
                )}
                {editingRoom.roomSize && (
                  <div>
                    <span className="text-slate-600">Diện tích:</span>{" "}
                    <span className="font-medium text-slate-900">{editingRoom.roomSize} m²</span>
                  </div>
                )}
                {editingRoom.numberOfBeds && (
                  <div>
                    <span className="text-slate-600">Số giường:</span>{" "}
                    <span className="font-medium text-slate-900">{editingRoom.numberOfBeds}</span>
                  </div>
                )}
                {editingRoom.bedType && (
                  <div>
                    <span className="text-slate-600">Loại giường:</span>{" "}
                    <span className="font-medium text-slate-900">{editingRoom.bedType}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roomNumber">
                Số phòng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="roomNumber"
                name="roomNumber"
                type="text"
                value={formData.roomNumber}
                onChange={(e) => onChange({ roomNumber: e.target.value })}
                className={errors.roomNumber ? "border-red-500" : ""}
                placeholder="VD: 101, 201, A-101"
              />
              {errors.roomNumber && <p className="text-xs text-red-500">{errors.roomNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="floorNumber">
                Tầng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="floorNumber"
                name="floorNumber"
                type="number"
                min="1"
                value={formData.floorNumber}
                onChange={(e) => onChange({ floorNumber: Number(e.target.value) })}
                className={errors.floorNumber ? "border-red-500" : ""}
              />
              {errors.floorNumber && <p className="text-xs text-red-500">{errors.floorNumber}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomTypeId">
              Loại phòng <span className="text-red-500">*</span>
            </Label>
            <Select value={String(formData.roomTypeId)} onValueChange={(value) => onChange({ roomTypeId: Number(value) })}>
              <SelectTrigger className={errors.roomTypeId ? "border-red-500" : ""}>
                <SelectValue placeholder="Chọn loại phòng" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((rt) => (
                  <SelectItem key={rt.roomTypeId} value={String(rt.roomTypeId)}>
                    {rt.typeName} - {rt.typeCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roomTypeId && <p className="text-xs text-red-500">{errors.roomTypeId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomStatus">Trạng thái</Label>
            <Select value={formData.roomStatus} onValueChange={(value) => onChange({ roomStatus: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roomStatuses.map((status) => {
                  const statusKey = (status as any).codeId ?? (status as any).commonCodeId
                  const statusName = (status as any).codeName ?? (status as any).codeKey
                  return (
                    <SelectItem key={statusKey} value={statusName}>
                      {status.codeValue}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              className="w-full min-h-[100px] px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00008b]"
              placeholder="Ghi chú về phòng (nếu có)"
            />
          </div>

          <div className="space-y-2">
            <Label>Hình ảnh</Label>
            <p className="text-xs text-slate-500">
              {editingRoom
                ? "Kéo thả để sắp xếp lại thứ tự hình ảnh. Hình đầu tiên sẽ là ảnh đại diện."
                : "Tải lên hình ảnh cho phòng"}
            </p>

            {visibleImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {visibleImages.map((img, index) => {
                  const actualIndex = images.findIndex((i) => i === img)
                  return (
                    <div
                      key={actualIndex}
                      draggable={editingRoom !== null}
                      onDragStart={() => handleDragStart(actualIndex)}
                      onDragOver={(e) => handleDragOver(e, actualIndex)}
                      onDragEnd={handleDragEnd}
                      className={`relative group border-2 rounded-lg overflow-hidden ${
                        draggedIndex === actualIndex ? "border-blue-500 opacity-50" : "border-slate-200"
                      } ${editingRoom ? "cursor-move" : ""}`}
                    >
                      {/* Drag handle */}
                      {editingRoom && (
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
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-[#00008b] to-[#ffd700] hover:from-[#00006b] hover:to-[#e6c200] text-white"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingRoom ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Change Status Modal
type ChangeStatusModalProps = {
  isOpen: boolean
  currentStatus: string
  roomStatuses: Array<{ codeId: number; codeName: string; codeValue: string }>
  onClose: () => void
  onConfirm: (newStatus: string, reason: string) => void
  isLoading: boolean
}

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
  isOpen,
  currentStatus,
  roomStatuses,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [newStatus, setNewStatus] = useState("")
  const [reason, setReason] = useState("")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Thay đổi trạng thái phòng</h3>
          <p className="text-sm text-slate-600 mt-1">Trạng thái hiện tại: <span className="font-semibold">{currentStatus}</span></p>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newStatus">Trạng thái mới <span className="text-red-500">*</span></Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái mới" />
              </SelectTrigger>
              <SelectContent>
                {roomStatuses.map((status) => {
                  const statusKey = (status as any).codeId ?? (status as any).commonCodeId
                  const statusName = (status as any).codeName ?? (status as any).codeKey
                  return (
                    <SelectItem key={statusKey} value={statusName}>
                      {status.codeValue}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Lý do</Label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00008b]"
              placeholder="VD: Khách check-out sớm, cần dọn phòng"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={() => onConfirm(newStatus, reason)}
            disabled={!newStatus || isLoading}
            className="flex-1 bg-gradient-to-r from-[#00008b] to-[#ffd700] hover:from-[#00006b] hover:to-[#e6c200] text-white"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  )
}

// Start Maintenance Modal
type StartMaintenanceModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  isLoading: boolean
}

const StartMaintenanceModal: React.FC<StartMaintenanceModalProps> = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [reason, setReason] = useState("")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Bắt đầu bảo trì phòng</h3>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maintenanceReason">Lý do bảo trì <span className="text-red-500">*</span></Label>
            <textarea
              id="maintenanceReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full min-h-[100px] px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00008b]"
              placeholder="VD: Sửa điều hòa bị hỏng, thay bóng đèn..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || isLoading}
            className="flex-1 bg-gradient-to-r from-[#00008b] to-[#ffd700] hover:from-[#00006b] hover:to-[#e6c200] text-white"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Bắt đầu
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function IndividualRoomsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<RoomListItem | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [changeStatusModal, setChangeStatusModal] = useState<{ open: boolean; roomId: number | null; currentStatus: string }>({
    open: false,
    roomId: null,
    currentStatus: "",
  })
  const [maintenanceModal, setMaintenanceModal] = useState<{ open: boolean; roomId: number | null }>({
    open: false,
    roomId: null,
  })

  const queryClient = useQueryClient()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: roomTypesData } = useRoomTypes({ PageSize: 50 })
  const roomTypes = roomTypesData?.pages?.flatMap((page) => page?.items || []) ?? []

  // Load room statuses from CommonCode API
  const { data: roomStatuses, isLoading: isLoadingStatuses } = useRoomStatuses()
  const selectedStatusItem = roomStatuses?.find((s) => s.codeName === selectedStatus)

  const { data, isLoading } = useRooms({
    roomName: debouncedSearchTerm || undefined,
    statusId: selectedStatusItem?.codeId,
    pageSize: 100,
  })

  const createMutation = useCreateRoom()
  const updateMutation = useUpdateRoom()
  const deleteMutation = useDeleteRoom()

  const allRooms = (data?.rooms as RoomListItem[] | undefined) || []

  const filteredRooms = allRooms.filter((room) => {
    const matchesType = selectedRoomType === "all" || room.roomTypeId === Number(selectedRoomType)
    const matchesStatus =
      selectedStatus === "all" ||
      (room.statusCode || room.roomStatus) === selectedStatus ||
      room.statusId === selectedStatusItem?.codeId
    return matchesType && matchesStatus
  })

  const [formData, setFormData] = useState<RoomFormData>({
    roomNumber: "",
    roomTypeId: 0,
    floorNumber: 1,
    roomStatus: "Available",
    notes: "",
  })
  const [images, setImages] = useState<FormImageState[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleOpenModal = (room?: RoomListItem) => {
    if (room) {
      setEditingRoom(room)
      // Find the matching status codeName from the API status
      const currentStatusCode = room.statusCode || room.roomStatus || "Available"
      const matchingStatus = roomStatuses?.find(
        (s) => s.codeName === currentStatusCode || (s as any).codeKey === currentStatusCode
      )

      // Extract and convert images to FormImageState
      const roomImages: FormImageState[] = Array.isArray(room.images)
        ? room.images.map((img: any) => {
            if (typeof img === "string") {
              // Simple string URL - treat as existing image without mediaId
              return {
                mediaId: null,
                url: img,
                altText: "",
                isMarkedForRemoval: false,
              }
            } else {
              // Object with mediaId and filePath
              return {
                mediaId: img.mediaId || null,
                url: img.filePath || img.url || img,
                altText: img.description || img.altText || "",
                isMarkedForRemoval: false,
              }
            }
          })
        : []

      setFormData({
        roomId: room.roomId,
        roomNumber: room.roomNumber || room.roomName,
        roomTypeId: room.roomTypeId,
        floorNumber: room.floorNumber || 1,
        roomStatus: matchingStatus?.codeName || (matchingStatus as any)?.codeKey || currentStatusCode,
        notes: room.notes || "",
      })
      setImages(roomImages)
    } else {
      setEditingRoom(null)
      const firstStatus = roomStatuses?.[0]
      setFormData({
        roomNumber: "",
        roomTypeId: roomTypes[0]?.roomTypeId || 0,
        floorNumber: 1,
        roomStatus: firstStatus?.codeName || (firstStatus as any)?.codeKey || "Available",
        notes: "",
      })
      setImages([])
    }
    setErrors({})
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingRoom(null)
    setErrors({})
    setImages([])
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = "Vui lòng nhập số phòng"
    }

    if (!formData.roomTypeId) {
      newErrors.roomTypeId = "Vui lòng chọn loại phòng"
    }

    if (formData.floorNumber < 1) {
      newErrors.floorNumber = "Tầng phải lớn hơn 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Build imageMedia array for Media CRUD API (same as room-types-management)
  const buildImageMedia = (): ImageMediaDto[] => {
    const imageMedia: ImageMediaDto[] = []

    images.forEach((img) => {
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
      if (editingRoom) {
        // Update mode: Use Media CRUD system
        if (!formData.roomId) {
          setErrors({ roomNumber: "Thiếu mã phòng để cập nhật" })
          return
        }

        const imageMedia = buildImageMedia()
        const statusItem = roomStatuses?.find(
          (s) => s.codeName === formData.roomStatus || (s as any).codeKey === formData.roomStatus
        )
        if (!statusItem) {
          throw new Error("Không tìm thấy trạng thái hợp lệ")
        }
        const statusId = (statusItem as any).codeId ?? (statusItem as any).commonCodeId

        // Update room with imageMedia
        await updateMutation.mutateAsync({
          roomId: formData.roomId,
          roomNumber: formData.roomNumber,
          roomTypeId: formData.roomTypeId,
          floorNumber: formData.floorNumber,
          statusId,
          notes: formData.notes,
          imageMedia: imageMedia.length > 0 ? imageMedia : undefined,
        })
      } else {
        // Create mode: Use Media CRUD system (same as update)
        const imageMedia = buildImageMedia()

        // Map roomStatus string to statusId
        const statusItem = roomStatuses?.find(
          (s) => s.codeName === formData.roomStatus || (s as any).codeKey === formData.roomStatus
        )
        if (!statusItem) {
          throw new Error("Không tìm thấy trạng thái hợp lệ")
        }
        const statusId = (statusItem as any).codeId ?? (statusItem as any).commonCodeId

        await createMutation.mutateAsync({
          roomNumber: formData.roomNumber,
          roomTypeId: formData.roomTypeId,
          floorNumber: formData.floorNumber,
          statusId: statusId,
          notes: formData.notes,
          imageMedia: imageMedia.length > 0 ? imageMedia : undefined,
        })
      }

      await queryClient.invalidateQueries({ queryKey: ["rooms"] })
      handleCloseModal()
      toast({ title: "Thành công", description: editingRoom ? "Đã cập nhật phòng" : "Đã thêm phòng mới" })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.message || "Có lỗi xảy ra",
        variant: "destructive",
      })
    }
  }

  const handleRoomAction = async (roomId: number, action: RoomActionType) => {
    const room = filteredRooms.find((r) => r.roomId === roomId)
    if (!room) return

    switch (action) {
      case "edit":
        handleOpenModal(room)
        break

      case "delete":
        if (confirm("Bạn có chắc chắn muốn xóa phòng này?")) {
          await deleteMutation.mutateAsync(roomId)
          await queryClient.invalidateQueries({ queryKey: ["rooms"] })
          toast({ title: "Thành công", description: "Đã xóa phòng" })
        }
        break

      case "changeStatus":
        setChangeStatusModal({
          open: true,
          roomId: roomId,
          currentStatus: room.statusCode || room.roomStatus || "Available",
        })
        break

      case "startCleaning":
        await executeRoomAction(roomId, "startCleaning")
        break

      case "completeCleaning":
        await executeRoomAction(roomId, "completeCleaning")
        break

      case "startMaintenance":
        setMaintenanceModal({ open: true, roomId: roomId })
        break

      case "completeMaintenance":
        await executeRoomAction(roomId, "completeMaintenance")
        break
    }
  }

  const executeRoomAction = async (roomId: number, action: RoomActionType, payload?: any) => {
    const key = `${roomId}-${action}`
    setActionLoading(key)

    try {
      const apiPaths: Record<string, string> = {
        startCleaning: `/api/RoomManagement/${roomId}/start-cleaning`,
        completeCleaning: `/api/RoomManagement/${roomId}/complete-cleaning`,
        startMaintenance: `/api/RoomManagement/${roomId}/start-maintenance`,
        completeMaintenance: `/api/RoomManagement/${roomId}/complete-maintenance`,
      }

      const apiPath = apiPaths[action]
      if (!apiPath) throw new Error("Invalid action")

      const options: RequestInit = { method: "POST" }
      if (payload) {
        options.body = JSON.stringify(payload)
      }

      await roomManagementRequest(apiPath, options)

      await queryClient.invalidateQueries({ queryKey: ["rooms"] })

      const messages: Record<string, string> = {
        startCleaning: "Đã bắt đầu dọn phòng",
        completeCleaning: "Đã hoàn tất dọn phòng",
        startMaintenance: "Đã bắt đầu bảo trì phòng",
        completeMaintenance: "Đã hoàn tất bảo trì phòng",
      }

      toast({
        title: "Thành công",
        description: messages[action] || "Thao tác thành công",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể thực hiện thao tác",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleChangeStatus = async (newStatus: string, reason: string) => {
    if (!changeStatusModal.roomId) return

    const key = `${changeStatusModal.roomId}-changeStatus`
    setActionLoading(key)

    try {
      // Map status codeName to codeId from CommonCode API
      const statusItem = roomStatuses?.find(
        (s) => s.codeName === newStatus || (s as any).codeKey === newStatus
      )
      if (!statusItem) {
        throw new Error("Không tìm thấy trạng thái hợp lệ")
      }

      const statusId = (statusItem as any).codeId ?? (statusItem as any).commonCodeId

      await roomManagementRequest(`/api/Room/rooms/${changeStatusModal.roomId}`, {
        method: "PATCH",
        body: JSON.stringify({
          statusId: statusId,
          reason: reason || undefined,
        }),
      })

      await queryClient.invalidateQueries({ queryKey: ["rooms"] })
      setChangeStatusModal({ open: false, roomId: null, currentStatus: "" })
      toast({ title: "Thành công", description: "Đã thay đổi trạng thái phòng" })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể thay đổi trạng thái",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleStartMaintenance = async (reason: string) => {
    if (!maintenanceModal.roomId) return

    await executeRoomAction(maintenanceModal.roomId, "startMaintenance", { reason })
    setMaintenanceModal({ open: false, roomId: null })
  }

  const getStatusBadge = (status: string) => {
    // Find status label from CommonCode API
    const statusItem = roomStatuses?.find(
      (s) => s.codeName === status || (s as any).codeKey === status
    )
    const statusLabel = statusItem?.codeValue || status

    // Color mapping by status code key
    const statusMap: Record<string, { bg: string; text: string }> = {
      Available: { bg: "bg-green-100", text: "text-green-800" },
      Occupied: { bg: "bg-blue-100", text: "text-blue-800" },
      Maintenance: { bg: "bg-yellow-100", text: "text-yellow-800" },
      Cleaning: { bg: "bg-cyan-100", text: "text-cyan-800" },
      OutOfService: { bg: "bg-red-100", text: "text-red-800" },
      Booked: { bg: "bg-purple-100", text: "text-purple-800" },
      PendingInspection: { bg: "bg-amber-100", text: "text-amber-800" },
    }

    const statusStyle = statusMap[status] || { bg: "bg-slate-100", text: "text-slate-800" }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
        {statusLabel}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Danh sách phòng</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Tổng số: <span className="font-semibold text-slate-900">{data?.totalRecords || 0}</span> phòng
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

      <FilterBarWithStatus
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedRoomType={selectedRoomType}
        onRoomTypeChange={setSelectedRoomType}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        roomTypes={roomTypes}
        roomStatuses={roomStatuses?.map((s) => ({
          codeId: (s as any).codeId ?? (s as any).commonCodeId,
          codeName: (s as any).codeName ?? (s as any).codeKey,
          codeValue: s.codeValue,
        })) || []}
        isLoadingStatuses={isLoadingStatuses}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="flex flex-col items-center justify-center text-slate-500">
              <Bed className="w-12 h-12 mb-2 text-slate-300" />
              <p className="text-lg">Không tìm thấy phòng nào</p>
            </div>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <RoomCard
              key={room.roomId}
              room={room}
              onAction={handleRoomAction}
              getStatusBadge={getStatusBadge}
              actionLoading={actionLoading}
            />
          ))
        )}
      </div>

      <RoomModal
        isOpen={isModalOpen}
        editingRoom={editingRoom}
        formData={formData}
        errors={errors}
        roomTypes={roomTypes}
        roomStatuses={roomStatuses || []}
        images={images}
        onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        setImages={setImages}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <ChangeStatusModal
        isOpen={changeStatusModal.open}
        currentStatus={changeStatusModal.currentStatus}
        roomStatuses={roomStatuses || []}
        onClose={() => setChangeStatusModal({ open: false, roomId: null, currentStatus: "" })}
        onConfirm={handleChangeStatus}
        isLoading={actionLoading?.endsWith("-changeStatus") || false}
      />

      <StartMaintenanceModal
        isOpen={maintenanceModal.open}
        onClose={() => setMaintenanceModal({ open: false, roomId: null })}
        onConfirm={handleStartMaintenance}
        isLoading={actionLoading?.endsWith("-startMaintenance") || false}
      />
    </div>
  )
}
