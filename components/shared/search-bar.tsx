"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  resultCount?: number
  filters?: React.ReactNode
}

export function SearchBar({ value, onChange, placeholder = "Tìm kiếm...", resultCount, filters }: SearchBarProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="pl-10"
            />
          </div>
          {filters}
          {resultCount !== undefined && (
            <div className="text-sm text-slate-600">
              Tổng: <span className="font-semibold text-slate-900">{resultCount}</span> kết quả
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
