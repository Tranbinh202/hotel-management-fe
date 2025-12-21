"use client"

import { Button } from "@/components/ui/button"
import { XCircle, Home, Phone, Mail, RefreshCcw, ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function BookingFailurePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reason = searchParams.get("reason") || "unknown"

  const getErrorMessage = () => {
    switch (reason) {
      case "not_available":
        return "Phòng đã hết trong khoảng thời gian bạn chọn. Vui lòng chọn ngày khác hoặc loại phòng khác."
      case "payment_failed":
        return "Không thể tạo liên kết thanh toán. Vui lòng thử lại hoặc liên hệ với chúng tôi."
      case "timeout":
        return "Phiên đặt phòng đã hết hạn. Vui lòng thử lại."
      case "invalid_data":
        return "Thông tin đặt phòng không hợp lệ. Vui lòng kiểm tra lại thông tin và thử lại."
      case "unknown":
        return "Đã có lỗi xảy ra trong quá trình xử lý đặt phòng của bạn. Vui lòng thử lại hoặc liên hệ với chúng tôi."
      default:
        // Decode the custom error message from the API
        try {
          return decodeURIComponent(reason)
        } catch {
          return reason
        }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/5 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="glass-effect rounded-3xl p-8 md:p-12 text-center animate-scale-in">
          {/* Error Icon */}
          <div className="mb-8 animate-float">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-destructive to-destructive/80 rounded-full flex items-center justify-center shadow-2xl">
              <XCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 py-2 leading-normal animate-fade-in-up">
            <span className="bg-gradient-to-r from-destructive to-destructive/80 bg-clip-text text-transparent">
              Đặt phòng không thành công
            </span>
          </h1>

          <p
            className="text-lg text-muted-foreground mb-8 leading-loose animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            {getErrorMessage()}
          </p>

          {reason === "not_available" && (
            <div
              className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-8 animate-fade-in-up"
              style={{ animationDelay: "0.15s" }}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium text-amber-900 dark:text-amber-100 mb-2 leading-loose">
                    Phòng không còn trống
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-200 leading-loose">
                    Các phòng bạn chọn đã được đặt bởi khách hàng khác. Vui lòng chọn ngày khác hoặc loại phòng khác.
                  </p>
                </div>
              </div>
            </div>
          )}


          {/* Contact Support */}
          <div className="bg-muted/50 rounded-2xl p-6 mb-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <h3 className="font-serif text-lg font-semibold mb-4">Cần hỗ trợ?</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-loose">
              Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
            </p>
            <div className="space-y-3 text-sm leading-loose">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>Hotline: 1900 xxxx</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>Email: support@hotel.com</span>
              </div>
            </div>
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
                Thử lại
              </Link>
            </Button>
            <Button asChild size="lg" className="flex-1 luxury-gradient text-white">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Về trang chủ
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
