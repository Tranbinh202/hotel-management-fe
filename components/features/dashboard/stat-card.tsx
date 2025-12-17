"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
  color?: "primary" | "success" | "warning" | "info"
}

export function StatCard({ title, value, icon, trend, description, color = "primary" }: StatCardProps) {
  const colorClasses = {
    primary: "from-[#ff5e7e] to-[#ff4569]",
    success: "from-[#14b8a6] to-[#0d9488]",
    warning: "from-[#f59e0b] to-[#d97706]",
    info: "from-[#a78bfa] to-[#8b5cf6]",
  }

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}
          >
            {icon}
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={trend.isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"}
                />
              </svg>
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
