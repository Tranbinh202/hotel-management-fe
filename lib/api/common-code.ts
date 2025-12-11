import { apiClient } from "./client"
import type { ApiResponse, CommonCode } from "@/lib/types/api"

export interface GetCommonCodesParams {
  codeType?: string
  isActive?: boolean
}

export const commonCodeApi = {
  getAll: async (params: GetCommonCodesParams = {}): Promise<CommonCode[]> => {
    const response = await apiClient.get<ApiResponse<CommonCode[]>>("/CommonCode", { params })
    return (response.data as any)?.data ?? (response.data as any)
  },

  getByType: async (codeType: string, isActive = true): Promise<CommonCode[]> => {
    const response = await apiClient.get<ApiResponse<CommonCode[]>>(`/CommonCode/by-type/${codeType}`, {
      params: { isActive },
    })
    return (response.data as any)?.data ?? (response.data as any)
  },
}
