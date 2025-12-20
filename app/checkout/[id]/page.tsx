"use client"

import { useParams } from "next/navigation"
import { CheckoutFullScreen } from "@/components/features/checkout/checkout-full-screen"

export default function CheckoutPage() {
    const params = useParams()
    const bookingId = params.id ? parseInt(params.id as string) : null

    if (!bookingId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy booking</h1>
                    <p className="text-slate-600">Vui lòng kiểm tra lại đường dẫn</p>
                </div>
            </div>
        )
    }

    return <CheckoutFullScreen bookingId={bookingId} />
}
