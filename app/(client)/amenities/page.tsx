"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Sparkles, Wifi, UtensilsCrossed, Dumbbell, Waves, Shield, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { GetAmenitiesParams } from "@/lib/api"
import { useAmenities } from "@/lib/hooks/use-amenities"

export default function AmenitiesPage() {
  const [searchParams, setSearchParams] = useState<GetAmenitiesParams>({
    AmenityType: undefined,
    Search: undefined,
  })
  const { data: amenitiesData, isLoading } = useAmenities(searchParams)

  const allAmenities = amenitiesData?.pages.flatMap((page) => page.items) || []

  const commonCount = allAmenities.filter((a) => a.amenityType === "Common").length
  const additionalCount = allAmenities.filter((a) => a.amenityType === "Additional").length

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 luxury-gradient">
        <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-effect rounded-full shadow-lg mb-6 animate-scale-in">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Tiện nghi đẳng cấp 5 sao</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 luxury-text-gradient leading-tight py-2">
              Tiện nghi & Dịch vụ
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-loose">
              Trải nghiệm đầy đủ các tiện ích hiện đại và dịch vụ chăm sóc tận tâm, mang đến kỳ nghỉ hoàn hảo cho bạn
            </p>

            {/* Search and Filter */}
            <div className="glass-effect rounded-2xl shadow-2xl p-6 max-w-2xl mx-auto border border-white/20">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm tiện nghi..."
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        Search: e.target.value,
                      }))
                    }
                    className="pl-10 h-12 bg-background/50 border-primary/20 focus:border-accent"
                  />
                </div>
                <Tabs
                  value={searchParams.AmenityType || "all"}
                  onValueChange={(v) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      AmenityType: v === "all" ? undefined : (v as "Common" | "Additional"),
                    }))
                  }
                  className="w-full sm:w-auto"
                >
                  <TabsList className="grid grid-cols-3 h-12 bg-background/50">
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                    <TabsTrigger value="Common">Cơ bản</TabsTrigger>
                    <TabsTrigger value="Additional">Bổ sung</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm">
              <div className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{commonCount}</strong> Tiện nghi cơ bản
                </span>
              </div>
              <div className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{additionalCount}</strong> Tiện nghi bổ sung
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Amenities Icons */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: Wifi, label: "WiFi miễn phí", color: "text-primary" },
              { icon: UtensilsCrossed, label: "Nhà hàng", color: "text-accent" },
              { icon: Dumbbell, label: "Phòng gym", color: "text-primary" },
              { icon: Waves, label: "Hồ bơi", color: "text-accent" },
              { icon: Shield, label: "An ninh 24/7", color: "text-primary" },
              { icon: Clock, label: "Lễ tân 24/7", color: "text-accent" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-3 p-6 glass-effect rounded-xl hover:shadow-lg transition-all duration-300 animate-scale-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`w-12 h-12 rounded-full bg-background flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-center leading-snug">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-effect rounded-xl p-6 shadow-sm animate-pulse">
                  <div className="w-full h-48 bg-secondary rounded-lg mb-4"></div>
                  <div className="h-6 bg-secondary rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-secondary rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : allAmenities.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Không tìm thấy tiện nghi</h3>
              <p className="text-muted-foreground leading-relaxed">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allAmenities.map((amenity, index) => (
                <div
                  key={amenity.amenityId}
                  className="group glass-effect rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 animate-fade-in-up border border-primary/10"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-secondary to-secondary/50">
                    {amenity.images && amenity.images.length > 0 ? (
                      <Image
                        src={amenity.images[0] || "/placeholder.svg"}
                        alt={amenity.amenityName}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${amenity.amenityType === "Common"
                          ? "bg-primary/90 text-primary-foreground"
                          : "bg-accent/90 text-accent-foreground"
                          }`}
                      >
                        {amenity.amenityType === "Common" ? "Cơ bản" : "Bổ sung"}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-xl mb-2 text-foreground group-hover:text-accent transition-colors leading-snug">
                      {amenity.amenityName}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-loose line-clamp-2">{amenity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 luxury-gradient text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-10"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight animate-fade-in-up">
            Sẵn sàng trải nghiệm?
          </h2>
          <p
            className="text-xl mb-8 text-primary-foreground/95 max-w-2xl mx-auto leading-loose animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Đặt phòng ngay hôm nay và tận hưởng tất cả các tiện nghi đẳng cấp của chúng tôi
          </p>
          <Link href="/rooms">
            <Button
              size="lg"
              className="bg-background text-primary hover:bg-background/90 text-lg h-14 px-10 shadow-2xl font-semibold animate-scale-in"
              style={{ animationDelay: "0.2s" }}
            >
              Đặt phòng ngay
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
