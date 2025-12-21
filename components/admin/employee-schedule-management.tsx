"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
  Check,
  ChevronsUpDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useWeeklySchedule,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from "@/lib/hooks/use-schedule"
import { useEmployeeSearch } from "@/lib/hooks/use-employees"
import { useCommonCodes } from "@/lib/hooks/use-common-code"
import { SHIFT_DEFINITIONS } from "@/lib/api/schedule"
import { convertWeeklyScheduleToEmployeeSchedules, getShiftTimesByType } from "@/lib/utils/schedule-adapter"
import type { ShiftType, EmployeeSchedule, CreateScheduleDto, Employee } from "@/lib/types/api"

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
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false)
  const [employeeSearchKeyword, setEmployeeSearchKeyword] = useState("")
  const [selectedEmployeeTypeId, setSelectedEmployeeTypeId] = useState<number | undefined>(undefined)

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

  console.log("📅 Schedule Dates:", { startDate, endDate, employeeTypeId: selectedEmployeeTypeId })

  // Fetch employee types from CommonCode
  const { data: employeeTypes = [] } = useQuery({
    queryKey: ["commonCodes", "EmployeeType"],
    queryFn: async () => {
      const { commonCodeApi } = await import("@/lib/api/common-code")
      return commonCodeApi.getByType("EmployeeType", true)
    },
    staleTime: 5 * 60 * 1000,
  })

  // Fetch data from NEW API with optional filter
  const { data: weeklyScheduleData, isLoading: isLoadingSchedules, error: scheduleError } = useWeeklySchedule(
    startDate,
    endDate,
    selectedEmployeeTypeId
  )

  console.log("📊 Weekly Schedule Data:", {
    data: weeklyScheduleData,
    isLoading: isLoadingSchedules,
    error: scheduleError
  })

  // Search employees
  const { data: employeeSearchData, isLoading: isSearchingEmployees } = useEmployeeSearch({
    keyword: employeeSearchKeyword,
    isActive: true,
    isLocked: false,
    pageSize: 20,
  })

  const createMutation = useCreateSchedule()
  const updateMutation = useUpdateSchedule()
  const deleteMutation = useDeleteSchedule()

  // Convert weekly schedule data to old format using adapter
  const schedules = useMemo(() => {
    if (!weeklyScheduleData) return []
    return convertWeeklyScheduleToEmployeeSchedules(weeklyScheduleData)
  }, [weeklyScheduleData])

  const employeeList = employeeSearchData?.items || []

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
      employeeId: 0,
      date: date.toISOString().split("T")[0],
      shiftType,
      notes: "",
    })
    setEmployeeSearchKeyword("")
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
    setEmployeeSearchKeyword(schedule.employeeName)
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
      // Get start/end time based on shift type
      const shiftTimes = getShiftTimesByType(formData.shiftType)

      if (editingSchedule) {
        await updateMutation.mutateAsync({
          scheduleId: editingSchedule.scheduleId,
          employeeId: formData.employeeId,
          shiftDate: formData.date,
          startTime: shiftTimes.startTime,
          endTime: shiftTimes.endTime,
          notes: formData.notes || undefined,
        })
      } else {
        await createMutation.mutateAsync({
          employeeId: formData.employeeId,
          shiftDate: formData.date,
          startTime: shiftTimes.startTime,
          endTime: shiftTimes.endTime,
          notes: formData.notes || undefined,
        })
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Failed to save schedule:", error)
    }
  }

  const formatDate = (date: Date) => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
    return {
      dayName: days[date.getDay()],
      date: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    }
  }

  const formatWeekRange = () => {
    const start = weekDates[0]
    const end = weekDates[6]
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`
  }

  const getSelectedEmployee = () => {
    return employeeList.find((emp: any) => emp.employeeId === formData.employeeId)
  }

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const showLoading = isLoadingSchedules

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

        {/* Filter by Employee Type */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Lọc theo loại nhân viên:</label>
          <Select
            value={selectedEmployeeTypeId?.toString() || "all"}
            onValueChange={(value) => setSelectedEmployeeTypeId(value === "all" ? undefined : parseInt(value))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {employeeTypes
                .filter((type: any) => type?.codeId) // Filter out invalid entries
                .map((type: any) => (
                  <SelectItem key={type.codeId} value={type.codeId.toString()}>
                    {type.codeValue || 'N/A'}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
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
                        className={`border p-3 text-center min-w-[180px] ${isToday ? "bg-primary/10" : "bg-muted"
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? "Sửa Lịch Làm Việc" : "Thêm Lịch Làm Việc"}</DialogTitle>
            <DialogDescription>
              {editingSchedule ? "Cập nhật thông tin lịch làm việc" : `Tạo lịch làm việc mới cho ngày ${formatDateDisplay(formData.date)}`}
              <br />
              <span className="text-sm font-medium">
                {SHIFT_DEFINITIONS.find(s => s.shiftType === formData.shiftType)?.name} ({SHIFT_DEFINITIONS.find(s => s.shiftType === formData.shiftType)?.startTime} - {SHIFT_DEFINITIONS.find(s => s.shiftType === formData.shiftType)?.endTime})
              </span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nhân viên *</Label>
              <Popover open={employeeSearchOpen} onOpenChange={setEmployeeSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={employeeSearchOpen}
                    className="w-full justify-between"
                  >
                    {formData.employeeId
                      ? employeeList.find((emp: any) => emp.employeeId === formData.employeeId)?.fullName
                      : "Tìm kiếm nhân viên..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Tìm theo tên, số điện thoại..."
                      value={employeeSearchKeyword}
                      onValueChange={setEmployeeSearchKeyword}
                    />
                    <CommandEmpty>
                      {isSearchingEmployees ? "Đang tìm kiếm..." : "Không tìm thấy nhân viên"}
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {employeeList.map((employee: any) => (
                          <CommandItem
                            key={employee.employeeId}
                            value={employee.fullName}
                            onSelect={() => {
                              setFormData({ ...formData, employeeId: employee.employeeId })
                              setEmployeeSearchOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.employeeId === employee.employeeId ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{employee.fullName}</span>
                              <span className="text-xs text-muted-foreground">
                                {employee.employeeTypeName} • {employee.phoneNumber || employee.email}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
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
