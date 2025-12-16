"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { usePreviewCheckout, useProcessCheckout } from "@/lib/hooks/use-checkout"
import { usePaymentMethods } from "@/lib/hooks/use-common-code"
import type { CheckoutRequest } from "@/lib/types/api"
import { Calendar } from "lucide-react"

interface CheckoutModalProps {
  bookingId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CheckoutModal({ bookingId, open, onOpenChange, onSuccess }: CheckoutModalProps) {
  const [actualCheckOutDate, setActualCheckOutDate] = useState("")
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null)
  const [paymentNote, setPaymentNote] = useState("")
  const [transactionReference, setTransactionReference] = useState("")

  // Fetch preview data
  const {
    data: previewData,
    isLoading: isLoadingPreview,
    error: previewError,
  } = usePreviewCheckout(bookingId || 0, actualCheckOutDate)

  // Fetch payment methods
  const { data: paymentMethods, isLoading: isLoadingPaymentMethods } = usePaymentMethods()

  // Process checkout mutation
  const processCheckout = useProcessCheckout()

  // Set default checkout date to now
  useEffect(() => {
    if (open && !actualCheckOutDate) {
      setActualCheckOutDate(new Date().toISOString())
    }
  }, [open])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setActualCheckOutDate("")
      setPaymentMethodId(null)
      setPaymentNote("")
      setTransactionReference("")
    }
  }, [open])

  const handleSubmit = async () => {
    if (!bookingId || !actualCheckOutDate || !paymentMethodId) {
      return
    }

    const request: CheckoutRequest = {
      bookingId,
      actualCheckOutDate,
      paymentMethodId,
      paymentNote: paymentNote || undefined,
      transactionReference: transactionReference || undefined,
    }

    processCheckout.mutate(request, {
      onSuccess: () => {
        onOpenChange(false)
        onSuccess?.()
      },
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  if (!bookingId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checkout - Booking #{bookingId}</DialogTitle>
        </DialogHeader>

        {isLoadingPreview ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : previewError ? (
          <div className="text-center py-8 text-red-600">
            Không thể tải thông tin checkout
          </div>
        ) : previewData ? (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ngày check-in</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">
                    {format(new Date(previewData.checkInDate), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </span>
                </div>
              </div>
              <div>
                <Label>Ngày checkout dự kiến</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">
                    {format(new Date(previewData.checkOutDate), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </span>
                </div>
              </div>
            </div>

            {/* Actual Checkout Date Input */}
            <div>
              <Label htmlFor="checkoutDate">Ngày checkout thực tế *</Label>
              <Input
                id="checkoutDate"
                type="datetime-local"
                value={actualCheckOutDate ? format(new Date(actualCheckOutDate), "yyyy-MM-dd'T'HH:mm") : ""}
                onChange={(e) => setActualCheckOutDate(new Date(e.target.value).toISOString())}
                className="mt-1"
              />
            </div>

            {/* Room Charges */}
            {previewData.roomCharges.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Chi phí phòng</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Phòng</th>
                        <th className="px-4 py-2 text-right">Giá/đêm</th>
                        <th className="px-4 py-2 text-right">Số đêm</th>
                        <th className="px-4 py-2 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.roomCharges.map((room) => (
                        <tr key={room.bookingRoomId} className="border-t">
                          <td className="px-4 py-2">
                            {room.roomName} ({room.roomTypeName})
                          </td>
                          <td className="px-4 py-2 text-right">{formatCurrency(room.pricePerNight)}</td>
                          <td className="px-4 py-2 text-right">{room.actualNights}</td>
                          <td className="px-4 py-2 text-right font-medium">{formatCurrency(room.subTotal)}</td>
                        </tr>
                      ))}
                      <tr className="border-t bg-slate-50 font-semibold">
                        <td colSpan={3} className="px-4 py-2 text-right">
                          Tổng tiền phòng:
                        </td>
                        <td className="px-4 py-2 text-right">{formatCurrency(previewData.totalRoomCharges)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Service Charges */}
            {previewData.serviceCharges.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Chi phí dịch vụ</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Dịch vụ</th>
                        <th className="px-4 py-2 text-left">Phòng</th>
                        <th className="px-4 py-2 text-right">Đơn giá</th>
                        <th className="px-4 py-2 text-right">SL</th>
                        <th className="px-4 py-2 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.serviceCharges.map((service, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-2">{service.serviceName}</td>
                          <td className="px-4 py-2">{service.roomName || "-"}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(service.pricePerUnit)}</td>
                          <td className="px-4 py-2 text-right">{service.quantity}</td>
                          <td className="px-4 py-2 text-right font-medium">{formatCurrency(service.subTotal)}</td>
                        </tr>
                      ))}
                      <tr className="border-t bg-slate-50 font-semibold">
                        <td colSpan={4} className="px-4 py-2 text-right">
                          Tổng tiền dịch vụ:
                        </td>
                        <td className="px-4 py-2 text-right">{formatCurrency(previewData.totalServiceCharges)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Tổng cộng:</span>
                <span className="font-bold text-blue-600">{formatCurrency(previewData.subTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Đã cọc:</span>
                <span>-{formatCurrency(previewData.depositPaid)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Còn phải trả:</span>
                <span className="text-green-600">{formatCurrency(previewData.amountDue)}</span>
              </div>
            </div>

            {/* Warning Message */}
            {previewData.message && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800">
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
                  <SelectTrigger className="mt-1">
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

              <div>
                <Label htmlFor="transactionRef">Mã giao dịch (nếu có)</Label>
                <Input
                  id="transactionRef"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="Nhập mã giao dịch nếu thanh toán qua ngân hàng"
                  className="mt-1"
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
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processCheckout.isPending}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!paymentMethodId || !actualCheckOutDate || processCheckout.isPending}
          >
            {processCheckout.isPending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Đang xử lý...
              </>
            ) : (
              "Xác nhận checkout"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
