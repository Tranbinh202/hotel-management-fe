"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User, LogOut, ChevronDown, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export function ClientHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-[oklch(0.92_0.01_85)] shadow-lg shadow-[oklch(0.25_0.04_265)]/5"
          : "bg-white/80 backdrop-blur-md border-b border-[oklch(0.92_0.01_85)]/50"
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-full luxury-gradient flex items-center justify-center shadow-lg shadow-[oklch(0.72_0.12_75)]/30 group-hover:shadow-xl group-hover:shadow-[oklch(0.72_0.12_75)]/40 transition-all duration-300">
            <Sparkles className="w-6 h-6 text-white" />
            <div className="absolute inset-0 rounded-full animate-shimmer"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-bold luxury-text-gradient tracking-tight">
              StayHub
            </span>
            <span className="text-[10px] text-[oklch(0.48_0.02_265)] tracking-[0.2em] uppercase font-medium">
              Luxury Hotel
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`transition-all duration-300 font-medium relative group ${
              pathname === "/"
                ? "text-[oklch(0.25_0.04_265)]"
                : "text-[oklch(0.48_0.02_265)] hover:text-[oklch(0.25_0.04_265)]"
            }`}
          >
            Trang chủ
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-[oklch(0.72_0.12_75)] transition-all duration-300 ${
                pathname === "/" ? "w-full" : "w-0 group-hover:w-full"
              }`}
            ></span>
          </Link>
          <Link
            href="/rooms"
            className={`transition-all duration-300 font-medium relative group ${
              pathname === "/rooms"
                ? "text-[oklch(0.25_0.04_265)]"
                : "text-[oklch(0.48_0.02_265)] hover:text-[oklch(0.25_0.04_265)]"
            }`}
          >
            Phòng
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-[oklch(0.72_0.12_75)] transition-all duration-300 ${
                pathname === "/rooms" ? "w-full" : "w-0 group-hover:w-full"
              }`}
            ></span>
          </Link>
          <Link
            href="/amenities"
            className={`transition-all duration-300 font-medium relative group ${
              pathname === "/amenities"
                ? "text-[oklch(0.25_0.04_265)]"
                : "text-[oklch(0.48_0.02_265)] hover:text-[oklch(0.25_0.04_265)]"
            }`}
          >
            Tiện nghi
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-[oklch(0.72_0.12_75)] transition-all duration-300 ${
                pathname === "/amenities" ? "w-full" : "w-0 group-hover:w-full"
              }`}
            ></span>
          </Link>
          <Link
            href="/#offers"
            className="text-[oklch(0.48_0.02_265)] hover:text-[oklch(0.25_0.04_265)] transition-all duration-300 font-medium relative group"
          >
            Ưu đãi
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[oklch(0.72_0.12_75)] group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link
            href="/#location"
            className="text-[oklch(0.48_0.02_265)] hover:text-[oklch(0.25_0.04_265)] transition-all duration-300 font-medium relative group"
          >
            Liên hệ
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[oklch(0.72_0.12_75)] group-hover:w-full transition-all duration-300"></span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-[oklch(0.35_0.02_265)] hover:text-[oklch(0.25_0.04_265)] hover:bg-[oklch(0.96_0.01_85)]"
                  >
                    <div className="w-9 h-9 rounded-full luxury-gradient flex items-center justify-center text-white text-sm font-semibold shadow-md">
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="hidden md:inline font-medium">
                      {user.username}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center cursor-pointer"
                    >
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

              <AlertDialog
                open={showLogoutDialog}
                onOpenChange={setShowLogoutDialog}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Đăng xuất
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-[oklch(0.35_0.02_265)] hover:text-[oklch(0.25_0.04_265)] hover:bg-[oklch(0.96_0.01_85)]"
                >
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/rooms">
                <Button className="luxury-gradient hover:opacity-90 text-white shadow-lg shadow-[oklch(0.72_0.12_75)]/30 hover:shadow-xl hover:shadow-[oklch(0.72_0.12_75)]/40 transition-all duration-300 font-medium">
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
