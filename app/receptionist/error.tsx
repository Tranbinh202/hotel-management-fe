"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCcw, Clipboard } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ReceptionistError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Receptionist error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[oklch(0.25_0.04_265)] to-[oklch(0.30_0.04_265)] p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lỗi hệ thống lễ tân</h1>
        <p className="text-gray-600 mb-6">
          Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại hoặc liên hệ quản lý.
        </p>
        {error.message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-left">
            <p className="text-xs text-red-700 font-mono break-all">{error.message}</p>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="bg-[oklch(0.25_0.04_265)] hover:bg-[oklch(0.20_0.04_265)]">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
          <Button onClick={() => (window.location.href = "/receptionist/bookings")} variant="outline">
            <Clipboard className="w-4 h-4 mr-2" />
            Danh sách đặt phòng
          </Button>
        </div>
      </div>
    </div>
  )
}
