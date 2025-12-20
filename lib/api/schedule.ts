import { apiClient } from "./client"
import type {
  ApiResponse,
  PaginatedResponse,
  EmployeeSchedule,
  CreateScheduleDto,
  UpdateScheduleDto,
  ScheduleSearchParams,
  Employee,
  WeeklyScheduleData,
  AvailableEmployee,
  AvailableEmployeesRequest,
} from "@/lib/types/api"

export const scheduleApi = {
  // Get schedules by date range (NEW API v2.0)
  // POST /api/schedule/schedules với form-data: fromDate và toDate (format yyyyMMdd)
  getWeeklySchedule: async (startDate: string, endDate: string, employeeTypeId?: number): Promise<WeeklyScheduleData> => {
    console.log("🔥 Calling Schedule API:", { startDate, endDate, employeeTypeId })

    // Format dates to yyyyMMdd
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}${month}${day}`
    }

    const fromDate = formatDate(startDate)
    const toDate = formatDate(endDate)

    console.log("📅 API Params:", { fromDate, toDate, employeeTypeId })

    // Create form-data
    const formData = new FormData()
    formData.append('fromDate', fromDate)
    formData.append('toDate', toDate)
    if (employeeTypeId) {
      formData.append('employeeTypeId', employeeTypeId.toString())
    }

    try {
      const response = await apiClient.post<ApiResponse<WeeklyScheduleData>>(
        "/schedule/schedules",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      )
      console.log("✅ Schedule Response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Schedule Error:", error)
      throw error
    }
  },

  // Get available employees for a specific shift (NEW API)
  getAvailableEmployees: async (params: AvailableEmployeesRequest): Promise<AvailableEmployee[]> => {
    const response = await apiClient.get<ApiResponse<{ employees: AvailableEmployee[] }>>("/Schedule/available-employees", {
      params: {
        shiftDate: params.shiftDate,
        startTime: params.startTime,
        endTime: params.endTime,
        ...(params.employeeTypeId && { employeeTypeId: params.employeeTypeId })
      }
    })
    return response.data.employees
  },

  // Legacy endpoints (still used for other features)
  getSchedules: async (params: ScheduleSearchParams = {}): Promise<PaginatedResponse<EmployeeSchedule>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<EmployeeSchedule>>>("/Schedule", { params })
    return response.data
  },

  getById: async (id: number): Promise<EmployeeSchedule> => {
    const response = await apiClient.get<ApiResponse<EmployeeSchedule>>(`/schedule/${id}`)
    return response.data
  },

  // Create new schedule (form-data)
  create: async (data: CreateScheduleDto): Promise<EmployeeSchedule> => {
    const formData = new FormData()
    formData.append('employeeId', data.employeeId.toString())
    formData.append('shiftDate', data.shiftDate)
    formData.append('startTime', data.startTime)
    formData.append('endTime', data.endTime)
    if (data.notes) {
      formData.append('notes', data.notes)
    }

    const response = await apiClient.post<ApiResponse<EmployeeSchedule>>(
      "/schedule",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    )
    return response.data
  },

  createBulk: async (schedules: CreateScheduleDto[]): Promise<EmployeeSchedule[]> => {
    const response = await apiClient.post<ApiResponse<EmployeeSchedule[]>>("/Schedule/bulk", schedules)
    return response.data
  },

  // Update schedule (form-data, partial update)
  update: async (data: UpdateScheduleDto): Promise<EmployeeSchedule> => {
    const formData = new FormData()
    if (data.employeeId !== undefined) {
      formData.append('employeeId', data.employeeId.toString())
    }
    if (data.shiftDate) {
      formData.append('shiftDate', data.shiftDate)
    }
    if (data.startTime) {
      formData.append('startTime', data.startTime)
    }
    if (data.endTime) {
      formData.append('endTime', data.endTime)
    }
    if (data.notes !== undefined) {
      formData.append('notes', data.notes)
    }

    const response = await apiClient.put<ApiResponse<EmployeeSchedule>>(
      `/schedule/${data.scheduleId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    )
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/schedule/${id}`)
  },

  getEmployees: async (): Promise<Employee[]> => {
    const response = await apiClient.get<ApiResponse<Employee[]>>("/Employee/active")
    return response.data
  },
}

// Shift definitions for frontend use
export const SHIFT_DEFINITIONS = [
  {
    shiftType: "morning" as const,
    name: "Ca Sáng",
    startTime: "08:00:00",
    endTime: "16:00:00",
    color: "bg-blue-100 text-blue-700 border-blue-300",
  },
  {
    shiftType: "afternoon" as const,
    name: "Ca Chiều",
    startTime: "16:00:00",
    endTime: "00:00:00",
    color: "bg-orange-100 text-orange-700 border-orange-300",
  },
  {
    shiftType: "night" as const,
    name: "Ca Tối",
    startTime: "00:00:00",
    endTime: "08:00:00",
    color: "bg-purple-100 text-purple-700 border-purple-300",
  },
]
