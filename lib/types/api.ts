import { number } from "zod";

// Common API response types
export interface ApiResponse<T> {
  isSuccess: boolean;
  responseCode: number | null;
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface IPaginationParams {
  PageIndex?: number;
  PageSize?: number;
  Search?: string;
  SortBy?: string;
  SortDesc?: boolean;
}

// Common code / lookup
export interface CommonCode {
  codeId: number;
  codeType: string;
  codeName: string;
  codeValue: string;
  description?: string | null;
  displayOrder: number | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

// Authentication types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
  identityCard: string;
  address: string;
  phoneNumber: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  roles: string[];
  email?: string;
  username?: string;
}

export interface Account {
  accountId: number;
  username: string;
  email: string;
  phone?: string | null;
  roleId: number;
  isLocked: boolean;
  lastLoginAt: string;
  createdAt: string;
  createdBy?: number | null;
  updatedAt?: string | null;
  updatedBy?: number | null;
}

export interface User {
  customerId: number;
  accountId: number;
  fullName: string;
  phoneNumber: string;
  identityCard: string;
  address: string;
  createdAt: string;
  createdBy?: number | null;
  updatedAt?: string | null;
  updatedBy?: number | null;
}

// Employee types for employee management
export interface Employee {
  employeeId: number;
  accountId: number;
  fullName: string;
  employeeTypeId: number;
  phoneNumber: string;
  hireDate: string;
  terminationDate: string | null;
  createdAt: string;
  createdBy: number | null;
  updatedAt: string | null;
  updatedBy: number | null;
}

export interface CreateEmployeeDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  employeeTypeId: number;
  hireDate: string;
}

export interface UpdateEmployeeDto {
  username?: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  employeeTypeId?: number;
  hireDate?: string;
}

// Amenity types
export interface Amenity {
  amenityId: number;
  amenityName: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  createdBy: number | null;
  updatedAt: string;
  updatedBy: number;
  images: string[];
}

export interface CreateAmenityDto {
  amenityName: string;
  description: string;
  amenityType: string;
  isActive: boolean;
  imageLinks: string[];
}

export interface UpdateAmenityDto extends Partial<CreateAmenityDto> {
  amenityId: number;
}

// Room types
export interface RoomTypeImage {
  mediaId: number;
  filePath: string;
  description: string;
  referenceTable: string;
  referenceKey: string;
  isActive: boolean;
}

export interface RoomType {
  roomTypeId: number;
  typeName: string;
  typeCode: string;
  description: string;
  basePriceNight: number;
  maxOccupancy: number;
  roomSize: number;
  numberOfBeds: number;
  bedType: string;
  isActive: boolean;
  images: RoomTypeImage[];
  amenities?: any[]; // Array of amenities (optional)
  totalRooms: number; // Total rooms of this type (from API)
  createdAt?: string;
  updatedAt?: string | null;
}

export type Room = RoomType;

export interface CreateRoomDto {
  roomNumber: string;
  roomTypeId: number;
  floorNumber: number;
  roomStatus?: RoomStatusCode | string; // For backward compatibility
  statusId?: number; // New: statusId for create
  notes?: string;
  isActive?: boolean;
  imageUrls?: string[]; // For backward compatibility
  imageMedia?: ImageMediaDto[]; // For create mode with Media CRUD
}

export interface UpdateRoomDto {
  roomId: number;
  roomNumber?: string;
  roomTypeId?: number;
  floorNumber?: number;
  roomStatus?: RoomStatusCode | string;
  statusId?: number;
  notes?: string;
  isActive?: boolean;
  imageUrls?: string[]; // For create mode
  imageMedia?: ImageMediaDto[]; // For update mode with Media CRUD
}

// Room status and management types
export type RoomStatusCode =
  | "Available"
  | "Booked"
  | "Occupied"
  | "Cleaning"
  | "Maintenance"
  | "PendingInspection"
  | "OutOfService";

