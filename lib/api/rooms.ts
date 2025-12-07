import { apiClient, publicApiClient } from "./client"
import type {
  PaginatedResponse,
  ApiResponse,
  IPaginationParams,
  RoomSearchParams,
  RoomSearchResponse,
  FloorMap,
  RoomDetails,
  RoomStats,
  AvailableStatusResponse,
  ChangeRoomStatusDto,
  BulkChangeRoomStatusDto,
  BulkChangeRoomStatusResponse,
  RoomType,
} from "@/lib/types/api"

export interface GetAllRoomsParams extends IPaginationParams {
  NumberOfGuests?: number
  MinPrice?: number
  MaxPrice?: number
  BedType?: string
  MinRoomSize?: number
  CheckInDate?: string
  CheckOutDate?: string
  OnlyActive?: boolean
  Search?: string
  SortBy?: string
  SortDesc?: boolean
}

export interface RoomTypeImage {
  mediaId: number
  filePath: string
  description: string
  referenceTable: string
  referenceKey: string
  isActive: boolean
}

export interface Room {
  roomId: number
  roomNumber: string
  roomTypeId: number
  floorNumber: number
  roomStatus: string
  notes: string | null
  isActive: boolean
  roomType: {
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
  }
}

export interface GetRoomParams {
  id: number
  checkInDate?: string
  checkOutDate?: string
}

export const roomsApi = {
  getAll: async (params: Partial<GetAllRoomsParams> = {}): Promise<PaginatedResponse<RoomType>> => {
    const res = await publicApiClient.get<ApiResponse<PaginatedResponse<RoomType>>>("/room/search", { params })
    return res.data.data
  },

  getById: async (params: GetRoomParams): Promise<RoomType> => {
    const { id, checkInDate, checkOutDate } = params
    const queryParams = new URLSearchParams()
    if (checkInDate) queryParams.append("checkInDate", checkInDate)
    if (checkOutDate) queryParams.append("checkOutDate", checkOutDate)

    const url = queryParams.toString() ? `/Room/search/${id}?${queryParams.toString()}` : `/Room/search/${id}`

    const res = await publicApiClient.get<ApiResponse<RoomType>>(url)
    return res.data.data
  },

  getAvailable: async (checkInDate: string, checkOutDate: string): Promise<RoomType[]> => {
    const res = await publicApiClient.get<ApiResponse<RoomType[]>>("/room/available", {
      params: { checkInDate, checkOutDate },
    })
    return res.data.data
  },
}

export const roomManagementApi = {
  // Search and filter rooms
  search: async (params: RoomSearchParams = {}): Promise<RoomSearchResponse> => {
    const queryParams = new URLSearchParams()
    if (params.roomName) queryParams.append("roomName", params.roomName)
    if (params.roomTypeId) queryParams.append("roomTypeId", params.roomTypeId.toString())
    if (params.status) queryParams.append("status", params.status)
    if (params.floor) queryParams.append("floor", params.floor.toString())
    queryParams.append("pageNumber", (params.pageNumber || 1).toString())
    queryParams.append("pageSize", (params.pageSize || 10).toString())

    const res = await apiClient.get<ApiResponse<RoomSearchResponse>>(`/rooms/search?${queryParams.toString()}`)
    return res.data
  },

  // Get room map by floor
  getMap: async (floor?: number): Promise<FloorMap[]> => {
    const url = floor ? `/rooms/map?floor=${floor}` : "/rooms/map"
    const res = await apiClient.get<ApiResponse<FloorMap[]>>(url)
    return res.data
  },

  // Get room details
  getDetails: async (roomId: number): Promise<RoomDetails> => {
    const res = await apiClient.get<ApiResponse<RoomDetails>>(`/rooms/${roomId}`)
    return res.data
  },

  // Get room statistics
  getStats: async (): Promise<RoomStats> => {
    const res = await apiClient.get<ApiResponse<RoomStats>>("/rooms/stats")
    return res.data
  },

  // Get available status transitions for a room
  getAvailableStatus: async (roomId: number): Promise<AvailableStatusResponse> => {
    const res = await apiClient.get<ApiResponse<AvailableStatusResponse>>(`/rooms/${roomId}/available-status`)
    return res.data
  },

  // Change room status
  changeStatus: async (data: ChangeRoomStatusDto): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>("/rooms/status", data)
  },

  // Bulk change room status
  bulkChangeStatus: async (data: BulkChangeRoomStatusDto): Promise<BulkChangeRoomStatusResponse> => {
    const res = await apiClient.patch<ApiResponse<BulkChangeRoomStatusResponse>>("/rooms/bulk-status", data)
    return res.data
  },

  // Cleaning workflow
  startCleaning: async (roomId: number): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`/rooms/${roomId}/start-cleaning`)
  },

  completeCleaning: async (roomId: number): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`/rooms/${roomId}/complete-cleaning`)
  },

  // Maintenance workflow
  startMaintenance: async (roomId: number, description: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`/rooms/${roomId}/start-maintenance`, description, {
      headers: { "Content-Type": "application/json" },
    })
  },

  completeMaintenance: async (roomId: number): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`/rooms/${roomId}/complete-maintenance`)
  },
}
