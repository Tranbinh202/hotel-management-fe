"use client"

import { useState, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  const { data: allRoomTypes } = useRooms({
    // PageSize: 20,
  })

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const similarRooms =
    allRoomTypes?.pages[0].items
      .filter(
        (r) => r.roomTypeId !== roomType?.roomTypeId && r.isActive,
        //  &&  (r.typeCode === roomType?.typeCode
        //     // || Math.abs(r.basePriceNight - roomType?.basePriceNight) < 500000
        // )
      )
      .slice(0, 3) || []

  const images =
    roomType?.images.length > 0
      ? roomType?.images.map((img) => img.filePath)
      : ["/hotel-building-exterior-modern-architecture.jpg"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-[#ff5e7e] transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/rooms" className="hover:text-[#ff5e7e] transition-colors">
              Phòng
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{roomType?.typeName}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#ff5e7e] transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại danh sách phòng
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="relative h-[400px] bg-gradient-to-br from-slate-100 to-slate-200">
                <Image
                  src={images[selectedImageIndex] || "/placeholder.svg"}
                  alt={roomType?.typeName}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-white/95 backdrop-blur-sm text-slate-900 hover:bg-white">
                    {roomType?.typeCode}
                  </Badge>
                  {roomType?.availableRoomCount !== null && roomType?.availableRoomCount > 0 ? (
                    <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
                      Còn {roomType?.availableRoomCount} phòng
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500 text-white hover:bg-red-600">Hết phòng</Badge>
                  )}
                </div>
              </div>
              {images.length > 1 && (
                <div className="p-4 grid grid-cols-5 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx ? "border-[#ff5e7e]" : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={roomType?.images[idx]?.description || `View ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Room Details */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h1 className="font-serif text-3xl font-bold mb-2">{roomType?.typeName}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Mã: {roomType?.typeCode}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span>{roomType?.totalRoomCount} phòng</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>4.8 (124 đánh giá)</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Specifications */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Thông số phòng</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-[#ff5e7e]/10 to-[#ff5e7e]/5 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#ff5e7e]" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sức chứa</p>
                        <p className="font-semibold">{roomType?.maxOccupancy} người</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-[#a78bfa]/10 to-[#a78bfa]/5 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                        <Maximize className="w-5 h-5 text-[#a78bfa]" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Diện tích</p>
                        <p className="font-semibold">{roomType?.roomSize}m²</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                        <Bed className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Số giường</p>
                        <p className="font-semibold">{roomType?.numberOfBeds} giường</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                        <Bed className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Loại giường</p>
                        <p className="font-semibold">{roomType?.bedType}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Mô tả</h3>
                  <p className="text-muted-foreground leading-relaxed">{roomType?.description}</p>
                </div>

                <Separator />

                {/* Amenities */}
                {/* {roomType?.amenities.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Tiện nghi</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {roomType?.amenities.map((amenity) => {
                        const Icon = amenityIcons[amenity.amenityName] || Check;
                        return (
                          <div
                            key={amenity.amenityId}
                            className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"
                          >
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                              <Icon className="w-4 h-4 text-[#ff5e7e]" />
                            </div>
                            <span className="text-sm font-medium">
                              {amenity.amenityName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )} */}
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Đánh giá từ khách hàng</h3>
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
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">{review.name}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Giá mỗi đêm</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-[#ff5e7e] to-[#ff4569] bg-clip-text text-transparent">
                    {formatPrice(roomType?.basePriceNight || 0)}
                  </p>
                </div>

                <Button
                  asChild
                  disabled={roomType?.availableRoomCount === 0}
                  className="w-full bg-gradient-to-r from-[#ff5e7e] to-[#ff4569] hover:from-[#ff4569] hover:to-[#ff2d54] text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {roomType?.availableRoomCount === 0 ? (
                    <span>Hết phòng</span>
                  ) : (
                    <Link
                      href={`/booking?roomId=${roomType?.roomTypeId}&roomType=${encodeURIComponent(roomType?.typeName || "")}&price=${roomType?.basePriceNight}`}
                    >
                      Đặt phòng ngay
                    </Link>
                  )}
                </Button>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">Chính sách</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Miễn phí hủy phòng trước 24h</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Nhận phòng: 14:00 - 23:00</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Trả phòng: Trước 12:00</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Bao gồm bữa sáng buffet</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Liên hệ hỗ trợ</h4>
                  <p className="text-sm text-muted-foreground">Hotline: 1900 xxxx</p>
                  <p className="text-sm text-muted-foreground">Email: support@stayhub.com</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Rooms */}
        {similarRooms.length > 0 && (
          <div className="mt-12">
            <h2 className="font-serif text-2xl font-bold mb-6">Phòng tương tự</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {similarRooms.map((similarRoom) => (
                <Link key={similarRoom.roomTypeId} href={`/rooms/${similarRoom.roomTypeId}`}>
                  <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                      <Image
                        src={
                          similarRoom.images[0]?.filePath ||
                          "/hotel-building-exterior-modern-architecture.jpg" ||
                          "/placeholder.svg"
                        }
                        alt={similarRoom.typeName}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-serif text-lg font-bold mb-2">{similarRoom.typeName}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{similarRoom.maxOccupancy}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Maximize className="w-3.5 h-3.5" />
                            <span>{similarRoom.roomSize}m²</span>
                          </div>
                        </div>
                        <p className="font-bold text-[#ff5e7e]">{formatPrice(similarRoom.basePriceNight)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
