"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react"
import { useActivateAccount, useResendActivationEmail } from "@/lib/hooks/use-auth"

export default function ActivateAccountPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const { mutate: activateAccount, isPending, isError, error } = useActivateAccount()
  const { mutate: resendEmail, isPending: isResending } = useResendActivationEmail()
  const [activationStatus, setActivationStatus] = useState<"pending" | "success" | "error">("pending")
  const [email, setEmail] = useState("")
  const [showResendForm, setShowResendForm] = useState(false)

  useEffect(() => {
    if (token) {
      activateAccount(token, {
        onSuccess: () => {
          setActivationStatus("success")
        },
        onError: () => {
          setActivationStatus("error")
        },
      })
    }
  }, [token, activateAccount])

  const handleResendEmail = () => {
    if (email) {
      resendEmail(email, {
        onSuccess: () => {
          setShowResendForm(false)
          setEmail("")
        },
      })
    }
  }

  if (activationStatus === "pending" || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in-up">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-3 leading-tight">Đang kích hoạt tài khoản</h1>
          <p className="text-muted-foreground leading-loose">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    )
  }

  if (activationStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in-up max-w-md px-6">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-3 leading-tight">Kích hoạt thành công!</h1>
          <p className="text-muted-foreground leading-loose mb-6">
            Tài khoản của bạn đã được kích hoạt. Đang tự động đăng nhập...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Chuyển hướng trong giây lát...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen flex">
      {/* Left side - Error content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-8">
            <Link href="/" className="text-2xl font-serif font-bold luxury-text-gradient">
              StayHub
            </Link>
          </div>

          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <h1 className="text-3xl font-serif font-bold text-foreground mb-3 leading-tight text-center">
            Kích hoạt thất bại
          </h1>
          <p className="text-muted-foreground leading-loose mb-6 text-center">
            {error instanceof Error ? error.message : "Link kích hoạt không hợp lệ hoặc đã hết hạn (quá 5 phút)."}
          </p>

          {!showResendForm ? (
            <div className="space-y-4">
              <Button onClick={() => setShowResendForm(true)} className="w-full luxury-gradient text-white h-12">
                <RefreshCw className="w-4 h-4 mr-2" />
                Gửi lại email kích hoạt
              </Button>

              <p className="text-center text-muted-foreground leading-loose">
                <Link href="/login" className="text-accent hover:text-accent/80 font-semibold transition-colors">
                  Quay lại đăng nhập
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email đã đăng ký</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="h-12"
                />
              </div>

              <Button
                onClick={handleResendEmail}
                disabled={isResending || !email}
                className="w-full luxury-gradient text-white h-12"
              >
                {isResending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang gửi...
                  </span>
                ) : (
                  "Gửi email kích hoạt"
                )}
              </Button>

              <Button onClick={() => setShowResendForm(false)} variant="outline" className="w-full h-12">
                Hủy
              </Button>
            </div>
          )}
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
          <h2 className="text-5xl font-serif font-bold mb-6 leading-tight">Cần trợ giúp?</h2>
          <p className="text-xl text-white/90 leading-loose mb-8">
            Nếu bạn gặp vấn đề với việc kích hoạt tài khoản, chúng tôi luôn sẵn sàng hỗ trợ bạn
          </p>

          <div className="space-y-4">
            <div
              className="flex items-center gap-3 glass-effect rounded-lg p-4 animate-scale-in"
              style={{ animationDelay: "0.4s" }}
            >
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <span className="text-left leading-loose">Link kích hoạt có hiệu lực 5 phút</span>
            </div>
            <div
              className="flex items-center gap-3 glass-effect rounded-lg p-4 animate-scale-in"
              style={{ animationDelay: "0.6s" }}
            >
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <span className="text-left leading-loose">Kiểm tra thư mục spam nếu không thấy email</span>
            </div>
            <div
              className="flex items-center gap-3 glass-effect rounded-lg p-4 animate-scale-in"
              style={{ animationDelay: "0.8s" }}
            >
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <span className="text-left leading-loose">Có thể gửi lại email kích hoạt bất cứ lúc nào</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
