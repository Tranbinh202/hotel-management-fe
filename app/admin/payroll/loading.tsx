export default function PayrollLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#ff5e7e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Đang tải dữ liệu lương...</p>
      </div>
    </div>
  )
}
