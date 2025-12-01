import { apiClient, publicApiClient } from "./client"
import type { CreateRoomTypeDto, UpdateRoomTypeDto, RoomType, PaginatedResponse, ApiResponse } from "@/lib/types/api"

export interface GetAllRoomTypesParams {
  PageIndex?: number
  PageSize?: number
  Search?: string
}

export type GetAllRoomsParams = GetAllRoomTypesParams

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
    const response = await apiClient.put<ApiResponse<RoomType>>(`/Room/types/${roomTypeId}`, updateData)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/Room/types/${id}`)
  },
}
