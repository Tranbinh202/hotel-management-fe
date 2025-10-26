"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";

export function ClientHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff5e7e] to-[#ff4569] flex items-center justify-center shadow-lg">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
              pathname === "/"
                ? "text-[#ff5e7e]"
                : "text-gray-600 hover:text-[#ff5e7e]"
            }`}
          >
            Trang chủ
          </Link>
          <Link
            href="/rooms"
            className={`transition-colors font-medium ${
              pathname === "/rooms"
                ? "text-[#ff5e7e]"
                : "text-gray-600 hover:text-[#ff5e7e]"
            }`}
          >
            Phòng
          </Link>
          <Link
            href="/amenities"
            className={`transition-colors font-medium ${
              pathname === "/amenities"
                ? "text-[#ff5e7e]"
                : "text-gray-600 hover:text-[#ff5e7e]"
            }`}
          >
            Tiện nghi
          </Link>
          <Link
            href="/#offers"
            className="text-gray-600 hover:text-[#ff5e7e] transition-colors font-medium"
          >
            Ưu đãi
          </Link>
          <Link
            href="/#location"
            className="text-gray-600 hover:text-[#ff5e7e] transition-colors font-medium"
          >
            Liên hệ
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden md:inline">
                Xin chào, {user.username}
              </span>
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-[#ff5e7e]"
                onClick={logout}
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-[#ff5e7e]"
                >
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
  );
}
