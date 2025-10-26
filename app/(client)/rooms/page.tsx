"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
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
} from "lucide-react";
import { BookingModal } from "@/components/booking-modal";

interface Room {
  roomId: number;
  roomNumber: string;
  roomType: "Single" | "Double" | "Suite" | "Deluxe";
  status: "Available" | "Occupied" | "Maintenance" | "Reserved";
  pricePerNight: number;
  capacity: number;
  area: number;
  amenities: string[];
  description: string;
  images: string[];
}

// Mockup data for client view
const mockRooms: Room[] = [
  {
    roomId: 1,
    roomNumber: "101",
    roomType: "Single",
    status: "Available",
    pricePerNight: 500000,
    capacity: 1,
    area: 20,
    amenities: ["Wifi", "TV", "Điều hòa"],
    description:
      "Phòng đơn tiện nghi, phù hợp cho khách đi công tác hoặc du lịch một mình",
    images: [],
  },
  {
    roomId: 3,
    roomNumber: "201",
    roomType: "Suite",
    status: "Available",
    pricePerNight: 1500000,
    capacity: 3,
    area: 50,
    amenities: ["Wifi", "TV", "Điều hòa", "Minibar", "Bồn tắm", "Ban công"],
    description:
      "Phòng suite cao cấp với phòng khách riêng, view thành phố tuyệt đẹp",
    images: [],
  },
  {
    roomId: 6,
    roomNumber: "302",
    roomType: "Double",
    status: "Available",
    pricePerNight: 850000,
    capacity: 2,
    area: 32,
    amenities: ["Wifi", "TV", "Điều hòa", "Minibar", "Két sắt"],
    description: "Phòng đôi rộng rãi với giường king size, phù hợp cho cặp đôi",
    images: [],
  },
  {
    roomId: 7,
    roomNumber: "401",
    roomType: "Suite",
    status: "Available",
    pricePerNight: 1800000,
    capacity: 3,
    area: 55,
    amenities: [
      "Wifi",
      "TV",
      "Điều hòa",
      "Minibar",
      "Bồn tắm",
      "Ban công",
      "Két sắt",
    ],
    description:
      "Phòng suite tầng cao với view toàn cảnh, không gian sang trọng",
    images: [],
  },
  {
    roomId: 8,
    roomNumber: "402",
    roomType: "Deluxe",
    status: "Available",
    pricePerNight: 2200000,
    capacity: 4,
    area: 65,
    amenities: [
      "Wifi",
      "TV",
      "Điều hòa",
      "Minibar",
      "Bồn tắm",
      "Ban công",
      "Bếp nhỏ",
      "Máy giặt",
    ],
    description:
      "Phòng deluxe cao cấp nhất với đầy đủ tiện nghi hiện đại, phù hợp cho gia đình",
    images: [],
  },
  {
    roomId: 9,
    roomNumber: "103",
    roomType: "Double",
    status: "Available",
    pricePerNight: 800000,
    capacity: 2,
    area: 30,
    amenities: ["Wifi", "TV", "Điều hòa", "Minibar"],
    description: "Phòng đôi tiêu chuẩn với 2 giường đơn, sạch sẽ và thoải mái",
    images: [],
  },
];

const amenityIcons: Record<string, any> = {
  Wifi: Wifi,
  TV: Tv,
  "Điều hòa": Wind,
  Minibar: Coffee,
  "Bồn tắm": Bath,
  "Ban công": Home,
};

