"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Bed, Building2, Pencil, Trash2, Check } from "lucide-react"
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/lib/hooks/use-rooms"
import { useRoomTypes } from "@/lib/hooks/use-room-type"
import type { Room } from "@/lib/api/rooms"
import type { CreateRoomDto, UpdateRoomDto } from "@/lib/types/api"

const ROOM_STATUS_OPTIONS = [
  { value: "Available", label: "Có sẵn" },
  { value: "Occupied", label: "Đang sử dụng" },
  { value: "Maintenance", label: "Bảo trì" },
  { value: "OutOfService", label: "Ngừng hoạt động" },
]

export default function IndividualRoomsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: roomTypesData } = useRoomTypes({ PageSize: 100 })
  const roomTypes = roomTypesData?.pages.flatMap((page) => page.items) ?? []

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useRooms({
    Search: debouncedSearchTerm,
    PageSize: 20,
  })

  const createMutation = useCreateRoom()
  const updateMutation = useUpdateRoom()
  const deleteMutation = useDeleteRoom()

  const allRooms = data?.pages.flatMap((page) => page.items) ?? []

  const filteredRooms =
    selectedRoomType === "all" ? allRooms : allRooms.filter((room) => room.roomTypeId === Number(selectedRoomType))

  const [formData, setFormData] = useState<CreateRoomDto | UpdateRoomDto>({
    roomNumber: "",
    roomTypeId: 0,
    floorNumber: 1,
    roomStatus: "Available",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleOpenModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room)
      setFormData({
        roomId: room.roomId,
        roomNumber: room.roomNumber,
        roomTypeId: room.roomTypeId,
        floorNumber: room.floorNumber,
        roomStatus: room.roomStatus,
        notes: room.notes || "",
      })
    } else {
      setEditingRoom(null)
      setFormData({
        roomNumber: "",
        roomTypeId: roomTypes[0]?.roomTypeId || 0,
        floorNumber: 1,
        roomStatus: "Available",
        notes: "",
      })
    }
    setErrors({})
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingRoom(null)
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = "Vui lòng nhập số phòng"
    }

    if (!formData.roomTypeId || formData.roomTypeId === 0) {
      newErrors.roomTypeId = "Vui lòng chọn loại phòng"
    }

    if (formData.floorNumber < 1) {
      newErrors.floorNumber = "Tầng phải lớn hơn 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      if (editingRoom) {
        await updateMutation.mutateAsync(formData as UpdateRoomDto)
      } else {
        await createMutation.mutateAsync(formData as CreateRoomDto)
      }
      handleCloseModal()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDelete = async (roomId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa phòng này?")) {
      await deleteMutation.mutateAsync(roomId)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      Available: { bg: "bg-green-100", text: "text-green-800", label: "Có sẵn" },
      Occupied: { bg: "bg-blue-100", text: "text-blue-800", label: "Đang sử dụng" },
      Maintenance: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Bảo trì" },
      OutOfService: { bg: "bg-red-100", text: "text-red-800", label: "Ngừng hoạt động" },
    }

    const statusStyle = statusMap[status] || statusMap.Available

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
      >
        {statusStyle.label}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <p className="text-sm text-slate-600">
          Tổng số: <span className="font-semibold text-slate-900">{data?.pages[0]?.totalCount || 0}</span> phòng
        </p>
        <Button
          onClick={() => handleOpenModal()}
          size="sm"
          className="bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] hover:from-[#ff4569] hover:to-[#9370db] text-white"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm phòng
        </Button>
      </div>

      <Card className="border-0 shadow">
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <h3 className="text-sm font-semibold text-slate-900">Lọc theo loại phòng</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* All room types filter */}
            <button
              onClick={() => setSelectedRoomType("all")}
              className={`group relative px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                selectedRoomType === "all"
                  ? "border-[#ff5e7e] bg-gradient-to-br from-[#ff5e7e]/10 to-[#a78bfa]/10 shadow-md"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedRoomType === "all"
                      ? "border-[#ff5e7e] bg-[#ff5e7e]"
                      : "border-slate-300 group-hover:border-slate-400"
                  }`}
                >
                  {selectedRoomType === "all" && <Check className="w-3 h-3 text-white" />}
                </div>
                <span
                  className={`font-medium transition-colors ${
                    selectedRoomType === "all" ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"
                  }`}
                >
                  Tất cả
                </span>
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedRoomType === "all"
                      ? "bg-[#ff5e7e] text-white"
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                  }`}
                >
                  {allRooms.length}
                </span>
              </div>
            </button>

            {/* Individual room type filters */}
            {roomTypes.map((rt) => {
              const count = allRooms.filter((room) => room.roomTypeId === rt.roomTypeId).length
              const isSelected = selectedRoomType === String(rt.roomTypeId)

              return (
                <button
                  key={rt.roomTypeId}
                  onClick={() => setSelectedRoomType(String(rt.roomTypeId))}
                  className={`group relative px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-[#14b8a6] bg-gradient-to-br from-[#14b8a6]/10 to-[#3b82f6]/10 shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? "border-[#14b8a6] bg-[#14b8a6]" : "border-slate-300 group-hover:border-slate-400"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex flex-col items-start">
                      <span
                        className={`font-medium text-sm transition-colors ${
                          isSelected ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
                        }`}
                      >
                        {rt.typeName}
                      </span>
                      <span className="text-xs text-slate-500">{rt.typeCode}</span>
                    </div>
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isSelected ? "bg-[#14b8a6] text-white" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow">
        <CardContent className="p-3">
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
              placeholder="Tìm kiếm theo số phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {selectedRoomType !== "all" && (
        <div className="flex items-center gap-2 text-sm text-slate-600 px-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Đang hiển thị <span className="font-semibold text-slate-900">{filteredRooms.length}</span> phòng
          {debouncedSearchTerm && (
            <>
              {" "}
              với từ khóa "<span className="font-semibold text-slate-900">{debouncedSearchTerm}</span>"
            </>
          )}
        </div>
      )}

      <Card className="border-0 shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold text-slate-900">Số phòng</TableHead>
                  <TableHead className="font-semibold text-slate-900">Loại phòng</TableHead>
                  <TableHead className="font-semibold text-slate-900 text-center">Tầng</TableHead>
                  <TableHead className="font-semibold text-slate-900">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-slate-900">Ghi chú</TableHead>
                  <TableHead className="font-semibold text-slate-900 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                    </TableCell>
                  </TableRow>
                ) : filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <Bed className="w-12 h-12 mb-2 text-slate-300" />
                        <p className="text-lg">Không tìm thấy phòng nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map((room) => (
                    <TableRow key={room.roomId} className="hover:bg-slate-50">
                      <TableCell className="font-semibold text-slate-900">{room.roomNumber}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{room.roomType.typeName}</span>
                          <span className="text-xs text-slate-500">{room.roomType.typeCode}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Building2 className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-700">{room.floorNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(room.roomStatus)}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-slate-600 line-clamp-2">{room.notes || "-"}</p>
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
                            onClick={() => handleDelete(room.roomId)}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roomNumber">
                  Số phòng <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="roomNumber"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, roomNumber: e.target.value })
                    if (errors.roomNumber) setErrors({ ...errors, roomNumber: "" })
                  }}
                  placeholder="VD: 101"
                  className={errors.roomNumber ? "border-red-500" : ""}
                />
                {errors.roomNumber && <p className="text-sm text-red-500">{errors.roomNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomTypeId">
                  Loại phòng <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={String(formData.roomTypeId)}
                  onValueChange={(value) => {
                    setFormData({ ...formData, roomTypeId: Number(value) })
                    if (errors.roomTypeId) setErrors({ ...errors, roomTypeId: "" })
                  }}
                >
                  <SelectTrigger className={errors.roomTypeId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chọn loại phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.roomTypeId} value={String(type.roomTypeId)}>
                        {type.typeName} ({type.typeCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.roomTypeId && <p className="text-sm text-red-500">{errors.roomTypeId}</p>}
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
                  onChange={(e) => {
                    setFormData({ ...formData, floorNumber: Number(e.target.value) })
                    if (errors.floorNumber) setErrors({ ...errors, floorNumber: "" })
                  }}
                  className={errors.floorNumber ? "border-red-500" : ""}
                />
                {errors.floorNumber && <p className="text-sm text-red-500">{errors.floorNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomStatus">
                  Trạng thái <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.roomStatus}
                  onValueChange={(value) => setFormData({ ...formData, roomStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Nhập ghi chú (tùy chọn)"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] hover:from-[#ff4569] hover:to-[#9370db] text-white"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingRoom ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
