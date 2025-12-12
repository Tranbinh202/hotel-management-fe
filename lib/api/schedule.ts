import { apiClient } from "./client"
import type {
  ApiResponse,
  PaginatedResponse,
  EmployeeSchedule,
  CreateScheduleDto,
  UpdateScheduleDto,
  ScheduleSearchParams,
  Employee,
} from "@/lib/types/api"

export const scheduleApi = {
  // Get schedules with filters
  getSchedules: async (params: ScheduleSearchParams = {}): Promise<PaginatedResponse<EmployeeSchedule>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<EmployeeSchedule>>>("/Schedule", { params })
    return response.data.data
  },

  // Get schedule by ID
  getById: async (id: number): Promise<EmployeeSchedule> => {
    const response = await apiClient.get<ApiResponse<EmployeeSchedule>>(`/Schedule/${id}`)
    return response.data.data
  },

  // Create new schedule
  create: async (data: CreateScheduleDto): Promise<EmployeeSchedule> => {
    const response = await apiClient.post<ApiResponse<EmployeeSchedule>>("/Schedule", data)
    return response.data.data
  },

  // Create multiple schedules at once
  createBulk: async (schedules: CreateScheduleDto[]): Promise<EmployeeSchedule[]> => {
    const response = await apiClient.post<ApiResponse<EmployeeSchedule[]>>("/Schedule/bulk", schedules)
    return response.data.data
  },

  // Update schedule
  update: async (data: UpdateScheduleDto): Promise<EmployeeSchedule> => {
    const { scheduleId, ...updateData } = data
    const response = await apiClient.put<ApiResponse<EmployeeSchedule>>(`/Schedule/${scheduleId}`, updateData)
    return response.data.data
  },

  // Delete schedule
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/Schedule/${id}`)
  },

  // Get all active employees (for dropdown)
  getEmployees: async (): Promise<Employee[]> => {
    const response = await apiClient.get<ApiResponse<Employee[]>>("/Employee/active")
    return response.data.data || []
  },
}

// Shift definitions - fixed for hotel
export const SHIFT_DEFINITIONS = [
  {
    shiftType: "morning" as const,
    name: "Ca Sáng",
    startTime: "06:00",
    endTime: "14:00",
    color: "bg-blue-100 text-blue-700 border-blue-300",
  },
  {
    shiftType: "afternoon" as const,
    name: "Ca Chiều",
    startTime: "14:00",
    endTime: "22:00",
    color: "bg-orange-100 text-orange-700 border-orange-300",
  },
  {
    shiftType: "night" as const,
    name: "Ca Đêm",
    startTime: "22:00",
    endTime: "06:00",
    color: "bg-purple-100 text-purple-700 border-purple-300",
  },
]
