"use client"

import { Button } from "@/components/ui/button"
import { XCircle, Home, RefreshCcw, ArrowLeft, AlertCircle, Clock, CreditCard } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function BookingCancelPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Extract PayOS callback parameters
  const code = searchParams.get("code")
  const bookingId = searchParams.get("id")
  const cancel = searchParams.get("cancel")
  const status = searchParams.get("status")
  const orderCode = searchParams.get("orderCode")

  useEffect(() => {
    // Log cancellation for debugging
    console.log("[v0] Payment cancelled:", {
      code,
      bookingId,
      cancel,
      status,
      orderCode,
    })
  }, [code, bookingId, cancel, status, orderCode])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-500/5 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="glass-effect rounded-3xl p-8 md:p-12 text-center animate-scale-in">
          {/* Cancel Icon */}
          <div className="mb-8 animate-float">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl">
              <XCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Cancel Message */}
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 py-2 leading-normal animate-fade-in-up">
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
              Thanh toán đã bị hủy
            </span>
          </h1>

          <p
            className="text-lg text-muted-foreground mb-8 leading-loose animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Bạn đã hủy thanh toán cho đơn đặt phòng. Đặt phòng của bạn chưa được xác nhận.
          </p>

          {/* Booking Info */}
          {(bookingId || orderCode) && (
            <div
              className="bg-muted/50 rounded-2xl p-6 mb-8 text-left animate-fade-in-up"
              style={{ animationDelay: "0.15s" }}
            >
              <h3 className="font-serif text-lg font-semibold mb-4">Thông tin đơn hàng</h3>
              <div className="space-y-3 text-sm leading-loose">
                {bookingId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã đặt phòng:</span>
                    <span className="font-mono font-medium">{bookingId}</span>
                  </div>
                )}
                {orderCode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã đơn hàng:</span>
                    <span className="font-mono font-medium">{orderCode}</span>
                  </div>
                )}
                {status && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trạng thái:</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">{status}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div
            className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-medium text-amber-900 dark:text-amber-100 mb-2 leading-loose">Lưu ý quan trọng</p>
                <ul className="text-sm text-amber-800 dark:text-amber-200 leading-loose space-y-2">
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Phòng sẽ chỉ được giữ trong thời gian giới hạn. Vui lòng hoàn tất thanh toán sớm.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CreditCard className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Bạn có thể thử lại thanh toán hoặc chọn phương thức thanh toán khác.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* What Happened */}
          <div
            className="bg-muted/50 rounded-2xl p-6 mb-8 text-left animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <h3 className="font-serif text-lg font-semibold mb-4">Điều gì đã xảy ra?</h3>
            <ul className="space-y-3 text-sm text-muted-foreground leading-loose list-disc list-inside">
              <li>Bạn đã chọn hủy thanh toán trên trang thanh toán PayOS</li>
              <li>Đơn đặt phòng của bạn chưa được xác nhận và thanh toán</li>
              <li>Phòng vẫn có thể được đặt bởi khách hàng khác nếu bạn không hoàn tất thanh toán</li>
              <li>Không có khoản tiền nào được trừ từ tài khoản của bạn</li>
            </ul>
          </div>

          {/* Next Steps */}
          <div
            className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-8 text-left animate-fade-in-up"
            style={{ animationDelay: "0.35s" }}
          >
            <h3 className="font-serif text-lg font-semibold mb-4">Bước tiếp theo</h3>
            <ul className="space-y-3 text-sm leading-loose list-decimal list-inside">
              <li>Kiểm tra lại thông tin đặt phòng và ngày tháng</li>
              <li>Chuẩn bị phương thức thanh toán (thẻ ngân hàng, ví điện tử...)</li>
              <li>Thử lại thanh toán để hoàn tất đặt phòng</li>
              <li>Hoặc liên hệ với chúng tôi nếu cần hỗ trợ</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button variant="outline" size="lg" className="flex-1 bg-transparent" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1 bg-transparent">
              <Link href="/rooms">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Đặt phòng mới
              </Link>
            </Button>
            <Button asChild size="lg" className="flex-1 luxury-gradient text-white">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Về trang chủ
              </Link>
            </Button>
          </div>

          {/* Support Link */}
          <div className="mt-8 pt-8 border-t animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
            <p className="text-sm text-muted-foreground leading-loose">
              Cần hỗ trợ?{" "}
              <Link href="/contact" className="text-primary hover:underline font-medium">
                Liên hệ với chúng tôi
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
