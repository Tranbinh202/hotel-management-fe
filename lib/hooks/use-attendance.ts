import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { attendanceApi } from "@/lib/api/attendance"
import { toast } from "@/hooks/use-toast"
import type {
  AttendanceSearchParams,
  CreateAttendanceDto,
  UpdateAttendanceDto,
} from "@/lib/types/api"

// Get attendance records with filters
export function useAttendances(params: AttendanceSearchParams = {}) {
  return useQuery({
    queryKey: ["attendances", params],
    queryFn: () => attendanceApi.getAttendances(params),
  })
}

// Get attendance by ID
export function useAttendance(id: number) {
  return useQuery({
    queryKey: ["attendance", id],
    queryFn: () => attendanceApi.getById(id),
    enabled: !!id,
  })
}

// Create attendance
export function useCreateAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAttendanceDto) => attendanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] })
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

// Update attendance
export function useUpdateAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateAttendanceDto) => attendanceApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] })
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

// Delete attendance
export function useDeleteAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => attendanceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] })
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
