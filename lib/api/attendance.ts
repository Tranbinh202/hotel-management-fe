import type {
  ApiResponse,
  AttendanceRecord,
  AttendanceSummary,
  CreateAttendanceDto,
  IPaginationParams,
  PaginatedResponse,
  UpdateAttendanceDto,
} from "../types/api"
import { apiClient } from "./client"

export interface GetAttendanceParams extends IPaginationParams {
  EmployeeId?: number
  Month?: number
  Year?: number
}

export const attendanceApi = {
  getAll: async (params: GetAttendanceParams): Promise<PaginatedResponse<AttendanceRecord>> => {
    const response = await apiClient.post<ApiResponse<PaginatedResponse<AttendanceRecord>>>(`/Attendance/GetAttendance`, { ...params })
    return response.data
  },

  getById: async (id: number): Promise<AttendanceRecord> => {
    const response = await apiClient.get<ApiResponse<AttendanceRecord>>(`/Attendance/${id}`)
    return response.data
  },

  getSummary: async (employeeId: number, month: number, year: number): Promise<AttendanceSummary> => {
    const response = await apiClient.get<ApiResponse<AttendanceSummary>>(`/Attendance/summary`, {
      params: { employeeId, month, year },
    })
    return response.data
  },

  create: async (data: CreateAttendanceDto): Promise<AttendanceRecord> => {
    const response = await apiClient.post<ApiResponse<AttendanceRecord>>("/Attendance", data)
    return response.data
  },

  update: async ({ id, data }: { id: number; data: UpdateAttendanceDto }): Promise<AttendanceRecord> => {
    const response = await apiClient.put<ApiResponse<AttendanceRecord>>(`/Attendance/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/Attendance/${id}`)
  },

  syncFromDevice: async (): Promise<{ count: number; message: string }> => {
    const response = await apiClient.post<ApiResponse<{ count: number; message: string }>>("/Attendance/sync")
    return response.data
  },
}
