"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle2, Clock, RefreshCw } from "lucide-react"
import { useResendActivationEmail } from "@/lib/hooks/use-auth"

function RegistrationSuccessContent() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const { mutate: resendEmail, isPending } = useResendActivationEmail()
  const [resendCount, setResendCount] = useState(0)

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("registrationEmail")
    if (savedEmail) {
      setEmail(savedEmail)
    } else {
      router.push("/register")
    }
  }, [router])

  const handleResendEmail = () => {
    if (email) {
      resendEmail(email)
      setResendCount((prev) => prev + 1)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in-up text-center">
          <div className="mb-8">
            <Link href="/" className="text-2xl font-serif font-bold luxury-text-gradient">
              StayHub
            </Link>
          </div>

          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <h1 className="text-4xl font-serif font-bold text-foreground mb-4 leading-tight">Đăng ký thành công!</h1>
          <p className="text-muted-foreground mb-8 leading-loose">
            Chúng tôi đã gửi email kích hoạt tài khoản đến
            <br />
            <span className="font-semibold text-foreground">{email}</span>
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <div className="flex items-start gap-3 mb-4">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Kiểm tra email của bạn</h3>
                <p className="text-sm text-muted-foreground leading-loose">
                  Vui lòng mở email và nhấp vào link kích hoạt để hoàn tất đăng ký. Link có hiệu lực trong vòng 5 phút.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Không nhận được email?</h3>
                <p className="text-sm text-muted-foreground leading-loose">
                  Kiểm tra thư mục spam hoặc nhấn nút bên dưới để gửi lại email kích hoạt.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleResendEmail}
            disabled={isPending}
            variant="outline"
            className="w-full mb-4 h-12 border-2 bg-transparent"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Đang gửi...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Gửi lại email kích hoạt
              </span>
            )}
          </Button>

          {resendCount > 0 && (
            <p className="text-sm text-green-600 mb-4 leading-loose">Email đã được gửi lại {resendCount} lần</p>
          )}

          <p className="text-center text-muted-foreground leading-loose">
            <Link href="/login" className="text-accent hover:text-accent/80 font-semibold transition-colors">
              Quay lại đăng nhập
            </Link>
          </p>
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
            <Mail className="w-24 h-24 mx-auto animate-float" />
          </div>
          <h2 className="text-5xl font-serif font-bold mb-6 leading-tight">Chỉ còn một bước nữa!</h2>
          <p className="text-xl text-white/90 leading-loose mb-8">
            Kích hoạt tài khoản để bắt đầu trải nghiệm dịch vụ quản lý khách sạn tuyệt vời của chúng tôi
          </p>

          <div className="space-y-4">
            <div
              className="flex items-center gap-3 glass-effect rounded-lg p-4 animate-scale-in"
              style={{ animationDelay: "0.4s" }}
            >
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <span className="text-left leading-loose">Bảo mật thông tin tuyệt đối</span>
            </div>
            <div
              className="flex items-center gap-3 glass-effect rounded-lg p-4 animate-scale-in"
              style={{ animationDelay: "0.6s" }}
            >
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <span className="text-left leading-loose">Xác thực qua email đã đăng ký</span>
            </div>
            <div
              className="flex items-center gap-3 glass-effect rounded-lg p-4 animate-scale-in"
              style={{ animationDelay: "0.8s" }}
            >
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <span className="text-left leading-loose">Tự động đăng nhập sau khi kích hoạt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegistrationSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-muted-foreground">Đang tải...</span>
          </div>
        </div>
      }
    >
      <RegistrationSuccessContent />
    </Suspense>
  )
}
