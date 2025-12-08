"use client"

import { useBookingByToken } from "@/lib/hooks/use-bookings"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  CreditCard,
  Hotel,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  Sparkles,
  Mail,
  Phone,
  Download,
  Share2,
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useParams } from "next/navigation"

export default function BookingDetailsPage() {
  const params = useParams()
  const token = params.key as string

  const { data, isLoading, error } = useBookingByToken(token)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4 animate-fade-in-up">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground leading-loose">Đang tải thông tin đặt phòng...</p>
        </div>
      </div>
    )
  }

  if (error || !data?.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="max-w-md w-full p-8 text-center space-y-4 glass-effect animate-scale-in">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-foreground">Không tìm thấy đặt phòng</h2>
          <p className="text-muted-foreground leading-loose">
            Không thể tải thông tin đặt phòng. Vui lòng kiểm tra lại đường link hoặc liên hệ hỗ trợ.
          </p>
          <Button onClick={() => (window.location.href = "/")} className="luxury-gradient mt-4">
            Về trang chủ
          </Button>
        </div>
      </div>
    )
  }

  const booking = data.data

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20 px-4 py-1.5">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Đã thanh toán
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20 px-4 py-1.5">
            <Clock className="h-4 w-4 mr-2" />
            Chờ thanh toán
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-rose-500/10 text-rose-700 border-rose-500/20 hover:bg-rose-500/20 px-4 py-1.5">
            <XCircle className="h-4 w-4 mr-2" />
            Đã hủy
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="px-4 py-1.5">
            <AlertCircle className="h-4 w-4 mr-2" />
            {status}
          </Badge>
        )
    }
  }

  const getDepositBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return (
          <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20 px-4 py-1.5">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Đã đặt cọc
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-orange-500/10 text-orange-700 border-orange-500/20 hover:bg-orange-500/20 px-4 py-1.5">
            <Clock className="h-4 w-4 mr-2" />
            Chưa đặt cọc
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="px-4 py-1.5">
            <AlertCircle className="h-4 w-4 mr-2" />
            {status}
          </Badge>
        )
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Đặt phòng #${booking.bookingId}`,
          text: `Chi tiết đặt phòng tại khách sạn`,
          url: window.location.href,
        })
        .catch(() => { })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Đã sao chép đường link vào clipboard!")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 luxury-gradient opacity-95" />
        <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in-up">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <CheckCircle2 className="h-8 w-8 text-white animate-float" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
                    Đặt phòng thành công!
                  </h1>
                  <p className="text-white/70 text-lg mt-1 leading-relaxed">
                    Mã đặt phòng <span className="font-mono font-semibold text-white">#{booking.bookingId}</span>
                  </p>
                </div>
              </div>
              <p className="text-white/80 text-base leading-loose max-w-2xl">
                Cảm ơn bạn đã đặt phòng tại khách sạn của chúng tôi. Thông tin chi tiết đặt phòng đã được gửi đến email
                của bạn.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {getStatusBadge(booking.paymentStatus)}
              {getDepositBadge(booking.depositStatus)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-8">
            <Button
              onClick={handleShare}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Chia sẻ
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Download className="h-4 w-4 mr-2" />
              In phiếu đặt phòng
            </Button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content - 8 columns */}
          <div className="lg:col-span-8 space-y-8">
            {/* Room Information */}
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-xl animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Hotel className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-foreground">Thông tin phòng</h2>
              </div>

              <div className="space-y-6">
                {/* Room names */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">Phòng đã đặt</p>
                  <div className="flex flex-wrap gap-3">
                    {booking.roomNames.map((roomName, idx) => (
                      <div
                        key={idx}
                        className="px-5 py-3 bg-primary/5 border border-primary/10 rounded-2xl text-foreground font-medium text-lg"
                      >
                        {roomName}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Check-in and Check-out dates */}
                <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-border/50">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      Nhận phòng
                    </div>
                    <p className="text-2xl font-serif font-bold text-foreground">
                      {format(new Date(booking.checkInDate), "dd", { locale: vi })}
                    </p>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {format(new Date(booking.checkInDate), "MMMM yyyy", { locale: vi })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.checkInDate), "EEEE", { locale: vi })}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      Trả phòng
                    </div>
                    <p className="text-2xl font-serif font-bold text-foreground">
                      {format(new Date(booking.checkOutDate), "dd", { locale: vi })}
                    </p>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {format(new Date(booking.checkOutDate), "MMMM yyyy", { locale: vi })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.checkOutDate), "EEEE", { locale: vi })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div
              className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-xl animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-foreground">Thông tin khách hàng</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Họ và tên</p>
                    <p className="text-lg font-semibold text-foreground leading-relaxed">{booking.customerName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <div
                className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-xl animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-accent/10 rounded-xl">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-foreground">Yêu cầu đặc biệt</h2>
                </div>
                <p className="text-foreground leading-loose text-lg">{booking.specialRequests}</p>
              </div>
            )}

            {/* Important Notice */}
            {booking.paymentStatus === "Pending" && (
              <div
                className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-3xl p-6 animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-500/10 rounded-xl flex-shrink-0">
                    <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-lg">
                      Vui lòng hoàn tất thanh toán
                    </h3>
                    <p className="text-amber-800 dark:text-amber-200 leading-loose">
                      Đặt phòng của bạn sẽ được xác nhận sau khi hoàn tất thanh toán. Vui lòng thanh toán trong thời
                      gian sớm nhất để đảm bảo phòng được giữ cho bạn.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Payment Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Payment Card */}
              <div
                className="bg-gradient-to-br from-primary via-primary to-primary/90 text-white rounded-3xl p-8 shadow-2xl animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="h-6 w-6" />
                  <h2 className="text-2xl font-serif font-bold">Thanh toán</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-white/70 text-sm">Tổng tiền phòng</p>
                    <p className="text-4xl font-bold font-serif">{booking.totalAmount.toLocaleString("vi-VN")} ₫</p>
                  </div>

                  <div className="h-px bg-white/20" />

                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Tiền cọc (30%)</span>
                    <span className="text-xl font-bold">{booking.depositAmount.toLocaleString("vi-VN")} ₫</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Còn lại</span>
                    <span className="text-xl font-bold">
                      {(booking.totalAmount - booking.depositAmount).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>

                  {booking.paymentStatus === "Pending" && booking.paymentUrl && (
                    <>
                      <div className="h-px bg-white/20" />
                      <Button
                        asChild
                        className="w-full bg-white text-primary hover:bg-white/90 font-semibold text-lg py-6 rounded-2xl shadow-lg"
                      >
                        <a href={booking.paymentUrl} target="_blank" rel="noopener noreferrer">
                          <CreditCard className="mr-2 h-5 w-5" />
                          Thanh toán ngay
                        </a>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Booking Info Card */}
              <div
                className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-xl animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                <h3 className="font-semibold text-foreground mb-4">Thông tin đặt phòng</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Ngày đặt</span>
                    <span className="text-foreground font-medium">
                      {format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Loại đặt phòng</span>
                    <Badge variant="outline" className="font-normal">
                      {booking.bookingType}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Support */}
              <div
                className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-xl animate-fade-in-up"
                style={{ animationDelay: "0.5s" }}
              >
                <h3 className="font-semibold text-foreground mb-4">Cần hỗ trợ?</h3>
                <p className="text-sm text-muted-foreground leading-loose mb-4">
                  Nếu bạn có bất kỳ câu hỏi nào về đặt phòng, vui lòng liên hệ với chúng tôi.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-foreground">1900 xxxx</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-foreground">support@hotel.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
