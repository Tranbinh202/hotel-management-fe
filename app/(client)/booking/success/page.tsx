"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home, Mail, Phone, MapPin, Calendar, Hotel } from "lucide-react"
import Link from "next/link"
import confetti from "canvas-confetti"

export default function BookingSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingCode = searchParams.get("bookingCode")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!bookingCode) {
      router.push("/")
      return
    }

    // Trigger confetti animation
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    return () => clearInterval(interval)
  }, [bookingCode, router])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="glass-effect rounded-3xl p-8 md:p-12 text-center animate-scale-in">
          {/* Success Icon */}
          <div className="mb-8 animate-float">
            <div className="w-24 h-24 mx-auto luxury-gradient rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 py-2 leading-normal animate-fade-in-up">
            <span className="luxury-text-gradient">Đặt phòng thành công!</span>
          </h1>

          <p
            className="text-lg text-muted-foreground mb-8 leading-loose animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Cảm ơn bạn đã tin tưởng và lựa chọn dịch vụ của chúng tôi. Chúng tôi đã nhận được yêu cầu đặt phòng của bạn.
          </p>

          {/* Booking Code */}
          <div className="luxury-gradient rounded-2xl p-6 mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <p className="text-white/90 text-sm mb-2 leading-loose">Mã đặt phòng của bạn</p>
            <p className="text-white text-3xl font-bold font-mono tracking-wider">{bookingCode}</p>
            <p className="text-white/80 text-xs mt-3 leading-loose">
              Vui lòng lưu lại mã này để tra cứu và quản lý đặt phòng
            </p>
          </div>

          {/* Next Steps */}
          <div
            className="bg-muted/50 rounded-2xl p-6 mb-8 text-left animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
              <Hotel className="w-5 h-5 text-primary" />
              Các bước tiếp theo
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground leading-loose">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <span>Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn với đầy đủ thông tin đặt phòng</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <span>Đội ngũ của chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ để xác nhận lại thông tin</span>
              </li>
              <li className="flex items-start gap-3">
                <Calendar className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <span>Vui lòng đến khách sạn đúng giờ nhận phòng đã đặt và mang theo CMND/CCCD</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="bg-muted/50 rounded-2xl p-6 mb-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <h3 className="font-serif text-lg font-semibold mb-4">Liên hệ với chúng tôi</h3>
            <div className="space-y-3 text-sm leading-loose">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>Hotline: 1900 xxxx</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>Email: booking@hotel.com</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>123 Đường ABC, Quận 1, TP. HCM</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <Button asChild variant="outline" size="lg" className="flex-1 bg-transparent">
              <Link href="/rooms">
                <Hotel className="w-4 h-4 mr-2" />
                Xem thêm phòng
              </Link>
            </Button>
            <Button asChild size="lg" className="flex-1 luxury-gradient text-white">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Về trang chủ
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
