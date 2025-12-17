import { apiClient, publicApiClient } from "./client"
import type {
  ApiResponse,
  IPaginationParams,
  RoomSearchParams,
  RoomSearchResponse,
  RoomSearchItem,
  CreateRoomDto,
  UpdateRoomDto,
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
  // Search rooms with filters (works for both authenticated and public)
  search: async (params: Partial<RoomSearchParams> = {}, isPublic = false): Promise<RoomSearchResponse> => {
    const queryParams = new URLSearchParams()

    if (params.roomName) queryParams.append("roomName", params.roomName)
    if (params.roomTypeId) queryParams.append("roomTypeId", params.roomTypeId.toString())
    if (params.status) queryParams.append("status", params.status)
    if (params.statusId) queryParams.append("statusId", params.statusId.toString())
    if (params.floor) queryParams.append("floor", params.floor.toString())
    if (params.minPrice) queryParams.append("minPrice", params.minPrice.toString())
    if (params.maxPrice) queryParams.append("maxPrice", params.maxPrice.toString())
    queryParams.append("pageNumber", (params.pageNumber || 1).toString())
    queryParams.append("pageSize", (params.pageSize || 10).toString())

    const client = isPublic ? publicApiClient : apiClient
    const res = await client.get<ApiResponse<RoomSearchResponse>>(`/RoomManagement/search?${queryParams.toString()}`)
    const raw = (res.data as any)?.data ?? (res.data as any)
    const normalizeImages = (images: any) =>
      Array.isArray(images) ? images.map((img: any) => img?.filePath || img).filter(Boolean) : []

    const normalizeRoom = (room: any): RoomSearchItem => ({
      ...room,
      images: normalizeImages(room.images),
      statusCode: room.statusCode || room.roomStatus || room.status,
      roomName: room.roomName || room.roomNumber,
      basePriceNight: room.basePriceNight ?? room.pricePerNight ?? 0,
    })

    return {
      ...raw,
      rooms: Array.isArray(raw?.rooms) ? raw.rooms.map(normalizeRoom) : [],
    }
  },

  // Get room type details by ID
  getById: async (id: number, checkInDate?: string, checkOutDate?: string): Promise<RoomType> => {
    const queryParams = new URLSearchParams()
    if (checkInDate) queryParams.append("checkInDate", checkInDate)
    if (checkOutDate) queryParams.append("checkOutDate", checkOutDate)

    const url = queryParams.toString() ? `/Room/types/${id}?${queryParams.toString()}` : `/Room/types/${id}`

    const res = await publicApiClient.get<ApiResponse<RoomType>>(url)
    return (res.data as any)?.data ?? (res.data as any)
  },

  // Create a room
  create: async (data: CreateRoomDto): Promise<Room> => {
    const { roomNumber, notes, imageUrls, imageMedia, roomStatus, statusId, floorNumber, isActive, ...rest } = data

    // Build payload according to API spec (same structure as update)
    const payload: any = {
      roomName: roomNumber, // Backend expects "roomName" not "roomNumber"
      roomTypeId: rest.roomTypeId,
      statusId: statusId, // Use statusId directly from data
      description: notes || "",
      floorNumber: floorNumber,
    }

    // Add imageMedia if provided (for Media CRUD system)
    if (imageMedia && imageMedia.length > 0) {
      payload.imageMedia = imageMedia
    }

    if (typeof isActive === "boolean") {
      payload.isActive = isActive
    }

    const res = await apiClient.post<ApiResponse<Room>>("/Room/rooms", payload)
    return (res.data as any)?.data ?? (res.data as any)
  },

  // Update room by id
  update: async (data: UpdateRoomDto): Promise<Room> => {
    const { roomId, roomNumber, notes, imageMedia, imageUrls, roomStatus, statusId, floorNumber, isActive, ...rest } = data

    // Build payload according to API spec
    const payload: any = {
      roomName: roomNumber, // Backend expects "roomName" not "roomNumber"
      roomTypeId: rest.roomTypeId,
      description: notes || "",
      floorNumber: floorNumber,
    }

    // Add imageMedia if provided (for Media CRUD system)
    if (imageMedia && imageMedia.length > 0) {
      payload.imageMedia = imageMedia
    }

    // Include statusId if provided
    if (statusId !== undefined) {
      payload.statusId = statusId
    }

    if (typeof isActive === "boolean") {
      payload.isActive = isActive
    }

    const res = await apiClient.put<ApiResponse<Room>>(`/Room/rooms/${roomId}`, payload)
    return (res.data as any)?.data ?? (res.data as any)
  },

  // Delete a room
  delete: async (roomId: number): Promise<void> => {
    await apiClient.delete(`/RoomManagement/${roomId}`)
  },
}

export const roomManagementApi = {
  // Search and filter rooms
  search: async (params: RoomSearchParams = {}): Promise<RoomSearchResponse> => {
    return roomsApi.search(params, false)
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
    const raw = res.data as any
    const normalizeImages = (images: any) =>
      Array.isArray(images) ? images.map((img: any) => img?.filePath || img).filter(Boolean) : []
    return {
      ...(raw?.data ?? raw),
      images: normalizeImages(raw?.data?.images ?? raw?.images),
      statusCode: raw?.data?.statusCode ?? raw?.statusCode ?? raw?.status,
      roomName: raw?.data?.roomName ?? raw?.roomName ?? raw?.roomNumber,
      basePriceNight:
        raw?.data?.basePriceNight ?? raw?.basePriceNight ?? raw?.pricePerNight ?? raw?.roomType?.basePriceNight ?? 0,
    } as RoomDetails
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
    const { roomId, statusId, newStatus, reason } = data
    const payload: Record<string, unknown> = {}

    if (statusId !== undefined) {
      payload.statusId = statusId
    } else if (newStatus) {
      payload.status = newStatus
    }
    if (reason) payload.reason = reason

    await apiClient.patch<ApiResponse<void>>(`/Room/rooms/${roomId}`, payload)
  },

  // Bulk change room status
  bulkChangeStatus: async (data: BulkChangeRoomStatusDto): Promise<BulkChangeRoomStatusResponse> => {
    const res = await apiClient.patch<ApiResponse<BulkChangeRoomStatusResponse>>("/rooms/bulk-status", data)
    return res.data
  },
}

export type { RoomSearchParams } from "@/lib/types/api"
