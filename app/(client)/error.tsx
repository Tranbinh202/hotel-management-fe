"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Client error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[oklch(0.25_0.04_265)] to-[oklch(0.30_0.04_265)] p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h1>
        <p className="text-gray-600 mb-6">Không thể tải nội dung này. Vui lòng thử lại sau giây lát.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="bg-[oklch(0.25_0.04_265)] hover:bg-[oklch(0.20_0.04_265)]">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
          <Button onClick={() => (window.location.href = "/")} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  )
}
