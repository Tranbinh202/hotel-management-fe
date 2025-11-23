export default function LoadingBookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-40 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="h-32 bg-slate-200 rounded-lg animate-pulse" />

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-slate-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}
