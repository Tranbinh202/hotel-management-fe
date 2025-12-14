"use client"

import { useState, useMemo } from "react"
import { useAttendances, useCreateAttendance, useUpdateAttendance, useDeleteAttendance } from "@/lib/hooks/use-attendance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Trash2, Plus, Calendar, Users, CheckCircle2, XCircle, Clock, UserX, UserCheck } from "lucide-react"
import type { Attendance, AttendanceStatus, CreateAttendanceDto, UpdateAttendanceDto, Employee, AttendanceRecord } from "@/lib/types/api"
import { format, subDays } from "date-fns"

// Mock employees for fallback data
const MOCK_EMPLOYEES: Employee[] = [
  {
    employeeId: 1,
    fullName: "Nguyễn Văn An",
    role: "Receptionist",
    phoneNumber: "0901234567",
    email: "nguyenvanan@hotel.com",
    address: "123 Nguyễn Huệ, Q1, HCM",
    dateOfBirth: "1995-03-15",
    hireDate: "2020-01-10",
    salary: 12000000,
    status: "Active",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
  },
  {
    employeeId: 2,
    fullName: "Trần Thị Bình",
    role: "Housekeeping",
    phoneNumber: "0902345678",
    email: "tranthibinh@hotel.com",
    address: "456 Lê Lợi, Q1, HCM",
    dateOfBirth: "1992-07-22",
    hireDate: "2019-05-20",
    salary: 10000000,
    status: "Active",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
  },
  {
    employeeId: 3,
    fullName: "Lê Minh Cường",
    role: "Security",
    phoneNumber: "0903456789",
    email: "leminhcuong@hotel.com",
    address: "789 Hai Bà Trưng, Q3, HCM",
    dateOfBirth: "1990-11-05",
    hireDate: "2018-03-15",
    salary: 11000000,
    status: "Active",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
  },
  {
    employeeId: 4,
    fullName: "Phạm Thị Dung",
    role: "Chef",
    phoneNumber: "0904567890",
    email: "phamthidung@hotel.com",
    address: "321 Trần Hưng Đạo, Q5, HCM",
    dateOfBirth: "1988-04-18",
    hireDate: "2017-08-01",
    salary: 15000000,
    status: "Active",
    avatarUrl: "https://i.pravatar.cc/150?img=4",
  },
  {
    employeeId: 5,
    fullName: "Hoàng Văn Em",
    role: "Manager",
    phoneNumber: "0905678901",
    email: "hoangvanem@hotel.com",
    address: "654 Võ Văn Tần, Q3, HCM",
    dateOfBirth: "1985-09-30",
    hireDate: "2015-01-05",
    salary: 20000000,
    status: "Active",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
  },
  {
    employeeId: 6,
    fullName: "Vũ Thị Phương",
    role: "Receptionist",
    phoneNumber: "0906789012",
    email: "vuthiphuong@hotel.com",
    address: "987 Pasteur, Q1, HCM",
    dateOfBirth: "1994-12-25",
    hireDate: "2021-06-15",
    salary: 11500000,
    status: "Active",
    avatarUrl: "https://i.pravatar.cc/150?img=6",
  },
  {
    employeeId: 7,
    fullName: "Đặng Minh Giang",
    role: "Housekeeping",
    phoneNumber: "0907890123",
    email: "dangminhgiang@hotel.com",
    address: "135 Điện Biên Phủ, Q3, HCM",
    dateOfBirth: "1993-06-10",
    hireDate: "2020-09-01",
    salary: 10500000,
    status: "Active",
    avatarUrl: "https://i.pravatar.cc/150?img=7",
  },
]

