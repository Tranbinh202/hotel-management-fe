import { apiClient } from "./client"
import type { ApiResponse, DashboardStats, RevenueByMonth, RoomStatusSummary, TopRoomType } from "@/lib/types/api"

export const dashboardApi = {
  // Get dashboard statistics
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>("/Dashboard/stats")
    return response.data.data
  },

  // Get revenue by month (last 12 months)
  getRevenueByMonth: async (months: number = 12): Promise<RevenueByMonth[]> => {
    const response = await apiClient.get<ApiResponse<RevenueByMonth[]>>(`/Dashboard/revenue-by-month?months=${months}`)
    return response.data.data
  },

  // Get room status summary
  getRoomStatusSummary: async (): Promise<RoomStatusSummary[]> => {
    const response = await apiClient.get<ApiResponse<RoomStatusSummary[]>>("/Dashboard/room-status")
    return response.data.data
  },

  // Get top performing room types
  getTopRoomTypes: async (limit: number = 5): Promise<TopRoomType[]> => {
    const response = await apiClient.get<ApiResponse<TopRoomType[]>>(`/Dashboard/top-room-types?limit=${limit}`)
    return response.data.data
  },
}
