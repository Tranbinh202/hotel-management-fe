import { apiClient, publicApiClient } from "./client"
import type { CreateRoomTypeDto, UpdateRoomTypeDto, RoomType, PaginatedResponse, ApiResponse } from "@/lib/types/api"

export interface GetAllRoomTypesParams {
  PageIndex?: number
  PageSize?: number
  Search?: string
}

export type GetAllRoomsParams = GetAllRoomTypesParams

export interface RoomTypeSearchParams {
  checkInDate: string
  checkOutDate: string
  numberOfGuests?: number
  minPrice?: number
  maxPrice?: number
  bedType?: string
  minRoomSize?: number
  pageNumber?: number
  pageSize?: number
}

export interface RoomTypeSearchResult extends RoomType {
  availableRoomCount: number
  totalRoomCount: number
}

export const roomTypesApi = {
  getAll: async (params: GetAllRoomTypesParams = {}): Promise<PaginatedResponse<RoomType>> => {
    const response = await publicApiClient.get<ApiResponse<PaginatedResponse<RoomType>>>("/Room/types", { params })

    return response.data.data
  },

  getById: async (id: number): Promise<RoomType> => {
    const response = await publicApiClient.get<ApiResponse<RoomType>>(`/Room/types/${id}`)
    return response.data.data
  },

  create: async (data: CreateRoomTypeDto): Promise<RoomType> => {
    const response = await apiClient.post<ApiResponse<RoomType>>("/Room/types", data)
    return response.data
  },

  update: async (data: UpdateRoomTypeDto): Promise<RoomType> => {
    const { roomTypeId, ...updateData } = data
    // Supports both old (imageUrls) and new (imageMedia) approaches
    // imageMedia uses Media CRUD system: add/keep/remove operations
    const response = await apiClient.put<ApiResponse<RoomType>>(`/Room/types/${roomTypeId}`, updateData)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/Room/types/${id}`)
  },

  search: async (params: RoomTypeSearchParams): Promise<RoomTypeSearchResult[]> => {
    const queryParams = new URLSearchParams()
    queryParams.append("checkInDate", params.checkInDate)
    queryParams.append("checkOutDate", params.checkOutDate)
    if (params.numberOfGuests) queryParams.append("numberOfGuests", params.numberOfGuests.toString())
    if (params.minPrice) queryParams.append("minPrice", params.minPrice.toString())
    if (params.maxPrice) queryParams.append("maxPrice", params.maxPrice.toString())
    if (params.bedType) queryParams.append("bedType", params.bedType)
    if (params.minRoomSize) queryParams.append("minRoomSize", params.minRoomSize.toString())
    queryParams.append("pageNumber", (params.pageNumber || 1).toString())
    queryParams.append("pageSize", (params.pageSize || 10).toString())

    const response = await publicApiClient.get<ApiResponse<RoomTypeSearchResult[]>>(
      `/room/types/search?${queryParams.toString()}`
    )
    // API returns array directly in data field
    return response.data.data || response.data || []
  },
}