// Generate mock attendance data for the last 30 days
const generateMockAttendances = (): Attendance[] => {
  const attendances: Attendance[] = []
  const today = new Date()
  let attendanceId = 1

  // Generate for last 30 days
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const currentDate = subDays(today, dayOffset)
    const dateStr = format(currentDate, "yyyy-MM-dd")

    // Generate attendance for each employee
    MOCK_EMPLOYEES.forEach((employee) => {
      // Random distribution: 5% absent, 5% on leave, 5% late, 3% half day, rest present
      const random = Math.random()
      let status: AttendanceStatus
      let checkInTime: string | undefined
      let checkOutTime: string | undefined
      let workingHours: number | undefined
      let notes: string | undefined

      if (random < 0.05) {
        // 5% absent
        status = "Absent"
        notes = "Không có mặt"
      } else if (random < 0.10) {
        // 5% on leave
        status = "OnLeave"
        notes = "Nghỉ phép"
      } else if (random < 0.15) {
        // 5% late
        status = "Late"
        const lateMinutes = Math.floor(Math.random() * 60) + 10 // 10-70 minutes late
        const checkInHour = 8
        const checkInMinute = lateMinutes
        checkInTime = `${checkInHour.toString().padStart(2, "0")}:${checkInMinute.toString().padStart(2, "0")}`
        checkOutTime = "17:30"
        workingHours = 8 - (lateMinutes / 60)
        notes = `Đến muộn ${lateMinutes} phút`
      } else if (random < 0.18) {
        // 3% half day
        status = "HalfDay"
        checkInTime = "08:00"
        checkOutTime = "12:00"
        workingHours = 4
        notes = "Nghỉ nửa ngày"
      } else {
        // Rest present with minor time variations
        status = "Present"
        const checkInVariation = Math.floor(Math.random() * 10) - 5 // -5 to +5 minutes
        const checkOutVariation = Math.floor(Math.random() * 20) - 10 // -10 to +10 minutes

        const baseCheckIn = 8 * 60 // 8:00 in minutes
        const baseCheckOut = 17 * 60 + 30 // 17:30 in minutes

        const actualCheckIn = baseCheckIn + checkInVariation
        const actualCheckOut = baseCheckOut + checkOutVariation

        const checkInHours = Math.floor(actualCheckIn / 60)
        const checkInMinutes = actualCheckIn % 60
        const checkOutHours = Math.floor(actualCheckOut / 60)
        const checkOutMinutes = actualCheckOut % 60

        checkInTime = `${checkInHours.toString().padStart(2, "0")}:${checkInMinutes.toString().padStart(2, "0")}`
        checkOutTime = `${checkOutHours.toString().padStart(2, "0")}:${checkOutMinutes.toString().padStart(2, "0")}`
        workingHours = (actualCheckOut - actualCheckIn) / 60
      }

      attendances.push({
        attendanceId: attendanceId++,
        employeeId: employee.employeeId,
        employeeName: employee.fullName,
        employeeRole: employee.role,
        employeeAvatar: employee.avatarUrl,
        workDate: dateStr,
        checkInTime,
        checkOutTime,
        status,
        workingHours,
        notes,
        createdAt: dateStr,
        updatedAt: dateStr,
      })
    })
  }

  return attendances.reverse() // Most recent first
}

const MOCK_ATTENDANCES = generateMockAttendances()

// Status badge component
const StatusBadge = ({ status }: { status: AttendanceStatus }) => {
  const config = {
    Present: { label: "Có mặt", className: "bg-green-100 text-green-700 border-green-300" },
    Absent: { label: "Vắng mặt", className: "bg-red-100 text-red-700 border-red-300" },
    Late: { label: "Đến muộn", className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    OnLeave: { label: "Nghỉ phép", className: "bg-blue-100 text-blue-700 border-blue-300" },
    HalfDay: { label: "Nửa ngày", className: "bg-purple-100 text-purple-700 border-purple-300" },
  }

  const { label, className } = config[status]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  )
}

