import { apiClient } from "./client";
import type {
  CheckAvailabilityRequest,
  CheckAvailabilityResponse,
  CreateAuthenticatedBookingRequest,
  CreateGuestBookingRequest,
  GuestBookingResponse,
  BookingResponse,
  BookingDetails,
  BookingManagementFilter,
  PaginatedResponse,
  BookingManagementDetails,
  BookingListItem,
  BookingListResponse,
  UpdateBookingStatusDto,
  CancelBookingDto,
  BookingStatisticsFilter,
  BookingStatistics,
  PayOSPaymentLinkRequest,
  PayOSPaymentLinkResponse,
} from "@/lib/types/api";
import type { CheckInBookingResponse } from "@/lib/types/checkin";

export const bookingsApi = {
  // Check room availability (public endpoint)
  checkAvailability: async (
    data: CheckAvailabilityRequest
  ): Promise<CheckAvailabilityResponse> => {
    return apiClient.post<CheckAvailabilityResponse>(
      "/Booking/check-availability",
      data
    );
  },

  // Create booking for authenticated user
  create: async (
    data: CreateAuthenticatedBookingRequest
  ): Promise<BookingResponse> => {
    return apiClient.post<BookingResponse>("/Booking", data);
  },

  createByGuest: async (
    data: CreateGuestBookingRequest
  ): Promise<GuestBookingResponse> => {
    return apiClient.post<GuestBookingResponse>("/Booking/guest", data);
  },

  guestConfirmPayment: async (data: {
    bookingId: number;
    isCancel: boolean;
  }): Promise<{ isSuccess: boolean; message: string }> => {
    return apiClient.post<{ isSuccess: boolean; message: string }>(
      "/Booking/confirm-payment",
      data
    );
  },

  confirmGuestBooking: async (
    token: string
  ): Promise<{
    isSuccess: boolean;
    message: string;
    data?: { bookingId: number };
  }> => {
    return apiClient.post<{
      isSuccess: boolean;
      message: string;
      data?: { bookingId: number };
    }>(`/Booking/guest/confirm?token=${encodeURIComponent(token)}`, {});
  },

  checkBookingByToken: async (
    token: string
  ): Promise<{ isSuccess: boolean; data: BookingDetails; message: string }> => {
    return apiClient.get<{
      isSuccess: boolean;
      data: BookingDetails;
      message: string;
    }>(`/Booking/mybooking/${token}`);
  },

  getByIdWithKey: async (
    id: number,
    key: string
  ): Promise<{ isSuccess: boolean; data: BookingDetails; message: string }> => {
    return apiClient.get<{
      isSuccess: boolean;
      data: BookingDetails;
      message: string;
    }>(`/Booking/${id}/verify?key=${encodeURIComponent(key)}`);
  },

  // Get booking by ID
  getById: async (
    id: number
  ): Promise<{ isSuccess: boolean; data: BookingDetails; message: string }> => {
    return apiClient.get<{
      isSuccess: boolean;
      data: BookingDetails;
      message: string;
    }>(`/Booking/${id}`);
  },

  // Get all my bookings (authenticated)
  getMyBookings: async (): Promise<{
    isSuccess: boolean;
    data: BookingDetails[];
    message: string;
  }> => {
    return apiClient.get<{
      isSuccess: boolean;
      data: BookingDetails[];
      message: string;
    }>("/Booking/my-bookings");
  },

  // Cancel booking
  cancel: async (
    id: number
  ): Promise<{ isSuccess: boolean; message: string }> => {
    return apiClient.delete<{ isSuccess: boolean; message: string }>(
      `/Booking/${id}`
    );
  },

  // Confirm payment (webhook endpoint - for reference)
  confirmPayment: async (data: {
    bookingId: number;
    orderCode: string;
    status: string;
  }): Promise<{ isSuccess: boolean; message: string }> => {
    return apiClient.post<{ isSuccess: boolean; message: string }>(
      "/Booking/confirm-payment",
      data
    );
  },
};

// Legacy exports for backward compatibility
export type BookingRequest = CreateGuestBookingRequest;

export async function createBooking(
  data: BookingRequest
): Promise<BookingResponse> {
  return bookingsApi.createByGuest(data);
}

