// Common API response types
export interface ApiResponse<T> {
  isSuccess: boolean
  responseCode: number | null
  statusCode: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  pageIndex: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  errors?: Record<string, string[]>
}

export interface IPaginationParams {
  PageIndex: number
  PageSize: number
  Search: string
  SortBy: string
  SortDesc: boolean
}

// Authentication types
export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  username: string
  email: string
  password: string
  fullName: string
  identityCard: string
  address: string
  phoneNumber: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  roles: string[]
}

export interface Account {
  accountId: number
  username: string
  email: string
  phone?: string | null
  roleId: number
  isLocked: boolean
  lastLoginAt: string
  createdAt: string
  createdBy?: number | null
  updatedAt?: string | null
  updatedBy?: number | null
}

export interface User {
  customerId: number
  accountId: number
  fullName: string
  phoneNumber: string
  identityCard: string
  address: string
  createdAt: string
  createdBy?: number | null
  updatedAt?: string | null
  updatedBy?: number | null
}

// Employee types for employee management
export interface Employee {
  employeeId: number
  accountId: number
  fullName: string
  employeeTypeId: number
  phoneNumber: string
  hireDate: string
  terminationDate: string | null
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
}

export interface CreateEmployeeDto {
  username: string
  email: string
  password: string
  fullName: string
  phoneNumber: string
  employeeTypeId: number
  hireDate: string
}

export interface UpdateEmployeeDto {
  username?: string
  email?: string
  fullName?: string
  phoneNumber?: string
  employeeTypeId?: number
  hireDate?: string
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
  amenityType: string
  isActive: boolean
  imageLinks: string[]
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
