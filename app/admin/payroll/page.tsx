"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Button } from "@/components/ui/button"
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
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePayroll, useApprovePayroll, useDisbursePayroll, useUpdateSalaryInfo, useCaculateSalary } from "@/lib/hooks/use-payroll"
import { useEmployees } from "@/lib/hooks/use-employees"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import type { PayrollDisbursement, SalaryInfo } from "@/lib/types/api"
import { useSalaryInfos } from "@/lib/hooks/use-salary-info"
import { Download, Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function PayrollPage() {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedEmployee, setSelectedEmployee] = useState<number | undefined>(undefined)
  const [pageIndex, setPageIndex] = useState(0)
  const [isCalculateDialogOpen, setIsCalculateDialogOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSalaryInfo, setEditingSalaryInfo] = useState<SalaryInfo | null>(null)
  const [formData, setFormData] = useState<{
    employeeId: number
    salaryInfoId: number
    baseSalary: number
    yearBonus: number
    allowance: number
    employeeName: string
  }>({
    employeeId: 0,
    salaryInfoId: 0,
    baseSalary: 0,
    yearBonus: 0,
    allowance: 0,
    employeeName: "",
  })
  const [dowloadSalaryInfo, setDowloadSalaryInfo] = useState<SalaryInfo | null>()

  const { data: payrollData, isLoading: isLoadingPayroll, refetch: refetchPayroll } = useSalaryInfos({
    PageIndex: pageIndex,
    PageSize: 20,
    EmployeeId: selectedEmployee,
    Year: selectedYear,
    SortBy: "CreatedAt",
    SortDesc: true,
  })

  const { data: fileExel, isLoading: isLoadingFile, refetch: refetchFile } = useCaculateSalary({
    employeeId: dowloadSalaryInfo?.employeeId,
    year: selectedYear,
  })

  useEffect(() => {
    try {
      refetchFile?.()
    } catch (e) {
      // ignore
    }

  }, [dowloadSalaryInfo])

  useEffect(() => {

    console.log("fileExel", fileExel)
    console.log("dowloadSalaryInfo", dowloadSalaryInfo)
    if (fileExel && dowloadSalaryInfo) {
      console.log("fileExel", fileExel)
      const blob = new Blob([fileExel])
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = "payroll.xlsx" // hoặc lấy từ header
      document.body.appendChild(link)
      link.click()

      link.remove()
      window.URL.revokeObjectURL(url)
    }
  }, [fileExel])

  useEffect(() => {
    // reset to first page when filters change and refetch data
    setPageIndex(0)
    try {
      refetchPayroll?.()
    } catch (e) {
      // ignore
    }

  }, [selectedEmployee, selectedYear])

  const { data: employeesData } = useEmployees({
    PageIndex: 1,
    PageSize: 50,
    Search: "",
    SortBy: "FullName",
    SortDesc: false,
  })

  const updateMutation = useUpdateSalaryInfo()



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const handleOpenDialog = (salaryInfo?: SalaryInfo) => {
    if (salaryInfo) {
      console.log("editing salaryInfo:", salaryInfo)
      setEditingSalaryInfo(salaryInfo)
      setFormData({
        employeeId: salaryInfo.employeeId,
        salaryInfoId: salaryInfo.salaryInfoId,
        baseSalary: (salaryInfo as any).baseSalary ?? (salaryInfo as any).BaseSalary ?? 0,
        yearBonus: (salaryInfo as any).yearBonus ?? (salaryInfo as any).YearBonus ?? 0,
        allowance: (salaryInfo as any).allowance ?? (salaryInfo as any).Allowance ?? 0,
        employeeName: salaryInfo.employeeName,
      })
    } else {
      setEditingSalaryInfo(null)
      setFormData({
        employeeId: 0,
        salaryInfoId: 0,
        baseSalary: 0,
        yearBonus: 0,
        allowance: 0,
        employeeName: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingSalaryInfo(null)
  }

  const handleSubmit = () => {
    if (editingSalaryInfo) {
      const updateData: SalaryInfo = {
        salaryInfoId: editingSalaryInfo.salaryInfoId,
        ...editingSalaryInfo,
        baseSalary: formData.baseSalary,
        yearBonus: formData.yearBonus,
        allowance: formData.allowance,
      }
      updateMutation.mutate(updateData, {
        onSuccess: () => handleCloseDialog(),
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý lương</h1>
          <p className="text-slate-600 mt-1">Tính toán và quản lý lương nhân viên</p>
        </div>
        {/* <Button
          onClick={() => setIsCalculateDialogOpen(true)}
          className="bg-gradient-to-r from-[#00008b] to-[#ffd700] hover:from-[#00006b] hover:to-[#e6c200]"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          Tính lương
        </Button> */}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Nhân viên</Label>
            <Select
              value={selectedEmployee?.toString() || "all"}
              onValueChange={(value) => setSelectedEmployee(value === "all" ? undefined : Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả nhân viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhân viên</SelectItem>
                {employeesData?.items.map((emp) => (
                  <SelectItem key={emp.employeeId} value={emp.employeeId.toString()}>
                    {emp.fullName}
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
        {isLoadingPayroll ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead className="text-right">Năm</TableHead>
                  <TableHead className="text-right">Lương cơ bản</TableHead>
                  <TableHead className="text-right">Thưởng năm</TableHead>
                  <TableHead className="text-right">Phụ cấp</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>

                </TableRow>
              </TableHeader>

              <TableBody>
                {payrollData?.items.map((payroll: SalaryInfo) => (
                  <TableRow key={payroll.salaryInfoId}>
                    <TableCell className="font-medium">{payroll.employeeName}</TableCell>
                    <TableCell className="text-right">{(payroll as any).year ?? (payroll as any).Year}</TableCell>
                    <TableCell className="text-right">{formatCurrency((payroll as any).baseSalary ?? (payroll as any).BaseSalary ?? 0)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency((payroll as any).yearBonus ?? (payroll as any).YearBonus ?? 0)}</TableCell>
                    <TableCell className="text-right text-blue-600">{formatCurrency((payroll as any).allowance ?? (payroll as any).Allowance ?? 0)}</TableCell>
                    <TableCell>{format(new Date((payroll as any).createdAt ?? (payroll as any).CreatedAt ?? ""), "dd/MM/yyyy", { locale: vi })}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDowloadSalaryInfo(payroll)
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(payroll)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {payrollData && payrollData.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Hiển thị {payrollData.items.length} / {payrollData.totalCount} bản ghi
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
                    disabled={pageIndex >= payrollData.totalPages - 1}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>



      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bảng lương</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin bảng lương nhân viên
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Nhân viên {formData.employeeName}</Label>
              {/* <Select
                value={formData.employeeId.toString()}
                onValueChange={(value) => setFormData({ ...formData, employeeId: parseInt(value) })}
              >
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key={formData.employeeId} value={formData.employeeId.toString()}>
                      {formData.employeeName}
                    </SelectItem>
                </SelectContent>
              </Select> */}
            </div>

            <div className="space-y-2">
              <Label>Lương cơ bản</Label>
              <Input
                type="number"
                value={formData.baseSalary}
                onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Thưởng năm</Label>
              <Input
                type="number"
                value={formData.yearBonus}
                onChange={(e) => setFormData({ ...formData, yearBonus: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Phụ cấp</Label>
              <Input
                type="number"
                value={formData.allowance}
                onChange={(e) => setFormData({ ...formData, allowance: parseFloat(e.target.value) })}
              />
            </div>


          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={formData.employeeId === 0}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
