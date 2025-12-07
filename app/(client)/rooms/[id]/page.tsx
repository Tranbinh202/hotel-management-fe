"use client"

import { useState, use } from "react"
import Link from "next/link"
import Image from "next/image"
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
} from "lucide-react"
import { useRoom, useRooms } from "@/lib/hooks"

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

  const {
    data: roomType,
    isLoading,
    error,
  } = useRoom({
    id: roomTypeId,
  })
  const { data: allRoomTypes } = useRooms({})

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const similarRooms =
    allRoomTypes?.pages[0].items.filter((r) => r.roomTypeId !== roomType?.roomTypeId && r.isActive).slice(0, 3) || []

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
                  {roomType?.availableRoomCount !== null &&
                  roomType?.availableRoomCount !== undefined &&
                  roomType?.availableRoomCount > 0 ? (
                    <Badge className="bg-accent/90 backdrop-blur-md text-accent-foreground border-0 px-4 py-2 text-sm font-medium">
                      Còn {roomType?.availableRoomCount} phòng
                    </Badge>
                  ) : roomType?.availableRoomCount === 0 ? (
                    <Badge className="bg-destructive/90 backdrop-blur-md text-destructive-foreground border-0 px-4 py-2 text-sm font-medium">
                      Hết phòng
                    </Badge>
                  ) : null}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative h-24 rounded-xl overflow-hidden transition-all duration-300 ${
                        selectedImageIndex === idx
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
                    <span>{roomType?.totalRoomCount} phòng</span>
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
                <p className="text-4xl font-bold mb-6">{formatPrice(roomType?.basePriceNight)}</p>
                <Button
                  asChild
                  disabled={roomType?.availableRoomCount === 0}
                  className="w-full bg-white text-primary hover:bg-white/90 h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                >
                  {roomType?.availableRoomCount === 0 ? (
                    <span>Hết phòng</span>
                  ) : (
                    <Link
                      href={`/booking?roomId=${roomType?.roomTypeId}&roomType=${encodeURIComponent(
                        roomType?.typeName || "",
                      )}&price=${roomType?.basePriceNight}`}
                    >
                      Đặt phòng ngay
                    </Link>
                  )}
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

        {similarRooms.length > 0 && (
          <div className="mt-20 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <div className="mb-8">
              <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-2">Phòng tương tự</h2>
              <p className="text-muted-foreground text-lg">Khám phá thêm các lựa chọn phù hợp với bạn</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {similarRooms.map((similarRoom, idx) => {
                const roomImage =
                  similarRoom.images?.[0]?.filePath || "/hotel-building-exterior-modern-architecture.jpg"
                const hasAvailableRooms = (similarRoom.availableRoomCount ?? 0) > 0

                return (
                  <Link
                    key={similarRoom.roomTypeId}
                    href={`/rooms/${similarRoom.roomTypeId}`}
                    className="group animate-scale-in"
                    style={{ animationDelay: `${0.6 + idx * 0.1}s` }}
                  >
                    <div className="rounded-2xl overflow-hidden glass-effect border border-border/50 hover:border-accent/50 transition-all duration-500 hover:shadow-2xl">
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          src={roomImage || "/placeholder.svg"}
                          alt={similarRoom.typeName}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        {similarRoom.availableRoomCount !== null && similarRoom.availableRoomCount !== undefined && (
                          <div className="absolute top-4 right-4">
                            <Badge
                              className={`${hasAvailableRooms ? "bg-accent/90" : "bg-destructive/90"} backdrop-blur-md border-0 px-3 py-1.5 text-sm font-medium`}
                            >
                              {hasAvailableRooms ? `Còn ${similarRoom.availableRoomCount} phòng` : "Hết phòng"}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-6 space-y-4">
                        <h3 className="font-serif text-xl font-bold group-hover:text-accent transition-colors">
                          {similarRoom.typeName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span>{similarRoom.maxOccupancy}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Maximize className="w-4 h-4" />
                            <span>{similarRoom.roomSize}m²</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Bed className="w-4 h-4" />
                            <span>{similarRoom.numberOfBeds}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <span className="text-sm text-muted-foreground">Từ</span>
                          <p className="text-xl font-bold luxury-text-gradient">
                            {formatPrice(similarRoom.basePriceNight)}
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
