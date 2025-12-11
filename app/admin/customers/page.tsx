"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCustomerDetails, useCustomers, useToggleCustomerBan } from "@/lib/hooks/use-customers"
import { ArrowUpDown, Eye, Loader2, Lock, Unlock, Search } from "lucide-react"

const formatCurrency = (value?: number | null) => {
  if (value === undefined || value === null) return "—"
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
}

const formatDate = (value?: string | null, withTime = false) => {
  if (!value) return "—"
  const date = new Date(value)
  return date.toLocaleString("vi-VN", withTime ? { hour12: false } : { hour12: false, dateStyle: "short" })
}

const getInitials = (name: string) => {
  if (!name) return "GU"
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function AdminCustomersPage() {
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "locked" | "active">("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [sortBy, setSortBy] = useState("CreatedAt")
  const [sortDesc, setSortDesc] = useState(true)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPageIndex(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading } = useCustomers({
    pageIndex,
    pageSize,
    search: debouncedSearch || undefined,
    isLocked: statusFilter === "all" ? undefined : statusFilter === "locked",
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    sortBy,
    sortDesc,
  })

  const customers = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  const { data: detailData, isLoading: isDetailLoading } = useCustomerDetails(selectedCustomerId || 0, detailOpen)
  const toggleBanMutation = useToggleCustomerBan()

  const handleOpenDetails = (customerId: number) => {
    setSelectedCustomerId(customerId)
    setDetailOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailOpen(false)
    setSelectedCustomerId(null)
  }

  const handleToggleBan = (customerId: number, isLocked: boolean) => {
    toggleBanMutation.mutate({
      customerId,
      isLocked: !isLocked,
    })
  }

  const currentSortLabel = useMemo(() => {
    switch (sortBy) {
      case "FullName":
        return "Tên khách hàng"
      case "TotalBookings":
        return "Số booking"
      case "TotalSpent":
        return "Tổng chi tiêu"
      case "LastBookingDate":
        return "Lần đặt gần nhất"
      default:
        return "Ngày tạo"
    }
  }, [sortBy])

  const detail = detailData || null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý khách hàng</h1>
          <p className="text-slate-600 mt-1">Tra cứu khách hàng, xem lịch sử đặt phòng và khoá/mở khoá tài khoản</p>
        </div>
        <div className="text-sm text-slate-500">Tổng khách hàng: {totalCount}</div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label className="text-sm text-slate-700">Tìm kiếm</Label>
              <div className="relative mt-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  className="pl-10"
                  placeholder="Tên, email, số điện thoại, CMND"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm text-slate-700">Trạng thái</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v as any)
                  setPageIndex(1)
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="locked">Đã khoá</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-slate-700">Sắp xếp</Label>
              <Select
                value={sortBy}
                onValueChange={(v) => {
                  setSortBy(v)
                  setPageIndex(1)
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Ngày tạo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CreatedAt">Ngày tạo</SelectItem>
                  <SelectItem value="FullName">Tên khách hàng</SelectItem>
                  <SelectItem value="TotalBookings">Số booking</SelectItem>
                  <SelectItem value="TotalSpent">Tổng chi tiêu</SelectItem>
                  <SelectItem value="LastBookingDate">Lần đặt gần nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm text-slate-700">Từ ngày</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value)
                  setPageIndex(1)
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-slate-700">Đến ngày</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value)
                  setPageIndex(1)
                }}
                className="mt-1"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSortDesc((prev) => !prev)}
                className="w-full"
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                {currentSortLabel} ({sortDesc ? "giảm dần" : "tăng dần"})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {isLoading ? (
          <div className="p-8 text-center text-slate-600 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang tải danh sách khách hàng...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-slate-600">Không có khách hàng nào phù hợp</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead className="text-right">Số booking</TableHead>
                  <TableHead className="text-right">Tổng chi tiêu</TableHead>
                  <TableHead>Lần đặt gần nhất</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.customerId}>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{customer.fullName}</div>
                      <div className="text-sm text-slate-500">{customer.email}</div>
                    </TableCell>
                    <TableCell>{customer.phoneNumber}</TableCell>
                    <TableCell className="text-right font-semibold">{customer.totalBookings}</TableCell>
                    <TableCell className="text-right text-slate-900">{formatCurrency(customer.totalSpent)}</TableCell>
                    <TableCell>{formatDate(customer.lastBookingDate)}</TableCell>
                    <TableCell>
                      <Badge variant={customer.isLocked ? "destructive" : "outline"} className="px-2 py-1">
                        {customer.isLocked ? "Đã khoá" : "Hoạt động"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(customer.createdAt)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDetails(customer.customerId)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Chi tiết
                      </Button>
                      <Button
                        variant={customer.isLocked ? "secondary" : "destructive"}
                        size="sm"
                        onClick={() => handleToggleBan(customer.customerId, customer.isLocked)}
                        disabled={toggleBanMutation.isPending}
                      >
                        {toggleBanMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : customer.isLocked ? (
                          <Unlock className="w-4 h-4 mr-2" />
                        ) : (
                          <Lock className="w-4 h-4 mr-2" />
                        )}
                        {customer.isLocked ? "Mở khoá" : "Khoá"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between p-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Trang {pageIndex}/{totalPages} • {totalCount} khách hàng
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPageIndex(Math.max(1, pageIndex - 1))} disabled={pageIndex <= 1}>
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageIndex(Math.min(totalPages, pageIndex + 1))}
                  disabled={pageIndex >= totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Sheet open={detailOpen} onOpenChange={(open) => (open ? setDetailOpen(true) : handleCloseDetails())}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Thông tin khách hàng</SheetTitle>
            <SheetDescription>Chi tiết hồ sơ, tài khoản và lịch sử đặt phòng</SheetDescription>
          </SheetHeader>

          {isDetailLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-600">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang tải thông tin chi tiết...
            </div>
          ) : detail ? (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={detail.basicInfo.avatarUrl || undefined} alt={detail.basicInfo.fullName} />
                  <AvatarFallback>{getInitials(detail.basicInfo.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-lg font-semibold text-slate-900">{detail.basicInfo.fullName}</div>
                  <div className="text-sm text-slate-500">{detail.basicInfo.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-slate-200">
                  <CardContent className="p-4 space-y-2">
                    <div className="text-sm font-semibold text-slate-800">Hồ sơ</div>
                    <div className="text-sm text-slate-600">SĐT: {detail.basicInfo.phoneNumber}</div>
                    <div className="text-sm text-slate-600">CMND/CCCD: {detail.basicInfo.identityCard || "—"}</div>
                    <div className="text-sm text-slate-600">Địa chỉ: {detail.basicInfo.address || "—"}</div>
                    <div className="text-sm text-slate-600">Tạo ngày: {formatDate(detail.basicInfo.createdAt, true)}</div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-800">Tài khoản</div>
                      <Badge variant={detail.account.isLocked ? "destructive" : "outline"}>
                        {detail.account.isLocked ? "Đã khoá" : "Hoạt động"}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600">Username: {detail.account.username}</div>
                    <div className="text-sm text-slate-600">Quyền: {detail.account.roles.join(", ")}</div>
                    <div className="text-sm text-slate-600">Đăng nhập gần nhất: {formatDate(detail.account.lastLoginAt, true)}</div>
                    <Button
                      variant={detail.account.isLocked ? "secondary" : "destructive"}
                      size="sm"
                      className="mt-2"
                      onClick={() => handleToggleBan(detail.basicInfo.customerId, detail.account.isLocked)}
                      disabled={toggleBanMutation.isPending}
                    >
                      {toggleBanMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : detail.account.isLocked ? (
                        <Unlock className="w-4 h-4 mr-2" />
                      ) : (
                        <Lock className="w-4 h-4 mr-2" />
                      )}
                      {detail.account.isLocked ? "Mở khoá" : "Khoá tài khoản"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">Thống kê</div>
                      <div className="text-xs text-slate-500">Dữ liệu mới nhất từ server</div>
                    </div>
                    <div className="text-sm text-slate-600">Tổng chi: {formatCurrency(detail.statistics.totalSpent)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3 text-sm text-slate-700">
                    <div>Số booking: {detail.statistics.totalBookings}</div>
                    <div>Hoàn thành: {detail.statistics.completedBookings}</div>
                    <div>Đã huỷ: {detail.statistics.cancelledBookings}</div>
                    <div>Đang tới: {detail.statistics.upcomingBookings}</div>
                    <div>Tổng giao dịch: {detail.statistics.totalTransactions}</div>
                    <div>Tổng thanh toán: {formatCurrency(detail.statistics.totalPaidAmount)}</div>
                    <div>Feedback: {detail.statistics.totalFeedbacks}</div>
                    <div>Lần đặt gần nhất: {formatDate(detail.statistics.lastBookingDate)}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="text-sm font-semibold text-slate-800 mb-3">Booking gần đây</div>
                  {detail.recentBookings?.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Loại</TableHead>
                          <TableHead>Nhận/Trả</TableHead>
                          <TableHead className="text-right">Tổng tiền</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.recentBookings.map((b) => (
                          <TableRow key={b.bookingId}>
                            <TableCell className="font-medium">#{b.bookingId}</TableCell>
                            <TableCell>{b.statusName || b.statusCode}</TableCell>
                            <TableCell>{b.bookingType}</TableCell>
                            <TableCell>
                              <div className="text-sm text-slate-700">{formatDate(b.checkInDate)}</div>
                              <div className="text-xs text-slate-500">{formatDate(b.checkOutDate)}</div>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(b.totalAmount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-sm text-slate-600">Chưa có booking gần đây</div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-600">Không tìm thấy thông tin khách hàng</div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
