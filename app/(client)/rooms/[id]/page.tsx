"use client"

import { useState, use, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Maximize,
  Wifi,
  Tv,
  Wind,
  Coffee,
  Bath,
  Home,
  Check,
  ChevronLeft,
  Star,
  MapPin,
  Building2,
  Bed,
  Calendar,
  Clock,
  Phone,
  Mail,
  Loader2,
} from "lucide-react"
import { useRoomType, useRoomTypes } from "@/lib/hooks/use-room-type"
import type { RoomType } from "@/lib/types/api"

const amenityIcons: Record<string, any> = {
  Wifi: Wifi,
  TV: Tv,
  "Điều hòa": Wind,
  Minibar: Coffee,
  "Bồn tắm": Bath,
  "Ban công": Home,
  "Két sắt": Building2,
}

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const roomTypeId = Number.parseInt(resolvedParams.id)

  const router = useRouter()
  const {
    data: roomTypeData,
    isLoading,
    error,
  } = useRoomType(roomTypeId)

  // Extract room type from infinite query (API returns single item for getById)
  const roomType = useMemo(() => {
    if (!roomTypeData?.pages?.[0]) return null
    return roomTypeData.pages[0] as unknown as RoomType
  }, [roomTypeData])

  // Fetch all room types for "Similar Rooms" section
  const { data: allRoomTypesData } = useRoomTypes({
    PageSize: 50,
  })

  // Extract all room types from infinite query
  const allRoomTypes = useMemo(() => {
    if (!allRoomTypesData?.pages) return []
    return allRoomTypesData.pages.flatMap((page) => page.items || [])
  }, [allRoomTypesData])

  const availableCount = roomType?.totalRooms || 0 // API doesn't return availableRoomCount for single room type
  const totalCount = roomType?.totalRooms || 0

  // Get similar room types
  const similarRoomTypes = useMemo(() => {
    return allRoomTypes
      .filter((rt) => rt.roomTypeId !== roomTypeId)
      .slice(0, 3)
      .map((rt) => ({
        roomTypeId: rt.roomTypeId,
        roomTypeName: rt.typeName,
        basePriceNight: rt.basePriceNight,
        maxOccupancy: rt.maxOccupancy,
        images: rt.images?.map(img => img.filePath) || [],
        availableCount: rt.totalRooms || 0, // Use totalRooms from API
      }))
  }, [allRoomTypes, roomTypeId])

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const handleBookNow = () => {
    if (!roomType) return

    sessionStorage.setItem(
      "bookingData",
      JSON.stringify({
        roomTypeId: roomType.roomTypeId,
        roomType: roomType.typeName,
        roomTypeCode: roomType.typeCode,
        price: roomType.basePriceNight,
        maxOccupancy: roomType.maxOccupancy,
      }),
    )
    router.push("/booking")
  }



  const images =
    roomType && roomType?.images?.length > 0
      ? roomType?.images.map((img) => img.filePath)
      : ["/hotel-building-exterior-modern-architecture.jpg"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="glass-effect border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-accent transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/rooms" className="hover:text-accent transition-colors">
              Phòng
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{roomType?.typeName}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-8 animate-fade-in-up"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại danh sách phòng
        </Link>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content - 8 columns */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="relative h-[500px] rounded-2xl overflow-hidden group">
                <Image
                  src={images[selectedImageIndex] || "/placeholder.svg"}
                  alt={roomType?.typeName || "Room"}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-6 left-6 flex gap-3">
                  <Badge className="glass-effect backdrop-blur-md border-white/20 text-foreground px-4 py-2 text-sm font-medium">
                    {roomType?.typeCode}
                  </Badge>
                  {availableCount > 0 ? (
                    <Badge className="bg-accent/90 backdrop-blur-md text-accent-foreground border-0 px-4 py-2 text-sm font-medium">
                      Còn {availableCount} phòng
                    </Badge>
                  ) : (
                    <Badge className="bg-destructive/90 backdrop-blur-md text-destructive-foreground border-0 px-4 py-2 text-sm font-medium">
                      Hết phòng
                    </Badge>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative h-24 rounded-xl overflow-hidden transition-all duration-300 ${selectedImageIndex === idx
                        ? "ring-2 ring-accent ring-offset-2 ring-offset-background scale-105"
                        : "opacity-60 hover:opacity-100 hover:scale-105"
                        }`}
                    >
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={roomType?.images?.[idx]?.description || `View ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              {/* Header */}
              <div className="space-y-4">
                <h1 className="font-serif text-4xl lg:text-5xl font-bold leading-tight text-balance">
                  {roomType?.typeName}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span>Mã: {roomType?.typeCode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-accent" />
                    <span>{totalCount} phòng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="font-medium text-foreground">4.8</span>
                    <span>(124 đánh giá)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-serif text-2xl font-semibold">Thông số phòng</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    className="group p-6 rounded-xl glass-effect border border-border/50 hover:border-accent/50 transition-all duration-300 animate-scale-in"
                    style={{ animationDelay: "0.3s" }}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Sức chứa</p>
                    <p className="text-xl font-bold">{roomType?.maxOccupancy} người</p>
                  </div>
                  <div
                    className="group p-6 rounded-xl glass-effect border border-border/50 hover:border-accent/50 transition-all duration-300 animate-scale-in"
                    style={{ animationDelay: "0.35s" }}
                  >
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Maximize className="w-6 h-6 text-accent" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Diện tích</p>
                    <p className="text-xl font-bold">{roomType?.roomSize}m²</p>
                  </div>
                  <div
                    className="group p-6 rounded-xl glass-effect border border-border/50 hover:border-accent/50 transition-all duration-300 animate-scale-in"
                    style={{ animationDelay: "0.4s" }}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Bed className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Số giường</p>
                    <p className="text-xl font-bold">{roomType?.numberOfBeds} giường</p>
                  </div>
                  <div
                    className="group p-6 rounded-xl glass-effect border border-border/50 hover:border-accent/50 transition-all duration-300 animate-scale-in"
                    style={{ animationDelay: "0.45s" }}
                  >
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Bed className="w-6 h-6 text-accent" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Loại giường</p>
                    <p className="text-xl font-bold">{roomType?.bedType}</p>
                  </div>
                </div>
              </div>

              {/* Room Availability Summary */}
              <div className="space-y-6">
                <h3 className="font-serif text-2xl font-semibold">Tình trạng phòng</h3>
                {roomType ? (
                  <div className="p-6 rounded-xl glass-effect border border-border/50">
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Tổng số phòng loại này</p>
                      <p className="text-5xl font-bold text-primary">{totalCount}</p>
                      <p className="text-sm text-muted-foreground mt-2">phòng</p>
                    </div>
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-sm text-muted-foreground italic text-center">
                        💡 Lễ tân sẽ phân phòng cụ thể cho bạn khi xác nhận đặt phòng dựa trên tình trạng phòng trống tại thời điểm đó.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-semibold">Mô tả</h3>
                <p className="text-muted-foreground leading-loose text-lg">{roomType?.description}</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl font-semibold">Đánh giá từ khách hàng</h3>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-accent text-accent" />
                    <span className="text-2xl font-bold">4.8</span>
                    <span className="text-muted-foreground">/5</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      name: "Nguyễn Văn A",
                      rating: 5,
                      comment: "Phòng rất đẹp và sạch sẽ. Nhân viên thân thiện. Sẽ quay lại!",
                      date: "2 ngày trước",
                    },
                    {
                      name: "Trần Thị B",
                      rating: 4,
                      comment: "Vị trí thuận tiện, view đẹp. Giá cả hợp lý.",
                      date: "1 tuần trước",
                    },
                  ].map((review, idx) => (
                    <div
                      key={idx}
                      className="p-6 rounded-xl glass-effect border border-border/50 hover:border-accent/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-lg mb-1">{review.name}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              {/* Price Card */}
              <div className="p-8 rounded-2xl luxury-gradient text-white shadow-2xl">
                <p className="text-sm opacity-90 mb-2">Giá mỗi đêm từ</p>
                <p className="text-4xl font-bold mb-6">{formatPrice(roomType?.basePriceNight || 0)}</p>
                <Button
                  className="w-full bg-white text-primary hover:bg-white/90 h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 rounded-xl"
                  onClick={() => handleBookNow()}
                >
                  Đặt phòng ngay
                </Button>
              </div>

              {/* Policies Card */}
              <div className="p-6 rounded-2xl glass-effect border border-border/50 space-y-6">
                <h4 className="font-serif text-xl font-semibold">Chính sách</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">Miễn phí hủy phòng</p>
                      <p className="text-sm text-muted-foreground">Trước 24 giờ nhận phòng</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">Nhận phòng</p>
                      <p className="text-sm text-muted-foreground">14:00 - 23:00</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">Trả phòng</p>
                      <p className="text-sm text-muted-foreground">Trước 12:00</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Coffee className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">Bữa sáng</p>
                      <p className="text-sm text-muted-foreground">Buffet miễn phí</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div className="p-6 rounded-2xl glass-effect border border-border/50 space-y-4">
                <h4 className="font-serif text-xl font-semibold">Liên hệ hỗ trợ</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground">Hotline:</span>
                    <span className="font-medium">1900 xxxx</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">support@stayhub.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {similarRoomTypes.length > 0 && (
          <div className="mt-20 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <div className="mb-8">
              <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-2">Phòng tương tự</h2>
              <p className="text-muted-foreground text-lg">Khám phá thêm các lựa chọn phù hợp với bạn</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {similarRoomTypes.map((group, idx) => {
                const roomImage = group.images?.[0] || "/hotel-building-exterior-modern-architecture.jpg"

                return (
                  <Link
                    key={group.roomTypeId}
                    href={`/rooms/${group.roomTypeId}`}
                    className="group animate-scale-in"
                    style={{ animationDelay: `${0.6 + idx * 0.1}s` }}
                  >
                    <div className="rounded-2xl overflow-hidden glass-effect border border-border/50 hover:border-accent/50 transition-all duration-500 hover:shadow-2xl">
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          src={roomImage}
                          alt={group.roomTypeName}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-primary/90 backdrop-blur-md border-0 px-3 py-1.5 text-sm font-medium text-white">
                            {group.availableCount} phòng
                          </Badge>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <h3 className="font-serif text-xl font-bold group-hover:text-accent transition-colors">
                          {group.roomTypeName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span>{group.maxOccupancy} người</span>
                          </div>
                          {/* Removed Maximize/Bed/Size info as not available in search result */}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <span className="text-sm text-muted-foreground">Từ</span>
                          <p className="text-xl font-bold luxury-text-gradient">
                            {formatPrice(group.basePriceNight)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

