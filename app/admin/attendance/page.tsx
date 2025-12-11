"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  useAttendance,
  useCreateAttendance,
  useUpdateAttendance,
  useDeleteAttendance,
  useSyncAttendance,
} from "@/lib/hooks/use-attendance"
import { useEmployees } from "@/lib/hooks/use-employees"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import type { AttendanceRecord, UpdateAttendanceDto } from "@/lib/types/api"

const formatTime = (dateString: string | undefined) => {
  if (!dateString) return "-"
  return format(new Date(dateString), "HH:mm", { locale: vi })
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-"
  return format(new Date(dateString), "dd/MM/yyyy", { locale: vi })
}

const formatDurationHHMM = (a: Date | string | undefined, b: Date | string | undefined): string => {
  if (!a || !b) return "-"
  const d1 = typeof a === "string" ? new Date(a) : a
  const d2 = typeof b === "string" ? new Date(b) : b
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return "-"
  const diffMs = Math.abs(d2.getTime() - d1.getTime())
  const totalMinutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

const getDuration = (a: Date | string | undefined, b: Date | string | undefined): number => {
  if (!a || !b) return 0
  const d1 = typeof a === "string" ? new Date(a) : a
  const d2 = typeof b === "string" ? new Date(b) : b
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0
  const diffMs = Math.abs(d2.getTime() - d1.getTime())
  const totalMinutes = Math.floor(diffMs / 60000)
  const hours = totalMinutes / 60
  const minutes = totalMinutes % 60
  return hours;
}

export default function AttendancePage() {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedEmployee, setSelectedEmployee] = useState<number | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState("")
  const [pageIndex, setPageIndex] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)

  const { data: attendanceData, isLoading: attendanceLoading } = useAttendance({
    PageIndex: pageIndex,
    PageSize: 20,
    Search: searchTerm,
    SortBy: "ShiftDate",
    SortDesc: true,
    EmployeeId: selectedEmployee,
    Month: selectedMonth,
    Year: selectedYear,
  })

  const { data: employeesData } = useEmployees({
    PageIndex: 1,
    PageSize: 50,
    Search: "",
    SortBy: "FullName",
    SortDesc: false,
  })

  const createMutation = useCreateAttendance()
  const updateMutation = useUpdateAttendance()
  const deleteMutation = useDeleteAttendance()
  const syncMutation = useSyncAttendance()

  const handleSync = () => {
    syncMutation.mutate()
  }

  const handleEdit = (record: AttendanceRecord) => {
    setSelectedRecord(record)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa bản ghi chấm công này?")) {
      deleteMutation.mutate(id)
    }
  }



  const getLateAttendStatusBadge = (status: string | undefined) => {
    if (status === "0") {
      return <Badge className="bg-green-500">Attend</Badge>
    } else if (status === "1") {
      return <Badge className="bg-yellow-500">AbsentWithoutLeave</Badge>
    } else if (status === "2") {
      return <Badge className="bg-red-500">AbsentWithLeave</Badge>
    }
  }

  const getLateApproveStatusBadge = (aprovalStatus: string | undefined) => {
    if (aprovalStatus === "0") {
      return <Badge className="bg-green-500">Duyệt</Badge>
    } else if (aprovalStatus === "1") {
      return <Badge className="bg-yellow-500">Chờ duyệt</Badge>
    } else if (aprovalStatus === "2") {
      return <Badge className="bg-red-500">Hủy</Badge>
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý chấm công</h1>
          <p className="text-slate-600 mt-1">Theo dõi và quản lý bản ghi chấm công nhân viên</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleSync}
            disabled={syncMutation.isPending}
            variant="outline"
            className="gap-2 bg-transparent"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Đồng bộ từ máy
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-[#00008b] to-[#ffd700] hover:from-[#00006b] hover:to-[#e6c200]"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm chấm công
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* <div>
            <Label>Tìm kiếm</Label>
            <Input placeholder="Tên nhân viên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div> */}
          <div>
            <Label>Nhân viên</Label>
            <Select
              value={selectedEmployee?.toString() || undefined}
              onValueChange={(value) => setSelectedEmployee(value ? Number(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="all">Tất cả nhân viên</SelectItem> */}
                {employeesData?.items.map((emp) => (
                  <SelectItem key={emp.employeeId} value={emp.employeeId.toString()}>
                    {emp.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tháng</Label>
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    Tháng {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Năm</Label>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {attendanceLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Mã máy</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Giờ vào</TableHead>
                  <TableHead>Giờ ra</TableHead>
                  <TableHead className="text-right">Giờ làm</TableHead>
                  {/* <TableHead className="text-right">Giờ thường</TableHead> */}
                  <TableHead className="text-right">Giờ OT</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Trạng thái phê duyệt</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData?.items.map((record) => (
                  <TableRow key={record.attendanceId}>
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell className="font-mono text-sm">{record.deviceEmployeeId || "-"}</TableCell>
                    <TableCell>{formatDate(record.checkIn)}</TableCell>
                    <TableCell>{formatTime(record.checkIn)}</TableCell>
                    <TableCell>{formatTime(record.checkOut)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatDurationHHMM(record.checkIn, record.checkOut)}
                    </TableCell>
                    {/* <TableCell className="text-right">
                      {record.normalHours.toFixed(2)}h
                    </TableCell> */}
                    <TableCell className="text-right text-orange-600 font-medium">
                      {record.overtimeHours?.toFixed(2)}h
                    </TableCell>
                    <TableCell>
                      {getLateAttendStatusBadge(record.status)}
                    </TableCell>
                    <TableCell>
                      {getLateApproveStatusBadge(record.status)}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">{record.notes || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(record)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Button>
                        {/* <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(record.attendanceId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </Button> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {attendanceData && attendanceData.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Hiển thị {attendanceData.items.length} / {attendanceData.totalCount} bản ghi
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                    disabled={pageIndex === 0}
                  >
                    Trước
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPageIndex(pageIndex + 1)}
                    disabled={pageIndex >= attendanceData.totalPages - 1}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Dialog */}
      <EditAttendanceDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        record={selectedRecord}
        onSubmit={(data) => {
          if (selectedRecord) {
            updateMutation.mutate({ data })
            setIsEditDialogOpen(false)
          }
        }}
      />

       {/* Add Dialog */}
      {/* <CreateAttendanceDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        record={selectedRecord}
        onSubmit={(data) => {
          if (selectedRecord) {
            updateMutation.mutate({ data })
            setIsEditDialogOpen(false)
          }
        }}
      /> */}
    </div>
  )
}

function EditAttendanceDialog({
  open,
  onOpenChange,
  record,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: AttendanceRecord | null
  onSubmit: (data: AttendanceRecord) => void
}) {
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [notes, setNotes] = useState("")
  const [attendStatus, setAttendStatus] = useState<string | undefined>()
  const [approvalStatus, setApprovalStatus] = useState<string | undefined>()
  const [overtimeHours, setOvertimeHours] = useState<number>(0)


  // initialize fields when `record` changes
  useEffect(() => {
    if (record) {
      setCheckIn(record.checkIn ? format(new Date(record.checkIn), "HH:mm") : "")
      setCheckOut(record.checkOut ? format(new Date(record.checkOut), "HH:mm") : "")
      setNotes(record.notes || "")
      setApprovalStatus(record.status)
      setAttendStatus(record.IsApproved)
      setOvertimeHours(record.overtimeHours || 0)
    }
  }, [record])

  const handleSubmit = () => {
    const updateData: AttendanceRecord = {
      ...record!,
    }

    // if (checkIn && record) {
    //   const [hours, minutes] = checkIn.split(":")
    //   const checkInDate = new Date(record.checkIn)
    //   checkInDate.setHours(Number(hours), Number(minutes), 0)
    //   updateData.checkIn = checkInDate.toISOString()
    // }

    // if (checkOut && record) {
    //   const [hours, minutes] = checkOut.split(":")
    //   const checkOutDate = new Date(record.checkOut)
    //   checkOutDate.setHours(Number(hours), Number(minutes), 0)
    //   updateData.checkOut = checkOutDate.toISOString()
    // }

    if (notes) {
      updateData.notes = notes
    }

    if (approvalStatus) {
      updateData.status = approvalStatus
    }

    if (overtimeHours) {
      updateData.overtimeHours = overtimeHours
    }
    onSubmit(updateData)
  }

  console.log("Record in EditAttendanceDialog:", record)
  console.log("Status:", status)


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa chấm công</DialogTitle>
          <DialogDescription>Cập nhật thông tin giờ vào, giờ ra cho nhân viên {record?.employeeName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Giờ vào</Label>
            <Input type="time" value={formatTime(record?.checkIn)} disabled onChange={(e) => setCheckIn(e.target.value)} />
          </div>
          <div>
            <Label>Giờ ra</Label>
            <Input type="time" value={formatTime(record?.checkOut)} disabled onChange={(e) => setCheckOut(e.target.value)} />
          </div>
          <div>
            <Label>Giờ OT</Label>
            <Input type="number" max={getDuration(record?.checkIn, record?.checkOut)} value={overtimeHours} onChange={(e) => setOvertimeHours(Number.parseFloat(e.target.value))} />
          </div>
          <div>
            <Select value={approvalStatus} onValueChange={(v) => setApprovalStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Duyệt</SelectItem>
                <SelectItem value="1">Chờ duyệt</SelectItem>
                <SelectItem value="2">Hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Ghi chú</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ghi chú..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// function CreateAttendanceDialog({
//   open,
//   onOpenChange,
//   record,
//   onSubmit,
// }: {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   record: AttendanceRecord | null,
//   onSubmit: (data: AttendanceRecord) => Promise<void>
// }) {
//   const today = new Date()
//   const pad2 = (v: number) => String(v).padStart(2, "0")

//   const [checkInTime, setCheckInTime] = useState<string>("08:00")
//   const [checkOutTime, setCheckOutTime] = useState<string>("")
//   const [deviceEmployeeId, setDeviceEmployeeId] = useState<string>("")
//   const [notes, setNotes] = useState<string>("")
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   // reset when opened/closed
//   useEffect(() => {
//     if (open) {
//       setEmployeeId(employees[0]?.employeeId)
//       setCheckInTime("08:00")
//       setCheckOutTime("")
//       setDeviceEmployeeId("")
//       setNotes("")
//       setIsSubmitting(false)
//     }
//   }, [open, employees])



//   const handleSubmit = async () => {
//     if (!employeeId) {
//       alert("Vui lòng chọn nhân viên.")
//       return
//     }
//     if (!checkInTime) {
//       alert("Vui lòng nhập giờ vào.")
//       return
//     }
//     setIsSubmitting(true)
    
//     const payload = {
//       employeeId,
//       deviceEmployeeId: deviceEmployeeId || undefined,
//       checkIn: checkInTime,
//       checkOut: checkOutTime,
//       notes: notes || undefined,
//     }

//     try {
//       await onCreate(payload)
//       onOpenChange(false)
//     } catch (err) {
//       console.error("Create attendance failed", err)
//       // (optional) show toast
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Thêm chấm công</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4">
//           <div>
//             <Label>Nhân viên</Label>
//             <Select value={employeeId?.toString() || ""} onValueChange={(v) => setEmployeeId(Number(v))}>
//               <SelectTrigger><SelectValue placeholder="Chọn nhân viên" /></SelectTrigger>
//               <SelectContent>
//                 {employees.map((e) => (
//                   <SelectItem key={e.employeeId} value={e.employeeId.toString()}>
//                     {e.fullName}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>


//           <div>
//             <Label>Giờ vào</Label>
//             <Input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} />
//           </div>

//           <div>
//             <Label>Giờ ra (tuỳ chọn)</Label>
//             <Input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} />
//           </div>

//           <div>
//             <Label>Mã thiết bị (Device ID)</Label>
//             <Input value={deviceEmployeeId} onChange={(e) => setDeviceEmployeeId(e.target.value)} placeholder="Mã nhân viên trên máy chấm công" />
//           </div>

//           <div>
//             <Label>Ghi chú</Label>
//             <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ghi chú..." />
//           </div>
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
//             Hủy
//           </Button>
//           <Button onClick={handleSubmit} disabled={isSubmitting}>
//             {isSubmitting ? "Đang tạo..." : "Tạo chấm công"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }


