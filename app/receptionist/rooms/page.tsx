"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useRoomManagement, useRoomDetails, useAvailableStatus, useChangeRoomStatus } from "@/lib/hooks/use-rooms"
import { useRoomStatuses } from "@/lib/hooks/use-common-code"
import type { RoomSearchItem, RoomStatusCode } from "@/lib/types/api"

export default function ReceptionistRoomsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFloor, setSelectedFloor] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [checkInDate, setCheckInDate] = useState<string>("")
  const [checkOutDate, setCheckOutDate] = useState<string>("")
  const [numberOfGuests, setNumberOfGuests] = useState<string>("")

  const { data: searchData, isLoading } = useRoomManagement({
    roomName: searchQuery || undefined,
    floor: selectedFloor !== "all" ? Number.parseInt(selectedFloor) : undefined,
    status: selectedStatus !== "all" ? (selectedStatus as RoomStatusCode) : undefined,
    checkInDate: checkInDate || undefined,
    checkOutDate: checkOutDate || undefined,
    numberOfGuests: numberOfGuests ? Number.parseInt(numberOfGuests) : undefined,
    pageNumber: 1,
    pageSize: 100,
  })

  const { data: selectedRoom } = useRoomDetails(selectedRoomId || 0)
  const { data: availableStatusData } = useAvailableStatus(selectedRoomId || 0)
  const { data: roomStatuses } = useRoomStatuses()
  const changeStatusMutation = useChangeRoomStatus()

  const rooms = searchData?.rooms || []

  const getRoomStatusColor = (statusCode: RoomStatusCode) => {
    const colors: Record<RoomStatusCode, string> = {
      Available: "bg-emerald-500",
      Booked: "bg-purple-500",
      Occupied: "bg-blue-500",
      Cleaning: "bg-amber-500",
      Maintenance: "bg-red-500",
      PendingInspection: "bg-orange-500",
      OutOfService: "bg-slate-500",
    }
    return colors[statusCode] || "bg-slate-400"
  }

  const handleViewDetail = (room: RoomSearchItem) => {
    setSelectedRoomId(room.roomId)
    setDetailDialogOpen(true)
  }

  const handleStatusChange = (newStatus: RoomStatusCode) => {
    if (!selectedRoomId) return
    const statusItem = roomStatuses?.find(
      (s) => s.codeName === newStatus || (s as any).codeKey === newStatus
    )
    const statusId = (statusItem as any)?.codeId ?? (statusItem as any)?.commonCodeId

    changeStatusMutation.mutate({
      roomId: selectedRoomId,
      statusId,
      newStatus: statusId ? undefined : newStatus,
    })
    setDetailDialogOpen(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý phòng</h1>
          <p className="text-slate-600 mt-1">Xem trạng thái và quản lý phòng khách sạn</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2 lg:col-span-1 relative">
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
              placeholder="Tìm theo số phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 border-slate-300"
            />
          </div>

          <Select value={selectedFloor} onValueChange={setSelectedFloor}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Chọn tầng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tầng</SelectItem>
              <SelectItem value="1">Tầng 1</SelectItem>
              <SelectItem value="2">Tầng 2</SelectItem>
              <SelectItem value="3">Tầng 3</SelectItem>
              <SelectItem value="4">Tầng 4</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Available">Trống</SelectItem>
              <SelectItem value="Booked">Đã đặt</SelectItem>
              <SelectItem value="Occupied">Đang sử dụng</SelectItem>
              <SelectItem value="Cleaning">Đang dọn dẹp</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">Số khách:</span>
            <Input
              type="number"
              min="1"
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(e.target.value)}
              className="h-10 w-full"
              placeholder="Nhập số khách"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">Từ ngày:</span>
            <Input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="h-10 w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">Đến ngày:</span>
            <Input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="h-10 w-full"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3 xl:col-span-2 flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedFloor("all")
                setSelectedStatus("all")
                setCheckInDate("")
                setCheckOutDate("")
                setNumberOfGuests("")
              }}
              className="w-full md:w-auto px-6 border-slate-300 hover:bg-slate-50"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#00008b]/5 to-[#ffd700]/5">
          <h2 className="text-lg font-semibold text-slate-900">
            Danh sách phòng
            {rooms.length > 0 && <span className="ml-2 text-slate-600">({rooms.length})</span>}
          </h2>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-slate-200">
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-24 h-24 mb-4 text-slate-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-700 mb-1">Không tìm thấy phòng</h3>
              <p className="text-slate-500 text-center text-sm">Hãy thử tìm kiếm với từ khóa khác</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <Card
                  key={room.roomId}
                  className="border-slate-200 hover:shadow-lg transition-all cursor-pointer hover:border-[#00008b]"
                  onClick={() => handleViewDetail(room)}
                >
                  <CardContent className="p-5">
                    {room.images?.[0] && (
                      <div className="mb-4 rounded-lg overflow-hidden h-32 bg-slate-100">
                        <img
                          src={room.images[0] || "/placeholder.svg"}
                          alt={room.roomName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-slate-900">Phòng {room.roomName}</h3>
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${getRoomStatusColor(room.statusCode)}`} />
                        <span className="text-xs font-medium text-slate-600">{room.status}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                          {room.roomTypeName}
                        </Badge>
                        <span className="text-xs text-slate-500">{room.roomTypeCode}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>{room.maxOccupancy} người</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Giá mỗi đêm</p>
                      <p className="text-lg font-bold text-[#00008b]">{formatCurrency(room.basePriceNight)}</p>
                    </div>

                    <Button
                      className="w-full mt-3 bg-gradient-to-r from-[#00008b] to-[#0000cd] hover:from-[#00006b] hover:to-[#0000ad] text-white"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewDetail(room)
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Chi tiết phòng {selectedRoom?.roomName}</DialogTitle>
          </DialogHeader>

          {selectedRoom && (
            <div className="space-y-6 py-4">
              {selectedRoom.images && selectedRoom.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedRoom.images.slice(0, 4).map((image, index) => (
                    <div key={index} className="rounded-lg overflow-hidden h-48 bg-slate-100">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${selectedRoom.roomName} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getRoomStatusColor(selectedRoom.statusCode)}`} />
                  <span className="font-medium">{selectedRoom.status}</span>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {selectedRoom.roomTypeName}
                </Badge>
                <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                  {selectedRoom.roomTypeCode}
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Mô tả</h4>
                <p className="text-slate-600">{selectedRoom.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Sức chứa</p>
                  <p className="text-lg font-bold text-slate-900">{selectedRoom.maxOccupancy} người</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Diện tích</p>
                  <p className="text-lg font-bold text-slate-900">{selectedRoom.roomSize}m²</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Số giường</p>
                  <p className="text-lg font-bold text-slate-900">{selectedRoom.numberOfBeds}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Loại giường</p>
                  <p className="text-sm font-medium text-slate-900">{selectedRoom.bedType}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#00008b]/5 to-[#ffd700]/10 rounded-lg p-6">
                <p className="text-sm text-slate-600 mb-2">Giá mỗi đêm</p>
                <p className="text-3xl font-bold text-[#00008b]">{formatCurrency(selectedRoom.basePriceNight)}</p>
              </div>

              {availableStatusData && availableStatusData.availableTransitions.length > 0 && (
                <div className="border-t border-slate-200 pt-6">
                  <h4 className="font-semibold text-slate-900 mb-3">Cập nhật trạng thái phòng</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {availableStatusData.availableTransitions.map((transition) => (
                      <Button
                        key={transition.statusCode}
                        variant="outline"
                        className="justify-start h-auto py-3 px-4 hover:bg-[#00008b]/5 hover:border-[#00008b] bg-transparent"
                        onClick={() => handleStatusChange(transition.statusCode)}
                        disabled={changeStatusMutation.isPending}
                      >
                        <div className="text-left">
                          <div className="font-medium text-slate-900">{transition.statusName}</div>
                          {transition.description && (
                            <div className="text-xs text-slate-500 mt-1">{transition.description}</div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
