import { apiClient } from "./client"
import type {
  CustomerSearchResult,
  CheckAvailabilityRequest,
  CheckAvailabilityResponse,
  CreateOfflineBookingDto,
  UpdateOfflineBookingDto,
  OfflineBookingResponse,
  OfflineBookingDetails,
  OfflineBookingsFilter,
  PaginatedResponse,
  ConfirmDepositDto,
  ConfirmPaymentDto,
} from "@/lib/types/api"

export const offlineBookingsApi = {
  // Search for existing customer
  searchCustomer: async (
    searchKey: string,
  ): Promise<{ isSuccess: boolean; data: CustomerSearchResult[]; message: string }> => {
    if (!searchKey || searchKey.trim().length === 0) {
      throw new Error("Vui lòng nhập số điện thoại, email hoặc tên để tìm kiếm")
    }

    if (searchKey.trim().length < 3) {
      throw new Error("Vui lòng nhập ít nhất 3 ký tự để tìm kiếm")
    }

    return apiClient.get<{ isSuccess: boolean; data: CustomerSearchResult[]; message: string }>(
      `/BookingManagement/customers/quick-search?searchKey=${encodeURIComponent(searchKey.trim())}`,
    )
  },

  // Check available rooms
  checkAvailableRooms: async (data: CheckAvailabilityRequest): Promise<CheckAvailabilityResponse> => {
    if (!data.checkInDate || !data.checkOutDate) {
      throw new Error("Vui lòng chọn ngày nhận phòng và trả phòng")
    }

    const checkIn = new Date(data.checkInDate)
    const checkOut = new Date(data.checkOutDate)
    const now = new Date()

    if (checkIn < now) {
      throw new Error("Ngày nhận phòng không thể là ngày trong quá khứ")
    }

    if (checkOut <= checkIn) {
      throw new Error("Ngày trả phòng phải sau ngày nhận phòng")
    }

    if (!data.roomTypes || data.roomTypes.length === 0) {
      throw new Error("Vui lòng chọn ít nhất một loại phòng")
    }

    // Validate quantities
    for (const roomType of data.roomTypes) {
      if (!roomType.roomTypeId || roomType.roomTypeId <= 0) {
        throw new Error("Loại phòng không hợp lệ")
      }
      if (!roomType.quantity || roomType.quantity <= 0) {
        throw new Error("Số lượng phòng phải lớn hơn 0")
      }
    }

    return apiClient.post<CheckAvailabilityResponse>("/BookingManagement/available-rooms", data)
  },

  // Create offline booking
  create: async (
    data: CreateOfflineBookingDto,
  ): Promise<{ isSuccess: boolean; data: OfflineBookingResponse; message: string; statusCode: number }> => {
    if (!data.fullName || data.fullName.trim().length === 0) {
      throw new Error("Vui lòng nhập họ tên khách hàng")
    }

    if (!data.email || !data.email.includes("@")) {
      throw new Error("Email không hợp lệ")
    }

    if (!data.phoneNumber || data.phoneNumber.trim().length < 10) {
      throw new Error("Số điện thoại không hợp lệ")
    }

    if (!data.roomIds || data.roomIds.length === 0) {
      throw new Error("Vui lòng chọn ít nhất một phòng")
    }

    if (!data.checkInDate || !data.checkOutDate) {
      throw new Error("Vui lòng chọn ngày nhận phòng và trả phòng")
    }

    return apiClient.post<{ isSuccess: boolean; data: OfflineBookingResponse; message: string; statusCode: number }>(
      "/BookingManagement/offline",
      data,
    )
  },

  // Get offline booking by ID
  getById: async (id: number): Promise<{ isSuccess: boolean; data: OfflineBookingDetails; message: string }> => {
    if (!id || id <= 0) {
      throw new Error("Mã booking không hợp lệ")
    }

    return apiClient.get<{ isSuccess: boolean; data: OfflineBookingDetails; message: string }>(
      `/BookingManagement/offline/${id}`,
    )
  },

  // Get all offline bookings with filters
  getAll: async (
    filters: OfflineBookingsFilter,
  ): Promise<{ isSuccess: boolean; data: PaginatedResponse<OfflineBookingDetails> }> => {
    const params = new URLSearchParams()

    const pageNumber = filters.pageNumber && filters.pageNumber > 0 ? filters.pageNumber : 1
    const pageSize = filters.pageSize && filters.pageSize > 0 && filters.pageSize <= 100 ? filters.pageSize : 20

    if (filters.fromDate) params.append("fromDate", filters.fromDate)
    if (filters.toDate) params.append("toDate", filters.toDate)
    if (filters.paymentStatus) params.append("paymentStatus", filters.paymentStatus)
    if (filters.depositStatus) params.append("depositStatus", filters.depositStatus)
    if (filters.customerName) params.append("customerName", filters.customerName.trim())
    if (filters.phoneNumber) params.append("phoneNumber", filters.phoneNumber.trim())
    params.append("pageNumber", String(pageNumber))
    params.append("pageSize", String(pageSize))

    return apiClient.get<{ isSuccess: boolean; data: PaginatedResponse<OfflineBookingDetails> }>(
      `/BookingManagement/offline-bookings?${params.toString()}`,
    )
  },

  // Update offline booking
  update: async (id: number, data: UpdateOfflineBookingDto): Promise<{ isSuccess: boolean; message: string }> => {
    if (!id || id <= 0) {
      throw new Error("Mã booking không hợp lệ")
    }

    if (data.checkInDate && data.checkOutDate) {
      const checkIn = new Date(data.checkInDate)
      const checkOut = new Date(data.checkOutDate)
      if (checkOut <= checkIn) {
        throw new Error("Ngày trả phòng phải sau ngày nhận phòng")
      }
    }

    return apiClient.put<{ isSuccess: boolean; message: string }>(`/BookingManagement/offline/${id}`, data)
  },

  // Confirm deposit payment
  confirmDeposit: async (id: number, data: ConfirmDepositDto): Promise<{ isSuccess: boolean; message: string }> => {
    if (!id || id <= 0) {
      throw new Error("Mã booking không hợp lệ")
    }

    if (!data.depositAmount || data.depositAmount <= 0) {
      throw new Error("Số tiền đặt cọc phải lớn hơn 0")
    }

    if (!data.paymentMethod) {
      throw new Error("Vui lòng chọn phương thức thanh toán")
    }

    return apiClient.post<{ isSuccess: boolean; message: string }>(
      `/BookingManagement/offline/${id}/confirm-deposit`,
      data,
    )
  },

  // Confirm full payment
  confirmPayment: async (id: number, data: ConfirmPaymentDto): Promise<{ isSuccess: boolean; message: string }> => {
    if (!id || id <= 0) {
      throw new Error("Mã booking không hợp lệ")
    }

    if (!data.paidAmount || data.paidAmount <= 0) {
      throw new Error("Số tiền thanh toán phải lớn hơn 0")
    }

    if (!data.paymentMethod) {
      throw new Error("Vui lòng chọn phương thức thanh toán")
    }

    return apiClient.post<{ isSuccess: boolean; message: string }>(
      `/BookingManagement/offline/${id}/confirm-payment`,
      data,
    )
  },

  // Resend confirmation email
  resendEmail: async (id: number): Promise<{ isSuccess: boolean; message: string }> => {
    if (!id || id <= 0) {
      throw new Error("Mã booking không hợp lệ")
    }

    return apiClient.post<{ isSuccess: boolean; message: string }>(`/BookingManagement/offline/${id}/resend-email`, {})
  },

  // Cancel booking
  cancel: async (id: number, reason: string): Promise<{ isSuccess: boolean; message: string }> => {
    if (!id || id <= 0) {
      throw new Error("Mã booking không hợp lệ")
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error("Vui lòng nhập lý do hủy booking")
    }

    if (reason.trim().length < 10) {
      throw new Error("Lý do hủy phải có ít nhất 10 ký tự")
    }

    return apiClient.delete<{ isSuccess: boolean; message: string }>(`/BookingManagement/offline/${id}`, {
      reason: reason.trim(),
    })
  },

  // Search available rooms by room types (new endpoint)
  searchAvailableRoomTypes: async (data: {
    checkInDate: string
    checkOutDate: string
    pageNumber?: number
    pageSize?: number
  }): Promise<{
    isSuccess: boolean
    responseCode: string
    statusCode: number
    data: Array<{
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
      images: Array<{
        mediaId: number
        filePath: string
        description: string
        referenceTable: string
        referenceKey: string
        isActive: boolean
      }>
      amenities: any[]
      comments: any[]
      availableRoomCount: number
      totalRoomCount: number
    }>
    message: string
  }> => {
    if (!data.checkInDate || !data.checkOutDate) {
      throw new Error("Vui lòng chọn ngày nhận phòng và trả phòng")
    }

    const params = new URLSearchParams()
    params.append("checkInDate", data.checkInDate)
    params.append("checkOutDate", data.checkOutDate)
    params.append("pageNumber", String(data.pageNumber || 1))
    params.append("pageSize", String(data.pageSize || 50))

    return apiClient.get(`/room/types/search?${params.toString()}`)
  },

  // Get available rooms by room type
  getAvailableRoomsByType: async (data: {
    checkInDate: string
    checkOutDate: string
    roomTypeId: number
  }): Promise<{
    isSuccess: boolean
    data: Array<{
      roomId: number
      roomName: string
      roomTypeId: number
      floor: number
      status: string
    }>
    message: string
  }> => {
    if (!data.checkInDate || !data.checkOutDate) {
      throw new Error("Vui lòng chọn ngày nhận phòng và trả phòng")
    }

    if (!data.roomTypeId) {
      throw new Error("Vui lòng chọn loại phòng")
    }

    const params = new URLSearchParams()
    params.append("checkInDate", data.checkInDate)
    params.append("checkOutDate", data.checkOutDate)
    params.append("roomTypeId", String(data.roomTypeId))

    return apiClient.get(`/room/available?${params.toString()}`)
  },

  // Search available rooms (returns detailed room list for selection)
  searchAvailableRooms: async (data: {
    checkInDate: string
    checkOutDate: string
    roomTypeId?: number
    pageNumber?: number
    pageSize?: number
  }): Promise<{
    isSuccess: boolean
    data: {
      rooms: Array<{
        roomId: number
        roomName: string
        roomTypeId: number
        roomTypeName: string
        pricePerNight: number
        maxOccupancy: number
        roomSize: number
        numberOfBeds: number
        bedType: string
        floor: number
        status: string
        amenities: any[]
        images: Array<{
          mediaId: number
          filePath: string
          description: string
        }>
      }>
      totalCount: number
      pageNumber: number
      pageSize: number
    }
    message: string
  }> => {
    if (!data.checkInDate || !data.checkOutDate) {
      throw new Error("Vui lòng chọn ngày nhận phòng và trả phòng")
    }

    const params = new URLSearchParams()
    params.append("checkInDate", data.checkInDate)
    params.append("checkOutDate", data.checkOutDate)
    if (data.roomTypeId) {
      params.append("roomTypeId", String(data.roomTypeId))
    }
    params.append("pageNumber", String(data.pageNumber || 1))
    params.append("pageSize", String(data.pageSize || 50))

    return apiClient.get(`/BookingManagement/rooms/search?${params.toString()}`)
  },
}

export const offlineBookingApi = offlineBookingsApi