// Booking management APIs
export const bookingManagementApi = {
  // Get all bookings with advanced filters and pagination
  getBookings: async (
    filters: BookingManagementFilter
  ): Promise<{
    isSuccess: boolean;
    data: {
      items: BookingListItem[];
      totalCount: number;
      pageIndex: number;
      pageSize: number;
      totalPages: number;
    };
    hasNextPage: boolean;
  }> => {
    const params = new URLSearchParams();

    const pageNumber =
      filters.pageNumber && filters.pageNumber > 0 ? filters.pageNumber : 1;
    const pageSize =
      filters.pageSize && filters.pageSize > 0 && filters.pageSize <= 100
        ? filters.pageSize
        : 20;

    params.append("PageIndex", String(pageNumber));
    params.append("PageSize", String(pageSize));

    if (filters.fromDate) params.append("FromDate", filters.fromDate);
    if (filters.toDate) params.append("ToDate", filters.toDate);
    if (filters.paymentStatus)
      params.append("BookingStatus", filters.paymentStatus);
    if (filters.bookingType) params.append("BookingType", filters.bookingType);
    if (filters.customerName)
      params.append("customerName", filters.customerName.trim());
    if (filters.phoneNumber)
      params.append("phoneNumber", filters.phoneNumber.trim());
    if (filters.email) params.append("email", filters.email.trim());
    if (filters.depositStatus)
      params.append("depositStatus", filters.depositStatus);
    if (filters.sortBy) params.append("SortBy", filters.sortBy);
    if (filters.isDescending !== undefined)
      params.append("SortDesc", String(filters.isDescending));

    const response = await apiClient.get<{
      isSuccess: boolean;
      data: BookingListResponse;
    }>(`/BookingManagement/bookings`, { params });

    // Transform response to match expected format
    return {
      isSuccess: response.isSuccess,
      data: {
        items: response.data.bookings,
        totalCount: response.data.totalCount,
        pageIndex: response.data.pageNumber,
        pageSize: response.data.pageSize,
        totalPages: response.data.totalPages,
      },
      hasNextPage: response.data.pageNumber < response.data.totalPages,
    };
  },

  // Get booking detail
  getBookingDetail: async (
    id: number
  ): Promise<{
    isSuccess: boolean;
    data: BookingManagementDetails;
    message: string;
  }> => {
    if (!id || id <= 0) {
      throw new Error("Mã booking không hợp lệ");
    }

    return apiClient.get<{
      isSuccess: boolean;
      data: BookingManagementDetails;
      message: string;
    }>(`/BookingManagement/${id}`);
  },

  // Update booking status
  updateBookingStatus: async (
    id: number,
    data: UpdateBookingStatusDto
  ): Promise<{ isSuccess: boolean; message: string }> => {
    if (!id || id <= 0) {
      throw new Error("Mã booking không hợp lệ");
    }

    if (!data.status) {
      throw new Error("Vui lòng chọn trạng thái");
    }

    return apiClient.put<{ isSuccess: boolean; message: string }>(
      `/BookingManagement/${id}/status`,
      data
    );
  },

  // Cancel booking
  cancelBooking: async (
    id: number,
    data: CancelBookingDto
  ): Promise<{ isSuccess: boolean; message: string }> => {
    if (!id || id <= 0) {
      throw new Error("Mã booking không hợp lệ");
    }

    if (!data.reason || data.reason.trim().length === 0) {
      throw new Error("Vui lòng nhập lý do hủy booking");
    }

    return apiClient.post<{ isSuccess: boolean; message: string }>(
      `/BookingManagement/${id}/cancel`,
      data
    );
  },

  // Get booking statistics
  getStatistics: async (
    filters: BookingStatisticsFilter
  ): Promise<{
    isSuccess: boolean;
    data: BookingStatistics[] | BookingStatistics;
  }> => {
    const params = new URLSearchParams();

    params.append("fromDate", filters.fromDate);
    params.append("toDate", filters.toDate);
    if (filters.groupBy) params.append("groupBy", filters.groupBy);

    return apiClient.get<{
      isSuccess: boolean;
      data: BookingStatistics[] | BookingStatistics;
    }>(`/BookingManagement/statistics?${params.toString()}`);
  },

  // Resend confirmation email
  resendConfirmationEmail: async (
    id: number
  ): Promise<{ isSuccess: boolean; message: string }> => {
    if (!id || id <= 0) {
      throw new Error("Mã booking không hợp lệ");
    }

    return apiClient.post<{ isSuccess: boolean; message: string }>(
      `/BookingManagement/booking/${id}/resend-confirmation`,
      {}
    );
  },

  // Confirm payment (for Manager/Admin)
  confirmPayment: async (
    id: number
  ): Promise<{ isSuccess: boolean; message: string }> => {
    if (!id || id <= 0) {
      throw new Error("Mã booking không hợp lệ");
    }

    return apiClient.post<{ isSuccess: boolean; message: string }>(
      `/BookingManagement/${id}/confirm-payment`,
      {}
    );
  },

  // Check-in booking (for Receptionist/Manager/Admin)
  checkInBooking: async (
    id: number
  ): Promise<CheckInBookingResponse> => {
    if (!id || id <= 0) {
      throw new Error("Mã booking không hợp lệ");
    }

    return apiClient.post<CheckInBookingResponse>(
      `/BookingManagement/${id}/check-in`,
      {}
    );
  },

  getPayOSPaymentLink: async (
    data: PayOSPaymentLinkRequest
  ): Promise<{
    isSuccess: boolean;
    data: PayOSPaymentLinkResponse;
    message: string;
  }> => {
    if (!data.bookingId || data.bookingId <= 0) {
      throw new Error("Mã booking không hợp lệ");
    }

    return apiClient.post<{
      isSuccess: boolean;
      data: PayOSPaymentLinkResponse;
      message: string;
    }>("/Transaction/payment/payos/link", data);
  },

  // Generate QR code for payment (for Receptionist/Manager/Admin)
  generateQRCode: async (data: {
    amount: number;
    description: string;
    bookingId?: number;
    orderCode?: string;
  }): Promise<{
    isSuccess: boolean;
    data: { qrCodeUrl: string; qrCodeDataURL?: string };
    message: string;
  }> => {
    if (!data.amount || data.amount <= 0) {
      throw new Error("Số tiền không hợp lệ");
    }

    return apiClient.post<{
      isSuccess: boolean;
      data: { qrCodeUrl: string; qrCodeDataURL?: string };
      message: string;
    }>("/Transaction/payment/qr/generate", data);
  },
};
