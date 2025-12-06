"use client"

import { useState } from "react"
import { useBookingManagement, useUpdateBookingStatus } from "@/lib/hooks/use-bookings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import type { BookingManagementDetails } from "@/lib/types/api"
import { BookingDetailModal } from "@/components/booking-detail-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useBookingManagementDetail } from "@/lib/hooks/use-bookings"

export default function ReceptionistBookingsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [statusDialog, setStatusDialog] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingManagementDetails | null>(null)
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

  const handleUpdateStatus = (booking: BookingManagementDetails) => {
    setSelectedBooking(booking)
    setStatusData({ status: (booking.status as any) || "Confirmed", note: "" })
    setStatusDialog(true)
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
      {/* Header */}
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
            bookingsData.map((booking: BookingManagementDetails) => (
              <div
                key={booking.bookingId}
                className="p-6 hover:bg-slate-50/50 transition-colors cursor-pointer"
                onClick={() => handleViewDetail(booking.bookingId)}
              >
                <div className="flex items-start gap-6">
                  {/* Left: Booking Info */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-slate-900">#{booking.bookingId}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(booking.status)}`} />
                        <span className="text-sm font-medium text-slate-700">{getStatusLabel(booking.status)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Khách hàng</p>
                        <p className="font-semibold text-slate-900">{booking.customerName}</p>
                        <p className="text-sm text-slate-600">{booking.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Thời gian lưu trú</p>
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="font-medium">
                            {format(new Date(booking.checkInDate), "dd/MM", { locale: vi })} -{" "}
                            {format(new Date(booking.checkOutDate), "dd/MM/yyyy", { locale: vi })}
                          </span>
                          <span className="text-slate-500">({booking.totalNights} đêm)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`${
                          booking.paymentStatus === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        } text-xs`}
                      >
                        {booking.paymentStatus === "Paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                      </Badge>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                        {booking.bookingType}
                      </Badge>
                      {booking.rooms && booking.rooms.length > 0 && (
                        <span className="text-xs text-slate-500">{booking.rooms.length} phòng</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="text-right space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Tổng tiền</p>
                      <p className="text-2xl font-bold text-[#14b8a6]">{formatCurrency(booking.totalAmount)}</p>
                      {booking.remainingAmount > 0 && (
                        <p className="text-xs text-red-600 mt-1">Còn lại: {formatCurrency(booking.remainingAmount)}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUpdateStatus(booking)
                        }}
                        className="bg-gradient-to-r from-[#14b8a6] to-[#06b6d4] hover:from-[#0d9488] hover:to-[#0891b2] text-white shadow-sm"
                      >
                        Cập nhật trạng thái
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetail(booking.bookingId)
                        }}
                        className="border-[#14b8a6] text-[#14b8a6] hover:bg-teal-50"
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
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
    </div>
  )
}
