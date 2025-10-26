"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { User, LogOut, ChevronDown } from "lucide-react"
import { useState } from "react"

export function ClientHeader() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = () => {
    logout()
    setShowLogoutDialog(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff5e7e] to-[#ff4569] flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <span className="text-2xl font-serif font-bold bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] bg-clip-text text-transparent">
            StayHub
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`transition-colors font-medium ${
              pathname === "/" ? "text-[#ff5e7e]" : "text-gray-600 hover:text-[#ff5e7e]"
            }`}
          >
            Trang chủ
          </Link>
          <Link
            href="/rooms"
            className={`transition-colors font-medium ${
              pathname === "/rooms" ? "text-[#ff5e7e]" : "text-gray-600 hover:text-[#ff5e7e]"
            }`}
          >
            Phòng
          </Link>
          <Link
            href="/amenities"
            className={`transition-colors font-medium ${
              pathname === "/amenities" ? "text-[#ff5e7e]" : "text-gray-600 hover:text-[#ff5e7e]"
            }`}
          >
            Tiện nghi
          </Link>
          <Link href="/#offers" className="text-gray-600 hover:text-[#ff5e7e] transition-colors font-medium">
            Ưu đãi
          </Link>
          <Link href="/#location" className="text-gray-600 hover:text-[#ff5e7e] transition-colors font-medium">
            Liên hệ
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-gray-700 hover:text-[#ff5e7e] hover:bg-pink-50"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff5e7e] to-[#ff4569] flex items-center justify-center text-white text-sm font-semibold">
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="hidden md:inline font-medium">{user.username}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Xem hồ sơ</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={() => setShowLogoutDialog(true)}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                      Đăng xuất
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-gray-700 hover:text-[#ff5e7e]">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/rooms">
                <Button className="bg-gradient-to-r from-[#ff5e7e] to-[#ff4569] hover:from-[#ff4569] hover:to-[#ff2d54] text-white shadow-lg shadow-pink-500/30">
                  Đặt phòng
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
