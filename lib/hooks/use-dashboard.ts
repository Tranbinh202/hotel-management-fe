import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "@/lib/api/dashboard"

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 60000, // Refetch every 1 minute
  })
}

export function useRevenueByMonth(months: number = 12) {
  return useQuery({
    queryKey: ["revenue-by-month", months],
    queryFn: () => dashboardApi.getRevenueByMonth(months),
  })
}

export function useRoomStatusSummary() {
  return useQuery({
    queryKey: ["room-status-summary"],
    queryFn: () => dashboardApi.getRoomStatusSummary(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useTopRoomTypes(limit: number = 5) {
  return useQuery({
    queryKey: ["top-room-types", limit],
    queryFn: () => dashboardApi.getTopRoomTypes(limit),
  })
}
