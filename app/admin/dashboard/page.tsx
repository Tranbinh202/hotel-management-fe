"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Tổng đặt phòng",
      value: "1,234",
      change: "+12.5%",
      trend: "up",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      color: "from-[#ff5e7e] to-[#ff4569]",
    },
    {
      title: "Doanh thu tháng",
      value: "₫45.2M",
      change: "+8.2%",
      trend: "up",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "from-[#14b8a6] to-[#06b6d4]",
    },
    {
      title: "Phòng trống",
      value: "48/120",
      change: "40%",
      trend: "neutral",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      color: "from-[#a78bfa] to-[#9370db]",
    },
    {
      title: "Khách hàng mới",
      value: "89",
      change: "+23.1%",
      trend: "up",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      color: "from-[#fbbf24] to-[#f59e0b]",
    },
  ]

  const recentBookings = [
    { id: "BK001", guest: "Nguyễn Văn A", room: "Deluxe 101", checkIn: "15/10/2025", status: "Confirmed" },
    { id: "BK002", guest: "Trần Thị B", room: "Suite 201", checkIn: "16/10/2025", status: "Pending" },
    { id: "BK003", guest: "Lê Văn C", room: "Standard 305", checkIn: "17/10/2025", status: "Confirmed" },
    { id: "BK004", guest: "Phạm Thị D", room: "Deluxe 102", checkIn: "18/10/2025", status: "Confirmed" },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tổng quan</h1>
        <p className="text-slate-600 mt-1">Chào mừng trở lại! Đây là tổng quan về khách sạn của bạn.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" && (
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                      </svg>
                    )}
                    <span
                      className={`text-sm font-medium ${stat.trend === "up" ? "text-green-500" : "text-slate-500"}`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Đặt phòng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Mã đặt</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Khách hàng</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Phòng</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Ngày nhận</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-slate-900">{booking.id}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{booking.guest}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{booking.room}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{booking.checkIn}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
