"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { usePreviewCheckout, useProcessCheckout } from "@/lib/hooks/use-checkout"
import { usePaymentMethods } from "@/lib/hooks/use-common-code"
import { bookingManagementApi } from "@/lib/api/bookings"
import type { CheckoutRequest } from "@/lib/types/api"
import { Calendar, ArrowLeft } from "lucide-react"

interface CheckoutFullScreenProps {
    bookingId: number
    onSuccess?: () => void
}

export function CheckoutFullScreen({ bookingId, onSuccess }: CheckoutFullScreenProps) {
    const router = useRouter()
    const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null)
    const [paymentNote, setPaymentNote] = useState("")
    const [transactionReference, setTransactionReference] = useState("")
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
    const [isLoadingQR, setIsLoadingQR] = useState(false)

    const {
        data: previewData,
        isLoading: isLoadingPreview,
        error: previewError,
    } = usePreviewCheckout(bookingId || 0)

    const { data: paymentMethods, isLoading: isLoadingPaymentMethods } = usePaymentMethods()
    const processCheckout = useProcessCheckout()



    // Generate QR code when preview data is available
    useEffect(() => {
        if (previewData && previewData.subTotal > 0 && bookingId && !qrCodeUrl) {
            const generateQR = async () => {
                try {
                    setIsLoadingQR(true)
                    const amount = previewData.amountDue > 0 ? previewData.amountDue : previewData.subTotal
                    const qrResponse = await bookingManagementApi.generateQRCode({
                        amount: amount,
                        description: `Thanh toán checkout Booking #${bookingId}`,
                        bookingId: bookingId,
                    })

                    if (qrResponse.isSuccess && qrResponse.data.qrCodeUrl) {
                        setQrCodeUrl(qrResponse.data.qrCodeUrl)
                    }
                } catch (error) {
                    console.error('QR generation failed:', error)
                } finally {
                    setIsLoadingQR(false)
                }
            }
            generateQR()
        }
    }, [previewData, bookingId, qrCodeUrl])

    const handleSubmit = async () => {
        if (!bookingId || !paymentMethodId) {
            return
        }

        const request: CheckoutRequest = {
            bookingId,
            actualCheckOutDate: new Date().toISOString(),
            paymentMethodId,
            paymentNote: paymentNote || undefined,
            transactionReference: transactionReference || undefined,
        }

        processCheckout.mutate(request, {
            onSuccess: () => {
                // Notify parent window to refresh
                if (window.opener) {
                    window.opener.postMessage({ type: 'CHECKOUT_SUCCESS', bookingId }, '*')
                }

                // Close tab
                window.close()
                setTimeout(() => {
                    router.push('/receptionist/bookings')
                    onSuccess?.()
                }, 100)
            },
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                window.close()
                                setTimeout(() => router.push('/receptionist/bookings'), 100)
                            }}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-slate-900">Checkout - Booking #{bookingId}</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-8">
                <div className="max-w-6xl mx-auto">
                    {isLoadingPreview ? (
                        <div className="flex justify-center py-20">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : previewError ? (
                        <div className="text-center py-20">
                            <p className="text-red-600 text-lg">Không thể tải thông tin checkout</p>
                        </div>
                    ) : previewData ? (
                        <div className="grid grid-cols-3 gap-8">
                            {/* Main Content - 2 columns */}
                            <div className="col-span-2 space-y-6">
                                {/* Customer Info */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="font-semibold text-lg mb-4">Thông tin khách hàng</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-600">Họ tên:</span>{" "}
                                            <span className="font-medium">{previewData.customer.fullName}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-600">Email:</span>{" "}
                                            <span className="font-medium">{previewData.customer.email}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-600">SĐT:</span>{" "}
                                            <span className="font-medium">{previewData.customer.phoneNumber}</span>
                                        </div>
                                        {previewData.customer.identityCard && (
                                            <div>
                                                <span className="text-slate-600">CMND/CCCD:</span>{" "}
                                                <span className="font-medium">{previewData.customer.identityCard}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stay Info */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <Label>Ngày check-in</Label>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Calendar className="w-4 h-4 text-slate-500" />
                                                <span className="text-sm font-medium">
                                                    {format(new Date(previewData.checkInDate), "dd/MM/yyyy HH:mm", { locale: vi })}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Ngày checkout dự kiến</Label>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Calendar className="w-4 h-4 text-slate-500" />
                                                <span className="text-sm font-medium">
                                                    {format(new Date(previewData.checkOutDate), "dd/MM/yyyy HH:mm", { locale: vi })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>


                                </div>

                                {/* Room Charges */}
                                {previewData.roomCharges.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <h3 className="font-semibold text-lg mb-4">Chi phí phòng</h3>
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold">Phòng</th>
                                                        <th className="px-4 py-3 text-right text-sm font-semibold">Giá/đêm</th>
                                                        <th className="px-4 py-3 text-right text-sm font-semibold">Số đêm</th>
                                                        <th className="px-4 py-3 text-right text-sm font-semibold">Thành tiền</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {previewData.roomCharges.map((room) => (
                                                        <tr key={room.bookingRoomId} className="border-t">
                                                            <td className="px-4 py-3 text-sm">
                                                                {room.roomName} ({room.roomTypeName})
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-sm">{formatCurrency(room.pricePerNight)}</td>
                                                            <td className="px-4 py-3 text-right text-sm">{room.actualNights}</td>
                                                            <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(room.subTotal)}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="border-t bg-slate-50 font-semibold">
                                                        <td colSpan={3} className="px-4 py-3 text-right">
                                                            Tổng tiền phòng:
                                                        </td>
                                                        <td className="px-4 py-3 text-right">{formatCurrency(previewData.totalRoomCharges)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Service Charges */}
                                {previewData.serviceCharges.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <h3 className="font-semibold text-lg mb-4">Chi phí dịch vụ</h3>
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold">Dịch vụ</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold">Phòng</th>
                                                        <th className="px-4 py-3 text-right text-sm font-semibold">Đơn giá</th>
                                                        <th className="px-4 py-3 text-right text-sm font-semibold">SL</th>
                                                        <th className="px-4 py-3 text-right text-sm font-semibold">Thành tiền</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {previewData.serviceCharges.map((service, idx) => (
                                                        <tr key={idx} className="border-t">
                                                            <td className="px-4 py-3 text-sm">{service.serviceName}</td>
                                                            <td className="px-4 py-3 text-sm">{service.roomName || "-"}</td>
                                                            <td className="px-4 py-3 text-right text-sm">{formatCurrency(service.pricePerUnit)}</td>
                                                            <td className="px-4 py-3 text-right text-sm">{service.quantity}</td>
                                                            <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(service.subTotal)}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="border-t bg-slate-50 font-semibold">
                                                        <td colSpan={4} className="px-4 py-3 text-right">
                                                            Tổng tiền dịch vụ:
                                                        </td>
                                                        <td className="px-4 py-3 text-right">{formatCurrency(previewData.totalServiceCharges)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar - 1 column */}
                            <div className="col-span-1 space-y-6">
                                {/* Payment Summary */}
                                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                                    <h3 className="font-semibold text-lg mb-4">Tổng hợp thanh toán</h3>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-lg">
                                            <span className="font-semibold">Tổng cộng:</span>
                                            <span className="font-bold text-blue-600">{formatCurrency(previewData.subTotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Đã cọc:</span>
                                            <span>-{formatCurrency(previewData.depositPaid)}</span>
                                        </div>
                                        <div className="flex justify-between text-xl font-bold border-t pt-3">
                                            <span>Còn phải trả:</span>
                                            <span className="text-green-600">{formatCurrency(previewData.amountDue)}</span>
                                        </div>
                                    </div>

                                    {previewData.message && (
                                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800 mb-6">
                                            {previewData.message}
                                        </div>
                                    )}

                                    {/* Payment Method */}
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="paymentMethod">Phương thức thanh toán *</Label>
                                            <Select
                                                value={paymentMethodId?.toString()}
                                                onValueChange={(value) => setPaymentMethodId(Number(value))}
                                                disabled={isLoadingPaymentMethods}
                                            >
                                                <SelectTrigger className="mt-2">
                                                    <SelectValue placeholder="Chọn phương thức thanh toán" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {paymentMethods?.map((method) => (
                                                        <SelectItem key={method.codeId} value={method.codeId.toString()}>
                                                            {method.codeName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* QR Code Display */}
                                        {paymentMethodId && paymentMethods && qrCodeUrl && (() => {
                                            const selectedMethod = paymentMethods.find(m => m.codeId === paymentMethodId)
                                            const isBankTransfer = selectedMethod?.codeName?.toLowerCase().includes('chuyển khoản') ||
                                                selectedMethod?.codeName?.toLowerCase().includes('bank transfer') ||
                                                selectedMethod?.codeName?.toLowerCase().includes('banktransfer')
                                            return isBankTransfer
                                        })() && (
                                                <div className="bg-gradient-to-br from-[#8C68E6]/5 to-[#D4A574]/5 rounded-lg p-4 border border-[#8C68E6]/20">
                                                    <div className="text-center space-y-3">
                                                        <h4 className="font-semibold text-slate-900 text-sm">Quét mã QR để thanh toán</h4>
                                                        <div className="bg-white p-3 rounded-xl shadow-lg">
                                                            <img src={qrCodeUrl} alt="QR Code Payment" className="w-full h-auto mx-auto" />
                                                        </div>
                                                        <p className="text-xl font-bold text-[#8C68E6]">
                                                            {formatCurrency(previewData.amountDue > 0 ? previewData.amountDue : previewData.subTotal)}
                                                        </p>
                                                        <p className="text-xs text-slate-600">
                                                            📱 Quét mã QR bằng ứng dụng ngân hàng
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                        <div>
                                            <Label htmlFor="transactionRef">Mã giao dịch (nếu có)</Label>
                                            <Input
                                                id="transactionRef"
                                                value={transactionReference}
                                                onChange={(e) => setTransactionReference(e.target.value)}
                                                placeholder="Nhập mã giao dịch"
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="paymentNote">Ghi chú</Label>
                                            <Textarea
                                                id="paymentNote"
                                                value={paymentNote}
                                                onChange={(e) => setPaymentNote(e.target.value)}
                                                placeholder="Ghi chú về thanh toán..."
                                                rows={3}
                                                className="mt-2"
                                            />
                                        </div>

                                        <Button
                                            onClick={handleSubmit}
                                            disabled={!paymentMethodId || processCheckout.isPending}
                                            className="w-full"
                                            size="lg"
                                        >
                                            {processCheckout.isPending ? (
                                                <>
                                                    <LoadingSpinner size="sm" />
                                                    <span className="ml-2">Đang xử lý...</span>
                                                </>
                                            ) : (
                                                "Xác nhận checkout"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
