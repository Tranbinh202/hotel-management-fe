"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { roomManagementApi } from "@/lib/api/rooms"
import { employeesApi } from "@/lib/api/employees"
import type { RoomStats, RoomSearchItem, Employee, RoomStatusCode } from "@/lib/types/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function TaskManagementPage() {
  const [stats, setStats] = useState<RoomStats | null>(null)
  const [rooms, setRooms] = useState<RoomSearchItem[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<RoomStatusCode | "all">("all")
  const [filterFloor, setFilterFloor] = useState<number | "all">("all")
  const [selectedRoom, setSelectedRoom] = useState<RoomSearchItem | null>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [taskType, setTaskType] = useState<"Cleaning" | "Maintenance">("Cleaning")
  const [assignedEmployee, setAssignedEmployee] = useState("")
  const [taskNotes, setTaskNotes] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsData, roomsData, employeesData] = await Promise.all([
        roomManagementApi.getStats(),
        roomManagementApi.search({}),
        employeesApi.getAll({ PageIndex: 1, PageSize: 100, Search: "", SortBy: "employeeId", SortDesc: false }),
      ])
      setStats(statsData)
      setRooms(roomsData.rooms)
      setEmployees(employeesData.items)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (statusCode: RoomStatusCode) => {
    const colors: Record<RoomStatusCode, string> = {
      Available: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Booked: "bg-blue-100 text-blue-700 border-blue-200",
      Occupied: "bg-purple-100 text-purple-700 border-purple-200",
      Cleaning: "bg-amber-100 text-amber-700 border-amber-200",
      Maintenance: "bg-red-100 text-red-700 border-red-200",
      PendingInspection: "bg-orange-100 text-orange-700 border-orange-200",
      OutOfService: "bg-slate-100 text-slate-700 border-slate-200",
    }
    return colors[statusCode] || "bg-slate-100 text-slate-700"
  }

  const getStatusIcon = (statusCode: RoomStatusCode) => {
    const icons: Record<RoomStatusCode, React.ReactNode> = {
      Available: <div className="w-2 h-2 rounded-full bg-emerald-500" />,
      Booked: <div className="w-2 h-2 rounded-full bg-blue-500" />,
      Occupied: <div className="w-2 h-2 rounded-full bg-purple-500" />,
      Cleaning: <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />,
      Maintenance: <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />,
      PendingInspection: <div className="w-2 h-2 rounded-full bg-orange-500" />,
      OutOfService: <div className="w-2 h-2 rounded-full bg-slate-500" />,
    }
    return icons[statusCode]
  }

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomTypeName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || room.statusCode === filterStatus
    const matchesFloor = filterFloor === "all" || Number.parseInt(room.roomName.charAt(0)) === filterFloor
    return matchesSearch && matchesStatus && matchesFloor
  })

  const floors = Array.from(new Set(rooms.map((r) => Number.parseInt(r.roomName.charAt(0))))).sort()

  const handleAssignTask = (room: RoomSearchItem, type: "Cleaning" | "Maintenance") => {
    setSelectedRoom(room)
    setTaskType(type)
    setAssignDialogOpen(true)
  }

  const handleSubmitTask = async () => {
    if (!selectedRoom || !assignedEmployee) return

    try {
      // Change room status based on task type
      const newStatus: RoomStatusCode = taskType === "Cleaning" ? "Cleaning" : "Maintenance"
      await roomManagementApi.changeStatus({
        roomId: selectedRoom.roomId,
        newStatus,
      })

      // Here you would also create a task assignment record in your backend
      // For now, we'll just update the local state
      console.log("Task assigned:", {
        room: selectedRoom.roomName,
        type: taskType,
        employee: assignedEmployee,
        notes: taskNotes,
      })

      // Refresh data
      await loadData()

      // Close dialog and reset
      setAssignDialogOpen(false)
      setAssignedEmployee("")
      setTaskNotes("")
      setSelectedRoom(null)
    } catch (error) {
      console.error("Error assigning task:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[oklch(0.72_0.12_75)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý công việc</h1>
          <p className="text-slate-600 mt-1">Phân chia và theo dõi công việc dọn dẹp, bảo trì phòng</p>
        </div>
        <Button
          onClick={loadData}
          variant="outline"
          className="border-[oklch(0.25_0.04_265)] text-[oklch(0.25_0.04_265)] hover:bg-[oklch(0.25_0.04_265)] hover:text-white bg-transparent"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Làm mới
        </Button>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Tổng số phòng</span>
              <svg
                className="w-5 h-5 text-[oklch(0.25_0.04_265)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.totalRooms}</div>
          </div>

          {stats.statusSummary.slice(0, 3).map((status) => (
            <div key={status.statusCode} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">{status.status}</span>
                {getStatusIcon(status.statusCode)}
              </div>
              <div className="text-3xl font-bold text-slate-900">{status.count}</div>
              <div className="text-xs text-slate-500 mt-1">{status.percentage.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Tìm kiếm phòng</Label>
            <Input
              id="search"
              placeholder="Nhập số phòng hoặc loại phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="status">Trạng thái</Label>
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as RoomStatusCode | "all")}>
              <SelectTrigger id="status" className="mt-1">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Available">Trống</SelectItem>
                <SelectItem value="Booked">Đã đặt</SelectItem>
                <SelectItem value="Occupied">Đang sử dụng</SelectItem>
                <SelectItem value="Cleaning">Đang dọn dẹp</SelectItem>
                <SelectItem value="Maintenance">Bảo trì</SelectItem>
                <SelectItem value="PendingInspection">Chờ kiểm tra</SelectItem>
                <SelectItem value="OutOfService">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="floor">Tầng</Label>
            <Select
              value={filterFloor.toString()}
              onValueChange={(value) => setFilterFloor(value === "all" ? "all" : Number.parseInt(value))}
            >
              <SelectTrigger id="floor" className="mt-1">
                <SelectValue placeholder="Chọn tầng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {floors.map((floor) => (
                  <SelectItem key={floor} value={floor.toString()}>
                    Tầng {floor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => (
          <div
            key={room.roomId}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-video bg-slate-100 relative">
              {room.images?.[0] ? (
                <img
                  src={room.images[0] || "/placeholder.svg"}
                  alt={room.roomName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge className={getStatusColor(room.statusCode)}>{room.status}</Badge>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-slate-900">{room.roomName}</h3>
              <p className="text-sm text-slate-600">{room.roomTypeName}</p>
              <div className="flex items-center gap-2 mt-3">
                <Button
                  onClick={() => handleAssignTask(room, "Cleaning")}
                  size="sm"
                  variant="outline"
                  className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                  disabled={room.statusCode === "Cleaning"}
                >
                  Dọn dẹp
                </Button>
                <Button
                  onClick={() => handleAssignTask(room, "Maintenance")}
                  size="sm"
                  variant="outline"
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                  disabled={room.statusCode === "Maintenance"}
                >
                  Bảo trì
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-slate-600">Không tìm thấy phòng nào</p>
        </div>
      )}

      {/* Assign Task Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Phân công {taskType === "Cleaning" ? "dọn dẹp" : "bảo trì"} - {selectedRoom?.roomName}
            </DialogTitle>
            <DialogDescription>Chọn nhân viên và thêm ghi chú cho công việc này</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="employee">Nhân viên</Label>
              <Select value={assignedEmployee} onValueChange={setAssignedEmployee}>
                <SelectTrigger id="employee" className="mt-1">
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.employeeId} value={emp.employeeId.toString()}>
                      {emp.fullName} - {emp.phoneNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                placeholder="Nhập ghi chú về công việc..."
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmitTask}
              disabled={!assignedEmployee}
              className="bg-[oklch(0.25_0.04_265)] hover:bg-[oklch(0.20_0.04_265)]"
            >
              Phân công
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
