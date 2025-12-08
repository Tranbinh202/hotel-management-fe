"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { useRoomTypes } from "@/lib/hooks/use-room-type"
import { useAmenities } from "@/lib/hooks/use-amenities"
import {
  Star,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Tv,
  Coffee,
  Shield,
  Waves,
  UtensilsCrossed,
  Dumbbell,
  Sparkles,
  ParkingCircle,
  Headphones,
  Car,
  Target,
  Calendar,
  Users,
  CreditCard,
  RotateCcw,
  Zap,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [checkInDate, setCheckInDate] = useState<Date | undefined>()
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>()

  // Use React Query to fetch room types
  const { data: roomTypesData, isLoading: isLoadingRooms } = useRoomTypes({
    PageSize: 8,
  })

  // Use React Query to fetch amenities
  const { data: amenitiesData, isLoading: isLoadingAmenities } = useAmenities({
    IsActive: true,
    AmenityType: "Common",
    PageSize: 8,
  })

  // Extract rooms from the paginated response
  const rooms = roomTypesData?.pages?.[0]?.items || []
  
  // Extract amenities from the paginated response
  const amenities = amenitiesData?.pages?.[0]?.items || []

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const isStaffOrEmployee = user.roles?.some((role) => role !== "User")
      const hasOnlyStaffRoles = user.roles?.length > 0 && !user.roles.includes("User")

      if (isStaffOrEmployee && hasOnlyStaffRoles) {
        setIsRedirecting(true)
        router.push("/admin/dashboard")
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  if (!mounted || isLoading || isRedirecting || isLoadingRooms) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 luxury-gradient z-10 opacity-90"></div>
        <img
          src="/luxury-hotel-lobby-modern.png"
          alt="Hotel Lobby"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[oklch(0.25_0.04_265)]/20 z-10"></div>

        <div className="relative z-20 text-center text-white px-6 max-w-6xl mx-auto animate-fade-in-up">
          <div className="inline-block mb-6 px-8 py-3 glass-effect rounded-full text-sm font-medium shadow-xl animate-float">
            <span className="text-[oklch(0.72_0.12_75)]">
              <Sparkles className="inline w-4 h-4 mr-2" />
            </span>
            Ưu đãi đặc biệt: Giảm 30% cho đặt phòng đầu tiên
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight">
            Trải nghiệm nghỉ dưỡng
            <br />
            <span className="inline-block mt-4 py-2 bg-gradient-to-r from-white via-[oklch(0.72_0.12_75)] to-white bg-clip-text  animate-shimmer leading-normal">
              đẳng cấp 5 sao
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-white/95 leading-loose max-w-4xl mx-auto font-light">
            Khám phá không gian sang trọng, dịch vụ hoàn hảo và những khoảnh khắc đáng nhớ tại StayHub - Nơi mọi kỳ nghỉ
            trở thành trải nghiệm tuyệt vời
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-16">
            <Link href="/rooms">
              <Button
                size="lg"
                className="bg-[oklch(0.72_0.12_75)] text-[oklch(0.18_0.02_265)] hover:bg-[oklch(0.82_0.12_75)] text-lg h-16 px-12 shadow-2xl shadow-[oklch(0.72_0.12_75)]/50 font-semibold hover:scale-105 transition-all duration-300"
              >
                Đặt phòng ngay
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-2 border-white/80 hover:bg-white/20 text-lg h-16 px-12 glass-effect font-semibold hover:scale-105 transition-all duration-300 bg-transparent"
            >
              Xem video giới thiệu
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-10 text-sm font-medium">
            <div className="flex items-center gap-3 glass-effect px-6 py-3 rounded-full">
              <Star className="w-6 h-6 text-[oklch(0.72_0.12_75)] fill-[oklch(0.72_0.12_75)]" />
              <span>4.9/5 từ 2,500+ đánh giá</span>
            </div>
            <div className="flex items-center gap-3 glass-effect px-6 py-3 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-[oklch(0.72_0.12_75)]" />
              <span>Miễn phí hủy phòng</span>
            </div>
            <div className="flex items-center gap-3 glass-effect px-6 py-3 rounded-full">
              <Clock className="w-6 h-6 text-[oklch(0.72_0.12_75)]" />
              <span>Check-in 24/7</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/80" />
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-32 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-block mb-4 px-6 py-2 bg-[oklch(0.72_0.12_75)]/10 rounded-full text-[oklch(0.72_0.12_75)] text-sm font-semibold tracking-wider uppercase">
              Phòng nghỉ
            </div>
            <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6 py-4 luxury-text-gradient">
              Phòng nghỉ cao cấp
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-loose">
              Mỗi phòng được thiết kế tinh tế với nội thất sang trọng, mang đến sự thoải mái tối đa và trải nghiệm nghỉ
              dưỡng đẳng cấp cho kỳ nghỉ của bạn
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative group">
            {/* Navigation Buttons */}
            <button
              onClick={() => {
                const container = document.getElementById('rooms-carousel')
                if (container) {
                  container.scrollBy({ left: -400, behavior: 'smooth' })
                }
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-xl rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-6"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 text-[oklch(0.72_0.12_75)]" />
            </button>

            <button
              onClick={() => {
                const container = document.getElementById('rooms-carousel')
                if (container) {
                  container.scrollBy({ left: 400, behavior: 'smooth' })
                }
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-xl rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mr-6"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 text-[oklch(0.72_0.12_75)]" />
            </button>

            {/* Scrollable Container */}
            <div
              id="rooms-carousel"
              className="flex gap-6 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {rooms.length > 0
                ? rooms.map((room, index) => (
                  <div
                    key={room.roomTypeId}
                    className="flex-none w-[350px] snap-start group/card bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-border hover:border-[oklch(0.72_0.12_75)]/30 animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={
                          room.images?.[0]?.filePath || "/hotel-building-exterior-modern-architecture.jpg" || "/placeholder.svg"
                        }
                        alt={room.typeName}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.25_0.04_265)]/60 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-4 right-4 glass-effect px-4 py-2 rounded-xl backdrop-blur-xl">
                        <span className="text-[oklch(0.72_0.12_75)] font-bold text-base">
                          {room.basePriceNight?.toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-white/90 text-xs">/đêm</span>
                      </div>
                      <div className="absolute top-4 left-4 bg-[oklch(0.72_0.12_75)] text-[oklch(0.18_0.02_265)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Còn {room.availableRoomCount || room.totalRoomCount || 0} phòng
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-serif text-2xl font-bold mb-2 text-foreground line-clamp-1">{room.typeName}</h3>
                      <p className="text-muted-foreground text-sm mb-4 leading-loose line-clamp-2">
                        {room.description || "Phòng sang trọng với đầy đủ tiện nghi hiện đại"}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-[oklch(0.72_0.12_75)]" />
                          {room.maxOccupancy || 2} người
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-[oklch(0.72_0.12_75)]" />
                          {room.roomSize}m²
                        </span>
                      </div>

                      <div className="border-t border-border pt-4 mb-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                          Tiện nghi
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          <span className="text-xs text-foreground flex items-center gap-1">
                            <Wifi className="w-3 h-3 text-[oklch(0.72_0.12_75)]" />
                            WiFi
                          </span>
                          <span className="text-xs text-foreground flex items-center gap-1">
                            <Tv className="w-3 h-3 text-[oklch(0.72_0.12_75)]" />
                            TV 55"
                          </span>
                          <span className="text-xs text-foreground flex items-center gap-1">
                            <Coffee className="w-3 h-3 text-[oklch(0.72_0.12_75)]" />
                            Minibar
                          </span>
                          <span className="text-xs text-foreground flex items-center gap-1">
                            <Shield className="w-3 h-3 text-[oklch(0.72_0.12_75)]" />
                            Két
                          </span>
                        </div>
                      </div>

                      <Link href={`/rooms/${room.roomTypeId}`}>
                        <Button className="w-full luxury-gradient hover:opacity-90 text-white h-11 font-semibold text-sm shadow-lg shadow-[oklch(0.72_0.12_75)]/20 hover:shadow-xl hover:shadow-[oklch(0.72_0.12_75)]/30 transition-all duration-300">
                          Xem chi tiết & Đặt phòng
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
                : // Fallback static rooms if API fails
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex-none w-[350px] snap-start group/card bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-border hover:border-[oklch(0.72_0.12_75)]/30"
                  >
                    <div className="relative h-64 overflow-hidden bg-muted animate-pulse"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-10 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <Link href="/rooms">
              <Button
                size="lg"
                variant="outline"
                className="text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground text-base h-14 px-10 font-semibold bg-transparent"
              >
                Xem tất cả phòng
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="py-32 bg-muted">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 px-6 py-2 bg-[oklch(0.72_0.12_75)]/10 rounded-full text-[oklch(0.72_0.12_75)] text-sm font-semibold tracking-wider uppercase">
              Tiện nghi
            </div>
            <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6 py-4 luxury-text-gradient">
              Tiện nghi đẳng cấp
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-loose">
              Trải nghiệm đầy đủ các tiện ích hiện đại và dịch vụ chăm sóc tận tâm, mang đến sự thoải mái và tiện lợi
              tối đa cho kỳ nghỉ của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Waves,
                title: "Hồ bơi vô cực",
                desc: "Hồ bơi ngoài trời với view tuyệt đẹp, mở cửa từ 6h-22h",
              },
              {
                icon: UtensilsCrossed,
                title: "Nhà hàng 5 sao",
                desc: "Ẩm thực đa quốc gia cao cấp từ đầu bếp Michelin",
              },
              {
                icon: Sparkles,
                title: "Spa & Massage",
                desc: "Dịch vụ chăm sóc sức khỏe chuyên nghiệp với liệu pháp cao cấp",
              },
              {
                icon: Dumbbell,
                title: "Phòng gym",
                desc: "Trang thiết bị hiện đại 24/7 với huấn luyện viên cá nhân",
              },
              {
                icon: ParkingCircle,
                title: "Bãi đỗ xe",
                desc: "Miễn phí cho khách lưu trú, có dịch vụ valet parking",
              },
              {
                icon: Wifi,
                title: "WiFi tốc độ cao",
                desc: "Kết nối internet miễn phí tốc độ 1Gbps toàn khách sạn",
              },
              {
                icon: Headphones,
                title: "Lễ tân 24/7",
                desc: "Hỗ trợ khách hàng mọi lúc với đội ngũ đa ngôn ngữ",
              },
              {
                icon: Car,
                title: "Đưa đón sân bay",
                desc: "Dịch vụ xe riêng sang trọng theo yêu cầu",
              },
            ].map((amenity, index) => {
              const IconComponent = amenity.icon
              return (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 border border-border hover:border-[oklch(0.72_0.12_75)]/30 group hover:-translate-y-2"
                >
                  <div className="mb-5 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                    <IconComponent className="w-16 h-16 text-[oklch(0.72_0.12_75)]" />
                  </div>
                  <h3 className="font-semibold text-xl mb-3 text-foreground">{amenity.title}</h3>
                  <p className="text-sm text-muted-foreground leading-loose">{amenity.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-16">
            <Link href="/amenities">
              <Button
                size="lg"
                variant="outline"
                className="text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground text-base h-14 px-10 font-semibold bg-transparent"
              >
                Xem tất cả tiện nghi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section id="offers" className="py-32 bg-gradient-to-br from-[oklch(0.99_0.005_85)] to-[oklch(0.96_0.01_85)]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 px-6 py-2 bg-[oklch(0.72_0.12_75)]/10 rounded-full text-[oklch(0.72_0.12_75)] text-sm font-semibold tracking-wider uppercase">
              Ưu đãi
            </div>
            <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6 py-4 luxury-text-gradient">
              Ưu đãi đặc biệt
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-loose">
              Những chương trình khuyến mãi hấp dẫn dành riêng cho bạn
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Ưu đãi đặt sớm",
                discount: "30%",
                description: "Đặt trước 30 ngày và nhận ngay ưu đãi lên đến 30%. Áp dụng cho tất cả loại phòng.",
                color: "luxury-gradient",
                icon: Target,
                badge: "Phổ biến nhất",
              },
              {
                title: "Nghỉ dài giá ưu đãi",
                discount: "25%",
                description: "Lưu trú từ 5 đêm trở lên, giảm ngay 25% tổng hóa đơn. Tặng kèm spa miễn phí.",
                color: "bg-gradient-to-br from-[oklch(0.35_0.06_265)] to-[oklch(0.25_0.04_265)]",
                icon: Calendar,
                badge: "Tiết kiệm nhất",
              },
              {
                title: "Combo gia đình",
                discount: "20%",
                description: "Đặt 2 phòng trở lên, tặng buffet sáng miễn phí và vé tham quan cho trẻ em.",
                color: "bg-gradient-to-br from-[oklch(0.82_0.12_75)] to-[oklch(0.72_0.12_75)]",
                icon: Users,
                badge: "Gia đình",
              },
            ].map((offer, index) => {
              const IconComponent = offer.icon
              return (
                <div
                  key={index}
                  className="relative bg-card rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden border border-border hover:border-[oklch(0.72_0.12_75)]/30 hover:-translate-y-2"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[oklch(0.72_0.12_75)]/5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>

                  <div className="absolute top-6 right-6 bg-[oklch(0.72_0.12_75)] text-[oklch(0.18_0.02_265)] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                    {offer.badge}
                  </div>

                  <div className="relative">
                    <div className="mb-6 group-hover:scale-110 transition-transform duration-300 flex justify-start">
                      <IconComponent className="w-16 h-16 text-[oklch(0.72_0.12_75)]" />
                    </div>
                    <div
                      className={`inline-block px-6 py-3 ${offer.color} text-white rounded-2xl font-bold text-3xl mb-6 shadow-lg`}
                    >
                      -{offer.discount}
                    </div>
                    <h3 className="font-serif text-3xl font-bold mb-4 text-foreground">{offer.title}</h3>
                    <p className="text-muted-foreground mb-8 leading-loose text-base">{offer.description}</p>
                    <Button
                      className={`w-full ${offer.color} hover:opacity-90 text-white h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      Đặt ngay
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Khách hàng nói gì về chúng tôi</h2>
            <p className="text-muted-foreground text-lg">Hơn 10,000 khách hàng hài lòng</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Nguyễn Minh Anh",
                role: "Du khách",
                rating: 5,
                comment:
                  "Trải nghiệm tuyệt vời! Phòng sạch sẽ, nhân viên thân thiện và vị trí thuận lợi. Chắc chắn sẽ quay lại.",
              },
              {
                name: "Trần Hoàng Long",
                role: "Khách doanh nhân",
                rating: 5,
                comment: "Dịch vụ chuyên nghiệp, tiện nghi hiện đại. Rất phù hợp cho các chuyến công tác.",
              },
              {
                name: "Lê Thị Hương",
                role: "Gia đình",
                rating: 5,
                comment: "Kỳ nghỉ gia đình tuyệt vời. Các bé rất thích hồ bơi và khu vui chơi. Highly recommended!",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-card rounded-xl p-8 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[oklch(0.72_0.12_75)] fill-[oklch(0.72_0.12_75)]" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-loose">{testimonial.comment}</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking CTA Section */}
      <section id="booking" className="py-32 luxury-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-5"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="font-serif text-5xl md:text-6xl font-bold mb-8">Đặt phòng ngay hôm nay</h2>
          <p className="text-2xl mb-16 text-white/95 max-w-3xl mx-auto leading-loose font-light">
            Nhận ưu đãi đặc biệt khi đặt phòng trực tiếp. Giảm giá lên đến 30% cho khách hàng mới!
          </p>

          <div className="glass-effect rounded-3xl p-10 max-w-6xl mx-auto shadow-2xl border border-white/20">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-left">
                <label className="block text-sm mb-3 text-white/90 font-semibold">Ngày nhận phòng</label>
                <DatePicker
                  value={checkInDate}
                  onChange={setCheckInDate}
                  placeholder="Chọn ngày"
                  minDate={(() => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return today
                  })()}
                  className="[&_button]:bg-white/20 [&_button]:border-white/30 [&_button]:text-white [&_button:hover]:bg-white/30 [&_button:hover]:border-white/50 [&_button]:backdrop-blur-sm"
                />
              </div>
              <div className="text-left">
                <label className="block text-sm mb-3 text-white/90 font-semibold">Ngày trả phòng</label>
                <DatePicker
                  value={checkOutDate}
                  onChange={setCheckOutDate}
                  placeholder="Chọn ngày"
                  minDate={checkInDate ? new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000) : new Date()}
                  className="[&_button]:bg-white/20 [&_button]:border-white/30 [&_button]:text-white [&_button:hover]:bg-white/30 [&_button:hover]:border-white/50 [&_button]:backdrop-blur-sm"
                />
              </div>
              <div className="text-left">
                <label className="block text-sm mb-3 text-white/90 font-semibold">Số khách</label>
                <select className="w-full px-5 py-4 rounded-xl bg-white/20 border border-white/30 text-white backdrop-blur-sm focus:bg-white/30 focus:border-white/50 transition-all font-medium">
                  <option className="text-gray-900">1 người</option>
                  <option className="text-gray-900">2 người</option>
                  <option className="text-gray-900">3 người</option>
                  <option className="text-gray-900">4+ người</option>
                </select>
              </div>
              <div className="text-left">
                <label className="block text-sm mb-3 text-white/90 font-semibold">Loại phòng</label>
                <select className="w-full px-5 py-4 rounded-xl bg-white/20 border border-white/30 text-white backdrop-blur-sm focus:bg-white/30 focus:border-white/50 transition-all font-medium">
                  <option className="text-gray-900">Deluxe</option>
                  <option className="text-gray-900">Suite</option>
                  <option className="text-gray-900">Presidential</option>
                </select>
              </div>
            </div>

            <Link href="/rooms">
              <Button
                size="lg"
                className="w-full md:w-auto bg-[oklch(0.72_0.12_75)] text-[oklch(0.18_0.02_265)] hover:bg-[oklch(0.82_0.12_75)] text-lg h-16 px-16 shadow-2xl font-bold hover:scale-105 transition-all duration-300"
              >
                Kiểm tra phòng trống
              </Button>
            </Link>

            <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm font-medium">
              <span className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[oklch(0.72_0.12_75)]" />
                Thanh toán an toàn
              </span>
              <span className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-[oklch(0.72_0.12_75)]" />
                Miễn phí hủy phòng
              </span>
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[oklch(0.72_0.12_75)]" />
                Xác nhận ngay lập tức
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Vị trí đắc địa</h2>
              <p className="text-muted-foreground text-lg mb-8 leading-loose">
                Tọa lạc tại trung tâm thành phố, StayHub mang đến sự thuận tiện tối đa cho mọi hành trình của bạn. Chỉ 5
                phút đến sân bay, 2 phút đến trung tâm thương mại và các điểm tham quan nổi tiếng.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold">Địa chỉ</div>
                    <div className="text-muted-foreground">123 Đường Thụy Khuê, Phường Tây Hồ, TP. Hà Nội</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold">Hotline</div>
                    <div className="text-muted-foreground">1900 1234 (24/7)</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-muted-foreground">info@stayhub.vn</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-96 lg:h-full min-h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/hotel-building-exterior-modern-architecture.jpg"
                alt="Hotel Location"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
