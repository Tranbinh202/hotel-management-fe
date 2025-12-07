"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { bookingsApi } from "@/lib/api/bookings"
import { Loader2, CheckCircle2, XCircle, Clock, Mail, Phone, Calendar, CreditCard } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import type { BookingDetails } from "@/lib/types/api"

function TrackBookingContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [booking, setBooking] = useState<BookingDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchBooking = async () => {
            if (!token) {
                setError("Token không hợp lệ")
                setIsLoading(false)
                return
            }

            try {
                const response = await bookingsApi.checkBookingByToken(token)
                if (response.isSuccess) {
                    setBooking(response.data)
                } else {
                    setError(response.message || "Không tìm thấy booking")
                }
            } catch (err: any) {
                setError(err.message || "Có lỗi xảy ra khi tra cứu booking")
            } finally {
                setIsLoading(false)
            }
        }

        fetchBooking()
    }, [token])

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<
            string,
            { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }
        > = {
            Pending: { label: "Chờ xác nhận", variant: "outline", icon: Clock },
            Confirmed: { label: "Đã xác nhận", variant: "default", icon: CheckCircle2 },
            Cancelled: { label: "Đã hủy", variant: "destructive", icon: XCircle },
            Completed: { label: "Hoàn thành", variant: "secondary", icon: CheckCircle2 },
        }

        const config = statusConfig[status] || statusConfig.Pending
        const Icon = config.icon

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        )
    }

    const getPaymentStatusBadge = (status: string) => {
        const statusConfig: Record<
            string,
            { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
        > = {
            Pending: { label: "Chờ thanh toán", variant: "outline" },
            Paid: { label: "Đã thanh toán", variant: "default" },
            Failed: { label: "Thất bại", variant: "destructive" },
            Refunded: { label: "Đã hoàn tiền", variant: "secondary" },
        }

        const config = statusConfig[status] || statusConfig.Pending

        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
                <div className="glass-effect rounded-2xl p-8 max-w-md w-full text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-serif font-bold mb-2">Không tìm thấy</h1>
                    <p className="text-muted-foreground">{error || "Không tìm thấy thông tin booking"}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                            <span className="luxury-text-gradient">Thông tin đặt phòng</span>
                        </h1>
                        <p className="text-muted-foreground">Booking ID: #{booking.bookingId}</p>
                    </div>

                    {/* Status Card */}
                    <div className="glass-effect rounded-2xl p-6 mb-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Trạng thái booking</p>
                                {getStatusBadge(booking.status)}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Trạng thái thanh toán</p>
                                {getPaymentStatusBadge(booking.paymentStatus)}
                            </div>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="glass-effect rounded-2xl p-6 mb-6 space-y-6">
                        <h2 className="font-serif text-2xl font-bold">Chi tiết đặt phòng</h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Ngày nhận phòng</p>
                                    <p className="font-medium">{format(new Date(booking.checkInDate), "dd/MM/yyyy", { locale: vi })}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Ngày trả phòng</p>
                                    <p className="font-medium">{format(new Date(booking.checkOutDate), "dd/MM/yyyy", { locale: vi })}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{booking.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                                    <p className="font-medium">{booking.phoneNumber}</p>
                                </div>
                            </div>
                        </div>

                        {booking.specialRequests && (
                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-1">Yêu cầu đặc biệt</p>
                                <p className="text-sm">{booking.specialRequests}</p>
                            </div>
                        )}
                    </div>

                    {/* Payment Info */}
                    <div className="glass-effect rounded-2xl p-6">
                        <h2 className="font-serif text-2xl font-bold mb-4">Thông tin thanh toán</h2>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tổng tiền</span>
                                <span className="font-semibold">{formatPrice(booking.totalAmount)}</span>
                            </div>

                            {booking.depositAmount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Đặt cọc (30%)</span>
                                    <span className="font-semibold">{formatPrice(booking.depositAmount)}</span>
                                </div>
                            )}

                            <div className="pt-3 border-t flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                <span className="text-sm text-muted-foreground">
                                    {booking.paymentStatus === "Paid"
                                        ? "Thanh toán đã hoàn tất"
                                        : "Vui lòng hoàn tất thanh toán để xác nhận booking"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function TrackBookingPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            }
        >
            <TrackBookingContent />
        </Suspense>
    )
}
