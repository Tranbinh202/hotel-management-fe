"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useBookingManagement, useUpdateBookingStatus } from "@/lib/hooks/use-bookings"
import { bookingManagementApi } from "@/lib/api/bookings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import type { BookingListItem } from "@/lib/types/api"
import { BookingDetailModal } from "@/components/booking-detail-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useBookingManagementDetail } from "@/lib/hooks/use-bookings"
import { MoreVertical, CheckCircle, XCircle, LogIn, LogOut, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AdminBookingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [statusDialog, setStatusDialog] = useState(false)
  const [cancelDialog, setCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<BookingListItem | null>(null)
  const [statusData, setStatusData] = useState({
    status: "Confirmed" as "Confirmed" | "CheckedIn" | "CheckedOut",
    note: "",
  })

  const filters = {
    customerName: searchQuery.includes("@") ? "" : searchQuery,
    phoneNumber: searchQuery.match(/^\d+$/) ? searchQuery : "",
    email: searchQuery.includes("@") ? searchQuery : "",
    pageNumber: 1,
    pageSize: 50,
    sortBy: "CheckInDate",
    isDescending: false,
  }

  const { data: bookings, isLoading, refetch } = useBookingManagement(filters)
  const updateStatusMutation = useUpdateBookingStatus()

  const { data: bookingDetailData, isLoading: isLoadingDetail } = useBookingManagementDetail(selectedBookingId || 0)

  const bookingsData = bookings?.pages?.flatMap((page) => page.data.items) || []

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Paid: "bg-emerald-500",
      Unpaid: "bg-amber-500",
      Cancelled: "bg-red-500",
      Pending: "bg-blue-500",
      Confirmed: "bg-cyan-500",
      CheckedIn: "bg-purple-500",
      CheckedOut: "bg-slate-500",
      "Đã thanh toán": "bg-emerald-500",
      "Chờ xác nhận": "bg-amber-500",
      "Đã hủy": "bg-red-500",
    }
    return colors[status] || "bg-slate-400"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      Paid: "Đã thanh toán",
      Unpaid: "Chưa thanh toán",
      Cancelled: "Đã hủy",
      Pending: "Chờ xử lý",
      Confirmed: "Đã xác nhận",
      CheckedIn: "Đã check-in",
      CheckedOut: "Đã check-out",
    }
    return labels[status] || status
  }

  const handleViewDetail = (bookingId: number) => {
    setSelectedBookingId(bookingId)
    setDetailModalOpen(true)
  }

  const handleUpdateStatus = (booking: BookingListItem) => {
    setSelectedBooking(booking)
    setStatusData({ status: "Confirmed", note: "" })
    setStatusDialog(true)
  }

  const handleConfirmPayment = async (bookingId: number) => {
    if (!confirm("Xác nhận đã nhận thanh toán cho booking này?")) return

    try {
      await bookingManagementApi.confirmPayment(bookingId)
      refetch()
      toast({
        title: "Thành công",
        description: "Đã xác nhận thanh toán",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xác nhận thanh toán",
        variant: "destructive",
      })
    }
  }

  const handleCancelBooking = (booking: BookingListItem) => {
    setSelectedBooking(booking)
    setCancelReason("")
    setCancelDialog(true)
  }

  const handleSubmitCancel = async () => {
    if (!selectedBooking) return

    if (!cancelReason.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do hủy",
        variant: "destructive",
      })
      return
    }

    try {
      await bookingManagementApi.cancelBooking(selectedBooking.bookingId, { reason: cancelReason })
      setCancelDialog(false)
      refetch()
      toast({
        title: "Thành công",
        description: "Đã hủy booking",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể hủy booking",
        variant: "destructive",
      })
    }
  }

  const handleCheckIn = async (bookingId: number) => {
    if (!confirm("Xác nhận khách đã check-in?")) return

    try {
      await bookingManagementApi.updateBookingStatus(bookingId, { status: "CheckedIn", note: "Check-in tại quầy" })
      refetch()
      toast({
        title: "Thành công",
        description: "Đã xác nhận check-in",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể check-in",
        variant: "destructive",
      })
    }
  }

  const handleCheckOut = async (bookingId: number) => {
    if (!confirm("Xác nhận khách đã check-out?")) return

    try {
      await bookingManagementApi.updateBookingStatus(bookingId, { status: "CheckedOut", note: "Check-out tại quầy" })
      refetch()
      toast({
        title: "Thành công",
        description: "Đã xác nhận check-out",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể check-out",
        variant: "destructive",
      })
    }
  }

  const handleSubmitStatus = async () => {
    if (!selectedBooking) return

    try {
      await updateStatusMutation.mutateAsync({
        id: selectedBooking.bookingId,
        data: statusData,
      })
      setStatusDialog(false)
      refetch()
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái booking",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header - KHÔNG có nút tạo booking */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý đặt phòng</h1>
          <p className="text-slate-600 mt-1">Xem và cập nhật thông tin đặt phòng</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
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
              placeholder="Tìm theo tên, số điện thoại, hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base border-slate-300"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setSearchQuery("")}
            className="h-12 px-6 border-slate-300 hover:bg-slate-50"
          >
            Xóa
          </Button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-cyan-50">
          <h2 className="text-lg font-semibold text-slate-900">
            Danh sách đặt phòng
            {bookingsData.length > 0 && <span className="ml-2 text-slate-600">({bookingsData.length})</span>}
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-[#14b8a6] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-slate-500 text-sm">Đang tải dữ liệu...</p>
            </div>
          ) : bookingsData.length === 0 ? (
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
              <h3 className="text-base font-semibold text-slate-700 mb-1">Không tìm thấy đặt phòng</h3>
              <p className="text-slate-500 text-center text-sm">Hãy thử tìm kiếm với từ khóa khác</p>
            </div>
          ) : (
            bookingsData.map((booking: BookingListItem) => {
              const checkIn = new Date(booking.checkInDate)
              const checkOut = new Date(booking.checkOutDate)
              const totalNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

              return (
                <div
                  key={booking.bookingId}
                  className="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer border-b border-slate-100 last:border-b-0"
                  onClick={() => handleViewDetail(booking.bookingId)}
                >
                  <div className="flex items-center gap-4">
                    {/* Booking ID & Status */}
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <span className="text-lg font-bold text-slate-900">#{booking.bookingId}</span>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(booking.paymentStatus)}`} />
                    </div>

                    {/* Customer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-slate-900 truncate">{booking.customerName}</p>
                        <span className="text-xs text-slate-500 shrink-0">{booking.customerPhone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {format(new Date(booking.checkInDate), "dd/MM", { locale: vi })} - {format(new Date(booking.checkOutDate), "dd/MM/yy", { locale: vi })}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span>{totalNights} đêm</span>
                        <span className="text-slate-400">•</span>
                        <span>{booking.roomNames.length} phòng</span>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={`${booking.paymentStatus === "Đã thanh toán"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : booking.paymentStatus === "Chờ xác nhận"
                            ? "bg-amber-50 text-amber-700 border-amber-300"
                            : booking.paymentStatus === "Đã hủy"
                              ? "bg-red-50 text-red-700 border-red-300"
                              : "bg-slate-50 text-slate-700 border-slate-300"
                          } text-xs px-2 py-0.5 font-medium`}
                      >
                        {booking.paymentStatus}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`${booking.bookingType === "Đặt trực tuyến"
                          ? "bg-purple-50 text-purple-700 border-purple-300"
                          : "bg-orange-50 text-orange-700 border-orange-300"
                          } text-xs px-2 py-0.5 font-medium`}
                      >
                        {booking.bookingType}
                      </Badge>
                    </div>

                    {/* Amount */}
                    <div className="text-right min-w-[140px] shrink-0">
                      <p className="text-lg font-bold text-[#14b8a6]">{formatCurrency(booking.totalAmount)}</p>
                      <p className="text-xs text-slate-500">Cọc: {formatCurrency(booking.depositAmount)}</p>
                    </div>

                    {/* Actions Dropdown Menu */}
                    <div className="shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewDetail(booking.bookingId)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>

                          {booking.paymentStatus !== "Đã hủy" &&
                            !booking.depositStatus?.includes("CheckedOut") && (
                              <>
                                <DropdownMenuSeparator />

                                {booking.paymentStatus === "Chờ xác nhận" && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleConfirmPayment(booking.bookingId)
                                    }}
                                    className="text-green-600 focus:text-green-600"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Xác nhận thanh toán
                                  </DropdownMenuItem>
                                )}

                                {booking.paymentStatus === "Đã xác nhận" &&
                                  !booking.depositStatus?.includes("CheckedIn") && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleCheckIn(booking.bookingId)
                                      }}
                                      className="text-blue-600 focus:text-blue-600"
                                    >
                                      <LogIn className="mr-2 h-4 w-4" />
                                      Check-in
                                    </DropdownMenuItem>
                                  )}

                                {booking.depositStatus?.includes("CheckedIn") && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCheckOut(booking.bookingId)
                                    }}
                                    className="text-purple-600 focus:text-purple-600"
                                  >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Check-out
                                  </DropdownMenuItem>
                                )}

                                {!booking.depositStatus?.includes("CheckedIn") && booking.paymentStatus !== "Đã xác nhận" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleCancelBooking(booking)
                                      }}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Hủy booking
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Booking Detail Modal */}
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
            <Button
              onClick={handleSubmitStatus}
              className="bg-gradient-to-r from-[#14b8a6] to-[#06b6d4] hover:from-[#0d9488] hover:to-[#0891b2]"
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hủy booking #{selectedBooking?.bookingId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Lý do hủy *</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy booking..."
                rows={4}
              />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                ⚠️ Hành động này không thể hoàn tác. Booking sẽ bị hủy và email thông báo sẽ được gửi đến khách hàng.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>
              Đóng
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmitCancel}
              disabled={!cancelReason.trim()}
            >
              Xác nhận hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
