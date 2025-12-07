"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { bookingsApi } from "@/lib/api/bookings"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

function ConfirmBookingContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [isConfirming, setIsConfirming] = useState(true)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [bookingId, setBookingId] = useState<number | null>(null)

    useEffect(() => {
        const confirmBooking = async () => {
            if (!token) {
                setError("Token không hợp lệ")
                setIsConfirming(false)
                return
            }

            try {
                const response = await bookingsApi.confirmGuestBooking(token)
                if (response.isSuccess) {
                    setSuccess(true)
                    if (response.data?.bookingId) {
                        setBookingId(response.data.bookingId)
                    }
                } else {
                    setError(response.message || "Không thể xác nhận booking")
                }
            } catch (err: any) {
                setError(err.message || "Có lỗi xảy ra khi xác nhận booking")
            } finally {
                setIsConfirming(false)
            }
        }

        confirmBooking()
    }, [token])

    if (isConfirming) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
                <div className="glass-effect rounded-2xl p-8 max-w-md w-full text-center">
                    <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
                    <h1 className="text-2xl font-serif font-bold mb-2">Đang xác nhận...</h1>
                    <p className="text-muted-foreground">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
                <div className="glass-effect rounded-2xl p-8 max-w-md w-full text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-serif font-bold mb-2">Xác nhận thành công!</h1>
                    <p className="text-muted-foreground mb-6">
                        Booking của bạn đã được xác nhận. Chúng tôi sẽ gửi thông tin chi tiết qua email.
                    </p>

                    {bookingId && token && (
                        <Button
                            onClick={() => router.push(`/booking/track?token=${token}`)}
                            className="w-full luxury-gradient text-white"
                        >
                            Xem chi tiết booking
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
            <div className="glass-effect rounded-2xl p-8 max-w-md w-full text-center">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-serif font-bold mb-2">Xác nhận thất bại</h1>
                <p className="text-muted-foreground mb-6">{error || "Không thể xác nhận booking. Vui lòng thử lại sau."}</p>

                <Button onClick={() => router.push("/")} variant="outline" className="w-full">
                    Về trang chủ
                </Button>
            </div>
        </div>
    )
}

export default function ConfirmBookingPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            }
        >
            <ConfirmBookingContent />
        </Suspense>
    )
}
