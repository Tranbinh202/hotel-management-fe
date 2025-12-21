"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { bookingsApi } from "@/lib/api/bookings"
import { CheckCircle2, Copy, Loader2, Hotel, AlertTriangle, XCircle, Banknote, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function BookingSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "confirmed" | "cancelled">("pending")

  const bookingId = Number(searchParams.get("bookingId"))
  const token = searchParams.get("token")
  const qrCodeUrl = searchParams.get("qrCode") // URL or Base64
  const amount = Number(searchParams.get("amount"))
  const accountNo = searchParams.get("accountNo")
  const accountName = searchParams.get("accountName")

  useEffect(() => {
    if (!bookingId || !token) {
      // If critical params are missing, maybe redirect or show error?
      // router.push("/")
    }
  }, [bookingId, token, router])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Đã sao chép",
      description: `Đã sao chép ${label} vào clipboard`,
    })
  }

  const handleConfirmPayment = async () => {
    if (!bookingId) return

    setIsSubmitting(true)
    try {
      const response = await bookingsApi.guestConfirmPayment({
        bookingId,
        isCancel: false,
      })

      if (response.isSuccess) {
        setPaymentStatus("confirmed")
        toast({
          title: "Xác nhận thành công",
          description: "Chúng tôi đã nhận được thông báo thanh toán của bạn.",
        })
      } else {
        toast({
          title: "Lỗi",
          description: response.message || "Không thể xác nhận thanh toán",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Confirm payment error:", error)
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi xác nhận thanh toán",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!bookingId) return
    if (!confirm("Bạn có chắc chắn muốn hủy booking này?")) return

    setIsSubmitting(true)
    try {
      const response = await bookingsApi.guestConfirmPayment({
        bookingId,
        isCancel: true,
      })

      if (response.isSuccess) {
        setPaymentStatus("cancelled")
        toast({
          title: "Đã hủy booking",
          description: "Booking của bạn đã được hủy theo yêu cầu.",
        })
        // Redirect to failure/cancel page or stay here with updated status
      } else {
        toast({
          title: "Lỗi",
          description: response.message || "Không thể hủy booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Cancel booking error:", error)
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi hủy booking",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  if (paymentStatus === "confirmed") {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md text-center shadow-lg border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Thanh toán đang được xử lý</CardTitle>
            <CardDescription className="text-green-700">
              Cảm ơn bạn đã xác nhận thanh toán. Chúng tôi sẽ kiểm tra và gửi email xác nhận cho bạn trong thời gian sớm nhất.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => router.push("/")} variant="outline" className="border-green-200 text-green-700 hover:bg-green-100">
              Về trang chủ
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (paymentStatus === "cancelled") {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md text-center shadow-lg border-red-200 bg-red-50/50">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-800">Booking đã hủy</CardTitle>
            <CardDescription className="text-red-700">
              Booking của bạn đã được hủy. Nếu bạn đã chuyển khoản, vui lòng liên hệ bộ phận CSKH để được hoàn tiền.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => router.push("/")} variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
              Về trang chủ
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-lg animate-fade-in-up">
          <CardHeader className="relative text-center border-b bg-linear-to-r from-[#00008b] to-[#ffd700] text-white rounded-t-lg">
            <Badge className="absolute right-4 top-4 bg-amber-400/30 text-amber-950 border-amber-400/70 px-4 py-2 text-base font-semibold shadow-md ring-2 ring-amber-300/70">
              <Clock className="h-5 w-5 mr-2" />
              Chờ xác nhận
            </Badge>
            <div className="mx-auto bg-white/20 p-3 rounded-full mb-3 w-fit">
              <Banknote className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Đặt phòng thành công!</CardTitle>
            <CardDescription className="text-white/90">
              Vui lòng thanh toán để hoàn tất đặt phòng
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3 text-sm text-amber-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold">Lưu ý quan trọng:</p>
                <p>Booking của bạn sẽ tự động hủy sau <span className="font-bold">15 phút</span> nếu chưa nhận được thanh toán. Vui lòng chuyển khoản nhanh chóng.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* QR Code Section */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative border-4 border-slate-900 rounded-lg p-1 bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Payment" className="w-48 h-48 object-contain" />
                  ) : (
                    <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                      QR Code loading...
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500">Quét mã QR bằng ứng dụng ngân hàng</p>
              </div>

              {/* Bank Info Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-slate-900 border-b pb-2">Thông tin chuyển khoản</h3>

                <div className="space-y-3 font-medium">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Ngân hàng:</span>
                    <span className="text-slate-900">MB Bank</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Chủ tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 uppercase">{accountName || "STAYHUB"}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(accountName || "STAYHUB", "Chủ tài khoản")}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-[#00008b]">{accountNo || "..."}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(accountNo || "", "Số tài khoản")}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Số tiền:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-[#00008b]">{formatPrice(amount || 0)}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(amount?.toString() || "", "Số tiền")}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Nội dung:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">Dat coc booking {bookingId}</span>
                      {/* Note: The content logic should match what's in the instruction. The instruction says "Dat coc booking 123" */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between border-t mt-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={handleCancelBooking}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                Hủy booking
              </Button>

              <Button
                className="w-full sm:w-auto bg-gradient-to-r from-[#00008b] to-[#ffd700] hover:from-[#00006b] hover:to-[#e6c200] text-white border-0"
                onClick={handleConfirmPayment}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Tôi đã chuyển khoản
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
