import { apiClient } from "./client"
import type {
  ApiResponse,
  PreviewCheckoutResponse,
  CheckoutRequest,
  CheckoutResponse,
  BookingCheckoutInfo,
} from "@/lib/types/api"

export const checkoutApi = {
  // Preview checkout (không lưu DB)
  previewCheckout: async (
    bookingId: number,
    estimatedCheckOutDate?: string
  ): Promise<PreviewCheckoutResponse> => {
    const params = estimatedCheckOutDate
      ? `?estimatedCheckOutDate=${estimatedCheckOutDate}`
      : ""
    const response = await apiClient.get<ApiResponse<PreviewCheckoutResponse>>(
      `/Checkout/preview/${bookingId}${params}`
    )
    return response.data
  },

  // Thực hiện checkout
  processCheckout: async (request: CheckoutRequest): Promise<CheckoutResponse> => {
    const response = await apiClient.post<ApiResponse<CheckoutResponse>>("/Checkout", request)
    return response.data
  },

  // Lấy thông tin booking để chuẩn bị checkout
  getBookingCheckoutInfo: async (bookingId: number): Promise<BookingCheckoutInfo> => {
    const response = await apiClient.get<ApiResponse<BookingCheckoutInfo>>(
      `/Checkout/booking/${bookingId}`
    )
    return response.data
  },
}
