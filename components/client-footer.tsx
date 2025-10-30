import Link from "next/link";
import {
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

export function ClientFooter() {
  return (
    <footer className="border-t border-[oklch(0.92_0.01_85)] bg-gradient-to-b from-white to-[oklch(0.96_0.01_85)] py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full luxury-gradient flex items-center justify-center shadow-lg shadow-[oklch(0.72_0.12_75)]/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold luxury-text-gradient">
                  StayHub
                </span>
                <span className="text-[10px] text-[oklch(0.48_0.02_265)] tracking-[0.2em] uppercase">
                  Luxury Hotel
                </span>
              </div>
            </div>
            <p className="text-sm text-[oklch(0.48_0.02_265)] leading-relaxed mb-6">
              Trải nghiệm nghỉ dưỡng đẳng cấp 5 sao tại trung tâm thành phố với
              dịch vụ hoàn hảo và không gian sang trọng.
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1 bg-[oklch(0.96_0.01_85)] rounded-full text-xs font-medium text-[oklch(0.35_0.02_265)]">
                ⭐ 5 Sao
              </div>
              <div className="px-3 py-1 bg-[oklch(0.96_0.01_85)] rounded-full text-xs font-medium text-[oklch(0.35_0.02_265)]">
                🏆 Top 10
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-[oklch(0.25_0.04_265)] mb-6 text-lg">
              Khám phá
            </h4>
            <ul className="space-y-3 text-sm text-[oklch(0.48_0.02_265)]">
              <li>
                <Link
                  href="/rooms"
                  className="hover:text-[oklch(0.25_0.04_265)] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-[oklch(0.72_0.12_75)] group-hover:w-2 transition-all"></span>
                  Phòng nghỉ cao cấp
                </Link>
              </li>
              <li>
                <Link
                  href="/amenities"
                  className="hover:text-[oklch(0.25_0.04_265)] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-[oklch(0.72_0.12_75)] group-hover:w-2 transition-all"></span>
                  Tiện nghi & Dịch vụ
                </Link>
              </li>
              <li>
                <Link
                  href="/#offers"
                  className="hover:text-[oklch(0.25_0.04_265)] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-[oklch(0.72_0.12_75)] group-hover:w-2 transition-all"></span>
                  Ưu đãi đặc biệt
                </Link>
              </li>
              <li>
                <Link
                  href="/#location"
                  className="hover:text-[oklch(0.25_0.04_265)] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-[oklch(0.72_0.12_75)] group-hover:w-2 transition-all"></span>
                  Vị trí & Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-[oklch(0.25_0.04_265)] mb-6 text-lg">
              Dịch vụ
            </h4>
            <ul className="space-y-3 text-sm text-[oklch(0.48_0.02_265)]">
              <li>
                <Link
                  href="#"
                  className="hover:text-[oklch(0.25_0.04_265)] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-[oklch(0.72_0.12_75)] group-hover:w-2 transition-all"></span>
                  Nhà hàng & Bar
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[oklch(0.25_0.04_265)] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-[oklch(0.72_0.12_75)] group-hover:w-2 transition-all"></span>
                  Spa & Wellness
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[oklch(0.25_0.04_265)] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-[oklch(0.72_0.12_75)] group-hover:w-2 transition-all"></span>
                  Hội nghị & Sự kiện
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[oklch(0.25_0.04_265)] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-[oklch(0.72_0.12_75)] group-hover:w-2 transition-all"></span>
                  Dịch vụ đưa đón
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-[oklch(0.25_0.04_265)] mb-6 text-lg">
              Liên hệ
            </h4>
            <ul className="space-y-4 text-sm text-[oklch(0.48_0.02_265)]">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[oklch(0.72_0.12_75)] flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  123 Đường Hoàng Hoa Thám, Phường Tây Hồ, TP. Hà Nội
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[oklch(0.72_0.12_75)] flex-shrink-0" />
                <a
                  href="tel:19001234"
                  className="hover:text-[oklch(0.25_0.04_265)] transition-colors"
                >
                  1900 1234 (24/7)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[oklch(0.72_0.12_75)] flex-shrink-0" />
                <a
                  href="mailto:info@stayhub.vn"
                  className="hover:text-[oklch(0.25_0.04_265)] transition-colors"
                >
                  info@stayhub.vn
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <p className="text-xs font-medium text-[oklch(0.48_0.02_265)] mb-3 uppercase tracking-wider">
                Theo dõi chúng tôi
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[oklch(0.96_0.01_85)] flex items-center justify-center hover:bg-[oklch(0.25_0.04_265)] hover:text-white transition-all duration-300 group"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[oklch(0.96_0.01_85)] flex items-center justify-center hover:bg-[oklch(0.25_0.04_265)] hover:text-white transition-all duration-300 group"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[oklch(0.96_0.01_85)] flex items-center justify-center hover:bg-[oklch(0.25_0.04_265)] hover:text-white transition-all duration-300 group"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[oklch(0.92_0.01_85)] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[oklch(0.48_0.02_265)]">
            <p>© 2025 StayHub Luxury Hotel. All rights reserved.</p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="hover:text-[oklch(0.25_0.04_265)] transition-colors"
              >
                Chính sách bảo mật
              </Link>
              <Link
                href="#"
                className="hover:text-[oklch(0.25_0.04_265)] transition-colors"
              >
                Điều khoản sử dụng
              </Link>
              <Link
                href="#"
                className="hover:text-[oklch(0.25_0.04_265)] transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
