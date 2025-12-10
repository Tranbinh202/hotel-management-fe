import type {
  ApiResponse,
  AttendanceRecord,
  AttendanceSummary,
  CommmentRecord,
  CreateAttendanceDto,
  IPaginationParams,
  PaginatedResponse,
  UpdateAttendanceDto,
} from "../types/api"
import { apiClient } from "./client"

export interface GetCommentParams extends IPaginationParams {
  RoomId?: number
  IsNewest?: number
}

export const commentApi = {
  getAll: async (params: GetCommentParams): Promise<PaginatedResponse<CommmentRecord>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<CommmentRecord>>>(`/Comment`, { params })
    return response.data
  },

  getById: async (id: number): Promise<CommmentRecord> => {
    const response = await apiClient.get<ApiResponse<CommmentRecord>>(`/Comment/${id}`)
    return response.data
  },


  create: async (data: CommmentRecord): Promise<CommmentRecord> => {
    const response = await apiClient.post<ApiResponse<CommmentRecord>>("/Comment", data)
    return response.data
  },

  update: async ({ id, data }: { id: number; data: CommmentRecord }): Promise<CommmentRecord> => {
    const response = await apiClient.put<ApiResponse<CommmentRecord>>(`/Comment/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/Comment/${id}`)
  },
}
