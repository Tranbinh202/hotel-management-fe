"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle2, XCircle, Calendar, MapPin, Users, CreditCard, ArrowRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { bookingsApi } from "@/lib/api/bookings"
import type { BookingDetails } from "@/lib/types/api"
import { formatCurrency } from "@/lib/utils/format"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export default function PaymentCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [bookingId, setBookingId] = useState<string>("")
  const [verificationKey, setVerificationKey] = useState<string>("")

  useEffect(() => {
    const fetchBookingDetails = async () => {
      const id = searchParams.get("bookingId")
      const key = searchParams.get("key")
      const paymentStatus = searchParams.get("status")

      console.log("[v0] Payment callback received:", { id, key, paymentStatus })

      if (!id || !key) {
        console.error("[v0] Missing required parameters")
        setStatus("failed")
        return
      }

      setBookingId(id)
      setVerificationKey(key)

      // Check payment status first
      if (paymentStatus === "CANCELLED" || paymentStatus === "cancelled" || paymentStatus === "failed") {
        setStatus("failed")
        return
      }

      // Fetch booking details to display
      try {
        const response = await bookingsApi.getByIdWithKey(Number.parseInt(id), key)
        if (response.isSuccess && response.data) {
          setBooking(response.data)
          setStatus("success")
        } else {
          setStatus("failed")
        }
      } catch (error) {
        console.error("[v0] Error fetching booking:", error)
        setStatus("failed")
      }
      // </CHANGE>
    }

    fetchBookingDetails()
  }, [searchParams])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4 animate-fade-in-up">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
          <h2 className="text-2xl font-serif font-bold">Đang tải thông tin đặt phòng...</h2>
          <p className="text-muted-foreground leading-loose">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="max-w-md w-full p-8 text-center space-y-6 glass-effect animate-scale-in">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="h-12 w-12 text-rose-600" />
          </div>
          <h2 className="text-3xl font-serif font-bold">Thanh toán thất bại</h2>
          <p className="text-muted-foreground leading-loose">
            Giao dịch thanh toán không thành công hoặc đã bị hủy. Vui lòng thử lại hoặc liên hệ hỗ trợ.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push("/")} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Về trang chủ
            </Button>
            <Button onClick={() => router.push("/my-bookings")} className="luxury-gradient">
              Xem đơn đặt phòng
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
        {/* Success Header */}
        <div className="text-center space-y-4 glass-effect p-8 rounded-2xl">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 animate-float" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Thanh toán thành công!</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Cảm ơn bạn đã thanh toán. Dưới đây là thông tin đặt phòng của bạn.
          </p>
        </div>

        {/* Booking Details */}
        {booking && (
          <Card className="glass-effect border-primary/10">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-xl font-serif flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Thông tin đặt phòng #{booking.bookingCode}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Guest Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Thông tin khách hàng
                </h3>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Họ tên:</span>
                    <span className="font-medium">{booking.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{booking.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số điện thoại:</span>
                    <span className="font-medium">{booking.phoneNumber}</span>
                  </div>
                </div>
              </div>

              {/* Booking Dates */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Thời gian lưu trú
                </h3>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nhận phòng:</span>
                    <span className="font-medium">
                      {format(new Date(booking.checkInDate), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trả phòng:</span>
                    <span className="font-medium">
                      {format(new Date(booking.checkOutDate), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số đêm:</span>
                    <span className="font-medium">{booking.totalNights} đêm</span>
                  </div>
                </div>
              </div>

              {/* Rooms */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Phòng đã đặt ({booking.rooms?.length || 0})
                </h3>
                <div className="space-y-2">
                  {booking.rooms?.map((room, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg text-sm"
                    >
                      <div>
                        <p className="font-medium">{room.roomTypeName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Users className="h-3 w-3" />
                          {room.numberOfGuest} khách
                        </p>
                      </div>
                      <span className="font-semibold">{formatCurrency(room.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="space-y-3 pt-4 border-t border-border/50">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Tổng hợp thanh toán
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tổng tiền phòng:</span>
                    <span className="font-medium">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/50">
                    <span>Tổng cộng:</span>
                    <span className="text-primary">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => router.push("/")} variant="outline" size="lg" className="flex-1">
            <Home className="h-5 w-5 mr-2" />
            Về trang chủ
          </Button>
          <Button
            onClick={() => router.push(`/booking/${bookingId}/${verificationKey}`)}
            size="lg"
            className="flex-1 luxury-gradient"
          >
            Xem chi tiết đặt phòng
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
  // </CHANGE>
}
