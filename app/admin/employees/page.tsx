"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus, Pencil, Lock, Unlock } from "lucide-react"
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto } from "@/lib/types/api"
import { useEmployees, useCreateEmployee, useUpdateEmployee, useToggleEmployeeBan } from "@/lib/hooks/use-employees"

// Employee type mapping
const EMPLOYEE_TYPES = [
  { id: 11, name: "Admin" },
  { id: 12, name: "Quản lý" },
  { id: 13, name: "Lễ tân" },
  { id: 14, name: "Nhân viên phục vụ" },
  { id: 15, name: "Kế toán" },
]

export default function EmployeesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState<string>("all")

  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(10)

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    hireDate: new Date().toISOString().split("T")[0],
    employeeTypeId: 13,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data, isLoading } = useEmployees({
    PageIndex: currentPage,
    PageSize: pageSize,
    Search: searchTerm || undefined,
    EmployeeTypeId: employeeTypeFilter !== "all" ? Number.parseInt(employeeTypeFilter) : undefined,
  })

  const createMutation = useCreateEmployee()
  const updateMutation = useUpdateEmployee()
  const toggleBanMutation = useToggleEmployeeBan()

  const employees = data?.items || []
  const totalPages = data?.totalPages || 1
  const totalRecords = data?.totalCount || 0

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0)
  }, [searchTerm, employeeTypeFilter])

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee)
      setFormData({
        username: "",
        email: "",
        password: "",
        fullName: employee.fullName,
        phoneNumber: employee.phoneNumber,
        employeeTypeId: employee.employeeTypeId,
        hireDate: employee.hireDate.split("T")[0],
      })
    } else {
      setEditingEmployee(null)
      setFormData({
        username: "",
        email: "",
        password: "",
        fullName: "",
        phoneNumber: "",
        employeeTypeId: 13,
        hireDate: new Date().toISOString().split("T")[0],
      })
    }
    setErrors({})
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingEmployee(null)
    setFormData({
      username: "",
      email: "",
      password: "",
      fullName: "",
      phoneNumber: "",
      employeeTypeId: 13,
      hireDate: new Date().toISOString().split("T")[0],
    })
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!editingEmployee) {
      if (!formData.username.trim()) {
        newErrors.username = "Vui lòng nhập tên đăng nhập"
      }

      if (!formData.email.trim()) {
        newErrors.email = "Vui lòng nhập email"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Email không hợp lệ"
      }

      if (!formData.password.trim()) {
        newErrors.password = "Vui lòng nhập mật khẩu"
      } else if (formData.password.length < 6) {
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
      }
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên"
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại"
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ"
    }

    if (!formData.hireDate) {
      newErrors.hireDate = "Vui lòng chọn ngày tuyển dụng"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const hireDate = new Date(formData.hireDate)
    // Format hireDate to "2025-10-27" format string
    const hireDateDto = hireDate.toISOString().split("T")[0]

    if (editingEmployee) {
      const updateDto: UpdateEmployeeDto = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        employeeTypeId: formData.employeeTypeId,
        hireDate: hireDateDto,
      }

      updateMutation.mutate(
        { id: editingEmployee.employeeId, data: updateDto },
        {
          onSuccess: () => {
            handleCloseModal()
          },
        },
      )
    } else {
      const createDto: CreateEmployeeDto = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        employeeTypeId: formData.employeeTypeId,
        hireDate: hireDateDto,
      }

      createMutation.mutate(createDto, {
        onSuccess: () => {
          handleCloseModal()
        },
      })
    }
  }

  const handleToggleBan = async (employeeId: number) => {
    if (confirm("Bạn có chắc chắn muốn khóa/mở khóa tài khoản nhân viên này?")) {
      toggleBanMutation.mutate(employeeId)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getEmployeeTypeName = (typeId: number) => {
    return EMPLOYEE_TYPES.find((t) => t.id === typeId)?.name || "Không xác định"
  }

  const getEmployeeTypeBadge = (typeId: number) => {
    const colors: Record<number, string> = {
      11: "bg-red-100 text-red-800",
      12: "bg-[#00008b]/10 text-[#00008b]",
      13: "bg-blue-100 text-blue-800",
      14: "bg-green-100 text-green-800",
      15: "bg-amber-100 text-amber-800",
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          colors[typeId] || "bg-slate-100 text-slate-800"
        }`}
      >
        {getEmployeeTypeName(typeId)}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý nhân viên</h1>
          <p className="text-sm text-slate-600 mt-1">
            Tổng: <span className="font-semibold text-slate-900">{totalRecords}</span> nhân viên
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-[#00008b] to-[#ffd700] hover:from-[#00006b] hover:to-[#e6c200] text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Thêm nhân viên
        </Button>
      </div>

      <Card className="border-0 shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <Input
                type="text"
                placeholder="Tìm kiếm nhân viên..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 h-9"
              />
            </div>

            <Select
              value={employeeTypeFilter}
              onValueChange={(value) => {
                setEmployeeTypeFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-48 h-9">
                <SelectValue placeholder="Loại nhân viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {EMPLOYEE_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card className="border-0 shadow">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#ff5e7e]" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Không tìm thấy nhân viên nào</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Họ tên</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Số điện thoại</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Chức vụ</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Ngày tuyển dụng</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Ngày tạo</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr
                        key={employee.employeeId}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm font-medium text-slate-900">#{employee.employeeId}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{employee.fullName}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">{employee.phoneNumber}</td>
                        <td className="py-3 px-4">{getEmployeeTypeBadge(employee.employeeTypeId)}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{formatDate(employee.hireDate)}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{formatDate(employee.createdAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(employee)}
                              className="p-1.5 text-slate-600 hover:text-[#14b8a6] hover:bg-[#14b8a6]/10 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleBan(employee.employeeId)}
                              className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Khóa/Mở khóa"
                              disabled={toggleBanMutation.isPending}
                            >
                              {employee.terminationDate ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                  <div className="text-sm text-slate-600">
                    Trang {currentPage + 1} / {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage >= totalPages - 1}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {!editingEmployee && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">
                      Tên đăng nhập <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      className={errors.username ? "border-red-500" : ""}
                      placeholder="VD: nguyenvana"
                    />
                    {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "border-red-500" : ""}
                      placeholder="VD: nguyenvana@example.com"
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Mật khẩu <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? "border-red-500" : ""}
                      placeholder="Tối thiểu 6 ký tự"
                    />
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Họ tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? "border-red-500" : ""}
                  placeholder="VD: Nguyễn Văn A"
                />
                {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={errors.phoneNumber ? "border-red-500" : ""}
                  placeholder="VD: 0901234567"
                />
                {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeTypeId">Chức vụ</Label>
                  <Select
                    value={formData.employeeTypeId.toString()}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, employeeTypeId: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hireDate">
                    Ngày tuyển dụng <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="hireDate"
                    name="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={handleChange}
                    className={errors.hireDate ? "border-red-500" : ""}
                  />
                  {errors.hireDate && <p className="text-xs text-red-500">{errors.hireDate}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#00008b] to-[#ffd700] hover:from-[#00006b] hover:to-[#e6c200] text-white"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : editingEmployee ? (
                    "Cập nhật"
                  ) : (
                    "Thêm mới"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
