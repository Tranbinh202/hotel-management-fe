"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import type { BookingManagementDetails } from "@/lib/types/api"

interface BookingDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: BookingManagementDetails | null
  isLoading?: boolean
}

export function BookingDetailModal({ open, onOpenChange, booking, isLoading }: BookingDetailModalProps) {
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[90vh]">
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-[#8C68E6] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!booking) return null

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
      <DialogContent className="min-w-6xl max-h-[90vh] p-0">
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
                {booking.customer && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Thông tin khách hàng</h3>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-slate-500">Họ tên</p>
                          <p className="text-sm font-medium text-slate-900">{booking.customer.fullName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Email</p>
                          <p className="text-sm text-slate-700">{booking.customer.email || "Chưa có"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Số điện thoại</p>
                          <p className="text-sm text-slate-700">{booking.customer.phoneNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">CMND/CCCD</p>
                          <p className="text-sm text-slate-700">{booking.customer.identityCard || "Chưa có"}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-slate-500">Địa chỉ</p>
                          <p className="text-sm text-slate-700">{booking.customer.address || "Chưa có"}</p>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white rounded-md p-2">
                          <p className="text-lg font-bold text-[#8C68E6]">{booking.customer.totalBookings}</p>
                          <p className="text-xs text-slate-500">Tổng booking</p>
                        </div>
                        <div className="bg-white rounded-md p-2">
                          <p className="text-lg font-bold text-[#8C68E6]">
                            {new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(
                              booking.customer.totalSpent,
                            )}
                            đ
                          </p>
                          <p className="text-xs text-slate-500">Tổng chi tiêu</p>
                        </div>
                        <div className="bg-white rounded-md p-2">
                          <p className="text-xs font-medium text-slate-700">
                            {booking.customer.lastBookingDate
                              ? format(new Date(booking.customer.lastBookingDate), "dd/MM/yyyy")
                              : "N/A"}
                          </p>
                          <p className="text-xs text-slate-500">Booking cuối</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                        <p className="text-sm font-medium text-slate-900">{booking.totalNights} đêm</p>
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

                {booking.rooms && booking.rooms.length > 0 && (
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
                                  <p className="font-medium text-slate-900">{room.numberOfNights}</p>
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
                )}

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
                <div className="sticky top-0">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Tổng hợp thanh toán</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tổng tiền phòng</span>
                      <span className="font-medium text-slate-900">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                          booking.subTotal,
                        )}
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
                          booking.paidAmount,
                        )}
                      </span>
                    </div>
                    {booking.remainingAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Còn lại</span>
                        <span className="font-medium text-red-600">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                            booking.remainingAmount,
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
