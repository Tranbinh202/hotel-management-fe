"use client"

import { StatCard } from "@/components/features/dashboard/stat-card"
import { RecentBookings } from "@/components/features/dashboard/recent-bookings"
import { useBookingManagement } from "@/lib/hooks/use-bookings"
import { useDashboardStats, useRoomStatusSummary } from "@/lib/hooks/use-dashboard"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import type { BookingManagementFilter } from "@/lib/types/api"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Calendar,
    DollarSign,
    Users,
    Hotel,
    TrendingUp,
    CreditCard,
    CheckCircle2,
    Clock,
    Wrench
} from "lucide-react"

export default function AdminDashboardPage() {
    const [bookingParams] = useState<BookingManagementFilter>({
        pageNumber: 1,
        pageSize: 10,
    })

    const { data: statsData, isLoading: isLoadingStats, error: statsError } = useDashboardStats()
    const { data: roomStatusData, isLoading: isLoadingRoomStatus } = useRoomStatusSummary()
    const { data: bookingsData, isLoading: isLoadingBookings } = useBookingManagement(bookingParams)

    const recentBookings = bookingsData?.pages?.[0]?.data?.items?.slice(0, 5)

    if (isLoadingStats) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (statsError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Không thể tải dữ liệu dashboard</p>
                    <p className="text-sm text-slate-500 mb-4">
                        {statsError?.message || 'Lỗi không xác định'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                        Tải lại
                    </button>
                </div>
            </div>
        )
    }

    if (!statsData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-slate-600">Không có dữ liệu</p>
            </div>
        )
    }

    const stats = statsData

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Tổng quan</h1>
                <p className="text-slate-600 mt-1">Chào mừng trở lại! Đây là tổng quan về khách sạn của bạn.</p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Bookings */}
                <StatCard
                    title="Tổng đặt phòng"
                    value={stats.totalBookings.toLocaleString("vi-VN")}
                    icon={<Calendar className="w-6 h-6 text-white" />}
                    trend={{ value: stats.bookingsGrowth, isPositive: stats.bookingsGrowth > 0 }}
                    description={`${stats.bookingsThisMonth} booking tháng này`}
                    color="primary"
                />

                {/* Revenue */}
                <StatCard
                    title="Doanh thu tháng"
                    value={`${(stats.revenueThisMonth / 1000000).toFixed(1)}M VNĐ`}
                    icon={<DollarSign className="w-6 h-6 text-white" />}
                    trend={{ value: stats.revenueGrowth, isPositive: stats.revenueGrowth > 0 }}
                    description={`Tổng: ${(stats.totalRevenue / 1000000).toFixed(1)}M VNĐ`}
                    color="success"
                />

                {/* Total Customers */}
                <StatCard
                    title="Khách hàng"
                    value={stats.totalCustomers.toLocaleString("vi-VN")}
                    icon={<Users className="w-6 h-6 text-white" />}
                    trend={{ value: stats.customersGrowth, isPositive: stats.customersGrowth > 0 }}
                    description={`${stats.newCustomersThisMonth} khách mới tháng này`}
                    color="warning"
                />

                {/* Occupancy Rate */}
                <StatCard
                    title="Tỷ lệ lấp phòng"
                    value={`${stats.occupancyRate.toFixed(1)}%`}
                    icon={<Hotel className="w-6 h-6 text-white" />}
                    description={`${stats.occupiedRooms}/${stats.totalRooms} phòng đang sử dụng`}
                    color="info"
                />
            </div>

            {/* Room Status & Transactions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Room Status Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tình trạng phòng</CardTitle>
                        <CardDescription>Thống kê phòng theo trạng thái</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500 rounded-lg">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-green-900">Phòng trống</p>
                                        <p className="text-sm text-green-700">Sẵn sàng cho khách</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-green-900">{stats.availableRooms}</p>
                                    <p className="text-sm text-green-700">
                                        {((stats.availableRooms / stats.totalRooms) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500 rounded-lg">
                                        <Hotel className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-blue-900">Phòng đang sử dụng</p>
                                        <p className="text-sm text-blue-700">Có khách đang ở</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-blue-900">{stats.occupiedRooms}</p>
                                    <p className="text-sm text-blue-700">
                                        {((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500 rounded-lg">
                                        <Wrench className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-orange-900">Đang bảo trì</p>
                                        <p className="text-sm text-orange-700">Đang sửa chữa</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-orange-900">{stats.maintenanceRooms}</p>
                                    <p className="text-sm text-orange-700">
                                        {((stats.maintenanceRooms / stats.totalRooms) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Giao dịch & Thanh toán</CardTitle>
                        <CardDescription>Tổng quan về các giao dịch</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500 rounded-lg">
                                        <CreditCard className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-purple-900">Tổng giao dịch</p>
                                        <p className="text-sm text-purple-700">Tất cả các giao dịch</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-purple-900">
                                        {stats.totalTransactions.toLocaleString("vi-VN")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500 rounded-lg">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-green-900">Đã thanh toán</p>
                                        <p className="text-sm text-green-700">Giao dịch hoàn tất</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-green-900">
                                        {stats.completedPayments.toLocaleString("vi-VN")}
                                    </p>
                                    <p className="text-sm text-green-700">
                                        {((stats.completedPayments / stats.totalTransactions) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-500 rounded-lg">
                                        <Clock className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-yellow-900">Chờ thanh toán</p>
                                        <p className="text-sm text-yellow-700">Cần xử lý</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-yellow-900">
                                        {stats.pendingPayments.toLocaleString("vi-VN")}
                                    </p>
                                    <p className="text-sm text-yellow-700">
                                        {((stats.pendingPayments / stats.totalTransactions) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Giá phòng trung bình</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(stats.averageRoomRate / 1000).toLocaleString("vi-VN", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            })}K VNĐ
                        </div>
                        <p className="text-xs text-muted-foreground">Giá trung bình mỗi đêm</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Booking tháng này</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.bookingsThisMonth}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className={stats.bookingsGrowth > 0 ? "text-green-600" : "text-red-600"}>
                                {stats.bookingsGrowth > 0 ? "+" : ""}
                                {stats.bookingsGrowth.toFixed(1)}%
                            </span>{" "}
                            so với tháng trước
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lợi nhuận tháng</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(stats.revenueThisMonth / 1000000).toFixed(1)}M VNĐ
                        </div>
                        <p className="text-xs text-muted-foreground">
                            <span className={stats.revenueGrowth > 0 ? "text-green-600" : "text-red-600"}>
                                {stats.revenueGrowth > 0 ? "+" : ""}
                                {stats.revenueGrowth.toFixed(1)}%
                            </span>{" "}
                            so với tháng trước
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Bookings */}
            {recentBookings && <RecentBookings bookings={recentBookings} />}
        </div>
    )
}
