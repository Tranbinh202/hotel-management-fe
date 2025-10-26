import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff5e7e]/90 via-[#a78bfa]/80 to-[#14b8a6]/90 z-10"></div>
        <img
          src="/luxury-hotel-lobby-modern.png"
          alt="Hotel Lobby"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center text-white px-6 max-w-5xl mx-auto">
          <div className="inline-block mb-4 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium">
            ✨ Ưu đãi đặc biệt: Giảm 30% cho đặt phòng đầu tiên
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Trải nghiệm nghỉ dưỡng
            <br />
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              đẳng cấp 5 sao
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-white/95 leading-relaxed max-w-3xl mx-auto">
            Khám phá không gian sang trọng, dịch vụ hoàn hảo và những khoảnh
            khắc đáng nhớ tại StayHub - Nơi mọi kỳ nghỉ trở thành trải nghiệm
            tuyệt vời
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rooms">
              <Button
                size="lg"
                className="bg-white text-[#ff5e7e] hover:bg-white/90 text-lg h-14 px-10 shadow-2xl font-semibold"
              >
                Đặt phòng ngay
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-2 border-white hover:bg-white/20 text-lg h-14 px-10 bg-transparent backdrop-blur-sm font-semibold"
            >
              Xem video giới thiệu
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>4.9/5 từ 2,500+ đánh giá</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Miễn phí hủy phòng</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Check-in 24/7</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Phòng nghỉ cao cấp
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Mỗi phòng được thiết kế tinh tế, mang đến sự thoải mái tối đa cho
              kỳ nghỉ của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Deluxe Room",
                price: "2.500.000",
                image: "modern hotel deluxe room with city view",
                features: ["35m²", "2 người", "View thành phố"],
              },
              {
                name: "Suite Room",
                price: "4.200.000",
                image: "luxury hotel suite with living area",
                features: ["55m²", "3 người", "Phòng khách riêng"],
              },
              {
                name: "Presidential Suite",
                price: "8.500.000",
                image: "presidential hotel suite with panoramic view",
                features: ["120m²", "4 người", "View toàn cảnh"],
              },
            ].map((room, index) => (
              <div
                key={index}
                className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={`/hotel-building-exterior-modern-architecture.jpg`}
                    alt={room.name}
                    width={600}
                    height={400}
                    priority
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-primary font-semibold">
                      {room.price}đ/đêm
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-2xl font-semibold mb-3">
                    {room.name}
                  </h3>
                  <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
                    {room.features.map((feature, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </span>
                    ))}
                  </div>
                  <Link href="/rooms">
                    <Button className="w-full bg-primary hover:bg-primary-hover">
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="py-24 bg-muted">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Tiện nghi đẳng cấp
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Trải nghiệm đầy đủ các tiện ích hiện đại và dịch vụ chăm sóc tận
              tâm
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🏊",
                title: "Hồ bơi vô cực",
                desc: "Hồ bơi ngoài trời với view tuyệt đẹp",
              },
              {
                icon: "🍽️",
                title: "Nhà hàng 5 sao",
                desc: "Ẩm thực đa quốc gia cao cấp",
              },
              {
                icon: "💆",
                title: "Spa & Massage",
                desc: "Dịch vụ chăm sóc sức khỏe chuyên nghiệp",
              },
              {
                icon: "🏋️",
                title: "Phòng gym",
                desc: "Trang thiết bị hiện đại 24/7",
              },
              {
                icon: "🅿️",
                title: "Bãi đỗ xe",
                desc: "Miễn phí cho khách lưu trú",
              },
              {
                icon: "📶",
                title: "WiFi tốc độ cao",
                desc: "Kết nối internet miễn phí",
              },
              {
                icon: "🛎️",
                title: "Lễ tân 24/7",
                desc: "Hỗ trợ khách hàng mọi lúc",
              },
              {
                icon: "🚗",
                title: "Đưa đón sân bay",
                desc: "Dịch vụ xe riêng theo yêu cầu",
              },
            ].map((amenity, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-5xl mb-4">{amenity.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{amenity.title}</h3>
                <p className="text-sm text-muted-foreground">{amenity.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/amenities">
              <Button
                size="lg"
                variant="outline"
                className="text-[#ff5e7e] border-[#ff5e7e] hover:bg-[#ff5e7e] hover:text-white bg-transparent"
              >
                Xem tất cả tiện nghi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section
        id="offers"
        className="py-24 bg-gradient-to-br from-[#ff5e7e]/5 to-[#a78bfa]/5"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] bg-clip-text text-transparent">
              Ưu đãi đặc biệt
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Những chương trình khuyến mãi hấp dẫn dành riêng cho bạn
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Ưu đãi đặt sớm",
                discount: "30%",
                description:
                  "Đặt trước 30 ngày và nhận ngay ưu đãi lên đến 30%",
                color: "from-[#ff5e7e] to-[#ff4569]",
                icon: "🎯",
              },
              {
                title: "Nghỉ dài giá ưu đãi",
                discount: "25%",
                description:
                  "Lưu trú từ 5 đêm trở lên, giảm ngay 25% tổng hóa đơn",
                color: "from-[#14b8a6] to-[#0d9488]",
                icon: "📅",
              },
              {
                title: "Combo gia đình",
                discount: "20%",
                description: "Đặt 2 phòng trở lên, tặng buffet sáng miễn phí",
                color: "from-[#a78bfa] to-[#8b5cf6]",
                icon: "👨‍👩‍👧‍👦",
              },
            ].map((offer, index) => (
              <div
                key={index}
                className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all group overflow-hidden"
              >
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${offer.color} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}
                ></div>
                <div className="relative">
                  <div className="text-5xl mb-4">{offer.icon}</div>
                  <div
                    className={`inline-block px-4 py-2 bg-gradient-to-r ${offer.color} text-white rounded-full font-bold text-2xl mb-4`}
                  >
                    -{offer.discount}
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-3">
                    {offer.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {offer.description}
                  </p>
                  <Button
                    className={`w-full bg-gradient-to-r ${offer.color} hover:opacity-90 text-white`}
                  >
                    Đặt ngay
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Khách hàng nói gì về chúng tôi
            </h2>
            <p className="text-muted-foreground text-lg">
              Hơn 10,000 khách hàng hài lòng
            </p>
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
                comment:
                  "Dịch vụ chuyên nghiệp, tiện nghi hiện đại. Rất phù hợp cho các chuyến công tác.",
              },
              {
                name: "Lê Thị Hương",
                role: "Gia đình",
                rating: 5,
                comment:
                  "Kỳ nghỉ gia đình tuyệt vời. Các bé rất thích hồ bơi và khu vui chơi. Highly recommended!",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-card rounded-xl p-8 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-primary fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {testimonial.comment}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking CTA Section */}
      <section
        id="booking"
        className="py-24 bg-gradient-to-br from-[#ff5e7e] via-[#a78bfa] to-[#14b8a6] text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-10"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Đặt phòng ngay hôm nay
          </h2>
          <p className="text-xl mb-12 text-white/95 max-w-2xl mx-auto">
            Nhận ưu đãi đặc biệt khi đặt phòng trực tiếp. Giảm giá lên đến 30%
            cho khách hàng mới!
          </p>
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-8 max-w-5xl mx-auto shadow-2xl border border-white/20">
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="text-left">
                <label className="block text-sm mb-2 text-white/90 font-medium">
                  Ngày nhận phòng
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl bg-white/25 border border-white/30 text-white placeholder-white/60 backdrop-blur-sm focus:bg-white/35 focus:border-white/50 transition-all"
                />
              </div>
              <div className="text-left">
                <label className="block text-sm mb-2 text-white/90 font-medium">
                  Ngày trả phòng
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl bg-white/25 border border-white/30 text-white placeholder-white/60 backdrop-blur-sm focus:bg-white/35 focus:border-white/50 transition-all"
                />
              </div>
              <div className="text-left">
                <label className="block text-sm mb-2 text-white/90 font-medium">
                  Số khách
                </label>
                <select className="w-full px-4 py-3 rounded-xl bg-white/25 border border-white/30 text-white backdrop-blur-sm focus:bg-white/35 focus:border-white/50 transition-all">
                  <option className="text-gray-900">1 người</option>
                  <option className="text-gray-900">2 người</option>
                  <option className="text-gray-900">3 người</option>
                  <option className="text-gray-900">4+ người</option>
                </select>
              </div>
              <div className="text-left">
                <label className="block text-sm mb-2 text-white/90 font-medium">
                  Loại phòng
                </label>
                <select className="w-full px-4 py-3 rounded-xl bg-white/25 border border-white/30 text-white backdrop-blur-sm focus:bg-white/35 focus:border-white/50 transition-all">
                  <option className="text-gray-900">Deluxe</option>
                  <option className="text-gray-900">Suite</option>
                  <option className="text-gray-900">Presidential</option>
                </select>
              </div>
            </div>
            <Link href="/rooms">
              <Button
                size="lg"
                className="w-full md:w-auto bg-white text-[#ff5e7e] hover:bg-white/90 text-lg h-14 px-16 shadow-2xl font-semibold"
              >
                Kiểm tra phòng trống
              </Button>
            </Link>
            <p className="text-sm text-white/80 mt-4">
              💳 Thanh toán an toàn • 🔄 Miễn phí hủy phòng • ⚡ Xác nhận ngay
              lập tức
            </p>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                Vị trí đắc địa
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Tọa lạc tại trung tâm thành phố, StayHub mang đến sự thuận tiện
                tối đa cho mọi hành trình của bạn. Chỉ 5 phút đến sân bay, 2
                phút đến trung tâm thương mại và các điểm tham quan nổi tiếng.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-primary flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <div className="font-semibold">Địa chỉ</div>
                    <div className="text-muted-foreground">
                      123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-primary flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <div>
                    <div className="font-semibold">Hotline</div>
                    <div className="text-muted-foreground">
                      1900 1234 (24/7)
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-primary flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
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
  );
}
