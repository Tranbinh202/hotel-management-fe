import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-[#ff5e7e]/20 to-[#a78bfa]/20 rounded-full flex items-center justify-center mx-auto">
          <Home className="w-12 h-12 text-[#ff5e7e]" />
        </div>
        <div>
          <h1 className="font-serif text-4xl font-bold mb-2">
            Không tìm thấy phòng
          </h1>
          <p className="text-muted-foreground">
            Phòng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
        </div>
        <Link href="/rooms">
          <Button className="bg-gradient-to-r from-[#ff5e7e] to-[#ff4569] hover:from-[#ff4569] hover:to-[#ff2d54] text-white">
            Quay lại danh sách phòng
          </Button>
        </Link>
      </div>
    </div>
  );
}
