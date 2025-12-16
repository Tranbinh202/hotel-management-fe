import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { checkoutApi } from "@/lib/api/checkout"
import type { CheckoutRequest } from "@/lib/types/api"
import { useToast } from "@/hooks/use-toast"

// Preview checkout
export function usePreviewCheckout(bookingId: number, estimatedCheckOutDate?: string) {
  return useQuery({
    queryKey: ["checkout-preview", bookingId, estimatedCheckOutDate],
    queryFn: () => checkoutApi.previewCheckout(bookingId, estimatedCheckOutDate),
    enabled: !!bookingId && bookingId > 0,
  })
}

// Get booking checkout info
export function useBookingCheckoutInfo(bookingId: number) {
  return useQuery({
    queryKey: ["booking-checkout-info", bookingId],
    queryFn: () => checkoutApi.getBookingCheckoutInfo(bookingId),
    enabled: !!bookingId && bookingId > 0,
  })
}

// Process checkout mutation
export function useProcessCheckout() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (request: CheckoutRequest) => checkoutApi.processCheckout(request),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      queryClient.invalidateQueries({ queryKey: ["booking-detail"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })

      toast({
        title: "Checkout thành công",
        description: `Booking #${data.bookingId} đã được checkout`,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Checkout thất bại",
        description: error?.message || "Đã xảy ra lỗi khi checkout",
        variant: "destructive",
      })
    },
  })
}
