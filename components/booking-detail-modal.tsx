"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import type { BookingManagementDetails, CustomerSearchResult } from "@/lib/types/api"
import { useEffect, useState } from "react"
import { bookingManagementApi } from "@/lib/api/bookings"
import { QRCodeSVG } from "qrcode.react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { offlineBookingsApi } from "@/lib/api/offline-bookings"

interface BookingDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: BookingManagementDetails | null
  isLoading?: boolean
}

export function BookingDetailModal({ open, onOpenChange, booking, isLoading }: BookingDetailModalProps) {
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [enrichedCustomer, setEnrichedCustomer] = useState<CustomerSearchResult | null>(null)

  const paidAmount = booking?.paidAmount ?? 0
  const remainingAmount =
    booking?.remainingAmount ?? (booking ? Math.max(booking.totalAmount - paidAmount, 0) : 0)
  const hasRemainingAmount = booking && remainingAmount > 0

  useEffect(() => {
    if (open && booking && hasRemainingAmount) {
      setIsLoadingPayment(true)
      setPaymentError(null)

      bookingManagementApi
        .getPayOSPaymentLink({ bookingId: booking.bookingId })
        .then((response) => {
          if (response.isSuccess && response.data.paymentUrl) {
            setPaymentUrl(response.data.paymentUrl)
          } else {
            setPaymentError("Không thể tạo link thanh toán")
          }
        })
        .catch((error) => {
          console.error("Error fetching payment link:", error)
          setPaymentError("Lỗi khi tạo link thanh toán")
        })
        .finally(() => {
          setIsLoadingPayment(false)
        })
    } else {
      setPaymentUrl(null)
      setPaymentError(null)
    }
  }, [open, booking, hasRemainingAmount])

  useEffect(() => {
    const searchKey =
      booking?.customerPhone?.trim() ||
      booking?.customerEmail?.trim() ||
      booking?.customerName?.trim() ||
      booking?.customer?.phoneNumber?.trim() ||
      booking?.customer?.email?.trim() ||
      booking?.customer?.fullName?.trim()

    const hasMissingCustomerInfo =
      booking &&
      (!booking.customer?.email || !booking.customer?.address || !booking.customer?.identityCard || !booking.customer?.fullName)

    if (!open || !booking || enrichedCustomer || !searchKey || searchKey.length < 3 || !hasMissingCustomerInfo) {
      return
    }

    offlineBookingsApi
      .searchCustomer(searchKey)
      .then((result) => {
        if (!result?.data?.length) return
        const matched =
          result.data.find((c) => c.customerId === booking.customerId) ||
          result.data.find((c) => c.phoneNumber === booking.customerPhone) ||
          result.data[0]
        if (matched) setEnrichedCustomer(matched)
      })
      .catch((error) => {
        console.error("Unable to enrich customer info:", error)
      })
  }, [open, booking, enrichedCustomer])

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Đang tải thông tin booking...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-[#8C68E6] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!booking) return null

  const customerInfo = {
    fullName: booking.customer?.fullName ?? enrichedCustomer?.fullName ?? booking.customerName,
    email: booking.customer?.email ?? enrichedCustomer?.email ?? booking.customerEmail ?? booking.email,
    phoneNumber: booking.customer?.phoneNumber ?? enrichedCustomer?.phoneNumber ?? booking.customerPhone ?? booking.phoneNumber,
    identityCard: booking.customer?.identityCard ?? enrichedCustomer?.identityCard ?? booking.identityCard,
    address: booking.customer?.address ?? enrichedCustomer?.address ?? booking.address,
  }

  const nights =
    booking.totalNights ??
    Math.max(
      1,
      Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24)),
    )

  const computedSubTotal = (() => {
    if (typeof booking.subTotal === "number") return booking.subTotal
    if (booking.roomTypeDetails?.length) {
      return booking.roomTypeDetails.reduce(
        (sum, roomType) =>
          sum + (roomType.subTotal ?? (roomType.pricePerNight ?? 0) * (roomType.quantity ?? 1) * nights),
        0,
      )
    }
    if (booking.rooms?.length) {
      return booking.rooms.reduce(
        (sum, room) => sum + (room.subTotal ?? (room.pricePerNight || 0) * (room.numberOfNights ?? nights ?? 1)),
        0,
      )
    }
    if (booking.roomIds?.length && booking.roomNames?.length && booking.roomTypeDetails?.length) {
      const nameList = booking.roomNames.join(", ")
      const typeTotal = booking.roomTypeDetails.reduce(
        (sum, roomType) =>
          sum + (roomType.subTotal ?? (roomType.pricePerNight ?? 0) * (roomType.quantity ?? 1) * nights),
        0,
      )
      return typeTotal || booking.totalAmount || 0
    }
    return booking.totalAmount ?? 0
  })() || booking.totalAmount || 0

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      "Đã thanh toán": { bg: "bg-green-50", text: "text-green-700" },
      "Chưa thanh toán": { bg: "bg-yellow-50", text: "text-yellow-700" },
      "Đã đặt cọc": { bg: "bg-blue-50", text: "text-blue-700" },
      "Chưa đặt cọc": { bg: "bg-slate-50", text: "text-slate-600" },
      Confirmed: { bg: "bg-green-50", text: "text-green-700" },
      CheckedIn: { bg: "bg-blue-50", text: "text-blue-700" },
      CheckedOut: { bg: "bg-purple-50", text: "text-purple-700" },
      Cancelled: { bg: "bg-red-50", text: "text-red-700" },
      "Đặt trực tuyến": { bg: "bg-purple-50", text: "text-purple-700" },
      "Đặt tại quầy": { bg: "bg-orange-50", text: "text-orange-700" },
    }

    const style = statusMap[status] || { bg: "bg-slate-50", text: "text-slate-600" }
    return (
      <Badge variant="outline" className={`${style.bg} ${style.text} border-0 text-xs`}>
        {status}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">Chi tiết booking #{booking.bookingCode}</DialogTitle>
              <p className="text-sm text-slate-500 mt-1">
                Tạo lúc {format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(booking.bookingType)}
              {getStatusBadge(booking.bookingStatus)}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="px-6 py-4">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Thông tin khách hàng</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-slate-500">Họ tên</p>
                        <p className="text-sm font-medium text-slate-900">{customerInfo.fullName || "Chưa cập nhật"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="text-sm text-slate-700">{customerInfo.email || "Chưa có"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Số điện thoại</p>
                        <p className="text-sm text-slate-700">{customerInfo.phoneNumber || "Chưa có"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">CMND/CCCD</p>
                        <p className="text-sm text-slate-700">{customerInfo.identityCard || "Chưa có"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500">Địa chỉ</p>
                        <p className="text-sm text-slate-700">{customerInfo.address || "Chưa có"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Thông tin đặt phòng</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Ngày nhận phòng</p>
                        <p className="text-sm font-medium text-slate-900">
                          {format(new Date(booking.checkInDate), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Ngày trả phòng</p>
                        <p className="text-sm font-medium text-slate-900">
                          {format(new Date(booking.checkOutDate), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Số đêm</p>
                        <p className="text-sm font-medium text-slate-900">{nights} đêm</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Trạng thái thanh toán</p>
                        <div className="mt-1">{getStatusBadge(booking.paymentStatus)}</div>
                      </div>
                      {booking.specialRequests && (
                        <div className="col-span-3">
                          <p className="text-xs text-slate-500">Yêu cầu đặc biệt</p>
                          <p className="text-sm text-slate-700 italic">{booking.specialRequests}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {booking.rooms && booking.rooms.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">
                      Danh sách phòng ({booking.rooms.length})
                    </h3>
                    <div className="space-y-3">
                      {booking.rooms.map((room) => (
                        <div key={room.bookingRoomId} className="bg-slate-50 rounded-lg p-4">
                          <div className="flex gap-4">
                            {room.roomImages && room.roomImages.length > 0 && (
                              <img
                                src={room.roomImages[0] || "/placeholder.svg"}
                                alt={room.roomNumber}
                                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-slate-900">{room.roomNumber}</p>
                                  <p className="text-sm text-slate-600">{room.roomTypeName}</p>
                                </div>
                                {getStatusBadge(room.status)}
                              </div>
                              <div className="grid grid-cols-4 gap-3 text-xs">
                                <div>
                                  <p className="text-slate-500">Giá/đêm</p>
                                  <p className="font-medium text-slate-900">
                            {new Intl.NumberFormat("vi-VN").format(room.pricePerNight)}đ
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Số đêm</p>
                          <p className="font-medium text-slate-900">{room.numberOfNights ?? nights}</p>
                        </div>
                                <div>
                                  <p className="text-slate-500">Sức chứa</p>
                                  <p className="font-medium text-slate-900">{room.maxOccupancy} người</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Tổng</p>
                                  <p className="font-medium text-[#8C68E6]">
                                    {new Intl.NumberFormat("vi-VN").format(room.subTotal)}đ
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : booking.roomNames && booking.roomNames.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">
                      Danh sách phòng ({booking.roomNames.length})
                    </h3>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-700">{booking.roomNames.join(", ")}</p>
                    </div>
                  </div>
                ) : null}

                {booking.cancelledAt && (
                  <div>
                    <h3 className="text-sm font-semibold text-red-600 mb-3">Thông tin hủy booking</h3>
                    <div className="bg-red-50 rounded-lg p-4 space-y-2 text-sm">
                      <div>
                        <span className="text-red-600 font-medium">Hủy bởi:</span>{" "}
                        <span className="text-red-900">{booking.cancelledBy}</span>
                      </div>
                      <div>
                        <span className="text-red-600 font-medium">Thời gian:</span>{" "}
                        <span className="text-red-900">
                          {format(new Date(booking.cancelledAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </span>
                      </div>
                      {booking.cancellationReason && (
                        <div>
                          <span className="text-red-600 font-medium">Lý do:</span>{" "}
                          <span className="text-red-900">{booking.cancellationReason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="sticky top-0 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Tổng hợp thanh toán</h3>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Tổng tiền phòng</span>
                        <span className="font-medium text-slate-900">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(computedSubTotal)}
                        </span>
                      </div>
                      {booking.taxAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Thuế</span>
                          <span className="font-medium text-slate-900">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                              booking.taxAmount,
                            )}
                          </span>
                        </div>
                      )}
                      {booking.serviceCharge > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Phí dịch vụ</span>
                          <span className="font-medium text-slate-900">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                              booking.serviceCharge,
                            )}
                          </span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-base font-bold">
                        <span className="text-slate-900">Tổng cộng</span>
                        <span className="text-[#8C68E6]">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                            booking.totalAmount,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Đã thanh toán</span>
                    <span className="font-medium text-green-600">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                        paidAmount,
                      )}
                    </span>
                  </div>
                  {remainingAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Còn lại</span>
                      <span className="font-medium text-red-600">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                          remainingAmount,
                        )}
                      </span>
                    </div>
                  )}
                </div>
                  </div>

                  {hasRemainingAmount ? (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Thanh toán</h3>
                      <div className="bg-gradient-to-br from-[#8C68E6]/5 to-[#D4A574]/5 rounded-lg p-4 border border-[#8C68E6]/20">
                        {isLoadingPayment ? (
                          <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 text-[#8C68E6] animate-spin mb-2" />
                            <p className="text-sm text-slate-600">Đang tạo mã QR...</p>
                          </div>
                        ) : paymentError ? (
                          <div className="text-center py-4">
                            <p className="text-sm text-red-600">{paymentError}</p>
                          </div>
                        ) : paymentUrl ? (
                          <div className="flex flex-col items-center">
                            <div className="bg-white p-4 rounded-lg mb-3 shadow-sm">
                              <QRCodeSVG value={paymentUrl} size={180} level="H" includeMargin />
                            </div>
                          <p className="text-xs text-slate-600 text-center mb-2">Quét mã QR để thanh toán</p>
                          <p className="text-sm font-semibold text-[#8C68E6] text-center">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                              remainingAmount,
                            )}
                          </p>
                          <a
                            href={paymentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 text-xs text-[#8C68E6] hover:text-[#7552cc] underline"
                            >
                              Hoặc nhấn để mở link thanh toán
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : remainingAmount === 0 && paidAmount > 0 && !booking.cancelledAt ? (
                    <div>
                      {/* <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-green-900">Đã thanh toán đầy đủ</p>
                            <p className="text-xs text-green-700 mt-1">Booking này đã được thanh toán hoàn tất</p>
                          </div>
                        </div>
                      </div> */}
                    </div>
                  ) : null}

                  {booking.paymentHistory && booking.paymentHistory.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Lịch sử thanh toán</h3>
                      <div className="space-y-2">
                        {booking.paymentHistory.map((payment) => (
                          <div key={payment.transactionId} className="bg-slate-50 rounded-lg p-3 text-xs">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-slate-900 text-xs truncate">
                                {payment.transactionCode}
                              </span>
                              {getStatusBadge(payment.status)}
                            </div>
                            <div className="space-y-1 text-slate-600">
                              <div>
                                <span className="text-slate-500">Số tiền:</span>{" "}
                                <span className="font-medium">
                                  {new Intl.NumberFormat("vi-VN").format(payment.amount)}đ
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">PT:</span> {payment.paymentMethod}
                              </div>
                              <div>
                                <span className="text-slate-500">Loại:</span> {payment.transactionType}
                              </div>
                            </div>
                            <div className="text-slate-500 mt-1 text-xs">
                              {payment.processedBy} -{" "}
                              {format(new Date(payment.processedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {booking.bookingHistory && booking.bookingHistory.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Lịch sử thay đổi</h3>
                      <div className="space-y-2">
                        {booking.bookingHistory.map((history, index) => (
                          <div key={index} className="bg-slate-50 rounded-lg p-3 text-xs">
                            <div className="flex items-start justify-between mb-1 gap-2">
                              <span className="font-medium text-slate-900 text-xs">{history.changeType}</span>
                              <span className="text-slate-500 text-xs whitespace-nowrap">
                                {format(new Date(history.changedAt), "dd/MM HH:mm", { locale: vi })}
                              </span>
                            </div>
                            {(history.oldValue || history.newValue) && (
                              <div className="text-slate-600 text-xs">
                                {history.oldValue && <span className="line-through mr-2">{history.oldValue}</span>}
                                {history.newValue && (
                                  <span className="font-medium text-[#8C68E6]">{history.newValue}</span>
                                )}
                              </div>
                            )}
                            {history.reason && (
                              <p className="text-slate-500 italic mt-1 text-xs">Lý do: {history.reason}</p>
                            )}
                            <p className="text-slate-500 mt-1 text-xs">Bởi: {history.changedBy}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