export default function AttendanceManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null)
  const [searchName, setSearchName] = useState("")
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | "all">("all")
  const [filterDate, setFilterDate] = useState("")

  // Fetch attendances from API
  const { data: apiData, isLoading, error } = useAttendances({})
  const createMutation = useCreateAttendance()
  const updateMutation = useUpdateAttendance()
  const deleteMutation = useDeleteAttendance()

  // Use mock data if API fails or returns no data
  const attendances = useMemo(() => {
    if (error || !apiData?.items || apiData.items.length === 0) {
      return MOCK_ATTENDANCES
    }
    return apiData.items
  }, [apiData, error])

  // Filter attendances
  const filteredAttendances = useMemo(() => {
    console.log("filterDate:", filterDate)
    console.log("attendances:", attendances)
    return attendances.filter((attendance) => {
      const nameMatch = searchName === "" ||
        attendance.employeeName.toLowerCase().includes(searchName.toLowerCase())

      const statusMatch = filterStatus === "all" || attendance.status === filterStatus

      const dateMatch = filterDate === "" || format(new Date(attendance.workDate), "yyyy-MM-dd") === filterDate

      return nameMatch && statusMatch && dateMatch
    })
  }, [attendances, searchName, filterStatus, filterDate])

  // Calculate statistics
  const stats = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd")
    const todayAttendances = attendances.filter((a) => a.date === today)

    return {
      total: todayAttendances.length,
      present: todayAttendances.filter((a) => a.status === "Present").length,
      late: todayAttendances.filter((a) => a.status === "Late").length,
      absent: todayAttendances.filter((a) => a.status === "Absent").length,
      onLeave: todayAttendances.filter((a) => a.status === "OnLeave").length,
    }
  }, [attendances])

  // Form state
  const [formData, setFormData] = useState({
    employeeId: 0,
    workDate: format(new Date(), "yyyy-MM-dd"),
    checkIn: "08:00",
    checkOut: "17:30",
    status: "Present" as AttendanceStatus,
    workingHours: 8,
    notes: "",
  })

  const handleOpenDialog = (attendance?: Attendance) => {
    if (attendance) {
      console.log("editing attendance:", attendance )
      setEditingAttendance(attendance)
      setFormData({
        employeeId: attendance.employeeId,
        workDate: attendance.workDate!=null?format(new Date(attendance.workDate), "yyyy-MM-dd"):format(new Date(), "yyyy-MM-dd"),
        checkIn: attendance.checkIn || "08:00",
        checkOut: attendance.checkOut || "17:30",
        status: attendance.status,
        workingHours: attendance.workingHours || 0,
        notes: attendance.notes || "",
      })
    } else {
      setEditingAttendance(null)
      setFormData({
        employeeId: 0,
        workDate: format(new Date(), "yyyy-MM-dd"),
        checkIn: "08:00",
        checkOut: "17:30",
        status: "Present",
        workingHours: 8,
        notes: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingAttendance(null)
  }

  const handleSubmit = () => {
    if (editingAttendance) {
      const updateData: AttendanceRecord = {
        attendanceId: editingAttendance.attendanceId,
        employeeId: formData.employeeId,
        workDate: formData.workDate,
        checkIn: formData.status === "Absent" || formData.status === "OnLeave" ? undefined : formData.checkIn,
        checkOut: formData.status === "Absent" || formData.status === "OnLeave" ? undefined : formData.checkOut,
        status: formData.status,
        workingHours: formData.status === "Absent" || formData.status === "OnLeave" ? undefined : formData.workingHours,
        notes: formData.notes,
      }
      updateMutation.mutate(updateData, {
        onSuccess: () => handleCloseDialog(),
      })
    } else {
      const createData: CreateAttendanceDto = {
        employeeId: formData.employeeId,
        workDate: formData.workDate,
        checkIn: formData.status === "Absent" || formData.status === "OnLeave" ? undefined : formData.checkIn,
        checkOut: formData.status === "Absent" || formData.status === "OnLeave" ? undefined : formData.checkOut,
        status: formData.status,
        workingHours: formData.status === "Absent" || formData.status === "OnLeave" ? undefined : formData.workingHours,
        notes: formData.notes,
      }
      createMutation.mutate(createData, {
        onSuccess: () => handleCloseDialog(),
      })
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa bản ghi chấm công này?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý chấm công</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý chấm công nhân viên</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm bản ghi
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Hôm nay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Có mặt</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            <p className="text-xs text-muted-foreground">Nhân viên</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đến muộn</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
            <p className="text-xs text-muted-foreground">Nhân viên</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vắng mặt</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <p className="text-xs text-muted-foreground">Nhân viên</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nghỉ phép</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.onLeave}</div>
            <p className="text-xs text-muted-foreground">Nhân viên</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>Tìm kiếm và lọc bản ghi chấm công</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="searchName">Tên nhân viên</Label>
              <Input
                id="searchName"
                placeholder="Tìm kiếm theo tên..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterStatus">Trạng thái</Label>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as AttendanceStatus | "all")}>
                <SelectTrigger id="filterStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Present">Có mặt</SelectItem>
                  <SelectItem value="Absent">Vắng mặt</SelectItem>
                  <SelectItem value="Late">Đến muộn</SelectItem>
                  <SelectItem value="OnLeave">Nghỉ phép</SelectItem>
                  <SelectItem value="HalfDay">Nửa ngày</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterDate">Ngày</Label>
              <Input
                id="filterDate"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách chấm công ({filteredAttendances.length})</CardTitle>
          <CardDescription>
            {error || !apiData?.items || apiData.items.length === 0
              ? "Đang sử dụng dữ liệu mẫu (mock data)"
              : "Dữ liệu từ API"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Chức vụ</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Giờ vào</TableHead>
                  <TableHead>Giờ ra</TableHead>
                  <TableHead>Giờ làm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : filteredAttendances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttendances.map((attendance) => (
                    <TableRow key={attendance.attendanceId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {attendance.employeeAvatar ? (
                            <img
                              src={attendance.employeeAvatar}
                              alt={attendance.employeeName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                              {attendance.employeeName.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium">{attendance.employeeName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{attendance.employeeRole}</TableCell>
                      <TableCell>{attendance.workDate==null?"":format(new Date(attendance.workDate), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{attendance.checkIn || "-"}</TableCell>
                      <TableCell>{attendance.checkOut || "-"}</TableCell>
                      <TableCell>{attendance.workingHours ? `${attendance.workingHours.toFixed(1)}h` : "-"}</TableCell>
                      <TableCell>
                        {/* <StatusBadge status={attendance.status} /> */}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                        {attendance.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(attendance)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(attendance.attendanceId)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAttendance ? "Chỉnh sửa chấm công" : "Thêm bản ghi chấm công"}</DialogTitle>
            <DialogDescription>
              {editingAttendance ? "Cập nhật thông tin chấm công" : "Tạo bản ghi chấm công mới"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Nhân viên</Label>
              <Select
                value={formData.employeeId.toString()}
                onValueChange={(value) => setFormData({ ...formData, employeeId: parseInt(value) })}
              >
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_EMPLOYEES.map((emp) => (
                    <SelectItem key={emp.employeeId} value={emp.employeeId.toString()}>
                      {emp.fullName} - {emp.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Ngày</Label>
              <Input
                id="date"
                type="date"
                value={formData.workDate}
                onChange={(e) => setFormData({ ...formData, workDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as AttendanceStatus })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Có mặt</SelectItem>
                  <SelectItem value="1">Vắng mặt</SelectItem>
                  <SelectItem value="2">Đến muộn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.status !== "Absent" && formData.status !== "OnLeave" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkInTime">Giờ vào</Label>
                    <Input
                      id="checkInTime"
                      type="time"
                      value={formData.checkIn}
                      onChange={(e) => {
                        console.log("formData", formData)
                        setFormData({ ...formData, checkIn: e.target.value })
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkOutTime">Giờ ra</Label>
                    <Input
                      id="checkOutTime"
                      type="time"
                      value={formData.checkOut}
                      onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workingHours">Số giờ làm việc</Label>
                  <Input
                    id="workingHours"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={formData.workingHours}
                    onChange={(e) => setFormData({ ...formData, workingHours: parseFloat(e.target.value) })}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Input
                id="notes"
                placeholder="Ghi chú thêm..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={formData.employeeId === 0}>
              {editingAttendance ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
