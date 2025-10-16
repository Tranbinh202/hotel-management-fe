"use client"

import Link from "next/link"
import { LoginForm } from "@/components/features/auth/login-form"
import { useLogin } from "@/lib/hooks/use-auth"
import type { LoginDto } from "@/lib/types/api"

export default function LoginPage() {
  const loginMutation = useLogin()

  const handleSubmit = async (data: LoginDto) => {
    await loginMutation.mutateAsync(data)
  }

  const handleGoogleLogin = () => {
    console.log("Google login clicked")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] bg-clip-text text-transparent"
            >
              StayHub
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-2">Đăng nhập</h1>
          <p className="text-muted-foreground mb-8">Chào mừng bạn trở lại!</p>

          <LoginForm onSubmit={handleSubmit} isLoading={loginMutation.isPending} />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">Hoặc</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Đăng nhập với Google
          </button>

          <p className="text-center text-muted-foreground mt-6">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-[#ff5e7e] hover:text-[#ff4569] font-semibold transition-colors">
              Đăng ký ngay
            </Link>
          </p>

          <p className="text-center text-muted-foreground mt-4">
            <Link href="/forgot-password" className="text-sm text-[#14b8a6] hover:text-[#0d9488] transition-colors">
              Quên mật khẩu?
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#ff5e7e] via-[#a78bfa] to-[#14b8a6] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-white text-center max-w-lg">
          <h2 className="text-5xl font-bold mb-6">Chào mừng trở lại!</h2>
          <p className="text-xl text-white/90 leading-relaxed">
            Đăng nhập để tiếp tục quản lý khách sạn của bạn một cách hiệu quả và chuyên nghiệp
          </p>
          <div className="mt-12 grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold">1000+</div>
              <div className="text-sm text-white/80 mt-2">Khách sạn</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">50K+</div>
              <div className="text-sm text-white/80 mt-2">Người dùng</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">99%</div>
              <div className="text-sm text-white/80 mt-2">Hài lòng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
