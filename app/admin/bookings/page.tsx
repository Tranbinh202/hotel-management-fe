"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DatePicker } from "@/components/ui/date-picker"
import {
  useBookingManagement,
  useUpdateBookingStatus,
  useCancelBookingManagement,
  useResendBookingConfirmation,
} from "@/lib/hooks/use-bookings"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import Link from "next/link"
import type { BookingManagementDetails } from "@/lib/types/api"
import { useBookingManagementDetail } from "@/lib/hooks/use-bookings"
import { BookingDetailModal } from "@/components/booking-detail-modal"

export default function AdminBookingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<{ fromDate: Date | undefined; toDate: Date | undefined }>({
    fromDate: undefined,
    toDate: undefined,
  })
  const [advancedFilters, setAdvancedFilters] = useState({
    paymentStatus: "",
    depositStatus: "",
    bookingType: "",
    sortBy: "",
    isDescending: true,
  })
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const pageSize = 20

  const filters = {
    customerName: searchQuery.includes("@") ? "" : searchQuery,
    phoneNumber: searchQuery.match(/^\d+$/) ? searchQuery : "",
    email: searchQuery.includes("@") ? searchQuery : "",
    fromDate: dateRange.fromDate ? format(dateRange.fromDate, "yyyy-MM-dd") : undefined,
    toDate: dateRange.toDate ? format(dateRange.toDate, "yyyy-MM-dd") : undefined,
    paymentStatus: advancedFilters.paymentStatus || undefined,
    depositStatus: advancedFilters.depositStatus || undefined,
    bookingType: advancedFilters.bookingType || undefined,
    sortBy: advancedFilters.sortBy || undefined,
    isDescending: advancedFilters.isDescending,
    pageNumber,
    pageSize,
  }

  const [selectedBooking, setSelectedBooking] = useState<BookingManagementDetails | null>(null)
  const [statusDialog, setStatusDialog] = useState(false)
  const [cancelDialog, setCancelDialog] = useState(false)
  const [statusData, setStatusData] = useState({
    status: "Confirmed" as "Confirmed" | "CheckedIn" | "CheckedOut" | "Cancelled",
    note: "",
  })
  const [cancelReason, setCancelReason] = useState("")
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)

  const { data: bookingsData, isLoading, refetch } = useBookingManagement(filters)
  const updateStatus = useUpdateBookingStatus()
  const cancelBooking = useCancelBookingManagement()
  const resendEmail = useResendBookingConfirmation()
  const { data: bookingDetailData, isLoading: isLoadingDetail } = useBookingManagementDetail(selectedBookingId || 0)

  const handleUpdateStatus = async () => {
    if (!selectedBooking) return

    try {
      await updateStatus.mutateAsync({
        id: selectedBooking.bookingId,
        data: statusData,
      })
      setStatusDialog(false)
      refetch()
    } catch (error: any) {
      // Error handled by hook
    }
  }

  const handleCancelBooking = async () => {
    if (!selectedBooking) return

    try {
      await cancelBooking.mutateAsync({
        id: selectedBooking.bookingId,
        data: { reason: cancelReason },
      })
      setCancelDialog(false)
      setCancelReason("")
      refetch()
    } catch (error: any) {
      // Error handled by hook
    }
  }

  const handleResendEmail = async (bookingId: number) => {
    try {
      await resendEmail.mutateAsync(bookingId)
    } catch (error: any) {
      // Error handled by hook
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Unpaid: "bg-amber-100 text-amber-700 border-amber-200",
      Cancelled: "bg-red-100 text-red-700 border-red-200",
      Pending: "bg-blue-100 text-blue-700 border-blue-200",
      Confirmed: "bg-cyan-100 text-cyan-700 border-cyan-200",
      CheckedIn: "bg-purple-100 text-purple-700 border-purple-200",
      CheckedOut: "bg-slate-100 text-slate-700 border-slate-200",
    }
    const labels: Record<string, string> = {
      Paid: "Đã thanh toán",
      Unpaid: "Chưa thanh toán",
      Cancelled: "Đã hủy",
      Pending: "Chờ xử lý",
      Confirmed: "Đã xác nhận",
      CheckedIn: "Đã check-in",
      CheckedOut: "Đã check-out",
    }
    return (
      <Badge
        variant="outline"
        className={`${colors[status] || "bg-slate-100 text-slate-700 border-slate-200"} font-medium text-xs`}
      >
        {labels[status] || status}
      </Badge>
    )
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setDateRange({ fromDate: undefined, toDate: undefined })
    setAdvancedFilters({
      paymentStatus: "",
      depositStatus: "",
      bookingType: "",
      sortBy: "",
      isDescending: true,
    })
    setPageNumber(1)
  }

  const handleApplyFilters = () => {
    setPageNumber(1)
    setFilterSidebarOpen(false)
  }

  const handleViewDetail = (bookingId: number) => {
    setSelectedBookingId(bookingId)
    setDetailModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Quản lý đặt phòng</h1>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý và theo dõi các booking offline của bạn.</p>
        </div>
        <Link href="/admin/bookings/new">
          <Button size="sm" className="bg-[#8C68E6] hover:bg-[#7a5ad1] text-white shadow-sm h-9">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo booking mới
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3 bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
        {/* Search input */}
        <div className="flex-1 relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
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
            placeholder="Tìm kiếm tên, email hoặc số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 border-slate-200 focus:border-[#8C68E6] focus:ring-[#8C68E6]/20 text-sm"
          />
        </div>

        {/* Date range picker */}
        <div className="flex items-center gap-2">
          <DatePicker
            value={dateRange.fromDate}
            onChange={(date) => setDateRange({ ...dateRange, fromDate: date })}
            placeholder="Từ ngày"
            maxDate={dateRange.toDate || undefined}
            className="w-[150px] h-9"
          />
          <span className="text-slate-300 text-sm">-</span>
          <DatePicker
            value={dateRange.toDate}
            onChange={(date) => setDateRange({ ...dateRange, toDate: date })}
            placeholder="Đến ngày"
            minDate={dateRange.fromDate || undefined}
            className="w-[150px] h-9"
          />
        </div>

        {/* Filter button */}
        <Sheet open={filterSidebarOpen} onOpenChange={setFilterSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-[#8C68E6] text-[#8C68E6] hover:bg-purple-50 bg-transparent"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Lọc
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md flex flex-col">
            <SheetHeader className="space-y-3 pb-6 border-b">
              <SheetTitle className="text-2xl font-bold">Bộ lọc nâng cao</SheetTitle>
              <SheetDescription className="text-slate-600">
                Tùy chỉnh các tiêu chí lọc để tìm kiếm booking chính xác hơn
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
              {/* Payment Status */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Trạng thái thanh toán</Label>
                <Select
                  value={advancedFilters.paymentStatus || "all"}
                  onValueChange={(value) =>
                    setAdvancedFilters({ ...advancedFilters, paymentStatus: value === "all" ? "" : value })
                  }
                >
                  <SelectTrigger className="w-full border-slate-300">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Paid">Đã thanh toán</SelectItem>
                    <SelectItem value="Unpaid">Chưa thanh toán</SelectItem>
                    <SelectItem value="Pending">Chờ xử lý</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Deposit Status */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Trạng thái đặt cọc</Label>
                <Select
                  value={advancedFilters.depositStatus || "all"}
                  onValueChange={(value) =>
                    setAdvancedFilters({ ...advancedFilters, depositStatus: value === "all" ? "" : value })
                  }
                >
                  <SelectTrigger className="w-full border-slate-300">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Paid">Đã đặt cọc</SelectItem>
                    <SelectItem value="Unpaid">Chưa đặt cọc</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Booking Type */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Loại booking</Label>
                <Select
                  value={advancedFilters.bookingType || "all"}
                  onValueChange={(value) =>
                    setAdvancedFilters({ ...advancedFilters, bookingType: value === "all" ? "" : value })
                  }
                >
                  <SelectTrigger className="w-full border-slate-300">
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Walkin">Walk-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Sắp xếp theo</Label>
                <Select
                  value={advancedFilters.sortBy || "CheckInDate"}
                  onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, sortBy: value })}
                >
                  <SelectTrigger className="w-full border-slate-300">
                    <SelectValue placeholder="Chọn cách sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CheckInDate">Ngày check-in</SelectItem>
                    <SelectItem value="CheckOutDate">Ngày check-out</SelectItem>
                    <SelectItem value="TotalAmount">Tổng tiền</SelectItem>
                    <SelectItem value="CreatedAt">Ngày tạo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Thứ tự</Label>
                <Select
                  value={advancedFilters.isDescending ? "desc" : "asc"}
                  onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, isDescending: value === "desc" })}
                >
                  <SelectTrigger className="w-full border-slate-300">
                    <SelectValue placeholder="Chọn thứ tự" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Giảm dần</SelectItem>
                    <SelectItem value="asc">Tăng dần</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Footer with action buttons */}
            <div className="border-t py-4 px-4 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-11 bg-transparent"
                onClick={() => {
                  setAdvancedFilters({
                    paymentStatus: "",
                    depositStatus: "",
                    bookingType: "",
                    sortBy: "",
                    isDescending: true,
                  })
                }}
              >
                Đặt lại
              </Button>
              <Button className="flex-1 h-11 bg-[#8C68E6] hover:bg-[#7a5ad1]" onClick={handleApplyFilters}>
                Áp dụng
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Reset button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetFilters}
          className="h-9 w-9 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          title="Đặt lại bộ lọc"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-medium text-slate-700">
            Danh sách booking
            {bookingsData?.data?.totalCount !== undefined && (
              <span className="ml-2 text-slate-500">({bookingsData.data.totalCount} kết quả)</span>
            )}
          </h2>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-[#8C68E6] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-slate-500 text-sm">Đang tải dữ liệu...</p>
            </div>
          ) : bookingsData?.data?.items?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-24 h-24 mb-4 text-slate-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-700 mb-1">Chưa có đặt phòng nào được tìm thấy.</h3>
              <p className="text-slate-500 text-center mb-4 max-w-md text-sm">
                Hãy thử tìm kiếm với các tiêu chí khác hoặc tạo một đặt phòng mới để bắt đầu.
              </p>
              <Link href="/admin/bookings/new">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#8C68E6] text-[#8C68E6] hover:bg-purple-50 bg-transparent"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tạo booking mới
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookingsData?.data?.items?.map((booking: BookingManagementDetails) => (
                <div
                  key={booking.bookingId}
                  className="group flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-[#8C68E6]/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="font-bold text-slate-900 text-base">#{booking.bookingId}</span>
                      <span className="font-medium text-slate-800 text-sm">{booking.customerName}</span>
                      {getStatusBadge(booking.paymentStatus)}
                      {getStatusBadge(booking.depositStatus)}
                      {booking.status && getStatusBadge(booking.status)}
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                        {booking.bookingType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-5 text-xs text-slate-600">
                      {booking.phoneNumber && (
                        <span className="flex items-center gap-1.5">
                          <svg
                            className="w-3.5 h-3.5 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          {booking.phoneNumber}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {format(new Date(booking.checkInDate), "dd/MM/yyyy", { locale: vi })} -{" "}
                        {format(new Date(booking.checkOutDate), "dd/MM/yyyy", { locale: vi })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                          booking.totalAmount,
                        )}
                      </span>
                      {booking.roomNames && booking.roomNames.length > 0 && (
                        <span className="flex items-center gap-1.5">
                          <svg
                            className="w-3.5 h-3.5 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          {booking.roomNames.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(booking.bookingId)}
                      className="h-8 text-xs border-[#8C68E6]/30 text-[#8C68E6] hover:bg-purple-50"
                    >
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Chi tiết
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking)
                        setStatusData({ status: "Confirmed", note: "" })
                        setStatusDialog(true)
                      }}
                      className="h-8 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      Cập nhật trạng thái
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendEmail(booking.bookingId)}
                      className="h-8 text-xs"
                    >
                      Gửi lại email
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking)
                        setCancelDialog(true)
                      }}
                      className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {bookingsData?.data && bookingsData.data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Trang {bookingsData.data.pageIndex} / {bookingsData.data.totalPages} ({bookingsData.data.totalCount} kết
                quả)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                  disabled={pageNumber === 1}
                  className="h-8 text-xs"
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageNumber((prev) => Math.min(bookingsData.data.totalPages, prev + 1))}
                  disabled={pageNumber === bookingsData.data.totalPages}
                  className="h-8 text-xs"
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BookingDetailModal */}
      <BookingDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        booking={bookingDetailData?.data || null}
        isLoading={isLoadingDetail}
      />

      {/* Update Status Dialog */}
      <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái booking</DialogTitle>
            <DialogDescription>Cập nhật trạng thái cho booking #{selectedBooking?.bookingId}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={statusData.status}
                onValueChange={(value: any) => setStatusData({ ...statusData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="CheckedIn">Đã check-in</SelectItem>
                  <SelectItem value="CheckedOut">Đã check-out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ghi chú (tùy chọn)</Label>
              <Textarea
                value={statusData.note}
                onChange={(e) => setStatusData({ ...statusData, note: e.target.value })}
                placeholder="Nhập ghi chú về thay đổi trạng thái..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateStatus} className="bg-[#8C68E6] hover:bg-[#7a5ad1]">
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hủy booking</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn hủy booking #{selectedBooking?.bookingId}?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Lý do hủy</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy booking..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>
              Đóng
            </Button>
            <Button
              onClick={handleCancelBooking}
              disabled={!cancelReason || cancelReason.trim().length < 10}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Xác nhận hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
