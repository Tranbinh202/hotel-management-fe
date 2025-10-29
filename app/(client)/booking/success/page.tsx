"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { bookingsApi } from "@/lib/api/bookings"
import { useAuth } from "@/contexts/auth-context"
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2, Hotel, User, CheckCircle2, Clock } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentTimeLeft, setPaymentTimeLeft] = useState<number | null>(null)

  // Get room info from URL params
  const roomId = Number.parseInt(searchParams.get("roomId") || "0")
  const roomType = searchParams.get("roomType") || ""
  const pricePerNight = Number.parseInt(searchParams.get("price") || "0")

  // Step 1: Dates and quantity
  const [checkInDate, setCheckInDate] = useState<Date>()
  const [checkOutDate, setCheckOutDate] = useState<Date>()
  const [quantity, setQuantity] = useState(1)

  // Step 2: Personal information (pre-fill if authenticated)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [identityCard, setIdentityCard] = useState("")
  const [address, setAddress] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")

  useEffect(() => {
    if (isAuthenticated && user?.profileDetails) {
      const profile = user.profileDetails
      setFullName(profile.fullName || "")
      setEmail(user.email || "")
      setPhoneNumber(profile.phoneNumber || "")
      if ("identityCard" in profile) {
        setIdentityCard(profile.identityCard || "")
      }
      if ("address" in profile) {
        setAddress(profile.address || "")
      }
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (!roomId || !roomType || !pricePerNight) {
      router.push("/rooms")
    }
  }, [roomId, roomType, pricePerNight, router])

  useEffect(() => {
    if (paymentTimeLeft !== null && paymentTimeLeft > 0) {
      const timer = setTimeout(() => {
        setPaymentTimeLeft(paymentTimeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [paymentTimeLeft])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateTotal = () => {
    const nights = calculateNights()
    return nights * pricePerNight * quantity
  }

  const calculateDeposit = () => {
    return Math.round(calculateTotal() * 0.3) // 30% deposit
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleNext = () => {
    if (step === 1) {
      if (!checkInDate || !checkOutDate) {
        alert("Vui lòng chọn ngày nhận và trả phòng")
        return
      }
      if (checkOutDate <= checkInDate) {
        alert("Ngày trả phòng phải sau ngày nhận phòng")
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!fullName || !email || !phoneNumber) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, Email, Số điện thoại)")
        return
      }
      setStep(3)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!checkInDate || !checkOutDate) return

    setIsSubmitting(true)
    try {
      let response

      if (isAuthenticated && user?.profileDetails && "customerId" in user.profileDetails) {
        // Authenticated booking
        response = await bookingsApi.create({
          customerId: user.profileDetails.customerId,
          roomTypes: [
            {
              roomTypeId: roomId,
              quantity,
            },
          ],
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString(),
          specialRequests: specialRequests || undefined,
        })
      } else {
        // Guest booking
        response = await bookingsApi.createByGuest({
          fullName,
          email,
          phoneNumber,
          identityCard: identityCard || undefined,
          address: address || undefined,
          roomTypes: [
            {
              roomTypeId: roomId,
              quantity,
            },
          ],
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString(),
          specialRequests: specialRequests || undefined,
        })
      }

      if (response.isSuccess && response.data.paymentUrl) {
        router.push(
          `/booking/success?bookingId=${response.data.bookingId}&paymentUrl=${encodeURIComponent(response.data.paymentUrl)}`,
        )
      } else {
        router.push("/booking/failure?reason=payment_failed")
      }
    } catch (error: any) {
      console.error("Booking error:", error)
      const reason = error?.status === 409 ? "not_available" : "unknown"
      router.push(`/booking/failure?reason=${reason}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 py-2 leading-normal">
            <span className="luxury-text-gradient">Đặt phòng</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-loose">{roomType}</p>
          {isAuthenticated && (
            <p className="text-sm text-accent mt-2 leading-loose">Đang đặt phòng với tài khoản: {user?.email}</p>
          )}
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="glass-effect rounded-2xl p-8 animate-scale-in">
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                  {[
                    { num: 1, label: "Ngày & Phòng", icon: CalendarIcon },
                    { num: 2, label: "Thông tin", icon: User },
                    { num: 3, label: "Xác nhận", icon: CheckCircle2 },
                  ].map((s, idx) => (
                    <div key={s.num} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                            step >= s.num ? "luxury-gradient text-white shadow-lg" : "bg-muted text-muted-foreground",
                          )}
                        >
                          <s.icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs mt-2 font-medium hidden sm:block">{s.label}</span>
                      </div>
                      {idx < 2 && (
                        <div
                          className={cn(
                            "flex-1 h-1 mx-2 transition-all duration-300 rounded-full",
                            step > s.num ? "luxury-gradient" : "bg-muted",
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step 1: Dates and Quantity */}
                {step === 1 && (
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Ngày nhận phòng</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-12",
                                !checkInDate && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkInDate ? format(checkInDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={checkInDate}
                              onSelect={setCheckInDate}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-medium">Ngày trả phòng</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-12",
                                !checkOutDate && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkOutDate ? format(checkOutDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={checkOutDate}
                              onSelect={setCheckOutDate}
                              disabled={(date) => date < new Date() || (checkInDate ? date <= checkInDate : false)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">Số lượng phòng</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={quantity}
                        onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                        className="h-12"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Personal Information */}
                {step === 2 && (
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Họ và tên *</Label>
                      <Input
                        placeholder="Nguyễn Văn A"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-12"
                        disabled={isAuthenticated}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Email *</Label>
                        <Input
                          type="email"
                          placeholder="example@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12"
                          disabled={isAuthenticated}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-medium">Số điện thoại *</Label>
                        <Input
                          type="tel"
                          placeholder="0123456789"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="h-12"
                          disabled={isAuthenticated}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">CMND/CCCD</Label>
                      <Input
                        placeholder="001234567890"
                        value={identityCard}
                        onChange={(e) => setIdentityCard(e.target.value)}
                        className="h-12"
                        disabled={isAuthenticated}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">Địa chỉ</Label>
                      <Input
                        placeholder="123 Đường ABC, Quận XYZ, TP. HCM"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="h-12"
                        disabled={isAuthenticated}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">Yêu cầu đặc biệt (tùy chọn)</Label>
                      <Textarea
                        placeholder="Ví dụ: Tầng cao, view đẹp, giường đôi..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="luxury-gradient rounded-xl p-6 text-white space-y-4">
                      <h3 className="font-serif text-xl font-semibold">Thông tin đặt phòng</h3>

                      <div className="space-y-3 text-sm leading-loose">
                        <div className="flex justify-between">
                          <span className="opacity-90">Loại phòng:</span>
                          <span className="font-medium">{roomType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-90">Nhận phòng:</span>
                          <span className="font-medium">
                            {checkInDate && format(checkInDate, "dd/MM/yyyy", { locale: vi })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-90">Trả phòng:</span>
                          <span className="font-medium">
                            {checkOutDate && format(checkOutDate, "dd/MM/yyyy", { locale: vi })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-90">Số đêm:</span>
                          <span className="font-medium">{calculateNights()} đêm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-90">Số phòng:</span>
                          <span className="font-medium">{quantity}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/20">
                        <h3 className="font-serif text-xl font-semibold mb-3">Thông tin khách hàng</h3>
                        <div className="space-y-3 text-sm leading-loose">
                          <div className="flex justify-between">
                            <span className="opacity-90">Họ tên:</span>
                            <span className="font-medium">{fullName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="opacity-90">Email:</span>
                            <span className="font-medium">{email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="opacity-90">Điện thoại:</span>
                            <span className="font-medium">{phoneNumber}</span>
                          </div>
                          {identityCard && (
                            <div className="flex justify-between">
                              <span className="opacity-90">CMND/CCCD:</span>
                              <span className="font-medium">{identityCard}</span>
                            </div>
                          )}
                          {address && (
                            <div className="flex justify-between">
                              <span className="opacity-90">Địa chỉ:</span>
                              <span className="font-medium text-right max-w-[60%]">{address}</span>
                            </div>
                          )}
                          {specialRequests && (
                            <div className="flex justify-between">
                              <span className="opacity-90">Yêu cầu:</span>
                              <span className="font-medium text-right max-w-[60%]">{specialRequests}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm leading-loose">
                        <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">Lưu ý về thanh toán</p>
                        <p className="text-amber-800 dark:text-amber-200">
                          Bạn cần thanh toán trong vòng <strong>15 phút</strong> sau khi đặt phòng. Phòng sẽ được giữ
                          trong <strong>10 phút</strong>. Nếu không thanh toán đúng hạn, đặt phòng sẽ tự động bị hủy.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-8 border-t mt-8">
                  {step > 1 && (
                    <Button variant="outline" onClick={handleBack} disabled={isSubmitting} size="lg">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Quay lại
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button onClick={handleNext} className="ml-auto luxury-gradient text-white" size="lg">
                      Tiếp tục
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="ml-auto luxury-gradient text-white"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Xác nhận đặt phòng
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Price Summary */}
            <div className="lg:col-span-1">
              <div
                className="glass-effect rounded-2xl p-6 sticky top-24 animate-scale-in"
                style={{ animationDelay: "0.1s" }}
              >
                <h3 className="font-serif text-xl font-semibold mb-6">Chi tiết giá</h3>

                {checkInDate && checkOutDate ? (
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm leading-loose">
                      <span className="text-muted-foreground">Giá mỗi đêm:</span>
                      <span className="font-medium">{formatPrice(pricePerNight)}</span>
                    </div>
                    <div className="flex justify-between text-sm leading-loose">
                      <span className="text-muted-foreground">Số đêm:</span>
                      <span className="font-medium">{calculateNights()} đêm</span>
                    </div>
                    <div className="flex justify-between text-sm leading-loose">
                      <span className="text-muted-foreground">Số phòng:</span>
                      <span className="font-medium">{quantity}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Tổng cộng:</span>
                        <span className="text-lg font-bold">{formatPrice(calculateTotal())}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Đặt cọc (30%):</span>
                        <span className="font-medium luxury-text-gradient">{formatPrice(calculateDeposit())}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground leading-loose">
                    <Hotel className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Chọn ngày để xem giá</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
