"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Users, Search, Sparkles, Star, Loader2, Home, Bed } from "lucide-react"
import { useRooms } from "@/lib/hooks/use-rooms"
import type { RoomSearchItem } from "@/lib/types/api"

interface RoomTypeGroup {
  roomTypeId: number
  roomTypeName: string
  roomTypeCode: string
  basePriceNight: number
  maxOccupancy: number
  description: string
  images: string[]
  rooms: RoomSearchItem[]
  totalRooms: number
}

export default function RoomsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [capacityFilter, setCapacityFilter] = useState<string>("all")
  const [priceRange, setPriceRange] = useState([0, 5000000])
  const [sortBy, setSortBy] = useState<string>("price-asc")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: roomsData, isLoading } = useRooms(
    {
      roomName: debouncedSearchTerm || undefined,
      // Removed status filter to show all rooms
      pageNumber: 1,
      pageSize: 50,
    },
    true,
  )

  const roomTypeGroups = useMemo(() => {
    if (!roomsData?.rooms) return []

    const groups = new Map<number, RoomTypeGroup>()

    roomsData.rooms.forEach((room) => {
      if (priceRange[0] > 0 && room.basePriceNight < priceRange[0]) return
      if (priceRange[1] < 5000000 && room.basePriceNight > priceRange[1]) return
      if (capacityFilter !== "all" && room.maxOccupancy < Number(capacityFilter)) return

      if (!groups.has(room.roomTypeId)) {
        groups.set(room.roomTypeId, {
          roomTypeId: room.roomTypeId,
          roomTypeName: room.roomTypeName,
          roomTypeCode: room.roomTypeCode,
          basePriceNight: room.basePriceNight,
          maxOccupancy: room.maxOccupancy,
          description: "Phòng cao cấp với đầy đủ tiện nghi hiện đại",
          images: room.images || [],
          rooms: [], // Updated: Use 'rooms' instead of 'availableRooms'
          totalRooms: 0,
        })
      }

      const group = groups.get(room.roomTypeId)!
      group.rooms.push(room) // Updated: Push all rooms to 'rooms' array
      group.totalRooms++
    })

    return Array.from(groups.values())
  }, [roomsData, priceRange, capacityFilter])

  const sortedRoomTypes = [...roomTypeGroups].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.basePriceNight - b.basePriceNight
      case "price-desc":
        return b.basePriceNight - a.basePriceNight
      case "capacity-asc":
        return a.maxOccupancy - b.maxOccupancy
      case "capacity-desc":
        return b.maxOccupancy - a.maxOccupancy
      default:
        return 0
    }
  })

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)

  const handleBookNow = (room: RoomSearchItem) => {
    sessionStorage.setItem(
      "bookingData",
      JSON.stringify({
        roomId: room.roomTypeId,
        roomType: room.roomTypeName,
        price: room.basePriceNight,
        roomName: room.roomName
      }),
    )
    router.push("/booking")
  }

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
                        placeholder="Loại phòng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 bg-background/50 border-primary/20 focus:border-accent"
                      />
                    </div>
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
                      max={5000000}
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
                      setCapacityFilter("all")
                      setPriceRange([0, 5000000])
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
                  Tìm thấy <span className="font-bold text-foreground text-lg">{sortedRoomTypes.length}</span> loại
                  phòng
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
              ) : roomTypeGroups.length > 0 ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {roomTypeGroups.map((group, index) => {
                    const firstImage = group.images?.[0]
                    const availableCount = group.rooms.filter((r) => r.statusCode === "Available").length
                    const isAvailable = availableCount > 0

                    return (
                      <Card
                        key={group.roomTypeId}
                        className="border-primary/10 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group glass-effect animate-fade-in-up flex flex-col"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {/* Image Area */}
                        <Link href={`/rooms/${group.roomTypeId}`} className="block">
                          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-secondary to-secondary/50 shrink-0">
                            <Image
                              src={firstImage || "/luxury-hotel-lobby-modern.png"}
                              alt={group.roomTypeName}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          </div>
                        </Link>

                        <CardContent className="p-5 space-y-4 flex-grow flex flex-col">
                          <div>
                            <div className="inline-flex items-center gap-2 px-2 py-1.5 rounded-md bg-accent/10 text-accent text-xs font-semibold mb-2 border border-accent/20">
                              <Home className="w-3 h-3" />
                              {group.roomTypeCode}
                            </div>
                            <Link href={`/rooms/${group.roomTypeId}`}>
                              <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                                {group.roomTypeName}
                              </h3>
                            </Link>
                            <p className="text-muted-foreground text-sm line-clamp-2 leading-loose">
                              {group.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-primary" />
                              <span>{group.maxOccupancy} người</span>
                            </div>
                            {/* Bed info removed because it is not available in RoomSearchItem */}
                          </div>

                          {/* Room List Section */}
                          <div className="border-t border-primary/10 pt-4 flex-grow">
                            <p className="text-xs font-medium text-muted-foreground mb-3">Danh sách phòng:</p>
                            <div className="grid grid-cols-4 gap-2">
                              {group.rooms.sort((a, b) => a.roomName.localeCompare(b.roomName)).map((room) => (
                                <button
                                  key={room.roomId}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (room.statusCode === "Available") {
                                      handleBookNow(room);
                                    }
                                  }}
                                  disabled={room.statusCode !== "Available"}
                                  title={`Phòng ${room.roomName} - ${room.status}`}
                                  className={`
                                      text-xs py-1.5 rounded-md border font-medium transition-all
                                      ${room.statusCode === "Available"
                                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300 cursor-pointer"
                                      : "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-70"}
                                    `}
                                >
                                  {room.roomName}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-primary/10 flex items-center justify-between gap-3 mt-auto">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Mỗi đêm từ</p>
                              <p className="text-xl font-bold luxury-text-gradient">
                                {formatPrice(group.basePriceNight)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
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
