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
export interface RoomTypeImage {
  mediaId: number
  filePath: string
  description: string
  referenceTable: string
  referenceKey: string
  isActive: boolean
}

export interface RoomType {
  roomTypeId: number
  typeName: string
  typeCode: string
  description: string
  basePriceNight: number
  maxOccupancy: number
  roomSize: number
  numberOfBeds: number
  bedType: string
  isActive: boolean
  images: RoomTypeImage[]
  totalRooms: number
  createdAt: string
  updatedAt: string | null
  amenities: string[]
}

export type Room = RoomType

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
export interface BookingRoomType {
  roomTypeId: number
  quantity: number
}

export interface CheckAvailabilityRequest {
  roomTypes: BookingRoomType[]
  checkInDate: string
  checkOutDate: string
}

export interface RoomTypeAvailability {
  roomTypeId: number
  roomTypeName: string
  roomTypeCode: string
  requestedQuantity: number
  availableCount: number
  isAvailable: boolean
  basePriceNight: number
  message: string
}

export interface CheckAvailabilityResponse {
  isSuccess: boolean
  data: {
    roomTypes: RoomTypeAvailability[]
    totalNights: number
    isAllAvailable: boolean
  }
  message: string
}

export interface CreateAuthenticatedBookingRequest {
  customerId: number
  roomTypes: BookingRoomType[]
  checkInDate: string
  checkOutDate: string
  specialRequests?: string
}

export interface CreateGuestBookingRequest {
  fullName: string
  email: string
  phoneNumber: string
  identityCard?: string
  address?: string
  roomTypes: BookingRoomType[]
  checkInDate: string
  checkOutDate: string
  specialRequests?: string
}

export interface BookingResponse {
  isSuccess: boolean
  data: {
    bookingId: number
    customerId: number
    customerName: string
    roomNames: string[]
    checkInDate: string
    checkOutDate: string
    totalAmount: number
    depositAmount: number
    paymentUrl: string
    paymentStatus: string
    depositStatus: string
    bookingType: string
  }
  message: string
}

export interface BookingDetails {
  bookingId: number
  customerId: number
  customerName: string
  roomNames: string[]
  checkInDate: string
  checkOutDate: string
  totalAmount: number
  depositAmount: number
  paymentUrl: string
  paymentStatus: string
  depositStatus: string
  bookingType: string
  specialRequests?: string
  createdAt: string
}

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

export interface CreateRoomTypeDto {
  typeName: string
  typeCode: string
  description: string
  basePriceNight: number
  maxOccupancy: number
  roomSize: number
  numberOfBeds: number
  bedType: string
  imageUrls: string[]
}

export interface UpdateRoomTypeDto extends CreateRoomTypeDto {
  roomTypeId: number
}

// AccountSummary types to match /Account/summary API response
export interface EmployeeProfileDetails {
  employeeId: number
  fullName: string
  phoneNumber: string
  employeeTypeId: number
  employeeTypeName: string
  hireDate: string
  terminationDate: string | null
  isActive: boolean
}

export interface CustomerProfileDetails {
  customerId: number
  fullName: string
  phoneNumber: string
  identityCard: string
  address: string
  avatarUrl: string | null
}

export interface AccountStatistics {
  totalBookings: number | null
  completedBookings: number | null
  cancelledBookings: number | null
  totalSpent: number | null
  totalFeedbacks: number | null
  totalTasksAssigned: number | null
  completedTasks: number | null
  pendingTasks: number | null
  totalAttendance: number | null
  totalSalaryPaid: number | null
  workingDays: number | null
  totalNotifications: number
  unreadNotifications: number
}

export interface AccountSummary {
  accountId: number
  username: string
  email: string
  isLocked: boolean
  lastLoginAt: string
  createdAt: string
  roles: string[]
  accountType: "Employee" | "Customer"
  profileDetails: EmployeeProfileDetails | CustomerProfileDetails
  statistics: AccountStatistics | null
}

export interface UpdateAccountProfileDto {
  fullName?: string
  phoneNumber?: string
  address?: string
  identityCard?: string
  avatarUrl?: string
}
