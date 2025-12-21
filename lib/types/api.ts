// Common API response types
export interface ApiResponse<T> {
  isSuccess: boolean;
  responseCode: string;
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
  resumeSession?: string;
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
  availableRooms: Array<{
    roomId: number;
    roomName: string;
    roomTypeId: number;
    roomTypeName: string;
    pricePerNight: number;
    maxOccupancy: number;
    roomSize: number;
    numberOfBeds: number;
    bedType: string;
    description: string;
    status: string;
    floor: number;
    amenities: string[];
    images: string[];
  }>;
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
  paymentStatus: string; // Display - Vietnamese (e.g., "Đã thanh toán", "Đã nhận phòng")
  paymentStatusName?: string; // Logic - English code (e.g., "Paid", "CheckedIn", "CheckedOut")
  depositStatus: string; // Display - Vietnamese (e.g., "Đã đặt cọc", "Đã nhận phòng")
  depositStatusName?: string; // Logic - English code (e.g., "Deposited", "CheckedIn")
  bookingType: string; // Display - Vietnamese (e.g., "Đặt tại quầy", "Đặt trực tuyến")
  bookingTypeCode?: string; // Logic - English code (e.g., "WalkIn", "Online")
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
  workDate: string;
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
  workDate: string
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
  roomIds: number[]; // Array of specific room IDs
  checkInDate: string;
  checkOutDate: string;
  specialRequests?: string;
  paymentMethod: "Cash" | "Card" | "Transfer" | "BankTransfer" | "EWallet" | "PayOS";
  paymentNote?: string;
}

// For availability check before selecting rooms
export interface CheckAvailabilityRequest {
  roomTypes: BookingRoomType[];
  checkInDate: string;
  checkOutDate: string;
}

