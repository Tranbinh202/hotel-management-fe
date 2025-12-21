"use client"

import { useState, useMemo, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAttendances, useCreateAttendance, useUpdateAttendance, useDeleteAttendance, useAttendanceStatic } from "@/lib/hooks/use-attendance"
import { toast } from "@/hooks/use-toast"
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
import { el } from "date-fns/locale"
import { useEmployees } from "@/lib/hooks/use-employees"



// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  // Accept either numeric code strings ("0","1","2") or AttendanceStatus strings
  let code = status

  let label = ""
  let className = ""

  if (code === "Attended") {
    label = "Có mặt"
    className = "bg-green-100 text-green-800 border-green-200"
  } else if (code === "AbsentWithoutLeave") {
    label = "Vắng mặt"
    className = "bg-red-100 text-red-800 border-red-200"
  } else if (code === "AbsentWithLeave") {
    label = "Nghỉ phép"
    className = "bg-blue-100 text-blue-800 border-blue-200"
  }

  return (
    <span title={label} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  )
}

// Approval badge component
const ApprovalBadge = ({ value }: { value: any }) => {
  // Accept numeric codes or string labels
  let code = value

  let label = ""
  let className = ""
  if (code === "Approved") {
    label = "Phê duyệt"
    className = "bg-green-100 text-green-800 border-green-200"
  } else if (code === "Pending") {
    label = "Đang chờ"
    className = "bg-yellow-100 text-yellow-800 border-yellow-200"
  } else if (code === "Aborted") {
    label = "Hủy"
    className = "bg-red-100 text-red-800 border-red-200"
  }

  return (
    <span title={label} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  )
}

function calcWorkingHours(start, end) {
  if(!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);

  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  const diffMinutes = endMinutes - startMinutes;

  if (diffMinutes < 0) return 0; // hoặc throw error nếu muốn

  return diffMinutes / 60; // trả về số giờ (float)
}

