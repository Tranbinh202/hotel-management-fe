import { apiClient } from "./client"
import type { Booking, CreateBookingDto, UpdateBookingDto } from "@/lib/types/api"

export const bookingsApi = {
  getAll: async (): Promise<Booking[]> => {
    return apiClient.get<Booking[]>("/bookings")
  },

  getById: async (id: number): Promise<Booking> => {
    return apiClient.get<Booking>(`/bookings/${id}`)
  },

  getMyBookings: async (): Promise<Booking[]> => {
    return apiClient.get<Booking[]>("/bookings/my-bookings")
  },

  create: async (data: CreateBookingDto): Promise<Booking> => {
    return apiClient.post<Booking>("/bookings", data)
  },

  update: async (data: UpdateBookingDto): Promise<Booking> => {
    const { bookingId, ...updateData } = data
    return apiClient.put<Booking>(`/bookings/${bookingId}`, updateData)
  },

  cancel: async (id: number): Promise<Booking> => {
    return apiClient.patch<Booking>(`/bookings/${id}/cancel`)
  },

  confirm: async (id: number): Promise<Booking> => {
    return apiClient.patch<Booking>(`/bookings/${id}/confirm`)
  },
}
