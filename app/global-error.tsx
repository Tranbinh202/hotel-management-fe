"use client"

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Global critical error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Critical Error</h1>
            <p className="text-gray-600 mb-6">Hệ thống gặp lỗi nghiêm trọng. Vui lòng tải lại trang.</p>
            <button
              onClick={reset}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