export interface RoomSearchParams {
  roomName?: string;
  roomTypeId?: number;
  status?: RoomStatusCode;
  statusId?: number;
  floor?: number;
  minPrice?: number;
  maxPrice?: number;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface RoomSearchItem {
  roomId: number;
  roomName: string;
  roomTypeId: number;
  roomTypeName: string;
  roomTypeCode: string;
  basePriceNight: number;
  statusId: number;
  status: string;
  statusCode: RoomStatusCode;
  maxOccupancy: number;
  images: string[];
  roomNumber?: string;
  floorNumber?: number;
  roomStatus?: RoomStatusCode | string;
  notes?: string | null;
  roomType?: {
    roomTypeId: number;
    typeName: string;
    typeCode: string;
  };
}

export interface RoomSearchResponse {
  rooms: RoomSearchItem[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface FloorMapRoom {
  roomId: number;
  roomName: string;
  roomTypeName: string;
  status: string;
  statusCode: RoomStatusCode;
  statusColor: string;
}

export interface FloorStatusSummary {
  [key: string]: number;
}

export interface FloorMap {
  floor: number;
  rooms: FloorMapRoom[];
  statusSummary: FloorStatusSummary;
  totalRooms: number;
}

export interface RoomDetails {
  roomId: number;
  roomName: string;
  roomTypeId: number;
  roomTypeName: string;
  roomTypeCode: string;
  basePriceNight: number;
  statusId: number;
  status: string;
  statusCode: RoomStatusCode;
  description: string;
  maxOccupancy: number;
  roomSize: number;
  numberOfBeds: number;
  bedType: string;
  images: string[];
  createdAt: string;
  updatedAt: string | null;
}

export interface RoomStatusSummary {
  status: string; // Vietnamese label like "Trống", "Đã đặt"
  statusCode: RoomStatusCode;
  count: number;
  percentage: number;
}

export interface RoomStats {
  totalRooms: number;
  statusSummary: RoomStatusSummary[];
}

export interface StatusTransition {
  statusCode: RoomStatusCode;
  statusName: string;
  description?: string;
}

export interface AvailableStatusResponse {
  currentStatus: {
    statusCode: RoomStatusCode;
    statusName: string;
  };
  availableTransitions: StatusTransition[];
}

export interface ChangeRoomStatusDto {
  roomId: number;
  statusId?: number;
  newStatus?: RoomStatusCode;
  reason?: string;
}

export interface BulkChangeRoomStatusDto {
  roomIds: number[];
  newStatus: RoomStatusCode;
}

export interface BulkChangeRoomStatusResponse {
  successCount: number;
  failedRooms: Array<{
    roomId: number;
    roomName: string;
    reason: string;
  }>;
}

export interface StartMaintenanceDto {
  description: string;
}

// Booking types
export interface BookingRoomType {
  roomTypeId: number;
  quantity: number;
}

export interface CheckAvailabilityRequest {
  roomTypes: BookingRoomType[];
  checkInDate: string;
  checkOutDate: string;
}

export interface RoomTypeAvailability {
  roomTypeId: number;
  roomTypeName: string;
  roomTypeCode: string;
  requestedQuantity: number;
  availableCount: number;
  isAvailable: boolean;
  basePriceNight: number;
  message: string;
}

export interface CheckAvailabilityResponse {
  isSuccess: boolean;
  data: {
    roomTypes: RoomTypeAvailability[];
    totalNights: number;
    isAllAvailable: boolean;
  };
  message: string;
}

export interface CreateAuthenticatedBookingRequest {
  customerId: number;
  roomTypes: BookingRoomType[];
  checkInDate: string;
  checkOutDate: string;
  specialRequests?: string;
}

export interface CreateGuestBookingRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  identityCard?: string;
  address?: string;
  roomTypes: BookingRoomType[];
  checkInDate: string;
  checkOutDate: string;
  specialRequests?: string;
}

export interface BookingResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: {
    booking: {
      bookingId: number;
      customerId: number;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      roomIds: number[];
      roomNames: string[];
      roomTypeDetails: RoomTypeBookingDetail[];
      checkInDate: string;
      checkOutDate: string;
      totalAmount: number;
      depositAmount: number;
      paymentStatus: string;
      depositStatus: string;
      bookingType: string;
      specialRequests?: string;
      createdAt: string;
      paymentUrl: string | null;
      orderCode: string;
    };
    bookingToken: string;
    qrPayment: {
      qrCodeUrl: string;
      bankName: string;
      bankCode: string;
      accountNumber: string;
      accountName: string;
      amount: number;
      description: string;
      transactionRef: string;
      qrDataText?: string;
    } | null;
    paymentDeadline: string;
  };
}

export interface BookingDetails {
  bookingId: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  roomIds: number[];
  roomNames: string[];
  roomTypeDetails?: Array<{
    roomTypeId: number;
    roomTypeName: string;
    roomTypeCode: string;
    quantity: number;
    pricePerNight: number;
    subTotal: number;
  }>;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  depositAmount: number;
  paymentUrl: string | null;
  paymentStatus: string;
  depositStatus: string;
  bookingType: string;
  specialRequests?: string;
  createdAt: string;
  orderCode?: string | null;
}

export interface Booking {
  bookingId: number;
  userId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  room?: Room;
}

export interface CreateBookingDto {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  specialRequests?: string;
}

export interface UpdateBookingDto {
  bookingId: number;
  status?: "pending" | "confirmed" | "cancelled" | "completed";
  specialRequests?: string;
}

// Media CRUD types for image management
export type CrudKey = "add" | "keep" | "remove";

export interface ImageMediaDto {
  id: number | null; // Database media ID (required for keep/remove, null for add)
  crudKey: CrudKey; // Action: add, keep, or remove
  url: string | null; // Cloudinary URL (for add/keep)
  altText: string | null; // Image description/alt text
  providerId: string | null; // Cloudinary public ID (alternative to url)
  displayOrder?: number; // Optional: position in array determines order
}

export interface CreateRoomTypeDto {
  typeName: string;
  typeCode: string;
  description: string;
  basePriceNight: number;
  maxOccupancy: number;
  roomSize: number;
  numberOfBeds: number;
  bedType: string;
  imageUrls: string[]; // For creating new room types
}

export interface UpdateRoomTypeDto {
  roomTypeId: number;
  typeName: string;
  typeCode: string;
  description: string;
  basePriceNight: number;
  maxOccupancy: number;
  roomSize: number;
  numberOfBeds: number;
  bedType: string;
  imageMedia?: ImageMediaDto[] | null; // New Media CRUD system (preferred)
  imageUrls?: string[]; // Deprecated: backward compatibility only
}

// Attendance types
export interface AttendanceRecord {
  attendanceId: number;
  employeeId: number;
  employeeName: string;
  deviceEmployeeId: string | undefined;
  checkIn: string;
  checkOut: string | undefined;
  shiftDate: string;
  workedHours: number;
  normalHours: number;
  overtimeHours: number;
  lateMinutes: number;
  notes: string | null;
  status: string | undefined;
  IsApproved: string | undefined;
  createdAt: string;
  updatedAt: string | null;
}

export interface AttendanceSummary {
  employeeId: number;
  employeeName: string;
  month: number;
  year: number;
  baseSalary: number;
  hourlyRate: number;
  totalWorkDays: number;
  totalWorkedHours: number;
  totalNormalHours: number;
  totalOvertimeHours: number;
  normalPay: number;
  overtimePay: number;
  totalGrossPay: number;
  taxDeduction: number;
  insuranceDeduction: number;
  netPay: number;
}

export interface CreateAttendanceDto {
  employeeId: number;
  deviceEmployeeId?: string;
  checkIn: string;
  checkOut?: string;
  shiftDate: string;
  notes?: string;
}

export interface UpdateAttendanceDto {
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

// Payroll types
export interface PayrollDisbursement {
  payrollDisbursementId: number;
  employeeId: number;
  employeeName: string;
  payrollMonth: number;
  payrollYear: number;
  baseSalary: number;
  totalAmount: number;
  disbursedAmount: number;
  statusId: number;
  statusName: string;
  disbursedAt: string | null;
  createdAt: string;
  createdBy: number | null;
  updatedAt: string | null;
  updatedBy: number | null;
}

export interface PayrollCalculation {
  employeeId: number;
  employeeName: string;
  month: number;
  year: number;
  baseSalary: number;
  hourlyRate: number;
  totalWorkDays: number;
  totalWorkedHours: number;
  totalNormalHours: number;
  totalOvertimeHours: number;
  normalPay: number;
  overtimePay: number;
  allowances: number;
  totalGrossPay: number;
  taxDeduction: number;
  insuranceDeduction: number;
  otherDeductions: number;
  netPay: number;
}

export interface CreatePayrollDisbursementDto {
  employeeId: number;
  payrollMonth: number;
  payrollYear: number;
}

export interface ApprovePayrollDto {
  payrollDisbursementId: number;
}

export interface DisbursePayrollDto {
  payrollDisbursementId: number;
  disbursedAmount: number;
}

// AccountSummary types to match /Account/summary API response
export interface EmployeeProfileDetails {
  employeeId: number;
  fullName: string;
  phoneNumber: string;
  employeeTypeId: number;
  employeeTypeName: string;
  hireDate: string;
  terminationDate: string | null;
  isActive: boolean;
}

export interface CustomerProfileDetails {
  customerId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  identityCard: string;
  address: string;
  avatarUrl: string | null;
}

// Customer management
export interface CustomerListItem {
  customerId: number;
  accountId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  isLocked: boolean;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate: string | null;
  createdAt: string;
}

export type CustomerListResponse = PaginatedResponse<CustomerListItem>;

export interface CustomerBasicInfo {
  customerId: number;
  accountId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  identityCard: string;
  address: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface CustomerAccountInfo {
  accountId: number;
  username: string;
  email: string;
  isLocked: boolean;
  lastLoginAt: string | null;
  roles: string[];
}

export interface CustomerStatistics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  upcomingBookings: number;
  totalSpent: number;
  lastBookingDate: string | null;
  totalFeedbacks: number;
  totalTransactions: number;
  totalPaidAmount: number;
}

export interface CustomerRecentBooking {
  bookingId: number;
  statusCode: string;
  statusName: string;
  bookingType: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  createdAt: string;
}

export interface CustomerDetails {
  basicInfo: CustomerBasicInfo;
  account: CustomerAccountInfo;
  statistics: CustomerStatistics;
  recentBookings: CustomerRecentBooking[];
}

export interface ToggleCustomerBanDto {
  isLocked: boolean;
}

export interface AccountStatistics {
  totalBookings: number | null;
  completedBookings: number | null;
  cancelledBookings: number | null;
  totalSpent: number | null;
  totalFeedbacks: number | null;
  totalTasksAssigned: number | null;
  completedTasks: number | null;
  pendingTasks: number | null;
  totalAttendance: number | null;
  totalSalaryPaid: number | null;
  workingDays: number | null;
  totalNotifications: number;
  unreadNotifications: number;
}

export interface AccountSummary {
  accountId: number;
  username: string;
  email: string;
  isLocked: boolean;
  lastLoginAt: string;
  createdAt: string;
  roles: string[];
  accountType: "Employee" | "Customer";
  profileDetails: EmployeeProfileDetails | CustomerProfileDetails;
  statistics: AccountStatistics | null;
}

export interface UpdateAccountProfileDto {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  identityCard?: string;
  avatarUrl?: string;
}

// Offline booking types for receptionist booking management
export interface CustomerSearchResult {
  customerId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  identityCard: string;
  address: string;
  totalBookings: number;
  lastBookingDate: string;
  matchedBy: "Phone" | "Email" | "Name"; // Added field from API
}

export interface RoomSearchAvailableRequest {
  checkInDate: string;
  checkOutDate: string;
  roomTypeId?: number;
  minPrice?: number;
  maxPrice?: number;
  maxOccupancy?: number;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface RoomSearchAvailableItem {
  roomId: number;
  roomName: string;
  roomTypeId: number;
  roomTypeName: string;
  roomTypeCode: string;
  pricePerNight: number;
  maxOccupancy: number;
  roomSize: number;
  numberOfBeds: number;
  bedType: string;
  description: string;
  status: string;
  amenities: string[];
  images: string[];
}

export interface RoomSearchAvailableResponse {
  rooms: RoomSearchAvailableItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateOfflineBookingDto {
  customerId?: number | null; // null for new customers, value for existing
  fullName: string;
  email: string;
  phoneNumber: string;
  identityCard?: string;
  address?: string;
  roomIds: number[]; // Changed from roomTypes to roomIds array
  checkInDate: string;
  checkOutDate: string;
  specialRequests?: string;
  paymentMethod: "Cash" | "Card" | "Transfer";
  paymentNote?: string;
}

export interface QRPaymentInfo {
  qrCodeUrl: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  transactionRef: string;
  qrDataText: string;
}

export interface RoomTypeBookingDetail {
  roomTypeId: number;
  roomTypeName: string;
  roomTypeCode: string;
  quantity: number;
  pricePerNight: number;
  subTotal: number;
}

export interface OfflineBookingResponse {
  booking: {
    bookingId: number;
    customerId: number;
    customerName: string;
    roomIds: number[];
    roomNames: string[];
    roomTypeDetails: RoomTypeBookingDetail[];
    checkInDate: string;
    checkOutDate: string;
    totalAmount: number;
    depositAmount: number;
    paymentStatus: string;
    bookingType: string;
    specialRequests?: string;
    createdAt: string;
  };
  qrPayment: QRPaymentInfo | null;
}

// Booking management types
export interface BookingManagementFilter {
  pageNumber?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
  paymentStatus?: string;
  bookingType?: string;
  customerName?: string;
  phoneNumber?: string;
  email?: string;
  depositStatus?: string;
  sortBy?: string;
  isDescending?: boolean;
}

export interface BookingStatisticsFilter {
  fromDate: string;
  toDate: string;
  groupBy?: "day" | "week" | "month" | "year";
}

export interface BookingStatistics {
  period: string;
  totalBookings: number;
  totalRevenue: number;
  onlineBookings: number;
  offlineBookings: number;
  paidBookings: number;
  unpaidBookings: number;
  cancelledBookings: number;
}

export interface UpdateBookingStatusDto {
  status: "Confirmed" | "CheckedIn" | "CheckedOut" | "Cancelled";
  note?: string;
}

export interface CancelBookingDto {
  reason: string;
}

export interface BookingListItem {
  bookingId: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  roomIds: number[];
  roomNames: string[];
  roomTypeDetails: RoomTypeBookingDetail[];
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  depositAmount: number;
  paymentStatusId: number;
  bookingTypeId: number;
  paymentStatusName: string; // English code: PendingConfirmation, Confirmed, Paid, Cancelled
  bookingStatusName: string; // English code: Online, Offline
  paymentStatus: string; // Vietnamese label
  depositStatus: string;
  bookingType: string; // Vietnamese label
  specialRequests?: string;
  createdAt: string;
  paymentUrl?: string | null;
  orderCode?: string | null;
}

export interface BookingListResponse {
  bookings: BookingListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface BookingManagementDetails extends BookingDetails {
  bookingCode: string;
  email: string;
  phoneNumber: string;
  identityCard?: string;
  address?: string;
  depositPaidAmount: number;
  paidAmount: number;
  remainingAmount: number;
  subTotal: number;
  taxAmount: number;
  serviceCharge: number;
  totalNights: number;
  status: string;
  bookingStatus: string;
  note?: string;
  specialRequests?: string;
  customer?: {
    customerId: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    identityCard?: string;
    address?: string;
    dateOfBirth?: string | null;
    gender?: string | null;
    totalBookings: number;
    lastBookingDate: string;
    totalSpent: number;
  };
  rooms?: {
    bookingRoomId: number;
    roomId: number;
    roomNumber: string;
    roomTypeName: string;
    roomTypeCode: string;
    pricePerNight: number;
    numberOfNights: number;
    subTotal: number;
    status: string;
    roomImages: string[];
    maxOccupancy: number;
    roomSize: number;
    bedType: string;
    amenities: string[];
  }[];
  paymentHistory?: {
    transactionId: number;
    transactionCode: string;
    amount: number;
    paymentMethod: string;
    transactionType: string;
    status: string;
    note?: string;
    transactionReference?: string;
    processedAt: string;
    processedBy: string;
  }[];
  bookingHistory?: {
    changeId: number;
    changeType: string;
    oldValue?: string;
    newValue?: string;
    reason?: string;
    changedAt: string;
    changedBy: string;
  }[];
  createdByEmployee?: string | null;
  updatedByEmployee?: string | null;
  cancelledBy?: string | null;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
}

export interface PayOSPaymentLinkRequest {
  bookingId: number;
}

export interface PayOSPaymentLinkResponse {
  paymentUrl: string;
  orderId: string;
  amount: number;
  expiresAt: string;
}

// New guest booking response types with QR payment and token
export interface GuestBookingResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: {
    booking: {
      bookingId: number;
      customerId: number;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      roomIds: number[];
      roomNames: string[];
      roomTypeDetails: RoomTypeBookingDetail[];
      checkInDate: string;
      checkOutDate: string;
      totalAmount: number;
      depositAmount: number;
      paymentStatus: string;
      depositStatus: string;
      bookingType: string;
      specialRequests?: string;
      createdAt: string;
      paymentUrl: string | null;
      orderCode: string;
    };
    bookingToken: string;
    qrPayment: {
      qrCodeUrl: string;
      bankName: string;
      bankCode: string;
      accountNumber: string;
      accountName: string;
      amount: number;
      description: string;
      transactionRef: string;
      qrDataText?: string;
    } | null;
    paymentDeadline: string;
  };
}

export interface ConfirmPaymentDto {
  bookingId: number;
  isCancel: boolean;
}

export interface BookingByTokenResponse {
  bookingId: number;
  customerName: string;
  paymentStatus: string;
  roomNames: string[];
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  depositAmount: number;
  specialRequests?: string;
  createdAt: string;
}
// </CHANGE>

export interface CommmentRecord {
  commentId: number;
  roomId: number;
  replyId?: number;
  accountId?: number;
  content: string;
  rating?: number;

  createdDate: Date;

  createdTime?: Date;

  updatedAt?: Date;

  status: string;
}

// SalaryInfo & SalaryRecord types
export interface SalaryInfo {
  salaryInfoId?: number;
  employeeId: number;
  employeeName?: string;
  year: number;
  baseSalary: number;
  yearBonus?: number | null;
  allowance?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
