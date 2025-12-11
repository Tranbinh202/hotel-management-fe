import { apiClient } from "./client"
import type {
  ApiResponse,
  CustomerDetails,
  CustomerListResponse,
  ToggleCustomerBanDto,
} from "@/lib/types/api"

export interface GetCustomersParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  isLocked?: boolean
  fromDate?: string
  toDate?: string
  sortBy?: string
  sortDesc?: boolean
}

const unwrap = <T>(response: { data: any }): T => {
  return (response.data as any)?.data ?? (response.data as any)
}

export const customersApi = {
  getAll: async (params: GetCustomersParams = {}): Promise<CustomerListResponse> => {
    const res = await apiClient.get<ApiResponse<CustomerListResponse>>("/customers", { params })
    return unwrap<CustomerListResponse>(res)
  },

  getById: async (customerId: number): Promise<CustomerDetails> => {
    const res = await apiClient.get<ApiResponse<CustomerDetails>>(`/customers/${customerId}`)
    return unwrap<CustomerDetails>(res)
  },

  toggleBan: async ({
    customerId,
    isLocked,
  }: {
    customerId: number
    isLocked: boolean
  }): Promise<{ customerId: number; isLocked: boolean }> => {
    const res = await apiClient.patch<ApiResponse<{ customerId: number; isLocked: boolean }>>(
      `/customers/${customerId}/ban`,
      { isLocked } as ToggleCustomerBanDto,
    )
    return unwrap<{ customerId: number; isLocked: boolean }>(res)
  },
}