export default function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all");
  const [capacityFilter, setCapacityFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([0, 3000000]);
  const [sortBy, setSortBy] = useState<string>("price-asc");
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Filter available rooms only
  const availableRooms = mockRooms.filter(
    (room) => room.status === "Available"
  );

  // Apply filters
  const filteredRooms = availableRooms
    .filter((room) => {
      const matchesSearch =
        room.roomType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        roomTypeFilter === "all" || room.roomType === roomTypeFilter;
      const matchesCapacity =
        capacityFilter === "all" ||
        room.capacity >= Number.parseInt(capacityFilter);
      const matchesPrice =
        room.pricePerNight >= priceRange[0] &&
        room.pricePerNight <= priceRange[1];

      return matchesSearch && matchesType && matchesCapacity && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.pricePerNight - b.pricePerNight;
        case "price-desc":
          return b.pricePerNight - a.pricePerNight;
        case "capacity-asc":
          return a.capacity - b.capacity;
        case "capacity-desc":
          return b.capacity - a.capacity;
        default:
          return 0;
      }
    });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getRoomTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Single: "Phòng Đơn",
      Double: "Phòng Đôi",
      Suite: "Phòng Suite",
      Deluxe: "Phòng Deluxe",
    };
    return labels[type] || type;
  };

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <section className="pt-20 pb-6 bg-gradient-to-br from-[#ff5e7e]/5 via-[#a78bfa]/5 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] bg-clip-text text-transparent">
              Khám phá phòng nghỉ
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tìm phòng hoàn hảo với đầy đủ tiện nghi hiện đại
            </p>
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-1">
              <Card className="sticky top-20 border shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold mb-3">Bộ lọc</h3>

                  {/* Search */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Tìm kiếm
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <Input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-9 text-sm"
                      />
                    </div>
                  </div>

                  {/* Room Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Loại phòng
                    </label>
                    <Select
                      value={roomTypeFilter}
                      onValueChange={setRoomTypeFilter}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Tất cả" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="Single">Phòng Đơn</SelectItem>
                        <SelectItem value="Double">Phòng Đôi</SelectItem>
                        <SelectItem value="Suite">Phòng Suite</SelectItem>
                        <SelectItem value="Deluxe">Phòng Deluxe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Capacity */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Số người
                    </label>
                    <Select
                      value={capacityFilter}
                      onValueChange={setCapacityFilter}
                    >
                      <SelectTrigger className="h-9 text-sm">
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
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Khoảng giá
                    </label>
                    <Slider
                      min={0}
                      max={3000000}
                      step={100000}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="py-3"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Sắp xếp
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price-asc">Giá tăng dần</SelectItem>
                        <SelectItem value="price-desc">Giá giảm dần</SelectItem>
                        <SelectItem value="capacity-asc">
                          Sức chứa tăng
                        </SelectItem>
                        <SelectItem value="capacity-desc">
                          Sức chứa giảm
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setRoomTypeFilter("all");
                      setCapacityFilter("all");
                      setPriceRange([0, 3000000]);
                      setSortBy("price-asc");
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    Xóa bộ lọc
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {filteredRooms.length}
                  </span>{" "}
                  phòng có sẵn
                </p>
              </div>

              {filteredRooms.length > 0 ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredRooms.map((room) => (
                    <Card
                      key={room.roomId}
                      className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                    >
                      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                        <Image
                          src="/hotel-building-exterior-modern-architecture.jpg"
                          alt={getRoomTypeLabel(room.roomType)}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-sm text-slate-900 shadow-sm">
                            {getRoomTypeLabel(room.roomType)}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-sm">
                            Còn trống
                          </span>
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-serif text-lg font-bold mb-1 line-clamp-1">
                            {getRoomTypeLabel(room.roomType)}
                          </h3>
                          <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                            {room.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{room.capacity} người</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Maximize className="w-3.5 h-3.5" />
                            <span>{room.area}m²</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {room.amenities.slice(0, 3).map((amenity) => {
                            const Icon = amenityIcons[amenity] || Check;
                            return (
                              <div
                                key={amenity}
                                className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 rounded text-xs text-slate-600"
                              >
                                <Icon className="w-3 h-3" />
                                <span>{amenity}</span>
                              </div>
                            );
                          })}
                          {room.amenities.length > 3 && (
                            <div className="flex items-center px-2 py-0.5 bg-slate-50 rounded text-xs text-slate-600">
                              +{room.amenities.length - 3}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Mỗi đêm
                            </p>
                            <p className="text-lg font-bold bg-gradient-to-r from-[#ff5e7e] to-[#ff4569] bg-clip-text text-transparent">
                              {formatPrice(room.pricePerNight)}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleBookRoom(room)}
                            size="sm"
                            className="bg-gradient-to-r from-[#ff5e7e] to-[#ff4569] hover:from-[#ff4569] hover:to-[#ff2d54] text-white shadow-md hover:shadow-lg transition-all"
                          >
                            Đặt ngay
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-lg">
                      Không tìm thấy phòng phù hợp
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      Thử điều chỉnh bộ lọc để xem thêm phòng
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {selectedRoom && (
        <BookingModal
          open={bookingModalOpen}
          onOpenChange={setBookingModalOpen}
          room={{
            roomId: selectedRoom.roomId,
            roomType: getRoomTypeLabel(selectedRoom.roomType),
            pricePerNight: selectedRoom.pricePerNight,
          }}
        />
      )}
    </div>
  );
}
