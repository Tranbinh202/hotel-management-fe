import { apiClient } from "./client"
import type {
  CheckAvailabilityRequest,
  CheckAvailabilityResponse,
  CreateAuthenticatedBookingRequest,
  CreateGuestBookingRequest,
  BookingResponse,
  BookingDetails,
} from "@/lib/types/api"

export const bookingsApi = {
  // Check room availability (public endpoint)
  checkAvailability: async (data: CheckAvailabilityRequest): Promise<CheckAvailabilityResponse> => {
    return apiClient.post<CheckAvailabilityResponse>("/Booking/check-availability", data)
  },

  // Create booking for authenticated user
  create: async (data: CreateAuthenticatedBookingRequest): Promise<BookingResponse> => {
    return apiClient.post<BookingResponse>("/Booking", data)
  },

  // Create booking for guest (no authentication required)
  createByGuest: async (data: CreateGuestBookingRequest): Promise<BookingResponse> => {
    return apiClient.post<BookingResponse>("/Booking/guest", data)
  },

  getByIdWithKey: async (
    id: number,
    key: string,
  ): Promise<{ isSuccess: boolean; data: BookingDetails; message: string }> => {
    return apiClient.get<{ isSuccess: boolean; data: BookingDetails; message: string }>(
      `/Booking/${id}/verify?key=${encodeURIComponent(key)}`,
    )
  },

  // Get booking by ID
  getById: async (id: number): Promise<{ isSuccess: boolean; data: BookingDetails; message: string }> => {
    return apiClient.get<{ isSuccess: boolean; data: BookingDetails; message: string }>(`/Booking/${id}`)
  },

  // Get all my bookings (authenticated)
  getMyBookings: async (): Promise<{ isSuccess: boolean; data: BookingDetails[]; message: string }> => {
    return apiClient.get<{ isSuccess: boolean; data: BookingDetails[]; message: string }>("/Booking/my-bookings")
  },

  // Cancel booking
  cancel: async (id: number): Promise<{ isSuccess: boolean; message: string }> => {
    return apiClient.delete<{ isSuccess: boolean; message: string }>(`/Booking/${id}`)
  },

  // Confirm payment (webhook endpoint - for reference)
  confirmPayment: async (data: {
    bookingId: number
    orderCode: string
    status: string
  }): Promise<{ isSuccess: boolean; message: string }> => {
    return apiClient.post<{ isSuccess: boolean; message: string }>("/Booking/confirm-payment", data)
  },
}

// Legacy exports for backward compatibility
export type BookingRequest = CreateGuestBookingRequest
export async function createBooking(data: BookingRequest): Promise<BookingResponse> {
  return bookingsApi.createByGuest(data)
}
