"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Lock, Mail, Phone, AlertCircle } from "lucide-react"

export default function AccountLockedPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-8">
            <Link href="/" className="text-2xl font-serif font-bold luxury-text-gradient">
              StayHub
            </Link>
          </div>

          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <Lock className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <h1 className="text-3xl font-serif font-bold text-foreground mb-3 leading-tight text-center">
            Tài khoản đã bị khóa
          </h1>
          <p className="text-muted-foreground leading-loose mb-8 text-center">
            Tài khoản của bạn hiện đang bị khóa và không thể truy cập vào hệ thống.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Tại sao tài khoản bị khóa?</h3>
                <p className="text-sm text-muted-foreground leading-loose">
                  Tài khoản có thể bị khóa do vi phạm điều khoản sử dụng, hoạt động đáng ngờ, hoặc yêu cầu từ quản trị
                  viên.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-foreground">Liên hệ hỗ trợ để mở khóa tài khoản:</h3>

            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <Mail className="w-5 h-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Email hỗ trợ</p>
                <a
                  href="mailto:support@stayhub.com"
                  className="text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  support@stayhub.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <Phone className="w-5 h-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Hotline</p>
                <a href="tel:1900123456" className="text-sm text-accent hover:text-accent/80 transition-colors">
                  1900 123 456
                </a>
              </div>
            </div>
          </div>

          <Button asChild variant="outline" className="w-full h-12 bg-transparent">
            <Link href="/login">Quay lại đăng nhập</Link>
          </Button>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 luxury-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div
          className="relative z-10 text-white text-center max-w-lg animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="mb-8">
            <Lock className="w-24 h-24 mx-auto animate-float" />
          </div>
          <h2 className="text-5xl font-serif font-bold mb-6 leading-tight">Chúng tôi ở đây để giúp bạn</h2>
          <p className="text-xl text-white/90 leading-loose mb-8">
            Đội ngũ hỗ trợ của chúng tôi sẵn sàng giải đáp mọi thắc mắc và hỗ trợ bạn mở khóa tài khoản
          </p>

          <div className="space-y-4">
            <div
              className="flex items-center gap-3 glass-effect rounded-lg p-4 animate-scale-in"
              style={{ animationDelay: "0.4s" }}
            >
              <Mail className="w-6 h-6 flex-shrink-0" />
              <span className="text-left leading-loose">Phản hồi email trong vòng 24 giờ</span>
            </div>
            <div
              className="flex items-center gap-3 glass-effect rounded-lg p-4 animate-scale-in"
              style={{ animationDelay: "0.6s" }}
            >
              <Phone className="w-6 h-6 flex-shrink-0" />
              <span className="text-left leading-loose">Hỗ trợ qua điện thoại 24/7</span>
            </div>
            <div
              className="flex items-center gap-3 glass-effect rounded-lg p-4 animate-scale-in"
              style={{ animationDelay: "0.8s" }}
            >
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <span className="text-left leading-loose">Xử lý yêu cầu nhanh chóng và chuyên nghiệp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
