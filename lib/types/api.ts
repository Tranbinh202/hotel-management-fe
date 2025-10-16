// Common API response types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  errors?: Record<string, string[]>
}

// Authentication types
export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  gender: "male" | "female" | "other"
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  phone?: string
  gender?: "male" | "female" | "other"
}

// Amenity types
export interface Amenity {
  amenityId: number
  amenityName: string
  description: string
  price: number
  isActive: boolean
  createdAt: string
  createdBy: number | null
  updatedAt: string
  updatedBy: number
  images: string[]
}

export interface CreateAmenityDto {
  amenityName: string
  description: string
  price: number
  isActive: boolean
  images?: string[]
}

export interface UpdateAmenityDto extends Partial<CreateAmenityDto> {
  amenityId: number
}

// Room types
export interface Room {
  roomId: number
  roomNumber: string
  roomType: string
  price: number
  capacity: number
  description: string
  isAvailable: boolean
  images: string[]
  amenities: Amenity[]
  createdAt: string
  updatedAt: string
}

export interface CreateRoomDto {
  roomNumber: string
  roomType: string
  price: number
  capacity: number
  description: string
  isAvailable: boolean
  images?: string[]
  amenityIds?: number[]
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> {
  roomId: number
}

// Booking types
export interface Booking {
  bookingId: number
  userId: number
  roomId: number
  checkInDate: string
  checkOutDate: string
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  specialRequests?: string
  createdAt: string
  updatedAt: string
  user?: User
  room?: Room
}

export interface CreateBookingDto {
  roomId: number
  checkInDate: string
  checkOutDate: string
  specialRequests?: string
}

export interface UpdateBookingDto {
  bookingId: number
  status?: "pending" | "confirmed" | "cancelled" | "completed"
  specialRequests?: string
}
