import { number } from "zod"

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
  email?: string
  username?: string
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

// Attendance types
export interface AttendanceRecord {
  attendanceId: number
  employeeId: number
  employeeName: string
  deviceEmployeeId: string | null
  checkIn: string
  checkOut: string | null
  shiftDate: string
  workedHours: number
  normalHours: number
  overtimeHours: number
  lateMinutes: number
  notes: string | null
  createdAt: string
  updatedAt: string | null
}

export interface AttendanceSummary {
  employeeId: number
  employeeName: string
  month: number
  year: number
  baseSalary: number
  hourlyRate: number
  totalWorkDays: number
  totalWorkedHours: number
  totalNormalHours: number
  totalOvertimeHours: number
  normalPay: number
  overtimePay: number
  totalGrossPay: number
  taxDeduction: number
  insuranceDeduction: number
  netPay: number
}

export interface CreateAttendanceDto {
  employeeId: number
  deviceEmployeeId?: string
  checkIn: string
  checkOut?: string
  shiftDate: string
  notes?: string
}

export interface UpdateAttendanceDto {
  checkIn?: string
  checkOut?: string
  notes?: string
}

// Payroll types
export interface PayrollDisbursement {
  payrollDisbursementId: number
  employeeId: number
  employeeName: string
  payrollMonth: number
  payrollYear: number
  baseSalary: number
  totalAmount: number
  disbursedAmount: number
  statusId: number
  statusName: string
  disbursedAt: string | null
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
}

export interface PayrollCalculation {
  employeeId: number
  employeeName: string
  month: number
  year: number
  baseSalary: number
  hourlyRate: number
  totalWorkDays: number
  totalWorkedHours: number
  totalNormalHours: number
  totalOvertimeHours: number
  normalPay: number
  overtimePay: number
  allowances: number
  totalGrossPay: number
  taxDeduction: number
  insuranceDeduction: number
  otherDeductions: number
  netPay: number
}

export interface CreatePayrollDisbursementDto {
  employeeId: number
  payrollMonth: number
  payrollYear: number
}

export interface ApprovePayrollDto {
  payrollDisbursementId: number
}

export interface DisbursePayrollDto {
  payrollDisbursementId: number
  disbursedAmount: number
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
  email: string
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

// Offline booking types for receptionist booking management
export interface CustomerSearchResult {
  customerId: number
  fullName: string
  email: string
  phoneNumber: string
  identityCard: string
  address: string
  totalBookings: number
  lastBookingDate: string
}

export interface AvailableRoomsRequest {
  roomTypes: BookingRoomType[]
  checkInDate: string
  checkOutDate: string
}

export interface AvailableRoomsResponse {
  isSuccess: boolean
  data: {
    isAllAvailable: boolean
    message: string
    roomTypes: RoomTypeAvailability[]
    checkInDate: string
    checkOutDate: string
    totalNights: number
  }
}

export interface CreateOfflineBookingDto {
  fullName: string
  email: string
  phoneNumber: string
  identityCard?: string
  address?: string
  roomTypes: BookingRoomType[]
  checkInDate: string
  checkOutDate: string
  specialRequests?: string
  depositAmount: number
  paymentMethod: "Cash" | "Card" | "Bank" | "EWallet"
  paymentNote?: string
}

export interface UpdateOfflineBookingDto {
  fullName?: string
  phoneNumber?: string
  specialRequests?: string
}

export interface OfflineBookingDetails extends BookingDetails {
  depositPaidAmount: number
  remainingAmount: number
  transactions: TransactionHistory[]
}

export interface TransactionHistory {
  transactionId: number
  amount: number
  paymentMethod: string
  paymentNote: string
  transactionReference: string
  transactionType: "Deposit" | "FullPayment"
  processedBy: string
  processedAt: string
}

export interface OfflineBookingsFilter {
  fromDate?: string
  toDate?: string
  paymentStatus?: string
  depositStatus?: string
  customerName?: string
  phoneNumber?: string
  pageNumber?: number
  pageSize?: number
}

export interface ConfirmDepositDto {
  depositAmount: number
  paymentMethod: "Cash" | "Card" | "Bank" | "EWallet"
  paymentNote?: string
  transactionReference?: string
}

export interface ConfirmPaymentDto {
  paidAmount: number
  paymentMethod: "Cash" | "Card" | "Bank" | "EWallet"
  paymentNote?: string
  transactionReference?: string
}

// Booking management types
export interface BookingManagementFilter {
  pageNumber?: number
  pageSize?: number
  fromDate?: string
  toDate?: string
  paymentStatus?: string
  bookingType?: string
  customerName?: string
  phoneNumber?: string
  email?: string
  depositStatus?: string
  sortBy?: string
  isDescending?: boolean
}

export interface BookingStatisticsFilter {
  fromDate: string
  toDate: string
  groupBy?: "day" | "week" | "month" | "year"
}

export interface BookingStatistics {
  period: string
  totalBookings: number
  totalRevenue: number
  onlineBookings: number
  offlineBookings: number
  paidBookings: number
  unpaidBookings: number
  cancelledBookings: number
}

export interface UpdateBookingStatusDto {
  status: "Confirmed" | "CheckedIn" | "CheckedOut" | "Cancelled"
  note?: string
}

export interface CancelBookingDto {
  reason: string
}

export interface BookingManagementDetails extends BookingDetails {
  bookingCode: string
  email: string
  phoneNumber: string
  identityCard?: string
  address?: string
  depositPaidAmount: number
  paidAmount: number
  remainingAmount: number
  subTotal: number
  taxAmount: number
  serviceCharge: number
  totalNights: number
  status: string
  bookingStatus: string
  note?: string
  specialRequests?: string
  customer?: {
    customerId: number
    fullName: string
    email: string
    phoneNumber: string
    identityCard?: string
    address?: string
    dateOfBirth?: string | null
    gender?: string | null
    totalBookings: number
    lastBookingDate: string
    totalSpent: number
  }
  rooms?: {
    bookingRoomId: number
    roomId: number
    roomNumber: string
    roomTypeName: string
    roomTypeCode: string
    pricePerNight: number
    numberOfNights: number
    subTotal: number
    status: string
    roomImages: string[]
    maxOccupancy: number
    roomSize: number
    bedType: string
    amenities: string[]
  }[]
  paymentHistory?: {
    transactionId: number
    transactionCode: string
    amount: number
    paymentMethod: string
    transactionType: string
    status: string
    note?: string
    transactionReference?: string
    processedAt: string
    processedBy: string
  }[]
  bookingHistory?: {
    changeId: number
    changeType: string
    oldValue?: string
    newValue?: string
    reason?: string
    changedAt: string
    changedBy: string
  }[]
  createdByEmployee?: string | null
  updatedByEmployee?: string | null
  cancelledBy?: string | null
  cancellationReason?: string | null
  cancelledAt?: string | null
}

export interface PayOSPaymentLinkRequest {
  bookingId: number
}

export interface PayOSPaymentLinkResponse {
  paymentUrl: string
  orderId: string
  amount: number
  expiresAt: string
}
// </CHANGE>

export interface CommmentRecord {
  commentId: number
  roomId: number
  replyId?: number
  accountId?: number
  content: string
  rating?: number

  createdDate: Date

  createdTime?: Date

  updatedAt?: Date

  status: string
}

// SalaryInfo & SalaryRecord types
export interface SalaryInfo {
  salaryInfoId?: number
  employeeId: number
  employeeName?: string
  year: number
  baseSalary: number
  bonus?: number | null
  allowance?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}
