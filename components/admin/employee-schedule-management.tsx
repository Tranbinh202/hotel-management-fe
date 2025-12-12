"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  Loader2,
} from "lucide-react"
import {
  useSchedules,
  useEmployees,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from "@/lib/hooks/use-schedule"
import { SHIFT_DEFINITIONS } from "@/lib/api/schedule"
import type { ShiftType, EmployeeSchedule, CreateScheduleDto, Employee } from "@/lib/types/api"

// Mock data for testing
const MOCK_EMPLOYEES: Employee[] = [
  {
    employeeId: 1,
    accountId: 101,
    fullName: "Nguyễn Văn An",
    email: "nva@hotel.com",
    phoneNumber: "0901234567",
    role: "Receptionist",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    employeeId: 2,
    accountId: 102,
    fullName: "Trần Thị Bình",
    email: "ttb@hotel.com",
    phoneNumber: "0901234568",
    role: "Housekeeper",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    employeeId: 3,
    accountId: 103,
    fullName: "Lê Minh Châu",
    email: "lmc@hotel.com",
    phoneNumber: "0901234569",
    role: "Chef",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    employeeId: 4,
    accountId: 104,
    fullName: "Phạm Thị Dung",
    email: "ptd@hotel.com",
    phoneNumber: "0901234570",
    role: "Housekeeper",
    avatarUrl: "https://i.pravatar.cc/150?img=9",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    employeeId: 5,
    accountId: 105,
    fullName: "Hoàng Văn Em",
    email: "hve@hotel.com",
    phoneNumber: "0901234571",
    role: "Security",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
]

const generateMockSchedules = (weekDates: Date[]): EmployeeSchedule[] => {
  const schedules: EmployeeSchedule[] = []
  let scheduleId = 1

  // Generate some schedules for this week
  weekDates.forEach((date, dayIndex) => {
    const dateStr = date.toISOString().split("T")[0]

    // Ca sáng - 2 người mỗi ngày
    if (dayIndex < 5) {
      // Thứ 2-6
      schedules.push({
        scheduleId: scheduleId++,
        employeeId: 1,
        employeeName: "Nguyễn Văn An",
        employeeRole: "Receptionist",
        employeeAvatar: "https://i.pravatar.cc/150?img=1",
        date: dateStr,
        shiftType: "morning",
        shiftName: "Ca Sáng",
        startTime: "06:00",
        endTime: "14:00",
        status: dayIndex < new Date().getDay() - 1 ? "Completed" : "Scheduled",
        notes: dayIndex === 0 ? "Ca đầu tuần" : undefined,
        createdAt: new Date().toISOString(),
      })

      schedules.push({
        scheduleId: scheduleId++,
        employeeId: 2,
        employeeName: "Trần Thị Bình",
        employeeRole: "Housekeeper",
        employeeAvatar: "https://i.pravatar.cc/150?img=5",
        date: dateStr,
        shiftType: "morning",
        shiftName: "Ca Sáng",
        startTime: "06:00",
        endTime: "14:00",
        status: "Scheduled",
        createdAt: new Date().toISOString(),
      })
    }

    // Ca chiều - 2-3 người
    if (dayIndex < 6) {
      schedules.push({
        scheduleId: scheduleId++,
        employeeId: 3,
        employeeName: "Lê Minh Châu",
        employeeRole: "Chef",
        date: dateStr,
        shiftType: "afternoon",
        shiftName: "Ca Chiều",
        startTime: "14:00",
        endTime: "22:00",
        status: "Scheduled",
        notes: "Chuẩn bị bữa tối",
        createdAt: new Date().toISOString(),
      })

      schedules.push({
        scheduleId: scheduleId++,
        employeeId: 4,
        employeeName: "Phạm Thị Dung",
        employeeRole: "Housekeeper",
        employeeAvatar: "https://i.pravatar.cc/150?img=9",
        date: dateStr,
        shiftType: "afternoon",
        shiftName: "Ca Chiều",
        startTime: "14:00",
        endTime: "22:00",
        status: "Scheduled",
        createdAt: new Date().toISOString(),
      })
    }

    // Ca đêm - 1-2 người
    schedules.push({
      scheduleId: scheduleId++,
      employeeId: 5,
      employeeName: "Hoàng Văn Em",
      employeeRole: "Security",
      employeeAvatar: "https://i.pravatar.cc/150?img=12",
      date: dateStr,
      shiftType: "night",
      shiftName: "Ca Đêm",
      startTime: "22:00",
      endTime: "06:00",
      status: dayIndex === 0 && new Date().getDay() > 1 ? "Absent" : "Scheduled",
      notes: "Bảo vệ đêm",
      createdAt: new Date().toISOString(),
    })

    if (dayIndex === 5 || dayIndex === 6) {
      // Cuối tuần thêm ca đêm
      schedules.push({
        scheduleId: scheduleId++,
        employeeId: 1,
        employeeName: "Nguyễn Văn An",
        employeeRole: "Receptionist",
        employeeAvatar: "https://i.pravatar.cc/150?img=1",
        date: dateStr,
        shiftType: "night",
        shiftName: "Ca Đêm",
        startTime: "22:00",
        endTime: "06:00",
        status: "Scheduled",
        notes: "Trực đêm cuối tuần",
        createdAt: new Date().toISOString(),
      })
    }
  })

  return schedules
}

export default function EmployeeScheduleManagement() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Monday of current week
    const monday = new Date(today.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    return monday
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<EmployeeSchedule | null>(null)
  const [formData, setFormData] = useState({
    employeeId: 0,
    date: "",
    shiftType: "morning" as ShiftType,
    notes: "",
  })

  // Calculate week range
  const weekDates = useMemo(() => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [currentWeekStart])

  const startDate = weekDates[0].toISOString().split("T")[0]
  const endDate = weekDates[6].toISOString().split("T")[0]

  // Fetch data
  const { data: schedulesData, isLoading: isLoadingSchedules } = useSchedules({
    startDate,
    endDate,
    pageSize: 500,
  })
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees()

  const createMutation = useCreateSchedule()
  const updateMutation = useUpdateSchedule()
  const deleteMutation = useDeleteSchedule()

  // Use mock data if API data is not available
  const mockSchedules = useMemo(() => generateMockSchedules(weekDates), [weekDates])
  const schedules = schedulesData?.items || mockSchedules
  const employeeList = employees || MOCK_EMPLOYEES

  // Group schedules by date and shift
  const scheduleMatrix = useMemo(() => {
    const matrix: Record<string, Record<ShiftType, EmployeeSchedule[]>> = {}

    weekDates.forEach((date) => {
      const dateStr = date.toISOString().split("T")[0]
      matrix[dateStr] = {
        morning: [],
        afternoon: [],
        night: [],
      }
    })

    schedules.forEach((schedule) => {
      const dateStr = schedule.date.split("T")[0]
      if (matrix[dateStr]) {
        matrix[dateStr][schedule.shiftType].push(schedule)
      }
    })

    return matrix
  }, [schedules, weekDates])

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  const handleThisWeek = () => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(today.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    setCurrentWeekStart(monday)
  }

  const handleAddSchedule = (date: Date, shiftType: ShiftType) => {
    setEditingSchedule(null)
    setFormData({
      employeeId: employeeList?.[0]?.employeeId || 0,
      date: date.toISOString().split("T")[0],
      shiftType,
      notes: "",
    })
    setIsModalOpen(true)
  }

  const handleEditSchedule = (schedule: EmployeeSchedule) => {
    setEditingSchedule(schedule)
    setFormData({
      employeeId: schedule.employeeId,
      date: schedule.date.split("T")[0],
      shiftType: schedule.shiftType,
      notes: schedule.notes || "",
    })
    setIsModalOpen(true)
  }

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (confirm("Bạn có chắc muốn xóa lịch này?")) {
      await deleteMutation.mutateAsync(scheduleId)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.employeeId) {
      alert("Vui lòng chọn nhân viên")
      return
    }

    try {
      if (editingSchedule) {
        await updateMutation.mutateAsync({
          scheduleId: editingSchedule.scheduleId,
          ...formData,
        })
      } else {
        await createMutation.mutateAsync(formData)
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Failed to save schedule:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      Scheduled: { variant: "default", label: "Đã lên lịch" },
      Completed: { variant: "default", label: "Hoàn thành" },
      Absent: { variant: "destructive", label: "Vắng mặt" },
      Cancelled: { variant: "secondary", label: "Đã hủy" },
    }
    const config = statusMap[status] || { variant: "default", label: status }
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    )
  }

  const formatDate = (date: Date) => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
    return {
      dayName: days[date.getDay()],
      date: date.getDate(),
      month: date.getMonth() + 1,
    }
  }

  const formatWeekRange = () => {
    const start = weekDates[0]
    const end = weekDates[6]
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`
  }

  // Show loading only if we don't have mock data as fallback
  const showLoading = (isLoadingSchedules || isLoadingEmployees) && !mockSchedules.length

  if (showLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Lịch Làm Việc</h1>
          <p className="text-muted-foreground mt-1">Lên lịch và quản lý ca làm việc của nhân viên</p>
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePreviousWeek}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Tuần trước
            </Button>

            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleThisWeek}>
                <CalendarIcon className="w-4 h-4 mr-2" />
                Tuần này
              </Button>
              <div className="text-lg font-semibold">{formatWeekRange()}</div>
            </div>

            <Button variant="outline" onClick={handleNextWeek}>
              Tuần sau
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-3 bg-muted text-left w-32 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Ca làm việc
                    </div>
                  </th>
                  {weekDates.map((date) => {
                    const formatted = formatDate(date)
                    const isToday = date.toDateString() === new Date().toDateString()
                    return (
                      <th
                        key={date.toISOString()}
                        className={`border p-3 text-center min-w-[180px] ${
                          isToday ? "bg-primary/10" : "bg-muted"
                        }`}
                      >
                        <div className="font-semibold">{formatted.dayName}</div>
                        <div className="text-sm font-normal">
                          {formatted.date}/{formatted.month}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {SHIFT_DEFINITIONS.map((shift) => (
                  <tr key={shift.shiftType}>
                    <td className="border p-3 bg-muted sticky left-0 z-10">
                      <div className="font-medium">{shift.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {shift.startTime} - {shift.endTime}
                      </div>
                    </td>
                    {weekDates.map((date) => {
                      const dateStr = date.toISOString().split("T")[0]
                      const cellSchedules = scheduleMatrix[dateStr]?.[shift.shiftType] || []
                      const isToday = date.toDateString() === new Date().toDateString()

                      return (
                        <td
                          key={`${dateStr}-${shift.shiftType}`}
                          className={`border p-2 align-top ${isToday ? "bg-primary/5" : ""}`}
                        >
                          <div className="space-y-2">
                            {cellSchedules.map((schedule) => (
                              <div
                                key={schedule.scheduleId}
                                className={`p-2 rounded-lg border ${shift.color} relative group cursor-pointer hover:shadow-md transition-all`}
                                onClick={() => handleEditSchedule(schedule)}
                              >
                                <div className="flex items-start gap-2">
                                  {/* Avatar */}
                                  <div className="shrink-0">
                                    {schedule.employeeAvatar ? (
                                      <img
                                        src={schedule.employeeAvatar}
                                        alt={schedule.employeeName}
                                        className="w-8 h-8 rounded-full object-cover border-2 border-white"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                                        {schedule.employeeName?.charAt(0) || "?"}
                                      </div>
                                    )}
                                  </div>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-1">
                                      <span className="text-xs font-medium truncate block">
                                        {schedule.employeeName}
                                      </span>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-5 w-5 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleEditSchedule(schedule)
                                          }}
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-5 w-5 p-0 text-red-600"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteSchedule(schedule.scheduleId)
                                          }}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    {schedule.employeeRole && (
                                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                                        {schedule.employeeRole}
                                      </div>
                                    )}
                                    <div className="mt-1">{getStatusBadge(schedule.status)}</div>
                                    {schedule.notes && (
                                      <div className="text-xs text-muted-foreground mt-1 italic line-clamp-1">
                                        {schedule.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-8 text-xs"
                              onClick={() => handleAddSchedule(date, shift.shiftType)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Thêm
                            </Button>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSchedule ? "Sửa Lịch Làm Việc" : "Thêm Lịch Làm Việc"}</DialogTitle>
            <DialogDescription>
              {editingSchedule ? "Cập nhật thông tin lịch làm việc" : "Tạo lịch làm việc mới cho nhân viên"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Nhân viên *</Label>
              <Select
                value={formData.employeeId.toString()}
                onValueChange={(value) => setFormData({ ...formData, employeeId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  {employeeList?.map((employee) => (
                    <SelectItem key={employee.employeeId} value={employee.employeeId.toString()}>
                      {employee.fullName} - {employee.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Ngày *</Label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift">Ca làm việc *</Label>
              <Select
                value={formData.shiftType}
                onValueChange={(value: ShiftType) => setFormData({ ...formData, shiftType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHIFT_DEFINITIONS.map((shift) => (
                    <SelectItem key={shift.shiftType} value={shift.shiftType}>
                      {shift.name} ({shift.startTime} - {shift.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ghi chú thêm..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingSchedule ? "Cập nhật" : "Thêm"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
