import { apiClient } from "./client"
import type {
  ApiResponse,
  PaginatedResponse,
  Attendance,
  CreateAttendanceDto,
  UpdateAttendanceDto,
  AttendanceSearchParams,
} from "@/lib/types/api"

export const attendanceApi = {
  // Get attendance records with filters
  getAttendances: async (params: AttendanceSearchParams = {}): Promise<PaginatedResponse<Attendance>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Attendance>>>("/Attendance", { params })
    console.log("Fetched attendances:", response.data)
    return response.data
  },

  // Get attendance by ID
  getById: async (id: number): Promise<Attendance> => {
    const response = await apiClient.get<ApiResponse<Attendance>>(`/Attendance/${id}`)
    return response.data
  },

  // Create new attendance
  create: async (data: CreateAttendanceDto): Promise<Attendance> => {
    const response = await apiClient.post<ApiResponse<Attendance>>("/Attendance", data)
    return response.data
  },

  // Update attendance
  update: async (data: UpdateAttendanceDto): Promise<Attendance> => {
    const { attendanceId, ...updateData } = data
    const response = await apiClient.put<ApiResponse<Attendance>>(`/Attendance/${attendanceId}`, updateData)
    return response.data
  },

  // Delete attendance
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/Attendance/${id}`)
  },
}
