"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { bookingsApi } from "@/lib/api/bookings"
import { roomsApi, type Room } from "@/lib/api/rooms"
import { useRooms } from "@/lib/hooks"
import { useAuth } from "@/contexts/auth-context"
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Hotel,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wifi,
  Tv,
  Coffee,
  Wind,
  Users,
  Maximize,
  BedDouble,
  Shield,
  Star,
  TrendingUp,
  Eye,
  Key,
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import {
  bookingDatesSchema,
  guestInfoSchema,
  type BookingDatesFormData,
  type GuestInfoFormData,
} from "@/lib/validations/booking"
import Image from "next/image"

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  tv: Tv,
  coffee: Coffee,
  "air conditioning": Wind,
  "điều hòa": Wind,
  tv: Tv,
  wifi: Wifi,
  minibar: Coffee,
}

function BookingPageContent() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [room, setRoom] = useState<Room | null>(null)
  const [isLoadingRoom, setIsLoadingRoom] = useState(true)

  const [bookingData, setBookingData] = useState<{
    roomId: number
    roomType: string
    pricePerNight: number
    roomName?: string
  } | null>(null)

  const [selectedSpecificRoomName, setSelectedSpecificRoomName] = useState<string | null>(null)

  useEffect(() => {
    const data = sessionStorage.getItem("bookingData")
    if (data) {
      const parsed = JSON.parse(data)
      setBookingData({
        roomId: parsed.roomId,
        roomType: parsed.roomType,
        pricePerNight: parsed.price,
        roomName: parsed.roomName,
      })
      if (parsed.roomName) {
        setSelectedSpecificRoomName(parsed.roomName)
      }
    } else {
      router.push("/rooms")
    }
  }, [router])

  const roomId = bookingData?.roomId || 0
  const roomType = bookingData?.roomType || ""
  const pricePerNight = bookingData?.pricePerNight || 0

  const {
    control: datesControl,
    handleSubmit: handleDatesSubmit,
    watch: watchDates,
    formState: { errors: datesErrors },
  } = useForm<BookingDatesFormData>({
    resolver: zodResolver(bookingDatesSchema),
    defaultValues: {
      checkInDate: undefined,
      checkOutDate: undefined,
      quantity: 1,
    },
  })

  const {
    control: guestControl,
    handleSubmit: handleGuestSubmit,
    setValue: setGuestValue,
    getValues: getGuestValues,
    formState: { errors: guestErrors },
  } = useForm<GuestInfoFormData>({
    resolver: zodResolver(guestInfoSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      identityCard: "",
      address: "",
      specialRequests: "",
    },
  })

  const checkInDate = watchDates("checkInDate")
  const checkOutDate = watchDates("checkOutDate")
  const quantity = watchDates("quantity")

  // Fetch available specific rooms
  const { data: availableRoomsData } = useRooms(
    {
      roomTypeId: roomId,
      checkInDate: checkInDate?.toISOString(),
      checkOutDate: checkOutDate?.toISOString(),
      // Status "Available" is implied if we want only available?
      // roomsApi.search supports 'status'.
      // If I want to list ONLY available rooms for the dates, I should pass status="Available"?
      // Or filter client side?
      // Usually matching "Available" status code is safer.
      // But let's just get them all and render status.
      pageNumber: 1,
      pageSize: 100,
    },
    true
  )
  const availableSpecificRooms = availableRoomsData?.rooms || []

  useEffect(() => {
    if (isAuthenticated && user?.profileDetails) {
      const profile = user.profileDetails
      setGuestValue("fullName", profile.fullName || "")
      setGuestValue("email", user.email || "")
      setGuestValue("phoneNumber", profile.phoneNumber || "")
      if ("identityCard" in profile) {
        setGuestValue("identityCard", profile.identityCard || "")
      }
      if ("address" in profile) {
        setGuestValue("address", profile.address || "")
      }
    }
  }, [isAuthenticated, user, setGuestValue])

  useEffect(() => {
    if (bookingData && (!roomId || !roomType || !pricePerNight)) {
      router.push("/rooms")
    }
  }, [bookingData, roomId, roomType, pricePerNight, router])

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
    return Math.round(calculateTotal() * 0.3)
  }

  const onDatesSubmit = (data: BookingDatesFormData) => {
    setStep(2)
  }

  const onGuestSubmit = (data: GuestInfoFormData) => {
    setStep(3)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleFinalSubmit = async () => {
    if (!checkInDate || !checkOutDate) return

    setIsSubmitting(true)
    try {
      const guestData = getGuestValues()

      if (isAuthenticated && user?.profileDetails && "customerId" in user.profileDetails) {
        // Authenticated user booking
        const response = await bookingsApi.create({
          customerId: user.profileDetails.customerId,
          roomTypes: [
            {
              roomTypeId: roomId,
              quantity,
            },
          ],
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString(),
          specialRequests: [
            guestData.specialRequests,
            selectedSpecificRoomName ? `Yêu cầu phòng cụ thể: ${selectedSpecificRoomName}` : null,
          ]
            .filter(Boolean)
            .join(". ") || undefined,
        })

        if (response.isSuccess && response.data) {
          // Redirect to QR payment page with all necessary info
          const params = new URLSearchParams({
            bookingId: response.data.booking.bookingId.toString(),
            token: response.data.bookingToken,
            amount: response.data.booking.depositAmount.toString(),
            deadline: response.data.paymentDeadline,
          })

          if (response.data.qrPayment) {
            params.append("qrCode", response.data.qrPayment.qrCodeUrl)
            params.append("accountNo", response.data.qrPayment.accountNumber)
            params.append("accountName", response.data.qrPayment.accountName)
            params.append("bankName", response.data.qrPayment.bankName)
            params.append("description", response.data.qrPayment.description)
          }

          router.push(`/booking/qr-payment?${params.toString()}`)
        }
      } else {
        // Guest booking
        const guestResponse = await bookingsApi.createByGuest({
          fullName: guestData.fullName,
          email: guestData.email,
          phoneNumber: guestData.phoneNumber,
          identityCard: guestData.identityCard || undefined,
          address: guestData.address || undefined,
          roomTypes: [
            {
              roomTypeId: roomId,
              quantity,
            },
          ],
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString(),
          specialRequests: [
            guestData.specialRequests,
            selectedSpecificRoomName ? `Yêu cầu phòng cụ thể: ${selectedSpecificRoomName}` : null,
          ]
            .filter(Boolean)
            .join(". ") || undefined,
        })

        if (guestResponse.isSuccess && guestResponse.data) {
          // Redirect to QR payment page with all necessary info
          const params = new URLSearchParams({
            bookingId: guestResponse.data.booking.bookingId.toString(),
            token: guestResponse.data.bookingToken,
            amount: guestResponse.data.booking.depositAmount.toString(),
            deadline: guestResponse.data.paymentDeadline,
          })

          if (guestResponse.data.qrPayment) {
            params.append("qrCode", guestResponse.data.qrPayment.qrCodeUrl)
            params.append("accountNo", guestResponse.data.qrPayment.accountNumber)
            params.append("accountName", guestResponse.data.qrPayment.accountName)
            params.append("bankName", guestResponse.data.qrPayment.bankName)
            params.append("description", guestResponse.data.qrPayment.description)
          }

          router.push(`/booking/qr-payment?${params.toString()}`)
        }
      }
    } catch (error: any) {
      console.error("Booking error:", error)
      const reason = error?.status === 409 ? "not_available" : "unknown"
      router.push(`/booking/failure?reason=${reason}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!roomId) return

      try {
        setIsLoadingRoom(true)
        const roomData = await roomsApi.getById(roomId)
        setRoom(roomData)
      } catch (error) {
        console.error("Error fetching room details:", error)
      } finally {
        setIsLoadingRoom(false)
      }
    }

    fetchRoomDetails()
  }, [roomId])

  if (isLoadingRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 py-2 leading-normal">
            <span className="luxury-text-gradient">Đặt phòng</span>
          </h1>
          <p className="text-2xl font-serif text-foreground leading-loose mb-2">{roomType}</p>
          {isAuthenticated && (
            <p className="text-sm text-accent leading-loose">Đang đặt phòng với tài khoản: {user?.email}</p>
          )}
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {room && (
                <div className="glass-effect rounded-2xl overflow-hidden animate-scale-in">
                  <div className="grid md:grid-cols-2 gap-6 p-6">
                    {/* Room Image */}
                    <div className="relative h-64 md:h-full rounded-xl overflow-hidden">
                      {room.images && room.images.length > 0 ? (
                        <Image
                          src={room.images[0].filePath || "/placeholder.svg"}
                          alt={room.typeName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Hotel className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-accent/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Phổ biến
                      </div>
                    </div>

                    {/* Room Info */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-serif text-2xl font-bold mb-2 leading-normal">{room.typeName}</h3>
                        <p className="text-muted-foreground text-sm leading-loose line-clamp-3">{room.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-accent" />
                          <span>{room.maxOccupancy} khách</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Maximize className="w-4 h-4 text-accent" />
                          <span>{room.roomSize}m²</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <BedDouble className="w-4 h-4 text-accent" />
                          <span>
                            {room.numberOfBeds} {room.bedType}
                          </span>
                        </div>
                        {room.availableRoomCount !== null && (
                          <div className="flex items-center gap-2 text-sm">
                            <Hotel className="w-4 h-4 text-accent" />
                            <span>Còn {room.availableRoomCount} phòng</span>
                          </div>
                        )}
                      </div>

                      {room.amenities && room.amenities.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Tiện nghi:</p>
                          <div className="flex flex-wrap gap-2">
                            {room.amenities.slice(0, 6).map((amenity, idx) => {
                              const IconComponent = amenityIcons[amenity.toLowerCase()] || CheckCircle2
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-1 rounded-full"
                                >
                                  <IconComponent className="w-3 h-3" />
                                  <span>{amenity}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t bg-muted/30 px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Shield className="w-4 h-4" />
                        <span>Miễn phí hủy trong 24h</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span>12 người đang xem phòng này</span>
                      </div>
                      <div className="flex items-center gap-2 text-accent">
                        <Star className="w-4 h-4 fill-current" />
                        <span>4.8/5 (124 đánh giá)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Form */}
              <div className="glass-effect rounded-2xl p-8 animate-scale-in" style={{ animationDelay: "0.1s" }}>
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

                {step === 1 && (
                  <form onSubmit={handleDatesSubmit(onDatesSubmit)} className="space-y-6 animate-fade-in-up">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Ngày nhận phòng *</Label>
                        <Controller
                          name="checkInDate"
                          control={datesControl}
                          render={({ field }) => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal h-12",
                                    !field.value && "text-muted-foreground",
                                    datesErrors.checkInDate && "border-red-500",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => {
                                    const today = new Date()
                                    today.setHours(0, 0, 0, 0)
                                    return date < today
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                        {datesErrors.checkInDate && (
                          <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {datesErrors.checkInDate.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-medium">Ngày trả phòng *</Label>
                        <Controller
                          name="checkOutDate"
                          control={datesControl}
                          render={({ field }) => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal h-12",
                                    !field.value && "text-muted-foreground",
                                    datesErrors.checkOutDate && "border-red-500",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => {
                                    const today = new Date()
                                    today.setHours(0, 0, 0, 0)
                                    if (checkInDate) {
                                      return date <= checkInDate
                                    }
                                    return date < today
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                        {datesErrors.checkOutDate && (
                          <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {datesErrors.checkOutDate.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">Số lượng phòng *</Label>
                      <Controller
                        name="quantity"
                        control={datesControl}
                        render={({ field }) => (
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                            className={cn("h-12", datesErrors.quantity && "border-red-500")}
                          />
                        )}
                      />
                      {datesErrors.quantity && (
                        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-4 h-4" />
                          {datesErrors.quantity.message}
                        </p>
                      )}
                    </div>



                    <div className="flex justify-end pt-4">
                      <Button type="submit" className="luxury-gradient text-white" size="lg">
                        Tiếp tục
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={handleGuestSubmit(onGuestSubmit)} className="space-y-6 animate-fade-in-up">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Họ và tên *</Label>
                      <Controller
                        name="fullName"
                        control={guestControl}
                        render={({ field }) => (
                          <Input
                            placeholder="Nguyễn Văn A"
                            {...field}
                            className={cn("h-12", guestErrors.fullName && "border-red-500")}
                            disabled={isAuthenticated}
                          />
                        )}
                      />
                      {guestErrors.fullName && (
                        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-4 h-4" />
                          {guestErrors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Email *</Label>
                        <Controller
                          name="email"
                          control={guestControl}
                          render={({ field }) => (
                            <Input
                              type="email"
                              placeholder="example@email.com"
                              {...field}
                              className={cn("h-12", guestErrors.email && "border-red-500")}
                              disabled={isAuthenticated}
                            />
                          )}
                        />
                        {guestErrors.email && (
                          <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {guestErrors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-medium">Số điện thoại *</Label>
                        <Controller
                          name="phoneNumber"
                          control={guestControl}
                          render={({ field }) => (
                            <Input
                              type="tel"
                              placeholder="0123456789"
                              {...field}
                              className={cn("h-12", guestErrors.phoneNumber && "border-red-500")}

                            />
                          )}
                        />
                        {guestErrors.phoneNumber && (
                          <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {guestErrors.phoneNumber.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">CMND/CCCD</Label>
                      <Controller
                        name="identityCard"
                        control={guestControl}
                        render={({ field }) => (
                          <Input
                            placeholder="001234567890"
                            {...field}
                            className={cn("h-12", guestErrors.identityCard && "border-red-500")}

                          />
                        )}
                      />
                      {guestErrors.identityCard && (
                        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-4 h-4" />
                          {guestErrors.identityCard.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">Địa chỉ</Label>
                      <Controller
                        name="address"
                        control={guestControl}
                        render={({ field }) => (
                          <Input
                            placeholder="123 Đường ABC, Quận XYZ, TP. HCM"
                            {...field}
                            className={cn("h-12", guestErrors.address && "border-red-500")}

                          />
                        )}
                      />
                      {guestErrors.address && (
                        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-4 h-4" />
                          {guestErrors.address.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">Yêu cầu đặc biệt (tùy chọn)</Label>
                      <Controller
                        name="specialRequests"
                        control={guestControl}
                        render={({ field }) => (
                          <Textarea
                            placeholder="Ví dụ: Tầng cao, view đẹp, giường đôi..."
                            {...field}
                            rows={4}
                            className={cn("resize-none", guestErrors.specialRequests && "border-red-500")}
                          />
                        )}
                      />
                      {guestErrors.specialRequests && (
                        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-4 h-4" />
                          {guestErrors.specialRequests.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <Button type="button" variant="outline" onClick={handleBack} size="lg">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Quay lại
                      </Button>
                      <Button type="submit" className="luxury-gradient text-white" size="lg">
                        Tiếp tục
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                )}

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
                        {selectedSpecificRoomName && (
                          <div className="flex justify-between">
                            <span className="opacity-90">Phòng cụ thể:</span>
                            <span className="text-white font-bold border-b border-white/50">{selectedSpecificRoomName}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-white/20">
                        <h3 className="font-serif text-xl font-semibold mb-3">Thông tin khách hàng</h3>
                        <div className="space-y-3 text-sm leading-loose">
                          <div className="flex justify-between">
                            <span className="opacity-90">Họ tên:</span>
                            <span className="font-medium">{getGuestValues("fullName")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="opacity-90">Email:</span>
                            <span className="font-medium">{getGuestValues("email")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="opacity-90">Điện thoại:</span>
                            <span className="font-medium">{getGuestValues("phoneNumber")}</span>
                          </div>
                          {getGuestValues("identityCard") && (
                            <div className="flex justify-between">
                              <span className="opacity-90">CMND/CCCD:</span>
                              <span className="font-medium">{getGuestValues("identityCard")}</span>
                            </div>
                          )}
                          {getGuestValues("address") && (
                            <div className="flex justify-between">
                              <span className="opacity-90">Địa chỉ:</span>
                              <span className="font-medium text-right max-w-[60%]">{getGuestValues("address")}</span>
                            </div>
                          )}
                          {getGuestValues("specialRequests") && (
                            <div className="flex justify-between">
                              <span className="opacity-90">Yêu cầu:</span>
                              <span className="font-medium text-right max-w-[60%]">
                                {getGuestValues("specialRequests")}
                              </span>
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

                    <div className="flex items-center justify-between pt-4">
                      <Button variant="outline" onClick={handleBack} disabled={isSubmitting} size="lg">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Quay lại
                      </Button>
                      <Button
                        onClick={handleFinalSubmit}
                        disabled={isSubmitting}
                        className="luxury-gradient text-white"
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
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div
                className="glass-effect rounded-2xl p-6 sticky top-24 animate-scale-in space-y-6"
                style={{ animationDelay: "0.2s" }}
              >
                <h3 className="font-serif text-xl font-semibold">Chi tiết giá</h3>

                {checkInDate && checkOutDate ? (
                  <>
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
                        <span className="font-medium">{quantity} phòng</span>
                      </div>
                      <div className="flex justify-between text-sm leading-loose">
                        <span className="text-muted-foreground">Tạm tính:</span>
                        <span className="font-medium">
                          {formatPrice(pricePerNight)} × {calculateNights()} × {quantity}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">Tổng cộng:</span>
                        <span className="text-2xl font-bold luxury-text-gradient">{formatPrice(calculateTotal())}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Đặt cọc (30%):</span>
                        <span className="font-semibold text-accent">{formatPrice(calculateDeposit())}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Bạn chỉ cần thanh toán 30% để giữ phòng. Số tiền còn lại sẽ thanh toán khi nhận phòng.
                      </p>
                    </div>

                    <div className="pt-4 border-t space-y-3">
                      <p className="text-sm font-medium">Ưu đãi khi đặt phòng:</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground leading-relaxed">Miễn phí hủy trong 24h</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground leading-relaxed">Thanh toán an toàn & bảo mật</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground leading-relaxed">Xác nhận đặt phòng ngay lập tức</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground leading-relaxed">Hỗ trợ 24/7</span>
                        </div>
                      </div>
                    </div>
                  </>
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

export default function BookingPage() {
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
      <BookingPageContent />
    </Suspense>
  )
}
