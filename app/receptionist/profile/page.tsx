"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReceptionistProfilePage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Hồ sơ cá nhân</h1>
        <p className="text-slate-600 mt-1">Thông tin tài khoản của bạn</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Họ và tên</p>
              <p className="font-semibold text-slate-900">{user?.profileDetails?.fullName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Email</p>
              <p className="font-semibold text-slate-900">{user?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Số điện thoại</p>
              <p className="font-semibold text-slate-900">{user?.profileDetails?.phoneNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Vai trò</p>
              <p className="font-semibold text-slate-900">{user?.roles?.join(", ") || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
