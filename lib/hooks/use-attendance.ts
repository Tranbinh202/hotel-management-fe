import { toast } from "@/hooks/use-toast"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { attendanceApi, type GetAttendanceParams } from "../api/attendance"

export function useAttendance(params: GetAttendanceParams) {
  return useQuery({
    queryKey: ["attendance", params],
    queryFn: () => attendanceApi.getAll(params),
  })
}

export function useAttendanceRecord(id: number) {
  return useQuery({
    queryKey: ["attendance", id],
    queryFn: () => attendanceApi.getById(id),
    enabled: !!id,
  })
}

export function useAttendanceSummary(employeeId: number, month: number, year: number) {
  return useQuery({
    queryKey: ["attendance-summary", employeeId, month, year],
    queryFn: () => attendanceApi.getSummary(employeeId, month, year),
    enabled: !!employeeId && !!month && !!year,
  })
}

export function useCreateAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: attendanceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
      queryClient.invalidateQueries({ queryKey: ["attendance-summary"] })
      toast({
        title: "Thành công",
        description: "Đã thêm bản ghi chấm công",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm bản ghi chấm công",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: attendanceApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
      queryClient.invalidateQueries({ queryKey: ["attendance", data.attendanceId] })
      queryClient.invalidateQueries({ queryKey: ["attendance-summary"] })
      toast({
        title: "Thành công",
        description: "Đã cập nhật bản ghi chấm công",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật bản ghi chấm công",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: attendanceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
      queryClient.invalidateQueries({ queryKey: ["attendance-summary"] })
      toast({
        title: "Thành công",
        description: "Đã xóa bản ghi chấm công",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa bản ghi chấm công",
        variant: "destructive",
      })
    },
  })
}

export function useSyncAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: attendanceApi.syncFromDevice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
      toast({
        title: "Đồng bộ thành công",
        description: `Đã đồng bộ ${data.count} bản ghi chấm công từ máy`,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi đồng bộ",
        description: error.message || "Không thể đồng bộ dữ liệu từ máy chấm công",
        variant: "destructive",
      })
    },
  })
}
