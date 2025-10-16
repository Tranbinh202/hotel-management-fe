"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"

export interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string | number
  actions?: (item: T) => React.ReactNode
  emptyMessage?: string
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  actions,
  emptyMessage = "Không có dữ liệu",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-slate-600 text-lg">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`text-left py-4 px-6 text-sm font-semibold text-slate-600 ${column.className || ""}`}
                  >
                    {column.label}
                  </th>
                ))}
                {actions && <th className="text-right py-4 px-6 text-sm font-semibold text-slate-600">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={keyExtractor(item)} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  {columns.map((column) => (
                    <td key={column.key} className={`py-4 px-6 ${column.className || ""}`}>
                      {column.render ? column.render(item) : String((item as any)[column.key])}
                    </td>
                  ))}
                  {actions && <td className="py-4 px-6">{actions(item)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
