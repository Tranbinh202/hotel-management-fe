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
  useOfflineBookings,
  useConfirmDeposit,
  useConfirmPayment,
  useCancelOfflineBooking,
  useResendEmail,
} from "@/lib/hooks/use-offline-bookings"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import type { OfflineBookingDetails } from "@/lib/types/api"

export default function AdminBookingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<{ fromDate: Date | undefined; toDate: Date | undefined }>({
    fromDate: undefined,
    toDate: undefined,
  })
  const [advancedFilters, setAdvancedFilters] = useState({
    paymentStatus: "",
    depositStatus: "",
    roomType: "",
    priceFrom: "",
    priceTo: "",
  })
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const pageSize = 20

  const filters = {
    customerName: searchQuery.includes("@") ? "" : searchQuery,
    phoneNumber: searchQuery.match(/^\d+$/) ? searchQuery : "",
    fromDate: dateRange.fromDate ? format(dateRange.fromDate, "yyyy-MM-dd") : "",
    toDate: dateRange.toDate ? format(dateRange.toDate, "yyyy-MM-dd") : "",
    ...advancedFilters,
    pageNumber,
    pageSize,
  }

  const [selectedBooking, setSelectedBooking] = useState<OfflineBookingDetails | null>(null)
  const [depositDialog, setDepositDialog] = useState(false)
  const [paymentDialog, setPaymentDialog] = useState(false)
  const [cancelDialog, setCancelDialog] = useState(false)
  const [depositData, setDepositData] = useState({
    depositAmount: 0,
    paymentMethod: "Cash",
    paymentNote: "",
    transactionReference: "",
  })
  const [paymentData, setPaymentData] = useState({
    paidAmount: 0,
    paymentMethod: "Cash",
    paymentNote: "",
    transactionReference: "",
  })
  const [cancelReason, setCancelReason] = useState("")

  const { data: bookingsData, isLoading, refetch } = useOfflineBookings(filters)
  const confirmDeposit = useConfirmDeposit()
  const confirmPayment = useConfirmPayment()
  const cancelBooking = useCancelOfflineBooking()
  const resendEmail = useResendEmail()

  const handleConfirmDeposit = async () => {
    if (!selectedBooking) return

    try {
      await confirmDeposit.mutateAsync({
        id: selectedBooking.bookingId,
        data: depositData,
      })
      toast({
        title: "Thành công",
        description: "Đã xác nhận đặt cọc",
      })
      setDepositDialog(false)
      refetch()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xác nhận đặt cọc",
        variant: "destructive",
      })
    }
  }

  const handleConfirmPayment = async () => {
    if (!selectedBooking) return

    try {
      await confirmPayment.mutateAsync({
        id: selectedBooking.bookingId,
        data: paymentData,
      })
      toast({
        title: "Thành công",
        description: "Đã xác nhận thanh toán",
      })
      setPaymentDialog(false)
      refetch()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xác nhận thanh toán",
        variant: "destructive",
      })
    }
  }

  const handleCancelBooking = async () => {
    if (!selectedBooking) return

    try {
      await cancelBooking.mutateAsync({
        id: selectedBooking.bookingId,
        reason: cancelReason,
      })
      toast({
        title: "Thành công",
        description: "Đã hủy booking",
      })
      setCancelDialog(false)
      setCancelReason("")
      refetch()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể hủy booking",
        variant: "destructive",
      })
    }
  }

  const handleResendEmail = async (bookingId: number) => {
    try {
      await resendEmail.mutateAsync(bookingId)
      toast({
        title: "Thành công",
        description: "Đã gửi lại email xác nhận",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gửi email",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Unpaid: "bg-amber-100 text-amber-700 border-amber-200",
      Cancelled: "bg-red-100 text-red-700 border-red-200",
      Pending: "bg-blue-100 text-blue-700 border-blue-200",
    }
    const labels: Record<string, string> = {
      Paid: "Đã thanh toán",
      Unpaid: "Chưa thanh toán",
      Cancelled: "Đã hủy",
      Pending: "Chờ xử lý",
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
      roomType: "",
      priceFrom: "",
      priceTo: "",
    })
    setPageNumber(1)
  }

  const handleApplyFilters = () => {
    setPageNumber(1)
    setFilterSidebarOpen(false)
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
            placeholder="Tìm kiếm tên khách hàng hoặc số điện thoại..."
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
          <SheetContent className="w-full  sm:max-w-md flex flex-col">
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

              {/* Room Type */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Loại phòng</Label>
                <Select
                  value={advancedFilters.roomType || "all"}
                  onValueChange={(value) =>
                    setAdvancedFilters({ ...advancedFilters, roomType: value === "all" ? "" : value })
                  }
                >
                  <SelectTrigger className="w-full border-slate-300">
                    <SelectValue placeholder="Chọn loại phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Single">Phòng đơn</SelectItem>
                    <SelectItem value="Double">Phòng đôi</SelectItem>
                    <SelectItem value="Suite">Suite</SelectItem>
                    <SelectItem value="Deluxe">Deluxe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Khoảng giá (VNĐ)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Giá từ"
                    value={advancedFilters.priceFrom}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, priceFrom: e.target.value })}
                    className="border-slate-300"
                  />
                  <Input
                    type="number"
                    placeholder="Giá đến"
                    value={advancedFilters.priceTo}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, priceTo: e.target.value })}
                    className="border-slate-300"
                  />
                </div>
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
                    roomType: "",
                    priceFrom: "",
                    priceTo: "",
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
          <h2 className="text-sm font-medium text-slate-700">Danh sách booking</h2>
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
              {bookingsData?.data?.items?.map((booking: any) => (
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
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                        {booking.bookingType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-5 text-xs text-slate-600">
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
                        {booking.roomNames?.join(", ") || `${booking.roomTypes?.length || 0} phòng`}
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {format(new Date(booking.checkInDate), "dd/MM/yyyy", { locale: vi })} -{" "}
                        {format(new Date(booking.checkOutDate), "dd/MM/yyyy", { locale: vi })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right pr-3 border-r border-slate-200">
                      <div className="font-bold text-slate-900 text-base">
                        {booking.totalAmount.toLocaleString("vi-VN")}đ
                      </div>
                      <div className="text-xs text-slate-500">
                        Cọc: {booking.depositAmount.toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {booking.depositStatus === "Unpaid" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBooking(booking)
                            setDepositData({
                              depositAmount: 0,
                              paymentMethod: "Cash",
                              paymentNote: "",
                              transactionReference: "",
                            })
                            setDepositDialog(true)
                          }}
                          className="h-8 text-xs hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
                        >
                          Xác nhận cọc
                        </Button>
                      )}
                      {booking.paymentStatus === "Unpaid" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBooking(booking)
                            setPaymentData({
                              paidAmount: 0,
                              paymentMethod: "Cash",
                              paymentNote: "",
                              transactionReference: "",
                            })
                            setPaymentDialog(true)
                          }}
                          className="h-8 text-xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                        >
                          Xác nhận thanh toán
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResendEmail(booking.bookingId)}
                        className="h-8 text-xs hover:bg-slate-100"
                      >
                        Gửi lại email
                      </Button>
                      {booking.paymentStatus !== "Cancelled" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedBooking(booking)
                            setCancelReason("")
                            setCancelDialog(true)
                          }}
                          className="h-8 text-xs hover:bg-red-50 text-red-600 hover:text-red-700"
                        >
                          Hủy booking
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {bookingsData?.data && bookingsData.data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-600">
                Hiển thị {(pageNumber - 1) * pageSize + 1} -{" "}
                {Math.min(pageNumber * pageSize, bookingsData.data.totalCount)} trong tổng số{" "}
                {bookingsData.data.totalCount} booking
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageNumber(pageNumber - 1)}
                  disabled={pageNumber === 1}
                  className="border-slate-300 h-8 text-xs"
                >
                  Trước
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, bookingsData.data.totalPages) }, (_, i) => {
                    const pageNum = pageNumber > 3 ? pageNumber - 2 + i : i + 1
                    if (pageNum > bookingsData.data.totalPages) return null
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPageNumber(pageNum)}
                        className={
                          pageNum === pageNumber
                            ? "bg-[#8C68E6] hover:bg-[#7a5ad1] border-[#8C68E6] h-8 min-w-[32px] text-xs"
                            : "border-slate-300 h-8 min-w-[32px] text-xs"
                        }
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageNumber(pageNumber + 1)}
                  disabled={pageNumber === bookingsData.data.totalPages}
                  className="border-slate-300 h-8 text-xs"
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={depositDialog} onOpenChange={setDepositDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đặt cọc</DialogTitle>
            <DialogDescription>
              Booking #{selectedBooking?.bookingId} - {selectedBooking?.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="depositAmount">Số tiền đặt cọc (VNĐ)</Label>
              <Input
                id="depositAmount"
                type="number"
                min="0"
                value={depositData.depositAmount}
                onChange={(e) => setDepositData({ ...depositData, depositAmount: Number(e.target.value) })}
                placeholder="500000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depositPaymentMethod">Phương thức thanh toán</Label>
              <Select
                value={depositData.paymentMethod}
                onValueChange={(value) => setDepositData({ ...depositData, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Tiền mặt</SelectItem>
                  <SelectItem value="Card">Thẻ tín dụng/ghi nợ</SelectItem>
                  <SelectItem value="Bank">Chuyển khoản ngân hàng</SelectItem>
                  <SelectItem value="EWallet">Ví điện tử</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="depositReference">Mã giao dịch</Label>
              <Input
                id="depositReference"
                value={depositData.transactionReference}
                onChange={(e) => setDepositData({ ...depositData, transactionReference: e.target.value })}
                placeholder="VD: CARD-TXN-20251116-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depositNote">Ghi chú</Label>
              <Textarea
                id="depositNote"
                value={depositData.paymentNote}
                onChange={(e) => setDepositData({ ...depositData, paymentNote: e.target.value })}
                placeholder="Ghi chú về giao dịch..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleConfirmDeposit}
              disabled={confirmDeposit.isPending}
              className="bg-[#8C68E6] hover:bg-[#7a5ad1]"
            >
              {confirmDeposit.isPending ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận thanh toán</DialogTitle>
            <DialogDescription>
              Booking #{selectedBooking?.bookingId} - {selectedBooking?.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paidAmount">Số tiền thanh toán (VNĐ)</Label>
              <Input
                id="paidAmount"
                type="number"
                min="0"
                value={paymentData.paidAmount}
                onChange={(e) => setPaymentData({ ...paymentData, paidAmount: Number(e.target.value) })}
                placeholder="1000000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentPaymentMethod">Phương thức thanh toán</Label>
              <Select
                value={paymentData.paymentMethod}
                onValueChange={(value) => setPaymentData({ ...paymentData, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Tiền mặt</SelectItem>
                  <SelectItem value="Card">Thẻ tín dụng/ghi nợ</SelectItem>
                  <SelectItem value="Bank">Chuyển khoản ngân hàng</SelectItem>
                  <SelectItem value="EWallet">Ví điện tử</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentReference">Mã giao dịch</Label>
              <Input
                id="paymentReference"
                value={paymentData.transactionReference}
                onChange={(e) => setPaymentData({ ...paymentData, transactionReference: e.target.value })}
                placeholder="VD: CASH-FULL-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentNote">Ghi chú</Label>
              <Textarea
                id="paymentNote"
                value={paymentData.paymentNote}
                onChange={(e) => setPaymentData({ ...paymentData, paymentNote: e.target.value })}
                placeholder="Ghi chú về giao dịch..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={confirmPayment.isPending}
              className="bg-[#8C68E6] hover:bg-[#7a5ad1]"
            >
              {confirmPayment.isPending ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hủy booking</DialogTitle>
            <DialogDescription>
              Booking #{selectedBooking?.bookingId} - {selectedBooking?.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Lý do hủy (tối thiểu 10 ký tự)</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="VD: Khách hủy do thay đổi lịch trình công tác..."
                rows={4}
              />
              <p className="text-xs text-slate-500">{cancelReason.length}/10 ký tự</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>
              Đóng
            </Button>
            <Button
              onClick={handleCancelBooking}
              disabled={cancelBooking.isPending || cancelReason.length < 10}
              variant="destructive"
            >
              {cancelBooking.isPending ? "Đang hủy..." : "Xác nhận hủy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