export default function AttendanceManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null)
  const [searchName, setSearchName] = useState("")
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | "all">("all")
  const [filterDay, setFilterDay] = useState("all")
  const [filterMonthYear, setFilterMonthYear] = useState("")
  // Pagination (server-side load more)
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [items, setItems] = useState<Attendance[]>([])

  const { data: attendanceStaticData, isLoading: isStaticLoading } = useAttendanceStatic()
  const createMutation = useCreateAttendance()
  const updateMutation = useUpdateAttendance()
  const deleteMutation = useDeleteAttendance()
  const queryClient = useQueryClient()

  // Upload file state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setUploadFile(f)
  }

  const handleUpload = async () => {
    if (!uploadFile) {
      toast({ title: "Lỗi", description: "Vui lòng chọn file txt", variant: "destructive" })
      return
    }
    try {
      const form = new FormData()
      form.append("file", uploadFile)
      // import attendanceApi dynamically to avoid circular imports
      const { attendanceApi } = await import("@/lib/api/attendance")
      await attendanceApi.uploadAttendancesTxt(form)
      toast({ title: "Thành công", description: "Đã upload file chấm công. Hệ thống đang xử lý, dữ liệu sẽ cập nhật sau." })
      // refresh list (server may process file asynchronously)
      queryClient.invalidateQueries({ queryKey: ["attendances"] })
      setPageIndex(1)
      // keep current items visible until server returns updated data
      setUploadFile(null)
      setUploadDialogOpen(false)
      // reset file input UI (if needed) — handled by value on input since uncontrolled here
    } catch (err: any) {
      toast({ title: "Lỗi", description: err?.message || "Không thể upload file", variant: "destructive" })
    }
  }

  // Reset to first page when filters change
  useEffect(() => {
    setPageIndex(1)
    setItems([])
  }, [searchName, filterStatus, filterDay, filterMonthYear, pageSize])

  // Build API params
  const apiParams: any = {
    pageIndex,
    pageSize,
  }
  if (filterStatus && filterStatus !== "all") {
    apiParams.status = filterStatus
  }
  if (searchName && searchName.trim() !== "") apiParams.EmployeeName = searchName.trim()
  if (filterDay && filterDay !== "all") {
    apiParams.day = parseInt(filterDay)
  }
  // If month-year picker selected, request startDate/endDate for that month
  if (filterMonthYear) {
    // filterMonthYear format: YYYY-MM
    const [yStr, mStr] = filterMonthYear.split("-")
    const y = parseInt(yStr)
    const m = parseInt(mStr)
    apiParams.year = y
    apiParams.month = m
  }

  // Fetch one page from server
  const { data: pagedData, isLoading, error, isFetching } = useAttendances(apiParams)

    const { data: employeesData } = useEmployees({
      PageIndex: 1,
      PageSize: 50,
      Search: "",
      SortBy: "FullName",
      SortDesc: false,
    })

  // Append fetched page to items
  useEffect(() => {
    if (!pagedData) return
    if (!pagedData.items || pagedData.items.length === 0) return

    setItems((prev) => {
      // If pageIndex is 1, replace; otherwise append
      if (pageIndex === 1) return pagedData.items
      // Avoid duplicates by attendanceId
      const existingIds = new Set(prev.map((i) => i.attendanceId))
      const newItems = pagedData.items.filter((i) => !existingIds.has(i.attendanceId))
      return [...prev, ...newItems]
    })
  }, [pagedData, pageIndex])

  const totalItems = pagedData?.totalCount ?? items.length
  const totalPages = pagedData?.totalPages ?? Math.max(1, Math.ceil(items.length / pageSize))

  // Client-side filtering for searchName and day-of-month (server filters applied for month/year)
  const filteredAttendances = useMemo(() => {
    const source = items.length > 0 ? items : []
    return source
  }, [items, searchName, filterDay, error, pagedData])

  

  // Form state
  const [formData, setFormData] = useState({
    employeeId: 0,
    workDate: format(new Date(), "yyyy-MM-dd"),
    checkIn: "08:00",
    checkOut: "17:30",
    status: "Present" as AttendanceStatus,
    isApproved: "1",
    workingHours: 8,
    notes: "",
  })

  const handleOpenDialog = (attendance?: Attendance) => {
    if (attendance) {
      console.log("editing attendance:", attendance)
      setEditingAttendance(attendance)
      setFormData({
        employeeId: attendance.employeeId,
        workDate: attendance.workDate != null ? format(new Date(attendance.workDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        checkIn: attendance.checkIn || "08:00",
        checkOut: attendance.checkOut || "17:30",
        status: attendance.status,
        workingHours: attendance.workingHours || 0,
        notes: attendance.notes || "",
        isApproved: (attendance as any).isApproved ?? (attendance as any).IsApproved ?? "1",
      })
    } else {
      setEditingAttendance(null)
      setFormData({
        employeeId: 0,
        workDate: format(new Date(), "yyyy-MM-dd"),
        checkIn: "08:00",
        checkOut: "17:30",
        status: "Present",
        isApproved: "1",
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
        isApproved: formData.isApproved,
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
        isApproved: formData.isApproved,
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
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setUploadDialogOpen(true)}>
                Upload TXT
              </Button>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm bản ghi
              </Button>
            </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStaticData?.attendance}</div>
            <p className="text-xs text-muted-foreground">Bản ghi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Có mặt</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{attendanceStaticData?.attend}</div>
            <p className="text-xs text-muted-foreground">Bản ghi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vắng mặt</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{attendanceStaticData?.absentWithoutLeave}</div>
            <p className="text-xs text-muted-foreground">Bản ghi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nghỉ phép</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{attendanceStaticData?.absentWithLeave}</div>
            <p className="text-xs text-muted-foreground">Bản ghi</p>
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
          <div className="grid gap-4 md:grid-cols-4">
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
                  <SelectItem value="Attended">Có mặt</SelectItem>
                  <SelectItem value="AbsentWithoutLeave">Vắng mặt</SelectItem>
                  <SelectItem value="AbsentWithLeave">Nghỉ phép</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterDay">Ngày (1-31)</Label>
              <Select value={filterDay} onValueChange={(value) => setFilterDay(value)}>
                <SelectTrigger id="filterDay">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Array.from({ length: 31 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterMonthYear">Tháng & Năm</Label>
              <Input
                id="filterMonthYear"
                type="month"
                value={filterMonthYear}
                onChange={(e) => setFilterMonthYear(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
          <CardHeader>
          <CardTitle>Danh sách chấm công ({pagedData?.totalCount ?? filteredAttendances.length})</CardTitle>
          <CardDescription>
            {error || (!pagedData?.items && items.length === 0)
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
                  {/* <TableHead>Chức vụ</TableHead> */}
                  <TableHead>Ngày</TableHead>
                  <TableHead>Giờ vào</TableHead>
                  <TableHead>Giờ ra</TableHead>
                  <TableHead>Giờ làm</TableHead>
                  <TableHead>Giờ OT</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Trạng thái phê duyệt</TableHead>
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
                      {/* <TableCell className="text-muted-foreground">{attendance.employeeRole}</TableCell> */}
                      <TableCell>{attendance.workDate == null ? "" : format(new Date(attendance.workDate), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{attendance.checkIn || "-"}</TableCell>
                      <TableCell>{attendance.checkOut || "-"}</TableCell>
                      <TableCell>{calcWorkingHours(attendance.checkIn, attendance.checkOut)}</TableCell>
                      <TableCell>{attendance.overtimeHours}</TableCell>
                      <TableCell>
                        <StatusBadge status={attendance.status} />
                      </TableCell>
                      <TableCell>
                        <ApprovalBadge value={(attendance as any).isApproved ?? (attendance as any).IsApproved} />
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
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(attendance.attendanceId)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Load more */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {items.length === 0 ? 0 : 1} - {items.length} của {totalItems}
            </div>

            <div className="flex items-center gap-2">
              <div>
                {pageIndex < totalPages ? (
                  <Button size="sm" onClick={() => setPageIndex((p) => p + 1)} disabled={isFetching}>
                    {isFetching ? "Đang tải..." : "Xem thêm"}
                  </Button>
                ) : (
                  <div className="text-sm text-muted-foreground">Đã hết dữ liệu</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Hiển thị</label>
                <select value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value))} className="border rounded p-1 text-sm">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
              </div>
            </div>
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
                  {employeesData?.items?.map((emp) => (
                    <SelectItem key={emp.employeeId} value={emp.employeeId.toString()}>
                      {emp.fullName}
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
                  <SelectItem value="Attended">Có mặt</SelectItem>
                  <SelectItem value="AbsentWithoutLeave">Vắng mặt</SelectItem>
                  <SelectItem value="AbsentWithLeave">Nghỉ phép</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isApproved">Trạng thái phê duyệt</Label>
              <Select
                value={formData.isApproved?.toString()}
                onValueChange={(value) => setFormData({ ...formData, isApproved: value })}
              >
                <SelectTrigger id="isApproved">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved">Phê duyệt</SelectItem>
                  <SelectItem value="Pending">Đang chờ</SelectItem>
                  <SelectItem value="Aborted">Hủy</SelectItem>
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

      {/* Upload TXT Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload file TXT chấm công</DialogTitle>
            <DialogDescription>Thả file .txt vào ô bên dưới hoặc chọn file để upload.</DialogDescription>
          </DialogHeader>

          <div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const f = e.dataTransfer?.files?.[0] ?? null
                if (f) setUploadFile(f)
              }}
              className="border-dashed border-2 border-gray-300 rounded p-6 text-center cursor-pointer"
            >
              <p className="text-sm text-muted-foreground">Kéo thả file .txt vào đây</p>
              <p className="text-xs text-muted-foreground mt-2">{uploadFile ? uploadFile.name : "Chưa có file"}</p>
              <div className="mt-3">
                <input id="upload-file-input" type="file" accept=".txt" onChange={handleFileChange} className="hidden" />
                <label htmlFor="upload-file-input" className="underline text-sm cursor-pointer">Chọn file</label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleUpload} disabled={!uploadFile}>{isFetching ? "Đang tải..." : "Gửi lên"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
