"use client"

import { useState } from "react"
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
import { usePayroll, useCalculatePayroll, useApprovePayroll, useDisbursePayroll } from "@/lib/hooks/use-payroll"
import { useEmployees } from "@/lib/hooks/use-employees"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import type { PayrollDisbursement } from "@/lib/types/api"

export default function PayrollPage() {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedEmployee, setSelectedEmployee] = useState<number | undefined>(undefined)
  const [pageIndex, setPageIndex] = useState(0)
  const [isCalculateDialogOpen, setIsCalculateDialogOpen] = useState(false)
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollDisbursement | null>(null)

  const { data: payrollData, isLoading: isLoadingPayroll } = usePayroll({
    PageIndex: pageIndex,
    PageSize: 20,
    Search: "",
    SortBy: "CreatedAt",
    SortDesc: true,
    EmployeeId: selectedEmployee,
    Month: selectedMonth,
    Year: selectedYear,
  })

  const { data: calculationData, isLoading: isCalculating } = useCalculatePayroll({
    employeeId: selectedEmployee,
    month: selectedMonth,
    year: selectedYear,
  })

  const { data: employeesData } = useEmployees({
    PageIndex: 1,
    PageSize: 50,
    Search: "",
    SortBy: "FullName",
    SortDesc: false,
  })

  const approveMutation = useApprovePayroll()
  const disburseMutation = useDisbursePayroll()

  const handleApprove = (payroll: PayrollDisbursement) => {
    if (confirm(`Xác nhận duyệt lương cho ${payroll.employeeName}?`)) {
      approveMutation.mutate({ payrollDisbursementId: payroll.payrollDisbursementId })
    }
  }

  const handleDisburse = (payroll: PayrollDisbursement) => {
    if (confirm(`Xác nhận đã giải ngân lương cho ${payroll.employeeName}?`)) {
      disburseMutation.mutate({
        payrollDisbursementId: payroll.payrollDisbursementId,
        disbursedAmount: payroll.totalAmount,
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const getStatusBadge = (statusName: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      "Chờ duyệt": { color: "bg-yellow-500", label: "Chờ duyệt" },
      "Đã duyệt": { color: "bg-blue-500", label: "Đã duyệt" },
      "Đã giải ngân": { color: "bg-green-500", label: "Đã giải ngân" },
    }

    const status = statusMap[statusName] || { color: "bg-gray-500", label: statusName }
    return <Badge className={status.color}>{status.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý lương</h1>
          <p className="text-slate-600 mt-1">Tính toán và quản lý lương nhân viên</p>
        </div>
        <Button
          onClick={() => setIsCalculateDialogOpen(true)}
          className="bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] hover:opacity-90"
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
        </Button>
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

      {/* Summary Cards */}
      {calculationData && calculationData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Tổng nhân viên</CardDescription>
              <CardTitle className="text-3xl">{calculationData.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Tổng lương gộp</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {formatCurrency(calculationData.reduce((sum, item) => sum + item.totalGrossPay, 0))}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Tổng khấu trừ</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {formatCurrency(
                  calculationData.reduce((sum, item) => sum + item.taxDeduction + item.insuranceDeduction, 0),
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Tổng thực lĩnh</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {formatCurrency(calculationData.reduce((sum, item) => sum + item.netPay, 0))}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

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
                  <TableHead>Tháng/Năm</TableHead>
                  <TableHead className="text-right">Lương cơ bản</TableHead>
                  <TableHead className="text-right">Tổng lương</TableHead>
                  <TableHead className="text-right">Đã giải ngân</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollData?.items.map((payroll) => (
                  <TableRow key={payroll.payrollDisbursementId}>
                    <TableCell className="font-medium">{payroll.employeeName}</TableCell>
                    <TableCell>
                      {payroll.payrollMonth}/{payroll.payrollYear}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(payroll.baseSalary)}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatCurrency(payroll.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(payroll.disbursedAmount)}</TableCell>
                    <TableCell>{getStatusBadge(payroll.statusName)}</TableCell>
                    <TableCell>{format(new Date(payroll.createdAt), "dd/MM/yyyy", { locale: vi })}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {payroll.statusName === "Chờ duyệt" && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(payroll)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Duyệt
                          </Button>
                        )}
                        {payroll.statusName === "Đã duyệt" && (
                          <Button
                            size="sm"
                            onClick={() => handleDisburse(payroll)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Giải ngân
                          </Button>
                        )}
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

      {/* Calculate Dialog */}
      <Dialog open={isCalculateDialogOpen} onOpenChange={setIsCalculateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Tính lương tháng {selectedMonth}/{selectedYear}
            </DialogTitle>
            <DialogDescription>Xem trước bảng lương trước khi tạo phiếu lương</DialogDescription>
          </DialogHeader>

          {isCalculating ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : calculationData && calculationData.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhân viên</TableHead>
                    <TableHead className="text-right">Giờ làm</TableHead>
                    <TableHead className="text-right">Lương cơ bản</TableHead>
                    <TableHead className="text-right">Lương OT</TableHead>
                    <TableHead className="text-right">Khấu trừ</TableHead>
                    <TableHead className="text-right">Thực lĩnh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculationData.map((calc) => (
                    <TableRow key={calc.employeeId}>
                      <TableCell className="font-medium">{calc.employeeName}</TableCell>
                      <TableCell className="text-right">
                        {calc.totalNormalHours.toFixed(1)}h + {calc.totalOvertimeHours.toFixed(1)}h OT
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(calc.normalPay)}</TableCell>
                      <TableCell className="text-right text-orange-600">{formatCurrency(calc.overtimePay)}</TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(calc.taxDeduction + calc.insuranceDeduction)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(calc.netPay)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-600">Không có dữ liệu chấm công cho tháng này</div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCalculateDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
