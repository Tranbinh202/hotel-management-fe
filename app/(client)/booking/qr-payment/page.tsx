"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { bookingsApi } from "@/lib/api/bookings"
import { CheckCircle2, Copy, Loader2, AlertTriangle, XCircle, Banknote, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

function QRPaymentContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState<"pending" | "confirmed" | "cancelled">("pending")
    const [timeLeft, setTimeLeft] = useState<number>(15 * 60) // 15 minutes in seconds

    // Get data from URL params
    const bookingId = Number(searchParams.get("bookingId"))
    const token = searchParams.get("token")
    const qrCodeUrl = searchParams.get("qrCode")
    const amount = Number(searchParams.get("amount"))
    const accountNo = searchParams.get("accountNo")
    const accountName = searchParams.get("accountName")
    const bankName = searchParams.get("bankName") || "MB Bank"
    const description = searchParams.get("description") || `Dat coc booking ${bookingId}`
    const deadlineStr = searchParams.get("deadline")

    // Calculate initial time left based on deadline
    useEffect(() => {
        if (deadlineStr) {
            const deadline = new Date(deadlineStr)
            const now = new Date()
            const diffMs = deadline.getTime() - now.getTime()
            const diffSeconds = Math.floor(diffMs / 1000)
            if (diffSeconds > 0) {
                setTimeLeft(diffSeconds)
            } else {
                setTimeLeft(0)
            }
        }
    }, [deadlineStr])

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) {
            // Auto-cancel booking when time runs out
            setPaymentStatus("cancelled")
            return
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft])

    // Redirect if missing critical params
    useEffect(() => {
        if (!bookingId || !token) {
            router.push("/")
        }
    }, [bookingId, token, router])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast({
            title: "Đã sao chép",
            description: `Đã sao chép ${label} vào clipboard`,
        })
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
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

    // Payment confirmed state
    if (paymentStatus === "confirmed") {
        return (
            <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 py-12 px-4 flex items-center justify-center">
                <Card className="w-full max-w-md text-center shadow-xl border-green-200 bg-green-50/50 animate-scale-in">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-800">Thanh toán đang được xử lý</CardTitle>
                        <CardDescription className="text-green-700 leading-loose">
                            Cảm ơn bạn đã xác nhận thanh toán. Chúng tôi sẽ kiểm tra bill ngân hàng và gửi email xác nhận cho bạn
                            trong thời gian sớm nhất.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={() => router.push(`/booking/${token}`)}
                            className="w-full luxury-gradient text-white"
                        >
                            Xem chi tiết booking
                        </Button>
                        <Button onClick={() => router.push("/")} variant="outline" className="w-full">
                            Về trang chủ
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Booking cancelled state
    if (paymentStatus === "cancelled" || timeLeft === 0) {
        return (
            <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 py-12 px-4 flex items-center justify-center">
                <Card className="w-full max-w-md text-center shadow-xl border-red-200 bg-red-50/50 animate-scale-in">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl text-red-800">
                            {timeLeft === 0 ? "Booking đã hết hạn" : "Booking đã hủy"}
                        </CardTitle>
                        <CardDescription className="text-red-700 leading-loose">
                            {timeLeft === 0
                                ? "Booking của bạn đã tự động hủy do không thanh toán trong thời gian quy định (15 phút)."
                                : "Booking của bạn đã được hủy. Nếu bạn đã chuyển khoản, vui lòng liên hệ bộ phận CSKH để được hoàn tiền."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push("/")} variant="outline" className="w-full">
                            Về trang chủ
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // QR Payment state
    return (
        <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 py-8 px-4">
            <div className="container mx-auto max-w-2xl">
                <Card className="shadow-2xl animate-fade-in-up">
                    <CardHeader className="text-center border-b luxury-gradient text-white rounded-t-lg">
                        <div className="mx-auto bg-white/20 p-3 rounded-full mb-3 w-fit">
                            <Banknote className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl">Đặt phòng thành công!</CardTitle>
                        <CardDescription className="text-white/90 leading-relaxed">
                            Vui lòng thanh toán để hoàn tất đặt phòng
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-6">
                        {/* Countdown Timer */}
                        <div
                            className={cn(
                                "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg flex gap-3 text-sm animate-pulse",
                                timeLeft < 300 && "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
                            )}
                        >
                            <Clock className={cn("w-5 h-5 shrink-0", timeLeft < 300 ? "text-red-600" : "text-amber-600")} />
                            <div className="flex-1">
                                <p className={cn("font-semibold", timeLeft < 300 ? "text-red-900 dark:text-red-100" : "text-amber-900 dark:text-amber-100")}>
                                    Thời gian còn lại: <span className="text-2xl font-mono">{formatTime(timeLeft)}</span>
                                </p>
                                <p className={cn(timeLeft < 300 ? "text-red-800 dark:text-red-200" : "text-amber-800 dark:text-amber-200")}>
                                    Booking sẽ tự động hủy nếu không nhận được thanh toán.
                                </p>
                            </div>
                        </div>

                        {/* Important Notice */}
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg flex gap-3 text-sm">
                            <AlertTriangle className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="font-semibold text-blue-900 dark:text-blue-100">Lưu ý quan trọng:</p>
                                <p className="text-blue-800 dark:text-blue-200 leading-loose">
                                    Vui lòng chuyển khoản <span className="font-bold">ĐÚNG SỐ TIỀN</span> và{" "}
                                    <span className="font-bold">NỘI DUNG</span> bên dưới. Sau khi chuyển khoản, nhấn nút "Tôi đã chuyển
                                    khoản" để thông báo cho chúng tôi.
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 items-center">
                            {/* QR Code Section */}
                            <div className="flex flex-col items-center space-y-3">
                                <div className="relative border-4 border-primary rounded-xl p-2 bg-white shadow-lg">
                                    {qrCodeUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={qrCodeUrl} alt="QR Payment" className="w-48 h-48 object-contain" />
                                    ) : (
                                        <div className="w-48 h-48 bg-muted flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground text-center">Quét mã QR bằng ứng dụng ngân hàng</p>
                            </div>

                            {/* Bank Info Section */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg text-foreground border-b pb-2">Thông tin chuyển khoản</h3>

                                <div className="space-y-3 font-medium">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Ngân hàng:</span>
                                        <span className="text-foreground font-semibold">{bankName}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Chủ tài khoản:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-foreground uppercase font-semibold">{accountName || "STAYHUB"}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => copyToClipboard(accountName || "STAYHUB", "Chủ tài khoản")}
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Số tài khoản:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-bold text-primary">{accountNo || "..."}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => copyToClipboard(accountNo || "", "Số tài khoản")}
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Số tiền:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-bold text-primary">{formatPrice(amount || 0)}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => copyToClipboard(amount?.toString() || "", "Số tiền")}
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 text-sm">
                                        <span className="text-muted-foreground">Nội dung chuyển khoản:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-mono font-bold text-foreground bg-muted px-3 py-2 rounded-lg flex-1">
                                                {description}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => copyToClipboard(description, "Nội dung")}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-amber-600 dark:text-amber-400">
                                            ⚠️ Vui lòng ghi ĐÚNG nội dung để hệ thống tự động xác nhận
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between border-t">
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto text-destructive border-destructive/20 hover:bg-destructive/10"
                                onClick={handleCancelBooking}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                                Hủy booking
                            </Button>

                            <Button
                                className="w-full sm:w-auto luxury-gradient text-white"
                                onClick={handleConfirmPayment}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                )}
                                Tôi đã chuyển khoản
                            </Button>
                        </div>

                        {/* View booking details link */}
                        <div className="text-center pt-2">
                            <Button variant="link" onClick={() => router.push(`/booking/${token}`)} className="text-sm">
                                Xem chi tiết booking →
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function QRPaymentPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            }
        >
            <QRPaymentContent />
        </Suspense>
    )
}
