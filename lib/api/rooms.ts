import { apiClient, publicApiClient } from "./client"
import type { CreateRoomDto, UpdateRoomDto, PaginatedResponse, ApiResponse, IPaginationParams } from "@/lib/types/api"

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
  getAll: async (params: Partial<GetAllRoomsParams> = {}): Promise<PaginatedResponse<Room>> => {
    const res = await publicApiClient.get<ApiResponse<PaginatedResponse<Room>>>("/Room/search", { params })
    return res.data.data
  },

  getById: async (params: GetRoomParams): Promise<Room> => {
    const { id, ...rest } = params
    const res = await publicApiClient.get<ApiResponse<Room>>(`/Room/${id}`, {
      params: rest,
    })
    return res.data.data
  },

  create: async (data: CreateRoomDto): Promise<Room> => {
    const res = await apiClient.post<ApiResponse<Room>>("/Room", data)
    return res.data
  },

  update: async (data: UpdateRoomDto): Promise<Room> => {
    const { roomId, ...updateData } = data
    const res = await apiClient.put<ApiResponse<Room>>(`/Room/${roomId}`, updateData)
    return res.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/Room/${id}`)
  },

  toggleAvailability: async (id: number): Promise<Room> => {
    const res = await apiClient.patch<ApiResponse<Room>>(`/Room/${id}/toggle-availability`)
    return res.data
  },
}
