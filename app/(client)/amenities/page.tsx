"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { amenitiesApi, Amenity, GetAmenitiesParams } from "@/lib/api";
import { useAmenities } from "@/lib/hooks";
import { set } from "date-fns";

export default function AmenitiesPage() {
  const [searchParams, setSearchParams] = useState<GetAmenitiesParams>({
    amenityType: undefined,
    search: undefined,
  });
  const { data: amenitiesData, isLoading } = useAmenities(searchParams);

  const allAmenities =
    amenitiesData?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#ff5e7e]/10 via-[#a78bfa]/10 to-[#14b8a6]/10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-[#ff5e7e]" />
              <span className="text-sm font-medium text-gray-700">
                Tiện nghi đẳng cấp 5 sao
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] bg-clip-text text-transparent">
              Tiện nghi & Dịch vụ
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Trải nghiệm đầy đủ các tiện ích hiện đại và dịch vụ chăm sóc tận
              tâm, mang đến kỳ nghỉ hoàn hảo cho bạn
            </p>

            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm tiện nghi..."
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    className="pl-10 h-12"
                  />
                </div>
                <Tabs
                  value={searchParams.amenityType || "all"}
                  onValueChange={(v) => setSearchParams((prev) => ({
                    ...prev,
                    amenityType: v === "all" ? undefined : (v as "Common" | "Additional"),
                  }))}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="grid grid-cols-3 h-12">
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                    <TabsTrigger value="Common">Cơ bản</TabsTrigger>
                    <TabsTrigger value="Additional">Bổ sung</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#ff5e7e]"></div>
                <span className="text-gray-600">
                  <strong className="text-gray-900">{0}</strong> Tiện nghi cơ
                  bản
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#a78bfa]"></div>
                <span className="text-gray-600">
                  <strong className="text-gray-900">{0}</strong> Tiện nghi bổ
                  sung
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 shadow-sm animate-pulse"
                >
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : allAmenities.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không tìm thấy tiện nghi
              </h3>
              <p className="text-gray-600">
                Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allAmenities.map((amenity) => (
                <div
                  key={amenity.amenityId}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                    {amenity.images && amenity.images.length > 0 ? (
                      <Image
                        src={amenity.images[0] || "/placeholder.svg"}
                        alt={amenity.amenityName}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          amenity.amenityType === "Common"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {amenity.amenityType === "Common"
                          ? "Cơ bản"
                          : "Bổ sung"}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-xl mb-2 text-gray-900 group-hover:text-[#ff5e7e] transition-colors">
                      {amenity.amenityName}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                      {amenity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#ff5e7e] via-[#a78bfa] to-[#14b8a6] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-10"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Sẵn sàng trải nghiệm?
          </h2>
          <p className="text-xl mb-8 text-white/95 max-w-2xl mx-auto">
            Đặt phòng ngay hôm nay và tận hưởng tất cả các tiện nghi đẳng cấp
            của chúng tôi
          </p>
          <Link href="/rooms">
            <Button
              size="lg"
              className="bg-white text-[#ff5e7e] hover:bg-white/90 text-lg h-14 px-10 shadow-2xl font-semibold"
            >
              Đặt phòng ngay
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
