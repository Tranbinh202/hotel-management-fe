export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#ff5e7e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Đang tải...</p>
      </div>
    </div>
  )
}
