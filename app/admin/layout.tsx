"use client"

import type React from "react"

import { Header } from "@/components/layout/header"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AuthGuard } from "@/components/providers/auth-guard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth requireAdmin>
      <div className="min-h-screen bg-slate-50">
        <Header variant="admin" />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
