import { Loader2 } from "lucide-react"

export default function BookingCancelLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-500/5 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Đang xử lý...</p>
      </div>
    </div>
  )
}
