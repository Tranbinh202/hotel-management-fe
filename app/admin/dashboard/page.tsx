"use client"

import { StatCard } from "@/components/features/dashboard/stat-card"
import { RecentBookings } from "@/components/features/dashboard/recent-bookings"
import { useBookingManagement, useBookings } from "@/lib/hooks/use-bookings"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { useSearchParams } from "next/navigation";
import type { BookingManagementFilter } from "@/lib/types/api";
import { useState } from "react";

export default function AdminDashboardPage() {
    const [searchParams, setSearchParams] = useState<BookingManagementFilter>({
        pageNumber: 1,
        pageSize: 10,
    })
    const { data: bookings, isLoading } = useBookingManagement(searchParams)
    console.log(bookings)
    const bookingsData = bookings?.pages?.flatMap(page => page.data.items)

    const recentBookings = bookings?.pages?.[0]?.data?.items?.slice(0, 5)

    if (isLoading) {
        return <LoadingSpinner size="lg" />
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Tổng quan</h1>
                <p className="text-slate-600 mt-1">Chào mừng trở lại! Đây là tổng quan về khách sạn của bạn.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Tổng đặt phòng"
                    value={bookings?.pages?.[0]?.data?.totalRecords}
                    icon={
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    }
                    trend={{ value: 12.5, isPositive: true }}
                    color="primary"
                />
                <StatCard
                    title="Doanh thu tháng"
                    value="₫45.2M"
                    icon={
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    }
                    trend={{ value: 8.2, isPositive: true }}
                    color="success"
                />
                <StatCard
                    title="Phòng trống"
                    value="48/120"
                    icon={
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                        </svg>
                    }
                    color="info"
                />
                <StatCard
                    title="Khách hàng mới"
                    value="89"
                    icon={
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                    }
                    trend={{ value: 23.1, isPositive: true }}
                    color="warning"
                />
            </div>

            <RecentBookings bookings={recentBookings} />
        </div>
    )
}
