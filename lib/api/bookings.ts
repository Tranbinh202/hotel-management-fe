import { apiClient } from "./client"
import type { Booking, CreateBookingDto, UpdateBookingDto } from "@/lib/types/api"

export interface BookingRequest {
  fullName: string
  email: string
  phoneNumber: string
  identityCard: string
  address: string
  roomTypes: {
    roomTypeId: number
    quantity: number
  }[]
  checkInDate: string
  checkOutDate: string
  specialRequests?: string
}

export interface BookingResponse {
  isSuccess: boolean
  data: {
    bookingId: number
    bookingCode: string
    totalAmount: number
  }
  message: string
}

export async function createBooking(data: BookingRequest): Promise<BookingResponse> {
  return bookingsApi.createByGuest(data)
}

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

  createByGuest: async (data: BookingRequest): Promise<BookingResponse> => {
    return apiClient.post<BookingResponse>("/bookings/guest", data)
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
