"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AdminNewBookingPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push("/admin/bookings")
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl border-red-200">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Không có quyền truy cập
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-slate-600">
            Admin không có quyền tạo booking mới. Chỉ receptionist mới có thể tạo booking tại quầy.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              💡 <strong>Gợi ý:</strong> Nếu bạn cần tạo booking, vui lòng liên hệ với receptionist hoặc đăng nhập với tài khoản receptionist.
            </p>
          </div>
          <p className="text-sm text-slate-500">
            Tự động chuyển hướng về trang danh sách booking trong 3 giây...
          </p>
          <Button
            onClick={() => router.push("/admin/bookings")}
            className="w-full bg-[#00008b] hover:bg-[#00008b]/90"
          >
            Quay lại danh sách booking
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
