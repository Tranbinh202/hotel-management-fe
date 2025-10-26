import { ApiResponse, CreateEmployeeDto, Employee, PaginatedResponse, UpdateEmployeeDto } from "../types/api"
import { apiClient } from "./client"

export interface GetEmployeesParams {
  pageIndex?: number
  pageSize?: number
  searchTerm?: string
  employeeTypeId?: number
}

export const employeesApi = {
  getAll: async (params: GetEmployeesParams): Promise<PaginatedResponse<Employee>> => {
    const queryParams = new URLSearchParams()
    if (params.pageIndex) queryParams.append("pageIndex", params.pageIndex.toString())
    if (params.pageSize) queryParams.append("pageSize", params.pageSize.toString())
    if (params.searchTerm) queryParams.append("searchTerm", params.searchTerm)
    if (params.employeeTypeId) queryParams.append("employeeTypeId", params.employeeTypeId.toString())

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Employee>>>(
      `/Employee?${queryParams.toString()}`,
    )
    return response.data
  },

  getById: async (id: number): Promise<Employee> => {
    const response = await apiClient.get<ApiResponse<Employee>>(`/Employee/${id}`)
    return response.data
  },

  create: async (data: CreateEmployeeDto): Promise<Employee> => {
    const response = await apiClient.post<ApiResponse<Employee>>("/Employee", data)
    return response.data
  },

  update: async ({ id, data }: { id: number; data: UpdateEmployeeDto }): Promise<Employee> => {
    const response = await apiClient.put<ApiResponse<Employee>>(`/Employee/${id}`, data)
    return response.data
  },

  toggleBan: async (id: number): Promise<void> => {
    await apiClient.patch(`/Employee/${id}/ban`)
  },
}