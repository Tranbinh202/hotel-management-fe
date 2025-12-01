"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Bed, Building2, Pencil, Trash2 } from "lucide-react"
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

export default function RoomsListPage() {
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
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh sách phòng</h1>
          <p className="text-sm text-slate-600 mt-1">
            Tổng số: <span className="font-semibold text-slate-900">{data?.pages[0]?.totalCount || 0}</span> phòng
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] hover:from-[#ff4569] hover:to-[#9370db] text-white"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm phòng
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
                placeholder="Tìm kiếm theo số phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
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
          </div>
        </CardContent>
      </Card>

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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
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
                  <Label htmlFor="roomNumber">
                    Số phòng <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="roomNumber"
                    name="roomNumber"
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, floorNumber: Number(e.target.value) })}
                    className={errors.floorNumber ? "border-red-500" : ""}
                  />
                  {errors.floorNumber && <p className="text-xs text-red-500">{errors.floorNumber}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomTypeId">
                  Loại phòng <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={String(formData.roomTypeId)}
                  onValueChange={(value) => setFormData({ ...formData, roomTypeId: Number(value) })}
                >
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

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full min-h-[100px] px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e7e]"
                  placeholder="Ghi chú về phòng (nếu có)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1 bg-transparent">
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] hover:from-[#ff4569] hover:to-[#9370db]"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingRoom ? "Cập nhật" : "Thêm phòng"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
