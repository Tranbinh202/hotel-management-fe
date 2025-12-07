"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Building2, MapPin, Filter, ChevronRight } from "lucide-react"
import { roomManagementApi } from "@/lib/api/rooms"
import type { RoomSearchResponse, RoomDetailsResponse, RoomStatusTransition } from "@/lib/types/api"

const STATUS_COLORS = {
  Available: { bg: "bg-green-100", text: "text-green-800", label: "Có sẵn" },
  Booked: { bg: "bg-blue-100", text: "text-blue-800", label: "Đã đặt" },
  Occupied: { bg: "bg-purple-100", text: "text-purple-800", label: "Đang sử dụng" },
  Cleaning: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Đang dọn" },
  Maintenance: { bg: "bg-orange-100", text: "text-orange-800", label: "Bảo trì" },
  OutOfService: { bg: "bg-red-100", text: "text-red-800", label: "Ngừng hoạt động" },
}

export default function AdminRoomManagementPage() {
  const [rooms, setRooms] = useState<RoomSearchResponse[]>([])
  const [selectedRoom, setSelectedRoom] = useState<RoomDetailsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [availableTransitions, setAvailableTransitions] = useState<RoomStatusTransition[]>([])

  // Filters
  const [search, setSearch] = useState("")
  const [floorFilter, setFloorFilter] = useState<number | "all">("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Fetch rooms
  useEffect(() => {
    fetchRooms()
  }, [search, floorFilter, statusFilter])

  const fetchRooms = async () => {
    setIsLoading(true)
    try {
      const response = await roomManagementApi.searchRooms({
        roomNumber: search || undefined,
        floorNumber: floorFilter !== "all" ? floorFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        pageNumber: 1,
        pageSize: 100,
      })
      setRooms(response.items)
    } catch (error) {
      console.error("Failed to fetch rooms:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = async (roomId: number) => {
    setIsDetailLoading(true)
    setIsDetailOpen(true)
    try {
      const [details, transitions] = await Promise.all([
        roomManagementApi.getRoomDetails(roomId),
        roomManagementApi.getAvailableStatusTransitions(roomId),
      ])
      setSelectedRoom(details)
      setAvailableTransitions(transitions)
    } catch (error) {
      console.error("Failed to fetch room details:", error)
    } finally {
      setIsDetailLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedRoom) return

    try {
      await roomManagementApi.updateRoomStatus(selectedRoom.roomId, newStatus)
      // Refresh data
      await fetchRooms()
      await handleViewDetails(selectedRoom.roomId)
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  // Get unique floors
  const floors = Array.from(new Set(rooms.map((r) => r.floorNumber))).sort((a, b) => a - b)

  // Group rooms by floor for map view
  const roomsByFloor = rooms.reduce(
    (acc, room) => {
      if (!acc[room.floorNumber]) acc[room.floorNumber] = []
      acc[room.floorNumber].push(room)
      return acc
    },
    {} as Record<number, RoomSearchResponse[]>,
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Quản lý phòng nâng cao</h1>
        <p className="text-slate-600 mt-1">Xem, tìm kiếm và quản lý trạng thái phòng</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm số phòng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={String(floorFilter)} onValueChange={(v) => setFloorFilter(v === "all" ? "all" : Number(v))}>
              <SelectTrigger className="w-[160px]">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tầng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tầng</SelectItem>
                {floors.map((floor) => (
                  <SelectItem key={floor} value={String(floor)}>
                    Tầng {floor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {Object.entries(STATUS_COLORS).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(roomsByFloor)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([floor, floorRooms]) => (
              <Card key={floor} className="border-0 shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-[#00008b]" />
                    <h2 className="text-xl font-bold text-slate-900">Tầng {floor}</h2>
                    <Badge variant="secondary" className="ml-2">
                      {floorRooms.length} phòng
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {floorRooms.map((room) => {
                      const statusColor = STATUS_COLORS[room.status as keyof typeof STATUS_COLORS]
                      return (
                        <button
                          key={room.roomId}
                          onClick={() => handleViewDetails(room.roomId)}
                          className={`p-4 rounded-lg border-2 transition-all hover:scale-105 hover:shadow-md ${statusColor?.bg} ${statusColor?.text} border-current`}
                        >
                          <div className="font-bold text-lg">{room.roomNumber}</div>
                          <div className="text-xs mt-1 opacity-80">{statusColor?.label}</div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}

          {rooms.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Không tìm thấy phòng nào</p>
            </div>
          )}
        </div>
      )}

      {/* Room Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Chi tiết phòng</DialogTitle>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : selectedRoom ? (
            <div className="space-y-6">
              {/* Room Images */}
              {selectedRoom.images && selectedRoom.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedRoom.images.slice(0, 4).map((img, index) => (
                    <img
                      key={index}
                      src={img.filePath || "/placeholder.svg"}
                      alt={`Room ${selectedRoom.roomNumber}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Room Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Số phòng</h3>
                  <p className="text-2xl font-bold text-slate-900">{selectedRoom.roomNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Tầng</h3>
                  <p className="text-2xl font-bold text-slate-900">{selectedRoom.floorNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Loại phòng</h3>
                  <p className="text-lg font-semibold text-slate-900">{selectedRoom.roomType?.typeName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Trạng thái hiện tại</h3>
                  <Badge
                    className={`${STATUS_COLORS[selectedRoom.roomStatus as keyof typeof STATUS_COLORS]?.bg} ${STATUS_COLORS[selectedRoom.roomStatus as keyof typeof STATUS_COLORS]?.text} text-sm px-3 py-1`}
                  >
                    {STATUS_COLORS[selectedRoom.roomStatus as keyof typeof STATUS_COLORS]?.label}
                  </Badge>
                </div>
              </div>

              {/* Room Type Details */}
              {selectedRoom.roomType && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Thông số phòng</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Diện tích:</span>
                      <span className="ml-2 font-semibold">{selectedRoom.roomType.roomSize}m²</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Sức chứa:</span>
                      <span className="ml-2 font-semibold">{selectedRoom.roomType.maxOccupancy} người</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Giá/đêm:</span>
                      <span className="ml-2 font-semibold text-[#00008b]">
                        {selectedRoom.roomType.basePriceNight.toLocaleString("vi-VN")} VNĐ
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Transitions */}
              {availableTransitions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Chuyển đổi trạng thái</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {availableTransitions.map((transition) => (
                      <Button
                        key={transition.toStatus}
                        onClick={() => handleStatusChange(transition.toStatus)}
                        variant="outline"
                        className="justify-start"
                      >
                        <ChevronRight className="w-4 h-4 mr-2" />
                        <span>{STATUS_COLORS[transition.toStatus as keyof typeof STATUS_COLORS]?.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedRoom.notes && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Ghi chú</h3>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{selectedRoom.notes}</p>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
