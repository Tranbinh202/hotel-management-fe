import {
  ApiResponse,
  SalaryInfo,
  IPaginationParams,
  PaginatedResponse,
} from "../types/api";
import { apiClient } from "./client";

export interface GetSalaryInfoParams extends IPaginationParams {
  EmployeeId?: number;
  Year?: number;
}

export const salaryInfoApi = {
  getAll: async (params: GetSalaryInfoParams): Promise<PaginatedResponse<SalaryInfo>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<SalaryInfo>>>(`/SalaryInfo`, { params });
    return response.data;
  },

  getById: async (id: number): Promise<SalaryInfo> => {
    const response = await apiClient.get<ApiResponse<SalaryInfo>>(`/SalaryInfo/${id}`);
    return response.data;
  },

  create: async (data: SalaryInfo): Promise<SalaryInfo> => {
    const response = await apiClient.post<ApiResponse<SalaryInfo>>("/SalaryInfo", data);
    return response.data;
  },

  update: async ({ id, data }: { id: number; data: SalaryInfo }): Promise<SalaryInfo> => {
    const response = await apiClient.put<ApiResponse<SalaryInfo>>(`/SalaryInfo/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/SalaryInfo/${id}`);
  },
};