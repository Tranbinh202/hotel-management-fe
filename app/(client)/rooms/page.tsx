"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Users, Maximize, Wifi, Tv, Wind, Coffee, Bath, Home, Search, Sparkles, Star, Loader2 } from "lucide-react"
import { useRooms } from "@/lib/hooks/use-rooms"
import { useRoomTypes } from "@/lib/hooks/use-room-type"

const amenityIcons: Record<string, any> = {
  Wifi: Wifi,
  TV: Tv,
  "Điều hòa": Wind,
  Minibar: Coffee,
  "Bồn tắm": Bath,
  "Ban công": Home,
}

export default function RoomsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all")
  const [capacityFilter, setCapacityFilter] = useState<string>("all")
  const [priceRange, setPriceRange] = useState([0, 3000000])
  const [sortBy, setSortBy] = useState<string>("price-asc")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: roomTypesData } = useRoomTypes({ PageSize: 50 })
  const roomTypes = roomTypesData?.pages.flatMap((page) => page.items) ?? []

  const {
    data: roomsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useRooms({
    Search: debouncedSearchTerm,
    MinPrice: priceRange[0],
    MaxPrice: priceRange[1],
    NumberOfGuests: capacityFilter !== "all" ? Number(capacityFilter) : undefined,
    PageSize: 12,
  })

  const allRooms = roomsData?.pages.flatMap((page) => page.items) || []
  const totalRooms = roomsData?.pages[0]?.totalCount || 0

  const filteredRooms =
    roomTypeFilter === "all" ? allRooms : allRooms.filter((room) => room.roomTypeId === Number(roomTypeFilter))

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.roomType.basePriceNight - b.roomType.basePriceNight
      case "price-desc":
        return b.roomType.basePriceNight - a.roomType.basePriceNight
      case "capacity-asc":
        return a.roomType.maxOccupancy - b.roomType.maxOccupancy
      case "capacity-desc":
        return b.roomType.maxOccupancy - a.roomType.maxOccupancy
      default:
        return 0
    }
  })

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <section className="pt-32 pb-12 luxury-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-effect rounded-full shadow-lg mb-6 animate-scale-in">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-primary-foreground">Phòng nghỉ cao cấp</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-primary-foreground leading-tight py-2">
              Khám phá phòng nghỉ
            </h1>
            <p className="text-xl text-primary-foreground/90 leading-loose">
              Tìm phòng hoàn hảo với đầy đủ tiện nghi hiện đại và dịch vụ đẳng cấp 5 sao
            </p>
          </div>
        </div>
      </section>

      {/* Filter + Room list */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-6">
            {/* FILTERS */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20 border-primary/20 shadow-lg glass-effect">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-accent rounded-full"></div>
                    <h3 className="font-semibold text-lg">Bộ lọc</h3>
                  </div>

                  {/* Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tìm kiếm</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Số phòng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 bg-background/50 border-primary/20 focus:border-accent"
                      />
                    </div>
                  </div>

                  {/* Room Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Loại phòng</label>
                    <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                      <SelectTrigger className="h-10 bg-background/50 border-primary/20">
                        <SelectValue placeholder="Tất cả" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {roomTypes.map((rt) => (
                          <SelectItem key={rt.roomTypeId} value={String(rt.roomTypeId)}>
                            {rt.typeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Capacity */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Số người</label>
                    <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                      <SelectTrigger className="h-10 bg-background/50 border-primary/20">
                        <SelectValue placeholder="Tất cả" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="1">1 người</SelectItem>
                        <SelectItem value="2">2 người</SelectItem>
                        <SelectItem value="3">3 người</SelectItem>
                        <SelectItem value="4">4+ người</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Khoảng giá</label>
                    <Slider
                      min={0}
                      max={3000000}
                      step={100000}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="py-4"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium">{formatPrice(priceRange[0])}</span>
                      <span className="font-medium">{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Sắp xếp</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-10 bg-background/50 border-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price-asc">Giá tăng dần</SelectItem>
                        <SelectItem value="price-desc">Giá giảm dần</SelectItem>
                        <SelectItem value="capacity-asc">Sức chứa tăng</SelectItem>
                        <SelectItem value="capacity-desc">Sức chứa giảm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reset */}
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setRoomTypeFilter("all")
                      setCapacityFilter("all")
                      setPriceRange([0, 3000000])
                      setSortBy("price-asc")
                    }}
                    variant="outline"
                    className="w-full border-primary/20 hover:bg-accent hover:text-accent-foreground"
                  >
                    Xóa bộ lọc
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* ROOM LIST */}
            <div className="lg:col-span-4">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tìm thấy <span className="font-bold text-foreground text-lg">{filteredRooms.length}</span> phòng có
                  sẵn
                </p>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-sm font-medium">Đẳng cấp 5 sao</span>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-12 h-12 animate-spin text-accent" />
                </div>
              ) : sortedRooms.length > 0 ? (
                <>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedRooms.map((room, index) => {
                      const firstImage = room.roomType.images?.[0]?.filePath
                      return (
                        <Card
                          key={room.roomId}
                          className="border-primary/10 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer glass-effect animate-fade-in-up"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <Link href={`/rooms/${room.roomTypeId}`}>
                            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-secondary to-secondary/50">
                              <Image
                                src={firstImage || "/hotel-building-exterior-modern-architecture.jpg"}
                                alt={room.roomType.typeName}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold glass-effect text-foreground shadow-lg backdrop-blur-md border border-white/20">
                                  {room.roomNumber}
                                </span>
                                <span
                                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
                                    room.roomStatus === "Available"
                                      ? "bg-green-500 text-white"
                                      : "bg-gray-500 text-white"
                                  }`}
                                >
                                  {room.roomStatus === "Available" ? "Còn trống" : "Đã đặt"}
                                </span>
                              </div>
                            </div>

                            <CardContent className="p-5 space-y-4">
                              <div>
                                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-semibold mb-2 border border-accent/20">
                                  <Home className="w-3 h-3" />
                                  {room.roomType.typeName}
                                </div>
                                <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                                  Phòng {room.roomNumber}
                                </h3>
                                <p className="text-muted-foreground text-sm line-clamp-2 leading-loose">
                                  {room.roomType.description}
                                </p>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Users className="w-4 h-4 text-primary" />
                                  <span>{room.roomType.maxOccupancy} người</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Maximize className="w-4 h-4 text-accent" />
                                  <span>{room.roomType.roomSize}m²</span>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-primary/10 flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Mỗi đêm từ</p>
                                  <p className="text-xl font-bold luxury-text-gradient">
                                    {formatPrice(room.roomType.basePriceNight)}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  className="luxury-gradient text-primary-foreground hover:opacity-90 shadow-lg hover:shadow-xl transition-all h-10 px-6"
                                  disabled={room.roomStatus !== "Available"}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    router.push(
                                      `/booking?roomId=${room.roomTypeId}` +
                                        `&roomType=${encodeURIComponent(room.roomType.typeName)}` +
                                        `&price=${room.roomType.basePriceNight}`,
                                    )
                                  }}
                                >
                                  {room.roomStatus === "Available" ? "Đặt ngay" : "Đã đặt"}
                                </Button>
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      )
                    })}
                  </div>

                  {hasNextPage && (
                    <div className="mt-8 flex justify-center">
                      <Button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        variant="outline"
                        size="lg"
                        className="border-primary/20 hover:bg-accent hover:text-accent-foreground"
                      >
                        {isFetchingNextPage ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang tải...
                          </>
                        ) : (
                          "Xem thêm phòng"
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Card className="border-primary/10 shadow-lg glass-effect">
                  <CardContent className="p-16 text-center">
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Không tìm thấy phòng phù hợp</h3>
                    <p className="text-muted-foreground leading-relaxed">Thử điều chỉnh bộ lọc để xem thêm phòng</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
