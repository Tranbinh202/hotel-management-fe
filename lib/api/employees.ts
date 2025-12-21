import {
  ApiResponse,
  CreateEmployeeDto,
  Employee,
  IPaginationParams,
  PaginatedResponse,
  UpdateEmployeeDto,
  EmployeeSearchRequest,
  EmployeeSearchResponse,
} from "../types/api";
import { apiClient } from "./client";

export interface GetEmployeesParams extends IPaginationParams {
  EmployeeTypeId?: number;
}

export const employeesApi = {
  getAll: async (
    params: GetEmployeesParams
  ): Promise<PaginatedResponse<Employee>> => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Employee>>
    >(`/Employee`, { params });
    return response.data;
  },

  getById: async (id: number): Promise<Employee> => {
    const response = await apiClient.get<ApiResponse<Employee>>(
      `/Employee/${id}`
    );
    return response.data;
  },

  // Search employees with filters
  search: async (params: EmployeeSearchRequest): Promise<EmployeeSearchResponse> => {
    const queryParams: any = {};

    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.employeeTypeId !== undefined) queryParams.employeeTypeId = params.employeeTypeId;
    if (params.isActive !== undefined) queryParams.isActive = params.isActive;
    if (params.isLocked !== undefined) queryParams.isLocked = params.isLocked;
    if (params.pageIndex) queryParams.pageIndex = params.pageIndex;
    if (params.pageSize) queryParams.pageSize = params.pageSize;

    const response = await apiClient.get<ApiResponse<EmployeeSearchResponse>>(
      "/Employee/search",
      { params: queryParams }
    );
    return response.data;
  },

  create: async (data: CreateEmployeeDto): Promise<Employee> => {
    const response = await apiClient.post<ApiResponse<Employee>>(
      "/Employee",
      data
    );
    return response.data;
  },

  update: async ({
    id,
    data,
  }: {
    id: number;
    data: UpdateEmployeeDto;
  }): Promise<Employee> => {
    const response = await apiClient.put<ApiResponse<Employee>>(
      `/Employee/${id}`,
      data
    );
    return response.data;
  },

  toggleBan: async (id: number): Promise<void> => {
    await apiClient.patch(`/Employee/${id}/ban`);
  },
};

