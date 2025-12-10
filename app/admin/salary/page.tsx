"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSalaryInfos, useCreateSalaryInfo, useUpdateSalaryInfo, useDeleteSalaryInfo } from "@/lib/hooks/use-salary-info"
import { useEmployees } from "@/lib/hooks/use-employees"
import type { SalaryInfo } from "@/lib/types/api"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
}

export default function SalaryInfoPage() {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [selectedEmployee, setSelectedEmployee] = useState<number | undefined>(undefined)
  const [search, setSearch] = useState("")
  const [pageIndex, setPageIndex] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<SalaryInfo | null>(null)

  const { data: salaryData, isLoading } = useSalaryInfos({
    PageIndex: pageIndex,
    PageSize: 20,
    EmployeeId: selectedEmployee,
    Year: selectedYear,
    Search: search,
    SortBy: "CreatedAt",
    SortDesc: true,
  })

  const { data: employees } = useEmployees({ PageIndex: 0, PageSize: 200, Search: "", SortBy: "FullName", SortDesc: false })

  const createMutation = useCreateSalaryInfo()
  const updateMutation = useUpdateSalaryInfo()
  const deleteMutation = useDeleteSalaryInfo()

  const openEdit = (r: SalaryInfo) => setEditRecord(r)

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa bản ghi lương này?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý lương cơ bản</h1>
          <p className="text-slate-600 mt-1">Thiết lập lương cơ bản, phụ cấp cho từng nhân viên theo năm</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa]" onClick={() => setIsCreateOpen(true)}>
            Thêm lương
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Nhân viên</Label>
            <Select value={selectedEmployee?.toString() || "all"} onValueChange={(v) => setSelectedEmployee(v === "all" ? undefined : Number(v))}>
              <SelectTrigger><SelectValue placeholder="Tất cả nhân viên" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhân viên</SelectItem>
                {employees?.items.map(emp => <SelectItem key={emp.employeeId} value={emp.employeeId.toString()}>{emp.fullName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Năm</Label>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tìm kiếm</Label>
            <Input placeholder="Tên nhân viên..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {isLoading ? (
          <div className="p-8 text-center">Đang tải...</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead className="text-right">Năm</TableHead>
                  <TableHead className="text-right">Lương cơ bản</TableHead>
                  <TableHead className="text-right">Phụ cấp</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryData?.items.map(s => (
                  <TableRow key={s.salaryInfoId}>
                    <TableCell className="font-medium">{s.employeeName || "-"}</TableCell>
                    <TableCell className="text-right">{s.year}</TableCell>
                    <TableCell className="text-right">{formatCurrency(s.baseSalary)}</TableCell>
                    <TableCell className="text-right">{formatCurrency((s.bonus || 0) + (s.allowance || 0))}</TableCell>
                    <TableCell>{s.createdAt ? new Date(s.createdAt).toLocaleDateString("vi-VN") : "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>Sửa</Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(s.salaryInfoId as number)}>Xóa</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {salaryData && salaryData.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">Hiển thị {salaryData.items.length} / {salaryData.totalCount} bản ghi</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPageIndex(Math.max(0, pageIndex - 1))} disabled={pageIndex === 0}>Trước</Button>
                  <Button size="sm" variant="outline" onClick={() => setPageIndex(pageIndex + 1)} disabled={pageIndex >= salaryData.totalPages - 1}>Sau</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <SalaryInfoDialog
        open={isCreateOpen || !!editRecord}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false)
            setEditRecord(null)
          }
        }}
        employees={employees?.items || []}
        record={editRecord}
        onCreate={(data: SalaryInfo) => {
          createMutation.mutate(data)
          setIsCreateOpen(false)
        }}
        onUpdate={(id: number, data: SalaryInfo) => {
          updateMutation.mutate({ id, data })
          setEditRecord(null)
        }}
      />
    </div>
  )
}

function SalaryInfoDialog({
  open,
  onOpenChange,
  employees,
  record,
  onCreate,
  onUpdate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: { employeeId: number; fullName: string }[]
  record?: SalaryInfo | null
  onCreate: (data: SalaryInfo) => void
  onUpdate: (id: number, data: SalaryInfo) => void
}) {
  const [employeeId, setEmployeeId] = useState(record?.employeeId || (employees[0]?.employeeId ?? 0))
  const [year, setYear] = useState<number>(record?.year || new Date().getFullYear())
  const [baseSalary, setBaseSalary] = useState<string>((record?.baseSalary ?? 0).toString())
  const [bonus, setBonus] = useState<string>((record?.bonus ?? 0).toString())
  const [allowance, setAllowance] = useState<string>((record?.allowance ?? 0).toString())

  useState(() => {
    if (record) {
      setEmployeeId(record.employeeId)
      setYear(record.year)
      setBaseSalary(record.baseSalary.toString())
      setBonus((record.bonus ?? 0).toString())
      setAllowance((record.allowance ?? 0).toString())
    }
  })

  const handleSave = () => {
    const payload = {
      employeeId,
      year,
      baseSalary: Number(baseSalary || 0),
      bonus: Number(bonus || 0) || undefined,
      allowance: Number(allowance || 0) || undefined,
    }

    if (record) {
      onUpdate(record.salaryInfoId as number, payload)
    } else {
      onCreate(payload)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={!!open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{record ? "Chỉnh sửa lương" : "Thêm lương"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nhân viên</Label>
            <Select value={employeeId?.toString() || ""} onValueChange={(v) => setEmployeeId(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {employees.map(e => <SelectItem key={e.employeeId} value={e.employeeId.toString()}>{e.fullName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Năm</Label>
            <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </div>

          <div>
            <Label>Lương cơ bản</Label>
            <Input value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} />
          </div>

          <div>
            <Label>Bonus</Label>
            <Input value={bonus} onChange={(e) => setBonus(e.target.value)} />
          </div>

          <div>
            <Label>Allowance</Label>
            <Input value={allowance} onChange={(e) => setAllowance(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSave}>{record ? "Lưu" : "Tạo"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}