// Response for room search
export interface AvailableRoomDto {
  roomId: number;
  roomName: string;
  roomTypeId: number;
  roomTypeName: string;
  pricePerNight: number;
  maxOccupancy: number;
  roomSize: number;
  numberOfBeds: number;
  bedType: string;
  floor: number;
  status: string;
  amenities: any[];
  images: Array<{
    mediaId: number;
    filePath: string;
    description: string;
  }>;
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
  paymentStatusId?: number;
  bookingTypeId?: number;
  paymentStatusName?: string; // English code: PendingConfirmation, Confirmed, Paid, Cancelled
  bookingStatus?: string; // Display - Vietnamese (e.g., "Đã nhận phòng")
  bookingStatusCode?: string; // Logic - English code (e.g., "CheckedIn", "CheckedOut")
  paymentStatus?: string; // Vietnamese label
  depositStatus: string;
  bookingType: string; // Vietnamese label
  bookingTypeCode?: string; // Logic - English code (e.g., "WalkIn", "Online")
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
  bookingStatusCode?: string; // Logic - English code (e.g., "CheckedIn", "CheckedOut")
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

// Employee Schedule Management types
export type ShiftType = "morning" | "afternoon" | "night"

export interface ShiftDefinition {
  shiftType: ShiftType
  name: string
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  color: string // for UI display
}

export interface EmployeeSchedule {
  scheduleId: number
  employeeId: number
  employeeName: string
  employeeRole?: string
  employeeAvatar?: string
  date: string // ISO date format
  shiftType: ShiftType
  shiftName: string
  startTime: string
  endTime: string
  status: "Scheduled" | "Completed" | "Absent" | "Cancelled"
  notes?: string
  createdAt?: string
  updatedAt?: string
}

// New Weekly Schedule API types
export interface WeeklyScheduleEmployee {
  scheduleId: number
  employeeId: number
  employeeName: string
  employeeType: string
  status: "Scheduled" | "Completed" | "Absent" | "Cancelled"
  notes?: string | null
}

export interface DailySchedule {
  shiftDate: string  // YYYY-MM-DD
  dayOfWeek: string  // e.g., "Thứ 2", "Thứ 3"
  employees: WeeklyScheduleEmployee[]
}

export interface ShiftSchedule {
  shiftName: string  // e.g., "Ca Sáng", "Ca Chiều", "Ca Tối"
  startTime: string  // HH:mm:ss
  endTime: string    // HH:mm:ss
  dailySchedules: DailySchedule[]
}

export interface WeeklyScheduleData {
  shifts: ShiftSchedule[]
}

export interface AvailableEmployee {
  employeeId: number
  fullName: string
  employeeType: string
  employeeTypeId: number
  phoneNumber?: string
}

export interface AvailableEmployeesRequest {
  shiftDate: string    // YYYY-MM-DD
  startTime: string    // HH:mm:ss
  endTime: string      // HH:mm:ss
  employeeTypeId?: number
}

export interface CreateScheduleDto {
  employeeId: number
  shiftDate: string    // YYYY-MM-DD (changed from 'date')
  startTime: string    // HH:mm:ss
  endTime: string      // HH:mm:ss
  notes?: string
}

export interface UpdateScheduleDto {
  scheduleId: number
  employeeId?: number
  shiftDate?: string   // YYYY-MM-DD
  startTime?: string   // HH:mm:ss
  endTime?: string     // HH:mm:ss
  notes?: string
}

export interface ScheduleSearchParams {
  employeeId?: number
  startDate?: string   // YYYY-MM-DD
  endDate?: string     // YYYY-MM-DD
  shiftType?: ShiftType
  status?: string
  pageIndex?: number
  pageSize?: number
}

export interface Employee {
  employeeId: number
  accountId: number
  fullName: string
  email: string
  phoneNumber: string
  role: string
  avatarUrl?: string
  identityCard?: string
  address?: string
  isActive: boolean
  createdAt: string
}

// Employee Search API types
export interface EmployeeSearchRequest {
  keyword?: string
  employeeTypeId?: number
  isActive?: boolean
  isLocked?: boolean
  pageIndex?: number
  pageSize?: number
}

export interface EmployeeSearchItem {
  employeeId: number
  accountId: number
  fullName: string
  phoneNumber?: string
  email?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  identityCard?: string
  employeeTypeName: string  // Changed from employeeType
  employeeTypeId: number
  employeeTypeCode?: string
  salary?: number
  baseSalary?: number
  hireDate?: string
  terminationDate?: string | null
  isActive?: boolean
  avatar?: string
  username?: string
  isLocked?: boolean
  lastLoginAt?: string | null
  createdAt: string
  updatedAt?: string | null
}

// API returns PaginatedResponse structure
export interface EmployeeSearchResponse {
  items: EmployeeSearchItem[]
  totalCount: number
  pageIndex: number
  pageSize: number
  totalPages: number
}

// Attendance Management types
export type AttendanceStatus = "Present" | "Absent" | "Late" | "OnLeave" | "HalfDay"

export interface Attendance {
  attendanceId: number
  employeeId: number
  employeeName: string
  employeeRole?: string
  employeeAvatar?: string
  workDate: string // ISO date format
  checkIn?: string // HH:mm:ss format
  checkOut?: string // HH:mm:ss format
  status: AttendanceStatus
  // Approval state: can be numeric code ("0"|"1"|"2") or string label
  isApproved?: string | number
  workingHours?: number
  overtimeHours?: number
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface AttendanceStatic {
  attendance: number
  attend: number
  absentWithLeave: number
  absentWithoutLeave: number
}



export interface CreateAttendanceDto {
  employeeId: number
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: AttendanceStatus
  isApproved?: string | number
  notes?: string
}

export interface UpdateAttendanceDto {
  attendanceId: number
  employeeId?: number
  date?: string
  checkInTime?: string
  checkOutTime?: string
  status?: AttendanceStatus
  isApproved?: string | number
  notes?: string
}

export interface AttendanceSearchParams {
  employeeId?: number
  startDate?: string
  endDate?: string
  status?: AttendanceStatus
  pageIndex?: number
  pageSize?: number
}

// Dashboard Statistics types
export interface DashboardStats {
  totalBookings: number
  totalRevenue: number
  totalCustomers: number
  newCustomersThisMonth: number
  totalRooms: number
  availableRooms: number
  occupiedRooms: number
  maintenanceRooms: number
  occupancyRate: number
  averageRoomRate: number
  totalTransactions: number
  pendingPayments: number
  completedPayments: number
  revenueThisMonth: number
  revenueLastMonth: number
  revenueGrowth: number
  bookingsThisMonth: number
  bookingsLastMonth: number
  bookingsGrowth: number
  customersGrowth: number
}

export interface RevenueByMonth {
  month: string
  year: number
  revenue: number
  bookings: number
}

export interface RoomStatusSummary {
  status: string
  count: number
  percentage: number
}

export interface TopRoomType {
  roomTypeId: number
  typeName: string
  totalBookings: number
  totalRevenue: number
  averagePrice: number
}

// Checkout types
export interface CustomerCheckoutInfo {
  customerId: number
  fullName: string
  email: string
  phoneNumber: string
  identityCard?: string
}

export interface RoomChargeDetail {
  bookingRoomId: number
  roomId: number
  roomName: string
  roomTypeName: string // Display - Vietnamese (e.g., "Phòng Tiêu Chuẩn")
  roomTypeCode?: string // Logic - English code (e.g., "Standard", "Deluxe")
  pricePerNight: number
  plannedNights: number
  actualNights: number
  subTotal: number
  checkInDate: string
  checkOutDate: string
}

export interface ServiceChargeDetail {
  serviceId: number
  serviceName: string // Display - Vietnamese (e.g., "Giặt ủi", "Massage")
  serviceCode?: string // Logic - English code (e.g., "Laundry", "Massage")
  pricePerUnit: number
  quantity: number
  subTotal: number
  serviceDate: string
  serviceType: "RoomService" | "BookingService"
  roomName?: string
}

export interface PreviewCheckoutResponse {
  bookingId: number
  bookingType: string // Display - Vietnamese (e.g., "Đặt tại quầy", "Đặt trực tuyến")
  bookingTypeCode?: string // Logic - English code (e.g., "WalkIn", "Online")
  customer: CustomerCheckoutInfo
  checkInDate: string
  checkOutDate: string
  totalNights: number
  estimatedCheckOutDate?: string
  estimatedNights?: number
  roomCharges: RoomChargeDetail[]
  totalRoomCharges: number
  serviceCharges: ServiceChargeDetail[]
  totalServiceCharges: number
  subTotal: number
  depositPaid: number
  totalAmount: number
  amountDue: number
  message?: string
}

export interface CheckoutRequest {
  bookingId: number
  actualCheckOutDate: string
  paymentMethodId: number
  paymentNote?: string
  transactionReference?: string
}

export interface CheckoutResponse {
  bookingId: number
  bookingType: string // Display - Vietnamese (e.g., "Đặt tại quầy", "Đặt trực tuyến")
  bookingTypeCode?: string // Logic - English code (e.g., "WalkIn", "Online")
  customer: CustomerCheckoutInfo
  checkInDate: string
  checkOutDate: string
  actualCheckOutDate: string
  totalNights: number
  actualNights: number
  roomCharges: RoomChargeDetail[]
  totalRoomCharges: number
  serviceCharges: ServiceChargeDetail[]
  totalServiceCharges: number
  subTotal: number
  depositPaid: number
  totalAmount: number
  amountDue: number
  paymentMethod: string
  transactionId: number
  checkoutProcessedAt: string
  processedBy: string
}

export interface BookingCheckoutInfo {
  bookingId: number
  bookingType: string
  status: string
  customer: CustomerCheckoutInfo
  checkInDate: string
  checkOutDate: string
  rooms: Array<{
    roomId: number
    roomName: string
    roomTypeName: string
    pricePerNight: number
  }>
  totalAmount: number
  depositPaid: number
  canCheckout: boolean
  message?: string
}
