"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Booking } from "@/lib/types/api"

interface RecentBookingsProps {
  bookings: Booking[]
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận"
      case "pending":
        return "Chờ xác nhận"
      case "cancelled":
        return "Đã hủy"
      case "completed":
        return "Hoàn thành"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Đặt phòng gần đây</h3>
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Chưa có đặt phòng nào</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.bookingId} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-slate-900">
                    {booking.user?.firstName} {booking.user?.lastName}
                  </div>
                  <div className="text-sm text-slate-600">
                    {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">₫{booking.totalPrice.toLocaleString("vi-VN")}</div>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                  >
                    {getStatusText(booking.status)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
