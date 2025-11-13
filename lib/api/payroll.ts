import type {
  ApiResponse,
  ApprovePayrollDto,
  CreatePayrollDisbursementDto,
  DisbursePayrollDto,
  IPaginationParams,
  PaginatedResponse,
  PayrollCalculation,
  PayrollDisbursement,
} from "../types/api"
import { apiClient } from "./client"

export interface GetPayrollParams extends IPaginationParams {
  EmployeeId?: number
  Month?: number
  Year?: number
  StatusId?: number
}

export interface CalculatePayrollParams {
  employeeId?: number
  month: number
  year: number
}

export const payrollApi = {
  getAll: async (params: GetPayrollParams): Promise<PaginatedResponse<PayrollDisbursement>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<PayrollDisbursement>>>(`/Payroll`, { params })
    return response.data
  },

  getById: async (id: number): Promise<PayrollDisbursement> => {
    const response = await apiClient.get<ApiResponse<PayrollDisbursement>>(`/Payroll/${id}`)
    return response.data
  },

  calculate: async (params: CalculatePayrollParams): Promise<PayrollCalculation[]> => {
    const response = await apiClient.post<ApiResponse<PayrollCalculation[]>>("/Payroll/calculate", params)
    return response.data
  },

  createDisbursement: async (data: CreatePayrollDisbursementDto): Promise<PayrollDisbursement> => {
    const response = await apiClient.post<ApiResponse<PayrollDisbursement>>("/Payroll/disbursement", data)
    return response.data
  },

  approve: async (data: ApprovePayrollDto): Promise<PayrollDisbursement> => {
    const response = await apiClient.post<ApiResponse<PayrollDisbursement>>(
      `/Payroll/${data.payrollDisbursementId}/approve`,
      data,
    )
    return response.data
  },

  disburse: async (data: DisbursePayrollDto): Promise<PayrollDisbursement> => {
    const response = await apiClient.post<ApiResponse<PayrollDisbursement>>(
      `/Payroll/${data.payrollDisbursementId}/disburse`,
      data,
    )
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/Payroll/${id}`)
  },
}
