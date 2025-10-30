"use client"

import { useMyBookings } from "@/lib/hooks/use-bookings"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  CreditCard,
  Hotel,
  MapPin,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export default function MyBookingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { data, isLoading, error } = useMyBookings()
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/my-bookings")
    }
  }, [user, authLoading, router])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4 animate-fade-in-up">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground leading-loose">Đang tải danh sách đặt phòng...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 glass-effect animate-scale-in">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-foreground">Không thể tải dữ liệu</h2>
          <p className="text-muted-foreground leading-loose">
            Đã xảy ra lỗi khi tải danh sách đặt phòng. Vui lòng thử lại sau.
          </p>
          <Button onClick={() => window.location.reload()} className="luxury-gradient">
            Thử lại
          </Button>
        </Card>
      </div>
    )
  }

  const bookings = data?.data || []
  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true
    if (filter === "pending") return booking.paymentStatus === "Pending"
    if (filter === "confirmed") return booking.paymentStatus === "Paid"
    if (filter === "cancelled") return booking.paymentStatus === "Cancelled"
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Đã thanh toán
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Chờ thanh toán
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Đã hủy
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
    }
  }

  const getDepositBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Đã đặt cọc
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Chưa đặt cọc
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header Section */}
      <div className="luxury-gradient text-white py-16 px-4 animate-fade-in-up">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Hotel className="h-8 w-8 animate-float" />
            <h1 className="text-4xl md:text-5xl font-serif font-bold">Lịch sử đặt phòng</h1>
          </div>
          <p className="text-white/80 text-lg leading-loose max-w-2xl">
            Quản lý và theo dõi lịch sử đặt phòng của bạn tại khách sạn
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={filter === "all" ? "luxury-gradient" : ""}
          >
            Tất cả ({bookings.length})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            className={filter === "pending" ? "luxury-gradient" : ""}
          >
            Chờ thanh toán ({bookings.filter((b) => b.paymentStatus === "Pending").length})
          </Button>
          <Button
            variant={filter === "confirmed" ? "default" : "outline"}
            onClick={() => setFilter("confirmed")}
            className={filter === "confirmed" ? "luxury-gradient" : ""}
          >
            Đã xác nhận ({bookings.filter((b) => b.paymentStatus === "Paid").length})
          </Button>
          <Button
            variant={filter === "cancelled" ? "default" : "outline"}
            onClick={() => setFilter("cancelled")}
            className={filter === "cancelled" ? "luxury-gradient" : ""}
          >
            Đã hủy ({bookings.filter((b) => b.paymentStatus === "Cancelled").length})
          </Button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="p-12 text-center glass-effect animate-scale-in">
            <Hotel className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
            <h3 className="text-2xl font-serif font-bold text-foreground mb-3">Chưa có đặt phòng nào</h3>
            <p className="text-muted-foreground leading-loose mb-6 max-w-md mx-auto">
              {filter === "all"
                ? "Bạn chưa có đặt phòng nào. Hãy khám phá các phòng của chúng tôi và đặt phòng ngay hôm nay!"
                : `Không có đặt phòng nào ở trạng thái "${filter}"`}
            </p>
            <Link href="/rooms">
              <Button className="luxury-gradient">
                Khám phá phòng
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking, index) => (
              <Card
                key={booking.bookingId}
                className="p-6 glass-effect hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Section - Booking Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-serif font-bold text-foreground">
                            Mã đặt phòng #{booking.bookingId}
                          </h3>
                          {getStatusBadge(booking.paymentStatus)}
                          {getDepositBadge(booking.depositStatus)}
                        </div>
                        <p className="text-sm text-muted-foreground leading-loose">
                          Đặt ngày {format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </p>
                      </div>
                    </div>

                    {/* Room Names */}
                    <div className="flex items-start gap-3">
                      <Hotel className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Phòng đã đặt</p>
                        <div className="flex flex-wrap gap-2">
                          {booking.roomNames.map((roomName, idx) => (
                            <Badge key={idx} variant="secondary" className="font-normal">
                              {roomName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Nhận phòng</p>
                          <p className="text-foreground font-medium leading-loose">
                            {format(new Date(booking.checkInDate), "dd/MM/yyyy", { locale: vi })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Trả phòng</p>
                          <p className="text-foreground font-medium leading-loose">
                            {format(new Date(booking.checkOutDate), "dd/MM/yyyy", { locale: vi })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {booking.specialRequests && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Yêu cầu đặc biệt</p>
                          <p className="text-foreground leading-loose">{booking.specialRequests}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Payment Info */}
                  <div className="lg:w-80 space-y-4">
                    <Card className="p-4 bg-primary/5 border-primary/20">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Tổng tiền</span>
                          <span className="text-lg font-bold text-foreground">
                            {booking.totalAmount.toLocaleString("vi-VN")} ₫
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Tiền cọc (30%)</span>
                          <span className="text-base font-semibold text-accent">
                            {booking.depositAmount.toLocaleString("vi-VN")} ₫
                          </span>
                        </div>
                        <div className="pt-3 border-t border-primary/20">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CreditCard className="h-4 w-4" />
                            <span>Loại đặt phòng: {booking.bookingType}</span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {booking.paymentStatus === "Pending" && booking.paymentUrl && (
                        <Button asChild className="w-full luxury-gradient">
                          <a href={booking.paymentUrl} target="_blank" rel="noopener noreferrer">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Thanh toán ngay
                          </a>
                        </Button>
                      )}
                      <Button asChild variant="outline" className="w-full bg-transparent">
                        <Link href={`/my-bookings/${booking.bookingId}`}>
                          Xem chi tiết
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
