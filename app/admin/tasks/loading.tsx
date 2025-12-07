export default function TasksLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[oklch(0.72_0.12_75)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Đang tải...</p>
      </div>
    </div>
  )
}
